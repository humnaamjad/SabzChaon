// NGO Campaigns page — list campaigns + create new campaign.
// Fetches from /api/campaigns (GET to list, POST to create).
// All data scoped to the authenticated NGO's ngoId (server-side).
//
// VISUAL REDESIGN: Polished campaign cards, sectioned form modal.
// All API/form logic preserved exactly.

"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/components/shared/AuthProvider";
import { useToast } from "@/components/shared/Toast";
import ErrorState from "@/components/shared/ErrorState";
import EmptyState from "@/components/shared/EmptyState";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/ngo/StatusBadge";
import { SkeletonGrid } from "@/components/shared/Skeleton";
import {
  Plus,
  MapPin,
  Calendar,
  TreePine,
  Users,
  X,
  Megaphone,
  ChevronRight,
  Loader2,
  CalendarClock,
  Activity,
  CheckCircle,
  FileText,
} from "lucide-react";
import type { Campaign, CampaignStatus } from "@/types/entities";

// Segmented status picker options for the create-campaign form.
// Values map 1:1 to the existing CampaignStatus state — presentation only.
const statusOptions: {
  value: CampaignStatus;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "upcoming", label: "Upcoming", icon: <CalendarClock className="h-3.5 w-3.5" /> },
  { value: "active", label: "Active", icon: <Activity className="h-3.5 w-3.5" /> },
  { value: "completed", label: "Completed", icon: <CheckCircle className="h-3.5 w-3.5" /> },
];

export default function CampaignsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [treesPlannedCount, setTreesPlannedCount] = useState("");
  const [volunteersNeeded, setVolunteersNeeded] = useState("");
  const [status, setStatus] = useState<CampaignStatus>("upcoming");

  const fetchCampaigns = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/campaigns", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setCampaigns(json.data);
      } else {
        setError(json.error ?? "Failed to load campaigns");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          location,
          date,
          treesPlannedCount: Number(treesPlannedCount),
          volunteersNeeded: Number(volunteersNeeded),
          status,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast("Campaign created successfully", "success");
        setShowForm(false);
        resetForm();
        fetchCampaigns();
      } else {
        toast(json.error ?? "Failed to create campaign", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setTitle("");
    setLocation("");
    setDate("");
    setTreesPlannedCount("");
    setVolunteersNeeded("");
    setStatus("upcoming");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <SkeletonGrid count={6} lines={2} />
      </div>
    );
  }
  if (error) return <ErrorState message={error} retry={fetchCampaigns} />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 animate-fade-up">
      {/* Header */}
      <PageHeader
        icon={<Megaphone className="h-5 w-5 text-forest" />}
        title="Campaigns"
        subtitle="Manage your plantation campaigns"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-forest/10 transition-all duration-200 hover:bg-forest-hover hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            New Campaign
          </button>
        }
      />

      {/* Campaign list */}
      {campaigns.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-9 w-9 text-forest/40" />}
          title="No campaigns yet"
          description="Create your first plantation campaign to start recruiting volunteers and tracking tree survival."
          action={
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-forest/10 transition-all hover:bg-forest-hover hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              Create Campaign
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign, i) => (
            <div
              key={campaign.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Link
                href={`/campaigns/${campaign.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-warmgray-border/60 bg-cream-card shadow-sm transition-all duration-300 hover:border-forest/20 hover:shadow-md"
              >
                {/* Top accent strip */}
                <div className="h-1.5 bg-gradient-to-r from-forest/70 via-forest/40 to-leaf-accent/40" />
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold leading-snug text-inktext transition-colors group-hover:text-forest capitalize">
                      {campaign.title}
                    </h3>
                    <StatusBadge status={campaign.status} />
                  </div>
                  <div className="space-y-2 text-sm text-warmgray-text">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-brown" />
                      <span className="truncate capitalize">{campaign.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-brown" />
                      {new Date(campaign.date).toLocaleDateString()}
                    </div>
                  </div>
                  {/* Stats row — matches the volunteer CampaignCard language */}
                  <div className="mt-auto">
                    <div className="mt-4 flex items-center justify-between border-t border-warmgray-border/40 pt-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest/8">
                            <TreePine className="h-4 w-4 text-forest" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold leading-tight text-inktext">
                              {campaign.treesPlannedCount}
                            </p>
                            <p className="text-xs leading-tight text-warmgray-text">trees</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest/8">
                            <Users className="h-4 w-4 text-forest" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold leading-tight text-inktext">
                              {campaign.volunteersNeeded}
                            </p>
                            <p className="text-xs leading-tight text-warmgray-text">volunteers</p>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-warmgray-text/40 transition-transform group-hover:translate-x-0.5 group-hover:text-forest" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create campaign modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-inktext/30 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-warmgray-border bg-cream-card shadow-xl animate-fade-up">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-warmgray-border/50 bg-forest/3 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/10 ring-1 ring-forest/15">
                  <Megaphone className="h-4.5 w-4.5 text-forest" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-inktext">
                    Create Campaign
                  </h2>
                  <p className="text-xs text-warmgray-text">
                    Launch a new plantation drive
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-lg p-1 text-warmgray-text hover:text-inktext transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-5">
              {/* Campaign Details */}
              <div>
                <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-warmgray-text">
                  <FileText className="h-3.5 w-3.5 text-forest" />
                  Campaign Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-inktext">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full rounded-xl border border-warmgray-border bg-white px-4 py-2.5 text-sm text-inktext placeholder-warmgray-text/50 transition-colors focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                      placeholder="e.g. Spring Plantation Drive"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-inktext">
                        Location
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        className="w-full rounded-xl border border-warmgray-border bg-white px-4 py-2.5 text-sm text-inktext placeholder-warmgray-text/50 transition-colors focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                        placeholder="e.g. Karachi, Sindh"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-inktext">
                        Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="w-full rounded-xl border border-warmgray-border bg-white px-4 py-2.5 text-sm text-inktext transition-colors focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Plantation Details */}
              <div>
                <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-warmgray-text">
                  <TreePine className="h-3.5 w-3.5 text-forest" />
                  Plantation Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-inktext">
                      Trees Planned
                    </label>
                    <input
                      type="number"
                      value={treesPlannedCount}
                      onChange={(e) => setTreesPlannedCount(e.target.value)}
                      required
                      min={1}
                      className="w-full rounded-xl border border-warmgray-border bg-white px-4 py-2.5 text-sm text-inktext transition-colors focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-inktext">
                      Volunteers Needed
                    </label>
                    <input
                      type="number"
                      value={volunteersNeeded}
                      onChange={(e) => setVolunteersNeeded(e.target.value)}
                      required
                      min={1}
                      className="w-full rounded-xl border border-warmgray-border bg-white px-4 py-2.5 text-sm text-inktext transition-colors focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                    />
                  </div>
                </div>
              </div>

              {/* Status — segmented picker (same CampaignStatus state) */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-inktext">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatus(option.value)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-medium transition-all duration-200 ${
                        status === option.value
                          ? "border-forest bg-forest/8 text-forest ring-1 ring-forest/15"
                          : "border-warmgray-border bg-white text-warmgray-text hover:border-forest/30 hover:text-inktext"
                      }`}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-warmgray-text">
                  Upcoming and active campaigns are visible to volunteers for
                  joining.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-forest/10 transition-all duration-200 hover:bg-forest-hover hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Campaign
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="rounded-xl border border-forest/40 bg-cream px-4 py-2.5 text-sm font-medium text-forest transition-colors hover:bg-forest/5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
