# Released Character factual foundation — release 3.7 review

Reviewed **2026-10-11**. This is the combined draft candidate for roadmap #272: the five source-reviewed Character batches plus the remaining released raw records and missing kit facts. It is not merged/deployed state or a FULL verification claim. Recommendations, preferred weapons, teams, rotations and runtime interpretation are separate work.

## Source and ownership

The original global client capture is [Arikatsu/WutheringWaves_Data at 9218d612ad815e398e064e577e42aaf878899968](https://github.com/Arikatsu/WutheringWaves_Data/tree/9218d612ad815e398e064e577e42aaf878899968), labelled **GameVer 3.7.0 / ResourceVer 3.7.8 / Release** in its README. `data/source/character-release-3.7.json` retains exact role/property joins, all eight permanent property nodes, skill identities, full description templates/parameters, original level arrays and all six chain rows for each of the 59 released identities. Its provenance records immutable URLs and SHA-256 hashes for eleven original files. Relevant original damage rows are retained for Hsin, Jingran and the three disputed mechanics.

The capture is evidence with `canonicalAuthority=false` and `EXPLICIT_FIELD_REVIEW_REQUIRED`. Canonical owners remain `characters.ts`, `characterIntrinsicStats.ts` and the existing Character Mechanics registry. The two new kits and completion facts enter that registry through `releaseCharacterKitFacts.ts`; the export automatically consumes them. The existing 57-character Skills/Forte UI projection remains a separate presentation source.

Prydwen's reviewed published Lv90 integer convention is preserved for HP/ATK/DEF. Every released value agrees with the original level-90/breach-6 growth within one integer; that comparison does not invent a universal floor/round rule. Original raw DEF for Jingran is explicitly zero in property 1212, independently of the kit's fixed-DEF rule. Base CRIT Rate, CRIT DMG and Energy Regen are checked directly against the original property fields, rather than inferred from a build. Each permanent Minor Forte total re-derives the original eight node parameters.

## Max Energy decisions

`role.PropertyId` joins each identity to `baseproperty.EnergyMax`, the **dedicated capacity field**. It is distinct from `Energy` (current value), `EnergyEfficiency` (ER), `ElementEnergyMax` (Concerto), skill costs and Forte gauges. There are 100 original client units per displayed Resonance Energy point: control records include Yangyang/Danjin 10,000 → 100, Verina 17,500 → 175 and Aalto 15,000 → 150.

Secondary tables disagree on several capacities, including the older batch snapshots. The original field resolves these discrepancies; earlier batch review documents are historical where superseded by this review. A proven zero for Lucilla/Phrolova is retained as zero, not treated as missing or applied as a generic rule for other kits. Denia remains 125, directly confirmed by original property 1609 despite a conflicting secondary value of 100.

| Character | Previous canonical cap | Reviewed original cap |
| --- | ---: | ---: |
| Brant | 125 | 175 |
| Buling | 125 | 150 |
| Hsin | Pending | 125 |
| Jingran | Pending | 125 |
| Jinhsi | 125 | 150 |
| Lucilla | 150 | 0 |
| Lucy | 150 | 125 |
| Mornye | 125 | 175 |
| Phrolova | 125 | 0 |
| Qingxiao | Pending | 125 |
| Rebecca | 150 | 125 |
| Rover (Aero) | 125 | 150 |
| Rover (Electro) | Pending | 125 |
| Suisui | Pending | 175 |
| The Shorekeeper | 125 | 175 |
| Youhu | 125 | 100 |

## Individual released raw disposition

All rows below have raw `VERIFIED` / `DATA_ONLY` in this candidate. Each role identity/rarity/element/weapon, original property join, base combat and eight permanent nodes was reviewed. HP/ATK/DEF retain the selected published integer values. `Suoming` remains upcoming, has no invented released raw record and is excluded from the capture. The released pending-field manifest is empty; the audit still rejects unexpected nulls and stale exceptions.

| Character ID | Original role/property | Lv90 HP | ATK | DEF | Dedicated cap | Original stat nodes | Original chains |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| aalto | 1403 / 1403 | 9850 | 263 | 1075 | 150 | 8 | 6 |
| aemeath | 1210 / 1210 | 11025 | 425 | 1149 | 125 | 8 | 6 |
| augusta | 1306 / 1306 | 10300 | 463 | 1112 | 125 | 8 | 6 |
| baizhi | 1103 / 1103 | 12813 | 213 | 1002 | 175 | 8 | 6 |
| brant | 1206 / 1206 | 11675 | 375 | 1308 | 175 | 8 | 6 |
| buling | 1307 / 1307 | 10625 | 225 | 1259 | 150 | 8 | 6 |
| calcharo | 1301 / 1301 | 10500 | 438 | 1185 | 125 | 8 | 6 |
| camellya | 1603 / 1603 | 10325 | 450 | 1161 | 125 | 8 | 6 |
| cantarella | 1607 / 1607 | 11600 | 400 | 1100 | 125 | 8 | 6 |
| carlotta | 1107 / 1107 | 12450 | 463 | 1198 | 125 | 8 | 6 |
| cartethyia | 1409 / 1409 | 14800 | 313 | 611 | 125 | 8 | 6 |
| changli | 1205 / 1205 | 10388 | 463 | 1100 | 125 | 8 | 6 |
| chisa | 1508 / 1508 | 10775 | 438 | 1136 | 125 | 8 | 6 |
| chixia | 1202 / 1202 | 9088 | 300 | 953 | 150 | 8 | 6 |
| ciaccona | 1407 / 1407 | 12238 | 375 | 1198 | 125 | 8 | 6 |
| danjin | 1602 / 1602 | 9438 | 263 | 1149 | 100 | 8 | 6 |
| denia | 1211 / 1211 | 11025 | 425 | 1149 | 125 | 8 | 6 |
| encore | 1203 / 1203 | 10513 | 425 | 1246 | 125 | 8 | 6 |
| galbrena | 1208 / 1208 | 10300 | 463 | 1112 | 125 | 8 | 6 |
| hiyuki | 1108 / 1108 | 10300 | 463 | 1112 | 125 | 8 | 6 |
| hsin | 1311 / 1311 | 10300 | 463 | 1112 | 125 | 8 | 6 |
| iuno | 1410 / 1410 | 10525 | 450 | 1124 | 125 | 8 | 6 |
| jianxin | 1405 / 1405 | 14113 | 338 | 1124 | 150 | 8 | 6 |
| jingran | 1212 / 1212 | 15375 | 313 | 0 | 125 | 8 | 6 |
| jinhsi | 1304 / 1304 | 10825 | 413 | 1259 | 150 | 8 | 6 |
| jiyan | 1404 / 1404 | 10488 | 438 | 1185 | 125 | 8 | 6 |
| lingyang | 1104 / 1104 | 10388 | 438 | 1210 | 125 | 8 | 6 |
| lucilla | 1109 / 1109 | 12238 | 375 | 1198 | 0 | 8 | 6 |
| lucy | 1511 / 1511 | 11025 | 425 | 1149 | 125 | 8 | 6 |
| lumi | 1504 / 1504 | 8500 | 338 | 880 | 125 | 8 | 6 |
| lupa | 1207 / 1207 | 11913 | 388 | 1185 | 125 | 8 | 6 |
| luuk-herssen | 1510 / 1510 | 10300 | 463 | 1112 | 125 | 8 | 6 |
| lynae | 1509 / 1509 | 12238 | 375 | 1198 | 125 | 8 | 6 |
| mornye | 1209 / 1209 | 15375 | 288 | 1356 | 175 | 8 | 6 |
| mortefi | 1204 / 1204 | 10025 | 250 | 1136 | 125 | 8 | 6 |
| phoebe | 1506 / 1506 | 10825 | 413 | 1259 | 125 | 8 | 6 |
| phrolova | 1608 / 1608 | 10775 | 438 | 1136 | 0 | 8 | 6 |
| qingxiao | 1413 / 1413 | 10300 | 462 | 1112 | 125 | 8 | 6 |
| qiuyuan | 1411 / 1411 | 12238 | 375 | 1198 | 125 | 8 | 6 |
| rebecca | 1308 / 1308 | 11600 | 400 | 1173 | 125 | 8 | 6 |
| roccia | 1606 / 1606 | 12250 | 375 | 1198 | 125 | 8 | 6 |
| rover-aero | 1406 / 1406 | 10775 | 438 | 1136 | 150 | 8 | 6 |
| rover-electro | 1309 / 1309 | 10775 | 438 | 1136 | 125 | 8 | 6 |
| rover-havoc | 1604 / 1604 | 10825 | 413 | 1259 | 125 | 8 | 6 |
| rover-spectro | 1501 / 1501 | 11400 | 375 | 1369 | 125 | 8 | 6 |
| sanhua | 1102 / 1102 | 10063 | 275 | 941 | 100 | 8 | 6 |
| sigrika | 1412 / 1412 | 10775 | 438 | 1136 | 125 | 8 | 6 |
| suisui | 1110 / 1110 | 16713 | 288 | 1100 | 175 | 8 | 6 |
| taoqi | 1601 / 1601 | 8950 | 225 | 1564 | 125 | 8 | 6 |
| the-shorekeeper | 1505 / 1505 | 16713 | 288 | 1100 | 175 | 8 | 6 |
| verina | 1503 / 1503 | 14238 | 338 | 1100 | 175 | 8 | 6 |
| xiangli-yao | 1305 / 1305 | 10625 | 425 | 1222 | 125 | 8 | 6 |
| yangyang | 1402 / 1402 | 10200 | 250 | 1100 | 100 | 8 | 6 |
| yangyang-xuanling | 1610 / 1610 | 11025 | 425 | 1149 | 125 | 8 | 6 |
| yinlin | 1302 / 1302 | 11000 | 400 | 1283 | 125 | 8 | 6 |
| youhu | 1106 / 1106 | 9975 | 263 | 1051 | 100 | 8 | 6 |
| yuanwu | 1303 / 1303 | 8525 | 225 | 1637 | 125 | 8 | 6 |
| zani | 1507 / 1507 | 10775 | 438 | 1136 | 125 | 8 | 6 |
| zhezhi | 1105 / 1105 | 12250 | 375 | 1198 | 125 | 8 | 6 |

## Kit facts and disputed mechanics

Hsin and Jingran now have source-backed skill/family rules, exact damage curves at every skill level 1–10, permanent Minor Fortes, resources with source conditions, both Inherent Skills, Outro effects and all six Sequences. Hsin contributes 37 percentage rows and Jingran 22; full original arrays remain in the evidence packet. Component expressions and hit counts are preserved rather than replaced with an aggregated selected-level scalar.

Hsin's permanent nodes grant CRIT Rate +8% / ATK +12%; Jingran's grant CRIT Rate +8% / HP +12%. Both have a dedicated Max Energy cap of 125. Hsin's Soaring Pillar uses original Liberation damage Type 2; its coordinated SubType is a separate property. Pillars Across Heaven and Manifold Sudden Rain retain their source Skill classification despite Liberation/Intro panel ownership. Jingran's Heavy-class basic stages, follow-ups and Liberation are likewise classified independently of their panels. Its conditional additive HP increases remain `MIXED` raw facts, not executable HP hits. Shadow Step's fixed 30 + 25 components remain separate, with the source's exemption from all DMG Bonus effects. Tune Break does not receive an invented Character coefficient.

Buling's Five Thunders Spell Array is **Liberation DMG**, original damage row `1307019002`, Type 2. Xiangli Yao's Pivot — Impale is **Basic DMG**, original rows `1305011001`, `1305012001–4`, `1305013001–2`, Type 0. These resolve their prior classification blockers without inventing trigger/runtime semantics. Original capacity/Sequence facts complete Buling and Xiangli's source profiles. Danjin's six Sequences and explicit Ruby Blossom cap of 120 are also recorded.

**Danjin remains partial:** the original Forte text still says full-power damage when Ruby Blossom reaches **over 120**, while its maximum is **120**. Both literal statements are retained and the activation condition remains source-blocked. Neither an at-least-120 threshold nor executable full-power behavior is guessed.

## Candidate coverage and validation boundary

- Raw records and permanent Minor Fortes: **59/59**.
- ACTIONS, INHERENT_PASSIVES and OUTRO_EFFECT source areas: **59/59**.
- Six-area Character Mechanics source profiles: **58/59**, with Danjin's Forte/resource interpretation partial.
- Original evidence packet: **59** identities, **472** permanent stat nodes, **354** Sequence rows.
- All **1,903** existing Skills/Forte value rows agree with original 3.7 at every level 1–10 (**19,030** cells), normalizing decimal formatting only. No interpolation or source-value drift was found.

Focused regression checks cover the original joins/caps, permanent nodes, all legacy cells, the two new kits, component/flat/shared-system boundaries, disputed original damage types and rejection of missing raw fields. Deterministic coverage reports and capture/generator parity are checked; the normal build/export is checked. FULL CI, browser/end-to-end verification, automated review and landing are intentionally deferred for this draft, as requested. Source `VERIFIED` does not mean runtime execution, recommendations, UI presentation or DPS readiness.

The subsequent [signature and recommendation publication](CHARACTER_EQUIPMENT_AND_RECOMMENDATIONS_REVIEW.md) adds all 59 signature decisions and Prydwen guide references to this draft, including a bounded two-signature-weapon source update. Remaining roadmap work includes Danjin's actual activation-condition evidence, any broader version-3.7 Weapon facts audit, image-only example-team member capture and final combined verification.

## Reproduce the evidence and derived facts

```sh
node --experimental-strip-types scripts/capture-character-release-source.mjs --check
node scripts/generate-release-character-kit-facts.mjs --check
node --experimental-strip-types test/characterReleaseSource.test.ts
npm run report:character-actions
npm run report:character-forte-rules
npm run report:character-inherent-passives
npm run report:character-outro-effects
npm run build
```

The capture needs access to its pinned original GitHub files; `--source-dir=PATH` can use the same SHA-256-verified files offline. Neither script automatically changes raw verification/readiness or refreshes a mutable provider.
