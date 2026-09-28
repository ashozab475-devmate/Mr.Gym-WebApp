# MrGym — split into two websites

This used to be a single Next.js app. It's now **two separate
websites**, each its own deployable project:

```
mrgym-public/            The public marketing site + /join sign-up form
mrgym-owner-dashboard/   Google-gated owner/staff dashboard
```

## Why two projects

- `mrgym-public` has no login, no member data UI, and only one API
  route (`POST /api/members`, unauthenticated) — a client filling out
  `/join` doesn't need a login and shouldn't be able to reach any
  owner-only data or actions.
- `mrgym-owner-dashboard` has no marketing pages and no `/join` form —
  everything in it (`/dashboard` and every `/api` route) requires a
  signed-in Google account listed in `OWNER_EMAILS`.

They can be deployed to two different domains/subdomains — e.g.
`mrgym.com` and `staff.mrgym.com` — with no shared server process.

## How they're connected

**The two sites share one PostgreSQL database.** That's the entire
connection — no API calls between the two sites, no webhooks, nothing
else to wire up:

1. A client fills out `/join` on `mrgym-public`.
2. That page calls `mrgym-public`'s own `POST /api/members`, which
   inserts a row into the `members` table of the PostgreSQL database at
   `DATABASE_URL`.
3. `mrgym-owner-dashboard` reads from `GET /api/members`, which queries
   that *same* database/table — because both projects' environment
   point at the same `DATABASE_URL`.
4. The dashboard loads members on page load and re-checks every 60
   seconds, so a new sign-up shows up there automatically, already
   linked to that member's record (payment history, status, etc. all
   key off the same PostgreSQL UUID) — no separate account-linking step,
   because there's only ever one copy of the data.

**Set the exact same connection string in both `.env.local` files:**

```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/mrgym
```

For local development, install PostgreSQL and create a `mrgym` database.
For Vercel, provision hosted PostgreSQL (for example, Neon) and set its
`DATABASE_URL` in both Vercel projects. Both deployments must use the
same database URL.

### Vercel deployment

For the outstanding Neon setup and verification checklist, see
[`DATABASE_SETUP.md`](DATABASE_SETUP.md).

Deploy `mrgym-public` and `mrgym-owner-dashboard` as separate Vercel
projects, each with its own root directory. In each project's Production
environment variables, set the same `DATABASE_URL` supplied by your
PostgreSQL provider. Use the provider's SSL-enabled connection string,
keep it secret, and redeploy both sites. Add the dashboard's Google
sign-in variables as described in `mrgym-owner-dashboard/README.md`.

`mrgym-public` has no link to the dashboard anywhere in its nav or
footer — members have no way to discover or reach the owner dashboard
from the public site at all. `mrgym-owner-dashboard`'s login/logo still
link back to the public site via `NEXT_PUBLIC_PUBLIC_SITE_URL`, purely
so staff have a way back to the member-facing site. Either way, these
links are just page navigation, not the data connection — that's the
shared database above.

## Running both locally

```bash
# terminal 1 (with PostgreSQL installed and the mrgym database created)
cd mrgym-public
npm install
cp .env.local.example .env.local   # set DATABASE_URL
npm run dev                         # http://localhost:3000

# terminal 2
cd mrgym-owner-dashboard
npm install
cp .env.local.example .env.local   # same DATABASE_URL + Google OAuth
npm run dev                         # http://localhost:3001
```

Make sure PostgreSQL is running locally and the `mrgym` database exists.

Test the connection: submit `http://localhost:3000/join`, then sign in
at `http://localhost:3001/login` and open `/dashboard` — the member you
just registered should already be there.

### Windows: one-click start for both sites

Each project has its own `start.bat` (dev) and `start-production.bat`
(production) — see each project's README. To launch **both** at once,
double-click `start-both.bat` in this folder: it opens two command
windows, one per site, each running that site's own `start.bat`. Make
sure both `.env.local` files use the same `DATABASE_URL` and PostgreSQL
is running.

## What moved where

| Original file | New location |
|---|---|
| `pages/index.js`, `about.js`, `faq.js`, `join.js` | `mrgym-public/pages/` |
| `pages/login.js`, `pages/dashboard/index.js` | `mrgym-owner-dashboard/pages/` |
| `pages/api/members/index.js` (`POST` only) | `mrgym-public/pages/api/members/index.js` |
| `pages/api/members/index.js` (`GET`, now also owner-gated `POST`), `[id].js`, `[id]/pay.js`, `stats.js`, `dashboard/query.js`, `auth/[...nextauth].js` | `mrgym-owner-dashboard/pages/api/` |
| `lib/store.js`, `lib/postgres.js`, `lib/plans.js` | copied into **both** projects (both need the shared data layer) |
| `lib/auth.js`, `lib/anthropicClient.js` | `mrgym-owner-dashboard/lib/` only |
| `components/Header.jsx`, `Footer.jsx`, `Hero.jsx`, `ProgramSection.jsx`, `TrainersSection.jsx`, `Testimonial.jsx` | `mrgym-public/components/` |
| `components/StatCard.jsx`, `DefaulterBanner.jsx`, `MemberTable.jsx`, `AddMemberModal.jsx`, `PaymentHistoryModal.jsx` | `mrgym-owner-dashboard/components/` |
| `components/Logo.jsx`, `lib/plans.js`, Tailwind/PostCSS config, `styles/globals.css` | copied into **both** (each project is self-contained and buildable on its own) |

Nothing about the fee-cycle logic, plans, or dashboard behavior changed
— this was purely a structural split plus the database-based connection
described above.
