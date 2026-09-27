const trainers = [
  {
    name: "Luka Pri",
    focus: "Strength coach",
    photo:
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Fitash Fani",
    focus: "Boxing coach",
    photo:
      "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Alex Locoh",
    focus: "Mobility coach",
    photo:
      "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=500&q=80",
  },
];

export default function TrainersSection() {
  return (
    <section id="trainers" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="max-w-xl">
        <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
          Trainers who know your name
        </h2>
        <p className="mt-4 text-ink/70">
          A small, dedicated coaching staff available across every session.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {trainers.map((t) => (
          <div key={t.name} className="group">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-stoneLight">
              <img
                src={t.photo}
                alt={`${t.name}, ${t.focus.toLowerCase()} at MrGym`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-ink/60">
              {t.focus}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
