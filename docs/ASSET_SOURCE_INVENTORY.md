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
