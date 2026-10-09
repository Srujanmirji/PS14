# 18 · Database on Railway (`packages/db`)

Railway Postgres is the **system of record for the scheme knowledge base** and for operational data. It is **not** where citizens' answers live — those stay on the phone (doc 13).

## What the database stores

| Table | Purpose | Written by |
| --- | --- | --- |
| `fields` | Field registry (FieldDef) | `pnpm db:seed` |
| `documents` | Document definitions | `pnpm db:seed` |
| `schemes` | Current working copy of each scheme (JSONB + indexed columns) | `pnpm db:seed`, admin review |
| `bundle_versions` | Immutable published snapshots served to apps | `pnpm db:publish` / admin route |
| `scheme_reviews` | Proposed rule changes awaiting human approval (roadmap: LLM-drafted diffs) | admin route |
| `eval_runs` | Each `pnpm eval` report | eval runner |
| `feedback` | Anonymous "was this helpful" | `/v1/feedback` |

## Never stored

Profiles, utterances, transcripts, audio, names, phone numbers, device ids, IP addresses.

## Schema (Drizzle, `packages/db/src/schema.ts`)

```ts
import { pgTable, text, integer, jsonb, timestamp, boolean, uuid, index } from "drizzle-orm/pg-core";

export const fields = pgTable("fields", {
  id: text("id").primaryKey(),
  def: jsonb("def").notNull(),                       // FieldDef
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  def: jsonb("def").notNull(),                       // DocumentDef
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const schemes = pgTable("schemes", {
  id: text("id").primaryKey(),                       // "central.ignwps"
  level: text("level").notNull(),                    // central | state
  state: text("state"),                              // "KA" | null
  category: text("category").notNull(),
  data: jsonb("data").notNull(),                     // full Scheme JSON (validated with zod before write)
  sourceUrl: text("source_url").notNull(),
  lastChecked: text("last_checked").notNull(),
  active: boolean("active").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [index("schemes_state_idx").on(t.state), index("schemes_category_idx").on(t.category)]);

export const bundleVersions = pgTable("bundle_versions", {
  id: text("id").primaryKey(),                       // e.g. "2026-10-10T04:12:00Z-ka" or a content hash
  state: text("state").notNull(),                    // "KA"
  status: text("status").notNull(),                  // draft | published | retired
  bundle: jsonb("bundle").notNull(),                 // SchemeBundle (fields + documents + schemes)
  sizeBytes: integer("size_bytes").notNull(),
  publishedAt: timestamp("published_at"),
  notes: text("notes"),
});

export const schemeReviews = pgTable("scheme_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  schemeId: text("scheme_id").notNull(),
  proposed: jsonb("proposed").notNull(),             // proposed Scheme JSON
  reason: text("reason"),
  status: text("status").notNull().default("pending"), // pending | approved | rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  decidedAt: timestamp("decided_at"),
});

export const evalRuns = pgTable("eval_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  bundleVersion: text("bundle_version").notNull(),
  report: jsonb("report").notNull(),                 // eval report JSON (doc 12)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feedback = pgTable("feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  screen: text("screen").notNull(),
  schemeId: text("scheme_id"),
  helpful: boolean("helpful").notNull(),
  comment: text("comment"),                          // ≤ 280 chars, enforced by zod
  lang: text("lang").notNull(),
  appVersion: text("app_version").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

## Scripts

| Command | Does |
| --- | --- |
| `pnpm db:generate` | `drizzle-kit generate` → SQL migration files in `packages/db/migrations` (commit them) |
| `pnpm db:migrate` | apply migrations to `DATABASE_URL` |
| `pnpm db:seed` | read `packages/schemes` JSON → zod-validate → upsert `fields`, `documents`, `schemes` (idempotent) |
| `pnpm db:publish --state KA` | build a `SchemeBundle` from active schemes (central + state) → insert `bundle_versions` row with `status: published`; retire the previous one |
| `pnpm db:export --state KA` | write the latest published bundle to `apps/web/public/schemes.bundle.json` (the offline snapshot shipped in the app) |

## API routes backed by the DB

| Route | Behaviour |
| --- | --- |
| `GET /v1/schemes/bundle?state=KA` | Latest `published` bundle for the state. `ETag: "<version id>"`; returns 304 on `If-None-Match` match. `Cache-Control: public, max-age=300`. Keep the latest bundle in memory; refresh every 60 s |
| `GET /v1/schemes/versions?state=KA` | List of versions (id, publishedAt, size) — for the "live update" demo |
| `POST /v1/feedback` | zod-validated insert; rate-limited |
| `POST /v1/admin/publish` | `ADMIN_KEY` required; same as `db:publish` |
| `GET /v1/admin/reviews`, `POST /v1/admin/reviews/:id/approve` | `ADMIN_KEY` required; P2 |

## Railway setup (step by step)

1. Create a Railway project → **Add a service → Database → PostgreSQL**.
2. **Add a service → GitHub repo** (this monorepo) for the API:
   - Root directory: repo root (pnpm workspaces need it).
   - Build command: `pnpm install --frozen-lockfile && pnpm --filter @yojana/api... build`
   - Start command: `pnpm --filter @yojana/api start`
   - Pre-deploy command: `pnpm db:migrate`
   - Variables: reference the Postgres service's `DATABASE_URL` (Railway variable reference), plus `LLM_*`, `SARVAM_API_KEY`, `ALLOWED_ORIGINS`, `ADMIN_KEY`, `BASELINE_KEY`.
   - Health check path: `/v1/health`.
3. Generate a public domain for the API service; put it in the web app's `VITE_API_URL`.
4. From your laptop (public DB URL in a local `.env`): `pnpm db:migrate && pnpm db:seed && pnpm db:publish --state KA && pnpm db:export --state KA`.
5. Turn on backups for the Postgres service.

Check Railway's current docs for exact menu names — the steps above are what you need, the labels may differ.

## Live-update demo (showcase #7)

1. Phone shows results with bundle version `v1`.
2. On the laptop, edit one scheme's `verifyNotes` (or activate one more scheme), run `pnpm db:seed && pnpm db:publish --state KA`.
3. On the phone, pull to refresh: the app fetches the bundle, sees a new ETag, swaps it in, shows toast *"Scheme information updated"*.

Say: *"No app-store release. When a government changes a rule, every phone has it in minutes."*

## Local development

Either point at a Railway dev database (separate from production), or run Postgres locally:

```bash
docker run --name yojana-pg -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:16
# DATABASE_URL=postgres://postgres:dev@localhost:5432/postgres
```
