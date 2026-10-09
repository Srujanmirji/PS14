# 12 · Accuracy evaluation (`packages/eval` + Accuracy Lab)

The headline number is the **false-eligible rate**: how often we tell someone "you qualify" when they don't. That mistake costs a poor family a wasted trip, fees and trust.

## Test set — 50 personas

| Group | Count | Purpose |
| --- | --- | --- |
| Complete | 20 | Every field known; tests rule correctness |
| Partial | 20 | 2–4 fields missing; tests the Maybe path and missingFields |
| Edge | 10 | Age exactly at a cutoff, income ₹1 above a cap, conflicting criteria, declined sensitive field |

Rules for labelling (data track, before the event):
- Two people label every persona against every scheme, independently, from the official criteria.
- Disagreement → the rule is ambiguous. Resolve by reading the source; if still unclear, label `maybe` and add a `verifyNotes` entry to the scheme.
- Labels are frozen before engine code is written. Never relabel to make the engine pass; fix the engine or the scheme JSON.

## Metrics (computed per scheme × persona pair, then aggregated)

| Metric | Definition |
| --- | --- |
| False-eligible rate | predicted `eligible` but expected `maybe` or `ineligible`, ÷ all predicted `eligible` |
| Recall (eligible) | predicted `eligible` ∩ expected `eligible` ÷ expected `eligible` |
| Precision (eligible) | predicted `eligible` ∩ expected `eligible` ÷ predicted `eligible` |
| Maybe honesty | predicted `maybe` where expected `maybe` ÷ predicted `maybe` |
| Exact match | predicted status = expected status ÷ all pairs |
| Questions to stable | median number of `nextQuestion` steps until no maybes remain, simulated by answering from the persona's full profile (partial personas only have their known fields; simulate the rest from a hidden "truth" profile stored with the persona) |

Also report a 3 × 3 confusion matrix (expected × predicted).

## Runner

```bash
pnpm eval                 # engine only, fast, writes reports/latest.json
pnpm eval --baseline      # also calls /v1/baseline for every persona (slow; run once, commit result)
```

`reports/latest.json`:

```json
{
  "runAt": "2026-…",
  "bundleVersion": "…",
  "engine":   { "pairs": 2500, "exact": 0.0, "falseEligibleRate": 0.0, "recall": 0.0, "precision": 0.0, "confusion": [[0,0,0],[0,0,0],[0,0,0]] },
  "baseline": { "pairs": 2500, "exact": 0.0, "falseEligibleRate": 0.0, "recall": 0.0, "precision": 0.0, "confusion": [[0,0,0],[0,0,0],[0,0,0]] },
  "disagreements": [{ "personaId": "p07", "schemeId": "central.x", "expected": "maybe", "engine": "maybe", "baseline": "eligible" }]
}
```

(Zeros are placeholders — the runner fills real numbers. Never type numbers into this file by hand.)

The report is also written to the `eval_runs` table in Railway Postgres (doc 18) so you can show the history of runs improving.

## Baseline fairness

The LLM baseline gets the same profile and the same scheme eligibility text the engine is built from, temperature 0, and the same three allowed answers. If you tune the engine, you may tune the baseline prompt once too. Report both honestly, including where the baseline wins.

## User-guidance analysis (5 real people)

Recruit a farmer relative, a CSC operator, a student, an elderly neighbour, a shopkeeper.

| Step | Measure |
| --- | --- |
| Task: "Find one scheme you could get and list the documents you'd carry." | Time on Saathi vs time on myScheme |
| Afterwards, three questions | Was it clear? Did you trust it? What confused you? (1–5 + one sentence) |

Report n = 5 honestly on the slide. One real quote beats a fake percentage.

## In the app: Accuracy Lab

The `accuracy-lab` feature reads `reports/latest.json` for the baseline column and re-runs the **engine** live on stage in a Web Worker (it takes milliseconds — animate it over ~3 s so judges can watch). See the feature spec.
