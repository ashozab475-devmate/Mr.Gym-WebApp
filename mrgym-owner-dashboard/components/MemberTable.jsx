import { useEffect, useState } from "react";

const statusStyles = {
  paid: "bg-green-100 text-green-700",
  "due-soon": "bg-gold/20 text-yellow-800",
  overdue: "bg-coral/15 text-coral",
  unpaid: "bg-amber-100 text-amber-800",
};

const statusLabel = {
  paid: "Paid",
  "due-soon": "Due soon",
  overdue: "Overdue",
  unpaid: "Unpaid",
};

function Badge({ status }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {statusLabel[status]}
    </span>
  );
}

function DueDateEditor({ member, onSave, busy }) {
  const [date, setDate] = useState(member.nextDueDate);

  useEffect(() => {
    setDate(member.nextDueDate);
  }, [member.nextDueDate]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        className="rounded-lg border border-ink/15 bg-white px-2 py-1 text-sm text-ink"
        aria-label={`Next fee date for ${member.name}`}
      />
      <button
        onClick={() => onSave(member.id, date)}
        disabled={busy || !date || date === member.nextDueDate}
        className="rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold text-ink/70 hover:border-coral hover:text-coral disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Saving…" : "Save date"}
      </button>
    </div>
  );
}

export default function MemberTable({
  members,
  onPay,
  onDelete,
  onUpdateDueDate,
  onViewHistory,
  busyId,
  updatingDueId,
}) {
  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/20 p-10 text-center text-sm text-ink/60">
        No members yet. Add the first member to start tracking fees.
      </div>
    );
  }

  return (
    <div>
      {/* Mobile: stacked cards */}
      <div className="grid gap-4 sm:hidden">
        {members.map((m) => (
          <div key={m.id} className="rounded-2xl border border-ink/10 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{m.name}</p>
                <p className="text-xs text-ink/50">{m.plan}</p>
              </div>
              <Badge status={m.status} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-ink/60">
              <div>
                <dt className="text-ink/40">Fee</dt>
                <dd>PKR {m.feeAmount}</dd>
              </div>
              <div>
                <dt className="text-ink/40">Next due</dt>
                <dd className="mt-1">
                  <DueDateEditor
                    member={m}
                    onSave={onUpdateDueDate}
                    busy={updatingDueId === m.id}
                  />
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => onPay(m.id)}
                disabled={busyId === m.id}
                className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-50 ${
                  m.status === "unpaid"
                    ? "bg-coral text-cream hover:bg-coral/90"
                    : "bg-ink text-cream"
                }`}
              >
                {m.status === "unpaid" ? "Allow & Mark paid" : "Mark fee paid"}
              </button>
              <button
                onClick={() => onViewHistory(m.id, m.name)}
                className="rounded-full border border-ink/15 px-4 py-2 text-xs font-semibold text-ink/70"
              >
                History
              </button>
              <button
                onClick={() => onDelete(m.id)}
                className="rounded-full border border-ink/15 px-4 py-2 text-xs font-semibold text-ink/70"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-ink/10 bg-white sm:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-ink/10 bg-cream/60 text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-5 py-3 font-medium">Member</th>
              <th className="px-5 py-3 font-medium">Plan</th>
              <th className="px-5 py-3 font-medium">Fee</th>
              <th className="px-5 py-3 font-medium">Last payment</th>
              <th className="px-5 py-3 font-medium">Next due</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-ink/5 last:border-0">
                <td className="px-5 py-4">
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-xs text-ink/50">{m.email}</p>
                </td>
                <td className="px-5 py-4 text-ink/70">{m.plan}</td>
                <td className="px-5 py-4 text-ink/70">PKR {m.feeAmount}</td>
                <td className="px-5 py-4">
                  {m.lastPaymentDate ? (
                    <button
                      onClick={() => onViewHistory(m.id, m.name)}
                      className="text-ink/70 underline decoration-dotted underline-offset-4 hover:text-coral"
                    >
                      {m.lastPaymentDate}
                    </button>
                  ) : (
                    <span className="text-xs text-ink/40">None (New)</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <DueDateEditor
                    member={m}
                    onSave={onUpdateDueDate}
                    busy={updatingDueId === m.id}
                  />
                </td>
                <td className="px-5 py-4">
                  <Badge status={m.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onPay(m.id)}
                      disabled={busyId === m.id}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                        m.status === "unpaid"
                          ? "bg-coral text-cream hover:bg-coral/90"
                          : "bg-ink text-cream"
                      }`}
                    >
                      {m.status === "unpaid" ? "Allow & Mark paid" : "Mark paid"}
                    </button>
                    <button
                      onClick={() => onViewHistory(m.id, m.name)}
                      className="rounded-full border border-ink/15 px-4 py-1.5 text-xs font-semibold text-ink/70 hover:border-ink"
                    >
                      History
                    </button>
                    <button
                      onClick={() => onDelete(m.id)}
                      className="rounded-full border border-ink/15 px-4 py-1.5 text-xs font-semibold text-ink/70 hover:border-coral hover:text-coral"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
