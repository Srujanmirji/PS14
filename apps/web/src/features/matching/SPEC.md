# matching — SPEC

**Track:** Frontend (wraps `@yojana/engine`) · **Priority:** P0

## Purpose

Bridge between the profile, the scheme bundle and the pure engine. Recomputes verdicts whenever the profile or bundle changes and exposes them to the UI.

## Folder

```
matching/
├── SPEC.md
├── index.ts                  # export { useVerdicts, useNextQuestion, useUnlock, useBundle, VerdictBadge }
├── store.ts                  # verdicts, ranked groups, nextQuestion, unlock summary, bundle version
├── hooks/
│   ├── use-bundle.ts         # current SchemeBundle (from app bootstrap)
│   ├── use-verdicts.ts       # ranked { eligible, maybe, ineligible }
│   ├── use-next-question.ts
│   └── use-unlock.ts         # { maybeCount, topField, unlocks }
└── lib/recompute.ts          # calls engine.evaluateAll → rank → nextQuestion → unlockSummary
```

## Behaviour

- Subscribe to `profile` and `bundle`; on change, run `recompute` synchronously (engine is fast). Debounce 50 ms for bursts of updates.
- Expose `bundle.version` so the UI can show "Rules version …" in scheme detail.
- Never mutate verdicts in the UI layer. Explanations are separate (scheme-detail).

## Acceptance

- [ ] Changing any profile field updates results within one frame.
- [ ] The same profile always yields identical verdict order (snapshot test).
- [ ] Works with the bundled snapshot when no network.
