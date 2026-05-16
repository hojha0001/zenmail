import { callClaude, parseJSON } from '../lib/claude.js';

const SYSTEM = `You are an email triage assistant. Given a batch of emails, score each one by priority from 0 to 1, where:
- 1.0 = urgent, requires action today (deadlines, direct questions from important people, time-sensitive issues)
- 0.7 = important but not urgent (needs response within 2-3 days)
- 0.4 = informational, good to read
- 0.1 = newsletters, notifications, automated emails

Also suggest 1-2 labels from: [inbox, important, newsletter, receipt, social, notification, work].

Respond ONLY with a valid JSON array. No preamble, no explanation, no markdown fences.
Format: [{ "id": "...", "priorityScore": 0.0, "labels": ["..."], "reason": "one sentence" }]`;

/**
 * Score a batch of emails by priority.
 * @param {Array<{id: string, subject: string, from: string, snippet: string, threadLength: number}>} emails
 * @returns {Promise<{ data: Array, error: string|null }>}
 */
export async function triageEmails(emails) {
  if (!emails?.length) return { data: [], error: null };

  // Batch to max 30 to control token usage
  const batch = emails.slice(0, 30);

  const user = `Triage these ${batch.length} emails:\n\n${batch
    .map(
      (e, i) =>
        `${i + 1}. ID: ${e.id}\nFrom: ${e.from}\nSubject: ${e.subject}\nSnippet: ${e.snippet?.slice(0, 120)}\nThread length: ${e.threadLength ?? 1}`
    )
    .join('\n\n')}`;

  const { data: raw, error } = await callClaude({ system: SYSTEM, user, maxTokens: 2048 });
  if (error) return { data: null, error };

  const { data, error: parseError } = parseJSON(raw);
  if (parseError) return { data: null, error: parseError };

  return { data, error: null };
}
