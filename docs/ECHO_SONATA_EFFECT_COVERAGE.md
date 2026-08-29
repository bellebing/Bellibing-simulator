# Echo / Sonata effect coverage inventory

This document starts **after** the Version 3.6 raw Echo/Sonata roster audit. Raw identity/catalog coverage and combat-effect coverage remain separate layers.

Do not read raw Sonata membership or raw Echo identity as proof that Bellibing can execute the corresponding combat effect.

## Raw foundation

Current source-reviewed Version 3.6 raw coverage:

- 181 / 181 released Echoes are `VERIFIED CURRENT` at the raw identity/COST/Sonata-membership projection.
- 34 / 34 released Sonata sets are `VERIFIED CURRENT` at the raw identity/activation/raw-description projection.
- 0 stale/wrong records.
- 0 missing records.
- 0 source conflicts.
- 0 extra/obsolete records.

`npm run audit:echo-raw` is the executable source-facing gate. Raw verification stops at this boundary.

## Sonata Effects — source review complete, execution intentionally partial

The current pinned/current source checkpoint is DommyMM/wuwabuild commit `5fa70b11f1d84fb644e4dbed47873708da0fe66f`. Upstream `main` was reverified at the same commit before this review.

Current roster-wide Sonata effect coverage:

- **34 / 34 released Sonata sets source-reviewed.**
- **62 / 62 released activation tuples source-reviewed**, including the current 1-piece activation shape.
- **86 source-backed stat/effect rows** in `src/data/sonataEffects.ts`.
- **58 activation tuples `MODELED`.**
- **2 activation tuples `SOURCE_CONFLICT`.**
- **1 activation tuple `MODELED_WITH_PENDING_DAMAGE_ADAPTER`.**
- **1 activation tuple `MODELED_WITH_PENDING_STATE_ADAPTER`.**
- **0 unreviewed released activation tuples.**

`npm run audit:sonata-effects` is the fail-closed coverage gate. It validates every released raw activation against exactly one source-review disposition and checks the expected modeled-row count for that activation. The gate runs in Verify, Export and Deploy.

### Explicit unresolved Sonata dispositions

| Sonata activation | Disposition | Source-backed boundary |
| --- | --- | --- |
| Freezing Frost 5pc (`sonata-1`) | `SOURCE_CONFLICT` | Rendered English says +10% Glacio DMG per Basic/Heavy trigger, max 3 stacks for 15s; `effectDescriptionParam` exposes `30%`, `15` without the same per-stack shape. No value/stack interpretation is guessed. |
| Havoc Eclipse 5pc (`sonata-6`) | `SOURCE_CONFLICT` | Rendered English says +7.5% Havoc DMG per Basic/Heavy trigger, max 4 stacks for 15s; parameters say `6%`, `5`, `15`. No branch is promoted until source evidence resolves the contradiction. |
| Midnight Veil 5pc (`sonata-12`) | `MODELED_WITH_PENDING_DAMAGE_ADAPTER` | Incoming +15% Havoc DMG for 15s is modeled. The same Outro activation also deals 480% Havoc DMG around the caster and classifies it as Outro Skill DMG; that exact damage event remains outside the stat-effect layer. |
| Wishes of Quiet Snowfall 5pc (`sonata-30`) | `MODELED_WITH_PENDING_STATE_ADAPTER` | Source-explicit Glacio/CRIT/incoming bonuses are modeled. Snowfall removal arbitration and the Liberation CRIT-duration extension rule require a state adapter before execution. |

Two additional upstream discrepancies are documented without inventing semantics:

- Dream of the Lost 3pc (`sonata-19`): rendered effect text is character-agnostic while upstream `displayBonuses` carries separate `requires` metadata. Bellibing models the rendered effect literally and does not silently create a Character restriction.
- Shadow of Shattered Dreams 1pc (`sonata-32`): rendered text/used placeholders give +35% Basic Attack DMG and +35% Heavy Attack DMG for 15s after Hack - Shifting; an unused 15% parameter is retained as discrepancy evidence, not assigned a made-up effect.

### What “MODELED” means here

A `SonataEffectModel` is a **source-audited fact record**, not an automatic uptime promise. It may contain:

- pure permanent stats;
- event trigger + duration;
- stack cap / interval when explicitly stated;
- self, team, active-Resonator or incoming-Resonator scope;
- scaling input and cap;
- state-bound conditions with no invented fixed duration.

Rotation, trigger occurrence, stack acquisition, refresh timing, current target state and Character/team execution still belong to later adapters/profiles. A source-reviewed set therefore must not be treated as 100% active by default.

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

It preserves the verified Rank-5 active-spin and Intro-summon attack facts plus cooldown/charge semantics used by the Augusta golden path. No other Echo is allowed to read as having a completed attack model merely because its raw catalog entry exists.

## Next Echo source audit

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

The active order is now:

1. **Echo/Sonata raw roster audit — complete for Version 3.6.**
2. **Sonata effect source coverage — complete with explicit source conflicts / specialized-adapter dispositions above.**
3. **Complete Echo active-skill/effect/attack facts required for supported content — next after merge/status sync.**
4. Complete/populate composable Character/build/team/rotation profiles.
5. Freeze/preflight the full Pre-DPS foundation, including unresolved specialized Sonata adapters required by supported DPS paths.
6. Begin Character DPS character-by-character only after the above gates pass.

Characters that remain source-blocked or fail later preflight remain excluded from Character DPS adapters.
