// Client-only Firebase initialization for Part 3 volunteer pages.
// This file exists because lib/firebase.ts exports both client and admin SDK
// functions, and the admin SDK's Node.js dependencies (tls, child_process, etc.)
// leak into client bundles via Turbopack's module tracing.
//
// This file only initializes the Firebase CLIENT SDK (auth + firestore),
// so client components can import from here without pulling in firebase-admin.
//
// NOTE: When Part 1 restructures lib/firebase.ts to properly separate
// client/server concerns, this file can be removed and imports updated.

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Reuse the existing app if already initialized (avoids double-init with lib/firebase.ts)
const clientApp =
  getApps().length === 0
    ? initializeApp(firebaseClientConfig)
    : getApps()[0];

export const clientAuth = getAuth(clientApp);
export const clientDb = getFirestore(clientApp);
