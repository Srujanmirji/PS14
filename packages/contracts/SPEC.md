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
└── index.ts         # re-exports schemas (XSchema) and types (X)
fixtures/            # valid + invalid sample of each
```

Naming: zod schema `SchemeSchema`, inferred type `Scheme`.

## Acceptance

- [ ] Every type in `docs/07-data-models.md` exists with a zod schema.
- [ ] Fixture tests: each valid fixture parses, each invalid one fails with a useful path.
- [ ] `z.toJSONSchema` (or `zod-to-json-schema`) export available for provider structured output.
- [ ] Zero runtime deps other than zod.
