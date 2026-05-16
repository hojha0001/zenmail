/**
 * Anthropic API client for agent use.
 * The API key is passed via Vercel serverless function in production.
 * In dev, VITE_ANTHROPIC_API_KEY is used (never commit this to git).
 */

const API_URL = '/api/claude'; // Proxied through Vercel function in prod

/**
 * Call Claude with a system prompt and user message.
 * Always returns { data, error } — never throws.
 */
export async function callClaude({ system, user, maxTokens = 1024 }) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { data: null, error: `API error ${res.status}: ${err}` };
    }

    const json = await res.json();
    const text = json.content?.[0]?.text ?? '';
    return { data: text, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

/**
 * Parse JSON from a Claude response, stripping markdown fences if present.
 */
export function parseJSON(text) {
  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return { data: JSON.parse(clean), error: null };
  } catch (err) {
    return { data: null, error: `JSON parse error: ${err.message}` };
  }
}
