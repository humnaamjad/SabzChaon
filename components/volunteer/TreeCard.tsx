// Tree card for the "My Trees" list page.
// Displays tree summary with status badge, species, and visual interest.
// Links to the tree profile. Styled per THEME.md §4.

import Link from "next/link";
import { TreePine, MapPin, Calendar, ChevronRight } from "lucide-react";
import type { Tree } from "@/types/entities";
import { StatusBadge } from "./StatusBadge";

export function TreeCard({ tree }: { tree: Tree }) {
  return (
    <Link href={`/my-trees/${tree.id}`} className="block group">
      <div className="overflow-hidden rounded-2xl border border-warmgray-border/60 bg-cream-card shadow-sm transition-all duration-300 group-hover:border-forest/20 group-hover:shadow-md">
        {/* Top accent */}
        <div className="flex h-1.5 bg-gradient-to-r from-forest/50 to-leaf-accent/30" />
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest/8 ring-1 ring-forest/10 transition-colors group-hover:bg-forest/12">
                <TreePine className="h-6 w-6 text-forest" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-inktext group-hover:text-forest transition-colors">
                  {tree.id}
                </h3>
                <p className="text-sm text-warmgray-text">{tree.species}</p>
              </div>
            </div>
            <StatusBadge status={tree.currentStatus} />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-warmgray-text">
              <span className="flex items-center gap-1.5 capitalize">
                <MapPin className="h-3.5 w-3.5 text-brown" />
                {tree.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-brown" />
                {new Date(tree.plantingDate).toLocaleDateString()}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-warmgray-text/50 transition-transform group-hover:translate-x-0.5 group-hover:text-forest" />
          </div>
        </div>
      </div>
    </Link>
  );
}
