# Bellibing UI Lab — Visual References

**Status: image upload pending.** This is the reference index and approved interpretation, not a completed screenshot import. The eight `.webp` files named below must be added to this directory before the PR can be considered complete.

These screenshots were provided by the project owner. Study **layout logic, visual hierarchy, responsive behavior and interaction affordances**, not source-site branding or content. The existing Bellibing production DOM/layout is **not** the starting template for the new UI Lab.

| Reference file | What to study |
| --- | --- |
| `miruro-browse-card-flow.webp` | Panels by purpose, consistent column/card widths, natural reading flow between featured items, lists and schedule. |
| `miruro-watch-detail-flow.webp` | Primary viewing area with separate supportive panels; coherent vertical information flow. |
| `miruro-watch-primary-secondary.webp` | Main work area has priority over episodes, seasons and recommendations in the adjacent column. |
| `youtube-home-priority.webp` | Media tiles in adaptive grids; navigation, imagery and text have different resizing behavior. |
| `youtube-watch-wide.webp` | Main content takes dominant width; controls and textual content need not each have their own nested cards. |
| `youtube-watch-narrow.webp` | Compare against wide version: media scales, text reflows, controls retain usable sizing. |
| `wuwa-tracker-cards.webp` | Consistent surfaces, compact metrics, strong artwork/typography hierarchy, repeated purpose-specific panels. |
| `miruro-anime-metadata.webp` | One information panel; buttons and artwork have boundaries, while labels and ordinary metadata are unboxed. |

## Bellibing-specific direction

- **Three independent columns** when space permits: collapsible Improve Settings (left), **wide primary Echo Workshop** (center), Character Card with full readable stats (right). The center remains dominant and never collapses.
- Echo Workshop contains two **portrait, collectible-style Echo cards**: Current Echo (left), New Echo (right), and **open space between them** with decision/status above, SIMULATE button in the middle, resources used below. No extra giant middle panel.
- Real Echo card anatomy: artwork, Sonata icon, prominent Main Stat and Secondary Stat, five visible Substat rows even when empty. Five visible usable Echo slots below.
- **Trash Piles are a separate panel below Workshop**, showing real Echo-card stacks (not counters or generic slot/inspect boxes). Inspecting a card lifts it temporarily and preserves the working state.
- Cards/panels are not mandated around every piece of text. Use spacing, typography, imagery and separators to create hierarchy; nest surfaces only for distinct objects, groups or actions.
- Side panels may collapse independently as width tightens; do not squeeze the workshop into a token center column. The main browser scrollbar belongs at the outer edge.
- Avoid UI design commentary, explanatory paragraphs, fabricated gameplay results, and unverified Expected or resource values. Current implementation contracts remain authoritative for actual data.

## Provenance and use

These are static design-study screenshots supplied 2026-10-15, **not evidence of live website behavior**. The paired YouTube captures illustrate resizing, without independently verifying the site's implementation. Privacy-sensitive account/avatar corners were obscured in prepared repository copies. Images are reference-only and must **not be shipped in the production web artifact**.

The original source screenshots and prepared upload package remain outside the repo until the `.webp` assets above are committed. Do not call this reference set complete while assets are absent.
