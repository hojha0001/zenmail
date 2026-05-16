import { useState, useCallback, useRef } from 'react';
import { searchThreads } from '../agents/search.js';
import { useStore } from '../lib/store.js';

export function useSearchAgent() {
  const threads = useStore((s) => s.threads);
  const setSearchResults = useStore((s) => s.setSearchResults);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  const search = useCallback(
    (query) => {
      clearTimeout(debounceRef.current);

      if (!query?.trim()) {
        setSearchResults([]);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setIsSearching(true);
        setError(null);

        const { data, error: agentError } = await searchThreads({ query, threads });

        if (agentError) setError(agentError);
        else setSearchResults(data ?? []);

        setIsSearching(false);
      }, 400);
    },
    [threads, setSearchResults]
  );

  return { search, isSearching, error };
}
