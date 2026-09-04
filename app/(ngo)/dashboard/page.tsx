// NGO Dashboard page — aggregated metrics per §8 / §14.
// Fetches from /api/dashboard for all metrics.
// Shows: trees planted, active guardians, health breakdown,
// update completion rate, survival rate, trees requiring attention.
//
// VISUAL REDESIGN: Professional impact-monitoring platform feel.
// All API/data logic preserved exactly.

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/shared/AuthProvider";
import ErrorState from "@/components/shared/ErrorState";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import StatCard from "@/components/ngo/StatCard";
import { SkeletonGrid } from "@/components/shared/Skeleton";
import {
  TreePine,
  Users,
  HeartPulse,
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  Activity,
  Sprout,
} from "lucide-react";

interface DashboardData {
  treesPlanted: number;
  activeGuardians: number;
  healthBreakdown: { healthy: number; needs_attention: number; unknown: number };
  updateCompletionRate: number;
  survivalRate: number;
  treesRequiringAttention: number;
  attentionTrees: Array<{
    id: string;
    species: string;
    location: string;
    currentStatus: string;
    consecutiveNeedsAttentionCount: number;
  }>;
}

export default function DashboardPage() {
  const { user, userDoc } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error ?? "Failed to load dashboard");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <SkeletonGrid count={6} lines={1} />
      </div>
    );
  }
  if (error || !data)
    return <ErrorState message={error ?? "Failed to load"} retry={fetchDashboard} />;

  const totalTrees =
    data.healthBreakdown.healthy +
    data.healthBreakdown.needs_attention +
    data.healthBreakdown.unknown;

  // Health bar segments (percentages)
  const healthyPct = totalTrees > 0 ? (data.healthBreakdown.healthy / totalTrees) * 100 : 0;
  const attentionPct = totalTrees > 0 ? (data.healthBreakdown.needs_attention / totalTrees) * 100 : 0;
  const unknownPct = totalTrees > 0 ? (data.healthBreakdown.unknown / totalTrees) * 100 : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 animate-fade-up">
      {/* Greeting banner — mirrors the volunteer "Welcome back" card */}
      <div className="mb-6 rounded-2xl border border-forest/15 bg-gradient-to-br from-forest/5 to-transparent p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest/10 ring-1 ring-forest/15">
            <TrendingUp className="h-5 w-5 text-forest" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-inktext">
              Welcome back
              {userDoc?.name ? `, ${userDoc.name.split(" ")[0]}` : ""}
            </h2>
            <p className="text-sm text-warmgray-text">
              Here&apos;s the impact your campaigns are making.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <PageHeader
        icon={<Activity className="h-5 w-5 text-forest" />}
        title="Impact Dashboard"
        subtitle="What impact are we making? Real survival data, not just planting counts."
      />

      {/* Stat cards grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<TreePine className="h-5 w-5 text-forest" />}
          label="Trees Planted"
          value={data.treesPlanted}
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-brown" />}
          label="Active Guardians"
          value={data.activeGuardians}
          accentColor="brown"
        />
        <StatCard
          icon={<ClipboardCheck className="h-5 w-5 text-forest" />}
          label="Update Completion"
          value={`${Math.round(data.updateCompletionRate * 100)}%`}
          subtitle={`${data.treesPlanted > 0 ? Math.round(data.updateCompletionRate * data.treesPlanted) : 0} of ${data.treesPlanted} trees have updates`}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-forest" />}
          label="Survival Rate"
          value={`${Math.round(data.survivalRate * 100)}%`}
          subtitle="Trees currently healthy"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-alert-red" />}
          label="Trees Requiring Attention"
          value={data.treesRequiringAttention}
          accentColor="alert-red"
        />
        <StatCard
          icon={<Activity className="h-5 w-5 text-forest" />}
          label="Health Overview"
          value={
            totalTrees > 0
              ? `${data.healthBreakdown.healthy}/${totalTrees}`
              : "—"
          }
          subtitle={totalTrees > 0 ? "healthy / total" : "No trees yet"}
        />
      </div>

      {/* Health breakdown */}
      {totalTrees > 0 && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-warmgray-border/60 bg-cream-card shadow-sm">
          {/* Section header */}
          <div className="border-b border-warmgray-border/50 bg-forest/3 px-6 py-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-inktext">
              <HeartPulse className="h-5 w-5 text-forest" />
              Health Breakdown
            </h2>
            <p className="mt-0.5 text-xs text-warmgray-text">
              From planted to surviving — your full impact funnel.
            </p>
          </div>

          <div className="p-6">
            {/* Impact story flow */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-warmgray-text">
              <span className="flex items-center gap-1.5 rounded-lg bg-forest/5 px-3 py-1.5 text-forest">
                <TreePine className="h-3.5 w-3.5" />
                {data.treesPlanted} planted
              </span>
              <span className="text-warmgray-border">→</span>
              <span className="flex items-center gap-1.5 rounded-lg bg-forest/5 px-3 py-1.5 text-forest">
                <Users className="h-3.5 w-3.5" />
                {data.activeGuardians} guardians
              </span>
              <span className="text-warmgray-border">→</span>
              <span className="flex items-center gap-1.5 rounded-lg bg-forest/5 px-3 py-1.5 text-forest">
                <ClipboardCheck className="h-3.5 w-3.5" />
                {Math.round(data.updateCompletionRate * data.treesPlanted)} checked
              </span>
              <span className="text-warmgray-border">→</span>
              <span className="flex items-center gap-1.5 rounded-lg bg-forest/5 px-3 py-1.5 text-forest">
                <HeartPulse className="h-3.5 w-3.5" />
                {data.healthBreakdown.healthy} healthy
              </span>
            </div>

            {/* Stacked bar */}
            <div className="mb-4 flex h-7 w-full overflow-hidden rounded-full bg-warmgray-border/20">
              {healthyPct > 0 && (
                <div
                  className="bg-forest transition-all duration-700"
                  style={{ width: `${healthyPct}%` }}
                  title={`Healthy: ${data.healthBreakdown.healthy}`}
                />
              )}
              {attentionPct > 0 && (
                <div
                  className="bg-alert-red transition-all duration-700"
                  style={{ width: `${attentionPct}%` }}
                  title={`Needs Attention: ${data.healthBreakdown.needs_attention}`}
                />
              )}
              {unknownPct > 0 && (
                <div
                  className="bg-warmgray-text/30 transition-all duration-700"
                  style={{ width: `${unknownPct}%` }}
                  title={`Unknown: ${data.healthBreakdown.unknown}`}
                />
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-forest" />
                <span className="text-inktext">
                  Healthy: <span className="font-semibold">{data.healthBreakdown.healthy}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-alert-red" />
                <span className="text-inktext">
                  Needs Attention: <span className="font-semibold">{data.healthBreakdown.needs_attention}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-warmgray-text/40" />
                <span className="text-inktext">
                  Unknown: <span className="font-semibold">{data.healthBreakdown.unknown}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trees requiring attention list */}
      {data.attentionTrees.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-warmgray-border/60 bg-cream-card shadow-sm">
          <div className="border-b border-warmgray-border/50 bg-alert-red/3 px-6 py-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-inktext">
              <AlertTriangle className="h-5 w-5 text-alert-red" />
              Attention Required
            </h2>
            <p className="mt-0.5 text-xs text-warmgray-text">
              Trees that need intervention from your team.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warmgray-border/50 bg-cream/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-warmgray-text">
                    Tree
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-warmgray-text">
                    Species
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-warmgray-text">
                    Location
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-warmgray-text">
                    Flags
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.attentionTrees.map((tree) => (
                  <tr
                    key={tree.id}
                    className="border-b border-warmgray-border/30 last:border-b-0 transition-colors hover:bg-cream/40"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-alert-red/8">
                          <TreePine className="h-4 w-4 text-alert-red" />
                        </div>
                        <span className="font-semibold text-inktext">
                          {tree.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-inktext">{tree.species}</td>
                    <td className="px-5 py-3.5 text-warmgray-text">
                      {tree.location}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-alert-red/10 px-3 py-1 text-xs font-semibold text-alert-red">
                        <AlertTriangle className="h-3 w-3" />
                        {tree.consecutiveNeedsAttentionCount}× flagged
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalTrees === 0 && (
        <EmptyState
          icon={<Sprout className="h-9 w-9 text-forest/40" />}
          title="No trees planted yet"
          description="Create a campaign and recruit volunteers to start planting. Your impact journey begins with a single tree."
        />
      )}
    </div>
  );
}
