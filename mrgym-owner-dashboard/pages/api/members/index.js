import { getMembersWithStatus, addMember } from "../../../lib/store";
import { requireOwner } from "../../../lib/auth";

// Both routes here require an authenticated owner session — unlike the
// public site's /api/members, which only exposes an unauthenticated
// POST for the /join form. Both projects point at the SAME PostgreSQL
// database, so members created on either site show up here via GET.
export default async function handler(req, res) {
  const session = await requireOwner(req, res);
  if (!session) return;

  try {
    if (req.method === "GET") {
      const members = await getMembersWithStatus();
      return res.status(200).json(members);
    }

    if (req.method === "POST") {
      const { name, email, phone, plan, feeAmount, joinDate } = req.body || {};
      if (!name || !feeAmount) {
        return res
          .status(400)
          .json({ error: "Name and fee amount are required." });
      }
      const member = await addMember({ name, email, phone, plan, feeAmount, joinDate });
      return res.status(201).json(member);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error. Check that DATABASE_URL is set and PostgreSQL is reachable." });
  }
}
