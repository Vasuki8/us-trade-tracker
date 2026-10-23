# Browser setup containment

The Code checks workflow prepares Chromium, Firefox and WebKit before expensive application checks. Its unchanged installer has a three-minute step limit; the whole job has a twenty-minute limit. Installation failure fails the job. Every existing packaging, workflow, unit, compiler, build and browser check remains required.

This is failure containment, not a repair to the external Ubuntu package mirror. A slow but progressing installation can exceed the setup limit; a later hung job can run five minutes longer than the previous overall limit. No automatic retry, test skip or continue-on-error was added.

## Evidence behind the budgets

The reviewed baseline is ac0335669902879c60bb25acc8276cea3ced7f73. During Mexico publication, [PR #150's initial run](https://github.com/Vasuki8/us-trade-tracker/actions/runs/40024557537) reached the fifteen-minute job deadline while downloading browser prerequisites. [PR #151's initial run](https://github.com/Vasuki8/us-trade-tracker/actions/runs/40033143332) was cancelled after setup had stalled for over six minutes, before browser assertions. Both unchanged-head reruns later passed; the failed attempts remain failed.

Four retained successful logs measured approximately 35–50 seconds for setup, 204–210 seconds for unit tests and about eight minutes for the two browser commands together. Complete successful log spans were 747–813 seconds. These group-to-next-group estimates include logging overhead and are not separately instrumented process timings. The three-minute setup allowance and twenty-minute job allowance leave headroom without permitting indefinite setup.

The existing runner, action pins, Node 24, Python setting, fixture mode, read-only permissions, PR/main/tag triggers and npm cache stay unchanged. Browser/test versions, individual deadlines, workers, assertions, retries and failure-artifact policy also stay unchanged. No container or browser cache is added; [Playwright's CI guidance](https://playwright.dev/docs/ci#caching-browsers) notes that caching browser binaries would not cache Linux system prerequisites.

## Verification boundary

The implementation PR will record the exact tested head, configuration comparison, focused local results, complete PR/main results, actual setup/job times, review and cleanup. Those integration outcomes are not claimed in advance here. Reversing only the approved placement, step name and two deadlines must reproduce the entire parsed baseline workflow.

This checkpoint changes the named workflow and documentation only. It does not update accepted data, Mexico comparison eligibility, private R2 archives or the public website. Existing data and the verified deployment 3697e575 package are checked read-only. The unrelated September proposal and Mexico private-acceptance checkout are preserved.

## Local checkpoint — October 23, 2026

The isolated workflow matched the pinned baseline before editing. The new policy comparison rejected that old configuration, then passed after the exact approved edit. Normalizing only installer placement/name/deadline and the job deadline reproduced the complete parsed baseline workflow.

All fifteen existing workflow-runtime cases passed before and after the edit. Python retained-workflow checks passed 17 cases with their preexisting POSIX-only deadline case skipped on Windows; that eighteenth case remains required on Linux. No test file or assertion changed. All fifteen accepted data inputs, dependency files, the unrelated September proposal and retained public ZIP/manifest matched their recorded identities read-only.

The final PR closeout supplies subsequent whole-branch review, full Linux CI, merge/main verification and actual worktree cleanup. These local checks alone do not establish those later outcomes or eliminate future infrastructure stalls.
