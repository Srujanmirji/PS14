# results — SPEC

**Track:** Frontend · **Priority:** P0 · **Screen:** S6 Results

## Purpose

Show what the person qualifies for without overwhelming them, and how close they are to more.

## Folder

```
results/
├── SPEC.md
├── index.ts                 # export { routes }
├── routes.tsx               # /results
├── components/
│   ├── ResultsHeader.tsx    # "3 you qualify for · 2 maybe"; known total benefit (only from scheme data)
│   ├── UnlockCard.tsx       # big UnlockMeter: "Answer 1 more question to check 2 more" → /chat?ask=<field>
│   ├── ResultTabs.tsx       # Qualify / Maybe / Not now with counts
│   ├── ResultCard.tsx       # name, benefit line, VerdictBadge, one-line reason, level tag
│   ├── NearMissNote.tsx     # "Close — you'd qualify if …"
│   └── ResultsEmpty.tsx
└── i18n/{en,kn,hi}.json
```

## Behaviour

- Default tab: Qualify if non-empty, else Maybe.
- Max 5 cards per tab, then "Show more".
- One-line reason: eligible → strongest met criterion label; maybe → first missing field question (short form); ineligible → failed criterion label.
- Card tap → `/scheme/:id` with shared-element transition on the title.
- Verdict reveal animation on first view of a new result set only (not on every tab switch).
- Feedback row at the bottom: "Was this helpful? 👍 👎" → `POST /v1/feedback` (fire and forget, queued if offline).

## Acceptance

- [ ] Never shows more than 5 cards before "Show more".
- [ ] Unlock card hidden when no maybes; tapping it opens the exact question.
- [ ] Benefit total only sums schemes with `amountINR` that share a `period` (yearly-equivalent only if the scheme states it), and is labelled "at least"; otherwise the header shows counts only.
- [ ] Screen reader reads each card as "Scheme name, You qualify, reason".
