# 01 · Product brief

## One line

Yojana Saathi tells you which government schemes you qualify for, even when you don't know all your details yet, shows exactly why, and tells you what to check before you go to the office.

**Pitch line:** "myScheme is a filter. Yojana Saathi is a caseworker that admits what it doesn't know."

## The problem (from the problem statement)

1. Information is scattered across central and state portals (myScheme alone lists 4,000+ schemes).
2. Eligibility rules are complex and written in legal language.
3. People have incomplete information about themselves (exact income, land size, certificate status).
4. Existing tools return a flat yes/no list or overwhelm users with options.
5. Nobody tells people what still needs verification.

## Who it's for

| Persona | Need | What they struggle with |
| --- | --- | --- |
| **Lakshmi**, 58, widow, farm labourer, Dharwad (hero persona) | Pension, housing, health cover | Reads little; speaks Kannada; doesn't know which certificates she has |
| **Ravi**, 19, first-generation college student | Scholarships | Dozens of overlapping schemes, different income caps |
| **Shankar**, 44, small farmer | Farm income support, crop insurance | Land-record criteria |
| **Fatima**, 32, runs a tailoring unit | Business loans and subsidies | Doesn't know which loan scheme fits her stage |
| **Anita**, CSC operator / ASHA worker | Screens many citizens a day | Re-checks every scheme by hand (assisted mode, P2) |

## What it does (MVP scope)

| # | Capability | Expected outcome it satisfies | Priority |
| --- | --- | --- | --- |
| 1 | Scheme knowledge base: ~50 central + Karnataka schemes, every rule sourced | Scheme and eligibility knowledge base | P0 |
| 2 | Conversational intake in Kannada, Hindi, English (text; voice is P1) | Working matching platform | P0 |
| 3 | Rule engine with three verdicts: Eligible · Maybe (needs X) · Not eligible (because Y) | Personalised matching module | P0 |
| 4 | Next-best-question: asks only what settles the most verdicts | Matching from incomplete information | P0 |
| 5 | Scheme detail + documents checklist + verify flags + official link | Application guidance interface | P0 |
| 6 | Accuracy Lab: 50 labelled personas, engine vs LLM-only baseline | Matching accuracy and user-guidance analysis | P1 (but the numbers are P0) |
| 7 | Works offline after first load; installable | Platform quality | P0 |
| 8 | Android APK installed on demo phones by gate G6 | Platform quality | P0 |

## Explicitly out of scope (say this on stage)

Login and accounts · Aadhaar / DigiLocker integration · submitting applications · states other than Karnataka · an admin CMS · payments.

## Success metrics for the hackathon

- Hero demo runs start to finish in under 3 minutes, five times in a row, without touching code.
- A measured false-"eligible" rate on 50 personas, shown next to the LLM-only baseline.
- Hero persona reaches stable results in ≤ 5 questions.
- Works in airplane mode after first load (matching, results, details, documents).

## Principles

1. **Honest over impressive.** "Maybe — needs your income" beats a confident wrong "Yes".
2. **Fewest questions.** Every question must change at least one verdict, or we don't ask it.
3. **Explain everything.** Every verdict links to the rule and the official source.
4. **Built for Bharat.** Voice first, big targets, local language, works on cheap phones and bad networks.
5. **Private by default.** Your answers stay on your phone.
