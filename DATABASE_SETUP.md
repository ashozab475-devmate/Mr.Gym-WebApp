# PostgreSQL Setup Checklist

The application code now uses PostgreSQL through `DATABASE_URL`. The public site and owner dashboard must point to the **same Neon database**.

## Setup Tasks

- [x] Create a Neon project named `MrGym` and a `mrgym` database. The project is on the Free plan in AWS US East 2 (Ohio), project ID `sparkling-bar-14455253`.
- [x] Copy Neon’s pooled, SSL-enabled connection string for the `mrgym` database. Keep it private.
- [x] Set the exact same `DATABASE_URL` in `mrgym-public/.env.local` and `mrgym-owner-dashboard/.env.local`.
- [ ] In Vercel, add that same `DATABASE_URL` to both projects’ Production environment variables. Add it to Preview too if preview deployments should connect to Neon.
- [ ] Redeploy both Vercel projects.
- [x] Verify both apps can connect to Neon with `npm run db:check --prefix mrgym-public` and `npm run db:check --prefix mrgym-owner-dashboard`.
- [ ] Submit a test registration at the public site’s `/join` page, then confirm it appears in the owner dashboard.

The app creates the `members` and `payments` tables automatically the first time it accesses the database. No manual schema import is required.

## Current Environment Status

The Neon project and `mrgym` database have been created. The same pooled, SSL-enabled Neon URL is now saved in both gitignored local `.env.local` files, and both apps' `db:check` commands connect successfully. No MongoDB URI/database-name variables remain in those local files.

The local URLs are now configured for Neon. Vercel Console currently requires sign-in, so no Vercel environment variables have been added and no deployment has been triggered.

## Existing MongoDB Data

The application no longer reads or writes MongoDB, and there is no MongoDB importer in the repository. Existing MongoDB records have **not** been copied or deleted. Decide whether those records need to be retained before removing the old MongoDB instance or its backups; wiping them is separate and irreversible.

See [CONNECTING_THE_TWO_SITES.md](CONNECTING_THE_TWO_SITES.md) for the relationship between the two apps and [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md) for the Docker-based PostgreSQL deployment.
