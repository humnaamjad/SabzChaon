// NGO Alerts page — list open alerts and resolve them.
// Fetches from /api/alerts (GET to list, PATCH to resolve).

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/shared/AuthProvider";
import { useToast } from "@/components/shared/Toast";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import {
  BellOff,
  TreePine,
  Clock,
  AlertTriangle,
  CheckCircle,
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

  if (loading) return <LoadingState message="Loading alerts…" />;
  if (error) return <ErrorState message={error} retry={fetchAlerts} />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-inktext">Alerts</h1>
        <p className="mt-1 text-sm text-warmgray-text">
          Trees that need your attention
        </p>
      </div>

      {/* Alerts list */}
      {alerts.length === 0 ? (
        <div className="rounded-xl border border-warmgray-border bg-cream-card p-12 text-center shadow-sm">
          <BellOff className="mx-auto mb-3 h-10 w-10 text-warmgray-text" />
          <p className="text-inktext">No open alerts</p>
          <p className="mt-1 text-sm text-warmgray-text">
            All trees are doing well — or no alerts have been triggered yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-4 rounded-xl border border-warmgray-border bg-cream-card p-5 shadow-sm"
            >
              {/* Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ochre/10">
                <AlertTriangle className="h-5 w-5 text-ochre" />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-inktext">{alert.reason}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-warmgray-text">
                      <span className="flex items-center gap-1.5">
                        <TreePine className="h-3.5 w-3.5 text-brown" />
                        <span className="font-medium text-inktext">
                          {alert.treeId}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Resolve button */}
                  <button
                    onClick={() => handleResolve(alert.id)}
                    disabled={resolvingId === alert.id}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-forest-hover disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {resolvingId === alert.id ? "Resolving…" : "Resolve"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
