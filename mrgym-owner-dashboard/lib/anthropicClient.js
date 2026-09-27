// Thin wrapper around the Anthropic Messages API, used server-side only.
// Requires ANTHROPIC_API_KEY to be set — see .env.local.example.

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-5";

export function isAnthropicConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// Sends a single-turn message with an optional system prompt and returns
// the raw text of Claude's reply. Throws on any non-2xx response or
// missing API key so callers can surface a clear error.
export async function askClaude({ system, prompt, maxTokens = 1024 }) {
  if (!isAnthropicConfigured()) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local to enable AI features."
    );
  }

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Anthropic API error (${res.status}): ${detail.slice(0, 300)}`
    );
  }

  const data = await res.json();
  const textBlock = data.content?.find((block) => block.type === "text");
  if (!textBlock) {
    throw new Error("Anthropic API returned no text content.");
  }
  return textBlock.text;
}

// Strips ```json fences etc. and parses. Throws a descriptive error if
// the model didn't return valid JSON.
export function parseJsonResponse(text) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Could not parse AI response as JSON.");
  }
}
