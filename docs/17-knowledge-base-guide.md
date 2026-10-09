# 17 · Knowledge base guide (data track)

How to turn an official scheme page into verified, machine-checkable rules. Quality here decides the accuracy number more than any code.

## Scope

- ~25 central schemes + ~25 Karnataka schemes, chosen for the hero personas (widow/elderly, farmer, student, informal worker, small business, women and child, disability).
- Start from each scheme's page on myScheme and the issuing department's own site. Prefer the department's notification or guidelines when they disagree, and note the disagreement.

Candidate central schemes to research (verify each is current and read its official criteria; do not copy criteria from this list — there are none here on purpose):
PM-KISAN · PM Jan Arogya Yojana (Ayushman Bharat) · NSAP pensions (old age, widow, disability) · PM Awas Yojana (Gramin / Urban) · PM MUDRA Yojana · PMEGP · PM Ujjwala Yojana · Atal Pension Yojana · PM Jeevan Jyoti Bima Yojana · PM Suraksha Bima Yojana · PM Matru Vandana Yojana · e-Shram registration · National scholarships (pre-/post-matric for SC/ST/OBC/minorities) · PM Fasal Bima Yojana · Stand-Up India · PM SVANidhi · Sukanya Samriddhi Yojana.

For Karnataka, pick schemes for the same personas from the state's official department sites and myScheme's Karnataka filter.

## Pipeline

1. **Sheet first.** One row per criterion: `scheme_id | field | op | value | plain label | source_url | quote (≤ 25 words) | notes`. Also list documents, steps, apply link, benefit summary.
2. **Missing field?** If a criterion needs a fact not in `fields.json`, add the field (with question text in en/kn/hi and askOrder) — but only if ≥ 2 schemes need it; otherwise express it as a verify note ("Must not already receive another state pension — confirm at office").
3. **Draft JSON with the LLM** (prompt below), one scheme at a time.
4. **Human verify every line** against the source. Tick the `verified` column in the sheet.
5. **Validate**: `pnpm schemes:check`.
6. **Seed and publish**: `pnpm db:seed && pnpm db:publish` (doc 18).
7. **Label personas** against the new scheme (two people), then `pnpm eval`.

## Rules for writing rules

- Model only what the official text states. Unclear → `verifyNotes`, not a guessed criterion.
- Use `between` for inclusive ranges as stated ("40 to 79 years" → `[40, 79]`); write a note when the source doesn't say inclusive or exclusive.
- "Family income" vs "individual income" are different fields — don't merge them.
- Prefer `in` over chains of `any` for enum membership.
- A scheme with a criterion you cannot express (e.g. "as decided by the gram sabha") gets `maybe` at best: add an always-unknown criterion with field `office_decision` (never asked) so the engine can't say `eligible`.
- Benefit amounts only if printed on the official page; otherwise leave `amountINR` empty.

## LLM drafting prompt

```
You convert an Indian government scheme's official eligibility text into JSON for a rule engine.

Use ONLY these field ids and allowed values:
{{fields.json, compact}}

Output one JSON object matching this TypeScript type:
{{Scheme type from docs/07-data-models.md}}

Rules:
- Every criterion must be stated in SOURCE_TEXT. Do not add common-sense criteria.
- For each criterion include source.quote: the exact words from SOURCE_TEXT (≤ 25 words).
- If a condition cannot be expressed with the given fields, do not invent a field. Put it in verifyNotes.
- Write label, steps and verifyNotes in English, Kannada and Hindi.
- Leave benefit.amountINR empty unless an amount is stated.

SCHEME_ID: {{id}}
SOURCE_URL: {{url}}
SOURCE_TEXT:
"""{{pasted official text}}"""
```

Then a human checks: every `quote` really appears in the source; every op and value matches; translations read naturally.

## Example (illustrative — verify against the current official source before use)

```json
{
  "id": "central.ignwps",
  "name": { "en": "Indira Gandhi National Widow Pension Scheme", "kn": "…", "hi": "…" },
  "level": "central",
  "category": "pension",
  "benefit": { "summary": { "en": "Monthly pension", "kn": "…", "hi": "…" }, "period": "monthly" },
  "rule": { "all": [
    { "id": "ignwps.gender", "field": "gender", "op": "eq", "value": "female", "label": { "en": "Woman", "kn": "…", "hi": "…" } },
    { "id": "ignwps.widow", "field": "marital_status", "op": "eq", "value": "widow", "label": { "en": "Widow", "kn": "…", "hi": "…" } },
    { "id": "ignwps.age", "field": "age", "op": "between", "value": [40, 79], "label": { "en": "Age 40 to 79", "kn": "…", "hi": "…" } },
    { "id": "ignwps.bpl", "field": "ration_card", "op": "in", "value": ["bpl", "aay"], "label": { "en": "Below-poverty-line household", "kn": "…", "hi": "…" } }
  ]},
  "documents": ["aadhaar", "death_certificate_spouse", "bpl_card", "bank_passbook", "age_proof"],
  "steps": [{ "en": "Apply at your taluk office or the state's online service portal", "kn": "…", "hi": "…" }],
  "sourceUrl": "<official page>",
  "lastChecked": "2026-10-09",
  "verifyNotes": [{ "en": "The state adds its own amount; confirm the total at the taluk office.", "kn": "…", "hi": "…" }],
  "priority": 5
}
```

## Ownership

Data track owns `packages/schemes/data`, `fields.json`, `documents.json` and `packages/eval/personas`. Engineers don't edit scheme facts; they file an issue for the data owner.
