# Bellibing Simulator — Current Project Status

Worker process authority: [Development Process v2](DEVELOPMENT_PROCESS.md). Recover live branch/PR/SHA/CI/artifact/merge state from GitHub, not from this file. This document owns current product status, the nearest roadmap and real repo blockers only.

## Current product

### Improve / Character Target

The accepted Improve Settings surface is integrated. Visible controls are **Character Target / Gate / Every Echo / Flex Stats** with one global **Recommended / Customize** mode. Gate remains **+5/+10/+15/+20/+25**. Every Echo is hard per-Echo requirements; Flex Stats are relevant/value-producing stats, not an implicit at-least-one rule. CharacterBuildState remains the equipment/build truth, with Current/Candidate ownership, five equipped Echoes and existing persistence/recovery unchanged.

Visible **Character Target Recommended** uses one source basis only: a verified modern DPR **DEFAULT CALC_BENCHMARK** profile. Exactly one safe DEFAULT profile is required; only its explicit Calc rows are displayed. Prydwen recommendations, DPR GENERAL_RECOMMENDATION and legacy CALC_SCENARIO_REFERENCE remain independent source families and never fill missing Calc rows or become visible fallbacks.

Current automatic Calc-target coverage is **19 catalog identities / 17 RELEASED-selectable**. Pending groups remain:
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

### Improve policy and Echo guidance

Customize target metrics, minimum/preferred semantics, source/context recovery and existing migration behavior remain intact. The accepted current UI contract is [Improve Simple Settings](UI_IMPROVE_SIMPLE_SETTINGS.md).

**BUG-042 remains MEDIUM / KNOWN GAP**: roster-wide reviewed Echo requirements/preferences are incomplete. Public Recommended Echo requirements/preferences remain Pending. Legacy numeric targets and build priorities do not establish complete dedicated Character recommendations.

### Character / Build workspace

The current New UI Build/Improve foundation is integrated, including Character selection, Character-owned build state, Build Stats projection, Weapon/Echo ownership, Skills/Forte, Sequence, Character Hero Art, Character Build Card and Improve Candidate/Echo Workspace behavior already covered by their current contracts and regressions.

Active product scope remains:
- Sequences: S0, S1, S2 for current product work; S3-S6 stay canonical raw/source data unless separately authorized.
- Skills: maxed Character skills, using Lv10 where the source owns the exact Lv1-Lv10 curve.
- Missing or disputed gameplay semantics remain PENDING/UNKNOWN and fail closed.

Character Mechanics current blockers remain source-validity blockers, not implementation guesses:
- Buling Five Thunders Spell Array damage class;
- Xiangli Yao Pivot - Impale damage class;
- Buling FORTE damage-class dependency;
- Danjin full-power Ruby Blossom threshold contradiction.

The six Reference Team 01 dependencies remain pending. See [Best Available Teams direction](BEST_AVAILABLE_TEAMS_DIRECTION.md) for the downstream team/product contract.

## Engineering / process state

Development Process v2 is integrated and canonical. CI 6A/6B is integrated: draft PRs use FAST, ready/final candidates use FULL, verified exact-head dist is the deployment input, and main deployment is gated by successful FULL.

Sequence gate stabilization is integrated. The verifier now waits for settled open-state geometry before applying the unchanged spacing/viewport assertions; the earlier transition-timing false failure is not a current product blocker.

GitHub owns live PR lifecycle, exact heads, run IDs, artifacts and merge evidence. Do not copy those values into this current-status file.

## Nearest roadmap

Private runtime foundation and Worker 8 Fas 2 are complete. Real Character comparison / usefulness / DPS remains Pending; foundation completion does not establish real Build Need readiness.

1. Character Truth evidence/capture foundation; complete and review the required source-backed evidence without claiming capture completeness.
2. Worker 8 Fas 3: real Current measurement and source/context-valid Character usefulness / outcome assessment for a small cohort.
3. [Echo Simulator Foundation](ECHO_SIMULATOR_DIRECTION.md): accepted future Improve sandbox with per-slot cards/Trash Piles, downstream of real Build Need / usefulness readiness.
4. Improvement Cost through repeated simulation, keeping Tuners / Tubes / Echoes separate.
5. Later farming/acquisition simulation when source-valid.
6. Character comparison / Best Available Teams remain downstream and Pending.

Fas 3, simulator, Improvement Cost and farming are not complete or active. Tube conversion and the separate completion criterion remain Pending. Alpha evaluation, Roll Assist advice and Echo Lab evaluation/strategy surfaces remain Pending; Echo Lab retains verified mechanics and Build/Improve retains source-backed presentation and user-owned inputs.

## Real blockers and Pending boundaries

- **BUG-042** — incomplete roster-wide reviewed Echo requirements/preferences.
- Character Target modern DEFAULT Calc coverage gaps listed above.
- Buling / Xiangli Yao ACTIONS damage-class blockers.
- Buling / Danjin FORTE semantics blockers.
- Six Reference Team 01 dependencies remain pending.
- Roster-wide Character recommendation completion is **not** claimed.
- Source-backed recommendation/reference data does **not** by itself establish Build Need comparability, Improvement Cost, Character comparison or evaluator behavior.

Do not infer missing values, timing, ownership, stacking, scope, rotations or damage classifications. Missing is not zero.

## Canonical current contracts

- [Development Process v2](DEVELOPMENT_PROCESS.md) — worker/process rules.
- [Improve Simple Settings](UI_IMPROVE_SIMPLE_SETTINGS.md) — current Improve settings/policy UI contract.
- [Character Recommendations — Augusta review](CHARACTER_RECOMMENDATIONS_AUGUSTA_REVIEW.md) — recommendation schema/source review.
- [Character Recommendations — DPR review](CHARACTER_RECOMMENDATIONS_DPR_REVIEW.md) — DPR source roles, coverage and mapped inventory.
- [Character Database](CHARACTER_DATABASE.md) — current Character data/export consumer contract.
- [Echo Simulator direction](ECHO_SIMULATOR_DIRECTION.md) — accepted future Improve simulator product direction; implementation and readiness remain Pending.
- [Best Available Teams direction](BEST_AVAILABLE_TEAMS_DIRECTION.md) — downstream team-selection product/architecture contract.

Historical PR/checkpoint/CI evidence belongs in GitHub and the Handoff update log. It is intentionally not duplicated here.
