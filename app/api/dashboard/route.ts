// /api/dashboard — aggregated NGO dashboard metrics (§8 / §14).
// GET: returns trees planted, active guardians, health breakdown,
// update completion rate, survival rate, and trees requiring attention.

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase";
import type { Tree, ApiResponse } from "@/types/entities";

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

export async function GET(request: Request) {
  const session = await requireRole(request, "ngo");
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" } satisfies ApiResponse,
      { status: 401 }
    );
  }

  const db = await getAdminFirestore();

  // 1. Get all campaigns for this NGO
  const campaignsSnap = await db
    .collection("campaigns")
    .where("ngoId", "==", session.ngoId)
    .get();

  const campaignIds = campaignsSnap.docs.map((d) => d.id);

  if (campaignIds.length === 0) {
    const empty: DashboardData = {
      treesPlanted: 0,
      activeGuardians: 0,
      healthBreakdown: { healthy: 0, needs_attention: 0, unknown: 0 },
      updateCompletionRate: 0,
      survivalRate: 0,
      treesRequiringAttention: 0,
      attentionTrees: [],
    };
    return NextResponse.json(
      { success: true, data: empty } satisfies ApiResponse<DashboardData>
    );
  }

  // 2. Get all trees for these campaigns
  const allTrees: Tree[] = [];
  for (const cid of campaignIds) {
    const treesSnap = await db
      .collection("trees")
      .where("campaignId", "==", cid)
      .get();
    allTrees.push(...treesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Tree)));
  }

  // 3. Trees planted count
  const treesPlanted = allTrees.length;

  // 4. Active guardians (unique guardian IDs across all trees)
  const guardianIds = new Set(allTrees.map((t) => t.guardianId));
  const activeGuardians = guardianIds.size;

  // 5. Health / status breakdown
  const healthBreakdown = { healthy: 0, needs_attention: 0, unknown: 0 };
  for (const tree of allTrees) {
    const status = tree.currentStatus ?? "unknown";
    if (status in healthBreakdown) {
      healthBreakdown[status as keyof typeof healthBreakdown]++;
    } else {
      healthBreakdown.unknown++;
    }
  }

  // 6. Update completion rate — fraction of trees with at least one update
  let treesWithUpdates = 0;
  for (const tree of allTrees) {
    const updatesSnap = await db
      .collection("treeUpdates")
      .where("treeId", "==", tree.id)
      .limit(1)
      .get();
    if (!updatesSnap.empty) treesWithUpdates++;
  }
  const updateCompletionRate =
    treesPlanted > 0 ? treesWithUpdates / treesPlanted : 0;

  // 7. Rough survival rate — fraction of trees that are healthy
  const survivalRate =
    treesPlanted > 0 ? healthBreakdown.healthy / treesPlanted : 0;

  // 8. Trees requiring attention (with summary data)
  const attentionTrees = allTrees
    .filter((t) => t.currentStatus === "needs_attention")
    .slice(0, 20)
    .map((t) => ({
      id: t.id,
      species: t.species,
      location: t.location,
      currentStatus: t.currentStatus,
      consecutiveNeedsAttentionCount: t.consecutiveNeedsAttentionCount,
    }));

  const data: DashboardData = {
    treesPlanted,
    activeGuardians,
    healthBreakdown,
    updateCompletionRate,
    survivalRate,
    treesRequiringAttention: healthBreakdown.needs_attention,
    attentionTrees,
  };

  return NextResponse.json(
    { success: true, data } satisfies ApiResponse<DashboardData>
  );
}
