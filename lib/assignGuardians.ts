// ─── assignGuardians ─────────────────────────────────────────────────────────
// Standalone utility for the guardian-assignment flow (§19 Part 3).
//
// HOW TO USE (for Part 2 — campaign closeout route):
//   In app/api/campaigns/[id]/route.ts, inside the PATCH handler,
//   after the campaign status is updated to "completed", add:
//
//     import { assignGuardians } from "@/lib/assignGuardians";
//     ...
//     const result = await assignGuardians(id);
//
//   That's it — one line. The function handles everything:
//   querying memberships, creating Tree records, and marking
//   CampaignMembership.becameGuardian = true.
//
// WHAT IT DOES:
//   1. Fetches the campaign to get plantingDate and location.
//   2. Queries CampaignMembership records where campaignId matches
//      and becameGuardian is not yet true (avoids double-assignment).
//   3. For each eligible membership, creates a Tree document (using
//      generateNextTreeId for the SC-{year}-{counter} format) and
//      sets becameGuardian = true on the membership.
//   4. Each assignment is individually try/caught so one failure
//      doesn't block the rest.
//
// ASSUMPTIONS (Tree field defaults):
//   - species: defaults to "Unknown" (campaign doesn't carry species info).
//   - plantingDate: taken from campaign.date.
//   - location: taken from campaign.location.
//   - currentStatus: "unknown" (no health data at creation time).
//   - consecutiveNeedsAttentionCount: 0 (fresh tree, no updates yet).
// ─────────────────────────────────────────────────────────────────────────────

import { getAdminFirestore } from "@/lib/firebase";
import { generateNextTreeId } from "@/lib/generateTreeId";
import { Timestamp } from "firebase-admin/firestore";

export interface AssignGuardiansResult {
  treesCreated: number;
  errors: string[];
}

/**
 * Creates Tree records for all eligible volunteers in a campaign and
 * marks their CampaignMembership.becameGuardian = true.
 *
 * Safe to call multiple times — memberships already flagged as guardians
 * are skipped.
 *
 * @param campaignId - The Firestore document ID of the campaign being closed.
 * @returns Summary of how many trees were created and any per-volunteer errors.
 */
export async function assignGuardians(
  campaignId: string
): Promise<AssignGuardiansResult> {
  const db = await getAdminFirestore();
  const errors: string[] = [];

  // 1. Fetch the campaign for plantingDate and location
  const campaignDoc = await db.collection("campaigns").doc(campaignId).get();
  if (!campaignDoc.exists) {
    return {
      treesCreated: 0,
      errors: [`Campaign ${campaignId} not found — cannot assign guardians.`],
    };
  }

  const campaignData = campaignDoc.data()!;
  const plantingDate: string = campaignData.date;
  const location: string = campaignData.location;

  // 2. Query memberships that haven't been assigned as guardians yet
  const membershipsSnap = await db
    .collection("campaignMemberships")
    .where("campaignId", "==", campaignId)
    .where("becameGuardian", "==", false)
    .get();

  if (membershipsSnap.empty) {
    return { treesCreated: 0, errors: [] };
  }

  // 3. Assign each volunteer individually
  let count = 0;

  for (const membershipDoc of membershipsSnap.docs) {
    const membership = membershipDoc.data();
    const userId: string = membership.userId;

    try {
      const treeId = await generateNextTreeId(plantingDate);

      // Create Tree document (§6 schema)
      const treeData = {
        campaignId,
        guardianId: userId,
        species: "Unknown",
        plantingDate,
        location,
        currentStatus: "unknown" as const,
        consecutiveNeedsAttentionCount: 0,
        createdAt: Timestamp.now(),
      };

      await db.collection("trees").doc(treeId).set(treeData);

      // Mark the membership as guardian
      await membershipDoc.ref.update({ becameGuardian: true });

      count++;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error";
      errors.push(
        `Failed to assign guardian for userId=${userId}: ${message}`
      );
    }
  }

  return { treesCreated: count, errors };
}