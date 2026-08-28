// NGO route group layout.
// Wraps all /(ngo)/* pages with role-based access control.
// Only users with role "ngo" can access these pages.

import ProtectedRoute from "@/components/shared/ProtectedRoute";

export default function NgoLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requiredRole="ngo">{children}</ProtectedRoute>;
}
