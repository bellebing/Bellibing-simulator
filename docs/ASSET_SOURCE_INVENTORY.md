# Wuthering Waves UI Asset Source Inventory

Last reconciled: 2026-09-22

This document tracks source snapshots used for Bellibing visual-asset evaluation. Raw source material is kept separate from runtime/UI assets. Importing a source snapshot does **not** make every image a canonical Bellibing asset and does not change gameplay/data verification.

## Current source pins

### ryanbenson/wuthering-waves-assets

- Repository: `ryanbenson/wuthering-waves-assets`
- Pinned commit: `d77801ecfb8c3abc950c1ffbc6ddec94f5129889`
- Source README states that its CLI obtains Character, Weapon, Echo and Enemy image lists from Encore API and writes them under `images/`.
- Current pinned `images/` inventory observed before snapshot:
  - 972 image files after excluding `.DS_Store` and `.gitkeep`
  - 468 under `images/echoes/`
  - 130 under `images/weapons/`
  - 244 under `images/enemies/`
  - 6 under `images/icons/`
  - 124 other/root image assets, including Character/reference portraits and related icons
  - about 33.0 MB total by Git blob sizes
- Use: first-pass Echo/Weapon image inventory; Character portraits are reference/back-up only because Bellibing intends to create its own Character portrait captures.

### TomyJan/WutheringWaves-UIResources

- Repository: `TomyJan/WutheringWaves-UIResources`
- Pinned branch/commit: `3.6` / `5b3d1d128ed3938cbb8e5260ba07b075b321a7c6`
- Source README describes the repository as unpacked Wuthering Waves UI resources.
- GitHub reports the full repository at roughly 45 GB, so Bellibing does not mirror the whole repository blindly.
- First source snapshot includes:
  - `UIResources/UiRole/`
  - `UIResources/UiInventory/`
  - `UIResources/UiTeam/`
  - `UIResources/UiCreateRole/`
  - `UIResources/UiNewRole/`
  - `UIResources/UiArchive/`
  - `UIResources/UiMonsterAbsorb/`
  - `UIResources/Common/Atlas/SkillIcon/`
  - `UIResources/Common/Atlas/_SpriteTextures/`
  - `UIResources/Common/Image/ArchiveRole/`
  - `UIResources/Common/Image/ChipIcon160/`
  - `UIResources/Common/Image/ChipIcon256/`
  - `T_RoleShare_*.png` and `T_WeaponShare_*.png` from `Common/Image/BgCg/`
- Deliberately not included in the first snapshot:
  - all of `Common/` (~9.38 GB)
  - all of `UiLuckdraw/` (~0.91 GB)
  - unrelated UI families
- These can be added selectively when a concrete Bellibing asset role needs them.

## Raw vs runtime rule

Raw snapshots are source/reference material. Bellibing runtime/UI assets will be selected and processed separately.

A future runtime asset record should carry at least:

- Bellibing entity ID and asset role;
- source/provenance;
- source file identity;
- focal point / visual anchor;
- crop/safe-area metadata;
- static vs optional living-still derivative;
- replaceability without changing entity/gameplay data.

Character/hero art must use a semantic visual focal point (normally face or upper chest), not the geometric center of the full image. Weapon silhouette outliers must not pull Character centering away from the Character.

## Snapshot workflow

`.github/workflows/snapshot-ui-asset-sources.yml` builds a pinned, checksum-manifested source artifact without adding the raw binary archive to the normal Bellibing source tree.

The artifact is a transport/archive step only. It must not be treated as production UI integration or proof of final visual approval.


## Verified first snapshot

Snapshot workflow run `35512564627` completed successfully on 2026-09-20 from PR #201.

GitHub artifact:

- name: `bellibing-wuwa-asset-source-snapshot`
- artifact size: `502,798,915` bytes
- artifact digest: `sha256:b5a3f182c4b0abe7a79de2cd0f69d8ae050f494dbf9e0fa5f7d6a804fd3917d7`
- raw manifest: `2,984` files / `503,064,872` bytes
- durable archive copy: `Bellibing Asset Sources/bellibing-wuwa-asset-source-snapshot-2026-09-20.zip` in the Bellibing file Library

Observed source-file counts inside the raw snapshot:

- Ryan: 468 files under `images/echoes/`, 130 under `images/weapons/`, 244 under `images/enemies/`, 6 under `images/icons/`, and 124 other/root image assets.
- TomyJan: 504 `UiRole` files, 72 SkillIcon files, 1,196 selected reusable sprite textures, 56 RoleShare files, 47 WeaponShare files, plus 134 other explicitly selected UI files.
- Four manifest files carry source pins, file listing, summary and SHA-256 checksums.

### Echo thumbnail coverage check

Bellibing current `src/data/echoes.ts` contains 181 released canonical Echo entries at this checkpoint.

The Ryan source snapshot contains 313 top-level `images/echoes/*.webp` candidate icons. A name-normalized comparison (including Unicode diacritic normalization, e.g. `Jué` → `Jue`) found a source icon for **181 / 181** released canonical Echoes.

The remaining source files include duplicates, variants and non-canonical candidates. They must not be auto-promoted or auto-mapped without entity review.

Spot-checked snapshot assets:

- `Crownless.webp` — 256×256 RGBA WebP
- `AbyssalGladius.webp` — 256×256 RGBA WebP
- `Jue.webp` — 256×256 RGBA WebP
- `ThunderflareDominion.png` — 256×256 PNG

This establishes complete first-pass Echo thumbnail source coverage, not final runtime selection/cropping approval.


## User-supplied 5-star Character master collection

Received 2026-09-22 as `Characters.zip` for the New UI Character asset pass.

Durable raw storage:

- Library archive: `Bellibing Asset Sources/Characters/5-star/Characters-2026-09-22.zip`
- Archive SHA-256: `d5c498a68bc05677480e06ac5244fc0602f33c0cf4223977b71e425a0c32dda8`
- Library manifest: `Bellibing Asset Sources/Characters/5-star/character-5star-capture-manifest-2026-09-22.json`
- Manifest SHA-256: `945fe86b4d63c5b7dd11945af2327cfeb5a24dbe61d3ff6130eb0338ca2234b4`

Verified raw collection facts:

- 42 image files;
- 31,296,808 total uncompressed image bytes;
- all 42 are PNG;
- all 42 are RGBA with transparency;
- no byte-identical duplicate files by SHA-256;
- image dimensions range from 543–1582 px wide and 1057–1438 px high;
- source filenames are generic `image-Photoroom...` names and are **not** canonical Character identity.

### Master-image rule

These 42 files are treated as immutable visual masters for this collection.

- Do not overwrite them with resized, sharpened, AI-generated or reconstructed versions.
- Do not use generative reconstruction to invent missing pixels/details.
- Any web optimization, resize, crop, portrait extraction or optional living-still treatment must be a separate derivative.
- Character identity mapping is currently `PENDING_IDENTITY_REVIEW`; do not infer entity IDs from file order.
- Semantic focal points and safe-crop metadata remain pending until each Character identity is verified.
- Runtime/UI import remains pending; raw masters stay outside the normal app source tree until mapping and derivative selection are reviewed.

### Identity review result

The 42-file collection is now mapped **42 / 42** in `docs/CHARACTER_ASSET_MAPPING_5STAR.md`.

- reviewed mapping status: `REVIEWED_42_OF_42`;
- reviewed mapping JSON is stored durably beside the archive in Bellibing Library;
- mapping JSON SHA-256: `1d7869d9f90c0ca564b3cd20ac2e6726a8841421c108f2601cb8670fa4e546bc`;
- Rover is not present in this uploaded collection;
- Jingran is present at capture index 41 and remains `CONFIRMED_UPCOMING` in the current Bellibing catalog;
- identity review does not authorize runtime import or imply focal/crop approval.


## Character portrait library import

Imported 2026-09-22 from pinned source `ryanbenson/wuthering-waves-assets@d77801ecfb8c3abc950c1ffbc6ddec94f5129889`.

Repo/runtime source location:

- `docs/ui-prototypes/assets/characters/portraits/`
- published by normal build to `dist/ui-preview/assets/characters/portraits/`
- manifest: `docs/ui-prototypes/assets/characters/portraits/manifest.json`

Coverage at this checkpoint:

- Bellibing Character catalog: 60 entries;
- 56 non-Rover catalog entries have an exact source portrait copied byte-identically and renamed to canonical Bellibing ID;
- among those 56: 53 `RELEASED`, 1 `CONFIRMED_UPCOMING` (Jingran), 2 `UNRELEASED_WIP` (Hsin, Suoming);
- all 4 released Rover element IDs remain mapping-pending because the source provides female/male variants instead of one canonical Bellibing portrait;
- 10 Rover source candidate paths are preserved under `portraits/rover-candidates/`;
- source quirks are preserved rather than hidden: several Rover element/gender files share identical Git blob SHA values in the pinned upstream.

UI eligibility is controlled by manifest metadata, not by file existence. `UNRELEASED_WIP` and `CONFIRMED_UPCOMING` portrait files must not be surfaced as released selector entries merely because their PNG is present.

No image pixels were regenerated, resized, sharpened or otherwise altered during import. Each imported blob is byte-identical to the pinned upstream source.


## Echo + Weapon static runtime libraries

Imported 2026-09-22 from pinned `ryanbenson/wuthering-waves-assets@d77801ecfb8c3abc950c1ffbc6ddec94f5129889` using `scripts/import-ui-static-assets.mjs`.

### Echoes

- target: `docs/ui-prototypes/assets/echoes/icons/`;
- build target: `dist/ui-preview/assets/echoes/icons/`;
- canonical released coverage: **181 / 181**;
- import transform: `NONE_BYTE_IDENTICAL_COPY`;
- source extras/variants are excluded unless mapped to a canonical released Bellibing Echo;
- manifest: `docs/ui-prototypes/assets/echoes/manifest.json`.

### Weapons

- target: `docs/ui-prototypes/assets/weapons/icons/`;
- build target: `dist/ui-preview/assets/weapons/icons/`;
- canonical Weapon coverage: **122 / 122**;
- rarity coverage: 5×1-star, 5×2-star, 21×3-star, 43×4-star, 48×5-star;
- import transform: `NONE_BYTE_IDENTICAL_COPY`;
- unmatched source extras are excluded;
- manifest: `docs/ui-prototypes/assets/weapons/manifest.json`.

### Rover initial portrait policy

User approved a deliberately simple first-pass policy: choose the first matching source portrait for each Rover element.

Current canonical mapping:

- `rover-aero` → `images/RoverAeroFemale.png`;
- `rover-electro` → `images/Roverelectrofemale.png`;
- `rover-havoc` → `images/Rover-Havoc.png`;
- `rover-spectro` → `images/Rover-Spectro.png`.

The original 10 Rover candidates remain preserved for later redesign without re-sourcing.

This checkpoint is static-asset foundation only. Parallax, living-still motion, glow and animation are explicitly deferred until the simple functional New UI is working.


## Echo portrait runtime library

Imported 2026-09-23 from pinned unpacked-game UI source `TomyJan/WutheringWaves-UIResources` branch `3.6` @ `5b3d1d128ed3938cbb8e5260ba07b075b321a7c6`.

- source family: `UIResources/Common/Image/IconMonsterHead732/*.png`;
- target: `docs/ui-prototypes/assets/echoes/portraits/`;
- build target: `dist/ui-preview/assets/echoes/portraits/`;
- canonical released coverage: **181 / 181**;
- import transform: `NONE_BYTE_IDENTICAL_COPY`;
- manifest: `docs/ui-prototypes/assets/echoes/portraits/manifest.json`;
- role separation: these are `echo.portrait` assets and do not replace the existing 181 `echo.icon` assets.

Final import provenance is byte-exact rather than visual/fuzzy: every one of the 181 canonical Bellibing portrait PNGs has the same Git blob SHA and byte size as exactly one file in the pinned upstream `IconMonsterHead732` directory. The manifest records canonical Echo ID/name, exact upstream source path, source Git blob SHA, source byte count and target path. `scripts/audit-ui-echo-portraits.mjs` fails closed on canonical-set drift, file-count drift, target byte changes or provenance SHA mismatches.

The source-resolution audit that preceded import remains useful historical context: 134 current entries mapped by the same current `IconMonsterHead` suffix, 46 older `IconMonsterGoods` entries mapped through exact monster-name→head identity from WaveTools, and Baby Roseshroom was resolved through the verified current/legacy alias plus monster ID `310000220` → head `305`. After import, binary identity against the pinned upstream file is the durable per-file proof.

This slice is static portrait asset coverage only. Functional Echo selector/detail wiring, full-art reveal and parallax/living-still motion remain separate later work.


## Builder icon foundation

Imported 2026-09-23 as a selective New UI builder-visible icon library.

Pinned sources:

- `DommyMM/wuwabuild@5fa70b11f1d84fb644e4dbed47873708da0fe66f`
  - `public/Data/Characters.json` for exact Character skill and S1-S6 icon references plus Character element identity;
  - `public/Data/Fetters.json` for exact Sonata-set icon references;
  - `public/Data/Stats.json` for the Bellibing builder stat vocabulary and shared stat icon references;
  - referenced assets copied byte-identically from `public/assets/`.
- `TomyJan/WutheringWaves-UIResources` branch `3.6` @ `5b3d1d128ed3938cbb8e5260ba07b075b321a7c6`
  - Echo COST 1/3/4 inventory sort icons from `UIResources/UiInventory/Image/T_SortCost{1,3,4}.png`.

Runtime/source location:

- `docs/ui-prototypes/assets/builder-icons/`
- build target: `dist/ui-preview/assets/builder-icons/`
- manifest: `docs/ui-prototypes/assets/builder-icons/manifest.json`
- reproducible importer: `scripts/import-ui-builder-icons.mjs`
- fail-closed audit: `scripts/audit-ui-builder-icons.mjs`

Verified scope:

- **819 physical image assets**;
- **6** Character element icons;
- **34 / 34** Sonata-set icons;
- **58** source-resolved logical Character kits;
- **411** unique Character skill icons covering **464** logical-kit skill references; the five shared weapon-type Normal Attack icons are included here rather than duplicated as another library;
- **348** unique S1-S6 Resonance Chain icons covering all six chains for each source-resolved logical kit;
- **20** Bellibing stat labels backed by **17** unique stat image files where upstream intentionally shares HP/HP%, ATK/ATK% and DEF/DEF%;
- **3** Echo COST icons for COST 1 / 3 / 4.

The upstream Character file contains 62 rows and 496 skill / 372 chain references because Rover gender variants are separate source rows. Bellibing collapses each Rover element to one logical kit only after verifying that the duplicate source rows reference identical skill and chain assets.

Hsin and Suoming remain explicitly excluded from this library because their Bellibing catalog entries are `UNRELEASED_WIP` and no pinned source-resolved kits exist for them here.

EXP, Tuner and other material icons remain **PENDING_SOURCE_MAPPING**. No `IconA`, `IconRup`, `IconWup` or look-alike material images are promoted until item ID -> canonical name -> exact asset path is source-resolved.

Rarity stars, locks, plus/minus controls and other generic builder chrome remain CSS/SVG/UI and are not imported as game assets.
