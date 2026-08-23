# Sabz Chaon

> Turning "trees planted" into "trees that survive."

Sabz Chaon is a platform connecting NGOs, volunteers, and AI-powered tree monitoring. Every planted tree is traceable to a real Guardian responsible for its long-term care.

**Built for:** Alibaba Cloud AI Hackathon (Bano Qabil × Alibaba Cloud × Cognix)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend + Backend | Next.js (App Router, TypeScript) |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| File Storage | Supabase Storage (not Firebase Storage) |
| AI Vision | Alibaba Cloud Model Studio — Qwen-VL-Plus |
| Styling | Tailwind CSS |
| Hosting | Vercel |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example env file and fill in your real values:

```bash
cp .env.local.example .env.local
```

Required values:
- **Firebase client keys** — from your Firebase project settings (Project Settings → General → Your apps)
- **Firebase Admin keys** — generate a service account key (Project Settings → Service accounts → Generate new private key)
- **Supabase keys** — from your Supabase project settings (Settings → API)
- **Alibaba Cloud / DashScope keys** — from Alibaba Cloud Model Studio console

### 3. Seed Firestore with demo data

```bash
npx tsx scripts/seed.ts
```

This populates Firestore with sample NGOs, campaigns, users, trees, and tree updates for development and demo purposes.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
/app
  /(ngo)          — NGO Coordinator pages (dashboard, campaigns, alerts)
  /(volunteer)    — Volunteer/Guardian pages (browse campaigns, my trees)
  /api            — REST API routes
  /auth           — Authentication pages
/components
  /ngo            — NGO-specific UI components
  /volunteer      — Volunteer-specific UI components
  /shared         — Shared UI components
/lib
  /firebase.ts    — Firebase client + admin SDK initialization
  /ai             — AI vision analysis (treeHealth.ts)
  /storage        — Supabase file upload utilities
/types
  /entities.ts    — Canonical TypeScript types for all data entities
/scripts
  /seed.ts        — Firestore seed script for demo data
```

---

## Key Files

| File | Purpose |
|---|---|
| `types/entities.ts` | Canonical TypeScript types matching the data model — all code references these |
| `lib/firebase.ts` | Firebase client + admin SDK init (reads from env vars) |
| `lib/storage/uploadTreePhoto.ts` | Supabase Storage upload for tree photos |
| `firestore.rules` | Firestore security rules |
| `.env.local.example` | All required environment variable keys |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx tsx scripts/seed.ts` | Seed Firestore with demo data |

---

## Team

This project is built by 4 teammates working in parallel on distinct parts:
- **Part 1** — Foundation, Auth & Infrastructure
- **Part 2** — NGO Side (Campaigns, Dashboard, Alerts)
- **Part 3** — Volunteer/Guardian Side (Campaigns, Trees, Updates)
- **Part 4** — AI Health Check, Gamification & Reminders
