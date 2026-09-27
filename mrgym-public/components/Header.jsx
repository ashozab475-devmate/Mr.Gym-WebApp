import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";

// This is the member-facing site — it has no staff/owner login link or
// functionality of any kind. Staff sign-in lives entirely on the
// separate mrgym-owner-dashboard project.
export default function Header() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/about", label: "About" },
    { href: "#programs", label: "Programs" },
    { href: "#trainers", label: "Trainers" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-ink/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" aria-label="MrGym home">
          <Logo />
        </Link>

        <nav className="hidden gap-8 md:flex">
          {links.map((l) =>
            l.href.startsWith("#") ? (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
              >
                {l.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/join"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-coral"
          >
            Join now
          </Link>
        </div>

        <button
          className="md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <div className="space-y-1.5">
            <span className="block h-0.5 w-6 bg-ink" />
            <span className="block h-0.5 w-6 bg-ink" />
            <span className="block h-0.5 w-4 bg-ink" />
          </div>
        </button>
      </div>

      {open && (
        <div className="border-t border-ink/10 bg-cream px-6 pb-6 md:hidden">
          <nav className="flex flex-col gap-4 pt-4">
            {links.map((l) =>
              l.href.startsWith("#") ? (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-ink/80"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-ink/80"
                >
                  {l.label}
                </Link>
              )
            )}
            <Link
              href="/join"
              className="rounded-full bg-ink px-5 py-3 text-center text-base font-semibold text-cream"
            >
              Join now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
