# Browser compatibility checkpoint

Local assessment: October 16, 2026. **Compatibility acceptance is partial.** Successful final CI, integration and actual cleanup are recorded in the associated PR/private closeout; no pending step is claimed in advance.

A separate Playwright configuration runs the existing 24 profile cases in Firefox and WebKit: 48 additional CI cases, not a multiplication of the entire browser suite. It imports the existing loopback/server/use settings, restricts the three owning files, keeps one worker and uses zero retries. The ordinary Chromium suite stays unchanged. CI installs only builds selected by the existing Playwright 1.64.0 lock; no package/action upgrades, job, permission or timeout change.

## Local results and the open gate

Windows 11 build 26300/AMD64; pinned distribution metadata: Chromium 156.0.8078.4 / revision 1248, Firefox 157.0 / revision 1555, WebKit 27.2 / revision 2370.

- All 24 existing Chromium control cases passed.
- All 24 WebKit fixture cases passed with no skipped/flaky cases or retries.
- All 16 retained-package WebKit journeys passed: four duty CSV selections, four product/direction ranking CSVs, both mobile/static profiles, changes/Canada coexistence and private404s. Eight CSV downloads matched authenticated retained expectations. Both duty and merchandise PNGs were 1920x1080 and visually checked with source/qualification text; mobile keyboard focus/scroll remained usable. No page errors or external/source requests occurred in that harness.
- All 24 Firefox fixture cases failed **before page creation** with `browserType.launch: spawn UNKNOWN`. A direct launch reported Windows side-by-side activation failure; Firefox-specific Application events identify unresolved private assembly `mozglue,version=1.0.0.0`. The DLL exists. One clean official reinstall of the same locked build produced identical executable/DLL hashes and the same launch failure. This establishes host launch unavailability, not a website failure.
- The 16 planned retained Firefox journeys were unexecuted after that failed launch preflight; they are not passes. No silent skip, weakened assertion, OS/security change, browser binary patch or alternate version was used. Initial complete outcomes, installer/launch diagnostics and two representative failure traces are preserved.
- Astro/TypeScript reported zero errors, warnings or hints. Application code, fixtures and existing test assertions remain unchanged; the keyboard helper has one evidenced portability correction described below; no runtime repair was justified. A ceremonial full local unit rerun was avoided; normal CI retains the full unit suite.

Linux CI must independently execute all 48 cases successfully on the exact final head before this test tooling can merge. Linux success cannot establish Firefox compatibility on this Windows host or replace the unexecuted retained Firefox checks. Full browser acceptance remains open until those checks run in an authorized working environment. This checkpoint does not certify stock Safari, all Firefox versions, real devices, screen-reader execution or participant usability.

## Retained source and data

The retained site is the already-published PR117 package, source `b77cb8a6d6d69e352123c0e4baf6e8b13381bcf8`. ZIP SHA256 `6e63391ecc9ebe3c22432f69f620bf1e5f6d443dded47600062c92957346a283`; manifest SHA256 `7b57293e1c354c1d384ede45ef9636d73058ab3cb38f48f0e396f8db61f948dd`. Only ZIP/manifest were copied (419,171 bytes), then all 31 entries /1,893,276 raw bytes verified before extraction and local serving. Its historical source is not relabeled with this new tooling commit.

All seven accepted/eleven protected input identities remain exact. All 139 retained CSV identities and the separate Canada projection were authenticated from PR117 proof; this is historical byte authentication, not a new serializer/source replay. The extra28 group retains its indirect original producer-binding qualification. No accepted-data staging copies, new package, import, data change or R2 operation occurred.

`runtimeChanged=false`: publication is neither required nor authorized by this branch's no-runtime path. The existing deployment remains unchanged; no new live verification or restoration is claimed. Bounded private proof is under ignored `data/backups/browser-compatibility-checkpoint/verification-20261016-r1`.

Owner-run task observations and a real successive official release remain strategic gates. No new source validity, demand or broader market coverage is established here.

## CI failure diagnosis and bounded test correction

The first push CI run passed all 200 ordinary browser cases, then reported 47 compatibility passes and one Firefox mobile keyboard-traversal failure. The preserved trace shows that the helper sent 54 forward Tabs using a count of 53 explicit focus candidates; the intended enabled CSV control precedes the country picker. That count is not a portable model of a browser's full focus cycle. The owning test now takes the short reverse keyboard path from that picker to the CSV control. It still uses real keyboard input and preserves every assertion, timeout, retry policy and download check; no application code changes. The affected case passes in Chromium and WebKit locally, with Linux Firefox/full-suite success remaining a CI gate.

The separate first PR CI run failed in the original Chromium history case before reaching compatibility. That unchanged history case passed in isolated local reproduction. Both original failed runs and the representative Firefox trace remain preserved; neither is counted as a pass. Only successful new-head push and PR runs can satisfy integration.

The independent whole-branch review covers commit `83114956125d91fa14326ac6a21ea6bed82e1d5b`. The later CI-discovered owning-test delta is root-verified by the preserved failure, focused checks and final CI, following the single verified fix-pass rule; it is not represented as an additional independent review.