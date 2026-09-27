import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-ink py-16 text-cream">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-cream/60">
              A neighborhood strength and conditioning gym.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cream/50">
              Explore
            </p>
            <ul className="mt-4 space-y-2 text-sm text-cream/75">
              <li><Link href="/about">About</Link></li>
              <li><a href="#programs">Programs</a></li>
              <li><a href="#trainers">Trainers</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cream/50">
              Membership
            </p>
            <ul className="mt-4 space-y-2 text-sm text-cream/75">
              <li><Link href="/join">Join now</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cream/50">
              Contact
            </p>
            <ul className="mt-4 space-y-2 text-sm text-cream/75">
              <li>hello@pologym.example</li>
              <li>+92 300 0000000</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-cream/10 pt-6 text-xs text-cream/40">
          © {new Date().getFullYear()} MrGym.
        </div>
      </div>
    </footer>
  );
}
