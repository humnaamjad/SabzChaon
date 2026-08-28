// Next.js 16 proxy (formerly middleware).
// Lightweight first-line route protection for protected route groups.
// Checks for a session cookie set by the client-side AuthProvider.
// Real auth verification happens in ProtectedRoute and lib/auth.ts.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/(ngo)", "/(volunteer)"];
const AUTH_PAGE = "/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip non-page requests (static assets, API routes, etc.)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if the route is protected
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected) {
    const sessionCookie = request.cookies.get("__session");
    if (!sessionCookie?.value) {
      const loginUrl = new URL(AUTH_PAGE, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth page
  if (pathname === AUTH_PAGE) {
    const sessionCookie = request.cookies.get("__session");
    if (sessionCookie?.value) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run proxy on all page routes, skip static files and API routes
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
