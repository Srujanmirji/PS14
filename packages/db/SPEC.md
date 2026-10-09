# packages/db — SPEC

**Track:** Backend · **Priority:** P0 (bundle + seed), P1 (feedback, eval runs, publish route), P2 (reviews) · Full design: `docs/18-database-railway.md`

## Purpose

Railway Postgres access for the API and scripts: schema, migrations, seed, publish, export.

## Files

```
packages/db/
├── SPEC.md
├── drizzle.config.ts          # schema path, out: ./migrations, dialect postgresql, url from DATABASE_URL
├── migrations/                # generated SQL — commit and review
└── src/
    ├── schema.ts              # tables (doc 18)
    ├── client.ts              # postgres.js + drizzle; one pool; max 5 connections
    ├── queries/
    │   ├── bundles.ts         # latestPublished(state), listVersions(state), insertVersion()
    │   ├── feedback.ts        # insertFeedback()
    │   └── eval-runs.ts       # insertEvalRun(), listEvalRuns()
    ├── scripts/
    │   ├── migrate.ts         # pnpm db:migrate
    │   ├── seed.ts            # pnpm db:seed — idempotent upserts from packages/schemes
    │   ├── publish.ts         # pnpm db:publish --state KA [--notes "..."]
    │   └── export.ts          # pnpm db:export --state KA → apps/web/public/schemes.bundle.json
    └── index.ts               # exports client + queries (no scripts)
```

## Rules

- No table may contain profile data, utterances, names, phone numbers, device ids or IPs.
- All JSONB written is validated with `@yojana/contracts` first.
- Bundle version id = ISO timestamp + state + short content hash; never reused.

## Acceptance

- [ ] Fresh Railway DB: `migrate → seed → publish → export` runs clean.
- [ ] `seed` twice in a row changes nothing (idempotent).
- [ ] `publish` retires the previous published version for that state.
