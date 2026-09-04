// /api/campaigns — list and create campaigns for the authenticated NGO.
// GET: returns all campaigns owned by the NGO.
// POST: creates a new campaign (ngoId + createdAt set server-side).

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase";
import type { Campaign, CampaignStatus, ApiResponse } from "@/types/entities";

const VALID_STATUSES: CampaignStatus[] = ["upcoming", "active", "completed"];

export async function GET(request: Request) {
  const session = await requireRole(request, "ngo");
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" } satisfies ApiResponse,
      { status: 401 }
    );
  }

  const db = await getAdminFirestore();
  const snapshot = await db
    .collection("campaigns")
    .where("ngoId", "==", session.ngoId)
    .orderBy("createdAt", "desc")
    .get();

  const campaigns: Campaign[] = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Campaign)
  );

  return NextResponse.json(
    { success: true, data: campaigns } satisfies ApiResponse<Campaign[]>
  );
}

export async function POST(request: Request) {
  const session = await requireRole(request, "ngo");
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" } satisfies ApiResponse,
      { status: 401 }
    );
  }

  if (!session.ngoId) {
    return NextResponse.json(
      {
        success: false,
        error: "NGO user must have an associated ngoId",
      } satisfies ApiResponse,
      { status: 400 }
    );
  }

  const body = await request.json();
  const { title, location, date, treesPlannedCount, volunteersNeeded, status } =
    body;

  // Basic validation
  if (
    !title ||
    !location ||
    !date ||
    treesPlannedCount == null ||
    volunteersNeeded == null
  ) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required fields: title, location, date, treesPlannedCount, volunteersNeeded",
      } satisfies ApiResponse,
      { status: 400 }
    );
  }

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      } satisfies ApiResponse,
      { status: 400 }
    );
  }

  const db = await getAdminFirestore();
  const campaignRef = db.collection("campaigns").doc();

  const campaign: Campaign = {
    id: campaignRef.id,
    ngoId: session.ngoId,
    title,
    location,
    date,
    treesPlannedCount: Number(treesPlannedCount),
    volunteersNeeded: Number(volunteersNeeded),
    status: status ?? "upcoming",
    createdAt: new Date().toISOString(),
  };

  await campaignRef.set(campaign);

  return NextResponse.json(
    { success: true, data: campaign } satisfies ApiResponse<Campaign>,
    { status: 201 }
  );
}
