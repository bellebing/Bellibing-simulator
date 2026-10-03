# Improve Settings — policy UI v3

Draft PR #224 is ready for desktop visual review. Improve Settings now has global **Recommended / Manual** mode beside its heading and four compact controls: **Character Target, Gate, Echo Policy, Roll Quality**. The former Simple badge, Valuable Stats selection counts and local mode are retired.

## Presentation and interaction

The account-owned Character selector, hover envelope and motion-aware clearance remain intact. Settings and the existing cards/workspace keep their accepted widths. The four controls fit one row at 1440px; Character Target and Echo Policy receive more width. One inline expansion opens at a time, pushes subsequent content down and uses the existing 320ms weighted transition. Escape closes it and restores trigger focus; reduced motion uses a short opacity transition. There are no native selects, floating popovers or internally scrolling option menus.

Recommended resolves current reviewed source sections without user overrides. Manual alone creates no overrides: untouched sections inherit Recommended. Section labels distinguish Recommended/inherited, Custom, Pending and Needs review; explicit custom empty sections are shown as such. Choosing Recommended clears overrides only, preserving Gate, Roll Quality, Character build and Candidate. Gate remains +5 / +10 / +15 / +20 / +25; Roll Quality remains All Rolls / Mid+ / High+ with numeric mapping Pending.

## Character Target

Total-stat Targets and Build Priorities have separate vertical sections. Augusta shows **ER 116% minimum / 125% preferred**; CRIT Rate = CRIT DMG and ATK% = Heavy Attack DMG remain tied priorities. Energy Regen's conditional first priority and source/context notes remain visible, without evaluating satisfaction or inventing numeric CRIT/ATK targets.

Manual supports Energy Regen, CRIT Rate, CRIT DMG, ATK, HP and DEF numeric targets. Percentage inputs persist canonical ratios; point inputs persist points. Minimum must be finite and nonnegative; preferred is optional, finite, nonnegative and at least minimum. Invalid input is rejected without clamping. The first edit copies the effective numeric section, retaining values but marking custom rows **USER_DEFINED**. Source-described basis remains distinct; comparison readiness stays Pending for both. Targets can be removed and the numeric section can Use Recommended. Build priorities remain inherited/read-only in this UI slice.

## Echo Policy

Augusta's reviewed context collapses to **2 required · 1 of 3** and expands into:

- Required on Every Echo: CRIT Rate ≥9.3%, CRIT DMG ≥21%.
- Required combinations: at least one of ATK% ≥6.4%, Energy Regen ≥6.8%, Heavy Attack DMG ≥6.4%.
- Preferred stats: **Pending**. Build priorities and source array order do not establish Echo preference ranking.

These thresholds apply to individual Echo substats, separately from whole-build targets. Maximum one dead stat is secondary source policy information.

Manual assignment uses only the Character's reviewed canonical relevant stat pool. Available is derived by removing explicitly assigned manual requirement/preference stats, without treating combination-group membership as individual assignment. Require/Prefer/Remove copies the current effective section on first edit, then applies explicit intent. Newly required stats have no invented minimum. Requirements and preferences have independent Use Recommended actions; removing the final preference preserves an explicit empty override. Preferences are vertical, physically draggable and keyboard reorderable with Move up / Move down. Order expresses preference only, without weights.

Reviewed combination groups and constraints are preserved. Generic group construction and priority editing are deliberately deferred and identified in the UI. A custom requirement section whose source requirements are Pending may have null acceptance constraints: this means no additional user-defined constraints, not invented defaults.

## Shared state, generated sources and recovery

The visible UI imports compiled `improvePolicyState.ts` and the pure `improvePolicyPresentation.ts` adapter. The adapter converts inputs and performs sparse section edits; it has no DOM, equipment or evaluator dependency. `scripts/export-ui-improve-settings.ts` generates `policies.json` from `projectReleasedImprovePolicies()` and deterministically compiles the browser modules needed by the raw source entrypoint into checked-in `docs/assets/`. The generated `echoCoreRules.js`, `improvePolicyState.js` and `improvePolicyPresentation.js` are compiler output from the canonical TypeScript sources, not a second hand-maintained implementation. Strict builds compile the canonical sources independently and fail when any checked-in browser module differs. The browser does not duplicate domain validation or migration logic.

The live schema/envelope is v3 at **bellibing.improve.policy.v3**. State-layer loading/migration leaves **bellibing.improve.simple-settings.v1** and **bellibing.improve.simple-settings.v2** untouched as recovery copies. Matching v2 Manual ordered Active becomes Echo preferences only; empty Manual becomes explicit empty preferences; Recommended has no overrides. No old Active value becomes an Echo requirement or Character target. Character state is independent and persists across reloads.

Temporary source failure masks dependent sections Pending while retaining intent; source recovery restores compatible overrides. Context drift suspends overrides with Needs review and retains the original saved binding/content. Invalid storage fails closed with a recovery/save notice. Detached `window.bellibingImproveSettings.getState()` returns v3 raw intent, effective policy, compatibility and Pending Roll Quality mapping. The API offers Character selection for verification and exposes no build/equipment mutation.

## Validation and deferred work

57 focused policy/state/source/recovery tests and 1254 full tests pass (standard `npm test`: 210 files), with strict TypeScript web build, generated-module parity and whitespace checks. Functional review has two supported paths: the built Export preview (`dist/ui-preview/`) and the repository source entrypoint (`docs/ui-prototypes/v34-functional.html`), including an exact-head `rawcdn.githack.com` URL. The source path is self-contained in the repository and does not depend on files that exist only in Export. Verify serves the repository root and the built `dist` tree separately, then runs the same Improve Settings / workspace real-Chrome regression against both. Real Google Chrome covers 1440×900, 1920×1080 and 2560×1440: module loading, Improve Settings heading, Recommended / Manual, all four controls, Augusta source policy, Character Target and Echo Policy expansion, exact ER/Echo requirements, physical account entry and selector hover, target input rejection/round-trip, sparse assignment, physical drag, keyboard ordering, explicit empties, clear overrides, Escape/focus, reduced motion, Character/reload isolation, UI-path v2 migration/recovery copies, source outage/recovery, review drift and unchanged Candidate/equipment/workspace dimensions. Repository Verify and Export must pass on the final exact head; their evidence is recorded on PR #224 and AI Handoff.

Current source coverage remains 24/57 numeric targets, 44/57 canonical priorities, 1/57 Echo requirements and 0/57 Recommended Echo preference ordering. Unsupported sections are Pending. BUG-042 remains KNOWN GAP, with its wording updated from obsolete v2 ranking/selection defaults to missing roster-wide reviewed Echo policy/preference coverage.

Build Need, current-build comparison, ER satisfaction, replacement ranking, DPS/DPR, weights, probabilities, decision-engine keep/discard, Roll Quality thresholds, Advanced Settings, Team and mobile remain Pending. Stop for visual review; PR #224 remains OPEN / DRAFT / UNMERGED.
