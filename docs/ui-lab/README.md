# Bellibing UI Lab — V1.1 review environment

An isolated, interactive visual prototype. This is not the production Improve page, an evaluator, or a replacement simulator. The production build/deployment does not include this directory.

## Open the review

**No-install portable preview:** download the `bellibing-ui-lab-v1-1-<head SHA>` artifact from this PR's **UI Lab Review** Actions run, extract it, and double-click `Bellibing-UI-Lab-V1.1.html` in Chrome, Edge or Firefox. No server, account, installation or internet connection is required. Scripts, styles, artwork and the existing approved temporary review font are embedded. `OPEN-REVIEW.txt`, `review-manifest.json`, screenshots and `verification.json` travel with it. Actions artifacts are retained for 90 days; the source remains in Git, and a new run can reproduce the review.

The HTML is a generated **review artifact**, not the maintained implementation. Its source revision, dirty-tree status, source-file hashes and artifact hash are recorded in the manifest. Only clean-head artifacts are uploaded by CI. The external font oracle is embedded only in the downloadable review artifact; no font binary or new license clearance is added to repository/production assets.

**Repository source:** from the repository root:

```sh
python3 -m http.server 4180 --bind 127.0.0.1
```

Open `http://127.0.0.1:4180/docs/ui-lab/v1.1/`. `?settings=expanded` opens Settings, and `?compact=true` compacts both side panels. The ordinary source page uses the same approved external ETNA stylesheet as V1. The portable artifact works offline.

The existing project documents GitHack immutable source previews. Use only an exact PR-head URL, with the explicit `index.html` path, and only claim availability after verifying the HTML, modules and artwork. Localhost in an agent environment is not an externally accessible preview. No new hosting service, GitHub Pages configuration or production deployment is introduced here. The portable artifact is the supported fallback when the external source-preview method cannot be verified.

## What to try

- Hover a circular portrait: the whole visible gallery expands, and hover/focus only previews. The gold ring remains on the selected Character.
- Click a portrait/artwork, or press Enter: select that Character in the actual Lab workspace. Name/art, illustrative stats, equipment, candidates, Trash Piles, Gate, minimum sliders and selected Echo slot update together.
- Switch **Account Characters / All Characters**. Membership is a six-Character illustrative account, not the user's game account or production storage. All Characters contains all 59 reviewed released identities. Arrow buttons page the visible nine; Left/Right, Home/End and Enter support keyboard browsing. Escape, clicking outside, or the close control collapses the gallery. Touch uses a first tap to preview and a second tap to select.
- Switch to Iuno, select another Echo slot or Gate, switch to Augusta, then return. Each Character keeps its own in-memory demonstration choices. Hovering catalog entries never creates a build; catalog entries with no demo build have empty equipment/dashes, not fabricated stats.
- Expand/collapse either side panel. At limited desktop width, the panel being opened takes priority while the Workshop retains its useful width. Carousel opening and selection never resize or push the Workshop.
- Select **1 Slot / Full Set** using the compact segmented control. This remembers a per-Character scope choice without running a simulation or changing any results.
- Click any of the five Echo slots: the larger Current/New pair follows the selected slot.
- Lift a Trash Pile card, browse previous/next historical cards, and close/Escape to return it. Working Echoes and Character stats stay unchanged during inspection. Muted red **DISCARDED**, the observed stopping level, and explicit **Not rolled** rows distinguish discarded progression from missing information.
- Open **Demonstration** to exercise Ready, Sonata warning, Cost blocker, recorded-run and pending-combination scenarios. Warning/error review fixtures are provided for Augusta. URL equivalents and canonical boundaries are documented in [Workshop feedback](FEEDBACK.md). **How to Fix** opens a small explanation and temporarily highlights the supplied affected slots; Close, Escape, outside click or changing context clears them.
- Adjust minimum sliders or Gate; reorder Flex rows with drag or Alt+Up/Down. Choices are demonstration input only. Reset restores only the selected Character's demo fixture.

The gallery uses real approved Character artwork where available. Six catalog identities have no ready Hero Art runtime asset; their existing portrait is used with explicit Hero Art Pending feedback rather than inventing artwork.

## Demonstration boundaries

The preserved Augusta composition and values come from approved V1. Other example account builds and previews are explicitly illustrative. Catalog identity/art comes from existing reviewed presentation manifests; no Character rules, quality score, bonus activation, damage calculation, roll algorithm or evaluator is added.

**Current** and top navigation show an explicit not-connected/demo notice. **SIMULATE** exposes a static illustrative run record and recorded materials; it does not run a simulation, change equipment, spend resources or calculate Character results. A supplied blocking-error fixture disables the action. This does not establish a production rolling restriction: canonical Cost validation applies to equipping, while mixed over-Cost rolling batches remain legal. Warning feedback does not block it. **1 Slot / Full Set** only selects a demonstration scope. Materials Used appears only after a supplied run record, retains that record through later invalid configurations, and displays the original recorded quantities; explicit zero-use rows are omitted and unavailable records remain unknown. Static Current/New figures are declared fixtures, not calculated deltas. Resources are displayed as fixture context; resource spending/editing is not implemented. There is no Activate/Deactivate or Sonata-bonus feature in this iteration.

The module-local demo store is discarded on reload. There are no localStorage, IndexedDB, cookies, account APIs or production source-module imports. Selecting a catalog Character creates only an empty memory-only Lab state. `Account Characters` follows the production distinction between Add to Account and a draft, but it uses the Lab fixture list, never the real membership reader.

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
| `v1.1/modules/catalog.js` | Generated released identity/art-only catalog; no live data fetch. |
| `v1.1/modules/lab-state.js` | Explicit fixtures and isolated per-Character memory state. |
| `v1.1/modules/echo-card.js` | Shared working/slot/discarded/inspection Echo-card renderer. |
| `v1.1/modules/carousel.js` | Connected gallery, preview/selection, paging, filtering and keyboard/touch interaction. |
| `v1.1/modules/app.js` | Workspace views and interaction binding. |
| `tools/` | Catalog parity, focused boundary tests, Chromium review and portable packaging. |
| `.github/workflows/ui-lab-review.yml` | Exact-head downloadable review artifact; no deploy step. |

Existing artwork is reused from `v1/assets/` and `../ui-prototypes/assets/characters/`. Asset provenance and production font-licensing boundaries remain owned by the existing repository contracts. No owner reference screenshots are shipped as product UI or used to simulate interactive controls.

## Verification and rebuilding artifacts

Node 22+, curl, an installed Chromium/Chrome and Playwright are needed for maintainers to rebuild/test (not for opening the downloaded preview). CI pins the browser driver without changing dependency manifests.

```sh
node --test docs/ui-lab/tools/state.test.mjs
node docs/ui-lab/tools/export-catalog.mjs --check
node docs/ui-lab/tools/build-review.mjs --require-clean
UI_LAB_CHROME_PATH=/usr/bin/google-chrome node docs/ui-lab/tools/verify-browser.mjs
```

Output is under ignored `artifacts/ui-lab-review/`. An optional `--font /absolute/path/to/the-approved-review.woff2` lets packaging reuse an already fetched exact oracle; otherwise it fetches the documented approved URL into temporary storage. The portable classic-script bundle is generated from maintained ESM modules, so opening it requires neither a module server nor a build tool.

Before/after screenshots are generated against the recoverable approved V1.1 revision `00c8532eaa88fd70ee5ed94b43ec582122a97807` (approved typography refinement). The original V1.1 remains recoverable at `46691a0`. If your checkout is shallow, first run `git fetch --depth=1 origin 00c8532eaa88fd70ee5ed94b43ec582122a97807`; CI fetches it explicitly. The V1 files remain immutable.

The browser review exercises Ready/Warning/Error/recorded-material scenarios, source and portable How to Fix, temporary highlights, native-popover keyboard/outside dismissal, action permissions, preserved spending, no automatic fixes, the shared selection gradients and Secondary Stat hierarchy. It also exercises source at 1440×900, 1920×1080 and 2560×1440, V1 composition geometry, hover versus selection, all 59 catalog entries, Account/All filtering, per-Character isolation, side panels, slot selection, discarded/older-card inspection, physical pointer input, ordinary/reduced motion and touch-pointer selection. The portable artifact is imported as an opaque-origin document with networking disabled at all three widths; it must produce zero HTTP requests and retain interactive Character/history behavior. This executor's browser file-URL policy can block direct `file://` navigation; opaque-origin/offline import tests the same embedded code/styles/art without a local server or file privileges. The test records its exact source revision and limitations, rather than claiming a hosted preview.

This is a Draft visual-review lane. FULL/merge readiness and production integration are outside this task. Do not merge or alter the production deployment to make the Lab reviewable.
