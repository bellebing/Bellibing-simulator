# Cinematic Hero vista — Electro A / B

**2026-10-29 · Europe/Stockholm. Isolated Draft PR #361. Owner visual approval pending.**

Two original Electro proposals explore believable standing terrain, water and a distant coastal horizon. They are the current Hero review direction. The earlier six-element artwork is retained under **Earlier element studies**; none of those five other elements was regenerated in this iteration. Existing Character Builder cards, Inventory, navigation, Skills, Echo Workspace and Team/Endgame remain connected memory-only examples.

## Open and compare

Download [preview.html](preview.html) using GitHub's **Download raw file**, then open the saved HTML in a desktop browser. The PR links an exact-revision GitHack preview. Local source preview:

```sh
CONCEPT_PORT=4179 node docs/ui-lab/inventory-concept/serve.mjs
```

Open `http://127.0.0.1:4179/#build`. Choose **A · Coastal outlook** or **B · Meadow terrace**, then **Background / Anchor / Cards**. **Cinematic Still / Dimensional Motion** controls interactive depth. **Water light** is a separate, optional environmental light study and works with Still selected. Both start static. Expand **Echo framing study** for smaller reuse through the same renderer. Earlier element studies retain their authentic upper-body art and canonical Sonata association study.

## Composition and short assessment

| Proposal | Spatial character | Assessment / remaining limitation |
| --- | --- | --- |
| A — Coastal outlook | Low continuous weathered stone headland, water around and behind it, a long straight sea horizon | Stronger foreground-to-water separation and the clearer login-inspired outlook. Irregular stone gives a more restricted pose area than B. |
| B — Meadow terrace | Broader grass/stone shelf with a relatively level central area, coastal inlet and low distant land | More practical pose space and a softer foreground transition. Vegetation is static; this iteration does not reproduce the reference's articulated grass motion. |

Both use natural materials, a restrained distant storm and warm upper-right light against cool sky fill. The first source pass was too photographic; a material-style pass simplified stone, grass and clouds before browser integration. No original login-screen or private reference pixels were generation inputs. The coastal scene remains intentionally more restrained than the previous fantasy environments. Electro's distant storm is clearest in Background mode and partly covered by functional cards; its accessible icon remains available.

The stills are the composition reference. Both have a level sea horizon, ordinary perspective and substantial distance beyond the standing area. Browser screenshots, not only source images, were inspected at 1440×900 and wider desktop sizes. Final Character appearance, contact shadows, garment/grass occlusion and actual artwork lighting remain separate owner decisions; a guide does not demonstrate completed Character integration.

## Reference observations and boundaries

The four owner-supplied Wallpaper Engine recordings and three supplied screenshots were accessible. Temporal frames spanning each recording were inspected, with denser samples across the primary sunset field scene. That scene shows local grass, hair and cloth changes against stable rock and landscape structure. The indoor scene emphasizes contact, directional light and stable furnishings. The water/Character scene illustrates local liquid and garment motion; the lake/castle scene has more visible viewpoint movement. These are observations of screen recordings, **not proof of their original shader, rig or layer implementation**.

The [public launch-screen capture](https://www.online-station.net/mobile-game/794813) was also inspected for near standing terrain, subject scale and distant landscape hierarchy. Original Bellibing coastal art follows those spatial principles without copying its rock arrangement. Private files, extracted frames, download URLs and identifying Drive metadata are excluded from the repository, screenshots and portable HTML.

## Reusable Character Anchor

[hero-vistas.mjs](hero-vistas.mjs) owns presentation metadata independent of gameplay and Character assets:

- Standing point: normalized source-image **(0.51, 0.84)** in both proposals.
- Design reference height: **1.75 m**, occupying **0.53 source-image heights**; this is an arbitrary framing datum, not Augusta's or any other Character's canonical height.
- Source horizon: approximately **0.402 in A / 0.382 in B**. The implied camera eye height is approximately **1.45 m / 1.51 m** for that reference. These are composition estimates, not reconstructed camera calibration.
- Pose envelope, ground-contact mark and expected upper-right lighting are explicit metadata/guide concerns. The guide is a diagram, not a mannequin asset or fabricated full-body Character illustration.

The guide uses the same cover crop and overscan as the background. Its contact point follows the sampled relative-depth plane under small pointer displacement. It does not rotate, deform or receive invented Character animation. The metadata can inform future approved 2.5D or 3D integration; either technique still needs its own projection, art and contact review. Existing upper-body images do not determine the new standing area.

## Rendering and motion

The existing WebGL quad, depth-map displacement, resource cleanup, image cache and 1920×1080 raster cap are reused. Each proposal has its own original PNG master, WebP image and approximate grayscale depth map; [manifest](vista-art/manifest.json) records hashes. Depth is an artistic distance guide, not measured geometry. Small displacement cannot reveal unseen surfaces.

Vista pointer strength is **0.55 of the previous bounded effect**, with the additional perspective term disabled. Far sky/sea-horizon depth is near-uniform; near ground has a smooth distance progression. This avoids time-dependent bending and keeps interactive shifts small. The earlier six-element renderer defaults remain available.

The optional **Water light** study modulates brightness by at most **1.8%** inside an authored open-water region. It uses no time-dependent texture-coordinate displacement: clouds, shore, mountains and horizon do not warp. This is a limited water-light impression, not simulated waves, drifting clouds or animated vegetation. It is intentionally separate from pointer movement and Character rendering.

Environmental light renders at most approximately 20 fps while enabled, visible and not reduced-motion. Default Still and settled parallax have no idle loop. Reduced motion stops both features, and hiding the document cancels the loop. Context loss or missing WebGL preserves the static image and guide and disables unavailable motion. The compact Echo guide uses the same renderer/maps at a smaller raster size, not another rendering system or new canonical Echo association. No universal GPU-performance claim is made.

## Focused REVIEW evidence

[Browser checks](vista-review/review.json), [Inventory regression](vista-review/inventory-review.json) and [source/artifact identities](vista-review/identity.json) identify the reviewed delivery. These cover A/B switching, three comparison modes, guide framing, card stability, pointer settling, independent water light, compact reuse, existing workflows, wider desktop sizes, reduced-motion startup/live changes and static graphics fallback. **10 vista browser groups, 12 retained-element browser groups, 14 Inventory groups and 5 canonical association tests PASS.** Earlier element compatibility is checked separately and linked from the identity record.

| View | A | B |
| --- | --- | --- |
| Background | [Coast](vista-review/coast-background-1440.jpg) | [Terrace](vista-review/terrace-background-1440.jpg) |
| Intended placement | [Coast anchor](vista-review/coast-anchor-1440.jpg) | [Terrace anchor](vista-review/terrace-anchor-1440.jpg) |
| Functional cards | [Coast cards](vista-review/coast-cards-1440.jpg) | [Terrace cards](vista-review/terrace-cards-1440.jpg) |
| Dimensional Motion | [Coast motion](vista-review/coast-cards-depth-motion-1440.jpg) | [Terrace motion](vista-review/terrace-cards-depth-motion-1440.jpg) |

[Water-light study](vista-review/terrace-water-light-1440.jpg) · [Compact Echo reuse](vista-review/compact-shared-vista-1440.jpg) · [Reduced motion](vista-review/reduced-motion-1440.jpg) · [Static fallback](vista-review/context-loss-fallback-1440.jpg).

The exact standalone is exercised through local HTTP then offline without HTTP subresources. Native `file://` launching is not certified in this managed browser environment. Local REVIEW evidence does not replace FULL/MERGE gates. No production UI, account persistence, canonical game data, private engine, deployment, merge or final Character-rendering choice is included. **Keep Draft and stop for owner visual review before expanding to other elements.**
