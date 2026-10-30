# Selected elemental still backgrounds

The current Build preview presents the six owner-selected backgrounds: **Fusion, Glacio, Electro, Aero, Spectro and Havoc**, with the common low foreground platform. Electro is initially selected. The owner selected the image set in visual review; placement of the existing partial Character art and cards remains a separate UI review.

## Compare in the interactive preview

Open [preview.html](preview.html#build), then choose an element in **Selected still backgrounds**. **Background** shows the complete image without Character art or cards; **Character** adds the existing partial artwork; **Cards** includes the connected Builder controls. The image uses `object-fit: contain` without zoom, so its full frame remains visible; narrow unused margins may occur when the workspace aspect ratio differs.

Below the workspace, **Selected still backgrounds** provides thumbnails for returning to this set from a reference. **Earlier references** retains the previous Electro Hero, rejected coastal/meadow compositions and all six earlier element studies. Those assets and their existing comparison behavior are preserved.

The selected set is **still-image-only**. It does not mount the existing depth renderer, request depth maps, create a canvas, respond to pointer motion or offer an animation toggle. The older references retain their previous behavior; no new motion work is included.

## Assets and identity

| Element | Original PNG | Preview image |
| --- | --- | --- |
| Fusion | [bellibing-bg-fusion-v01.png](selected-stills/source/bellibing-bg-fusion-v01.png) | [WebP](selected-stills/bellibing-bg-fusion-v01.webp) |
| Glacio | [bellibing-bg-glacio-v01.png](selected-stills/source/bellibing-bg-glacio-v01.png) | [WebP](selected-stills/bellibing-bg-glacio-v01.webp) |
| Electro | [bellibing-bg-electro-v01.png](selected-stills/source/bellibing-bg-electro-v01.png) | [WebP](selected-stills/bellibing-bg-electro-v01.webp) |
| Aero | [bellibing-bg-aero-v01.png](selected-stills/source/bellibing-bg-aero-v01.png) | [WebP](selected-stills/bellibing-bg-aero-v01.webp) |
| Spectro | [bellibing-bg-spectro-v01.png](selected-stills/source/bellibing-bg-spectro-v01.png) | [WebP](selected-stills/bellibing-bg-spectro-v01.webp) |
| Havoc | [bellibing-bg-havoc-v01.png](selected-stills/source/bellibing-bg-havoc-v01.png) | [WebP](selected-stills/bellibing-bg-havoc-v01.webp) |

The PNGs preserve the selected files byte for byte. The preview uses lossless WebP derivatives; decoded RGB pixels were compared against each original. No resizing, cropping, color grading or image generation was performed for this integration. [manifest.json](selected-stills/manifest.json) records dimensions, paths and SHA-256 identities. Slight differences in source dimensions are retained.

These are owner-directed image-generation edits based on the owner's Wuthering Waves login screenshot, rather than independent original landscapes. Game imagery remains attributable to Kuro Games. The raw screenshot, recording, private Drive links and working files are not included. The environment effects are visual interpretations, not new canonical gameplay or geology claims.

`selected-stills.mjs` owns this presentation-only list. It does not alter the existing source-backed Character, Sonata, icon or equipment associations. Selecting a background is an art comparison and does not change the selected Character or build.

## Focused REVIEW

Start the allowlisted development server, then run the current still-image review with an installed Playwright module:

```sh
CONCEPT_PORT=4179 node docs/ui-lab/inventory-concept/serve.mjs
CONCEPT_REVIEW_URL=http://127.0.0.1:4179 \
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
node docs/ui-lab/inventory-concept/selected-stills-review.mjs
```

The review checks all six file identities and switches, Background/Character/Cards, fixed pointer behavior, retained references, actual connected navigation, desktop widths, reduced motion, account/resource sentinels and the portable HTML offline. It also exercises the multi-file source when the server URL is supplied. Output defaults to `/tmp/bellibing-selected-stills-review`.

Regenerate the committed portable document using:

```sh
node docs/ui-lab/inventory-concept/package-preview.mjs docs/ui-lab/inventory-concept/preview.html
```

Screenshots and focused evidence are in [selected-stills-review](selected-stills-review/). Previous review folders remain historical evidence for their original revisions, not proof of this selected-set integration. This is presentation REVIEW, not FULL/MERGE or production qualification.

## Later work

First review Character size and panel readability with the selected stills. Layer separation, hidden-surface reconstruction, depth parallax and local animation are deferred. No new depth maps, animated assets or motion system are added in this change.
