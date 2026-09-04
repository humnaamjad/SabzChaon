// GET  /api/trees/[id]/updates — list all updates for a tree (append-only history).
// POST /api/trees/[id]/updates — create a new tree update (photo upload + optional note).
//
// POST accepts multipart/form-data with fields:
//   - photo: File (optional, image file for Supabase Storage upload per §10.0)
//   - note: string (optional text note)
//   At least one of photo/note is required.
//
// The photo is uploaded to Supabase Storage using the existing uploadTreePhoto
// utility (lib/storage/uploadTreePhoto.ts — do not rewrite). The returned public
// URL is saved as photoUrl on the TreeUpdate document.
//
// AI analysis (§10) and avatar gamification (§11) are wired into the POST
// handler. The TreeUpdate is written with AI results immediately after creation.
//
// Response shape per §9: { success: boolean, data?: ..., error?: string }

import type { NextRequest } from "next/server";
import { getAdminFirestore } from "@/lib/firebase";
import { getAuthUserId } from "@/lib/serverAuth";
import { uploadTreePhoto } from "@/lib/storage/uploadTreePhoto";
import { Timestamp } from "firebase-admin/firestore";
import type { TreeUpdate, ApiResponse, AiStatus, GuardianAvatar } from "@/types/entities";
import { processTreeUpdate } from "@/lib/updateProcessor";
import { checkAndTriggerAlert } from "@/lib/alerts";

export const dynamic = "force-dynamic";

// ─── GET: list updates for a tree ────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/trees/[id]/updates">
) {
  try {
    const { id: treeId } = await ctx.params;
    const db = await getAdminFirestore();

    const snapshot = await db
      .collection("treeUpdates")
      .where("treeId", "==", treeId)
      .orderBy("submittedAt", "desc")
      .get();

    const updates: TreeUpdate[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      updates.push({
        id: doc.id,
        treeId: data.treeId,
        guardianId: data.guardianId,
        photoUrl: data.photoUrl ?? null,
        textNote: data.textNote ?? null,
        aiStatus: data.aiStatus,
        aiCareRecommendation: data.aiCareRecommendation,
        aiConfidenceNote: data.aiConfidenceNote,
        submittedAt:
          data.submittedAt instanceof Timestamp
            ? data.submittedAt.toDate().toISOString()
            : data.submittedAt,
      });
    });

    return Response.json(
      { success: true, data: updates } satisfies ApiResponse<TreeUpdate[]>
    );
  } catch (err) {
    console.error(
      `GET /api/trees/${(await ctx.params).id}/updates error:`,
      err
    );
    return Response.json(
      {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to fetch tree updates",
      } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

// ─── POST: create a new tree update ──────────────────────────────────────────

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/trees/[id]/updates">
) {
  try {
    const { id: treeId } = await ctx.params;
    const userId = await getAuthUserId(request);
    const formData = await request.formData();

    const photoFile = formData.get("photo") as File | null;
    const textNote = formData.get("note") as string | null;

    // At least one of photo/text is required per §6 TreeUpdate schema
    if (!photoFile && !textNote) {
      return Response.json(
        {
          success: false,
          error: "At least one of photo or text note is required",
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const db = await getAdminFirestore();

    // Verify the tree exists
    const treeDoc = await db.collection("trees").doc(treeId).get();
    if (!treeDoc.exists) {
      return Response.json(
        { success: false, error: "Tree not found" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    // Ownership check — only the assigned guardian may submit updates
    const treeData = treeDoc.data()!;
    if (treeData.guardianId !== userId) {
      return Response.json(
        { success: false, error: "Forbidden: you are not the guardian of this tree" } satisfies ApiResponse,
        { status: 403 }
      );
    }

    // Upload photo to Supabase Storage if provided (§10.0)
    let photoUrl: string | null = null;
    if (photoFile && photoFile.size > 0) {
      photoUrl = await uploadTreePhoto(photoFile, treeId);
    }

    // Create TreeUpdate with placeholder AI values
    const updateRef = db.collection("treeUpdates").doc();
    const now = Timestamp.now();

    let aiStatus: AiStatus = "unknown";
    let aiCareRecommendation = "";
    let aiConfidenceNote = "";

    // Write the placeholder document first
    await updateRef.set({
      treeId,
      guardianId: userId,
      photoUrl,
      textNote: textNote || null,
      aiStatus,
      aiCareRecommendation,
      aiConfidenceNote,
      submittedAt: now,
    });

    // Run AI analysis + gamification when a photo is available
    if (photoUrl) {
      // Read guardian's current avatar (or use seedling defaults)
      const avatarDoc = await db
        .collection("guardianAvatars")
        .doc(userId)
        .get();

      const currentAvatar: GuardianAvatar = avatarDoc.exists
        ? ({ id: avatarDoc.id, ...avatarDoc.data() } as GuardianAvatar)
        : {
            id: userId,
            guardianId: userId,
            growthStage: "seedling" as const,
            lastUpdatedAt: new Date().toISOString(),
            missedUpdateStreak: 0,
          };

      const result = await processTreeUpdate({
        photoUrl,
        textNote: textNote || undefined,
        currentAvatar,
      });

      aiStatus = result.aiStatus;
      aiCareRecommendation = result.aiCareRecommendation;
      aiConfidenceNote = result.aiConfidenceNote ?? "";

      // Patch the TreeUpdate with real AI results
      await updateRef.update({
        aiStatus,
        aiCareRecommendation,
        aiConfidenceNote,
      });

      // Upsert the updated avatar back to guardianAvatars/{guardianId}
      await db
        .collection("guardianAvatars")
        .doc(userId)
        .set(result.updatedAvatar);

      // Alert logic — only meaningful for known health statuses.
      // checkAndTriggerAlert also updates Tree.currentStatus and
      // Tree.consecutiveNeedsAttentionCount, so no separate write needed.
      if (aiStatus !== "unknown") {
        await checkAndTriggerAlert(treeId, aiStatus);
      } else {
        // AI failed — mark tree status as unknown without touching alert counters
        await db.collection("trees").doc(treeId).update({
          currentStatus: "unknown",
        });
      }
    } else {
      // No photo — tree status stays unknown until analysis can run
      await db.collection("trees").doc(treeId).update({
        currentStatus: "unknown",
      });
    }

    // Acknowledge any pending reminders for this tree + guardian so
    // DueRemindersBanner stops surfacing them after a check-in.
    try {
      const pendingReminders = await db
        .collection("reminders")
        .where("treeId", "==", treeId)
        .where("guardianId", "==", userId)
        .where("status", "==", "pending")
        .get();

      if (pendingReminders.size > 0) {
        const ackBatch = db.batch();
        pendingReminders.forEach((doc) => {
          ackBatch.update(doc.ref, { status: "acknowledged" });
        });
        await ackBatch.commit();
      }
    } catch (reminderErr) {
      // Non-fatal — the update itself succeeded; log and continue.
      console.error("[POST /api/trees/[id]/updates] Failed to acknowledge reminders:", reminderErr);
    }

    const createdUpdate: TreeUpdate = {
      id: updateRef.id,
      treeId,
      guardianId: userId,
      photoUrl,
      textNote: textNote || null,
      aiStatus,
      aiCareRecommendation,
      aiConfidenceNote,
      submittedAt: now.toDate().toISOString(),
    };

    return Response.json(
      { success: true, data: createdUpdate } satisfies ApiResponse<TreeUpdate>,
      { status: 201 }
    );
  } catch (err) {
    console.error(
      `POST /api/trees/${(await ctx.params).id}/updates error:`,
      err
    );
    return Response.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to create tree update",
      } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
