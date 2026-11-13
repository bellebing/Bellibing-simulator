# Character Import Pipeline — status i Draft PR #365 (2026-11-13)

**Källhämtning → canonically source-reviewed Character → befintliga Build/Inventory/Improve → verkligt sparat konto är nu PASS för Hsin, Lily och Suoming i riktig Chromium.** Äldre utredning nedan är historisk och beskriver INTE längre nuläget.

**Exakt implementation:** commit 9813a6d9725f0ba22745c77471dd74ac7c51d2bc, Actions Character Import Pipeline Review #43451976845 **SUCCESS**; PR #365 fortfarande Draft. Ingen merge, deployment eller privat DPS-claim.

| Character | Verifierad Lv90 HP/ATK/DEF/Max Energy | Character Usable | Build/Inventory | Skills/Forte/Sequences | Improve | DPS Ready |
| --- | --- | --- | --- | --- | --- | --- |
| Hsin (Electro/Rectifier) | 10300 / 463 / 1112 / 125 | PASS | PASS | PASS (source/presentation) | PASS (källa/default + Current Build) | Pending |
| Lily (Spectro/Pistols) | 16713 / 288 / 1100 / 175 | PASS | PASS; nyaste 5★ överst | PASS (source/presentation) | Pending (saknade verifierade rek/default; Current Build PASS) | Pending |
| Suoming (Electro/Sword) | 10300 / 463 / 1112 / 125 | PASS | PASS; befintligt ID, RELEASED | PASS (source/presentation) | Pending (saknade verifierade rek/default; Current Build PASS) | Pending |

**Nytt korrekt CLI-flöde på befintlig importer:**

- npm run import:character -- lily --capture-source – hämtar original 3.8 source-capture utan att göra Character ägd.
- npm run import:character -- hsin --promote-reviewed --integrate – en gång för ursprungsgranskad Hsin; samma kommando för lily och suoming. Kör inte --promote-reviewed igen på redan promoterade IDs: identitets-/assetduplicate guard blockerar.
- npm run import:character -- lily --integrate – regenererar befintliga projections från redan bekräftade source-owners. Ingen ny databas.
- npm run import:character -- lily --json – statisk coverage, som inte kan hävda Chromium-/privat DPS-bevis; source-absent Improve och DPS visas Pending.

En befintlig builder-preview med 'Details pending' för Hsin var en **inaktiverad preview/select-knapp på grund av saknade presentation assets**, inte generell blockering av själva AccountStore Add Character. När Builder/Skills/Sequences/Hero Art laddats kan Add skapa normal owned Character. Riktig Google Chrome verifierade detta.

Source owners: data/research/character-import/source-pins/3.8.json + ursprungliga lily-captured.json/suoming-captured.json, immutabla Git blob SHA, original Lv1 × Lv90 fixed-point /10000, half-up displayrounding och **EnergyMax/100** som faktisk maxenergi (inte Liberation cost). Befintliga src/data/characters.ts och characterIntrinsicStats.ts, data/source/character-{forte,sequence}-ui.json, source sequence review, originals assets Builder/portrait/hero manifest och befintliga UI/build/inventory generators. scripts/lib/integrate-reviewed-character.mjs återanvänder pipeline; scripts/update-reviewed-character-public-allowlist.mjs tillåter bara exakta SHA-kopplade riktiga originalbilder. Ingen parallell databas, påhittade stats, duplicerade Echoes eller fiktiva gear-rekommendationer.

Verifierad pipeline: 61 RELEASED canonical Characters, 61 source-bundna Builder kits / 861 original-bytevaliderade assets, 60 med original Skill/Forte/Sequence-presentation. 18 nya Sequences har fortfarande statiska Build-stat modifier-classifications Pending och ingen genomförd privat DPS-mekanik. Build/Inventory kan ändå fungera utan dessa privata mekaniker.

**Positiv real Chrome acceptance:** test/characterImportPositive.browser.mjs kör var och en av Hsin/Lily/Suoming via Build picker → source artwork → Select → **Add Character** → riktigt utrustat fysiskt Echo → AccountStore autosave → reload → samma Item och Character i Inventory → Improve Current Build → Augusta+föregående Inventory oförändrade → inga duplicate owned/import. test/characterOriginalRelease.browser.mjs bevisar Lily först, filter, sök och owned exclusion. Båda PASS i Actions #43451976845; Node/foundation, original SHA/asset audit och strict build PASS.

**Kvarstående bred testgate:** npm test kördes separat och hade 64 FAIL / 1456 p.g.a. bl.a. historiskt fastlåsta 3.7 59/60 roster-assertions/rapporter. Detta är inte FULL PASS; korrigera historiska testspecifika invariants separat, inte via fabricerade DPS-värden. Privat native DPS, ägarens hostade konto och Windows live inte verifierat. PR fortfarande Draft, ingen merge/deploy.

---

## Historisk pre-import-analys (ersatt av statusen ovan)

Texten nedan beskriver nuläget vid gamla bas-sha cb2b07311602caf54757d26d3bca4cafeac2c646 och är endast bevarad som historisk motivering.

# Character Import Pipeline — Draft PR #365

## One entrypoint (safe, repeatable)

`npm run import:character -- lily` prints an ID-scoped coverage report.
`npm run import:character -- lily --capture-source` fetches pinned **original 3.8 game-client data + verified structured translations**, checks immutable Git blob IDs, confirms role/rarity/element/weapon/Lv1, 8 permanent stat nodes and six chains, and stages Skills/Sequence/candidate art paths in research. It does **not** fill canonical stats or pretend combat engine support. The same command works for Suoming. New patches need one pinned source profile and reviewed canonical role-ID mapping, not handwritten Skills.
`npm run import:character -- hsin --json --output artifacts/character-import/hsin.json` returns machine-readable evidence.
`npm run import:character -- <id> --integrate --verify` regenerates existing presentation artifacts and runs Node, foundation and strict build only **after** verified raw identity, Lv90, Forte, six Sequences and source-bound Builder assets have landed in their existing owners. On missing source fields it fails closed and does **not** integrate, invent numbers or mutate AccountStore.

Exit 3 means Character Usable remains Pending, even if the report was generated successfully. The `--verify` option executes Node/foundation/build gates; browser and private native gates are independent. No deployment or merge.

**This is a structured-source capture + integration/audit runner, not an HTML scraper or automatic authority for canonical promotion.** New structured upstream data must first go through existing factory evidence, reconciliation, source-validity review and reviewed canonical raw/asset/kit ingestion. Identity/release evidence can be recorded in `data/research/character-import/<id>.json` but is explicitly *noncanonical*. The CLI reads it; it does not rewrite gameplay records from a guide.

## Captured original 3.8 evidence

The release-source data was **actually staged for review**, not promoted into the 59 canonical released roster:

- `data/research/character-import/lily-captured.json`: role 1512; verified Lv1 stats, original Lv90 growth and Max Energy field, 17 Forte nodes (8 intrinsic), 9 source Skills/level curves, 6 Sequences, reviewed original image paths.
- `data/research/character-import/suoming-captured.json`: role 1312; corresponding original raw data, full source Skills/Sequences and art paths; source presence does not make `CONFIRMED_UPCOMING` become `RELEASED`.
- `data/research/character-import/source-pins/3.8.json`: immutable Arikatsu 3.8 and DommyMM Wuwabuild commit/blob mapping. This is original structured source, **not** manually copied guide prose. Git blob hashes must match.
- A pinned original art path **does not constitute imported asset bytes** or reviewed presentation. Neither Character is playable through this staging.
- Dedicated nondeploy `Character Import Pipeline Review` GitHub Actions covers source provenance, no duplicates/regressed 59, CLI Pending contracts, strict build, and actual Chrome negative/legacy Character verification. **It does not substitute positive Lily/Hsin/Suoming account acceptance.**

## Source-of-truth and consumers

| Source or derived artifact | Ownership and gate |
|---|---|
| `src/data/characters.ts`, `src/data/characterIntrinsicStats.ts` | One canonical Character ID, source provenance, released state, Lv90 HP/ATK/DEF, **actual Max Energy**, base stats and permanent nodes; absence is null, never 0. |
| `data/factory/character-truth/`, `data/source/character-release-3.7.json`, `src/data/characterMechanics/` | Existing provider evidence, reviewed structured original skills/damage curves and mechanics. *RAW_ONLY* does not prove executable DPS. |
| `data/source/character-forte-ui.json`, `data/source/character-sequence-ui.json` | Original skill-tree and six Sequences, not inferred from general guides. |
| `docs/ui-prototypes/assets/builder-icons/manifest.json`, `docs/ui-prototypes/assets/characters/{portraits,hero-art}/manifest.json` | Source ID → pinned asset mapping → copied art/icon → reviewed presentation. Never use another Character's art. |
| `scripts/export-ui-{build-stats,character-builder,skills,character-hero-art}-runtime.ts` | Existing Build/Skills/Sequence/Hero Art generators; run from `--integrate` after source gates. |
| `docs/ui-lab/tools/export-catalog.mjs`, `scripts/export-character-database.ts` | Existing UI and Inventory catalog projections; re-export instead of adding a Character database. |
| `src/characterRecommendations.mjs`, `src/improveProductEchoDefaults.mjs`, `src/data/profileCatalogs.ts` | Source-backed Weapons/Echoes/Improve/Team refs; missing guide or Calc means Pending, not guessed defaults. |
| `src/inventoryAccount.mjs`, `src/inventoryAccountStore.mjs` | Canonical owned Character and physical item IDs; never generate a parallel AccountStore. |
| `src/data/characterPreflight.ts` + private native provider | Public preflight distinguishes fact/profile/model presence. **DPS Ready additionally requires private native, source-valid mechanics and real parity**, which this CLI never grants. |

## Two readiness gates

**Character Usable** requires a unique released canonical Character with reviewed core stats, source assets, Skills/Forte/Sequences, Build Stats, portrait and Hero Art, Build selector, source-backed weapon/Echo guidance, usable Improve configuration, *and a real Chromium + AccountStore/Inventory/Build/Improve roundtrip*. The static report intentionally remains `PENDING` without the live proof.

**DPS Ready** requires a separate private/native execution approval with legal damage/resource/buff/rotation timing, provider status and parity checks. **A source kit, target profile, DPS chart or green public build cannot grant it.** The command reports `PENDING` for DPS regardless of public preflight.

## Proof-of-concept review — 2026-11-13 (head df127ad3 before integration)

| Character | What exists | What stops Character Usable | DPS |
|---|---|---|---|
| **Lily**, canonical `lily` | Kuro 3.8 officially released 2026-11-12, 5★ Spectro/Pistols; original-release projection exists. Source-only intake pinned in `data/research/character-import/lily.json`. | No canonical raw Character row, reviewed game-facing Lv90 rounding/reconciliation, production Skills/Sequences projection, imported portraits/hero assets and recommendations. Pinned 3.8 original role 1512 / Lv1 / tree / six chains are now available in repeatable source capture. No fake release-row promotion. | Pending |
| **Hsin**, `hsin` | RELEASED raw 5★ Electro/Rectifier with reviewed Lv90 & permanent nodes, original 3.7 source-kit facts, release-order date, source-mapped portrait and guide-based Improve. Existing Add Character identity fields are populated. | Separate Builder icon manifest explicitly excludes Hsin. Forte/Sequence/Build Stats presentation source/projection remain Pending, Hero Art not READY. `Details pending` in preview is skill-detail fallback, not necessarily Add Character button disable; verify exact click failure in Chromium. | Pending |
| **Suoming**, `suoming` | Canonical 5★ Electro/Sword **CONFIRMED_UPCOMING** partial raw, October 22 release-order projection and an old portrait mapping. Official 3.7 phase-II release was October 22. | Canonical status now stale; Lv90 fields null and production presentation/kit/asset sources missing, although pinned 3.8 original role 1312 data can be captured without guessing. Do not mark RELEASED on calendar alone or replace nulls with 3.7 assumptions. | Pending |

**Important:** This change implements automated coverage, fail-closed source gating, derived projection integration and Node/foundation/build orchestration. It **does not** complete first-import data source review, source art acquisition, live Chromium acceptance or private DPS modeling. The 59 existing RELEASED Characters stay unchanged; never reinterpret V9.15 as the current architecture.

### Required acceptance after a source-complete import

Run `npm run import:character -- <id> --integrate --verify`, the existing release/presentation/source audits, Node test suite, strict build, CI FAST and relevant FULL, then Chrome: newest 5★ first, Add Character, save/reload one Current build and its physical equipped items, Inventory export/import and cross-tab persistence, Improve valid source configuration or explicit Pending, and Teams references. Check the previous 59 identities and no duplicate IDs. CI and browser results must be reported against exact head, never assumed from static coverage. No merge/deployment without separate approval.
