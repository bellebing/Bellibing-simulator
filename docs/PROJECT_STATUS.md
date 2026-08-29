# Bellibing Simulator — Current Project Status

This document is the current implementation and roadmap checkpoint for Bellibing Simulator.

The accumulated pre-2026-08-29 history is preserved in [`PROJECT_STATUS_HISTORY_2026-08-29.md`](PROJECT_STATUS_HISTORY_2026-08-29.md). Use this file for the **current** state; use Git history and the archive for detailed chronology.

`FOUNDATION` means architecture exists and is tested but supported-content coverage is incomplete.  
`COMPLETE` means the layer has the data/behavior required for its supported scope with no known blocking gap.  
`BLOCKED` means a known gap prevents that layer from being called complete.

Bellibing has **not** passed the full Pre-DPS Completeness Gate. Broad roster-wide Character DPS expansion remains blocked; narrow verified vertical slices may be frozen individually when their exact execution gaps are closed.

## Current checkpoint

### Echo Core — COMPLETE FOR ELIGIBLE-CANDIDATE TUNING

Rank-5 COST 1/3/4 main-stat pools, exact checkpoint-scaled primary/secondary main stats, all 13 substat types, verified roll values/probabilities, sequential tuning, EXP/Tuner/Shell Credit costs, recycle/feed recovery, seeded reproduction and separate five-Echo/COST-12 loadout validation are implemented and regression-tested.

Fresh world-drop desired-main acquisition probabilities remain outside the verified runtime. This does not block Roll Assist for an Echo the user already owns.

### Echo Lab — COMPLETE FOR MECHANICAL ORACLE

Echo Lab consumes the shared Echo Core runtime and remains the canonical validation surface for verified Rank-5 tuning mechanics, resource accounting and seeded reproduction.

### Roll / stopping policy — COMPLETE FOR PROFILE FALLBACK; FINAL DPS-AWARE POLICY PENDING

The fallback checkpoint policy is profile-driven. Profiles own Core/Useful targets and required hit counts; reachability uses exact remaining unique slots and roll magnitudes.

This is not the final Bellibing decision rule. Whole-build DPS-aware stopping remains dependent on verified Character combat/DPS execution.

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

The three source-blocked Characters remain:

- **Buling** — exact Five Thunders Spell Array Continuous DMG coefficients exist, but current source does not explicitly establish the required damage-bonus classification;
- **Danjin** — current Ruby Blossom semantics simultaneously cap the resource at 120 and require `over 120` for the enhanced branch;
- **Xiangli Yao** — Pivot - Impale has exact coefficients but lacks an explicit current-source damage-bonus classification.

They must not receive DPS adapters until new evidence resolves those blockers and normal canonical review passes.

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

Current specialized pending Echo boundaries remain explicit and are consumed only when a supported profile actually requires them.

## Composable profiles — ACTIVE PRE-DPS WORKSTREAM

Independent catalogs exist for Weapon Recommendation, Echo Loadout, Stat Target, Team, Rotation and Character Preset. Raw game data remains separate from recommendation/profile composition.

### Candidate throughput pipeline

A fail-closed Profile Candidate Pipeline now mirrors the successful Character Mechanics ingestion pattern:

- generated/researched candidates are always `NOT_VERIFIED` / `CANDIDATE_ONLY`;
- automation cannot write canonical profile truth;
- mechanical validation, source/context disposition and specialized execution requirements are separated;
- `SOURCE_SEQUENCE_ONLY` remains non-executable;
- readiness counts are derived from live registries instead of copied manual snapshot gates.

The initial inventory covered the **48 Characters that were `PROFILE_SOURCE_PENDING` before this tranche**:

- **10 `READY_FOR_REVIEW`**;
- **8 `MULTI_MODE`**;
- **26 `MISSING_CONTEXT`**;
- **0 `SOURCE_CONFLICT`**;
- **4 `RAW_PREFLIGHT_BLOCKED`**.

Execution inventory for the same 48 rows: **38 `NO_KNOWN_SPECIALIZED_ADAPTER` / 10 `SPECIALIZED_ADAPTER_REQUIRED`**.

### First throughput promotion batch

The ten clean source rows were promoted as one canonical profile batch:

- Aemeath;
- Camellya;
- Galbrena;
- Hiyuki;
- Jinhsi — standard opener context only;
- Luuk Herssen;
- Lynae;
- Sigrika;
- Yangyang (Xuanling);
- Zani.

Their profile packages are source-backed and VERIFIED, but their reviewed rotations remain `SOURCE_SEQUENCE_ONLY`. This is recommendation/build completeness, **not executable DPS**.

### Current readiness

Live registry-derived readiness is now:

- **15 `PROFILE_COMPLETE_PENDING_FREEZE`**;
- **3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`**;
- **38 `PROFILE_SOURCE_PENDING`**;
- **1 `DPS_READY`**.

Raw DPS blockers remain Qingxiao, Rover (Electro) and Suisui. Mornye remains intrinsic-DPS-blocked.

### Augusta — first narrow DPS-ready vertical slice

Augusta is the first profile with a closed narrow execution path:

- preset: `augusta-standard`;
- S0;
- Thunderflare Dominion R1;
- Iuno + The Shorekeeper team context;
- `AUGUSTA_STD_V1` executable rotation;
- personal Augusta rotation DPS only;
- current-patch backward-impact review `PROFILE-IMPACT-AUGUSTA-2026-08-29-01` is `REVIEWED_NO_BLOCKING_PROFILE_CHANGE` with zero pending execution IDs;
- canonical verified-profile → `BuildContext` bridge is required and verified;
- freeze approval is fail-closed against real backward-impact evidence and adapter closure.

This **does not** claim generic Augusta execution, arbitrary team support, broad team DPS, arbitrary Sequence/Weapon contexts or roster-wide DPS readiness.

See [`DPS_EXECUTION_GAP_MATRIX.md`](DPS_EXECUTION_GAP_MATRIX.md) for the exact remaining execution adapters for Cartethyia, Ciaccona, Rover (Aero), Iuno and The Shorekeeper.

## BUG-001 — Live Roll Assist

Status: **OPEN / BLOCKER until deployed live-browser verification passes**.

A confirmed UI integration defect was found: the previous Roll Assist UI caught any checkpoint integration/runtime exception and transformed it into a normal `DISCARD` verdict. That made an integration failure capable of masquerading as a policy decision.

The implementation now has one deterministic checkpoint boundary:

`recordCheckpoint → evaluateTargetCheckpoint → applyCheckpointAssessment`

Integration errors propagate separately and the UI renders `ROLL ASSIST ERROR` instead of `DISCARD`.

Regression evidence on the PR build artifact:

- **452 / 452 Node tests pass**;
- strict web build passes;
- real headless Chrome against the built artifact verifies:
  - **+5 CRIT Rate 6.3% → DISCARD**;
  - **+5 CRIT Rate 9.3% → ROLL TO +10**;
  - **+10 CRIT Rate 9.3% + Flat DEF → ROLL TO +15**;
- integration-fault regression proves invalid checkpoint flow throws instead of becoming `DISCARD`;
- `git diff --check` passes.

Deploy smoke has been upgraded to run the same three verdict paths in real headless Chrome against the deployed GitHub Pages site. **BUG-001 must remain OPEN until that post-merge deployed smoke passes.**

The fix proves a defect capable of generating false DISCARD behavior and proves the required paths after the fix. It does not retroactively claim that the exact pre-fix production report was independently reproduced if that evidence is unavailable.

## Active PR / verification

Current implementation is in **PR #102 — `Scale profile ingestion and freeze first DPS-ready path`**.

Before merge, the final PR head must pass:

- Echo/Sonata raw audit;
- Sonata effect audit;
- Echo skill audit;
- Profile candidate inventory audit;
- Profile readiness/freeze audit;
- full Node test suite;
- strict web build;
- real-browser Roll Assist artifact regression;
- `git diff --check`;
- Export workflow;
- Import Character Mechanics workflow.

After merge, Verify / Export / Deploy must pass on `main`, and deployed Chrome verdict smoke must pass before BUG-001 is closed.

## Next work after this tranche

1. Merge PR #102 only after final CI/review is clean.
2. Verify `main` post-merge workflows and deployed Roll Assist Chrome verdict paths.
3. Close BUG-001 only with that deployed evidence and update the AI Handoff update log + bug register.
4. Continue profile throughput from the inventory: clean source batches first, then explicitly resolved `MULTI_MODE` rows.
5. Keep missing-context/raw-blocked rows parked instead of letting them block unrelated clean batches.
6. Do **not** start broad roster-wide Character DPS merely because Augusta has one narrow frozen execution path; close each profile’s explicit execution matrix independently.
