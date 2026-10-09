# RAG tasks — grounded scheme Q&A

Design: `docs/20-rag-scheme-qa.md` · Frontend feature: `apps/web/src/features/scheme-qa/SPEC.md`

RAG answers questions **about** schemes from official text, with citations. It never decides eligibility — that stays with `packages/engine`.

---

## Additions to existing specs (apply once, when this file is added)

**apps/api — new route**

| Method & path | Priority | Input → Output | Backed by |
| --- | --- | --- | --- |
| `POST /v1/ask` | P1 (Level 1), P2 (Level 2) | `{ question ≤ 300 chars, lang, schemeId? }` → `{ answer, citations: [{ chunkId, schemeId, sourceUrl, quote }], suggestedSchemeIds, refused?: "not_in_sources" \| "eligibility_question" }` | `scheme_chunks` (held in memory) + LLM (+ embeddings for Level 2) |

New files: `apps/api/src/routes/ask/{handler.ts, prompt.ts, retrieve.ts, guards.ts}`, `apps/api/src/services/chunk-cache.ts`.

**packages/db — new table**

```ts
export const schemeChunks = pgTable("scheme_chunks", {
  id: text("id").primaryKey(),                       // "central.ignwps#3"
  schemeId: text("scheme_id").notNull(),
  heading: text("heading"),
  text: text("text").notNull(),
  sourceUrl: text("source_url").notNull(),
  embedding: jsonb("embedding"),                     // number[] for Level 2; null for Level 1. No pgvector needed.
  bundleVersion: text("bundle_version"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [index("scheme_chunks_scheme_idx").on(t.schemeId)]);
```

**packages/contracts — new schemas:** `AskRequest`, `AskResponse`, `Citation` (shapes above).

**Privacy:** `/v1/ask` receives the question text only — never profile data. Questions are not logged.

---

## DATA-09 · RAG corpus + 20 test questions — Data · P1 · H8–13 (corpus can start now)

- [ ] For every scheme, save the official text used for rule drafting to `packages/schemes/sources/<scheme-id>.md`. First line: `Source: <url> · Retrieved: <date>`. Copy exactly; don't summarise.
- [ ] Write `packages/eval/rag-questions.json`: 20 questions — 12 answerable (with expected chunk or heading), 5 not in the sources, 3 eligibility questions. At least 5 in Kannada.
- [ ] After BE-16, run `pnpm eval:rag` and report the three metrics honestly.

---

## BE-16 · `/v1/ask` (RAG Level 1) — Backend · P1 · H13–15.5 · depends on: BE-08, DATA-09

**Prompt**
```
Read AGENTS.md, docs/20-rag-scheme-qa.md and tasks/rag.md completely.
1. Add AskRequest, AskResponse, Citation to packages/contracts with fixtures and tests.
2. packages/schemes/src/rag/: chunker (headings → paragraphs, 200–400 words, 40-word overlap) over packages/schemes/sources/*.md, and script `pnpm rag:index` that upserts into scheme_chunks. Add the table to packages/db/src/schema.ts exactly as tasks/rag.md and generate a migration. Level 1: embedding stays null.
3. apps/api: services/chunk-cache.ts (load all chunks at boot, refresh after publish); routes/ask with retrieve.ts (all chunks of schemeId), prompt.ts (exactly as docs/20), guards.ts (all 5 guards in docs/20). Translate the question to English first when lang ≠ en; answer in the user's language. Cache by hash(question, schemeId, lang, bundleVersion).
4. No profile data in the request. Never log questions.
5. Tests with recorded LLM fixtures: grounded answer passes; invented citation id dropped; quote not in chunk dropped; number not in cited chunks → refused; "am I eligible" → refused eligibility_question.
6. packages/eval: `pnpm eval:rag` runs packages/eval/rag-questions.json against /v1/ask → reports/rag-latest.json with the three metrics in docs/20.
```

**Done when**
- [ ] Hero scheme answers "How much money?" and "Where do I apply?" with correct citations, in English and Kannada.
- [ ] Guard tests green; `reports/rag-latest.json` committed.

**Level 2 (P2, only after gate G5):** embeddings in `rag:index`, cosine top-6 in `retrieve.ts` when no schemeId, keyword boost on scheme names, `suggestedSchemeIds` in the response.

---

## FE-17 · Ask about this scheme — Frontend · P1 · H15.5–17 · depends on: BE-16, FE-09

**Prompt**
```
Read AGENTS.md, apps/web/src/features/scheme-qa/SPEC.md and docs/20-rag-scheme-qa.md.
Implement scheme-qa Level 1: AskAboutScheme card on scheme-detail (collapsed by default), SuggestedQuestions chips, text + mic input (reuse voice), AnswerBubble with citation markers, CitationSheet (quote + official link), RefusalBubble (not_in_sources → ask at office; eligibility_question → "Check if I qualify" button that scrolls to the verdict). Offline state. Read aloud on answers. Add 3 scripted Q&As for the hero scheme to demo-mode.
```

**Done when**
- [ ] Ask "how much money?" in Kannada → Kannada answer with a citation you can open.
- [ ] Ask "am I eligible?" → hand-off button, never yes/no.
