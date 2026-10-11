# Released Character signatures and Prydwen recommendations

## Draft publication scope

This candidate extends draft [PR #277](https://github.com/bellebing/Bellibing-simulator/pull/277) and roadmap [#272](https://github.com/bellebing/Bellibing-simulator/issues/272). The user authorized publication of signature identities and the current Prydwen recommendation order, with independent comparisons and final FULL verification deferred. Capture/review date: **2026-10-11**. This is candidate data, not a merged/deployed product claim.

**59/59 released identities** have a reviewed relationship: **39 signatures / 20 NO_SIGNATURE**. Standard five-stars and four-stars have NO_SIGNATURE; the three non-Aero Rover variants also have NO_SIGNATURE. Aero Rover is a documented free-signature exception (Bloodpact’s Pledge). Upcoming Suoming is excluded.

A signature is the dedicated weapon identified as such by the cited guide. This does not assert that the publisher literally used the English word “signature,” that the weapon is exclusive to its Character, or that it must rank first. Xiangli Yao retains Verity’s Handle despite Prydwen currently placing Moongazer’s Sigil first; Encore has NO_SIGNATURE despite recommending Stringmaster.

## Source ownership and consumer contract

- `data/source/character-equipment-source-review.json` owns the explicit signature decisions and approved guide capture hash. Four association claims (Augusta, Carlotta, Chisa and Ciaccona) use explicit Game8 search-result signature statements; their evidence kind records that the article itself was inaccessible. Other signatures use explicit Prydwen signature statements. NO_SIGNATURE follows the reviewed release-family policy; it is not an exhaustive negative internet search.
- `data/source/prydwen-character-recommendations-2026-10-11.json` is a dated evidence snapshot. `scripts/capture-prydwen-character-recommendations.py` extracts names, numeric values, source order and short conditions from connected-web source-line captures. Entire guides, reviews and rotations are not republished. Capture time does not fabricate the provider’s update date; unavailable `sourceUpdatedAt` stays null.
- `src/data/characterEquipmentAssociations.ts` is the generated canonical relationship/reference projection, with types in `src/characterEquipmentDomain.ts`. The generator requires the reviewed artifact hash and approved identity set; no remote source automatically overwrites these decisions.
- `buildCharacterDatabase()` exports detached `characters[].signatureWeapon` and `characters[].guideRecommendations`. Upcoming rows have null. Missing/pending signature decisions differ from reviewed NO_SIGNATURE, which carries `weaponId: null`. Raw Character/Weapon facts remain in their existing owners.

Existing profile equipment, Calc targets, Echo requirements/preferences, teams, rotations and DPS readiness are unchanged. This does not populate the visible Improve Recommended controls or resolve BUG-042.

## Recommendation evidence

| Captured family | Coverage |
| --- | --- |
| Ranked weapon/refinement options | 502 across 59 Characters |
| Echo set options, including separate companion choices | 153 across 59 Characters |
| Main-stat slots | 295 (five per Character), plus substat priorities for all 59 |
| Endgame stat rows | 406 across 59 Characters |
| Skill leveling contexts | 66 across 59 Characters |
| Explicit linked teammate groups | 208 across 56 Characters |
| General teammate guidance | Baizhi, Shorekeeper and Verina (all 59 covered with the linked groups above) |
| Weapon calculation contexts | 42; named calculation teammates are separate from synergy recommendations |

Weapons and Echo sets preserve **source display order**, not a recomputed numeric sort. Percentages retain their original text, refinement, column and observed mode labels; every numeric percentage is a relative guide comparison, not absolute DPS. Aemeath’s Endless Collapse example retains `75.70%` for Tune Rupture and a null/dash for Fusion Burst. Hsin retains separate Unison/Electro Flare weapon columns and Flare/Unison skill-priority groups.

Main Echoes are attached to their primary set recommendation; 2-piece companion alternatives reference that primary option and are not promoted to independent complete loadouts. Where the source does not expose a piece count, it stays null. A set associated with a Character is a recommendation, not an exclusive equipment fact.

Endgame values remain source strings with conditions: Jingran’s `3200+ (Post-conversion from HP)`, `50%+ (Before Echo set & Signature weapon)` and HP goal must not become unconditional game stats. The source’s default S0 five-star / S6 four-star-and-free convention and out-of-combat active-party measurement basis are recorded separately. Short prose is explicitly an excerpt and may be truncated; source URLs remain available for full explanations.

Teammate display order is **not inferred power rank**. General support guidance stays prose, including Baizhi’s coordinated-attack caveat; broad compatibility does not manufacture an approved list. Calculation teammates retain a separate semantic role. **Image-only example-team members were not exposed by the connected-web text capture**: labels are retained, member status is `NOT_EXPOSED_BY_TEXT_CAPTURE`, and complete ranked team compositions are not claimed.

Every captured Character, weapon, set, main Echo and linked teammate resolves to its canonical identity. Refinements and variants stay separate. Performance comparisons carry `NOT_INDEPENDENTLY_VALIDATED`, as requested.

## Bounded released-weapon integration

The signature join exposed two catalog gaps: Jingran’s Thousandfold Deliverance was still upcoming, and Hsin’s Blooming Jadehaven was absent. Both are now released source-reviewed rows. This is a two-weapon update, not a claim of a new unrestricted version-wide weapon audit.

| Weapon | Type | Lv90 ATK | Secondary |
| --- | --- | --- | --- |
| Thousandfold Deliverance | Broadblade | 413 | HP 72.2% |
| Blooming Jadehaven | Rectifier | 587 | CRIT Rate 24.3% |

The original released client source is [Arikatsu/WutheringWaves_Data@9218d612](https://github.com/Arikatsu/WutheringWaves_Data/tree/9218d612ad815e398e064e577e42aaf878899968), matching the Character source packet. `data/source/signature-weapon-release-3.7.json` retains item IDs, base properties, level-90/breach-6 growth entries, passive text and all R1–R5 parameter arrays, with source URLs/hashes. Published integer ATK presentation is retained explicitly rather than inventing a universal rounding rule.

Eight passive families are projected into the existing effect catalog: two unconditional All-Attribute DMG rows use the established static contract; six conditional/stack/target rows remain `VERIFIED_RAW_PENDING_MODEL` and MANUAL. Blooming’s Skill amplification/Electro RES ignore do not receive fabricated durations. Its active-wielder target Electro Flare amplification records 30 seconds / 0.1-second cadence / strongest same-name effect. Thousandfold distinguishes six held resource stacks from up to two consumed DEF-ignore stacks, Shield cadence from Intro activation, and Heavy-only crit from permanent Character crit.

Current core/effect gates use bounded V37 snapshots (123 released weapons / 244 effect rows); V36 historical evidence is preserved. Separate V37 backward-impact reviews cover compatible current users and existing profiles. The source-backed browser snapshot has 62 static Build-stat effects; no new conditional execution adapter is added.

## Weapon icon presentation boundary

The released Blooming Jadehaven record and weapon effect facts are source-backed, but the local weapon-icon manifest does not yet contain a vetted Blooming Jadehaven image (122 icon entries versus 123 released weapons). The canonical browser projection therefore uses an explicit **ART PENDING** neutral placeholder only for this weapon; it never displays another weapon's art or invents source identity. All other missing canonical icons still fail the browser loader. Importing, provenance-checking and registering the real Blooming Jadehaven icon remains a separate pending visual-asset task, not a Character/Weapon data or DPS blocker.

## Verification and remaining work

Focused regression tests cover the complete signature/guide identity joins, source order and missing columns, mode/stat prerequisites, artifact pins/generator parity, new passive curves and scope, detached export, existing profile isolation and historical/current weapon gates. The normal strict build and generated browser/database parity are checked. Automatic draft FAST verification is checked on publication. FULL CI, browser/end-to-end verification, independent guide performance comparisons and landing remain deferred.

Danjin’s pre-existing FORTE threshold contradiction remains unresolved. Image-only example-team rosters and full prose conditions need a future richer source capture if complete team compositions or executable recommendation rules are desired.

## Reviewed signature decisions

| Character | Dedicated signature / reviewed absence | Evidence |
| --- | --- | --- |
| Aalto | NO_SIGNATURE (FOUR_STAR) | [Release-family policy](https://www.prydwen.gg/wuthering-waves/characters/aalto) |
| Aemeath | Everbright Polestar | [Guide](https://www.prydwen.gg/wuthering-waves/characters/aemeath) |
| Augusta | Thunderflare Dominion | [Guide](https://game8.co/games/Wuthering-Waves/archives/544473) |
| Baizhi | NO_SIGNATURE (FOUR_STAR) | [Release-family policy](https://www.prydwen.gg/wuthering-waves/characters/baizhi) |
| Brant | Unflickering Valor | [Guide](https://www.prydwen.gg/wuthering-waves/characters/brant) |
| Buling | NO_SIGNATURE (FOUR_STAR) | [Release-family policy](https://www.prydwen.gg/wuthering-waves/characters/buling) |
| Calcharo | NO_SIGNATURE (STANDARD_FIVE_STAR) | [Release-family policy](https://www.prydwen.gg/wuthering-waves/characters/calcharo) |
| Camellya | Red Spring | [Guide](https://www.prydwen.gg/wuthering-waves/characters/camellya) |
| Cantarella | Whispers of Sirens | [Guide](https://www.prydwen.gg/wuthering-waves/characters/cantarella) |
| Carlotta | The Last Dance | [Guide](https://game8.co/games/Wuthering-Waves/archives/491970) |
| Cartethyia | Defier's Thorn | [Guide](https://www.prydwen.gg/wuthering-waves/characters/cartethyia) |
| Changli | Blazing Brilliance | [Guide](https://www.prydwen.gg/wuthering-waves/characters/changli) |
| Chisa | Kumokiri | [Guide](https://game8.co/games/Wuthering-Waves/archives/565517) |
| Chixia | NO_SIGNATURE (FOUR_STAR) | [Release-family policy](https://www.prydwen.gg/wuthering-waves/characters/chixia) |
| Ciaccona | Woodland Aria | [Guide](https://game8.co/games/Wuthering-Waves/archives/514610) |
| Danjin | NO_SIGNATURE (FOUR_STAR) | [Release-family policy](https://www.prydwen.gg/wuthering-waves/characters/danjin) |
| Denia | Forged Dwarf Star | [Guide](https://www.prydwen.gg/wuthering-waves/characters/denia) |
| Encore | NO_SIGNATURE (STANDARD_FIVE_STAR) | [Release-family policy](https://www.prydwen.gg/wuthering-waves/characters/encore) |
| Galbrena | Lux & Umbra | [Guide](https://www.prydwen.gg/wuthering-waves/characters/galbrena) |
| Hiyuki | Frostburn | [Guide](https://www.prydwen.gg/wuthering-waves/characters/hiyuki) |
| Hsin | Blooming Jadehaven | [Guide](https://www.prydwen.gg/wuthering-waves/characters/hsin) |
| Iuno | Moongazer's Sigil | [Guide](https://www.prydwen.gg/wuthering-waves/characters/iuno) |
| Jianxin | NO_SIGNATURE (STANDARD_FIVE_STAR) | [Release-family policy](https://www.prydwen.gg/wuthering-waves/characters/jianxin) |
| Jingran | Thousandfold Deliverance | [Guide](https://www.prydwen.gg/wuthering-waves/characters/jingran) |
| Jinhsi | Ages of Harvest | [Guide](https://www.prydwen.gg/wuthering-waves/characters/jinhsi) |
| Jiyan | Verdant Summit | [Guide](https://www.prydwen.gg/wuthering-waves/characters/jiyan) |
| Lingyang | NO_SIGNATURE (STANDARD_FIVE_STAR) | [Release-family policy](https://www.prydwen.gg/wuthering-waves/characters/lingyang) |
| Lucilla | Freeze Frame | [Guide](https://www.prydwen.gg/wuthering-waves/characters/lucilla) |
| Lucy | Spectral Trigger | [Guide](https://www.prydwen.gg/wuthering-waves/characters/lucy) |
| Lumi | NO_SIGNATURE (FOUR_STAR) | [Release-family policy](https://www.prydwen.gg/wuthering-waves/characters/lumi) |
| Lupa | Wildfire Mark | [Guide](https://www.prydwen.gg/wuthering-waves/characters/lupa) |
| Luuk Herssen | Daybreaker's Spine | [Guide](https://www.prydwen.gg/wuthering-waves/characters/luuk-herssen) |
| Lynae | Spectrum Blaster | [Guide](https://www.prydwen.gg/wuthering-waves/characters/lynae) |
| Mornye | Starfield Calibrator | [Guide](https://www.prydwen.gg/wuthering-waves/characters/mornye) |
| Mortefi | NO_SIGNATURE (FOUR_STAR) | [Release-family policy](https://www.prydwen.gg/wuthering-waves/characters/mortefi) |
| Phoebe | Luminous Hymn | [Guide](https://www.prydwen.gg/wuthering-waves/characters/phoebe) |
| Phrolova | Lethean Elegy | [Guide](https://www.prydwen.gg/wuthering-waves/characters/phrolova) |
| Qingxiao | Glint of Clouds | [Guide](https://www.prydwen.gg/wuthering-waves/characters/qingxiao) |
| Qiuyuan | Emerald Sentence | [Guide](https://www.prydwen.gg/wuthering-waves/characters/qiuyuan) |
| Rebecca | Skull Thrasher | [Guide](https://www.prydwen.gg/wuthering-waves/characters/rebecca) |
| Roccia | Tragicomedy | [Guide](https://www.prydwen.gg/wuthering-waves/characters/roccia) |
| Rover (Aero) | Bloodpact's Pledge | [Guide](https://www.prydwen.gg/wuthering-waves/characters/rover-aero) |
| Rover (Electro) | NO_SIGNATURE (ROVER) | [Release-family policy](https://www.prydwen.gg/wuthering-waves/characters/rover-electro) |
| Rover (Havoc) | NO_SIGNATURE (ROVER) | [Release-family policy](https://www.prydwen.gg/wuthering-waves/characters/rover-havoc) |
| Rover (Spectro) | NO_SIGNATURE (ROVER) | [Release-family policy](https://www.prydwen.gg/wuthering-waves/characters/rover-spectro) |
| Sanhua | NO_SIGNATURE (FOUR_STAR) | [Release-family policy](https://www.prydwen.gg/wuthering-waves/characters/sanhua) |
| Sigrika | Solsworn Ciphers | [Guide](https://www.prydwen.gg/wuthering-waves/characters/sigrika) |
| Suisui | Firstlight's Herald | [Guide](https://www.prydwen.gg/wuthering-waves/characters/suisui) |
| Taoqi | NO_SIGNATURE (FOUR_STAR) | [Release-family policy](https://www.prydwen.gg/wuthering-waves/characters/taoqi) |
| The Shorekeeper | Stellar Symphony | [Guide](https://www.prydwen.gg/wuthering-waves/characters/the-shorekeeper) |
| Verina | NO_SIGNATURE (STANDARD_FIVE_STAR) | [Release-family policy](https://www.prydwen.gg/wuthering-waves/characters/verina) |
| Xiangli Yao | Verity's Handle | [Guide](https://www.prydwen.gg/wuthering-waves/characters/xiangli-yao) |
| Yangyang | NO_SIGNATURE (FOUR_STAR) | [Release-family policy](https://www.prydwen.gg/wuthering-waves/characters/yangyang) |
| Yangyang: Xuanling | Azure Oath | [Guide](https://www.prydwen.gg/wuthering-waves/characters/yangyang-xuanling) |
| Yinlin | Stringmaster | [Guide](https://www.prydwen.gg/wuthering-waves/characters/yinlin) |
| Youhu | NO_SIGNATURE (FOUR_STAR) | [Release-family policy](https://www.prydwen.gg/wuthering-waves/characters/youhu) |
| Yuanwu | NO_SIGNATURE (FOUR_STAR) | [Release-family policy](https://www.prydwen.gg/wuthering-waves/characters/yuanwu) |
| Zani | Blazing Justice | [Guide](https://www.prydwen.gg/wuthering-waves/characters/zani) |
| Zhezhi | Rime-Draped Sprouts | [Guide](https://www.prydwen.gg/wuthering-waves/characters/zhezhi) |
