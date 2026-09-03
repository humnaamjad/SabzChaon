// Beautiful empty-state component.
// Communicates what is empty, why, and what the user can do next.
// Uses Lucide icons and the earthy Sabz Chaon theme.

import type { ReactNode } from "react";
import { Sprout } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-warmgray-border bg-cream-card px-8 py-16 text-center shadow-sm">
      {/* Decorative botanical ring */}
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-forest/5 ring-1 ring-forest/10">
        {icon ?? <Sprout className="h-9 w-9 text-forest/50" />}
      </div>

      <h2 className="text-lg font-semibold text-inktext">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-warmgray-text">
        {description}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
