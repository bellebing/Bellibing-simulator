# Reference Team 01 — current architecture audit

Audited 2026-09-08 from main `b16552da92a35a717c179a3801b262d728cbba97`, before implementation in overnight PR #190. This refreshes the [2026-09-03 foundation audit](REFERENCE_TEAM_01_FOUNDATION_AUDIT.md); it does not repeat its implementation backlog as if the intervening work were absent. Product contract: [Best Available Teams](BEST_AVAILABLE_TEAMS_DIRECTION.md). No new Wuthering Waves source facts or execution approvals are asserted.

## End-to-end trace

| Layer | Actual current path | Boundary |
| --- | --- | --- |
| Raw/source | `data/characterMechanics/{augustaRawFacts,iunoRawFacts,theShorekeeperRawFacts}.ts`; weapon, Sonata and Echo catalogs | Canonical values/conditions/provenance stay here. Historical V9.15 aggregates are deliberately separate in `characters/augustaStandardMotionValues.ts`. |
| Mechanics/effects | Iuno Outro/Wan Light, Shorekeeper Outro/Stellarealm/healing and Fallacy adapters; shared incoming-transfer and timed-window primitives | Executable source contracts consume explicit events and query state. A supported primitive never proves a profile timeline. |
| Profiles/team identity | `data/characterBuildPresets.ts`, `teamProfiles.ts`, `profileRegistry.ts`; `teamExecutionContext.ts` and `data/referenceTeam01ExecutionContext.ts` | Exact three member presets/default gear plus source-linked contribution IDs now exist. `PARTIAL`, six unresolved dependencies and `dpsReady=false` are preserved. This identity/dependency manifest was missing in the old audit and is now implemented. |
| Execution/rotation state | `referenceTeam01*AugustaCoverage.ts` with reviewed evidence in `data/referenceTeam01ExecutionEvidence20260905.ts` | Iuno Outro/Moonlit cover the fixed Augusta envelope; Shorekeeper Outro overlap and Stellarealm stage/recipient are source-reviewed. Query-time ER composition, Wan Light and healing/Fallacy overlap still require missing evidence. Iuno/Shorekeeper personal rotations remain `SOURCE_SEQUENCE_ONLY`. |
| BuildContext/DPS | `profileBuildContext.ts` -> `ownedBuildAnalysis.ts` -> `characters/augustaEchoEvaluator.ts` -> `augustaStandard.ts` -> `combat/damageKernel.ts` | The current personal-DPS path uses a locked historical parity context. It checks team ID/engine/weapon/sequence, but does not consume the partial resolved team context. This is not arbitrary-team execution or total team DPS. |
| Product projection | `alphaEntryModel.ts`, `ownedBuildAnalysis.ts`, `ownedBuildUpgradeAnalysis.ts`, Roll Assist bindings; `characterDatabase.ts` | Team display comes from canonical profiles; only registered personal engines reach owned-build output. The database exposes the actual partial team manifest. No UI files need changing for this audit. |

## Current dispositions

| ID | Disposition | Finding and evidence | Smallest useful action |
| --- | --- | --- | --- |
| RT01-A01 | KEEP | Character source facts, effect catalogs, profile identity, backward-impact review and readiness registry have different responsibilities. | Preserve these layers. Their checks are not duplicate canonical databases. |
| RT01-A02 | KEEP | `incomingTransferState.ts` already supports `CHARACTER`; Iuno Outro and shared Static Mist use it. Rejuvenating Glow's Shorekeeper wrapper already delegates to shared applied-heal execution. | Reuse the implemented primitives; do not rebuild the old audit's missing transfer layer. Keep source-specific trigger guards in adapters. |
| RT01-A03 | KEEP | Augusta's action recipe/Crown/weapon state and historical motion aggregates belong to its exact parity engine. Iuno's Domain/Wan Light and Shorekeeper's Stellarealm evolution are real Character semantics. | Keep Character-specific execution where the mechanics require it. Do not replace it with a universal gameplay language. |
| RT01-A04 | SIMPLIFY | `AugustaStandardContext` mixes encounter/self/gear fields with Shorekeeper crit, Iuno amplification/Wan Light and an opaque `.37` ATK aggregate. The separate `SUPPORTED.teamId` does not explicitly bind those scalars to the parity fixture. | Isolate the existing historical teammate/mixed aggregate fields in one immutable, explicitly team-bound parity context. Reuse that identity at the existing evaluator gate. Preserve every numeric value and action result; unsupported team replacement must not inherit the fixture. This is isolation, not current team composition. |
| RT01-A05 | PARK/DELETE | The `.37` historical ATK aggregate includes the old support package and duplicated Thunderflare ATK already documented in the prior audit. Current support gear differs. | PARK the scalar correction/rebaseline. Do not apply `.37 -> .25`, fill missing buff uptime or call the old aggregate current canonical contribution truth. Retain the historical oracle until a complete current context can replace it. |
| RT01-A06 | SIMPLIFY | `profileBuildContext.ts` and `teamExecutionContext.ts` repeat the same verified-package/default-weapon resolution. | Share only that existing profile-resolution operation, while keeping personal `ENGINE_MODELED` gating separate from source-only teammate identity. This removes duplicated selection logic for all presets without adding a validation layer or granting execution. |
| RT01-A07 | SIMPLIFY | `ResolvedTeamExecutionContext` returns copied arrays containing shared dependency objects and selected Sonata arrays from its input/registry. | Return a detached read model, as Character database already does. A caller changing a candidate must not mutate the canonical reference manifest or another candidate. Preserve identity and all readiness values; add mutation-isolation regression coverage. |
| RT01-A08 | MISSING | A current composed combat context with provenance-linked resolved contributions is still not consumed by an arbitrary-team evaluator. `BuildContext.teamId` is not a teammate state/loadout contract. | Keep replacement outside the locked engine. Future current-team execution must require its explicit resolved context and reject required PENDING/UNKNOWN, without falling back to old parity bonuses. Do not add a speculative numeric context now. |
| RT01-A09 | MISSING | Best Available Teams lacks source-reviewed preset/mode field-time, benefit/consumer, off-field, hard-conflict and state-prerequisite contracts, and enough executable total-team results. | Keep them missing. Role labels and `SOURCE_SEQUENCE_ONLY` cannot supply scores, durations, feasibility or a greedy/global optimizer. No speculative compatibility table. |
| RT01-A10 | PARK/DELETE | Legacy parity fixtures and the separate Recommended rolling policy still have active consumers and distinct regression/product contracts. | PARK retirement until a proven replacement exists; no dead runtime layer was demonstrated by this trace. Do not delete merely because a layer is old. |

## Exact parked source/timeline blockers

The six existing Reference Team dependencies remain unchanged. These are missing evidence, not requests for additional validation wrappers:

| Dependency | Disposition | Required evidence |
| --- | --- | --- |
| `iuno-wan-light-at-cap-trigger-semantics` | PARK/DELETE | Source proof of duration/refresh behavior when a qualifying Shield event occurs at the cap. |
| `iuno-wan-light-augusta-event-overlap` | PARK/DELETE | Actual Full Moon Domain/recipient state and Augusta shield/damage event timestamps; the parity action-per-shield ramp is not that proof. |
| `shorekeeper-stellar-symphony-augusta-window-overlap` | PARK/DELETE | Source-qualified applied healing and exact overlap for the selected team path. |
| `shorekeeper-rejuvenating-augusta-window-overlap` | PARK/DELETE | Source-qualified applied healing and coverage; shared Rejuvenating execution alone cannot close this. |
| `shorekeeper-fallacy-team-atk-augusta-window-overlap` | PARK/DELETE | Explicit activation/coverage for the selected support Echo. |
| `shorekeeper-fallacy-wielder-er-stellarealm-state` | PARK/DELETE | Actual wielder ER window and query-time ER composition for Stellarealm; stage/recipient evidence does not establish this numeric input. |

Here `PARK/DELETE` means **park, not delete evidence or canonical pending IDs**. The 83 profile execution edges and the 43/3/9/2 readiness distribution remain as on main. Full Iuno/Shorekeeper personal DPS is not a prerequisite for each bounded support contract, but source-only rotations cannot provide a total-team DPS denominator.

## Implementation order and validation boundary

First isolate the historical Augusta team fixture (A04) and prove exact current/expected parity plus rejection of retargeted fixture identity. Then remove duplicated profile selection (A06) and shared mutable team snapshots (A07), with focused tests of source-only teammate resolution, unsupported personal execution and independent candidate mutation. These changes consume existing semantics; none changes source facts, UI output or the six pending IDs.

After these safe audit findings, continue source-valid horizontal Character/data work on the same overnight branch. Full tests/build and Verify/Export are required after the meaningful runtime group. New evidence, not architectural neatness, is required before any parked dependency can close.
