# Content Preflight and Backward-Impact Audit

Bellibing must treat every content addition as two jobs:

1. verify and model the new content itself;
2. audit whether the new content changes any already-supported character, build, weapon ranking, Echo/Sonata recommendation, team or combat context.

A patch is not fully integrated merely because the new records are correct.

## Non-negotiable rule

> New content is not `INTEGRATED` until its backward-impact audit is complete.

`No impact` is a valid audit result. It must be an explicit reviewed conclusion, not an assumption.

This rule applies equally to:

- newly released content;
- confirmed upcoming content being staged as non-routable data;
- balance/mechanics changes to existing content;
- corrected source data;
- newly modeled effects that previously existed only as pending/unmodeled facts.

## Source order

Use the project source policy:

1. DPR Calc Results for quantitative comparisons where a compatible completed benchmark exists;
2. Prydwen and Game8 for published standard recommendations;
3. Tethys/theorycraft resources for mechanics, rotations and edge cases;
4. Wutheringlab/Nanoka/structured databases for raw data;
5. official patch notes/in-game release state for release status and changed mechanics.

Do not mix incompatible teams, rotations, sequences or benchmark contexts simply to obtain a percentage.

---

# A. Character preflight

A new character may be registered as data before all later stages are complete, but each stage must be explicit.

## A1. Identity and release

Check:

- stable character ID and display name;
- rarity;
- element;
- weapon type;
- release status: `RELEASED`, `CONFIRMED_UPCOMING` or `UNRELEASED_WIP`;
- verification status and provenance;
- release-state source from official/current material.

Unreleased/WIP content must not silently route into production recommendations or calculations.

## A2. Raw character facts

For released characters, verify the static facts Bellibing needs:

- Level-90 HP;
- Level-90 ATK;
- Level-90 DEF;
- Max Resonance Energy;
- base CRIT Rate;
- base CRIT DMG;
- base Energy Regen;
- intrinsic/static stat nodes;
- any other permanently active raw stat that belongs to the character rather than a rotation state.

Conflicted fields stay `null`/pending with notes until resolved. Never pick a convenient value just to complete the row.

## A3. Character mechanic facts

Before a combat/DPS adapter is allowed, the separate character-fact layer must cover the mechanics used by the supported mode:

- Basic / Heavy / Skill / Liberation / Intro / Outro facts;
- Forte/state mechanics;
- damage scaling stat(s): ATK / HP / DEF / other;
- damage types/categories;
- hit counts and relevant motion values;
- inherent passives;
- conditional passives;
- stack rules, caps, durations and refresh rules;
- energy/Concerto generation or consumption where relevant;
- Resonance Chain effects for the supported sequence(s);
- effects that are verified but not yet modeled must remain explicitly pending.

Raw facts and modeled uptime are separate claims.

## A4. Build-profile preflight

Before a character is considered supported in the normal build flow, check that the selected mode resolves independent records for:

- Weapon Recommendation;
- Echo Loadout;
- Sonata set(s);
- main Echo;
- five Echo COST/main-stat slots;
- Stat Target profile;
- Core/Useful requirement counts;
- ER or other mandatory gates;
- Team profile;
- Rotation profile;
- Character Build Preset.

A character may expose several modes. Do not force Main DPS, Hybrid, Support or alternate-team assumptions into one profile.

## A5. Fallback Roll Advisor readiness

Before DPS integration, a character/mode may use the guide/profile fallback only when:

- target stats and minimum rolls are source-backed;
- required Core/Useful hit counts are explicit profile data;
- Filler/Dead roles are profile-specific, not global rules;
- conditional gates such as ER are explicit;
- the same partial Echo can legitimately receive a different verdict under another profile when requirements differ.

The fallback must never be presented as actual DPS optimization.

## A6. DPS readiness

Do not mark the character DPS-integrated until all required inputs for the locked context are verified:

- selected character and sequence;
- weapon + rank;
- Echo/Sonata loadout;
- team/support identities and support equipment assumptions;
- enemy DEF/RES/context;
- exact rotation/action order;
- event timing where buff windows or state timing matter;
- character and support buffs/debuffs;
- conditional uptime/state assumptions;
- ER/recovery behavior where timing can change;
- benchmark/parity target where one exists.

Required regression gates include baseline parity plus controlled-stat changes before the model becomes a production judge.

---

# B. New weapon audit

When a weapon is added or its effect becomes newly modeled:

## B1. Verify the weapon itself

Check:

- weapon type;
- rarity and release status;
- Level-90 Base ATK;
- Level-90 secondary stat/value;
- R1-R5 effect values;
- trigger;
- duration;
- stacks/caps;
- target scope;
- active/off-field/team behavior;
- conditional or pending portions;
- provenance.

Raw weapon data must not contain a universal `BiS` character claim.

## B2. Backward compatibility screen

Audit every released character using the same weapon type.

First-pass filters may use verified mechanics, for example:

- scaling stat matches the weapon buff;
- relevant attack type matches the weapon bonus;
- character can satisfy the trigger;
- on-field/off-field requirement matches the rotation;
- ER/energy effect could alter a gate or rotation;
- team buff could make the weapon valuable despite lower personal stats;
- stack duration/refresh is compatible with the rotation.

Do **not** stop at a signature label. A new weapon may become best or competitive for an old character.

## B3. Rebenchmark affected characters

For every plausible candidate:

- compare under the character's existing locked benchmark context;
- keep rank assumptions explicit;
- update Character↔Weapon recommendation relations if warranted;
- update relative percentages only from a coherent comparable benchmark;
- re-evaluate ER gates/rotation assumptions if the weapon changes energy behavior;
- leave ranking/percentage pending when the available sources do not support a fair comparison.

Record either `impact found` or `reviewed — no impact`.

---

# C. New Sonata set audit

When a Sonata set is added or its effect changes:

## C1. Verify set facts

Check piece-count effects separately and capture:

- stat bonuses;
- DMG bonuses/amplification;
- CRIT/ATK/HP/DEF/ER changes;
- trigger;
- duration;
- stacks/caps;
- self/team/next-character scope;
- on-field/off-field requirements;
- element/attack-type/state restrictions;
- conditional or pending portions.

## C2. Backward-impact screen

Audit existing character modes for compatibility with the new effect:

- scaling stat;
- element;
- dominant damage category;
- attack-type distribution;
- ER requirement;
- team role;
- swap/Outro/Intro behavior;
- healer/shielder/buffer trigger access;
- ability to maintain the set condition during the locked rotation.

If plausible, benchmark the new set against that mode's current recommended set under the same context.

A new set may change:

- recommended Sonata;
- main Echo choice;
- main-stat shell;
- target substats;
- ER requirement;
- rotation;
- Personal DPS;
- Team DPS;
- support value.

All dependent profiles must be re-audited when any of those move.

---

# D. New Echo audit

A new Echo requires two independent checks.

## D1. Raw/active-skill facts

Verify:

- stable Echo ID/name;
- COST;
- Sonata memberships;
- active attack motion values/hit structure;
- cooldown;
- non-damage effects;
- buffs/debuffs;
- duration/stacks/scope;
- transform/summon/off-field behavior;
- character restrictions/conditions.

Active attack damage and non-damage effects remain separate fact layers.

## D2. Backward-impact screen

Audit characters that can use its Sonata membership and characters whose rotation/scaling matches the Echo's active effect.

Compare against their current main Echo where plausible. A new Echo can change a build even if the Sonata set itself is unchanged.

---

# E. New character as a support/team member

A new character must be audited twice:

1. **for their own build**;
2. **as a possible teammate for existing characters**.

This second audit is mandatory and is the main protection against stale old-character DPS.

Screen the new character's team-facing effects for:

- DMG amplification/deepen;
- element-specific buffs;
- Basic/Heavy/Skill/Liberation/Echo/Coordinated-Attack buffs;
- CRIT Rate / CRIT DMG;
- ATK / HP / DEF;
- Energy/ER/recovery;
- Concerto generation;
- resistance reduction;
- grouping/control;
- healing/shielding/survivability that enables another rotation;
- Outro/Intro effects;
- off-field damage;
- state/stack interactions;
- sequence-dependent team buffs.

Then identify all existing character modes whose locked context could plausibly improve.

For each candidate old character:

- compare the new teammate against the currently supported teammate in the same objective;
- re-run Personal Rotation DPS if support buffs change the selected character's damage;
- re-run Team DPS when that metric exists;
- re-check ER/rotation duration and event timing;
- re-check optimal weapon/sets/substats if the new support changes stat saturation or gates;
- version a new Team/Rotation/Profile record instead of silently mutating an unrelated mode when both contexts remain useful.

A new support can therefore trigger changes to an old character without changing that old character's raw data at all.

---

# F. Change propagation rules

Whenever an audited change modifies a relationship, follow the dependency chain.

Examples:

```text
New weapon
  -> compatible old characters
  -> weapon recommendation comparison
  -> build stats / ER gate if relevant
  -> DPS context if modeled
  -> Roll Advisor whole-build evaluation if modeled
```

```text
New Sonata set
  -> compatible old character modes
  -> Echo loadout/main Echo/main stats
  -> target/gate changes
  -> rotation/DPS comparison
  -> Roll Advisor evaluation
```

```text
New support character
  -> compatible old DPS characters
  -> Team Profile
  -> Rotation Profile
  -> support buffs/state
  -> Personal/Team DPS
  -> stat/gate/recommendation changes
```

Never edit raw Character/Weapon/Echo data merely because a recommendation changed.

---

# G. Patch-level completion gate

For each patch/content batch, record:

- new/changed content IDs;
- raw verification result;
- effect-model status;
- profiles added/changed;
- old characters screened for impact;
- affected old profiles rebenchmarked;
- explicit `no impact` conclusions where applicable;
- pending blockers;
- regression tests run;
- source check date.

The batch is not fully integrated while plausible backward-impact candidates remain unreviewed.

## Minimum audit matrix

| New/changed content | Mandatory backward screen |
| --- | --- |
| Character | own build + every existing character potentially helped by its team effects |
| Weapon | every released character of the same weapon type, narrowed by effect compatibility |
| Sonata set | every existing mode compatible with its stats/triggers/scope |
| Echo | every compatible Sonata/main-Echo mode and active-effect use case |
| Character/effect balance change | every profile/team/rotation that consumes the changed fact |
| Weapon/effect balance change | every Character↔Weapon relation using or plausibly using it |
| Sonata/Echo balance change | every Echo loadout/profile consuming or plausibly preferring it |

---

# H. Example: hypothetical new character

Suppose a future character named `Zuming` is staged.

Do **not** begin by copying another character's defaults.

First run Character Preflight and mark unresolved facts pending. Once Zuming's own profile is source-backed, inspect all team-facing effects. If Zuming buffs Heavy Attack DMG, Electro DMG and Energy recovery, the backward audit should deliberately find existing modes that consume those mechanics and compare Zuming against their current team profiles.

If Zuming launches with a new Sword, the Sword receives its own Weapon Audit. Every existing released Sword user is screened even if the weapon is marketed as Zuming's signature.

If the patch also introduces a new Sonata set, that set receives its own backward audit independently of Zuming.

The result may be:

- Zuming own profile added;
- new Sword becomes an alternative for three old Sword users;
- new set replaces one old character's recommended set;
- Zuming becomes a stronger support for one old DPS mode;
- twenty other reviewed characters receive `no impact`.

That is a successful patch audit. Only adding Zuming's own records is not.
