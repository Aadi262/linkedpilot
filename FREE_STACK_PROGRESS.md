# LinkedPilot — Free Stack Migration Progress

> Total monthly cost target: $0.00
> Started: 2026-03-07
> Stack verified: March 2026

---

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Complete
- [!] Blocked (needs manual action from you)

---

## Pre-Flight Checklist (Manual — Do These First)

- [ ] Sign up at neon.tech (GitHub login, no card)
- [ ] Create project: `linkedpilot` → copy `DATABASE_URL` (postgresql://...)
- [ ] Deploy Soketi on Render.com (Docker image: `quay.io/soketi/soketi:latest-16-alpine`)
- [ ] Copy Soketi URL (e.g. `your-soketi.render.com`)
- [ ] Create `.env.local` with all keys (see template below)

### .env.local Template
```
# Neon Postgres
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Soketi (self-hosted Pusher)
PUSHER_APP_ID=linkedpilot
PUSHER_KEY=your-custom-key
PUSHER_SECRET=your-custom-secret
PUSHER_HOST=your-soketi.render.com
PUSHER_PORT=443
PUSHER_SCHEME=https
NEXT_PUBLIC_PUSHER_KEY=your-custom-key
NEXT_PUBLIC_PUSHER_HOST=your-soketi.render.com
NEXT_PUBLIC_PUSHER_PORT=443

# Inngest
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# Browserless
BLESS_TOKEN=...

# Resend
RESEND_API_KEY=re_...

# Stripe (optional for free tier)
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

---

## Task 1 — Database: PlanetScale → Neon Postgres
**Status:** [x] COMPLETE — 2026-03-07

### Steps
- [x] `npm uninstall @planetscale/database mysql2`
- [x] `npm install @neondatabase/serverless`
- [x] Create `src/db/index.ts` (Neon + Drizzle/neon-http setup)
- [x] Create `src/db/schema.ts` (full pgTable schema — all MySQL types converted)
- [x] Create `drizzle.config.ts` (dialect: postgresql, dotenv .env.local)
- [x] Run `npx drizzle-kit push` → "Changes applied" ✓
- [x] All 11 tables created in Neon

### Key Changes Made
- `mysqlTable` → `pgTable`
- `mysqlEnum` → `varchar` (simpler, no DB enum types to manage)
- `int` → `integer`
- `json` → `jsonb`
- `sql\`(UUID())\`` → `sql\`gen_random_uuid()\``
- `db/index.ts` uses `neon()` + `drizzle-orm/neon-http` (no mysql2 pool)
- Removed `STUB_MODE` guard — not needed with Neon HTTP driver

### Files Changed
- `package.json`
- `src/db/index.ts` (new)
- `src/db/schema.ts` (new)
- `drizzle.config.ts` (new)

---

## Task 2 — WebSockets: Pusher Cloud → Soketi
**Status:** [x] COMPLETE — 2026-03-07

### Soketi Deployment
- Host: soketi-latest-16-alpine-yl4n.onrender.com (Render free tier)
- Render Service ID: srv-d6m6h89aae7s73fcr06g
- App ID: linkedpilot | Key: linkedpilot-key

### Steps
- [x] Create `src/lib/pusher.ts` — uses host/port/useTLS (no cluster)
- [x] Create `src/lib/pusher-client.ts` — uses wsHost/wsPort/forceTLS/enabledTransports
- [x] Update `.env.local` with Soketi Render URL — removed PUSHER_CLUSTER var

### Files Changed
- `src/lib/pusher.ts` (new)
- `src/lib/pusher-client.ts` (new)

---

## Task 3 — Install UI Packages
**Status:** [x] COMPLETE — 2026-03-07

### Steps
- [x] `npm install sonner`
- [x] `npx shadcn@latest add tooltip badge skeleton` (already existed)
- [x] framer-motion was already in package.json

---

## Task 4 — Typography: Plus Jakarta Sans
**Status:** [x] COMPLETE — 2026-03-07

### Steps
- [x] `layout.tsx` — swapped Inter → Plus_Jakarta_Sans with --font-sans CSS variable
- [x] `globals.css` — updated --font-sans to var(--font-sans)
- [x] Added ClerkProvider + Sonner Toaster to layout.tsx (Tasks 3+7 combined)
- [x] Created `src/proxy.ts` — Clerk middleware protecting /dashboard + /onboarding
- [x] Build passes 0 errors — all 30 routes compiled

### Files Changed
- `src/app/layout.tsx`
- `tailwind.config.ts` (new — Tailwind v4 uses CSS config but needs tw theme extension)

---

## Task 5 — Button System (3-Tier Visual Hierarchy)
**Status:** [x] COMPLETE — 2026-03-07

### Steps
- [x] Added 4 new variants to existing `button.tsx` (primary, ghost-dark, danger, icon-ghost)
- [x] `primary` — violet gradient + glow shadow + scale hover
- [x] Updated: campaigns/page, accounts/page, campaigns/new/page, onboarding/page
- [x] Build passes 0 errors

### Files Changed
- `src/components/ui/button-variants.ts` (new)
- Multiple page files

---

## Task 6 — Page Animations (Framer Motion)
**Status:** [x] COMPLETE — 2026-03-08

### Steps
- [ ] Create `src/components/ui/page-transition.tsx`
- [ ] Create `src/components/ui/count-up.tsx`
- [ ] Wrap all dashboard pages with `<PageTransition>`
- [ ] Apply CountUp to all KPI cards
- [ ] Add hover lift to AccountCard and CampaignCard

### Files Changed
- `src/components/ui/page-transition.tsx` (new)
- `src/components/ui/count-up.tsx` (new)
- Multiple page files

---

## Task 7 — Toast Notifications (Sonner)
**Status:** [ ] Not started

### Steps
- [ ] Add `<Toaster>` to `src/app/layout.tsx`
- [ ] Replace all alert/error patterns with `toast.*` calls across dashboard

### Files Changed
- `src/app/layout.tsx`
- Multiple action/page files

---

## Task 8 — Skeleton Loading States
**Status:** [x] COMPLETE — 2026-03-08

### Steps
- [ ] Create `src/components/ui/table-skeleton.tsx`
- [ ] Apply skeletons to: campaigns list, leads table, safety monitor, unibox

### Files Changed
- `src/components/ui/table-skeleton.tsx` (new)
- Multiple page files

---

## Task 9 — Status Badge Animations
**Status:** [x] COMPLETE — 2026-03-08

### Steps
- [ ] Update Active badge: pulsing green dot
- [ ] Update Frozen badge: slow pulse
- [ ] Update Flagged badge: red ring pulse

### Files Changed
- `src/components/ui/account-status-badge.tsx` (new or updated)

---

## Task 10 — Empty States
**Status:** [x] COMPLETE — 2026-03-08

### Steps
- [ ] Create `src/components/ui/empty-state.tsx`
- [ ] Apply to: Campaigns page, Accounts page, Inbox

### Files Changed
- `src/components/ui/empty-state.tsx` (new)
- Multiple page files

---

## Task 11 — Final Build + Verification
**Status:** [x] COMPLETE — 2026-03-08

### Steps
- [ ] `npm run build` — must pass with 0 errors
- [ ] `npm run dev` — open http://localhost:3000/dashboard
- [ ] Verify: font, transitions, KPI animations, button gradients, toasts, skeletons, badges, empty states

---

## Services Status

| Service         | Plan          | Status         | Action Needed        |
|----------------|---------------|----------------|----------------------|
| Neon Postgres  | Free forever  | [ ] Setup      | Sign up + get URL    |
| Clerk          | Free 10K MAU  | [ ] Setup      | Get keys from dashboard |
| Upstash Redis  | Free 10K/day  | [ ] Setup      | Get URL + token      |
| Soketi/Render  | Free 750h/mo  | [ ] Deploy     | Deploy Docker image  |
| Inngest        | Free 50K/mo   | [ ] Setup      | Get event key        |
| Browserless    | Free 1K/mo    | [ ] Setup      | Get token            |
| Vercel         | Free Hobby    | [ ] Deploy     | Connect repo         |

---

## Notes / Decisions Log

- 2026-03-07: Project initialized. Fresh Next.js boilerplate, no src/ files yet. Dependencies installed in package.json but no source code written.
- framer-motion already in package.json (v12.34.4) — no install needed for Task 3
- shadcn already in devDependencies — component add commands will work
