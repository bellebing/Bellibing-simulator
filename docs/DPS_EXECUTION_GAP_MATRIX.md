# Bellibing Simulator — DPS Execution Gap Matrix

This document records the current supported-profile execution boundary. Canonical game/profile truth lives in the data/effect/profile registries and backward-impact reviews; this roadmap view does not create new truth or independently authorize DPS execution.

A source-backed build/profile may be complete while still being non-executable. `SOURCE_SEQUENCE_ONLY`, pending trigger/state adapters, pending Echo active execution and unresolved target-state semantics remain hard blockers for `DPS_READY`.

## Current execution baseline

Live readiness after merged PR #106 is:

- **18 `PROFILE_COMPLETE_PENDING_FREEZE`**;
- **3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`**;
- **35 `PROFILE_SOURCE_PENDING`**;
- **1 `DPS_READY`**.

Augusta remains the one narrow `DPS_READY` profile. Aalto, Zhezhi and Denia are build/profile-ready source-conditioned checkpoints whose reviewed rotations remain `SOURCE_SEQUENCE_ONLY`; they are not executable DPS models.

## Profile × Adapter dependency matrix

`src/profileAdapterDependencyMatrix.ts` derives a machine-readable dependency graph directly from canonical `PROFILE_BACKWARD_IMPACT_REVIEWS_V36` `pendingExecutionIds`.

Current canonical impact coverage represented by the matrix:

- **11 backward-impact reviews**;
- **11 reviewed canonical profiles**;
- **10 profiles with pending execution dependencies**;
- **46 exact pending execution edges**.

Every edge retains:

- backward-impact review ID;
- Character ID;
- preset ID;
- exact `pendingExecutionId`;
- execution layer;
- a syntactic primitive key used only for reuse prioritization.

The audit `npm run audit:profile-adapters` fails if the matrix drops any canonical pending edge or accidentally puts profile-specific rotation engine models into the reusable queue.

### Reuse prioritization rule

The matrix ranks reusable primitive **candidates** by profile fanout, then Character fanout, then dependency count.

Current highest syntactic reuse candidates include:

| Primitive candidate | Current fanout | Meaning |
| --- | ---: | --- |
| `echo:impermanence-heron-active-transfer-adapter` | 3 profiles / 3 Characters | Shared pending Echo active/transfer shape across Aalto, Iuno and Zhezhi. Semantic compatibility still requires implementation review. |
| `weapon:target-state-adapter` | 2 profiles / 2 Characters | Shared pending target-state suffix across Cartethyia and Ciaccona. The exact Weapon effects remain separate source truth. |

`rotation:*:engine-model` is deliberately grouped only for reporting and is marked `PROFILE_SPECIFIC_EXECUTION`. It is excluded from the reusable priority queue. Ten profiles having a pending rotation engine model does not mean one generic rotation adapter can execute them.

The syntactic grouping is a throughput hint, not semantic evidence. It never:

- changes a profile from `SOURCE_SEQUENCE_ONLY` to `ENGINE_MODELED`;
- marks a pending backward-impact item closed;
- fabricates uptime, target state, scaling or mechanics;
- authorizes `DPS_READY`.

## Current first-slice execution examples

| Character / preset | Rotation state | Current execution disposition | Representative remaining boundary |
| --- | --- | --- | --- |
| Augusta — `augusta-standard` | `ENGINE_MODELED` via `AUGUSTA_STD_V1` | **DPS_READY only for the locked supported personal-DPS context** | No pending execution IDs for the reviewed supported path. |
| Aalto — `aalto-hybrid-jiyan` | `SOURCE_SEQUENCE_ONLY` | `PROFILE_COMPLETE_PENDING_FREEZE` | Static Mist next-Resonator transfer, Impermanence Heron active/transfer, profile rotation engine model. |
| Cartethyia — `cartethyia-aero-erosion` | `SOURCE_SEQUENCE_ONLY` | `PROFILE_COMPLETE_PENDING_FREEZE` | Defier's Thorn timing/target-state, Fleurdelys restriction, profile rotation engine model. |
| Ciaccona — `ciaccona-cartethyia-aero` | `SOURCE_SEQUENCE_ONLY` | `PROFILE_COMPLETE_PENDING_FREEZE` | Woodland Aria trigger uptime/target-state, profile rotation engine model. |
| Rover (Aero) — `rover-aero-cartethyia-ciaccona` | `SOURCE_SEQUENCE_ONLY` | `PROFILE_COMPLETE_PENDING_FREEZE` | Bloodpact's Pledge uptime/team amplify, Fleurdelys restrictions/active damage, profile rotation engine model. |
| Iuno — `iuno-augusta-hybrid` | `SOURCE_SEQUENCE_ONLY` | `PROFILE_COMPLETE_PENDING_FREEZE` | Moongazer's Sigil state/stack semantics, Impermanence Heron active/transfer, profile rotation engine model. |
| The Shorekeeper — `shorekeeper-augusta-support` | `SOURCE_SEQUENCE_ONLY` | `PROFILE_COMPLETE_PENDING_FREEZE` | Stellar Symphony resource/team-uptime, Fallacy active damage, profile rotation engine model. |
| Zhezhi — Empyrean / Moonlit presets | `SOURCE_SEQUENCE_ONLY` | `PROFILE_COMPLETE_PENDING_FREEZE` | Mode-specific Weapon/Sonata/Echo execution plus separate profile rotation engine models. Moonlit includes Impermanence Heron active/transfer. |
| Denia — Fusion Burst / Tune Strain presets | `SOURCE_SEQUENCE_ONLY` | `PROFILE_COMPLETE_PENDING_FREEZE` | Mode-specific Sonata/Echo execution and separate source-conditioned rotation engine models. |

The exact authoritative pending IDs remain in the canonical backward-impact review catalog and are what the runtime matrix consumes; this table is intentionally a readable summary rather than a second hand-maintained truth source.

## Horizontal profile throughput relation

Profile-source work and execution work are separate pipelines.

For horizontal Cohort 01, the order is:

1. mode/team/context;
2. weapon;
3. Echo/Sonata;
4. stats/ER;
5. source rotation;
6. execution adapters/dependencies;
7. promotion/freeze.

Source extraction can stage a `NOT_VERIFIED` materialization candidate, but canonical promotion is a later semantic review action. Blocked fields stay parked per Character/mode so the rest of the cohort continues.

Once a profile path is canonically promoted, fresh backward-impact review adds its exact execution dependencies to this matrix. That lets generic primitives be prioritized by measured fanout without making Character-specific assumptions.

## Freeze rule

A supported profile may become `PROFILE_COMPLETE_PENDING_FREEZE` while still non-executable. Freeze approval requires all of the following for the exact supported path:

1. canonical verified profile truth;
2. a current backward-impact review;
3. zero unresolved pending execution IDs;
4. independently implemented and regression-tested execution adapters;
5. an `ENGINE_MODELED` rotation where DPS execution is claimed;
6. normal repository audits/tests/build/browser verification.

This prevents a recommendation-guide sequence from silently becoming a combat simulator assumption.
