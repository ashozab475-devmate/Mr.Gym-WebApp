export default function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5">
      <p className="text-sm font-medium text-ink/60">{label}</p>
      <p
        className="mt-2 font-display text-4xl font-bold"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
    </div>
  );
}
