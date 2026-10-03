# DPR Calc Results — native Character stat reference review

Current second pass: **DPR_NATIVE_SEMANTIC_V2** adds reviewed legacy scenario references and a complete Character-tab coverage manifest while retaining the accepted modern V1 extraction, module, review pin and source values byte-for-byte. Combined coverage is **236 VERIFIED modern + 36 VERIFIED legacy / 10 blank PENDING**, with **one unpromoted ambiguous layout (Aerover)**. Stop for data review; no checkpoint.

Reviewed 2026-10-03 for draft PR #228, continuing exact prior head `97c49a64df1e9fea74601b254a7be16c2c1427f9`. This extends the source/data foundation with an independent DPR family. It does not change the existing Augusta Prydwen source/review or visible UI. Stop for data review; no checkpoint or merge.

## Authority and accepted modern V1 semantic source pin

Authoritative source: native [DPR Calc Results](https://docs.google.com/spreadsheets/d/1eoCTrwYIsRpacvL3KrcQpR5rwY3pbJ6gEljZdBj_DHs/edit), spreadsheet ID `1eoCTrwYIsRpacvL3KrcQpR5rwY3pbJ6gEljZdBj_DHs`, title **DPR Calc Results**. The user explicitly approves this source as **USER_APPROVED_PROJECT_SOURCE** for Bellibing's DPR recommendation/calc-reference layer. Exact extracted reference facts may be VERIFIED after deterministic extraction, metric, Character and context mapping review without external corroboration. This is neither an official Kuro source nor universal game-mechanics truth. Existing primary/external-source approval requirements remain unchanged.

Every one of the 56 native tabs, including hidden tabs, was scanned across its metadata-defined grid using native CellData effective values. Each explicit General/Calc block then received a bounded native read including formatted/effective/user-entered values and notes. The checked-in compact native snapshot retains the full tab inventory, full scan bounds, all discovered section headers, contiguous stat/notes rows and A1 import provenance. All extracted numbers and displayed strings come from native reads. A fresh XLSX export was inspected for discovery cross-check only; XLSX bytes never supply a semantic gate.

The old uploaded XLSX SHA-256 `34bc7d94d03e15b85377b02827e707dcc5520ec3df41354d8622b77ea45620c2` is historical transport provenance only. Different Google-generated ZIP/archive bytes do not block ingestion. No old or new raw XLSX byte hash participates in review binding.

Pipeline: native Google Sheet → compact native source snapshot → deterministic normalized extraction JSON → semantic SHA-256 → explicitly pinned project-source review → independent typed canonical DPR reference profiles.

Semantic SHA-256: `d3ca38885f16cadf82aa86ea5e48318e205dd9f3a42e4e1037a8c341fdcb0a8d`. Normalization: `DPR_NATIVE_SEMANTIC_V1`. The hash is SHA-256 of the normalized semantic JSON payload serialized with recursively sorted object keys, array order preserved. The self-digest and extraction/capture date are excluded; native spreadsheet identity, sorted tab inventory, section/row coordinates, labels, formulas, effective/raw values, formatted text, typing, mapping and source context remain covered. It is not the byte hash of the pretty-printed JSON file. Changing relevant cells changes the pin and invalidates the static review. Reordering object keys or scan response tabs, changing capture date, or changing transport-only XLSX metadata does not.

`src/data/dprCharacterStatReferences.ts` is generated from the checked-in extraction, not separately maintained numeric truth. `src/data/dprCharacterStatReferenceReview.ts` is an explicit static review and is never updated by generation. Runtime recomputes the semantic binding and requires that exact approval; regeneration on actual drift cannot silently approve a new source.

## Discovery and coverage

**56 source tabs scanned; 25 tabs with explicit blocks; 50 General/Calc sections; 23 mapped Character identities; 25 distinct Character+variant profiles; 236 VERIFIED numeric rows; 10 blank/PENDING rows; 0 unmapped/ambiguous rows.**

The resulting count of 25 is observed from the full current native scan. It is not a hardcoded expected total, whitelist, or a claim that the workbook contains only 25 Character-oriented tabs. Many Character tabs lack these explicit stat-reference blocks. Neither numerical helper data nor older Character calculation tables are promoted into recommendations. This extraction does not prove complete RELEASED-roster coverage.

| Native tab | Canonical Character | Variant | General VERIFIED / PENDING | Calc VERIFIED / PENDING |
| --- | --- | --- | --- | --- |
| Aemeath (Fusion Burst) | `aemeath` | `FUSION_BURST` | 5 / 0 | 5 / 0 |
| Aemeath (Rupture) | `aemeath` | `RUPTURE` | 5 / 0 | 5 / 0 |
| Augusta | `augusta` | `DEFAULT` | 5 / 0 | 5 / 0 |
| Cartethiya | `cartethyia` | `DEFAULT` | 5 / 0 | 5 / 0 |
| Chisa | `chisa` | `DEFAULT` | 5 / 0 | 5 / 0 |
| Denia | `denia` | `DEFAULT` | 5 / 0 | 5 / 0 |
| Galbrena | `galbrena` | `DEFAULT` | 5 / 0 | 5 / 0 |
| Galbrena (WIP EN TL) | `galbrena` | `WIP_EN_TL` | 5 / 0 | 5 / 0 |
| Hiyuki | `hiyuki` | `DEFAULT` | 5 / 0 | 5 / 0 |
| Hsin (WIP) | `hsin` | `DEFAULT` | 5 / 0 | 5 / 0 |
| Iuno MDPS (WIP) | `iuno` | `MDPS_WIP` | 5 / 0 | 5 / 0 |
| Jingran (WIP) | `jingran` | `DEFAULT` | 5 / 0 | 5 / 0 |
| Lucilla | `lucilla` | `DEFAULT` | 5 / 0 | 5 / 0 |
| Lucy | `lucy` | `DEFAULT` | 5 / 0 | 5 / 0 |
| Luuk | `luuk-herssen` | `DEFAULT` | 5 / 0 | 5 / 0 |
| Lynae | `lynae` | `DEFAULT` | 5 / 0 | 5 / 0 |
| Mornye | `mornye` | `DEFAULT` | 5 / 0 | 5 / 0 |
| Phrolova | `phrolova` | `DEFAULT` | 5 / 0 | 5 / 0 |
| Qingxiao | `qingxiao` | `DEFAULT` | 5 / 0 | 5 / 0 |
| Qiuyuan 2x Forte | `qiuyuan` | `TWO_FORTE` | 5 / 0 | 5 / 0 |
| Rebecca | `rebecca` | `DEFAULT` | 5 / 0 | 5 / 0 |
| Sigrika | `sigrika` | `DEFAULT` | 4 / 0 | 4 / 0 |
| Suisui | `suisui` | `DEFAULT` | 4 / 0 | 4 / 0 |
| Suoming (WIP) | `suoming` | `DEFAULT` | 0 / 5 | 0 / 5 |
| Xuanling | `yangyang-xuanling` | `DEFAULT` | 5 / 0 | 5 / 0 |

Tabs scanned with **no explicit General/Calc block** (no recommendations inferred):

- Phoebe
- Iuno
- Camellya
- Qiuyuan
- Aerover (hidden)
- Whiwa HP Info (hidden)
- Yessys's Aemeath Rotation Compilation
- Carte Rotation Guide
- Carlotta
- Buling (WIP)
- Zhezhi
- Copy of Copy of sigrika ER sk (hidden)
- Set Shorthand
- sidew37's Looping Rotation Compilation
- ToA HP Charts
- Lupa
- Zani Rotation Guide
- Read me (hidden)
- Roccia (hidden)
- Whiwa HP Charts (WIP)
- Qiuyuan MDPS(WIP EN TL) (hidden)
- Cantarella
- Readme
- Jinhsi (WIP)
- Zani
- ToA HP Info (hidden)
- Changli (WIP)
- Ciaconna
- XLY
- Brant
- Index

All ten blank rows belong to Suoming (WIP): five General and five Calc stat labels. Their source coordinates, labels, setup context and import provenance remain available; no values are invented. Known aliases XLY/Aerover/Ciaconna are mapped by the identity resolver and tested, but currently have no explicit source blocks to ingest. Qiuyuan DEFAULT/MDPS and Iuno DEFAULT likewise remain absent from this extraction. Galbrena DEFAULT and WIP_EN_TL, both Aemeath modes, Qiuyuan TWO_FORTE and Iuno MDPS_WIP retain distinct profile keys.

## Roles, metrics and context

General Stat Recommendation → **GENERAL_RECOMMENDATION**. Stats used for Calcs → **CALC_BENCHMARK**. Canonical values have `kind: REFERENCE`, explicit role and exact reference number. General is not minimum; Calc is not preferred. They are never averaged or treated as endpoints of a range or executable targets. The independent Prydwen family retains MINIMUM / BOUNDED_RANGE / OPEN_ENDED_BAND / EXACT.

Typed metrics observed: `BASIC_ATTACK_DMG_BONUS`, `HEAVY_ATTACK_DMG_BONUS`, `RESONANCE_LIBERATION_DMG_BONUS`, `RESONANCE_SKILL_DMG_BONUS`, `TOTAL_ATK`, `TOTAL_CRIT_DAMAGE`, `TOTAL_CRIT_RATE`, `TOTAL_DEF`, `TOTAL_ENERGY_REGEN`, `TOTAL_HP`. HP/DEF/ATK are POINTS; the others are RATIO. These additions belong only to Character recommendations and do not enlarge persisted Customize or Echo metric enums.

Original labels are preserved verbatim, including Lucilla's trailing whitespace and labels such as `Minimum ER`. Parenthetical configuration is stored separately as source prose, including `ATK/ELE`, `ELE/ELE`, `44111 CR/CD`, `CR 4c`, `3c ER`, `ELE/ER`, and `ER/DEF, DEF 4c`. WIP/translation markers and variant/tab identity remain source context; nothing here makes them executable. Unknown labels/tabs fail closed and appear in issues.

Hsin exact native values: General CR `.688`, CD `2.57`, ATK `2311.166`; Calc CR `.748`, CD `2.69`, ATK `2481.552`. Full native effective precision is preserved for all metrics, e.g. Hsin General Skill DMG is `0.09299999999999999` while its formatted value is `9.30%`. Zero ER remains zero (Phrolova), and CR above 100% remains exactly as supplied (Qingxiao). No range ordering or plausibility correction is applied.

Guidance such as “Your goal is to get around 47000-50000 HP” and “Ignore BA DMG in Echo Mode” is retained as section source notes, never manufactured as a metric. Current stat cells are spilled import results: their direct formula fields are null where no formula is entered, while each profile retains the native A1 IMPORTRANGE formula and effective header text. Direct formula/effective-value preservation is separately tested for future directly entered formula cells.

## Refresh and parity

For a fresh native capture, enumerate spreadsheet metadata first, then read every metadata-defined grid including hidden tabs with `get_spreadsheet_cells` using `formattedValue,effectiveValue,userEnteredValue,note`. Native API `spreadsheets.get(includeGridData=true)` with complete grid coverage is also supported. Assemble one full native API-shaped response containing all tabs; do not pass a partial range response as a full-grid snapshot. `captureDprNativeSource()` scans the complete response dynamically; it retains explicit structures only and never uses an ingestion whitelist.

```sh
node --experimental-strip-types scripts/generate-dpr-character-stat-references.ts --native-input /path/to/full-native-response.json --date 2026-10-03 --capture-output data/research/dpr-calc-native-source-snapshot-2026-10-03.json
node --experimental-strip-types scripts/generate-dpr-character-stat-references.ts --check
```

Review changes to extraction, mapping and context before refreshing the independent review pin. The current ingestion uses native API values, so an XLSX fallback is not required. If a future capture uses XLSX as transport, normalize semantic cells and retain native identity; never add a raw archive-byte source gate.

## Validation and boundaries

Focused validation: DPR extraction/reference tests, existing Character Recommendation tests and affected Improve source-binding tests. Strict TypeScript check, strict build with existing generated runtime parity, deterministic DPR extraction/module parity and whitespace are required. Exact results are recorded below and in the PR body. No full repository suite, browser matrix, Verify or Export workflow.

Augusta Prydwen remains intact and CURRENT with 7 VERIFIED recommendations; DPR adds 10 independent Augusta reference rows. Existing source/review/research bytes are untouched. Character Target visible presentation remains Pending, and UI/prototype/persistence/generated Improve assets have no diff. UI wiring, Build Need, Improvement Cost and evaluator remain Pending. BUG-042 and the unrelated Sequence spacing observation are unchanged. AI Handoff was read (including UPD-319) and remains unedited.

Accepted modern V1 iteration validation: **65/65 focused tests PASS** (18 DPR extraction/reference + 34 Character Recommendation + 13 Improve source-binding); **strict type check PASS**, **strict build PASS** including existing generated source/browser parity, **deterministic DPR extraction JSON/module parity PASS**, **whitespace PASS**. Commands: `node --experimental-strip-types --test --test-isolation=none test/dprCharacterStatReferences.test.ts test/characterRecommendations.test.ts test/improvePolicySources.test.ts`; `npx tsc -p tsconfig.web.json --noEmit`; `npm run build`; `node --experimental-strip-types scripts/generate-dpr-character-stat-references.ts --check`; `git diff --check`. Build-internal canonical data generation is part of strict build; no GitHub Verify/Export workflow was run. The normal iteration commit uses `[skip ci]`, retaining the user's no-checkpoint boundary.

## Second pass — complete legacy discovery and V2 semantic manifest

Every mapped Character tab without an accepted modern block was inspected across its complete metadata-defined native grid with formatted/effective/user-entered values and notes: **18 tabs**, including hidden tabs and cells below row 40. The checked-in sparse native snapshot retains all **2,878 populated CellData records**, full scan bounds, all 56 inventory identities and the formula/import provenance. It is a full-grid discovery capture, not a list of preselected stat cells. Blank grid tail is omitted from storage.

Native source tracing found imported visible results through external IMPORTRANGE formulas. The Brant tuples are explicit visible text and their A1 import origin is retained. No deterministic internal workbook stat-reference chain was found elsewhere that could safely fill missing total stats. Imported damage totals, coefficients and sensitivity outputs are not reversed into Character stats. External referenced workbooks were not expanded into this source scope.

**Substat Value is marginal contribution/sensitivity data, not Character total stats.** The extractor rejects the full paired Substat / Substat Value columns before stat discovery, even when a row says ER, CR, CD or a known damage bonus. Damage, sequence/weapon/set comparison percentages, team totals and rDPR are likewise excluded. Setup names such as ELE/ELE or CR/CD describe equipment context without providing numeric Character totals. WIP source markers never change canonical roster release truth.

The only newly verified legacy structure is Brant's explicit **ER / CR / CD** setup column: **1 Character+variant profile, 12 scenarios, 36 numeric rows**, all CALC_SCENARIO_REFERENCE. No legacy General or modern Calc Benchmark rows are manufactured. Only ER, CR and CD are present; ATK, HP, DEF and damage bonuses stay unavailable. Neither table ranks nor 100% damage values select a recommended/default/winning scenario.

Aerover is **AMBIGUOUS_REVIEW_REQUIRED**. It has ATK% / Flat ATK / DMG% headers at **E8:G8** and component values around **E2:G12**, including the E2 import from Aerover!P500:R510. The visible native layout does not deterministically bind them to a named Character build/scenario or distinguish the generic DMG% component into a typed damage-bonus class. These components are not total ATK. Their native labels, adjacent values and full source snapshot are retained for review; **zero Aerover canonical stat rows** are promoted. This one ambiguous source layout does not invalidate independent Brant or accepted modern references.

### Why normalization is V2

V1 semantics are unchanged. The V1 modern semantic pin remains `d3ca38885f16cadf82aa86ea5e48318e205dd9f3a42e4e1037a8c341fdcb0a8d`, with 25 profiles / 236 numeric / 10 blank rows.

V2 manifest/scenario semantic SHA-256: `ee779803e784355bd1de45a954b43cf54cfc4f7a25475886a7825bca42fd5698`. V2 hashes its normalized semantic payload, including a transitive reference to the exact V1 pin, new legacy rows, original tuple tokens, native cells/formulas, separate scenario context/identity, the complete 43-tab classification and ambiguity evidence. Self-digest/capture date are excluded. It intentionally expands source facts and coverage semantics and therefore has its own explicit normalization version and independent static source-review pin. V1 artifacts and approval are not rewritten.

V2 runtime verifies its semantic hash against the separate source review and validates the referenced V1 semantic binding. Changing a source stat, setup, table context or relevant formula requires new review. Changing an excluded damage/ranking/sensitivity value does not change the stat-reference semantic pin. Raw XLSX archive hashes remain transport-only and never gate either version.

Scenario keys use Character + variant + stat-header cell + setup-row cell, e.g. `brant:DEFAULT:B25:A26`. Thus identical setup labels in the 1x/2x Forte tables remain separate. Setup/rotation/team labels are preserved verbatim as source context, including footnotes; no executable team, rotation or applicability is inferred. Tuple punctuation such as `276.%` and `225 %` stays verbatim while ratios are normalized deterministically to 2.76 and 2.25.

`projectDprCalcScenarioReferences()` returns every reviewed scenario separately. `projectDprAllCharacterStatReferences()` exposes modern profiles, legacy scenarios and source coverage together without averaging or choosing defaults. The existing modern API and Augusta Prydwen projection retain their accepted behavior.

### All Character-oriented tabs

**43 Character-oriented tabs / 38 distinct Character identities.** All 25 modern tabs retain General/Calc sections. The other 18 full grids produce one explicit legacy tab, 16 NO_CHARACTER_STAT_REFERENCES tabs and one ambiguous tab. No grid is wholly empty, so EMPTY/WIP is supported but not assigned merely because a title says WIP.

At least one usable numeric DPR reference: **23 Character identities** — `aemeath`, `augusta`, `brant`, `cartethyia`, `chisa`, `denia`, `galbrena`, `hiyuki`, `hsin`, `iuno`, `jingran`, `lucilla`, `lucy`, `luuk-herssen`, `lynae`, `mornye`, `phrolova`, `qingxiao`, `qiuyuan`, `rebecca`, `sigrika`, `suisui`, `yangyang-xuanling`.

No usable numeric DPR reference: **15 Character identities** — `buling`, `camellya`, `cantarella`, `carlotta`, `changli`, `ciaccona`, `jinhsi`, `lupa`, `phoebe`, `roccia`, `rover-aero`, `suoming`, `xiangli-yao`, `zani`, `zhezhi`. Suoming has explicit modern labels but all ten values blank; Aerover is ambiguous; the other 13 have no usable explicit stat assumptions. Iuno DEFAULT and Qiuyuan DEFAULT/MDPS lack source rows while other variants of those Characters are independently covered. This is not complete 57-Character recommendation coverage.

Metric abbreviations: HP=TOTAL_HP, DEF=TOTAL_DEF, ATK=TOTAL_ATK, CR=TOTAL_CRIT_RATE, CD=TOTAL_CRIT_DAMAGE, ER=TOTAL_ENERGY_REGEN, BA=BASIC_ATTACK_DMG_BONUS, HA=HEAVY_ATTACK_DMG_BONUS, Skill=RESONANCE_SKILL_DMG_BONUS, Lib=RESONANCE_LIBERATION_DMG_BONUS. Metrics describe explicit source labels; Suoming's listed metrics remain blank/PENDING.

| Native tab | Character ID | Variant | Modern General / Calc | Legacy | Metrics found | Status / reason |
| --- | --- | --- | --- | --- | --- | --- |
| Aemeath (Fusion Burst) | `aemeath` | `FUSION_BURST` | Yes / Yes | No | Lib, ATK, CD, CR, ER | Modern CURRENT |
| Aemeath (Rupture) | `aemeath` | `RUPTURE` | Yes / Yes | No | Lib, ATK, CD, CR, ER | Modern CURRENT |
| Aerover | `rover-aero` | `DEFAULT` | No / No | No | — | AMBIGUOUS: stat components lack setup/typed-total context |
| Augusta | `augusta` | `DEFAULT` | Yes / Yes | No | HA, ATK, CD, CR, ER | Modern CURRENT |
| Brant | `brant` | `DEFAULT` | No / No | Yes (12 scenarios) | CD, CR, ER | 12 explicit scenarios; partial ER/CR/CD only |
| Buling (WIP) | `buling` | `DEFAULT` | No / No | No | — | NO_CHARACTER_STAT_REFERENCES: damage/sensitivity/setup prose only |
| Camellya | `camellya` | `DEFAULT` | No / No | No | — | NO_CHARACTER_STAT_REFERENCES: damage/sensitivity/setup prose only; main import #REF! |
| Cantarella | `cantarella` | `DEFAULT` | No / No | No | — | NO_CHARACTER_STAT_REFERENCES: damage/sensitivity/setup prose only |
| Carlotta | `carlotta` | `DEFAULT` | No / No | No | — | NO_CHARACTER_STAT_REFERENCES: damage/sensitivity/setup prose only |
| Cartethiya | `cartethyia` | `DEFAULT` | Yes / Yes | No | BA, CD, CR, ER, HP | Modern CURRENT |
| Changli (WIP) | `changli` | `DEFAULT` | No / No | No | — | NO_CHARACTER_STAT_REFERENCES: damage/sensitivity/setup prose only |
| Chisa | `chisa` | `DEFAULT` | Yes / Yes | No | Lib, ATK, CD, CR, ER | Modern CURRENT |
| Ciaconna | `ciaccona` | `DEFAULT` | No / No | No | — | NO_CHARACTER_STAT_REFERENCES: damage/sensitivity/setup prose only |
| Denia | `denia` | `DEFAULT` | Yes / Yes | No | Lib, ATK, CD, CR, ER | Modern CURRENT |
| Galbrena | `galbrena` | `DEFAULT` | Yes / Yes | No | HA, ATK, CD, CR, ER | Modern CURRENT |
| Galbrena (WIP EN TL) | `galbrena` | `WIP_EN_TL` | Yes / Yes | No | HA, ATK, CD, CR, ER | Modern CURRENT |
| Hiyuki | `hiyuki` | `DEFAULT` | Yes / Yes | No | Lib, ATK, CD, CR, ER | Modern CURRENT |
| Hsin (WIP) | `hsin` | `DEFAULT` | Yes / Yes | No | Skill, ATK, CD, CR, ER | Modern CURRENT |
| Iuno | `iuno` | `DEFAULT` | No / No | No | — | NO_CHARACTER_STAT_REFERENCES: damage/sensitivity/setup prose only |
| Iuno MDPS (WIP) | `iuno` | `MDPS_WIP` | Yes / Yes | No | Lib, ATK, CD, CR, ER | Modern CURRENT |
| Jingran (WIP) | `jingran` | `DEFAULT` | Yes / Yes | No | ATK, CD, CR, ER, HP | Modern CURRENT |
| Jinhsi (WIP) | `jinhsi` | `DEFAULT` | No / No | No | — | NO_CHARACTER_STAT_REFERENCES: damage/sensitivity/setup prose only |
| Lucilla | `lucilla` | `DEFAULT` | Yes / Yes | No | BA, ATK, CD, CR, ER | Modern CURRENT |
| Lucy | `lucy` | `DEFAULT` | Yes / Yes | No | HA, ATK, CD, CR, ER | Modern CURRENT |
| Lupa | `lupa` | `DEFAULT` | No / No | No | — | NO_CHARACTER_STAT_REFERENCES: damage/sensitivity/setup prose only |
| Luuk | `luuk-herssen` | `DEFAULT` | Yes / Yes | No | BA, ATK, CD, CR, ER | Modern CURRENT |
| Lynae | `lynae` | `DEFAULT` | Yes / Yes | No | BA, ATK, CD, CR, ER | Modern CURRENT |
| Mornye | `mornye` | `DEFAULT` | Yes / Yes | No | Lib, CD, CR, DEF, ER | Modern CURRENT |
| Phoebe | `phoebe` | `DEFAULT` | No / No | No | — | NO_CHARACTER_STAT_REFERENCES: damage/sensitivity/setup prose only |
| Phrolova | `phrolova` | `DEFAULT` | Yes / Yes | No | Skill, ATK, CD, CR, ER | Modern CURRENT |
| Qingxiao | `qingxiao` | `DEFAULT` | Yes / Yes | No | Lib, ATK, CD, CR, ER | Modern CURRENT |
| Qiuyuan | `qiuyuan` | `DEFAULT` | No / No | No | — | NO_CHARACTER_STAT_REFERENCES: damage/sensitivity/setup prose only |
| Qiuyuan 2x Forte | `qiuyuan` | `TWO_FORTE` | Yes / Yes | No | HA, ATK, CD, CR, ER | Modern CURRENT |
| Qiuyuan MDPS(WIP EN TL) | `qiuyuan` | `MDPS_WIP_EN_TL` | No / No | No | — | NO_CHARACTER_STAT_REFERENCES: damage/sensitivity/setup prose only |
| Rebecca | `rebecca` | `DEFAULT` | Yes / Yes | No | BA, ATK, CD, CR, ER | Modern CURRENT |
| Roccia | `roccia` | `DEFAULT` | No / No | No | — | NO_CHARACTER_STAT_REFERENCES: damage/sensitivity/setup prose only |
| Sigrika | `sigrika` | `DEFAULT` | Yes / Yes | No | ATK, CD, CR, ER | Modern CURRENT |
| Suisui | `suisui` | `DEFAULT` | Yes / Yes | No | CD, CR, ER, HP | Modern CURRENT |
| Suoming (WIP) | `suoming` | `DEFAULT` | Yes / Yes | No | Lib, ATK, CD, CR, ER | Modern labels; all values blank/PENDING |
| XLY | `xiangli-yao` | `DEFAULT` | No / No | No | — | NO_CHARACTER_STAT_REFERENCES: damage/sensitivity/setup prose only |
| Xuanling | `yangyang-xuanling` | `DEFAULT` | Yes / Yes | No | HA, ATK, CD, CR, ER | Modern CURRENT |
| Zani | `zani` | `DEFAULT` | No / No | No | — | NO_CHARACTER_STAT_REFERENCES: damage/sensitivity/setup prose only; auxiliary imports #REF! |
| Zhezhi | `zhezhi` | `DEFAULT` | No / No | No | — | NO_CHARACTER_STAT_REFERENCES: damage/sensitivity/setup prose only |

### Exact Brant scenario coverage

B25 table context (A24): `Brant Personal damage S0R1 + S6 Sanhua, S0R1 SK (2x forte)`.

B34 table context (A33): `Brant S0R1 Personal damage 0 to 100 concerto, S0R1 SK (1x forte)*`.

| Stat header | Setup row | Exact source setup | Exact ER / CR / CD text | Normalized ER / CR / CD |
| --- | --- | --- | --- | --- |
| B25 | A26 | TBC 43311 ER/ER | `276.% \| 73% \| 225%` | 2.76 / 0.73 / 2.25 |
| B25 | A27 | TBC 43311 Ele/ER | `253.% \| 66% \| 225%` | 2.53 / 0.66 / 2.25 |
| B25 | A28 | Molten Rift 43311 ER/ER (NRider) | `266% \| 73% \| 225 %` | 2.66 / 0.73 / 2.25 |
| B25 | A29 | 2pc2Pc MC/TBC (Dragon, healer on Bell) | `231.% \| 66% \| 225%` | 2.31 / 0.66 / 2.25 |
| B25 | A30 | 2pc2Pc MC/TBC (Fallacy, healer on Bell) | `231.% \| 66% \| 225%` | 2.31 / 0.66 / 2.25 |
| B25 | A31 | Molten Rift 43311 ER/ER (Rider)** | `266% \| 73% \| 225 %` | 2.66 / 0.73 / 2.25 |
| B34 | A35 | TBC 43311 ER/ER | `276.% \| 73% \| 225%` | 2.76 / 0.73 / 2.25 |
| B34 | A36 | TBC 43311 Ele/ER | `253.% \| 66% \| 225%` | 2.53 / 0.66 / 2.25 |
| B34 | A37 | MR 43311 ER/ER (Nightmare Rider) | `266% \| 73% \| 225%` | 2.66 / 0.73 / 2.25 |
| B34 | A38 | 2pc2Pc MC/TBC (Dragon, healer on Bell) | `231.% \| 66% \| 225%` | 2.31 / 0.66 / 2.25 |
| B34 | A39 | 2pc2Pc MC/TBC (Fallacy, healer on Bell) | `231.% \| 66% \| 225%` | 2.31 / 0.66 / 2.25 |
| B34 | A40 | MR 43311 ER/ER (Rider)** | `266% \| 73% \| 225%` | 2.66 / 0.73 / 2.25 |

All 12 scenarios remain separate even when setup names or stat values repeat. Footnotes A41:A44 remain prose context. Each has exactly 3 verified source rows, all comparison statuses PENDING. No missing metric is borrowed from another setup.

### Replay and validation

```sh
node --experimental-strip-types scripts/generate-dpr-character-stat-references.ts --check
node --experimental-strip-types scripts/generate-dpr-legacy-stat-references.ts --check
```

For a refresh, ground the complete native metadata, dynamically select every mapped tab without a modern block, and read each full bounded grid with all relevant CellData fields. `captureDprLegacyNativeSource()` converts native full-grid responses plus full metadata into the sparse capture; extraction fails if any required tab is missing or inventory identity drifts.

```sh
node --experimental-strip-types scripts/generate-dpr-legacy-stat-references.ts --native-input /path/to/full-legacy-celldata.json --inventory-input /path/to/full-native-metadata.json --date 2026-10-03 --capture-output data/research/dpr-calc-legacy-native-source-snapshot-2026-10-03.json
```

Current second-pass validation: **83/83 focused tests PASS** (18 legacy + 18 modern DPR + 34 Character Recommendation + 13 source-binding). Strict type check, strict build with existing generated runtime parity, V1+V2 extraction/module parity and whitespace **PASS**. No full suite, browser matrix, Verify or Export workflow.

Augusta Prydwen remains CURRENT with 7 VERIFIED recommendations. Augusta modern DPR retains 10 independent rows across General/Calc. Accepted V1 source snapshot/extraction/module/review bytes, Prydwen source/research/review, visible UI assets and generated Improve browser assets have no diff. Character Target remains Pending. UI wiring, Build Need, Improvement Cost and evaluator remain Pending; BUG-042 and AI Handoff are unedited. Stop for data review; no checkpoint or merge.
