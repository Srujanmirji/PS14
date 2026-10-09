# 09 · AI layer and prompts

The LLM has exactly two jobs at runtime and one at build time. Everything it returns is validated; nothing it returns can set a verdict.

| Job | When | Route | Output |
| --- | --- | --- | --- |
| **Listen** — extract profile facts from free text | Every user turn | `POST /v1/extract` | JSON updates, validated against the field registry |
| **Explain** — rewrite a verdict in plain language | Results / detail (online only; templates offline) | `POST /v1/explain` | ≤ 3 sentences, cached |
| **Draft rules** — turn a scheme page into scheme JSON | Before/at start of event | offline script (doc 17) | Draft for human review |
| **Baseline** — LLM-only eligibility, for comparison | Eval only | `POST /v1/baseline` | Statuses, never shown to citizens |

## Provider adapter

```ts
// apps/api/src/providers/llm/types.ts
export interface LlmProvider {
  json<T>(args: {
    system: string;
    user: string;
    schema: z.ZodType<T>;        // converted to JSON Schema for structured output
    temperature?: number;        // default 0
    maxTokens?: number;
    timeoutMs?: number;          // default 8000
  }): Promise<T>;
  text(args: { system: string; user: string; temperature?: number; maxTokens?: number; timeoutMs?: number }): Promise<string>;
}
```

Pick the provider with an env var. Use the provider's structured-output / JSON-schema mode if it has one; otherwise ask for JSON and parse with zod. Either way: **validate, then validate again against the field registry**.

## Prompt 1 — Extract (`routes/extract/prompt.ts`)

**System**

```
You convert what a person says into facts for an Indian government-scheme eligibility form.

Rules:
- Extract ONLY facts the person states about themselves or their household. Do not guess.
- Use ONLY the field ids and allowed values listed in FIELDS. Ignore anything else.
- If a number is approximate ("around 1 lakh", "less than 2 lakh"), return a range object like {"lt":200000} or {"gte":90000,"lte":110000}. Never invent an exact number.
- Never infer caste, religion, disability, or income from names, places, occupation, or language.
- If the person answers the ASKED_FIELD with "don't know" or similar, return no update for it.
- Convert lakh/crore to rupees (1 lakh = 100000). Convert acres to hectares only if the field unit is hectares (1 acre = 0.4047 ha).
- The text may be in Kannada, Hindi, English, or mixed. Output field values in the canonical English enum values.
- For every update include "evidence": the exact words (≤ 12 words) that state the fact.
Return JSON matching the schema. If nothing can be extracted, return {"updates":[]}.
```

**User**

```
FIELDS:
{{fields as compact JSON: id, type, options, unit}}

ALREADY_KNOWN:
{{known field ids and values}}

ASKED_FIELD: {{askedField or "none"}}

PERSON_SAID ({{lang}}):
"""{{utterance}}"""
```

**Post-processing (server)**

1. zod-parse the response (`ExtractResponseSchema`).
2. Drop updates whose field id is unknown, whose enum value isn't allowed, or whose number is outside min/max.
3. Drop updates whose `evidence` string is not a substring of the utterance (fuzzy match ≥ 0.8 for transliteration). This kills hallucinated facts.
4. Return the survivors. The client merges them with `source: "user_said"` and shows them as chips the user can correct.

### Few-shot examples (append to user message during development; measure whether they help)

| Utterance | Expected updates |
| --- | --- |
| "I'm a widow, 58 years old, I work in other people's fields" | marital_status=widow, age=58, occupation=farm_labourer |
| "ನನ್ನ ಗಂಡ ತೀರಿಹೋದರು, ನಾನು ಕೂಲಿ ಕೆಲಸ ಮಾಡ್ತೀನಿ" | marital_status=widow, occupation=farm_labourer *(only if "coolie work" context is farm; otherwise `other` — test this)* |
| "Our income is less than 1 lakh a year" | annual_family_income={lt:100000} |
| "My name is Lakshmi Bai" | *(no updates — never infer anything from a name)* |

## Prompt 2 — Explain (`routes/explain/prompt.ts`)

**Template first.** The client always has a deterministic explanation built from criterion labels:

- Eligible: *"You qualify because: {label1}, {label2} and {label3}."*
- Maybe: *"You may qualify. We still need to know: {missing field question, short}."*
- Not now: *"Not now, because: {failed label}."* + near-miss sentence if present.

The LLM only makes that friendlier, in the user's language, without adding facts.

**System**

```
Rewrite an eligibility explanation for a person with limited reading skills.
- Use only the facts given. Do not add amounts, dates, documents, or conditions that are not in INPUT.
- Maximum 3 short sentences. Grade-5 reading level. Warm, direct, no jargon.
- Write in {{lang_name}}. Keep scheme names as given.
- Never say "guaranteed". If status is "maybe", say what is still needed.
```

**User**

```
INPUT:
scheme: {{scheme name in lang}}
status: {{eligible|maybe|ineligible}}
met: {{labels of true criteria}}
not_met: {{labels of false criteria}}
unknown: {{labels of unknown criteria}}
template: {{the deterministic template sentence}}
```

**Guardrail:** reject the output if it contains any number (₹, digits) not present in INPUT; fall back to the template. Cache by `hash(schemeId, status, results, lang)`.

## Prompt 3 — Baseline (`routes/baseline/prompt.ts`, eval only)

Purpose: show judges what happens when an LLM decides eligibility directly. Make it a fair baseline — give it the same scheme text and profile.

```
You decide eligibility for Indian government schemes.
For each scheme, read its eligibility text and the person's profile, and answer exactly one of:
"eligible", "maybe" (if required information is missing), or "ineligible".
Return JSON: {"verdicts":[{"schemeId":"...","status":"..."}]}.
```

User message: profile as JSON + each scheme's id, name and plain-text eligibility (generated from its criterion labels plus the official summary). Run at temperature 0. Precompute results with `pnpm eval --baseline` and commit the report so the stage demo doesn't depend on 50 live LLM calls.

## Prompt 4 — Draft scheme rules (build time)

Lives in `docs/17-knowledge-base-guide.md`.

## Cost and latency controls

- Temperature 0 everywhere; small max tokens (extract: 400, explain: 200).
- Cache: extract by `hash(utterance, known, askedField, lang)`; explain as above.
- Timeout 8 s → client falls back (options for extract, template for explain).
- One LLM call per user turn, maximum.
