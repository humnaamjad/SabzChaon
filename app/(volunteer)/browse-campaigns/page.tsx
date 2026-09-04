// Volunteer campaign browsing page — §19 Part 3, Feature 1 (volunteer half).
// Lists open/active campaigns a volunteer can browse and join.
// Calls Part 2's join endpoint (POST /api/campaigns/[id]/join).
//
// VISUAL REDESIGN: Engaging discovery experience with PageHeader, skeletons,
// and EmptyState. All data-fetching and join logic preserved exactly.

"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { TreePine } from "lucide-react";
import { useAuth } from "@/components/shared/AuthProvider";
import { useToast } from "@/components/shared/Toast";
import { CampaignCard } from "@/components/volunteer/CampaignCard";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { SkeletonList } from "@/components/shared/Skeleton";
import type { Campaign } from "@/types/entities";

export default function BrowseCampaignPage() {
  const { user, userDoc, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const userId = user?.uid ?? null;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        toast(
          err instanceof Error ? err.message : "Failed to load campaigns",
          "error"
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
      toast(
        err instanceof Error ? err.message : "Failed to join campaign",
        "error"
      );
    } finally {
      setJoiningId(null);
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <SkeletonList count={3} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-4xl px-4 py-8 animate-fade-up">
        {/* Page header */}
        <PageHeader
          icon={<TreePine className="h-5 w-5 text-forest" />}
          title="Browse Campaigns"
          subtitle="Find open plantation campaigns near you and become a Guardian."
        />

        {/* Campaign list */}
        {loading ? (
          <SkeletonList count={3} />
        ) : campaigns.length === 0 ? (
          <EmptyState
            icon={<TreePine className="h-9 w-9 text-forest/40" />}
            title="No campaigns available"
            description="There are no open or active plantation campaigns right now. Check back soon — new drives are added regularly!"
          />
        ) : (
          <div className="grid gap-5">
            {campaigns.map((campaign, i) => (
              <div
                key={campaign.id}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CampaignCard
                  campaign={campaign}
                  isJoined={joinedIds.has(campaign.id)}
                  isJoining={joiningId === campaign.id}
                  onJoin={handleJoin}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
