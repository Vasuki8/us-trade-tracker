# Code-check trigger efficiency

The Code checks workflow retains complete PR checks, main-branch push checks and all tag push checks. Feature-branch pushes no longer launch a second copy of the PR job. A feature branch receives remote checks once its PR opens; existing local checks remain available before that point.

| Event | Code checks policy |
| --- | --- |
| PR opened, synchronized or reopened | Full existing job; no new branch/path/job filter |
| Push to main | Full existing job |
| Push of a tag, including a name containing a slash | Full existing job; explicit tags: ['**'] filter |
| Push to another branch | No separate push run; its PR still receives full checks |

Only the push filter changes. The job name, contents-read permission, disabled credential persistence, fixture mode, Python setting, pinned actions, runner, Node version, test commands, artifact policy and 15-minute deadline are unchanged. No cancellation rule, path filter, cache, dependency or new event was added.

## Local checkpoint — October 23, 2026

The prior PR #147 head had both push and PR executions. Its duplicate push attempt was cancelled during slow browser-system-package downloads; the complete PR pipeline and unchanged push retry passed. Those observations support removing redundant work. They do not demonstrate a need for a different runner or timeout, or promise that external download delays will disappear.

The new push policy was checked with the existing YAML parser. Restoring only on.push in an in-memory copy produced the entire baseline workflow exactly, including every job and permission. The baseline policy check failed before editing, then the approved policy and unchanged-remainder checks passed. This is configuration verification, not a simulation of GitHub event delivery.

Before and after the change, all 15 existing workflow-runtime checks passed. The 18-test Python workflow suite completed with 17 passing and its existing POSIX-only deadline check skipped on Windows. No test, assertion or skip condition was changed. The complete required Linux pipeline must execute that POSIX control as well as the full unit, compiler, fixture-build and browser checks.

## GitHub acceptance and limits

The implementation PR carries the actual branch observation window, exact-head PR CI, review disposition, merge/tree binding, main push CI and completed cleanup. This document records the local checkpoint; it does not claim those later outcomes in advance. The final PR closeout also completes the execution plan's integration checklist.

An observed absence of feature-branch runs is limited to its recorded window. The policy inspection, an actual complete PR run and an actual complete main run supply the acceptance evidence together. Tags are checked by policy and [GitHub's documented branch/tag filtering](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onpushbranchestagsbranches-ignoretags-ignore); this work creates no test tags and claims no live tag exercise.

This batch changes the named workflow and documentation only. Existing accepted data, private R2 archives, public website packages and deployment 16b5e4f3 retain their existing state. No data job, source request or site publication is part of this checkpoint.
