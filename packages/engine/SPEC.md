# packages/engine — SPEC

**Track:** Backend · **Priority:** P0 (hours 1–5) · Full design: `docs/08-matching-engine.md`

## Purpose

Pure, deterministic eligibility logic that runs on the phone, in CI and in the Accuracy Lab worker.

## Files

```
src/
├── kleene.ts          # and/or/not over Truth
├── operators.ts       # eq, neq, in, nin, lt, lte, gt, gte, between, truthy, falsy — point values and ranges
├── evaluate.ts        # evaluate(profile, scheme, fields) → Verdict; evaluateAll
├── missing-fields.ts  # which unknown fields can flip the root
├── near-miss.ts
├── next-question.ts
├── rank.ts
├── unlock.ts
└── index.ts
test/
├── kleene.test.ts  operators.test.ts  ranges.test.ts  evaluate.test.ts
├── next-question.test.ts  rank.test.ts
└── personas.test.ts   # loads packages/eval personas + packages/schemes data; every expected status must match
```

## Constraints

- Imports only `@yojana/contracts`.
- No `Date`, `Math.random`, I/O, globals, or mutation of inputs.
- Tree evaluation records every leaf result (no hidden short-circuit skips in `results`).

## Acceptance

- [ ] 100 % branch coverage on `kleene.ts` and `operators.ts`.
- [ ] Persona regression green.
- [ ] `evaluateAll` for 50 schemes < 5 ms in Node on a laptop (benchmark test, warn-only).
