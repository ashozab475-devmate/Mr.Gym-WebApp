import Link from "next/link";

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 md:pb-24 md:pt-16">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div>
          <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            Work hard in silence,
            <br />
            let your fee record
            <br />
            <span className="text-coral">do the talking.</span>
          </h1>
          <p className="mt-6 max-w-md text-base text-ink/70 sm:text-lg">
            MrGym tracks every member&apos;s training plan and payment cycle
            in one place, so nobody quietly falls behind on their
            membership.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/join"
              className="rounded-full bg-coral px-7 py-3.5 text-sm font-semibold text-cream transition-transform hover:scale-[1.03]"
            >
              Become a member
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-ink/20 px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
            >
              Manage members
            </Link>
          </div>
        </div>

        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
          <div className="absolute -right-4 -top-4 h-40 w-40 rounded-full bg-gold sm:h-48 sm:w-48" />
          <div className="absolute -left-8 bottom-10 hidden h-40 w-32 -rotate-6 overflow-hidden rounded-2xl border-4 border-cream shadow-xl sm:block">
            <img
              src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=400&q=80"
              alt="Member training on the gym floor"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] bg-ink">
            <img
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80"
              alt="Member mid-lift with a barbell at MrGym"
              className="h-full w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/0 to-transparent" />
          </div>
          <div className="absolute inset-x-6 bottom-6 rounded-[1.5rem] bg-coral p-6">
            <span className="font-display text-lg font-bold uppercase tracking-wide text-cream">
              Cycle status
            </span>
            <div className="mt-1 flex items-end justify-between">
              <p className="font-display text-6xl font-bold text-cream">30</p>
              <p className="max-w-[9rem] text-sm font-medium text-cream/80">
                day billing cycle, tracked automatically from each
                member&apos;s first payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
