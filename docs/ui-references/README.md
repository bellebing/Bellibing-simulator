# Bellibing UI Lab — Visual References

These are user-provided design-study screenshots. Study **layout logic, visual hierarchy, responsive adaptation and interaction affordances**; do not copy source sites, branding, text, icons or media.

This reference set is **not** a specification of the current Bellibing production DOM or a reason to keep its layout.

| Image | What to study |
| --- | --- |
| [Miruro browse](miruro-browse-card-flow.webp) | Panels by purpose; repeated card widths; hierarchy of featured content, lists and schedule. |
| [Miruro watch detail](miruro-watch-detail-flow.webp) | Primary work area with supporting right panels; information and actions underneath; strategic use of borders. |
| [Miruro watch overview](miruro-watch-primary-secondary.webp) | Video as main focus, episode and season/recommendations in separate right-hand panels. |
| [YouTube home](youtube-home-priority.webp) | Images/media scale in responsive grids; navigational sidebar has a different width behavior than thumbnails. |
| [YouTube watch wide](youtube-watch-wide.webp) | Video dominates; recommendations narrower; text/actions flow outside an enclosing media card. |
| [YouTube watch narrow](youtube-watch-narrow.webp) | Compare with wide screenshot: player scales, text reflows and controls stay usable. |
| [Wuwa Tracker](wuwa-tracker-cards.webp) | Compact repeatable cards; data, artwork, icons and sparse separators instead of excessive nesting. |
| [Miruro metadata](miruro-anime-metadata.webp) | One parent panel; interactive buttons have surfaces, ordinary labels/data not boxed individually. |

## Approved Bellibing direction (not inferred from reference sites)

- A wide central **Echo Workshop** anchors the page; it is never collapsed. Collapsible Improve Settings (left) and Character Card (right) support it, rather than squeezing it.
- **Two portrait Echo game cards** (Current Echo and New Echo), with open space **between** them: concise decision/status above, SIMULATE button centered, and actual resources used below; **no extra big middle box**.
- Echo cards show artwork, Sonata icon, prominent Main/Secondary stats and five substat rows, including empty rows.
- Five interactive Echo slots below the main interaction. **Trash Piles** are a separate panel beneath Workshop, containing visible stacks of the same Echo-card objects, not count/inspect boxes.
- A panel can contain unboxed text and values; add nested cards only when they support a separate object or interactive action.
- Expandable side panels preserve user control; central workspace has first claim on useful width. Images resize, text reflows naturally, controls stay legible.
- No decorative explanatory text in UI. **UI screenshots illustrate design principles, not gameplay truth.** Missing evaluator/Expected values remain Pending.

## Evidence notes

- These are static images, not proof of dynamic behavior. Responsive observations for YouTube are suggested by the **paired wide/narrow user screenshots**, not verified through live website interaction.
- Screenshots were provided by the project owner on 2026-10-15; account/avatar corners are obscured for repository use. They remain third-party interface references, not Bellibing assets for product UI.
- Do not include these reference images in the public app build; they are design-only documentation.
