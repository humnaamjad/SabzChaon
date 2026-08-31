// Generates unique Tree IDs in the canonical format: SC-{year}-{counter}
// e.g. SC-2026-000123 (§6 of the project context document).
// Counter is zero-padded to 6 digits and monotonically increasing.

import { getAdminFirestore } from "@/lib/firebase";

/**
 * Queries all existing Tree documents, finds the highest counter,
 * and returns the next sequential Tree ID.
 *
 * @param plantingDate - ISO date string used to extract the year segment.
 * @returns A unique Tree ID string like "SC-2026-000124".
 */
export async function generateNextTreeId(plantingDate: string): Promise<string> {
  const year = new Date(plantingDate).getFullYear();
  const prefix = `SC-${year}-`;

  const db = await getAdminFirestore();
  const snapshot = await db.collection("trees").get();

  let maxCounter = 0;
  snapshot.forEach((doc) => {
    const id = doc.id;
    if (id.startsWith(prefix)) {
      const counter = parseInt(id.slice(prefix.length), 10);
      if (!isNaN(counter) && counter > maxCounter) {
        maxCounter = counter;
      }
    }
  });

  return `${prefix}${String(maxCounter + 1).padStart(6, "0")}`;
}
