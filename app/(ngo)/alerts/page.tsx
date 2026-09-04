// NGO Alerts page — list open alerts and resolve them.
// Fetches from /api/alerts (GET to list, PATCH to resolve).
//
// VISUAL REDESIGN: "Attention Center" with rich alert cards.
// All API logic preserved exactly.

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/shared/AuthProvider";
import { useToast } from "@/components/shared/Toast";
import { SkeletonList } from "@/components/shared/Skeleton";
import ErrorState from "@/components/shared/ErrorState";
import EmptyState from "@/components/shared/EmptyState";
import {
  BellOff,
  TreePine,
  Clock,
  AlertTriangle,
  CheckCircle,
  Bell,
  Loader2,
} from "lucide-react";
import type { NgoAlert } from "@/types/entities";

export default function AlertsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<NgoAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/alerts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setAlerts(json.data);
      } else {
        setError(json.error ?? "Failed to load alerts");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  async function handleResolve(alertId: string) {
    if (!user) return;
    setResolvingId(alertId);

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/alerts", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: alertId, action: "resolve" }),
      });
      const json = await res.json();
      if (json.success) {
        toast("Alert resolved", "success");
        // Remove the resolved alert from the list
        setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      } else {
        toast(json.error ?? "Failed to resolve alert", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setResolvingId(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <SkeletonList count={3} />
      </div>
    );
  }
  if (error) return <ErrorState message={error} retry={fetchAlerts} />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-fade-up">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-alert-red/8 ring-1 ring-alert-red/15">
            <Bell className="h-5 w-5 text-alert-red" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-inktext">
              Attention Center
            </h1>
            <p className="mt-0.5 text-sm text-warmgray-text">
              Trees that need your team&apos;s intervention
            </p>
          </div>
        </div>
        {alerts.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-alert-red/10 px-3 py-1.5 text-xs font-semibold text-alert-red ring-1 ring-alert-red/15">
            <AlertTriangle className="h-3 w-3" />
            {alerts.length} open
          </span>
        )}
      </div>

      {/* Alerts list */}
      {alerts.length === 0 ? (
        <EmptyState
          icon={<BellOff className="h-9 w-9 text-forest/40" />}
          title="No open alerts"
          description="All trees are doing well — or no alerts have been triggered yet. Alerts fire when a tree receives 3 consecutive 'needs attention' AI assessments."
        />
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, i) => (
            <div
              key={alert.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="group overflow-hidden rounded-2xl border border-alert-red/20 bg-cream-card shadow-sm transition-all duration-300 hover:border-alert-red/30 hover:shadow-md">
                {/* Left alert-red accent bar */}
                <div className="flex">
                  <div className="w-1.5 shrink-0 bg-alert-red rounded-l-2xl" />
                  <div className="flex-1 p-5">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-alert-red/8 ring-1 ring-alert-red/12">
                        <AlertTriangle className="h-5 w-5 text-alert-red" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-inktext">
                                Needs Attention
                              </p>
                              <span className="inline-flex items-center gap-1 rounded-full bg-alert-red/10 px-2 py-0.5 text-xs font-semibold text-alert-red animate-alert-pulse">
                                <span className="h-1.5 w-1.5 rounded-full bg-alert-red" />
                                Open
                              </span>
                            </div>
                            <p className="mt-0.5 text-sm text-warmgray-text">
                              {alert.reason}
                            </p>
                          </div>

                          {/* Resolve button */}
                          <button
                            onClick={() => handleResolve(alert.id)}
                            disabled={resolvingId === alert.id}
                            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-forest/10 transition-all duration-200 hover:bg-forest-hover hover:shadow-md disabled:opacity-50"
                          >
                            {resolvingId === alert.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            {resolvingId === alert.id ? "Resolving…" : "Resolve"}
                          </button>
                        </div>

                        {/* Meta info */}
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-warmgray-text">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-cream px-2.5 py-1 ring-1 ring-warmgray-border/50">
                            <TreePine className="h-3.5 w-3.5 text-brown" />
                            <span className="text-xs font-semibold text-inktext">
                              {alert.treeId.slice(0, 8)}…
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(alert.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
