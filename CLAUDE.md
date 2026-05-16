# ZenMail — CLAUDE.md

## Project Overview

ZenMail is an AI-first universal email client built as a mobile-ready PWA. It unifies Gmail, Office 365, and IMAP accounts (Yahoo, AOL, etc.) into a single intelligent inbox. The product is opinionated: AI is not bolted on — it is the primary interface layer.

---

## Agent OS Methodology

This project follows Agent OS principles. Every non-trivial operation is delegated to a named agent with a defined responsibility boundary. Claude Code orchestrates these agents via a multi-agent workflow.

### Agent Registry

| Agent | File | Responsibility |
|-------|------|----------------|
| `TriageAgent` | `src/agents/triage.js` | Reads incoming emails, scores priority, applies labels |
| `SummaryAgent` | `src/agents/summary.js` | Generates 1-3 line summaries for email threads |
| `DraftAgent` | `src/agents/draft.js` | Writes reply drafts given thread context and user tone profile |
| `SearchAgent` | `src/agents/search.js` | Semantic search across email corpus |
| `AuthAgent` | `src/agents/auth.js` | Handles OAuth flows for Gmail, Office 365; IMAP credential management |
| `SyncAgent` | `src/agents/sync.js` | Background polling and delta sync across providers |

### Workflow Orchestration

```
User opens inbox
  → SyncAgent polls providers (delta sync)
  → TriageAgent scores new messages
  → SummaryAgent summarizes threads > 3 messages
  → UI renders prioritized, summarized inbox

User clicks "Reply"
  → DraftAgent receives thread + user tone profile
  → Returns draft with confidence score
  → User edits or sends

User searches
  → SearchAgent runs semantic + keyword hybrid search
  → Returns ranked results with context snippets
```

---

## Development Methodology

### Spec-Driven Development

Every feature starts with a spec in `docs/specs/`. No code is written before the spec is reviewed. Specs define:
- User story
- Acceptance criteria
- Agent interactions
- Edge cases

### Skills & Hooks

- **Skills** live in `src/agents/skills/` — reusable capabilities (e.g., `extractActionItems`, `detectSentiment`, `classifyIntent`)
- **Hooks** live in `src/hooks/` — React hooks that wrap agent calls with loading/error state
- **Plugins** are third-party integrations mounted at `src/plugins/` (e.g., Calendly link detection, Notion export)

### CLAUDE.md Contract

When Claude Code operates on this repo, it must:
1. Read this file before any task
2. Prefer agent delegation over inline logic
3. Write tests alongside every new agent or hook
4. Update `docs/architecture.md` when agent boundaries change
5. Never put business logic in React components — components are pure UI

---

## Commands

```bash
# Dev server
npm run dev

# Run all tests
npm test

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Run agent tests only
npm run test:agents
```

---

## Environment Variables

```
VITE_GOOGLE_CLIENT_ID=
VITE_MICROSOFT_CLIENT_ID=
VITE_ANTHROPIC_API_KEY=
VITE_APP_URL=
```

---

## Code Style

- Components: functional, no class components
- State: Zustand for global, React state for local
- API calls: always go through an agent, never directly from a component
- Error handling: every agent must return `{ data, error }` — no throwing
- Tests: Vitest, co-located with the file being tested (`*.test.js`)
