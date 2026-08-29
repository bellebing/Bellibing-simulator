# Echo / Sonata effect coverage inventory

This document starts **after** the Version 3.6 raw Echo/Sonata roster audit. The raw catalog is current; executable combat-effect coverage is not.

Do not read raw Sonata membership or raw Echo identity as proof that Bellibing knows the corresponding combat effect.

## Raw foundation

Current source-reviewed Version 3.6 raw coverage:

- 181 / 181 released Echoes are `VERIFIED CURRENT` at the raw identity/COST/Sonata-membership projection.
- 34 / 34 released Sonata sets are `VERIFIED CURRENT` at the raw identity/activation/raw-description projection.
- 0 stale/wrong records.
- 0 missing records.
- 0 source conflicts.
- 0 extra/obsolete records.

`npm run audit:echo-raw` is the executable source-facing gate. Raw verification stops at this boundary.

## Sonata Effects — current modeled slice

`src/data/sonataEffects.ts` currently contains **10 audited effect records across 7 of 34 current Sonata sets**.

Sets with at least one modeled effect record:

| Sonata | Modeled rows | Current modeled semantics |
| --- | ---: | --- |
| Crown of Valor (`sonata-20`) | 2 | Shield-triggered self ATK; max-stack Crit DMG state. |
| Rejuvenating Glow (`sonata-7`) | 1 | Healing-triggered team ATK window. |
| Void Thunder (`sonata-3`) | 1 | Electro DMG state after Heavy/Skill damage. |
| Song of Feathered Trace (`sonata-33`) | 2 | 3-piece split into a base stat effect plus a conditional team effect. |
| Chromatic Foam (`sonata-28`) | 1 | Fusion Burst / Outro conditional Fusion DMG flow. |
| Pact of Neonlight Leap (`sonata-24`) | 2 | Tune Break / team-facing conditional effects. |
| Halo of Starry Radiance (`sonata-25`) | 1 | State/target-dependent Spectro-facing effect. |

The remaining **27 current Sonata sets have zero modeled rows in `src/data/sonataEffects.ts`**. The seven rows above are an audited partial slice; presence in this table does **not** automatically mean every activation branch for that Sonata is complete.

The next Sonata workstream therefore has to source-review all 34 sets against their current activation shape and close every required 2pc / 3pc / 5pc (or other current) branch explicitly.

### Sonata semantic buckets required by the next audit

For each current set, classify source-backed effects without guessing uptime:

- **Pure stat:** unconditional or activation-only stat modifier with no runtime trigger semantics beyond set activation.
- **Triggered timed state:** event trigger + duration.
- **Stacked state:** trigger, stack cap, refresh/independent-duration behavior where the source states it.
- **Target-facing state:** debuff, RES/DEF interaction, marked-target or enemy-state requirement.
- **Team/transfer state:** active Resonator, next Resonator or whole-team scope; do not collapse these into one scope.
- **Resource/status gate:** Resonance Energy, Shield, healing, Tune Break, status stack or other explicit prerequisite.
- **Cross-effect mutation:** a branch changes another branch's duration/value/state and cannot be represented as automatic uptime.
- **SOURCE_CONFLICT / PENDING_MODEL:** preserve source disagreement or insufficient execution semantics explicitly.

## Echo Effects — current modeled slice

`src/data/echoEffects.ts` currently contains **8 audited non-damage effect records across 5 Echoes**:

- Fallacy of No Return — 2 effect rows.
- The False Sovereign — 2 effect rows.
- Thousand-Puppet Pavilion — 2 effect rows.
- Reminiscence: Denia — 1 effect row.
- Hyvatia — 1 effect row.

These are deliberately separate from Echo active attack math and from Character recommendations.

## Echo Attacks — current modeled slice

`src/data/echoAttacks.ts` currently has **The False Sovereign as the single exact Echo attack fixture**.

It preserves the verified Rank-5 active-spin and Intro-summon attack facts plus cooldown/charge semantics used by the Augusta golden path. No other Echo is currently allowed to read as having a completed attack model merely because its raw catalog entry exists.

## What the next Echo source audit must establish

A full current-roster Echo effect/attack audit must classify every supported active Echo Skill from source evidence. The current raw catalog does **not** contain enough semantic structure to infer these categories safely, so Bellibing must not auto-classify 181 Echoes from names or prose alone.

For each supported active Echo Skill, later source-backed facts may need:

- stable Echo/source skill identity and skill name;
- active variants / transform / summon / hold / press branches;
- rank-scaled coefficients or exact fixed values;
- damage components and source-explicit hit counts where available;
- source-explicit damage element and damage-bonus classification where available;
- cooldown, charges and cast/transform/summon duration;
- buffs, debuffs, healing and utility effects;
- trigger/state prerequisites;
- stack cap and timer semantics;
- effect target scope: self, active Resonator, next Resonator, team or enemy;
- Character-restricted or form-restricted conditions;
- source conflict / pending-model disposition when semantics cannot be proven.

Only after that source inventory exists should Bellibing decide which facts need executable combat/DPS adapters.

## Pre-DPS sequencing

The active order remains:

1. **Echo/Sonata raw roster audit — complete for Version 3.6.**
2. **Complete Sonata effect coverage — next.**
3. Complete Echo active-skill/effect/attack facts required for supported content.
4. Complete/populate composable Character/build/team/rotation profiles.
5. Freeze/preflight the full Pre-DPS foundation.
6. Begin Character DPS character-by-character only after the above gates pass.

Characters that remain source-blocked or fail later preflight remain excluded from Character DPS adapters.
