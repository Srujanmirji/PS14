# 04 · Tech stack

Chosen for three constraints: a team that builds with AI coding tools, one codebase for PWA **and** Android, and a demo that must not break. Use the latest stable version of each at the time you scaffold; pin versions in the lockfile the moment it works.

## Why not Next.js

Capacitor wraps a **static** web build. Next.js server routes can't ship inside an APK, so you would run two architectures. Vite + React builds to static files that become both the PWA and the Android app, and the API lives separately.

## Approved dependencies

### apps/web

| Purpose | Library | Notes |
| --- | --- | --- |
| Build | Vite + `@vitejs/plugin-react` | |
| UI | React 19 + TypeScript (strict) | |
| Routing | React Router 7 | lazy routes per feature |
| Styling | Tailwind CSS v4 | tokens as CSS variables (doc 05) |
| Motion | `motion` (Framer Motion) | respect reduced motion |
| Icons | `lucide-react` | |
| State | Zustand | one slice per feature |
| Server calls | TanStack Query | retries off for LLM calls; manual retry button |
| Validation | zod (via `@yojana/contracts`) | |
| i18n | i18next + react-i18next | per-feature namespaces |
| Local DB | Dexie (IndexedDB) | profile, documents, history, citizens (P2) |
| PWA | `vite-plugin-pwa` (Workbox) | precache shell + schemes |
| QR | `qrcode` | benefit card (P1) |
| Image export | `html-to-image` | benefit card (P1) |
| Mobile | Capacitor (`@capacitor/core`, `android`, `share`, `haptics`, `status-bar`, `local-notifications` for P2) | |
| Fonts | Plus Jakarta Sans, Noto Sans Kannada, Noto Sans Devanagari | self-host via `@fontsource/*` so they work offline |

### apps/api

| Purpose | Library | Notes |
| --- | --- | --- |
| Server | Hono + `@hono/node-server` | runs as a long-lived Node service on Railway |
| Bundle | `tsup` | bundles workspace TypeScript source into the deployable API so package edits cannot leave stale output |
| Validation | zod + `@hono/zod-validator` | |
| LLM | provider SDK behind `providers/llm` adapter | must support JSON-schema / structured output |
| Speech | Sarvam REST API behind `providers/speech` adapter | check docs.sarvam.ai for current endpoints and models |
| Cache | in-memory LRU; optional Upstash Redis | keyed by content hash |
| Rate limit | simple in-memory token bucket; optional Upstash | |

### packages

| Package | Dependencies |
| --- | --- |
| contracts | zod |
| engine | contracts only |
| schemes | contracts, `tsx` for scripts |
| db | contracts, schemes, Drizzle ORM + `drizzle-kit`, `postgres` (postgres.js driver) |
| eval | contracts, engine, schemes, `tsx` |

Drizzle is chosen because the schema is plain TypeScript (easy for an AI agent to read and extend), migrations are generated SQL files you can review, and it has no heavy runtime.

### Tooling

pnpm workspaces · TypeScript (`strict`, `noUncheckedIndexedAccess`, per-workspace `tsc --noEmit`) · Vitest (`test.projects` in one `vitest.config.ts`) · Playwright (one smoke test) · ESLint (flat config, `no-restricted-imports`, with `typescript-eslint` and `@eslint/js` for TypeScript linting) · Prettier.

Workspace `exports` and `types` point to `./src/index.ts`; packages produce no compiled output. No composite projects, `tsc -b` or project references. Root `typecheck` checks every workspace; only the API uses tsup, with `noExternal: [/^@yojana\//]`, and starts from `dist/index.js`. TypeScript scripts and API development run with `tsx`; `@types/node` supplies Node tooling types. BE-01 pins TypeScript 6.0.3 because the current typescript-eslint peer range excludes TypeScript 7; upgrade them together.

Pin pnpm in root `packageManager`, keep `engines: { "node": ">=20" }`, and pin installed versions in the lockfile. The pinned development tools can have higher Node requirements: pnpm 11 needs Node ≥ 22.13 and Vitest 5 needs Node ≥ 22.12; this scaffold is checked on Node 24.

`pnpm-workspace.yaml` allows esbuild's install scripts because tsup, tsx and Vitest use its native build tooling; other dependency install scripts remain blocked by default.

## Hosting

| Piece | Where | Why |
| --- | --- | --- |
| Database | **Railway Postgres** | managed Postgres, one click, private networking to the API |
| API | **Railway service** (Node + Hono), same Railway project as the DB | talks to Postgres over Railway's private network; keys stay server-side; no cold-start timeouts on LLM calls |
| Web (PWA) | Vercel static (or a Railway static service) | HTTPS (required for PWA + mic), global CDN |
| Android | APK built locally with Android Studio | install on a demo phone; Play Store is roadmap |

Details, schema and deployment steps: `docs/18-database-railway.md`.

## Environment variables

```
# apps/api/.env
LLM_PROVIDER=        # e.g. anthropic | gemini | sarvam
LLM_API_KEY=
LLM_MODEL=
SARVAM_API_KEY=
ALLOWED_ORIGINS=https://<web-domain>,https://localhost,capacitor://localhost,http://localhost:5173
BASELINE_KEY=        # protects /v1/baseline
ADMIN_KEY=           # protects scheme publish/review routes
DATABASE_URL=        # Railway injects this; use the private URL inside Railway, public URL only for local dev
PORT=                # Railway injects this; Hono must listen on it

# apps/web/.env
VITE_API_URL=https://<api-domain>
VITE_DEMO_DEFAULT=false
```

Never put provider keys in `apps/web`. Anything prefixed `VITE_` ships to the browser.

## If your team is stronger in Python

Swap `apps/api` for FastAPI with the same routes and contracts (generate JSON Schema from zod and validate with pydantic). Keep the engine in TypeScript so it runs on device.
