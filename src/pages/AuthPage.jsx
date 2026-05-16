import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectGmail } from '../agents/auth.js';
import { useStore } from '../lib/store.js';

// Demo: add a mock account to skip OAuth in dev
function addMockAccount() {
  const id = crypto.randomUUID();
  useStore.getState().addAccount({
    id,
    provider: 'gmail',
    email: 'you@gmail.com',
    displayName: 'You',
    token: { access: 'mock', refresh: 'mock', expiry: Date.now() + 3600_000 },
    syncCursor: null,
  });

  // Seed some mock threads
  const mockThreads = Array.from({ length: 12 }, (_, i) => ({
    id: `thread_${i}`,
    accountId: id,
    provider: 'gmail',
    subject: [
      'Q3 budget review — action required',
      'Re: Design system update',
      'Your order has shipped!',
      'Weekly newsletter: Top 10 AI tools',
      'Meeting notes from yesterday',
      'Follow up on the proposal',
      'Server alert: high memory usage',
      'Invitation: team lunch Friday',
      'Re: Contract renewal',
      'GitHub: PR #142 approved',
      'Stripe: payment received $2,400',
      'New message from Sarah',
    ][i],
    from: ['boss@corp.com', 'design@acme.com', 'orders@amazon.com', 'news@tldr.ai'][i % 4],
    date: new Date(Date.now() - i * 1000 * 60 * 60 * 3).toISOString(),
    snippet: 'Please review the attached document and let me know your thoughts by end of week.',
    unread: i < 5,
    labels: ['inbox'],
    messageCount: Math.ceil(Math.random() * 5),
    priorityScore: 1 - i * 0.07,
  }));

  useStore.getState().setThreads(mockThreads);
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showIMAP, setShowIMAP] = useState(false);

  const handleGmail = async () => {
    setLoading(true);
    await connectGmail();
  };

  const handleDemo = () => {
    addMockAccount();
    navigate('/');
  };

  return (
    <div className="flex h-full items-center justify-center bg-surface-0 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-surface-0 text-sm font-bold">Z</span>
            </div>
            <span className="text-xl font-semibold text-text-primary tracking-tight">ZenMail</span>
          </div>
          <p className="text-text-secondary text-sm">AI-first email. One inbox for everything.</p>
        </div>

        {/* Connect options */}
        <div className="space-y-3">
          <button
            onClick={handleGmail}
            disabled={loading}
            className="w-full flex items-center gap-3 px-4 py-3 bg-surface-2 hover:bg-surface-3 border border-surface-3 rounded-xl text-text-primary text-sm font-medium transition-colors"
          >
            <GoogleIcon />
            Connect Gmail
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 bg-surface-2 hover:bg-surface-3 border border-surface-3 rounded-xl text-text-primary text-sm font-medium transition-colors">
            <MicrosoftIcon />
            Connect Office 365
          </button>

          <button
            onClick={() => setShowIMAP(!showIMAP)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-surface-2 hover:bg-surface-3 border border-surface-3 rounded-xl text-text-primary text-sm font-medium transition-colors"
          >
            <span className="w-5 h-5 flex items-center justify-center text-text-secondary">✉</span>
            Connect IMAP (Yahoo, AOL, custom)
          </button>

          {showIMAP && <IMAPForm />}

          <div className="relative flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-surface-3" />
            <span className="text-text-muted text-xs">or</span>
            <div className="flex-1 h-px bg-surface-3" />
          </div>

          <button
            onClick={handleDemo}
            className="w-full px-4 py-3 border border-surface-3 rounded-xl text-text-secondary hover:text-text-primary hover:border-surface-4 text-sm transition-colors"
          >
            Try demo (no account needed)
          </button>
        </div>

        <p className="text-center text-text-muted text-xs mt-6">
          Your emails stay private. AI runs server-side, no data is stored.
        </p>
      </div>
    </div>
  );
}

function IMAPForm() {
  return (
    <div className="space-y-2 p-4 bg-surface-1 rounded-xl border border-surface-2">
      <input className="input-base" placeholder="Email address" type="email" />
      <input className="input-base" placeholder="Password or app password" type="password" />
      <input className="input-base" placeholder="IMAP host (e.g. imap.yahoo.com)" />
      <button className="btn-primary w-full">Connect</button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 23 23">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}
