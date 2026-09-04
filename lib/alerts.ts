// Alert-triggering logic per §12.
// Called after a TreeUpdate is written (by Part 4's analyze-tree-photo flow).
// Increments/resets Tree.consecutiveNeedsAttentionCount, creates an
// NgoAlert when the count reaches 3 (if no open alert already exists),
// and auto-resolves any open alert after a healthy check-in.

import { getAdminFirestore } from "@/lib/firebase";

const ALERT_THRESHOLD = 3;

/**
 * Checks a tree's consecutive needs-attention count after a new AI status,
 * updates the count on the Tree document, and creates an NgoAlert if the
 * threshold is reached.
 *
 * @param treeId - The tree document ID.
 * @param aiStatus - The AI status from the new TreeUpdate.
 * @returns The alert ID if a new alert was created, otherwise null.
 */
export async function checkAndTriggerAlert(
  treeId: string,
  aiStatus: "healthy" | "needs_attention"
): Promise<string | null> {
  const db = await getAdminFirestore();
  const treeRef = db.collection("trees").doc(treeId);
  const treeDoc = await treeRef.get();

  if (!treeDoc.exists) return null;

  const treeData = treeDoc.data()!;
  const currentCount: number = treeData.consecutiveNeedsAttentionCount ?? 0;
  const newCount =
    aiStatus === "needs_attention" ? currentCount + 1 : 0;

  // Update the tree's consecutive count + current status
  await treeRef.update({
    consecutiveNeedsAttentionCount: newCount,
    currentStatus:
      aiStatus === "needs_attention" ? "needs_attention" : "healthy",
  });

  // Healthy check-in — the recovery resets the sequence AND auto-resolves
  // any open alert for this tree so NGOs stop seeing it as active.
  // Resolution is strictly limited to this healthy branch: it never runs
  // on needs_attention or unknown updates.
  if (aiStatus === "healthy") {
    try {
      const openAlerts = await db
        .collection("ngoAlerts")
        .where("treeId", "==", treeId)
        .where("resolvedAt", "==", null)
        .get();
      if (!openAlerts.empty) {
        const resolvedAt = new Date().toISOString();
        const batch = db.batch();
        openAlerts.forEach((doc) => batch.update(doc.ref, { resolvedAt }));
        await batch.commit();
      }
    } catch (resolveErr) {
      console.error(
        "[checkAndTriggerAlert] Failed to resolve open alerts after healthy update:",
        resolveErr
      );
    }
    return null;
  }

  // needs_attention — only trigger alert when we've hit the threshold
  if (newCount < ALERT_THRESHOLD) return null;

  // Alert creation must never interfere with the counter/status reset above —
  // that write is already committed, so failures here are logged and
  // swallowed instead of surfacing as a 500 to the guardian.
  try {
    // Look up which NGO owns this tree (via its campaign)
    const campaignDoc = await db
      .collection("campaigns")
      .doc(treeData.campaignId)
      .get();
    if (!campaignDoc.exists) return null;

    const ngoId: string = campaignDoc.data()!.ngoId;

    // Check if there's already an unresolved alert for this tree
    const existingAlerts = await db
      .collection("ngoAlerts")
      .where("treeId", "==", treeId)
      .where("ngoId", "==", ngoId)
      .where("resolvedAt", "==", null)
      .limit(1)
      .get();

    if (!existingAlerts.empty) return existingAlerts.docs[0].id;

    // Create a new alert
    const alertRef = db.collection("ngoAlerts").doc();
    await alertRef.set({
      id: alertRef.id,
      ngoId,
      treeId,
      reason: `${ALERT_THRESHOLD} consecutive needs_attention updates`,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    });

    return alertRef.id;
  } catch (alertErr) {
    console.error(
      "[checkAndTriggerAlert] Alert creation failed (tree counter/status already updated):",
      alertErr
    );
    return null;
  }
}
