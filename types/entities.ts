// Canonical TypeScript types matching §6 of the project context document exactly.
// All entity field names use camelCase per §13 conventions.
// Do not add/remove fields without updating the master context doc first.

// ─── Status Enums ────────────────────────────────────────────────────────────

export type UserRole = "ngo" | "volunteer";

export type CampaignStatus = "upcoming" | "active" | "completed";

export type TreeStatus = "healthy" | "needs_attention" | "unknown";

export type AiStatus = "healthy" | "needs_attention" | "unknown";

export type ReminderStatus = "pending" | "sent" | "acknowledged";

export type GuardianGrowthStage =
  | "seedling"
  | "sprout"
  | "sapling"
  | "young_tree";

// ─── Entities ────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  ngoId: string | null; // set if role is "ngo" — links to Ngo
  createdAt: string; // ISO 8601 timestamp
}

export interface Ngo {
  id: string;
  name: string;
  description: string;
  contactEmail: string;
  createdAt: string; // ISO 8601 timestamp
}

export interface Campaign {
  id: string;
  ngoId: string; // owner
  title: string;
  location: string; // string; lat/lng optional stretch goal
  date: string; // ISO 8601 date or timestamp
  treesPlannedCount: number;
  volunteersNeeded: number;
  status: CampaignStatus;
  createdAt: string; // ISO 8601 timestamp
}

export interface CampaignMembership {
  id: string;
  campaignId: string;
  userId: string; // volunteer
  joinedAt: string; // ISO 8601 timestamp
  becameGuardian: boolean;
}

export interface Tree {
  id: string; // unique Tree ID, e.g. "SC-2026-000123"
  campaignId: string;
  guardianId: string; // userId
  species: string;
  plantingDate: string; // ISO 8601 date
  location: string;
  currentStatus: TreeStatus;
  consecutiveNeedsAttentionCount: number; // drives NGO alerts (§12)
  createdAt: string; // ISO 8601 timestamp
}

export interface TreeUpdate {
  id: string;
  treeId: string;
  guardianId: string;
  photoUrl: string | null; // nullable if text-only update; at least one of photo/text required
  textNote: string | null;
  aiStatus: AiStatus;
  aiCareRecommendation: string; // short string
  aiConfidenceNote?: string; // optional, plain-language
  submittedAt: string; // ISO 8601 timestamp
}

export interface GuardianAvatar {
  id: string;
  guardianId: string;
  growthStage: GuardianGrowthStage;
  lastUpdatedAt: string; // ISO 8601 timestamp
  missedUpdateStreak: number;
}

export interface Reminder {
  id: string;
  guardianId: string;
  treeId: string;
  dueAt: string; // ISO 8601 timestamp
  sentAt: string | null; // nullable
  status: ReminderStatus;
}

export interface NgoAlert {
  id: string;
  ngoId: string;
  treeId: string;
  reason: string; // e.g. "3 consecutive needs_attention updates"
  createdAt: string; // ISO 8601 timestamp
  resolvedAt: string | null; // nullable
}

// ─── API Response Wrapper (§9) ───────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
