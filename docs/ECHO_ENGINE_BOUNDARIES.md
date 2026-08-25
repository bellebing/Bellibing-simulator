# Echo Engine Boundaries

## Product rule

The Echo system must be fully useful without selecting a character.

A character is an optional consumer of Echo output, never a dependency of Echo generation, rolling, cost, or resource simulation.

## Engine layers

### 1. Echo Core
Owns Wuthering Waves Echo mechanics only:
- Echo cost
- rarity / level checkpoints
- main-stat rules and level progression
- secondary-main rules where applicable
- substat pool
- duplicate-substat prevention
- roll-value distributions
- +5 / +10 / +15 / +20 / +25 tuning
- EXP, Tuner and Shell Credit spend
- recycle / feed refunds
- deterministic seeded simulation

It must not import character combat code.

Echo Core is not `COMPLETE` while a supported game-mechanics field is knowingly missing. In particular, exact Rank-5 main-stat progression at +5/+10/+15/+20 is a current blocking gap.

### 2. Echo Lab
Uses Echo Core to provide character-free simulation:
- generate one Echo
- generate N Echoes
- generate arbitrary cost mixes
- roll selected Echoes to checkpoints
- batch-roll five or more Echoes
- compare rolling strategies by expected resource cost
- estimate cost of improving an existing Echo target

Echo Lab intentionally allows invalid character loadouts. Example: four 4-cost Echoes may be generated and rolled for experimentation even though that collection cannot be equipped as one legal character loadout.

Echo Lab is the mechanical validation surface for Echo Core. It must not fake missing main-stat progression or fresh-Echo acquisition odds.

### 3. Loadout Validator
A separate adapter validates whether a chosen collection can be equipped together.

Rules such as total Echo cost are enforced only when the user asks to apply Echoes to a character/build.

The lab must never prevent experimentation merely because a collection is not equipable.

### 4. Raw game-data catalogs
Independent catalogs own factual identities and static game data:
- Characters
- Weapons
- Echoes
- Sonata sets
- Weapon effects
- Sonata effects
- Echo effects
- Echo attack facts
- future Character combat facts

Missing effect/fact coverage means `PENDING`, not zero/no effect.

### 5. Composable profile catalogs
Profile records point between raw catalogs without mutating them:
- Weapon Recommendation
- Echo Loadout
- Stat Target
- Team
- Rotation
- Character Preset

The same raw Character may have multiple modes/presets.

### 6. Character DPS Engine
Consumes a legal loadout plus verified character/profile/combat data and returns selected-character Personal Rotation DPS and mandatory gates such as ER.

It does not generate Echoes and is not a dependency of Echo Core.

### 7. Roll Advisor
Combines Echo mechanics, profile requirements and — for DPS-integrated characters — Character DPS evaluation.

For a selected character/build it eventually answers:
- continue / discard / use for now / keep at +5 / +10 / +15 / +20 / +25
- why the current exact roll values matter
- which future branches remain useful
- chance of reaching the selected objective
- chance of beating the incumbent/build when DPS-integrated
- expected future resource cost of continuing vs restarting

No stat is globally hard-coded as good or bad. Guide/profile requirements are allowed as an explicit fallback before a verified DPS model exists; whole-build value becomes the final judge once DPS is supported.

## Dependency rule

The dependency direction is one-way:

`Echo Core / raw data -> profiles -> Character DPS -> Roll Advisor -> UI`

Never:

`Character / DPS / UI -> imported by -> Echo Core`

## Pre-DPS build order

Broad Character DPS expansion waits until the horizontal foundation is complete:

1. Finish Echo Core, including exact intermediate main-stat progression.
2. Harden Echo Lab as the mechanical Echo oracle.
3. Generalize the profile-driven non-DPS checkpoint policy so different characters/modes can own different requirements.
4. Complete/audit Character static/raw facts.
5. Complete/audit Weapon core data and Weapon Effect coverage.
6. Complete/audit Echo/Sonata raw coverage.
7. Complete Sonata Effect coverage.
8. Complete the supported Echo effect/attack fact layer.
9. Populate composable defaults/profiles for supported characters/modes.
10. Freeze all pre-DPS contracts with regression tests.
11. Then build Character combat/DPS models character-by-character.
12. As each character gains verified DPS, make Roll Advisor decisions whole-build DPS/gate aware for that character.

See [`PROJECT_STATUS.md`](PROJECT_STATUS.md) for the live completion matrix.

## Architecture invariant

`Echo Core` must be testable with zero character imports.

`Echo Lab` may simulate collections that are illegal character loadouts.

`Character DPS Engine` must be testable with prebuilt Echo/loadout inputs and zero RNG dependency.

`Roll Advisor` is the integration layer allowed to depend on both Echo mechanics and character value models.
