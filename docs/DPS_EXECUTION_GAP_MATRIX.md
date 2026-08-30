# Bellibing Simulator — DPS Execution Gap Matrix

This document is a readable view of the current supported-profile execution boundary. Canonical truth lives in the registries, backward-impact reviews and execution work queue; this file does not authorize execution.

## Current registry-derived baseline

Readiness:

- **24 `PROFILE_COMPLETE_PENDING_FREEZE`**;
- **3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`**;
- **28 `PROFILE_SOURCE_PENDING`**;
- **2 `DPS_READY`** — Augusta and Ciaccona.

Canonical dependency matrix:

- **18 backward-impact reviews**;
- **18 reviewed canonical profiles**;
- **16 profiles with pending execution dependencies**;
- **72 exact pending execution edges**.

The previous 25/3/28/1 and 76-edge values were stale pre-PR #123 documentation. Ciaccona's four closed dependencies are already absent from the live matrix.

## Current semantic partition

`src/profileExecutionWorkQueue.ts` currently partitions the 72 exact edges as:

- **33 `UNREVIEWED`**;
- **1 `SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING`**;
- **10 `PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE`**;
- **5 `BLOCKED_SOURCE_CONFLICT`**;
- **7 `BLOCKED_SOURCE_SEMANTICS`**;
- **16 `PROFILE_SPECIFIC_EXECUTION`**.

`UNREVIEWED + SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING` gives **34 actionable shared edges**. This is a prioritization signal only; closure work optimizes for shortest verified route to `DPS_READY` plus dependency reuse.

## Closed/reusable primitives that must not be mistaken for profile execution

### Fleurdelys character restriction

`echo-character-restriction-v1` statically resolves the extra Fleurdelys Aero bonus for canonical `cartethyia` and `rover-aero`. Those exact character-restriction dependencies are closed.

### Exact Echo active damage

`echo-active-damage-v1` resolves exact verified `ACTIVE_CAST` Echo attack facts without inventing cast time, uptime or rotation state. Reminiscence: Fleurdelys has exact Rank-5 `27.36% x8 + 136.80%` Aero damage, totaling `355.68% ATK`.

Primitive availability does **not** close a profile dependency until that profile has an executable source-proven cast path.

### Aero Erosion target state

The shared Aero Erosion state/weapon execution slice closes Ciaccona Woodland Aria `WA-AERO` / `WA-AERO-RES` and Cartethyia Defier's Thorn `DT-AERO-AMP` only where the supported event/state path proves them. Same-hit ordering and generic Aero Erosion damage are not invented.

### Ciaccona rotation

`CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1` is `ENGINE_MODELED` with a source-backed **4.5-second** total duration. Ciaccona has zero remaining pending IDs and is `DPS_READY`.

## Current source blockers

| Blocker | Exact boundary | Current disposition |
| --- | --- | --- |
| BUG-008 | Impermanence Heron transfer | `BLOCKED_SOURCE_CONFLICT`: hit-armed versus cancel/cast-armed evidence conflicts. |
| BUG-009 | Stringmaster / Rime-Draped Sprouts skill-stack lifetime | `BLOCKED_SOURCE_SEMANTICS`: refresh/shared duration versus independent expiry is unresolved. |
| BUG-010 | Fallacy profile active-damage variant | `BLOCKED_SOURCE_SEMANTICS`: supported sequences do not identify normal/tap versus hold/release. |
| BUG-011 | Defier's Thorn `DT-DEF` | `BLOCKED_SOURCE_SEMANTICS`: source does not establish a safe executable 15-second timing lifecycle. |
| BUG-012 | Rover (Aero) Standard Rotation / Bloodpact healing overlap | `BLOCKED_SOURCE_SEMANTICS`: source proves healing, Unbound Flow and Fleurdelys cast events but not exact total rotation duration or the 6-second BPP-SKILL overlap; Skyfall Severance is also optional. |

## Rover (Aero) exact remaining graph

After the already-applied Fleurdelys character-restriction closure, `rover-aero-cartethyia-ciaccona` has exactly four effective pending IDs:

1. `weapon:bloodpacts-pledge:BPP-SKILL:healing-uptime-adapter` — **BUG-012 / BLOCKED_SOURCE_SEMANTICS**. Cloudburst Dance and Omega Storm are source-proven healing events and Bloodpact grants a 6-second Skill-DMG window after Providing Healing, but the exact profile timeline needed to prove overlap is missing.
2. `weapon:bloodpacts-pledge:BPP-TEAM-AERO:unbound-flow-team-amplify-adapter` — **SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING**. Unbound Flow P1 is explicitly in the canonical source sequence and the weapon grants a 30-second team Aero amplification after Rover (Aero) casts Unbound Flow. Runtime/team-state execution remains unimplemented.
3. `echo:echo-60001065:active-skill-damage-adapter` — **PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE** via `echo-active-damage-v1`. Prydwen Echo Usage explicitly places Fleurdelys after Unbound Flow P1 and before switching out, so the cast event is source-proven; the profile is still not executable.
4. `rotation:rover-aero-cartethyia-ciaccona-standard:engine-model` — **PROFILE_SPECIFIC_EXECUTION / BUG-012**. No exact source-backed `rotationSeconds` exists for the fixed Standard Rotation and the sequence retains optional Skyfall Severance.

No Rover pending ID closes in this tranche. The correct action is to park BUG-012 rather than fabricate timestamps or blanket uptime.

## Representative supported-profile state

| Character / preset | Rotation | Remaining boundary |
| --- | --- | --- |
| Augusta — `augusta-standard` | `ENGINE_MODELED` | Zero pending IDs; `DPS_READY`. |
| Ciaccona — `ciaccona-cartethyia-aero` | `ENGINE_MODELED` | Zero pending IDs; `DPS_READY`. |
| Cartethyia — `cartethyia-aero-erosion` | `SOURCE_SEQUENCE_ONLY` | `DT-DEF` / BUG-011 + exact rotation duration/engine model. |
| Rover (Aero) — `rover-aero-cartethyia-ciaccona` | `SOURCE_SEQUENCE_ONLY` | Four exact IDs above; BUG-012 prevents truthful freeze. |
| Iuno — `iuno-augusta-hybrid` | `SOURCE_SEQUENCE_ONLY` | Moongazer timing/state, Heron conflict and profile execution remain. |
| Shorekeeper — `shorekeeper-augusta-support` | `SOURCE_SEQUENCE_ONLY` | Stellar Symphony event state, Fallacy variant and profile execution remain. |

The exact authoritative pending IDs remain in canonical backward-impact reviews after fail-closed closures; this table is intentionally not a second truth source.

## Freeze rule

A profile reaches `DPS_READY` only when its verified canonical build has a current backward-impact review with zero pending IDs, independently tested execution adapters, an `ENGINE_MODELED` rotation with a verified total duration/DPS denominator, a verified BuildContext bridge and the normal repository verification surface. Shared primitives never bypass this rule.
