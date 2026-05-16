import { useStore } from '../lib/store.js';
import { getValidToken } from './auth.js';
import { triageEmails } from './triage.js';

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let syncInterval = null;

/**
 * Fetch new/updated threads from Gmail for one account.
 */
async function syncGmail(account) {
  const { data: token, error } = await getValidToken(account.id);
  if (error) return { data: null, error };

  try {
    const cursor = account.syncCursor || '';
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/threads?maxResults=50${cursor ? `&pageToken=${cursor}` : ''}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

    if (!res.ok) return { data: null, error: `Gmail API error: ${res.status}` };

    const json = await res.json();
    const threads = json.threads ?? [];

    // Fetch basic metadata for each thread
    const detailed = await Promise.all(
      threads.slice(0, 20).map(async (t) => {
        const tr = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/threads/${t.id}?format=metadata`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!tr.ok) return null;
        const data = await tr.json();
        return normalizeGmailThread(data, account.id);
      })
    );

    return {
      data: {
        threads: detailed.filter(Boolean),
        nextCursor: json.nextPageToken ?? null,
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

function normalizeGmailThread(raw, accountId) {
  const msg = raw.messages?.[0];
  const headers = msg?.payload?.headers ?? [];
  const get = (name) => headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? '';

  return {
    id: raw.id,
    accountId,
    provider: 'gmail',
    subject: get('Subject') || '(no subject)',
    from: get('From'),
    date: get('Date'),
    snippet: raw.snippet ?? '',
    unread: msg?.labelIds?.includes('UNREAD') ?? false,
    labels: ['inbox'],
    messageCount: raw.messages?.length ?? 1,
    priorityScore: 0.5, // default until triage runs
  };
}

/**
 * Main sync function — syncs all active accounts, runs triage on new messages.
 */
export async function syncAll() {
  const store = useStore.getState();
  const { accounts, activeAccountIds } = store;

  store.setSyncing(true);

  const activeAccounts = accounts.filter((a) => activeAccountIds.includes(a.id));
  let allNewThreads = [];

  for (const account of activeAccounts) {
    if (account.provider === 'gmail') {
      const { data, error } = await syncGmail(account);
      if (data?.threads) allNewThreads = [...allNewThreads, ...data.threads];
    }
    // Office 365 and IMAP sync would follow same pattern
  }

  if (allNewThreads.length) {
    // Run triage on new threads
    const triageInput = allNewThreads.map((t) => ({
      id: t.id,
      subject: t.subject,
      from: t.from,
      snippet: t.snippet,
      threadLength: t.messageCount,
    }));

    const { data: triaged } = await triageEmails(triageInput);

    if (triaged) {
      const scoreMap = Object.fromEntries(triaged.map((t) => [t.id, t]));
      allNewThreads = allNewThreads.map((t) => ({
        ...t,
        priorityScore: scoreMap[t.id]?.priorityScore ?? t.priorityScore,
        labels: scoreMap[t.id]?.labels ?? t.labels,
      }));
    }

    // Merge with existing threads (dedup by id)
    const existing = store.threads;
    const existingIds = new Set(existing.map((t) => t.id));
    const merged = [
      ...allNewThreads.filter((t) => !existingIds.has(t.id)),
      ...existing,
    ].sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));

    store.setThreads(merged);
  }

  store.setSyncing(false);
  store.setLastSynced(Date.now());
}

/**
 * Start background sync loop.
 */
export function startBackgroundSync() {
  syncAll(); // immediate first sync
  syncInterval = setInterval(syncAll, SYNC_INTERVAL_MS);

  // Also sync on window focus
  window.addEventListener('focus', syncAll);
}

/**
 * Stop background sync loop.
 */
export function stopBackgroundSync() {
  if (syncInterval) clearInterval(syncInterval);
  window.removeEventListener('focus', syncAll);
}
