// GET /api/reminders/due — due check-in reminders for the authenticated
// guardian (§6 Reminder, §19 Part 4 — Feature 6). "Due" = status "pending"
// and dueAt in the past (lib/reminders.ts). Scoped to the caller per §9:
// other guardians' reminders are never returned.

import { NextRequest } from "next/server";
import { getAdminFirestore } from "@/lib/firebase";
import { getAuthUserId } from "@/lib/serverAuth";
import { getDueReminders } from "@/lib/reminders";
import { Timestamp } from "firebase-admin/firestore";
import type { ApiResponse, Reminder } from "@/types/entities";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Reminders are per-guardian data — verify the caller before querying (§9).
  let guardianId: string;
  try {
    guardianId = await getAuthUserId(request);
  } catch {
    return Response.json(
      { success: false, error: "Authentication required" } satisfies ApiResponse,
      { status: 401 }
    );
  }

  try {
    const db = await getAdminFirestore();
    const snapshot = await db
      .collection("reminders")
      .where("guardianId", "==", guardianId)
      .where("status", "==", "pending")
      .get();

    // dueAt/sentAt are ISO strings per §6 — normalize Timestamps defensively
    // (same pattern as /api/trees): lib/reminders.ts parses dueAt with
    // new Date(), which returns Invalid Date for Firestore Timestamps.
    const reminders: Reminder[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        guardianId: data.guardianId,
        treeId: data.treeId,
        dueAt:
          data.dueAt instanceof Timestamp
            ? data.dueAt.toDate().toISOString()
            : data.dueAt,
        sentAt:
          data.sentAt instanceof Timestamp
            ? data.sentAt.toDate().toISOString()
            : data.sentAt ?? null,
        status: data.status,
      };
    });

    // Most overdue first
    const dueReminders = getDueReminders(reminders).sort((a, b) =>
      a.dueAt.localeCompare(b.dueAt)
    );

    const res: ApiResponse<Reminder[]> = {
      success: true,
      data: dueReminders,
    };
    return Response.json(res);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch due reminders";
    console.error("[/api/reminders/due] Error:", message);

    const res: ApiResponse = {
      success: false,
      error: message,
    };
    return Response.json(res, { status: 500 });
  }
}
