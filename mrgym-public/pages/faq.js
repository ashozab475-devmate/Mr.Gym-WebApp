import Head from "next/head";
import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { PLANS } from "../lib/plans";

const faqs = [
  {
    q: "What membership plans do you offer?",
    a: `We offer two plans: ${PLANS.map(
      (p) => `${p.label} at PKR ${p.fee.toLocaleString()}/month`
    ).join(" and ")}. Both include access to all training tracks — the only difference is cardio equipment access.`,
  },
  {
    q: "How does the monthly fee cycle work?",
    a: "Your first payment date is recorded when you join. Every 30 days from your last payment, your next fee is due. You'll show up as \"due soon\" a few days before, and \"overdue\" if you cross the deadline.",
  },
  {
    q: "What happens if I miss my fee deadline?",
    a: "Nothing gets switched off automatically — but the front desk will see you flagged as overdue on their dashboard, and they'll follow up with you to get your next payment recorded.",
  },
  {
    q: "Can I switch between plans?",
    a: "Yes — just let the front desk know and they'll update your plan and fee amount. Your billing cycle stays anchored to your existing payment dates.",
  },
  {
    q: "Do you offer trial sessions?",
    a: "Drop by during opening hours and one of our coaches will walk you through the gym and get you set up for a trial session before you commit to a plan.",
  },
  {
    q: "Is there a joining fee or contract?",
    a: "No joining fee and no lock-in contract. You pay month to month, and you're free to pause or leave whenever you'd like.",
  },
  {
    q: "What should I bring on my first visit?",
    a: "Comfortable training clothes, a pair of trainers, and a water bottle. We provide everything else — mats, weights, and equipment.",
  },
];

function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border-b border-ink/10 py-6">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-display text-xl font-bold sm:text-2xl">
          {q}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/20 text-lg transition-transform duration-200 ${
            isOpen ? "rotate-45 bg-ink text-cream" : ""
          }`}
        >
          +
        </span>
      </button>
      {isOpen && (
        <p className="mt-4 max-w-2xl text-ink/70">{a}</p>
      )}
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Head>
        <title>FAQ — MrGym</title>
        <meta
          name="description"
          content="Answers to common questions about MrGym membership, plans, fees and training."
        />
      </Head>
      <Header />

      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-coral">
            FAQ
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
            Questions, answered
          </h1>
          <p className="mt-6 text-lg text-ink/70">
            Can't find what you're looking for? Reach out and the front desk
            will help you out directly.
          </p>
        </div>

        <div className="mt-14 max-w-3xl">
          {faqs.map((f, i) => (
            <FaqItem
              key={f.q}
              q={f.q}
              a={f.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </section>

      <section className="bg-stoneLight/50 py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Still have questions?
          </h2>
          <p className="mt-4 text-ink/70">
            Stop by the front desk or send us a message — we're happy to
            help.
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
