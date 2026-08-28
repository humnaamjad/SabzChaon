// Client-side authentication context provider.
// Wraps Firebase Auth onAuthStateChanged and provides user/session info.
// Also manages the __session cookie used by proxy.ts for route protection.

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";
import type { UserRole, User } from "@/types/entities";

interface AuthContextValue {
  user: FirebaseUser | null;
  userDoc: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    ngoId?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserRole: (role: UserRole, ngoId?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userDoc, setUserDoc] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch user document from Firestore
        const userSnap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userSnap.exists()) {
          setUserDoc({ id: userSnap.id, ...userSnap.data() } as User);
        } else {
          setUserDoc(null);
        }
        // Set session cookie for proxy.ts route protection
        document.cookie = "__session=1; path=/; max-age=86400; SameSite=Lax";
      } else {
        setUserDoc(null);
        // Clear session cookie
        document.cookie =
          "__session=; path=/; max-age=0; SameSite=Lax";
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await signInWithEmailAndPassword(auth, email, password);
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      role: UserRole,
      ngoId?: string
    ) => {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Create user document in Firestore
      const newUser: User = {
        id: credential.user.uid,
        name,
        email,
        role,
        ngoId: ngoId ?? null,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", credential.user.uid), newUser);
      setUserDoc(newUser);
    },
    []
  );

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    document.cookie =
      "__session=; path=/; max-age=0; SameSite=Lax";
  }, []);

  const updateUserRole = useCallback(
    async (role: UserRole, ngoId?: string) => {
      if (!user) throw new Error("Not authenticated");
      await setDoc(
        doc(db, "users", user.uid),
        { role, ngoId: ngoId ?? null },
        { merge: true }
      );
      setUserDoc((prev) =>
        prev ? { ...prev, role, ngoId: ngoId ?? null } : null
      );
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, userDoc, loading, signIn, signUp, signOut, updateUserRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}
