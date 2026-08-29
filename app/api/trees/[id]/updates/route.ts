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
// AI analysis (§10) is NOT called here — that's Part 4's responsibility.
// The TreeUpdate is created with aiStatus = "unknown" as a placeholder.
// Part 4 should wire in the analyzeTreePhoto call after creation.
//
// Response shape per §9: { success: boolean, data?: ..., error?: string }

import type { NextRequest } from "next/server";
import { getAdminFirestore } from "@/lib/firebase";
import { getAuthUserId } from "@/lib/serverAuth";
import { uploadTreePhoto } from "@/lib/storage/uploadTreePhoto";
import { Timestamp } from "firebase-admin/firestore";
import type { TreeUpdate, ApiResponse } from "@/types/entities";

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

    // Upload photo to Supabase Storage if provided (§10.0)
    let photoUrl: string | null = null;
    if (photoFile && photoFile.size > 0) {
      photoUrl = await uploadTreePhoto(photoFile, treeId);
    }

    // Generate a unique update ID
    const updateRef = db.collection("treeUpdates").doc();
    const now = Timestamp.now();

    const updateData = {
      treeId,
      guardianId: userId,
      photoUrl,
      textNote: textNote || null,
      aiStatus: "unknown" as const,
      aiCareRecommendation: "",
      aiConfidenceNote: "",
      submittedAt: now,
    };

    await updateRef.set(updateData);

    // ─── PART 4 FLAG ──────────────────────────────────────────────────────
    // After this TreeUpdate is created, Part 4's analyzeTreePhoto should be
    // called with the photoUrl (if present) to update aiStatus,
    // aiCareRecommendation, and aiConfidenceNote on this document.
    // The tree's currentStatus and consecutiveNeedsAttentionCount should
    // also be updated based on the AI result.
    // ─── END FLAG ─────────────────────────────────────────────────────────

    // Update the tree's status to "unknown" until AI analysis runs
    await db.collection("trees").doc(treeId).update({
      currentStatus: "unknown",
    });

    const createdUpdate: TreeUpdate = {
      id: updateRef.id,
      ...updateData,
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
