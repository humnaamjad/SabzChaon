// NGO Dashboard page — aggregated metrics per §8 / §14.
// Fetches from /api/dashboard for all metrics.
// Shows: trees planted, active guardians, health breakdown,
// update completion rate, survival rate, trees requiring attention.

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/shared/AuthProvider";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import StatCard from "@/components/ngo/StatCard";
import {
  TreePine,
  Users,
  HeartPulse,
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  Activity,
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
  const { user } = useAuth();
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

  if (loading) return <LoadingState message="Loading dashboard…" />;
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-inktext">Dashboard</h1>
        <p className="mt-1 text-sm text-warmgray-text">
          Overview of your plantation impact
        </p>
      </div>

      {/* Stat cards grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<TreePine className="h-5 w-5 text-forest" />}
          label="Trees Planted"
          value={data.treesPlanted}
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-forest" />}
          label="Active Guardians"
          value={data.activeGuardians}
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
          icon={<AlertTriangle className="h-5 w-5 text-ochre" />}
          label="Trees Requiring Attention"
          value={data.treesRequiringAttention}
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

      {/* Health breakdown bar */}
      {totalTrees > 0 && (
        <div className="mb-8 rounded-xl border border-warmgray-border bg-cream-card p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-inktext">
            <HeartPulse className="h-5 w-5 text-forest" />
            Health Breakdown
          </h2>

          {/* Stacked bar */}
          <div className="mb-3 flex h-6 w-full overflow-hidden rounded-full">
            {healthyPct > 0 && (
              <div
                className="bg-forest transition-all"
                style={{ width: `${healthyPct}%` }}
              />
            )}
            {attentionPct > 0 && (
              <div
                className="bg-ochre transition-all"
                style={{ width: `${attentionPct}%` }}
              />
            )}
            {unknownPct > 0 && (
              <div
                className="bg-warmgray-text/40 transition-all"
                style={{ width: `${unknownPct}%` }}
              />
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-forest" />
              <span className="text-inktext">
                Healthy: {data.healthBreakdown.healthy}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-ochre" />
              <span className="text-inktext">
                Needs Attention: {data.healthBreakdown.needs_attention}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-warmgray-text/40" />
              <span className="text-inktext">
                Unknown: {data.healthBreakdown.unknown}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Trees requiring attention list */}
      {data.attentionTrees.length > 0 && (
        <div className="rounded-xl border border-warmgray-border bg-cream-card p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-inktext">
            <AlertTriangle className="h-5 w-5 text-ochre" />
            Trees Requiring Attention
          </h2>
          <div className="overflow-hidden rounded-lg border border-warmgray-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warmgray-border bg-cream">
                  <th className="px-4 py-3 text-left font-medium text-warmgray-text">
                    Tree ID
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-warmgray-text">
                    Species
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-warmgray-text">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-warmgray-text">
                    Consecutive Flags
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.attentionTrees.map((tree) => (
                  <tr
                    key={tree.id}
                    className="border-b border-warmgray-border last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-inktext">
                        {tree.id}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-inktext">{tree.species}</td>
                    <td className="px-4 py-3 text-warmgray-text">
                      {tree.location}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-ochre/10 px-3 py-1 text-xs font-medium text-ochre">
                        {tree.consecutiveNeedsAttentionCount}
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
        <div className="rounded-xl border border-warmgray-border bg-cream-card p-12 text-center shadow-sm">
          <TreePine className="mx-auto mb-3 h-10 w-10 text-warmgray-text" />
          <p className="text-inktext">No trees planted yet</p>
          <p className="mt-1 text-sm text-warmgray-text">
            Create a campaign and recruit volunteers to start planting.
          </p>
        </div>
      )}
    </div>
  );
}
