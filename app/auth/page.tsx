// Auth page — login, signup, and role selection (§19 Part 1).
// Supports email+password authentication via Firebase Auth.
// On signup, creates a User document in Firestore with the chosen role.

"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/shared/AuthProvider";
import type { UserRole } from "@/types/entities";
import { TreePine, LogIn, UserPlus } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <TreePine className="h-12 w-12 text-forest" />
          </div>
          <h1 className="text-2xl font-semibold text-inktext">Sabz Chaon</h1>
          <p className="mt-1 text-sm text-warmgray-text">
            {mode === "login"
              ? "Sign in to your account"
              : "Create a new account"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-warmgray-border bg-cream-card p-6 shadow-sm">
          {/* Mode tabs */}
          <div className="mb-6 flex rounded-lg bg-cream p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "login"
                  ? "bg-white text-inktext shadow-sm"
                  : "text-warmgray-text hover:text-inktext"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "signup"
                  ? "bg-white text-inktext shadow-sm"
                  : "text-warmgray-text hover:text-inktext"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-lg bg-brick/10 px-4 py-2 text-sm text-brick">
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
                  className="mb-1 block text-sm font-medium text-inktext"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-warmgray-border bg-white px-3 py-2 text-sm text-inktext placeholder:text-warmgray-text focus:border-forest focus:ring-1 focus:ring-forest focus:outline-none"
                  placeholder="Your full name"
                  required
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-inktext"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-warmgray-border bg-white px-3 py-2 text-sm text-inktext placeholder:text-warmgray-text focus:border-forest focus:ring-1 focus:ring-forest focus:outline-none"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-inktext"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-warmgray-border bg-white px-3 py-2 text-sm text-inktext placeholder:text-warmgray-text focus:border-forest focus:ring-1 focus:ring-forest focus:outline-none"
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
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("volunteer")}
                    className={`flex-1 rounded-lg border-2 px-4 py-3 text-center text-sm font-medium transition-colors ${
                      role === "volunteer"
                        ? "border-forest bg-forest/10 text-forest"
                        : "border-warmgray-border bg-white text-inktext hover:border-forest/50"
                    }`}
                  >
                    🌱 Volunteer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("ngo")}
                    className={`flex-1 rounded-lg border-2 px-4 py-3 text-center text-sm font-medium transition-colors ${
                      role === "ngo"
                        ? "border-forest bg-forest/10 text-forest"
                        : "border-warmgray-border bg-white text-inktext hover:border-forest/50"
                    }`}
                  >
                    🏢 NGO
                  </button>
                </div>
              </div>
            )}

            {/* NGO Name field (signup + ngo role only) */}
            {mode === "signup" && role === "ngo" && (
              <div>
                <label
                  htmlFor="ngoName"
                  className="mb-1 block text-sm font-medium text-inktext"
                >
                  NGO Name
                </label>
                <input
                  id="ngoName"
                  type="text"
                  value={ngoName}
                  onChange={(e) => setNgoName(e.target.value)}
                  className="w-full rounded-lg border border-warmgray-border bg-white px-3 py-2 text-sm text-inktext placeholder:text-warmgray-text focus:border-forest focus:ring-1 focus:ring-forest focus:outline-none"
                  placeholder="Your organization's name"
                  required
                />
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-forest-hover disabled:opacity-50"
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
  );
}
