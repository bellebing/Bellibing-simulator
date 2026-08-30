# Bellibing Simulator — DPS Execution Gap Matrix

This document records the current supported-profile execution boundary. Canonical game/profile truth lives in data/effect/profile registries and backward-impact reviews; this roadmap view does not create new truth or authorize DPS execution.

A source-backed build may be complete while still non-executable. `SOURCE_SEQUENCE_ONLY`, pending trigger/state adapters, unresolved Echo active execution and target-state semantics remain hard blockers for `DPS_READY`.

## Current execution baseline

Registry-derived readiness:

- **25 `PROFILE_COMPLETE_PENDING_FREEZE`**;
- **3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`**;
- **28 `PROFILE_SOURCE_PENDING`**;
- **1 `DPS_READY`**.

Canonical dependency matrix:

- **18 backward-impact reviews**;
- **18 reviewed canonical profiles**;
- **17 profiles with pending execution dependencies**;
- **76 exact pending execution edges**.

Augusta remains the one narrow `DPS_READY` profile. The seven Cohort 01 promoted profiles remain `SOURCE_SEQUENCE_ONLY`.

## Reuse queue: semantic status, not just suffix count

`src/profileAdapterDependencyMatrix.ts` derives the current exact pending-edge graph. Syntactic grouping is only a throughput hint; each group receives manual semantic review before code is shared.

| Syntactic candidate | Fanout | Current semantic disposition |
| --- | ---: | --- |
| `weapon:trigger-uptime-adapter` | 5 profiles / 5 Characters / 6 edges | **Split.** Five cast-event SELF windows use `weapon-cast-timed-self-window-v1`; Woodland Aria `WA-AERO` is a separate Aero-Erosion target/application event. No profile dependency closes from primitive availability alone. |
| `echo:impermanence-heron-active-transfer-adapter` | 5 profiles / 5 Characters / 5 edges | **BLOCKED SOURCE CONFLICT.** Pinned raw text and current usage guidance disagree on whether a hit is required to arm the transfer. |
| `sonata:outro-transfer-adapter` | 4 profiles / 4 Characters / 4 edges | **Shared low-level core implemented.** Moonlit `S08_5PC_INCOMING_ATK` and Midnight Veil `S12_5PC_INCOMING_HAVOC` use explicit direct-Outro wrappers over `incoming-transfer-state-v1`; profile timelines remain pending. |
| `sonata:trigger-stack-adapter` | 2 profiles / 2 Characters / 2 edges | **Current highest actionable group.** Pending source/semantic review for action-driven stack state. |
| `sonata:trigger-uptime-adapter` | 2 profiles / 2 Characters / 2 edges | Pending source-triggered Sonata window review. |
| `weapon:target-state-adapter` | 2 profiles / 2 Characters / 2 edges | Pending target-state semantic review. |

`rotation:*:engine-model` remains `PROFILE_SPECIFIC_EXECUTION`; shared suffixes do not make rotations generic.

## Static dependency closure — Fleurdelys character restriction

Reminiscence: Fleurdelys is the first canonical profile dependency that can close without a combat timeline because the missing behavior is a static main-slot applicability condition.

Pinned current DommyMM/wuwabuild `Echoes.json` provides:

- generic +10% Aero DMG while Fleurdelys is equipped in the main slot;
- another +10% Aero DMG under source `characterCondition: ["Aero", "Cartethyia"]`;
- multilingual rendered text that identifies the first condition as **Rover: Aero**, not a generic Aero-element Character class.

Bellibing maps this only to canonical `rover-aero` and `cartethyia`. `src/echoEffectRegistry.ts` supports fail-closed `wielderCharacterIds` applicability and `src/profileEchoEffectResolver.ts` resolves permanent main-slot effects from the exact preset Character + main Echo.

For the two supported profiles:

- `cartethyia-aero-erosion` resolves +20% total Aero DMG from Fleurdelys main-slot rows;
- `rover-aero-cartethyia-ciaccona` resolves +20% total Aero DMG;
- unrelated wielders receive only the generic +10% row.

`src/data/profileExecutionClosures20260830.ts` then removes only `echo:echo-60001065:fleurdelys-character-restriction-adapter` from those two exact presets. The closure is fail-closed: if the expected review/pending ID drifts or has already disappeared, validation throws instead of silently filtering data.

This reduces the canonical graph from 78 to **76 exact pending edges**. It does **not** close Fleurdelys active damage, does not make either rotation executable, does not change readiness, and does not authorize DPS.

## Shared primitive 1 — Weapon cast timed SELF windows

`src/combat/weaponCastWindowAdapter.ts` implements `weapon-cast-timed-self-window-v1` for:

- Ages of Harvest `AH-INTRO` — Intro cast → 12s Resonance Skill DMG window;
- Ages of Harvest `AH-SKILL` — Skill cast → 12s Resonance Skill DMG window;
- Wildfire Mark `WM-LIB` — Intro/Liberation cast → 6s Liberation DMG window;
- The Last Dance `TLD-SKILL` — Intro/Liberation cast → 5s Skill DMG window;
- Moongazer's Sigil `MGS-LIB` — Intro/Liberation cast → 15s Liberation DMG window.

The adapter validates exact canonical source shape, uses explicit typed events, rejects malformed runtime inputs and does not parse human trigger text.

Woodland Aria `WA-AERO` is deliberately excluded because it activates from `Inflict Aero Erosion on target`, not a cast event.

These primitives do not remove their profile pending IDs because the affected profiles still lack executable timelines.

## Shared primitive 2 — Incoming transfer state

`src/combat/incomingTransferState.ts` is the reusable low-level state machine for a source actor transferring a timed modifier to the **actual incoming Resonator**.

It owns only resolved event/state mechanics:

- explicit outgoing actor;
- explicit incoming Resonator;
- explicit switch time;
- optional source-armed activation window;
- optional required incoming Intro;
- deterministic active interval;
- actor-bound window queries.

It deliberately does **not** know Echo/Sonata/Weapon trigger prose or effect-specific prerequisites.

### Echo wrappers currently admitted

`src/combat/echoTransferWindowAdapter.ts` admits only source-safe `TRANSFER_WINDOW` rows:

- `REMINISCENCE_DENIA_INCOMING_FUSION` — 15s arm window after Echo summon; Outro inside the window transfers +12% Fusion DMG for 15s;
- `HYVATIA_INCOMING_ALL_ATTRIBUTE` — 15s arm window after Echo summon; Outro inside the window plus incoming Intro transfers +10% All Attribute DMG for 15s.

Wrong Echo/actor, expired arm window, malformed event or missing required Intro fails closed.

### Impermanence Heron remains blocked

`echo-60000525` is intentionally **not** admitted.

Current evidence conflict:

- pinned current DommyMM/wuwabuild `Echoes.json` renders the transfer after the initial attack lands and restores 10 Resonance Energy;
- current Prydwen Impermanence Heron guidance says the Echo can be cancelled before damage/Energy while the incoming-character buff still applies.

Bellibing therefore records `BLOCKED_SOURCE_CONFLICT` instead of choosing hit-armed or cast-armed semantics. The five canonical Heron pending edges stay untouched behind BUG-008.

### Sonata wrappers currently admitted

`src/combat/sonataOutroTransferAdapter.ts` admits only direct source-safe Outro transfers:

- Moonlit Clouds `S08_5PC_INCOMING_ATK` — +22.5% ATK to the incoming Resonator for 15s;
- Midnight Veil `S12_5PC_INCOMING_HAVOC` — +15% Havoc DMG to the incoming Resonator for 15s.

The same Midnight Veil activation also has a separate source-reviewed 480% Havoc Outro damage branch. That damage event remains its own pending adapter; it is not folded into the transfer primitive.

Other Sonata `INCOMING_RESONATOR` rows remain excluded when they require extra Intro state, self-state, scaling input or state removal/arbitration.

## Dependency closure rule

Two cases must remain distinct:

1. **Static canonical applicability** may close an exact pending dependency when all required state is already present in canonical build/profile data and the closure is explicitly regression-locked. Fleurdelys is the first example.
2. **Event/timeline mechanics** do not close merely because a reusable primitive exists. The exact supported profile must still provide an executable event/state path.

Therefore `SOURCE_SEQUENCE_ONLY` profiles remain fail closed unless their exact remaining dependencies independently close. A guide sequence never becomes simulator timing by implication.

## Current semantic partition

The current 76-edge graph is regression-locked to:

- **39 `UNREVIEWED`**;
- **1 `SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING`**;
- **9 `PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE`**;
- **5 `BLOCKED_SOURCE_CONFLICT`**;
- **5 `BLOCKED_SOURCE_SEMANTICS`**;
- **17 `PROFILE_SPECIFIC_EXECUTION`**.

That leaves **40 actionable shared edges**. The current top actionable group is `sonata:trigger-stack-adapter` with 2 profiles / 2 Characters / 2 exact dependencies.

## Supported-profile examples

| Character / preset | Rotation | Representative remaining boundary |
| --- | --- | --- |
| Augusta — `augusta-standard` | `ENGINE_MODELED` | Narrow supported path has no pending execution IDs; only current `DPS_READY` fixture. |
| Aalto — `aalto-hybrid-jiyan` | `SOURCE_SEQUENCE_ONLY` | Static Mist next-Resonator transfer, Impermanence Heron conflict, profile engine model. |
| Cartethyia — `cartethyia-aero-erosion` | `SOURCE_SEQUENCE_ONLY` | Fleurdelys static restriction is closed; Defier's Thorn timing/target state, Fleurdelys active damage and profile engine model remain. |
| Rover (Aero) — `rover-aero-cartethyia-ciaccona` | `SOURCE_SEQUENCE_ONLY` | Fleurdelys static restriction is closed; Fleurdelys active damage and profile engine model remain. |
| Ciaccona — `ciaccona-cartethyia-aero` | `SOURCE_SEQUENCE_ONLY` | Woodland Aria Aero-Erosion application/target state, profile engine model. |
| Iuno — `iuno-augusta-hybrid` | `SOURCE_SEQUENCE_ONLY` | Moongazer cast primitive exists; shield/cross-stack state, Heron conflict and profile engine model remain. |
| Zhezhi — Moonlit | `SOURCE_SEQUENCE_ONLY` | Sonata direct transfer core exists; Heron conflict and exact profile timeline remain. |
| Lumi — `lumi-hybrid` | `SOURCE_SEQUENCE_ONLY` | Ages cast windows + Moonlit transfer primitives exist; Heron conflict and profile timeline remain. |
| Yinlin — `yinlin-moonlit` | `SOURCE_SEQUENCE_ONLY` | Moonlit transfer core exists; Stringmaster stacks, Heron conflict and profile timeline remain. |
| Calcharo — `calcharo-standard` | `SOURCE_SEQUENCE_ONLY` | Wildfire cast primitive exists; Void Thunder stacks, Echo active damage and profile timeline remain. |
| Cantarella — `cantarella-standard` | `SOURCE_SEQUENCE_ONLY` | Midnight Veil transfer core exists; its damage branch, Gentle Dream stacks, Lorelei active and profile timeline remain. |
| Carlotta — `carlotta-standard` | `SOURCE_SEQUENCE_ONLY` | Last Dance cast primitive exists; Frosty Resolve state, Sentry active and profile timeline remain. |
| Changli — `changli-standard` | `SOURCE_SEQUENCE_ONLY` | Blazing Brilliance stack lifecycle/cross-effect mutation, Molten Rift uptime and profile timeline. |
| Chisa — `chisa-standard` | `SOURCE_SEQUENCE_ONLY` | Kumokiri/Rejuvenating Glow event state, Fallacy active damage and profile timeline. |

The exact authoritative pending IDs remain in canonical backward-impact reviews; this table is intentionally a readable summary, not a second truth source.

## Freeze rule

Freeze approval for an exact supported profile requires:

1. canonical verified profile truth;
2. current backward-impact review;
3. zero unresolved pending execution IDs;
4. independently implemented and regression-tested adapters;
5. `ENGINE_MODELED` rotation where DPS is claimed;
6. normal repository audits/tests/build/browser verification.

No shared primitive or static closure bypasses this rule.
