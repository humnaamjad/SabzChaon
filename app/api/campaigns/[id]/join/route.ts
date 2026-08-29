// /api/campaigns/[id]/join — volunteer joins a campaign.
// POST: creates a CampaignMembership record.
// Part 2 owns this endpoint's data shape/logic;
// Part 3 owns the volunteer-facing join UI that calls it.

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase";
import type { CampaignMembership, ApiResponse } from "@/types/entities";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  // Any authenticated user with a role can call this (volunteer joining).
  // For Part 2's scope we accept ngo role too for testing, but the
  // expected consumer is a volunteer (Part 3's UI).
  const session = await requireRole(request, "volunteer");
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" } satisfies ApiResponse,
      { status: 401 }
    );
  }

  const { id: campaignId } = await context.params;
  const db = await getAdminFirestore();

  // Verify the campaign exists
  const campaignDoc = await db.collection("campaigns").doc(campaignId).get();
  if (!campaignDoc.exists) {
    return NextResponse.json(
      { success: false, error: "Campaign not found" } satisfies ApiResponse,
      { status: 404 }
    );
  }

  const campaign = campaignDoc.data()!;
  if (campaign.status === "completed") {
    return NextResponse.json(
      {
        success: false,
        error: "Cannot join a completed campaign",
      } satisfies ApiResponse,
      { status: 400 }
    );
  }

  // Check for duplicate membership
  const existing = await db
    .collection("campaignMemberships")
    .where("campaignId", "==", campaignId)
    .where("userId", "==", session.uid)
    .limit(1)
    .get();

  if (!existing.empty) {
    return NextResponse.json(
      {
        success: false,
        error: "Already joined this campaign",
      } satisfies ApiResponse,
      { status: 400 }
    );
  }

  // Create membership
  const membershipRef = db.collection("campaignMemberships").doc();
  const membership: CampaignMembership = {
    id: membershipRef.id,
    campaignId,
    userId: session.uid,
    joinedAt: new Date().toISOString(),
    becameGuardian: false,
  };

  await membershipRef.set(membership);

  return NextResponse.json(
    { success: true, data: membership } satisfies ApiResponse<CampaignMembership>,
    { status: 201 }
  );
}
