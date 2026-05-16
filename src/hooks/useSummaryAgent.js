import { useState, useCallback } from 'react';
import { summarizeThread } from '../agents/summary.js';

export function useSummaryAgent() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const summarize = useCallback(async (messages) => {
    if (!messages?.length) return;
    setIsLoading(true);
    setError(null);

    const { data, error: agentError } = await summarizeThread(messages);

    if (agentError) setError(agentError);
    else setSummary(data);

    setIsLoading(false);
  }, []);

  return { summary, isLoading, error, summarize };
}
