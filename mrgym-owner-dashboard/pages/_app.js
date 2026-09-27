import "../styles/globals.css";
import "@fontsource/big-shoulders-display/600";
import "@fontsource/big-shoulders-display/700";
import "@fontsource/big-shoulders-display/800";
import "@fontsource/work-sans/400";
import "@fontsource/work-sans/500";
import "@fontsource/work-sans/600";
import { SessionProvider } from "next-auth/react";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <main className="font-body">
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
}
