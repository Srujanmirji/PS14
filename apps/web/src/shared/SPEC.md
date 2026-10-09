# shared/ — design system, clients, utilities — SPEC

**Track:** Frontend · **Priority:** P0 (build first, hours 1–5)

Feature-agnostic building blocks. Must not import from `features/` or `app/`.

## Folders

```
shared/
├── ui/                 # glass design-system primitives (doc 05)
│   ├── tokens.css      # CSS variables for both themes + @theme mapping for Tailwind v4
│   ├── MeshBackground.tsx
│   ├── GlassCard.tsx  GlassButton.tsx  IconButton.tsx  Chip.tsx
│   ├── VerdictBadge.tsx  UnlockMeter.tsx  ProfileMeter.tsx  QuickReply.tsx
│   ├── SegmentedTabs.tsx  BottomSheet.tsx  BottomNav.tsx  TopBar.tsx
│   ├── Toast.tsx  Skeleton.tsx  EmptyState.tsx  OfflineBanner.tsx  LanguageTile.tsx
│   └── index.ts
├── api/
│   ├── client.ts       # fetch wrapper: base URL, JSON, timeout (AbortController, default 8 s), typed errors
│   ├── errors.ts       # ApiError { kind: "offline" | "timeout" | "http" | "invalid" }
│   └── index.ts
├── i18n/
│   ├── setup.ts        # i18next init, language detection from settings, per-feature namespaces
│   ├── common/{en,kn,hi}.json
│   └── format.ts       # money (en-IN lakh grouping), dates, numbers
├── storage/
│   ├── db.ts           # Dexie database + tables (doc 11)
│   └── index.ts
├── device/
│   ├── online.ts       # useOnline() hook
│   ├── low-power.ts    # detection + override from settings
│   ├── platform.ts     # Capacitor bridge: share, haptic, status bar, isNative
│   └── index.ts
├── hooks/              # useLocalStorageFallback, useMediaQuery, useReducedMotion
└── lib/                # hash.ts (SHA-256 hex), cn.ts (class merge), id.ts
```

## Rules

- Components take content as props/children; no hard-coded copy except accessible labels passed in.
- No component reads Zustand stores; features pass data in.
- `VerdictBadge` always renders icon + translated word; colour alone is a bug.
- Every component has a `className` escape hatch but no inline colour values in features.

## Acceptance

- [ ] A `/dev/ui` route (dev builds only) renders every component in both themes, with glass on and off.
- [ ] Contrast of text on `GlassCard level="glass"` ≥ 4.5:1 at the brightest mesh point (check with DevTools picker).
- [ ] `client.ts` returns `ApiError.kind = "offline"` immediately when `navigator.onLine === false`.
- [ ] `low-power.ts` sets `data-glass="off"` on 2 GB devices (test by override).
