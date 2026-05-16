import React, { useState, useEffect } from 'react';
import { useStore } from '../../lib/store.js';
import { useDraftAgent } from '../../hooks/useDraftAgent.js';

export default function ComposeModal() {
  const { closeCompose, composeReplyTo } = useStore();
  const { draft, setDraft, isGenerating, generate, clearDraft } = useDraftAgent();

  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  // Pre-fill for reply
  useEffect(() => {
    if (composeReplyTo) {
      setTo(composeReplyTo.from ?? '');
      setSubject(`Re: ${composeReplyTo.subject ?? ''}`);
    }
  }, [composeReplyTo]);

  // Apply AI draft to body when it arrives
  useEffect(() => {
    if (draft) setBody(draft);
  }, [draft]);

  const handleAIDraft = async () => {
    if (!composeReplyTo) return;
    await generate({
      thread: [composeReplyTo],
      replyIntent: 'Reply helpfully and professionally.',
    });
  };

  const handleSend = async () => {
    if (!to || !body) return;
    setSending(true);
    // In production: call Gmail/Graph API to send
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    closeCompose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeCompose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-surface-1 border border-surface-3 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-2">
          <h3 className="text-text-primary font-semibold text-sm">
            {composeReplyTo ? 'Reply' : 'New message'}
          </h3>
          <button onClick={closeCompose} className="btn-ghost p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div>
            <label className="text-text-muted text-xs mb-1 block">To</label>
            <input
              className="input-base"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              type="email"
            />
          </div>

          <div>
            <label className="text-text-muted text-xs mb-1 block">Subject</label>
            <input
              className="input-base"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-text-muted text-xs">Message</label>
              {composeReplyTo && (
                <button
                  onClick={handleAIDraft}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-dim transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" />
                      Drafting…
                    </>
                  ) : (
                    <>
                      <span>✦</span>
                      AI draft
                    </>
                  )}
                </button>
              )}
            </div>
            <textarea
              className="input-base resize-none"
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message…"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-surface-2">
          <button onClick={closeCompose} className="btn-ghost text-sm">
            Discard
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !to || !body}
            className="btn-primary flex items-center gap-2 disabled:opacity-40"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-surface-0 border-t-transparent rounded-full animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
                Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
