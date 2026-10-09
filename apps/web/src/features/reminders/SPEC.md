# reminders — SPEC

**Track:** Frontend · **Priority:** P2 (roadmap slide unless far ahead)

## Purpose

Remind people of application deadlines and document follow-ups.

## Folder

```
reminders/
├── SPEC.md
├── index.ts                  # export { RemindMeButton }
├── store.ts                  # reminders (Dexie): id, schemeId, date, text
├── lib/schedule.ts           # native: @capacitor/local-notifications; web: in-app list + Notification API when app is open
└── components/RemindMeButton.tsx
```

## Notes

- Only schemes with an official deadline in their data get a reminder button. No invented dates.
- True background web push needs a push server and stored subscriptions — out of scope for the hackathon (and conflicts with "nothing stored about you").

## Acceptance

- [ ] On the APK, a reminder set for +1 minute fires a local notification.
