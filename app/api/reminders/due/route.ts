import { getAdminFirestore } from "@/lib/firebase";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { getDueReminders } from "@/lib/reminders";
import type { ApiResponse, Reminder } from "@/types/entities";

export async function GET() {
  try {
    const db = await getAdminFirestore();
    const snapshot = await db
      .collection("reminders")
      .where("status", "==", "pending")
      .get();

    const reminders: Reminder[] = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...(doc.data() as Omit<Reminder, "id">),
    }));

    const dueReminders = getDueReminders(reminders);

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
