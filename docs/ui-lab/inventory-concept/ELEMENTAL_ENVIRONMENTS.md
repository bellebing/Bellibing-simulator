# Earlier elemental Hero environments — retained study

**Historical six-element review · 2026-10-29.** Current direction: [two cinematic Electro vistas](CINEMATIC_HERO_VISTA.md). These earlier art assets remain available under Earlier element studies and were not regenerated in the vista iteration. Evidence below identifies the earlier review revision.

Six existing painted environments are refined into open, nearly infinite spaces. The depth-aware WebGL renderer, authentic Character art and functional layout are retained. Character Builder cards, Inventory and Team/Endgame interactions remain the same connected memory-only concept. Production UI, account formats, gameplay sources and private computation are unchanged.

| Environment | Distinct visual motif |
| --- | --- |
| Electro | Open charged horizon, branching electromagnetic fields and distant cloud banks |
| Fusion | Distant plasma reaction knots, transmutation filaments, combustion and heat strata |
| Glacio | Immense layered glacier escarpments, crystalline ridges and polar atmosphere |
| Aero | Weightless lateral currents, suspended distant horizons and stratified clouds |
| Spectro | Radiant mountain formations, sparse forested landforms and supernatural natural light |
| Havoc | Misaligned horizons, fractured planes and impossible dimensional distances |

Electro was refined first: the first pass still enclosed the view with side clouds, so a second pass lowered those formations and opened the horizon. Actual Chromium views of the baseline and revised background, Augusta, cards and Dimensional Motion were inspected before refining the other five. This is implementation review, **not owner approval**. Each other element has an independent composition, rather than copied geometry or a color filter.

Depth extends primarily behind the Character. Distant silhouettes, atmospheric layers, scale differences and lateral lighting establish spatial presence. The existing foreground overlay is reduced from 48% opacity to 8%, confined to the bottom 22%, so it no longer wraps large formations across Augusta. No fabricated feet or physical floor contact are introduced. Spectro's landscape/vegetation direction is owner art direction, not a gameplay-mechanics claim.

## Open and compare

Download [preview.html](preview.html), then open the downloaded HTML in a desktop browser. GitHub's source viewer is not an interactive preview. Alternatively run:

```sh
CONCEPT_PORT=4179 node docs/ui-lab/inventory-concept/serve.mjs
```

Open `http://127.0.0.1:4179/#build`. Six element buttons switch without reloading. **Background / Character / Cards** compare the same scene crop; **Cinematic Still / Dimensional Motion** compare rendering modes. Changing the comparison environment does not change Augusta's actual Electro identity, equipment or Stats. Demo data remain explicitly synthetic and memory-only.

The collapsed **Compact Echo backdrop study** below the workspace shows reusable small crops. Its generic silhouette is labelled as a placeholder, not authentic Echo artwork. The five existing equipped Echo cards are not redesigned.

## Technique and provenance

Environment artwork and matching relative-depth control maps were refined with `image_gen` from the existing concept art. PNG masters, WebP derivatives and SHA-256 identities are preserved in [elemental-art/manifest.json](elemental-art/manifest.json). Backgrounds use WebP quality 94; maps use lossless WebP, with no resizing or cropping. Current dimensions and payload sizes are recorded in [review identities](elemental-review/identity.json). The previous art and exact portable baseline remain available in Git history at `94e46ccf8e064fc69d174d957f46d94a4166e240`. This is a review artifact, not a production payload budget qualification.

The owner-provided in-game Echo and Chisa desktop references were visually inspected for atmospheric depth, restrained dimensional movement and authentic illustration quality. Their pixels are not embedded or used as generation inputs. A still screenshot does not establish the Chisa wallpaper's actual shader implementation. Method research included Wallpaper Engine's [Depth Parallax](https://docs.wallpaperengine.io/en/scene/parallax/depthparallax.html) and [lighting introduction](https://docs.wallpaperengine.io/en/scene/lighting/introduction.html); no assets or code from that wallpaper were copied.

One WebGL 2D quad samples each painted background and its matching depth map. Per-pixel displacement and a small perspective offset vary with relative depth, rather than merely translating three flat planes. A minimal lower foreground uses the same artwork with a luminance depth mask; it is restricted to the bottom edge and 8% opacity. Existing Character artwork stays a separate, rigid DOM image, with subtle uniform grading/rim treatment and bounded translation. It is never passed to the background displacement shader.

These are **artist-authored/generated approximate relative-depth maps**, not measured geometry. Small offsets and image overscan prevent visible edge exposure; they cannot reveal unseen geometry. There is no runtime 3D room, normal map, physical Character relighting, body/face deformation or invented anatomy. Existing Character cutouts remain upper-body sources. Future full-body art sourcing is separate from review of these six backgrounds.

The shared renderer caps raster dimensions at 1920×1080 without DPR amplification and renders at most approximately 30 fps during pointer settling. Still, reduced motion, hidden pages and settled pointers have no continuous render loop. Current GL resources are disposed on scene changes; image promises have a four-entry LRU. Two textures serve the active scene. Missing WebGL or context loss retains a valid still image and disables unavailable motion. This is a bounded visual prototype, not a measured universal GPU-performance guarantee.

## Canonical Echo association

The presentation projection reuses existing `SONATA_CATALOG` and `SONATA_EFFECT_MODELS`; it adds no game rules or stat tables. A released set receives a theme only when a source-linked, `VERIFIED_MODELED`, permanent, self-scoped 2-piece effect identifies exactly one canonical elemental DMG Bonus. No association is inferred from the set's name. Ambiguous, conditional, 5-piece-only, unsupported or non-element-specific contexts stay neutral until separately reviewed.

The current projection includes **37 released sets: 20 explicit associations and 17 neutral fallbacks**. Neutral does not claim those sets have no elemental gameplay effects; it means this conservative visual rule did not establish a unique eligible association. Effects are never executed, recommendations calculated or source readiness promoted here.

## Evidence and remaining acceptance

[Browser evidence](elemental-review/review.json), [Inventory regression evidence](elemental-review/inventory-review.json) and [revision identities](elemental-review/identity.json) identify the reviewed sources and portable artifact. Current checks cover six hot switches, all three comparison modes, depth motion, actual pointer movement, fixed card geometry, Skills/Echo Workspace/Inventory/Team/Endgame, static and reduced-motion behavior, context loss and absent WebGL. Desktop review starts at 1440×900, with wider 1920×1080 and 2560×1440 captures. Source-association tests preserve the conservative canonical projection.

Compare actual Electro browser screenshots: [before, background](elemental-review/electro-before-background-1440.jpg) / [after, background](elemental-review/electro-background-1440.jpg), [before, cards](elemental-review/electro-before-cards-1440.jpg) / [after, cards](elemental-review/electro-cards-1440.jpg), [Character](elemental-review/electro-character-still-1440.jpg) and [cards in depth motion](elemental-review/electro-cards-depth-motion-1440.jpg). Final Character/cards: [Fusion](elemental-review/fusion-cards-1440.jpg), [Glacio](elemental-review/glacio-cards-1440.jpg), [Aero](elemental-review/aero-cards-1440.jpg), [Spectro](elemental-review/spectro-cards-1440.jpg), [Havoc](elemental-review/havoc-cards-1440.jpg).

The inherited browser harness assumed a fixed settling delay, which failed on the unchanged baseline under this environment. It now waits for three consecutive stable frame samples within a bounded window, then retains the original independent assertion that no idle frames occur. The motion guard now also synchronizes reported readiness when a live preference change stops settling, and pointer input checks the same guard if a media event has not yet arrived. This adds no idle polling or new animation. Each scene retains its existing listener lifecycle. All existing reduced-motion assertions remain.

The portable document is exercised offline through an intercepted local HTTP document URL, with no HTTP subresources. **Native `file://` launching is not certified in this managed browser environment.** The standalone includes its styles/scripts/images and is supplied for the owner's ordinary desktop browser review.

Subjective elemental recognition, artistic quality and whether the Character feels sufficiently integrated remain **owner visual decisions**. The compact Echo silhouette is only a reuse study. No production migration, new Character coverage, mobile work, private calculation connection, merge or deployment is included. Focused concept verification is not a FULL/MERGE gate; those gates remain mandatory for any later merge-intended candidate.
