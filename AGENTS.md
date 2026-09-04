<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Manual & Debug Testing Conventions

The live tree check-in history renders `textNote` as guardian-submitted notes, and
NGO dashboards surface alerts derived from test check-ins. To keep developer
activity out of what guardians and NGOs see:

- **Never run manual/debug check-ins against real (seeded or production) trees.**
  Use a disposable test tree id (e.g. `SC-TEST-…`) with a dedicated test guardian
  account, and delete all of its data when done: the tree doc, its `treeUpdates`,
  any `ngoAlerts` it created, its `guardianAvatars` doc, the test auth user, and
  its Supabase photos.
- If testing against a real tree is ever unavoidable, prefix the `textNote` with
  `[INTERNAL TEST]` so the artifact is unmistakable and can be cleaned up later.
- Reminder: `npm run seed` overwrites seeded documents by fixed ID — re-running
  it restores seeded trees (including alert counters and status) to their demo
  state, wiping any live check-in results on those trees.
