# Improve Settings — isolated UI Lab

`modules/improve-settings.js` owns the compact controls; `settings-state.js` owns the memory-only configuration. Production persistence, policy, evaluator and defaults are untouched. The preceding PR revision remains recoverable in git.

## Available Resource Inventory

`modules/resource-state.js` creates one page-owned inventory outside all Character and simulation records, using the existing pure `docs/assets/resourceInventory.js` implementation of `src/resourceInventory.ts`. It starts at the canonical explicit-zero budget. `resource-inventory.js` displays Echoes, Premium Tuners and four source-owned Tube identities with the verified `resource-icons` assets. Direct input commits on Enter or blur, formats Unlimited as ∞, and atomically rolls back invalid drafts to the previous valid quantity with an accessible local error. Escape clears a rejected draft.

Character selection, right-panel modes, side-panel collapse, Recommended and Character Reset preserve this shared inventory. Reload clears it; no production persistence is connected. Available quantities and illustrative Materials Used records are independent: neither SIMULATE nor inventory edits deduct or rewrite the other. Budget editing does not invent Expected/evaluator effects. `review-resources.mjs` verifies these interactions at the three desktop widths without media artifacts.

## Canonical inputs and ownership

`tools/export-settings.mjs` exports all 13 canonical `StatName` identities and exact minimum tiers from `src/echoCoreRules.ts`, existing `improveRollControl` labels and the source-owned `selectedFlexRequirement` presentation function. `settings-catalog.js` is generated, with CI parity. Canonical StatName strings are IDs in the source domain; placement never parses visible labels. Probabilities/evaluator code are excluded.

Each ID occurs once in Hard Requirements, Flex Stats or Other Stats. Moving to Other deactivates that row while retaining its tier. Reactivation restores it. Native drag reorders/moves rows, and handle-focused Alt Left/Right cycles sections; Alt Up/Down reorders. Range gestures own the pointer and cannot initiate a row drag. Inactive rows have no minimum slider.

The newly approved Lab-only Augusta arrangement is CRIT Rate / CRIT DMG Hard Requirements, ATK% / Heavy Attack DMG Flex, Flat ATK first in Other, followed by the remaining canonical inactive rows. Explicit Flex count starts at one of two. Other Characters start with no invented active requirements or count; Recommended is unavailable. Edits preserve the complete existing configuration and enter Customize. Recommended resets the approved Lab arrangement, tiers, count and optional ER setting; Gate/scope remain. Full Reset restores the selected Character's entire demonstration state. State is isolated per Character and discarded on reload.

Flex uses the canonical selected-pool/substat-capacity maximum. A move never clamps the stored count. An infeasible count remains visible with `aria-invalid` and a validation message; direct slider/key selection repairs it explicitly, including selection of an already displayed clamped endpoint. A missing count stays unconfigured rather than becoming implicit any-of/all-of.

## Optional conditional ER Target

The target uses total Character ER percentages, separate from per-Echo minimums. It starts disabled and unconfigured. The verified modern DEFAULT Calc ER reference is a suggestion only; explicitly enabling it can adopt that suggestion. Missing suggestions remain unconfigured. Manual per-Echo ER requirements remain independent of this conditional objective.

`erTargetPresentation({characterId,target,total,allowIllustrative})` returns disabled, unconfigured, unavailable, outstanding or reached, plus total/provenance. Reached requires a finite nonnegative configured target and an owned, verified finite total. The UI never projects a total, infers one from requirements or treats an illustrative run as verified. `presentER(total)` is the future external verified-projection presentation boundary; no such producer is connected in normal Lab operation.

Demonstration → ER total preview supplies two explicitly illustrative Augusta values from the existing record (118.4% and 126.8%). The badge and total label identify them as demonstration data. They require explicit fixture opt-in, never write saved Character Stats and do not change acceptance semantics. A reached target folds to its compact header; editing can reopen it, and a subsequent below-target total restores the outstanding editor. Disabling removes the objective. Unsupported/missing totals remain neutral.

Settings edits emit explicit presentation actions to the existing Contextual Focus component. Only its established CRIT Rate illustrative relationship animates Expected. Placement, count and ER edits do not invent numerical dependencies or forecasts.

## Layout and review

Expanded Settings grows to 350px, bounded by the space remaining after the 1000px Workshop client width, measured borders/gaps and the other compact rail. The last-opened panel retains existing priority; no cards shrink. The compact rail is unchanged. Simulation Stats retains its 92px banner/table; only illustration framing changes to a contained 160px image stage (portrait fallback stays contained at banner height).

`review-settings.mjs` exercises physical drag, keyboard moves, slider separation, unique membership, dormant tiers, invalid counts, optional/illustrative ER states, Character ownership, Recommended/reset and responsive geometry at 1440/1920/2560. Existing Contextual Focus, Workshop, Carousel and Character Card checks remain in the full review. These verify presentation/configuration behavior, not gameplay evaluation.
