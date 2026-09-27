import "../styles/globals.css";
import "@fontsource/big-shoulders-display/600";
import "@fontsource/big-shoulders-display/700";
import "@fontsource/big-shoulders-display/800";
import "@fontsource/work-sans/400";
import "@fontsource/work-sans/500";
import "@fontsource/work-sans/600";

// This is the public marketing + join site. It has no login/session of
// its own — the owner dashboard (with Google sign-in) lives on the
// separate mrgym-owner-dashboard project. See that project's README.
export default function App({ Component, pageProps }) {
  return (
    <main className="font-body">
      <Component {...pageProps} />
    </main>
  );
}
