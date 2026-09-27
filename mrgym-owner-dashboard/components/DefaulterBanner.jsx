export default function DefaulterBanner({ defaulters }) {
  if (!defaulters || defaulters.length === 0) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white px-6 py-4 text-sm font-medium text-ink/60">
        No fee defaulters right now — everyone is within their billing cycle.
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="rounded-2xl border border-coral/30 bg-coral/10 px-6 py-4"
    >
      <p className="font-display text-lg font-bold text-coral">
        {defaulters.length} member{defaulters.length > 1 ? "s" : ""} past the
        fee deadline
      </p>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink/80">
        {defaulters.map((m) => (
          <li key={m.id}>
            <span className="font-semibold">{m.name}</span> — {m.daysOverdue}{" "}
            day{m.daysOverdue === 1 ? "" : "s"} overdue
          </li>
        ))}
      </ul>
    </div>
  );
}
