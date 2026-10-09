# packages/eval — SPEC

**Track:** Data owns personas; Backend owns runner · **Priority:** P0 (numbers), P1 (baseline) · Method: `docs/12-accuracy-evaluation.md`

## Files

```
personas/<id>.json       # 50 Persona files (20 complete, 20 partial, 10 edge)
reports/
├── latest.json          # last full run (engine + baseline) — committed
└── baseline-<date>.json # raw baseline responses — committed
src/
├── metrics.ts           # confusion matrix, falseEligibleRate, recall, precision, exact, questionsToStable
├── run.ts               # pnpm eval [--baseline] [--fail-on-mismatch]
├── baseline.ts          # calls POST /v1/baseline with x-baseline-key, concurrency 3, retries 2
├── simulate.ts          # questions-to-stable: answer nextQuestion from persona.truth
└── save.ts              # writes reports/latest.json and inserts into eval_runs (if DATABASE_URL set)
```

## Acceptance

- [ ] `pnpm eval --fail-on-mismatch` exits non-zero if any engine status ≠ expected.
- [ ] `metrics.ts` is the only metrics implementation (the Accuracy Lab imports it).
- [ ] Report includes bundle version and run timestamp.
