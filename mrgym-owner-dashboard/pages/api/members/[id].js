import { getMember, updateMember, deleteMember } from "../../../lib/store";
import { requireOwner } from "../../../lib/auth";

export default async function handler(req, res) {
  const session = await requireOwner(req, res);
  if (!session) return;

  const { id } = req.query;

  try {
    if (req.method === "GET") {
      const member = await getMember(id);
      if (!member) return res.status(404).json({ error: "Member not found." });
      return res.status(200).json(member);
    }

    if (req.method === "PUT") {
      const member = await updateMember(id, req.body || {});
      if (!member) return res.status(404).json({ error: "Member not found." });
      return res.status(200).json(member);
    }

    if (req.method === "DELETE") {
      await deleteMember(id);
      return res.status(204).end();
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error. Check that DATABASE_URL is set and PostgreSQL is reachable." });
  }
}
