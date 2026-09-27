import Head from "next/head";
import Script from "next/script";
import { useRef, useState } from "react";
import { getServerSession } from "next-auth/next";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Logo from "../components/Logo";
import { authOptions } from "../lib/auth";

// The public marketing/join site is now a separate project. Point this
// at its deployed URL via NEXT_PUBLIC_PUBLIC_SITE_URL — see
// .env.local.example. Falls back to localhost:3000 for local dev.
const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || "http://localhost:3000";

// The Google OAuth Client ID is not secret (only the client SECRET is)
// - it's fine, and required, for it to be exposed to the browser here,
// since Google Identity Services runs client-side.
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function Login() {
  const router = useRouter();
  const error = router.query.error;
  const buttonRef = useRef(null);
  const [gisReady, setGisReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [localError, setLocalError] = useState("");

  async function handleCredentialResponse(response) {
    setSigningIn(true);
    setLocalError("");
    const result = await signIn("google-idtoken", {
      idToken: response.credential,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    if (result?.ok && !result?.error) {
      router.push("/dashboard");
      return;
    }

    setSigningIn(false);
    setLocalError(
      "That Google account isn't authorized as a gym owner, or sign-in failed. Please try again."
    );
  }

  function initializeGis() {
    if (!window.google?.accounts?.id || !buttonRef.current) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "continue_with",
      width: 300,
    });
    setGisReady(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 text-ink">
      <Head>
        <title>Owner login — MrGym</title>
      </Head>

      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initializeGis}
      />

      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <a href={PUBLIC_SITE_URL} aria-label="MrGym home">
            <Logo />
          </a>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-8 text-center shadow-sm">
          <h1 className="font-display text-2xl font-bold">Owner login</h1>
          <p className="mt-2 text-sm text-ink/60">
            Sign in with the Google account registered as a gym owner to
            access the staff dashboard.
          </p>

          {(error || localError) && (
            <p className="mt-4 rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">
              {localError ||
                "That Google account isn't authorized as a gym owner."}
            </p>
          )}

          {!GOOGLE_CLIENT_ID && (
            <p className="mt-4 rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">
              NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set in .env.local — the
              sign-in button can't load without it.
            </p>
          )}

          <div className="mt-6 flex justify-center">
            {/* Google renders its own "Continue with Google" button
                into this div once the script loads. */}
            <div ref={buttonRef} />
          </div>

          {signingIn && (
            <p className="mt-3 text-xs text-ink/50">Signing you in…</p>
          )}
          {!gisReady && GOOGLE_CLIENT_ID && (
            <p className="mt-3 text-xs text-ink/40">Loading Google sign-in…</p>
          )}

          <p className="mt-6 text-xs text-ink/40">
            Not staff?{" "}
            <a href={PUBLIC_SITE_URL} className="underline hover:text-ink">
              Back to the MrGym site
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session?.user?.isOwner) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }

  return { props: {} };
}
