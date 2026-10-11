# Forte tree UI source contract

This PR214 continuation starts from `8b99c17f4999b685b4154de14e50cc4683dfe6ab` and remains draft/unmerged. The supplied WuWaFlex screenshot defines the stepped five-column silhouette: Normal Attack, Resonance Skill, Forte Circuit, Resonance Liberation, Intro Skill. Outro is separate.

## Canonical source ingest

`data/source/character-forte-ui.json` retains the original per-character game tree rows and English move records for all 57 released builder Characters. `scripts/ingest-ui-forte-source.mjs` fetches immutable URLs and records SHA-256 hashes. It does not import upcoming/WIP Characters.

- Game tree and English localization: [Arikatsu/WutheringWaves_Data](https://github.com/Arikatsu/WutheringWaves_Data/tree/353f2eaed119bc9f680eab92807d20ac75a79b40), `BinData/skillTree/skilltree.json` and `Textmaps/en/multi_text/MultiText.json`.
- English skills, original Lv1–10 strings, and independent stat-node cross-check: [DommyMM/wuwabuild Characters.json](https://github.com/DommyMM/wuwabuild/blob/2b57a127b26b062ab58d272cd6735338507de1cd/public/Data/Characters.json).
- Existing `characterBuilderAssets` resolver and builder manifest supply all skill/stat artwork. No new images or guessed identities.

`ParentNodes` contains Character-local `NodeIndex` references, **not global row IDs**. `NodeGroup` is checked against the manifest source Character ID. Skill IDs join to exact move IDs/types. Minor Forte rows are cross-checked by global ID, coordinate, parent IDs and original value text. Placement follows the prerequisite graph from each of the five roots; it never divides or arranges aggregate intrinsic totals.

Each released Character currently has eight stat nodes, two Inherent nodes, five levelled skills and separate Outro. Inherent I references Forte (7), Inherent II references Inherent I (4). Source `SkillBranchIds`/descriptions are retained in the snapshot; they are mode references, not extra prerequisite edges. This editor does not introduce mode switches. The separate Tune Break entry (17) is outside this requested five-skill surface.

## State and rendering

- `build.forte` stores five independent 0–10 levels and Character-local enabled node IDs in each existing Character/build draft. Existing drafts initialize fully invested, matching the prior Lv10 preview baseline.
- Enabling a later node recursively enables required nodes; an uninvested root becomes Lv1. Disabling a prerequisite recursively disables all descendants. Lowering a positive skill level preserves enabled descendants; lowering to zero disables them.
- Lv0 is a UI disabled state. No source array is indexed at zero and no zero multiplier is invented.
- Grey/gold connectors reflect saved investment, independently of preview selection. Clicking any tree node only selects its Skill Preview; stat/Inherent investment changes only from the right-side `Enable node` / `Disable node` action.
- Names, descriptions, parameters and multiplier strings come from the source snapshot. Formatting tags are stripped and placeholders are substituted only with source parameters. Missing descriptions/values show Pending. Audit notes, mechanic summaries and generated explanations are never rendered. Metadata badges only repeat explicit damage classifications in the description.
- Build Stats consumes the same normalized Forte state through `forteStats(tree,state)` and sums only currently active permanent `kind:'stat'` nodes. This **replaces** the old unconditional `character.intrinsicStats` contribution inside the interactive Build projection, so disabling a node removes exactly that source-backed contribution without double-counting. Weapon/Echo committed static stats remain additive; skill levels, Inherent mechanics, Weapon/Sonata/Echo Skill/Sequence effects, team buffs and combat/DPS uptime remain outside this projection.

## Mornye source reconciliation (integration pending)

Mornye's canonical intrinsic row on this candidate is **12% Healing Bonus / 15.20% DEF**. The four original permanent Healing nodes are global IDs **697/701** (Normal Attack, 1.80% + 4.20%) and **700/704** (Intro, 1.80% + 4.20%), in two independent prerequisite strands. The pinned v3.6 game tree and directly cross-checked v3.7 game tree agree on all eight stat nodes. The two DEF strands remain unchanged at 2.28% + 5.32% each. See [Worker 9 primary-source reconciliation, Draft PR #258](https://github.com/bellebing/Bellibing-simulator/pull/258) and the exact source pins in `characterIntrinsicStats.ts`.

Previously used Prydwen/Wutheringlab **10% Healing** aggregate claims conflict with the original nodes, with no proven alternate unlock mechanic. The interactive Build Stats projection already computes the active source nodes (12% when all are enabled), **replacing** rather than adding catalog intrinsic stats. The Character Database export now reads the corrected canonical intrinsic row; no Build Stats calculation or recommendation is changed. **This remains an unintegrated candidate until the source/data tests, exact-head gates and separately authorized merge complete.**

## Validation

`test/characterForteUi.test.ts` covers every released source tree and every branch's activation/lowering; source drift, missing text, invalid state, original Lv1–10 strings and no Lv0 coefficient. The strict build checks generated JSON and browser module parity.

`verify-v34-skills-runtime.mjs` keeps the Skills behavior regression. `verify-v34-build-stats.mjs` additionally uses real Chrome to prove active Forte CRIT/ATK/HP/DEF/Element/Healing contributions, selection-only no-op behavior, prerequisite cascades, Character switching, reload persistence and no intrinsic double-counting while preserving committed Weapon/Echo static projection. Both local and immutable PR-head previews remain gated. BUG-030 is unchanged.

Exact final SHA and Verify run evidence are recorded on PR214 and in AI Handoff after the run succeeds.
