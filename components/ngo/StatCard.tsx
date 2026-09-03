// Stat card component for the NGO dashboard.
// Displays a metric value with an icon and optional subtitle.
// Premium design with hover effect and visual weight.

export default function StatCard({
  icon,
  label,
  value,
  subtitle,
  accentColor = "forest",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  accentColor?: "forest" | "ochre" | "brown" | "alert-red";
}) {
  const bgColor =
    accentColor === "ochre"
      ? "bg-ochre/8"
      : accentColor === "brown"
      ? "bg-brown/8"
      : accentColor === "alert-red"
      ? "bg-alert-red/8"
      : "bg-forest/8";

  return (
    <div className="group rounded-2xl border border-warmgray-border/60 bg-cream-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-forest/15">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bgColor} ring-1 ring-${accentColor}/10 transition-colors`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-warmgray-text">{label}</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-inktext">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-warmgray-text">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
