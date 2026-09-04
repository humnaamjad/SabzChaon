/**
 * One-off migration: convert treeUpdates.submittedAt from ISO strings to
 * Firestore Timestamps.
 *
 * Why: the original seed script wrote submittedAt as an ISO string, while
 * POST /api/trees/[id]/updates writes Timestamp.now(). Firestore orders mixed
 * types by type first (timestamps sort before strings), so every string-typed
 * seeded update ranked ABOVE newly submitted updates in the "submittedAt desc"
 * history query. scripts/seed.ts now seeds Timestamps; this script repairs
 * databases seeded before that fix.
 *
 * Run: npx tsx scripts/migrate-submittedat.ts
 *
 * Prerequisites (same as scripts/seed.ts):
 *   - .env.local must contain valid FIREBASE_ADMIN_* values
 *
 * This script is idempotent — documents whose submittedAt is already a
 * Timestamp are skipped on re-runs.
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local for admin credentials
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// ─── Initialize Admin SDK ────────────────────────────────────────────────────

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
        /\\n/gm,
        "\n"
      ),
    }),
  });
}

const db = getFirestore();

// ─── Migration ───────────────────────────────────────────────────────────────

async function migrate() {
  console.log("🔁 Migrating treeUpdates.submittedAt (ISO string → Timestamp)...\n");

  const snapshot = await db.collection("treeUpdates").get();

  let migrated = 0;
  let skipped = 0;

  for (const doc of snapshot.docs) {
    const value = doc.data().submittedAt;

    // Admin SDK returns Timestamp instances for timestamp fields — only
    // legacy string values need conversion.
    if (typeof value !== "string") {
      skipped++;
      continue;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      console.log(`  ⚠ Skipping ${doc.id}: cannot parse "${value}" as a date`);
      skipped++;
      continue;
    }

    await doc.ref.update({ submittedAt: Timestamp.fromDate(parsed) });
    console.log(`  ✓ ${doc.id}: "${value}" → Timestamp`);
    migrated++;
  }

  console.log(
    `\n✅ Done. Converted ${migrated} document(s), skipped ${skipped} (already Timestamps).`
  );
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });
