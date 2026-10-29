# Elemental Hero environments — visual review

**2026-10-29 · Europe/Stockholm. Isolated Draft PR #361; owner visual acceptance pending.**

Six independent painted environments replace the rejected architectural chamber, tiled floor, podium and mannequin. Character Builder cards, Inventory and Team/Endgame interactions remain the same connected memory-only concept. Production UI, account formats, gameplay sources and private computation are unchanged.

| Environment | Distinct visual motif |
| --- | --- |
| Electro | Charged blue/violet clouds, branching filaments and luminous haze |
| Fusion | Crimson/copper combustion flows, embers and warm atmospheric glow |
| Glacio | Ice facets, frost, crystalline refraction and cold light shafts |
| Aero | Teal wind ribbons, flowing air and leaf-like motes |
| Spectro | Gold/ivory optical petals, curved refracted light and radiant structures |
| Havoc | Violet-black fractured membranes, torn space and dimensional rifts |

Electro was generated, composed with actual Augusta artwork and reviewed in Chromium in Still/Character/motion views before the other five were developed. They share composition and delivery budgets, rather than being six filters over one scene. This is an implementation review sequence, **not owner approval of the Electro design**.

## Open and compare

Download [preview.html](preview.html), then open the downloaded HTML in a desktop browser. GitHub's source viewer is not an interactive preview. Alternatively run:

```sh
CONCEPT_PORT=4179 node docs/ui-lab/inventory-concept/serve.mjs
```

Open `http://127.0.0.1:4179/#build`. Six element buttons switch without reloading. **Background / Character / Cards** compare the same scene crop; **Cinematic Still / Dimensional Motion** compare rendering modes. Changing the comparison environment does not change Augusta's actual Electro identity, equipment or Stats. Demo data remain explicitly synthetic and memory-only.

The collapsed **Compact Echo backdrop study** below the workspace shows reusable small crops. Its generic silhouette is labelled as a placeholder, not authentic Echo artwork. The five existing equipped Echo cards are not redesigned.

## Technique and provenance

Original environment artwork and matching relative-depth control maps were generated with `image_gen`. Original PNG masters and SHA-256 identities are preserved in [elemental-art/manifest.json](elemental-art/manifest.json). Backgrounds are WebP quality 94; depth maps are lossless WebP. All twelve images retain **1672×941** dimensions, with no resize or crop of the masters. Runtime derivatives total **7,158,828 bytes**; the complete embedded HTML is **11,633,175 bytes** at this revision. This is a review artifact, not a production payload budget qualification.

The owner-provided in-game Echo and Chisa desktop references were visually inspected for atmospheric depth, restrained dimensional movement and authentic illustration quality. Their pixels are not embedded or used as generation inputs. A still screenshot does not establish the Chisa wallpaper's actual shader implementation. Method research included Wallpaper Engine's [Depth Parallax](https://docs.wallpaperengine.io/en/scene/parallax/depthparallax.html) and [lighting introduction](https://docs.wallpaperengine.io/en/scene/lighting/introduction.html); no assets or code from that wallpaper were copied.

One WebGL 2D quad samples each painted background and its matching depth map. Per-pixel displacement and a small perspective offset vary with relative depth, rather than merely translating three flat planes. A restrained lower foreground uses the same artwork with a luminance depth mask. Existing Character artwork stays a separate, rigid DOM image, with subtle uniform grading/rim treatment and bounded translation. It is never passed to the background displacement shader.

These are **artist-authored/generated approximate relative-depth maps**, not measured geometry. Small offsets and image overscan prevent visible edge exposure; they cannot reveal unseen geometry. There is no runtime 3D room, normal map, physical Character relighting, body/face deformation or invented anatomy. Existing Character cutouts remain upper-body sources. Future full-body art sourcing is separate from review of these six backgrounds.

The shared renderer caps raster dimensions at 1920×1080 without DPR amplification and renders at most approximately 30 fps during pointer settling. Still, reduced motion, hidden pages and settled pointers have no continuous render loop. Current GL resources are disposed on scene changes; image promises have a four-entry LRU. Two textures serve the active scene. Missing WebGL or context loss retains a valid still image and disables unavailable motion. This is a bounded visual prototype, not a measured universal GPU-performance guarantee.

## Canonical Echo association

The presentation projection reuses existing `SONATA_CATALOG` and `SONATA_EFFECT_MODELS`; it adds no game rules or stat tables. A released set receives a theme only when a source-linked, `VERIFIED_MODELED`, permanent, self-scoped 2-piece effect identifies exactly one canonical elemental DMG Bonus. No association is inferred from the set's name. Ambiguous, conditional, 5-piece-only, unsupported or non-element-specific contexts stay neutral until separately reviewed.

The current projection includes **37 released sets: 20 explicit associations and 17 neutral fallbacks**. Neutral does not claim those sets have no elemental gameplay effects; it means this conservative visual rule did not establish a unique eligible association. Effects are never executed, recommendations calculated or source readiness promoted here.

## Evidence and remaining acceptance

[Browser evidence](elemental-review/review.json), [Inventory regression evidence](elemental-review/inventory-review.json) and [revision identities](elemental-review/identity.json) record the exact standalone artifact and sources. Screenshots are actual Chromium captures at 1440×900, plus wider desktop checks. **12 elemental browser groups, 14 Inventory regression groups and 5 source-association tests PASS.** Source-association cases exercise positive, neutral, conditional, unsupported and ambiguous contexts. Inventory source behavior was checked before final packaging; its controller is byte-identical except the new presentation metadata fetch. Team render functions/styles and 45 canonical input files were also checked unchanged.

The portable document is exercised offline through an intercepted local HTTP document URL, with no HTTP subresources. **Native `file://` launching is not certified in this managed browser environment.** The standalone includes its styles/scripts/images and is supplied for the owner's ordinary desktop browser review.

Subjective elemental recognition, artistic quality and whether the Character feels sufficiently integrated remain **owner visual decisions**. The compact Echo silhouette is only a reuse study. No production migration, new Character coverage, mobile work, private calculation connection, merge or deployment is included. Focused concept verification is not a FULL/MERGE gate; those gates remain mandatory for any later merge-intended candidate.
