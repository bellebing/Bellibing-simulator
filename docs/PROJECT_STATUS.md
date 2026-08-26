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

### Character raw/mechanics foundation — STATIC GATES COMPLETE, MECHANICS COVERAGE PARTIAL

60 Character records exist and raw Character data is separated from weapons, Echo recommendations, teams and rotations.

PR #38 added an executable released-character Level-90/core completeness gate. For the 57 currently released Characters, a required raw field may only remain null when the exact Character + field is registered as a dated pending exception with a reason. Current unresolved core exceptions are limited to Max Energy semantics for Qingxiao, Rover (Electro) and Suisui; resolved fields may not keep stale pending exceptions.

PR #39 moved static Minor-Forte stats into an independent raw catalog and requires explicit coverage for all 57 released Characters. The one current intrinsic conflict is Mornye DEF%, where current sources disagree; it remains explicit pending rather than being guessed.

PR #40 introduced the generic Character Mechanics Fact Layer plus executable support/preflight stages. Raw mechanics are separated from rotations so a rotation consumes canonical facts instead of becoming its own duplicate database.

PR #41 uses Augusta only as the golden-reference mechanics fixture. It verifies the architecture for action facts, resources, passives, Outro, sequences, modeled-vs-assumed dependencies and reverse impact lookup without declaring the whole roster modeled.

PR #54 hardened the coverage contract before roster-wide ingestion. A mechanics area marked `VERIFIED` must now be backed by linked source-`VERIFIED` facts, `SEQUENCES` requires exact S1-S6 facts, orphan character-owned facts are structural errors, and structural errors block a character from appearing source-complete even if profile status metadata says `VERIFIED`.

PR #55 starts real roster-wide source ingestion with Aalto and extends ACTION facts with optional exact Lv1-Lv10 motion-value curves. For an `ACTIONS` area to be `VERIFIED`, every damaging action fact requires an exact ten-level source representation; exact-parity single-level fixtures such as Augusta's existing Lv10 subset are not falsely promoted to full source coverage.

PR #56 extends that raw action contract for Aemeath instead of flattening a more complex kit into the simpler Aalto shape. Mixed source expressions such as `a*3+b+c` can now be stored as independent coefficient components with explicit hit counts, `TUNE_AMP` is represented as a real Character scaling stat, and the verified-ACTIONS audit accepts either one exact ten-level coefficient curve or a validated mixed-component representation — never both on the same damaging fact.

Current Character mechanics coverage:

- 57 currently `RELEASED` characters are in the gate;
- 3 characters have mechanics profiles;
- **Aalto: `VERIFIED` raw mechanics coverage** across ACTIONS, FORTE_RULES, INHERENT_PASSIVES, OUTRO_EFFECT, RESOURCE_RULES and SEQUENCES;
- **Aemeath: `VERIFIED` raw mechanics coverage** across all six required areas, including 26 source-audited ACTION facts, three resource systems, raw Forte/state rules, both Inherent skills, Outro and S1-S6;
- **Augusta: `PARTIAL`**, because her exact S0 Standard Lv10 golden action subset is still not a full current Lv1-Lv10 action-curve ingestion;
- 54 released characters remain `UNSTARTED` for Character mechanics;
- 99 canonical Character mechanic facts now exist: 26 Aalto facts, 45 Aemeath facts and the existing 28 Augusta facts;
- Aalto and Aemeath `RAW_FACTS` preflight pass, while their `BUILD_PROFILE` and `DPS_MODEL` stages remain blocked by independent recommendation/team/rotation/combat-profile requirements.

The Aalto/Aemeath source slices lock the raw/executable boundary instead of converting source text into implicit combat assumptions:

- source coefficients are stored as exact Lv1-Lv10 representations without silently choosing a talent level;
- explicit source hit multipliers remain separate from coefficient curves, and mixed-hit Aemeath expressions keep each source coefficient as an independent component rather than being pre-summed;
- Aemeath Tune Rupture Response — Starburst and the separate Seraphic Duet bonus coefficient are represented as `TUNE_AMP` scaling and remain `PENDING_INTERPRETATION` for executable encounter/status semantics;
- Aemeath Synchronization Rate is source-audited at cap 200 with current multi-source Intro +40 / Heavenfall Edict: Overdrive +30 semantics; stale reversed tooltip representations remain provenance evidence;
- Aemeath Seraphic Duet uses the current Fandom/WuWaBuilds/Wuthering.gg Overture/Encore label consensus while conflicting Wutheringlab/WWPlus labels remain provenance evidence;
- Aemeath S6 uses the current WutheringDB raw-data mirror plus WuWaBuilds/PlayAware/Wuthering.gg **in-combat** max-trail-limit consensus, while current Wutheringlab/WutheringTools **out-of-combat** wording remains explicitly recorded rather than silently erased;
- WWPlus repeated Lv2-as-Lv3 Basic-table cells and its malformed Starburst Lv6 cell remain source-display discrepancy evidence; Bellibing does not copy those cells into the canonical curve;
- the current Half Truths Basic Stage 3 Lv6 Fandom outlier remains Aalto provenance conflict evidence instead of overriding the structured current curve;
- Aalto Gate of Quandary retains the verified raw 10% parameter while the current ATK-increase versus increased-DMG wording difference remains `PENDING_INTERPRETATION` for executable stat-bucket semantics;
- resource cadence, target trails, form/state transitions, stack timing, conditional sequence branches and other event mechanics remain raw facts until a combat/rotation model supplies actual execution state.

Still required before Character mechanics can be called complete:

- populate source-audited skill/Forte/passive/resource/Outro/sequence facts for the remaining 54 released characters;
- finish Augusta's full action/multiplier-curve ingestion without contaminating the existing exact-parity Lv10 fixture;
- preserve exact Lv1-Lv10 action representations, mixed coefficient components and explicit hit-count semantics for future verified ACTIONS coverage;
- keep verified raw facts, conditional mechanics, source conflicts and genuinely pending interpretation/modeling states distinct;
- do not begin broad Character DPS adapters until this roster-wide mechanics coverage is closed.

**Important:** two `VERIFIED` raw characters do not make the roster complete. The Character mechanics layer remains an explicit Pre-DPS blocker until required released-roster coverage is actually closed.

### Weapon raw database — COMPLETE FOR CURRENT VERSION 3.6 RELEASED ROSTER

PR #42 (`bde6851`) adds the executable Version 3.6 Weapon Core roster audit.

Current audited lifecycle on 2026-08-25:

- 122 total catalog records;
- 121 `RELEASED` weapons;
- 1 `CONFIRMED_UPCOMING` weapon: Thousandfold Deliverance, scheduled for Version 3.6 phase 2;
- 0 `UNRELEASED_WIP` weapon rows in the production catalog.

The released core gate requires every live weapon to have:

- `VERIFIED` raw status;
- positive Level-90 Base ATK;
- a valid Level-90 secondary stat/value;
- cross-check provenance;
- current lifecycle classification separate from passive/effect completeness.

Version 3.6 lifecycle anchors are regression-locked:

- Glint of Clouds is the live phase-1 Sword at 500 Base ATK / 36% CRIT Rate;
- Thousandfold Deliverance is the confirmed phase-2 Broadblade at 413 Base ATK / 72.2% HP and remains `PARTIALLY_VERIFIED`/upcoming until it actually goes live.

The frozen current-patch count is intentional: adding a 123rd row makes the audit fail until the patch snapshot is explicitly reviewed and updated. This prevents future content from inheriting a false green result merely because the raw-record helper has defaults.

Signature/BiS/recommendation relations remain outside raw Weapon data.

### Weapon Effects — RELEASED SOURCE COVERAGE COMPLETE / EXECUTABLE MODELING PARTIAL

236 source-audited effect rows across all 121 currently `RELEASED` weapons are modeled in the independent effect layer. The Version 3.6 released-roster source gate is now complete: 121/121 released weapons have audited effect coverage, `PENDING_SOURCE_AUDIT` is zero, and missing rows are still never interpreted as zero passives.

Completed source slices:

- all 22 currently released Pistol weapons have source-audited effect records;
- all 27 currently released Rectifier weapons have source-audited effect records;
- all 23 currently released Broadblade weapons have source-audited effect records;
- all 22 currently released Gauntlet weapons have source-audited effect records;
- all 27 currently released Sword weapons have source-audited effect records;
- all 16 currently released Sword characters were backward-impact screened; no production Sword Weapon Recommendation profiles currently exist;
- all 10 currently released Gauntlet characters were backward-impact screened; no production Gauntlet Weapon Recommendation profiles currently exist;
- all 9 currently released Broadblade characters were backward-impact screened, including the existing production `augusta-standard-weapons` profile; its recommendation relations/ranking remain unchanged because source-auditing raw effects does not itself recalculate recommendation data;
- all 13 currently released Rectifier characters were backward-impact screened for every Rectifier batch; no production Rectifier Weapon Recommendation profiles currently exist;
- event-triggered and stacking effects remain conditional/manual until rotation state proves activation, stack count and overlap;
- `NEXT_RESONATOR`, target-facing debuffs/amplification, flat resource gains and state-conditional effects are represented explicitly where real weapon mechanics require them;
- Blazing Justice retains source-verified ATK, DEF-ignore, Spectro Frazzle amplification and 6-second state duration while the current Basic Attack vs Resonance Liberation trigger conflict remains explicit `VERIFIED_RAW_PENDING_MODEL` rather than guessed;
- Moongazer's Sigil max-stack override, Verity's Handle duration extension and Hollow Mirage stack mutations remain explicit raw pending-model mechanics rather than fabricated executable state transitions;
- Blazing Brilliance keeps the current multi-source 12-second max-stack cleanup wording while conflicting 10-second secondary representations remain provenance evidence;
- Defier's Thorn keeps its verified HP, Tune Rupture/Frazzle amplification and 15-second state facts while exact executable timing semantics remain explicit pending-model;
- Emerald Sentence keeps the current multi-source duration/reset interpretation while conflicting secondary wording remains provenance evidence rather than a silent override;
- Everbright Polestar keeps the current multi-source 10/15/20/25/30% Fusion RES-ignore sequence while the conflicting lower rank series remains provenance evidence;
- Glint of Clouds, Lunar Cutter and Somnoire Anchor retain explicit pending-model state/timing mechanics rather than guessed executable transitions;
- Aureate Zenith uses the current multi-source Heavy Attack DMG wording while a conflicting Wutheringlab Resonance Liberation DMG label remains explicit provenance evidence;
- Broadblade of Night uses the current PlayAware/GameVika/Fandom Intro Skill trigger consensus while a lower-priority Slyraf Outro representation remains explicit provenance discrepancy evidence;
- Broadblade#41 preserves its rank-dependent R1-R5 HP thresholds for the healing branch rather than collapsing them into one threshold;
- Rectifier#25 preserves the literal source split between below-60% healing and above-60% ATK; exact 60% behavior remains unresolved source semantics rather than a guessed inequality;
- Rectifier of Night uses the current multi-source Intro Skill trigger consensus while a lower-priority Outro representation remains explicit provenance discrepancy evidence;
- Comet Flare uses the current 3/3.75/4.5/5.25/6% Healing Bonus series while the conflicting older 3/3.5/4/4.5/5% representation remains explicit provenance evidence;
- Firstlight's Herald retains verified HP, Concerto and team-ATK magnitude, while its conflicting Kingfisher vs Snow Taint/Ripples trigger-state semantics remain explicit `VERIFIED_RAW_PENDING_MODEL`;
- verified raw mechanics that still need executable modeling remain explicit pending-model rather than being dropped or guessed.

Source coverage is therefore complete, but the Weapon Effect layer is **not** being relabeled fully executable/behavior-complete merely because the source backlog reached zero. Remaining work is semantic execution work, not missing released-weapon source coverage:

- resolve `VERIFIED_RAW_PENDING_MODEL` cross-effect/state-transition mechanics only when source or combat-state evidence is sufficient;
- preserve MANUAL event/stack/resource uptime until rotation/encounter state proves activation and overlap;
- keep raw passive text as provenance/display input, not executable combat behavior;
- effect records must remain independent from character recommendations and rotation uptime.

A newly modeled effect is a changed combat fact and must trigger a backward-impact review even when the weapon itself is old. A new weapon must also be screened against every existing compatible user of its weapon type rather than being hard-wired only to its signature owner.

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
5. **IN PROGRESS — PR #38/#39/#40/#41/#54/#55/#56:** Character static/core + intrinsic gates, generic mechanics architecture and fact-backed source-completeness gates are in place. Aalto and Aemeath are fully source-verified raw mechanics profiles; Augusta remains partial and 54 released characters remain unstarted. **Roster-wide Character mechanics fact coverage remains the active Pre-DPS blocker.**
6. **SOURCE COVERAGE DONE — Weapon Core + Weapon Effects:** Version 3.6 released Weapon Core is complete and released Weapon Effect source coverage is 121/121 with zero source-audit backlog. Explicit `VERIFIED_RAW_PENDING_MODEL` mechanics remain separate semantic/execution work and are not silently promoted to modeled uptime.
7. **CURRENT RETURN CHECKPOINT:** Continue controlled roster-wide Character mechanics source batches until required released coverage closes; do not jump to Echo/Sonata or broad DPS while 54 characters remain unstarted and Augusta ACTIONS remains partial.
8. Complete current Echo/Sonata raw audit.
9. Complete Sonata Effect coverage.
10. Complete Echo skill/effect/attack fact coverage needed by supported content.
11. Complete/populate composable default profiles.
12. Freeze and regression-test all pre-DPS contracts and current-patch backward-impact state.
13. Only then expand Character combat/DPS adapters character-by-character.
14. As each character gains verified DPS, replace guide fallback stopping decisions with whole-build DPS-aware decisions for that character.
15. On every later patch, run Content Preflight + Backward Impact before declaring the patch integrated.

## Documentation rule

Current project documentation describes the Bellibing application and its present contracts. Historical spreadsheet implementation details are not a project roadmap. Old spreadsheet behavior may be cited only when it is provenance for a verified invariant or parity regression.