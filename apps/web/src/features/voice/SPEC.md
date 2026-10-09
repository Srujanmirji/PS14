# voice — SPEC

**Track:** Frontend (calls Backend `/v1/stt`, `/v1/tts`) · **Priority:** P1 · Full design: `docs/10-voice-and-languages.md`

## Purpose

Speak instead of type; listen instead of read.

## Folder

```
voice/
├── SPEC.md
├── index.ts                  # export { MicButton, ReadAloudButton, useRecorder, useSpeak }
├── components/
│   ├── MicButton.tsx         # wraps shared/ui MicButton visuals with recording logic
│   ├── Waveform.tsx          # bars from AnalyserNode
│   └── ReadAloudButton.tsx
├── hooks/
│   ├── use-recorder.ts       # getUserMedia, MediaRecorder, silence auto-stop, 20 s cap, permission states
│   ├── use-transcribe.ts     # POST /v1/stt
│   └── use-speak.ts          # POST /v1/tts → cached audio → play; fallback speechSynthesis
├── lib/audio-cache.ts        # Cache Storage keyed by hash(text, lang)
└── i18n/{en,kn,hi}.json
```

## States

`idle → requesting-permission → listening → processing → done | error(permission-denied | offline | no-speech | failed)`

Each error has a one-line message and leaves tap/typing available.

## Acceptance

- [ ] Kannada sentence → transcript shown for confirmation within ~3 s on good network.
- [ ] Mic disabled offline with tooltip.
- [ ] Read aloud works offline for any text played once before.
- [ ] Works inside the Android APK (RECORD_AUDIO granted) — test on day 0.
- [ ] Demo mode: falls back to scripted transcript if STT is slow or fails.
