# Archived public PR #363 — compact checkpoint comparison (historical source)

**ARCHIVE ONLY — NOT ACTIVE PRODUCT CODE OR APPROVED UI.** Original source PR: `#363` (`8a4f64e3849d9755b0c2ddf9bce3de284116a00c`). Copied **byte-for-byte** under `source/` with the original repository-relative paths so future work can inspect the implementation and tests without reopening PR #363.

## Preserved public behavior

- Present `Continue` vs `Start new Echo` as two alternatives; show future **net Tuners** supplied by the provider.
- Treat `SIMILAR_TUNER_COST`, `UNCERTAIN` and missing qualified results as neutral, rather than fabricating a recommendation.
- Allow a highlighted action only when supplied versioned comparison evidence supports it; don't calculate a winning threshold in the browser.
- Show no more than one supported advantage per alternative; gate any `5/5` label on supplied source-qualified five **stat types**, not a guaranteed DPS or perfect rolls.
- Keep costs, uncertainty, bounds and stock under a compact `Details` disclosure; preserve old-service behavior and blocked-state handling.

## Current status and boundaries

The active PR #365 already has some Continue/Start new Echo presentation, but that is **not proof of equivalent active behavior**. Do not replace its actual Improve layout or import this archived UI/CSS wholesale. Owner approval of exact before/after visuals and copy is required before any product-visible change.

The distinct versioned **calculation/comparison provider** is in **private** repository Draft PR `#46`, not in this public PR and not merged to private `main`. Preserve private execution and policies privately; **never copy private engine algorithms into the public repo**. Paired public/private compatibility and actual-browser behavior are pending. This public snapshot is review/reference material, not a live implementation.

Original source files retained:
- `source/docs/ui-lab/INTERACTIVE_ECHO_ADVICE.md`
- `source/docs/ui-lab/v1.1/modules/echo-advisor.js`
- `source/docs/ui-lab/v1.1/modules/improve-decision-view.js`
- `source/docs/ui-lab/v1.1/sandbox.css`
- `source/test/checkpointCompactPresentation.test.mjs`

No product source, private engine, builds, UI styling, tests or runtime assets are activated by this archive.
