# DPS execution — public coverage and readiness contract

This document explains how to read the **public source-backed execution inventory**. It is not a live numerical status dashboard: derive current profile counts and pending dependency IDs from `src/profileExecutionWorkQueue.ts`, canonical profiles/reviews and the corresponding current tests. Current user-facing readiness is recorded in [PROJECT_STATUS.md](PROJECT_STATUS.md).

## Readiness gate

A profile is `DPS_READY` only when its specific reviewed canonical build has a current backward-impact review with **zero pending execution IDs**, independently tested execution adapters, an `ENGINE_MODELED` rotation with a **source-backed total duration/DPS denominator**, verified BuildContext binding and full repository gates. This is a **per-profile** gate, never a blanket whole-team or player-build evaluator authorization.

Standalone effect quantities, generic damage formulas, isolated hit bridges, effect-trigger primitives and source sequences can be available while Character/team execution remains **PENDING**. Never replace disputed game facts or missing timelines with inferred values; missing is not zero.

## Historical registry snapshot (September 2026 only)

At the merged PR #198 checkpoint the reviewed queue recorded **83 pending profile–dependency edges / 72 distinct dependency IDs**, with readiness partition **43 `PROFILE_COMPLETE_PENDING_FREEZE` / 3 `CHARACTER_MECHANICS_SOURCE_BLOCKED` / 9 `PROFILE_SOURCE_PENDING` / 2 `DPS_READY`** (Augusta and Ciaccona in their *then* bounded contexts). The queue's edge partition was **24 `UNREVIEWED` / 0 `SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING` / 24 `PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE` / 7 `BLOCKED_SOURCE_CONFLICT` / 11 `BLOCKED_SOURCE_SEMANTICS` / 17 `PROFILE_SPECIFIC_EXECUTION`**.

**These are dated counts, not October 2026 run results or a team-DPS claim.** Re-run the current profile/readiness audits before publishing any updated numbers. Shared dependency IDs may occur across multiple profiles and must not be double-counted as distinct fact families.

## Source validity and mechanics gaps

| Source / execution boundary | Why a generic adapter cannot complete it |
| --- | --- |
| Exact source-qualified damage event | Requires hit owner, component, type, target, landed count and independently qualified per-build quantities. |
| Weapon self/team timed windows and cast-resource effects | Trigger, owner/equipment, recipient, start/expiry, repetition and selected rank must be source-qualified. |
| Character Outro transfer and healing-trigger windows | Exact incoming recipient/team membership, applied-heal event, scope, switch/handoff and event order cannot be inferred. |
| Sonata activation and target state | Exact equipped membership, caster, timestamp and target-state predicates must be proven. |
| Active Echo damage | Variant, rank, hit count, event occurrence and damage classification remain separate from a source text coefficient. |
| Energy / Concerto / Forte resources | Source-proven action state, gains, consumption and profile time sequence must be modeled, not filled with a static average. |
| `SOURCE_SEQUENCE_ONLY` rotation | Action ordering alone does not prove the elapsed denominator, overlaps, legal resources or a whole-team event timeline. |

## Known source-qualified blockers

These dated examples remain explicit **source/blocker categories**; consult the live bug register and current source reviews for their *present* disposition rather than treating the historical list as an open-bug count.

| Historical blocker | Required missing or disputed evidence |
| --- | --- |
| BUG-008 — Impermanence Heron | Hit-armed versus cancel/cast-armed transfer conflict. |
| BUG-009 — Stringmaster / Rime-Draped Sprouts | Shared stack refresh vs independent expiry behavior. |
| BUG-010 — Fallacy | Exact active-damage normal/tap vs hold/release variant. |
| BUG-011 — Defier's Thorn | Executable timing/lifecycle for the DEF effect. |
| BUG-012 — Rover (Aero) / Bloodpact | Exact rotation duration and 6-second Skill-DMG healing overlap; optional events remain optional. |
| BUG-013 — Blazing Brilliance | At-cap stack/timer mutation semantics. |
| BUG-014 — Changli | Source-backed total duration, not only a relative timing delta. |

Representative September context blockers included Carlotta's attack variant and rotation, Cartethyia's timing, Rover Aero's healing/sequence and Changli's stack lifecycle. Augusta and Ciaccona had then-verified **bounded** personal-context execution; these facts do **not** authorize normal-human whole-team DPS, cross-roster comparison or private economic optimizer policy.

## Public sources and verification

Execution capability is owned by current modules such as `src/profileExecutionWorkQueue.ts`, public `src/combat/`, Character Mechanics/effect registries and profile backward-impact reviews. Consult [source-valid execution evidence](SOURCE_VALID_EXECUTION_REVIEW_20260911.md), [profile execution closure review](PROFILE_EXECUTION_CLOSURE_REVIEW_20260912.md), [Character database/provenance](CHARACTER_DATABASE.md) and the [combat-context contract](COMBAT_CONTEXT_CAMPAIGN_20260915.md).

Historical [PR #198](https://github.com/bellebing/Bellibing-simulator/pull/198) is an inspectable public integration record, not a current live readiness gate. Tested, exact-context execution and real source evidence — **not document length, planning rank or primitive count** — determine new profile approval.
