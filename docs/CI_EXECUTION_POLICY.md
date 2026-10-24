# Risk-based CI scheduling audit

Audited before editing triggers on 2026-10-24. Public main already restricts
Verify push events to main and splits Draft FAST from final FULL. It does not
have private Foundation's push-plus-PR duplication. However its FAST job still
runs broad source audits, many domain suites, a strict full build and artifact
upload; UI Lab Review independently runs broad Chromium on matching Draft PRs.
Unrelated label events can also relaunch verification on an unchanged head.

## Required checks and preserved final verification

Public main's rules API currently returns deletion/non-fast-forward protections
and a pull-request requirement, with no required_status_checks entry. Classic
branch-protection configuration read is unavailable (403). Do not infer an
unprotected branch or modify repository settings. Process v2 independently
requires successful exact-head FULL, browser gates and matching web/visual
artifacts before merge. Keep the `verify`, `fast`, `review` and deployment job
names. A green FAST or skipped FULL is not final verification.

The complete FULL Verify body, complete UI Review body and main FULL→verified
artifact→Pages deployment chain remain unchanged. Deployment continues to require
separate owner GO before its triggering main merge. No private source or runtime
is introduced into public Actions.

## Scheduling correction

Draft FAST checks only changed-file syntax/JSON/whitespace and a bounded set of
directly affected self-contained unit tests. It reports risk and deferred tests;
it does not claim source/gameplay correctness or produce a release build. Tests
needing pinned external checkouts/dependencies and broad build/browser evidence
remain FULL requirements. The existing normal local focused workflow continues.

UI Review runs for Ready candidates, explicit full-verification opt-in and manual
review; ordinary Draft pushes no longer automatically run broad Chromium. Add
ready_for_review and label events so the final review cannot silently disappear.
Unrelated labels allocate no runner. Other path/branch-scoped import and source
capture workflows remain unchanged; they are not general feature-push triggers.

The final-candidate label is sticky: remove it before active Draft iteration.
Before merge, require FULL Verify and applicable UI Review success on the exact
head, not a previous FAST artifact. After an approved main merge, its new merge
commit receives automatic FULL and the existing Pages deployment gate. No CI
result or deployment authorization is fabricated by the scheduling change.

## Active M0 integration

This candidate carries the isolated CI correction before further runtime changes.
M0 FULL job step bodies and source pins remain unchanged. Run only focused CI
contract tests during the exhausted quota. When Actions are available, request
one coordinated final exact-head public FULL/UI review and private FULL, including
the existing private prerequisite conjunction. Do not re-run unchanged historical
benchmarks or Windows launcher checks unless their inputs changed. The final
proof must cover the eventual deployment inputs; current FAST is not that proof.
