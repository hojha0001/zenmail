# ZenMail — Architecture

## Summary

ZenMail is a single-page PWA that aggregates email from multiple providers into one intelligent inbox. It is built mobile-first, works offline via service workers, and uses Claude (via the Anthropic API) as the core reasoning layer for triage, summarization, drafting, and search.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| State | Zustand |
| Styling | Tailwind CSS |
| PWA | Vite PWA plugin + Workbox |
| AI | Anthropic Claude API (claude-sonnet-4) |
| Auth | OAuth 2.0 (Google, Microsoft), IMAP credential vault |
| Email APIs | Gmail REST API, Microsoft Graph API, node-imap (proxied) |
| Testing | Vitest + Testing Library |
| Deployment | Vercel (Edge Functions for IMAP proxy) |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React PWA (client)                 │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  Inbox   │  │ Compose  │  │  Thread / Detail  │  │
│  │   View   │  │  Modal   │  │       View        │  │
│  └────┬─────┘  └────┬─────┘  └────────┬──────────┘  │
│       │              │                 │              │
│  ┌────▼──────────────▼─────────────────▼──────────┐  │
│  │              Zustand Store                      │  │
│  │  (accounts, threads, labels, drafts, ui state) │  │
│  └────────────────────┬────────────────────────────┘  │
│                       │                               │
│  ┌────────────────────▼────────────────────────────┐  │
│  │              Agent Orchestrator                 │  │
│  │  TriageAgent · SummaryAgent · DraftAgent        │  │
│  │  SearchAgent · AuthAgent · SyncAgent            │  │
│  └────────────────────┬────────────────────────────┘  │
└───────────────────────┼─────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   ┌────▼───┐    ┌──────▼─────┐   ┌────▼────────┐
   │ Gmail  │    │  MS Graph  │   │ IMAP Proxy  │
   │  API   │    │    API     │   │  (Vercel    │
   └────────┘    └────────────┘   │  Edge Fn)   │
                                  └─────────────┘
                        │
                ┌───────▼───────┐
                │ Anthropic API │
                │  (Claude)     │
                └───────────────┘
```

---

## Data Flow — Inbox Load

1. App boots → `AuthAgent` checks stored tokens, refreshes if expired
2. `SyncAgent` fetches delta (new messages since last sync) from each provider
3. Raw messages stored in Zustand `rawThreads`
4. `TriageAgent` batches new threads → sends to Claude with priority scoring prompt
5. `SummaryAgent` summarizes threads with > 3 messages
6. Store updated → UI re-renders with prioritized, summarized inbox
7. Service worker caches rendered HTML for offline access

## Data Flow — Reply Draft

1. User clicks Reply on a thread
2. `DraftAgent` receives: full thread, user's sent-mail samples (tone profile), reply intent
3. Claude returns draft + confidence score
4. Draft rendered in compose modal, user edits
5. Send goes through provider API directly from client (no server hop for Gmail/Graph)

---

## Multi-Account Model

Each account is an isolated `AccountContext`:
```
{
  id: uuid,
  provider: 'gmail' | 'office365' | 'imap',
  email: string,
  token: { access, refresh, expiry },
  syncCursor: string,
  labels: Label[],
}
```

The unified inbox merges threads across all accounts, sorted by AI priority score.

---

## AI Integration Points

| Feature | Agent | Claude Prompt Strategy |
|---------|-------|----------------------|
| Priority scoring | TriageAgent | Batch 20 subjects + snippets, return JSON scores |
| Thread summary | SummaryAgent | Full thread → 2-sentence summary |
| Reply draft | DraftAgent | Thread + tone profile → draft with edits |
| Semantic search | SearchAgent | Query → embedding similarity (future: vector store) |

---

## PWA & Offline

- Service worker (Workbox) caches: app shell, last 100 threads, avatars
- Background sync queues outgoing emails when offline
- IndexedDB stores thread cache; syncs on reconnect

---

## Security Notes

- OAuth tokens stored in memory + encrypted localStorage (AES-256)
- IMAP credentials never leave the client; proxied through Vercel Edge Function with user-scoped encryption
- Anthropic API key is server-side only (Vercel env var); client never sees it
