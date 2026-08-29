// Firebase client + admin SDK initialization.
// Client SDK uses NEXT_PUBLIC_ env vars (safe for browser).
// Admin SDK uses server-only env vars (never exposed to browser).
// Firebase is used for Firestore + Auth only — Storage is on Supabase (§7).

// ─── Server-side Firebase Admin ──────────────────────────────────────────────
// Only import this in server-side code (API routes, server components).
// firebase-admin v14+ uses modular sub-package imports.

async function ensureAdminApp() {
  const { getApps, initializeApp, cert } = await import("firebase-admin/app");

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
}

export async function getAdminFirestore() {
  await ensureAdminApp();
  const { getFirestore } = await import("firebase-admin/firestore");
  return getFirestore();
}

export async function getAdminAuth() {
  await ensureAdminApp();
  const { getAuth } = await import("firebase-admin/auth");
  return getAuth();
}
