import { recordPayment } from "../../../../lib/store";
import { requireOwner } from "../../../../lib/auth";

export default async function handler(req, res) {
  const session = await requireOwner(req, res);
  if (!session) return;

  const { id } = req.query;

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { amount, date } = req.body || {};
    const member = await recordPayment(id, amount, date);
    if (!member) return res.status(404).json({ error: "Member not found." });
    return res.status(200).json(member);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error. Check that DATABASE_URL is set and PostgreSQL is reachable." });
  }
}
