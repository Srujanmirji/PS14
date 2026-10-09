# settings — SPEC

**Track:** Frontend · **Priority:** P0 · **Screen:** S10

## Folder

```
settings/
├── SPEC.md
├── index.ts                  # export { routes, useSettings, settingsActions }
├── routes.tsx                # /settings
├── store.ts                  # lang, theme, glass (auto|on|off), motion (auto|reduced), lowPower (auto|on|off), operatorMode, onboarded
├── components/
│   ├── SettingsList.tsx
│   ├── DeleteAllDialog.tsx   # double confirm; clears Dexie, caches, SW runtime caches; → /welcome
│   └── AboutCard.tsx         # version, bundle version, data promise, sources disclaimer
└── i18n/{en,kn,hi}.json
```

## Acceptance

- [ ] Each toggle applies instantly (`data-theme`, `data-glass`, `lang`, MotionConfig).
- [ ] Delete all leaves no app data in DevTools → Application.
- [ ] Demo panel only visible after unlock.
