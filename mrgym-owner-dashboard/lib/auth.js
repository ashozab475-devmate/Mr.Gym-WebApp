// Shared NextAuth configuration.
//
// Sign-in uses Google Identity Services (the "Sign in with Google"
// button, loaded client-side) instead of NextAuth's built-in
// GoogleProvider redirect flow. The button runs entirely in the
// browser and hands back a signed ID token directly - no server-side
// redirect to Google, no server-side discovery/token-exchange calls.
// The only thing our server does is verify that token's signature
// (see google-auth-library below), which is a single, well-known,
// heavily-cached request rather than a multi-step OAuth round trip -
// much less likely to hang on flaky networks/firewalls.
//
// Only Google accounts whose email is listed in OWNER_EMAILS (a
// comma-separated env var) are allowed to sign in. Everyone else's
// sign-in attempt is rejected in authorize(), before a session is ever
// created.

import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth/next";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function ownerEmails() {
  return (process.env.OWNER_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isOwnerEmail(email) {
  if (!email) return false;
  return ownerEmails().includes(email.toLowerCase());
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "google-idtoken",
      name: "Google",
      credentials: {
        idToken: { label: "Google ID token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.idToken) return null;

        if (ownerEmails().length === 0) {
          // Misconfiguration guard: without an allowlist, refuse
          // everyone rather than silently letting any Google account in.
          return null;
        }

        let payload;
        try {
          const ticket = await googleClient.verifyIdToken({
            idToken: credentials.idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          payload = ticket.getPayload();
        } catch (err) {
          console.error("[auth] Google ID token verification failed:", err.message);
          return null;
        }

        if (!payload?.email || !payload.email_verified) return null;
        if (!isOwnerEmail(payload.email)) return null;

        return {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          image: payload.picture,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Fresh sign-in: authorize() above already checked the
        // allowlist, so this user object only exists if they passed.
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.isOwner = true;
      } else {
        // Existing session being refreshed: re-check in case
        // OWNER_EMAILS changed since they signed in.
        token.isOwner = isOwnerEmail(token.email);
      }
      return token;
    },
    async session({ session, token }) {
      session.user.isOwner = token.isOwner;
      return session;
    },
  },
};

// Use inside API routes to gate access to owner-only data. Returns the
// session when the caller is an authorized owner, otherwise writes a
// 401 response and returns null so the caller can bail out early:
//
//   const session = await requireOwner(req, res);
//   if (!session) return;
export async function requireOwner(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.isOwner) {
    res.status(401).json({ error: "Sign in as a gym owner to access this." });
    return null;
  }
  return session;
}
