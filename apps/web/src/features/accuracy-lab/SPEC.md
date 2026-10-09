# accuracy-lab — SPEC

**Track:** Frontend (reads `packages/eval` report) · **Priority:** P1 (the numbers themselves are P0) · **Route:** `/lab` · Method: `docs/12-accuracy-evaluation.md`

## Purpose

The on-stage proof: run the engine on 50 labelled personas live and compare it with an LLM-only baseline.

## Folder

```
accuracy-lab/
├── SPEC.md
├── index.ts                  # export { routes }
├── routes.tsx                # /lab (desktop-first layout, works on tablet)
├── worker/run-eval.worker.ts # imports @yojana/engine + personas; posts progress events
├── components/
│   ├── RunButton.tsx         # big gradient "Run 50 personas"
│   ├── ProgressStrip.tsx     # persona chips lighting up as they finish (paced to ~3 s total)
│   ├── ConfusionMatrix.tsx   # 3×3 grid, diagonal glows, counts animate up
│   ├── MetricCards.tsx       # false-eligible rate, recall, precision, exact match — engine vs baseline side by side
│   ├── Disagreements.tsx     # list: persona, scheme, expected, engine, baseline; click → persona detail
│   └── PersonaDetail.tsx     # profile, expected vs got per scheme
├── lib/
│   ├── metrics.ts            # re-exported from @yojana/eval (single implementation)
│   └── load-report.ts        # baseline column from bundled reports/latest.json (or GET from API if added)
└── i18n/{en,kn,hi}.json      # English is fine for judges; keep keys anyway
```

## Behaviour

- Personas and the baseline report are bundled into this route's lazy chunk (not the main app).
- Engine results computed live in the worker; baseline results read from the committed report (never 50 live LLM calls on stage).
- Show bundle version and report timestamp in the corner — judges may ask.
- If engine and committed report disagree with the current bundle (stale report), show a small warning badge.

## Acceptance

- [ ] Button → full animation → final numbers in ≤ 4 s on the demo laptop.
- [ ] Numbers on screen equal `pnpm eval` output exactly.
- [ ] Every disagreement row opens the persona and scheme detail.
- [ ] Works offline.
