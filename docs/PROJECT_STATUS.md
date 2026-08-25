# Bellibing Simulator — Current Project Status

This document is the current implementation status for the Bellibing application.

`FOUNDATION` means the architecture exists and is tested, but coverage is incomplete.
`COMPLETE` means the layer has the data/behavior required for its supported product scope with no known blocking gaps.
`BLOCKED` means a known gap prevents that layer from being called complete.

The project must pass the **Pre-DPS Completeness Gate** before broad character DPS-model expansion begins.

## Pre-DPS Completeness Gate

### Echo Core — COMPLETE FOR ELIGIBLE-CANDIDATE TUNING

Implemented and tested:

- Rank-5 COST 1 / 3 / 4 main-stat pools.
- fixed secondary main-stat class.
- exact Rank-5 primary and secondary main-stat progression at +0 / +5 / +10 / +15 / +20 / +25.
- source-backed GrowthValue scaling with integer truncation rather than guide rounding.
- regression coverage across all 19 Rank-5 primary main-stat families and all three secondary families at every checkpoint.
- 13 unique substat types.
- verified substat roll values and value probabilities.
- sequential +5 / +10 / +15 / +20 / +25 tuning.
- EXP, Tuners and Shell Credits.
- 75% effective EXP recovery, 30% Tuner recovery, zero Shell Credit recovery.
- seeded reproducible runtime.
- separate 5-Echo / COST-12 loadout validation.

PR #30 (`3151378`) closed the intermediate-main-stat mechanics gap.

Separate scope that must be resolved explicitly before full farm-cost claims:

- fresh Echo acquisition/main-stat probability weights are not currently verified. Interactive Roll Assist can operate on an Echo the user already owns without these probabilities, but a full world-drop-to-finished-build cost model cannot claim them until verified.

This acquisition gap does not make the eligible-candidate tuning runtime incomplete; it limits what Bellibing may claim about farming from fresh world drops.

### Echo Lab — FOUNDATION

The mechanical lab can generate eligible Echo batches, roll through checkpoints, expose exact substat results, track resources/recovery and validate loadouts.

Before it is considered the canonical Echo-mechanics validation surface:

- verify the browser display/runtime exposes the exact checkpoint-scaled primary and secondary main stats now provided by Echo Core;
- add/retain browser-facing regression fixtures across representative COST/main-stat families and checkpoints rather than relying only on engine tests;
- verify seeded reproduction, checkpoint spend, discard and recovery against the engine through the actual lab flow;
- keep acquisition simulation separate from eligible-candidate tuning unless acquisition weights are verified.

### Roll / stopping policy — FOUNDATION, NOT FINAL

The current target checkpoint policy is an exact port of one legacy Budget rule family. It is profile-driven, but it still assumes exactly two Core targets plus a configurable number of Useful hits.

It is therefore a **guide-target fallback policy**, not the universal Bellibing final decision rule.

Required before broad character integration:

- target requirements must be character/profile data, never Augusta constants in UI/session code;
- requirement structure must support different character/mode needs instead of requiring exactly two Core targets universally;
- exact roll values and remaining unique substat slots must remain part of feasibility;
- no policy may classify a stat globally as good/bad independently of the selected profile/build;
- policy tests must prove two different character profiles can produce different decisions for the same partial Echo.

The current exact probability distribution collapses target roll magnitude to pass/fail mass only because that legacy policy uses a minimum threshold. This is mathematically valid for that policy, but is not sufficient for the final DPS-aware Bellibing decision layer.

### DPS-aware stopping policy — ENGINE HOOK EXISTS, FINAL POLICY PENDING DPS

`forecastCandidateViability` already simulates the remaining exact RNG branches of a real partial Echo and injects a final evaluator. This is the correct boundary for future whole-build evaluation.

For a DPS-integrated character, the final roll/stop decision must eventually use:

- current five-Echo build;
- exact current partial-Echo values;
- all remaining possible unique substats and roll tiers;
- mandatory gates such as ER;
- Personal Rotation DPS of each future branch;
- probability of a meaningful improvement over the incumbent/build target;
- future resource cost from the current checkpoint;
- selected target quality / stopping objective.

This layer cannot be truthfully finalized for a character until that character has a verified combat/DPS model. The generic simulation/evaluator interface should be complete before then; character-specific DPS values come later.

### Character raw database — FOUNDATION

60 Character records exist and raw Character data is separated from weapons, Echo recommendations, teams and rotations.

Not complete yet:

- every released Character must receive a full source audit for the static fields Bellibing needs;
- unresolved/null core fields must be eliminated where current source data exists;
- base stats, Max Energy, base CR/CD/ER and intrinsic/static stat nodes must be verified consistently;
- raw skill/Forte/passive/sequence facts must live in separate character-fact catalogs before character DPS adapters are written.

A record existing in the roster does not mean the character is fully modeled.

### Weapon raw database — CORE CATALOG FOUNDATION

122 Weapon records exist with independent identity/core-stat data.

Before Weapon data is complete:

- audit the complete released roster against current patch data;
- ensure every supported weapon has verified Level-90 core stats and secondary stat;
- keep signature/BiS/recommendation outside raw Weapon data.

### Weapon Effects — FOUNDATION / PARTIAL COVERAGE

36 audited effects across 16 weapons are modeled in the independent effect layer.

Before complete:

- populate effects for the full supported released Weapon catalog;
- store R1–R5 values, triggers, durations, stacks, scope and conditions where applicable;
- missing mechanics remain explicit pending/conditional rather than silently treated as zero;
- effect records must remain independent from character recommendations and rotation uptime.

### Echo raw database — CATALOG FOUNDATION

181 Echo records and 34 Sonata records exist with stable IDs, COST and memberships.

Before calling current-patch raw Echo coverage complete:

- run a current-patch roster/source audit;
- resolve known upstream coverage differences explicitly;
- preserve the read-only reviewed sync workflow.

### Sonata Effects — FOUNDATION / PARTIAL COVERAGE

10 audited effects across 7 Sonata sets are modeled.

Before complete:

- model every supported Sonata set's actual piece effects;
- capture stat buffs, DMG bonuses/amplification, CR/CD, ATK/HP/DEF, conditional windows, caps/stacks and target scope as appropriate;
- trigger/uptime uncertainty remains conditional/pending rather than assumed;
- the effect model must expose combat facts; the rotation decides whether a conditional effect is active.

### Echo effects and attacks — FOUNDATION / PARTIAL COVERAGE

Current modeled coverage is intentionally small:

- 8 audited non-damage effects across 5 Echoes;
- The False Sovereign is the first exact Echo attack fixture.

Before complete:

- raw active-skill parameters/facts must be available for the full supported Echo catalog;
- non-damage main-slot/team/conditional effects must be captured separately from active attack motion values;
- character-restricted effects must carry explicit conditions;
- no character recommendation or rotation uptime belongs in the Echo fact itself.

### Composable defaults/profiles — FOUNDATION

Independent catalogs exist for:

- Weapon Recommendation;
- Echo Loadout;
- Stat Target;
- Team;
- Rotation;
- Character Preset.

The resolver validates IDs and supports multiple modes for the same raw Character.

Before complete:

- populate supported profiles character-by-character and mode-by-mode;
- no UI hard-coded character lists or direct signature-weapon coupling;
- a UI selection should resolve a preset and receive the linked independent records.

### Roll Assistant UI — BLOCKED, NOT PART OF THE PRE-DPS DATA FOUNDATION

The live page exists but currently has an open blocker where the user reports `DISCARD` for every input path. It remains a test surface until fixed and live-regression-tested.

UI polish is intentionally lower priority than completing the engine/data foundation.

## Order before broad Character DPS work

1. **DONE — PR #30:** Complete Echo Core checkpoint main-stat progression.
2. Harden Echo Lab as the mechanical oracle for Echo tuning.
3. Generalize/profile-proof the non-DPS roll policy.
4. Complete Character static/raw facts.
5. Complete Weapon core roster + Weapon Effects coverage.
6. Complete current Echo/Sonata raw audit.
7. Complete Sonata Effect coverage.
8. Complete Echo skill/effect/attack fact coverage needed by supported content.
9. Complete/populate composable default profiles.
10. Freeze and regression-test all pre-DPS contracts.
11. Only then expand Character combat/DPS adapters character-by-character.
12. As each character gains verified DPS, replace guide fallback stopping decisions with whole-build DPS-aware decisions for that character.

## Documentation rule

Current project documentation describes the Bellibing application and its present contracts. Historical spreadsheet implementation details are not a project roadmap. Old spreadsheet behavior may be cited only when it is provenance for a verified invariant or parity regression.
