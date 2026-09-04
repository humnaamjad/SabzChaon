// Stat card component for the NGO dashboard.
// Displays a metric value with an icon, label, and optional subtitle.
// Accent variants tint the icon chip, value, and hover border using the
// THEME.md §1 tokens (forest primary, brown secondary, ochre warning,
// alert-red urgent) — matching the volunteer stat-card visual language.

type AccentColor = "forest" | "ochre" | "brown" | "alert-red";

const accents: Record<
  AccentColor,
  { chip: string; value: string; hoverBorder: string }
> = {
  forest: {
    chip: "bg-forest/8 ring-forest/10",
    value: "text-forest",
    hoverBorder: "hover:border-forest/20",
  },
  brown: {
    chip: "bg-brown/8 ring-brown/10",
    value: "text-brown",
    hoverBorder: "hover:border-brown/25",
  },
  ochre: {
    chip: "bg-ochre/8 ring-ochre/10",
    value: "text-ochre",
    hoverBorder: "hover:border-ochre/25",
  },
  "alert-red": {
    chip: "bg-alert-red/8 ring-alert-red/10",
    value: "text-alert-red",
    hoverBorder: "hover:border-alert-red/25",
  },
};

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
  accentColor?: AccentColor;
}) {
  const accent = accents[accentColor];

  return (
    <div
      className={`group rounded-2xl border border-warmgray-border/60 bg-cream-card p-5 shadow-sm transition-all duration-300 hover:shadow-md ${accent.hoverBorder}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105 ${accent.chip}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-warmgray-text">
            {label}
          </p>
          <p className={`mt-1 text-3xl font-bold tracking-tight ${accent.value}`}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs leading-relaxed text-warmgray-text">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
