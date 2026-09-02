import type { Reminder } from "@/types/entities";

/**
 * Check if a single reminder is due.
 * A reminder is due when its dueAt has passed and status is still "pending".
 */
export function isReminderDue(reminder: Reminder): boolean {
  if (reminder.status !== "pending") return false;
  return new Date(reminder.dueAt).getTime() <= Date.now();
}

/**
 * Filter a list of reminders down to only those currently due.
 */
export function getDueReminders(reminders: Reminder[]): Reminder[] {
  return reminders.filter(isReminderDue);
}
