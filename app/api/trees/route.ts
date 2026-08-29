// GET /api/trees — list trees, optionally filtered by guardianId query param.
// POST /api/trees — create Tree records for a campaign's volunteers (guardian assignment, §19 Part 3).
// Response shape per §9: { success: boolean, data?: ..., error?: string }

import { NextRequest } from "next/server";
import { getAdminFirestore } from "@/lib/firebase";
import { getAuthUserId } from "@/lib/serverAuth";
import { generateNextTreeId } from "@/lib/generateTreeId";
import { Timestamp } from "firebase-admin/firestore";
import type { Tree, ApiResponse } from "@/types/entities";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const guardianId = searchParams.get("guardianId");
    const campaignId = searchParams.get("campaignId");

    const db = await getAdminFirestore();
    let query = db.collection("trees").orderBy("createdAt", "desc");

    if (guardianId) {
      query = db
        .collection("trees")
        .where("guardianId", "==", guardianId)
        .orderBy("createdAt", "desc");
    }
    if (campaignId) {
      query = db
        .collection("trees")
        .where("campaignId", "==", campaignId)
        .orderBy("createdAt", "desc");
    }

    const snapshot = await query.get();
    const trees: Tree[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      trees.push({
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
      });
    });

    return Response.json({ success: true, data: trees } satisfies ApiResponse<Tree[]>);
  } catch (err) {
    console.error("GET /api/trees error:", err);
    return Response.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch trees",
      } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * Guardian assignment flow (§19 Part 3):
 * When an NGO closes out a campaign, this endpoint creates Tree records
 * for each volunteer who joined, setting becameGuardian = true on their
 * CampaignMembership. Tree IDs follow the SC-{year}-{counter} format (§6).
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    const body = await request.json();
    const { campaignId, volunteers, species } = body as {
      campaignId: string;
      volunteers: Array<{ userId: string; species: string }>;
      species?: string;
    };

    if (!campaignId || !volunteers?.length) {
      return Response.json(
        {
          success: false,
          error: "campaignId and volunteers[] are required",
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const db = await getAdminFirestore();

    // Verify the campaign exists
    const campaignDoc = await db.collection("campaigns").doc(campaignId).get();
    if (!campaignDoc.exists) {
      return Response.json(
        { success: false, error: "Campaign not found" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    const campaignData = campaignDoc.data()!;
    const plantingDate = campaignData.date;
    const location = campaignData.location;
    const now = Timestamp.now();
    const createdTrees: Tree[] = [];

    for (const volunteer of volunteers) {
      const treeId = await generateNextTreeId(plantingDate);

      // Create the Tree record
      const treeData = {
        campaignId,
        guardianId: volunteer.userId,
        species: volunteer.species || species || "Unknown",
        plantingDate,
        location,
        currentStatus: "unknown" as const,
        consecutiveNeedsAttentionCount: 0,
        createdAt: now,
      };

      await db.collection("trees").doc(treeId).set(treeData);

      // Mark the CampaignMembership as becameGuardian = true
      const membershipQuery = await db
        .collection("campaignMemberships")
        .where("campaignId", "==", campaignId)
        .where("userId", "==", volunteer.userId)
        .get();

      if (!membershipQuery.empty) {
        const membershipDoc = membershipQuery.docs[0];
        await membershipDoc.ref.update({ becameGuardian: true });
      }

      createdTrees.push({
        id: treeId,
        ...treeData,
        createdAt: now.toDate().toISOString(),
      });
    }

    return Response.json(
      { success: true, data: createdTrees } satisfies ApiResponse<Tree[]>,
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/trees error:", err);
    return Response.json(
      {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to create tree records",
      } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
