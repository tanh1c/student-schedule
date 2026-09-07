# One-command teaching-schedule update

## Goal

Provide one local command to refresh the lecturer teaching-schedule snapshot for a selected term, for example:

```bash
npm run update:teaching-schedule -- --semester 261
```

The command obtains DKMH IDs at runtime, prompts for MyBK credentials without persisting them, crawls the available course schedule, validates the result, and updates the server data files only after validation succeeds.

## Scope

- Add a Node CLI under the existing `server` workspace and expose it through a root npm script.
- Reuse the MyBK SSO and DKMH request sequence already implemented by the backend.
- Find the registration period whose code begins with `HK<semester>`.
- Derive `hocKyId`, `dotDKHocVienId`, and `dotDKId` from live DKMH HTML responses.
- Crawl subject/group schedule data and generate the existing `data_subject.json` schema.
- Validate the staged snapshot before replacing production data.
- Preserve existing lecturer records; optionally enrich missing lecturer data from LMS.

Out of scope:

- Storing MyBK passwords or cookies.
- Running this process on a server, automatically on a schedule, or exposing it through the public web API.
- Replacing the UI registration flow.
- Changing the subject/lecturer API contracts.

## Command and authentication

The root command accepts a required `--semester` value such as `261`. It prompts interactively for MyBK username and password, with hidden password input. Credentials exist only in process memory.

The command fails before any data write if login fails, no matching DKMH period exists, or the DKMH IDs cannot be parsed.

## Data flow

1. Authenticate through HCMUT CAS and establish a DKMH cookie jar.
2. Fetch `dangKyMonHocForm.action` and parse registration rows.
3. Select the current/most relevant row whose code starts with `HK<semester>`; when several rows match, select an open row first, then the most recent row in the returned order.
4. Use the selected row's `ketQuaDangKyView(...)` argument as `hocKyId`.
5. Call `ketQuaDangKyView.action` and `getDanhSachDotDK.action`.
6. Parse both IDs from `getLichDangKyByDotDKId(this, dotDKHocVienId, dotDKId, ...)`. Missing IDs are a hard failure.
7. Initialize the selected registration period, request the full course list, then fetch each course's group detail.
8. Normalize the crawl output to the existing subject data schema.
9. Write staged JSON files inside a temporary update directory.
10. Validate staged files, then atomically replace the active subject snapshot. Preserve a timestamped backup.
11. Attempt LMS lecturer enrichment. If LMS semester discovery or enrichment fails, retain existing lecturer data and complete the DKMH subject update with a warning.
12. Print a compact summary: selected period, three runtime IDs, subject/group counts, validation status, LMS status, and backup location.

## LMS enrichment

LMS has a separate, undocumented semester code. The command must not infer it from `261` using a numeric rule.

It may inspect authenticated LMS search results to discover usable candidate codes. If no unambiguous code can be identified or LMS access fails, the command skips enrichment rather than blocking an otherwise valid DKMH update. Existing `data_lecturer.json` remains in place in that case.

When enrichment succeeds, it only adds missing lecturers or missing contact fields. Lecturer matching remains normalized-name based because the current schema has no stable lecturer ID.

## Safety and validation

Before replacement, require:

- Subject and lecturer files are valid JSON arrays.
- Every subject has a non-empty `id`, `maMonHoc`, `tenMonHoc`, and `lichHoc` array.
- Each class record has valid `dayOfWeek` (0–6), integer lesson values, and integer week values.
- The crawler found a non-zero number of subjects and groups.
- No unexpected major reduction relative to the active snapshot without an explicit future override option.

All writes use temporary files in the target directory followed by rename, so an interruption cannot leave a partial JSON file. No active snapshot changes if crawling, parsing, or validation fails.

## Integration boundaries

Extract the currently controller-local DKMH parsing/request logic into reusable backend services. The web controller continues to use the same service behavior; the CLI calls it directly. Parsing of `dotDKId` must replace the current fallback-to-`periodId` behavior with an explicit parse failure for the CLI path.

The CLI operates locally and does not require Redis, an active HTTP server, or a browser session.

## Verification

- Unit tests cover period selection, both DKMH ID parsers, schema validation, and rejected malformed/missing ID responses using current HTML fixtures.
- A dry-run mode crawls and validates staging output without replacing active data files.
- A manually authorized run against a valid account verifies that the command selects `HK261`, reports live IDs, creates valid staging output, and leaves production data untouched in dry-run mode.
