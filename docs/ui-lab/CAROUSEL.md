# Character Carousel Interaction V2

The approved pre-V2 implementation is recoverable at `66d72f339e3c1aa363a1794ff243128d63bc3f28`. V1, earlier V1.1 revisions and the approved artwork remain unchanged.

## Interaction contract

The wheel has one continuous position over the active catalog, not nine-Character pages. All 59 released identities (or six illustrative Account identities) participate. Each artwork's horizontal offset, scale and opacity are measured from the same center. The approved resting scale/opacity hierarchy and gallery appearance are retained. First and last Characters sit at the same center with intentional empty space beyond the catalog bounds.

The name, Weapon and stat preview stay anchored in one fixed central block. Moving the pointer over gallery artwork does not change focus. Circular portraits are 44px, with a 50px selected portrait. Their track is centered on Echo Workshop independently of filter, arrows and expansion controls; its visible span adapts to actual available header space. Working on the selected Character is now inline in the Workshop header. The overlay also identifies the working Character when browsing previews far from that selection.

- Hover the compact track to reveal the gallery; click/tap a compact Character to open and center it.
- Drag/swipe horizontally to spin. The direct manipulation threshold is 8px; vertical touch motion retains page scrolling. Pointer capture keeps the gesture stable. Native image dragging is disabled.
- Release uses smoothed pointer velocity, bounded momentum (release projection capped at 1.5 positions before snapping), an ease-out settle and magnetic snapping. A pause before release removes stale velocity. Cancelled gestures snap without momentum. A drag-generated click cannot select a Character.
- Click/tap a neighboring Character to center it. Click/tap the settled center Character to select it. The center name/caption is preview state; the gold portrait ring, selected marker, Working on label and `aria-pressed` identify the actual selection.
- Previous/Next move one position. Left/Right, Home/End browse the continuous active catalog; Enter/Space on the focused wheel selects its settled center. Escape and close restore focus to the expansion button. Horizontal trackpad scrolling/Shift+wheel browses; ordinary vertical wheel scrolling remains available.
- Account/All filtering preserves a preview when available, otherwise centers the selected Character if included or the first matching identity. It cancels movement without changing the working build. All restores the full catalog rather than a fixed page.
- Reduced motion retains direct drag input but snaps immediately without a momentum animation. Expansion/collapse transitions and visual scale interpolation animations are disabled by the existing preference contract.

Expansion shares the portrait track's center/origin, revealing the existing gallery with a clipped growth and portrait-to-artwork transition. It remains an overlay; it never changes Workshop geometry. Browsing and motion do not call `onSelect`; only explicit activation of a settled center does. Existing Lab data, settings, feedback, Echo cards, Character comparison and Trash Piles remain owned by their existing components.

## Source and reused ideas

`v1.1/modules/carousel.js` owns the adapter and input events; `carousel-motion.js` owns bounded presentation position and settling. Neither imports production state or a gameplay calculation.

Production `FreewheelCarousel` in `docs/ui-prototypes/v34-functional.html` was inspected for its drag threshold, pointer capture, velocity smoothing, release projection, easing, reduced-motion and click-suppression patterns. Those interaction ideas are adapted in the isolated Lab; no production selector layout or code is changed.

## Verification and demonstration

`tools/review-carousel.mjs` exercises real mouse and CDP touch input, continuous full-catalog traversal, momentum, snapping, pointer hover, neighbor versus center activation, endpoint centering, filter changes, keyboard and reduced motion. It asserts the fixed centers, artwork emphasis, immutable preview/build distinction and unchanged Workshop geometry at 1440/1920/2560px. Existing Workshop/feedback/history checks remain in the same review workflow.

`tools/record-carousel.mjs` records actual Chromium compositor frames and physical input into `carousel-interaction.mp4`, with exact source identity in `carousel-interaction.json`. FFmpeg is required for that review recording (installed by the review workflow); it is not a product/runtime dependency. Screenshot and portable-file identity remain in the review manifest/verification JSON and exact-head Actions artifact.
