// /api/alerts — list and resolve NGO alerts.
// GET: returns open (unresolved) alerts for the authenticated NGO.
// PATCH: resolves an alert by setting resolvedAt.

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase";
import type { NgoAlert, ApiResponse } from "@/types/entities";

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
    .collection("ngoAlerts")
    .where("ngoId", "==", session.ngoId)
    .where("resolvedAt", "==", null)
    .orderBy("createdAt", "desc")
    .get();

  const alerts: NgoAlert[] = snapshot.docs.map(
    (doc) => doc.data() as NgoAlert
  );

  return NextResponse.json(
    { success: true, data: alerts } satisfies ApiResponse<NgoAlert[]>
  );
}

export async function PATCH(request: Request) {
  const session = await requireRole(request, "ngo");
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" } satisfies ApiResponse,
      { status: 401 }
    );
  }

  const body = await request.json();
  const { id, action } = body;

  if (!id) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required field: id",
      } satisfies ApiResponse,
      { status: 400 }
    );
  }

  if (action !== "resolve") {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid action. Use 'resolve'.",
      } satisfies ApiResponse,
      { status: 400 }
    );
  }

  const db = await getAdminFirestore();
  const alertDoc = await db.collection("ngoAlerts").doc(id).get();

  if (!alertDoc.exists) {
    return NextResponse.json(
      { success: false, error: "Alert not found" } satisfies ApiResponse,
      { status: 404 }
    );
  }

  const alert = alertDoc.data() as NgoAlert;

  if (alert.ngoId !== session.ngoId) {
    return NextResponse.json(
      { success: false, error: "Forbidden" } satisfies ApiResponse,
      { status: 403 }
    );
  }

  if (alert.resolvedAt !== null) {
    return NextResponse.json(
      {
        success: false,
        error: "Alert is already resolved",
      } satisfies ApiResponse,
      { status: 400 }
    );
  }

  await db
    .collection("ngoAlerts")
    .doc(id)
    .update({ resolvedAt: new Date().toISOString() });

  const updatedDoc = await db.collection("ngoAlerts").doc(id).get();
  const updatedAlert = updatedDoc.data() as NgoAlert;

  return NextResponse.json(
    { success: true, data: updatedAlert } satisfies ApiResponse<NgoAlert>
  );
}
