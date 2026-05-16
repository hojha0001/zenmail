import { callClaude, parseJSON } from '../lib/claude.js';

const SYSTEM = `You are an email drafting assistant. Write a reply that sounds exactly like the user — not like an AI.

Match the tone profile provided. Keep it concise. Sound human.

Respond ONLY with a valid JSON object. No preamble, no markdown fences.
Format:
{
  "draft": "the full reply text",
  "confidenceScore": 0.0,
  "toneNotes": "brief note about the tone applied"
}`;

/**
 * Generate a reply draft for a thread.
 * @param {{ thread: Array, toneProfile: string, replyIntent: string }} params
 * @returns {Promise<{ data: {draft, confidenceScore, toneNotes}, error: string|null }>}
 */
export async function generateDraft({ thread, toneProfile, replyIntent }) {
  const threadText = thread
    .map((m) => `From: ${m.from}\n${m.body?.slice(0, 400)}`)
    .join('\n\n---\n\n');

  const user = `
THREAD:
${threadText}

USER'S TONE PROFILE:
${toneProfile || 'Concise, professional, friendly. Gets to the point.'}

REPLY INTENT:
${replyIntent || 'Respond helpfully to the latest message.'}

Write the reply.`;

  const { data: raw, error } = await callClaude({ system: SYSTEM, user, maxTokens: 768 });
  if (error) return { data: null, error };

  return parseJSON(raw);
}
