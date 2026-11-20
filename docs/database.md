# Supabase PostgreSQL setup

FlinT supports two separate workspaces: an unsigned local tracker and an authenticated cloud tracker. A **PostgreSQL connection string is not a Supabase API URL**. A Neon database does not supply Supabase Auth, Data API, `auth.users`, or `auth.uid()`. Do not run this migration directly on Neon. Never place a PostgreSQL URI, password, secret key or `service_role` key in Vite environment variables. Rotate any database password previously shared in chat.

## Connect a Supabase project

1. Choose a Supabase project you own (use staging first). Back up existing data before applying schema changes.
2. Apply `supabase/migrations/20261120000100_tracker.sql` **once** in that project's SQL Editor. Alternatively, from this checkout, run `npx supabase login`, `npx supabase link --project-ref <your-project-ref>`, `npx supabase db push --dry-run`, then `npx supabase db push`. Supply any required CLI credentials privately, not in chat. The SQL Editor and CLI are alternatives; don't apply the migration twice.
3. Enable the **Data API** with `public` exposed. Leave `flint_private` unexposed. Enable **Email** in Authentication providers and allow email signups (or pre-create the intended users). Configure Auth **Site URL** and allowed **Redirect URLs** for your app origin/path. For public production sign-in, configure an email provider/SMTP and appropriate rate limits.
4. Copy `.env.example` to `.env.local`. From the project's Connect dialog, set `VITE_SUPABASE_URL` to its HTTPS Project URL and `VITE_SUPABASE_PUBLISHABLE_KEY` to its **publishable** `sb_publishable_…` key. Set the same two public build-time variables in your hosting environment, then restart Vite or rebuild/redeploy. `.env.local` is gitignored.
5. Open **Settings → Cloud workspace** and request an email sign-in link. A new account starts empty. Anonymous sample records are **not** automatically uploaded. To migrate existing data, export a JSON backup before signing in, then import it into the intended account (replaces its records).
6. Log an activity, check a habit, and reload after the saving indicator clears. Sign in to the same account on another browser to check persistence. A different account should see a separate workspace. Signing out returns to the unchanged local tracker.

## Schema

| Private table | Key | Stored data |
|---|---|---|
| `workspaces` | `owner_id` → `auth.users.id` | One workspace per account, optimistic revision, sample flag, last write time |
| `pillar_goals` | `(owner_id, pillar)` | Daily goal, 1–1440 minutes per Soul/Mind/Body pillar |
| `activities` | `(owner_id, id)` | Name, pillar, local date and time, duration; indexed by owner/pillar/date |
| `habits` | `(owner_id, id)` | Name, pillar, hex color, display order |
| `habit_checkins` | `(owner_id, habit_id, completed_on)` | At most one check-in per habit and local day; composite FK to the same owner's habit |
| `milestones` | `(owner_id, id)` | Career lesson/project name, completion, order |

`auth.users → workspaces → activities / pillar_goals / milestones / habits → habit_checkins`. Foreign keys cascade on deletion. IDs are text to preserve local backup IDs. Metrics and chart series are derived, not stored. Connected apps still own their data; no third-party credentials are stored here.

## Access and synchronization

- All six tables have row-level security with read/update/delete and insert checks based on the authenticated user's ID. Unauthenticated clients have no access. The two public RPC functions use **security invoker**, not security definer.
- `flint_load_workspace()` returns one consistent snapshot for the caller, or null for a new account. Signed-in startup waits for this read before allowing writes. A failed load cannot replace a workspace with local sample data.
- `flint_save_workspace(expected_owner, expected_revision, workspace)` atomically validates and replaces the caller's tracking rows. The owner guard prevents a queued write from crossing accounts after a session change. A stale revision fails with `40001`; constraint failures roll back the whole transaction.
- The client serializes saves and coalesces changes made during a pending request. A conflict pauses writes: export unsaved edits if needed, then reload. Failed writes remain in tab memory until retried; cloud-mode records are not cached under the guest storage key. This is **not** an offline cloud cache or realtime multi-device merge. Other devices' changes are loaded on reopen/reload.
- Snapshot replacement is deliberately scoped to small personal workspaces. For larger workloads, migrate to per-record writes and paginated date-range reads. JSON export remains available in both modes.

## Verification

`npm test` runs the actual migration on an embedded PostgreSQL engine (PGlite) with test-only equivalents of Supabase Auth roles and user IDs. Tests cover round-trip persistence, RLS isolation, denied anonymous access, rejected stale writes, rollback, check-ins and clear/reset. These local tests do **not** verify a hosted project's SMTP, API settings or deployment. Use the sign-in/reload steps above for that final check.
