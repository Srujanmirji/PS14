# Frontend tasks

**Owners:** Satvik (visual design, screens) · Samarth (app logic, mobile) · Srujan takes FE-12 and integration · **Owns:** `apps/web/**`

Build against mocks first (`VITE_API_MODE=mock`), flip to the real API at gate G3. The demo path (P0) must be done by hour 14 before any showcase work.

---

### FE-01 · Web scaffold + PWA + deploy — P0 · H0–1 · depends on: BE-01 (workspace exists)

**Goal:** an installable empty PWA on a public HTTPS URL.

**Prompt**
```
Read AGENTS.md, apps/web/SPEC.md, docs/04-tech-stack.md and docs/11-pwa-offline-and-mobile.md.
Scaffold apps/web: Vite + React 19 + TypeScript strict + Tailwind CSS v4 + React Router 7 + vite-plugin-pwa (registerType "prompt", manifest exactly as docs/11, generate icons from public/logo.svg) + path alias @ → src.
Create the folder layout from docs/03 (app/, shared/, features/<each>/ with an index.ts) — empty components are fine.
Add .env.example with VITE_API_URL, VITE_API_MODE=mock.
```
Deploy to Vercel (root `apps/web`, build `pnpm --filter @yojana/web build`, output `dist`).

**Done when**
- [ ] Public URL loads; Chrome DevTools → Application → Manifest shows no errors; installable.

---

### FE-02 · Design tokens + glass kit (part 1) — P0 · H1–3 · depends on: FE-01

**Prompt**
```
Read docs/05-design-system.md and apps/web/src/shared/SPEC.md.
Create shared/ui/tokens.css with both themes' CSS variables and a Tailwind v4 @theme block mapping them. Self-host fonts with @fontsource (Plus Jakarta Sans, Noto Sans Kannada, Noto Sans Devanagari).
Build MeshBackground (three blurred radial blobs drifting slowly + noise; static when data-glass="off" or reduced motion), GlassCard (levels thin/glass/strong), GlassButton (primary gradient, secondary, ghost, danger; md/lg), IconButton, with the exact glass recipe and fallbacks from docs/05.
Add a dev-only route /dev/ui showing every component in light and dark, glass on and off.
```

**Done when**
- [ ] `/dev/ui` looks right on a phone in both themes; text on glass passes contrast at the brightest blob.

---

### FE-03 · Shared plumbing: API client with mock mode, i18n, Dexie, device — P0 · H3–4.5 · depends on: BE-02 (contracts)

**Prompt**
```
Read apps/web/src/shared/SPEC.md, docs/07-data-models.md (API contracts) and docs/11 (Dexie tables).
shared/api/client.ts: typed functions for every API route in docs/07 (getBundle, extract, explain, stt, tts, feedback). 8 s timeout, typed ApiError kinds. If VITE_API_MODE=mock, answer from @yojana/contracts fixtures with a 400–900 ms delay. Validate responses with contracts schemas.
shared/i18n: i18next with per-feature namespaces loaded from features/*/i18n/*.json; html lang attribute sync; format helpers (en-IN money with lakh grouping).
shared/storage/db.ts: Dexie with tables profile, conversation, documents, bundle, citizens, settings.
shared/device: useOnline, low-power detection (deviceMemory ≤ 2 or hardwareConcurrency ≤ 4), platform bridge for share/haptics/status bar (no-ops on web where unsupported).
```

**Done when**
- [ ] Mock extract returns fixture data in the console; Dexie tables visible in DevTools.

---

### FE-04 · App shell + onboarding — P0 · H4.5–6 · depends on: FE-02, FE-03

**Prompt**
```
Read apps/web/src/app/SPEC.md and apps/web/src/features/onboarding/SPEC.md and docs/06 screens S1–S3.
Implement app/ (providers, router with lazy feature routes, AppShell with MeshBackground, TopBar, BottomNav, OfflineBanner, UpdateToast, ErrorBoundary, bootstrap order exactly as the SPEC) and the onboarding feature (Splash, LanguagePicker with three script tiles, PrivacyPromise, HowItWorksSheet).
All strings via i18n with en, kn, hi files (machine draft is fine — data track reviews).
```

**Done when**
- [ ] First visit → onboarding → Home; return visit skips onboarding; language persists.

---

### FE-05 · Glass kit (part 2) — P0 · H6–7.5 · depends on: FE-02

**Prompt**
```
Read docs/05 Components table. Build Chip (filled/unknown/editable), QuickReply, VerdictBadge (icon + word + colour, never colour alone), UnlockMeter (ring), ProfileMeter, SegmentedTabs, BottomSheet (snap points, drag to close), Toast, Skeleton, EmptyState, LanguageTile, MicButton visual states (idle/listening/processing/error) with motion tokens from docs/05 and reduced-motion fallbacks. Add each to /dev/ui.
```

---

### FE-06 · Profile + matching wired to the real engine — P0 · H7.5–8.5 · depends on: BE-04, BE-05 (bundle file)

**Prompt**
```
Read features/profile/SPEC.md and features/matching/SPEC.md.
Implement the profile store (Zustand persisted to Dexie) with applyUpdates/clearField/decline/reset and validate-update against FieldDefs from the bundle.
Implement matching: subscribe to profile + bundle, call @yojana/engine evaluateAll → rank → nextQuestion → unlockSummary (debounced 50 ms), expose hooks.
Bundle loading in app/bootstrap.ts: Dexie copy → else /schemes.bundle.json → background GET /v1/schemes/bundle with ETag; on new version replace + toast.
```

**Done when**
- [ ] Setting a field in DevTools/console changes verdicts instantly; bundle refresh works against the Railway API (gate G2).

---

### FE-07 · Intake: Home + Conversation — P0 · H8.5–11 · depends on: FE-05, FE-06 · **Gate G3**

**Prompt**
```
Read features/intake/SPEC.md and docs/06 screens S4–S5.
Implement Home (HomeHero with MicButton placeholder until voice lands, text input, LifeEventChips) and Conversation (ChatThread, bubbles, typing dots, KnownFactsRow, QuestionCard with QuickReply + Not sure + Prefer not to say + Why we ask, SeeResultsBar with mini UnlockMeter).
Behaviour exactly as the SPEC's numbered steps, including the extract-failure fallback to tap answers and the 8-question suggestion.
Persist conversation to Dexie. Animate fact chips into the row (spring-snappy).
```

**Done when**
- [ ] Tap-only path reaches results with network off.
- [ ] With `VITE_API_MODE=real`, the hero utterance fills the right chips.

---

### FE-08 · Results — P0 · H11–12.5 · depends on: FE-07

**Prompt**
```
Read features/results/SPEC.md and docs/06 S6.
Implement ResultsHeader, UnlockCard (navigates to /chat?ask=<field>), ResultTabs, ResultCard (max 5 then Show more), NearMissNote, ResultsEmpty, and the feedback row (queued if offline).
Verdict reveal animation (stagger 40 ms) only on a new result set.
```

---

### FE-09 · Scheme detail + documents — P0 · H12.5–14.5 · depends on: FE-08 · **Gate G4**

**Prompt**
```
Read features/scheme-detail/SPEC.md, features/documents/SPEC.md and docs/06 S7–S8.
Implement every section in the order listed in docs/06 S7: hero, explanation (template first via lib/template.ts, then /v1/explain when online), criteria checklist with ✓/✗/? and source links, what would change, documents section (shared store with documents feature), how to apply, check before you go (verify flags table in the SPEC), source footer with bundle version.
Implement the documents feature: collect + dedupe + sort, have/missing toggles, HowToGet expander, progress.
```

**Done when**
- [ ] Hero flow end to end, offline, in Kannada. Everyone checks at G4.

---

### FE-10 · Demo mode — P0 · H14.5–15.5 · depends on: FE-09, data hero script

**Prompt**
```
Read features/demo-mode/SPEC.md and docs/16-demo-mode-and-script.md.
Implement unlock (?demo=1 or 5 logo taps in 2 s), the API-client interceptors returning scripted responses for extract/explain/stt with realistic delays, reset, DemoPanel in settings, DemoBadge. Put the Lakshmi script in script/lakshmi.ts using the data track's utterances and the real scheme ids from the bundle.
Bundle the cached explanation texts and TTS audio for the hero path under public/demo/.
```

**Done when**
- [ ] Five identical runs; one with Wi-Fi off from the start.

---

### FE-11 · Voice (P1, if chosen) — H15.5–17 · depends on: BE-10

**Prompt**
```
Read features/voice/SPEC.md and docs/10.
Implement use-recorder (getUserMedia, MediaRecorder, AnalyserNode waveform, 2 s silence auto-stop, 20 s cap, permission states), use-transcribe (/v1/stt), use-speak (/v1/tts + Cache Storage + speechSynthesis fallback), MicButton wiring into intake, ReadAloudButton in scheme-detail, results header and benefit card.
Mic disabled offline with tooltip; demo mode falls back to scripted transcript.
```

---

### FE-12 · Accuracy Lab (P1) — H15.5–17.5 · owner: Srujan · depends on: BE-11, BE-12

**Prompt**
```
Read features/accuracy-lab/SPEC.md and docs/12.
Implement /lab: worker that runs @yojana/engine over bundled personas and posts progress (pace to ~3 s), RunButton, ProgressStrip, ConfusionMatrix (diagonal glow, counts animate), MetricCards (engine vs baseline from reports/latest.json using @yojana/eval metrics), Disagreements list → PersonaDetail. Show bundle version + report timestamp. Desktop-first glass layout.
```

**Done when**
- [ ] Numbers on screen exactly equal `pnpm eval` output.

---

### FE-13 · Benefit card (P1, if chosen) — H17–18.5 · depends on: FE-09

**Prompt**
```
Read features/benefit-card/SPEC.md and docs/06 S9.
Implement the store, CardPreview (1080×1350, light theme, solid surfaces, fonts embedded), rows, documents, QR (public URLs only), export with html-to-image, Share via platform bridge (Capacitor Share on native, navigator.share with files on web, download fallback), Read aloud.
```

---

### FE-14 · Polish pass — P0 · H18.5–19.5

- [ ] All kn/hi strings replaced with data-track-reviewed versions.
- [ ] Reduce transparency, reduce motion, low-power all verified on every screen.
- [ ] Focus rings visible; icon buttons labelled; `lang` switches.
- [ ] Install sheet after first results (Android prompt / iOS instructions).
- [ ] No console errors on the hero path.

### FE-15 · Android APK — P0 · H19–20 · **Gate G6**

**Prompt**
```
Read docs/11 "Android app with Capacitor".
Add Capacitor (app id in.tanvo.yojanasaathi), android platform, plugins app/share/haptics/status-bar. RECORD_AUDIO + INTERNET permissions. Back-button handling via App.addListener. Safe-area padding. VITE_API_URL absolute. Build web, cap sync, open Android Studio.
```

**Done when**
- [ ] Debug APK installed on both demo phones; hero flow including mic works.
- [ ] Backup demo video recorded.

### FE-16 · Freeze — H20–24

Bug fixes only. No new dependencies. Rehearse the demo (doc 16 checklist).

---

### P2 backlog (only if every chosen P1 is done)

- Assisted mode screens (`features/assisted-mode/SPEC.md`) — at minimum a static screen for the roadmap slide.
- Family mode in profile.
- Reminders on APK.
