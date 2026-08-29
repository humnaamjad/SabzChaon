// Firebase Client SDK initialization.
// This file is safe to import in client-side code.
// Firebase Admin SDK must NOT be imported here.

import {
  initializeApp,
  getApps,
} from "firebase/app";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ─── Client-side Firebase App ────────────────────────────────────────────────

const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Use singleton pattern to avoid re-initializing in Next.js hot-reload
const clientApp =
  getApps().length === 0
    ? initializeApp(firebaseClientConfig)
    : getApps()[0];

export const auth = getAuth(clientApp);
export const db = getFirestore(clientApp);