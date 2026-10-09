# assisted-mode — SPEC

**Track:** Frontend · **Priority:** P2 (build only if every P1 you chose is done by hour 18; otherwise make one static screen for the roadmap slide)

## Purpose

Let a CSC operator or ASHA worker screen many citizens on one device — the scale story.

## Folder

```
assisted-mode/
├── SPEC.md
├── index.ts                  # export { routes }
├── routes.tsx                # /operator, /operator/new, /operator/:citizenId
├── store.ts                  # citizens (Dexie table), activeCitizenId
├── components/
│   ├── CitizenList.tsx       # name/alias, last screened, eligible count
│   ├── NewCitizenFlow.tsx    # reuses intake components with a per-citizen profile
│   ├── CitizenSummary.tsx    # results + documents + share card
│   └── ClearAllCitizens.tsx
└── i18n/{en,kn,hi}.json
```

## Rules

- Citizen profiles never leave the device. Auto-clear after 24 h (setting, on by default).
- Operator mode is a toggle in Settings; bottom nav swaps Home for "Citizens".

## Acceptance

- [ ] Screen 3 citizens back to back without data leaking between them.
- [ ] Clear all removes every citizen record.
