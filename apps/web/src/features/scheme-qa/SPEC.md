# scheme-qa — SPEC

**Track:** Frontend (calls Backend `/v1/ask`) · **Priority:** P1 (Level 1), P2 (Level 2) · Design: `docs/20-rag-scheme-qa.md`

## Purpose

Let people ask questions about a scheme in their own words and get short answers from official text, with the source line shown. Never answers eligibility.

## Folder

```
scheme-qa/
├── SPEC.md
├── index.ts                    # export { AskAboutScheme, AskAnything }
├── components/
│   ├── AskAboutScheme.tsx      # Level 1: collapsible "Ask about this scheme" card on scheme-detail
│   ├── SuggestedQuestions.tsx  # 3 chips: "How much money?", "Where do I apply?", "Which documents?"
│   ├── AnswerBubble.tsx        # answer + numbered citation markers
│   ├── CitationSheet.tsx       # tap a marker → quote highlighted + "Open official page"
│   ├── RefusalBubble.tsx       # not_in_sources → "ask at the office"; eligibility_question → "Check if I qualify" button → verdict
│   └── AskAnything.tsx         # Level 2: Home search bar → suggested schemes + answer
├── hooks/use-ask.ts            # TanStack mutation → /v1/ask; mic input via voice feature
├── api.ts
└── i18n/{en,kn,hi}.json
```

## Behaviour

- Online only. Offline: card shows "Questions need internet — the rest of this page works offline."
- Input: text or mic (reuses `voice`). Max 300 characters.
- Answer appears with citation markers [1] [2]; tapping one opens the quote and source URL.
- Eligibility questions never get a yes/no: always the hand-off button to the engine verdict for that scheme.
- Read aloud button on each answer (reuses `voice`).
- Demo mode: 3 scripted Q&As for the hero scheme (cached responses), so the stage demo doesn't depend on the network.

## Acceptance

- [ ] Every answer shows at least one citation; tapping it shows the exact quote.
- [ ] "Am I eligible?" in any language → hand-off, never yes/no.
- [ ] A question not covered by the source → friendly refusal with the official link.
- [ ] Works in Kannada (question in, answer out).
