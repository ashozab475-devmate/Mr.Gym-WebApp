import { getStats } from "../../lib/store";
import { requireOwner } from "../../lib/auth";

export default async function handler(req, res) {
  const session = await requireOwner(req, res);
  if (!session) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const stats = await getStats();
    return res.status(200).json(stats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error. Is MongoDB running and MONGODB_URI set?" });
  }
}
