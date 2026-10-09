# AGENTS.md — rules for every human and AI agent on this repo

Read this file before every task. If an instruction in a prompt conflicts with this file, this file wins. Ask the human before breaking a rule.

## 1. The non-negotiables

1. **The LLM never decides eligibility.** Verdicts come only from `packages/engine`. LLM output may fill profile fields (after validation) or produce explanation text. It may never set, change or override a verdict.
2. **Unknown stays unknown.** Never default a missing profile field to a value. `undefined` means unknown and flows through the engine as `unknown`.
3. **Never invent scheme facts.** Scheme criteria, amounts, documents and links come only from `packages/schemes/data/*.json`, which humans verified. If data is missing, show "Check with office", never a guess.
4. **The demo path comes first.** P0 work before P1, P1 before P2. Do not start a P1 feature while any P0 gate is failing.
5. **The profile never leaves the device** except as the minimum payload needed for one API call (see `docs/13-security-and-privacy.md`). No analytics that send profile data.

## 2. Architecture rules

- Feature-sliced layout. Read `docs/03-folder-structure.md`.
- A feature may import from `@/shared/*`, from `@yojana/contracts`, `@yojana/engine`, `@yojana/schemes`, and from **another feature's `index.ts` only**. Never deep-import another feature's internals.
- `packages/engine` imports nothing but `packages/contracts`. No React, no fetch, no Date.now() inside rule evaluation, no randomness. Pure functions only.
- `apps/api` stores **no citizen profile data**. The Railway Postgres database (`packages/db`) holds only: schemes and their versions, documents, the rule review queue, eval runs, and anonymous feedback. See `docs/18-database-railway.md`.
- Every API route validates input and output with zod schemas from `packages/contracts`.
- The web app never talks to the database directly; only through `apps/api`.
- All cross-boundary data (API requests and responses, scheme JSON, personas) is validated with zod at the boundary.

## 3. Code style

- TypeScript `strict: true`. No `any`. No `// @ts-ignore`.
- Functional React components and hooks. State: Zustand slices per feature, TanStack Query for server calls.
- File names: `kebab-case.ts`, components `PascalCase.tsx`, hooks `use-thing.ts` exporting `useThing`.
- One component per file. Files over ~200 lines get split.
- Every user-facing string goes through i18n (`t('feature.key')`). No hard-coded English in JSX.
- UI is built only from `@/shared/ui` primitives and design tokens (`docs/05-design-system.md`). No ad-hoc colours, shadows or blur values.

## 4. Feature folders

Every folder in `apps/web/src/features/` contains `SPEC.md`. Before editing a feature:

1. Read its `SPEC.md`.
2. Implement only what the spec lists for the current priority.
3. Tick the acceptance checklist in the spec when each item passes.
4. If you change behaviour, update the spec in the same change.

## 5. Tests that must pass before you say "done"

- `pnpm test` — all engine and contract tests.
- `pnpm schemes:check` — every scheme file validates.
- `pnpm eval` — persona regression: no persona may change verdict unless the change was intended and the expected labels were updated by a human.
- For UI work: the hero demo flow (`docs/16-demo-mode-and-script.md`) still runs start to finish.

## 6. Dependencies

Approved list lives in `docs/04-tech-stack.md`. Adding anything else needs a one-line reason in the commit message and in that doc. Prefer fewer dependencies.

## 7. Accessibility and performance floor

- Touch targets ≥ 48 × 48 px. Body text ≥ 17 px.
- Text contrast ≥ 4.5:1 against the *worst* point of the background behind its glass panel.
- Respect `prefers-reduced-motion` and the in-app **Reduce transparency** setting.
- Works on a 2 GB RAM Android phone. Low-power mode removes blur and animated backgrounds.
- First load under 300 KB of JS (gzip) for the shell; features load lazily.

## 8. When unsure

Stop and ask the human. A wrong guess on eligibility logic or scheme data is worse than a slow answer.
