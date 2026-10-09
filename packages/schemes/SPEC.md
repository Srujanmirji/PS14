# packages/schemes — SPEC

**Track:** Data owns content; Backend owns scripts · **Priority:** P0 · Guide: `docs/17-knowledge-base-guide.md`

## Purpose

The human-verified source files for the knowledge base, plus the validator. Postgres (`packages/db`) is seeded from here; Git history is the audit trail.

## Files

```
data/
├── central/<scheme-id>.json
└── karnataka/<scheme-id>.json
fields.json            # FieldDef[]
documents.json         # DocumentDef[]
sheets/                # exported criteria spreadsheets (CSV) — research trail
src/
├── load.ts            # read all JSON, parse with contracts
├── validate.ts        # cross-checks (below)
├── bundle.ts          # build a SchemeBundle for a state (used by db:publish and tests)
└── cli.ts             # `pnpm schemes:check`
```

## Validator cross-checks

- Every scheme parses with `SchemeSchema`.
- Every criterion `field` exists in `fields.json`; its `op`/`value` fit the field type and options.
- Every document id exists in `documents.json`.
- `sourceUrl` and `lastChecked` present; `lastChecked` not older than 90 days (warning).
- Every `I18nText` has `en`, `kn` (and `hi` if Hindi is in scope) — non-empty.
- Scheme ids unique and match file names.
- Criterion ids unique within a scheme.

## Acceptance

- [x] `pnpm schemes:check` exits non-zero on any error with file + JSON path.
- [ ] ≥ 10 schemes by hour 5, ≥ 40 by hour 14.
