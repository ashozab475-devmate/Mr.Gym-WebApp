import { addMember } from "../../../lib/store";

// This is the ONLY member-facing API route on the public site. A client
// filling out /join calls this with no login required, exactly like
// before. It writes into the same MongoDB database/collection that the
// owner-dashboard site reads from (both projects point at the same
// MONGODB_URI/MONGODB_DB — see .env.local.example) — so the moment a
// client registers here, they show up on the owner's dashboard.
//
// Reading, editing, marking-paid, and deleting members are intentionally
// NOT exposed on this site — those live only on the owner-dashboard
// project, behind Google sign-in.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { name, email, phone, plan, feeAmount, joinDate } = req.body || {};
    if (!name || !feeAmount) {
      return res
        .status(400)
        .json({ error: "Name and fee amount are required." });
    }
    const member = await addMember({ name, email, phone, plan, feeAmount, joinDate });
    return res.status(201).json(member);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error. Is MongoDB running and MONGODB_URI set?" });
  }
}
