# Dreamon

Dreamon is a Next.js website for Dreamon Interactive, with blog content managed in Sanity and deployed to Cloudflare Workers through OpenNext.

## Scripts

- `npm run dev` starts the local development server on `http://localhost:3000`.
- `npm run build` creates the production build.
- `npm run start` serves the production build.
- `npm run test` runs the Jest test suite.
- `npm run build:worker` creates the Cloudflare Worker bundle with OpenNext.
- `npm run deploy` builds and deploys the site to Cloudflare Workers.

## Sanity

The blog, post detail pages, related posts, and Nyx Legacy updates use Sanity content. The embedded Sanity Studio is available at `/studio` during local development and in production.

Create a local `.env.local` file with:

```text
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-08-27
```

`NEXT_PUBLIC_SANITY_API_VERSION` is optional and defaults to `2026-08-27`.

Add each website origin to Sanity's CORS settings if it needs to access the Studio. For local development, use `http://localhost:3000`. Add the production URL before deploying.

The root layout renders `SanityLive`, so pages using `sanityFetch` update when published Sanity content changes.

## Authentication (Supabase)

User accounts (register, log in, log out, password reset, "stay signed in", role-based access) run on Supabase Auth + Postgres.

Create a Supabase project, then add to `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Get these from the Supabase dashboard under **Project Settings → API Keys** (use the **Publishable key**, not the secret key — the secret/service-role key must never be used in this app).

**One-time setup per Supabase project:**

1. In **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback` (and the production URL later) to **Redirect URLs**. Without this, email confirmation and password-reset links won't work.
2. In **SQL Editor**, run the migration in [`supabase/migrations/0001_profiles_and_roles.sql`](supabase/migrations/0001_profiles_and_roles.sql). This creates the `profiles` table (one row per user, holding their role) and a trigger that auto-creates a profile whenever someone registers.

**Roles:** every user gets one of `admin`, `dev`, or `user` (default: `user`) in `profiles.role`. There is currently no UI to change roles — do it manually in Supabase's Table Editor until an admin panel exists. Users can only read their own role (enforced by Row Level Security), never anyone else's, and cannot change it themselves.

**Where the code lives:**

- `src/lib/supabase/` — Supabase client setup (browser, server, and middleware variants)
- `src/context/auth-context.jsx` — React context exposing `user`, `role`, `signIn`, `signOut` to any client component via `useAuth()`
- `middleware.js` — refreshes the session on every request (needed for "stay signed in")
- `src/app/{login,register,forgot-password,reset-password,account}` — the auth pages
- `src/app/auth/callback/route.js` — handles the links from confirmation/reset emails

## Chat (Supabase)

An internal chat for `dev`/`admin` accounts only — a team channel, an admin-only channel, and 1-on-1 DMs, with file sharing and fenced-code-block rendering. Regular `user` accounts cannot see `/chat` at all (server-side redirect, backed by RLS).

**One-time setup**, after the Authentication setup above: run [`supabase/migrations/0002_chat.sql`](supabase/migrations/0002_chat.sql), then [`0003_fix_dm_channel_policy.sql`](supabase/migrations/0003_fix_dm_channel_policy.sql) and [`0004_fix_channel_members_recursion.sql`](supabase/migrations/0004_fix_channel_members_recursion.sql) — both are small corrections discovered while testing DMs, kept as separate files rather than rewriting `0002` so the migration history stays honest. This also creates the private `chat-files` Storage bucket.

**Design notes:**

- New messages are polled every 4s rather than pushed via Supabase Realtime — Realtime subscriptions connected fine in testing but never delivered `postgres_changes` events for these RLS-protected tables, for a reason we couldn't pin down. Polling is simple and reliable; swap it for Realtime later if someone figures out the root cause.
- The admin file-share log (`/admin/file-log`, admin-only) is powered by the `admin_file_log()` Postgres function, which deliberately never selects `messages.body` — admins can see *which file was shared with whom*, never message content.
- File downloads use short-lived signed URLs (`createSignedUrl`, 60s) since the `chat-files` bucket is private.

**Where the code lives:**

- `src/app/chat/` — the chat UI (channel list, message thread, composer with file/code-block buttons)
- `src/lib/chat/parse-message.js` — splits a message into text/code segments for rendering
- `src/app/admin/file-log/` — the admin-only audit log

## Cloudflare Deployment

The Cloudflare Worker configuration is in `wrangler.jsonc`. Before deploying, make sure the Sanity environment variables are available during the Cloudflare build and that Wrangler is authenticated.

```bash
npm run build:worker
npm run deploy
```

## Project Structure

- Routing is handled by Next.js file-based routes under `src/app`.
- Shared site chrome is applied from the root layout and route-aware shell.
- Sanity schemas and client helpers are in `src/sanity`.
- The embedded Studio is mounted at `src/app/studio/[[...tool]]`.
- Blog listing and blog post pages fetch Sanity data on the server.
- Existing public assets continue to load from `public/images` and `public/fonts`.
