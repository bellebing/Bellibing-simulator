# Character Import Pipeline — Draft PR #365

## One entrypoint (safe, repeatable)

`npm run import:character -- lily` prints an ID-scoped coverage report.
`npm run import:character -- hsin --json --output artifacts/character-import/hsin.json` returns machine-readable evidence.
`npm run import:character -- <id> --integrate --verify` regenerates existing presentation artifacts and runs Node, foundation and strict build only **after** verified raw identity, Lv90, Forte, six Sequences and source-bound Builder assets have landed in their existing owners. On missing source fields it fails closed and does **not** integrate, invent numbers or mutate AccountStore.

Exit 3 means Character Usable remains Pending, even if the report was generated successfully. The `--verify` option executes Node/foundation/build gates; browser and private native gates are independent. No deployment or merge.

**This is an integration/audit runner, not an auto-scraper or an automatic authority for canonical promotion.** New structured upstream data must first go through existing factory evidence, reconciliation, source-validity review and reviewed canonical raw/asset/kit ingestion. Identity/release evidence can be recorded in `data/research/character-import/<id>.json` but is explicitly *noncanonical*. The CLI reads it; it does not rewrite gameplay records from a guide.

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
| **Lily**, canonical `lily` | Kuro 3.8 officially released 2026-11-12, 5★ Spectro/Pistols; original-release projection exists. Source-only intake pinned in `data/research/character-import/lily.json`. | No canonical raw Character row, verified complete Lv90 / Max Energy and permanent nodes, original reviewed skill/sequence artifacts, official-mapped portraits/hero art and recommendations. No fake release-row promotion. | Pending |
| **Hsin**, `hsin` | RELEASED raw 5★ Electro/Rectifier with reviewed Lv90 & permanent nodes, original 3.7 source-kit facts, release-order date, source-mapped portrait and guide-based Improve. Existing Add Character identity fields are populated. | Separate Builder icon manifest explicitly excludes Hsin. Forte/Sequence/Build Stats presentation source/projection remain Pending, Hero Art not READY. `Details pending` in preview is skill-detail fallback, not necessarily Add Character button disable; verify exact click failure in Chromium. | Pending |
| **Suoming**, `suoming` | Canonical 5★ Electro/Sword **CONFIRMED_UPCOMING** partial raw, October 22 release-order projection and an old portrait mapping. Official 3.7 phase-II release was October 22. | Canonical status now stale; Lv90 fields null and released presentation/kit/asset sources missing. Do not mark RELEASED on calendar alone or replace nulls with 3.7 assumptions. | Pending |

**Important:** This change implements automated coverage, fail-closed source gating, derived projection integration and Node/foundation/build orchestration. It **does not** complete first-import data source review, source art acquisition, live Chromium acceptance or private DPS modeling. The 59 existing RELEASED Characters stay unchanged; never reinterpret V9.15 as the current architecture.

### Required acceptance after a source-complete import

Run `npm run import:character -- <id> --integrate --verify`, the existing release/presentation/source audits, Node test suite, strict build, CI FAST and relevant FULL, then Chrome: newest 5★ first, Add Character, save/reload one Current build and its physical equipped items, Inventory export/import and cross-tab persistence, Improve valid source configuration or explicit Pending, and Teams references. Check the previous 59 identities and no duplicate IDs. CI and browser results must be reported against exact head, never assumed from static coverage. No merge/deployment without separate approval.
