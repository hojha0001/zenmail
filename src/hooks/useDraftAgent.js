import { useState, useCallback } from 'react';
import { generateDraft } from '../agents/draft.js';

/**
 * Hook wrapping DraftAgent with loading and error state.
 */
export function useDraftAgent() {
  const [draft, setDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [confidenceScore, setConfidenceScore] = useState(null);

  const generate = useCallback(async ({ thread, toneProfile, replyIntent }) => {
    setIsGenerating(true);
    setError(null);

    const { data, error: agentError } = await generateDraft({ thread, toneProfile, replyIntent });

    if (agentError) {
      setError(agentError);
    } else if (data) {
      setDraft(data.draft ?? '');
      setConfidenceScore(data.confidenceScore ?? null);
    }

    setIsGenerating(false);
  }, []);

  const clearDraft = useCallback(() => {
    setDraft('');
    setConfidenceScore(null);
    setError(null);
  }, []);

  return { draft, setDraft, isGenerating, error, confidenceScore, generate, clearDraft };
}
