# 15 · Showcase features — what wins judges

Judges see 20–40 demos. They remember **one moment** and **one number** per team. Build for that.

## Ranked by impact ÷ effort

| # | Feature | Moment on stage | Impact | Effort | Priority |
| --- | --- | --- | --- | --- | --- |
| 1 | **Live Accuracy Lab** | Press *Run 50 personas* → matrix animates → "Our engine: N wrong yeses. LLM-only: M." | Very high | Medium | P1 — build |
| 2 | **Airplane-mode demo** | Turn on airplane mode on the projected phone, keep answering, results still appear | Very high | Low (falls out of the architecture) | P1 — build |
| 3 | **Unlock meter + near miss** | "Answer 1 more question to check 2 more schemes" fills and counts up; "Close — you'd qualify if…" | High | Low | P0 — part of results |
| 4 | **Kannada voice in, read aloud out** | Speak in Kannada; the app answers aloud | High | Medium | P1 — build if voice works by hour 12 |
| 5 | **Benefit card share** | Generate a card with QR, share to WhatsApp on the projected phone | Medium-high | Low-medium | P1 — build |
| 6 | **Installable app + Android APK** | Hold up a phone with the app icon on the home screen | Medium | Low-medium | P1 — do it |
| 7 | **Live scheme update without app release** | Publish a new bundle version in the DB; the phone picks it up on refresh | Medium (scalability proof) | Low once DB works | P1 — if backend is ahead |
| 8 | **Life-event entry** | Tap "Lost my spouse" → instantly relevant questions | Medium | Low | P0 — cheap, keep |
| 9 | **Assisted mode for CSC/ASHA** | Switch to operator mode, screen 3 citizens in a row | Medium (scale story) | Medium-high | P2 — show a screen or a slide |
| 10 | **Family mode** | Add son → scholarship appears | Medium | Medium | P2 |
| 11 | **Deadline reminders** | Notification on phone | Low | Medium | P2 — roadmap slide |

**Rule:** build 3–5 + 8 as P0/P1 core, then **pick three** of 1, 2, 4, 5, 6, 7. Recommended three: **1, 2, 5**. They need no fragile live dependencies and each lands in under 20 seconds on stage.

## Why these, not flashier ideas

| Tempting idea | Why we skip it |
| --- | --- |
| 3D avatar / animated mascot | Looks good, proves nothing about the problem statement |
| Document OCR from camera | Fragile live, privacy questions, eats 4+ hours |
| Chatbot that "answers anything" | Exactly what every other team builds; invites hallucination questions |
| Blockchain / "verified credentials" | Judges see through it |
| Admin CMS for schemes | Invisible in a 3-minute demo; the DB publish moment (#7) shows the same thing in 10 seconds |

## The one number

Whatever the false-eligible rate is, put it on screen big, next to the baseline. If the engine has errors, show them and say why (usually an ambiguous rule you flagged). Judges trust teams that show their own errors.
