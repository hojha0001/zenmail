# ZenMail

An AI-first universal email client built as a mobile-ready PWA. Unifies Gmail, Office 365, and IMAP accounts into one intelligent inbox.

## What makes it different

Most email clients are passive — they show you what arrived, you decide what matters. ZenMail inverts this. By the time you open your inbox, the AI has already read, ranked, and summarized everything. You make decisions, not discoveries.

## Tech stack

- **React 18** + Vite — fast, lean frontend
- **Zustand** — minimal global state
- **Tailwind CSS** — utility-first styling
- **Vite PWA** — service worker, installable, offline-capable
- **Claude (Anthropic)** — triage, summarization, draft generation, semantic search
- **Vercel** — hosting + Edge Functions for IMAP proxy and Claude API proxy

## Getting started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your API keys

# Run dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Deploy
vercel --prod
```

## Architecture

See `docs/architecture.md` for the full architecture diagram and data flow documentation.

## Agents

See `docs/agents-and-plugins.md` for the complete list of agents, skills, hooks, and plugins.

## Workflow

See `docs/workflow.md` for the Claude Code workflow writeup and key architectural decisions.

## Project structure

```
zenmail/
├── api/                    # Vercel Edge Functions
│   └── claude.js           # Claude API proxy (keeps API key server-side)
├── docs/
│   ├── architecture.md     # System architecture
│   ├── agents-and-plugins.md
│   └── workflow.md
├── src/
│   ├── agents/             # AI agents (triage, summary, draft, search, auth, sync)
│   ├── components/         # React UI components
│   ├── hooks/              # Agent-wrapping React hooks
│   ├── lib/                # Store, Claude client
│   ├── pages/              # Route-level pages
│   └── styles/             # Global CSS
├── CLAUDE.md               # Agent OS instructions for Claude Code
└── vercel.json
```
