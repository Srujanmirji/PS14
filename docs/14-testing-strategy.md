# 14 · Testing strategy

Test what can break the demo or produce a wrong verdict. Skip the rest.

## Pyramid for 24 hours

| Layer | Tool | What | Must exist by |
| --- | --- | --- | --- |
| Engine unit | Vitest | Kleene tables, every operator, ranges, missingFields, nextQuestion, rank, nearMiss | Hour 5 |
| Contracts | Vitest | zod schemas accept good fixtures, reject bad ones | Hour 3 |
| Knowledge base | `pnpm schemes:check` | every scheme JSON validates; every `field` exists in fields.json; every document id exists; every scheme has `sourceUrl` and `lastChecked` | Hour 4 |
| Persona regression | `pnpm eval` (fails on any mismatch) | all 50 personas × all schemes | Hour 6 (first 10 personas), Hour 14 (all 50) |
| API | Vitest + Hono `app.request()` | each route: valid input → 200 + valid shape; invalid → 400; provider failure → fallback error code; extract evidence filter drops hallucinated facts | Hour 10 |
| DB | Vitest against a Railway dev database or local Postgres (Docker) | seed is idempotent; publish creates a new version; bundle endpoint returns 304 on matching ETag | Hour 8 |
| UI smoke | Playwright, 1 test | demo mode: onboarding → hero persona → results → detail → benefit card | Hour 16 |
| Manual device | checklist below | low-end Android, airplane mode, APK | Hour 19 |

## Fixtures

- `packages/contracts/fixtures/` — one valid and one invalid example of every schema.
- `apps/api/test/fixtures/` — recorded provider responses (good, malformed JSON, hallucinated field, timeout) so API tests never call real providers.

## Manual device checklist (hour 19)

- [ ] Fresh install of PWA on low-end Android; complete hero flow in Kannada.
- [ ] Toggle airplane mode mid-conversation: tap answers still work; banner shows.
- [ ] APK: mic permission prompt appears and recording works.
- [ ] Reduce transparency on: every screen still readable.
- [ ] Rotate phone: layout holds (or locked to portrait).
- [ ] Delete all data → back to onboarding, nothing left in Application → Storage.

## CI (optional, if time)

GitHub Actions on push: install → `pnpm test` → `pnpm schemes:check` → `pnpm eval`. A red persona regression blocks merge.

## Definition of done for any task

1. Acceptance criteria in its task / SPEC ticked.
2. `pnpm test` and `pnpm eval` green.
3. Hero demo still runs.
