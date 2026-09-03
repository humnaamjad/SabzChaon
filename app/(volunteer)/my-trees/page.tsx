// "My Trees" list page — §19 Part 3, Feature 9.
// Shows the current guardian's assigned trees with status badges.
// Queries Firestore client-side for trees where guardianId == current user.
//
// VISUAL REDESIGN: Guardian greeting, visual stat cards, beautiful empty state.
// All data-fetching and query logic preserved exactly.

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
import {
  TreePine,
  Sprout,
  Shield,
  Heart,
  AlertTriangle,
  X,
} from "lucide-react";
import { useAuth } from "@/components/shared/AuthProvider";
import { TreeCard } from "@/components/volunteer/TreeCard";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { SkeletonList } from "@/components/shared/Skeleton";
import type { Tree } from "@/types/entities";
import Link from "next/link";

export default function MyTreesPage() {
  const { user, userDoc, loading: authLoading } = useAuth();
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

  // Compute summary stats
  const healthyCount = trees.filter((t) => t.currentStatus === "healthy").length;
  const needsAttentionCount = trees.filter(
    (t) => t.currentStatus === "needs_attention"
  ).length;

  if (authLoading || loading) {
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
        {/* Guardian greeting */}
        {trees.length > 0 && (
          <div className="mb-6 rounded-2xl border border-forest/15 bg-gradient-to-br from-forest/5 to-transparent p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest/10 ring-1 ring-forest/15">
                <Shield className="h-5 w-5 text-forest" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-inktext">
                  Welcome back, Guardian{userDoc?.name ? ` ${userDoc.name.split(" ")[0]}` : ""}
                </h2>
                <p className="text-sm text-warmgray-text">
                  Your trees are counting on you.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Page header */}
        <PageHeader
          icon={<TreePine className="h-5 w-5 text-forest" />}
          title="My Trees"
          subtitle="Trees you are a guardian of. Tap a tree to view its full profile."
        />

        {/* Summary stats */}
        {trees.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-warmgray-border/60 bg-cream-card p-4 shadow-sm text-center transition-shadow hover:shadow-md">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-forest/8">
                <TreePine className="h-4.5 w-4.5 text-forest" />
              </div>
              <p className="text-2xl font-bold text-forest">{trees.length}</p>
              <p className="text-xs text-warmgray-text">Total Trees</p>
            </div>
            <div className="rounded-xl border border-warmgray-border/60 bg-cream-card p-4 shadow-sm text-center transition-shadow hover:shadow-md">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-forest/8">
                <Heart className="h-4.5 w-4.5 text-forest" />
              </div>
              <p className="text-2xl font-bold text-forest">{healthyCount}</p>
              <p className="text-xs text-warmgray-text">Healthy</p>
            </div>
            <div className="rounded-xl border border-warmgray-border/60 bg-cream-card p-4 shadow-sm text-center transition-shadow hover:shadow-md">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-alert-red/8">
                <AlertTriangle className="h-4.5 w-4.5 text-alert-red" />
              </div>
              <p className="text-2xl font-bold text-alert-red">
                {needsAttentionCount}
              </p>
              <p className="text-xs text-warmgray-text">Needs Attention</p>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-start justify-between rounded-xl border border-brick/20 bg-brick/5 px-4 py-3">
            <p className="text-sm text-brick">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-3 shrink-0 text-warmgray-text hover:text-inktext"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Tree list */}
        {!userId ? (
          <EmptyState
            icon={<Shield className="h-9 w-9 text-forest/40" />}
            title="Sign in required"
            description="Please sign in to view your assigned Guardian trees."
          />
        ) : trees.length === 0 ? (
          <EmptyState
            icon={<Sprout className="h-9 w-9 text-forest/40" />}
            title="No trees assigned yet"
            description="You haven't been assigned any trees yet. Join a plantation campaign and wait for it to close — you'll become a Guardian automatically."
            action={
              <Link
                href="/browse-campaigns"
                className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-forest/10 transition-all hover:bg-forest-hover hover:shadow-md"
              >
                <TreePine className="h-4 w-4" />
                Browse Campaigns
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4">
            {trees.map((tree, i) => (
              <div
                key={tree.id}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <TreeCard tree={tree} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
