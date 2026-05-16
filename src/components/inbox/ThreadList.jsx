import React from 'react';
import { useStore } from '../../lib/store.js';
import { formatDistanceToNow } from 'date-fns';

export default function ThreadList() {
  const { getVisibleThreads, selectedThreadId, selectThread, markRead, searchQuery } = useStore();

  const threads = getVisibleThreads();

  if (!threads.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-text-muted text-sm">
        <div className="text-3xl mb-3">📭</div>
        <p>{searchQuery ? 'No results found' : 'All caught up'}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-surface-2">
      {threads.map((thread) => (
        <ThreadRow
          key={thread.id}
          thread={thread}
          isSelected={thread.id === selectedThreadId}
          onSelect={() => {
            selectThread(thread.id);
            if (thread.unread) markRead(thread.id);
          }}
        />
      ))}
    </div>
  );
}

function ThreadRow({ thread, isSelected, onSelect }) {
  const priorityClass =
    thread.priorityScore >= 0.7
      ? 'priority-high'
      : thread.priorityScore >= 0.4
      ? 'priority-medium'
      : 'priority-low';

  return (
    <button
      onClick={onSelect}
      className={`
        w-full text-left px-4 py-3 transition-colors duration-100
        ${priorityClass}
        ${isSelected ? 'bg-surface-3' : 'hover:bg-surface-2'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-xs text-text-secondary font-medium flex-shrink-0 mt-0.5">
          {thread.from?.[0]?.toUpperCase() ?? '?'}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className={`text-sm truncate flex-1 ${
                thread.unread ? 'text-text-primary font-semibold' : 'text-text-secondary'
              }`}
            >
              {formatFrom(thread.from)}
            </span>
            <span className="text-xs text-text-muted flex-shrink-0">
              {formatDate(thread.date)}
            </span>
          </div>

          {/* Subject */}
          <p
            className={`text-sm truncate mb-0.5 ${
              thread.unread ? 'text-text-primary' : 'text-text-secondary'
            }`}
          >
            {thread.subject}
          </p>

          {/* Snippet */}
          <p className="text-xs text-text-muted truncate">{thread.snippet}</p>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1">
            {thread.priorityScore >= 0.7 && (
              <span className="text-xs text-accent font-medium">High priority</span>
            )}
            {thread.messageCount > 1 && (
              <span className="text-xs text-text-muted">{thread.messageCount} messages</span>
            )}
            {thread.unread && (
              <div className="ml-auto w-2 h-2 rounded-full bg-accent flex-shrink-0" />
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function formatFrom(from) {
  if (!from) return 'Unknown';
  const match = from.match(/^([^<]+)/);
  return match ? match[1].trim().replace(/"/g, '') : from;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: false });
  } catch {
    return '';
  }
}
