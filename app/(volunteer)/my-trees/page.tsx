// "My Trees" list page — §19 Part 3, Feature 9.
// Shows the current guardian's assigned trees with status badges.
// Queries Firestore client-side for trees where guardianId == current user.
//
// Styled per THEME.md: cream background, forest/brown icons, cream-card surfaces.
// Uses Lucide icons exclusively.

"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { TreePine, Loader2, Sprout } from "lucide-react";
import { useAuth } from "@/components/shared/AuthProvider";
import { TreeCard } from "@/components/volunteer/TreeCard";
import type { Tree } from "@/types/entities";
import Link from "next/link";

export default function MyTreesPage() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.uid ?? null;
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      if (!authLoading) setLoading(false);
      return;
    }

    async function fetchTrees() {
      try {
        setLoading(true);
        const q = query(
          collection(db, "trees"),
          where("guardianId", "==", userId),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data: Tree[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Tree[];
        setTrees(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load trees");
      } finally {
        setLoading(false);
      }
    }

    fetchTrees();
  }, [userId, authLoading]);

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

  // Compute summary stats
  const healthyCount = trees.filter((t) => t.currentStatus === "healthy").length;
  const needsAttentionCount = trees.filter(
    (t) => t.currentStatus === "needs_attention"
  ).length;

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:color-mix(in_srgb,var(--color-forest)_10%,transparent)]">
              <TreePine className="h-5 w-5 text-forest" />
            </div>
            <h1 className="text-2xl font-semibold text-inktext">My Trees</h1>
          </div>
          <p className="text-sm text-warmgray-text">
            Trees you are a guardian of. Tap a tree to view its full profile
            and submit updates.
          </p>
        </div>

        {/* Summary stats */}
        {trees.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-warmgray-border bg-cream-card p-4 shadow-sm text-center">
              <p className="text-2xl font-semibold text-forest">
                {trees.length}
              </p>
              <p className="text-xs text-warmgray-text">Total Trees</p>
            </div>
            <div className="rounded-xl border border-warmgray-border bg-cream-card p-4 shadow-sm text-center">
              <p className="text-2xl font-semibold text-forest">
                {healthyCount}
              </p>
              <p className="text-xs text-warmgray-text">Healthy</p>
            </div>
            <div className="rounded-xl border border-warmgray-border bg-cream-card p-4 shadow-sm text-center">
              <p className="text-2xl font-semibold text-ochre">
                {needsAttentionCount}
              </p>
              <p className="text-xs text-warmgray-text">Needs Attention</p>
            </div>
          </div>
        )}

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

        {/* Tree list */}
        {!userId ? (
          <div className="rounded-xl border border-warmgray-border bg-cream-card p-12 text-center shadow-sm">
            <Sprout className="mx-auto h-12 w-12 text-warmgray-text mb-4" />
            <h2 className="text-lg font-semibold text-inktext mb-2">
              Sign in required
            </h2>
            <p className="text-sm text-warmgray-text">
              Please sign in to view your assigned trees.
            </p>
          </div>
        ) : trees.length === 0 ? (
          <div className="rounded-xl border border-warmgray-border bg-cream-card p-12 text-center shadow-sm">
            <Sprout className="mx-auto h-12 w-12 text-warmgray-text mb-4" />
            <h2 className="text-lg font-semibold text-inktext mb-2">
              No trees assigned yet
            </h2>
            <p className="text-sm text-warmgray-text mb-4">
              You haven&apos;t been assigned any trees yet. Join a campaign and
              wait for it to close — you&apos;ll become a guardian automatically.
            </p>
            <Link
              href="/browse-campaigns"
              className="inline-flex items-center rounded-lg px-4 py-2 bg-forest text-white text-sm font-medium hover:bg-forest-hover transition-colors"
            >
              Browse Campaigns
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {trees.map((tree) => (
              <TreeCard key={tree.id} tree={tree} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
