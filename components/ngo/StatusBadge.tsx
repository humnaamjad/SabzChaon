// Status badge component — consistent across dashboard, tree cards, alerts.
// Follows THEME.md §2 status colors.

import type { TreeStatus, CampaignStatus } from "@/types/entities";
import {
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  CalendarClock,
  Activity,
  Archive,
} from "lucide-react";

type StatusValue = TreeStatus | CampaignStatus;

const statusConfig: Record<
  StatusValue,
  { bg: string; text: string; label: string; icon: React.ReactNode; pulse?: boolean }
> = {
  // Tree statuses (THEME.md §2)
  healthy: {
    bg: "bg-forest/10",
    text: "text-forest",
    label: "Healthy",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  needs_attention: {
    bg: "bg-alert-red/12",
    text: "text-alert-red",
    label: "Needs Attention",
    icon: <AlertTriangle className="h-3 w-3" />,
    pulse: true,
  },
  unknown: {
    bg: "bg-warmgray-text/10",
    text: "text-warmgray-text",
    label: "Unknown",
    icon: <HelpCircle className="h-3 w-3" />,
  },
  // Campaign statuses
  upcoming: {
    bg: "bg-forest/10",
    text: "text-forest",
    label: "Upcoming",
    icon: <CalendarClock className="h-3 w-3" />,
  },
  active: {
    bg: "bg-ochre/10",
    text: "text-ochre",
    label: "Active",
    icon: <Activity className="h-3 w-3" />,
  },
  completed: {
    bg: "bg-warmgray-text/10",
    text: "text-warmgray-text",
    label: "Completed",
    icon: <Archive className="h-3 w-3" />,
  },
};

export default function StatusBadge({ status }: { status: StatusValue }) {
  const config = statusConfig[status] ?? statusConfig.unknown;
  const pulseClass = config.pulse ? "animate-alert-pulse" : "";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text} ${pulseClass}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
