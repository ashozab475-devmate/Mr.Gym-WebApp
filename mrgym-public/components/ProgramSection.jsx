const programs = [
  {
    title: "Strength & conditioning",
    copy: "Free weights, sleds and structured programming for anyone building raw strength.",
  },
  {
    title: "Boxing & conditioning",
    copy: "Pad work, bag rounds and footwork drills led by our resident coaches.",
  },
  {
    title: "Recovery & mobility",
    copy: "Stretch sessions and mobility work to keep you training week after week.",
  },
];

export default function ProgramSection() {
  return (
    <section id="programs" className="bg-ink py-20 text-cream md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl">
          <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            Monthly training programs
          </h2>
          <p className="mt-4 text-cream/70">
            Every membership includes access to all three tracks. Mix and
            match sessions across the month.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-cream/15 p-7 transition-colors hover:border-coral"
            >
              <div className="h-10 w-10 rounded-full bg-coral" />
              <h3 className="mt-6 font-display text-2xl font-bold">
                {p.title}
              </h3>
              <p className="mt-3 text-sm text-cream/65">{p.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
