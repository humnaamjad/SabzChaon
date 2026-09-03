// Consistent page header — icon, title, and optional subtitle.
// Used across all pages for visual consistency.

import type { ReactNode } from "react";

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function PageHeader({
  icon,
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest/8 ring-1 ring-forest/10">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-inktext">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-warmgray-text">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
