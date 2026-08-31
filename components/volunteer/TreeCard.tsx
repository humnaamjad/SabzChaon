// Tree card for the "My Trees" list page.
// Displays tree summary with status badge and links to the tree profile.
// Styled per THEME.md §4 (cards).

import Link from "next/link";
import { TreePine, MapPin, Calendar } from "lucide-react";
import type { Tree } from "@/types/entities";
import { StatusBadge } from "./StatusBadge";

export function TreeCard({ tree }: { tree: Tree }) {
  return (
    <Link href={`/my-trees/${tree.id}`} className="block group">
      <div className="rounded-xl border border-warmgray-border bg-cream-card p-6 shadow-sm transition-shadow group-hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:color-mix(in_srgb,var(--color-forest)_10%,transparent)]">
              <TreePine className="h-5 w-5 text-forest" />
            </div>
            <div>
              <h3 className="font-semibold text-inktext">{tree.id}</h3>
              <p className="text-sm text-warmgray-text">{tree.species}</p>
            </div>
          </div>
          <StatusBadge status={tree.currentStatus} />
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-warmgray-text">
            <MapPin className="h-4 w-4 text-brown" />
            <span>{tree.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-warmgray-text">
            <Calendar className="h-4 w-4 text-brown" />
            <span>Planted {new Date(tree.plantingDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
