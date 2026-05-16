import { callClaude, parseJSON } from '../lib/claude.js';

const SYSTEM = `You are an email summarization assistant. Given an email thread, produce a concise summary.

Respond ONLY with a valid JSON object. No preamble, no markdown fences.
Format:
{
  "summary": "1-2 sentence summary of the thread",
  "keyActions": ["action item 1", "action item 2"],
  "sentiment": "positive" | "neutral" | "negative" | "urgent"
}`;

/**
 * Summarize an email thread.
 * @param {Array<{from: string, subject: string, body: string, date: string}>} messages
 * @returns {Promise<{ data: {summary, keyActions, sentiment}, error: string|null }>}
 */
export async function summarizeThread(messages) {
  if (!messages?.length) return { data: null, error: 'No messages provided' };

  const user = messages
    .map(
      (m) =>
        `From: ${m.from}\nDate: ${m.date}\nSubject: ${m.subject}\n\n${m.body?.slice(0, 500)}`
    )
    .join('\n\n---\n\n');

  const { data: raw, error } = await callClaude({ system: SYSTEM, user, maxTokens: 512 });
  if (error) return { data: null, error };

  return parseJSON(raw);
}
