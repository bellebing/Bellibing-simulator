# Echo decision model v0.1

## The user should experience one loop

There is no hard separation between "build mode" and "Echo mode". A new character build naturally becomes a repeated Echo decision:

> I rolled this Echo to this checkpoint. Is continuing from here a better route to a strong build than abandoning it and starting a fresh Echo?

## State

A decision state contains:

- selected character / sequence / weapon / team;
- locked standard combat context;
- current five-Echo build (including empty/in-progress slots);
- the candidate Echo being rolled;
- checkpoint (+0/+5/+10/+15/+20/+25);
- resources spent so far and, when provided, remaining resources;
- verified roll/refund probability model.

## Acceptance at +25

A candidate is not accepted because it looks good. It is accepted because replacing the incumbent produces a valid whole-build result.

Minimum acceptance contract:

1. Required build gates pass (for example ER when a hard gate exists).
2. Personal Rotation DPS is higher than the incumbent under the identical locked context.
3. Any future "meaningful improvement" floor is explicit and versioned; it may not be silently baked into a score.

## Continue vs restart

For an in-progress Echo, simulate/solve two paths from the current checkpoint:

### Continue

Spend only the future cost required to advance this exact Echo through later checkpoints, following the roll policy and stopping rules.

### Restart

Recycle/abandon according to verified rules and begin from a fresh eligible Echo of the required Cost/Main Stat pool.

For both paths estimate:

- probability of eventually producing an accepted replacement;
- expected Echoes consumed;
- expected Tuners consumed net of verified refunds;
- expected EXP consumed net of verified refunds;
- expected Personal Rotation DPS gain when successful;
- distribution, not only the mean, when it materially changes the decision.

## Decision rule

First use Pareto dominance. If continuing has at least as good upgrade probability and successful DPS gain while costing no more of every tracked resource, continue. If restart dominates the same way, stop/restart.

If the resources conflict (for example continue costs fewer Echoes/EXP but more Tuners), do not hide that conflict inside an arbitrary universal score. Resolve it through a versioned budget policy, preferably using the user's actual resource constraints when available and a validated Bellibing default when not.

This preserves the V9.15 idea that resources are real constraints while avoiding a fake one-number "Echo score".

## Why a strange Echo can survive

At every checkpoint, the combat evaluator can value the substats actually present. A Heavy/Basic/Skill/Liberation/Flat ATK roll is therefore allowed to keep an Echo alive when it materially improves the modeled rotation, even when a guide would not visually highlight it.

The explanation layer should identify those cases explicitly:

> Continue. Heavy Attack DMG is carrying more value on this build than it looks like; a Crit roll next would put this Echo on a strong upgrade path.

## New character workflow

1. Choose character, sequence, weapon and team.
2. Load the verified default rotation/context.
3. Show a simple "what has value here" guide based on marginal DPS, not static labels.
4. Start entering/scanning Echoes.
5. At every checkpoint, return Continue / Conditional / Stop with explanation and economics.
6. As the five slots fill, switch naturally from "make a usable build" toward "incumbent must stay until actually beaten".
7. Once the build is mature, show where the next meaningful upgrade is cheapest and what it is expected to cost.

## Runtime boundary

The decision layer must not know Wuthering Waves RNG constants. `EchoRollRuntime` is an adapter supplied by verified game/economy data. This keeps three things separate:

1. **Game RNG/economy truth** — how an Echo rolls and what it costs/refunds.
2. **Combat truth** — what the resulting whole build does in Personal Rotation DPS and whether required gates pass.
3. **Decision policy** — whether continuing the current partial Echo dominates discarding/restarting, or whether a real resource tradeoff remains.

A stale or unavailable runtime rule therefore becomes `pending`, not a guessed constant.

## Verified Echo runtime checkpoint (2026-08-21)

The app now has a source-backed Rank-5 Echo tuning adapter for already-eligible Echo candidates:

- 13 substat types, sampled without replacement;
- July 2026 disclosed value-tier weighting, including the distinct low-roll-heavy Crit distribution;
- cumulative +5/+10/+15/+20/+25 EXP and Tuner costs;
- 75% effective EXP recovery and 30% Tuner recovery.

Still intentionally separate/pending:

- Sonata/main-stat acquisition odds and overworld/Tacet acquisition rate;
- direct dismantle material-rounding semantics versus effective feed value;
- Frequency Tuner/reroll features;
- Shell Credit economics;
- the character combat evaluator required to judge whether a resulting Echo is actually an upgrade.

`expectedCostToSuccess` is defined as the expected cost of **all attempts until one accepted upgrade**, so failed Echo spend must be included. For stationary independent attempts this is `E[cost per attempt] / P(success)`, not the average cost of the successful attempts alone.
