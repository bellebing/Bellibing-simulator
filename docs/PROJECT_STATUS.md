# Bellibing Simulator — Current Project Status

This document is the current implementation and roadmap checkpoint for Bellibing Simulator.

The accumulated pre-2026-08-29 history is preserved in [`PROJECT_STATUS_HISTORY_2026-08-29.md`](PROJECT_STATUS_HISTORY_2026-08-29.md). Use this file for the **current** state; use Git history and the archive for detailed chronology.

`FOUNDATION` means architecture exists and is tested but supported-content coverage is incomplete.  
`COMPLETE` means the layer has the data/behavior required for its supported scope with no known blocking gap.  
`BLOCKED` means a known gap prevents that layer from being called complete.

Bellibing has **not** passed the full Pre-DPS Completeness Gate. Broad roster-wide Character DPS expansion remains blocked; narrow verified vertical slices may be frozen individually when their exact execution gaps are closed.

## Current baseline

Current merged `main` baseline: `959562968767d1fd6f4a37451b24d59e4ca41bda` — PR #108, Cohort 01 mode/team/context + weapon blocker staging.

PR #108 exact head `fffd24e5c80d7539138030fd349660195bbb4750` passed Verify #500 and Export #472, including full audits/tests, strict web build, real Chrome Roll Assist regression, diff check and artifact publishing.

Post-merge `main` passed Verify #501 and Export #473. Deploy #101 built and deployed successfully; its first live Chrome attempt hit a transient `Roll Assist controls did not become ready` condition after route checks had already passed. A same-SHA rerun, attempt 2, passed Echo Lab, Roll Assist route and live Roll Assist Chrome verification. No product regression reproduced.

Live registry-derived readiness remains:

- **18 `PROFILE_COMPLETE_PENDING_FREEZE`**;
- **3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`**;
- **35 `PROFILE_SOURCE_PENDING`**;
- **1 `DPS_READY`**.

Horizontal cohort staging/review does **not** itself promote profiles and must not change those counts.

## Architecture boundary

Preserve the current separation between:

1. raw game/source data;
2. Character Mechanics;
3. Weapon/Echo/Sonata effects;
4. composable profiles/recommendations;
5. execution/combat-DPS logic;
6. UI.

The old V9.15 spreadsheet is a historical oracle only when explicitly needed; it is not the current architecture.

## Echo Core / Echo Lab / Roll Assist

### Echo Core — COMPLETE FOR ELIGIBLE-CANDIDATE TUNING

Rank-5 COST 1/3/4 main-stat pools, checkpoint-scaled primary/secondary main stats, all 13 substat types, verified roll values/probabilities, sequential tuning, EXP/Tuner/Shell Credit costs, recycle/feed recovery, seeded reproduction and five-Echo/COST-12 loadout validation are implemented and regression-tested.

Fresh world-drop desired-main acquisition probabilities remain outside the verified runtime.

### Echo Lab — COMPLETE FOR MECHANICAL ORACLE

Echo Lab consumes the shared Echo Core runtime and remains the canonical validation surface for verified Rank-5 tuning mechanics, resource accounting and seeded reproduction.

### Roll policy — COMPLETE FOR PROFILE FALLBACK; FINAL DPS-AWARE POLICY PENDING

The fallback checkpoint policy is profile-driven. Profiles own Core/Useful targets and required hit counts; reachability uses exact remaining unique slots and roll magnitudes.

Whole-build DPS-aware stopping remains dependent on verified Character combat/DPS execution.

### BUG-001 — FIXED / DEPLOYED / LIVE VERIFIED

The old Roll Assist integration path could transform a checkpoint/runtime exception into a normal `DISCARD`. The deterministic boundary is:

`recordCheckpoint → evaluateTargetCheckpoint → applyCheckpointAssessment`

Integration errors propagate separately and render `ROLL ASSIST ERROR`. Permanent browser verification covers:

- +5 CRIT Rate 6.3% → `DISCARD`;
- +5 CRIT Rate 9.3% → `ROLL TO +10`;
- +10 CRIT Rate 9.3% + Flat DEF → `ROLL TO +15`.

The PR #108 exact-head Chrome regression passed, and Deploy #101 same-SHA rerun attempt 2 passed the live browser paths.

### BUG-002 — KNOWN GAP

The full +25 lifecycle remains an explicit known gap and is not treated as complete.

## Character foundation

### Character raw/core — STATIC GATE IMPLEMENTED / EXPLICIT PENDING FIELDS REMAIN

60 Character records exist; 57 are `RELEASED`.

Current released raw DPS blockers:

- Qingxiao `maxEnergy` — current sources conflict;
- Rover (Electro) `maxEnergy` — current sources disagree;
- Suisui `maxEnergy` — current sources expose incompatible energy-labelled values.

No Liberation cost is substituted for unresolved Max Energy.

### Character intrinsic stats — COMPLETE EXCEPT ONE EXPLICIT SOURCE CONFLICT

All released Characters have explicit intrinsic coverage. **Mornye DEF%** remains source-conflicted and pending.

### Character Mechanics — SOURCE REVIEW COMPLETE / 54 VERIFIED + 3 SOURCE_BLOCKED

Roster-wide source review is complete for all 57 released Characters:

- **54 VERIFIED canonical Character Mechanics profiles**;
- **0 PARTIAL**;
- **3 SOURCE_BLOCKED without canonical profiles**;
- **1866 canonical Character Mechanic facts**;
- **0 structural issues**.

The three source-blocked Characters remain Buling, Danjin and Xiangli Yao. They must not receive DPS adapters until new evidence resolves their blockers and normal canonical review passes.

## Weapons

### Weapon Core — COMPLETE FOR CURRENT VERSION 3.6 RELEASED ROSTER

- **122 total records**;
- **121 RELEASED**;
- **1 CONFIRMED_UPCOMING** — Thousandfold Deliverance;
- released raw Weapon gate complete.

### Weapon Effects — RELEASED SOURCE COVERAGE COMPLETE / EXECUTION PARTIAL

All **121/121 released Weapons** have source-audited effect coverage across **236 effect rows**. Trigger/state/stack/target semantics that are not executable remain explicit conditional/pending-model data rather than receiving fabricated uptime.

## Echo / Sonata content

### Raw Echo / Sonata — COMPLETE FOR CURRENT VERSION 3.6 RELEASED ROSTER

- **181 / 181 released Echoes VERIFIED CURRENT** for stable identity, COST and Sonata membership;
- **34 / 34 released Sonata sets VERIFIED CURRENT** for identity, activation thresholds and raw descriptions;
- **0 stale / wrong / missing / source-conflict / extra raw records**.

### Sonata Effects — SOURCE REVIEW COMPLETE / EXECUTION PARTIAL

Current reviewed coverage:

- **34 / 34 released sets**;
- **62 / 62 activation tuples**;
- **86 source-backed stat/effect rows**;
- **58 MODELED** activations;
- **2 SOURCE_CONFLICT** activations;
- **1 MODELED_WITH_PENDING_DAMAGE_ADAPTER**;
- **1 MODELED_WITH_PENDING_STATE_ADAPTER**.

Freezing Frost 5pc and Havoc Eclipse 5pc remain explicit source conflicts. Midnight Veil damage execution and Wishes of Quiet Snowfall state arbitration remain specialized pending boundaries.

### Echo effects / attacks — SOURCE REVIEW COMPLETE / EXECUTION PARTIAL

All **181 / 181 released Echo skill records** are source-reviewed against the pinned current upstream source. Stable source-safe non-damage/main-slot effects are modeled where supported; most active damage text remains non-executable because scaling, hit shape, state, hold/press, summon or target semantics are not safely inferable.

## Composable profiles — ACTIVE PRE-DPS WORKSTREAM

Independent catalogs exist for Weapon Recommendation, Echo Loadout, Stat Target, Team, Rotation and Character Preset.

### Candidate pipeline — fail closed by design

The Profile Candidate Pipeline follows these rules:

- researched/generated candidates are always `NOT_VERIFIED` / candidate-only;
- automation may extract, stage, map dependencies, park missing-source blockers and materialize drafts, but cannot mark semantic truth `VERIFIED`;
- source-field extraction state and semantic review state are separate;
- `SOURCE_SEQUENCE_ONLY` never implies executable timing, uptime or combat-state behavior and is never upgraded to `ENGINE_MODELED` by transcription;
- readiness counts come from live registries;
- omitted `defaultCandidate` remains `null`, never silently becomes `false`;
- a phase cannot be marked `REVIEWED` while required source fields are missing.

The original 48-Character source inventory classified:

- 10 `READY_FOR_REVIEW`;
- 8 `MULTI_MODE`;
- 26 `MISSING_CONTEXT`;
- 0 `SOURCE_CONFLICT`;
- 4 `RAW_PREFLIGHT_BLOCKED`.

The ten clean rows were promoted together. Aalto, Zhezhi and Denia were subsequently resolved from the original `MULTI_MODE` set.

### Canonical multi-mode checkpoints

**Aalto** preserves canonical Hybrid — Jiyan while its legitimate Main DPS mode remains unpromoted. Its canonical rotation is still `SOURCE_SEQUENCE_ONLY`.

**Zhezhi** preserves two canonical source-conditioned presets: Endgame 5★ — Empyrean and Fallback — Moonlit in the reviewed Carlotta + The Shorekeeper context. Both rotations remain `SOURCE_SEQUENCE_ONLY`.

**Denia** preserves two canonical source-conditioned presets:

- `denia-fusion-burst-aemeath` — Fusion Burst — Aemeath, default for the reviewed source context;
- `denia-tune-strain-luuk` — Tune Strain — Luuk, alternate source context.

Both use the reviewed Forged Dwarf Star recommendation; both remain build-ready but not DPS-ready.

### Horizontal Profile Cohort Pipeline — Cohort 01

Cohort 01 contains **15 current `PROFILE_SOURCE_PENDING` Characters / 20 staged modes**:

- five remaining source-checkpoint `MULTI_MODE`: Lucilla, Lumi, Rover (Havoc), Yangyang, Yinlin;
- ten `MISSING_CONTEXT`: Baizhi, Brant, Calcharo, Cantarella, Carlotta, Changli, Chisa, Chixia, Encore, Jianxin.

Review order remains:

1. `MODE_TEAM_CONTEXT`;
2. `WEAPON`;
3. `ECHO_SONATA`;
4. `STATS_ER`;
5. `SOURCE_ROTATION`;
6. `EXECUTION_ADAPTERS`;
7. `PROMOTION_FREEZE`.

Current disposition against the existing reviewed 2026-08-29 checkpoint:

| Phase | REVIEWED | BLOCKED | PENDING | Reason |
| --- | ---: | ---: | ---: | --- |
| `MODE_TEAM_CONTEXT` | 0 | 20 | 0 | exact three-member team missing for every mode; ten rows also lack staged role |
| `WEAPON` | 0 | 20 | 0 | weapon recommendation absent from checkpoint |
| `ECHO_SONATA` | 0 | 20 | 0 | required Echo/Sonata fields absent from checkpoint |
| `STATS_ER` | 0 | 20 | 0 | stat priority absent; no ER number is inferred |
| `SOURCE_ROTATION` | 0 | 20 | 0 | source sequence absent; no rotation is synthesized |
| `EXECUTION_ADAPTERS` | 0 | 0 | 20 | intentionally not evaluated on incomplete source profiles |
| `PROMOTION_FREEZE` | 0 | 0 | 20 | intentionally not evaluated before source/execution closure |

`WEAPON`, `ECHO_SONATA`, `STATS_ER` and `SOURCE_ROTATION` use declared mechanical auto-parking when required source fields are absent. Auto-parking only produces `BLOCKED`; it never produces `REVIEWED`, `VERIFIED`, `ENGINE_MODELED` or `DPS_READY`.

All materialization candidates remain `NOT_VERIFIED` with `canonicalWriteAllowed=false`. No numeric ER target, universal default, uptime, damage scaling or mechanic has been invented.

The existing checkpoint has now been fully dispositioned for all source-extraction phases. Moving these profiles forward requires a **new structured source-review checkpoint for genuinely missing fields**, not another pass pretending the old checkpoint contains data it does not.

### Profile × Adapter dependency matrix

Canonical backward-impact `pendingExecutionIds` are mapped into a machine-readable Profile × Adapter dependency matrix.

Current canonical impact inventory:

- **11 backward-impact reviews**;
- **11 reviewed canonical profiles**;
- **10 profiles with pending execution dependencies**;
- **46 exact pending execution edges**.

The matrix ranks syntactically shared reusable primitive candidates by profile/Character fanout while preserving every exact pending ID. `rotation:*:engine-model` is excluded from generic reuse prioritization because matching suffixes do not prove semantic equivalence.

Highest current syntactic reuse candidates include:

- Impermanence Heron active/transfer adapter — 3 profiles / 3 Characters;
- generic Weapon target-state adapter suffix — 2 profiles / 2 Characters.

These are prioritization hints only; they do not authorize an adapter implementation or close any impact review.

See [`DPS_EXECUTION_GAP_MATRIX.md`](DPS_EXECUTION_GAP_MATRIX.md).

## DPS execution

### Augusta — first narrow DPS-ready vertical slice

Augusta remains the single `DPS_READY` profile, only for locked `augusta-standard` S0 / Thunderflare Dominion R1 / Iuno + The Shorekeeper personal DPS with `AUGUSTA_STD_V1`.

This does not claim generic Augusta execution, arbitrary teams, broad team DPS or roster-wide DPS readiness.

## Verification contract

Scoped checks may be used during iteration. A final PR head intended for merge must pass the exact-head verification surface, including:

- source/raw/profile audits;
- horizontal cohort and Profile × Adapter audits where applicable;
- full Node test suite;
- strict web build;
- real Chrome Roll Assist regression;
- diff/whitespace checks;
- Export artifact workflow;
- other relevant workflows for the changed scope.

A PR is not merge-ready because an earlier head passed.

## Completed latest tranche

- PR #103 — Aalto multi-mode promotion.
- PR #104 — Zhezhi source-conditioned multi-mode profiles.
- PR #105 — appendable aggregate profile backward-impact readiness consumption.
- PR #106 — Denia source-conditioned multi-mode profiles; merge `3fb45fb6016f49c09609e32ea528d7c1ac0ea559`.
- PR #107 — horizontal cohort/review + Profile × Adapter dependency infrastructure; merge `36d32819a6d7d7b621e3f360f89178841aa99d05`.
- PR #108 — Cohort 01 mode/team/context + weapon blocker staging, default tri-state and fail-closed source blocker auto-parking; merge `959562968767d1fd6f4a37451b24d59e4ca41bda`.

## Next work

1. Land the completed Cohort 01 source-extraction blocker staging for `ECHO_SONATA`, `STATS_ER` and `SOURCE_ROTATION` with exact-head CI. This still promotes zero profiles.
2. Start a new structured source-review checkpoint for Cohort 01, researching **only genuinely missing fields**. Work horizontally in the same phase order, beginning with mode/team/context across the cohort rather than re-reading already captured facts.
3. Carry source-backed results forward to weapon, Echo/Sonata, stats/ER and source rotation for the same cohort. Preserve source-conditioned alternatives instead of forcing universal defaults.
4. Only after a profile candidate is source-complete and semantically reviewed should execution dependencies be evaluated. Then prioritize generic primitives/adapters by verified profile fanout.
5. Keep blockers parked per Character/mode so unresolved rows do not stop the rest of the cohort.
6. Keep raw data, Character Mechanics, effects, profiles, execution/combat-DPS and UI separate.
7. Do not start broad roster-wide Character DPS merely because Augusta has one narrow frozen execution path.
