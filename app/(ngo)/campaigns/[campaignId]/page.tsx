// NGO Campaign detail page — view campaign info, joined volunteers,
// and close out the campaign (PATCH /api/campaigns/[id]).

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/shared/AuthProvider";
import { useToast } from "@/components/shared/Toast";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import StatusBadge from "@/components/ngo/StatusBadge";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  TreePine,
  Users,
  CheckCircle,
  User,
} from "lucide-react";
import type { Campaign, CampaignMembership } from "@/types/entities";

interface CampaignDetailData {
  campaign: Campaign;
  members: CampaignMembership[];
}

export default function CampaignDetailPage() {
  const params = useParams<{ campaignId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<CampaignDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  const campaignId = params.campaignId;

  const fetchCampaign = useCallback(async () => {
    if (!user || !campaignId) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error ?? "Failed to load campaign");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [user, campaignId]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  async function handleComplete() {
    if (!user || !campaignId) return;
    if (!confirm("Close out this campaign? This action marks it as completed.")) {
      return;
    }
    setCompleting(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "complete" }),
      });
      const json = await res.json();
      if (json.success) {
        toast("Campaign closed out successfully", "success");
        fetchCampaign();
      } else {
        toast(json.error ?? "Failed to close out campaign", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setCompleting(false);
    }
  }

  if (loading) return <LoadingState message="Loading campaign…" />;
  if (error || !data)
    return <ErrorState message={error ?? "Campaign not found"} retry={fetchCampaign} />;

  const { campaign, members } = data;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back link */}
      <button
        onClick={() => router.push("/campaigns")}
        className="mb-6 flex items-center gap-1.5 text-sm text-warmgray-text transition-colors hover:text-forest"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to campaigns
      </button>

      {/* Campaign header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-inktext">
            {campaign.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-warmgray-text">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-brown" />
              {campaign.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-brown" />
              {new Date(campaign.date).toLocaleDateString()}
            </span>
          </div>
        </div>
        <StatusBadge status={campaign.status} />
      </div>

      {/* Campaign stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-warmgray-border bg-cream-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-warmgray-text">
            <TreePine className="h-4 w-4 text-forest" />
            Trees Planned
          </div>
          <p className="mt-1 text-xl font-semibold text-inktext">
            {campaign.treesPlannedCount}
          </p>
        </div>
        <div className="rounded-xl border border-warmgray-border bg-cream-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-warmgray-text">
            <Users className="h-4 w-4 text-forest" />
            Volunteers Needed
          </div>
          <p className="mt-1 text-xl font-semibold text-inktext">
            {campaign.volunteersNeeded}
          </p>
        </div>
        <div className="rounded-xl border border-warmgray-border bg-cream-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-warmgray-text">
            <CheckCircle className="h-4 w-4 text-forest" />
            Joined
          </div>
          <p className="mt-1 text-xl font-semibold text-inktext">
            {members.length}
          </p>
        </div>
      </div>

      {/* Close out action */}
      {campaign.status !== "completed" && (
        <div className="mb-8">
          <button
            onClick={handleComplete}
            disabled={completing}
            className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-forest-hover disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" />
            {completing ? "Closing out…" : "Close Out Campaign"}
          </button>
          <p className="mt-2 text-xs text-warmgray-text">
            Closing out the campaign triggers guardian assignment for joined
            volunteers (handled by Part 3).
          </p>
        </div>
      )}

      {/* Joined volunteers */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-inktext">
          Joined Volunteers
        </h2>
        {members.length === 0 ? (
          <div className="rounded-xl border border-warmgray-border bg-cream-card p-8 text-center shadow-sm">
            <Users className="mx-auto mb-2 h-8 w-8 text-warmgray-text" />
            <p className="text-sm text-warmgray-text">
              No volunteers have joined yet.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-warmgray-border bg-cream-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warmgray-border bg-cream">
                  <th className="px-4 py-3 text-left font-medium text-warmgray-text">
                    Volunteer
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-warmgray-text">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-warmgray-text">
                    Guardian
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-warmgray-border last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-brown" />
                        <span className="text-inktext">{m.userId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-warmgray-text">
                      {new Date(m.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {m.becameGuardian ? (
                        <span className="inline-flex items-center rounded-full bg-forest/10 px-3 py-1 text-xs font-medium text-forest">
                          Guardian
                        </span>
                      ) : (
                        <span className="text-warmgray-text">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
