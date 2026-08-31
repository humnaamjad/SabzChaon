// Home page — redirects authenticated users to their role-based dashboard.
// Unauthenticated users see a simple landing with a link to /auth.

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/shared/AuthProvider";
import { TreePine } from "lucide-react";
import Link from "next/link";
import LoadingState from "@/components/shared/LoadingState";

export default function Home() {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user && userDoc) {
      router.replace(
        userDoc.role === "ngo" ? "/dashboard" : "/browse-campaigns"
      );
    }
  }, [user, userDoc, loading, router]);

  if (loading) {
    return <LoadingState />;
  }

  // If authenticated, we're redirecting — show loading
  if (user && userDoc) {
    return <LoadingState message="Redirecting to your dashboard…" />;
  }

  // Unauthenticated landing
  return (
    <div className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center bg-cream px-4">
      <div className="max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <TreePine className="h-16 w-16 text-forest" />
        </div>
        <h1 className="text-4xl font-semibold text-inktext">Sabz Chaon</h1>
        <p className="mt-3 text-lg text-warmgray-text">
          Turning &ldquo;trees planted&rdquo; into &ldquo;trees that survive.&rdquo;
        </p>
        <p className="mt-2 text-sm text-warmgray-text">
          NGOs run plantation campaigns. Volunteers become tree guardians.
          AI monitors tree health.
        </p>
        <Link
          href="/auth"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-forest px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-forest-hover"
        >
          <TreePine className="h-4 w-4" />
          Get Started
        </Link>
      </div>
    </div>
  );
}
