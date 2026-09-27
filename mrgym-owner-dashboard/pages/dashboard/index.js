import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { useSession, signOut } from "next-auth/react";
import Logo from "../../components/Logo";
import StatCard from "../../components/StatCard";
import DefaulterBanner from "../../components/DefaulterBanner";
import MemberTable from "../../components/MemberTable";
import AddMemberModal from "../../components/AddMemberModal";
import PaymentHistoryModal from "../../components/PaymentHistoryModal";
import { authOptions } from "../../lib/auth";

// The public marketing/join site is now a separate project — see
// .env.local.example. Falls back to localhost:3000 for local dev.
const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || "http://localhost:3000";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unpaid", label: "Unpaid / New" },
  { key: "overdue", label: "Overdue" },
  { key: "due-soon", label: "Due soon" },
  { key: "paid", label: "Paid" },
];

export default function Dashboard() {
  const { data: session } = useSession();
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [updatingDueId, setUpdatingDueId] = useState(null);
  const [historyMember, setHistoryMember] = useState(null);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null); // { matchingIds, explanation }
  const [aiError, setAiError] = useState(null);

  const load = useCallback(async () => {
    const [mRes, sRes] = await Promise.all([
      fetch("/api/members"),
      fetch("/api/stats"),
    ]);
    setMembers(await mRes.json());
    setStats(await sRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    // Re-check fee deadlines periodically so overdue notices stay current
    // without requiring a manual page refresh.
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  async function handlePay(id) {
    setBusyId(id);
    try {
      await fetch(`/api/members/${id}/pay`, { method: "POST" });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this member and their payment history?")) return;
    await fetch(`/api/members/${id}`, { method: "DELETE" });
    await load();
  }

  async function handleUpdateDueDate(id, nextDueDateOverride) {
    setUpdatingDueId(id);
    try {
      const response = await fetch(`/api/members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextDueDateOverride }),
      });
      if (!response.ok) throw new Error("Could not update next fee date.");
      await load();
    } finally {
      setUpdatingDueId(null);
    }
  }

  async function handleAiSearch(e) {
    e.preventDefault();
    if (!aiQuery.trim() || aiLoading) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/dashboard/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: aiQuery }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI search failed.");
      setAiResult(data);
    } catch (err) {
      setAiError(err.message);
      setAiResult(null);
    } finally {
      setAiLoading(false);
    }
  }

  function clearAiSearch() {
    setAiQuery("");
    setAiResult(null);
    setAiError(null);
  }

  const defaulters = members.filter((m) => m.status === "overdue");

  const visible = aiResult
    ? members.filter((m) => aiResult.matchingIds.includes(m.id))
    : members
        .filter((m) => (filter === "all" ? true : m.status === filter))
        .filter((m) => m.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Head>
        <title>Staff dashboard — MrGym</title>
      </Head>

      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <a href={PUBLIC_SITE_URL} aria-label="MrGym home">
              <Logo />
            </a>
            <p className="mt-1 text-xs text-ink/50">Staff dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            {session?.user?.email && (
              <span className="hidden text-xs text-ink/50 sm:inline">
                {session.user.email}
              </span>
            )}
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-cream"
            >
              + Add member
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-full border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink/70 hover:border-ink"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6">
          <DefaulterBanner defaulters={defaulters} />
        </div>

        {stats && (
          <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <StatCard label="Total members" value={stats.total} />
            <StatCard label="Unpaid / New" value={stats.unpaid} accent="#d97706" />
            <StatCard label="Paid" value={stats.paid} accent="#15803d" />
            <StatCard label="Due soon" value={stats.dueSoon} accent="#b45309" />
            <StatCard label="Overdue" value={stats.overdue} accent="#E2492F" />
          </div>
        )}

        <form
          onSubmit={handleAiSearch}
          className="mb-4 rounded-2xl border border-ink/10 bg-white p-4"
        >
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
            <span aria-hidden="true">✨</span> Ask about your members
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="e.g. who's overdue and joined this year?"
              className="flex-1 rounded-full border border-ink/15 px-4 py-2.5 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={aiLoading || !aiQuery.trim()}
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-50"
              >
                {aiLoading ? "Thinking…" : "Ask"}
              </button>
              {(aiResult || aiError) && (
                <button
                  type="button"
                  onClick={clearAiSearch}
                  className="rounded-full border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink/70"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {aiResult && (
            <p className="mt-3 text-sm text-ink/70">
              <span className="font-semibold text-ink">
                {aiResult.matchingIds.length} match
                {aiResult.matchingIds.length === 1 ? "" : "es"}.
              </span>{" "}
              {aiResult.explanation}
            </p>
          )}
          {aiError && (
            <p className="mt-3 text-sm text-coral">{aiError}</p>
          )}
        </form>

        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setFilter(f.key);
                  clearAiSearch();
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === f.key
                    ? "bg-ink text-cream"
                    : "bg-white text-ink/60 border border-ink/10"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              clearAiSearch();
            }}
            placeholder="Search members…"
            className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm sm:w-64"
          />
        </div>

        {loading ? (
          <p className="text-sm text-ink/50">Loading members…</p>
        ) : (
          <MemberTable
            members={visible}
            onPay={handlePay}
            onDelete={handleDelete}
            onUpdateDueDate={handleUpdateDueDate}
            onViewHistory={(id, name) => setHistoryMember({ id, name })}
            busyId={busyId}
            updatingDueId={updatingDueId}
          />
        )}
      </main>

      <AddMemberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          setModalOpen(false);
          load();
        }}
      />

      {historyMember && (
        <PaymentHistoryModal
          memberId={historyMember.id}
          memberName={historyMember.name}
          onClose={() => setHistoryMember(null)}
        />
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.isOwner) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  return { props: {} };
}
