// Stat card component for the NGO dashboard.
// Displays a metric value with an icon and optional subtitle.

export default function StatCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border border-warmgray-border bg-cream-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-forest/10">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-warmgray-text">{label}</p>
          <p className="text-2xl font-semibold text-inktext">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-warmgray-text">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
