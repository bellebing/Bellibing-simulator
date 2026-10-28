# Hero correction — historical delivery review

2026-10-28, Europe/Stockholm. **Historical correction evidence for the CSS-room candidate.** Its background was subsequently rejected; [the current rendered environment study](HERO_DEPTH_STUDY.md) supersedes that composition. White-canvas findings and preserved historical bug evidence below remain relevant. No production implementation or release.

## Change and accepted references

The previous central rounded Hero card is replaced by one full-width room behind both functional card stacks. A workspace-wide ceiling/wall, columns, atmospheric separation, projected floor and restrained foreground create static depth. Cinematic Still and bounded Subtle Parallax share this composition. Three separate left cards hold Stats, Weapon and visible real Skills/Forte; five right Echoes retain aligned primary/secondary/substat values. The Character cutout is unframed and central. Inventory and Team layouts/ownership are preserved.

Real local Chromium views of the existing Build (including its actual Forte menu), Improve and Echo Sandbox informed the correction. Build's real Character identity/skills and Improve/Sandbox's blue-black card gradients, fine warm borders, muted text, gold accents and compact controls are reused as visual references. This deliberately replaces the previous green-tinted, mostly uncarded left column. Their production DOM/CSS/data remain unchanged. Functional card opacity stays high enough for readable text over the environment; parent opacity does not fade content. ETNA fallback availability is not font pixel-parity approval.

## White-canvas investigation

The previously delivered portable HTML (SHA-256 `3dee4793756a4d8827be23559785a0f628a706c58ac0e30a7dd9f9e34bf98b0b`) and its HTTP version both rendered dark in Chromium: html `rgb(12,17,21)`, text `rgb(232,233,229)`, two active stylesheets; portable had zero external stylesheet links. The previous body was transparent and relied on html. **The owner's almost-white rendering was not reproduced; its cause is unresolved.** No specific viewer/browser cause is asserted without evidence.

The then-reviewed standalone delivery was committed as `preview.html`; the current file now follows the newer rendered study. Its historical bytes are identified in the linked evidence. `index.html` is explicitly labelled as multi-file development source; saving it alone loses its CSS/modules and is not a supported delivery path. This is a concrete missing-stylesheet failure mode, but does not establish which file/viewer the owner used.

The corrected delivery embeds exact CSS with callback replacements (avoiding replacement-string interpolation), fails packaging if a stylesheet/module dependency remains, and declares opaque dark backgrounds/light foreground on html, body and app, including minimal inline fallback and dark color-scheme metadata. Packaged Chromium review uses OS light preference and also verifies the dark critical canvas with styles disabled. The complete design still requires CSS and JavaScript; sanitizing HTML previewers are not certified. No external font/style/network dependency is needed.

A separate real visual defect **was** reproduced during this correction: backdrop-filter inside the scroll owner clipped parts of Stats/card text even when structural checks passed. Build cards now use high-opacity dark surfaces without backdrop-filter; actual delivery screenshots show complete text. Visual review, rather than a green structural assertion alone, established this correction.

Managed Chromium denies native `file://`; no policy bypass was attempted. The exact generated HTML is fulfilled as a permitted local HTTP document and then exercised offline. Screenshots below are of that packaged document, not a separately rebuilt mock or static screenshot implementation. Native file launch and the owner's actual delivery viewer remain unverified.

## Full-body source blocker — not visually complete

- All 53 existing RolePile Hero assets were inspected together; these are cropped upper-body illustrations and provide no suitable standing full-body source. Augusta/Jiyan/Calcharo remain byte-identical reviewed files. Full framing cannot recover absent anatomy.
- Existing Hero manifest and [asset inventory](../../ASSET_SOURCE_INVENTORY.md) document a separate owner-uploaded 42-PNG collection. [Identity mapping](../../CHARACTER_ASSET_MAPPING_5STAR.md) identifies Augusta at capture 23, Jiyan at 05, Calcharo at 04. Identity approval does not establish full-body/framing suitability.
- No archive or raw masters are available in the current checkout/workspace. Connected Drive discovery found the documented Asset Sources folder but returned no accessible children; filename/folder/image searches found no accessible archive/Photoroom files. This proves an access gap, not that the owner's originals have been deleted. No third-party files were copied to replace them.
- The pinned upstream's Common/Image directory contains the existing RolePile family and head icons, not a newly verified full-body family. [Kuro's derivative guidelines](https://wutheringwaves.kurogames.com/p/en/produce.html) were read: they do not establish blanket software-art redistribution permission. Public availability alone is not rights clearance. No art was acquired under an invented license.

**Smallest next step:** recover the owner's existing `Characters-2026-09-22.zip` / reviewed mapping (archive SHA-256 `d5c498a68bc05677480e06ac5244fc0602f33c0cf4223977b71e425a0c32dda8`) or supply one approved full-body original; verify identity, source/usage scope and actual head-to-feet pixels, then review CONTAIN placement/contact with this room. Preserve the master; no generative reconstruction, stretching or guessed feet. If those masters are also cropped, obtain a genuinely approved full-body source. This task does not label the current upper-body study a finished standing Hero.

## Focused evidence and preserved boundaries

[Evidence identity](hero-correction-review/identity.json) maps actual runtime/review sources, unchanged canonical asset/source inputs and the portable file to their hashes. Results: 18 Hero/Team, 14 Inventory, 4 portable, 7 packaged correction checks PASS; three concept Forte projections exactly match the existing resolver/source output. Real Chromium screenshots cover Still/Parallax/reduced motion, visible Skill icons, details, desktop 1440×900/1920×1080/2560×1440, normal navigation, equipment transfer and demo-account sentinel preservation. No full build/suite/FULL verification was run.

[Before](hero-correction-review/previous-delivery.png) → [corrected packaged Still](hero-correction-review/delivery-still-1440.png), [Parallax](hero-correction-review/delivery-parallax-1440.png), [Skills](hero-correction-review/delivery-source-skills-1440.png). References: [Improve](hero-correction-review/accepted-improve.png), [Sandbox](hero-correction-review/accepted-sandbox.png), [Build](hero-correction-review/accepted-build-selected.png), [Forte](hero-correction-review/accepted-build-forte.png).

All edits stay under this isolated concept directory. CharacterBuildState, real ownership/persistence/resources, production Build/Improve/Sandbox, private engine/policy/DPS, canonical data/art and CI definitions are unchanged. Team numbers remain labelled examples, not live private results. No merge/deployment authorization is inferred. Stop for owner visual review; full-body acceptance remains blocked.
