// Member + fee-payment data layer, backed by PostgreSQL.

import { getPool, ensureSchema } from "./postgres";

const CYCLE_DAYS = 30; // a "month" of membership, counted from each payment

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  const ms = new Date(a).getTime() - new Date(b).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function isDateString(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

// Compute the live fee status of a member from their join date + payment history.
function computeStatus(member, memberPayments) {
  const sorted = [...memberPayments].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // If no payments have been confirmed/allowed by the owner yet:
  if (sorted.length === 0) {
    const nextDueDate = isDateString(member.nextDueDateOverride)
      ? member.nextDueDateOverride
      : member.joinDate;
    const daysOverdue = daysBetween(todayStr(), nextDueDate);
    const daysUntilDue = -daysOverdue;

    return {
      lastPaymentDate: null,
      nextDueDate,
      daysOverdue: Math.max(0, daysOverdue),
      daysUntilDue: Math.max(0, daysUntilDue),
      status: "unpaid",
      paymentsCount: 0,
    };
  }

  const lastPaymentDate = sorted[0].date;
  const nextDueDate = isDateString(member.nextDueDateOverride)
    ? member.nextDueDateOverride
    : addDays(lastPaymentDate, CYCLE_DAYS);
  const daysOverdue = daysBetween(todayStr(), nextDueDate);
  const daysUntilDue = -daysOverdue;

  let status = "paid";
  if (daysOverdue > 0) status = "overdue";
  else if (daysUntilDue <= 3) status = "due-soon";

  return {
    lastPaymentDate,
    nextDueDate,
    daysOverdue: Math.max(0, daysOverdue),
    daysUntilDue: Math.max(0, daysUntilDue),
    status,
    paymentsCount: sorted.length,
  };
}

const MEMBER_COLUMNS = `id, name, email, phone, plan,
  fee_amount AS "feeAmount",
  to_char(join_date, 'YYYY-MM-DD') AS "joinDate",
  created_at AS "createdAt",
  to_char(next_due_date_override, 'YYYY-MM-DD') AS "nextDueDateOverride"`;

function isId(value) {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function serializeMember(row) {
  if (!row) return null;
  return {
    ...row,
    id: String(row.id),
    feeAmount: Number(row.feeAmount),
    createdAt: row.createdAt instanceof Date
      ? row.createdAt.toISOString()
      : row.createdAt,
  };
}

function serializePayment(row) {
  return {
    ...row,
    id: String(row.id),
    memberId: String(row.memberId),
    amount: Number(row.amount),
  };
}

export async function getMembersWithStatus() {
  await ensureSchema();
  const pool = getPool();
  const [{ rows: memberDocs }, { rows: paymentDocs }] = await Promise.all([
    pool.query(`SELECT ${MEMBER_COLUMNS} FROM members`),
    pool.query(`SELECT id, member_id AS "memberId",
      to_char(payment_date, 'YYYY-MM-DD') AS date, amount FROM payments`),
  ]);

  const result = memberDocs.map((m) => {
    const mine = paymentDocs
      .filter((p) => p.memberId === m.id)
      .map((p) => ({ ...p, date: p.date }));
    const status = computeStatus(m, mine);
    return { ...serializeMember(m), ...status };
  });

  const statusPriority = { overdue: 1, unpaid: 2, "due-soon": 3, paid: 4 };
  return result.sort((a, b) => {
    if (b.daysOverdue !== a.daysOverdue) return b.daysOverdue - a.daysOverdue;
    return (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
  });
}

export async function getMember(id) {
  if (!isId(id)) return null;
  await ensureSchema();
  const pool = getPool();
  const { rows: memberRows } = await pool.query(
    `SELECT ${MEMBER_COLUMNS} FROM members WHERE id = $1`, [id]
  );
  const memberDoc = memberRows[0];
  if (!memberDoc) return null;

  const { rows: paymentDocs } = await pool.query(
    `SELECT id, member_id AS "memberId",
      to_char(payment_date, 'YYYY-MM-DD') AS date, amount
     FROM payments WHERE member_id = $1 ORDER BY payment_date DESC, created_at DESC`,
    [id]
  );

  const status = computeStatus(memberDoc, paymentDocs);
  return {
    ...serializeMember(memberDoc),
    ...status,
    history: paymentDocs.map(serializePayment),
  };
}

export async function addMember({ name, email, phone, plan, feeAmount, joinDate }) {
  await ensureSchema();
  const pool = getPool();
  const today = joinDate || todayStr();
  const { rows } = await pool.query(
    `INSERT INTO members (name, email, phone, plan, fee_amount, join_date)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [name, email || "", phone || "", plan || "Without Cardio", Number(feeAmount) || 0, today]
  );

  // New joinee starts with "unpaid" status until payment is confirmed/allowed by gym owner.

  return getMember(rows[0].id);
}

export async function updateMember(id, updates) {
  if (!isId(id)) return null;
  const fields = {
    name: "name",
    email: "email",
    phone: "phone",
    plan: "plan",
    feeAmount: "fee_amount",
    joinDate: "join_date",
    nextDueDateOverride: "next_due_date_override",
  };
  const entries = Object.entries(fields).filter(([key]) => updates[key] !== undefined);

  if (updates.nextDueDateOverride !== undefined) {
    if (!isDateString(updates.nextDueDateOverride)) {
      throw new Error("Next due date must use YYYY-MM-DD format.");
    }
  }

  if (entries.length) {
    await ensureSchema();
    const values = entries.map(([key]) =>
      key === "feeAmount" ? Number(updates[key]) : updates[key]
    );
    values.push(id);
    const assignments = entries.map(([key, column], index) =>
      `${column} = $${index + 1}`
    );
    const { rowCount } = await getPool().query(
      `UPDATE members SET ${assignments.join(", ")} WHERE id = $${values.length}`,
      values
    );
    if (!rowCount) return null;
  }
  return getMember(id);
}

export async function deleteMember(id) {
  if (!isId(id)) return false;
  await ensureSchema();
  const { rowCount } = await getPool().query("DELETE FROM members WHERE id = $1", [id]);
  return rowCount > 0;
}

export async function recordPayment(memberId, amount, date) {
  if (!isId(memberId)) return null;
  await ensureSchema();
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      "SELECT fee_amount AS \"feeAmount\" FROM members WHERE id = $1 FOR UPDATE",
      [memberId]
    );
    if (!rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }
    await client.query(
      "INSERT INTO payments (member_id, payment_date, amount) VALUES ($1, $2, $3)",
      [memberId, date || todayStr(), Number(amount) || Number(rows[0].feeAmount)]
    );
    await client.query(
      "UPDATE members SET next_due_date_override = NULL WHERE id = $1", [memberId]
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return getMember(memberId);
}

export async function getStats() {
  const membersWithStatus = await getMembersWithStatus();
  const { rows } = await getPool().query("SELECT COALESCE(SUM(amount), 0) AS revenue FROM payments");

  return {
    total: membersWithStatus.length,
    unpaid: membersWithStatus.filter((m) => m.status === "unpaid").length,
    paid: membersWithStatus.filter((m) => m.status === "paid").length,
    dueSoon: membersWithStatus.filter((m) => m.status === "due-soon").length,
    overdue: membersWithStatus.filter((m) => m.status === "overdue").length,
    revenueCollected: Number(rows[0].revenue),
  };
}

export { CYCLE_DAYS };
