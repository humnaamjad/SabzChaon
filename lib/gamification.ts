import type { GuardianAvatar, GuardianGrowthStage } from "@/types/entities";

const GROWTH_STAGES: GuardianGrowthStage[] = [
  "seedling",
  "sprout",
  "sapling",
  "young_tree",
];

function advanceStage(current: GuardianGrowthStage): GuardianGrowthStage {
  const index = GROWTH_STAGES.indexOf(current);
  const nextIndex = Math.min(index + 1, GROWTH_STAGES.length - 1);
  return GROWTH_STAGES[nextIndex];
}

function dropStage(current: GuardianGrowthStage): GuardianGrowthStage {
  const index = GROWTH_STAGES.indexOf(current);
  const prevIndex = Math.max(index - 1, 0);
  return GROWTH_STAGES[prevIndex];
}

/**
 * Calculate the updated GuardianAvatar state after an update event.
 *
 * - On-time update: advance growthStage one step (capped at "young_tree"),
 *   reset missedUpdateStreak to 0, update lastUpdatedAt.
 * - Missed update: drop growthStage one step (floored at "seedling"),
 *   increment missedUpdateStreak, update lastUpdatedAt.
 */
export function calculateAvatarUpdate(
  current: GuardianAvatar,
  wasOnTime: boolean
): GuardianAvatar {
  const growthStage = wasOnTime
    ? advanceStage(current.growthStage)
    : dropStage(current.growthStage);

  const missedUpdateStreak = wasOnTime
    ? 0
    : current.missedUpdateStreak + 1;

  return {
    ...current,
    growthStage,
    missedUpdateStreak,
    lastUpdatedAt: new Date().toISOString(),
  };
}
