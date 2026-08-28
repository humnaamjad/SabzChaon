// Status badge component — consistent across dashboard, tree cards, alerts.
// Follows THEME.md §2 status colors.

import type { TreeStatus, CampaignStatus } from "@/types/entities";

type StatusValue = TreeStatus | CampaignStatus;

const statusConfig: Record<
  StatusValue,
  { bg: string; text: string; label: string }
> = {
  // Tree statuses (THEME.md §2)
  healthy: {
    bg: "bg-forest/10",
    text: "text-forest",
    label: "Healthy",
  },
  needs_attention: {
    bg: "bg-ochre/10",
    text: "text-ochre",
    label: "Needs Attention",
  },
  unknown: {
    bg: "bg-warmgray-text/10",
    text: "text-warmgray-text",
    label: "Unknown",
  },
  // Campaign statuses
  upcoming: {
    bg: "bg-forest/10",
    text: "text-forest",
    label: "Upcoming",
  },
  active: {
    bg: "bg-ochre/10",
    text: "text-ochre",
    label: "Active",
  },
  completed: {
    bg: "bg-warmgray-text/10",
    text: "text-warmgray-text",
    label: "Completed",
  },
};

export default function StatusBadge({ status }: { status: StatusValue }) {
  const config = statusConfig[status] ?? statusConfig.unknown;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
