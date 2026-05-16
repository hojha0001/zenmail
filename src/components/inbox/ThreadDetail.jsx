import React, { useEffect } from 'react';
import { useStore } from '../../lib/store.js';
import { useSummaryAgent } from '../../hooks/useSummaryAgent.js';

export default function ThreadDetail({ threadId }) {
  const { threads, archiveThread, deleteThread, selectThread, openCompose } = useStore();
  const { summary, isLoading: isSummarizing, summarize } = useSummaryAgent();

  const thread = threads.find((t) => t.id === threadId);

  useEffect(() => {
    if (thread && thread.messageCount > 1) {
      // Build mock messages for the demo; real impl pulls from Gmail API
      summarize([
        {
          from: thread.from,
          subject: thread.subject,
          date: thread.date,
          body: thread.snippet + ' ' + thread.snippet,
        },
      ]);
    }
  }, [threadId]);

  if (!thread) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="px-6 py-4 border-b border-surface-2 flex items-start gap-4">
        <button
          className="md:hidden btn-ghost p-1.5 flex-shrink-0 mt-0.5"
          onClick={() => selectThread(null)}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <h2 className="text-text-primary font-semibold text-base leading-tight mb-1">
            {thread.subject}
          </h2>
          <p className="text-text-muted text-sm">{thread.from}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => openCompose(thread)}
            className="btn-ghost text-xs"
          >
            Reply
          </button>
          <button
            onClick={() => archiveThread(thread.id)}
            className="btn-ghost text-xs"
            title="Archive"
          >
            Archive
          </button>
          <button
            onClick={() => deleteThread(thread.id)}
            className="btn-ghost text-xs text-danger"
            title="Delete"
          >
            Delete
          </button>
        </div>
      </div>

      {/* AI Summary card */}
      {(isSummarizing || summary) && (
        <div className="mx-6 mt-4 p-4 glass rounded-xl border border-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-accent" />
            </div>
            <span className="text-xs text-accent font-medium uppercase tracking-wide">AI Summary</span>
          </div>

          {isSummarizing ? (
            <div className="space-y-2">
              <div className="h-3 bg-surface-3 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-surface-3 rounded animate-pulse w-1/2" />
            </div>
          ) : (
            <>
              <p className="text-text-secondary text-sm leading-relaxed">{summary?.summary}</p>
              {summary?.keyActions?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {summary.keyActions.map((action, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/60 flex-shrink-0" />
                      {action}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Email body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-surface-2">
            <div className="w-9 h-9 rounded-full bg-surface-3 flex items-center justify-center text-sm font-medium text-text-secondary">
              {thread.from?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-text-primary text-sm font-medium">{thread.from}</p>
              <p className="text-text-muted text-xs">{new Date(thread.date).toLocaleString()}</p>
            </div>
          </div>
          <div className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
            {thread.snippet}
            {'\n\n'}
            This is where the full email body would render. In production, the Gmail API returns the full
            message body which is decoded from base64 and sanitized before display. Attachments appear
            below as download cards.
          </div>
        </div>
      </div>

      {/* Quick reply bar */}
      <div className="px-6 py-4 border-t border-surface-2">
        <button
          onClick={() => openCompose(thread)}
          className="w-full text-left px-4 py-3 bg-surface-2 hover:bg-surface-3 border border-surface-3 rounded-xl text-text-muted text-sm transition-colors"
        >
          Reply to {thread.from?.split(' ')[0] ?? 'sender'}… (AI draft available)
        </button>
      </div>
    </div>
  );
}
