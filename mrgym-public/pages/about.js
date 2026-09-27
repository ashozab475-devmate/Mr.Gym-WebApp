import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TrainersSection from "../components/TrainersSection";

const stats = [
  { value: "2019", label: "Opened our doors" },
  { value: "500+", label: "Members trained" },
  { value: "3", label: "Coaching tracks" },
  { value: "7", label: "Days a week" },
];

const values = [
  {
    title: "No gimmicks",
    copy: "Free weights, structured programming and coaches who actually watch your form — not fads.",
  },
  {
    title: "Everyone's welcome",
    copy: "First-timers and competitive lifters train in the same room, at their own pace.",
  },
  {
    title: "Consistency over intensity",
    copy: "We'd rather see you three times a week for a year than every day for a month.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <Head>
        <title>About — MrGym</title>
        <meta
          name="description"
          content="MrGym is a neighborhood strength and conditioning gym — our story, our coaches, and what we're about."
        />
      </Head>
      <Header />

      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-coral">
            About MrGym
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
            A neighborhood gym, built around the people who show up
          </h1>
          <p className="mt-6 text-lg text-ink/70">
            MrGym started as a single room with a rack of free weights and a
            handful of regulars. Years later, the equipment list has grown
            but the idea hasn't: train hard, know your coaches, and keep
            showing up.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-8 border-y border-ink/10 py-10 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl font-bold sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-ink/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink py-20 text-cream md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl">
            <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
              What we're about
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-cream/15 p-7 transition-colors hover:border-coral"
              >
                <div className="h-10 w-10 rounded-full bg-coral" />
                <h3 className="mt-6 font-display text-2xl font-bold">
                  {v.title}
                </h3>
                <p className="mt-3 text-sm text-cream/65">{v.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrainersSection />

      <section className="bg-stoneLight/50 py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Come train with us
          </h2>
          <p className="mt-4 text-ink/70">
            Drop by for a walkthrough, or sign up online and start your first
            session this week.
          </p>
          <a
            href="/join"
            className="mt-8 inline-block rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-coral"
          >
            Join now
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
