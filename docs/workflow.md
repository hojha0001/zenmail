# ZenMail — Workflow Writeup

## How the Multi-Agent Workflow Was Built

### The Problem with Traditional Email Clients

Most email clients are passive. They show you what arrived. You decide what matters. You read every subject line. You context-switch constantly. The cognitive load is entirely on the human.

ZenMail inverts this. The AI does the first pass. By the time you open your inbox, the machine has already read, ranked, and summarized everything. You make decisions, not discoveries.

---

## Claude Code Workflow

This project was built using Claude Code CLI following a strict Agent OS discipline:

### Phase 1 — Spec First

Before any code was written, each feature was specced in `docs/specs/`. Claude Code was used to review specs and identify missing edge cases. Example: the `IMAP Proxy` spec went through two Claude Code review passes before implementation started — this caught a credential storage vulnerability early.

### Phase 2 — Agent Scaffolding

Each agent was scaffolded with a consistent interface contract:

```js
async function agentName(input) {
  // validate input
  // call Claude or provider API
  // return { data, error }
}
```

Claude Code generated the boilerplate for each agent from the CLAUDE.md agent registry, then I filled in the prompt logic. This kept agents consistent and testable from day one.

### Phase 3 — Hook Layer

Each agent got a corresponding React hook (`useTriageAgent`, `useDraftAgent`, etc.) that handles loading state, error boundaries, and cache invalidation. Claude Code was used to generate the hook structure from the agent signatures.

### Phase 4 — UI Integration

Components are intentionally thin. They receive data from hooks, dispatch actions to the store. Claude Code flagged two instances where business logic had crept into components and suggested moving them to agents.

### Phase 5 — Testing

Tests were written alongside agents, not after. Claude Code generated test skeletons from agent function signatures. Edge cases (network failure, malformed API response, token expiry mid-request) were explicitly tested.

---

## Key Architectural Decisions

**Why Zustand over Redux?**
Zustand has a minimal API surface. For a project where Claude Code is a collaborator, smaller API = fewer hallucinations. The store structure is readable in one file.

**Why Vercel Edge Functions for IMAP?**
IMAP is a server-side protocol. Running it client-side isn't possible. Edge Functions give us a lightweight proxy with Vercel's global CDN, and they share environment variables with the frontend deploy — no separate backend to manage.

**Why batch AI calls?**
Calling Claude once per email on inbox load would be 20-50 API calls. Instead, `TriageAgent` batches up to 30 email snippets in a single prompt and gets back a JSON array of scores. This reduces latency and cost by ~95%.

**Why tone profiling for drafts?**
Generic AI drafts sound generic. `DraftAgent` samples 10 of the user's recent sent emails, extracts stylistic patterns (sentence length, greeting style, sign-off, formality level), and embeds this as a "tone profile" in the draft prompt. The result is a draft that sounds like the user, not like a language model.

---

## What I'd Build Next

1. **Vector search**: Embed all emails on sync, store in a local vector index (Transformers.js). True semantic search without API calls.
2. **Calendar awareness**: Parse meeting requests, show availability inline. One-click accept.
3. **Digest mode**: Daily 8am AI briefing — top 5 things that need action today.
4. **Plugin API**: Let third-party developers register email patterns and actions (e.g., GitHub PR emails → show diff inline).
