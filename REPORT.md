# Practice Work #10 — Smart Campus Risk Review & Agent-Readiness Audit

**Student:** Serik Dias · **ID:** 24B032021 · Nov 10, 2026

## Scope and evidence

The review covers the `practice9/` folder of the GitHub repo `Software-Engineering-` (branch `main`, downloaded as a ZIP on 10 Nov 2026). `AGENTS.md` and four screenshots were sent separately, because neither is in that repo.

- **Checkpoint:** the downloaded ZIP is the untouched copy. All runs and patches were made in a separate working copy.
- **Environment:** Linux sandbox, Node v22.23.4, `npm ci` from the committed lockfile. Re-run by the student on Windows: 42/42 passed, same build hash.
- **Labels:** *Confirmed* means seen in the code or reproduced. *Plausible / unverified* means likely but not reproduced. *Unsupported* means the code shows the claim is wrong.
- **Not run:** a Windows run of `scripts/replay.mjs`.

## Task 01 — Baseline

Before any change, all 38 tests in 3 files passed, the build succeeded, and the bug-replay script verified 7 of 7 trials. There is no `lint` script, and `npm audit` reports 3 vulnerabilities.

| Item | Location | Found |
| --- | --- | --- |
| README | `practice9/README.md` | Yes, 27 lines |
| AGENTS.md | README says "root AGENTS.md" inside `smart-campus/` | **Not in repo** (sent separately) |
| Tests | `src/booking.test.js` (26), `src/App.test.jsx` (8), `src/feedback-priority.test.jsx` (4) | Yes, 3 files, 38 tests |
| Package scripts | `package.json` | `dev`, `build`, `preview`, `test`, `test:watch`, `evidence:replay` |
| Lockfile / pinned deps | `package-lock.json`, exact versions in `package.json` | Yes |

| Command | Result (observed) |
| --- | --- |
| `npm ci` | exit 0 |
| `npm test` (`vitest run`) | **38 passed / 38**, 3 files, exit 0 |
| `npm run build` | exit 0, `index-D4eChlRj.js` 191.12 kB |
| `npm run evidence:replay` | 7/7 trials "verified", exit 0 |
| `npm run lint` | **Missing script**, exit 1 |
| type check | no command exists |
| `npm audit` | **3 vulnerabilities (2 critical, 1 moderate)**, exit 1 |

## Tasks 02–03 — Read-only risk review and challenge

The first review proposed 11 risks across 6 categories. After checking each one in the code, 7 are confirmed, 1 is plausible but unverified, and 3 are unsupported. No files were edited during this review.

| ID | Category | Finding | Evidence checked | Label |
| --- | --- | --- | --- | --- |
| R1 | Agent operations | `AGENTS.md` has no forbidden actions (deploy, push, network, secrets, editing tests) and no approval gate. It was also missing from the repo. | `AGENTS.md` lines 1–15. No AGENTS file in the repo, but README line 20 claims it is there. | **Confirmed** |
| R2 | Reliability | No lint, format, type check, CI or hooks. | `package.json` scripts. `npm run lint` → "Missing script", exit 1. No `.github/`. | **Confirmed** |
| R3 | Correctness | `bookingIssue()` checks the *request* times but not the *existing bookings*. A booking `{start: NaN}` or one with no `end` never overlaps, so the room is reported free (fails open). | `src/booking.js` lines 3–15. A probe returned `canBook` = `true` for a NaN booking. A new regression test failed 3 of 4 cases before the fix. | **Confirmed** |
| R4 | Privacy | Practice 09 test logs expose a real macOS username and an absolute Codex project path. | `evidence/01-before.txt`, `02-before-expanded.txt`, `03-after.txt`, line 6. | **Confirmed** |
| R5 | Security | Dev dependencies have known vulnerabilities: `tinypool` ≤ 2.1.1 (critical) and `@vitest/mocker` (moderate). | `npm audit` exit 1. The fix needs vitest 5 (breaking). Dev-only, not in the production bundle. | **Confirmed** (exploitability low) |
| R6 | Maintainability | Docs disagree with the code: README lists AGENTS.md and four screenshots (neither was in the repo); AGENTS.md says "two existing test files" (there are three); package name and footer still say Practice 08. | README lines 20–22, `AGENTS.md` line 3, `package.json` `name`, `App.jsx` line 72. | **Confirmed** |
| R7 | Verification evidence | Practice 09 before and after screenshots are the same file, so they cannot show a second check. | Same MD5 for each pair: desktop `f75e8fca…`, mobile `4e40b504…`. | **Confirmed** |
| R8 | Agent operations | `scripts/replay.mjs` links `node_modules` into a temp folder (a junction on Windows) and then deletes that folder recursively. A wrong delete could reach the real `node_modules`. | Lines 10, 15 and 40. Ran safely on Linux. Not run on Windows. | **Plausible / unverified** |
| C1 | Maintainability | "The form duplicates the booking rules." | `App.jsx` line 31 calls `bookingIssue()` and only maps the reason to a message. | **Unsupported** |
| C2 | Correctness | "End time `24:00` is parsed wrongly." | `toMinutes()` line 10 maps `24:00` to 1440. UI07 (`24:00` accepted) and UI08 (`24:01` rejected) pass. | **Unsupported** |
| C3 | Correctness | "Feedback priority is untested." | `feedback-priority.test.jsx` has 4 multi-failure cases, all passing. Only the docs miss the order. | **Unsupported** |

## Task 04 — Risk register

The top two risks to act on are **R4** (a username leaked in submitted evidence) and **R1** (AGENTS.md with no guardrails). R2 also scores 6 but ranks third because nothing is leaking or being acted on yet. Score = likelihood (1–3) × impact (1–3). Owner for every row: Serik Dias.

| Rank | ID | Category | Cause → event → consequence | Component | L | I | Score | Mitigation | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | R4 | Privacy | Logs captured with absolute paths → a username is published in `evidence/` → breaks the "no real personal data" rule | `evidence/01–03`, `scripts/capture.mjs` | 3 | 2 | 6 | Redact the 3 logs; `capture.mjs` replaces the project path with `<project>` | `grep -rn "Users/" evidence` is empty; a new capture shows `<project>` |
| 2 | R1 | Agent ops | No boundaries or approval gate, file not in repo → agent pushes, deploys or edits tests → unreviewed change | `AGENTS.md` | 2 | 3 | 6 | Add Boundaries + Review gate (Task 06 patch); commit the file into `smart-campus/` | Each Task 06 constraint maps to a line |
| 3 | R2 | Reliability | No lint, type check or CI → style and type errors not caught → regressions merge | `package.json`, CI | 3 | 2 | 6 | ESLint + `lint` script; CI running `ci`, `lint`, `test`, `build` | CI log green |
| 4 | R3 | Correctness | Booking times not validated → malformed booking ignored → room shown as free (fail open) | `src/booking.js` | 1 | 3 | 3 | Reject non-finite booking times (fail closed) + regression test | `booking-regression.test.js` fails before, passes after |
| 5 | R6 | Maintainability | Docs not updated with the code → wrong file list, test count and practice number → reviewer is misled | README, AGENTS.md, `package.json`, footer | 3 | 1 | 3 | Fix README list and AGENTS.md test count; leave the footer (AC6 keeps labels) | Re-read the docs against `ls` |
| 6 | R7 | Evidence | Screenshot copied instead of re-taken → "after" proves nothing new | screenshots | 3 | 1 | 3 | Re-take after-screenshots after any change | Different hashes + dated screenshots |
| 7 | R8 | Agent ops | Junction + recursive delete on Windows → delete follows into the real `node_modules` | `scripts/replay.mjs` | 1 | 3 | 3 | Run replay on Windows once in a copy, or copy instead of linking | `node_modules` intact after a Windows run |
| 8 | R5 | Security | Old vitest/tinypool → known CVEs in the test runner → risk on dev machines and CI | dev dependencies | 1 | 2 | 2 | Upgrade to vitest 5 in a separate change (breaking) | `npm audit` shows 0 critical |

## Task 05 — Agent-readiness audit

**Assigned level: Level 1, partial.** Tests and pinned dependencies are strong, but the formatter, linter and type check that Level 1 requires are missing. Some Level 2 and Level 3 items exist (integration tests, replay evidence), but they do not lift the level while the baseline is incomplete. The levels are used as an audit rubric, not as a certificate.

| Level | Requirement | Evidence | Status |
| --- | --- | --- | --- |
| 1 | Formatter | none | Missing |
| 1 | Linter | `npm run lint` → Missing script | Missing |
| 1 | Type checks | plain JS/JSX, no `tsc` or `checkJs` | Missing |
| 1 | Unit tests | 26 rule tests, all passing | Met |
| 1 | Pinned dependencies | exact versions + `package-lock.json`, `npm ci` exit 0 | Met |
| 2 | `.env.example` | none; the app reads no env variables | Not needed |
| 2 | Architecture notes | README + 1 paragraph in AGENTS.md | Partial |
| 2 | AGENTS.md | now committed in `smart-campus/`; gaps listed in Task 06 | Partial |
| 3 | CI | no `.github/workflows` | Missing |
| 3 | Hooks | none | Missing |
| 3 | Integration checks | `App.test.jsx` renders the real form with the real rules, 8/8 pass | Met |
| 3 | Reviewable evidence | logs, build log, replay, diff; Practice 09 logs leaked a username (R4) and screenshots were copies (R7) | Partial |

The README run steps are accurate: `npm ci`, `npm test` and `npm run build` worked exactly as written. The folder layout is clear (`src/`, `scripts/`, `evidence/`). The build is reproducible from the lockfile.

Missing evidence: a formatter config, a lint config + script and a type-check command (Level 1); a CI workflow and a pre-commit hook (Level 3).

## Task 06 — AGENTS.md audit and proposed patch

`AGENTS.md` fully covers 2 of the 6 required constraints, partly covers 2 and is missing 2. **The patch below is a draft and has not been applied**; it waits for approval (`evidence/agents-md-proposed.diff`).

| Constraint | Where in AGENTS.md | Status |
| --- | --- | --- |
| One fictional room | line 3 "one fictional room on a fixed day" | Covered |
| No login / database | line 11 "Exclude login, backend, storage" | Covered |
| Preserve AC1–AC6 | Rules list AC1–AC6; line 14 "Keep every existing assertion" | Partial: the AC6 priority order is not written down |
| No secrets | — | Missing |
| No external deployments | — | Missing (also no ban on push or network) |
| Run tests before proposing acceptance | line 14 "Report … observed test results" | Partial: no required order, no rule against reporting unrun tests |

Conflicts and out-of-date rules:

- **Test count.** Line 3 says "two existing test files", but there are three (`feedback-priority.test.jsx` was added in Practice 09).
- **Location.** The Practice 09 README placed AGENTS.md in `smart-campus/`, but it was not in that repo, so an agent working from a clone never saw it.
- **Priority not written.** The real order lives in `bookingIssue()` and `feedback-priority.test.jsx`; the rules file should state it too.
- **"At most two justified patterns"** names no patterns, so it cannot be checked.

```diff
 # Smart Campus room availability
 
+Read this whole file before any edit.
+
-A student checks ... The two existing test files cover the rules and form. ...
+A student checks ... The three existing test files cover the rules, the form and feedback priority. ...
 
 ## Rules
 ...
 - AC6 preserves the labels, feedback wording and priority, and desktop and mobile layout.
+  Priority: invalid time > end not after start > start not after now > over 120 min > blocked > overlap.
+- AC1–AC6 are fixed. Do not weaken, delete or rewrite them or their tests.
 ...
 
+## Boundaries
+- No secrets, API keys or real personal data in code, fixtures, tests, logs or commits.
+- No deployments, publishing, `git push`, or network calls beyond `npm ci`.
+- Do not edit the demo fixture (now 540, booking 600–660) unless asked.
+- Work on a separate branch or worktree; never commit to main.
+
+## Review gate
+- Run `npm test` and `npm run build` before proposing a change; paste the real output.
+- Never report a test as passed unless it ran. List any check not run.
+- Show the diff and wait for human approval before applying or merging.
```

## Tasks 07–08 — Verification and two mitigations

Two confirmed risks were fixed: R4 (privacy) and R3 (correctness). After the fix, 42/42 tests pass, the build succeeds and replay is still 7/7. R1 waits on the AGENTS.md approval; R2 needs new dependencies, so it is not a minimal patch.

| Check | Before | After |
| --- | --- | --- |
| `npm test` | 38 passed / 38 (3 files) | **42 passed / 42** (4 files) |
| New `booking-regression.test.js` | 3 failed, 1 passed (room shown as free) | 4 passed |
| `npm run build` | exit 0, JS 191.12 kB | exit 0, JS 191.20 kB (`index-DjueLmMG.js`) |
| `npm run evidence:replay` | 7/7 verified | 7/7 verified |
| `grep -rn "Users/" evidence` | 3 hits (line 6 of 01–03) | 0 hits |
| Manual UI check, desktop | — | Available for 11:00–12:00, booking 10:00–11:00 still shown (screenshot dated 10.11.2026 23:35) |
| Manual UI check, mobile 390 px | — | One column, "Room blocked" → Unavailable with the blocked message |

### Diff 1: R3, fail closed on malformed bookings (`src/booking.js`)

```diff
   if (blocked) return 'blocked';
+  // Malformed existing data must not make the room look free (fail closed).
+  if (!bookings.every(b => Number.isFinite(b.start) && Number.isFinite(b.end))) return 'invalidTime';
 
   // Intervals are [start, end), so equality at either endpoint is allowed.
```

The check sits after `blocked`, so the feedback priority (AC6) does not change. The demo fixture is valid, so the UI never reaches this branch. The Boolean `canBook` interface is kept.

### Diff 2: R4, remove the local path from evidence (`scripts/capture.mjs` + 3 logs)

```diff
+// Do not publish local usernames or absolute paths in evidence logs.
+const redact = value => (value || '').replaceAll(process.cwd(), '<project>/smart-campus');
-...${run.stdout || ''}${run.stderr || ''}...
+...${redact(run.stdout)}${redact(run.stderr)}...
```

### Residual risk

| ID | Before | After | Evidence |
| --- | --- | --- | --- |
| R4 | 3 × 2 = 6 | 1 × 2 = 2 | 0 grep hits, redacted capture; still present in the old Practice 09 repo history |
| R3 | 1 × 3 = 3 | 1 × 1 = 1 | regression test fails before and passes after; a non-array `bookings` still throws (not reachable from the UI) |

Rejected as out of scope: changing the "Practice 08" footer (AC6 keeps labels) and upgrading vitest (breaking).

## Task 09 — Background agent thought experiment

A background agent may work alone on its own branch, but nothing it produces reaches `main` without a human reviewing its evidence.

- **Isolation:** its own git worktree on branch `agent/<task>`. No shared dev-server port (`npm run dev -- --port 0`, or no server). No database exists, and none may be added.
- **Permitted files:** `src/booking.js`, `src/App.jsx`, the existing test files, and new test files in `src/`.
- **Permitted commands:** `npm ci`, `npm test`, `npm run build`, `npm run lint`, read-only `git status/diff/log`.
- **Prohibited:** `git push`, merge or rebase onto main, deploy or publish, network calls beyond `npm ci`, editing `AGENTS.md`, the fixture or CI config, deleting or weakening assertions, adding dependencies, secrets or real data.

Required evidence before review:

1. The full diff against the branch point.
2. Raw `npm test` output, with every AC1–AC6 test listed.
3. `npm run build` result (exit code + output size).
4. A review note: what changed and why, files touched, risks left, and any check **not** run.

Before merging, a human reads the diff, re-runs the tests locally or in CI, checks the UI at desktop and mobile width with new screenshots, and approves. There is no deployment target (no external deployments), so a merge ends at `main`.

## Release decision

**Go — merge to `main`.** Tests (42/42), the build and replay pass, the manual desktop and mobile check passed, and no critical risk remains in production code.

Accepted with follow-ups: R1 (apply the AGENTS.md patch after approval), R2 (lint, CI), R5 (vitest upgrade), R6 (docs drift), R8 (Windows replay).
