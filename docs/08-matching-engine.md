# 08 · Matching engine (`packages/engine`)

Pure TypeScript. Input: a profile and the scheme list. Output: verdicts, the next question, a ranking, near misses. No I/O, no clock, no randomness. Same input → same output, always.

## Public API

```ts
export function evaluate(profile: Profile, scheme: Scheme, fields: FieldDef[]): Verdict;
export function evaluateAll(profile: Profile, schemes: Scheme[], fields: FieldDef[]): Verdict[];
export function nextQuestion(profile: Profile, verdicts: Verdict[], schemes: Scheme[], fields: FieldDef[]): NextQuestion | null;
export function rank(verdicts: Verdict[], schemes: Scheme[]): { eligible: Verdict[]; maybe: Verdict[]; ineligible: Verdict[] };
export function unlockSummary(verdicts: Verdict[]): { maybeCount: number; topField?: string; unlocks: number };
```

## Three-valued (Kleene) logic

A criterion is `true`, `false`, or `unknown` (field missing, declined, or a range that straddles the threshold).

| AND | T | U | F |
| --- | --- | --- | --- |
| **T** | T | U | F |
| **U** | U | U | F |
| **F** | F | F | F |

| OR | T | U | F |
| --- | --- | --- | --- |
| **T** | T | T | T |
| **U** | T | U | U |
| **F** | T | U | F |

`NOT`: T→F, F→T, U→U.

Short-circuit: `all` returns F on the first F; `any` returns T on the first T. Still record every leaf result for explanations (evaluate all leaves, then combine).

Status mapping: `true → eligible`, `false → ineligible`, `unknown → maybe`.

## Evaluating one criterion

```ts
function evalCriterion(c: Criterion, profile: Profile, defs: Map<string, FieldDef>): Truth {
  if (profile.declined.includes(c.field)) return "unknown";
  const entry = profile.entries[c.field];
  if (entry === undefined) return "unknown";
  const v = entry.value;
  if (isRange(v)) return evalRange(c, v);     // e.g. income { lt: 120000 } vs op lt 200000 → true
  return evalPoint(c, v);                     // eq, neq, in, nin, lt, lte, gt, gte, between, truthy, falsy
}
```

### Ranges (incomplete numbers)

If the user said "under ₹1.2 lakh" (`{ lt: 120000 }`) and the rule is `income lte 200000`, every possible value satisfies the rule → `true`. If the rule is `income lte 100000`, some values satisfy and some don't → `unknown`. Implement by checking the range's bounds against the threshold:

| Rule | Range | Result |
| --- | --- | --- |
| `x ≤ R` | `x < a` with `a ≤ R+1` | true |
| `x ≤ R` | `x ≥ b` with `b > R` | false |
| otherwise | | unknown |

Write the full table for each op in tests.

### Type safety

If a value's type doesn't match the field type (string "58" for a number field), the engine throws in development and returns `unknown` in production, and logs once. Validation should have caught it earlier.

## missingFields

For a `maybe` verdict, `missingFields` = fields of leaf criteria whose result is `unknown` **and** whose answer could change the tree's result. Simple correct approach: for each unknown leaf's field, re-evaluate the tree with that leaf forced to `true` and to `false`; if either changes the root from `unknown`, the field matters. Trees are small (≤ 10 leaves), so this is cheap.

## nextQuestion — fewest questions to stable results

```
candidates = union of missingFields over all "maybe" verdicts, minus declined fields, minus fields with askable = false
for each field f in candidates:
    unlocks(f)  = number of maybe-schemes that list f in missingFields
    weight(f)   = Σ priority(scheme) over those schemes
    score(f)    = weight(f) * 10 - askOrder(f)          // easy questions win ties
return argmax score, or null if no candidates
```

Stop asking when: no candidates, or the user taps **See results**, or 8 questions were asked in a row (then suggest results).

Stretch (only if ahead): true information gain — simulate each quick-reply answer and pick the field that minimises expected remaining "maybe" count.

## Ranking

1. **Eligible**: by `priority` desc, then `benefit.amountINR` desc (unknown amount last), then name.
2. **Maybe**: by number of `missingFields` asc (closest first), then priority.
3. **Ineligible**: near misses first, then the rest alphabetically. Collapsed by default.

`score` = priority × 100 + (amount known ? 10 : 0) − missingFields × 5.

## Near miss ("what would change")

An ineligible verdict whose root would flip to `true` if exactly one `false` leaf became `true`. Record that leaf as `nearMiss`. UI says: *"Close — you'd qualify if your family income were under ₹2 lakh."* (label from the criterion, never generated).

## Determinism and performance

- Iterate schemes and criteria in their stored order; no `Object.keys` ordering assumptions on numeric-like keys.
- 50 schemes × 16 fields evaluates in well under 5 ms on a mid-range phone; run in a Web Worker only for the Accuracy Lab batch.

## Tests (Vitest) — required

- Truth tables for AND / OR / NOT with all 9 / 9 / 3 combinations.
- Every operator with point values, boundaries (= threshold), and ranges.
- Declined field → unknown.
- `missingFields` excludes fields that can't change the outcome.
- `nextQuestion` returns null when nothing is unknown; prefers lower askOrder on ties.
- Persona regression: every persona in `packages/eval/personas` produces its expected statuses.
