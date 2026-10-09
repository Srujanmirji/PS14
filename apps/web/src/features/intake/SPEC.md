# intake — SPEC

**Track:** Frontend (calls Backend `/v1/extract`) · **Priority:** P0 · **Screens:** S4 Home, S5 Conversation

## Purpose

Turn what a person says or taps into profile facts, one meaningful question at a time.

## User stories

- As Lakshmi, I say one sentence in Kannada and see the app understood two facts about me.
- As a user who doesn't know my exact income, I can tap "Not sure" and still get results.
- As a user, I can tap a life event ("Lost my spouse") instead of explaining.

## Folder

```
intake/
├── SPEC.md
├── index.ts                 # export { routes, useConversation }
├── routes.tsx               # "/" Home, "/chat" Conversation
├── components/
│   ├── HomeHero.tsx         # headline, MicButton (from voice), text input
│   ├── LifeEventChips.tsx
│   ├── ChatThread.tsx  ChatBubble.tsx  TypingDots.tsx
│   ├── QuestionCard.tsx     # renders FieldDef.question + QuickReply options + Not sure + Prefer not to say + Why we ask
│   ├── KnownFactsRow.tsx    # chips of known facts (tap → profile editor)
│   └── SeeResultsBar.tsx    # sticky; mini UnlockMeter + "See results (n)"
├── hooks/
│   ├── use-conversation.ts  # message list, send(utterance), answer(field, value)
│   └── use-extract.ts       # TanStack mutation → /v1/extract
├── lib/
│   ├── life-events.ts       # chip → initial profile updates + first question hint
│   └── messages.ts          # build Saathi messages from engine output (templated, i18n)
├── api.ts                   # extract(req): ExtractResponse
├── store.ts                 # conversation messages (persisted to Dexie)
└── i18n/{en,kn,hi}.json
```

## Behaviour

1. **Send utterance** (typed or from `voice`): append user bubble → show typing dots → `extract({ utterance, lang, known, askedField })`.
2. On response: pass `updates` to `profile.applyUpdates(updates, "user_said")`; Saathi replies "Got it: widow, farm labourer" (templated from labels) with chips animating into `KnownFactsRow`.
3. Ask `matching.nextQuestion()`. If a field → show `QuestionCard`. If `null` → Saathi says "I have enough to show you results" + primary button.
4. **Tap answer** → `profile.applyUpdates([{ field, value }], "user_tapped")` → repeat step 3. "Not sure" → no update; mark field as skipped for this session so it isn't asked again immediately. "Prefer not to say" → `profile.decline(field)`.
5. **Extract failure** (offline/timeout/invalid) → Saathi: "I didn't catch that — tap an answer instead", and show the QuestionCard for the most useful field.
6. After 8 questions in a row, suggest results.
7. **Life-event chip** → apply its updates (`source: "life_event"`) → go to `/chat` with the first question.

## Life events (initial set)

| Chip | Updates | Notes |
| --- | --- | --- |
| Lost my spouse | `marital_status = widow` | gender asked next if unknown |
| Turned 60 | `age = { gte: 60 }` | range, not a point value |
| Child going to college | adds a family member later (P2); for P0 sets `has_student_child = true` only if that field exists | else just starts chat |
| I farm | `occupation in [farmer_owner, farm_labourer]` → ask which | |
| I have a disability | asks `disability_percent` with explanation | sensitive |
| Starting a business | `occupation = self_employed` | |
| Pregnant or new mother | `is_pregnant_or_new_mother = true` | |

## Acceptance

- [ ] Hero utterance extracts the right fields (demo mode scripted; live tested in en and kn).
- [ ] Tap-only path reaches results with zero network.
- [ ] Every question offers Not sure; sensitive ones also offer Prefer not to say + Why we ask.
- [ ] Known facts are editable from the chips row.
- [ ] Conversation survives reload (Dexie).

## Out of scope

Free-form Q&A about schemes ("what is PM-KISAN?") — redirect to the scheme detail page instead.
