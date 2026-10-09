# Backend tasks

**Owner:** Srujan · **Owns:** `apps/api`, `packages/contracts`, `packages/engine`, `packages/db`, `packages/eval/src`, `packages/schemes/src`, Railway.

The backend's first job is to unblock everyone else: contracts by hour 2.5, engine by hour 6, a served bundle by hour 8.

---

### BE-01 · Monorepo scaffold — P0 · H0–1 · depends on: nothing

**Goal:** an empty monorepo where every workspace builds and tests run.
**Files:** root `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `eslint.config.js`, `vitest.config.ts`, empty `packages/*` and `apps/api`.

**Prompt**
```
Read AGENTS.md and docs/03-folder-structure.md and docs/04-tech-stack.md.
Create a pnpm workspace monorepo with apps/web (leave empty — frontend scaffolds it), apps/api, packages/contracts, packages/engine, packages/schemes, packages/db, packages/eval.
TypeScript strict and noUncheckedIndexedAccess everywhere via tsconfig.base.json. Source-only workspace exports/types point to ./src/index.ts; packages build with tsc --noEmit, without composite or project references. Only apps/api bundles with tsup (noExternal: [/^@yojana\//]) to dist/index.js and starts with node dist/index.js. TypeScript scripts run with tsx. Vitest test.projects in one vitest.config.ts.
ESLint flat config with no-restricted-imports rules from docs/03. Engine src (excluding tests) imports only contracts and relative paths; ban Date, Math.random and fetch. Engine tests may also import vitest, node:fs, node:path, schemes and eval.
Root scripts: dev, build, typecheck, test, lint, eval, schemes:check, schemes:bundle, db:generate, db:migrate, db:seed, db:publish, db:export — wire them to the packages (explicit placeholders are fine for now).
Each package: package.json named @yojana/<name>, src/index.ts exporting nothing yet, one passing placeholder test.
```

**Done when**
- [x] `pnpm install && pnpm test && pnpm -r build` succeed.
- [x] Lint fails if `packages/engine/src` imports React (add a temporary source file, confirm failure, delete it).
- [x] Lint passes for a Vitest import in `packages/engine/test`; remove the temporary probe.
- [x] Root `pnpm typecheck` and `pnpm lint` succeed.

---

### BE-02 · Contracts v0 — P0 · H1–2.5 · depends on: BE-01

**Goal:** every shared type and zod schema, with fixtures, so frontend and data can start.
**Files:** `packages/contracts/**` — see its SPEC.md.

**Prompt**
```
Read AGENTS.md, docs/07-data-models.md and packages/contracts/SPEC.md.
Implement every schema in docs/07 as zod schemas in packages/contracts/src, split by file as the SPEC lists. Export XSchema and type X = z.infer<typeof XSchema> for each.
RuleNode is recursive: use z.lazy. FieldValue accepts boolean | number | string | range object {lt?,lte?,gt?,gte?} with at least one key.
Add fixtures/ with one valid and one invalid JSON example per schema and tests that the valid ones parse and invalid ones fail.
Export a helper toJsonSchema(schema) for LLM structured output.
```

**Done when**
- [ ] Frontend can `import type { Verdict } from "@yojana/contracts"`.
- [ ] Fixture tests green. Tell the frontend in chat: "contracts v0 merged".

---

### BE-03 · Engine core — P0 · H2.5–4.5 · depends on: BE-02

**Goal:** Kleene logic, all operators including ranges, `evaluate` and `evaluateAll`.

**Prompt**
```
Read AGENTS.md, docs/08-matching-engine.md and packages/engine/SPEC.md.
Implement kleene.ts, operators.ts and evaluate.ts exactly as docs/08 describes.
Write tests FIRST: full truth tables for and/or/not; every operator with point values at, below and above thresholds; ranges per the table in docs/08 (fully inside, fully outside, straddling); declined field → unknown; missing field → unknown.
evaluate() must record a CriterionResult for every leaf, even when the root is decided early.
No Date, no randomness, no I/O. Import only @yojana/contracts.
```

**Done when**
- [ ] All tests green, 100 % branch coverage on kleene.ts and operators.ts.

---

### BE-04 · Engine: questions, ranking, near miss — P0 · H4.5–6 · depends on: BE-03

**Prompt**
```
Read docs/08-matching-engine.md sections missingFields, nextQuestion, Ranking, Near miss.
Implement missing-fields.ts (flip test per unknown leaf), next-question.ts (score = weight*10 - askOrder; skip declined and askable=false), rank.ts, near-miss.ts, unlock.ts. Export the public API listed in docs/08.
Tests: nextQuestion returns null when nothing is unknown; ties broken by askOrder; missingFields excludes fields that cannot change the root; near miss only when exactly one false leaf flips the result.
Add personas.test.ts that loads packages/eval/personas/*.json and packages/schemes data and asserts every expected status (skip gracefully if no personas yet).
```

**Done when**
- [ ] Tests green; persona regression runs on whatever personas exist (≥ 10 by G1).

---

### BE-05 · Schemes loader, validator, bundle — P0 · H3–5 (interleave with BE-03/04) · depends on: BE-02

**Prompt**
```
Read packages/schemes/SPEC.md and docs/17-knowledge-base-guide.md.
Implement src/load.ts, src/validate.ts (all cross-checks in the SPEC), src/bundle.ts (buildBundle(state) → SchemeBundle: fields + documents + central + that state's schemes, version = timestamp-state-shortHash).
CLI: `pnpm schemes:check` (non-zero exit with file + JSON path on errors) and `pnpm schemes:bundle --state KA` writing apps/web/public/schemes.bundle.json.
```

**Done when**
- [ ] Data track's first 10 schemes validate; bundle file written for the frontend. Tell the frontend.

---

### BE-06 · Railway Postgres + `packages/db` — P0 · H5–7 · depends on: BE-05

**Prompt**
```
Read docs/18-database-railway.md and packages/db/SPEC.md.
Implement schema.ts exactly as docs/18, client.ts (postgres.js + drizzle, max 5 connections, DATABASE_URL from env), queries/bundles.ts, and scripts: migrate, seed (idempotent upserts from @yojana/schemes, validate with contracts first), publish (--state, --notes; retire previous published), export (--state → apps/web/public/schemes.bundle.json).
Generate the first migration with drizzle-kit and commit it.
```

**Steps outside the IDE:** create Postgres in Railway; copy its public URL into local `.env`; run `pnpm db:migrate && pnpm db:seed && pnpm db:publish --state KA && pnpm db:export --state KA`.

**Done when**
- [ ] Railway DB has tables and one published bundle; `seed` twice changes nothing.

---

### BE-07 · API skeleton on Railway + bundle route — P0 · H6–8 · depends on: BE-06 · **Gate G2**

**Prompt**
```
Read AGENTS.md, apps/api/SPEC.md, docs/13-security-and-privacy.md.
Scaffold apps/api with Hono + @hono/node-server listening on env PORT. env.ts validates env with zod and exits on failure.
Middleware: request-id, CORS allowlist from ALLOWED_ORIGINS, body-limit, timeout (8 s), in-memory rate limit, error handler producing the error format in the SPEC, admin-auth (x-admin-key; route disabled if ADMIN_KEY unset).
Routes: GET /v1/health (checks DB with SELECT 1), GET /v1/schemes/bundle?state=KA served from services/bundle-cache.ts (memory, refresh every 60 s) with ETag = version id and 304 on If-None-Match.
Tests with app.request(): health ok, bundle 200 then 304, unknown state 404, CORS blocks unknown origin.
logger.ts + redact.ts: never log bodies; unit-test that redact strips utterance/profile keys.
```

**Railway:** new service from the GitHub repo; build/start/pre-deploy commands from doc 18; variables reference Postgres `DATABASE_URL`; health check `/v1/health`; generate domain → give it to frontend as `VITE_API_URL`.

**Done when**
- [ ] `https://<api>/v1/health` → `db: "up"`; `/v1/schemes/bundle?state=KA` returns the bundle.

---

### BE-08 · `/v1/extract` — P0 · H8–10 · depends on: BE-07 · **Gate G3**

**Prompt**
```
Read docs/09-ai-layer-and-prompts.md (Prompt 1 and post-processing) and apps/api/SPEC.md.
Implement providers/llm/types.ts (LlmProvider interface from docs/09) and one vendor adapter selected by LLM_PROVIDER, using structured JSON output where the provider supports it, temperature 0, 8 s timeout.
Implement routes/extract: build the system + user prompt exactly as docs/09, call provider.json with ExtractResponseSchema, then evidence-filter.ts (drop updates whose evidence is not in the utterance; fuzzy ≥ 0.8) and field-registry filter (unknown field, bad enum, out-of-range → drop). Cache by hash(utterance, known, askedField, lang).
Tests with recorded fixtures (never call the real provider in tests): good response; malformed JSON → PROVIDER_FAILED; hallucinated field dropped; evidence not in utterance dropped; timeout → TIMEOUT.
```

**Done when**
- [ ] Hero utterance (English and Kannada) returns `marital_status` + `occupation` live.
- [ ] All extract tests green.

---

### BE-09 · `/v1/explain` — P1 · H10–11 · depends on: BE-08

**Prompt**
```
Implement routes/explain per docs/09 Prompt 2. Input includes the deterministic template sentence. Output passes number-guard.ts: if the text contains any digit sequence or ₹ amount not present in the input, return the template instead. Cache by hash(schemeId, status, results, lang). Tests for guard pass/fail.
```

---

### BE-10 · `/v1/stt` and `/v1/tts` (Sarvam) — P1 · H11–13 · depends on: BE-07

**Prompt**
```
Read docs/10-voice-and-languages.md.
Implement providers/speech/sarvam.ts against the current Sarvam API (check docs.sarvam.ai for endpoint, model names and accepted audio formats). Speech-to-text: accept multipart audio (≤ 2 MB, ≤ 30 s) + lang; convert format server-side only if required. Text-to-speech: { text ≤ 600 chars, lang } → audio bytes with correct content-type; cache by hash(text, lang).
Never log audio or transcripts. Tests with recorded fixtures.
```

**Done when**
- [ ] Kannada audio recorded on the demo phone transcribes correctly; TTS plays in the browser.

---

### BE-11 · Eval runner + metrics — P0 · H13–15 · depends on: BE-04, data personas

**Prompt**
```
Read docs/12-accuracy-evaluation.md and packages/eval/SPEC.md.
Implement metrics.ts (confusion matrix over eligible/maybe/ineligible, falseEligibleRate, recall, precision, exact), simulate.ts (questions-to-stable using persona.truth and engine.nextQuestion), run.ts (`pnpm eval [--fail-on-mismatch] [--baseline]`) writing reports/latest.json in the shape shown in docs/12, and save.ts (also insert into eval_runs if DATABASE_URL is set).
metrics.ts must be importable by the web app's accuracy-lab (no Node-only imports in it).
```

**Done when**
- [ ] `pnpm eval --fail-on-mismatch` green on all available personas; report written.

---

### BE-12 · Baseline route + committed baseline report — P1 · H15–16.5 · depends on: BE-08, BE-11

**Prompt**
```
Implement POST /v1/baseline per docs/09 Prompt 3 (x-baseline-key required; route disabled if BASELINE_KEY unset). Build each scheme's plain-text eligibility from criterion labels + benefit summary.
Implement packages/eval/src/baseline.ts: for each persona call /v1/baseline with concurrency 3, 2 retries; store raw responses in reports/baseline-<date>.json; compute baseline metrics into reports/latest.json.
```

**Done when**
- [ ] `reports/latest.json` has both engine and baseline sections; committed. Tell the frontend (accuracy-lab reads it).

---

### BE-13 · Feedback, versions, admin publish (live-update showcase) — P1 · H16.5–18 · depends on: BE-07

**Prompt**
```
Implement POST /v1/feedback (zod: screen, schemeId?, helpful, comment ≤ 280, lang, appVersion; rate limit 5/min/IP; insert into feedback), GET /v1/schemes/versions?state=KA, and POST /v1/admin/publish (x-admin-key) reusing packages/db publish logic; bundle-cache refreshes immediately after publish.
```

**Done when**
- [ ] Publishing a new version on the laptop changes the ETag; the phone picks it up on refresh (with FE-06).

---

### BE-14 · Hardening — P0 · H18–19

- [ ] CORS allowlist includes the production web domain and Capacitor origins only.
- [ ] Rate limits on; body limits on; admin/baseline keys set in Railway.
- [ ] Railway backups enabled; rotate the DB password if the public URL was shared.
- [ ] `redact` test green; grep logs for any utterance text after a test run.

### BE-15 · Freeze support — H20–24

Bug fixes only. Keep Railway dashboard open during judging; watch API logs for errors.
