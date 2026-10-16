# Bellibing UI Lab — V1.1 review environment

An isolated, interactive visual prototype. This is not the production Improve page, an evaluator, or a replacement simulator. The production build/deployment does not include this directory.

## Open the review

Use the exact-commit GitHack `index.html` link in Draft PR #292. The current review process uses the working interface directly; CI does not generate screenshot collections, MP4 demonstrations or downloadable review bundles. GitHack availability can be restricted by an executor's outbound policy; local Chromium verification does not establish external availability.

**Repository source:** from the repository root:

```sh
python3 -m http.server 4180 --bind 127.0.0.1
```

Open `http://127.0.0.1:4180/docs/ui-lab/v1.1/`. `?settings=expanded` opens Settings, and `?compact=true` compacts both side panels. The ordinary source page uses the same approved external ETNA stylesheet as V1.

The existing project documents GitHack immutable source previews. Use only an exact PR-head URL, with the explicit `index.html` path, and only claim availability after verifying the HTML, modules and artwork. Localhost in an agent environment is not an externally accessible preview. No new hosting service, GitHub Pages configuration or production deployment is introduced here.

Hero alternatives are available at `?hero=elegant` and `?hero=cinematic`. Elegant Hero is the approved default; `?hero=baseline` retains the earlier presentation. [Artistic directions and scope](HERO_VARIATIONS.md).

See [Settings contract](SETTINGS.md) for the 13 canonical movable rows, explicit Flex count and optional ER Target.

## What to try

- Click/tap a circular portrait (or focus the selector and press Enter) to expand the same component. Artwork and lightweight preview information stay fixed at the center while the collection moves.
- Drag/swipe horizontally, release for controlled momentum and magnetic snapping. Click/tap a neighboring Character to center it; click/tap the settled center Character to select it in the actual Lab workspace. The gold ring and Working on label continue to identify the selected Character while browsing.
- **Account Characters / All Characters** filters the continuous wheel. All Characters contains all 59 reviewed released identities; there are no fixed nine-Character pages. Inside the expanded gallery, combine the upper-right collection controls with **All Elements** and six verified element-icon buttons (native tooltips/accessibility labels). Left/Right and Home/End browse; Enter selects the centered preview. Escape, outside click or close collapses the gallery. Reduced motion snaps immediately. [Interaction contract and production reference](CAROUSEL.md).
- Switch to Iuno, select another Echo slot or Gate, switch to Augusta, then return. Each Character keeps its own in-memory demonstration choices. Hovering catalog entries never creates a build; catalog entries with no demo build have empty equipment/dashes, not fabricated stats.
- Expand/collapse either side panel. At limited desktop width, the panel being opened takes priority while the Workshop retains its useful width. Collapsed portraits share the page heading and reserve no space above the three aligned panels. The expanded gallery occupies the central column, hides the compact portraits, and pushes Workshop/Trash Piles downward without resizing them or moving either side panel. Collapse restores their original top edge.
- Select **1 Slot / Full Set** using the compact segmented control. This remembers a per-Character scope choice without running a simulation or changing any results.
- Open **Skills** inside Character Card to reveal the verified Forte tree in normal flow. The card displays saved/current stats only; missing Sequence/skill investment stays unknown. [Character Card contract](CHARACTER_CARD.md).
- Click any of the five Echo slots: the larger Current/New pair follows the selected slot.
- Lift a Trash Pile card, browse previous/next historical cards, and close/Escape to return it. Working Echoes and Character stats stay unchanged during inspection. Muted red **DISCARDED**, the observed stopping level, and explicit **Not rolled** rows distinguish discarded progression from missing information.
- Open **Demonstration** to exercise Ready, Sonata warning, Cost blocker, recorded-run and pending-combination scenarios. Warning/error review fixtures are provided for Augusta. URL equivalents and canonical boundaries are documented in [Workshop feedback](FEEDBACK.md). **How to Fix** opens a small explanation and temporarily highlights the supplied affected slots; Close, Escape, outside click or changing context clears them.
- Adjust minimum sliders or Gate; reorder Flex rows with drag or Alt+Up/Down. Choices are demonstration input only. Reset restores only the selected Character's demo fixture.

The gallery uses real approved Character artwork where available. Six catalog identities have no ready Hero Art runtime asset; their existing portrait is used with explicit Hero Art Pending feedback rather than inventing artwork.

## Demonstration boundaries

The preserved Augusta composition and values come from approved V1. Other example account builds and previews are explicitly illustrative. Catalog identity/rarity comes from canonical Character/Weapon sources; art and Sequence/Forte topology come from existing reviewed presentation manifests; no Character rules, quality score, bonus activation, damage calculation, roll algorithm or evaluator is added.

**Current** and top navigation show an explicit not-connected/demo notice. **SIMULATE** exposes a static illustrative run record and recorded materials; it does not run a simulation, change equipment, spend resources or calculate Character results. A supplied blocking-error fixture disables the action. This does not establish a production rolling restriction: canonical Cost validation applies to equipping, while mixed over-Cost rolling batches remain legal. Warning feedback does not block it. **1 Slot / Full Set** only selects a demonstration scope. Materials Used appears only after a supplied run record, retains that record through later invalid configurations, and displays the original recorded quantities; explicit zero-use rows are omitted and unavailable records remain unknown. Static Current/New figures are declared fixtures, not calculated deltas. Resources are a shared, editable memory-only inventory using the canonical quantity validator. Echoes, Premium Tuners and all four Sealed Tube denominations accept whole counts or Unlimited. Inventory edits are independent of the illustrative Materials Used record; no spending is implemented. There is no Activate/Deactivate or Sonata-bonus feature in this iteration.

The module-local demo store is discarded on reload. There are no localStorage, IndexedDB, cookies, account APIs or simulator/persistence source-module imports. Resources reuse the existing pure browser-compatible inventory validator. Selecting a catalog Character creates only an empty memory-only Lab state. `Account Characters` follows the production distinction between Add to Account and a draft, but it uses the Lab fixture list, never the real membership reader.

## Source map and preserved design

| Path | Purpose |
| --- | --- |
| `v1/` | Byte-identical approved V1 source/artwork, preserved in a separate initial commit. `baseline.json` pins hashes. |
| `v1.1/index.html` | Actual standalone V1.1 page structure. |
| `v1.1/lab.css` | Approved carousel/discard additions; the unchanged base composition uses `v1/style.css`. |
| `v1.1/typography.css` | Lab-only shared type/card/segmented-control roles; hierarchy documented in `TYPOGRAPHY.md`. |
| `v1.1/feedback.css` | Contextual status, explanation popover, temporary highlights and composition summary. |
| `v1.1/modules/workshop-feedback.js` | Explicit feedback presenter; no validation or automatic fixes. |
| `v1.1/modules/feedback-fixtures.js` | Isolated review scenarios and recorded-material fixtures. |
| `v1.1/modules/sonata-summary.js` | Equipped assignment counts only; no active bonus claims. |
| `v1.1/modules/catalog.js` | Generated canonical identity/rarity and read-only presentation assets; no live data fetch. |
| `v1.1/modules/character-card.js` / `character-card.css` | Saved/current Character presentation, rarity/equipment, read-only Sequence and inline Skills. |
| `v1.1/modules/lab-state.js` | Explicit fixtures and isolated per-Character memory state. |
| `v1.1/modules/echo-card.js` | Shared working/slot/discarded/inspection Echo-card renderer. |
| `v1.1/modules/carousel.js` | Fixed-center gallery, independent preview/selection, continuous catalog, filtering and keyboard/touch input. |
| `v1.1/modules/carousel-layout.js` | Scale-aware artwork spacing; no movement or build state. |
| `v1.1/modules/carousel-motion.js` | Bounded presentation position, momentum and magnetic settling; no build state. |
| `v1.1/modules/app.js` | Workspace views and interaction binding. |
| `tools/` | Catalog parity, focused boundary tests, Chromium review and portable packaging. |
| `.github/workflows/ui-lab-review.yml` | Exact-head Chromium verification; no deploy or artifact-upload step. |

Existing artwork is reused from `v1/assets/` and `../ui-prototypes/assets/characters/`. Asset provenance and production font-licensing boundaries remain owned by the existing repository contracts. No owner reference screenshots are shipped as product UI or used to simulate interactive controls.

## Verification

Node 22+, installed Chromium/Chrome and Playwright are needed for maintainer checks. CI pins the browser driver without changing dependency manifests.

```sh
node --test docs/ui-lab/tools/state.test.mjs
node docs/ui-lab/tools/export-catalog.mjs --check
UI_LAB_CHROME_PATH=/usr/bin/google-chrome node docs/ui-lab/tools/verify-browser.mjs
```

The browser review covers 1440×900, 1920×1080 and 2560×1440, normal/reduced motion, physical mouse/touch, full catalog navigation, independent/combined filters, empty results, fixed center, layout displacement/restoration, per-Character isolation, side panels, Echo slots, feedback/material boundaries and discarded-card inspection. V1 dimensions and the approved primary action's dimensions/horizontal position remain checked; collapsed panel top edges and absolute Workshop position match the approved composition.

The comparison revision is `66d72f339e3c1aa363a1794ff243128d63bc3f28`; CI fetches it explicitly for approved geometry checks. V1 files remain immutable. The current center-focused design is recoverable at `6400eecef41abe963cc997449164e3f9dd7d87bb`.

Optional portable packaging remains in `tools/build-review.mjs`; `UI_LAB_PORTABLE_REVIEW=true` also tests a previously packaged file offline. Neither packaging nor media generation runs in the current review workflow. Results are written to ignored `artifacts/ui-lab-review/verification.json`, with exact revision and dirty-tree status.

This is a Draft visual-review lane. FULL/merge readiness and production integration are outside this task. Do not merge or alter the production deployment to make the Lab reviewable.

The approved Elegant Hero is now the default. [Simulation Stats](SIMULATION_STATS.md) documents the shared panel, result sources, illustrative focus demo and interaction contract.
