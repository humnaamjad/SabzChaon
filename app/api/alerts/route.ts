// /api/alerts — list and resolve NGO alerts.
// GET: returns open (unresolved) alerts for the authenticated NGO.
// PATCH: resolves an alert by setting resolvedAt.

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase";
import type { NgoAlert, ApiResponse } from "@/types/entities";

// Firestore Timestamp objects survive doc.data() as { _seconds, _nanoseconds }.
// Convert any such field to an ISO string so the client can parse it with new Date().
function serializeDoc<T extends Record<string, unknown>>(data: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (
      value &&
      typeof value === "object" &&
      typeof (value as Record<string, unknown>).toDate === "function"
    ) {
      result[key] = ((value as { toDate: () => Date }).toDate()).toISOString();
    } else {
      result[key] = value;
    }
  }
  return result as T;
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
  const snapshot = await db
    .collection("ngoAlerts")
    .where("ngoId", "==", session.ngoId)
    .where("resolvedAt", "==", null)
    .orderBy("createdAt", "desc")
    .get();

  const alerts: NgoAlert[] = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...serializeDoc(doc.data() as Record<string, unknown>) } as unknown as NgoAlert)
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

  const alert = { id: alertDoc.id, ...serializeDoc(alertDoc.data() as Record<string, unknown>) } as unknown as NgoAlert;

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
  const updatedAlert = { id: updatedDoc.id, ...serializeDoc(
    updatedDoc.data() as Record<string, unknown>
  ) } as unknown as NgoAlert;

  return NextResponse.json(
    { success: true, data: updatedAlert } satisfies ApiResponse<NgoAlert>
  );
}
