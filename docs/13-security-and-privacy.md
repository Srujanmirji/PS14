# 13 · Security and privacy

Promise shown to users: *"Your answers stay on this phone. We never ask for Aadhaar. You can delete everything anytime."* Everything below exists to keep that promise true.

## Data map

| Data | Where it lives | Leaves the device? |
| --- | --- | --- |
| Profile facts | IndexedDB on device | Only field ids + values inside one `/v1/extract` request (needed to avoid re-asking); never stored server-side |
| Utterance text / audio | Memory → API → provider | Yes, for that one request; not logged; not stored |
| Conversation history | IndexedDB (last 50 messages) | No |
| Documents have/missing | IndexedDB | No |
| Scheme knowledge base | Railway Postgres → app cache | Public data |
| Feedback | Railway Postgres | Only screen, scheme id, helpful yes/no, optional ≤ 280-char comment, language, app version. No profile, no device id, no IP stored |
| Eval runs | Railway Postgres | Synthetic personas only |

**Never collected:** Aadhaar, phone number, name (optional on benefit card, stays local), exact address, bank details, photos of documents.

## API hardening (`apps/api`)

- **CORS allowlist** from `ALLOWED_ORIGINS` (web domain, Capacitor origins, localhost in dev).
- **Rate limit**: e.g. 30 requests/min per IP on AI routes, 5/min on `/v1/feedback`; return 429 with `Retry-After`.
- **Input limits**: utterance ≤ 1,000 chars; audio ≤ 30 s / 2 MB; TTS text ≤ 600 chars; body size limit on every route.
- **zod validation** on every request and every provider response.
- **Secrets** only in Railway variables; never in the repo or `VITE_*`.
- **Logging**: request id, route, status, latency, provider error codes. **Never** log utterances, transcripts, profile values or audio. Add a redaction helper and unit-test it.
- **Admin routes** (`/v1/admin/*`: publish bundle, review queue) require `ADMIN_KEY` header; disabled entirely when the env var is missing.
- **Baseline route** requires `BASELINE_KEY`; never exposed in the app UI.
- **Prompt injection**: utterances are inserted as quoted data; extraction output is constrained to the field registry and evidence-checked (doc 09), so injected instructions can't produce fields that don't exist or values outside allowed sets.

## Database (Railway)

- Use Railway's **private network URL** from the API service; the public URL only from a developer laptop for migrations, and rotate the password after the event.
- The API's database user can read/write only the app tables (create a restricted role if time allows; otherwise note it as a roadmap item).
- Railway backups: enable before demo day.

## On-device

- "Delete all my data" (Settings) clears Dexie tables, Cache Storage audio, and the service worker's runtime caches, then returns to onboarding.
- Benefit card shows nothing the user didn't choose to include; the name field is optional and off by default.
- Assisted mode (P2): citizen profiles stay on the operator's device, with a "Clear all citizens" action and an auto-clear-after-24-hours option.

## India-specific compliance (say this, don't over-claim)

- Designed around the principles of India's Digital Personal Data Protection Act, 2023: data minimisation, purpose limitation, consent, and erasure on request. This is a hackathon prototype, not a compliance certification.
- No sensitive fields are required; social category and disability can always be skipped.

## Threats we accept for the hackathon (list them honestly)

- No user authentication (none needed — no server-side user data).
- In-memory rate limiting resets on deploy.
- Third-party AI providers process utterance text for the duration of a request; choose providers whose terms don't train on API data, and say so.
