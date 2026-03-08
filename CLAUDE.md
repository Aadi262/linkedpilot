# LinkedPilot — CLAUDE.md

## What This Is
LinkedPilot is a LinkedIn outreach automation SaaS (HeyReach clone).
Built on the Free Stack — $0/month to run at launch.

## Tech Stack
| Layer         | Service                        | Free Limit                    |
|--------------|-------------------------------|-------------------------------|
| Framework    | Next.js 16 (App Router)        | Vercel Hobby — free forever   |
| Database     | Neon Postgres (Drizzle ORM)    | 0.5GB, 100 CU-hours/month     |
| Auth         | Clerk                          | 10,000 MAU                    |
| Cache        | Upstash Redis                  | 10,000 commands/day           |
| WebSockets   | Soketi (self-hosted on Render) | 750 hours/month               |
| Jobs         | Inngest                        | 50,000 executions/month       |
| Browser      | Browserless.io                 | 1,000 sessions/month          |
| Email        | Resend                         | 3,000 emails/month            |

## Project Structure
```
src/
  app/
    layout.tsx          — Root layout (font, Clerk, Toaster)
    page.tsx            — Landing / redirect
    dashboard/          — All authenticated pages
      overview/
      campaigns/
      inbox/
      analytics/
      safety/
      settings/
  components/
    ui/                 — shadcn + custom components
  db/
    index.ts            — Drizzle + Neon client
    schema.ts           — All pgTable definitions
  lib/
    pusher.ts           — Server-side Soketi/Pusher
    pusher-client.ts    — Browser-side PusherJS
    redis.ts            — Upstash Redis client
  inngest/
    client.ts           — Inngest client
    functions/          — Background job functions
```

## Key Conventions
- ORM: Drizzle with Neon HTTP driver (`drizzle-orm/neon-http`)
- Tables: all use `pgTable` from `drizzle-orm/pg-core`
- Auth: Clerk middleware wraps all `/dashboard/*` routes
- WebSockets: Pusher SDK pointing to self-hosted Soketi (NOT Pusher cloud)
  - Server: `host` + `port` + `useTLS` (no `cluster`)
  - Client: `wsHost` + `wsPort` + `forceTLS` + `enabledTransports: ['ws','wss']`
- Styling: Tailwind v4 + shadcn/ui + framer-motion
- Font: Plus Jakarta Sans via `next/font/google`
- Toasts: Sonner (`toast.success`, `toast.error`, `toast.loading`)
- Icons: lucide-react

## Environment Variables
See `.env.local` — copy from FREE_STACK_PROGRESS.md template.

## Progress Tracking
See `FREE_STACK_PROGRESS.md` for task-by-task status.

## Build Command
```
npm run build   # must pass 0 errors before each commit
npm run dev     # local dev server
```

## Do Not
- Use `mysqlTable` — always `pgTable`
- Use `cluster` in Pusher config — use `host`/`port`/`useTLS`
- Import from `@planetscale/database` — use `@neondatabase/serverless`
- Add paid dependencies
