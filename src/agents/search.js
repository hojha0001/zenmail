import { callClaude, parseJSON } from '../lib/claude.js';

const RERANK_SYSTEM = `You are a search relevance assistant. Given a user query and a list of email snippets, 
rank them by relevance and return the top results.

Respond ONLY with a valid JSON array. No preamble, no markdown fences.
Format: [{ "id": "...", "relevanceScore": 0.0, "contextSnippet": "relevant excerpt" }]
Sorted highest relevance first.`;

/**
 * Hybrid search: keyword filter + Claude semantic re-ranking.
 * @param {{ query: string, threads: Array }} params
 * @returns {Promise<{ data: Array, error: string|null }>}
 */
export async function searchThreads({ query, threads }) {
  if (!query?.trim() || !threads?.length) return { data: [], error: null };

  // Step 1: Keyword pre-filter (fast, no API call)
  const q = query.toLowerCase();
  const candidates = threads.filter(
    (t) =>
      t.subject?.toLowerCase().includes(q) ||
      t.from?.toLowerCase().includes(q) ||
      t.snippet?.toLowerCase().includes(q)
  );

  // If keyword search found < 5 results, broaden to all threads for semantic pass
  const pool = candidates.length >= 3 ? candidates : threads;
  const top20 = pool.slice(0, 20);

  // Step 2: Claude semantic re-ranking
  const user = `Search query: "${query}"

Emails to rank:
${top20
  .map(
    (t, i) =>
      `${i + 1}. ID: ${t.id}\nFrom: ${t.from}\nSubject: ${t.subject}\nSnippet: ${t.snippet?.slice(0, 150)}`
  )
  .join('\n\n')}`;

  const { data: raw, error } = await callClaude({ system: RERANK_SYSTEM, user, maxTokens: 1024 });
  if (error) {
    // Fallback to keyword results if Claude call fails
    return { data: candidates, error: null };
  }

  const { data: ranked, error: parseError } = parseJSON(raw);
  if (parseError) return { data: candidates, error: null };

  // Merge scores back into thread objects
  const scored = ranked
    .map((r) => {
      const thread = top20.find((t) => t.id === r.id);
      return thread ? { ...thread, relevanceScore: r.relevanceScore, contextSnippet: r.contextSnippet } : null;
    })
    .filter(Boolean);

  return { data: scored, error: null };
}
