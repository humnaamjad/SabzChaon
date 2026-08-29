// Server-side authentication helper for API routes (§9).
// Verifies Firebase ID tokens and returns user session info.
// Usage in API routes:
//   const session = await verifyRequestAuth(request);
//   if (session.role !== "ngo") return unauthorized response;

import { type User, type UserRole } from "@/types/entities";

export interface AuthSession {
  uid: string;
  role: UserRole;
  ngoId: string | null;
}

/**
 * Verifies the Firebase ID token from the Authorization header
 * and fetches the user document from Firestore to return role info.
 */
export async function verifyRequestAuth(
  request: Request
): Promise<AuthSession | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  if (!token) return null;

  try {
    const { getAdminAuth } = await import("@/lib/firebase");
    const adminAuth = await getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(token);

    const { getAdminFirestore } = await import("@/lib/firebase");
    const db = await getAdminFirestore();
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      console.error(`[auth] User doc not found for uid: ${decodedToken.uid}`);
      return null;
    }

    const userData = userDoc.data() as User;
    if (!userData.role) {
      console.error(`[auth] User ${decodedToken.uid} has no role field in Firestore doc`);
      return null;
    }

    return {
      uid: decodedToken.uid,
      role: userData.role,
      ngoId: userData.ngoId ?? null,
    };
  } catch (err) {
    console.error("[auth] verifyRequestAuth failed:", err);
    return null;
  }
}

/**
 * Helper to get the Authorization header value for passing the Firebase ID token.
 * Call from client-side code: `await user.getIdToken()` then pass to this.
 */
export function getAuthHeader(idToken: string): HeadersInit {
  return { Authorization: `Bearer ${idToken}` };
}

/**
 * Requires a specific role. Returns null if the session doesn't match.
 */
export async function requireRole(
  request: Request,
  requiredRole: UserRole
): Promise<AuthSession | null> {
  const session = await verifyRequestAuth(request);
  if (!session || session.role !== requiredRole) return null;
  return session;
}
