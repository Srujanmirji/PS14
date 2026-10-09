# 19 · Final technical report

The sixth expected outcome. Judges may read it after the demo, so it must stand on its own. It is written mostly from evidence the build already produces, so it takes about 2 hours, not 6.

**Owner:** Aryan (sections 1–3, 6–8) · Srujan (sections 4–5) · Satvik (screenshots, section 6 figures)
**When:** outline at hour 14, filled at hours 20–23, exported to PDF before the deadline.
**File:** `report/REPORT.md` → exported as `report/Yojana-Saathi-Technical-Report.pdf` (e.g. with the `md-to-pdf` npm package, or paste into a Docs artifact and download as PDF).
**Length:** 8–12 pages. Every number must come from a file in the repo, and the report says which.

## Expected outcome → where the evidence is

| Expected outcome | Report section | Evidence in the repo |
| --- | --- | --- |
| Working AI government-scheme matching platform | §4 Architecture, §6 Product walkthrough | Live URL, APK, `docs/02`, screenshots |
| Scheme and eligibility knowledge base | §3 Knowledge base | `packages/schemes/data`, `schemes:check` output, Railway `bundle_versions` |
| Personalized scheme matching module | §5 Matching engine | `packages/engine`, its tests, `docs/08` |
| Application guidance interface | §6 Product walkthrough | scheme-detail + documents + benefit-card screenshots |
| Matching accuracy and user-guidance analysis | §7 Evaluation | `packages/eval/reports/latest.json`, `user-tests.md` |
| Final technical report and demonstration | This report + §9 Demo | Demo video link, live URL |

## Outline (copy into `report/REPORT.md`)

```markdown
# Yojana Saathi — Technical Report
Team <name> · <hackathon> · <date> · Live: <url> · Demo video: <link> · Repo: <link>

## Summary (half a page)
Problem in 2 sentences. What we built in 3 sentences. The headline result:
"On 50 labelled test cases, our engine gave a wrong 'eligible' N times; an LLM-only approach did so M times."

## 1. Problem and users
The problem statement's three challenges, in our words. Personas (Lakshmi, Ravi, Shankar, Fatima, CSC operator).
Market evidence with sources (from the playbook doc).

## 2. Existing solutions and gap
Table: myScheme, Jugalbandi, Haqdarshak, independent checkers → what each lacks.
Our position: partial information + explained verdicts + measured accuracy.

## 3. Knowledge base
- Coverage: <n> central + <n> Karnataka schemes, <n> profile fields, <n> documents. (from `pnpm schemes:check`)
- Pipeline diagram: official page → criteria sheet → LLM draft → human verification → validation → Postgres → published bundle.
- Data model: Scheme, Criterion, RuleNode (excerpt of one real scheme JSON).
- Quality controls: every criterion sourced; ambiguous rules become "Check with office" notes; versioned bundles.
- Limitations: one state; rules last checked on <date>.

## 4. System architecture
- Architecture diagram (docs/02).
- Local-first: engine + knowledge base on device; API on Railway; Postgres stores schemes, versions, eval runs, feedback — never citizen profiles.
- AI layer: LLM only extracts facts and rewrites explanations; never decides. Guardrails: schema validation, field registry, evidence check, number guard.
- PWA + Android (Capacitor). Offline behaviour.
- Security and privacy summary (docs/13).
- Tech stack table.

## 5. Personalized matching engine
- Three-valued (Kleene) logic with the truth tables.
- Handling incomplete information: unknown fields, income/land ranges, declined fields.
- Next-best-question algorithm and its scoring.
- Ranking and near-miss ("what would change").
- Tests: count and coverage (from test output).

## 6. Application guidance interface
Screenshots with one-line captions: Home, Conversation, Results (three groups + unlock meter),
Scheme detail (why / what would change / documents / how to apply / check before you go), Documents, Benefit card.
Design choices: verdict = icon + word + colour; ≤ 5 results first; Kannada voice; low-power mode.

## 7. Evaluation
### 7.1 Matching accuracy
- Test set: 50 personas (20 complete, 20 partial, 10 edge), double-labelled; inter-labeller disagreements: <n>.
- Table: engine vs LLM-only baseline — exact match, false-eligible rate, recall, precision.
- Confusion matrices (both).
- Questions to stable results: median <n>.
- Error analysis: every engine error, with its cause.
### 7.2 User-guidance analysis
- Method: 5 people, one task, timed on Saathi vs myScheme, 3 questions.
- Results table + quotes. State n = 5 and that it is indicative only.

## 8. Limitations and future work
Honest list (coverage, rule freshness, small user test, no application submission).
Roadmap: assisted mode, all states, rule-update pipeline with human review, 22 languages, proactive delivery.

## 9. Demonstration
Live URL, APK, demo video link, 3-minute demo script summary, how to run locally (commands from README).

## Appendix
A. Field registry · B. Scheme list with sources · C. Persona summary · D. Prompts used (extract, explain, baseline)
```

## Rules

- No number may be typed from memory. Copy it from `reports/latest.json`, `schemes:check` output, test output or `user-tests.md`, and cite the file.
- If the engine has errors, list them in §7.1 with their causes. Hiding them is worse than having them.
- Screenshots come from the demo-mode run so they match the video.

## Agent prompt (hour 20, after G6)

```
Read AGENTS.md and docs/19-technical-report.md.
Create report/REPORT.md using the outline in docs/19.
Fill every section ONLY from these sources: docs/*, packages/eval/reports/latest.json, packages/eval/reports/user-tests.md,
the output of `pnpm schemes:check` and `pnpm test` (run them), and packages/schemes/data.
Where a value is missing, write [TODO: what is needed] — never invent a number, quote or result.
Include the mermaid diagrams from docs/02 and docs/08.
At the end, list every [TODO] you left.
```
