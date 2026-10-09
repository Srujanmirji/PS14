# Yojana Saathi

An AI caseworker for Indian government schemes. It works from incomplete information, explains every verdict, and says plainly what still needs checking. Ships as an installable PWA and as an Android app (Capacitor) from one codebase.

> **Rule zero:** the LLM never decides eligibility. A pure TypeScript rule engine decides. The LLM only *listens* (turns speech and text into profile facts) and *explains* (turns verdicts into plain language).

---

## Start here

1. Read [`AGENTS.md`](AGENTS.md). It holds the rules for you and for your AI coding agent (Antigravity, Claude Code, Cursor, AI Studio).
2. Read docs 01 → 03 to understand the product, the architecture and the folder layout.
3. Open [`tasks/README.md`](tasks/README.md). Work is split into three tracks that run in parallel: **frontend** ([`tasks/frontend.md`](tasks/frontend.md)), **backend** ([`tasks/backend.md`](tasks/backend.md)) and **data** ([`tasks/data.md`](tasks/data.md)). Each task has an id, an owner, an hour slot, dependencies, a copy-paste prompt and an acceptance check. Each phase ends with a **gate**.
4. Before touching a feature, read that feature's `SPEC.md`. Every feature folder has one.

## Priority legend (used in every spec)

| Tag | Meaning | Rule |
| --- | --- | --- |
| **P0** | The demo path. Without it there is no product. | Must work perfectly by hour 14. |
| **P1** | Showcase features judges remember. | Pick **3**, not all of them. Build only after P0 gates pass. |
| **P2** | Nice to show as a screen or roadmap item. | Only if you are ahead at hour 18. |

## Repository map

```
yojana-saathi/
├── README.md                 ← you are here
├── AGENTS.md                 ← rules for humans + AI agents (read first)
├── CLAUDE.md                 ← points Claude Code at AGENTS.md
├── docs/                     ← cross-cutting decisions (product, architecture, design…)
├── tasks/                    ← frontend, backend and data task lists with prompts and gates
├── apps/
│   ├── web/                  ← React PWA; the same build becomes the Android app
│   │   ├── SPEC.md
│   │   └── src/
│   │       ├── app/          ← shell, router, providers (SPEC.md)
│   │       ├── shared/       ← glass UI kit, api client, i18n, storage (SPEC.md)
│   │       └── features/     ← one folder per feature, each with its own SPEC.md
│   │           ├── onboarding/      P0  language + privacy promise
│   │           ├── intake/          P0  conversational intake (text + voice)
│   │           ├── profile/         P0  profile store, edit, family (P2)
│   │           ├── matching/        P0  engine bridge, unlock meter, next question
│   │           ├── results/         P0  top-5 results, three verdict groups
│   │           ├── scheme-detail/   P0  why / why not / what would change
│   │           ├── documents/       P0  document checklist + how to get missing ones
│   │           ├── voice/           P1  mic capture, speech-to-text, read aloud
│   │           ├── benefit-card/    P1  shareable summary card with QR
│   │           ├── accuracy-lab/    P1  live accuracy run on 50 personas
│   │           ├── demo-mode/       P0  deterministic hero demo for the stage
│   │           ├── settings/        P0  language, reduce transparency, clear data
│   │           ├── assisted-mode/   P2  CSC / ASHA worker multi-citizen mode
│   │           └── reminders/       P2  deadline reminders
│   └── api/                  ← Hono API on Railway: scheme bundle, extract, explain, voice, feedback
└── packages/
    ├── contracts/            ← shared zod schemas + TypeScript types
    ├── engine/               ← pure rule engine (three-valued logic), zero UI
    ├── schemes/              ← the scheme knowledge base (JSON source) + validator
    ├── db/                   ← Railway Postgres: Drizzle schema, migrations, seed, publish
    └── eval/                 ← 50 labelled personas, eval runner, reports
```

## Docs index

| Doc | Decides |
| --- | --- |
| [01 Product brief](docs/01-product-brief.md) | Who it's for, what it does, what we cut |
| [02 System architecture](docs/02-system-architecture.md) | Components, data flow, why it scales |
| [03 Folder structure](docs/03-folder-structure.md) | Feature-sliced layout and import rules |
| [04 Tech stack](docs/04-tech-stack.md) | Every library and why |
| [05 Design system](docs/05-design-system.md) | Glassmorphism tokens, type, motion, accessibility |
| [06 UX flows and screens](docs/06-ux-flows-and-screens.md) | Every screen, every state, Google Stitch prompts |
| [07 Data models](docs/07-data-models.md) | Profile, Scheme, Criterion, Verdict, Persona |
| [08 Matching engine](docs/08-matching-engine.md) | Three-valued logic, next question, ranking |
| [09 AI layer and prompts](docs/09-ai-layer-and-prompts.md) | Extraction and explanation prompts, guardrails |
| [10 Voice and languages](docs/10-voice-and-languages.md) | Kannada / Hindi / English, speech in and out |
| [11 PWA, offline and mobile](docs/11-pwa-offline-and-mobile.md) | Installable, works in airplane mode, Android APK |
| [12 Accuracy evaluation](docs/12-accuracy-evaluation.md) | Test personas, metrics, LLM baseline |
| [13 Security and privacy](docs/13-security-and-privacy.md) | Data stays on device, API hardening |
| [14 Testing strategy](docs/14-testing-strategy.md) | What must be tested and when |
| [15 Showcase features](docs/15-showcase-features.md) | What wins judges, ranked by impact vs effort |
| [16 Demo mode and script](docs/16-demo-mode-and-script.md) | The 3-minute stage demo, minute by minute |
| [17 Knowledge base guide](docs/17-knowledge-base-guide.md) | How to turn a scheme page into verified rules |
| [18 Database on Railway](docs/18-database-railway.md) | What Postgres stores (and never stores), schema, deploy |

## Commands (once scaffolded)

```bash
pnpm install          # install all workspaces
pnpm dev              # web on :5173, api on :8787
pnpm test             # unit tests (engine, contracts, schemes)
pnpm eval             # run 50 personas, write packages/eval/reports/latest.json
pnpm schemes:check    # validate every scheme JSON against the schema
pnpm schemes:bundle   # write apps/web/public/schemes.bundle.json straight from JSON (before the DB is up)
pnpm db:migrate       # apply Drizzle migrations to DATABASE_URL (Railway Postgres)
pnpm db:seed          # upsert schemes, documents, fields from packages/schemes
pnpm db:publish       # snapshot current schemes as a new published bundle version
pnpm build            # production build of web + api
pnpm cap:android      # build web, sync to Capacitor, open Android Studio
```

## Hackathon rule check

Read the rulebook before writing code. If pre-written code is not allowed, everything in this repo except `docs/`, `tasks/`, the `SPEC.md` files, the scheme research and the persona research stays unwritten until the clock starts. These markdown files are the plan, not the code.
