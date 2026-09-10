# Bellibing Simulator — DPS Execution Gap Matrix

Integration status: PR #190 is now merged/deployed through `c37b3ea5c0833f0483e2da2ac9cca36d42e1902f`; Verify #1102 / Export #1001 / Deploy #147 passed. References below to its unmerged/draft state are historical checkpoints. Its canonical gear/capability payload is now on main. New reuse-first work is on a separate branch and has no merge authorization.

This document is a readable view of the current supported-profile execution boundary. Canonical truth lives in the registries, backward-impact reviews and execution work queue; this file does not authorize execution.

Implementation state: the primitive additions below are **integrated on main through PR #189**, with post-merge Verify #1085, Export #984 and Deploy #146 green. [Integration evidence](CHARACTER_BACKEND_INTEGRATION_REVIEW.md) records the source heads and preservation checks. All 83 exact pending edges and all six Reference Team blockers remain; changing an edge to `PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE` does not resolve it. Subsequent overnight work is unmerged until separately authorized and observed on main.

PR #190 feature scope is frozen at the reviewed target-window payload. The [integration and reuse-first audit](PR190_INTEGRATION_AND_REUSE_AUDIT_20260910.md) separates seven gap classes and ranks the next bounded lane; it introduces no execution approval. Historical checkpoint counts below are not the current branch partition.

## Current registry-derived baseline

Readiness:

- **43 `PROFILE_COMPLETE_PENDING_FREEZE`**;
- **3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`**;
- **9 `PROFILE_SOURCE_PENDING`**;
- **2 `DPS_READY`** — Augusta and Ciaccona.

Canonical dependency matrix:

- **19 backward-impact reviews**;
- **19 reviewed canonical profiles**;
- **17 profiles with pending execution dependencies**;
- **83 exact pending execution edges**.

PR #126 moved profile-source readiness from 24/3/28/2 to 37/3/15/2. PR #129 then moved it to the current 43/3/9/2. The current registry includes 19 reviewed profiles and 83 pending edges; the older 18-profile/72-edge snapshot was stale. Ciaccona's four closed dependencies remain absent. These counts are derived from `audit:profile-adapters` and confer no new execution approval.

## Current semantic partition

`src/profileExecutionWorkQueue.ts` partitions the 83 exact edges on the active PR #191 branch as:

- **28 `UNREVIEWED`**;
- **0 `SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING`**;
- **22 `PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE`**;
- **7 `BLOCKED_SOURCE_CONFLICT`**;
- **9 `BLOCKED_SOURCE_SEMANTICS`**;
- **17 `PROFILE_SPECIFIC_EXECUTION`**.

`UNREVIEWED + SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING` gives **28 actionable shared edges**. This is a prioritization signal only; closure work optimizes for shortest verified route to `DPS_READY` plus dependency reuse. The semantic partition does not remove canonical pending IDs. Main through merged #190 has 30 unreviewed / 20 primitive-available; #191 adds two exact Echo attack facts for Cantarella and Zhezhi without closing their timelines or changing any pending ID.

The 2026-09-09 exact-code reconciliation starts from `0cf811f` (36 unreviewed / 16 primitive-available / 5 source-conflict). Three previously UNREVIEWED edges already have callable source-bound primitives: Calcharo's exact Nightmare: Thundering Mephis hit, Denia's Reminiscence: Denia summon/Outro transfer, and Shorekeeper's Stellar Symphony healing-qualified Skill window. Their actual preset equipment and canonical IDs are checked against those adapters. They are now correctly primitive-available/requires-timeline; no implementation is duplicated and none of the three dependencies closes. Voidwing Moth is not Hyvatia and remains outside that transfer proof.

Two Blazing Justice edges move from UNREVIEWED to BLOCKED_SOURCE_CONFLICT using the conflict already recorded in canonical weapon effects and Zani's backward-impact review: Basic Attack versus Liberation as trigger. The registry-local blocker `source-conflict:blazing-justice-trigger` is an identifier for that existing conflict, not a new source determination. All 83 exact IDs and six Reference Team blockers remain open. The queue's actual enum names are `PROFILE_SPECIFIC_EXECUTION` and `BLOCKED_SOURCE_SEMANTICS`; alternate planning labels do not create extra statuses.

Static Mist's Aalto dependency now reuses `weapon-outro-incoming-transfer-v1`; Chisa's Rejuvenating Glow dependency has `heal-applied-team-atk-window-v1`. Both consume explicit source-qualified events and recipient/team state. Neither supplies a profile timeline or closes a canonical pending ID. The existing Shorekeeper healing wrapper delegates to the same Rejuvenating implementation with its original Character-specific guard.

## Closed/reusable primitives that must not be mistaken for profile execution

### Weapon windows after explicit damage events

PR #190 adds `weapon-damage-timed-self-window-v1`: seven existing source-verified effects on four weapons, including current Phrolova/Galbrena/Luuk Herssen options. The source trigger classes BASIC, HEAVY and ECHO remain separate from cast events. Exact equipped weapon/rank, owner and actual source-qualified damage are required. A window exposes its source stat/effect; the consumer must prove damage-scope applicability and event ordering. Repeated-window policy, uptime and profile execution are not inferred. This family changes none of the 83 dependency IDs or six Reference Team blockers.

The same explicit damage-event/query boundary now supports four Sonata windows for current Galbrena and Sigrika loadouts via `sonata-damage-timed-self-window-v1`. Exact selected set and equipped piece count are mandatory. Heavy crit, Echo crit and Aero bonus scopes remain distinct. Joint-state and stack effects stay outside the window family; all profile timelines and existing pending IDs remain unresolved.

### Source-bound Character Outro transfers

The new reuse-first lane additionally binds Zhezhi and Lumi for one explicit isolated activation only. Their two VERIFIED/RAW_ONLY facts retain unknown stack metadata. Caller-proven absence of an earlier active activation and explicit activation/query and recipient-switch/query order are required; the existing incoming-transfer lifecycle preserves separate source terms, duration and switch-out termination. Six presets across five Characters discover these shared bindings without gaining rotation execution. Repeated-activation/refresh semantics, all 83 execution IDs and all six Reference Team blockers remain open.

PR #190 reuses `incoming-transfer-state-v1` for five already-VERIFIED/MODEL_READY Outro facts: Aalto, Changli, Mortefi, Taoqi and Yinlin. Seven separate amplification terms retain their original damage scopes and source durations. Explicit outgoing/incoming identity, handoff timestamp and recipient switch-out history are required; no dual-scope aggregation or Character rotation is invented. The database exposes this bounded support for reuse. These five primitives do not close any profile execution edge or alter the six Reference Team blockers. Raw/pending and periodic-resource Outro semantics remain outside this family.

### Explicit attacks on source-qualified targets

`sonata-explicit-target-attack-window-v1` implements canonical S11_5PC_SPECTRO and S17_5PC_CR/AERO. It consumes exact selected equipment, owner, actual source-qualified attack/hit, and target state observed at the same time explicitly before the trigger. Zani's existing Heliacal view can supply only the Eternal Radiance stack predicate; it cannot activate S11_5PC_CR, establish incoming Frazzle events or close BUG-015. Windward bindings have current Cartethyia/Rover Aero/Jiyan consumers. Windows remain independent with explicit same-timestamp query ordering.

The exact Zani target-stack dependency is now primitive-available, requiring the still-missing timeline. Current queue: 30 UNREVIEWED / 20 PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE / 7 BLOCKED_SOURCE_CONFLICT / 9 BLOCKED_SOURCE_SEMANTICS / 17 PROFILE_SPECIFIC_EXECUTION = the same 83 open IDs. This supersedes earlier 31/19 checkpoint counts without changing readiness. The separate Zani infliction mapping remains unreviewed because Heliacal equivalence does not prove that event; no invented application or ownership rule is accepted.

### Applied-heal window boundary

`weapon-heal-applied-stat-window-v1` supports canonical `SC-TEAM-CD` and `BPP-SKILL` for explicit source-qualified applied ally heals, preserving TEAM versus SELF scope and R1–R5 values. It has existing Mornye/Rover Aero consumers and shares Starfield fact resolution with Mornye's unchanged R1 event output. Exact equipment/owner/target/team, event time and query order remain explicit; the primitive does not prove self-heal/full-HP qualification, heal cadence, repeated-window policy or overlap.

The BPP-SKILL profile edge remains `BLOCKED_SOURCE_SEMANTICS / BUG-012`: a source-valid isolated six-second window cannot manufacture the missing profile timeline or rotation denominator. Stellar Symphony still requires its distinct healing-qualified Skill cast. No dependency ID, source fact or readiness changes.

### Flat resource recovery after a cast

Unmerged PR #190 adds `weapon-cast-flat-resource-v1` for 17 existing source-verified weapon effects: seven Concerto Energy and ten Resonance Energy effects, spanning all five weapon types. Every included source defines a Skill/Liberation cast, flat SELF amount, no additional conditions and an explicit 20-second trigger cooldown. Current recommendation options include these weapons for Augusta, Shorekeeper, Taoqi and Youhu; no recommendation changes or new DPS approvals follow.

Stellar Symphony's exact `SSY-CONCERTO:resource-event-adapter` edge is now primitive-available/requires-timeline. Its trigger is Liberation, not Skill. The primitive requires explicit selected weapon/rank, owned ordered cast events and known initial cooldown readiness. It returns the nominal source resource amount, keeps the two resource types distinct and does not infer pool caps, spending, ER scaling, initial energy or rotation timing. Repeated casts during cooldown do not refresh it. All 83 exact profile edges and six Reference Team dependencies remain pending as before. Beguiling Melody's null-cooldown Intro/Outro branches and other conditional/stack/healing families remain outside this bounded family.

### Fleurdelys character restriction

`echo-character-restriction-v1` statically resolves the extra Fleurdelys Aero bonus for canonical `cartethyia` and `rover-aero`. Those exact character-restriction dependencies are closed.

Unmerged PR #190 reuses that same primitive for the already-reviewed Adam Smasher Lucy/Rebecca CRIT Rate and Sigillum Aemeath Liberation bonuses. Existing Lucy/Aemeath preset main-Echo resolution gains those exact static effects; Rebecca's selected Bell-Borne is preserved. These close two Echo fact-level migration records, not any of the 83 profile execution edges. Source-only rotations, active Echo damage and all six Reference Team blockers remain outside this static applicability proof. See [source and backward-impact review](ECHO_SONATA_EFFECT_COVERAGE.md).

### Exact Echo active damage

`echo-active-damage-v1` resolves exact verified `ACTIVE_CAST` Echo attack facts without inventing cast time, uptime or rotation state. Reminiscence: Fleurdelys has exact Rank-5 `27.36% x8 + 136.80%` Aero damage, totaling `355.68% ATK`.

Primitive availability does **not** close a profile dependency until that profile has an executable source-proven cast path.

PR #190 adds `echo-active-explicit-hit-v1` for all five existing exact ACTIVE_CAST facts. It evaluates only the selected component and explicit landed-hit count, using a complete caller-proven ECHO/element/ATK-HP-DEF snapshot and the existing damage kernel. Rank 5 and exact Echo/attack ownership are required. INTRO_AUTO_SUMMON and unproven variants remain excluded. This adds reusable isolated arithmetic, not a cast timeline or dependency closure; the 83 profile edges and six Reference Team blockers are unchanged.

### Molten Rift cast window

`sonata-cast-timed-self-window-v1` is an explicit source-locked primitive for Molten Rift 5-piece. An executed Resonance Skill cast by the set owner starts a **15-second SELF +30% Fusion DMG** window. The adapter validates the canonical Sonata row and requires a caller timestamp; it does not infer uptime from the set being equipped or parse arbitrary trigger prose.

Changli's exact Molten Rift pending edge remains open as `PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE` until an executable profile timeline supplies the Skill-cast event.

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
| BUG-013 | Blazing Brilliance Searing Feather at-cap lifecycle | `BLOCKED_SOURCE_SEMANTICS`: current sources do not define whether qualifying +1/+5 grants while already at 14 stacks restart, preserve or otherwise mutate the 12-second removal timer. |
| BUG-014 | Changli Standard Rotation denominator | `BLOCKED_SOURCE_SEMANTICS`: current source gives a precise 1.37-second no-swap variant delta but no exact total duration for the fixed Standard Rotation. |

## Carlotta current no-go

`carlotta-standard` still has five canonical pending IDs. The Last Dance weapon window and Frosty Resolve's `S10_5PC_GLACIO` window can reuse the existing cast-timed primitives once a profile timeline exists. The current reviewed source sequence does not provide an exact total rotation duration/DPS denominator. Sentry Construct also has no exact Rank-5 attack profile in the Echo attack catalog. Frosty Resolve's separate Skill-stack execution and the rotation remain open; no Carlotta dependency is closed by inference.

## Rover (Aero) exact remaining graph

After the already-applied Fleurdelys character-restriction closure, `rover-aero-cartethyia-ciaccona` has exactly four effective pending IDs:

1. `weapon:bloodpacts-pledge:BPP-SKILL:healing-uptime-adapter` — **BUG-012 / BLOCKED_SOURCE_SEMANTICS**. Cloudburst Dance and Omega Storm are source-proven healing events and Bloodpact grants a 6-second Skill-DMG window after Providing Healing, but the exact profile timeline needed to prove overlap is missing.
2. `weapon:bloodpacts-pledge:BPP-TEAM-AERO:unbound-flow-team-amplify-adapter` — **PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE** via `weapon-cast-team-amplify-window-v1`. The already-reviewed Unbound Flow trigger creates one source-bound 30-second window at a supplied timestamp. The query requires explicit nearby/on-field recipient eligibility and trigger ordering; unknown eligibility is rejected. Profile event timing, recipient allocation and recast/refresh policy are not inferred, so the exact dependency remains pending.
3. `echo:echo-60001065:active-skill-damage-adapter` — **PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE** via `echo-active-damage-v1`. Prydwen Echo Usage explicitly places Fleurdelys after Unbound Flow P1 and before switching out, so the cast event is source-proven; the profile is still not executable.
4. `rotation:rover-aero-cartethyia-ciaccona-standard:engine-model` — **PROFILE_SPECIFIC_EXECUTION / BUG-012**. No exact source-backed `rotationSeconds` exists for the fixed Standard Rotation and the sequence retains optional Skyfall Severance.

No Rover pending ID closes in this tranche. The correct action is to park BUG-012 rather than fabricate timestamps or blanket uptime.

## Changli exact remaining graph

`changli-standard` has exactly four pending execution IDs in its current backward-impact review:

1. `weapon:blazing-brilliance:BBR-SKILL:stack-lifecycle-adapter` — **BUG-013 / BLOCKED_SOURCE_SEMANTICS**. Source fixes the +1 damage-event grant, 0.5-second grant interval, 14-stack cap and 12-second removal clause after reaching max, but not the timer behavior of later qualifying events while already capped.
2. `weapon:blazing-brilliance:BBR-SKILL-CAST-STACKS:cross-effect-stack-mutation-adapter` — **BUG-013 / BLOCKED_SOURCE_SEMANTICS**. Resonance Skill casts source-explicitly grant +5 to the same Searing Feather state; at-cap mutation/timer behavior remains unresolved.
3. `sonata:sonata-2:S02_5PC_FUSION:trigger-uptime-adapter` — **PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE** via `sonata-cast-timed-self-window-v1`. The event contract is resolved, but an executable Changli timeline must supply the actual Resonance Skill cast timestamp.
4. `rotation:changli-standard-rotation:engine-model` — **PROFILE_SPECIFIC_EXECUTION / BUG-014**. Current Prydwen source preserves the fixed Standard Rotation and states that letting the final Heavy occur without swapping extends the rotation by 1.37 seconds, but it does not publish the exact total duration of the canonical path.

No Changli pending ID closes in this checkpoint. The two shared Blazing Brilliance edges are now explicitly source-blocked instead of unreviewed, Molten Rift is primitive-covered but timeline-dependent, and the rotation remains source-only because a relative 1.37-second delta is not a DPS denominator.

## Representative supported-profile state

| Character / preset | Rotation | Remaining boundary |
| --- | --- | --- |
| Augusta — `augusta-standard` | `ENGINE_MODELED` | Zero pending IDs; `DPS_READY`. |
| Ciaccona — `ciaccona-cartethyia-aero` | `ENGINE_MODELED` | Zero pending IDs; `DPS_READY`. |
| Cartethyia — `cartethyia-aero-erosion` | `SOURCE_SEQUENCE_ONLY` | `DT-DEF` / BUG-011 + exact rotation duration/engine model. |
| Carlotta — `carlotta-standard` | `SOURCE_SEQUENCE_ONLY` | Five canonical IDs; exact denominator and Sentry active attack remain absent. |
| Rover (Aero) — `rover-aero-cartethyia-ciaccona` | `SOURCE_SEQUENCE_ONLY` | Four exact IDs above; BUG-012 prevents truthful freeze. |
| Changli — `changli-standard` | `SOURCE_SEQUENCE_ONLY` | Four exact IDs above; BUG-013 blocks Searing Feather state and BUG-014 blocks the DPS denominator. |
| Iuno — `iuno-augusta-hybrid` | `SOURCE_SEQUENCE_ONLY` | Moongazer timing/state, Heron conflict and profile execution remain. |
| Shorekeeper — `shorekeeper-augusta-support` | `SOURCE_SEQUENCE_ONLY` | Stellar Symphony event state, Fallacy variant and profile execution remain. |

The exact authoritative pending IDs remain in canonical backward-impact reviews after fail-closed closures; this table is intentionally not a second truth source.

## Freeze rule

A profile reaches `DPS_READY` only when its verified canonical build has a current backward-impact review with zero pending IDs, independently tested execution adapters, an `ENGINE_MODELED` rotation with a verified total duration/DPS denominator, a verified BuildContext bridge and the normal repository verification surface. Shared primitives never bypass this rule.
