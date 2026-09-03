// Role-based navigation bar (THEME.md §4).
// NGO sees: Dashboard, Campaigns, Alerts
// Volunteer sees: Campaigns, My Trees
// Shows wordmark, user name, and sign-out button.
// Premium redesign: refined brand identity, polished states, mobile-aware.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/shared/AuthProvider";
import {
  TreePine,
  LayoutDashboard,
  Megaphone,
  Bell,
  Sprout,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const ngoNavItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    href: "/campaigns",
    label: "Campaigns",
    icon: <Megaphone className="h-4 w-4" />,
  },
  {
    href: "/alerts",
    label: "Alerts",
    icon: <Bell className="h-4 w-4" />,
  },
];

const volunteerNavItems: NavItem[] = [
  {
    href: "/browse-campaigns",
    label: "Campaigns",
    icon: <Megaphone className="h-4 w-4" />,
  },
  {
    href: "/my-trees",
    label: "My Trees",
    icon: <TreePine className="h-4 w-4" />,
  },
];

export default function Navbar() {
  const { userDoc, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!userDoc) return null;

  const navItems = userDoc.role === "ngo" ? ngoNavItems : volunteerNavItems;

  return (
    <header className="sticky top-0 z-30 border-b border-warmgray-border/70 bg-cream/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
        {/* Wordmark */}
        <Link
          href="/"
          className="group flex items-center gap-2.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest transition-colors group-hover:bg-forest-hover">
            <TreePine className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight text-forest">
              Sabz Chaon
            </span>
            <span className="hidden text-[10px] font-medium text-warmgray-text sm:block">
              {userDoc.role === "ngo" ? "Impact Platform" : "Guardian Portal"}
            </span>
          </div>
        </Link>

        {/* Desktop navigation links */}
        <div className="hidden items-center gap-0.5 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-forest text-white shadow-sm shadow-forest/20"
                    : "text-warmgray-text hover:bg-forest/5 hover:text-inktext"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* User info + sign out (desktop) */}
        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-2 rounded-lg bg-cream-card px-3 py-1.5 ring-1 ring-warmgray-border/50">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-forest/10">
              <User className="h-3.5 w-3.5 text-forest" />
            </div>
            <span className="text-sm font-medium text-inktext">
              {userDoc.name}
            </span>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-warmgray-text transition-all duration-200 hover:bg-brick/5 hover:text-brick"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-warmgray-text transition-colors hover:bg-cream-card md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="animate-fade-up border-t border-warmgray-border/50 bg-cream-card px-4 pb-4 pt-2 md:hidden">
          <div className="mb-3 flex items-center gap-2 border-b border-warmgray-border/50 pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-forest/10">
              <User className="h-4 w-4 text-forest" />
            </div>
            <div>
              <p className="text-sm font-medium text-inktext">{userDoc.name}</p>
              <p className="text-xs text-warmgray-text capitalize">{userDoc.role}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-forest text-white"
                      : "text-inktext hover:bg-forest/5"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => signOut()}
              className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-warmgray-text transition-colors hover:bg-brick/5 hover:text-brick"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
