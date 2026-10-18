# Character Carousel — in-flow expansion

The approved center-focused revision remains recoverable at `6400eecef41abe963cc997449164e3f9dd7d87bb`. Artwork, depth hierarchy, centered information and the continuous movement model are preserved. V1 remains byte-identical.

## Layout and interaction

The compact portraits live in the existing page-heading area. The heading shares the actual workspace grid columns and gap, keeping the portrait collection centered on Echo Workshop as side panels adapt. Its zero-height grid host contributes no row space: collapsed Settings, Workshop and Character Card retain their approved top edge and dimensions.

The expanded gallery lives in the central column immediately above Workshop. The normal-flow component animates from 0px to 482px (470px gallery plus 12px separation). It hides/makes the compact presentation inert, pushes Workshop and Trash Piles downward and leaves side panels independent. Collapse restores the original panel alignment. No absolute page anchor, compensating panel offsets or nested scrolling are used.

Only circular portraits are visible when collapsed. The actual selected Character remains centered with its gold ring, including when filters exclude it from the expanded gallery. Preview focus belongs to the expanded wheel. Click/tap a portrait to expand; the keyboard entry point transfers focus into the gallery. A small existing-style chevron, Escape, outside click or leaving the component collapses it and restores compact access. Reduced motion disables growth/scale transitions.

Collection controls occupy the gallery's upper-right area. Element controls are separate on the left: six verified builder-icon assets, each with an accessible name and native tooltip, plus All Elements. Both groups reuse the existing gold segmented-control styling. Working-on status, permanent input instructions and demonstration counters are removed from the visible gallery; keyboard descriptions and live announcements remain accessible.

The wheel retains continuous catalog movement and one fixed center for artwork/name/Weapon/stat previews, including endpoints. Artwork scales are unchanged. Spacing now accumulates neighboring scaled figure widths, with moderate immediate overlap, diminishing overlap farther out and at most a small outer gap. This keeps the collection connected without hiding neighbors. `carousel-layout.js` owns only this presentation geometry.

- Drag/swipe horizontally with an 8px intent threshold. Vertical touch remains page scrolling. Pointer capture, smoothed velocity, bounded projection and magnetic snapping preserve the approved movement. Cancelled gestures have no fling; drag-generated clicks cannot select.
- Click a neighbor to center it; click the settled center to select. Hover never moves focus. Gold selection markers and Working on identify the actual build independently of the preview.
- Left/Right and Home/End browse; Enter/Space on the wheel selects; Escape collapses. Horizontal trackpad input and Shift+wheel browse. Reduced motion retains direct manipulation and snaps without momentum.
- Collection and Element are independent filters inside the expanded gallery. Their intersection uses the existing canonical `catalog.js` element values; unknown elements are not inferred. Account membership remains the six illustrative fixture identities. Filtering preserves a matching preview when possible, otherwise uses a matching selection or first result, and never selects a build.
- Empty intersections show an explicit empty state with no selectable artwork or fabricated information. The compact state always retains the selected portrait; filters persist when reopened.

## Source and boundaries

`v1.1/modules/carousel.js` owns rendering/input/filtering. `carousel-motion.js` owns bounded presentation position and settling. Production `FreewheelCarousel` supplied interaction ideas only; no production code/state/layout is changed or imported. Existing Lab state, Workshop, feedback, Echo Cards, Character comparison, Settings and Trash Piles keep their current owners.

## Verification

`tools/review-carousel.mjs` exercises physical mouse/CDP touch, momentum and snapping, no hover fisheye, neighbor versus center activation, endpoints, all collection/element combinations including empty results, keyboard and reduced motion. It checks fixed centers, selected/preview separation, icon labels/tooltips, compact top-edge alignment, connected artwork spacing, hidden compact state, real 482px document displacement, unchanged side panels, collapse restoration and no horizontal overflow at 1440/1920/2560px. Existing Workshop/feedback/history regression checks remain in `verify-browser.mjs`.

The default review generates no screenshots, MP4 or downloadable bundles. CI tests the exact source head without deploying it. The PR links the immutable GitHack source URL; external availability must be distinguished from local Chromium evidence. Optional portable packaging/testing tools remain available for maintainers (`UI_LAB_PORTABLE_REVIEW=true`) but are not part of the current review deliverables.
