// Server-side auth helper for Part 3 API routes.
// Reads Firebase ID token from the Authorization header and verifies it
// using the Firebase Admin SDK. Returns the authenticated user's UID.
//
// NOTE: Part 1 owns the full auth infrastructure. This is a minimal helper
// scoped to Part 3's API routes for server-side role checks per §9.

import { getAdminAuth } from "@/lib/firebase";

/**
 * Extracts and verifies the Firebase ID token from the request's
 * Authorization header (Bearer token). Returns the user's UID.
 *
 * @throws If the token is missing or invalid.
 */
export async function getAuthUserId(request: Request): Promise<string> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const token = authHeader.slice(7);
  const adminAuth = await getAdminAuth();
  const decoded = await adminAuth.verifyIdToken(token);
  return decoded.uid;
}
