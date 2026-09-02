"use client";

import type { GuardianGrowthStage } from "@/types/entities";
import { Sprout, TreePine, TreeDeciduous } from "lucide-react";

interface GuardianAvatarProps {
  growthStage: GuardianGrowthStage;
  guardianId: string;
}

type IconComponent = typeof Sprout;

interface StageConfig {
  label: string;
  icon: IconComponent;
  containerSize: number;
  iconSize: number;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  ring: boolean;
  glow: boolean;
  labelClass: string;
}

const STAGES: Record<GuardianGrowthStage, StageConfig> = {
  seedling: {
    label: "Seedling",
    icon: Sprout,
    containerSize: 56,
    iconSize: 26,
    iconColor: "text-brown",
    bgColor: "bg-brown/12",
    borderColor: "border-brown/30",
    ring: false,
    glow: false,
    labelClass: "text-xs text-warmgray-text",
  },
  sprout: {
    label: "Sprout",
    icon: Sprout,
    containerSize: 64,
    iconSize: 30,
    iconColor: "text-forest",
    bgColor: "bg-forest/10",
    borderColor: "border-forest/25",
    ring: false,
    glow: false,
    labelClass: "text-xs text-warmgray-text",
  },
  sapling: {
    label: "Sapling",
    icon: TreePine,
    containerSize: 76,
    iconSize: 36,
    iconColor: "text-forest-vivid",
    bgColor: "bg-forest-vivid/12",
    borderColor: "border-forest-vivid/35",
    ring: false,
    glow: false,
    labelClass: "text-xs font-medium text-forest-vivid",
  },
  young_tree: {
    label: "Young Tree",
    icon: TreeDeciduous,
    containerSize: 92,
    iconSize: 44,
    iconColor: "text-forest-vivid",
    bgColor: "bg-forest-vivid/15",
    borderColor: "border-forest",
    ring: true,
    glow: true,
    labelClass: "text-sm font-semibold text-forest-vivid",
  },
};

export default function GuardianAvatar({
  growthStage,
  guardianId,
}: GuardianAvatarProps) {
  const config = STAGES[growthStage];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex items-center justify-center rounded-full
          ${config.bgColor} border-2 ${config.borderColor}
          ${config.ring ? "ring-2 ring-forest/30 ring-offset-2 ring-offset-cream" : ""}
          ${config.glow ? "animate-[avatar-glow_2.5s_ease-in-out_infinite]" : ""}
          transition-all duration-600 ease-out
        `}
        style={{
          width: config.containerSize,
          height: config.containerSize,
        }}
      >
        <div className="animate-[avatar-idle_3s_ease-in-out_infinite]">
          <Icon
            size={config.iconSize}
            className={`transition-colors duration-600 ease-out ${config.iconColor}`}
            strokeWidth={1.5}
          />
        </div>
      </div>

      <span
        className={`font-medium transition-all duration-600 ease-out ${config.labelClass}`}
      >
        {config.label}
      </span>
    </div>
  );
}
