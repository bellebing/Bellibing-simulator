# Hero environment — rendered depth study

2026-10-28 · Europe/Stockholm. Isolated visual method study in existing Draft #361. Owner visual acceptance is **pending**. Full-body game-Character integration is **not complete**.

## Reference findings and method

The three owner-provided images were retrieved through the authorized Drive folder and visually inspected: the in-game Echo, the previous Bellibing concept and the Chisa desktop wallpaper. They are references only: no pixels, models, UI or artwork from those files are embedded or republished here. A screenshot cannot establish which animation/depth technique the original wallpaper uses.

The Echo gets spatial presence from its own shaded volume, contour lighting and reflected relationship to the supporting plane, even with a quiet background. Chisa's foreshortened pose, overlapping foreground, coherent highlights and contrast separation already read spatially in the still. Bellibing's old large circular CSS geometry and grid did not give the flat cropped Character a credible relationship to a room or support. Increasing parallax alone would not repair that.

**Selected technique: an original offline 3D render, exported as three camera-matched image planes.** A small standalone visual study was inspected at 1440×900 as a still, with restrained motion and with the existing functional cards before integration. The initial bright/noisy render was rejected; the final blue-black stone chamber uses warm side light, cool rear fill, material shading, distance atmosphere, occlusion and a real perspective floor. This replaces the CSS environment entirely. No runtime 3D renderer, WebGL shader, new dependency or infrastructure is added.

| Option researched | Assessment for this bounded study |
| --- | --- |
| [Layered Camera Parallax](https://docs.wallpaperengine.io/en/scene/parallax/introduction.html) | Independent plane displacement with overscan and delayed response is sufficient once static depth is authored. Selected for small, rigid motion. |
| [Depth Parallax](https://docs.wallpaperengine.io/en/scene/parallax/depthparallax.html) / [effect settings](https://docs.wallpaperengine.io/en/scene/effects/effect/depthparallax.html) | Can produce within-image perspective displacement, but requires a reviewed depth map, occlusion handling and masks. It cannot supply missing body/background pixels; erroneous contours can skew details. No runtime depth-map implementation or experimental shader A/B benchmark is claimed here. |
| [Normal maps, materials and lighting](https://docs.wallpaperengine.io/en/scene/lighting/introduction.html) | Useful for surface-aware relighting, requiring appropriate material/normal separation. A blanket generated map is not evidence of correct face/hair/material response. No browser normal map or live relighting is used. |
| Offline 3D composition | Selected: actual mesh normals, lights, perspective, occlusion and contact shadows are baked into ordinary images. Provides static depth without per-frame rendering or distortion of game art. |

Thus **no depth maps or normal-map textures are used in the browser**. The original Blender geometry/materials determine the offline lighting; procedural stone bump is part of that render. Browser movement is a layered approximation, not a moving real 3D camera or hidden-surface reconstruction. Research informed the choice; no claim is made that this outperforms every possible depth-map implementation.

## Assets and integration

[Original render source](environment-study/render-environment.py) builds the chamber and a faceless, clothed demonstration figure from procedural meshes/materials. No external mesh, texture, HDRI, font or new Character image was acquired. Blender **4.3.2 / EEVEE**, already installed, rendered the 1440×810 images offline. [Render metadata](environment-study/render-info.json) and [asset identities](environment-study/manifest.json) record the outputs.

- `room.png`: perspective chamber, floor, indirect atmosphere and lighting.
- `study-figure.png`: original temporary figure **together with its podium and contact shadow**. The support is not moved independently from the feet.
- `foreground.png`: nearer stone/bronze surfaces rendered from the same camera.

`Figure study` is explicitly **not Character art**. Its heading says Lighting study, with Augusta example cards, not Lv90/S1 for the mannequin. `Character artwork` displays the existing unchanged reviewed cutout and the full-body source blocker. Character portrait selection returns to actual artwork. `Scene only` hides the functional cards without changing the camera crop; `Show cards` restores them. The accepted left Stats/Weapon/real Skills and right five Echoes stay in place.

Still mode has no motion. Subtle Parallax applies only rigid plane translation: background up to 2px opposite the subject, subject/support up to 2px, foreground up to 6px, settling over 1.1 seconds. Text/cards never transform. Pointer exit resets; reduced motion immediately restores zero displacement while retaining the same images, lighting and static perspective. There is no continuous animation, per-pixel warp or animated face/hair deformation. A small edge scrim supports UI readability; high-opacity Bellibing card content remains solid, without the previously faulty backdrop-filter scroll clipping.

The [committed standalone HTML](preview.html) embeds all selected images/styles/scripts. It is the actual reviewed delivery. The local allowlisted server defaults to port **4177**; Inventory/Teams/Endgame stay in the same prototype and retain their existing memory-only fixtures and ownership behavior.

## Comparison and honest limits

Compare the [old CSS environment](hero-correction-review/delivery-still-1440.png) with the [new room study](hero-depth-review/rendered-scene-still-1440.png), [same scene with actual cards](hero-depth-review/rendered-cards-still-1440.png), [subtle motion state](hero-depth-review/rendered-scene-parallax-1440.png), and [actual Augusta source](hero-depth-review/rendered-augusta-source-limit-1440.png). The new signals are rendered material volume, geometric occlusion, warm/cool separation and visible support/contact. Screenshots and assertions do not decide the owner's subjective visual acceptance.

**The full-body Character blocker remains.** Existing reviewed RolePile images are upper-body crops. The earlier documented owner-uploaded 42-PNG masters are not available in the current workspace/connection; their identity mapping does not establish full-body suitability. The three new reference screenshots do not supply an approved full-body runtime cutout. No missing anatomy was stretched, reconstructed or generated. The temporary original figure is a permitted technique demonstration, not replacement game art.

Actual Augusta is still a flat illustration with an original lower fade. Its uniform color/brightness adjustment and edge treatment are not physically correct surface relighting or floor contact. A final Character composition needs a permitted suitable full-body original **and** framing, light/matte/contact integration reviewed against that image. A depth map alone cannot repair the current crop. The mannequin is deliberately simple; its material/pose do not establish final Character presence. Raster layers cannot reveal unseen surfaces, and larger motion would expose their approximation. 1440×810 source images soften when enlarged on wider desktops; no 4K asset quality or universal performance is claimed.

## Focused evidence and stop

[Current evidence identity](hero-depth-review/identity.json) maps runtime/review sources, unchanged canonical inputs, rendered assets and portable delivery to hashes. Actual packaged Chromium checks cover 1440×900, wider 1920×1080/2560×1440 crops, the three requested study variants, rigid motion, stable cards, reduced motion, real Skills, honest artwork identity, offline navigation and unchanged account/resource sentinels. Existing Inventory/Team regression flows and the previous dark-canvas/package safeguards are rechecked.

Native `file://` is blocked by the managed browser; the exact self-contained HTML was rendered through permitted local HTTP then offline, with zero subresource requests. Source checks and `git diff --check` are focused REVIEW evidence, not FULL or production qualification. Production Build/Improve/Sandbox, canonical CharacterBuildState/data/art, private engine/policy/DPS, persistence/resources, CI and hosting are unchanged. User reference screenshots stay outside the public repository. No full suite, CI dispatch/polling, merge, deployment or PR-state change is authorized. **Stop for owner visual review.**
