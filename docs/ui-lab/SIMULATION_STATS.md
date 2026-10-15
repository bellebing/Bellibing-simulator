# Simulation Stats

The existing right panel has Character Stats and Simulation Stats modes. Character Stats uses the approved Elegant Hero by default, saved-equipment presentation, expandable Skills and saved value column. `?hero=baseline` and `?hero=cinematic` remain reviewable; the earlier implementation is recoverable in git.

Simulation Stats is a separate result view in the same outer panel. Twelve canonical Character stat rows use a name followed by three aligned values. At narrow panel widths, each row becomes three labeled lines. There is no inner scroll region. Wide panels grow to 24% of the composition, capped at 480px. The Workshop retains its 1000px minimum. The measured layout gap participates in the fit calculation. At 1440px the established last-interacted side-panel priority applies: opening one expanded side panel compacts the other. Both modes share identical outer dimensions.

## Data ownership

- `tools/export-targets.mjs` calls `projectCharacterTargetPresentations()` from the canonical source-verified modern DEFAULT Calc contract. `modules/targets.js` is generated; `--check` detects drift. General recommendations, Prydwen and legacy scenarios never fill missing rows. Exact source references survive beside formatted values.
- `modules/simulation-model.js` binds canonical result identities to the existing saved-stat row order. Recommended, Expected and Simulated never substitute. Missing values are null, displayed as an em dash with an accessible unavailable label/tooltips. Observed zero is retained.
- Expected is unavailable in normal operation. No evaluator, probability, resource spending or expected-outcome engine is implemented.
- Simulated uses the existing second-column illustrative record only after `hasRecordedRun`; it is visibly identified as an illustrative run. It is never the Character Stats saved column.
- Demonstration → **Illustrative focus demo** enables `result-fixtures.js`: eight explicitly illustrative CRIT Rate keyframes and one affected Expected result ID. They are not computed from minimum roll amounts and have no domain authority. Other Characters and actions have no supplied numerical relationship.

## Contextual focus contract

`present(nextModel, affected)` accepts an external presentation and explicit `{id, role}` result identifiers. Value changes without an affected relationship update plainly. A relationship without a real changed, available value never animates. Unknown/new unsupported relationships remain inactive. This interface supports future resource/feasibility, Sonata, Gate, Hard/Flex and Character Target producers without declaring that each action changes a Character statistic.

The fixture adapter responds to CRIT Rate slider input only, using an explicit control-to-canonical-metric binding; no displayed-text matching. Only its Expected cell and owning row gain focus. Unrelated result rows recede slightly; Echoes, saved stats and the Workshop never dim or highlight. A short eased counter retargets from its current displayed value during dragging, followed by one small vertical settling motion and a fade. Reduced motion updates instantly with static emphasis. Keyboard input follows the same path; live announcements are debounced.

Editing reveals Simulation Stats once per session without expanding a compact panel or moving keyboard focus. A manual mode choice takes precedence for the remainder of the session. The explicit demo toggle intentionally reveals and opens results for review. Neither mode switching nor focus writes equipment, settings, simulation or persistence state.

## Verification

`review-results.mjs` exercises real slider dragging, keyboard input, mode control, explicit demo opt-in, unsupported dependencies, recommendation gaps, recorded-run boundaries, Character switching and side-panel states in Chromium at 1440, 1920 and 2560px, including ordinary and reduced motion. The existing Card, Hero, Carousel, Workshop, Echo, history and permission tests remain in the review runner. No media or downloadable bundles are generated.
