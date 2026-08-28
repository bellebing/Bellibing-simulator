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
- 75% effective EXP recovery, 30% Tuners, zero Shell Credit recovery.
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

PR #57 hardens that verification boundary before the remaining roster is ingested. A VERIFIED single-curve ACTION must have a positive integer action-level `hitCount`; mixed component ACTIONS must use only component hit counts; damage motion-value data cannot hide behind `damageClass: null`; duplicate fact links and non-VERIFIED linked utility facts make a VERIFIED profile structurally invalid. `RAW_FACTS` preflight now consumes the same structural audit, so malformed VERIFIED metadata cannot produce a runtime false-green even if all six coverage labels say VERIFIED.

PR #58 removes nullable-field inference for action damage intent. Every Character ACTION now declares `DAMAGE`, `NON_DAMAGE` or `UNKNOWN`; VERIFIED ACTIONS reject `UNKNOWN`, preserve the existing exact DAMAGE requirements and reject damage-representation fields on `NON_DAMAGE`, including an explicitly present empty `motionValueComponents` list. Coverage counts and Wuthering Waves game data are unchanged.

PR #60 completes Augusta's current source-facing ACTION coverage without contaminating the historical V9.15 exact-parity fixture. Augusta now has a full current source action catalog with exact Lv1-Lv10 curve/component representations and explicit hit counts where applicable; selected-level V9.15 Standard motion values live in a separate parity catalog keyed by the same canonical fact IDs. Current source-display conflicts around Everbright, Warrior's Blade and Plunge remain explicit provenance rather than guessed away.

PR #61 adds the roster-wide Character Mechanics source-import/review pipeline. It pins the normalized `DommyMM/wuwabuild` Character snapshot to an exact upstream commit, fail-closes Bellibing released-roster matching, extracts moves/descriptions/Lv1-Lv10 rows/S1-S6/skill-tree data and structures only mechanically unambiguous numeric forms. The live merge-gate run matched all 57/57 released Bellibing characters and parsed 1,132 exact ten-level coefficient rows plus 40 structured flat+percent rows with zero parser exceptions. Generated data remains explicitly `CANDIDATE_ONLY` / `NOT_VERIFIED`; the importer cannot bypass canonical source review or the existing structural audit.

PR #63 source-audits Baizhi and closes a Version 3.x completeness gap exposed by the importer. The candidate snapshot retained one current Tune Break entry for every 57/57 released Character, but the canonical Character Mechanics domain previously had no Tune Break section/action role, so a profile could pass `ACTIONS: VERIFIED` while omitting that current action. The domain now represents Tune Break as explicit `SHARED_SYSTEM_DAMAGE`: the Character fact owns source-verified access/variant semantics while the shared combat system owns its damage formula. VERIFIED ACTIONS require exactly one current Tune Break fact, and such facts may not fabricate Character motion-value fields. Aalto, Aemeath, Augusta and Baizhi carry source-verified Tune Break facts under the hardened gate.

PR #65 source-audits Brant as the fifth fully verified raw Character Mechanics profile. Brant contributes 39 Character-owned facts plus Tune Break: Sword: exact current Lv1-Lv10 Character-owned action representations, Bravo/Forte/state rules, healing and shield utility semantics, both Inherents, Outro and S1-S6. Current source conflicts — including S2 off-field wording and external Max Energy disagreement — remain explicit provenance rather than being guessed into executable behavior.

PR #66 removes the remaining bulk transcription step between the roster-wide source candidate and semantic review. The promotion-review generator now carries all current tabular source forms mechanically while remaining `NOT_VERIFIED`: 1,132 exact action candidates, 40 flat+percent formulas, 720 plain numeric curves, 4 two-term numeric curves, 342 S1-S6 candidates and 57 Tune Break candidates. The live merge-gate run matched 57/57 released Characters and left **zero unstructured tabular rows**. Action role/kind, damage class, scaling, conditions, resource/state meaning, utility scope/trigger and sequence execution semantics remain explicit review work; the generator cannot bypass canonical source review or structural verification.

PR #68 adds an explicit source-fixed Character damage representation for kit text that declares damage without an Lv1-Lv10 table, and a separate description-parameter review artifact for source numerics that must not be retyped or given semantic meaning automatically. Source-fixed coefficients cannot mix with selected-level parity scalars or ten-level curves/components. The current snapshot has zero unstructured tabular rows and zero raw description parameters; generated candidates remain `NOT_VERIFIED` until semantic/source review.

PR #69 uses the PR #66/#68 automation to source-audit and canonically promote Chixia, Mortefi and Yangyang. Their exact tabular numerics come from the pinned review artifact, Chixia's Leaping Flames Outro uses the explicit source-fixed 530% ATK representation rather than a fabricated ten-level curve, and current Tune Break access remains shared-system damage. Source discrepancies around Chixia Heroic Bullets, Mortefi's Fury Fugue label and Yangyang Melody consumption remain explicit provenance instead of guessed execution.

PR #70 source-audits and canonically promotes Changli and Jiyan after semantic review. Changli's True Sight Conquest/Charge and Flaming Sacrifice retain explicit Resonance Skill DMG classification, Fiery Feather keeps only the source-stated 10-second activation window, and Jiyan's Emerald Storm Prelude is explicit `NON_DAMAGE` while Finale/Lance use source-backed Heavy Attack DMG. Jiyan Discipline is source-fixed 313.40% ATK coordinated damage with its 8-second / once-per-1-second / max-2 trigger limits preserved. Xiangli Yao remains unpromoted because Pivot-Impale's damage bucket has not been explicitly source-verified.

PR #71 source-audits and canonically promotes Taoqi, Verina and Encore from the existing generated review artifacts after explicit semantic/source review. Taoqi preserves the source distinction between ATK-scaling ordinary attacks/Intro and DEF-scaling Strategic Parry, Fortified Defense, Unmovable and Timed Counters, with Timed Counters retaining Basic Attack DMG classification and healing/shield rows remaining utility semantics. Verina keeps Photosynthesis Mark as coordinated trigger behavior while preserving its source Liberation damage-bonus type, and Starflower Heavy/Mid-air retain their explicit Heavy/Basic buckets. Encore uses the current raw/Wuthering.gg `Mayhem` name while recording Prydwen's `Dissonance` name as nomenclature provenance; Cloudy Frenzy/Cosmos Rupture remain Resonance Liberation DMG and Thermal Field uses the explicit source-fixed 176.76% ATK Outro representation. Danjin was reviewed but not promoted because current-source Ruby Blossom full-power wording is internally inconsistent with the stated 120 cap; no threshold interpretation is guessed.

PR #72 source-audits and canonically promotes Yinlin, Lingyang and Calcharo from the PR #66/#68 review artifacts after explicit semantic/source review. Yinlin keeps Punishment Mark coordinated triggering separate from Judgment Strike's explicit Resonance Skill DMG classification and leaves Judgment Points/mark execution as raw state semantics. Lingyang preserves the source-stated 5-second Striding Lion consumption and up-to-10-second Lion's Vigor extension without inventing uptime, while Frosty Marks uses the explicit source-fixed 587.94% ATK Outro representation. Calcharo preserves Hounds Roar as Basic Attack DMG, Deathblade Heavy/Dodge Counter and Death Messenger as Resonance Liberation DMG, Mercy as Heavy Attack DMG and Shadowy Raid as separate source-fixed 195.98% + 391.96% ATK components. Current `Wanted Outlaw` / `Wanted Criminal` wording is retained as nomenclature provenance, and the external Calcharo Max Energy disagreement remains outside this Character Mechanics slice rather than being guessed.

PR #73 source-audits and canonically promotes Youhu and Yuanwu from the same PR #66/#68 review pipeline after explicit semantic/source review. Youhu keeps Poetic Essence as Resonance Skill DMG despite Forte ownership, leaves Frost's full-state threshold without a fabricated numeric maximum, and keeps Antique/Auspice, healing and Lucky Draw semantics as raw resource/utility/state facts without assumed random uptime. Yuanwu preserves ATK scaling on ordinary Leihuangquan while Thunder Wedge, Blazing Might, Thunder Bombardment and Lightning Infused/Forte damage remain DEF-scaling; Thunder Wedge coordinated triggering stays distinct from its Resonance Skill DMG classification, and Lightning Manipulation remains non-damage Vibration Strength utility. Both retain current Tune Break access at the shared-system boundary.

PR #74 source-audits and canonically promotes Roccia and Zhezhi from the PR #66/#68 review pipeline after explicit semantic/source review. Roccia keeps Commedia Improvviso! and all three Real Fantasy stages in the Heavy Attack DMG bucket, preserves the 300-Imagination / 100-consumption state rules, and keeps Super Attractive Magic Box outside Character motion-value data because the source defines it as external Echo Skill Utility DMG. Zhezhi keeps Inklit Spirit's coordinated trigger semantics separate from its Basic Attack DMG classification, preserves Conjuration as Heavy Attack DMG and Stroke of Genius/Creation's Zenith as Basic Attack DMG, and keeps Afflatus/Painter's Delight plus the 30-second / max-21 / once-per-second Inklit trigger rules as raw state semantics. Both retain current Tune Break access at the shared-system boundary; source-fixed/proportional sequence wording remains raw semantics rather than fabricated skill-level damage curves.

PR #75 source-audits and canonically promotes Camellya and Carlotta from the PR #66/#68 review pipeline after explicit semantic/source review. Camellya keeps Seedbed's Pruning conversion plus Blossom-mode replacements and Ephemeral in the Basic Attack DMG bucket, preserves Crimson Pistils/Crimson Buds/Budding Mode as raw resource/state semantics, and represents Twining as separate source-fixed 329.24% ATK base plus conditional 459.02% ATK post-Ephemeral damage instead of inventing a skill-level curve. Carlotta keeps Silent Execution/Necessary Measures in Basic Attack DMG, ordinary Heavy/Containment Tactics in Heavy Attack DMG and Era of New Wave/Death Knell/Fatal Finale/Imminent Oblivion in the explicit Resonance Skill DMG bucket; Closing Remark is source-fixed 794.2% ATK while Substance/Moldable Crystal/Meta Vector/Twilight Tango/Deconstruction remain raw state semantics. Both retain current Tune Break access at the shared-system boundary.

PR #76 source-audits and canonically promotes Ciaccona, Phoebe, The Shorekeeper, Jianxin, Lumi and Jinhsi as one six-character Character Mechanics batch. Exact PR #66/#68-generated numeric structures remain the transcription base while action role/kind, damage bucket, scaling, resources/states, passives, Outro, S1-S6 and Tune Break semantics were reviewed explicitly. Jinhsi keeps Incarnation Basic stages in Resonance Skill DMG while Incarnation Heavy Attack and Dodge Counter remain Basic Attack DMG; Incandescence's Stella Glamor multiplier stays a separate `PENDING_INTERPRETATION` modifier rather than fabricated standalone damage. Jianxin's Pushing Punch/Zhoutian/Shock/Yielding Pull Forte damage stays in the Heavy Attack DMG bucket. Phoebe keeps fixed Outro damage separate from state modifiers, The Shorekeeper preserves HP-scaling Discernment, Lumi preserves Basic Attack conversions, and Ciaccona preserves Heavy Downbeat/resource/target-facing Outro semantics. All six retain Tune Break at the shared-system boundary.

Current Character mechanics coverage:

- 57 currently `RELEASED` characters are in the gate;
- 28 characters have fully `VERIFIED` mechanics profiles;
- **Aalto: `VERIFIED` raw mechanics coverage** across ACTIONS, FORTE_RULES, INHERENT_PASSIVES, OUTRO_EFFECT, RESOURCE_RULES and SEQUENCES, including current Tune Break: Pistols access as shared-system damage;
- **Aemeath: `VERIFIED` raw mechanics coverage** across all six required areas, including 26 Character-owned source-audited ACTION facts, three resource systems, raw Forte/state rules, both Inherent skills, Outro, S1-S6 and current Unlanded Melody Tune Break semantics;
- **Augusta: `VERIFIED` raw mechanics coverage** across all six required areas, with full current source-facing Character-owned ACTION coverage kept separate from the selected-level V9.15 Standard parity fixture and current Tune Break: Broadblade represented at the shared-system boundary;
- **Baizhi: `VERIFIED` raw mechanics coverage** across all six required areas, with exact current Character-owned damage curves/scaling, Concentration/Forte rules, healing utility semantics, Inherents, Outro, S1-S6 and Tune Break: Rectifier;
- **Brant: `VERIFIED` raw mechanics coverage** across all six required areas, with 22 exact Character-owned ACTION facts, Bravo/resource and Forte/state rules, source-preserved healing/shield semantics, both Inherents, Outro, S1-S6 and Tune Break: Sword at the shared-system boundary;
- **Calcharo: `VERIFIED` raw mechanics coverage** across all six required areas, with Cruelty/Killing Intent and Deathblade Gear semantics, source-preserved damage buckets, Inherents, source-fixed mixed Shadowy Raid Outro, S1-S6 and Tune Break: Broadblade;
- **Camellya: `VERIFIED` raw mechanics coverage** across all six required areas, with Seedbed/Blossom/Ephemeral Basic Attack DMG overrides, Crimson Pistils/Crimson Buds/Budding state rules, source-fixed split Twining Outro, Inherents, S1-S6 and Tune Break: Sword;
- **Carlotta: `VERIFIED` raw mechanics coverage** across all six required areas, with explicit Basic/Heavy versus Skill damage-bucket boundaries, Substance/Moldable Crystal/Meta Vector and Twilight Tango/Deconstruction state rules, source-fixed Closing Remark Outro, Inherents, S1-S6 and Tune Break: Pistols;
- **Changli: `VERIFIED` raw mechanics coverage** across all six required areas, with True Sight/Enflamement semantics, source-backed Resonance Skill damage buckets, Inherents, Strategy of Duality Outro, S1-S6 and Tune Break: Sword;
- **Chixia: `VERIFIED` raw mechanics coverage** across all six required areas, including source-fixed Leaping Flames Outro damage and current Tune Break: Pistols access;
- **Ciaccona: `VERIFIED` raw mechanics coverage** across all six required areas, with Heavy Attack classification on Quadruple Downbeat, explicit Musical Essence/Ensemble Sylph resource caps, target-facing Windcalling Tune Outro semantics, S1-S6 and Tune Break: Pistols;
- **Jianxin: `VERIFIED` raw mechanics coverage** across all six required areas, with Chi/Forte state semantics and Pushing Punch/Zhoutian/Shock/Yielding Pull preserved in the Heavy Attack DMG bucket, plus Inherents, Outro, S1-S6 and Tune Break: Gauntlets;
- **Jinhsi: `VERIFIED` raw mechanics coverage** across all six required areas, with Incarnation Basic stages kept as Resonance Skill DMG, Incarnation Heavy Attack/Dodge Counter kept as Basic Attack DMG, Incandescence's Stella Glamor multiplier retained separately as `PENDING_INTERPRETATION`, plus S1-S6 and Tune Break: Broadblade;
- **Lumi: `VERIFIED` raw mechanics coverage** across all six required areas, with Red/Yellow Light Spark resource caps, source-preserved Basic Attack damage conversions, Inherents, Outro, S1-S6 and Tune Break: Broadblade;
- **Phoebe: `VERIFIED` raw mechanics coverage** across all six required areas, with Prayer/Divine Voice state semantics, source-preserved damage buckets, source-fixed Attentive Heart Outro damage kept separate from conditional state modifiers, S1-S6 and Tune Break: Rectifier;
- **The Shorekeeper: `VERIFIED` raw mechanics coverage** across all six required areas, with Collapsed Core/Empirical Data/Deductive Data state semantics, HP-scaling Discernment and its explicit Resonance Liberation DMG classification, Inherents, Outro, S1-S6 and Tune Break: Rectifier;
- **Encore: `VERIFIED` raw mechanics coverage** across all six required areas, with Mayhem/Cosmos Rave semantics, source-preserved replacement damage buckets, source-fixed Thermal Field Outro, Inherents, S1-S6 and Tune Break: Rectifier;
- **Jiyan: `VERIFIED` raw mechanics coverage** across all six required areas, with Resolve/Qingloong Mode semantics, explicit non-damaging Prelude, Heavy Attack Finale/Lance classification, source-fixed coordinated Outro and Tune Break: Broadblade;
- **Lingyang: `VERIFIED` raw mechanics coverage** across all six required areas, with Lion's Spirit/Striding Lion semantics, source-preserved Forte damage buckets, Inherents, source-fixed Frosty Marks Outro, S1-S6 and Tune Break: Gauntlets;
- **Mortefi: `VERIFIED` raw mechanics coverage** across all six required areas, with Annoyance/Burning Rhapsody mechanics, source-preserved Fury Fugue semantics and current Tune Break: Pistols access;
- **Roccia: `VERIFIED` raw mechanics coverage** across all six required areas, with Heavy Attack classification for Liberation/Real Fantasy, Imagination/Beyond Imagination rules, external Magic Box Utility DMG boundary, Inherents, Outro, S1-S6 and Tune Break: Gauntlets;
- **Taoqi: `VERIFIED` raw mechanics coverage** across all six required areas, with DEF-scaling counter/Skill/Liberation semantics, Rocksteady/Resolving Caliber rules, healing/shields, Inherents, Outro, S1-S6 and Tune Break: Broadblade;
- **Verina: `VERIFIED` raw mechanics coverage** across all six required areas, with Photosynthesis Energy/Mark/Starflower semantics, source-preserved healing/utility rules, Inherents, Outro, S1-S6 and Tune Break: Rectifier;
- **Yangyang: `VERIFIED` raw mechanics coverage** across all six required areas, with Melody/Forte semantics, source-preserved consumption boundaries and current Tune Break: Sword access;
- **Yinlin: `VERIFIED` raw mechanics coverage** across all six required areas, with Judgment Points/Sinner's Mark/Punishment Mark semantics, source-preserved coordinated-trigger versus Skill-damage classification, Inherents, Outro, S1-S6 and Tune Break: Rectifier;
- **Youhu: `VERIFIED` raw mechanics coverage** across all six required areas, with ATK-scaling action facts, Antique/Auspice/Frost state semantics, source-preserved Poetic Essence Skill classification, healing/utility facts, Outro, S1-S6 and Tune Break: Gauntlets;
- **Yuanwu: `VERIFIED` raw mechanics coverage** across all six required areas, with explicit ATK/DEF scaling boundaries, Thunder Wedge coordinated-trigger versus Skill-damage separation, Readiness/Lightning Infused/Forte state semantics, utility facts, Outro, S1-S6 and Tune Break: Gauntlets;
- **Zhezhi: `VERIFIED` raw mechanics coverage** across all six required areas, with Inklit coordinated-trigger versus Basic-damage separation, Afflatus/Painter's Delight/imprint state rules, Inherents, Carve and Draw Outro, S1-S6 and Tune Break: Rectifier;
- 29 released characters remain `UNSTARTED` for canonical Character mechanics promotion/source verification;
- 889 canonical Character mechanic facts now exist across the 28 verified profiles, including exactly one current Tune Break fact per verified profile;
- all 28 verified profiles' `RAW_FACTS` preflight passes only when their canonical structural audit is clean, while independent build/team/rotation/combat-profile requirements continue to gate later stages.

The verified Character source slices and roster-wide import/promotion-review pipeline lock the raw/executable boundary instead of converting source text into implicit combat assumptions:

- source coefficients are stored as exact Lv1-Lv10 representations without silently choosing a talent level;
- explicit source hit multipliers remain separate from coefficient curves, mixed-hit expressions keep each source coefficient as an independent component rather than being pre-summed, and the audit rejects missing or ambiguous hit multiplicity before VERIFIED status can pass;
- source-fixed damage is represented separately when the source declares one fixed coefficient instead of a ten-level table; it cannot be faked as a repeated curve or mixed with selected-level parity data;
- current Tune Break coverage is explicit for VERIFIED profiles: exactly one source-backed Tune Break fact is required, `SHARED_SYSTEM_DAMAGE` cannot carry a fabricated Character coefficient/curve/hit count, and the shared Tune Break damage formula remains a separate combat-system modeling concern;
- Augusta's selected-level/executable V9.15 Standard aggregate motion values are isolated in `augustaStandardMotionValues.ts`; the canonical Augusta facts retain current source-level curves/components instead;
- Augusta Everbright keeps the current 120% Lv1 component consensus while the conflicting current Fandom display remains provenance evidence; Warrior's Blade and Plunge likewise retain current source consensus while stale/conflicting representations remain recorded rather than silently copied;
- the source importer treats Wuthering/Encore-normalized rows as review candidates, records the exact upstream commit and supports source-display/name variants without promoting any candidate to canonical `VERIFIED`;
- the promotion-review generator carries exact action curves/components, flat+percent formulas, plain numeric curves, two-term numeric curves, S1-S6, Tune Break and description numerics without retyping or assigning unresolved semantics; the current live snapshot has zero unstructured tabular rows and zero raw description parameters;
- new upstream table or description-parameter shapes fail the import workflow if they cannot be structurally represented, so parser drift becomes an immediate review blocker instead of silently creating manual transcription debt;
- Rover's duplicate gender/source records are collapsed only at the review-candidate matching layer, with all candidate source IDs and the deterministic selected source ID retained for audit;
- structurally obvious flat+percent rows are separated into flat/coefficient curves without guessing whether the mechanic is damage, healing, resource gain or another effect;
- Brant's S2 off-field wording conflict and external Max Energy disagreement remain provenance evidence; the Character Mechanics promotion does not silently choose unrelated static Character-core semantics;
- Baizhi's current damage scaling remains source-explicit: Destined Promise/Overflowing Frost damage is ATK-scaling while Emergency Plan and Remnant Entities damage is HP-scaling; healing tables remain raw utility semantics instead of being forced into Character damage motion-value fields;
- Baizhi's current display/backend 0.01-point healing-coefficient discrepancies remain provenance evidence rather than being silently reconciled, and unresolved Concentration recovery multiplication remains `PENDING_INTERPRETATION`;
- Aemeath Tune Rupture Response — Starburst and the separate Seraphic Duet bonus coefficient are represented as `TUNE_AMP` scaling and remain `PENDING_INTERPRETATION` for executable encounter/status semantics;
- Aemeath Synchronization Rate is source-audited at cap 200 with current multi-source Intro +40 / Heavenfall Edict: Overdrive +30 semantics; stale reversed tooltip representations remain provenance evidence;
- Aemeath Seraphic Duet uses the current Fandom/WuWaBuilds/Wuthering.gg Overture/Encore label consensus while conflicting Wutheringlab/WWPlus labels remain provenance evidence;
- Aemeath S6 uses the current WutheringDB raw-data mirror plus WuWaBuilds/PlayAware/Wuthering.gg **in-combat** max-trail-limit consensus, while current Wutheringlab/WutheringTools **out-of-combat** wording remains explicitly recorded rather than silently erased;
- WWPlus repeated Lv2-as-Lv3 Basic-table cells and its malformed Starburst Lv6 cell remain source-display discrepancy evidence; Bellibing does not copy those cells into the canonical curve;
- the current Half Truths Basic Stage 3 Lv6 Fandom outlier remains Aalto provenance conflict evidence instead of overriding the structured current curve;
- Aalto Gate of Quandary retains the verified raw 10% parameter while the current ATK-increase versus increased-DMG wording difference remains `PENDING_INTERPRETATION` for executable stat-bucket semantics;
- Chixia Leaping Flames keeps its source-fixed Outro coefficient instead of inventing talent-level progression; current stale Heroic Bullets secondary values remain provenance evidence;
- Mortefi's current `Fury Fugue` identity remains canonical while conflicting `Fury Fudge` wording is retained only as provenance discrepancy;
- Yangyang only consumes all three Melodies where the source states Feather Release does so; no Stormy Strike consumption is invented;
- Changli's Fiery Feather keeps its source-stated trigger window without fabricating a post-trigger ATK-buff duration, and True Sight/Flaming Sacrifice damage buckets remain source-explicit;
- Jiyan Emerald Storm Prelude stays `NON_DAMAGE`; Finale/Lance and Discipline keep their distinct Heavy/coordinated damage semantics instead of inheriting classification from surrounding sections;
- Taoqi's Strategic Parry/Timed Counters keep source-backed DEF scaling plus Basic Attack DMG classification; Rocksteady healing/shield/damage-reduction numerics remain utility semantics rather than false damage actions;
- Verina's Photosynthesis Mark keeps coordinated triggering separate from its source Liberation damage type, and Starflower Heavy/Mid-air keep their Heavy/Basic classifications instead of inheriting the Forte section label;
- Encore's current raw/Wuthering.gg `Mayhem` name is canonical while Prydwen's `Dissonance` name remains explicit nomenclature provenance; no state duration or timed Outro hit count is guessed;
- Yinlin Judgment Strike keeps coordinated Punishment Mark triggering separate from its explicit Resonance Skill DMG classification; Judgment Points and mark conversion/trigger cadence remain raw state semantics until executable combat state exists;
- Lingyang preserves the source-stated 5-second Striding Lion consumption and up-to-10-second Lion's Vigor extension without inventing uptime, and Frosty Marks remains source-fixed rather than receiving a fabricated talent curve;
- Calcharo's Deathblade replacements, Mercy and Death Messenger keep their explicit source damage buckets; `Wanted Outlaw` / `Wanted Criminal` remains provenance discrepancy, and the unrelated Max Energy conflict is not resolved inside mechanics data;
- Camellya keeps Seedbed's Pruning conversion and Blossom/Ephemeral replacements in the Basic Attack DMG bucket, preserves Pistil/Bud/Budding state and consumption semantics as raw facts, and keeps the two source-fixed Twining damage instances separate instead of inventing talent scaling or guaranteed trigger cadence;
- Carlotta keeps Silent Execution/Necessary Measures Basic, ordinary Heavy/Containment Tactics Heavy and Liberation/Forte-special Resonance Skill damage buckets explicit; Substance/Moldable Crystal/Meta Vector, Deconstruction, Twilight Tango and Final Bow remain raw state semantics without assumed uptime or stack generation;
- Youhu keeps Poetic Essence's Skill damage bucket separate from Forte ownership, preserves Frost/Antique/Auspice as raw state/resource semantics and does not assume Lucky Draw probability or uptime;
- Yuanwu keeps ordinary Leihuangquan ATK scaling separate from DEF-scaling Skill/Forte/Liberation damage, and Thunder Wedge coordinated triggering does not overwrite the explicit Skill damage bucket;
- Roccia keeps the source-stated Heavy Attack DMG bucket on Commedia Improvviso! and Real Fantasy while preserving Imagination consumption/state timing as raw semantics; Super Attractive Magic Box remains an external Echo Skill/Utility DMG effect rather than a fabricated Character action coefficient;
- Zhezhi keeps coordinated Inklit Spirit triggering separate from Basic Attack DMG classification, preserves Conjuration's Heavy bucket and Stroke/Creation Basic buckets, and does not convert source-proportional S5/S6 wording into invented Lv1-Lv10 action tables;
- Ciaccona, Phoebe, The Shorekeeper, Jianxin, Lumi and Jinhsi are source-verified as the eighth promotion batch; Jinhsi Incarnation ownership stays separate from Basic-vs-Skill damage classification and Incandescence multiplier interpretation, while Jianxin Forte damage remains explicitly Heavy Attack DMG;
- Danjin remains unpromoted because current-source Ruby Blossom full-power wording is internally inconsistent with the stated 120 maximum; no impossible threshold is normalized into canonical truth;
- Xiangli Yao's Pivot-Impale classification remains explicitly pending and blocks canonical promotion until a current source states the damage bucket;
- Sanhua S2 remains explicitly pending where current sources conflict between 5s and 10s duration;
- Qiuyuan remains unpromoted because current sources explicitly classify part of his kit as Echo Skill DMG while the current Character Mechanics damage-class schema has no truthful `ECHO` bucket; Bellibing will not coerce that source fact into `OTHER` merely to advance coverage;
- resource cadence, target trails, form/state transitions, stack timing, conditional sequence branches and other event mechanics remain raw facts until a combat/rotation model supplies actual execution state.

Still required before Character mechanics can be called complete:

- audit and promote source-backed skill/Forte/passive/resource/Outro/sequence semantics for the remaining 29 released characters using the promotion-review artifacts rather than hand-entering source tables or description numerics;
- source-check semantic classifications, conditional rules, current Tune Break variants and any cross-source conflicts before generated candidates become canonical facts;
- preserve exact Lv1-Lv10 Character-owned action representations, source-fixed damage, mixed coefficient components, explicit hit-count semantics and the separate shared-system Tune Break boundary for future verified ACTIONS coverage;
- keep verified raw facts, conditional mechanics, source conflicts and genuinely pending interpretation/modeling states distinct;
- do not begin broad Character DPS adapters until this roster-wide mechanics coverage is closed.

**Important:** twenty-eight `VERIFIED` raw characters do not make the roster complete. The Character mechanics layer remains an explicit Pre-DPS blocker until required released-roster coverage is actually closed. PR #66/#68 remove current tabular and description-numeric transcription debt; the remaining work is semantic/source review and canonical promotion, not copying source numerics by hand.

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
5. **IN PROGRESS — PR #38/#39/#40/#41/#54/#55/#56/#57/#58/#60/#61/#63/#65/#66/#68/#69/#70/#71/#72/#73/#74/#75:** Character static/core + intrinsic gates, generic mechanics architecture, fact-backed source-completeness gates, structural/action-role hardening, source-fixed damage support, roster-wide candidate/description automation and controlled semantic promotions are in place. Aalto, Aemeath, Augusta, Baizhi, Brant, Calcharo, Camellya, Carlotta, Changli, Chixia, Encore, Jiyan, Lingyang, Mortefi, Roccia, Taoqi, Verina, Yangyang, Yinlin, Youhu, Yuanwu and Zhezhi are fully source-verified raw mechanics profiles; 35 released characters remain unstarted and 698 canonical Character mechanic facts exist. The current 57-character source snapshot has zero unstructured tabular rows and zero raw description parameters; remaining work is semantic/source review. **Roster-wide Character mechanics fact coverage remains the active Pre-DPS blocker.**
6. **SOURCE COVERAGE DONE — Weapon Core + Weapon Effects:** Version 3.6 released Weapon Core is complete and released Weapon Effect source coverage is 121/121 with zero source-audit backlog. Explicit `VERIFIED_RAW_PENDING_MODEL` mechanics remain separate semantic/execution work and are not silently promoted to modeled uptime.
7. **CURRENT RETURN CHECKPOINT:** Use the PR #66/#68 promotion-review artifacts to audit/promote the remaining 35 Character mechanics profiles in controlled source-reviewed batches. Do not manually retype source tables or description numerics already represented by the pipeline. Review semantic classifications, conditional/resource/state/utility/sequence rules, current Tune Break variants and source conflicts; canonical verification still requires the existing structural/source gate. Danjin remains pending because the current Ruby Blossom full-power wording conflicts with the stated 120 maximum; Xiangli Yao remains pending until Pivot-Impale's damage classification is explicitly source-verified; Sanhua S2 remains pending on the 5s/10s current-source conflict. Prefer other clean source-verifiable candidates rather than guessing these blockers. Do not jump to Echo/Sonata or broad DPS while released-roster Character Mechanics coverage remains open.
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