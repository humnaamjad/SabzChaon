// GET /api/trees/[id] — get a single tree by its unique Tree ID.
// Response shape per §9: { success: boolean, data?: Tree, error?: string }

import type { NextRequest } from "next/server";
import { getAdminFirestore } from "@/lib/firebase";
import { Timestamp } from "firebase-admin/firestore";
import type { Tree, ApiResponse } from "@/types/entities";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/trees/[id]">
) {
  try {
    const { id } = await ctx.params;
    const db = await getAdminFirestore();

    const doc = await db.collection("trees").doc(id).get();

    if (!doc.exists) {
      return Response.json(
        { success: false, error: "Tree not found" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    const data = doc.data()!;
    const tree: Tree = {
      id: doc.id,
      campaignId: data.campaignId,
      guardianId: data.guardianId,
      species: data.species,
      plantingDate: data.plantingDate,
      location: data.location,
      currentStatus: data.currentStatus,
      consecutiveNeedsAttentionCount: data.consecutiveNeedsAttentionCount,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
    };

    return Response.json({ success: true, data: tree } satisfies ApiResponse<Tree>);
  } catch (err) {
    console.error(`GET /api/trees/${(await ctx.params).id} error:`, err);
    return Response.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch tree",
      } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
