# apps/api — SPEC

**Track:** Backend · **Priority:** P0 · **Runs on:** Railway (Node service, same project as Postgres)

Thin, validated, boring. It serves the scheme bundle from Postgres, talks to AI providers, and stores nothing about citizens.

## Routes

| Method & path | Priority | Input → Output | Backed by |
| --- | --- | --- | --- |
| `GET /v1/health` | P0 | → `{ ok, version, bundleVersion, db: "up"\|"down" }` | — |
| `GET /v1/schemes/bundle?state=KA` | P0 | → `SchemeBundle` (ETag, 304) | Postgres `bundle_versions` |
| `POST /v1/extract` | P0 | `ExtractRequest` → `ExtractResponse` | LLM provider |
| `POST /v1/explain` | P1 | `ExplainRequest` → `ExplainResponse` | LLM provider + cache |
| `POST /v1/stt` | P1 | multipart audio + lang → `{ text }` | Speech provider |
| `POST /v1/tts` | P1 | `{ text, lang }` → audio | Speech provider + cache |
| `POST /v1/feedback` | P1 | `FeedbackRequest` → `{ ok }` | Postgres `feedback` |
| `GET /v1/schemes/versions?state=KA` | P1 | → versions list | Postgres |
| `POST /v1/baseline` | P1 (eval) | `{ profile, schemeIds }` → statuses; header `x-baseline-key` | LLM provider |
| `POST /v1/admin/publish` | P1 | `{ state, notes }`; header `x-admin-key` | Postgres |
| `GET/POST /v1/admin/reviews…` | P2 | review queue | Postgres |

Contracts: `docs/07-data-models.md`, implemented in `@yojana/contracts`.

## Folder

```
apps/api/
├── SPEC.md
├── package.json              # "start": "node dist/index.js", "dev": "tsx watch src/index.ts"
├── src/
│   ├── index.ts              # Hono app + @hono/node-server, listens on env PORT
│   ├── env.ts                # zod-validated env (doc 04); fail fast on boot
│   ├── middleware/
│   │   ├── cors.ts  rate-limit.ts  request-id.ts  timeout.ts  body-limit.ts  error.ts  admin-auth.ts
│   ├── routes/
│   │   ├── health/handler.ts
│   │   ├── schemes/{bundle.handler.ts, versions.handler.ts}
│   │   ├── extract/{handler.ts, prompt.ts, evidence-filter.ts}
│   │   ├── explain/{handler.ts, prompt.ts, number-guard.ts}
│   │   ├── stt/handler.ts  tts/handler.ts  translate/handler.ts
│   │   ├── feedback/handler.ts
│   │   ├── baseline/{handler.ts, prompt.ts}
│   │   └── admin/{publish.handler.ts, reviews.handler.ts}
│   ├── providers/
│   │   ├── llm/{types.ts, index.ts, <vendor>.ts}
│   │   └── speech/{types.ts, sarvam.ts}
│   ├── services/
│   │   └── bundle-cache.ts   # holds latest published bundle per state in memory; refresh every 60 s
│   └── lib/{cache.ts, hash.ts, logger.ts, redact.ts}
└── test/
    ├── fixtures/             # recorded provider responses
    └── *.test.ts
```

## Error format

```json
{ "error": { "code": "INVALID_INPUT | PROVIDER_FAILED | TIMEOUT | RATE_LIMITED | NOT_FOUND | UNAUTHORIZED | INTERNAL", "message": "human readable", "requestId": "…" } }
```

The web client maps codes to fallbacks (doc 02 failure table).

## Non-negotiables

- Validate every request and every provider response with zod.
- Extract: evidence filter + field-registry filter before returning (doc 09).
- Explain: number guard before returning.
- Never log utterances, transcripts, profile values, audio. `redact.ts` unit-tested.
- 8 s timeout on provider calls; return `TIMEOUT` so the client falls back.
- CORS allowlist from env; admin and baseline routes disabled if their keys are unset.

## Acceptance

- [ ] Deployed on Railway with health check green; `db: "up"`.
- [ ] Bundle endpoint returns 304 when `If-None-Match` matches.
- [ ] Extract test: hallucinated field in fixture is dropped; out-of-enum value is dropped.
- [ ] Explain test: response with an invented ₹ amount falls back to template.
- [ ] Load: 20 concurrent extract requests complete without errors (provider permitting).
