// Tree profile page — §19 Part 3, Feature 9.
// Shows full tree details: species, campaign, planting date, location,
// status, complete update history, and an update submission form.
//
// VISUAL REDESIGN: "Tree journey" layout with hero section, timeline,
// Guardian avatar prominence. All data/API/avatar logic preserved exactly.

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
  Shield,
  CheckCircle,
  AlertTriangle,
  Sparkles,
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
          <div className="rounded-2xl border border-warmgray-border bg-cream-card p-12 text-center shadow-sm">
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
      <div className="mx-auto max-w-4xl px-4 py-8 animate-fade-up">
        {/* Back navigation */}
        <button
          onClick={() => router.push("/my-trees")}
          className="mb-6 flex items-center gap-2 text-sm text-warmgray-text hover:text-inktext transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Trees
        </button>

        {/* ─── HERO SECTION ─────────────────────────────────────────────── */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-warmgray-border/60 bg-cream-card shadow-sm">
          {/* Top gradient accent */}
          <div className="h-2 bg-gradient-to-r from-forest/80 via-forest/50 to-leaf-accent/40" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              {/* Tree identity */}
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-forest/8 ring-1 ring-forest/12">
                  <TreePine className="h-8 w-8 text-forest" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-forest/60">
                    Your Guardian Tree
                  </p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-inktext sm:text-3xl">
                    {tree.id}
                  </h1>
                  <p className="mt-1 text-base text-warmgray-text">
                    {tree.species}
                  </p>
                </div>
              </div>

              <StatusBadge status={tree.currentStatus} />
            </div>

            {/* Tree details grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: <MapPin className="h-5 w-5 text-brown" />, label: "Location", value: tree.location },
                { icon: <Calendar className="h-5 w-5 text-brown" />, label: "Planting Date", value: new Date(tree.plantingDate).toLocaleDateString() },
                { icon: <Leaf className="h-5 w-5 text-forest" />, label: "Species", value: tree.species },
                { icon: <TreePine className="h-5 w-5 text-forest" />, label: "Campaign", value: tree.campaignId },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-cream p-3">
                  {item.icon}
                  <div>
                    <p className="text-xs text-warmgray-text">{item.label}</p>
                    <p className="text-sm font-medium text-inktext">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Health summary bar */}
            <div className="mt-6 flex items-center justify-between border-t border-warmgray-border/50 pt-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-forest" />
                <span className="text-sm text-warmgray-text">
                  Consecutive warnings:{" "}
                  <span className="font-semibold text-inktext">
                    {tree.consecutiveNeedsAttentionCount}
                  </span>
                </span>
              </div>
              {tree.consecutiveNeedsAttentionCount >= 2 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-alert-red/10 px-3 py-1 text-xs font-semibold text-alert-red animate-alert-pulse">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  High Risk
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ─── GUARDIAN AVATAR ───────────────────────────────────────────── */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-warmgray-border/60 bg-cream-card p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <GuardianAvatar
              growthStage={growthStage}
              guardianId={tree.guardianId}
            />
            <div>
              <h2 className="text-lg font-semibold text-inktext">
                Guardian Avatar
              </h2>
              <p className="mt-0.5 text-sm font-medium text-forest capitalize">
                {growthStage.replace("_", " ")}
              </p>
              <p className="mt-1 text-sm text-warmgray-text">
                Submit on-time check-ins to help your virtual tree grow from seedling to young tree!
              </p>
              {/* Stage progress dots */}
              <div className="mt-3 flex items-center gap-2">
                {(["seedling", "sprout", "sapling", "young_tree"] as GuardianGrowthStage[]).map((stage, i) => {
                  const stageIndex = ["seedling", "sprout", "sapling", "young_tree"].indexOf(growthStage);
                  const isReached = i <= stageIndex;
                  return (
                    <div key={stage} className="flex items-center gap-1">
                      <div
                        className={`h-2.5 w-2.5 rounded-full transition-colors ${
                          isReached ? "bg-forest" : "bg-warmgray-border"
                        }`}
                      />
                      {i < 3 && (
                        <div
                          className={`h-0.5 w-4 transition-colors ${
                            i < stageIndex ? "bg-forest" : "bg-warmgray-border"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ─── TWO-COLUMN: Update Form + History ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Update submission form */}
          <div>
            <TreeUpdateForm
              treeId={treeId}
              authToken={authToken}
              onSuccess={fetchTreeData}
            />
          </div>

          {/* Update history / Tree Journey */}
          <div className="overflow-hidden rounded-2xl border border-warmgray-border/60 bg-cream-card shadow-sm">
            <div className="border-b border-warmgray-border/50 bg-forest/3 px-6 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-inktext">
                <Clock className="h-5 w-5 text-forest" />
                Tree Journey
              </h2>
              <p className="mt-0.5 text-xs text-warmgray-text">
                Complete update history for this tree.
              </p>
            </div>

            <div className="p-6">
              {updates.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-forest/5 ring-1 ring-forest/10">
                    <MessageSquare className="h-7 w-7 text-forest/40" />
                  </div>
                  <p className="text-sm font-medium text-inktext">
                    No updates yet
                  </p>
                  <p className="mt-1 text-xs text-warmgray-text">
                    Be the first to submit a check-in for this tree!
                  </p>
                </div>
              ) : (
                <div className="relative space-y-0">
                  {/* Timeline line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-warmgray-border/60" />

                  {updates.map((update, i) => (
                    <div key={update.id} className="relative pl-10 pb-6 last:pb-0">
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-2 top-1.5 h-4 w-4 rounded-full border-2 transition-colors ${
                          update.aiStatus === "healthy"
                            ? "border-forest bg-forest/20"
                            : update.aiStatus === "needs_attention"
                            ? "border-alert-red bg-alert-red/20"
                            : "border-warmgray-text/50 bg-warmgray-text/10"
                        }`}
                      >
                        {i === 0 && (
                          <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-forest" />
                        )}
                      </div>

                      {/* Update card */}
                      <div className="rounded-xl border border-warmgray-border/50 bg-cream p-4 transition-shadow hover:shadow-sm">
                        {/* Header: date + AI status */}
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-xs text-warmgray-text">
                            {new Date(update.submittedAt).toLocaleString()}
                          </p>
                          <StatusBadge status={update.aiStatus} />
                        </div>

                        {/* Photo thumbnail */}
                        {update.photoUrl && (
                          <div className="mb-3 overflow-hidden rounded-lg border border-warmgray-border/50">
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
                          <div className="mt-2 rounded-lg bg-forest/5 p-3 ring-1 ring-forest/10">
                            <div className="flex items-center gap-1.5 mb-1">
                              <CheckCircle className="h-3.5 w-3.5 text-forest" />
                              <p className="text-xs font-semibold text-forest">
                                AI Care Recommendation
                              </p>
                            </div>
                            <p className="text-xs leading-relaxed text-inktext">
                              {update.aiCareRecommendation}
                            </p>
                            {update.aiConfidenceNote && (
                              <p className="mt-1 text-xs text-warmgray-text italic">
                                {update.aiConfidenceNote}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
