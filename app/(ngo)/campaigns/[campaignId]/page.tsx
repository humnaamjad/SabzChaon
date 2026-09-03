// NGO Campaign detail page — view campaign info, joined volunteers,
// and close out the campaign (PATCH /api/campaigns/[id]).
//
// VISUAL REDESIGN: Management workspace feel. All API logic preserved exactly.

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/shared/AuthProvider";
import { useToast } from "@/components/shared/Toast";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import EmptyState from "@/components/shared/EmptyState";
import StatusBadge from "@/components/ngo/StatusBadge";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  TreePine,
  Users,
  CheckCircle,
  User,
  Megaphone,
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
    <div className="mx-auto max-w-4xl px-4 py-8 animate-fade-up">
      {/* Back link */}
      <button
        onClick={() => router.push("/campaigns")}
        className="mb-6 flex items-center gap-1.5 text-sm text-warmgray-text transition-colors hover:text-forest"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to campaigns
      </button>

      {/* Campaign header card */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-warmgray-border/60 bg-cream-card shadow-sm">
        <div className="h-2 bg-gradient-to-r from-forest/80 via-forest/50 to-leaf-accent/40" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-forest/8 ring-1 ring-forest/10">
                <Megaphone className="h-7 w-7 text-forest" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-inktext">
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
            </div>
            <StatusBadge status={campaign.status} />
          </div>
        </div>
      </div>

      {/* Campaign stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: <TreePine className="h-5 w-5 text-forest" />, label: "Trees Planned", value: campaign.treesPlannedCount },
          { icon: <Users className="h-5 w-5 text-forest" />, label: "Volunteers Needed", value: campaign.volunteersNeeded },
          { icon: <CheckCircle className="h-5 w-5 text-forest" />, label: "Joined", value: members.length },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-warmgray-border/60 bg-cream-card p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest/8">
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-warmgray-text">{stat.label}</p>
                <p className="text-xl font-bold text-inktext">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Close out action */}
      {campaign.status !== "completed" && (
        <div className="mb-8 rounded-2xl border border-warmgray-border/60 bg-cream-card p-5 shadow-sm">
          <button
            onClick={handleComplete}
            disabled={completing}
            className="flex items-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-forest/10 transition-all duration-200 hover:bg-forest-hover hover:shadow-md disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" />
            {completing ? "Closing out…" : "Close Out Campaign"}
          </button>
          <p className="mt-3 text-xs text-warmgray-text">
            Closing out the campaign triggers guardian assignment for joined
            volunteers.
          </p>
        </div>
      )}

      {/* Joined volunteers */}
      <div className="overflow-hidden rounded-2xl border border-warmgray-border/60 bg-cream-card shadow-sm">
        <div className="border-b border-warmgray-border/50 bg-forest/3 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-inktext">
            <Users className="h-5 w-5 text-forest" />
            Joined Volunteers
          </h2>
          <p className="mt-0.5 text-xs text-warmgray-text">
            {members.length} volunteer{members.length !== 1 ? "s" : ""} joined this campaign.
          </p>
        </div>

        {members.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Users className="h-8 w-8 text-forest/40" />}
              title="No volunteers yet"
              description="No volunteers have joined this campaign yet. Share it to recruit guardians."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warmgray-border/50 bg-cream/50">
                  <th className="px-5 py-3 text-left font-semibold text-warmgray-text">
                    Volunteer
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-warmgray-text">
                    Joined
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-warmgray-text">
                    Guardian
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-warmgray-border/30 last:border-b-0 transition-colors hover:bg-cream/30"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brown/8">
                          <User className="h-3.5 w-3.5 text-brown" />
                        </div>
                        <span className="font-medium text-inktext">{m.userId}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-warmgray-text">
                      {new Date(m.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      {m.becameGuardian ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">
                          <CheckCircle className="h-3 w-3" />
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
