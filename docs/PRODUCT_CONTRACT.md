# Bellibing Simulator — Product Contract v0.2

## North star

Bellibing is an Echo-building decision tool. Its primary job is not to show a theoretical DPS number; it is to tell the user what to do with the Echo in front of them.

The core question is:

> Given my character, sequence, weapon, team, target build and current Echoes, what should I do next?

## Normal user input

Keep normal-mode input minimal:

- Character
- Build target: Recommended / Strong / High-end / Custom
- Sequence / weapon / team only when they differ from the supported default
- Owned Echoes or the Echo currently being rolled
- Resource budget when the user wants a cost estimate

Default internally unless Advanced mode is opened:

- Character and weapon max level
- Skill levels max
- Versioned standard rotation
- Versioned enemy/context assumptions
- Source-backed support behavior
- Recommended Echo set, loadout and main stats
- Character-specific stat valuation/ER requirements when verified

Normal users must not have to configure stat weights from zero before Bellibing becomes useful.

## Information budget: one action at a time

Normal mode is an assistant, not an analysis dashboard.

The primary surface should normally show one short instruction/verdict:

- **ROLL TO +5 / +10 / +15 / +20 / +25**
- **DISCARD**
- **USE FOR NOW** (Temporary)
- **KEEP**
- **UPGRADE THIS ECHO**
- **BUILD DONE**

Complex probabilities, DPS deltas, branch economics and Monte Carlo diagnostics remain available to the engine and tests but are not shown by default. A small **Why?** affordance may reveal the minimum explanation needed for a surprising decision.

If one compact number answers the user's question, do not replace it with a distribution dashboard. For build-cost planning, prefer a concise average/expected cost unless more detail is explicitly requested.

## One continuous workflow

Building a new character and judging an Echo are the same loop:

1. Select character and target quality.
2. Bellibing loads the supported default build profile.
3. Bellibing tells the user which Echo to build first and to roll it to +5.
4. The user enters the real in-game roll.
5. At each checkpoint Bellibing says only what to do next: roll again, discard, use temporarily, or keep.
6. A Temporary Echo is good enough to move on but remains an upgrade candidate.
7. Once five usable Echoes exist, Bellibing identifies the best next upgrade target from whole-build value and expected improvement cost.
8. The user may stop when satisfied; otherwise the same loop continues in Upgrade Mode.

## Decision hierarchy

The engine must keep these concepts separate:

1. **Current Echo quality** — actual effect of the Echo currently owned.
2. **Temporary** — usable enough to progress the build but below the chosen final target.
3. **Weakest Echo** — lowest current contribution / replacement vulnerability.
4. **Best Upgrade Target** — slot with the best expected meaningful improvement per resource.
5. **Accepted Replacement** — candidate actually better than the incumbent under the locked combat context and mandatory gates.
6. **Roll/Stop decision** — whether another checkpoint remains economical given the current Echo, remaining rolls and whole-build target.

Weakest Echo is not automatically Best Upgrade Target.

## Checkpoint decisions are contextual

A stat label is never globally hardcoded as good or bad.

The same DEF roll can be a discard in one state and survivable in another. The same low Crit roll can be insufficient for a High-end target but acceptable for a Recommended target. The decision depends on:

- exact values already rolled;
- remaining possible rolls;
- the selected build target;
- what the other four Echoes already provide;
- mandatory gates such as ER;
- expected cost of continuing versus restarting;
- actual whole-build DPS impact when the character model is verified.

This means roll quality matters: a low and high roll of the same substat are not automatically equivalent.

## Actual build impact beats visual rankings

No highlighted-stat list, guide label, Core/Useful/Filler classification or conventional double-crit score may be the final judge for a DPS-integrated character.

A Heavy Attack DMG, Basic Attack DMG, Skill DMG, Liberation DMG or Flat ATK roll can be valuable when the character's real rotation and current build make it valuable.

Guide profiles may be used as a clearly labeled fallback while a new character's DPS model is still pending. Once a verified Personal Rotation DPS model exists, actual build impact becomes the final judge.

## Roll checkpoints and resource economics

Preserve V9.15's sequential +5/+10/+15/+20/+25 concept, resource accounting, discard refunds and Temporary/Kept lifecycle.

The engine may calculate internally:

- future branch probabilities;
- chance of reaching the selected build target;
- continue-vs-restart economics;
- expected Echo / Tuner / EXP / Shell Credit cost;
- Personal Rotation DPS impact;
- best upgrade target.

Those metrics support the verdict. They are not a requirement to clutter the normal UI.

The exact roll probabilities, resource costs and refunds must come from verified game data / validated V9.15 logic.

## Current vs Expected

Preserve the existing V9.15 semantic split:

- **Current** = the user's actual RNG outcome / owned build.
- **Expected** = statistical/economic expectation under the chosen farming/rolling policy.

A reroll can change Current without changing Expected. These states must never be silently merged.

## Combat evaluation

The comparison objective is selected-character Personal Rotation DPS under a versioned, character-specific context.

Normal users should not need to enter rotation details. The context may include team buffs, enemy assumptions, timing, state mechanics and ER requirements, but those belong to the verified character model.

Mandatory gates such as ER can invalidate an otherwise higher raw-damage candidate.

## Explanations

Every recommendation must be explainable, but explanations are on demand rather than permanently displayed.

A useful Why? answer explains the deciding factor, for example:

- the Echo still has enough viable future paths;
- a low roll plus two misses made the selected target too expensive;
- ER is still required;
- an apparently odd stat contributes real rotation damage;
- this slot is cheaper to improve than the visually weakest one.

## Proven V9.15 concepts to migrate

- Owned Echo routing
- Current vs Expected separation
- Sequential roll checkpoints
- Echo/Tuner/EXP budgets and refunds
- Temporary vs Kept lifecycle
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
- probability/detail dashboards that do not change the user's next action
