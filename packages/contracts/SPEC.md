# packages/contracts — SPEC

**Track:** Backend owns, both tracks consume · **Priority:** P0 · **Build first (hour 1–3)** — it unblocks everyone.

## Purpose

One definition of every shape that crosses a boundary: profile, field, scheme, verdict, persona, API requests and responses, bundle, feedback, eval report.

## Files

```
src/
├── lang.ts          # Lang = "en" | "kn" | "hi"; I18nText
├── fields.ts        # FieldDef, QuickReply, FieldValue (incl. ranges)
├── profile.ts       # ProfileEntry, Profile
├── scheme.ts        # Criterion, RuleNode (recursive z.lazy), Scheme, DocumentDef, SchemeBundle
├── verdict.ts       # Truth, Status, CriterionResult, Verdict, NextQuestion
├── persona.ts       # Persona
├── api.ts           # Extract*, Explain*, Stt*, Tts*, Feedback*, Baseline*, ErrorBody
├── eval.ts          # EvalReport
├── json-schema.ts   # toJsonSchema via z.toJSONSchema
└── index.ts         # re-exports schemas (XSchema) and types (X)
fixtures/            # valid + invalid sample of each
```

Naming: zod schema `SchemeSchema`, inferred type `Scheme`.

## Acceptance

- [x] Every type in `docs/07-data-models.md` exists with a zod schema.
- [x] Fixture tests: each valid fixture parses, each invalid one fails with a useful path.
- [x] `z.toJSONSchema` (or `zod-to-json-schema`) export available for provider structured output.
- [x] Zero runtime deps other than zod.

## BE-02 contract decisions

- All 32 exported JSON schemas have synthetic valid/invalid fixtures. None represent verified schemes, real citizens or persona regression labels.
- Missing profile entries and optional fields stay missing: schemas apply no defaults or coercion. Field ranges require at least one numeric bound, including in generated JSON Schema.
- Objects reject unknown keys; rule nodes accept exactly one of `all`, `any`, `not` or a criterion. Operator/value compatibility and registry references remain BE-05 validation responsibilities.
- `ExplainRequest` follows doc 07 exactly; BE-09's template input requires a later contract update.
- `SttRequest` validates multipart language metadata only. Binary audio input and TTS output validation are deferred to BE-10, as approved; there is no invented JSON audio response.
- `ErrorBody` follows the API SPEC. `EvalReport` follows doc 12's JSON example, with optional baseline fields for engine-only runs.
- Public `Verdict` imports compile with browser libraries and no Node ambient types. All workspaces continue to consume source directly.
- The BE-01 zero-exports placeholder is retired; fixture, edge-case and JSON Schema tests replace it. Frontend readiness can be announced after checks; merged status requires an actual merge.
