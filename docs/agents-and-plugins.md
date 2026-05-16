# ZenMail — Agents, Skills, Hooks & Plugins

## Agents

### TriageAgent (`src/agents/triage.js`)
**Responsibility**: Score incoming emails by priority (0–1 scale) and suggest labels.  
**Input**: Array of `{ id, subject, from, snippet, threadLength }`  
**Output**: Array of `{ id, priorityScore, suggestedLabels, reasoning }`  
**Claude prompt strategy**: Batch up to 30 emails per call. Returns JSON. Prompt includes user's VIP list and custom priority rules.

### SummaryAgent (`src/agents/summary.js`)
**Responsibility**: Summarize email threads into 1–3 sentences.  
**Input**: Full thread (array of message objects)  
**Output**: `{ summary, keyActions, sentiment }`  
**Claude prompt strategy**: Extracts action items separately. Flags urgency signals in the thread.

### DraftAgent (`src/agents/draft.js`)
**Responsibility**: Generate reply drafts matching the user's writing style.  
**Input**: `{ thread, toneProfile, replyIntent }`  
**Output**: `{ draft, confidenceScore, alternativeTone }`  
**Claude prompt strategy**: Tone profile is built from the user's last 10 sent emails. Extracts average sentence length, greeting/sign-off patterns, formality level.

### SearchAgent (`src/agents/search.js`)
**Responsibility**: Hybrid keyword + semantic search across the email corpus.  
**Input**: `{ query, accountIds, dateRange, filters }`  
**Output**: `{ results: [{ thread, relevanceScore, snippet }] }`  
**Strategy**: Keyword search first (fast), then Claude re-ranks top 20 results by semantic relevance.

### AuthAgent (`src/agents/auth.js`)
**Responsibility**: Manage OAuth flows and token lifecycle.  
**Providers**: Gmail (OAuth 2.0), Office 365 (MSAL), IMAP (credential vault)  
**Output**: Valid access token or error with recovery suggestion  
**Notes**: Handles silent token refresh. Never exposes tokens to components.

### SyncAgent (`src/agents/sync.js`)
**Responsibility**: Background delta sync from all connected providers.  
**Strategy**: Polls on focus (window.onfocus), on notification, and every 5 minutes.  
**Output**: New/updated threads pushed to Zustand store.  
**Offline**: Queues outgoing emails in IndexedDB when offline; flushes on reconnect.

---

## Skills (`src/agents/skills/`)

| Skill | Description |
|-------|-------------|
| `extractActionItems.js` | Parses email body for tasks, deadlines, requests |
| `detectSentiment.js` | Returns sentiment score (negative/neutral/positive/urgent) |
| `classifyIntent.js` | Classifies email intent: FYI, action-required, social, newsletter, receipt |
| `buildToneProfile.js` | Analyzes sent emails to build user writing style profile |
| `formatEmailBody.js` | Strips tracking pixels, normalizes HTML, extracts plain text |
| `detectLanguage.js` | Identifies email language for multi-language summary support |

---

## React Hooks (`src/hooks/`)

| Hook | Wraps | Returns |
|------|-------|---------|
| `useTriageAgent` | TriageAgent | `{ triageResults, isLoading, error, retriage }` |
| `useSummaryAgent` | SummaryAgent | `{ summary, keyActions, isLoading, error }` |
| `useDraftAgent` | DraftAgent | `{ draft, regenerate, isLoading, error }` |
| `useSearchAgent` | SearchAgent | `{ results, search, isSearching, error }` |
| `useSync` | SyncAgent | `{ lastSynced, isSyncing, forceSynce }` |
| `useAccounts` | AuthAgent | `{ accounts, addAccount, removeAccount, isAuthenticating }` |
| `useThread` | Store | `{ thread, messages, markRead, archive, delete, label }` |

---

## Plugins (`src/plugins/`)

Plugins are registered via a simple manifest and receive email body + metadata. They return optional UI overlays and actions.

| Plugin | Trigger | Action |
|--------|---------|--------|
| `calendarPlugin` | Detects meeting time/date patterns | "Add to Calendar" button inline |
| `trackingPlugin` | Detects shipping tracking numbers | Shows live tracking status |
| `githubPlugin` | Detects GitHub notification emails | Shows PR/issue status inline |
| `unsubscribePlugin` | Detects List-Unsubscribe header | One-click unsubscribe button |
| `receiptPlugin` | Detects order confirmation patterns | Extracts order details to summary |

---

## Plugin API Contract

```js
// Every plugin must export this shape
export default {
  name: 'calendarPlugin',
  version: '1.0.0',
  
  // Return true if this plugin should activate for this email
  matches(email) {
    return /\d{1,2}(am|pm)/i.test(email.body);
  },
  
  // Return UI overlay (React component) and/or action handlers
  render(email) {
    return {
      inlineComponent: CalendarInlineCard,
      actions: [{ label: 'Add to Calendar', handler: handleAddToCalendar }]
    };
  }
};
```
