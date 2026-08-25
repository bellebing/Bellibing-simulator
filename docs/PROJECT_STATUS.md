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

### Echo Lab — COMPLETE FOR MECHANICAL ORACLE

The Echo Lab is the canonical validation surface for eligible Rank-5 tuning mechanics.

Implemented and regression-tested:

- eligible Echo batch generation from the shared Echo Core runtime;
- exact checkpoint-scaled primary and secondary main-stat state at +0 / +5 / +10 / +15 / +20 / +25;
- representative Lab-orchestration coverage across COST 1 / 3 / 4 at every checkpoint, on top of Echo Core's exhaustive main-stat-family tests;
- source-exact primary main-stat browser display with two-decimal precision where one-decimal guide rounding would hide the internal value;
- seeded exact reproduction for the same seed and action sequence;
- selective/batch tuning through the real checkpoint path;
- checkpoint EXP, Tuners and Shell Credits accounting;
- discard recovery through the shared recovery rules;
- separate loadout validation without preventing intentionally invalid Lab experiments;
- built browser-artifact readback confirming the verified main-stat rule is what the exported app displays.

PR #32 synchronized the browser surface with the verified runtime, PR #33 fixed mechanical-oracle display precision, and PR #34 locked representative COST/checkpoint integration coverage.

Fresh desired-main acquisition probability remains deliberately outside Echo Lab's eligible-candidate tuning scope until source-verified acquisition weights exist. That pending acquisition model does not make the mechanical tuning oracle incomplete.

### Roll / stopping policy — COMPLETE FOR GUIDE/PROFILE FALLBACK

PR #36 removed the universal exactly-two-Core assumption from the fallback requirement engine.

Implemented and regression-tested:

- each character/mode profile owns its Core target set;
- each character/mode profile owns its Useful target set;
- `requiredCoreHits` and `requiredUsefulHits` are explicit profile data;
- final requirement and reachability math support more than two defined Core targets and subset requirements;
- exact roll values and remaining unique substat slots remain part of feasibility;
- the same +25 Echo is regression-tested to produce different verdicts under different profile requirements;
- Augusta's active V9.15 Recommended parity remains 2 Core + Any 1 Useful;
- the exact Augusta Strategy Cache distribution remains locked unchanged;
- invalid requirement counts fail instead of silently becoming impossible.

The current Bellibing Budget behavior around Dead/Filler checkpoint routing remains a **guide-target fallback policy**, not the universal Bellibing final decision rule.

The exact probability distribution collapses target roll magnitude to pass/fail mass only because this fallback policy uses a minimum threshold. That is mathematically valid for this policy but is not sufficient for final DPS-aware decisions.

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

This layer cannot be truthfully finalized for a character until that character has a verified combat/DPS model. The generic simulation/evaluator interface is available; character-specific DPS truth comes later.

### Content Preflight + Backward Impact — COMPLETE AS PROJECT PROCESS CONTRACT

The mandatory onboarding and patch-propagation contract is defined in [`CONTENT_PREFLIGHT_AND_IMPACT_AUDIT.md`](CONTENT_PREFLIGHT_AND_IMPACT_AUDIT.md).

Every new/changed character, weapon, Sonata set, Echo or combat-affecting effect must now be handled as two jobs:

1. verify/model the new content itself;
2. screen compatible already-supported profiles for backward impact.

A patch/content batch is not fully integrated while plausible old-profile candidates remain unreviewed. `Reviewed — no impact` is valid; silently skipping the review is not.

Important propagation examples:

- new weapon -> existing characters of that weapon type;
- new Sonata set -> existing compatible loadouts/modes;
- new Echo -> existing compatible main-Echo/loadout uses;
- new character -> own build plus existing characters that may benefit from their team-facing effects;
- newly modeled old passive -> every profile that consumes or plausibly benefits from that effect.

This contract prevents old Character↔Weapon, Echo/Sonata, Team, Rotation and DPS profiles from silently going stale as patches add new options.

### Character raw database — FOUNDATION

60 Character records exist and raw Character data is separated from weapons, Echo recommendations, teams and rotations.

Not complete yet:

- every released Character must receive a full source audit for the static fields Bellibing needs;
- unresolved/null core fields must be eliminated where current source data exists;
- base stats, Max Energy, base CR/CD/ER and intrinsic/static stat nodes must be verified consistently;
- raw skill/Forte/passive/sequence facts must live in separate character-fact catalogs before character DPS adapters are written.

A record existing in the roster does not mean the character is fully modeled.

Current known released raw-data blockers include source-conflicted/null fields such as Qingxiao Max Energy, Rover (Electro) core fields and Suisui core fields. These must be resolved from current sources or remain explicitly pending; they must not be guessed.

### Weapon raw database — CORE CATALOG FOUNDATION

122 Weapon records exist with independent identity/core-stat data.

Before Weapon data is complete:

- audit the complete released roster against current patch data;
- ensure every supported weapon has verified Level-90 core stats and secondary stat;
- keep signature/BiS/recommendation outside raw Weapon data.

Every new weapon must also trigger the backward compatibility screen defined by the content-impact contract.

### Weapon Effects — FOUNDATION / PARTIAL COVERAGE

36 audited effects across 16 weapons are modeled in the independent effect layer.

Before complete:

- populate effects for the full supported released Weapon catalog;
- store R1–R5 values, triggers, durations, stacks, scope and conditions where applicable;
- missing mechanics remain explicit pending/conditional rather than silently treated as zero;
- effect records must remain independent from character recommendations and rotation uptime.

A newly modeled effect is a changed combat fact and must trigger a backward-impact review even when the weapon itself is old.

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

New or changed sets must be screened against existing compatible character modes.

### Echo effects and attacks — FOUNDATION / PARTIAL COVERAGE

Current modeled coverage is intentionally small:

- 8 audited non-damage effects across 5 Echoes;
- The False Sovereign is the first exact Echo attack fixture.

Before complete:

- raw active-skill parameters/facts must be available for the full supported Echo catalog;
- non-damage main-slot/team/conditional effects must be captured separately from active attack motion values;
- character-restricted effects must carry explicit conditions;
- no character recommendation or rotation uptime belongs in the Echo fact itself.

New Echoes must be screened against compatible existing main-Echo/loadout modes.

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
- a UI selection should resolve a preset and receive the linked independent records;
- new compatible weapons/sets/Echoes/supports must trigger backward review of existing profile relations instead of relying only on forward onboarding.

### Roll Assistant UI — BLOCKED, NOT PART OF THE PRE-DPS DATA FOUNDATION

The live page exists but currently has an open blocker where the user reports `DISCARD` for every input path. It remains a test surface until fixed and live-regression-tested.

UI polish is intentionally lower priority than completing the engine/data foundation.

## Order before broad Character DPS work

1. **DONE — PR #30:** Complete Echo Core checkpoint main-stat progression.
2. **DONE — PR #32/#33/#34:** Harden Echo Lab as the mechanical oracle for Echo tuning.
3. **DONE — PR #36:** Generalize/profile-proof the non-DPS fallback roll policy.
4. **DONE — PROCESS CONTRACT:** Lock Character Preflight + Backward Impact Audit for future content.
5. **NEXT:** Complete Character static/raw facts and required character-fact catalogs.
6. Complete Weapon core roster + Weapon Effects coverage.
7. Complete current Echo/Sonata raw audit.
8. Complete Sonata Effect coverage.
9. Complete Echo skill/effect/attack fact coverage needed by supported content.
10. Complete/populate composable default profiles.
11. Freeze and regression-test all pre-DPS contracts and current-patch backward-impact state.
12. Only then expand Character combat/DPS adapters character-by-character.
13. As each character gains verified DPS, replace guide fallback stopping decisions with whole-build DPS-aware decisions for that character.
14. On every later patch, run Content Preflight + Backward Impact before declaring the patch integrated.

## Documentation rule

Current project documentation describes the Bellibing application and its present contracts. Historical spreadsheet implementation details are not a project roadmap. Old spreadsheet behavior may be cited only when it is provenance for a verified invariant or parity regression.
