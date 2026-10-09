# app/ — shell, router, providers — SPEC

**Track:** Frontend · **Priority:** P0

## Purpose

Glue only: mounts providers, assembles routes from features, draws the persistent shell (background, top bar, bottom nav, banners). Contains no business logic.

## Files

```
app/
├── SPEC.md
├── providers.tsx       # QueryClientProvider, I18nextProvider, ThemeProvider, MotionConfig(reducedMotion), Toaster
├── router.tsx          # createBrowserRouter from routes.ts; lazy() per feature
├── routes.ts           # imports `routes` from each feature's index.ts
├── AppShell.tsx        # <MeshBackground/>, <TopBar/>, <Outlet/>, <BottomNav/>, <OfflineBanner/>, <UpdateToast/>, <InstallSheet/>
├── ErrorBoundary.tsx   # friendly error screen + "Restart" button; logs locally only
└── bootstrap.ts        # on start: open Dexie, load settings, load bundle (cached → bundled), apply theme/glass flags
```

## Behaviour

- **Bootstrap order:** settings → theme + `data-glass` + `lang` attributes on `<html>` → scheme bundle (Dexie copy if present, else `/schemes.bundle.json`) → render → in background, `GET /v1/schemes/bundle` with ETag; on 200 replace and toast.
- **Bottom nav** hidden on onboarding and Accuracy Lab. Results tab shows a badge with eligible count from `matching`.
- **Top bar:** logo (5 taps → `demo-mode.unlock()`), language switcher, settings icon.
- **Back button (Capacitor):** router back; on Home, exit app.
- **Safe areas:** pad shell with `env(safe-area-inset-*)`.

## Acceptance

- [ ] Every route lazy-loads; shell JS ≤ 300 KB gzip.
- [ ] Theme, language and glass flags apply before first paint (no flash).
- [ ] Offline banner appears/disappears within 1 s of connectivity changes.
- [ ] A thrown error in any feature shows the ErrorBoundary, not a white screen.
