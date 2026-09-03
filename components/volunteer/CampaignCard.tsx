// Campaign card for the volunteer browse/join page.
// Displays campaign summary info with visual hierarchy and a Join action.
// Styled per THEME.md §4. Uses Lucide icons exclusively.

import { MapPin, Calendar, TreePine, Users, ArrowRight } from "lucide-react";
import type { Campaign } from "@/types/entities";

interface CampaignCardProps {
  campaign: Campaign;
  isJoined: boolean;
  isJoining: boolean;
  onJoin: (campaignId: string) => void;
}

const statusLabels: Record<string, string> = {
  upcoming: "Upcoming",
  active: "Active",
  completed: "Completed",
};

export function CampaignCard({
  campaign,
  isJoined,
  isJoining,
  onJoin,
}: CampaignCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-warmgray-border/60 bg-cream-card shadow-sm transition-all duration-300 hover:border-forest/20 hover:shadow-md">
      {/* Top botanical accent strip */}
      <div className="h-1.5 bg-gradient-to-r from-forest/70 via-forest/40 to-leaf-accent/40" />

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-inktext group-hover:text-forest transition-colors">
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
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              campaign.status === "active"
                ? "bg-forest/10 text-forest"
                : campaign.status === "upcoming"
                ? "bg-ochre/10 text-ochre"
                : "bg-warmgray-text/10 text-warmgray-text"
            }`}
          >
            {statusLabels[campaign.status] ?? campaign.status}
          </span>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex items-center gap-5 border-t border-warmgray-border/50 pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest/8">
              <TreePine className="h-4 w-4 text-forest" />
            </div>
            <div>
              <p className="text-sm font-semibold text-inktext">
                {campaign.treesPlannedCount}
              </p>
              <p className="text-xs text-warmgray-text">Trees planned</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest/8">
              <Users className="h-4 w-4 text-forest" />
            </div>
            <div>
              <p className="text-sm font-semibold text-inktext">
                {campaign.volunteersNeeded}
              </p>
              <p className="text-xs text-warmgray-text">Volunteers needed</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4">
          {isJoined ? (
            <div className="flex items-center gap-2 rounded-xl bg-forest/5 px-4 py-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-forest/15">
                <TreePine className="h-3.5 w-3.5 text-forest" />
              </div>
              <p className="text-sm font-medium text-forest">
                You have joined this campaign
              </p>
            </div>
          ) : (
            <button
              onClick={() => onJoin(campaign.id)}
              disabled={isJoining}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-forest/10 transition-all duration-200 hover:bg-forest-hover hover:shadow-md hover:shadow-forest/15 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoining ? (
                "Joining..."
              ) : (
                <>
                  Join Campaign
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
