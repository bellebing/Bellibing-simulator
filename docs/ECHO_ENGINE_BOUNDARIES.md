# Echo Engine Boundaries

## Product rule

The Echo system must be fully useful without selecting a character.

A character is an optional consumer of Echo output, never a dependency of Echo generation, rolling, cost, or resource simulation.

## Engine layers

### 1. Echo Core
Owns Wuthering Waves Echo mechanics only:
- Echo cost
- rarity / level checkpoints
- main-stat rules
- secondary-main rules where applicable
- substat pool
- duplicate-substat prevention
- roll-value distributions
- +5 / +10 / +15 / +20 / +25 tuning
- EXP and Tuner spend
- recycle / feed refunds
- deterministic seeded simulation

It must not import character combat code.

### 2. Echo Lab
Uses Echo Core to provide character-free simulation:
- generate one Echo
- generate N Echoes
- generate arbitrary cost mixes
- roll selected Echoes to checkpoints
- batch-roll five or more Echoes
- compare rolling strategies by expected Echo / Tuner / EXP cost
- estimate cost of improving an existing Echo target

Echo Lab intentionally allows invalid character loadouts. Example: four 4-cost Echoes may be generated and rolled for experimentation even though that collection cannot be equipped as one legal character loadout.

**UI exposure is optional.** Echo Lab is first an engine/service boundary, not a promise that every possible lab operation must be visible in the normal app. We may expose a small public lab, an advanced/hidden lab, or only character-facing workflows. In every case those workflows use the same completed Echo Lab/Core underneath rather than reimplementing Echo mechanics.

### 3. Loadout Validator
A separate adapter validates whether a chosen collection can be equipped together.

Rules such as total Echo cost are enforced only when the user asks to apply Echoes to a character/build.

The lab must never prevent experimentation merely because a collection is not equipable.

Return explicit validation states such as:
- VALID_LOADOUT
- TOO_HIGH_COST
- WRONG_SLOT_COUNT
- INVALID_MAIN_STAT_COMBINATION (only if such a rule is verified and relevant)

### 4. Character Profile
Provides character-specific defaults and combat semantics:
- character / sequence
- weapon / rank
- team
- standard rotation
- verified passives and conditions
- recommended/default Echo cost layout
- recommended/default main stats

Defaults are suggestions, not hard-coded Echo Core restrictions.

### 5. Character DPS Engine
Consumes a legal loadout plus character profile and returns whole-build Personal Rotation DPS and gates such as ER.

It does not generate Echoes.

### 6. Roll Advisor
Combines Echo Core + Character DPS Engine.

For a selected character/build it answers:
- continue / conditional / stop at +5 / +10 / +15 / +20
- why the current rolled stats matter on the actual rotation
- which next-roll outcomes keep the Echo alive
- chance of beating the current slot
- expected Echo / Tuner / EXP cost of continuing vs restarting

No stat is globally hard-coded as good or bad. A stat is valuable only through the selected character/build/rotation model, except for mechanically impossible or irrelevant stats that are proven by the model.

## UX rule

Keep the visible workflow simple even when the engine is complex.

If a standalone Echo Lab is exposed:
`Choose cost / generate -> roll -> compare cost -> recycle / continue`

Character-assisted mode:
`Choose character -> defaults appear -> roll Echo -> CONTINUE / CONDITIONAL / STOP + short explanation`

Advanced controls should be available only when they add user value. Engine capability does not require UI clutter.

## Failure isolation rule

Echo Core is treated as a stable dependency once its rules are verified and regression-tested.

A broken Augusta formula, new character passive, rotation rewrite or character UI change must not change Echo RNG, checkpoint costs, refund rules or standalone Echo simulation.

Likewise, a future Echo rule update should be testable inside Echo Core before any character integration is touched.

The dependency direction is one-way:

`Echo Core / Echo Lab -> consumed by -> Loadout / Character / Roll Advisor`

Never:

`Character / DPS -> imported by -> Echo Core`

## Build order

1. Complete Echo Core and Echo Lab independently of characters.
2. Complete arbitrary cost-layout generation and loadout validation as separate modules.
3. Complete strategy/cost comparison without character scoring.
4. Keep Augusta only as an external integration/parity fixture while steps 1-3 mature.
5. Add Character Profile + DPS integration.
6. Add character-specific checkpoint advice and explanations.
7. Add broader roster, screenshot/OCR, optimizer, saved builds, and farming guidance.

## Architecture invariant

`Echo Core` must be testable with zero character imports.

`Echo Lab` may simulate collections that are illegal character loadouts.

`Character DPS Engine` must be testable with prebuilt Echo/loadout inputs and zero RNG dependency.

`Roll Advisor` is the integration layer that is allowed to depend on both.
