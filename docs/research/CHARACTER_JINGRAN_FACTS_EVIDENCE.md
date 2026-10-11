# Jingran — Character facts evidence (Worker 8)

**Review date:** 2026-10-11. **Game/release version:** Wuthering Waves **3.6**, phase II (September 2026); no claim that external pages are immutable 3.6 data dumps. **Repository baseline:** main commit 102b66edec165f3d2a313a562de4049a26424924. **Scope:** Character gameplay facts only — no BiS, equipment selection, team/profile recommendations, data promotion, DPS, simulator or UI implementation.

## Verdict and status vocabulary

- **VERIFIED — released identity only:** Jingran, 5★ Fusion / Broadblade, RELEASED. Kuro's [3.6 patch notes](https://wutheringwaves.kurogames.com/zh-tw/main/news/detail/5340) establish name/element/weapon; the [phase-II live report](https://www.theouterhaven.net/wuthering-waves-version-3-6-update-lamplight-in-mirage-swords-resolve-in-heart-part-two-is-live/) establishes availability. This identity was already reviewed in [catalog freshness](../CHARACTER_CATALOG_FRESHNESS_REVIEW.md).
- **EXTERNAL_CORROBORATED / PROMOTION PENDING:** modern, post-release public references independently contain substantial numeric kit, Lv1 and Lv10 coefficients, stat candidates, Inherent/Minor Forte and S1–S6 descriptions; that is **research evidence**, not canonical source-review completion. Source labels, character IDs, level convention, rounding, numeric precision, independent pin/hash, status classes, gameplay interpretation and complete level curves still need owning audits before promotion.
- **PENDING / CONFLICT:** exact canonical Level-90 ATK presentation/precision, **Max Energy** semantic cross-check, full Lv1–Lv10 coefficient arrays (Lv2–Lv9 unavailable from the reviewed pages), all downstream source-valid mechanics mappings and actual execution.
- **IMPLEMENTATION:** Jingran's released identity is in main. Raw stats remain null; there are **no** reviewed canonical Character mechanics/Intrinsic/pinned Skills/Sequence data for Jingran and **no** approved Jingran DPS/Character Build profile. Never interpret an external text description as an implemented mechanic.
- A numerical **0 is a supported *candidate* for DEF**, because published kit says DEF is permanently fixed to zero; it is **not permission to populate** CharacterGameData.level90.def without distinguishing base Level-90 stat from applied kit constraint.

### Source register and validity

| ID | Exact source, page/record | Scope, date/version, limitation |
| --- | --- | --- |
| O1 | [Kuro Games official Version 3.6 notes](https://wutheringwaves.kurogames.com/zh-tw/main/news/detail/5340) | Official identity, 3.6, announced 2026-08-20; **not** Lv90/kit multipliers. |
| O2 | [3.6 phase-II live report](https://www.theouterhaven.net/wuthering-waves-version-3-6-update-lamplight-in-mirage-swords-resolve-in-heart-part-two-is-live/) | Released/playable corroboration, 2026-09-11; not numeric gameplay authority. |
| G1 | [Prydwen — Jingran, Kit / Passive / Chain / Minor Fortes](https://www.prydwen.gg/wuthering-waves/characters/jingran) | Marked **Patch 3.6**, profile last updated **2026-10-05**; authoritative *secondary transcription* of descriptions, not official extract. Prydwen explicitly has **no Lv90 stats** for Jingran. Not used for build/recommendations. |
| G2 | [Wuthering.gg — Jingran, Lv90 stats and Skill Details at Level 1](https://wuthering.gg/characters/jingran) | Checked 2026-10-11, live dynamic page. Level 1 damage components, Level-90 15375 / 312 / 0, and header “Max Resonance Energy 140”. Unpinned, **provider candidate**, not automatically reviewed canon. |
| G3 | [Gacha.gg — Jingran, Stats and Skills at skill level 10](https://www.gacha.gg/wuthering-waves/characters/jingran) | Checked 2026-10-11, live page, level-10 components, HP **15,375**, ATK **312.5**, skill-derived mechanics and S1–S6. ATK numeric precision differs from displayed integer providers. |
| G4 | [Grecharge — Wuthering Waves 3.6 Jingran guide](https://grecharge.com/my/blog/wuthering-waves-3-6-jingran-build-guide) | Published 2026-09-04, Lv90 HP **15,375**, ATK **313**, DEF **0**, explicitly **Liberation Cost 125**. Only raw/cost field corroboration; guide builds ignored. |
| G5 | [Arab Wuwa — Jingran character](https://arabwuwa.com/characters/jingran/) | Checked 2026-10-11, displays HP **15,375**, ATK **313**, DEF **0** and “Max Energy” **125**. Secondary conflicting label, potentially Liberation Cost contamination; not safe to promote. |
| R1 | [Main Character catalog](../../src/data/characters.ts); [raw pending audit](../../src/data/characterRawAudit.ts) | Canonical identity only; all four Level-90 numbers null and expressly pending. |
| R2 | [Character Mechanics source blockers](../../src/data/characterMechanicsSourceReview.ts); [Mechanics facts registry](../../src/data/characterMechanics.ts) | Jingran: MISSING_REVIEWED_MECHANICS, not a full six-area source kit. |
| R3 | [Character Truth Capture](../CHARACTER_TRUTH_CAPTURE.md) | Factory/provider captures are **noncanonical**, external evidence never auto-promotes. |
| R4 | [Draft PR #257 facts coverage](https://github.com/bellebing/Bellibing-simulator/blob/research/worker-6-character-build-data-coverage-20261011/docs/research/CHARACTER_FACTS_COVERAGE.md) | Worker 6 current facts matrix: Jingran has identity only; all Character source/implementation families pending. **PR candidate**, not main. |

**Source-strength note:** G1–G5 are not five independent primary game-data dumps. G1/G2/G3 often reproduce the same localized game strings. Agreement is useful discovery/cross-check, **not** a reviewed game-version pin; these live pages can change without a commit SHA.

## Level 90 raw values — no import approved

| Canonical field | External candidate(s) | Evidence and precise disposition |
| --- | --- | --- |
| HP | **15,375** | G2, G3, G4, G5 agree. **EXTERNAL_CORROBORATED / PENDING canonical Level-90 review**; main null. |
| ATK | **312.5** decimal (G3); **312** (G2); **313** (G4/G5) | Distinguish raw decimal from source-specific truncation/rounding. Do not silently select 312 or 313 as canonical displayed integer. **PENDING convention/precision**; main null. |
| DEF | **0** displayed (G2/G4/G5) | G1/G2/G3 kit text “Nether to Light” fixes Jingran's **DEF at 0**. The *effective DEF rule* has corroborated source text, but whether CharacterGameData.level90.def should mean natural/unmodified Level-90 base or effective fixed stat requires explicit schema/source review. **PENDING semantic mapping**; main null. |
| Max Energy | **140** explicitly “Max Resonance Energy” (G2) vs **125** “Max Energy” (G5) | **CONFLICT / PENDING**. G2's 140 **was previously specifically quarantined** in catalog freshness; do not grant authority because of its label. G4 and G2/G3 report **Resonance Liberation Cost 125**; this is **not proof of maximum pool 125**. Source-bound game UI/data field or trustworthy version-pinned distinct cap/cost values required. Main null. |
| Liberation Cost **(not a Lv90 field)** | **125** | G2/G3 label “Resonance Cost 125” under Liberation, corroborated G4's “Liberation Cost 125”. **Kit source candidate**, do not copy into maxEnergy. |

**Do not modify** the null fields or the RELEASED_CHARACTER_RAW_PENDING Jingran exception until semantic validation and owning approvals. The fixed-DEF kit condition must remain separate from the raw-data question.

## Skills: independently visible endpoints, not full Lv1–Lv10 curves

**Transcription:** Each expression preserves per-hit source components. A term such as 13.75% × 4 is **four source components/hits**, not a pre-aggregated one-hit event. Fixed damage and percentage coefficients are different types. G2 exposes **skill Lv1** and G3 displays **“At skill level 10.”** Both checked 2026-10-11. These are **candidate game-text numbers**, not imported CharacterActionFacts. **Lv2 through Lv9 have no verified source row in this review — PENDING, never interpolate.**

| Skill / component | Lv1 — G2 | Lv10 — G3 | Relevant text / class |
| --- | --- | --- | --- |
| Basic, Drink Soul 1 (Yin) | 22.50% | 44.74% | Fusion; Basic Attack |
| Drink Soul 2 | 18.75% + 18.75% | 37.28% + 37.28% | Fusion; Basic Attack |
| Drink Soul 3 | 13.75% × 4 | 27.33% × 4 | Text says **Heavy Attack DMG**, gain 50 Qi |
| Drink Soul 4 | 23.11% + 23.11% + 15.41% + 15.41% | 45.95% + 45.95% + 30.63% + 30.63% | Heavy; gain 50 Qi |
| Basic, Devil's Bane 1 (Yang) | 20.03% | 39.82% | Fusion; Basic Attack |
| Devil's Bane 2 | 30.02% + 20.01% | 59.68% + 39.79% | Basic |
| Devil's Bane 3 | 24.01% + 24.01% + 32.01% | 47.73% + 47.73% + 63.64% | Heavy; gain 50 Qi |
| Devil's Bane 4 | 43.74% + 6.25% × 3 | 86.95% + 12.43% × 3 | Heavy; gain 50 Qi |
| Mid-air attack | 46.50% | 92.45% | Mid-air STA 30 |
| Dodge Counter — Nether Dive | 25.00% × 4 | 49.70% × 4 | Heavy; gain 100 Qi |
| Dodge Counter — Light Watch | 37.51% + 37.51% + 50.01% | 74.57% + 74.57% + 99.43% | Heavy; gain 100 Qi |
| Shadow Step | **30 + 25 flat** | **30 + 25 flat** | Fixed Fusion, considered Basic; **not affected by DMG Bonus**. STA 20; do not model as ATK%. |
| Resonance Skill — Encroaching Yin | 33.00% + 16.50% × 3 | 65.61% + 32.81% × 3 | Fusion, Yin; cooldown 15s |
| Skill — Netherworld Traverse | 26.00% + 13.00% × 2 + 19.50% × 4 | 51.69% + 25.85% × 2 + 38.77% × 4 | Conditional follow-up, **Heavy Attack DMG**; gain 100 Qi |
| Skill — Scorching Yang | 33.00% + 16.50% × 3 | 65.61% + 32.81% × 3 | Fusion, Yang; cooldown 15s |
| Skill — Afterlife's Guide | 33.14% + 33.14% + 66.27% | 65.87% + 65.87% + 131.74% | Conditional follow-up, Heavy; gain 100 Qi |
| Liberation — Burial of Thousand Souls | 46.86% × 8 | 93.15% × 8 | **Heavy Attack DMG** even though Liberation cast; CD 25s; **cost 125**, Concerto 20 |
| Chimei Wangliang | 42.00% | 83.51% | Summon hit, **Heavy Attack DMG**, conditional on Yinghuo + Heavy landing |
| Forte — Soul Raid | 8.25% × 2 + 10.61% × 3 + 69.53% | 16.40% × 2 + 21.09% × 3 + 138.22% | Yin/Qi 300; Fusion Heavy |
| Soul Raid, per 1,000 qualifying HP | 0.75% × 2 + 0.96% × 3 + 6.26% | 1.48% × 2 + 1.90% × 3 + 12.44% | **Additional per-HP DMG multiplier component**, not unconditional |
| Forte — Stardome Meander | 12.09% + 12.09% + 24.18% + 72.54% | 24.04% + 24.04% + 48.08% + 144.22% | Yang/Qi 300; Fusion Heavy |
| Stardome, per 1,000 qualifying HP | 1.09% + 1.09% + 2.18% + 6.53% | 2.17% + 2.17% + 4.33% + 12.98% | Additional per-HP, Yinghuo + Fire |
| Intro — Question the Tombs | 100.00% | 198.81% | Fusion, Intro; Concerto gain 10; gain 100 Qi |
| Outro — Rising Fortune and Ebbing Evil | **795% ATK** | **795% ATK** | Source text single fixed ratio; **Jingran-owned Fusion attack**, no declared incoming-recipient buff |

**Endpoint references:** [G2 basic/skill/Lib/Forte/Intro Level 1 sections](https://wuthering.gg/characters/jingran), [G3 full Level 10 “Skills” section](https://www.gacha.gg/wuthering-waves/characters/jingran). Verify raw skill IDs, exact unrounded coefficients, stat scaling, bonus classes and Lv2–Lv9 source pin before canonical action mapping.

## Forte Circuit / resources / conditions (3.6 external text, not executed)

Sources: [G1 Kit](https://www.prydwen.gg/wuthering-waves/characters/jingran), [G2 Forte](https://wuthering.gg/characters/jingran), [G3 Lv10 kit](https://www.gacha.gg/wuthering-waves/characters/jingran).

| Mechanic/state | Source-described event, magnitude and boundary | Status |
| --- | --- | --- |
| Yin Vessel / Yang Font | Starts in **Yang Font**. Soul Raid (Yin) or Stardome Meander (Yang), while **Qi = 300**, consumes 300 to change to opposite stance. Exact event ordering/cast transition not simulated. | Corroborated description; implementation PENDING |
| Qi | Cap **300**. Basic stages 3/4 +50; Dodge Counters, Netherworld Traverse, Afterlife's Guide, Intro +100; Liberation, or Forte Heavy with Wayfarer's Mark +200. | Corroborated numeric rules; resource-state engine PENDING |
| Cleanse of Impurity | Initial stance Skill gives **4s** enabling corresponding airborne follow-up. Ends on swap, stance switch, or follow-up cast. Skill cooldown **15s** per stance source labels; independent cooldown runtime not assumed. | Corroborated conditional text; runtime PENDING |
| Liberation / Yinghuo | Cost **125** (not Max Energy); cooldown **25s**. Sets current HP to 50% Max only if above; grants **100 Fire of Life, 200 Qi, 3 Wayfarer's Mark** and Yinghuo for **15s**. Liberation **Heavy-class**. | Corroborated text; HP/resource/timing execution PENDING |
| Wayfarer's Mark | Max **3**, duration **15s**; casting Forte Heavy consumes one, grants **200 Qi**. | Corroborated; stack-ordering PENDING |
| Yinghuo Chimei | An actual landed Soul Raid/Stardome triggers **one Chimei Wangliang per Heavy**, Fusion damage classified Heavy. Not a global per-hit extra attack. | Corroborated; hit/event binding PENDING |
| Fire of Life | Cap **100** (Liberation grants 100). While Yinghuo and available, Forte Heavy consumes **25**; grants additional per-1,000-Max-HP multiplier only for **HP exceeding 25,000**, max **25,000 qualifying HP**. Cleared at Yinghuo end. | Corroborated; conditions and per-hit scaling PENDING |
| Nether to Light | **DEF fixed at 0**; per 1,000 Max HP **+6.2% Incoming Healing** (cap **310%**), **+1.5% Fusion DMG** (cap **75%**). | Kit-rule supported; raw DEF mapping PENDING |
| Yang Changes, Yin Unites | Per 1,000 Max HP **+36 flat ATK**, max **+1,800**. S3 condition replaces rule temporarily, not cumulative unless shown. | Corroborated; conditional stats runtime PENDING |
| Shadow Step | Directional ground Dodge action, two **flat** damage terms, considered Basic but **not scaled by DMG Bonus**. | Corroborated; dedicated damage interpretation PENDING |

Damage-class remarks are explicit in reviewed secondary game-text; no damage-class classification is inferred just from Skill/Liberation panel ownership.

## Intro / Outro / Inherent / Minor Forte

- **Intro — Question the Tombs:** Fusion damage at Lv1 **100%**, Lv10 **198.81%**, +**100 Qi**. Consumes up to **50 Ghost Shroud** to equal **Fortune in Disguise** stacks. Fortune lasts **15s**, maximum **50 stacks**; **each** stack grants Fusion DMG Bonus per 1,000 Max HP **+0.05%**, capped at **+2.5% per stack**, and ends on switching Jingran out. Ghost Shroud gained +1 per shield gained by Jingran (once **0.5s**), max50. Conditional follow-on Basic stage2 depends on stance. Source G1/G2/G3. **Text corroborated; source profile and executable state PENDING.**
- **Outro — Rising Fortune and Ebbing Evil:** **Fusion DMG = 795% of Jingran's ATK**. No explicit recipient damage-buff/transfer in source wording. The fact describes an **outgoing Character-owned hit**, not a generic incoming buff. Also grants Fixation through Inherent. Source G1/G2/G3. **Text corroborated; canonical OUTRO_EFFECT and execution PENDING.**
- **Inherent I — Hark the Dust:** Intro or either base Skill grants **Earth Charm**. For **15s**, if active, dealing damage gains an **unstackable 1.6% Max HP + 700 shield**, lasting **5s** at most once per **0.5s**; while Yinghuo, also unstackable **0.8% Max HP + 350** shield, same **5s/0.5s**, neither carried to incoming Resonator. Source G1/G2/G3; the “also” shield's overlap/refresh ordering must not be guessed. **Conditional source text corroborated; engine PENDING.**
- **Inherent II — Trace the Vestige:** On entering combat, Ghost Shroud restored to at least **25**, once **4s**; an *other nearby teammate's* shield gives **+2 Ghost Shroud** at most once **0.5s**. **Fixation** acquired on entry (once **4s**) and Outro; when other teammate obtains shield, Fixation consumed for **+15 Ghost Shroud**. Trigger aggregation/order and simultaneous +2/+15 require event evidence. Source G1/G2/G3. **Conditional text corroborated; engine PENDING.**
- **Minor Forte permanent nodes (total): +8% CRIT Rate and +12% HP%** ([G1 Minor Fortes](https://www.prydwen.gg/wuthering-waves/characters/jingran), explicitly enumerated). **External corroborated**; original **eight node IDs/names/ranks, tree prerequisites, exact individual node values and immutable source IDs remain PENDING**. Do not insert totals into runtime as a substitute for pinned node-by-node data.
- G3 additionally lists **Skillful Cooking** as a cooking utility; it is not one of the two combat Inherent Skill tree rows. Do not treat as numeric combat skill.

## Resonance Chains S1–S6 — 3.6 source descriptions, all implementation PENDING

Source text cross-check: [G1 Resonance Chain](https://www.prydwen.gg/wuthering-waves/characters/jingran) and [G3 chain descriptions](https://www.gacha.gg/wuthering-waves/characters/jingran). This is **source-text corroboration**, **not** canonical SEQUENCES source-VERIFIED, signed-off static stat classification or combat modeling.

| Chain | Name | Text-supported conditions/effect |
| --- | --- | --- |
| **S1** | Yin and Yang in Harmony, the Ultimate Law of Being | Four Skill actions Encroaching Yin, Netherworld Traverse, Scorching Yang, Afterlife's Guide: **+80% DMG Multiplier** and **interruption immunity**; not an ATK buff. |
| **S2** | A Solitary Lantern, Across Lands Shade-Trodden | Soul Raid/Stardome **+46% multiplier** and their Yinghuo/Fire of Life HP-increase effect **+46% multiplier**. On entry, once **4s**, gain **300 Qi** and Netherworld's Boon. Boon: Heavy cast restores **25% of Max Resonance Energy** (amount cannot be evaluated with Max Energy PENDING), granting **180% DMG Amplification** to these Heavies for **4s**. |
| **S3** | World's Course Shifts, Each to Their Rightful Paths | Each Forte Heavy gives **+5 Ghost Shroud**. Liberation temporarily replaces +36/1,000 HP (cap 1800) with **+50 ATK/1,000 HP** (cap **2500**) for **15s**. |
| **S4** | Where Reality Meets Illusion, Where Living Meet Dead | **When a Resonator in the team gains a Shield**, **all team members +20% All-Attribute DMG Bonus for 30s**; trigger ownership, repeated activation/stack refresh not established by this single sentence. |
| **S5** | Ends Return to Beginnings, Truth of Life Laid Bare | Fatal-damage survival grants personal **50% Max HP shield for 15s**; cooldown **10 minutes**, shield not transferred. |
| **S6** | As Favors and Feuds Fade, New Stories Await | Targets **take +40% Heavy Attack DMG from Jingran** (incoming target-specific wording). Chimei multiplier **+80%**. Enter Yinghuo => **Parade of Thousand Souls 15s**; while Jingran active, actual damage triggers Chimei at most **once per 1s, 8 times**; resets/ends upon another Liberation or Yinghuo ending. |

**Important S2 caveat:** “25% Max Resonance Energy” is a proportional effect and **does not determine Max Energy**. Do not assume G2's unapproved “140” or G5's “125” is safe, and do not normalize +180% amplification into arbitrary damage-bonus bucket.

## Explicit verification matrix and required next sources

| Coverage family | Evidence obtained | Canonical status / remaining blocker |
| --- | --- | --- |
| Released, rarity, element, weapon | **1/1 identity set VERIFIED**, 3.6 official release source O1/O2 | Already integrated on main. |
| Lv90 HP/ATK/DEF/Max Energy | **HP 15375 corroborated; ATK raw decimal 312.5 vs displays 312/313; DEF0 displayed + fixed rule; Max Energy 125/140 label conflict** | **0/4 canonical Level90 fields reviewed/promoted; all remain null** pending Level90 convention, raw-vs-effective and energy cap review. |
| Active Skills Lv1/Lv10 | **22 distinct percentage-based numeric curve rows (including two conditional HP rows), plus flat Shadow Step and fixed Outro**, values listed above | Both endpoints externally observable; **all Lv2–Lv9 PENDING**, no immutable data pin/ID mapping; **0** Jingran canonical ACTIONS facts. |
| Forte + resource state | Two stances, Qi/Fire/Mark/Shroud, Yinghuo, HP scaling, shield/ATK effects, conditions | Narrative/source-text cross-check only; **canonical FORTE_RULES and modeled timings PENDING**. |
| Intro/Outro | Intro Lv1/Lv10 and Outro 795% with named buffs/resources | **Canonical Intro/OUTRO_EFFECT and execution PENDING**. |
| Inherent Skills | **2/2 combat Inherent Skill descriptions externally corroborated** | Source pin/tree nodes/conditions and mechanics rows PENDING. |
| Minor Fortes | **+8% CRIT Rate, +12% HP** from G1 | Eight exact stat node records, source IDs/tree projection and intrinsic source review PENDING. |
| Sequences S1–S6 | **6/6 externally cross-checked descriptions** | No Jingran canonical SEQUENCES or S1–S6 pinned presentation; no effect engine. S0 baseline. |
| Engine/Profile/DPS | No Jingran canonical profile, no fixed execution contract | **0 verified playable mechanic implementations, 0 DPS-ready profiles**. No automatic promotions. |

### Existing owners to supplement **after** separately approved source review

1. **Level90 and raw pending:** [src/data/characters.ts](../../src/data/characters.ts), [src/data/characterRawAudit.ts](../../src/data/characterRawAudit.ts), plus their raw-data audit/tests. Keep pending exception synchronized with only actually resolved fields, not provider snapshot.
2. **Character static Minor Forte:** [src/data/characterIntrinsicStats.ts](../../src/data/characterIntrinsicStats.ts), source/registry tests and reviewed per-node data; no copy of conditional passives into intrinsic totals.
3. **Actions / Forte / Inherent / Outro / S1–S6:** [src/data/characterMechanics.ts](../../src/data/characterMechanics.ts), existing Character mechanics owned raw-fact source modules and [src/data/characterMechanicsSourceReview.ts](../../src/data/characterMechanicsSourceReview.ts), [source audit](../../src/data/characterMechanicsAudit.ts), domain schemas and source provenance audits. Preserve source-vs-modeling statuses for every fact; don't set MODEL_READY because a description exists.
4. **Pinned Skills, Inherent/minor tree and Sequence presentation:** [data/source/character-forte-ui.json](../../data/source/character-forte-ui.json), [data/source/character-sequence-ui.json](../../data/source/character-sequence-ui.json) and [data/source/character-sequence-build-stat-review.json](../../data/source/character-sequence-build-stat-review.json), through the existing pinned ingest and asset mapping workflow. Review source version, IDs and hashes; do not manually invent UI tree node mappings.
5. Existing [Character Database](../CHARACTER_DATABASE.md) generated export and UI/project consumers pick up reviewed canonical owners; **do not create a parallel Character database**. Hero Art and Build/Skills/Sequence presentation remain independently pending.

### Blocking evidence before promotion

1. A **version-pinned (3.6 released) game-resident or independently auditable immutable data dump** with Jingran's correct source ID, named stat semantics and official rounding/display convention. Resolve whether Level90 DEF=0 is raw vs fixed-effective and ATK=312.5 vs 312/313 display.
2. A **separate cap-versus-cost record** explicitly showing **Max Resonance Energy** (not Liberation **Resonance Cost 125**); reconcile the 140/125 conflict with a valid source. No admission by provider consensus alone.
3. Exact skill IDs, original **Lv1–Lv10** coefficients including missing **Lv2–Lv9**, hit counts, HP-scaling type, source damage class and a pinned/hash-verified localized 3.6 game text. Do not interpolate.
4. Full minor-node IDs/values, two Inherent IDs, state/trigger semantics, Intro/Outro, S1–S6 original chain IDs/text/source pin. Conditional effects (especially stacked shields, timed windows, S4 reactivation, S2 energy cap) remain interpretation pending until gameplay contracts can support them.
5. Source audit/parity and affected-data tests before any separate promotion PR. This **docs-only Draft PR** is external evidence inventory, not that promotion.

**STOP / PENDING:** The available evidence is useful for manual source review but **insufficient for complete canonical Jingran facts coverage**. Raw fields and mechanics remain in existing PENDING/UNKNOWN states; do not merge this as gameplay completion or infer BiS/DPS readiness.
