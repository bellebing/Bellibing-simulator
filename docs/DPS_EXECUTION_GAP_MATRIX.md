# Bellibing Simulator — DPS Execution Gap Matrix

This document records the current supported-profile execution boundary for the first composable profile tranche. It is a roadmap view of the canonical evidence in `src/data/profileBackwardImpactReview.ts`; it does not create new game truth or independently authorize DPS execution.

A source-backed build/profile may be complete while still being non-executable. `SOURCE_SEQUENCE_ONLY`, pending trigger/state adapters, pending Echo active execution and unresolved target-state semantics remain hard blockers for `DPS_READY`.

## Current first-slice matrix

| Character / preset | Rotation state | Current execution disposition | Explicit remaining execution gaps |
| --- | --- | --- | --- |
| Augusta — `augusta-standard` | `ENGINE_MODELED` via `AUGUSTA_STD_V1` | **DPS_READY for the locked S0 / Thunderflare Dominion R1 / Iuno + Shorekeeper personal-DPS context only** | None for this exact supported path. `PROFILE-IMPACT-AUGUSTA-2026-08-29-01` is `REVIEWED_NO_BLOCKING_PROFILE_CHANGE`; the generic verified-profile → `BuildContext` bridge is required and verified. This is not broad Augusta team-DPS/general-context coverage. |
| Cartethyia — `cartethyia-aero-erosion` | `SOURCE_SEQUENCE_ONLY` | `PROFILE_COMPLETE_PENDING_FREEZE` | `weapon:defiers-thorn:DT-DEF:source-timing-adapter`; `weapon:defiers-thorn:DT-AERO-AMP:target-state-adapter`; `echo:echo-60001065:fleurdelys-character-restriction-adapter`; `rotation:cartethyia-basic-ciaccona-rover-aero:engine-model` |
| Ciaccona — `ciaccona-cartethyia-aero` | `SOURCE_SEQUENCE_ONLY` | `PROFILE_COMPLETE_PENDING_FREEZE` | `weapon:woodland-aria:WA-AERO:trigger-uptime-adapter`; `weapon:woodland-aria:WA-AERO-RES:target-state-adapter`; `rotation:ciaccona-basic-cartethyia-rover-aero:engine-model` |
| Rover (Aero) — `rover-aero-cartethyia-ciaccona` | `SOURCE_SEQUENCE_ONLY` | `PROFILE_COMPLETE_PENDING_FREEZE` | `weapon:bloodpacts-pledge:BPP-SKILL:healing-uptime-adapter`; `weapon:bloodpacts-pledge:BPP-TEAM-AERO:unbound-flow-team-amplify-adapter`; `echo:echo-60001065:fleurdelys-character-restriction-adapter`; `echo:echo-60001065:active-skill-damage-adapter`; `rotation:rover-aero-cartethyia-ciaccona-standard:engine-model` |
| Iuno — `iuno-augusta-hybrid` | `SOURCE_SEQUENCE_ONLY` | `PROFILE_COMPLETE_PENDING_FREEZE` | `weapon:moongazers-sigil:MGS-LIB:trigger-uptime-adapter`; `weapon:moongazers-sigil:MGS-DEF:shield-stack-state-adapter`; `weapon:moongazers-sigil:MGS-MAX-STACK:cross-effect-stack-override-adapter`; `echo:echo-60000525:impermanence-heron-active-transfer-adapter`; `rotation:iuno-augusta-sub-dps-standard:engine-model` |
| The Shorekeeper — `shorekeeper-augusta-support` | `SOURCE_SEQUENCE_ONLY` | `PROFILE_COMPLETE_PENDING_FREEZE` | `weapon:stellar-symphony:SSY-CONCERTO:resource-event-adapter`; `weapon:stellar-symphony:SSY-TEAM-ATK:healing-skill-team-uptime-adapter`; `echo:echo-60000605:fallacy-active-skill-damage-adapter`; `rotation:shorekeeper-augusta-support-standard:engine-model` |

## Throughput rule

Profile-source ingestion and DPS execution are intentionally separate workstreams:

1. source research/transcription may produce candidate rows only;
2. review resolves mode/context and canonical raw IDs;
3. canonical profile promotion may reach `PROFILE_COMPLETE_PENDING_FREEZE` while its rotation remains `SOURCE_SEQUENCE_ONLY`;
4. backward-impact review enumerates the exact Weapon/Sonata/Echo/rotation execution gaps required by that supported path;
5. only independently modeled and regression-tested adapters may close those gaps;
6. freeze approval requires a real current-patch `REVIEWED_NO_BLOCKING_PROFILE_CHANGE` review with zero pending execution IDs and verified adapter closure.

This prevents a recommendation guide sequence from silently becoming a combat simulator assumption.

## Current throughput inventory checkpoint

The initial inventory covered the **48 Characters that were `PROFILE_SOURCE_PENDING` before this tranche**. Its source/review dispositions were:

- **10 `READY_FOR_REVIEW`**;
- **8 `MULTI_MODE`**;
- **26 `MISSING_CONTEXT`**;
- **0 `SOURCE_CONFLICT`**;
- **4 `RAW_PREFLIGHT_BLOCKED`**.

The ten clean `READY_FOR_REVIEW` rows were promoted as one canonical source-profile batch: Aemeath, Camellya, Galbrena, Hiyuki, Jinhsi (standard opener context), Luuk Herssen, Lynae, Sigrika, Yangyang (Xuanling) and Zani. Their reviewed rotations remain `SOURCE_SEQUENCE_ONLY`; profile completeness does not imply executable DPS.

After that promotion, current readiness is derived from the live registries rather than copied count gates: **15 `PROFILE_COMPLETE_PENDING_FREEZE` / 3 `CHARACTER_MECHANICS_SOURCE_BLOCKED` / 38 `PROFILE_SOURCE_PENDING` / 1 `DPS_READY`** across 57 released Characters.

## Roll Assist relation

Augusta becoming narrowly `DPS_READY` does not by itself close Roll Assist UI correctness. `BUG-001 Live Roll Assist` is a separate UI/runtime blocker and requires the known verdict paths to pass through the real deployed browser UI. Unit/integration success alone is not sufficient evidence for bug closure.
