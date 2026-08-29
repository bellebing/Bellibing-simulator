# Bellibing Simulator — Current Project Status

This document is the current implementation and roadmap checkpoint for Bellibing Simulator.

The accumulated pre-2026-08-29 history is preserved in [`PROJECT_STATUS_HISTORY_2026-08-29.md`](PROJECT_STATUS_HISTORY_2026-08-29.md). Use this file for the **current** state; use Git history and the archive for detailed chronology.

`FOUNDATION` means architecture exists and is tested but supported-content coverage is incomplete.  
`COMPLETE` means the layer has the data/behavior required for its supported scope with no known blocking gap.  
`BLOCKED` means a known gap prevents that layer from being called complete.

Bellibing has **not** passed the full Pre-DPS Completeness Gate. Broad roster-wide Character DPS expansion remains blocked; narrow verified vertical slices may be frozen individually when their exact execution gaps are closed.

## Current baseline

Current merged `main` baseline: `3fb45fb6016f49c09609e32ea528d7c1ac0ea559` — PR #106, Denia source-conditioned multi-mode profiles.

Post-merge workflows on that exact SHA passed Verify, Export and web deploy. Denia therefore belongs to the current canonical baseline, not to pending branch-only work.

Live registry-derived readiness after Denia is:

- **18 `PROFILE_COMPLETE_PENDING_FREEZE`**;
- **3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`**;
- **35 `PROFILE_SOURCE_PENDING`**;
- **1 `DPS_READY`**.

The horizontal cohort/adaptor infrastructure described below does **not** itself promote profiles and must not change those counts.

## Echo Core / Echo Lab / Roll Assist

### Echo Core — COMPLETE FOR ELIGIBLE-CANDIDATE TUNING

Rank-5 COST 1/3/4 main-stat pools, exact checkpoint-scaled primary/secondary main stats, all 13 substat types, verified roll values/probabilities, sequential tuning, EXP/Tuner/Shell Credit costs, recycle/feed recovery, seeded reproduction and separate five-Echo/COST-12 loadout validation are implemented and regression-tested.

Fresh world-drop desired-main acquisition probabilities remain outside the verified runtime. This does not block Roll Assist for an Echo the user already owns.

### Echo Lab — COMPLETE FOR MECHANICAL ORACLE

Echo Lab consumes the shared Echo Core runtime and remains the canonical validation surface for verified Rank-5 tuning mechanics, resource accounting and seeded reproduction.

### Roll / stopping policy — COMPLETE FOR PROFILE FALLBACK; FINAL DPS-AWARE POLICY PENDING

The fallback checkpoint policy is profile-driven. Profiles own Core/Useful targets and required hit counts; reachability uses exact remaining unique slots and roll magnitudes.

Whole-build DPS-aware stopping remains dependent on verified Character combat/DPS execution.

### BUG-001 — FIXED / DEPLOYED / LIVE VERIFIED

The old Roll Assist integration path could transform a checkpoint/runtime exception into a normal `DISCARD`. The deterministic boundary is now:

`recordCheckpoint → evaluateTargetCheckpoint → applyCheckpointAssessment`

Integration errors propagate separately and render `ROLL ASSIST ERROR`. Real Chrome verification covered:

- +5 CRIT Rate 6.3% → `DISCARD`;
- +5 CRIT Rate 9.3% → `ROLL TO +10`;
- +10 CRIT Rate 9.3% + Flat DEF → `ROLL TO +15`.

The browser regression remains a permanent Verify/Deploy guard.

### BUG-002 — KNOWN GAP

The full +25 lifecycle remains an explicit known gap and is not treated as complete.

## Character foundation

### Character raw/core — STATIC GATE IMPLEMENTED / EXPLICIT PENDING FIELDS REMAIN

60 Character records exist; 57 are `RELEASED`.

Current released raw DPS blockers:

- **Qingxiao `maxEnergy`** — current sources conflict;
- **Rover (Electro) `maxEnergy`** — current sources disagree;
- **Suisui `maxEnergy`** — current sources expose incompatible energy-labelled values.

No Liberation cost is substituted for an unresolved Max Energy value.

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

Independent catalogs exist for Weapon Recommendation, Echo Loadout, Stat Target, Team, Rotation and Character Preset. Raw game data remains separate from recommendation/profile composition, which remains separate from execution/combat-DPS logic and UI.

### Candidate pipeline — fail closed by design

The Profile Candidate Pipeline mirrors the Character Mechanics ingestion pattern:

- generated/researched candidates are always `NOT_VERIFIED` / candidate-only;
- automation may extract, stage, map dependencies and materialize draft candidates but cannot mark semantic truth `VERIFIED`;
- mechanical validation, source/context disposition and execution requirements stay separate;
- `SOURCE_SEQUENCE_ONLY` remains non-executable and is never upgraded to `ENGINE_MODELED` by transcription;
- readiness counts come from live registries rather than copied manual gates.

The initial inventory covered the 48 Characters that were `PROFILE_SOURCE_PENDING` before the first throughput tranche:

- 10 `READY_FOR_REVIEW`;
- 8 `MULTI_MODE`;
- 26 `MISSING_CONTEXT`;
- 0 `SOURCE_CONFLICT`;
- 4 `RAW_PREFLIGHT_BLOCKED`.

The ten clean rows were promoted together. Aalto, Zhezhi and Denia have since been resolved from the original `MULTI_MODE` set. The five remaining source-checkpoint `MULTI_MODE` Characters are:

- Lucilla;
- Lumi;
- Rover (Havoc);
- Yangyang;
- Yinlin.

### Canonical multi-mode checkpoints

**Aalto** preserves canonical Hybrid — Jiyan while the legitimate Main DPS mode remains unpromoted. The canonical source rotation remains `SOURCE_SEQUENCE_ONLY` and pending execution includes Static Mist transfer, Impermanence Heron active/transfer and an Aalto rotation engine model.

**Zhezhi** preserves two canonical source-conditioned presets rather than flattening them: Endgame 5★ — Empyrean and Fallback — Moonlit in the reviewed Carlotta + The Shorekeeper context. Their set-specific ER targets and Echo timing remain source-conditioned; both rotations remain `SOURCE_SEQUENCE_ONLY`.

**Denia** now preserves two canonical source-conditioned presets:

- `denia-fusion-burst-aemeath` — **Fusion Burst — Aemeath**, default for the reviewed source context;
- `denia-tune-strain-luuk` — **Tune Strain — Luuk**, alternate source context.

Both use the reviewed Forged Dwarf Star recommendation. Their Echo/Sonata choices remain mode-specific, Energy Regen remains a priority without fabricated numeric gates where the reviewed contexts do not support one, and both rotations remain `SOURCE_SEQUENCE_ONLY`. Denia is build-ready but not DPS-ready.

### Horizontal Profile Cohort Pipeline — Cohort 01

The next throughput workstream is horizontal rather than Character-by-Character.

Cohort 01 stages **15 current `PROFILE_SOURCE_PENDING` Characters** from the existing reviewed source checkpoint:

- five remaining `MULTI_MODE`: Lucilla, Lumi, Rover (Havoc), Yangyang, Yinlin;
- ten `MISSING_CONTEXT`: Baizhi, Brant, Calcharo, Cantarella, Carlotta, Changli, Chisa, Chixia, Encore, Jianxin.

The fixed review order is:

1. `MODE_TEAM_CONTEXT`;
2. `WEAPON`;
3. `ECHO_SONATA`;
4. `STATS_ER`;
5. `SOURCE_ROTATION`;
6. `EXECUTION_ADAPTERS`;
7. `PROMOTION_FREEZE`.

The cohort representation deliberately separates **source-field extraction state** from **semantic review state**. A field being present in source data is not approval. Every generated materialization candidate remains `NOT_VERIFIED` with `canonicalWriteAllowed=false` until explicit semantic review and the normal canonical promotion path run.

Missing fields are parked per Character/mode instead of aborting the batch. This allows the rest of a 10–20 Character cohort to continue while preserving blockers exactly.

No Cohort 01 staging record invents numeric ER, mode/default choice, uptime, scaling or mechanics. Existing reviewed source data is reused instead of being researched repeatedly.

### Profile × Adapter dependency matrix

Execution work is now mapped from canonical backward-impact `pendingExecutionIds` into a machine-readable Profile × Adapter dependency matrix.

Current canonical impact inventory contains:

- **11 backward-impact reviews**;
- **11 reviewed canonical profiles**;
- **10 profiles with pending execution dependencies**;
- **46 exact pending execution edges**.

The matrix ranks syntactically shared reusable primitive candidates by profile/Character fanout while preserving every exact pending ID. It explicitly excludes `rotation:*:engine-model` from generic reuse prioritization because a shared suffix does not make profile-specific rotations semantically identical.

Current highest syntactic reuse candidates include:

- Impermanence Heron active/transfer adapter — 3 profiles / 3 Characters;
- generic Weapon target-state adapter suffix — 2 profiles / 2 Characters.

These groupings are prioritization hints only. They do **not** prove semantic equivalence, authorize an adapter implementation, close a backward-impact review, or mark anything `ENGINE_MODELED` / `DPS_READY`.

See [`DPS_EXECUTION_GAP_MATRIX.md`](DPS_EXECUTION_GAP_MATRIX.md) for the detailed execution boundary.

## DPS execution

### Augusta — first narrow DPS-ready vertical slice

Augusta remains the single `DPS_READY` profile, only for the locked `augusta-standard` S0 / Thunderflare Dominion R1 / Iuno + The Shorekeeper personal-DPS context with `AUGUSTA_STD_V1`.

This does not claim generic Augusta execution, arbitrary team support, broad team DPS, arbitrary Sequence/Weapon contexts or roster-wide DPS readiness.

## Verification contract

During iteration, scoped verification may be used. A final PR head intended for merge must still pass the repository’s full exact-head verification surface, including:

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
- PR #106 — Denia source-conditioned multi-mode profiles, squash-merged as `3fb45fb6016f49c09609e32ea528d7c1ac0ea559` after exact-head Verify/Export success; post-merge Verify/Export/deploy also passed.

## Next work

1. Land the horizontal cohort/review and Profile × Adapter dependency infrastructure without changing canonical profile counts.
2. Work Cohort 01 horizontally: mode/team/context across the cohort first, then weapon, Echo/Sonata, stats/ER, source rotations, execution dependencies and finally promotion/freeze.
3. Reuse the existing reviewed source checkpoint; research only genuinely missing or stale fields.
4. Park source blockers per Character/mode so one unresolved row does not stop the cohort.
5. Prefer reusable execution primitives that unlock multiple verified profiles, but require semantic evidence before treating syntactically similar pending IDs as one implementation.
6. Keep raw data, Character Mechanics, effects, profiles, execution/combat-DPS and UI as separate layers.
7. Do not start broad roster-wide Character DPS merely because Augusta has one narrow frozen execution path.
