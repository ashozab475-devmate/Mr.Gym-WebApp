# MrGym — Public Website

The public-facing half of MrGym: the marketing site and the member
**join/registration** form. This is one of two separate projects — the
staff/owner dashboard lives in the sibling `mrgym-owner-dashboard`
project. See `../CONNECTING_THE_TWO_SITES.md` for how they fit together.

## What's included

- **`/`** — landing page (hero, programs, trainers, testimonials, footer).
- **`/about`** — about page.
- **`/faq`** — FAQ page.
- **`/join`** — member sign-up form (Without Cardio PKR 1500/mo, With
  Cardio PKR 3000/mo). Submitting it calls this site's own
  `POST /api/members`, which writes straight into the **shared MongoDB
  database** — the same database the owner-dashboard site reads from.
  No login required to submit this form, same as before.
This site has **no** login link, no owner dashboard, and no member
list/editing UI anywhere in its nav or footer — all of that now lives
only in `mrgym-owner-dashboard`, at its own separate URL, not linked
from this site at all.

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Edit `.env.local`:

```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=mrgym
```

`MONGODB_URI`/`MONGODB_DB` must match the owner-dashboard project's
values exactly — see `../CONNECTING_THE_TWO_SITES.md`.

```bash
npm run dev
```

Runs on `http://localhost:3000` by default.

For production:

```bash
npm run build
npm start
```

### Windows: one-click start

Two double-clickable scripts are included (require [Node.js](https://nodejs.org)
and a reachable MongoDB connection - see above):

- **`start.bat`** - installs dependencies on first run, then starts the
  dev server on port 3000 and opens your browser. Use this while
  you're still editing the code - changes show up instantly.
- **`start-production.bat`** - installs dependencies if needed, builds
  an optimized version, then serves it. Use this for regular use.

To run this site **and** the owner dashboard together, see
`../start-both.bat` in the parent folder, or just double-click this
project's `start.bat` and the dashboard's `start.bat` separately.

## Tech stack

Next.js 14 (Pages Router), React 18, MongoDB driver, Tailwind CSS,
self-hosted fonts via `@fontsource`.
