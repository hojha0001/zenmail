import { useStore } from '../lib/store.js';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID;

const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
].join(' ');

/**
 * Initiate Google OAuth flow.
 * Returns { data: account, error }
 */
export async function connectGmail() {
  try {
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', `${window.location.origin}/auth/callback/google`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', GOOGLE_SCOPES);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    window.location.href = authUrl.toString();
    return { data: null, error: null }; // navigation happens
  } catch (err) {
    return { data: null, error: err.message };
  }
}

/**
 * Connect an IMAP account (Yahoo, AOL, custom).
 * Credentials are proxied to a Vercel Edge Function — never stored in plain text.
 */
export async function connectIMAP({ email, password, host, port = 993 }) {
  try {
    const res = await fetch('/api/imap/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, host, port }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { data: null, error: `IMAP connection failed: ${err}` };
    }

    const account = await res.json();
    useStore.getState().addAccount({
      ...account,
      provider: 'imap',
    });

    return { data: account, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

/**
 * Get a valid access token for an account, refreshing if expired.
 */
export async function getValidToken(accountId) {
  const { accounts } = useStore.getState();
  const account = accounts.find((a) => a.id === accountId);
  if (!account) return { data: null, error: 'Account not found' };

  const { token } = account;
  if (!token) return { data: null, error: 'No token stored' };

  // Check expiry with 60s buffer
  if (token.expiry && Date.now() < token.expiry - 60_000) {
    return { data: token.access, error: null };
  }

  // Refresh
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, refresh: token.refresh }),
    });

    if (!res.ok) return { data: null, error: 'Token refresh failed' };

    const newToken = await res.json();
    useStore.getState().updateThread(accountId, { token: newToken });
    return { data: newToken.access, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}
