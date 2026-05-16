import React from 'react';
import { useStore } from '../../lib/store.js';

const NAV_ITEMS = [
  { id: 'inbox', label: 'Inbox', icon: InboxIcon },
  { id: 'important', label: 'Important', icon: StarIcon },
  { id: 'sent', label: 'Sent', icon: SentIcon },
  { id: 'drafts', label: 'Drafts', icon: DraftIcon },
];

export default function Sidebar() {
  const { accounts, activeLabel, setActiveLabel, threads, openCompose } = useStore();

  const unreadCount = threads.filter((t) => t.unread && t.labels?.includes('inbox')).length;

  return (
    <div className="h-full bg-surface-1 border-r border-surface-2 flex flex-col py-4">
      {/* Logo */}
      <div className="px-4 mb-6 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
          <span className="text-surface-0 text-xs font-bold">Z</span>
        </div>
        <span className="text-text-primary font-semibold tracking-tight">ZenMail</span>
      </div>

      {/* Compose */}
      <div className="px-3 mb-4">
        <button
          onClick={() => openCompose()}
          className="btn-primary w-full justify-center flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Compose
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeLabel === id;
          const count = id === 'inbox' ? unreadCount : 0;
          return (
            <button
              key={id}
              onClick={() => setActiveLabel(id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${isActive
                  ? 'bg-surface-3 text-text-primary font-medium'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {count > 0 && (
                <span className="text-xs bg-accent text-surface-0 rounded-full px-1.5 py-0.5 font-medium min-w-[20px] text-center">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Accounts */}
      <div className="px-3 pt-4 border-t border-surface-2 space-y-1">
        <p className="text-text-muted text-xs font-medium px-2 mb-2 uppercase tracking-wide">Accounts</p>
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
          >
            <div className="w-6 h-6 rounded-full bg-surface-3 flex items-center justify-center text-xs text-text-secondary font-medium flex-shrink-0">
              {account.email?.[0]?.toUpperCase()}
            </div>
            <span className="text-text-secondary text-xs truncate">{account.email}</span>
            <ProviderDot provider={account.provider} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProviderDot({ provider }) {
  const colors = { gmail: '#EA4335', office365: '#00A4EF', imap: '#6ee7b7' };
  return (
    <div
      className="w-1.5 h-1.5 rounded-full flex-shrink-0 ml-auto"
      style={{ background: colors[provider] ?? '#525252' }}
    />
  );
}

// Icons
function InboxIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
    </svg>
  );
}

function StarIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  );
}

function SentIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
  );
}

function DraftIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}
