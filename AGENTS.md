# AGENTS.md — Humor Admin

## Stack
- **Framework**: Next.js 15 (App Router, TypeScript)
- **Database**: Supabase (Postgres) — shared class staging DB
- **Auth**: Supabase Auth + Google OAuth
- **Styling**: Tailwind CSS v3
- **Deployment**: Vercel

## Commands
- `npm run dev` — start local dev server (port 3000)
- `npm run build` — production build (run before deploying)
- `npm run lint` — lint the project

## Project Structure
```
src/
  app/
    layout.tsx           # Root layout
    page.tsx             # Redirects to /dashboard
    login/page.tsx       # Google sign-in page
    auth/callback/       # OAuth callback route
    dashboard/
      layout.tsx         # Sidebar nav + auth/superadmin guard
      page.tsx           # Stats dashboard
      users/page.tsx     # Profiles (READ only)
      images/
        page.tsx         # Images (CRUD)
        ImageManager.tsx # Client components for image CRUD
        actions.ts       # Server actions for image mutations
      captions/page.tsx  # Captions (READ only)
  lib/supabase/
    client.ts            # Browser Supabase client
    server.ts            # Server Supabase client (uses cookies)
  components/
    SignOutButton.tsx     # Client sign-out button
  middleware.ts          # Auth + superadmin guard for all routes
```

## Auth Rules
- ALL routes behind `/dashboard` require:
  1. Authenticated Google account
  2. `profiles.is_superadmin == TRUE`
- Middleware enforces this at the edge.
- Do NOT relax this check without explicit instruction.

## Database Rules
- **DO NOT** create tables, add columns, or modify RLS policies.
- **DO NOT** use the Supabase service key on the client side.
- The anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is safe for browser use.
- Mutations respect existing RLS policies. If an insert/update fails with RLS errors, do not disable RLS — debug the policy instead.

## Key Tables
- `profiles` — user data, has `is_superadmin` boolean. READ only in this app.
- `images` — image URLs and metadata. Full CRUD allowed.
- `captions` — AI-generated captions. READ only in this app.
- `caption_votes` — upvote/downvote records. READ only in this app.

For full schema details, refer to Supabase dashboard → Table Editor.

## Workflow Rules
1. Inspect files before editing — don't assume structure.
2. Run `npm run build` before flagging something as done.
3. Avoid broad refactors; prefer targeted, minimal changes.
4. Keep a running note of what changed when making multiple edits.
5. Server actions live in `actions.ts` files beside their page.
6. Use Server Components for data fetching; Client Components only when interactivity is required.

## Changelog

### 2026-04-17
- **Dashboard (`src/app/dashboard/page.tsx`)**: Replaced the "Top Caption Authors" panel with a "Caption Rating Stats" panel. The new panel shows:
  - Rating coverage (how many captions have received at least one vote, with a progress bar)
  - Average votes per rated caption
  - Net score distribution (count of captions with positive, neutral, and negative net scores)
  - Most voted captions (top 3 by total vote volume, showing vote count and net score)
- Consolidated data fetching: replaced three separate `caption_votes` queries with a single query (limit 5,000) that drives all stats computation. Also removed the `captions.select("author_id")` query that was only used for the author leaderboard.

## Portfolio documentation update
- Added root README with project scope, access requirements, and local setup prerequisites. No runtime or authorization changes.
