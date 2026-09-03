// Home page — redirects authenticated users to their role-based dashboard.
// Unauthenticated users see an engaging branded landing page.

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/shared/AuthProvider";
import {
  TreePine,
  Sprout,
  Shield,
  Camera,
  Brain,
  TrendingUp,
  Bell,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
    <div className="relative min-h-[calc(100vh-60px)] bg-cream">
      {/* ── Watercolor Botanical Background ───────────────────────────────── */}
      {/*
       * Real watercolor leaf PNG layered behind all content.
       * pointer-events-none + lower z-index keeps it decorative only.
       */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <Image
          src="/images/watercolor-leaves.png"
          alt=""
          fill
          priority
          className="object-cover opacity-85"
          sizes="100vw"
        />
      </div>

      {/* Hero Section */}
      <section className="relative z-50 overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-16 sm:pt-24 sm:pb-24">
          <div className="text-center">
            {/* Brand icon */}
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-forest shadow-lg shadow-forest/20">
              <TreePine className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-inktext sm:text-5xl lg:text-6xl">
              Sabz Chaon
            </h1>
            <p className="mt-2 text-lg font-medium text-forest sm:text-xl">
              Green Shade
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-warmgray-text">
              Turning &ldquo;trees planted&rdquo; into &ldquo;trees that survive.&rdquo;
            </p>
            <p className="mx-auto mt-2 max-w-xl text-base text-warmgray-text">
              NGOs run plantation campaigns. Volunteers become tree Guardians.
              AI monitors tree health. Together, we ensure every planted tree thrives.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 rounded-xl bg-forest px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-forest/20 transition-all duration-200 hover:bg-forest-hover hover:shadow-xl hover:shadow-forest/25"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section — how the platform works */}
      <section className="relative z-50 border-t border-warmgray-border/50 bg-cream-card">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <h2 className="mb-2 text-center text-2xl font-semibold text-inktext sm:text-3xl">
            How Sabz Chaon Works
          </h2>
          <p className="mx-auto mb-12 max-w-lg text-center text-sm text-warmgray-text">
            Every tree planted becomes a tree that survives — through Guardians, AI, and accountability.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Sprout className="h-6 w-6 text-forest" />,
                step: "01",
                title: "Plant & Join",
                desc: "Volunteers join plantation campaigns and plant trees in their community.",
              },
              {
                icon: <Shield className="h-6 w-6 text-forest" />,
                step: "02",
                title: "Become a Guardian",
                desc: "Each volunteer becomes the Guardian of the tree they planted — responsible for its care.",
              },
              {
                icon: <Camera className="h-6 w-6 text-forest" />,
                step: "03",
                title: "Check In",
                desc: "Guardians upload periodic photo updates. AI analyzes visible tree health instantly.",
              },
              {
                icon: <TrendingUp className="h-6 w-6 text-forest" />,
                step: "04",
                title: "Track Impact",
                desc: "NGOs see real survival data, get alerts for struggling trees, and measure true impact.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-warmgray-border/60 bg-cream p-6 transition-all duration-300 hover:border-forest/20 hover:shadow-md"
              >
                {/* Step number */}
                <span className="mb-3 block text-xs font-bold tracking-widest text-forest/40">
                  STEP {item.step}
                </span>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-forest/8 transition-colors group-hover:bg-forest/12">
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold text-inktext">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-warmgray-text">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For whom section */}
      <section className="relative z-50 border-t border-warmgray-border/50 bg-cream">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <div className="grid gap-8 sm:grid-cols-2">
            {/* For Volunteers */}
            <div className="rounded-2xl border border-warmgray-border/60 bg-cream-card p-8 transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-forest/8">
                <Sprout className="h-6 w-6 text-forest" />
              </div>
              <h3 className="text-xl font-semibold text-inktext">
                For Volunteers
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-warmgray-text">
                Join plantation drives near you. Plant a tree and become its Guardian.
                Upload check-ins, watch your virtual plant grow, and know you&apos;re making a real difference.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Join Campaigns", "AI Health Checks", "Virtual Avatar"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-forest/8 px-3 py-1 text-xs font-medium text-forest"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* For NGOs */}
            <div className="rounded-2xl border border-warmgray-border/60 bg-cream-card p-8 transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brown/8">
                <Bell className="h-6 w-6 text-brown" />
              </div>
              <h3 className="text-xl font-semibold text-inktext">For NGOs</h3>
              <p className="mt-2 text-sm leading-relaxed text-warmgray-text">
                Create campaigns, recruit volunteers, and monitor tree survival at scale.
                Get real-time alerts when trees need attention. Report impact with data, not estimates.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Impact Dashboard", "Tree Alerts", "Campaign Management"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-brown/8 px-3 py-1 text-xs font-medium text-brown"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-50 border-t border-warmgray-border/50 bg-cream-card">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-warmgray-text">
              <TreePine className="h-4 w-4 text-forest" />
              <span>
                Sabz Chaon — Turning &ldquo;trees planted&rdquo; into &ldquo;trees that survive.&rdquo;
              </span>
            </div>
            <p className="text-xs text-warmgray-text">
              Alibaba Cloud AI Hackathon Project
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
