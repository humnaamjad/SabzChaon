// Client-side protected route wrapper.
// Wraps protected route group layouts to ensure only authenticated users
// with the correct role can access them.
// Redirects to /auth if unauthenticated, or to home if role doesn't match.

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/shared/AuthProvider";
import type { UserRole } from "@/types/entities";
import LoadingState from "@/components/shared/LoadingState";

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole: UserRole;
}) {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth");
      return;
    }

    if (userDoc && userDoc.role !== requiredRole) {
      // Wrong role — redirect to appropriate home
      router.replace(
        userDoc.role === "ngo" ? "/(ngo)/dashboard" : "/(volunteer)/campaigns"
      );
    }
  }, [user, userDoc, loading, requiredRole, router]);

  if (loading) {
    return <LoadingState message="Checking authentication…" />;
  }

  if (!user) {
    return <LoadingState message="Redirecting to login…" />;
  }

  if (userDoc && userDoc.role !== requiredRole) {
    return <LoadingState message="Redirecting…" />;
  }

  return <>{children}</>;
}
