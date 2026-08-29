// Minimal auth hook for Part 3 volunteer pages.
// Wraps Firebase client Auth to expose user identity and loading state.
//
// NOTE: Part 1 owns the full auth context/provider. This hook exists
// because Part 3 cannot modify lib/firebase.ts or create a shared provider.
// When Part 1's auth context is ready, replace usage of this hook with
// Part 1's context consumer.

"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { clientAuth } from "@/lib/firebaseClient";

interface AuthState {
  user: User | null;
  userId: string | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    userId: null,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, (user) => {
      setState({
        user,
        userId: user?.uid ?? null,
        loading: false,
      });
    });
    return unsubscribe;
  }, []);

  return state;
}
