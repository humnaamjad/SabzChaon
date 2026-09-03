// Status badge component — shared across Part 3 pages.
// Color mapping per THEME.md §2:
//   healthy          → forest at ~10% tint
//   needs_attention  → alert-red (urgent, pulsing)
//   unknown          → warmgray-text at ~10% tint
// Badge shape: rounded-full, px-3 py-1, text-xs font-medium

import type { TreeStatus } from "@/types/entities";
import { CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";

const statusConfig: Record<
  TreeStatus,
  { bg: string; text: string; label: string; icon: React.ReactNode; pulse?: boolean }
> = {
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
};

export function StatusBadge({ status }: { status: TreeStatus }) {
  const config = statusConfig[status];
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
