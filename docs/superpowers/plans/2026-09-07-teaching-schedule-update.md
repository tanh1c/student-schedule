# Teaching Schedule Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one interactive local command that refreshes the lecturer teaching-schedule snapshot for a specified HCMUT term without persisting credentials.

**Architecture:** A CLI orchestrator uses reusable DKMH services to log in, discover the matching registration period and its live IDs, then crawl every course detail into the existing static subject schema. It stages, validates, backs up, and atomically replaces snapshots; LMS enrichment is best-effort and never blocks a valid DKMH update.

**Tech Stack:** Node.js ESM, existing `node-fetch`/`fetch-cookie`/`tough-cookie`, Node `readline`, Jest.

## Global Constraints

- No MyBK password, session cookie, or LMS credential may be persisted.
- The CLI runs locally without Redis, an HTTP server, or a browser session.
- The command is `npm run update:teaching-schedule -- --semester <261-style-code>`.
- Derive `hocKyId`, `dotDKHocVienId`, and `dotDKId` from live DKMH responses; never hard-code them.
- A missing or malformed `dotDKId` is a hard failure; never substitute `periodId`.
- DKMH output must conform to the existing `data_subject.json` contract.
- LMS is optional: retain the active lecturer snapshot and emit a warning when discovery or enrichment fails.
- Use temporary files plus rename; preserve a timestamped backup before replacing an active snapshot.
- Do not add dependencies.

---

## File Structure

- `package.json` — exposes the root update command.
- `server/package.json` — exposes the server-local CLI command.
- `server/src/services/dkmhCrawler.js` — reusable authenticated DKMH discovery and full subject crawl; contains no Express request/response code.
- `server/src/services/teachingScheduleSnapshot.js` — validates subject snapshots and safely stages/backups/replaces data files.
- `server/src/scripts/updateTeachingSchedule.js` — CLI argument parsing, hidden credential prompt, orchestration, dry-run reporting, and process exit codes.
- `server/tests/services/dkmhCrawler.test.js` — fixture-driven tests for period/ID extraction, period selection, and subject normalization.
- `server/tests/services/teachingScheduleSnapshot.test.js` — tests validation and atomic snapshot behavior using temporary directories.
- `server/tests/scripts/updateTeachingSchedule.test.js` — tests argument parsing and dry-run orchestration with injected service functions.

## Task 1: Extract DKMH discovery and ID parsing

**Files:**
- Create: `server/src/services/dkmhCrawler.js`
- Modify: `server/src/controllers/dkmhController.js:59-182`
- Test: `server/tests/services/dkmhCrawler.test.js`

**Interfaces:**
- Consumes: `performDKMHLogin(username, password)` from `server/src/services/dkmhService.js`, which returns `{ success, error, jar }`.
- Produces: `parseRegistrationPeriods(html, now)`, `selectRegistrationPeriod(periods, semester)`, `parseRegistrationBatchIds(html)`, and `openRegistrationPeriod({ fetch, semester, now })`.
- `parseRegistrationPeriods` returns `Array<{ id: string, code: string, description: string, startTime: string, endTime: string, status: 'upcoming' | 'open' | 'closed', hasResult: boolean }>`.
- `parseRegistrationBatchIds` returns `{ dotDKHocVienId: string, dotDKId: string }` or throws `Error('Unable to parse DKMH registration batch IDs')`.
- `openRegistrationPeriod` returns `{ period, hocKyId: string, dotDKHocVienId: string, dotDKId: string, fetch, baseHeaders }`.

- [ ] **Step 1: Write failing parser tests using existing fixtures**

```js
import { describe, expect, it } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import {
    parseRegistrationPeriods,
    parseRegistrationBatchIds,
    selectRegistrationPeriod
} from '../../src/services/dkmhCrawler.js';

const fixture = (name) => readFile(new URL(`../../../htmlSpecs/${name}`, import.meta.url), 'utf8');

describe('dkmhCrawler', () => {
    it('finds HK261 and uses its ketQuaDangKyView argument as hocKyId', async () => {
        const periods = parseRegistrationPeriods(
            await fixture('dangKyMonHocForm.action.html'),
            new Date('2026-09-07T00:00:00Z')
        );

        expect(selectRegistrationPeriod(periods, '261')).toMatchObject({
            id: '685',
            code: 'HK261_D1'
        });
    });

    it('parses both registration batch IDs', async () => {
        expect(parseRegistrationBatchIds(await fixture('getDanhSachDotDK.action.html')))
            .toEqual({ dotDKHocVienId: '749', dotDKId: '749' });
    });

    it('rejects a missing registration batch callback', () => {
        expect(() => parseRegistrationBatchIds('<html></html>'))
            .toThrow('Unable to parse DKMH registration batch IDs');
    });
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm --prefix server test -- --runInBand tests/services/dkmhCrawler.test.js`

Expected: FAIL because `dkmhCrawler.js` does not exist.

- [ ] **Step 3: Implement period parsing, deterministic selection, and strict batch-ID parsing**

```js
export function parseRegistrationBatchIds(html) {
    const match = html.match(
        /getLichDangKyByDotDKId\s*\(\s*this\s*,\s*(\d+)\s*,\s*(\d+)/
    );
    if (!match) throw new Error('Unable to parse DKMH registration batch IDs');

    return { dotDKHocVienId: match[1], dotDKId: match[2] };
}

export function selectRegistrationPeriod(periods, semester) {
    const matches = periods.filter(({ code }) => code.startsWith(`HK${semester}`));
    if (!matches.length) throw new Error(`No DKMH registration period found for HK${semester}`);

    return matches.find(({ status }) => status === 'open') ?? matches[0];
}
```

Implement `parseRegistrationPeriods` by moving the current registration-row regex and status calculation out of `getRegistrationPeriods`. Implement `openRegistrationPeriod` using the existing sequence from `getPeriodDetails`: POST `ketQuaDangKyView.action`, POST `getDanhSachDotDK.action`, strict parse, then POST `getLichDangKy.action` and `getDanhSachMonHocDangKy.action`.

- [ ] **Step 4: Refactor the controller to call the shared service**

Replace controller-local registration row parsing with `parseRegistrationPeriods`. Replace `dotDKMatch ? ... : periodId` in `getPeriodDetails` with `parseRegistrationBatchIds(dotDKHtml)`, preserving its existing HTTP response contract on success. Allow the thrown parse error to reach the existing catch block and return 500 instead of issuing a request with invalid IDs.

- [ ] **Step 5: Run focused tests to verify the parser and controller behavior**

Run: `npm --prefix server test -- --runInBand tests/services/dkmhCrawler.test.js tests/controllers/dkmhController.test.js`

Expected: PASS. Add/update a controller test asserting malformed DKMH batch HTML returns an error response and does not call `getLichDangKy.action`.

- [ ] **Step 6: Commit**

```bash
git add server/src/services/dkmhCrawler.js server/src/controllers/dkmhController.js server/tests/services/dkmhCrawler.test.js server/tests/controllers/dkmhController.test.js
git commit -m "refactor: share DKMH period discovery"
```

## Task 2: Crawl and normalize the full DKMH subject snapshot

**Files:**
- Modify: `server/src/services/dkmhCrawler.js`
- Test: `server/tests/services/dkmhCrawler.test.js`

**Interfaces:**
- Consumes: `openRegistrationPeriod({ fetch, semester, now })` from Task 1.
- Produces: `crawlTeachingSchedule({ username, password, semester, now, login = performDKMHLogin })`, returning:

```js
{
  period: { id: string, code: string },
  hocKyId: string,
  dotDKHocVienId: string,
  dotDKId: string,
  subjects: Array<{
    id: string,
    maMonHoc: string,
    tenMonHoc: string,
    soTinChi: number,
    lichHoc: Array<{
      group: string,
      siso: string,
      ngonNgu: string,
      nhomLT: string,
      giangVien: string,
      nhomBT: string,
      giangVienBT: string,
      sisoLT: string,
      classInfo: Array<{ dayOfWeek: number, tietHoc: number[], phong: string, coSo: string, week: number[] }>
    }>
  }>
}
```

- [ ] **Step 1: Write failing normalization tests**

```js
it('normalizes every class group to the active subject snapshot schema', async () => {
    const result = await crawlTeachingSchedule({
        username: 'student',
        password: 'secret',
        semester: '261',
        login: mockLogin
    });

    expect(result).toMatchObject({
        period: { code: 'HK261_D1' },
        hocKyId: '685',
        dotDKId: '749',
        subjects: [
            expect.objectContaining({
                id: '123',
                maMonHoc: 'CO3001',
                tenMonHoc: 'Kỹ thuật phần mềm',
                soTinChi: 3,
                lichHoc: [expect.objectContaining({
                    group: 'L01',
                    classInfo: [expect.objectContaining({
                        dayOfWeek: 1,
                        tietHoc: [1, 2],
                        week: [1, 2]
                    })]
                })]
            })
        ]
    });
});
```

Mock the DKMH calls in their actual order: registration form, `ketQuaDangKyView`, `getDanhSachDotDK`, `getLichDangKy`, `getDanhSachMonHocDangKy`, `searchMonHocDangKy`, then one `getThongTinNhomLopMonHoc` response per parsed search result.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm --prefix server test -- --runInBand tests/services/dkmhCrawler.test.js`

Expected: FAIL because `crawlTeachingSchedule` is not exported.

- [ ] **Step 3: Implement crawler orchestration with existing parsers**

```js
export async function crawlTeachingSchedule({ username, password, semester, now = new Date(), login = performDKMHLogin }) {
    const loginResult = await login(username, password);
    if (!loginResult.success) throw new Error(loginResult.error);

    const { fetch } = createFetchFromJar(loginResult.jar);
    const active = await openRegistrationPeriod({ fetch, semester, now });
    const courses = await searchAllCourses(active);
    const subjects = await Promise.all(courses.map((course) => fetchSubject(course, active)));

    return {
        period: active.period,
        hocKyId: active.hocKyId,
        dotDKHocVienId: active.dotDKHocVienId,
        dotDKId: active.dotDKId,
        subjects: subjects.filter(Boolean)
    };
}
```

Use `parseSearchResultsHtml` and `parseClassGroupsHtml` from `dkmhParser.js`. Add small conversion helpers in `dkmhCrawler.js` only: map DKMH group fields to `lichHoc`, map Vietnamese day strings to `0..6`, parse comma-separated lesson values into integer arrays, and parse the existing DKMH week display into integer arrays. Do not use `eval`, HTML-to-text conversion, or the Python crawler.

- [ ] **Step 4: Run focused tests to verify the crawl contract**

Run: `npm --prefix server test -- --runInBand tests/services/dkmhCrawler.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/src/services/dkmhCrawler.js server/tests/services/dkmhCrawler.test.js
git commit -m "feat: crawl DKMH teaching schedules"
```

## Task 3: Validate, back up, and atomically install snapshots

**Files:**
- Create: `server/src/services/teachingScheduleSnapshot.js`
- Test: `server/tests/services/teachingScheduleSnapshot.test.js`

**Interfaces:**
- Consumes: `subjects` returned by `crawlTeachingSchedule` and current JSON file paths.
- Produces:

```js
validateSubjectSnapshot(subjects, { minimumSubjects })
// returns { subjectCount: number, groupCount: number }
// throws Error with a specific message for invalid content

installSubjectSnapshot({ subjects, subjectPath, backupDirectory, minimumSubjects })
// returns { subjectCount: number, groupCount: number, backupPath: string }
```

- [ ] **Step 1: Write failing validation and safe-write tests**

```js
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from '@jest/globals';
import { installSubjectSnapshot, validateSubjectSnapshot } from '../../src/services/teachingScheduleSnapshot.js';

const validSubjects = [{
    id: '1', maMonHoc: 'CO3001', tenMonHoc: 'Kỹ thuật phần mềm', soTinChi: 3,
    lichHoc: [{ group: 'L01', classInfo: [{ dayOfWeek: 1, tietHoc: [1], phong: 'H1', coSo: '1', week: [1] }] }]
}];

it('rejects an empty subject snapshot', () => {
    expect(() => validateSubjectSnapshot([], { minimumSubjects: 1 }))
        .toThrow('Subject snapshot contains no subjects');
});

it('backs up the active file and replaces it after validation', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'schedule-snapshot-'));
    const subjectPath = join(directory, 'data_subject.json');
    await writeFile(subjectPath, JSON.stringify([{ id: 'old' }]));

    const result = await installSubjectSnapshot({
        subjects: validSubjects,
        subjectPath,
        backupDirectory: directory,
        minimumSubjects: 1
    });

    expect(JSON.parse(await readFile(subjectPath, 'utf8'))).toEqual(validSubjects);
    expect(JSON.parse(await readFile(result.backupPath, 'utf8'))).toEqual([{ id: 'old' }]);
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm --prefix server test -- --runInBand tests/services/teachingScheduleSnapshot.test.js`

Expected: FAIL because `teachingScheduleSnapshot.js` does not exist.

- [ ] **Step 3: Implement strict subject validation**

```js
export function validateSubjectSnapshot(subjects, { minimumSubjects = 1 } = {}) {
    if (!Array.isArray(subjects)) throw new Error('Subject snapshot must be an array');
    if (subjects.length < minimumSubjects) throw new Error('Subject snapshot contains no subjects');

    let groupCount = 0;
    for (const subject of subjects) {
        if (!subject.id || !subject.maMonHoc || !subject.tenMonHoc || !Array.isArray(subject.lichHoc)) {
            throw new Error(`Invalid subject snapshot record: ${subject.maMonHoc || subject.id || 'unknown'}`);
        }
        for (const group of subject.lichHoc) {
            groupCount += 1;
            for (const item of group.classInfo ?? []) {
                if (!Number.isInteger(item.dayOfWeek) || item.dayOfWeek < 0 || item.dayOfWeek > 6) {
                    throw new Error(`Invalid dayOfWeek for ${subject.maMonHoc}/${group.group}`);
                }
                if (!item.tietHoc.every(Number.isInteger) || !item.week.every(Number.isInteger)) {
                    throw new Error(`Invalid lesson or week values for ${subject.maMonHoc}/${group.group}`);
                }
            }
        }
    }
    if (!groupCount) throw new Error('Subject snapshot contains no class groups');
    return { subjectCount: subjects.length, groupCount };
}
```

- [ ] **Step 4: Implement temporary-file write, backup, and rename**

Use `readFile` to preserve the active file before writing. Generate a backup name such as `data_subject.2026-09-07T12-30-00-000Z.backup.json` with filesystem-safe punctuation. Write the new JSON to `<subjectPath>.tmp-<pid>`, then `rename` it over `subjectPath`. Delete the temporary file in a `finally` only when it still exists. Do not create or alter lecturer data in this task.

- [ ] **Step 5: Run focused tests to verify validation and installation**

Run: `npm --prefix server test -- --runInBand tests/services/teachingScheduleSnapshot.test.js`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add server/src/services/teachingScheduleSnapshot.js server/tests/services/teachingScheduleSnapshot.test.js
git commit -m "feat: safely install schedule snapshots"
```

## Task 4: Add the interactive command and dry-run mode

**Files:**
- Create: `server/src/scripts/updateTeachingSchedule.js`
- Modify: `package.json:9-21`
- Modify: `server/package.json:5-10`
- Test: `server/tests/scripts/updateTeachingSchedule.test.js`

**Interfaces:**
- Consumes: `crawlTeachingSchedule` from `dkmhCrawler.js` and `installSubjectSnapshot`/`validateSubjectSnapshot` from `teachingScheduleSnapshot.js`.
- Produces: `parseArguments(argv)`, `runUpdate({ argv, prompt, crawl, validate, install, stdout, paths })`, and executable CLI behavior.
- `parseArguments(['--semester', '261', '--dry-run'])` returns `{ semester: '261', dryRun: true }`.
- `runUpdate` returns `{ dryRun, period, hocKyId, dotDKHocVienId, dotDKId, subjectCount, groupCount, backupPath?: string, lmsStatus: 'skipped' }`.

- [ ] **Step 1: Write failing CLI argument and dry-run tests**

```js
import { describe, expect, it, jest } from '@jest/globals';
import { parseArguments, runUpdate } from '../../src/scripts/updateTeachingSchedule.js';

it('parses the required semester and dry-run flag', () => {
    expect(parseArguments(['--semester', '261', '--dry-run']))
        .toEqual({ semester: '261', dryRun: true });
});

it('does not install a snapshot during dry-run', async () => {
    const install = jest.fn();
    const result = await runUpdate({
        argv: ['--semester', '261', '--dry-run'],
        prompt: jest.fn()
            .mockResolvedValueOnce('student')
            .mockResolvedValueOnce('password'),
        crawl: jest.fn().mockResolvedValue({
            period: { code: 'HK261_D1' }, hocKyId: '685',
            dotDKHocVienId: '749', dotDKId: '749', subjects: validSubjects
        }),
        validate: jest.fn().mockReturnValue({ subjectCount: 1, groupCount: 1 }),
        install,
        stdout: { write: jest.fn() },
        paths: { subjectPath: '/tmp/data_subject.json', backupDirectory: '/tmp' }
    });

    expect(install).not.toHaveBeenCalled();
    expect(result).toMatchObject({ dryRun: true, dotDKId: '749', subjectCount: 1 });
});
```

Define `validSubjects` locally in the test with the Task 3-valid shape.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm --prefix server test -- --runInBand tests/scripts/updateTeachingSchedule.test.js`

Expected: FAIL because the CLI module does not exist.

- [ ] **Step 3: Implement argument parsing and hidden interactive prompts**

```js
export function parseArguments(argv) {
    const semesterIndex = argv.indexOf('--semester');
    const semester = semesterIndex >= 0 ? argv[semesterIndex + 1] : undefined;
    if (!/^\d{3}$/.test(semester ?? '')) {
        throw new Error('Use --semester with a three-digit value, for example 261');
    }
    return { semester, dryRun: argv.includes('--dry-run') };
}
```

Use `node:readline/promises` for the username. For the password, temporarily override `stdin` data handling so typed characters are not written to `stdout`, restore terminal state in a `finally`, and never include either value in thrown errors or summary output.

- [ ] **Step 4: Implement orchestration and concise reporting**

```js
export async function runUpdate({ argv, prompt, crawl, validate, install, stdout, paths }) {
    const { semester, dryRun } = parseArguments(argv);
    const username = await prompt('MyBK username: ');
    const password = await prompt('MyBK password: ', { hidden: true });
    const result = await crawl({ username, password, semester });
    const counts = validate(result.subjects, { minimumSubjects: 1 });

    const installation = dryRun ? null : await install({
        subjects: result.subjects,
        subjectPath: paths.subjectPath,
        backupDirectory: paths.backupDirectory,
        minimumSubjects: 1
    });

    stdout.write(`Period: ${result.period.code}\n`);
    stdout.write(`hocKyId=${result.hocKyId} dotDKHocVienId=${result.dotDKHocVienId} dotDKId=${result.dotDKId}\n`);
    stdout.write(`Subjects: ${counts.subjectCount}; groups: ${counts.groupCount}\n`);
    stdout.write(dryRun ? 'Dry run: active files unchanged.\n' : `Backup: ${installation.backupPath}\n`);

    return { dryRun, ...result, ...counts, backupPath: installation?.backupPath, lmsStatus: 'skipped' };
}
```

Set default paths using `new URL('../../data_subject.json', import.meta.url)` only after confirming the active server data path; do not guess or silently target a second location. Print `LMS: skipped (best-effort enrichment is not implemented)` so the command does not imply an enrichment result.

- [ ] **Step 5: Add npm scripts**

Add to the root scripts:

```json
"update:teaching-schedule": "npm --prefix server run update:teaching-schedule"
```

Add to the server scripts:

```json
"update:teaching-schedule": "node src/scripts/updateTeachingSchedule.js"
```

- [ ] **Step 6: Run focused CLI tests and lint**

Run: `npm --prefix server test -- --runInBand tests/scripts/updateTeachingSchedule.test.js && npm run lint:server`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json server/package.json server/src/scripts/updateTeachingSchedule.js server/tests/scripts/updateTeachingSchedule.test.js
git commit -m "feat: add schedule update command"
```

## Task 5: Integrate optional LMS enrichment without blocking updates

**Files:**
- Modify: `server/src/services/dkmhCrawler.js`
- Modify: `server/src/services/teachingScheduleSnapshot.js`
- Modify: `server/src/scripts/updateTeachingSchedule.js`
- Test: `server/tests/scripts/updateTeachingSchedule.test.js`

**Interfaces:**
- Consumes: authenticated CAS credentials already held by the CLI process and active `server/data_lecturer.json` path.
- Produces: `tryEnrichLecturers({ username, password, subjects, lecturerPath })`, returning `{ status: 'updated' | 'skipped', reason?: string, lecturers?: Array }` without throwing for LMS access/discovery failures.
- `runUpdate` reports `lmsStatus` as `updated` or `skipped` and only installs an enriched lecturer file when the optional operation returns `updated` with a valid array.

- [ ] **Step 1: Write a failing non-blocking LMS test**

```js
it('installs a valid DKMH subject snapshot when LMS enrichment is unavailable', async () => {
    const install = jest.fn().mockResolvedValue({ backupPath: '/tmp/backup.json' });
    const result = await runUpdate({
        argv: ['--semester', '261'],
        prompt: promptForTestCredentials,
        crawl: crawlValidSubjects,
        validate: jest.fn().mockReturnValue({ subjectCount: 1, groupCount: 1 }),
        install,
        enrichLecturers: jest.fn().mockResolvedValue({ status: 'skipped', reason: 'LMS semester code unavailable' }),
        stdout: { write: jest.fn() },
        paths: { subjectPath: '/tmp/data_subject.json', backupDirectory: '/tmp', lecturerPath: '/tmp/data_lecturer.json' }
    });

    expect(install).toHaveBeenCalledTimes(1);
    expect(result.lmsStatus).toBe('skipped');
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm --prefix server test -- --runInBand tests/scripts/updateTeachingSchedule.test.js`

Expected: FAIL because `runUpdate` does not accept or report `enrichLecturers`.

- [ ] **Step 3: Implement best-effort LMS enrichment boundary**

Implement LMS login and discovery in a small private section of `dkmhCrawler.js` using existing config LMS URLs and the authenticated CAS flow. Do not calculate an LMS code from `261`; only accept a discovered, unambiguous code from LMS responses. For every network, authentication, parse, or ambiguity error, return `{ status: 'skipped', reason }`.

On success, normalize lecturer records to `{ name, email, phone }`, merge only missing names/contact fields into the current lecturer file, and validate that result is an array before installing it via a new atomic `installLecturerSnapshot` function in `teachingScheduleSnapshot.js`.

- [ ] **Step 4: Update CLI reporting and preserve DKMH success**

Call enrichment only after DKMH validation. Always install the subject snapshot when `--dry-run` is absent and DKMH validation passed, independent of LMS status. In dry-run, report the inferred enrichment status but write neither subject nor lecturer files.

- [ ] **Step 5: Run focused tests and server suite**

Run: `npm --prefix server test -- --runInBand tests/scripts/updateTeachingSchedule.test.js tests/services/dkmhCrawler.test.js tests/services/teachingScheduleSnapshot.test.js && npm run test:server`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add server/src/services/dkmhCrawler.js server/src/services/teachingScheduleSnapshot.js server/src/scripts/updateTeachingSchedule.js server/tests/scripts/updateTeachingSchedule.test.js
git commit -m "feat: enrich schedule lecturers from LMS"
```

## Task 6: Verify the command safely against the live flow

**Files:**
- Modify: `docs/superpowers/specs/2026-09-07-teaching-schedule-update-design.md` only if live behavior invalidates an approved design statement.

**Interfaces:**
- Consumes: completed `update:teaching-schedule` command.
- Produces: fresh local verification evidence; no code change is required when all checks pass.

- [ ] **Step 1: Run all static checks**

Run: `npm run lint && npm run test:server`

Expected: PASS.

- [ ] **Step 2: Run a live dry-run with an authorized account**

Run: `npm run update:teaching-schedule -- --semester 261 --dry-run`

Expected: interactive username/password prompts; output identifies an `HK261` period and reports live `hocKyId`, `dotDKHocVienId`, and `dotDKId`; active JSON files remain unchanged.

- [ ] **Step 3: Inspect dry-run output before replacing data**

Confirm that reported subject/group counts are plausible and spot-check a known course's lecturer, day, lessons, room, and weeks against MyBK. If parsing or data quality is wrong, stop and fix the specific parser evidence before executing a non-dry update.

- [ ] **Step 4: Run the live update only after dry-run approval**

Run: `npm run update:teaching-schedule -- --semester 261`

Expected: output names a backup file and the active subject snapshot is valid JSON. LMS status may be `skipped` without failing the command.

- [ ] **Step 5: Commit documentation adjustments only if required**

```bash
git add docs/superpowers/specs/2026-09-07-teaching-schedule-update-design.md
git commit -m "docs: clarify schedule update behavior"
```

Do not create this commit when documentation did not change.

## Plan self-review

- Spec coverage: Tasks 1–2 implement interactive DKMH discovery and crawling; Task 3 implements validation, staging, backup, and atomic replacement; Task 4 exposes the one-command local interface and dry-run; Task 5 implements optional LMS behavior; Task 6 supplies fresh static and authorized live verification.
- Placeholder scan: no unresolved placeholders or deferred implementation labels remain.
- Type consistency: `crawlTeachingSchedule` returns the IDs and subjects used by `runUpdate`; validation returns the counts displayed by the CLI; installer returns the backup path displayed by the CLI.
