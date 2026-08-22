# Sabz Chaon — Project Context Document
### Alibaba Cloud AI Hackathon (Bano Qabil × Alibaba Cloud × Cognix) — Team Context File for Qoder / Qmind

> **How to use this file:** Upload this exact document into Qoder's Qmind (or equivalent knowledge/context source) on all four teammates' machines. Every prompt any teammate writes to their Coder agent should be interpreted **in the context of this document**. Do not let individual Coders invent their own naming, data shapes, endpoints, or stack choices — if something isn't covered here, add it to this file first (via a shared PR/update) rather than letting one Coder improvise it locally. This keeps all four independent Coder sessions converging on the same codebase shape.

---

## 1. Elevator Pitch

**Sabz Chaon** is a platform that turns "trees planted" into "trees that survive." NGOs run plantation campaigns and recruit volunteers. Every volunteer who plants a tree becomes that tree's **Guardian**, responsible for periodic photo/text check-ins. An AI vision model analyzes each photo and returns a simple health status (Healthy / Needs Attention) plus basic care advice. Guardians are gamified with a growing/wilting virtual plant tied to their update consistency, and NGOs get a dashboard showing real survival data, not just planting counts.

---

## 2. Problem & Gap

- **The problem:** Plantation campaigns measure success by trees planted, not trees that survive. After the planting event, there is little to no continuous monitoring. Trees die from lack of water, disease, pests, or neglect, and NGOs typically don't know which specific trees need help.
- **The gap:** No lightweight, individual-tree-level accountability system exists that connects the volunteer who planted a tree to its long-term care, backed by AI-assisted health checks.
- **Our fix:** Connect NGOs, volunteers, and AI-powered tree monitoring in one platform, with every tree traceable to a real person responsible for it.

---

## 3. Users & Personas

| Persona | Role | Goals |
|---|---|---|
| **NGO Coordinator** | Creates and manages campaigns | Recruit volunteers, assign trees, monitor health at scale, get alerted to problem trees, report survival rates |
| **Volunteer / Guardian** | Joins a campaign, plants a tree, becomes its guardian | Join campaigns easily, get assigned tree(s), upload updates with minimal friction, get simple care guidance, stay motivated via gamification |
| *(Future, not MVP)* Public/Donor viewer | Views aggregate impact | Trust/verify NGO impact claims |

Mental model: **NGO = manager, Volunteer = guardian.**

---

## 4. Core Feature Set

These are the 9 features that define scope. Every Coder session should treat these as the canonical feature list — do not add/remove features without updating this doc.

1. **NGO Campaign Creation** — NGOs create plantation campaigns with location, date, number of trees, volunteers needed. Volunteers browse and join open campaigns.
2. **Volunteer → Tree Guardian Assignment** — Volunteers who participate in a drive become guardians; each is assigned at least one specific tree they helped plant.
3. **Guardian Tree Updates** — Guardians periodically upload a photo and/or text update about their assigned tree(s), post-event.
4. **AI Tree Health Check** — Uploaded photo is analyzed by an AI vision model. Output: a status (`healthy` / `needs_attention`) plus a short, non-professional care recommendation. This is explicitly a visible-signs check, not a botanical diagnosis.
5. **Gamified Guardian System** — Each guardian has a virtual plant/avatar reflecting care consistency: regular updates grow it, missed updates wilt it.
6. **Automated Reminders** — Guardians are reminded when their next update is due, to prevent "plant and forget."
7. **NGO Attention Alerts** — Trees repeatedly flagged `needs_attention` trigger an alert so NGO staff can prioritize physical intervention.
8. **NGO Impact Dashboard** — Aggregate view: trees planted, active guardians, health/status breakdown, update completion rate, rough survival rate, trees requiring attention.
9. **Tree Profiles & Unique Tree IDs** — Every tree gets a unique ID and profile (species, campaign, guardian, planting date, location, current health). All updates/photos are tied to that specific tree ID across its lifecycle.

**North star metric:** trees still alive & healthy over time — not trees planted.

---

## 5. Canonical End-to-End Flow

This is the exact sequence the MVP prototype must demonstrate. All feature work maps back to a step here:

```
NGO creates campaign
  → Volunteer joins campaign
    → Volunteer attends drive, becomes Guardian
      → Guardian is assigned a Tree (unique Tree ID created)
        → Guardian uploads a photo update
          → AI analyzes photo → returns health status + care tip
            → Guardian's avatar updates (grows/wilts) based on consistency
            → Tree profile/history updates
            → If repeatedly "needs_attention" → NGO Attention Alert fires
        → Reminder scheduler nudges Guardian before next update is due
      → NGO Dashboard reflects updated aggregate stats in real time
```

---

## 6. Data Model (Canonical Entities)

Use these entity names, fields, and relationships exactly, across all four codebases. Add fields only by updating this doc first.

### `User`
- `id`
- `name`
- `email`
- `role`: `"ngo"` | `"volunteer"`
- `ngoId` (nullable, set if role is `"ngo"` — links to `Ngo`)
- `createdAt`

### `Ngo`
- `id`
- `name`
- `description`
- `contactEmail`
- `createdAt`

### `Campaign`
- `id`
- `ngoId` (owner)
- `title`
- `location` (string; lat/lng optional stretch goal)
- `date`
- `treesPlannedCount`
- `volunteersNeeded`
- `status`: `"upcoming"` | `"active"` | `"completed"`
- `createdAt`

### `CampaignMembership`
- `id`
- `campaignId`
- `userId` (volunteer)
- `joinedAt`
- `becameGuardian`: boolean

### `Tree`
- `id` (unique **Tree ID**, e.g. `SC-2026-000123` — human-readable + system id)
- `campaignId`
- `guardianId` (userId)
- `species`
- `plantingDate`
- `location`
- `currentStatus`: `"healthy"` | `"needs_attention"` | `"unknown"`
- `consecutiveNeedsAttentionCount` (drives NGO alerts)
- `createdAt`

### `TreeUpdate`
- `id`
- `treeId`
- `guardianId`
- `photoUrl` (nullable if text-only update; at least one of photo/text required)
- `textNote` (nullable)
- `aiStatus`: `"healthy"` | `"needs_attention"`
- `aiCareRecommendation` (short string)
- `aiConfidenceNote` (optional, plain-language, e.g. "based on visible leaf discoloration")
- `submittedAt`

### `GuardianAvatar`
- `id`
- `guardianId`
- `growthStage`: integer or enum (e.g. `seedling` → `sprout` → `sapling` → `young_tree` / can wilt back down)
- `lastUpdatedAt`
- `missedUpdateStreak`

### `Reminder`
- `id`
- `guardianId`
- `treeId`
- `dueAt`
- `sentAt` (nullable)
- `status`: `"pending"` | `"sent"` | `"acknowledged"`

### `NgoAlert`
- `id`
- `ngoId`
- `treeId`
- `reason` (e.g. "3 consecutive needs_attention updates")
- `createdAt`
- `resolvedAt` (nullable)

---

## 7. Tech Stack (Locked — do not deviate)

Team did not have a strong preference, so this is the fixed default. **All four teammates must use this exact stack** so Coder output is directly mergeable.

| Layer | Choice | Notes |
|---|---|---|
| Frontend | **Next.js (React + TypeScript), App Router** | Single deployable app; also serves as backend via API routes |
| Backend | **Next.js API routes** (Node.js/TypeScript) | No separate backend service for the hackathon — keeps 4 people from diverging on server setup |
| Database | **Firebase Firestore** | NoSQL, fast to set up, no schema migrations to coordinate across 4 machines |
| Auth | **Firebase Authentication** (email/password + optionally Google sign-in) | Roles (`ngo` / `volunteer`) stored on the `User` document, not in Firebase custom claims (simpler for hackathon) |
| File storage | **Firebase Storage** | For tree update photos |
| AI Vision (Tree Health Check) | **Alibaba Cloud Model Studio — Qwen-VL-Plus (multimodal)** | Chosen because Alibaba Cloud is the hackathon sponsor and provides free credits; also aligns with the "Alibaba Cloud AI Hackathon" theme for judging. If credits/access are an issue, this is swappable — see §10, keep the AI call isolated behind one function. |
| Styling | **Tailwind CSS** | Fast, consistent utility classes reduce visual drift between four people's components |
| Hosting/Deploy | **Vercel** (frontend+API) with Firebase as backend services | One shared deploy target for the demo |
| Notifications/Reminders | In-app + simple scheduled check (cron-style via a Next.js API route triggered on load or a lightweight scheduler) for MVP; no SMS/WhatsApp in MVP |

**Rule for the team:** if anyone's Coder proposes a different framework/library than what's listed above, reject the suggestion and re-prompt referencing this document.

---

## 8. Project / Folder Structure (Canonical)

Every teammate's repo should converge on this shape so merges are painless:

```
/app
  /(ngo)
    /dashboard
    /campaigns
    /campaigns/[campaignId]
    /alerts
  /(volunteer)
    /campaigns            # browse/join
    /my-trees             # guardian's assigned trees
    /my-trees/[treeId]    # tree profile + update form
  /api
    /campaigns
    /campaigns/[id]/join
    /trees
    /trees/[id]
    /trees/[id]/updates
    /guardians/[id]/avatar
    /ai/analyze-tree-photo
    /alerts
  /auth
/components
  /ngo
  /volunteer
  /shared
/lib
  /firebase.ts           # firebase init (client + admin)
  /ai
    /treeHealth.ts        # single isolated function wrapping the AI vision call
  /gamification.ts        # avatar growth/wilt logic
  /reminders.ts
/types
  /entities.ts            # canonical TypeScript types matching §6 exactly
```

---

## 9. API Conventions

- REST-style JSON endpoints under `/api/...`, matching the folder structure in §8.
- Every response follows: `{ success: boolean, data?: ..., error?: string }`
- Entity field names in API responses must match §6 exactly (camelCase, no renaming per-endpoint).
- Auth: every protected route reads the Firebase Auth session/token; role checks (`ngo` vs `volunteer`) happen server-side, not just hidden in the UI.

---

## 10. AI Tree Health Check — Implementation Contract

All four Coders must implement this behind **one single function**, e.g. `lib/ai/treeHealth.ts`, with this exact signature/contract so swapping providers later only touches one file:

```ts
async function analyzeTreePhoto(input: {
  photoUrl: string;
  textNote?: string;
}): Promise<{
  status: "healthy" | "needs_attention";
  careRecommendation: string; // 1-2 short sentences, plain language
  confidenceNote?: string;    // optional plain-language basis, e.g. "yellowing leaves visible"
}>
```

- Default provider: Alibaba Cloud Model Studio Qwen-VL-Plus (see §7). API key/config lives in environment variables only (`.env.local`, never committed).
- Prompt the model to strictly return one of the two status values, plus a short recommendation — explicitly instruct it that this is a **non-professional, visible-signs-only assessment**, not a diagnosis, and to say so if the image is unclear/not a plant.
- If the AI call fails or times out, fall back to `status: "unknown"` in the UI (do not silently default to `"healthy"`).

### 10.1 Concrete API Call (verified against current Alibaba docs, Aug 2026)

> **Model name check:** Alibaba's current Model Studio docs list the vision model as `qwen3-vl-plus` (OpenAI-compatible endpoint) — the older name `qwen-vl-plus` may be deprecated. Confirm in your team's ModelStudio console which exact model name is live under your workspace before hardcoding it. The example below uses `qwen3-vl-plus`; swap if the console shows otherwise.

Qwen-VL models are exposed through an **OpenAI-compatible endpoint**. This is the actual shape `lib/ai/treeHealth.ts` should call:

**Endpoint (Singapore region — use this unless your workspace is China-based):**
```
POST https://{WorkspaceId}.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions
```
(China Beijing region alternative: replace `ap-southeast-1` with `cn-beijing`.)

**Auth header:**
```
Authorization: Bearer {DASHSCOPE_API_KEY}
Content-Type: application/json
```

**Request body shape:**
```json
{
  "model": "qwen3-vl-plus",
  "messages": [
    {
      "role": "system",
      "content": "You are assessing visible plant health from a photo. This is a non-professional, visible-signs-only assessment, not a diagnosis. Respond with strictly one of two status values and a short, plain-language care recommendation. If the image is unclear or not a plant, say so in confidenceNote and default status to needs_attention."
    },
    {
      "role": "user",
      "content": [
        { "type": "image_url", "image_url": { "url": "{photoUrl}" } },
        { "type": "text", "text": "{textNote or 'Assess this tree/plant photo.'}" }
      ]
    }
  ]
}
```

- Instruct the model to reply with **only** JSON matching the `analyzeTreePhoto` return contract above (no preamble, no markdown fences), then `JSON.parse` the response with a try/catch that falls back to `status: "unknown"` per the rule above.
- Region note: if signup was done via the Singapore/international console, use `ap-southeast-1`; if via the China console, use `cn-beijing` — pick one and set it via `DASHSCOPE_REGION` in `.env.local`, don't hardcode per-request.

---

## 11. Gamification Logic (Canonical Rules)

- Each `GuardianAvatar` has a `growthStage` that increases by one step per on-time update, and decreases by one step per missed reminder window.
- Suggested stages: `seedling → sprout → sapling → young_tree` (4 stages is enough for MVP demo).
- `missedUpdateStreak` resets to 0 on any submitted update.
- This logic lives in `lib/gamification.ts` as a pure function — do not duplicate this logic in the UI layer or in multiple API routes.

---

## 12. NGO Alerts Logic

- `Tree.consecutiveNeedsAttentionCount` increments when an update's `aiStatus === "needs_attention"`, resets to 0 on a `"healthy"` update.
- When `consecutiveNeedsAttentionCount` reaches **3**, create an `NgoAlert` (if one isn't already open for that tree).
- NGO dashboard and a dedicated `/alerts` view surface open alerts.

---

## 13. Naming & Coding Conventions

- Language: **TypeScript everywhere**, strict mode on.
- Variables/functions: `camelCase`. Types/interfaces/components: `PascalCase`. Files for components: `PascalCase.tsx`; utility files: `camelCase.ts`.
- Entity/field names must exactly match §6 — do not invent synonyms (`treeId` not `tree_id` or `id_tree`).
- Comments: only where logic isn't self-evident (e.g., gamification thresholds, AI prompt reasoning).
- Commit messages: `feat: ...`, `fix: ...`, `chore: ...` (Conventional Commits) to keep four people's git history mergeable.
- No inline hardcoded strings for status values — use the shared enums/types from `/types/entities.ts`.

---

## 14. MVP Scope for the Hackathon (Deadline: 27 August 2026)

**In scope (must demo):**
- NGO: create campaign, view campaign list, view dashboard, view alerts.
- Volunteer: browse/join campaign, get marked as guardian, see assigned tree(s), submit an update (photo/text).
- AI vision call returns status + recommendation for an uploaded photo.
- Avatar grows/wilts based on update history.
- Basic reminder concept (can be a visible in-app "due" banner rather than a real push/SMS system for the demo).
- NGO alert triggers after repeated `needs_attention`.
- Tree profile page showing full update history for a tree.

**Explicitly out of scope for MVP** (mention as "future roadmap" per the pitch, don't build):
- GPS-based live tracking, QR codes per tree
- WhatsApp/SMS integration
- Weather/rainfall data integration
- Species-specific advanced care logic
- Multi-NGO marketplace / cross-NGO analytics
- Payment/donation flows

If a teammate's Coder starts building something in the "out of scope" list, stop and redirect it back to the MVP list.

**Seed data for demo:** Add a `scripts/seed.ts` (run once against Firestore) so dashboards, alerts, and tree profiles aren't empty during development/judging:
- 1–2 `Ngo` records
- 2–3 `Campaign` records (mix of `upcoming`/`active`/`completed` status)
- 5–8 `User` records (mix of `ngo`/`volunteer` roles)
- 6–10 `Tree` records with a few already at `consecutiveNeedsAttentionCount: 2` so one more update triggers the `NgoAlert` live on stage
- A handful of `TreeUpdate` records with varied `aiStatus` so the dashboard's health breakdown chart isn't a single color

Owner: whoever's free after finishing their Part — this isn't in §19's split, so flag it in your team sync.

---

## 15. Non-Functional Notes

- This is a hackathon prototype: prioritize a working end-to-end demo over production hardening (but don't skip basic auth/role checks — judges may poke at it).
- Keep the AI vision integration isolated (§10) so it can be demoed live without fragile dependencies.
- Since this is built by 4 people in parallel, favor small, independently deployable pieces (one page/route at a time) over large shared files, to minimize merge conflicts.

---

## 16. Environment Variables (Canonical List)

All four teammates' `.env.local` must define these exact keys (get real values from whoever does Firebase/Alibaba setup in Part 1/Part 4, do not invent your own names):

```
# Firebase (client-side, safe to expose per Next.js NEXT_PUBLIC_ convention)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server-side only, never NEXT_PUBLIC_)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Alibaba Cloud Model Studio (server-side only)
DASHSCOPE_API_KEY=
DASHSCOPE_WORKSPACE_ID=
DASHSCOPE_REGION=ap-southeast-1
```

Add a `.env.local.example` with these keys (blank values) to the repo root so all four people scaffold identically.

---

## 17. Firestore Security Rules (Minimum Viable)

§9 covers server-side role checks in API routes, but the Firebase client SDK also needs Firestore rules — without them the database is wide open regardless of API-route checks. Minimum for the MVP demo:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() { return request.auth != null; }
    function isOwner(userId) { return request.auth.uid == userId; }

    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isOwner(userId);
    }

    match /campaigns/{campaignId} {
      allow read: if true; // public browse per feature 1
      allow write: if isSignedIn(); // tighten to ngo role via a custom claim or lookup if time allows
    }

    match /trees/{treeId} {
      allow read: if true;
      allow write: if isSignedIn();
    }

    match /treeUpdates/{updateId} {
      allow read: if true;
      allow create: if isSignedIn();
      allow update, delete: if false; // updates are append-only per the tree history model
    }

    match /{document=**} {
      allow read, write: if false; // deny-by-default for anything not listed above
    }
  }
}
```

This is intentionally loose (hackathon-speed, not production) but closes the "wide open by default" hole. Part 1 owner should drop this into the Firebase console before demo day.

---

## 18. Glossary

- **Guardian** — a volunteer who has been assigned responsibility for a specific planted tree.
- **Tree ID** — the unique identifier for a single physical tree, tying together its species, campaign, guardian, and full update history.
- **Needs Attention** — AI-flagged status indicating visible signs of poor tree health (not a diagnosis).
- **Survival rate** — rough NGO dashboard metric estimating the proportion of trees still marked healthy/active over time.

---

## 19. Team Work Division (4 Members)

The stack in §7 is deliberately a single Next.js app with Firebase — chosen partly *because* it lets four people work in parallel on separate route/component folders without a separate backend service to coordinate. The split below follows §15's rule ("small, independently deployable pieces... to minimize merge conflicts") by giving each person their own vertical slice of the folder structure in §8, rather than splitting by layer (e.g. "one person does all frontend").

**Sequencing note:** Part 1 (Foundation) unblocks everyone else. Get `/types/entities.ts`, Firebase project setup, and auth working first (day 1, ideally one person sprints this while the others scaffold UI shells against mock data), then Parts 2–4 run fully in parallel.

### Part 1 — Foundation, Auth & Infrastructure
*Owns the plumbing everyone else builds on top of.*

- Firebase project setup: Firestore, Auth, Storage — and `lib/firebase.ts` (client + admin init)
- `/types/entities.ts` — canonical TypeScript types matching §6 exactly (this is the contract the other three parts code against, so it must exist and be correct on day 1)
- `/app/auth` — sign up / log in (email+password, optional Google), role selection (`ngo` / `volunteer`)
- Server-side role-check middleware/helper (used by every protected API route per §9)
- Shared layout, navigation shell, and `/components/shared` (nav bar, protected-route wrapper, toast/notification UI, loading/error states)
- Vercel deployment pipeline + environment variable setup (`.env.local` conventions per §10)
- Maps to feature: none directly — this is the cross-cutting backbone for all 9 features

### Part 2 — NGO Side: Campaigns, Dashboard & Alerts
*Owns everything an NGO Coordinator persona touches.*

- `/app/(ngo)/campaigns` and `/campaigns/[campaignId]` — create campaign, view/manage campaign, close out a campaign (which triggers guardian assignment, coordinating with Part 3)
- `/app/(ngo)/dashboard` — trees planted, active guardians, health breakdown, update completion rate, survival rate (§8 aggregate stats)
- `/app/(ngo)/alerts` — open `NgoAlert` list, resolve alert action
- `/api/campaigns`, `/api/campaigns/[id]/join` (join endpoint's data shape only — Part 3 owns the volunteer-facing join UI), `/api/alerts`
- Alert-triggering logic per §12 (`consecutiveNeedsAttentionCount` → `NgoAlert` creation) — this hooks into Part 4's AI result, so agree on the trigger point together
- Maps to features: **1 (NGO half), 8, 12**

### Part 3 — Volunteer/Guardian Side: Campaigns, Trees & Updates
*Owns everything a Volunteer/Guardian persona touches, end-to-end for a single tree.*

- `/app/(volunteer)/campaigns` — browse/join open campaigns (volunteer-facing UI calling Part 2's join endpoint)
- Guardian assignment flow — when an NGO closes out a campaign, create `CampaignMembership.becameGuardian = true` and generate `Tree` records with unique Tree IDs (format per §6, e.g. `SC-2026-000123`)
- `/app/(volunteer)/my-trees` and `/my-trees/[treeId]` — guardian's tree list + full tree profile (species, campaign, planting date, location, status, complete update history)
- Update submission form (photo upload to Firebase Storage + optional text note) → `/api/trees/[id]/updates`
- `/api/trees`, `/api/trees/[id]`, `/api/trees/[id]/updates`
- Maps to features: **1 (volunteer half), 2, 3, 9**

### Part 4 — AI Health Check, Gamification & Reminders
*Owns the "intelligence" layer — what happens after a photo is submitted.*

- `lib/ai/treeHealth.ts` — the isolated `analyzeTreePhoto()` function per §10's exact contract, calling Alibaba Cloud Model Studio Qwen-VL-Plus; prompt engineering for the healthy/needs_attention + care-recommendation output; failure fallback to `"unknown"`
- `/api/ai/analyze-tree-photo` — endpoint wrapping that function, called when Part 3's update form submits
- `lib/gamification.ts` — pure `growthStage` calculation per §11 (seedling → sprout → sapling → young_tree, wilt on missed streaks)
- `/api/guardians/[id]/avatar` + avatar UI component (used inside Part 3's `my-trees` pages, so agree on the component's props interface early)
- `lib/reminders.ts` + reminder scheduling logic (§7 — in-app "due" banner for MVP, no SMS/push)
- Maps to features: **4, 5, 6**

### Shared Interfaces to Agree On Before Splitting Up

Even though the parts are independent, these three touchpoints need a 10-minute sync so nobody blocks on nobody:

1. **`/types/entities.ts`** (Part 1 delivers, everyone consumes) — must be finalized before Parts 2–4 write real API calls.
2. **Avatar component props** (Part 4 builds the component, Part 3 embeds it in the tree profile page) — agree on the interface, not just the visuals.
3. **The `analyze-tree-photo` → `TreeUpdate` → alert-trigger chain** (Part 3 submits the update, Part 4 returns the AI status, Part 2 reacts to `consecutiveNeedsAttentionCount`) — walk through this one sequence together so the handoff between all three is clear.

---

## 20. Instructions for the Team

1. Upload this file (as-is) into each of the 4 Coder tools' Qmind/knowledge context.
2. When prompting your Coder for any feature, explicitly reference the relevant section number from this doc (e.g., "Build the `/api/trees/[id]/updates` endpoint per §8 and §6 `TreeUpdate` schema").
3. If you need to change a name, add a field, or change the stack, propose the change to the team first and edit this master file — then have everyone re-sync it into their Qmind before continuing.
4. Keep PRs small and scoped to one feature (§14) at a time.
5. Each teammate should also reference their assigned Part from §19 at the start of their sessions (e.g., "I'm working on Part 3 — Volunteer/Guardian Side. Build the guardian assignment flow per §19 Part 3 and §6 `Tree`/`CampaignMembership` schemas") so each Coder session stays scoped to that person's slice of the codebase.
