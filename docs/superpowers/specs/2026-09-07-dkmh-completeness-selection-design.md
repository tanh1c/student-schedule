# DKMH completeness-based period selection

## Goal

Select the most complete available DKMH registration period for a requested semester before crawling lecturer schedule data. For `261`, the command must evaluate every `HK261_*` period rather than assuming `D1` or choosing the currently open period.

## Selection flow

1. Fetch and parse all registration periods from `dangKyMonHocForm.action`.
2. Keep every period whose code starts with `HK<semester>`.
3. For each candidate, initialize its DKMH state using its live `hocKyId` and parsed `dotDKHocVienId`/`dotDKId`.
4. Call `searchMonHocDangKy.action` for that candidate and count successfully parsed courses.
5. Choose the candidate with the greatest course count.
6. Crawl group details only for the selected candidate.
7. Print the candidate report and selected period before the final subject/group totals.

Example:

```text
HK261_D1: 1892 courses
HK261_D2: 1905 courses  <- selected
HK261_AVNV2: 10 courses
```

## Rules

- Never use open/closed status or suffix (`D1`, `D2`, `D3`) as a completeness proxy.
- Do not merge data across periods. Different registration periods may apply to different student populations and produce duplicate or conflicting groups.
- Candidate setup failures are reported in the candidate summary and excluded from selection; they do not stop comparison of other candidates.
- If every candidate fails setup or yields zero courses, terminate without staging or replacing active data.
- A tie is resolved by the order DKMH returns candidates.
- The existing command remains dry-run by default; `apply` is still required to replace data.

## Verification

- Unit test covers multiple `HK261_*` periods where an open period has fewer courses than a closed period, and asserts the largest result is selected.
- Unit test covers failed/empty candidates and asserts a non-empty candidate can still win.
- Dry-run output lists each candidate and course count before confirming the selected period.
