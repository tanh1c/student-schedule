# Next Refactor Roadmap

## Status

The large frontend architecture pass is complete.

Current state:

- `12/12` main tabs now live behind `src/features/*`
- app shell, tab registry, and menu config are already normalized
- shared app-level components were moved into `src/shared`
- the repo is now in a stable state for smaller, more targeted refactor rounds

This file now tracks the next practical cleanup wave after the completed feature architecture migration.

## Completed Baseline

- [x] Phase 1 repo hygiene
- [x] Phase 2 frontend modularization
- [x] Wave 1 schedule featureization
- [x] Wave 2 teaching schedule featureization
- [x] Wave 3 notes & plans featureization
- [x] Wave 4 GPA featureization
- [x] Wave 5 post-refactor cleanup
- [x] Wave 6a settings featureization
- [x] Wave 6b exam featureization

## Next Priority Stack

1. Backend structure cleanup
2. CI/CD baseline
3. Bundle and runtime performance
4. Documentation consolidation
5. Regression safety improvements

## Wave A: Backend Structure Cleanup

- [ ] split `server/src/routes/apiRoutes.js` by domain
- [ ] reduce controller-level legacy alias sprawl in `studentController.js`
- [ ] decide whether backend should stay layer-based or move toward `modules/*`
- [ ] group backend docs/scripts/data more consistently
- [ ] re-check backend file size hotspots after route split

### Target Shape

```text
server/src/
  app.js
  server.js
  modules/
    auth/
    student/
    dkmh/
    lms/
    lecturer/
  middlewares/
  utils/
```

### Exit Criteria

- [ ] route files are domain-based instead of one shared API bucket
- [ ] student-related legacy endpoints are easier to trace
- [ ] backend docs and source tree feel clearly separated

## Wave B: CI/CD Baseline

- [ ] add GitHub Actions CI for lint/build/test
- [ ] ensure CI runs:
  - `npm run lint`
  - `npm run build`
  - `npm run test:server`
- [ ] document required production secrets
- [ ] decide whether to auto-deploy only from `main`

### Exit Criteria

- [ ] pull requests get automatic quality checks
- [ ] deployment flow is documented with current commands and env vars

## Wave C: Performance Follow-Up

- [ ] inspect remaining large shared chunks after lazy-loading
- [ ] decide whether more manual chunking is worth it
- [ ] profile heavy tabs on mobile
- [ ] revisit large shared infra files if they become bottlenecks

### Exit Criteria

- [ ] build stays warning-free or warnings are explicitly understood
- [ ] first-load path is acceptable on mobile hardware

## Wave D: Documentation Cleanup

- [ ] keep root docs short and role-based
- [ ] avoid stale deploy steps or old branch names
- [ ] keep backend-only notes under `server/`
- [ ] decide whether historical refactor notes should move to `docs/` later

### Exit Criteria

- [ ] each root markdown file has one clear purpose
- [ ] no stale references to old entrypoints or outdated runtime flow

## Wave E: Regression Safety

- [ ] add a lightweight manual smoke checklist for release validation
- [ ] consider a small automated browser smoke test for critical tabs
- [ ] verify login, schedule, registration, LMS, and deadlines flows after major changes

### Exit Criteria

- [ ] major refactors have a repeatable validation path

## Notes

- The remaining work is now mostly about maintainability and delivery quality, not large frontend architecture moves.
- For frontend structure, the repo is already in a good place; the next big gains come from backend cleanup and release process quality.
