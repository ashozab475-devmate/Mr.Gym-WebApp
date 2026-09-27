import { getMembersWithStatus } from "../../../lib/store";
import { requireOwner } from "../../../lib/auth";
import { askClaude, parseJsonResponse } from "../../../lib/anthropicClient";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const SYSTEM_PROMPT = `You are a filter engine for a gym's member dashboard. You are given:
- today's date
- a JSON array of members with their fee status

Given the owner's natural-language question, decide which members match.

Respond with ONLY a JSON object, no other text, no markdown fences:
{
  "matchingIds": ["<member id>", ...],
  "explanation": "<one short sentence, plain English, summarizing what you filtered for>"
}

Rules:
- Only use "id" values that appear in the provided member list. Never invent ids.
- "status" is one of "unpaid", "paid", "due-soon", "overdue". "unpaid" means a newly registered member who has not had their first payment allowed/recorded yet.
- "daysOverdue" is 0 unless status is "overdue".
- "paymentsCount" is how many payments that member has ever made (0 = new joinee who has not paid yet).
- If the question is about dates ("joined in June", "joined this year"), reason using "joinDate" (YYYY-MM-DD) against today's date.
- If nothing matches, return an empty matchingIds array and explain why in one sentence.
- If the question is ambiguous, make the most reasonable interpretation and say so briefly in the explanation.`;

export default async function handler(req, res) {
  const session = await requireOwner(req, res);
  if (!session) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.body || {};
  if (!query || typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ error: "A query string is required." });
  }

  try {
    const members = await getMembersWithStatus();

    // Send Claude a compact, relevant slice of each member — not the
    // full document — to keep the prompt small and avoid leaking
    // fields (email, phone) it doesn't need for filtering.
    const compact = members.map((m) => ({
      id: m.id,
      name: m.name,
      plan: m.plan,
      status: m.status,
      joinDate: m.joinDate,
      lastPaymentDate: m.lastPaymentDate,
      nextDueDate: m.nextDueDate,
      daysOverdue: m.daysOverdue,
      paymentsCount: m.paymentsCount,
    }));

    const prompt = `Today's date: ${todayStr()}

Members:
${JSON.stringify(compact)}

Owner's question: "${query.trim()}"`;

    const raw = await askClaude({ system: SYSTEM_PROMPT, prompt, maxTokens: 1024 });
    const parsed = parseJsonResponse(raw);

    const validIds = new Set(members.map((m) => m.id));
    const matchingIds = Array.isArray(parsed.matchingIds)
      ? parsed.matchingIds.filter((id) => validIds.has(id))
      : [];

    return res.status(200).json({
      matchingIds,
      explanation:
        typeof parsed.explanation === "string"
          ? parsed.explanation
          : `Found ${matchingIds.length} matching member(s).`,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "AI search failed." });
  }
}
