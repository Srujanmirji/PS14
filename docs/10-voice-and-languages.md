# 10 · Voice and languages

## Languages

| Code | Language | UI | Scheme content | Voice in | Voice out |
| --- | --- | --- | --- | --- | --- |
| `kn` | Kannada | P0 | P0 | P1 | P1 |
| `en` | English | P0 | P0 | P1 | P1 |
| `hi` | Hindi | P1 | P1 | P1 | P1 |

Cut order if behind: Hindi voice → Hindi content → all voice (keep typing + tap answers).

## Translation strategy

- **UI strings:** i18next JSON per feature namespace (`features/<f>/i18n/{en,kn,hi}.json`) + `shared/i18n` for common words. Draft with an LLM, have a native speaker on the team fix them. Never translate at runtime.
- **Scheme content** (names, labels, steps, documents): `I18nText` fields in scheme JSON, translated at knowledge-base build time and reviewed. This is what makes offline Kannada work.
- **Explanations:** templates are i18n strings with placeholders; the LLM polish (online) is generated directly in the target language.
- **Numbers and money:** format with `Intl.NumberFormat('en-IN')` (lakh grouping) and, if the user prefers, native digits via `Intl.NumberFormat('kn-IN', { numberingSystem: 'knda' })` — test support on the demo phone first.

## Speech-to-text (voice feature → `/v1/stt`)

Client:
1. `MicButton` press → `getUserMedia({ audio: true })` → `MediaRecorder` (prefer `audio/webm;codecs=opus`; fall back to what the browser offers).
2. Hold-to-talk *and* tap-to-toggle both supported; auto-stop after 2 s silence (simple volume threshold from an `AnalyserNode`) or 20 s max.
3. Live waveform from the same `AnalyserNode`.
4. Upload blob + `lang` as multipart to `/v1/stt`.
5. Show transcript as the user's chat bubble with **Edit**; then call `/v1/extract`.

Server: forward to the speech provider (Sarvam's speech-to-text models handle Indian languages and code-mixing; check docs.sarvam.ai for the current model name and whether it needs WAV — convert server-side if needed). Return `{ text }`.

Failure: show *"I couldn't hear that clearly — try again or type"*, keep the mic available.

## Text-to-speech (read aloud)

- **Read aloud** buttons on scheme detail, results summary, benefit card, and the language tiles.
- Server `/v1/tts` → provider TTS → audio bytes; client plays via `<audio>`.
- Cache audio per `hash(text, lang)` in the Cache Storage so repeat plays work offline.
- Fallback: `speechSynthesis` (Web Speech API) if a voice for the language exists on the device; otherwise hide the button offline.

## Capacitor (Android) notes

- Add `RECORD_AUDIO` permission in `AndroidManifest.xml`.
- WebView microphone access needs the permission granted at runtime; test `getUserMedia` inside the APK on day 0 of the build, not at hour 20. If it fails, use a Capacitor voice-recorder community plugin behind the same `voice` feature interface.

## Voice UX rules

- The mic is the biggest thing on the Home screen.
- Saathi's question card always offers tap answers too; voice is never the only way.
- Show what was heard before acting on it.
- Low-literacy mode (P2): auto-read every Saathi message aloud.
