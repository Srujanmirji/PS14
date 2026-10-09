# 11 · PWA, offline and the Android app

One build, three ways to run: browser tab → installed PWA → Android APK via Capacitor.

## PWA essentials (`vite-plugin-pwa`)

### Manifest

```ts
manifest: {
  name: "Yojana Saathi",
  short_name: "Saathi",
  description: "Find government schemes you qualify for.",
  start_url: "/?source=pwa",
  scope: "/",
  display: "standalone",
  orientation: "portrait",
  background_color: "#070B1A",
  theme_color: "#070B1A",
  lang: "en-IN",
  icons: [
    { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
  ],
  shortcuts: [
    { name: "My results", url: "/results" },
    { name: "My documents", url: "/documents" }
  ]
}
```

Generate icons from one 1024 px SVG logo (e.g. `@vite-pwa/assets-generator`).

### Caching (Workbox via the plugin)

| What | Strategy | Why |
| --- | --- | --- |
| App shell (HTML, JS, CSS, fonts, icons) | Precache | Opens instantly offline |
| Bundled `schemes.bundle.json` | Precache | First launch works offline |
| `GET /v1/schemes/bundle` | StaleWhileRevalidate, ETag | Newer published versions arrive silently |
| `POST /v1/tts` audio | App-managed Cache Storage keyed by hash | Read-aloud works offline after first play |
| `POST /v1/extract`, `/explain`, `/stt` | Network only (+ client fallback) | Never serve stale AI answers |

Use `registerType: "prompt"` and show an **Update available** toast; never auto-reload mid-conversation.

### Local data (Dexie / IndexedDB)

| Table | Contents |
| --- | --- |
| `profile` | one current profile (+ family members, P2) |
| `conversation` | last 50 messages (text only) |
| `documents` | document id → have/missing |
| `bundle` | the latest scheme bundle + its version |
| `citizens` | assisted mode profiles (P2) |
| `settings` | language, theme, transparency, low-power, demo flags |

Request persistent storage (`navigator.storage.persist()`) after the user's first results, so the browser doesn't evict it.

### Install experience

- Android Chrome: capture `beforeinstallprompt`, show our own glass sheet after the first results ("Add Saathi to your home screen"), call `prompt()` on tap.
- iOS Safari: no prompt event; show a one-time sheet with *Share → Add to Home Screen* illustration.
- Verify installability in Chrome DevTools → Application → Manifest (no errors) before demo day.

### Offline behaviour checklist

- [ ] Airplane mode after first load: Home, Conversation (tap answers), Results, Detail, Documents, Benefit card all work.
- [ ] Mic button shows disabled state with tooltip "Voice needs internet".
- [ ] `OfflineBanner` appears within 1 s of losing network, disappears on reconnect.
- [ ] No spinner waits forever: every network call has a timeout and a fallback.

## Android app with Capacitor

### Setup

```bash
pnpm --filter @yojana/web add @capacitor/core @capacitor/app @capacitor/share @capacitor/haptics @capacitor/status-bar
pnpm --filter @yojana/web add -D @capacitor/cli @capacitor/android
cd apps/web
npx cap init "Yojana Saathi" "in.tanvo.yojanasaathi" --web-dir=dist
npx cap add android
pnpm build && npx cap sync android
npx cap open android      # build APK from Android Studio
```

### Platform bridge (`shared/device`)

Wrap native calls so features never import Capacitor directly:

```ts
export const device = {
  isNative: Capacitor.isNativePlatform(),
  share: (data) => isNative ? Share.share(data) : navigator.share?.(data),
  haptic: () => isNative && Haptics.impact({ style: ImpactStyle.Light }),
  setStatusBar: (theme) => isNative && StatusBar.setStyle(...),
};
```

### Android specifics

- `AndroidManifest.xml`: `RECORD_AUDIO`, `INTERNET` (and `POST_NOTIFICATIONS` only if reminders ship).
- Status bar colour matches `--bg-base`; use safe-area insets (`env(safe-area-inset-*)`) in `AppShell`.
- Back button: `App.addListener('backButton')` → router back; exit only from Home.
- API base URL must be absolute (`VITE_API_URL`); add the app's WebView origin to the API CORS allowlist.
- Service workers don't run the same way inside the Capacitor WebView; offline in the APK comes from the bundled assets plus Dexie, which is enough because the engine and bundle ship inside the APK.

### Demo-day kit

- Signed debug APK installed on **two** phones (one low-end).
- PWA installed on a third phone from the live URL.
- Screen mirroring tested (scrcpy over USB for Android).

## Performance budget

| Metric | Target |
| --- | --- |
| Shell JS (gzip) | ≤ 300 KB |
| Scheme bundle (gzip) | ≤ 150 KB for 50 schemes in 3 languages |
| Time to interactive on mid-range Android, 4G | ≤ 3 s |
| Results after last answer | ≤ 100 ms (on-device engine) |
