# MrGym VPS Deployment

This setup runs the public website, owner dashboard, and PostgreSQL on one VPS
using Docker Compose. Caddy routes the two domains and obtains HTTPS
certificates automatically. PostgreSQL and the Next.js containers are not
published directly to the internet.

## Requirements

- A Linux VPS with a public IPv4 address and Docker Engine plus the Docker
  Compose plugin installed.
- Two domain names or subdomains, for example `mrgym.example.com` and
  `staff.example.com`.
- A Google OAuth Web Client ID and the owner email addresses.

## Configure the VPS and DNS

1. Add DNS `A` records for both domains pointing to the VPS IPv4 address.
   If using IPv6, configure matching `AAAA` records too.
2. In the VPS firewall, allow SSH and inbound TCP ports 80 and 443. Allow
   UDP port 443 for HTTP/3 if desired. Do not open PostgreSQL port 5432 or
   application ports 3000/3001 to the public internet.
3. Install Docker Engine and the Docker Compose plugin using the official
   instructions for the VPS operating system.
4. Upload or clone this repository onto the VPS.

## Configure secrets and Google sign-in

From the repository directory on the VPS:

```sh
cp .env.vps.example .env.vps
```

Edit `.env.vps` and replace every example value. `PUBLIC_DOMAIN` and
`DASHBOARD_DOMAIN` must be hostnames only, with no `https://` or trailing
slash. Use a long alphanumeric value for `POSTGRES_PASSWORD`; generate
one with `openssl rand -hex 24`. Generate
`NEXTAUTH_SECRET` with `openssl rand -base64 32`.

In Google Cloud Console, configure the OAuth consent screen and the Web
Client ID. Add the dashboard origin, for example
`https://staff.example.com`, under **Authorized JavaScript origins**. This
app uses Google Identity Services and does not require an OAuth redirect URI.
Put the client ID in `GOOGLE_CLIENT_ID` and the allowed owner emails in
`OWNER_EMAILS`.

Keep `.env.vps` private. Do not commit it or send it in chat.

## Start the sites

After DNS has propagated and ports 80/443 can reach the VPS:

```sh
docker compose --env-file .env.vps up -d --build
docker compose --env-file .env.vps ps
```

Caddy will request HTTPS certificates for both domains. Open the public
domain to check the website, then open `https://<dashboard-domain>/login`
and sign in with an address listed in `OWNER_EMAILS`.

Submit a test registration at the public site's `/join` page and confirm it
appears in the owner dashboard. Both apps use the same PostgreSQL database.

## Update and operate

To deploy a later code update:

```sh
git pull
docker compose --env-file .env.vps up -d --build
```

View logs with:

```sh
docker compose --env-file .env.vps logs -f public dashboard postgres caddy
```

PostgreSQL data is kept in the `postgres_data` Docker volume. Set up
regular, off-server backups before using the site with real member data;
a Docker volume alone is not a backup. Removing the volume permanently
deletes its data, so take a backup before recreating the database.