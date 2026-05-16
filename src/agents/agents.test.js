import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the claude module so tests don't make real API calls
vi.mock('../lib/claude.js', () => ({
  callClaude: vi.fn(),
  parseJSON: vi.fn((text) => {
    try {
      return { data: JSON.parse(text), error: null };
    } catch (e) {
      return { data: null, error: e.message };
    }
  }),
}));

import { callClaude } from '../lib/claude.js';
import { triageEmails } from '../agents/triage.js';
import { summarizeThread } from '../agents/summary.js';
import { generateDraft } from '../agents/draft.js';

// --- TriageAgent ---
describe('TriageAgent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array for empty input', async () => {
    const { data, error } = await triageEmails([]);
    expect(data).toEqual([]);
    expect(error).toBeNull();
  });

  it('returns scored results on success', async () => {
    callClaude.mockResolvedValue({
      data: JSON.stringify([
        { id: '1', priorityScore: 0.9, labels: ['important'], reason: 'Deadline mentioned' },
        { id: '2', priorityScore: 0.2, labels: ['newsletter'], reason: 'Bulk email' },
      ]),
      error: null,
    });

    const emails = [
      { id: '1', subject: 'URGENT: Budget deadline', from: 'boss@corp.com', snippet: 'Please review by EOD' },
      { id: '2', subject: 'Weekly digest', from: 'news@tldr.ai', snippet: 'Your weekly roundup' },
    ];

    const { data, error } = await triageEmails(emails);
    expect(error).toBeNull();
    expect(data).toHaveLength(2);
    expect(data[0].priorityScore).toBe(0.9);
    expect(data[1].labels).toContain('newsletter');
  });

  it('propagates claude API errors', async () => {
    callClaude.mockResolvedValue({ data: null, error: 'API rate limit exceeded' });

    const { data, error } = await triageEmails([
      { id: '1', subject: 'Test', from: 'a@b.com', snippet: 'test' },
    ]);

    expect(data).toBeNull();
    expect(error).toMatch(/rate limit/);
  });

  it('batches to max 30 emails', async () => {
    callClaude.mockResolvedValue({
      data: JSON.stringify([]),
      error: null,
    });

    const emails = Array.from({ length: 50 }, (_, i) => ({
      id: String(i),
      subject: `Email ${i}`,
      from: 'a@b.com',
      snippet: 'test',
    }));

    await triageEmails(emails);

    const calledWith = callClaude.mock.calls[0][0].user;
    // Should only mention 30 emails, not 50
    expect(calledWith).toContain('30 emails');
  });
});

// --- SummaryAgent ---
describe('SummaryAgent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null for empty messages', async () => {
    const { data, error } = await summarizeThread([]);
    expect(data).toBeNull();
    expect(error).toBeTruthy();
  });

  it('returns structured summary on success', async () => {
    callClaude.mockResolvedValue({
      data: JSON.stringify({
        summary: 'Team is discussing Q3 budget allocation.',
        keyActions: ['Review spreadsheet', 'Reply by Friday'],
        sentiment: 'neutral',
      }),
      error: null,
    });

    const { data, error } = await summarizeThread([
      { from: 'boss@corp.com', subject: 'Q3 budget', date: '2025-01-01', body: 'Please review...' },
    ]);

    expect(error).toBeNull();
    expect(data.summary).toBeTruthy();
    expect(data.keyActions).toHaveLength(2);
    expect(['positive', 'neutral', 'negative', 'urgent']).toContain(data.sentiment);
  });
});

// --- DraftAgent ---
describe('DraftAgent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns a draft with confidence score', async () => {
    callClaude.mockResolvedValue({
      data: JSON.stringify({
        draft: 'Hi Sarah,\n\nThanks for reaching out. I will review by Friday.\n\nBest,\nHimanshu',
        confidenceScore: 0.82,
        toneNotes: 'Professional, concise, friendly sign-off',
      }),
      error: null,
    });

    const { data, error } = await generateDraft({
      thread: [{ from: 'sarah@corp.com', body: 'Can you review the doc?' }],
      toneProfile: 'Concise, professional',
      replyIntent: 'Agree and commit to a timeline',
    });

    expect(error).toBeNull();
    expect(data.draft).toContain('Himanshu');
    expect(data.confidenceScore).toBeGreaterThan(0.5);
  });

  it('handles missing tone profile gracefully', async () => {
    callClaude.mockResolvedValue({
      data: JSON.stringify({ draft: 'Sure, I will take a look.', confidenceScore: 0.6, toneNotes: '' }),
      error: null,
    });

    const { data, error } = await generateDraft({
      thread: [{ from: 'a@b.com', body: 'Quick question?' }],
    });

    expect(error).toBeNull();
    expect(data.draft).toBeTruthy();
  });
});
