# Inventory, Hero & Teams — interactive design proposal

**For owner visual review. Not approved product UI or a production Inventory.**
One connected concept under Issue [#352](https://github.com/bellebing/Bellibing-simulator/issues/352), based on public main. No existing page, account schema, Improve integration, private engine, scanner, team store or DPS implementation is changed.

## Try it

**Portable delivery: download [preview.html](preview.html) as a file and open it in a desktop browser.** It embeds all styles, scripts and selected assets. `index.html` is the multi-file development source and must be served with its neighboring files; downloading that source alone is not the standalone delivery.

```sh
CONCEPT_PORT=4179 node docs/ui-lab/inventory-concept/serve.mjs
```

Open **http://127.0.0.1:4179**. Start with Home or open `/#inventory`, `/#build` or `/#teams` directly. `CONCEPT_PORT` can select another free local port.

The [Hero & Team design notes](HERO_TEAM_DESIGN.md) explain the unchanged functional cards and Team/Endgame interactions.
**Current Hero review: [six selected elemental still backgrounds](SELECTED_STILL_BACKGROUNDS.md).** Electro opens first; choose Fusion, Glacio, Electro, Aero, Spectro or Havoc, then Background / Character / Cards. The complete image frame is preserved. The existing authentic partial Character art is retained; no finished full-body ground contact is implied. Selected images are strictly static, with no depth renderer or animation controls. Earlier element studies, the previous Electro Hero and rejected coastal/meadow proposals remain available under Earlier references.
A portable offline HTML can also be produced with `node docs/ui-lab/inventory-concept/package-preview.mjs /path/to/review.html`; it embeds public catalogs, the selected existing reviewed Character art, CSS and the memory-only concept. Open the output directly in a desktop browser.

The local server exposes only allowlisted concept files, two public canonical catalogs and the explicitly selected existing Character assets; other repository paths return 404. No build/install is needed.

- Inventory → select the partial +10 Tempest Mephis → Equip to Character → choose Character/slot → Equip. The replaced Echo stays in Inventory.
- Select Jiyan's Impermanence Heron → Equip to Augusta → Cancel or explicitly Move & equip. A move empties Jiyan's slot rather than creating a copy.
- Select the +0 Tempest stack → equip one copy → Unequip. Stack count decreases/increases by exactly one.
- Weapons → choose a copy → Equip. Two Verdant Summit copies are distinct owned items, despite identical catalog identity.
- Build → select a slot → choose in Inventory → return using the Character/slot breadcrumb. Search/category/selection survive ordinary navigation.
- Build → Add Character → Manual entry. Scanner is a clearly marked planned connection, with no fake OCR.
- Footer → Try empty inventory → Add your first Echo/Weapon. Echo manual entry uses actual canonical stat names and discrete values. All changes are demo-only.
- Build → compare the six selected still backgrounds with Background / Character / Cards, or open Earlier references; expand Skills without covering the Character; select an Echo to edit in the existing inline Workspace.
- Teams → My Teams / Endgame; sort demo Team DPS, inspect equipment, assign/reorder teams and rounds, review example conflicts and source-pending rules.
- Resources expands inline. `?` explains the planned help placement; no animated guide is implemented.

All demo equipment, ownership, levels, Sequence and resource counts are synthetic. State is memory-only and resets on reload. This is not a backup tool, live-game image review or production-compatible account format.

## Recommended information architecture

**Workspaces in the main navigation; possessions in one recurring Inventory entry at the upper right.** Home retains the three approved cards in their existing order, with Improve emphasized. Inventory is visible from every concept workspace. Echo Sandbox remains a separate optional workspace, not an owned collection.

| Considered | Decision |
| --- | --- |
| Add Inventory as a fourth Home card | Reject: mixes an ownership tool with the three primary player journeys and changes the Home contract. |
| Full permanent sidebar for every category | Reject: competes with local controls and consumes the work surface. |
| Recurring Inventory button + local categories | **Recommended:** one recognizable collection entry, stable workspace navigation and more room for items. |

Inventory has **Echoes / Weapons**, each with search, All / Unequipped / Equipped filters and a stable grid beside one inspector. Echoes also expose +0 stacks. Resources are one compact expandable strip, not another competing tab. Characters remain in **Build** with an owned roster and an explicit Add action. Build's contextual chooser opens the same Inventory, rather than a second item list or nested modal.

The grid does not move when another item is inspected. Selection is an outlined card; ownership is an explicit Character marker. The inspector shows item identity, Cost/rank/level, Sonata, canonical Main/secondary stats, observed rolls and owner. Only an explicit Equip/Move changes demo assignment. Unequip keeps the item. The inline assignment panel reduces artwork/detail height while open, keeping its action reachable at 1440×900.

Improve and Sandbox remain navigation previews only. Team/Endgame now have interactive presentation fixtures, explicitly without a calculator or optimizer. Future saved teams reference Characters and their owned equipment. Sandbox never silently creates owned items. No alternative technical settings, fabricated scores or competing item owners are introduced.

## Research basis — 2026-10-28, Europe/Stockholm

- [Official Wuthering Waves 3.7 patch notes](https://wutheringwaves.kurogames.com/en/main/news/detail/5571): unequipped, unupgraded Echoes stack by Echo type, Sonata and Main Stat, with a 999 limit. The notes also describe lock/discard merge priority. Upgraded/equipped items must remain individually identifiable. The concept demonstrates ordinary stacks, not flag merging or destructive overflow handling. Bellibing must never silently delete imported overflow or metadata merely to mimic the game.
- [3.7 preview frame references](https://www.wuwabuild.com/news/wuthering-waves-3-7-update), 7:50/8:05: team management and Echo stack changes. Linked optimized research images could not be downloaded in this environment; current stack behavior is grounded in the official notes, not inferred from unavailable pixels.
- [Earlier 3.3 interface imagery](https://www.ldshop.gg/blog/wuthering-waves/3-3-new-ui-design.html): the Echo equipment image was inspected as a **dated visual reference**, not current mechanics evidence. Reusable observations: persistent equipment context, recognizable item imagery, selected grid entry and a spatially separate explicit Equip action. No screenshot is copied into this concept.
- [YouTube's You navigation](https://support.google.com/youtube/answer/9209643?co=GENIE.Platform%3DDesktop&hl=en): account/collection access and history are consistently grouped. Bellibing borrows that orientation principle, not YouTube's page composition or menus.
- Internal authorities: [UI/UX semantics](../../UI_UX_STATUS.md), [layout/motion](../../UI_LAYOUT_MOTION_CONTRACT.md), [v34 reference](../../UI_BUILD_HANDOFF_V34.md), [typography](../../UI_TYPOGRAPHY.md), [Development Process v2](../../DEVELOPMENT_PROCESS.md). Accepted Improve/Sandbox cards, dark surfaces, restrained gold, inline expansion and explicit ownership inform the concept; its DOM/layout is new and isolated.
- Current public main and paired Improve candidate were inspected separately. GitHub confirmed private #45 merged while public #360 remains an unmerged independent candidate. Neither is changed here. AI Handoff was read as product context; its earlier private-unmerged checkpoint is historical. The staged [Product Journey Roadmap](https://github.com/bellebing/Bellibing-simulator/blob/docs/master-journey-roadmap-20261021/docs/PRODUCT_JOURNEY_ROADMAP.md) informs the journey; this task authorizes concept review only.

## Assets and visual qualification

Inventory item illustrations/icons remain original SVG geometry, marked Concept illustration. The new Hero/Team views reuse selected existing reviewed Character cutouts/portraits, unchanged and with retained source attribution. They follow the existing fan-companion preview convention, not a blanket game-art license; see the asset boundary in [Hero & Team notes](HERO_TEAM_DESIGN.md). The selected environment series adds owner-directed image-generation edits based on an owner-supplied Wuthering Waves login screenshot, credited to Kuro Games; original selected PNGs and lossless preview derivatives are recorded in [the still-image manifest](selected-stills/manifest.json). Raw owner screenshots/recordings and private Drive links are not bundled. No new font binary is fetched. Public catalog facts are reused; all account/build/DPS/score examples remain synthetic.

The CSS retains the required `Etna, Inter, system-ui` family order, but makes no external font request. ETNA availability/clearance and final production asset rights/framing remain **visual approval dependencies**; the system-font fallback is not claimed to be pixel-parity with the accepted ETNA baseline. Final recognition/cropping must be reviewed with cleared art. The current review can approve navigation, hierarchy and interaction separately.

## Data dependencies before production — proposal, not migration

The current v34 owner stores owned Character membership and per-Character `drafts[name].build.echoSets`; the read-only production projection does not establish stable global item IDs, active-build revision identity or a physical Inventory. `resource-inventory.js` owns resource quantities, not physical Echo instances. Existing run exports are not account backups. These are actual implementation boundaries, not defects repaired by this mock.

| Proposed owner | Necessary invariant |
| --- | --- |
| Physical Echo instance | Stable unique ID separate from catalog ID; rank, selected Sonata, Main Stat, exact partial +5…+25 observations, provenance and revision. Two same-type Echoes can differ. |
| Eligible +0 stack | Explicit stack identity, quantity and reviewed equivalence key. Materialize one instance on equip/upgrade; conserve quantity. Preserve rank/provenance/flags without lossy aggregation. Source/rarity/flag equivalence requires explicit validation before broader merging. |
| Physical Weapon | Distinct instance ID, catalog ID, actual level/refinement and provenance. Same named Weapons are not one object. |
| Character / active Build | Canonical Character ID and exactly five nullable Echo-instance references plus Weapon reference. Moving an instance clears the former active assignment atomically; unequipping never deletes it. Validate total Cost, unique type, Main/Sonata legality and Weapon compatibility with canonical rules. |
| Saved Build preset / Team | References to owned instances and Characters, not copied equipment. A saved plan is distinct from active equipment; future activation resolves conflicts explicitly. |
| Resource owner | One authoritative inventory of actual amounts. Simulator Unlimited preferences and statistical receipts are not owned stock or proof of acquired Echoes. |
| Versioned JSON backup | Reviewed format/schema/source versions, export timestamp, canonical IDs, stable instances/stacks, assignments, exact observations and optional resources. No raw localStorage dump or session secrets. |
| Import/migration transaction | Size/schema/source validation, duplicate/conflict preview, explicit merge/replace, recoverable backup, atomic commit and cancellation. Unknown future schemas/ambiguous ownership fail closed; no template or Candidate becomes owned automatically. |

The small in-memory demo model illustrates references and quantity conservation only. It is not the future canonical database/validator, production backup schema or safe migration. Real migration must preserve existing drafts, gear, Sequence/Forte, resources and unrelated fields, prove export→restore equivalence and maintain current consumer compatibility before any production write is introduced.

## Review gate

Approve or adjust: recurring Inventory placement; Echoes/Weapons categories and inline Resources; grid/inspector hierarchy; explicit move/replace behavior; Build↔Inventory continuity; Character registration entry; empty-state next actions; and later cleared art/ETNA rendering.

Future optional `?` help may dim the background and animate a gold outline around `[data-guide-anchor]` actions while leaving the real page interactive. It must never auto-start and must dismiss immediately. Only the compatibility/placement is reserved here, not a guide engine.

Run the focused browser review using an already installed Playwright module:

```sh
CONCEPT_REVIEW_URL=http://127.0.0.1:4179 PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node docs/ui-lab/inventory-concept/review.mjs
```

The script exercises the actual concept with synthetic account/resource sentinels and writes screenshots plus `review.json` under `/tmp/bellibing-inventory-concept-review`. It is concept REVIEW evidence, not FULL, hosted, production or private-engine acceptance. No broad build/test/CI run is requested. Stop for owner visual approval before production implementation.

Historical cinematic vista evidence: [source/artifact identities](vista-review/identity.json), [A/B browser checks](vista-review/review.json), [Inventory behavior](vista-review/inventory-review.json). Actual 1440×900 captures include [A with cards](vista-review/coast-cards-1440.jpg), [B with cards](vista-review/terrace-cards-1440.jpg), [A background](vista-review/coast-background-1440.jpg) and [B background](vista-review/terrace-background-1440.jpg); the [vista notes](CINEMATIC_HERO_VISTA.md) link placement/motion/reuse/fallback and wider captures. Earlier review folders remain revision-specific historical evidence.

The exact portable file is exercised through local HTTP then offline; native file launching is not certified in managed Chromium. Download **preview.html**, rather than index.html alone, and open it in an ordinary desktop browser. Current selected-image integration awaits UI visual review; image selection alone is not UI acceptance. No FULL, production migration, gameplay qualification, merge or deployment is claimed.
