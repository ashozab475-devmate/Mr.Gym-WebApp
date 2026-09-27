import { useEffect, useState } from "react";

export default function PaymentHistoryModal({ memberId, memberName, onClose }) {
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!memberId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/members/${memberId}`);
        if (!res.ok) throw new Error("Could not load payment history.");
        const data = await res.json();
        if (!cancelled) setMember(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  if (!memberId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-cream p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
              Payment history
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold">
              {memberName}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink/60 hover:border-coral hover:text-coral"
          >
            ✕
          </button>
        </div>

        <div className="mt-6">
          {loading && (
            <p className="text-sm text-ink/50">Loading payment history…</p>
          )}
          {error && <p className="text-sm text-coral">{error}</p>}

          {!loading && !error && member && (
            <>
              <div className="mb-5 grid grid-cols-3 gap-3 rounded-xl bg-white p-4 text-center">
                <div>
                  <p className="font-display text-2xl font-bold">
                    {member.paymentsCount}
                  </p>
                  <p className="text-xs text-ink/50">Payments</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold">
                    PKR{" "}
                    {member.history
                      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-xs text-ink/50">Total paid</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold">
                    {member.lastPaymentDate || "None"}
                  </p>
                  <p className="text-xs text-ink/50">Last payment</p>
                </div>
              </div>

              {member.history.length === 0 ? (
                <p className="rounded-xl border border-dashed border-ink/20 p-6 text-center text-sm text-ink/50">
                  No payments recorded yet.
                </p>
              ) : (
                <ul className="divide-y divide-ink/10 rounded-xl border border-ink/10 bg-white">
                  {member.history.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between px-4 py-3 text-sm"
                    >
                      <span className="text-ink/70">{p.date}</span>
                      <span className="font-semibold">
                        PKR {Number(p.amount).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
