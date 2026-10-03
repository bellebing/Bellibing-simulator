# Improve Settings — accepted desktop checkpoint

PR #224's Improve Settings UX is **visually accepted**, based on runtime head `8a592765a67488c22dc5fddd2ed4e6bd7ed20a31`. PR #224 is merged. The Character Target Recommended presentation wiring below is a new draft iteration for visual/data review; comparison and evaluator work remain Pending. The current model supersedes the preserved historical v3 UI checkpoint.

## Current presentation and interaction

Four controls: **Character Target / Gate / Every Echo / Flex Stats**. One global visible mode: **Recommended / Customize** (`MANUAL` internally). All four sections share one inline expansion, opened/closed by any trigger; their content stays in its owning column and moves the workspace down. Escape closes the shared menu and restores opener focus. The accepted layout, motion, selector clearance, Current/Candidate ownership and five equipped Echoes remain intact.

**Roll Quality is no longer a visible setting.** All Rolls/Mid+/High+ have no new threshold mapping. Existing persisted labels and v1/v2 recovery copies remain compatibility data; do not recreate the retired control.

## Every Echo and Flex Stats

**Every Echo** contains hard per-Echo stat requirements. **Flex Stats** contains relevant/value-producing stats; it does **not** mean “at least one required.” Active stat rows carry the gold highlight without checkboxes. In Customize, toggles edit sparse user intent, stats active in Every Echo cannot also be active Flex stats, and active Flex stats have explicit order with drag, Alt+Arrow Up/Down and Move up/down controls. Order carries no score/weight. **Show other stats** exposes less-relevant canonical stats; selecting one keeps its identity unique in the active list.

Recommended Every Echo/Flex display derives from reviewed source requirements/group membership/preferences where available. Reviewed combination groups and acceptance constraints remain unchanged domain evidence; projecting group members as relevant Flex stats does not execute their minimumHits condition or claim a reviewed preference ranking. Missing coverage stays Pending; source array order is neutral presentation order.

Each active stat has its own **discrete minimum-roll slider**. Values come only from canonical Rank-5 `SUBSTAT_VALUE_TABLE`; the range selects an integer tier, never an arbitrary percentage. Recommended keeps a **grey read-only track and grey thumb**, default cursor, no gold hover/focus affordance, exact position and readable slightly muted threshold number. The active stat row remains gold. Customize immediately restores the existing gold editable sliders without changing their threshold values. Native keyboard/pointer editing snaps to canonical tiers; ratio/point intent persists independently of Flex order. New user-created intent starts at its reviewed source minimum, or the lowest verified canonical tier when no source minimum exists.

Augusta source-backed baseline:

| Column | Stat | Minimum |
| --- | --- | --- |
| Every Echo | CRIT Rate | 9.3% |
| Every Echo | CRIT DMG | 21% |
| Flex Stats | ATK% | 6.4% |
| Flex Stats | Energy Regen | 6.8% |
| Flex Stats | Heavy Attack DMG | 6.4% |

Reset to Recommended clears Echo requirement/preference overrides and restores inherited selections, minimums and neutral source order. Global Recommended clears policy overrides; Gate and legacy labels stay unchanged. Customize alone creates no overrides.

## Character Target and Gate

Recommended Character Stats now consumes the source-owned `src/characterTargetPresentation.ts` adapter. Verified canonical source wording is primary; otherwise verified DPR General from exactly one modern DEFAULT profile can provide a reference point. DPR Calc remains muted secondary context only when a primary exists. Augusta shows its seven preserved Prydwen rows plus DPR Heavy Attack DMG, with overlapping General/Calc references. Variant-only profiles and legacy scenarios do not supply automatic recommendations; Suoming retains explicit blank Pending rows, and Characters without usable sources show overall Pending. Presentation formats DPR points/percentages without rounding canonical values. This is presentation only: no comparison or evaluator semantics are inferred.

Customize user-defined targets are separate: Energy Regen/CRIT Rate/CRIT DMG use canonical ratios; ATK/HP/DEF use points. Minimum is finite and nonnegative; optional preferred is finite, nonnegative and at least minimum. Invalid values are rejected. Custom targets retain USER_DEFINED basis and Pending comparison readiness. Gate remains **+5/+10/+15/+20/+25**.

## State, sources and remaining work

The shared schema/envelope v3 lives at `bellibing.improve.policy.v3`; state resolution/reducer/persistence remain DOM-free. Sparse sections inherit Recommended; explicit empty sections retain user intent. Source outages/context drift preserve saved intent and fail closed, with Needs review for incompatible context. v1/v2 recovery storage remains untouched. Settings does not own equipment or Candidate state.

Generated `docs/assets/echoCoreRules.js`, `improvePolicyState.js` and `improvePolicyPresentation.js` are compiler outputs from canonical TypeScript, verified by strict build; there is no second hand-maintained policy database. Source/GitHack preview and built Export preview are supported. The build includes both presentation adapters and `improve-settings/character-targets.mjs`, deterministically generated from canonical source projections by `scripts/export-ui-improve-settings.ts`. Strict build fails on artifact drift; source/GitHack and built previews consume identical data.

**Build Need is Pending. Improvement Cost and the new Improve evaluator are not implemented.** Dedicated Character recommendation data, roster-wide reviewed Echo policies/preferences, comparison/ER satisfaction, deficits, replacement ranking, DPR/DPS, weights/probabilities, Team and mobile remain Pending. BUG-042 remains **MEDIUM / KNOWN GAP**: reviewed Echo requirements 1/57, reviewed Recommended Echo preference order 0/57. Historical numeric-source coverage 24/57 and priorities 44/57 do not establish dedicated Character recommendation completeness.

## Historical PR #224 checkpoint verification

Final checkpoint verification covers focused Improve policy/state/presentation/roll tests, the full suite, strict build/generated-module parity and whitespace. The repository Verify serves source and built previews separately; real Chrome covers **1440×900 / 1920×1080 / 2560×1440** for shared expansion, Pending Character Target/Build Need, Gate, grey read-only source minimums, other stats, gold Customize, toggles/exclusivity, drag/keyboard ordering, discrete tier editing, persistence/reload/reset, selector clearance, Current/Candidate and five equipped Echo/workspace ownership. Existing validation, migration, outage/recovery and review-drift coverage remains. Exact final head, outcomes and Verify/Export run IDs are recorded externally on PR #224 and AI Handoff after execution; no result is inferred from older checkpoints.

---

## Historical policy UI v3 checkpoint — superseded presentation

The following records the earlier v3 integration. Its Echo Policy/Roll Quality labels, one-section expansion, ER-only presentation and “at least one” UI are historical, not the current accepted UX.


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
