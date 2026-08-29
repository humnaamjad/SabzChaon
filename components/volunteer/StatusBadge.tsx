// Status badge component — shared across Part 3 pages.
// Color mapping per THEME.md §2:
//   healthy          → forest at ~10% tint
//   needs_attention  → ochre at ~10% tint
//   unknown          → warmgray-text at ~10% tint
// Badge shape: rounded-full, px-3 py-1, text-xs font-medium

import type { TreeStatus } from "@/types/entities";

const statusConfig: Record<
  TreeStatus,
  { bg: string; text: string; label: string }
> = {
  healthy: {
    bg: "bg-[color:color-mix(in_srgb,var(--color-forest)_10%,transparent)]",
    text: "text-forest",
    label: "Healthy",
  },
  needs_attention: {
    bg: "bg-[color:color-mix(in_srgb,var(--color-ochre)_10%,transparent)]",
    text: "text-ochre",
    label: "Needs Attention",
  },
  unknown: {
    bg: "bg-[color:color-mix(in_srgb,var(--color-warmgray-text)_10%,transparent)]",
    text: "text-warmgray-text",
    label: "Unknown",
  },
};

export function StatusBadge({ status }: { status: TreeStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
