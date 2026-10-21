# Bellibing Simulator — Current Project Status

Worker process authority: [Development Process v2](DEVELOPMENT_PROCESS.md). Recover live branch/PR/SHA/CI/artifact/merge state from GitHub, not from this file. This document owns current product status, the nearest roadmap and real repo blockers only.

## Current product

### Improve / Character Target

The accepted Improve Settings surface is integrated. Visible controls are **Target / Gate / Echo Substat Target / Flex Stats** with one global **Recommended / Customize** mode. Gate remains **+5/+10/+15/+20/+25**. Echo Substat Target is hard per-Echo requirements; Flex Stats are relevant/value-producing stats, not an implicit at-least-one rule. CharacterBuildState remains the equipment/build truth, with Current/Candidate ownership, five equipped Echoes and existing persistence/recovery unchanged.

The Improve Settings review candidate retains main's compact four-column design, renames Echo Substat Target to Hard Requirements, narrows Target/Gate, equalizes the stat columns and removes the visible Build Need block. All 13 canonical stat rows appear once and remain draggable across Hard Requirements, Flex Stats and Show other stats; saved placements and dormant minimums preserve user intent. Augusta/default's five approved gold highlights are UI relevance guidance only. The user approved this UI as the V1 baseline. Fresh Augusta/default Echo settings use the user-approved CRIT Rate/CRIT DMG Hard Requirements and ATK%/Heavy Attack DMG/Energy Regen/Flat ATK Flex order at existing canonical minimum tiers; explicit custom intent takes precedence and Recommended reset restores this default. The user-configured final requirement is all Hard Requirements AND at least N distinct selected Flex Stats with their exact minima, represented by an explicit existing requirement group. Augusta's default count is 1; legacy count-less preferences retain their intent, and infeasible counts after moves remain visible for repair. Exact public acceptance/slot feasibility is separate from private economic optimization. Other Characters receive no added quantitative Hard/Flex defaults; the Issue #319 follow-up maps reviewed source stat priorities without inventing thresholds. Reviewed provider Echo recommendations and evaluator readiness are unchanged.

Visible **Target Recommended** uses one source basis only: a verified modern DPR **DEFAULT CALC_BENCHMARK** profile. Exactly one safe DEFAULT profile is required; only its explicit Calc rows are displayed. Prydwen recommendations, DPR GENERAL_RECOMMENDATION and legacy CALC_SCENARIO_REFERENCE remain independent source families and never fill missing Calc rows or become visible fallbacks.

Current automatic Calc-target coverage is **19 catalog identities / 19 RELEASED-selectable**. Pending groups remain:
- variant-only Aemeath / Iuno / Qiuyuan;
- Suoming with five explicit blank Calc rows;
- legacy-only Brant, with no automatic scenario selection;
- 36 identities without a usable modern source profile.

See [DPR source strategy and complete mapped inventory](CHARACTER_RECOMMENDATIONS_DPR_REVIEW.md) for the full identity matrix and source semantics. See [schema, source review and Augusta pilot](CHARACTER_RECOMMENDATIONS_AUGUSTA_REVIEW.md) for the reviewed recommendation contract.

Augusta's visible DEFAULT Calc target is:
- ATK **2,407**
- CRIT Rate **84.7%**
- CRIT DMG **225%**
- Energy Regen **120%**
- Heavy Attack DMG **29.2%**

Exact unrounded Calc references remain source data underneath the formatted UI values. This presentation policy does not promote DPR to universal recommendation authority and does not add evaluator semantics.

### Character signature and guide data

The merged Character data includes 59 reviewed signature/no-signature relationships and source-ordered Prydwen reference recommendations for all 59 released identities, including percentages, contexts, Echo sets/main Echoes, stats, skill priority and teammate guidance. See the [source review and coverage](CHARACTER_EQUIPMENT_AND_RECOMMENDATIONS_REVIEW.md). Two missing released signature weapon records/passives are integrated with bounded V37 gates. Existing Calc target selection, profile defaults, UI Echo requirements and DPS readiness are unchanged. Image-only example-team member capture and independent ranking checks remain pending.

### Team-aware rotation references

The [alternative team context candidate](ALTERNATIVE_TEAM_CONTEXTS.md) adds 390 guide composition contexts (380 unique trios), including 267 alternatives, source-recommended core variants and one explicitly named source BiS reference. All 59 released identities occur as members. Budget/standard/protagonist partners, premium alternatives, scoped healer substitutions and mode/dependency warnings are separate from a 543-context unranked model discovery pool. The [composition/timing integration candidate](TEAM_ROTATION_COMPOSITION.md) resolves all 390 reviewed contexts and supplies 277 with an explicit replayed timing variant; 84 lack source modules and 29 remain model/mode blocked. Whole-team scenarios, mode differences, resource requirements and a canonical partial buff/event bridge support one-slot comparisons, including Augusta/Iuno → Mortefi with Shorekeeper. The [Augusta two-team damage pilot](AUGUSTA_TEAM_DPS_PILOT.md) now computes experimental scenario damage/DPS and actor shares for Augusta/Iuno/Shorekeeper and Augusta/Mortefi/Shorekeeper using actual legal stat cards, canonical coefficients/effect quantities and source-pinned hit/state schedules. One-slot Echo changes and current-build marginal rolls are reproducible. Native buff/resource/proc execution, complete live-game parity and public upgrade verdicts remain pending; existing defaults and DPS readiness are unchanged.

The merged reference catalog maps Prydwen-only baseline rotations for 59 released identities: 96 references, with ordered sequences for 57 Characters and explicit priority-only guidance for Jianxin/Yuanwu. Team/mode/Intro differences, preparation and partner handoffs are preserved. Contextual lookup and detached database joins are reference data; existing executable presets and DPS readiness are unchanged. See [scope and consumer contract](TEAM_AWARE_ROTATION_REFERENCES.md). The merged coordination catalog sorts all 96 references and explains 19 reviewed team/partner cases with short difference notes. A bounded Aalto hit/Echo bridge reuses existing combat math; the public rotation registry has no active engines, so full player-build team DPS remains Pending. See [coordination and integration contract](TEAM_ROTATION_COORDINATION.md).

### Improve policy and Echo guidance

Customize target metrics, minimum/preferred semantics, source/context recovery and existing migration behavior remain intact. The accepted current UI contract is [Improve Simple Settings](UI_IMPROVE_SIMPLE_SETTINGS.md).

**BUG-042 remains MEDIUM / KNOWN GAP**: roster-wide reviewed Echo requirements/preferences are incomplete. Public Recommended Echo requirements/preferences remain Pending. Legacy numeric targets and build priorities do not establish complete dedicated Character recommendations.

### Character / Build workspace

The current New UI Build/Improve foundation is integrated, including Character selection, Character-owned build state, Build Stats projection, Weapon/Echo ownership, Skills/Forte, Sequence, Character Hero Art, Character Build Card and Improve Candidate/Echo Workspace behavior already covered by their current contracts and regressions.

The catalog contains **59 RELEASED-selectable identities** and **Suoming CONFIRMED_UPCOMING** (Electro / Sword). Hsin (Electro / Rectifier) and Jingran (Fusion / Broadblade) are released; their raw Lv90 facts, energy caps, permanent stat nodes and complete source kits are recorded in the [release 3.7 facts candidate](CHARACTER_RELEASE_3_7_FACTS_REVIEW.md). The candidate has 59/59 raw records and 58/59 complete mechanics source profiles; separate Build/Skills/Sequence/Hero Art presentation remains Pending. This is source-data coverage, not deployed or FULL-verified status. Visible Calc references do not establish mechanics or DPS readiness.

Active product scope remains:
- Sequences: S0, S1, S2 for current product work; S3-S6 stay canonical raw/source data unless separately authorized.
- Skills: maxed Character skills, using Lv10 where the source owns the exact Lv1-Lv10 curve.
- Missing or disputed gameplay semantics remain PENDING/UNKNOWN and fail closed.

The release facts candidate resolves Buling Five Thunders Spell Array as Liberation DMG and Xiangli Yao Pivot — Impale as Basic DMG from original damage fields. Danjin's full-power Ruby Blossom threshold contradiction remains source-blocked.

The six Reference Team 01 dependencies remain pending. See [Best Available Teams direction](BEST_AVAILABLE_TEAMS_DIRECTION.md) for the downstream team/product contract.

## Engineering / process state

Development Process v2 is integrated and canonical. CI 6A/6B is integrated: draft PRs use FAST, ready/final candidates use FULL, verified exact-head dist is the deployment input, and main deployment is gated by successful FULL.

Sequence gate stabilization is integrated. The verifier now waits for settled open-state geometry before applying the unchanged spacing/viewport assertions; the earlier transition-timing false failure is not a current product blocker.

GitHub owns live PR lifecycle, exact heads, run IDs, artifacts and merge evidence. Do not copy those values into this current-status file.

## Nearest roadmap

The [Character-aware Sandbox candidate](ui-lab/CHARACTER_TEAM_CONTEXT.md) implements Issue #319's source-context/presentation slice: all 59 Characters receive an explicit source-bound standard team (27 guide standards / 32 member standards), preserving alternatives and actual carry/mode ownership. The 390 original guide contexts are retained, five existing catalog trios gain source composition bindings and two missing source-explicit trios are added. One shared three-row Team DPS panel and Recommended source guidance preserve Custom intent. Normal comparison DPS and broader Hard/Flex/ER policy remain Pending; Phrolova's conditional crit guidance does not establish an ER threshold. This is unmerged candidate behavior, not production or new engine coverage.

The **standalone Sandbox candidate** now connects explicit supported Custom Echo goals
for all 59 released Characters to the existing local RNG owner. Source-bound
configuration and recommendation coverage remain distinct: 15 missing canonical
Recommended policies receive only an Echo-only Custom identity, with no inferred
targets. Existing source review, gate and minimum-tier capability limits remain.
A bounded actual roster run completed five +25 cards per Character under one
explicit supported goal. Real local browser runs cover Baizhi and Shorekeeper.
See the [browser contract](ui-lab/SANDBOX_BROWSER_CONTRACT.md).

Pre-run certified Expected Echoes/Tuners and actual gross receipt costs share an
explicit selected-slot/target scope. Completed Unlimited runs show the difference
from the statistical mean. Finite/incomplete comparisons, Expected Tubes, live
remaining costs and statistical Expected DPS remain Pending. Normal selected
Augusta/Iuno/Shorekeeper may show the existing separate experimental reference
trio after equipment/source/whole-build ER checks: actual selected-member Echoes,
two fixed reference builds and same-run observed-alternative deltas. Qualified
normal Team DPS stays Pending. The active DPS direction reuses fixed source scenarios and
canonical mechanics; no general rotation/damage engine is planned. No deployment or account integration is active.

Private runtime foundation and Worker 8 Fas 2 / Fas 3 are COMPLETE. Trusted real Current measurement and Current↔Target/stat-outcome capability are verified only for **Augusta/default** and **Cartethyia/default** under **STAT_TARGET**. ER/unsupported dimensions, mixed trades, cross-stat ranking, PROVISIONAL_TEAM_DPS and STANDARD_TEAM_DPS remain Pending. No evaluator HTTP route exists; production private runtime is undeployed.

1. Character Truth evidence/capture foundation; complete and review the required source-backed evidence without claiming capture completeness.
2. Worker 8 Fas 3 COMPLETE for the bounded STAT_TARGET pilots above; broader readiness remains Pending.
3. [Echo Simulator Foundation](ECHO_SIMULATOR_FOUNDATION.md): Worker 12 COMPLETE, merged and post-merge verified, with a memory-only Improve sandbox, Current/Simulate, five slot cards/Trash Piles and inspectable histories. Production decisions remain Pending; no private ingress exists.
4. Improvement Cost through repeated simulation, keeping Tuners / Tubes / Echoes separate.
5. Later farming/acquisition simulation when source-valid.
6. Character comparison / Best Available Teams remain downstream and Pending.

Worker 13 Resource Inventory is COMPLETE, integrated and post-merge verified: a centered Resources subsection with local source-resolved item art and compact collapsed summaries, shared user-owned counts editable in both Current and Simulate, and reviewed four-denomination Tube facts.

Worker 15 Fas 1 is **COMPLETE**, integrated, merged and post-merge verified. The character-independent pure-domain engine provides exact cumulative Echo EXP, exact whole discrete Tube spending, intermediate EXP carry, finite/unlimited inventory semantics, separate Tuner checkpoint transactions, +25 overflow return and an exact transaction ledger. Its cost-aware, inventory-sensitive bounded optimizer preserves denomination transformations and reports explicit search limits. UNLIMITED affects feasibility, not spending cost. See the [exact resource engine contract](ECHO_EXACT_TUBE_SPENDING.md). Resource Inventory remains the sole persistent shared budget; runtime/evaluator integration is not inferred from this domain engine.

The [local interactive Echo advisor candidate](ui-lab/INTERACTIVE_ECHO_ADVICE.md) adds one genuine Improve reveal per action, exact Gate-constrained Continue/Discard Tuner advice, same-attempt odds and replacement-inclusive remaining costs. Settings edits retain observed rolls; owner changes retire the detached session. Real Current and inventory are unchanged. Private math stays in a loopback Node child, outside browser artifacts. XP is assumed sufficient; finite limits constrain actual reveals, not the unconstrained expectation. Tube/recovery/acquisition economics, whole-build ER/usefulness, automatic orchestration, broader evaluator and production ingress remain **Pending**. No hosted advice or DPS qualification is implied.

The [local actual-team review](ui-lab/LOCAL_TEAM_DPS_REVIEW.md) connects Sandbox
and Improve to the unchanged private fixed-team pilot through a loopback-only
Node bridge. The original Augusta/Iuno/Shorekeeper pilot is retained; one shared Riley
source-model adapter covers 164 independently benchmarked trios across 43 Characters.
Ten additional native role/mode joins preserve Iuno hybrid separately; Brant R1/stat responses are tested. Three
complete saved builds, canonical equipment, source effects/rotation and total ER are required.
Lv90/R1 is an explicit reference choice because account storage lacks those fields.
Improve reviews one observed Candidate at a time; Sandbox compares completed active
slot replacements against a detached account copy. Whole-team ER, source equipment
and context freshness fail closed. Real Chromium evidence covers both workspaces.
Riley supports S0–S2/equipped source R1 Weapons; Change includes relative DPS.
All numbers stay experimental; qualified teams added: zero. Unsupported investment,
schedules, four Hsin source conflicts, Expected DPS and hosted runtime stay Pending. No private
algorithm is bundled or published; real Current and account storage remain unchanged.

## Real blockers and Pending boundaries

- **BUG-042** — incomplete roster-wide reviewed Echo requirements/preferences.
- Character Target modern DEFAULT Calc coverage gaps listed above.
- Danjin FORTE/resource threshold contradiction.
- Six Reference Team 01 dependencies remain pending.
- Independent recommendation comparisons, image-only example-team rosters and product integration remain Pending; source references are not executable Improve policy.
- Source-backed recommendation/reference data does **not** by itself establish Build Need comparability, Improvement Cost, Character comparison or evaluator behavior.

Do not infer missing values, timing, ownership, stacking, scope, rotations or damage classifications. Missing is not zero.

## Canonical current contracts

- [Development Process v2](DEVELOPMENT_PROCESS.md) — worker/process rules.
- [Improve Simple Settings](UI_IMPROVE_SIMPLE_SETTINGS.md) — current Improve settings/policy UI contract.
- [Character Recommendations — Augusta review](CHARACTER_RECOMMENDATIONS_AUGUSTA_REVIEW.md) — recommendation schema/source review.
- [Character Recommendations — DPR review](CHARACTER_RECOMMENDATIONS_DPR_REVIEW.md) — DPR source roles, coverage and mapped inventory.
- [Character Database](CHARACTER_DATABASE.md) — current Character data/export consumer contract.
- [Echo Simulator direction](ECHO_SIMULATOR_DIRECTION.md) — accepted long-term Improve simulator product direction; bounded foundation candidate described separately, real evaluator readiness remains Pending.
- [Best Available Teams direction](BEST_AVAILABLE_TEAMS_DIRECTION.md) — downstream team-selection product/architecture contract.

Historical PR/checkpoint/CI evidence belongs in GitHub and the Handoff update log. It is intentionally not duplicated here.

The [fixed-scenario Echo comparison](ui-lab/OBSERVED_ECHO_SCENARIO.md) supports selected Augusta, Iuno and Shorekeeper through the same trio/executor, with source-bound whole-build ER acceptance, preserved actual equipment/receipts on ER failure and separate Pending qualified-build expectations. Iuno/Shorekeeper need explicit Custom Echo goals. It adds experimental same-run observed-build/one-Echo-alternative deltas in the existing opt-in expert review. The existing Augusta pilot replays the same bounded source rotation for both builds; unsupported equipment/ER remains Pending. This does not qualify normal product DPS or add a general rotation engine.

The [Sandbox static-stats follow-up](ui-lab/SANDBOX_BUILD_STATS.md), stacked on #320, projects Character/Weapon/max-minor-Forte baseline facts for all 59 identities and complete observed five-card static builds through the existing canonical projector. Permanent eligible self Sonata bonuses are included; conditional combat mechanics remain Pending. Recommended maps source stat priorities for all 59 without inferring per-Echo minima/counts or ER thresholds. A versioned team comparison contract admits numbers only from explicitly qualified same-context providers; the public registry remains empty and all normal DPS cells remain Pending. This candidate does not add account integration or promote experimental team DPS.
