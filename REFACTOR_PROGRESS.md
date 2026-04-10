# Branch

- [x] Active branch: `refactor/repo-hygiene-foundation`

# Goal

- [x] Make the repo cleaner and easier to maintain without changing public runtime APIs.
- [x] Finish Phase 1 so lint, build, and server tests are trustworthy on active source.
- [x] Finish Phase 2 so frontend structure moves toward `app/features/shared`.
- [x] Extend the follow-up waves until all `12/12` tabs are featureized.

# Phase 1 Checklist

- [x] Create and switch to the refactor branch.
- [x] Add repo-local progress tracking file.
- [x] Remove tracked legacy app folder `_backup_cra`.
- [x] Decide how to handle local-only `server/backup` without deleting user data unexpectedly.
- [x] Split ESLint into frontend, backend, and server test scopes.
- [x] Align root scripts with actual runtime flow.
- [x] Remove duplicate `src/lib/utils.jsx` in favor of `src/lib/utils.js`.
- [x] Sync `README.md` with current web/backend entrypoints and ports.
- [x] Sync `server/README.md` with backend-only usage.
- [x] Make `npm run lint:web` pass.
- [x] Make `npm run lint:server` pass.
- [x] Make `npm run build` pass.
- [x] Make `npm run test:server` pass.

Exit Criteria: active source is green on lint/build/test, docs match reality, and repo hygiene noise is removed from the main workflow.

# Phase 2 Checklist

- [x] Create `src/app`, `src/features`, and `src/shared`.
- [x] Move app shell concerns out of `src/App.jsx`.
- [x] Introduce `src/app/AppShell.jsx`.
- [x] Introduce `src/app/menuConfig.js`.
- [x] Introduce `src/app/tabRegistry.js`.
- [x] Move shared UI primitives to `src/shared/ui`.
- [x] Move shared helpers and hooks to `src/shared/lib` and `src/shared/hooks`.
- [x] Refactor Registration feature first.
- [x] Refactor Messages feature.
- [x] Refactor Roadmap feature.
- [x] Refactor Curriculum feature.
- [x] Refactor Deadlines feature.
- [x] Split large feature entrypoints into container + feature-scoped components/utils for the main high-risk tabs.
- [x] Re-run smoke checks for navigation, login, data fetch, and persisted local state.
- [x] Featureize Notes & Plans.
- [x] Featureize GPA.
- [x] Featureize Settings.
- [x] Featureize Exam.

Exit Criteria: app shell is thin, touched feature files live behind feature entrypoints, and the new directory structure reflects product domains instead of one flat component bucket.

# Blockers / Decisions

- [x] Branch naming stays `refactor/repo-hygiene-foundation`.
- [x] `server/backup` is currently untracked local data; avoid deleting it blindly during cleanup.
- [x] High-risk feature entrypoints are now much smaller: Registration `1106 -> 189`, Messages `1102 -> 355`, Roadmap `1381 -> 422`, Curriculum `847 -> 195`, Deadlines `849 -> 126`.
- [x] All `12/12` tabs now live behind `src/features/*` entrypoints.
- [x] No page-level files remain above `800` lines; the largest remaining file over that threshold is shared UI infra `src/components/ui/map.jsx`.
- [~] The biggest remaining frontend follow-up is bundle size and route/code splitting; the `CurriculumTab.jsx` and `DeadlinesTab.jsx` container follow-up is complete.
- [ ] Confirm whether any ignored data folders should become documented external inputs later.

# Verification Log

- [x] `git branch --show-current` => `refactor/repo-hygiene-foundation`
- [x] `npm run lint`
- [x] `npm run lint:web`
- [x] `npm run lint:server`
- [x] `npm run build`
- [x] `npm run test:server`
- [x] `npm run dev:all`
- [x] Headless Chrome smoke: landing page, enter app, theme persistence, CTĐT, Roadmap, ĐKMH, Messages, Deadlines, and MyBK login CTA opening
- [x] Final Phase 2 UI smoke completed on `2026-04-09` (`localhost` + headless Chrome, backend health `200`)
- [x] Post-refactor deep pass: `npm run lint`
- [x] Post-refactor deep pass: `npm run build`
- [x] Post-refactor deep pass: `npm run test:server`
- [x] Follow-up split pass: `CurriculumTab.jsx` `502 -> 195`, `DeadlinesTab.jsx` `552 -> 126`
- [x] Post-follow-up headless smoke: Curriculum/Deadlines split rechecked with landing, theme persistence, CTĐT, Roadmap, ĐKMH, Messages, Deadlines, and MyBK login CTA
- [x] Wave 3/4/5/6 follow-up pass: `notes-plans`, `gpa`, `settings`, and `exam` moved into `src/features/*`
- [x] Final architecture pass: `npm run lint`
- [x] Final architecture pass: `npm run build`
