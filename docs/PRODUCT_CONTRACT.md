# Bellibing Simulator — Product Contract v0.1

## North star

Bellibing is an Echo-building decision tool. Its primary job is not to show a theoretical DPS number; it is to tell the user what to do with the Echo in front of them and why.

The core question is:

> Given my character, sequence, weapon, team and current Echo build, should I keep rolling this Echo, stop and recycle it, equip it, replace something, or farm somewhere else?

## Normal user input

Keep normal-mode input minimal:

- Character
- Sequence
- Weapon + rank
- Team / supported standard team profile
- Owned Echoes or the Echo currently being rolled

Default internally unless Advanced mode is opened:

- Character level max
- Skill levels max
- Weapon level max
- Versioned standard rotation
- Versioned enemy/context assumptions
- Source-backed support behavior

## One continuous workflow, not two disconnected modes

Building a new character and judging an Echo are the same loop:

1. Select the character/build context.
2. Bellibing explains what stats have real marginal value for this build.
3. Enter or scan the Echo currently being rolled.
4. At +5/+10/+15/+20/+25, Bellibing evaluates whether continuing has better expected value than stopping/restarting.
5. Once a usable five-Echo build exists, Bellibing compares each slot by actual whole-build Personal Rotation DPS impact and upgrade economics.
6. The tool estimates what a meaningful improvement is likely to cost.

## Decision hierarchy

The engine must keep these concepts separate:

1. **Current Echo quality** — actual effect of the Echo currently owned.
2. **Weakest Echo** — lowest current contribution / replacement vulnerability.
3. **Best Upgrade Target** — slot with the best expected Personal Rotation DPS gain per resource.
4. **Accepted Replacement** — candidate that is actually better than the incumbent under the locked combat context and passes mandatory gates such as ER.
5. **Roll/Stop decision** — whether the next checkpoint has better expected value than abandoning the current candidate and starting a new attempt.

Weakest Echo is not automatically Best Upgrade Target.

## Actual build impact beats visual rankings

No highlighted-stat list, guide label, Core/Useful/Filler classification or conventional "double crit" score may be the final judge.

A Heavy Attack DMG, Basic Attack DMG, Skill DMG, Liberation DMG or Flat ATK roll can be valuable when the character's real rotation and current build make it valuable.

The tool must be able to say:

> This Echo looks weaker than it is. Heavy Attack DMG contributes materially to this character's standard rotation, so replacing it requires a genuinely better whole-build result.

## Roll checkpoints and resource economics

The migration target preserves V9.15's sequential +5/+10/+15/+20/+25 concept, resource accounting and recycle economics, but the final policy becomes DPS-aware.

At each checkpoint Bellibing should eventually expose:

- Continue / Conditional Continue / Stop
- Why
- Which next-roll outcomes keep the Echo alive
- Chance of becoming an accepted replacement
- Expected Echoes / Tuners / EXP to reach a meaningful improvement
- Expected Personal Rotation DPS gain if successful
- Tuners per +1% DPS (or a successor efficiency metric)

The exact roll probabilities, resource costs and refunds must come from verified game data / validated V9.15 logic. They are not hardcoded in this contract.

## Current vs Expected

Preserve the existing V9.15 semantic split:

- **Current** = the user's actual RNG outcome / owned build.
- **Expected** = statistical/economic expectation under the chosen farming/rolling policy.

A reroll can change Current without changing Expected. These states must never be silently merged.

## Combat evaluation

The comparison objective is selected-character Personal Rotation DPS under a versioned, character-specific context.

Normal users should not need to enter rotation details. The context may include team buffs, enemy assumptions, timing, state mechanics and ER requirements, but those belong to the verified character model.

Mandatory gates such as ER can invalidate an otherwise higher raw-damage candidate.

## Explanations are a product requirement

Every recommendation should be explainable in user language:

- why a normally ignored stat matters here;
- why an apparently strong crit Echo is not actually an upgrade;
- why continuing from +10 is or is not economical;
- why a slot is the best place to spend resources;
- why an Echo is already strong enough that farming it is low-value.

## Proven V9.15 concepts to migrate

- Owned Echo routing
- Current vs Expected separation
- Sequential roll checkpoints
- Echo/Tuner/EXP budgets and refunds
- Temporary vs Kept lifecycle (concept, not necessarily labels)
- Per-slot cumulative spend
- Lock incumbent / keep until genuinely better
- Whole-build DPS replacement test
- ER-valid replacement gate
- Weakest marker as a heuristic only
- Monte Carlo upgrade economics
- Best Upgrade Target distinct from Weakest
- Baseline/snapshot comparison

## Things explicitly not to migrate as final architecture

- Spreadsheet coordinates as contracts
- giant formula dependency chains
- static profile score as final Echo quality
- manual target-substat setup as a required normal-user workflow
- UI complexity required only because Sheets needed cache/fingerprint controls

## The checkpoint answer must be conditional, not a static tier list

For a partially rolled Echo the tool should be able to say:

- **Continue now** when the current branch already has better expected economics than restarting.
- **If the next roll is X/Y/Z, continue** when those future branches dominate a restart.
- **If the next roll is A/B, discard** when restarting dominates those branches.
- **Tradeoff / pending** when the model cannot honestly choose yet.

The labels X/Y/Z are never globally hardcoded as good stats. The same `HP%` roll can be a discard on one character and a continue on an HP-scaling character because the combat evaluator, not the stat name, decides its value.
