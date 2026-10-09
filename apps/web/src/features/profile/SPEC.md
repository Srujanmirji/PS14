# profile — SPEC

**Track:** Frontend · **Priority:** P0 (family members P2)

## Purpose

The single source of truth for what we know about the user, on device.

## Folder

```
profile/
├── SPEC.md
├── index.ts                 # export { useProfile, profileActions, ProfileEditorSheet }
├── store.ts                 # Zustand slice persisted to Dexie
├── lib/
│   ├── validate-update.ts   # checks an update against FieldDef (type, enum, min/max, range shape)
│   └── merge.ts             # applies updates, records source + evidence + updatedAt
├── components/
│   ├── ProfileEditorSheet.tsx   # list of known fields, edit/clear each, declined list
│   └── FieldEditor.tsx          # input by FieldDef type (enum → pills, number → bands + exact)
└── i18n/{en,kn,hi}.json
```

## Public actions

```ts
profileActions.applyUpdates(updates: { field: string; value: FieldValue; evidence?: string }[], source: ProfileEntry["source"]): { applied: string[]; rejected: { field: string; reason: string }[] };
profileActions.clearField(field: string): void;
profileActions.decline(field: string): void;
profileActions.undecline(field: string): void;
profileActions.reset(): void;
```

## Rules

- Reject any update that fails `validate-update`; return reasons (shown as "I didn't understand your age — can you tap it?").
- Never write a default value for an unknown field.
- A user correction always wins over an earlier `user_said` value.
- Every change triggers `matching` recompute (subscribe, don't call directly).

## Family mode (P2)

`members: Profile[]`. Results show a person switcher; household-level fields (income, ration card) are shared, person-level fields (age, student) are per member.

## Acceptance

- [ ] Invalid updates are rejected with a reason and never stored.
- [ ] Profile persists across reloads; `reset()` clears Dexie.
- [ ] Editor shows each known fact in the current language with its source ("you said" / "you tapped").
