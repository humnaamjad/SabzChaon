// Volunteer campaign browsing page — §19 Part 3, Feature 1 (volunteer half).
// Lists open/active campaigns a volunteer can browse and join.
// Calls Part 2's join endpoint (POST /api/campaigns/[id]/join).
//
// URL: /browse-campaigns (moved from /campaigns to resolve route conflict
// with the NGO campaigns page at app/(ngo)/campaigns).
//
// Styled per THEME.md: cream background, forest/brown icons, cream-card surfaces.
// Uses Lucide icons exclusively.

"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { TreePine, Search, Loader2 } from "lucide-react";
import { useAuth } from "@/components/shared/AuthProvider";
import { CampaignCard } from "@/components/volunteer/CampaignCard";
import type { Campaign } from "@/types/entities";

export default function BrowseCampaignPage() {
  const { user, userDoc, loading: authLoading } = useAuth();
  const userId = user?.uid ?? null;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch open/active campaigns from Firestore
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setLoading(true);
        const q = query(
          collection(db, "campaigns"),
          where("status", "in", ["upcoming", "active"])
        );
        const snapshot = await getDocs(q);
        const data: Campaign[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Campaign[];
        setCampaigns(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load campaigns"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCampaigns();
  }, []);

  // Check which campaigns the current user has already joined
  useEffect(() => {
    if (!userId) return;

    async function fetchMemberships() {
      try {
        const q = query(
          collection(db, "campaignMemberships"),
          where("userId", "==", userId)
        );
        const snapshot = await getDocs(q);
        const ids = new Set(snapshot.docs.map((doc) => doc.data().campaignId));
        setJoinedIds(ids);
      } catch {
        // Non-critical: if membership check fails, user can still try to join
      }
    }

    fetchMemberships();
  }, [userId]);

  async function handleJoin(campaignId: string) {
    if (!userId || !user) return;

    setJoiningId(campaignId);
    try {
      // Get Firebase ID token for authenticated API calls
      const token = await user.getIdToken();

      // Call Part 2's join endpoint.
      // POST /api/campaigns/[id]/join
      const response = await fetch(`/api/campaigns/${campaignId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to join campaign");
      }

      setJoinedIds((prev) => new Set([...prev, campaignId]));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to join campaign"
      );
    } finally {
      setJoiningId(null);
    }
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-forest" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:color-mix(in_srgb,var(--color-forest)_10%,transparent)]">
              <TreePine className="h-5 w-5 text-forest" />
            </div>
            <h1 className="text-2xl font-semibold text-inktext">
              Browse Campaigns
            </h1>
          </div>
          <p className="text-sm text-warmgray-text">
            Find open plantation campaigns near you and join as a volunteer.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-xl border border-warmgray-border bg-[color:color-mix(in_srgb,var(--color-brick)_10%,transparent)] p-4">
            <p className="text-sm text-brick">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs text-warmgray-text hover:text-inktext"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Campaign list */}
        {campaigns.length === 0 ? (
          <div className="rounded-xl border border-warmgray-border bg-cream-card p-12 text-center shadow-sm">
            <Search className="mx-auto h-12 w-12 text-warmgray-text mb-4" />
            <h2 className="text-lg font-semibold text-inktext mb-2">
              No campaigns available
            </h2>
            <p className="text-sm text-warmgray-text">
              There are no open or active campaigns right now. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                isJoined={joinedIds.has(campaign.id)}
                isJoining={joiningId === campaign.id}
                onJoin={handleJoin}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
