# 16 · Demo mode and stage script

## Demo mode (feature: `demo-mode`, P0)

The stage demo must behave identically every time, with or without Wi-Fi.

**Turn on:** URL `?demo=1`, or tap the logo 5 times → Settings shows "Demo mode" toggle.

**What it changes:**

| Normal | Demo mode |
| --- | --- |
| Live STT | Recorded audio is still captured (for show), but the transcript comes from the scripted list if the live call fails or takes > 3 s |
| Live `/v1/extract` | Scripted extraction results per utterance (exact same updates every run); live call attempted in parallel only if online and used if it returns the same fields |
| Live `/v1/explain` | Cached explanations bundled with the app |
| Bundle from API | Bundled snapshot (pinned version) |
| Empty profile | "Reset demo" button returns to onboarding with Kannada pre-selected |

Scripted data lives in `features/demo-mode/script/lakshmi.ts`:

```ts
export const lakshmiScript = {
  lang: "kn",
  turns: [
    { utterance: "<Kannada: I am a widow, I work on other people's farms>", updates: [/* marital_status, occupation */] },
    { askedField: "age", tap: 58 },
    { askedField: "ration_card", tap: "bpl" },
    // the rest answered by taps
  ],
};
```

Write the real Kannada utterance with a native speaker; rehearse saying it exactly.

## The 3-minute stage script

| Time | Screen | You say | Showcase |
| --- | --- | --- | --- |
| 0:00 | Slide: Lakshmi | "Lakshmi is 58, a widow in Dharwad, works on other people's farms. She qualifies for help. She gets none." | Story |
| 0:20 | Phone: language tiles | Tap ಕನ್ನಡ (greeting plays) | Voice out |
| 0:30 | Home | Tap mic, say Lakshmi's sentence in Kannada | Voice in |
| 0:45 | Conversation | Chips pop in: Widow · Farm labourer. "It only asks what changes the answer." Tap age, tap BPL card | Profile meter, quick replies |
| 1:05 | Conversation | **Turn on airplane mode.** "No internet now." Answer one more question by tapping | Airplane-mode demo |
| 1:20 | Results | "3 you qualify for, 2 maybe." Point at unlock meter: "One more answer checks 2 more." | Unlock meter |
| 1:35 | Scheme detail | Show ✓ ✓ ✓ with source links; "Check before you go"; tap **Read aloud** (cached audio) | Explainability |
| 1:55 | Benefit card | Generate, show QR, *(turn airplane mode off)* share to WhatsApp | Benefit card |
| 2:10 | Laptop: Accuracy Lab | Press **Run 50 personas**. "On 50 test cases our engine said a wrong 'yes' N times. An LLM deciding on its own: M times." | The one number |
| 2:40 | Slide: USP | "myScheme is a filter. Saathi is a caseworker that admits what it doesn't know." | Positioning |
| 2:50 | Slide: close | "Lakshmi found her benefits in under two minutes." *(only if true in your run)* | Close |

## Backup plan

- Record the full run as a video at hour 20; keep it on the laptop desktop and on a USB stick.
- If the phone fails, mirror the PWA in the laptop browser with device emulation.
- If the projector fails, hand a judge the phone with demo mode on.

## Rehearsal checklist

- [ ] Five clean runs in a row, timed.
- [ ] One run with Wi-Fi off from the start.
- [ ] One run on the low-end phone.
- [ ] Each team member can run the demo alone.
- [ ] Phone: Do Not Disturb on, brightness max, battery > 80 %, screen timeout 10 min.
