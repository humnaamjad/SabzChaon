// Campaign card for the volunteer browse/join page.
// Displays campaign summary info and a Join action button.
// Styled per THEME.md §4 (cards + buttons).

import { MapPin, Calendar, TreePine, Users } from "lucide-react";
import type { Campaign } from "@/types/entities";

interface CampaignCardProps {
  campaign: Campaign;
  isJoined: boolean;
  isJoining: boolean;
  onJoin: (campaignId: string) => void;
}

export function CampaignCard({
  campaign,
  isJoined,
  isJoining,
  onJoin,
}: CampaignCardProps) {
  return (
    <div className="rounded-xl border border-warmgray-border bg-cream-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-inktext">
            {campaign.title}
          </h3>

          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm text-warmgray-text">
              <MapPin className="h-4 w-4 text-brown" />
              <span>{campaign.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-warmgray-text">
              <Calendar className="h-4 w-4 text-brown" />
              <span>{new Date(campaign.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-warmgray-text">
              <span className="flex items-center gap-1">
                <TreePine className="h-4 w-4 text-forest" />
                {campaign.treesPlannedCount} trees planned
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4 text-forest" />
                {campaign.volunteersNeeded} volunteers needed
              </span>
            </div>
          </div>
        </div>

        <span className="shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-[color:color-mix(in_srgb,var(--color-forest)_10%,transparent)] text-forest">
          {campaign.status}
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-warmgray-border">
        {isJoined ? (
          <p className="text-sm text-forest font-medium">
            You have joined this campaign
          </p>
        ) : (
          <button
            onClick={() => onJoin(campaign.id)}
            disabled={isJoining}
            className="rounded-lg px-4 py-2 bg-forest text-white text-sm font-medium hover:bg-forest-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isJoining ? "Joining..." : "Join Campaign"}
          </button>
        )}
      </div>
    </div>
  );
}
