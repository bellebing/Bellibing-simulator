# Bellibing Simulator — DPS Execution Gap Matrix

This document records the current supported-profile execution boundary. Canonical game/profile truth lives in the data/effect/profile registries and backward-impact reviews; this roadmap view does not create new truth or independently authorize DPS execution.

A source-backed build/profile may be complete while still being non-executable. `SOURCE_SEQUENCE_ONLY`, pending trigger/state adapters, pending Echo active execution and unresolved target-state semantics remain hard blockers for `DPS_READY`.

## Current execution baseline

Registry-derived readiness on the current Cohort 01 green-lane merge candidate is guarded to be:

- **25 `PROFILE_COMPLETE_PENDING_FREEZE`**;
- **3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`**;
- **28 `PROFILE_SOURCE_PENDING`**;
- **1 `DPS_READY`**.

Augusta remains the one narrow `DPS_READY` profile. The seven newly promoted Cohort 01 profiles are canonical build/profile truth only; their reviewed rotations remain `SOURCE_SEQUENCE_ONLY`.

## Profile × Adapter dependency matrix

`src/profileAdapterDependencyMatrix.ts` derives a machine-readable dependency graph directly from canonical `PROFILE_BACKWARD_IMPACT_REVIEWS_V36` `pendingExecutionIds`.

Current canonical impact coverage represented by the matrix:

- **18 backward-impact reviews**;
- **18 reviewed canonical profiles**;
- **17 profiles with pending execution dependencies**;
- **78 exact pending execution edges**.

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

Current highest syntactic reuse candidates:

| Primitive candidate | Current fanout | New Cohort 01 fanout | Meaning |
| --- | ---: | ---: | --- |
| `weapon:trigger-uptime-adapter` | 5 profiles / 5 Characters / 6 edges | 3 profiles | Source-triggered Weapon windows across Iuno, Ciaccona, Lumi, Calcharo and Carlotta. Matching suffix does not by itself prove one implementation handles every trigger. |
| `echo:impermanence-heron-active-transfer-adapter` | 5 profiles / 5 Characters | 2 profiles | Same Echo active/resource/transfer boundary across Aalto, Iuno, Zhezhi, Lumi and Yinlin. It still requires real Outro/incoming-Resonator event state. |
| `sonata:outro-transfer-adapter` | 4 profiles / 4 Characters | 3 profiles | Incoming-resonator transfer timing across Zhezhi, Lumi, Yinlin and Cantarella. Requires actual Outro and switch target. |
| `sonata:trigger-stack-adapter` | 2 profiles / 2 Characters | 2 profiles | Void Thunder / Frosty Resolve stack state driven by qualifying actions. Values/triggers remain separate source rows. |
| `sonata:trigger-uptime-adapter` | 2 profiles / 2 Characters | 2 profiles | Simple source-triggered Sonata windows in Carlotta and Changli. |
| `weapon:target-state-adapter` | 2 profiles / 2 Characters | 0 profiles | Existing shared target-state suffix across Cartethyia and Ciaccona. |

`rotation:*:engine-model` is deliberately grouped only for reporting and is marked `PROFILE_SPECIFIC_EXECUTION`. Seventeen profiles having a pending rotation engine model does not mean one generic rotation adapter can execute them.

The syntactic grouping is a throughput hint, not semantic evidence. It never:

- changes a profile from `SOURCE_SEQUENCE_ONLY` to `ENGINE_MODELED`;
- marks a pending backward-impact item closed;
- fabricates uptime, target state, scaling or mechanics;
- authorizes `DPS_READY`.

## Newly promoted Cohort 01 execution groups

Seven source/semantic-complete profiles entered the canonical registries in the current tranche. Their execution gaps are grouped below by shared mechanic, not by Character copy.

### Event-triggered uptime / stack state

- **Lumi** — Ages of Harvest Intro/Skill windows.
- **Yinlin** — Stringmaster Skill-driven ATK stack timing.
- **Calcharo** — Wildfire Mark Liberation window + Void Thunder action-driven stacks.
- **Cantarella** — Whispers of Sirens Gentle Dream stack state.
- **Carlotta** — The Last Dance Skill window + Frosty Resolve Skill/Liberation windows/stacks.
- **Changli** — Molten Rift Skill-triggered uptime plus Blazing Brilliance Searing Feather lifetime/cross-effect stack mutation.
- **Chisa** — Kumokiri Negative-Status/stack team activation + Rejuvenating Glow heal-triggered team window.

These should be implemented as reusable event/state primitives where the semantics truly match. Do not create one Character-specific trigger evaluator per profile.

### Incoming-resonator transfer

- **Lumi** — Moonlit Clouds + Impermanence Heron.
- **Yinlin** — Moonlit Clouds + Impermanence Heron.
- **Cantarella** — Midnight Veil incoming Havoc branch.

The shared requirement is executable Outro/switch-target state. Buff source rows stay distinct; the primitive should resolve the actual incoming Resonator rather than assume team-wide uptime.

### Echo active execution

- **Lumi / Yinlin** — Impermanence Heron active/resource/transfer lifecycle.
- **Calcharo** — Nightmare: Thundering Mephis active attack lacks an exact executable Echo attack profile.
- **Cantarella** — Lorelei active attack lacks an exact executable Echo attack profile.
- **Carlotta** — Sentry Construct active attack lacks an exact executable Echo attack profile.
- **Chisa** — Fallacy of No Return active damage remains pending; its conditional cast effects are already modeled.

**Changli is intentionally absent from this group.** The reviewed Changli source sequence equips Nightmare: Inferno Rider but does not cast it, so no active-Echo dependency is invented for the supported path.

### Specialized source-specific boundaries

- **Cantarella Midnight Veil** — the 5-piece Outro also deals source-reviewed 480% Havoc Outro Skill DMG; this remains a dedicated damage-event adapter separate from the incoming Havoc transfer.
- **Changli Blazing Brilliance** — Searing Feather has verified raw max-stack lifetime semantics plus a Skill-cast event that mutates that same effect stack. This should become a generic cross-effect stack primitive only if implementation review proves reuse; do not flatten it into normal independent stacks.

## Current supported-profile examples

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
| Lumi — `lumi-hybrid` | `SOURCE_SEQUENCE_ONLY` | `PROFILE_COMPLETE_PENDING_FREEZE` | Weapon trigger windows, Moonlit transfer, Impermanence Heron lifecycle, rotation engine model. |
| Yinlin — `yinlin-moonlit` | `SOURCE_SEQUENCE_ONLY` | `PROFILE_COMPLETE_PENDING_FREEZE` | Stringmaster stack timing, Moonlit transfer, Impermanence Heron lifecycle, rotation engine model. |
| Calcharo — `calcharo-standard` | `SOURCE_SEQUENCE_ONLY` | `PROFILE_COMPLETE_PENDING_FREEZE` | Wildfire Mark uptime, Void Thunder stacks, Nightmare: Thundering Mephis active damage, rotation engine model. |
| Cantarella — `cantarella-standard` | `SOURCE_SEQUENCE_ONLY` | `PROFILE_COMPLETE_PENDING_FREEZE` | Gentle Dream stacks, Midnight Veil transfer/damage, Lorelei active damage, rotation engine model. |
| Carlotta — `carlotta-standard` | `SOURCE_SEQUENCE_ONLY` | `PROFILE_COMPLETE_PENDING_FREEZE` | The Last Dance/Frosty Resolve trigger state, Sentry active damage, rotation engine model. |
| Changli — `changli-standard` | `SOURCE_SEQUENCE_ONLY` | `PROFILE_COMPLETE_PENDING_FREEZE` | Blazing Brilliance stack lifecycle/cross-effect mutation, Molten Rift uptime, rotation engine model. |
| Chisa — `chisa-standard` | `SOURCE_SEQUENCE_ONLY` | `PROFILE_COMPLETE_PENDING_FREEZE` | Kumokiri/Rejuvenating Glow event state, Fallacy active damage, rotation engine model. |

The exact authoritative pending IDs remain in the canonical backward-impact review catalog and are what the runtime matrix consumes; this table is intentionally a readable summary rather than a second hand-maintained truth source.

## Freeze rule

A supported profile may become `PROFILE_COMPLETE_PENDING_FREEZE` while still non-executable. Freeze approval requires all of the following for the exact supported path:

1. canonical verified profile truth;
2. a current backward-impact review;
3. zero unresolved pending execution IDs;
4. independently implemented and regression-tested execution adapters;
5. an `ENGINE_MODELED` rotation where DPS execution is claimed;
6. normal repository audits/tests/build/browser verification.

This prevents a recommendation-guide sequence from silently becoming a combat simulator assumption.
