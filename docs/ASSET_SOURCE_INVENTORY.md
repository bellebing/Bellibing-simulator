# Wuthering Waves UI Asset Source Inventory

Last reconciled: 2026-09-20

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
