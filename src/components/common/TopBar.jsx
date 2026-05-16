import React from 'react';
import { useStore } from '../../lib/store.js';
import { useSearchAgent } from '../../hooks/useSearchAgent.js';

export default function TopBar() {
  const { searchQuery, setSearchQuery, isSyncing, lastSynced, toggleSidebar, openCompose } = useStore();
  const { search, isSearching } = useSearchAgent();

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    search(q);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-2 bg-surface-0 flex-shrink-0">
      {/* Hamburger */}
      <button
        onClick={toggleSidebar}
        className="md:hidden btn-ghost p-2"
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Search */}
      <div className="flex-1 relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
          )}
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search emails…"
          className="input-base pl-9"
        />
      </div>

      {/* Sync indicator */}
      <div className="flex items-center gap-2 text-text-muted">
        {isSyncing && (
          <div className="w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
        )}
        {!isSyncing && lastSynced && (
          <span className="text-xs hidden sm:block">
            {formatRelative(lastSynced)}
          </span>
        )}
      </div>

      {/* Compose */}
      <button
        onClick={() => openCompose()}
        className="btn-primary flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span className="hidden sm:inline">Compose</span>
      </button>
    </div>
  );
}

function formatRelative(ts) {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return `${Math.floor(diff / 3600_000)}h ago`;
}
