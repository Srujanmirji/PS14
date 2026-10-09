# Data tasks

**Owners:** Pranav (knowledge base, report) · Shravan (personas, languages, QA, pitch) · **Owns:** `packages/schemes/data`, `packages/schemes/fields.json`, `packages/schemes/documents.json`, `packages/eval/personas`, translation review of every `i18n/*.json`, the accuracy and user-test numbers in the pitch.

The accuracy number on stage is only as good as these files. Engineers never edit scheme facts or labels; they file a note for you.

---

## Before the event (research, not code — check the rulebook)

### DATA-P1 · Scheme shortlist and criteria sheets
- [ ] Pick ~25 central + ~25 Karnataka schemes covering the personas in `docs/01` (widow/elderly, farmer, student, informal worker, small business, women and child, disability).
- [ ] For each, a sheet row per criterion: `scheme_id | field | op | value | plain label | source_url | quote (≤ 25 words) | notes`. Plus documents, steps, apply link, benefit summary (amount only if printed officially).
- [ ] Mark anything ambiguous; it becomes a `verifyNotes` entry, not a guessed rule.

### DATA-P2 · Field list
- [ ] Start from the 16 fields in `docs/07`; add a field only if ≥ 2 schemes need it. For each: question text (en/kn/hi), why-we-ask text for sensitive fields, quick-reply options (number fields as bands), askOrder.

### DATA-P3 · 50 personas, double-labelled
- [ ] 20 complete, 20 partial (2–4 fields missing, with a hidden `truth` profile), 10 edge cases (cutoff ages, income ₹1 over a cap, declined sensitive field, conflicting criteria).
- [ ] Two people label every persona × scheme independently. Disagreements → re-read the source; still unclear → label `maybe` and add a verify note to the scheme.
- [ ] Freeze labels. They do not change to make the engine pass.

### DATA-P4 · Hero persona script
- [ ] Lakshmi's opening sentence written by a native Kannada speaker, natural and short. Practise saying it.
- [ ] Her full truth profile and the exact taps for each question (feeds `features/demo-mode/script/lakshmi.ts`).
- [ ] Ravi and Shankar as backup personas.

---

## During the event

### DATA-01 · Schemes to JSON — first 10 — P0 · H0–5 · Gate G1
**Prompt (one scheme at a time)**
```
Read docs/17-knowledge-base-guide.md and docs/07-data-models.md.
Using the LLM drafting prompt in docs/17, convert this scheme's official text into JSON with only the field ids in packages/schemes/fields.json.
Scheme id: <id>. Source URL: <url>. Source text: <paste>.
Save to packages/schemes/data/<central|karnataka>/<id>.json.
```
Then verify every line against the source by hand and run `pnpm schemes:check`.

**Done when**
- [ ] 10 schemes validate, each hand-verified (tick in the sheet). Tell backend to run `pnpm schemes:bundle`.

### DATA-02 · `fields.json` and `documents.json` — P0 · H0–3
- [ ] Final field registry with i18n text and quick replies.
- [ ] Documents with how-to-get text; `verify: true` where offices differ.

### DATA-03 · Personas to JSON — P0 · 10 by H6, 50 by H14
- [ ] Convert labelled sheets to `packages/eval/personas/<id>.json` (`docs/07` Persona shape). `expected` must list **every** scheme in the bundle.
- [ ] Run `pnpm eval`. For each mismatch, decide: engine bug (tell Srujan), scheme JSON error (fix it), or label error (only with the second labeller's agreement, and log it in `packages/eval/personas/CHANGES.md`).

### DATA-04 · Schemes to 40+ — P0 · H5–14
- [ ] Same process as DATA-01. Priority order: schemes the hero personas touch first.

### DATA-05 · Translation review — P0 · H10–16
- [ ] Review every `features/*/i18n/kn.json` and `hi.json`, the shared common strings, and scheme `I18nText` fields. Plain words, short sentences.
- [ ] Check Kannada renders in the benefit card PNG export.

### DATA-06 · User tests (5 people) — P1 · H16–19
- [ ] Recruit 5 people (doc 12). One task each; time it on Saathi and on myScheme.
- [ ] Three questions afterwards; write down one quote per person.
- [ ] Summarise in `packages/eval/reports/user-tests.md` (n = 5, honest).

### DATA-08 · Final technical report — P0 · outline H14, write H20–23 · Expected outcome #6
Full outline, evidence map and agent prompt: `docs/19-technical-report.md`.
- [ ] H14: create `report/REPORT.md` with the outline from doc 19 (headings only).
- [ ] H20: run the doc 19 agent prompt to draft it from repo evidence; fill every `[TODO]` by hand.
- [ ] Srujan writes or reviews §4 Architecture and §5 Matching engine; Satvik adds screenshots for §6.
- [ ] Every number traced to a file. Error analysis in §7.1 lists every engine error.
- [ ] Export to PDF; check Kannada text and diagrams render; add the live URL and demo video link.
- [ ] Submit with the deck before the deadline.

### DATA-07 · Pitch numbers and Q&A — P0 · H19–22
- [ ] Copy final numbers from `reports/latest.json` into the deck (accuracy slide: N and M).
- [ ] Fill the verdicts slide with the hero persona's real scheme names.
- [ ] Prepare answers for the judge questions in the playbook, with sources.
- [ ] Be the person who answers data questions on stage.
