import type { AiStatus, GuardianAvatar } from "@/types/entities";
import { analyzeTreePhoto } from "@/lib/ai/treeHealth";
import { calculateAvatarUpdate } from "@/lib/gamification";

interface ProcessTreeUpdateInput {
  photoUrl: string;
  textNote?: string;
  currentAvatar: GuardianAvatar;
}

interface ProcessTreeUpdateResult {
  aiStatus: AiStatus;
  aiCareRecommendation: string;
  aiConfidenceNote?: string;
  updatedAvatar: GuardianAvatar;
}

/**
 * Orchestrate AI analysis + avatar update for a tree photo submission.
 *
 * Pure orchestration only — no Firestore calls, no alert logic.
 * The calling route is responsible for:
 *   - Writing the TreeUpdate to Firestore
 *   - Updating Tree.consecutiveNeedsAttentionCount
 *   - Calling Part 2's checkAndTriggerAlert(treeId, aiStatus)
 */
export async function processTreeUpdate(
  input: ProcessTreeUpdateInput
): Promise<ProcessTreeUpdateResult> {
  const { photoUrl, textNote, currentAvatar } = input;

  const aiResult = await analyzeTreePhoto({ photoUrl, textNote });

  // A submission happening is always the on-time signal
  const updatedAvatar = calculateAvatarUpdate(currentAvatar, true);

  return {
    aiStatus: aiResult.aiStatus,
    aiCareRecommendation: aiResult.aiCareRecommendation,
    ...(aiResult.aiConfidenceNote && {
      aiConfidenceNote: aiResult.aiConfidenceNote,
    }),
    updatedAvatar,
  };
}
