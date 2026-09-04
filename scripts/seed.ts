/**
 * Seed script for Firestore (§14 — Seed Data for Demo).
 *
 * Run: npx tsx scripts/seed.ts
 *
 * Prerequisites:
 *   - .env.local must contain valid FIREBASE_ADMIN_* values
 *   - Firestore database must exist (create in Firebase console first)
 *
 * This script is idempotent — it overwrites documents by fixed IDs.
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
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
const auth = getAuth();

// ─── Helper ──────────────────────────────────────────────────────────────────

function iso(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

// TreeUpdate.submittedAt must be a Firestore Timestamp, not an ISO string —
// POST /api/trees/[id]/updates writes Timestamp.now(), and Firestore orders
// mixed types by type first (strings sort after timestamps), which broke the
// "newest first" history ordering. Use scripts/migrate-submittedat.ts to
// repair databases seeded before this fix.
function ts(daysAgo: number): Timestamp {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return Timestamp.fromDate(d);
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

const ngos = [
  {
    id: "ngo-green-pakistan",
    name: "Green Pakistan Foundation",
    description:
      "Leading reforestation efforts across Punjab and Sindh since 2018.",
    contactEmail: "info@greenpakistan.org",
    createdAt: iso(180),
  },
  {
    id: "ngo-clean-air-karachi",
    name: "Clean Air Karachi",
    description:
      "Urban tree planting initiative focused on Karachi's green cover restoration.",
    contactEmail: "contact@cleanairkarachi.org",
    createdAt: iso(120),
  },
];

const campaigns = [
  {
    id: "campaign-monsoon-2026",
    ngoId: "ngo-green-pakistan",
    title: "Monsoon Plantation Drive 2026",
    location: "Lahore, Punjab",
    date: iso(10),
    treesPlannedCount: 500,
    volunteersNeeded: 100,
    status: "active",
    createdAt: iso(60),
  },
  {
    id: "campus-greening-2026",
    ngoId: "ngo-clean-air-karachi",
    title: "Campus Greening Initiative",
    location: "Karachi, Sindh",
    date: iso(-14),
    treesPlannedCount: 200,
    volunteersNeeded: 50,
    status: "upcoming",
    createdAt: iso(30),
  },
  {
    id: "campaign-river-belt-2025",
    ngoId: "ngo-green-pakistan",
    title: "River Belt Restoration",
    location: "Sukkur, Sindh",
    date: iso(120),
    treesPlannedCount: 1000,
    volunteersNeeded: 200,
    status: "completed",
    createdAt: iso(150),
  },
];

const users = [
  // NGO users
  {
    id: "user-ngo-ahmed",
    name: "Ahmed Raza",
    email: "ahmed@greenpakistan.org",
    role: "ngo",
    ngoId: "ngo-green-pakistan",
    createdAt: iso(180),
  },
  {
    id: "user-ngo-fatima",
    name: "Fatima Khan",
    email: "fatima@cleanairkarachi.org",
    role: "ngo",
    ngoId: "ngo-clean-air-karachi",
    createdAt: iso(120),
  },
  // Volunteer users
  {
    id: "user-vol-bilal",
    name: "Bilal Hussain",
    email: "bilal@example.com",
    role: "volunteer",
    ngoId: null,
    createdAt: iso(90),
  },
  {
    id: "user-vol-sara",
    name: "Sara Malik",
    email: "sara@example.com",
    role: "volunteer",
    ngoId: null,
    createdAt: iso(85),
  },
  {
    id: "user-vol-ali",
    name: "Ali Hassan",
    email: "ali@example.com",
    role: "volunteer",
    ngoId: null,
    createdAt: iso(80),
  },
  {
    id: "user-vol-zainab",
    name: "Zainab Noor",
    email: "zainab@example.com",
    role: "volunteer",
    ngoId: null,
    createdAt: iso(75),
  },
  {
    id: "user-vol-hamza",
    name: "Hamza Tariq",
    email: "hamza@example.com",
    role: "volunteer",
    ngoId: null,
    createdAt: iso(60),
  },
];

const trees = [
  // Active campaign trees — some near alert threshold
  {
    id: "SC-2026-000001",
    campaignId: "campaign-monsoon-2026",
    guardianId: "user-vol-bilal",
    species: "Neem",
    plantingDate: iso(10),
    location: "Lahore, Punjab",
    currentStatus: "healthy",
    consecutiveNeedsAttentionCount: 0,
    createdAt: iso(10),
  },
  {
    id: "SC-2026-000002",
    campaignId: "campaign-monsoon-2026",
    guardianId: "user-vol-sara",
    species: "Peepal",
    plantingDate: iso(10),
    location: "Lahore, Punjab",
    currentStatus: "needs_attention",
    consecutiveNeedsAttentionCount: 2, // one more triggers NgoAlert
    createdAt: iso(10),
  },
  {
    id: "SC-2026-000003",
    campaignId: "campaign-monsoon-2026",
    guardianId: "user-vol-ali",
    species: "Banyan",
    plantingDate: iso(10),
    location: "Lahore, Punjab",
    currentStatus: "needs_attention",
    consecutiveNeedsAttentionCount: 2, // near threshold
    createdAt: iso(10),
  },
  {
    id: "SC-2026-000004",
    campaignId: "campaign-monsoon-2026",
    guardianId: "user-vol-zainab",
    species: "Gulmohar",
    plantingDate: iso(10),
    location: "Lahore, Punjab",
    currentStatus: "healthy",
    consecutiveNeedsAttentionCount: 0,
    createdAt: iso(10),
  },
  {
    id: "SC-2026-000005",
    campaignId: "campaign-monsoon-2026",
    guardianId: "user-vol-hamza",
    species: "Amaltas",
    plantingDate: iso(10),
    location: "Lahore, Punjab",
    currentStatus: "healthy",
    consecutiveNeedsAttentionCount: 1,
    createdAt: iso(10),
  },
  // Completed campaign trees
  {
    id: "SC-2025-000001",
    campaignId: "campaign-river-belt-2025",
    guardianId: "user-vol-bilal",
    species: "Eucalyptus",
    plantingDate: iso(120),
    location: "Sukkur, Sindh",
    currentStatus: "healthy",
    consecutiveNeedsAttentionCount: 0,
    createdAt: iso(120),
  },
  {
    id: "SC-2025-000002",
    campaignId: "campaign-river-belt-2025",
    guardianId: "user-vol-sara",
    species: "Kikar",
    plantingDate: iso(120),
    location: "Sukkur, Sindh",
    currentStatus: "needs_attention",
    consecutiveNeedsAttentionCount: 3, // update-009/010/011 → alert-001
    createdAt: iso(120),
  },
  {
    id: "SC-2025-000003",
    campaignId: "campaign-river-belt-2025",
    guardianId: "user-vol-ali",
    species: "Babul",
    plantingDate: iso(120),
    location: "Sukkur, Sindh",
    currentStatus: "unknown",
    consecutiveNeedsAttentionCount: 0,
    createdAt: iso(120),
  },
];

const treeUpdates = [
  // Photos are local, royalty-free demo assets (Wikimedia Commons) so the demo
  // has no external image dependency. Sources/licenses: public/images/seed-photos/ATTRIBUTION.md
  // Updates for SC-2026-000001 (healthy tree)
  {
    id: "update-001",
    treeId: "SC-2026-000001",
    guardianId: "user-vol-bilal",
    photoUrl: "/images/seed-photos/tree-healthy-1.jpg",
    textNote: "Tree is growing well, new leaves visible.",
    aiStatus: "healthy",
    aiCareRecommendation: "Continue regular watering. Tree looks healthy.",
    aiConfidenceNote: "Green foliage clearly visible",
    submittedAt: ts(7),
  },
  {
    id: "update-002",
    treeId: "SC-2026-000001",
    guardianId: "user-vol-bilal",
    photoUrl: "/images/seed-photos/tree-healthy-2.jpg",
    textNote: "Weekly check-in, looking good.",
    aiStatus: "healthy",
    aiCareRecommendation: "No action needed. Keep up the good work.",
    aiConfidenceNote: "Full canopy, healthy green color",
    submittedAt: ts(3),
  },
  // Updates for SC-2026-000002 (needs attention, count=2)
  {
    id: "update-003",
    treeId: "SC-2026-000002",
    guardianId: "user-vol-sara",
    photoUrl: "/images/seed-photos/tree-yellowed-1.jpg",
    textNote: "Leaves look a bit yellow.",
    aiStatus: "needs_attention",
    aiCareRecommendation:
      "Yellowing leaves may indicate overwatering or nutrient deficiency. Reduce watering frequency.",
    aiConfidenceNote: "Yellowing visible on lower leaves",
    submittedAt: ts(7),
  },
  {
    id: "update-004",
    treeId: "SC-2026-000002",
    guardianId: "user-vol-sara",
    photoUrl: "/images/seed-photos/tree-yellowed-2.jpg",
    textNote: "Still yellowing, some leaves dropping.",
    aiStatus: "needs_attention",
    aiCareRecommendation:
      "Persistent yellowing suggests possible root issues. Check soil drainage.",
    aiConfidenceNote: "Leaf discoloration and drop visible",
    submittedAt: ts(3),
  },
  // Updates for SC-2026-000003 (needs attention, count=2)
  {
    id: "update-005",
    treeId: "SC-2026-000003",
    guardianId: "user-vol-ali",
    photoUrl: "/images/seed-photos/tree-diseased-1.jpg",
    textNote: "Some brown spots on leaves.",
    aiStatus: "needs_attention",
    aiCareRecommendation:
      "Brown spots may indicate fungal infection. Consider improving air circulation.",
    aiConfidenceNote: "Brown spots visible on leaf surfaces",
    submittedAt: ts(6),
  },
  {
    id: "update-006",
    treeId: "SC-2026-000003",
    guardianId: "user-vol-ali",
    photoUrl: "/images/seed-photos/tree-diseased-2.jpg",
    textNote: "Spots spreading.",
    aiStatus: "needs_attention",
    aiCareRecommendation:
      "Spreading discoloration is concerning. Prune affected branches if possible.",
    aiConfidenceNote: "Increased brown area compared to typical patterns",
    submittedAt: ts(2),
  },
  // Update for SC-2026-000004 (healthy)
  {
    id: "update-007",
    treeId: "SC-2026-000004",
    guardianId: "user-vol-zainab",
    photoUrl: "/images/seed-photos/tree-flowering-1.jpg",
    textNote: "Beautiful growth, first flowers appearing!",
    aiStatus: "healthy",
    aiCareRecommendation: "Excellent condition. Maintain current care routine.",
    aiConfidenceNote: "Vibrant green color and new growth visible",
    submittedAt: ts(4),
  },
  // Update for SC-2026-000005 (healthy but had one needs_attention)
  {
    id: "update-008",
    treeId: "SC-2026-000005",
    guardianId: "user-vol-hamza",
    photoUrl: "/images/seed-photos/tree-flowering-2.jpg",
    textNote: "Was wilting last week but recovering now.",
    aiStatus: "healthy",
    aiCareRecommendation:
      "Recovery signs visible. Continue regular watering schedule.",
    aiConfidenceNote: "New leaf growth visible alongside older healthy leaves",
    submittedAt: ts(5),
  },
  // Updates for completed campaign tree with alert
  {
    id: "update-009",
    treeId: "SC-2025-000002",
    guardianId: "user-vol-sara",
    photoUrl: "/images/seed-photos/tree-dry-1.jpg",
    textNote: "Tree looks dry.",
    aiStatus: "needs_attention",
    aiCareRecommendation: "Tree shows signs of drought stress. Increase watering.",
    aiConfidenceNote: "Wilted and dry leaves visible",
    submittedAt: ts(60),
  },
  {
    id: "update-010",
    treeId: "SC-2025-000002",
    guardianId: "user-vol-sara",
    photoUrl: "/images/seed-photos/tree-dry-2.jpg",
    textNote: "Still dry despite watering.",
    aiStatus: "needs_attention",
    aiCareRecommendation:
      "Persistent dryness may indicate root damage. Professional inspection recommended.",
    aiConfidenceNote: "Continued wilting despite reported watering",
    submittedAt: ts(45),
  },
  {
    // 3rd consecutive needs_attention — this is the check-in that fires
    // alert-001, so the tree's seeded count of 3 is backed by real history.
    id: "update-011",
    treeId: "SC-2025-000002",
    guardianId: "user-vol-sara",
    photoUrl: "/images/seed-photos/tree-dry-2.jpg",
    textNote: "No improvement — leaves are drying out further.",
    aiStatus: "needs_attention",
    aiCareRecommendation:
      "Severe drought stress. Arrange professional inspection urgently.",
    aiConfidenceNote: "Widespread leaf desiccation and drooping canopy",
    submittedAt: ts(30),
  },
];

// ─── NGO Alerts (§12) ────────────────────────────────────────────────────────

const ngoAlerts = [
  {
    // Fires on the 3rd consecutive needs_attention update (update-011,
    // 30 days ago) — keeps counter (3), update history, and alert in sync.
    id: "alert-001",
    ngoId: "ngo-green-pakistan",
    treeId: "SC-2025-000002",
    reason: "3 consecutive needs_attention updates",
    createdAt: iso(30),
    resolvedAt: null,
  },
];

// ─── Campaign Memberships ────────────────────────────────────────────────────

const campaignMemberships = [
  {
    id: "membership-001",
    campaignId: "campaign-monsoon-2026",
    userId: "user-vol-bilal",
    joinedAt: iso(9),
    becameGuardian: true,
  },
  {
    id: "membership-002",
    campaignId: "campaign-monsoon-2026",
    userId: "user-vol-sara",
    joinedAt: iso(9),
    becameGuardian: true,
  },
  {
    id: "membership-003",
    campaignId: "campaign-monsoon-2026",
    userId: "user-vol-ali",
    joinedAt: iso(8),
    becameGuardian: true,
  },
  {
    id: "membership-004",
    campaignId: "campaign-monsoon-2026",
    userId: "user-vol-zainab",
    joinedAt: iso(8),
    becameGuardian: true,
  },
  {
    id: "membership-005",
    campaignId: "campus-greening-2026",
    userId: "user-vol-hamza",
    joinedAt: iso(5),
    becameGuardian: false,
  },
];

// ─── Guardian Avatars (§11 — varied growth stages for demo) ─────────────────

const guardianAvatars = [
  {
    id: "user-vol-bilal",
    guardianId: "user-vol-bilal",
    growthStage: "sapling",
    lastUpdatedAt: iso(3),
    missedUpdateStreak: 0,
  },
  {
    id: "user-vol-sara",
    guardianId: "user-vol-sara",
    growthStage: "sprout",
    lastUpdatedAt: iso(3),
    missedUpdateStreak: 1,
  },
  {
    id: "user-vol-ali",
    guardianId: "user-vol-ali",
    growthStage: "young_tree",
    lastUpdatedAt: iso(2),
    missedUpdateStreak: 0,
  },
  {
    id: "user-vol-zainab",
    guardianId: "user-vol-zainab",
    growthStage: "seedling",
    lastUpdatedAt: iso(4),
    missedUpdateStreak: 0,
  },
  {
    id: "user-vol-hamza",
    guardianId: "user-vol-hamza",
    growthStage: "sprout",
    lastUpdatedAt: iso(5),
    missedUpdateStreak: 0,
  },
];

// ─── Reminders (§6, §19 Part 4 — Feature 6) ──────────────────────────────────
// Unlike TreeUpdate.submittedAt above, dueAt stays an ISO string: the only
// writer is this seed script, and lib/reminders.ts parses it with new Date(),
// which would produce Invalid Date for a Firestore Timestamp. The due route
// filters in JS (no orderBy/range query on dueAt), so mixed-type ordering is
// not a concern — but every writer must stay on ISO strings regardless.

const reminders = [
  {
    id: "reminder-001",
    guardianId: "user-vol-sara",
    treeId: "SC-2026-000002",
    dueAt: iso(1), // yesterday — due now
    sentAt: null,
    status: "pending",
  },
  {
    id: "reminder-002",
    guardianId: "user-vol-sara",
    treeId: "SC-2025-000002",
    dueAt: iso(3), // 3 days ago — due now (demos the multi-reminder banner)
    sentAt: null,
    status: "pending",
  },
  {
    id: "reminder-003",
    guardianId: "user-vol-bilal",
    treeId: "SC-2026-000001",
    dueAt: iso(-6), // 6 days from now — not due yet (no banner)
    sentAt: null,
    status: "pending",
  },
  {
    id: "reminder-004",
    guardianId: "user-vol-ali",
    treeId: "SC-2026-000003",
    dueAt: iso(2),
    sentAt: iso(2),
    status: "sent", // sent but not acknowledged — filtered out by status
  },
];

// ─── Seed Function ───────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Seeding Firestore with demo data...\n");

  const collections: { name: string; docs: { id: string; [key: string]: unknown }[] }[] = [
    { name: "ngos", docs: ngos },
    { name: "campaigns", docs: campaigns },
    { name: "users", docs: users },
    { name: "trees", docs: trees },
    { name: "treeUpdates", docs: treeUpdates },
    { name: "ngoAlerts", docs: ngoAlerts },
    { name: "campaignMemberships", docs: campaignMemberships },
    { name: "guardianAvatars", docs: guardianAvatars },
    { name: "reminders", docs: reminders },
  ];

  for (const collection of collections) {
    console.log(`  Seeding ${collection.name} (${collection.docs.length} docs)...`);
    const batch = db.batch();
    for (const doc of collection.docs) {
      const { id, ...data } = doc;
      const ref = db.collection(collection.name).doc(id);
      batch.set(ref, data);
    }
    await batch.commit();
    console.log(`  ✓ ${collection.name} done`);
  }

  // ─── Create Firebase Auth accounts (idempotent) ─────────────────────────
  console.log("  Creating Auth accounts...");
  for (const u of users) {
    try {
      await auth.createUser({
        uid: u.id,
        email: u.email,
        password: "demo1234",
      });
      console.log(`    ✓ Created auth account: ${u.email}`);
    } catch (err: unknown) {
      // uid-already-exists is expected on re-runs
      if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "auth/uid-already-exists") {
        console.log(`    • Auth account already exists: ${u.email}`);
      } else if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "auth/email-already-exists") {
        console.log(`    • Email already exists: ${u.email}`);
      } else {
        throw err;
      }
    }
  }

  console.log("\n✅ Seed complete! Firestore is ready for development.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
