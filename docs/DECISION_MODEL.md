# Echo decision model v0.2

## The user should experience one loop

There is no hard separation between "build mode" and "Echo mode". A new character build naturally becomes a repeated Echo decision:

> I rolled this Echo to this checkpoint. Is continuing from here a better route to a strong build than abandoning it and starting a fresh Echo?

## State

A decision state contains:

- selected character / sequence / weapon / team;
- selected target quality / profile mode;
- locked standard combat context when that character has a verified combat model;
- current five-Echo build (including empty/in-progress slots);
- the candidate Echo being rolled;
- checkpoint (+0/+5/+10/+15/+20/+25);
- resources spent so far and, when provided, remaining resources;
- verified roll/refund probability model.

## Two evaluation levels

### Guide/profile fallback

Before a character has a verified combat model, Bellibing may use a source-backed Character/Profile target policy. This policy is character/mode data, not a universal Crit rule.

It may use:

- exact roll values;
- remaining unique substat slots;
- character-specific target requirements;
- ER/stat gates that are explicitly source-backed;
- expected future resource cost.

A fallback policy must never be presented as actual DPS optimization.

### DPS-integrated evaluation

Once a character has a verified combat model, the final judge is the resulting whole build under the same locked context.

A candidate or future RNG branch is useful only if it produces a result that satisfies mandatory gates and advances the selected whole-build objective.

## Acceptance at +25

For a DPS-integrated character, a replacement is not accepted because it looks good.

Minimum acceptance contract:

1. Required build gates pass, for example ER when a hard gate exists.
2. The candidate satisfies the selected build/upgrade objective under the identical locked context.
3. In Upgrade Mode, the incumbent remains equipped until an actually better accepted result exists.
4. Any meaningful-improvement floor is explicit and versioned; it may not be silently baked into a score.

For a character still on guide/profile fallback, +25 acceptance is defined by that profile's explicit requirement contract instead.

## Partial-Echo future branches

For an in-progress Echo, Bellibing must reason from the exact current state rather than from the stat names alone.

`forecastCandidateViability` already provides the generic simulation boundary: it rolls the remaining unique substats using the verified runtime and injects a final evaluator.

A DPS-aware final evaluator can therefore answer questions such as:

- How many legal future branches beat the current slot/build?
- How many preserve the ER gate?
- How much Personal Rotation DPS do successful branches add?
- What is the average future spend from this checkpoint?

This generic branch engine is not itself the stopping rule.

## Continue vs restart

For an in-progress Echo, compare two paths from the current checkpoint.

### Continue

Spend only the future cost required to advance this exact Echo through later checkpoints, following the active stopping policy.

### Restart

Recycle/abandon according to verified rules and begin from a fresh eligible Echo of the required Cost/Main Stat pool.

For both paths estimate as applicable:

- probability of eventually producing an accepted result;
- expected Echoes consumed;
- expected Tuners consumed net of verified refunds;
- expected EXP consumed net of verified refunds;
- expected Shell Credits;
- expected Personal Rotation DPS gain when DPS-integrated;
- distribution/risk information only when it materially changes the decision.

## Decision rule

First use hard constraints and dominance:

1. A branch that can no longer satisfy a mandatory requirement may be discarded.
2. If one path has at least as good success probability/value while costing no more of every tracked resource, it dominates the other path.
3. If resources conflict, resolve the tradeoff through the selected budget/target policy rather than a universal hidden Echo score.

For DPS-integrated characters, success/value is measured against the actual whole-build objective. For guide-fallback characters, success is measured against the selected profile requirement.

## Why a strange Echo can survive

A stat is never globally dead merely because a generic guide does not highlight it. Heavy/Basic/Skill/Liberation/Flat ATK, DEF, HP or other stats may matter on a character whose real mechanics make them valuable.

At a DPS-integrated checkpoint, the combat evaluator can value the stats actually present. At a guide-fallback checkpoint, the selected profile owns the target/filler/dead classification.

## New character workflow

1. Raw Character data is already present and verified.
2. Weapon, Echo/Sonata and effect data required by the supported profile are already present.
3. Default Weapon / Echo Loadout / Stat Target / Team / Rotation / Character Preset records are linked by IDs.
4. Before DPS integration, the profile can use a clearly labeled guide-target fallback.
5. Build the character's verified combat facts and standard context.
6. Add Personal Rotation DPS/gate evaluation.
7. Replace guide fallback as final judge with whole-build DPS-aware evaluation for that character.

## Runtime boundary

The decision layer must not own Wuthering Waves RNG constants. `EchoRollRuntime` is supplied by verified Echo Core data.

Keep three truths separate:

1. **Game RNG/economy truth** — how an Echo rolls and what it costs/refunds.
2. **Combat truth** — what the resulting whole build does and whether mandatory gates pass.
3. **Decision policy** — whether continuing, discarding, keeping temporarily or replacing is worthwhile under the selected objective.

A stale or unavailable rule becomes pending, never a guessed constant.

## Current Echo-runtime coverage

Implemented:

- 13 substat types sampled without replacement;
- verified value-tier weighting including the distinct Crit distribution;
- cumulative +5/+10/+15/+20/+25 EXP/Tuner/Shell Credit costs;
- 75% effective EXP recovery and 30% Tuner recovery;
- seeded reproducible runtime;
- exact partial-Echo future-branch simulation.

Still unresolved or intentionally separate:

- exact Rank-5 primary/secondary main-stat progression at +5/+10/+15/+20;
- fresh Echo/main-stat acquisition probabilities for full world-drop cost claims;
- final character-independent generalized target-requirement structure;
- final whole-build DPS-aware stopping policy, which requires a verified character combat model.

See [`PROJECT_STATUS.md`](PROJECT_STATUS.md) for the authoritative completion gate.
