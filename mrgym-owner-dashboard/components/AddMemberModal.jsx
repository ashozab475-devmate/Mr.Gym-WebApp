import { useState } from "react";
import { PLANS, feeForPlan } from "../lib/plans";

const initial = {
  name: "",
  email: "",
  phone: "",
  plan: PLANS[0].label,
  feeAmount: String(PLANS[0].fee),
};

export default function AddMemberModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

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
      if (!res.ok) throw new Error("Could not add member.");
      const member = await res.json();
      onCreated(member);
      setForm(initial);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-cream p-6 sm:rounded-3xl sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Add member</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-ink/50 hover:bg-ink/5"
          >
            ✕
          </button>
        </div>
        <p className="mt-1 text-sm text-ink/60">
          New member will be registered with Unpaid status until their fee payment is confirmed.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            className="input"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="email"
              className="input"
              placeholder="Email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            <input
              className="input"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
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
                      name="add-member-plan"
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

          <input
            type="number"
            min="0"
            className="input"
            placeholder="Monthly fee (PKR)"
            value={form.feeAmount}
            onChange={(e) => update("feeAmount", e.target.value)}
          />

          {error && <p className="text-sm text-coral">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-coral px-6 py-3 text-sm font-semibold text-cream disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add member"}
          </button>
        </form>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(23, 22, 19, 0.15);
          background: white;
          padding: 0.7rem 1rem;
          font-size: 0.9rem;
        }
        .input:focus {
          outline: 2px solid #e2492f;
          outline-offset: 1px;
        }
      `}</style>
    </div>
  );
}
