# onboarding — SPEC

**Track:** Frontend · **Priority:** P0 · **Screens:** S1 Splash, S2 Language, S3 Privacy

## Purpose

Get the user into their language and earn trust in under 15 seconds.

## User stories

- As Lakshmi, I pick Kannada by its script without reading English.
- As any user, I understand my answers stay on my phone before I share anything.

## Folder

```
onboarding/
├── SPEC.md
├── index.ts            # export { routes }
├── routes.tsx          # /welcome, /welcome/language, /welcome/privacy
├── components/{Splash.tsx, LanguagePicker.tsx, PrivacyPromise.tsx, HowItWorksSheet.tsx}
└── i18n/{en,kn,hi}.json
```

## Behaviour

- Splash auto-advances after 1.2 s; tap skips.
- Language tiles: ಕನ್ನಡ, हिन्दी, English, each 100 % width, ≥ 96 px tall. Tap → set `settings.lang`, `<html lang>`, play greeting (via `voice` feature if available; silent otherwise).
- Privacy card → **Continue** sets `settings.onboarded = true` → `/`.
- "How it works" sheet: 3 steps with icons (Tell → We check the rules → You see what to do).
- Returning users skip onboarding.

## Acceptance

- [ ] Language choice persists across reloads and in the APK.
- [ ] All three screens fully translated; no English visible after choosing Kannada.
- [ ] Works offline.
- [ ] Demo mode pre-selects Kannada and lands on Privacy.

## Out of scope

Login, phone number, permissions up front (mic permission is requested only when the mic is first tapped).
