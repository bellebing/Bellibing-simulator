# Alternative team contexts

This catalog records **team options only**. It adds 390 reviewed guide composition contexts covering **380 unique unordered trios and 59 released Character identities**, including 267 alternatives, 122 recommended-core variants and one explicitly named source BiS reference. A separate pool contains 543 published model composition contexts for discovery. No alternative rotation timing, DPS, buff uptime or power score is imported or calculated in this step.

## Separate the recommendation classes

| Class | Meaning |
| --- | --- |
| `SOURCE_BIS_REFERENCE` | A guide identifies the complete trio and its context as best. Currently Qingxiao/Denia/Mornye in Tune Strain. This is the source's recommendation, not a universal gameplay fact. |
| `SOURCE_RECOMMENDED_CORE_VARIANT` | A manually reviewed guide-preferred partner core with an allowed support/third member. It does not establish that the full trio is BiS; a budget healer can appear here. |
| `ALTERNATIVE` | A reviewed replacement/core variant or scoped healer fallback supported by guide roles. Includes budget and all-premium alternatives. |
| `UNRANKED_MODEL_CANDIDATE` | An exact composition listed by a published calculator. Presence is discovery evidence, not independent proof that the trio is a good casual standard team. Excluded by default. |

Core designations are manually reviewed recommendation families, not an inferred DPS order from the guide's display order. Source-supported composition means the guide supports the chosen member roles; most entries are **Bellibing synthesis of slot guidance**, not a claim that the source published that exact trio or measured it in combat. No image-only example-team roster is guessed. Multiple anchor/role/mode contexts can share one trio, explaining the 390/380 difference.

Accessibility is independent from recommendation strength. `NON_LIMITED_PARTNERS` means both teammates beside the chosen anchor are four-stars, standard five-stars or protagonist forms. `MIXED_PARTNERS` and `ALL_LIMITED_PARTNERS` describe the other patterns. None guarantees the player owns those Characters, acquires them without spending, has S6 four-stars or can omit a particular weapon. We deliberately avoid a universal “F2P team” Boolean that conflates these questions.

## Examples and preserved constraints

| Anchor | Alternative contexts | Why / boundary |
| --- | --- | --- |
| [Galbrena](https://www.prydwen.gg/wuthering-waves/characters/galbrena) | Mortefi + Verina/Shorekeeper/Mornye; Phrolova/Iuno/Rebecca + generalist support; Lupa + Mortefi/Brant | Mortefi covers Heavy damage; he does not replace all Echo/Afterflame support. Lupa has Mono Fusion conditions, and Brant/Mortefi comparisons depend on investment. Qiuyuan/Lucilla remain preferred Echo cores. |
| [Qingxiao](https://www.prydwen.gg/wuthering-waves/characters/qingxiao) | Lynae + Mornye/Ciaccona/Shorekeeper | Lynae must use Tune Strain. This is the verified recommendation alternative to Denia. Denia + random healer is not promoted: that source requires Mornye for the intended core. Ciaccona is not a healer. |
| Carlotta | Yangyang/Taoqi/Lumi + Verina/Shorekeeper; Brant/Cantarella/Lynae variants | Skill-buffing, energy or alternate partner damage; different field demand and buff coverage are retained as conditions. |
| Camellya / Encore / Havoc Rover | Sanhua or other guide-supported partners + Verina/Shorekeeper; selected Baizhi fallbacks | Accessible Basic/Havoc support paths. Baizhi's one-target buffs and pickup requirements are not treated as identical to Verina/Shorekeeper. |
| Jinhsi | Yuanwu/Mortefi/Lumi/Taoqi or premium coordinated attackers + guide support | Coordinated attacks and Intro structure matter. These are alternatives, not a guarantee that every partner fills her Forte equally well. |
| Zani | Spectro Rover/Ciaccona + generalist support; Mortefi/Iuno/Phrolova + a separate Frazzle applier | A Heavy amplifier cannot replace the missing Frazzle application. Phoebe Confession remains the preferred core. |
| Hsin | Electro Rover + Buling/Chisa/Suisui; Jinhsi + Shorekeeper in Unison | Modes are distinct. Buling is the guide's accessible Flare fallback; Unison is a preference context, not automatically stronger than Flare. |
| [Youhu niche](https://www.prydwen.gg/wuthering-waves/characters/youhu) | Calcharo/Yinlin/Youhu; Lingyang/Zhezhi/Youhu | Her Outro targets the coordinated attacker, not automatically the main carry. The guide's simple recipe assumes Marcato; no time is copied. |

The catalog also covers Aalto, Chixia, Danjin, Lingyang, Jianxin, Ciaccona carry, Iuno carry, Jingran, Lucy, Luuk Herssen, Sigrika, Xiangli Yao, Xuanling and others. Primary anchors have reviewed role-specific slot rules; support-focused Characters occur as members rather than being assigned invented carry teams.

## Healer and support substitutions

`findTeamSupportAlternatives(anchor, partner, owned?)` returns only reviewed support slots for that same core. For Galbrena/Mortefi it yields Mornye, Shorekeeper and Verina. For Qingxiao/Denia it yields Mornye alone; use the separate Lynae core when changing that dependency. This is intentionally not a Cartesian product of every healer in the game.

Sustain labels describe composition, not a survival guarantee: `HEALING_MEMBER_PRESENT`, `CONDITIONAL_SUSTAIN`, `HEALING_SETUP_REQUIRED` or `NO_LISTED_HEALER`. Some Phrolova/Echo or status teams are valid offensive contexts without a conventional healer. Chisa's damage setup is not silently called a healing setup.

Baizhi fallbacks are scoped to reviewed active-carry families and exclude Yinlin/Zhezhi/Mortefi partner slots because [her guide](https://www.prydwen.gg/wuthering-waves/characters/baizhi) warns that her buffs do not support coordinated attackers in the same way. Youhu does the opposite: her specialized target is a coordinated attacker. These differences remain visible when an unavailable healer is replaced.

## Evidence and consumer contract

- `data/source/alternative-team-context-review-2026-10-12.json` owns 42 manually reviewed slot rules, exceptional trios, mode requirements, fallback constraints and full-party BiS evidence. It pins the already-reviewed Prydwen recommendation artifact rather than copying canonical game effects.
- `data/source/alternative-team-model-roster-2026-10-12.json` captures 558 publisher composition rows at an immutable Riley source revision. Upcoming identities are excluded from the projection; source loadout modes and declaration indices are retained. No rotation engine is run by this capture.
- `scripts/generate-alternative-team-contexts.mjs [--check]` validates the source hashes, guide joins, released trios, projections and coverage.
- `src/data/alternativeTeamContexts.ts` is a generated projection; one composition per line keeps the broad catalog diff bounded. It does not alter existing recommendation defaults or engine registrations.
- `findAlternativeTeamContexts({anchorCharacterId, ownedCharacterIds?, excludeCharacterIds?, includeRecommendedCore?, includeModelCandidates?})` returns alternatives in stable reference order. Core variants and model candidates are opt-in. Ownership filters require all three selected members; no automatic missing-member substitution occurs.

`modeRequirements` are human/source context conditions, not automatic player mode selection. `sourceModes` retain publisher-specific loadout labels for candidate review, without equating them to Bellibing presets. Role slots matter; synergy names are never indiscriminately cross-multiplied. Every record has an explanation, conditions, source locators, accessibility and explicit **unresearched timing for this alternative context**.

## Scope and next step

This is broad coverage of source-supported options, not an exhaustive claim about every mathematically possible three-Character party. Guide synthesis, published model candidates and exact source trios remain separate. Some candidate models are weaker or disagree with guide constraints; notably Qingxiao/Denia without Mornye remains visibly cautioned and is never admitted to the default guide-supported alternatives.

The next workstream can select these stable context IDs, establish their standard rotation recipes, then research timings. The existing 19 timing cases are not copied into these alternatives. No recommendation percentage is converted into damage, and no team DPS is inferred from composition alone.
