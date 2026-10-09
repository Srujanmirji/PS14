# scheme-detail — SPEC

**Track:** Frontend (calls Backend `/v1/explain`) · **Priority:** P0 · **Screen:** S7

## Purpose

Answer three questions for one scheme: *Why? What would change it? What do I do next?* — with sources.

## Folder

```
scheme-detail/
├── SPEC.md
├── index.ts                  # export { routes }
├── routes.tsx                # /scheme/:id
├── components/
│   ├── DetailHero.tsx        # names (local + English), benefit, VerdictBadge, ReadAloudButton (from voice)
│   ├── Explanation.tsx       # template text immediately; swaps to LLM text when it arrives
│   ├── CriteriaChecklist.tsx # ✓ / ✗ / ? per leaf criterion, label + tiny source link
│   ├── WhatWouldChange.tsx   # maybe: missing questions (tap → /chat?ask=field); ineligible: nearMiss
│   ├── DocumentsSection.tsx  # uses documents feature's <DocumentRow/>
│   ├── HowToApply.tsx        # numbered steps + applyUrl button
│   ├── CheckBeforeYouGo.tsx  # verify flags
│   └── SourceFooter.tsx      # sourceUrl, lastChecked, bundle version
├── hooks/use-explanation.ts  # template → cache → /v1/explain (online only)
├── lib/template.ts           # deterministic explanation builder (doc 09)
└── i18n/{en,kn,hi}.json
```

## Verify flags (shown in "Check before you go")

| Flag | When | Icon |
| --- | --- | --- |
| Verified from rule | criterion true and the value came from a tap or a confirmed chip | ShieldCheck |
| Self-declared | criterion true but depends on a `user_said` fact not yet confirmed | User |
| Check with office | scheme has `verifyNotes`, or a document marked `verify: true` | ShieldAlert |

## Behaviour

- Render instantly from local data; explanation polish arrives later (fade swap, no layout jump).
- Explanation guard: if LLM text contains any digit not in the template, keep the template (also enforced server-side).
- "Add to my benefit card" toggles inclusion (benefit-card store).
- Outbound links open in system browser (Capacitor `App.openUrl` / `target="_blank" rel="noopener"`).

## Acceptance

- [ ] Every checklist line links to its source (criterion source or scheme sourceUrl).
- [ ] Offline: template explanation shows; no spinner.
- [ ] Maybe schemes show the exact missing questions; tapping one asks it.
- [ ] Ineligible near-miss text uses the criterion label, never generated text.
