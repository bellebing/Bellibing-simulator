# Bellibing Simulator — Current Project Status

This document is the current implementation and roadmap checkpoint for Bellibing Simulator.

The accumulated pre-2026-08-29 history is preserved in [`PROJECT_STATUS_HISTORY_2026-08-29.md`](PROJECT_STATUS_HISTORY_2026-08-29.md). Use this file for the **current** state; use Git history and the archive for detailed chronology.

`FOUNDATION` means architecture exists and is tested but supported-content coverage is incomplete.  
`COMPLETE` means the layer has the data/behavior required for its supported scope with no known blocking gap.  
`BLOCKED` means a known gap prevents that layer from being called complete.

Bellibing has **not** passed the full Pre-DPS Completeness Gate. Broad roster-wide Character DPS expansion remains blocked; narrow verified vertical slices may be frozen individually when their exact execution gaps are closed.

## Current baseline

Merge-base before the current Cohort 01 green-lane tranche: `4a1b11937db48a41ffb2fc1419c85fe72fb302f3` — PR #112, merged Cohort 01 `ECHO_SONATA` source review.

PR #112 completed the third horizontal source phase without canonical promotion. The current functional tranche continues on one branch through `STATS_ER`, `SOURCE_ROTATION`, semantic source-completeness review and bulk canonical promotion.

Registry-derived readiness on the current merge candidate is guarded to be:

- **25 `PROFILE_COMPLETE_PENDING_FREEZE`**;
- **3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`**;
- **28 `PROFILE_SOURCE_PENDING`**;
- **1 `DPS_READY`**.

The change from the #112 baseline is exactly seven source/semantic profile promotions. No new profile is freeze-approved or DPS-ready.

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

Freezing Frost 5pc and Havoc Eclipse 5pc remain explicit source conflicts. Midnight Veil damage execution and Wishes of Quiet Snowfall state arbitration remain specialized pending boundaries. A profile recommendation naming one of these sets does **not** resolve or bypass the separate effect/execution boundary.

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

The original 48-Character source inventory classified 10 `READY_FOR_REVIEW`, 8 `MULTI_MODE`, 26 `MISSING_CONTEXT`, 0 `SOURCE_CONFLICT` and 4 `RAW_PREFLIGHT_BLOCKED`. The ten clean rows were promoted together. Aalto, Zhezhi and Denia were subsequently resolved from the original `MULTI_MODE` set.

### Canonical multi-mode checkpoints

**Aalto** preserves canonical Hybrid — Jiyan while its legitimate Main DPS mode remains unpromoted. Its canonical rotation is still `SOURCE_SEQUENCE_ONLY`.

**Zhezhi** preserves two canonical source-conditioned presets: Endgame 5★ — Empyrean and Fallback — Moonlit in the reviewed Carlotta + The Shorekeeper context. Both rotations remain `SOURCE_SEQUENCE_ONLY`.

**Denia** preserves two canonical source-conditioned presets:

- `denia-fusion-burst-aemeath` — Fusion Burst — Aemeath, default for the reviewed source context;
- `denia-tune-strain-luuk` — Tune Strain — Luuk, alternate source context.

Both use the reviewed Forged Dwarf Star recommendation; both remain build-ready but not DPS-ready.

### Horizontal Profile Cohort Pipeline — Cohort 01

The historical Cohort 01 source snapshot contains **15 Characters / 20 staged modes**. Historical cohort replay is now deliberately separated from current `PROFILE_SOURCE_PENDING` eligibility: old review checkpoints stay reproducible after profiles are promoted, while a separate live guard rejects carrying already-promoted Characters into a new active cohort.

Review order:

1. `MODE_TEAM_CONTEXT`;
2. `WEAPON`;
3. `ECHO_SONATA`;
4. `STATS_ER`;
5. `SOURCE_ROTATION`;
6. semantic promotion review;
7. `EXECUTION_ADAPTERS` / freeze only after canonical promotion.

#### Completed horizontal source phases

| Phase | REVIEWED | BLOCKED | PENDING |
| --- | ---: | ---: | ---: |
| `MODE_TEAM_CONTEXT` | 10 | 10 | 0 |
| `WEAPON` | 18 | 2 | 0 |
| `ECHO_SONATA` | 17 | 3 | 0 |
| `STATS_ER` | 10 | 10 | 0 |
| `SOURCE_ROTATION` | 10 | 10 | 0 |

`MODE_TEAM_CONTEXT`, `WEAPON` and `ECHO_SONATA` were merged through PRs #110, #111 and #112. The current tranche adds `STATS_ER` and `SOURCE_ROTATION` on the same branch instead of opening one PR per phase.

The ten green-lane source-complete modes are:

- Lucilla — Glacio Chafe;
- Lucilla — Echo Skill;
- Lumi — Hybrid;
- Rover (Havoc) — Quick Swap;
- Yinlin — Moonlit;
- Calcharo — standard;
- Cantarella — standard;
- Carlotta — standard;
- Changli — standard;
- Chisa — standard.

All other Cohort 01 modes retain their existing explicit blockers; one blocked mode never stops the others.

#### `STATS_ER` source review

Exactly ten green-lane modes are REVIEWED and ten remain BLOCKED from earlier source/context gaps.

- eight green-lane modes have exact source-backed numeric ER bands;
- Rover (Havoc) Quick Swap and Cantarella intentionally retain `erBand=null` because their reviewed contexts do not support an exact numeric target;
- no numeric ER is inferred from generic guidance;
- Brant remains blocked with the source-explicit Tidebreaking Courage condition at **250%+ Energy Regen** plus Molten Rift fallback. The 250% branch is never made unconditional.

#### `SOURCE_ROTATION` source review

Exactly ten green-lane modes are REVIEWED and ten remain BLOCKED.

Source sequences preserve explicit Intro/Outro order, swaps, Echo timing and named cancels where supported. They never add rotation duration, frame timing, uptime or engine ownership.

Every reviewed rotation remains `SOURCE_SEQUENCE_ONLY`.

#### Semantic source-completeness / canonical promotion

Source completeness produced **10 complete modes**. Manual semantic review approved **7** for canonical VERIFIED build truth and retained **3** as source-complete but promotion-blocked.

Promoted canonical defaults:

- `lumi-hybrid`;
- `yinlin-moonlit`;
- `calcharo-standard`;
- `cantarella-standard`;
- `carlotta-standard`;
- `changli-standard`;
- `chisa-standard`.

Source-complete but not promoted:

- Lucilla Glacio Chafe;
- Lucilla Echo Skill;
- Rover (Havoc) Quick Swap.

Lucilla remains blocked because both reviewed Resonance Modes are legitimate and the source review did not justify one universal Character default. Havoc Rover remains blocked because Quick Swap is source-complete while the broader playstyle comparison is not semantically closed. Neither Character receives a fabricated default merely to increase throughput.

The seven approved profiles are bulk-materialized atomically from one reviewed spec per mode into Weapon / Echo / Stats / Team / Rotation / Preset catalogs. Automation structures the approved truth but does not make the semantic approval decision.

All seven canonical rotations remain `SOURCE_SEQUENCE_ONLY`; promotion is build/profile truth only, not execution/DPS truth.

### Profile × Adapter dependency matrix

Canonical backward-impact `pendingExecutionIds` are mapped into a machine-readable Profile × Adapter dependency matrix.

Current canonical impact inventory on this merge candidate:

- **18 backward-impact reviews**;
- **18 reviewed canonical profiles**;
- **17 profiles with pending execution dependencies**;
- **78 exact pending execution edges**.

`rotation:*:engine-model` remains profile-specific and excluded from generic reuse prioritization.

Top reusable syntactic primitive candidates are currently:

1. `weapon:trigger-uptime-adapter` — **5 profiles / 5 Characters / 6 dependencies**;
2. `echo:impermanence-heron-active-transfer-adapter` — **5 profiles / 5 Characters**;
3. `sonata:outro-transfer-adapter` — **4 profiles / 4 Characters**.

Within the seven newly promoted profiles, `weapon:trigger-uptime-adapter` and `sonata:outro-transfer-adapter` each touch three profiles; Impermanence Heron touches Lumi and Yinlin and also reuses the same boundary already present for Aalto, Iuno and Zhezhi.

These rows are prioritization hints, not semantic proof that all grouped effects share one implementation. In particular, Impermanence Heron cannot close profile execution until an actual Outro/incoming-Resonator event path exists, and generic trigger uptime still depends on executable action/rotation events.

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
- PR #108 — initial Cohort 01 blocker staging; merge `959562968767d1fd6f4a37451b24d59e4ca41bda`.
- PR #109 — completed old-checkpoint source blocker staging; merge `ca1b5058c750fe58968af155d60eaca615c98b0f`.
- PR #110 — fresh MODE_TEAM_CONTEXT source overlay, 10 reviewed / 10 blocked / 0 defaults; merge `c66a98f774c44f568aefc3718650502d8da13e10`.
- PR #111 — fresh WEAPON source overlay, 18 reviewed / 2 blocked; merge `219b35d256702f8d06ab164ac0d9227b5e58d9f9`.
- PR #112 — fresh ECHO_SONATA source overlay, 17 reviewed / 3 blocked; merge `4a1b11937db48a41ffb2fc1419c85fe72fb302f3`.

## Next work

1. Exact-head verify and merge the current Cohort 01 green-lane tranche. Do not count the seven promotions as landed until full Verify/Export/build/browser/audits pass on the exact PR head and post-merge state is rechecked.
2. Keep Lucilla's two source-complete modes and Havoc Rover Quick Swap parked until canonical default semantics are explicitly closed; do not fabricate defaults.
3. Use the Profile × Adapter matrix to attack shared execution primitives before character-specific copies. Weapon trigger-uptime and Impermanence Heron are tied at five-profile fanout; the matrix ranks Weapon trigger-uptime first by dependency-count tie-break, while Outro transfer touches three of the seven newly promoted profiles.
4. Do not implement an adapter merely because suffixes group syntactically; verify the shared semantic primitive and its required event-state first.
5. Continue preserving explicit source blockers, including Brant's conditional 250% Tidebreaking branch/fallback and missing exact Echo attack data.
6. Do not start broad roster-wide Character DPS. Augusta remains the only frozen DPS-ready vertical slice.
