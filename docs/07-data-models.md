# 07 · Data models

All types live in `packages/contracts` as zod schemas; TypeScript types are inferred (`z.infer`). This doc is the source of truth for their shape.

## FieldDef — the profile field registry

Every fact the app can know about a person is declared once, in `packages/schemes/fields.json`.

```ts
type FieldType = "boolean" | "number" | "enum" | "string";

interface FieldDef {
  id: string;                    // "annual_family_income"
  type: FieldType;
  options?: string[];            // for enum: ["widow","married","single","divorced","separated"]
  min?: number; max?: number;    // for number
  unit?: "INR_per_year" | "years" | "acres" | "hectares" | "percent";
  sensitive?: boolean;           // caste, disability, income → explain why; allow skip
  askOrder: number;              // lower = easier/less sensitive, asked earlier on ties
  askable?: boolean;             // default true; false = never asked (e.g. "office_decision"), always unknown
  question: I18nText;            // "What is your family's total yearly income?"
  why?: I18nText;                // "Some schemes are only for families below an income limit."
  quickReplies?: QuickReply[];   // tap answers; numbers get bands
}

interface QuickReply { label: I18nText; value: FieldValue | "not_sure" | "declined" }   // numbers use bands, see below
type I18nText = { en: string; kn: string; hi: string };
```

**Number bands.** For numbers people don't know exactly (income, land), quick replies set a *range*, not a fake point value: `{ label: "Under ₹1.2 lakh", value: { lt: 120000 } }`. The engine accepts range values (see doc 08). Never convert "under ₹1.2 lakh" into `100000`.

### Starter field set (~16)

`state`, `district`, `age`, `gender`, `marital_status`, `occupation` (enum: farmer_owner, farm_labourer, construction_worker, street_vendor, student, self_employed, salaried, unemployed, homemaker, other), `annual_family_income`, `land_holding_hectares`, `ration_card` (enum: aay, bpl, apl, none), `social_category` (sensitive; enum: sc, st, obc, general, prefer_not), `disability_percent` (sensitive), `education_level`, `is_student`, `has_bank_account`, `is_pregnant_or_new_mother`, `is_income_tax_payer`.

## Profile

```ts
type FieldValue = boolean | number | string | { lt?: number; lte?: number; gt?: number; gte?: number };

interface ProfileEntry {
  value: FieldValue;
  source: "user_said" | "user_tapped" | "life_event" | "demo";
  evidence?: string;             // the words the LLM extracted it from
  updatedAt: string;             // ISO
}

interface Profile {
  id: string;
  lang: "en" | "kn" | "hi";
  entries: Record<string, ProfileEntry>;   // missing key = unknown
  declined: string[];                      // fields the user chose not to answer
  members?: Profile[];                     // family mode (P2)
}
```

## Scheme

One JSON file per scheme in `packages/schemes/data/<central|karnataka>/<id>.json`.

```ts
interface Scheme {
  id: string;                    // "central.ignwps"
  name: I18nText;
  shortName?: string;
  level: "central" | "state";
  state?: "KA";
  category: "pension" | "health" | "housing" | "education" | "agriculture" | "livelihood" | "insurance" | "women_child" | "disability" | "other";
  benefit: {
    summary: I18nText;           // "Monthly pension"
    amountINR?: number;          // only if stated on the official page
    period?: "one_time" | "monthly" | "yearly";
  };
  rule: RuleNode;                // eligibility tree
  documents: string[];           // ids from documents.json
  steps: I18nText[];             // how to apply
  applyUrl?: string;
  sourceUrl: string;             // REQUIRED
  lastChecked: string;           // "2026-10-09"
  verifyNotes?: I18nText[];      // "Pension amount differs by state — confirm at taluk office"
  priority?: number;             // 1–5, for ranking and next-question weighting
}

type RuleNode =
  | { all: RuleNode[] }
  | { any: RuleNode[] }
  | { not: RuleNode }
  | Criterion;

interface Criterion {
  id: string;                    // "ignwps.age"
  field: string;                 // FieldDef id
  op: "eq" | "neq" | "in" | "nin" | "lt" | "lte" | "gt" | "gte" | "between" | "truthy" | "falsy";
  value?: unknown;               // [40, 79] for between
  label: I18nText;               // "Age between 40 and 79"
  source?: { url: string; quote?: string };   // quote ≤ 25 words from the official page
}
```

## Document

`packages/schemes/documents.json`:

```ts
interface DocumentDef {
  id: string;                    // "income_certificate"
  name: I18nText;
  howToGet: I18nText;            // "Apply at your Nadakacheri / Atalji Janasnehi Kendra or online on the state service portal" — verify for your state
  portalUrl?: string;
  verify?: boolean;              // true = details vary; show "Check with office"
}
```

## Verdict (engine output)

```ts
type Truth = true | false | "unknown";
type Status = "eligible" | "maybe" | "ineligible";

interface CriterionResult { criterionId: string; field: string; result: Truth }

interface Verdict {
  schemeId: string;
  status: Status;                // true→eligible, false→ineligible, unknown→maybe
  results: CriterionResult[];    // every leaf criterion evaluated
  missingFields: string[];       // fields whose answers could change the status
  failed: string[];              // criterion ids that are false
  nearMiss?: { criterionId: string; field: string };   // ineligible because of exactly one criterion
  score: number;                 // for ranking
}
```

## Question (engine output)

```ts
interface NextQuestion {
  field: string;
  unlocks: number;               // how many "maybe" schemes this answer can settle
  schemeIds: string[];
}
```

## Persona (eval)

`packages/eval/personas/<id>.json`:

```ts
interface Persona {
  id: string;                    // "p07-widow-partial"
  description: string;
  tags: ("complete" | "partial" | "edge")[];
  profile: Profile["entries"];        // what the person has told us (may be partial)
  truth?: Profile["entries"];         // full hidden profile, used only to simulate answers for "questions to stable"
  expected: Record<string, Status>;   // schemeId → status given `profile`, for EVERY scheme in the bundle
  labelledBy: [string, string];       // two people
  notes?: string;
}
```

## API contracts

```ts
// POST /v1/extract
interface ExtractRequest  { utterance: string; lang: Lang; known: Record<string, FieldValue>; askedField?: string }
interface ExtractResponse { updates: { field: string; value: FieldValue; evidence: string }[]; unclear?: string }

// POST /v1/explain
interface ExplainRequest  { schemeId: string; status: Status; results: CriterionResult[]; lang: Lang }
interface ExplainResponse { text: string; cached: boolean }

// GET  /v1/schemes/bundle?state=KA            → SchemeBundle (ETag = version id; 304 if unchanged)
interface SchemeBundle { version: string; publishedAt: string; fields: FieldDef[]; documents: DocumentDef[]; schemes: Scheme[] }

// POST /v1/feedback { schemeId?, screen, helpful: boolean, comment?: string (≤ 280 chars), lang, appVersion }
//                                              → { ok: true }   (no profile data, no device id)

// POST /v1/stt   (multipart: audio, lang)      → { text: string }
// POST /v1/tts   { text, lang }                 → audio bytes
// POST /v1/baseline { profile, schemeIds }      → { verdicts: { schemeId, status }[] }   (eval only)
```

`known` in `/extract` sends only field ids and values, never evidence strings or history.
