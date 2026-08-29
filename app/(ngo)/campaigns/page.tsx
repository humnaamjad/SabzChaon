// NGO Campaigns page — list campaigns + create new campaign.
// Fetches from /api/campaigns (GET to list, POST to create).
// All data scoped to the authenticated NGO's ngoId (server-side).

"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/components/shared/AuthProvider";
import { useToast } from "@/components/shared/Toast";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import StatusBadge from "@/components/ngo/StatusBadge";
import {
  Plus,
  MapPin,
  Calendar,
  TreePine,
  Users,
  X,
} from "lucide-react";
import type { Campaign, CampaignStatus } from "@/types/entities";

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

  if (loading) return <LoadingState message="Loading campaigns…" />;
  if (error) return <ErrorState message={error} retry={fetchCampaigns} />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-inktext">Campaigns</h1>
          <p className="mt-1 text-sm text-warmgray-text">
            Manage your plantation campaigns
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-forest-hover"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </button>
      </div>

      {/* Campaign list */}
      {campaigns.length === 0 ? (
        <div className="rounded-xl border border-warmgray-border bg-cream-card p-12 text-center shadow-sm">
          <Megaphone className="mx-auto mb-3 h-10 w-10 text-warmgray-text" />
          <p className="text-inktext">No campaigns yet</p>
          <p className="mt-1 text-sm text-warmgray-text">
            Create your first campaign to start recruiting volunteers.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/campaigns/${campaign.id}`}
              className="group rounded-xl border border-warmgray-border bg-cream-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-lg font-semibold text-inktext group-hover:text-forest">
                  {campaign.title}
                </h3>
                <StatusBadge status={campaign.status} />
              </div>
              <div className="space-y-2 text-sm text-warmgray-text">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-brown" />
                  {campaign.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-brown" />
                  {new Date(campaign.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <TreePine className="h-3.5 w-3.5 text-forest" />
                    {campaign.treesPlannedCount} trees
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-forest" />
                    {campaign.volunteersNeeded} volunteers
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create campaign modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-inktext/30 px-4">
          <div className="w-full max-w-lg rounded-xl border border-warmgray-border bg-cream-card p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-inktext">
                Create Campaign
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-warmgray-text hover:text-inktext"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-inktext">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-lg border border-warmgray-border bg-white px-3 py-2 text-sm text-inktext placeholder-warmgray-text/50 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                  placeholder="e.g. Spring Plantation Drive"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-inktext">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="w-full rounded-lg border border-warmgray-border bg-white px-3 py-2 text-sm text-inktext placeholder-warmgray-text/50 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
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
                  className="w-full rounded-lg border border-warmgray-border bg-white px-3 py-2 text-sm text-inktext focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    className="w-full rounded-lg border border-warmgray-border bg-white px-3 py-2 text-sm text-inktext focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
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
                    className="w-full rounded-lg border border-warmgray-border bg-white px-3 py-2 text-sm text-inktext focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-inktext">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as CampaignStatus)
                  }
                  className="w-full rounded-lg border border-warmgray-border bg-white px-3 py-2 text-sm text-inktext focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-forest-hover disabled:opacity-50"
                >
                  {submitting ? "Creating…" : "Create Campaign"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="rounded-lg border border-forest bg-cream px-4 py-2 text-sm font-medium text-forest transition-colors hover:bg-cream-card"
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

// Placeholder for the empty-state icon (reuses Megaphone from lucide)
function Megaphone(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  // Inline re-export to avoid an extra import for a single empty-state icon
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m3 11 18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}
