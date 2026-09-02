// Tree profile page — §19 Part 3, Feature 9.
// Shows full tree details: species, campaign, planting date, location,
// status, complete update history, and an update submission form.
//
// GuardianAvatar component (§19 Part 4) renders the guardian's growth stage
// visualization, fetched from the guardianAvatars Firestore collection.
//
// Styled per THEME.md: cream background, forest/brown icons, cream-card surfaces.
// Uses Lucide icons exclusively.

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import {
  ArrowLeft,
  TreePine,
  MapPin,
  Calendar,
  Leaf,
  Clock,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/components/shared/AuthProvider";
import { StatusBadge } from "@/components/volunteer/StatusBadge";
import { TreeUpdateForm } from "@/components/volunteer/TreeUpdateForm";
import GuardianAvatar from "@/components/GuardianAvatar";
import type { Tree, TreeUpdate, GuardianGrowthStage } from "@/types/entities";

export default function TreeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const treeId = params.treeId as string;

  const { user, loading: authLoading } = useAuth();
  const userId = user?.uid ?? null;
  const [tree, setTree] = useState<Tree | null>(null);
  const [updates, setUpdates] = useState<TreeUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [growthStage, setGrowthStage] = useState<GuardianGrowthStage>("seedling");

  // Fetch tree details and update history
  const fetchTreeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Force Firebase to fully attach a fresh auth token before any
      // Firestore reads — onAuthStateChanged can report the user as ready
      // before Firestore's internal request layer has synced the token.
      if (user) {
        await user.getIdToken();
      }

      // Fetch tree document
      const treeDoc = await getDoc(doc(db, "trees", treeId));
      if (!treeDoc.exists()) {
        setError("Tree not found");
        return;
      }
      const treeData = { id: treeDoc.id, ...treeDoc.data() } as Tree;
      setTree(treeData);

      // Fetch update history
      const updatesQuery = query(
        collection(db, "treeUpdates"),
        where("treeId", "==", treeId),
        orderBy("submittedAt", "desc")
      );
      const updatesSnapshot = await getDocs(updatesQuery);
      const updateList: TreeUpdate[] = updatesSnapshot.docs.map(
        (doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            submittedAt:
              data.submittedAt instanceof Timestamp
                ? data.submittedAt.toDate().toISOString()
                : data.submittedAt,
          } as TreeUpdate;
        }
      );
      setUpdates(updateList);

      // ── Guardian avatar fetch (§19 Part 4) ──────────────────────────
      // Reset to default before fetching so stale state never persists
      // from a previous render cycle or a prior fetchTreeData call.
      setGrowthStage("seedling");

      const gid = treeData.guardianId;
      if (gid) {
        try {
          const avatarDoc = await getDoc(doc(db, "guardianAvatars", gid));

          if (avatarDoc.exists()) {
            const stage = avatarDoc.data().growthStage;
            const validStages: string[] = ["seedling", "sprout", "sapling", "young_tree"];
            if (stage && validStages.includes(stage)) {
              setGrowthStage(stage as GuardianGrowthStage);
            }
          }
        } catch (avatarErr) {
          console.error("[Avatar] Firestore fetch error:", avatarErr);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load tree details"
      );
    } finally {
      setLoading(false);
    }
  }, [treeId]);

  useEffect(() => {
    // Wait for Firebase Auth to finish initializing before fetching,
    // so Firestore security rules have a valid request.auth.uid
    if (!authLoading) {
      fetchTreeData();
    }
  }, [fetchTreeData, authLoading]);

  // Get auth token for API calls
  useEffect(() => {
    async function getToken() {
      if (user) {
        try {
          const token = await user.getIdToken();
          setAuthToken(token);
        } catch {
          // Token refresh may fail if not authenticated
        }
      }
    }
    getToken();
  }, [user]);

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

  if (error || !tree) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <button
            onClick={() => router.push("/my-trees")}
            className="mb-6 flex items-center gap-2 text-sm text-warmgray-text hover:text-inktext transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Trees
          </button>
          <div className="rounded-xl border border-warmgray-border bg-cream-card p-12 text-center shadow-sm">
            <TreePine className="mx-auto h-12 w-12 text-warmgray-text mb-4" />
            <h2 className="text-lg font-semibold text-inktext mb-2">
              Tree not found
            </h2>
            <p className="text-sm text-warmgray-text">
              {error || "The tree you are looking for does not exist."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Back navigation */}
        <button
          onClick={() => router.push("/my-trees")}
          className="mb-6 flex items-center gap-2 text-sm text-warmgray-text hover:text-inktext transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Trees
        </button>

        {/* Tree header card */}
        <div className="rounded-xl border border-warmgray-border bg-cream-card p-6 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[color:color-mix(in_srgb,var(--color-forest)_10%,transparent)]">
                <TreePine className="h-7 w-7 text-forest" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-inktext">
                  {tree.id}
                </h1>
                <p className="text-sm text-warmgray-text">{tree.species}</p>
              </div>
            </div>
            <StatusBadge status={tree.currentStatus} />
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-brown" />
              <div>
                <p className="text-xs text-warmgray-text">Location</p>
                <p className="text-sm font-medium text-inktext">
                  {tree.location}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-brown" />
              <div>
                <p className="text-xs text-warmgray-text">Planting Date</p>
                <p className="text-sm font-medium text-inktext">
                  {new Date(tree.plantingDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Leaf className="h-5 w-5 text-forest" />
              <div>
                <p className="text-xs text-warmgray-text">Species</p>
                <p className="text-sm font-medium text-inktext">
                  {tree.species}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TreePine className="h-5 w-5 text-forest" />
              <div>
                <p className="text-xs text-warmgray-text">Campaign</p>
                <p className="text-sm font-medium text-inktext">
                  {tree.campaignId}
                </p>
              </div>
            </div>
          </div>

          {/* Health summary */}
          <div className="mt-6 pt-4 border-t border-warmgray-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-warmgray-text">
                  Consecutive "Needs Attention" count
                </p>
                <p className="text-sm font-medium text-inktext">
                  {tree.consecutiveNeedsAttentionCount}
                </p>
              </div>
              {tree.consecutiveNeedsAttentionCount >= 2 && (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-[color:color-mix(in_srgb,var(--color-ochre)_10%,transparent)] text-ochre">
                  High Risk
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ─── GUARDIAN AVATAR ──────────────────────────────────────────────── */}
        <div className="rounded-xl border border-warmgray-border bg-cream-card p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-inktext mb-4">
            Guardian Avatar
          </h2>
          <div className="flex items-center gap-4">
            <GuardianAvatar
              growthStage={growthStage}
              guardianId={tree.guardianId}
            />
            <div>
              <p className="text-sm font-medium text-inktext capitalize">
                {growthStage.replace("_", " ")}
              </p>
              <p className="text-xs text-warmgray-text">
                Submit on-time updates to help your tree grow!
              </p>
            </div>
          </div>
        </div>

        {/* Two-column layout: update form + history */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Update submission form */}
          <div>
            <TreeUpdateForm
              treeId={treeId}
              authToken={authToken}
              onSuccess={fetchTreeData}
            />
          </div>

          {/* Update history */}
          <div className="rounded-xl border border-warmgray-border bg-cream-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-inktext mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-forest" />
              Update History
            </h2>

            {updates.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquare className="mx-auto h-10 w-10 text-warmgray-text mb-3" />
                <p className="text-sm text-warmgray-text">
                  No updates yet. Be the first to submit one!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {updates.map((update) => (
                  <div
                    key={update.id}
                    className="rounded-lg border border-warmgray-border p-4"
                  >
                    {/* Update header: date + AI status */}
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-warmgray-text">
                        {new Date(update.submittedAt).toLocaleString()}
                      </p>
                      <StatusBadge status={update.aiStatus} />
                    </div>

                    {/* Photo thumbnail */}
                    {update.photoUrl && (
                      <div className="mb-3 overflow-hidden rounded-lg border border-warmgray-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={update.photoUrl}
                          alt={`Tree update photo for ${treeId}`}
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    )}

                    {/* Text note */}
                    {update.textNote && (
                      <p className="text-sm text-inktext mb-2">
                        {update.textNote}
                      </p>
                    )}

                    {/* AI recommendation */}
                    {update.aiCareRecommendation && (
                      <div className="mt-2 rounded-lg bg-[color:color-mix(in_srgb,var(--color-forest)_5%,transparent)] p-3">
                        <p className="text-xs font-medium text-forest mb-1">
                          AI Care Recommendation
                        </p>
                        <p className="text-xs text-inktext">
                          {update.aiCareRecommendation}
                        </p>
                        {update.aiConfidenceNote && (
                          <p className="text-xs text-warmgray-text mt-1 italic">
                            {update.aiConfidenceNote}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
