// Skeleton loading cards for data-loading states.
// Avoids blank screens while Firestore/API data loads.

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border border-warmgray-border/60 bg-cream-card p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl animate-shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded animate-shimmer" />
          <div className="h-3 w-1/3 rounded animate-shimmer" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded animate-shimmer"
            style={{ width: `${85 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonGrid({
  count = 3,
  lines,
}: {
  count?: number;
  lines?: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={lines} />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </div>
  );
}
