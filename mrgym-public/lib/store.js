// Member + fee-payment data layer, backed by MongoDB.
//
// Collections:
//   members  { _id, name, email, phone, plan, feeAmount, joinDate, createdAt }
//   payments { _id, memberId, date, amount }
//
// Every function here is async because every call now goes over the
// network to MongoDB, instead of reading a local JSON file.

import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";

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

function serializeMember(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

function serializePayment(doc) {
  const { _id, memberId, ...rest } = doc;
  return { id: _id.toString(), memberId: memberId.toString(), ...rest };
}

async function collections() {
  const db = await getDb();
  return {
    members: db.collection("members"),
    payments: db.collection("payments"),
  };
}

export async function getMembersWithStatus() {
  const { members, payments } = await collections();
  const memberDocs = await members.find({}).toArray();
  const paymentDocs = await payments.find({}).toArray();

  const result = memberDocs.map((m) => {
    const mine = paymentDocs
      .filter((p) => p.memberId.toString() === m._id.toString())
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
  if (!ObjectId.isValid(id)) return null;
  const { members, payments } = await collections();
  const memberDoc = await members.findOne({ _id: new ObjectId(id) });
  if (!memberDoc) return null;

  const paymentDocs = await payments
    .find({ memberId: new ObjectId(id) })
    .sort({ date: -1 })
    .toArray();

  const status = computeStatus(memberDoc, paymentDocs);
  return {
    ...serializeMember(memberDoc),
    ...status,
    history: paymentDocs.map(serializePayment),
  };
}

export async function addMember({ name, email, phone, plan, feeAmount, joinDate }) {
  const { members } = await collections();
  const today = joinDate || todayStr();

  const memberDoc = {
    name,
    email: email || "",
    phone: phone || "",
    plan: plan || "Without Cardio",
    feeAmount: Number(feeAmount) || 0,
    joinDate: today,
    createdAt: new Date().toISOString(),
  };

  const { insertedId } = await members.insertOne(memberDoc);

  // New joinee starts with "unpaid" status until payment is confirmed/allowed by gym owner.

  return getMember(insertedId.toString());
}

export async function updateMember(id, updates) {
  if (!ObjectId.isValid(id)) return null;
  const { members } = await collections();

  const setDoc = { ...updates };
  if (updates.feeAmount !== undefined) {
    setDoc.feeAmount = Number(updates.feeAmount);
  }
  delete setDoc.id;

  if (setDoc.nextDueDateOverride !== undefined) {
    if (!isDateString(setDoc.nextDueDateOverride)) {
      throw new Error("Next due date must use YYYY-MM-DD format.");
    }
  }

  const res = await members.updateOne(
    { _id: new ObjectId(id) },
    { $set: setDoc }
  );
  if (res.matchedCount === 0) return null;
  return getMember(id);
}

export async function deleteMember(id) {
  if (!ObjectId.isValid(id)) return false;
  const { members, payments } = await collections();
  await members.deleteOne({ _id: new ObjectId(id) });
  await payments.deleteMany({ memberId: new ObjectId(id) });
  return true;
}

export async function recordPayment(memberId, amount, date) {
  if (!ObjectId.isValid(memberId)) return null;
  const { members, payments } = await collections();
  const member = await members.findOne({ _id: new ObjectId(memberId) });
  if (!member) return null;

  await payments.insertOne({
    memberId: new ObjectId(memberId),
    date: date || todayStr(),
    amount: Number(amount) || member.feeAmount,
  });

  await members.updateOne(
    { _id: new ObjectId(memberId) },
    { $unset: { nextDueDateOverride: "" } }
  );

  return getMember(memberId);
}

export async function getStats() {
  const membersWithStatus = await getMembersWithStatus();
  const { payments } = await collections();
  const allPayments = await payments.find({}).toArray();

  return {
    total: membersWithStatus.length,
    unpaid: membersWithStatus.filter((m) => m.status === "unpaid").length,
    paid: membersWithStatus.filter((m) => m.status === "paid").length,
    dueSoon: membersWithStatus.filter((m) => m.status === "due-soon").length,
    overdue: membersWithStatus.filter((m) => m.status === "overdue").length,
    revenueCollected: allPayments.reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    ),
  };
}

export { CYCLE_DAYS };
