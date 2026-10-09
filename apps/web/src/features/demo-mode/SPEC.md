# demo-mode — SPEC

**Track:** Frontend · **Priority:** P0 · Script and stage plan: `docs/16-demo-mode-and-script.md`

## Purpose

Make the stage demo deterministic and network-independent without changing product code paths.

## Folder

```
demo-mode/
├── SPEC.md
├── index.ts                  # export { useDemo, demoActions, DemoBadge }
├── store.ts                  # enabled, unlocked, scriptStep
├── script/lakshmi.ts         # scripted utterances, transcripts, extract results, explanation cache keys
├── lib/
│   ├── interceptors.ts       # wraps shared/api client: if demo enabled, return scripted responses for extract/explain/stt (with realistic 400–900 ms delay)
│   └── reset.ts              # clears profile, conversation, documents; sets lang = kn; goes to /welcome/privacy
└── components/
    ├── DemoBadge.tsx         # tiny dot in the top bar (only visible to presenter: 4 px, low contrast)
    └── DemoPanel.tsx         # in Settings: enable, reset, choose persona (Lakshmi, Ravi, Shankar)
```

## Rules

- Interception happens at the API client boundary only. Features don't check `if (demo)`.
- Engine, profile, matching run exactly as in production — the matching shown on stage is real.
- Unlock: `?demo=1` or 5 logo taps within 2 s.

## Acceptance

- [ ] Five consecutive runs produce identical screens.
- [ ] Full run works with Wi-Fi off.
- [ ] Reset returns to a clean state in under 1 s.
