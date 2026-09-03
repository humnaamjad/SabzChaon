// Auth page — login, signup, and role selection (§19 Part 1).
// Supports email+password authentication via Firebase Auth.
// On signup, creates a User document in Firestore with the chosen role.
//
// VISUAL REDESIGN: Two-column layout — branded visual left, form right.
// All auth logic (handleSubmit, signIn, signUp) preserved exactly.

"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/shared/AuthProvider";
import type { UserRole } from "@/types/entities";
import {
  TreePine,
  LogIn,
  UserPlus,
  Sprout,
  Shield,
  Leaf,
} from "lucide-react";
import LoadingState from "@/components/shared/LoadingState";

type AuthMode = "login" | "signup";

// Page wrapper with Suspense boundary (required by useSearchParams)
export default function AuthPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading…" />}>
      <AuthForm />
    </Suspense>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [ngoName, setNgoName] = useState("");
  const [role, setRole] = useState<UserRole>("volunteer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  if (authLoading) {
    return <LoadingState message="Checking authentication…" />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        if (!name.trim()) {
          setError("Name is required for signup.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        if (role === "ngo" && !ngoName.trim()) {
          setError("NGO name is required.");
          setLoading(false);
          return;
        }
        await signUp(email, password, name.trim(), role, ngoName.trim() || undefined);
      }
      // Redirect after successful auth
      router.push(redirect);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Authentication failed";
      // Make Firebase error messages more user-friendly
      if (message.includes("invalid-credential")) {
        setError("Invalid email or password.");
      } else if (message.includes("email-already-in-use")) {
        setError("An account with this email already exists.");
      } else if (message.includes("weak-password")) {
        setError("Password is too weak. Use at least 6 characters.");
      } else if (message.includes("invalid-email")) {
        setError("Invalid email address.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-cream">
      {/* ─── LEFT: Branded Visual Panel ─────────────────────────────────── */}
      <div className="relative hidden overflow-hidden bg-forest lg:flex lg:w-1/2 xl:w-[55%]">
        {/* Subtle decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-12 left-12 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-20 right-8 h-80 w-80 rounded-full bg-forest-hover/40 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <TreePine className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">
                Sabz Chaon
              </span>
            </div>
          </div>

          {/* Hero messaging */}
          <div className="max-w-md">
            <h2 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
              Every tree has a Guardian.
              <br />
              <span className="text-white/70">
                Every Guardian makes a difference.
              </span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/60">
              Plant a tree. Become its Guardian. Care for it with AI-powered health checks.
              Help it survive and thrive.
            </p>

            {/* Journey steps */}
            <div className="mt-10 space-y-4">
              {[
                { icon: <Sprout className="h-4 w-4" />, text: "Plant a tree in your community" },
                { icon: <Shield className="h-4 w-4" />, text: "Become its Guardian — care for it" },
                { icon: <Leaf className="h-4 w-4" />, text: "AI checks visible tree health" },
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-3 backdrop-blur-sm"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                    {step.icon}
                  </div>
                  <span className="text-sm font-medium text-white/80">
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom tagline */}
          <div>
            <p className="text-xs text-white/30">
              Turning &ldquo;trees planted&rdquo; into &ldquo;trees that survive.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Auth Form ───────────────────────────────────────────── */}
      <div className="flex w-full items-center justify-center px-4 py-8 lg:w-1/2 xl:w-[45%]">
        <div className="w-full max-w-md">
          {/* Mobile brand header (visible < lg) */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest">
                <TreePine className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-inktext">Sabz Chaon</h1>
          </div>

          {/* Form header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-inktext">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-warmgray-text">
              {mode === "login"
                ? "Sign in to continue your Guardian journey."
                : "Join the movement — plant, guard, nurture."}
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-warmgray-border bg-cream-card p-6 shadow-sm">
            {/* Mode tabs */}
            <div className="mb-6 flex rounded-xl bg-cream p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
                  mode === "login"
                    ? "bg-white text-inktext shadow-sm ring-1 ring-warmgray-border/50"
                    : "text-warmgray-text hover:text-inktext"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
                  mode === "signup"
                    ? "bg-white text-inktext shadow-sm ring-1 ring-warmgray-border/50"
                    : "text-warmgray-text hover:text-inktext"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 rounded-xl bg-brick/8 px-4 py-2.5 text-sm text-brick">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name field (signup only) */}
              {mode === "signup" && (
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-inktext"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-warmgray-border bg-white px-4 py-2.5 text-sm text-inktext placeholder:text-warmgray-text/60 transition-colors focus:border-forest focus:ring-1 focus:ring-forest focus:outline-none"
                    placeholder="Your full name"
                    required
                  />
                </div>
              )}

              {/* Email field */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-inktext"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-warmgray-border bg-white px-4 py-2.5 text-sm text-inktext placeholder:text-warmgray-text/60 transition-colors focus:border-forest focus:ring-1 focus:ring-forest focus:outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-inktext"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-warmgray-border bg-white px-4 py-2.5 text-sm text-inktext placeholder:text-warmgray-text/60 transition-colors focus:border-forest focus:ring-1 focus:ring-forest focus:outline-none"
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
              </div>

              {/* Role selection (signup only) */}
              {mode === "signup" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-inktext">
                    I am a…
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("volunteer")}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 text-center transition-all duration-200 ${
                        role === "volunteer"
                          ? "border-forest bg-forest/5 ring-1 ring-forest/20"
                          : "border-warmgray-border bg-white hover:border-forest/40"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                          role === "volunteer"
                            ? "bg-forest/10"
                            : "bg-cream"
                        }`}
                      >
                        <Sprout
                          className={`h-5 w-5 ${
                            role === "volunteer"
                              ? "text-forest"
                              : "text-warmgray-text"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          role === "volunteer"
                            ? "text-forest"
                            : "text-inktext"
                        }`}
                      >
                        Volunteer
                      </span>
                      <span className="text-xs text-warmgray-text">
                        Plant & guard trees
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("ngo")}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 text-center transition-all duration-200 ${
                        role === "ngo"
                          ? "border-forest bg-forest/5 ring-1 ring-forest/20"
                          : "border-warmgray-border bg-white hover:border-forest/40"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                          role === "ngo"
                            ? "bg-forest/10"
                            : "bg-cream"
                        }`}
                      >
                        <TreePine
                          className={`h-5 w-5 ${
                            role === "ngo"
                              ? "text-forest"
                              : "text-warmgray-text"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          role === "ngo"
                            ? "text-forest"
                            : "text-inktext"
                        }`}
                      >
                        NGO
                      </span>
                      <span className="text-xs text-warmgray-text">
                        Run campaigns
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* NGO Name field (signup + ngo role only) */}
              {mode === "signup" && role === "ngo" && (
                <div>
                  <label
                    htmlFor="ngoName"
                    className="mb-1.5 block text-sm font-medium text-inktext"
                  >
                    NGO Name
                  </label>
                  <input
                    id="ngoName"
                    type="text"
                    value={ngoName}
                    onChange={(e) => setNgoName(e.target.value)}
                    className="w-full rounded-xl border border-warmgray-border bg-white px-4 py-2.5 text-sm text-inktext placeholder:text-warmgray-text/60 transition-colors focus:border-forest focus:ring-1 focus:ring-forest focus:outline-none"
                    placeholder="Your organization's name"
                    required
                  />
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-forest/15 transition-all duration-200 hover:bg-forest-hover hover:shadow-md hover:shadow-forest/20 disabled:opacity-50"
              >
                {loading ? (
                  <span>Please wait…</span>
                ) : mode === "login" ? (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-warmgray-text">
            Sabz Chaon — Turning &quot;trees planted&quot; into &quot;trees that
            survive.&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
