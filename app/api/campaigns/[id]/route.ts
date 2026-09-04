// /api/campaigns/[id] — get campaign detail and close out a campaign.
// GET: returns a single campaign (with NGO ownership check).
// PATCH: closes out a campaign (sets status to "completed").
//   Part 3's guardian-assignment logic hooks into this close-out action.

import { assignGuardians } from "@/lib/assignGuardians";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase";
import type { Campaign, CampaignMembership, ApiResponse } from "@/types/entities";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const session = await requireRole(request, "ngo");
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" } satisfies ApiResponse,
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const db = await getAdminFirestore();
  const campaignDoc = await db.collection("campaigns").doc(id).get();

  if (!campaignDoc.exists) {
    return NextResponse.json(
      { success: false, error: "Campaign not found" } satisfies ApiResponse,
      { status: 404 }
    );
  }

  const campaign = { id: campaignDoc.id, ...campaignDoc.data() } as Campaign;

  if (campaign.ngoId !== session.ngoId) {
    return NextResponse.json(
      { success: false, error: "Forbidden" } satisfies ApiResponse,
      { status: 403 }
    );
  }

  // Fetch joined volunteers (CampaignMembership records)
  const membershipsSnap = await db
    .collection("campaignMemberships")
    .where("campaignId", "==", id)
    .get();

  const members: CampaignMembership[] = membershipsSnap.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as CampaignMembership)
  );

  // Batch-fetch user names for display instead of raw user IDs
  const memberNames: Record<string, string> = {};
  if (members.length > 0) {
    const userRefs = members.map((m) => db.collection("users").doc(m.userId));
    const userDocs = await db.getAll(...userRefs);
    for (const doc of userDocs) {
      if (doc.exists) {
        memberNames[doc.id] = (doc.data() as { name: string }).name;
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: { campaign, members, memberNames },
  } satisfies ApiResponse<{ campaign: Campaign; members: CampaignMembership[]; memberNames: Record<string, string> }>);
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireRole(request, "ngo");
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" } satisfies ApiResponse,
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const db = await getAdminFirestore();
  const campaignDoc = await db.collection("campaigns").doc(id).get();

  if (!campaignDoc.exists) {
    return NextResponse.json(
      { success: false, error: "Campaign not found" } satisfies ApiResponse,
      { status: 404 }
    );
  }

  const campaign = { id: campaignDoc.id, ...campaignDoc.data() } as Campaign;

  if (campaign.ngoId !== session.ngoId) {
    return NextResponse.json(
      { success: false, error: "Forbidden" } satisfies ApiResponse,
      { status: 403 }
    );
  }

  if (campaign.status === "completed") {
    return NextResponse.json(
      {
        success: false,
        error: "Campaign is already completed",
      } satisfies ApiResponse,
      { status: 400 }
    );
  }

  const body = await request.json();

  if (body.action !== "complete") {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid action. Use 'complete' to close out a campaign.",
      } satisfies ApiResponse,
      { status: 400 }
    );
  }

  // Close out the campaign
await db.collection("campaigns").doc(id).update({ status: "completed" });

// Guardian assignment — create Tree records for all volunteers who joined
const result = await assignGuardians(id);

  const updatedDoc = await db.collection("campaigns").doc(id).get();
  const updatedCampaign = { id: updatedDoc.id, ...updatedDoc.data() } as Campaign;

  return NextResponse.json(
    { success: true, data: updatedCampaign } satisfies ApiResponse<Campaign>
  );
}
