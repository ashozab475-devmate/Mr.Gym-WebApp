import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { PLANS, feeForPlan } from "../lib/plans";

const initial = {
  name: "",
  email: "",
  phone: "",
  plan: PLANS[0].label,
  feeAmount: String(PLANS[0].fee),
};

export default function Join() {
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handlePlanChange(planLabel) {
    setForm((f) => ({ ...f, plan: planLabel, feeAmount: String(feeForPlan(planLabel)) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.feeAmount) {
      setError("Name and fee amount are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong.");
      }
      const member = await res.json();
      setDone(member);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <Head>
        <title>Join — MrGym</title>
      </Head>
      <Header />

      <main className="mx-auto w-full max-w-xl flex-1 px-6 py-16">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          Join MrGym
        </h1>
        <p className="mt-3 text-ink/70">
          Register for your MrGym membership plan below. Once submitted, your
          registration will be reviewed and activated by our gym staff upon
          confirming your first fee payment at the front desk.
        </p>

        {done ? (
          <div className="mt-10 rounded-2xl border border-ink/10 bg-white p-8">
            <p className="font-display text-2xl font-bold text-coral">
              Welcome, {done.name.split(" ")[0]}.
            </p>
            <p className="mt-2 text-sm text-ink/70">
              Your registration has been submitted for <strong>{done.plan}</strong> on {done.joinDate}.
              Please visit the front desk to complete your payment of <strong>PKR {done.feeAmount}</strong>.
              Your membership status will be updated to paid once confirmed by the gym owner.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <Field label="Full name">
              <input
                className="input"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Jordan Ahmed"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email">
                <input
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@example.com"
                />
              </Field>
              <Field label="Phone">
                <input
                  className="input"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="0300 0000000"
                />
              </Field>
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink/70">
                Plan
              </span>
              <div className="grid gap-3 sm:grid-cols-2">
                {PLANS.map((p) => (
                  <label
                    key={p.label}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors ${
                      form.plan === p.label
                        ? "border-coral bg-coral/10"
                        : "border-ink/15 bg-white"
                    }`}
                  >
                    <span>
                      <input
                        type="radio"
                        name="plan"
                        className="mr-2 accent-coral"
                        checked={form.plan === p.label}
                        onChange={() => handlePlanChange(p.label)}
                      />
                      {p.label}
                    </span>
                    <span className="font-semibold">PKR {p.fee}</span>
                  </label>
                ))}
              </div>
            </div>

            <Field label="Monthly fee (PKR)">
              <input
                type="number"
                min="0"
                className="input"
                value={form.feeAmount}
                onChange={(e) => update("feeAmount", e.target.value)}
              />
            </Field>

            {error && <p className="text-sm text-coral">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-coral px-6 py-3.5 text-sm font-semibold text-cream transition-opacity disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Register & Join MrGym"}
            </button>
          </form>
        )}
      </main>

      <Footer />

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(23, 22, 19, 0.15);
          background: white;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
        }
        .input:focus {
          outline: 2px solid #e2492f;
          outline-offset: 1px;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink/70">
        {label}
      </span>
      {children}
    </label>
  );
}
