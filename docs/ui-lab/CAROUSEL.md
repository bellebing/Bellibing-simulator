# Character Carousel — in-flow expansion

The approved center-focused revision remains recoverable at `c79dbbd74aded4050b725220705e3006a071e13c`. Artwork, depth hierarchy, centered information and the continuous movement model are preserved. V1 remains byte-identical.

## Layout and interaction

The selector is the first child of the central column, immediately above Echo Workshop. The compact row and expanded gallery share one grid cell inside a component whose height grows from 70px to 470px. Both states are normal-flow grid items. There is no page-positioned anchor or overlay gallery. Workshop and Trash Piles move downward by 400px; their widths, dimensions and contents remain unchanged. The two side panels retain their independent layout. Overflow is clipped at the component, with no nested scrolling.

Only the centered circular portraits are visible when collapsed. Click/tap a portrait to expand and preview; the full-row expansion button provides a keyboard entry point. Expansion hides and makes the compact state inert, transfers keyboard focus into the gallery, and grows the same component. Escape, close, outside click or leaving the component collapses it. Focus returns to the compact entry point when appropriate. Reduced motion disables the growth/scale transitions.

The wheel has one continuous position across the active catalog, without fixed pages. Focused artwork, name, Weapon and stat preview remain at one horizontal center, including the first and last entries. Neighbor spacing is 172–190px according to available width; the existing scale, opacity, gradients and layered artwork remain. Narrower columns show fewer recognizable Characters instead of compressing the spacing.

- Drag/swipe horizontally with an 8px intent threshold. Vertical touch remains page scrolling. Pointer capture, smoothed velocity, bounded projection and magnetic snapping preserve the approved movement. Cancelled gestures have no fling; drag-generated clicks cannot select.
- Click a neighbor to center it; click the settled center to select. Hover never moves focus. Gold selection markers and Working on identify the actual build independently of the preview.
- Left/Right and Home/End browse; Enter/Space on the wheel selects; Escape collapses. Horizontal trackpad input and Shift+wheel browse. Reduced motion retains direct manipulation and snaps without momentum.
- Collection and Element are independent filters inside the expanded gallery. Their intersection uses the existing canonical `catalog.js` element values; unknown elements are not inferred. Account membership remains the six illustrative fixture identities. Filtering preserves a matching preview when possible, otherwise uses a matching selection or first result, and never selects a build.
- Empty intersections show an explicit empty state with no selectable artwork or fabricated information. Collapsing an empty result still shows the selected Character's portrait, so the gallery remains discoverable. Filters persist when reopened.

## Source and boundaries

`v1.1/modules/carousel.js` owns rendering/input/filtering. `carousel-motion.js` owns bounded presentation position and settling. Production `FreewheelCarousel` supplied interaction ideas only; no production code/state/layout is changed or imported. Existing Lab state, Workshop, feedback, Echo Cards, Character comparison, Settings and Trash Piles keep their current owners.

## Verification

`tools/review-carousel.mjs` exercises physical mouse/CDP touch, momentum and snapping, no hover fisheye, neighbor versus center activation, endpoints, all collection/element combinations including empty results, keyboard and reduced motion. It checks fixed centers, selected/preview separation, hidden compact state, real 400px document displacement, unchanged side panels, collapse restoration and no horizontal overflow at 1440/1920/2560px. Existing Workshop/feedback/history regression checks remain in `verify-browser.mjs`.

The default review generates no screenshots, MP4 or downloadable bundles. CI tests the exact source head without deploying it. The PR links the immutable GitHack source URL; external availability must be distinguished from local Chromium evidence. Optional portable packaging/testing tools remain available for maintainers (`UI_LAB_PORTABLE_REVIEW=true`) but are not part of the current review deliverables.
