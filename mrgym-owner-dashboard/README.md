# MrGym — Owner Dashboard

The staff/owner half of MrGym: Google-gated login and the member
fee-tracking dashboard. This is one of two separate projects — the
public marketing + join site lives in the sibling `mrgym-public`
project. See `../CONNECTING_THE_TWO_SITES.md` for how they fit together.

## What's included

- **`/login`** — owner sign-in with Google. Only accounts listed in
  `OWNER_EMAILS` get past this.
- **`/dashboard`** — staff view (Google sign-in required, owners only):
  overdue-defaulter banner, stat cards, searchable/filterable member
  table, mark-paid / payment-history / remove actions, an "Add member"
  form, and an optional AI "Ask about your members" search box.
- **API routes**, all requiring an authenticated owner session:
  - `GET/POST /api/members`
  - `GET/PUT/DELETE /api/members/[id]`
  - `POST /api/members/[id]/pay`
  - `GET /api/stats`
  - `POST /api/dashboard/query` (AI search, needs `ANTHROPIC_API_KEY`)
- **`/api/auth/*`** — NextAuth session routes (Credentials provider that
  verifies a Google Identity Services ID token server-side)

This site has **no** public marketing pages and no `/join` form — those
now live only in `mrgym-public`. Visiting `/` here just redirects to
`/dashboard` (which redirects to `/login` if you're not signed in).

## How members get here

Members never sign up on this site. They register on the public site's
`/join` page, which writes directly into the **same MongoDB database**
this dashboard reads from (`GET /api/members`, refreshed on load and
every 60 seconds). See `../CONNECTING_THE_TWO_SITES.md`.

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Edit `.env.local` — at minimum:

```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=mrgym
NEXT_PUBLIC_PUBLIC_SITE_URL=http://localhost:3000
```

`MONGODB_URI`/`MONGODB_DB` must match the `mrgym-public` project's
values exactly.

Then configure Google sign-in (see the comments in
`.env.local.example`): create an OAuth client in Google Cloud Console,
add `http://localhost:3001` as an Authorized JavaScript origin (not a
redirect URI — sign-in runs client-side via Google Identity Services),
set `NEXT_PUBLIC_GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_ID` (same value in
both),
`OWNER_EMAILS`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`).

`ANTHROPIC_API_KEY` is optional — only needed for the AI search box.

```bash
npm run dev
```

Runs on `http://localhost:3001` by default (a different port from the
public site, since these are now two separate apps).

For production:

```bash
npm run build
npm start
```

### Windows: one-click start

Two double-clickable scripts are included (require [Node.js](https://nodejs.org),
a reachable MongoDB connection, and Google sign-in configured - see
above):

- **`start.bat`** - installs dependencies on first run, then starts the
  dev server on port 3001 and opens your browser to `/login`. Use this
  while you're still editing the code - changes show up instantly.
- **`start-production.bat`** - installs dependencies if needed, builds
  an optimized version, then serves it. Use this for regular front-desk
  use.

To run this site **and** the public site together, see
`../start-both.bat` in the parent folder, or just double-click this
project's `start.bat` and the public site's `start.bat` separately.

## Tech stack

Next.js 14 (Pages Router), React 18, MongoDB driver, NextAuth.js
(Google provider), Claude (Anthropic API) for AI search, Tailwind CSS,
self-hosted fonts via `@fontsource`.
