// Role-based navigation bar (THEME.md §4).
// NGO sees: Dashboard, Campaigns, Alerts
// Volunteer sees: Campaigns, My Trees
// Shows wordmark, user name, and sign-out button.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/shared/AuthProvider";
import {
  TreePine,
  LayoutDashboard,
  Megaphone,
  Bell,
  Users,
  LogOut,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const ngoNavItems: NavItem[] = [
  {
    href: "/(ngo)/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    href: "/(ngo)/campaigns",
    label: "Campaigns",
    icon: <Megaphone className="h-4 w-4" />,
  },
  {
    href: "/(ngo)/alerts",
    label: "Alerts",
    icon: <Bell className="h-4 w-4" />,
  },
];

const volunteerNavItems: NavItem[] = [
  {
    href: "/(volunteer)/campaigns",
    label: "Campaigns",
    icon: <Users className="h-4 w-4" />,
  },
  {
    href: "/(volunteer)/my-trees",
    label: "My Trees",
    icon: <TreePine className="h-4 w-4" />,
  },
];

export default function Navbar() {
  const { userDoc, signOut } = useAuth();
  const pathname = usePathname();

  if (!userDoc) return null;

  const navItems = userDoc.role === "ngo" ? ngoNavItems : volunteerNavItems;

  return (
    <header className="border-b border-warmgray-border bg-cream">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-forest"
        >
          <TreePine className="h-5 w-5" />
          <span>Sabz Chaon</span>
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-forest text-white"
                    : "text-inktext hover:bg-cream-card"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* User info + sign out */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-warmgray-text">{userDoc.name}</span>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-warmgray-text transition-colors hover:bg-cream-card hover:text-inktext"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </nav>
    </header>
  );
}
