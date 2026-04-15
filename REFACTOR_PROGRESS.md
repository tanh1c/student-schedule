# Branch

- [x] Active branch: `refactor/repo-hygiene-foundation`
- [x] Main architecture milestone committed and stabilized on this workstream

# Goal

- [x] Clean the repo without changing public runtime APIs
- [x] Make tooling trustworthy on active source
- [x] Move frontend architecture to `app / features / shared`
- [x] Finish featureization for all `12/12` main tabs
- [x] Rename visible product surface from `TKB Smart` to `StuSpace`
- [x] Organize backend ancillary assets under clearer folders

# Phase 1 Checklist

- [x] Create and switch to refactor branch
- [x] Add progress tracking file
- [x] Remove tracked legacy frontend folder `_backup_cra`
- [x] Keep local-only `server/backup` untouched
- [x] Split lint flow into web/server scopes
- [x] Align root scripts with actual runtime flow
- [x] Remove duplicate frontend utility source
- [x] Sync root and backend README files
- [x] Make `lint`, `build`, and backend tests pass on active code

Exit Criteria: repo hygiene is in place, docs match the real entrypoints, and active tooling is trustworthy.

# Phase 2 Checklist

- [x] Create `src/app`, `src/features`, and `src/shared`
- [x] Move app shell concerns out of `src/App.jsx`
- [x] Featureize Registration
- [x] Featureize Messages
- [x] Featureize Roadmap
- [x] Featureize Curriculum
- [x] Featureize Deadlines
- [x] Featureize Schedule
- [x] Featureize Teaching Schedule
- [x] Featureize Notes & Plans
- [x] Featureize GPA
- [x] Featureize Settings
- [x] Featureize Exam
- [x] Keep compatibility wrappers for old `src/components/*` imports where needed

Exit Criteria: app shell is thin, product domains live behind `src/features/*`, and legacy flat-component structure is no longer the main architecture.

# Blockers / Decisions

- [x] Branch naming stays `refactor/repo-hygiene-foundation`
- [x] `server/backup` remains local-only and is not deleted blindly
- [x] GitHub-facing repo slug still stays `student-schedule` until the remote repository is actually renamed
- [x] Backend ancillary assets were reorganized into `server/data` and `server/docs`
- [x] Frontend feature architecture is complete at `12/12` tabs
- [~] Remaining follow-up work is now mostly backend modular cleanup, CI/CD, and performance polish
- [ ] Decide later whether historical root docs should move under a dedicated `docs/` directory

# Verification Log

- [x] `git branch --show-current` => `refactor/repo-hygiene-foundation`
- [x] `npm run lint`
- [x] `npm run lint:web`
- [x] `npm run lint:server`
- [x] `npm run build`
- [x] `npm run test:server`
- [x] `npm run dev:all`
- [x] Headless UI smoke completed for core flows during refactor waves
- [x] Final frontend architecture pass verified with `lint` and `build`
- [x] Backend ancillary asset move rechecked with backend tests (`9/9` suites passing)
