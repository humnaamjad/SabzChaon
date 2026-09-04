// Due check-in reminders banner — §19 Part 4, Feature 6 (§14: in-app "due"
// banner). Fetches the signed-in guardian's due reminders from
// GET /api/reminders/due and surfaces them as an actionable banner.
//
// - Without a treeId (My Trees list page) it shows every due reminder, each
//   linking to that tree's profile page.
// - With a treeId (tree profile page) it shows only that tree's reminder, and
//   clicking scrolls to the update form instead of navigating away.
// - Renders nothing at all when nothing is due — no empty/placeholder state.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BellRing, ChevronRight, TreePine, X } from "lucide-react";
import { useAuth } from "@/components/shared/AuthProvider";
import type { ApiResponse, Reminder } from "@/types/entities";

interface DueRemindersBannerProps {
  // When set (tree profile page), only this tree's reminder is shown and
  // clicking scrolls to the update form instead of navigating away.
  treeId?: string;
}

function formatDueLabel(dueAt: string): string {
  const ms = Date.now() - new Date(dueAt).getTime();
  const days = Math.floor(ms / 86400000);
  if (days >= 1) return `Due ${days} day${days === 1 ? "" : "s"} ago`;
  const hours = Math.floor(ms / 3600000);
  if (hours >= 1) return `Due ${hours} hour${hours === 1 ? "" : "s"} ago`;
  return "Due now";
}

export function DueRemindersBanner({ treeId }: DueRemindersBannerProps) {
  const { user, loading: authLoading } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [remindersLoading, setRemindersLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const currentUser = user;

    let cancelled = false;
    async function fetchDueReminders() {
      setRemindersLoading(true);
      try {
        const token = await currentUser.getIdToken();
        const response = await fetch("/api/reminders/due", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result: ApiResponse<Reminder[]> = await response.json();
        if (!cancelled && result.success && result.data) {
          setReminders(result.data);
        }
      } catch (err) {
        // A failed reminder fetch must never break the page — the banner
        // simply stays hidden.
        console.error("[DueRemindersBanner] Failed to fetch reminders:", err);
      } finally {
        if (!cancelled) setRemindersLoading(false);
      }
    }

    fetchDueReminders();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const visible = treeId
    ? reminders.filter((reminder) => reminder.treeId === treeId)
    : reminders;

  // Still resolving auth or signed out → no banner at all.
  if (authLoading || !user || dismissed) return null;

  // Fetch in progress — render a skeleton placeholder so the layout does not
  // visibly "pop in" once data arrives.
  if (remindersLoading || visible.length === 0) {
    if (visible.length === 0 && !remindersLoading) return null;
    return (
      <div className="mb-6 animate-fade-up rounded-2xl border border-brick/30 bg-brick/5 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-brick/10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/5 animate-pulse rounded bg-brick/10" />
            <div className="h-3 w-2/5 animate-pulse rounded bg-brick/8" />
          </div>
        </div>
      </div>
    );
  }

  function scrollToUpdateForm() {
    document
      .getElementById("update-form")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  const title =
    visible.length === 1
      ? `Your check-in for ${visible[0].treeId} is due`
      : `You have ${visible.length} check-ins due`;

  return (
    <div className="mb-6 animate-fade-up rounded-2xl border border-brick/30 bg-brick/5 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brick/10 ring-1 ring-brick/20">
          <BellRing className="h-5 w-5 text-brick" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-inktext">{title}</h2>
          <p className="mt-0.5 text-sm text-warmgray-text">
            Submit an update to keep your Guardian Avatar growing!
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss reminders"
          className="shrink-0 text-warmgray-text transition-colors hover:text-inktext"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {visible.map((reminder) => {
          const rowContent = (
            <>
              <span className="flex min-w-0 items-center gap-2.5">
                <TreePine className="h-4.5 w-4.5 shrink-0 text-brick" />
                <span className="truncate text-sm font-semibold text-inktext">
                  {reminder.treeId}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-xs text-warmgray-text">
                {formatDueLabel(reminder.dueAt)}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:text-brick" />
              </span>
            </>
          );

          const rowClassName =
            "group flex w-full items-center justify-between gap-3 rounded-xl border border-brick/15 bg-cream-card px-4 py-3 shadow-sm transition-all hover:border-brick/40 hover:shadow-md";

          return (
            <li key={reminder.id}>
              {treeId ? (
                <button onClick={scrollToUpdateForm} className={rowClassName}>
                  {rowContent}
                </button>
              ) : (
                <Link href={`/my-trees/${reminder.treeId}`} className={rowClassName}>
                  {rowContent}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
