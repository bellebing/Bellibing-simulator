# DPR Calc Results — native Character stat reference review

Reviewed 2026-10-03 for draft PR #228, continuing exact prior head `97c49a64df1e9fea74601b254a7be16c2c1427f9`. This extends the source/data foundation with an independent DPR family. It does not change the existing Augusta Prydwen source/review or visible UI. Stop for data review; no checkpoint or merge.

## Authority and semantic source pin

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

Validation result: **65/65 focused tests PASS** (18 DPR extraction/reference + 34 Character Recommendation + 13 Improve source-binding); **strict type check PASS**, **strict build PASS** including existing generated source/browser parity, **deterministic DPR extraction JSON/module parity PASS**, **whitespace PASS**. Commands: `node --experimental-strip-types --test --test-isolation=none test/dprCharacterStatReferences.test.ts test/characterRecommendations.test.ts test/improvePolicySources.test.ts`; `npx tsc -p tsconfig.web.json --noEmit`; `npm run build`; `node --experimental-strip-types scripts/generate-dpr-character-stat-references.ts --check`; `git diff --check`. Build-internal canonical data generation is part of strict build; no GitHub Verify/Export workflow was run. The normal iteration commit uses `[skip ci]`, retaining the user's no-checkpoint boundary.
