// DEPRECATED — This local auth hook was created before Part 1's AuthProvider
// was merged. All Part 3 pages now use the shared auth context instead:
//   import { useAuth } from "@/components/shared/AuthProvider";
//
// This file is kept temporarily as a reference. Safe to delete.
//
// Original implementation wrapped Firebase client onAuthStateChanged directly.
// The shared AuthProvider provides the same data plus userDoc, signIn, signUp,
// signOut, and updateUserRole.
