// Volunteer route group layout.
// Wraps all /(volunteer)/* pages with role-based access control.
// Only users with role "volunteer" can access these pages.

import ProtectedRoute from "@/components/shared/ProtectedRoute";

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="volunteer">{children}</ProtectedRoute>
  );
}
