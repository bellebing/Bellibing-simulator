# Character Hero Art Foundation

Status: integrated into the real v34 Build workspace in stacked draft PR216; PR214 and PR215 remain separate, open, draft and unmerged.

## Purpose

Provide source-backed Character focal artwork for the large center presentation in the v34 Build workspace without enlarging the 256x256 Character selector portraits.

PR216 starts from exact PR214 head `b2bf583f6729a3cf01b280fca890f73f0d44cd5e` and consumes this contract without merging PR214 or PR215. The browser-facing projection is generated through `createCharacterHeroArtResolver`; `v34-functional.html` does not reimplement provenance or Rover resolution.

## Source decision

Historical inspection did not find an already-complete runtime hero-art solution:

- PR192 / PR196 recover and lock the three v34 Home parity artworks. They are Home navigation art, not a roster-wide Character hero-art mapping.
- PR205 wires Character selector identity and Sequence art but explicitly leaves the large center Character focal/full art pending.
- The recovered Library collection `character-5star-user-captures-2026-09-22` contains 42 reviewed 5-star hero masters, but Rover is absent, the raw masters remain outside the normal runtime tree, and focal/safe-crop review is still pending.

The canonical runtime foundation therefore uses the already-established Bellibing upstream snapshot:

- repository: `DommyMM/wuwabuild`
- commit: `5fa70b11f1d84fb644e4dbed47873708da0fe66f`
- Character mapping: `public/Data/Characters.json -> icon.banner`
- asset family: `public/assets/UIResources/Common/Image/IconRolePile/*.webp`

The files in `docs/ui-prototypes/assets/characters/hero-art/` are byte-identical copies of the pinned upstream blobs. No portrait upscaling, image generation, raster resampling, or format conversion is performed.

## Runtime contract

`src/characterHeroArt.ts` exposes released-only resolution:

- `READY`: source-verified local hero art can be returned.
- `PENDING`: the released Character is deliberately unresolved and `resolve()` returns `null`.
- `UNAVAILABLE`: upcoming, WIP, or unknown Character.

Current coverage:

- released Characters: 57
- READY: 53
- PENDING: 4 Rover element IDs
- upcoming/WIP excluded: Jingran, Hsin, Suoming

### Rover

Bellibing's canonical Rover IDs currently encode element, not gender:

- `rover-aero`
- `rover-electro`
- `rover-havoc`
- `rover-spectro`

The pinned source has separate male and female `IconRolePile` assets for every Rover element. Choosing one would guess Character visual identity, so all four Rover entries fail closed until the Build state has an explicit Rover gender/variant identity.

The manifest records both exact candidates and their source Character IDs so the follow-up can resolve them without rediscovery.

## Presentation metadata

Hero art is component-local presentation data, not gameplay/mechanics data.

Each ready mapping carries:

- `safeFraming`
- `reviewStatus`
- `scale`
- `offsetX`
- `offsetY`
- `focalAnchor`

Every READY row carries explicit safe Build defaults: `CONTAIN`, scale `1`, offsets `0/0`, focal `0.5/0.5`. These values are Character-local presentation metadata and are never inferred from transparent pixel bounds. A row is marked `REVIEWED` only after real rendered inspection.

Real Build-frame presentation was reviewed for the required deliberately varied sample:

- Augusta
- Jiyan
- Iuno
- Cartethyia
- Calcharo
- Lupa
- Zani

These show materially different composition from long hair, wide poses, fabric/cape mass and foreground elements. They were reviewed in the real Build workspace at 1440x900, 1920x1080 and 2560x1440. The safe defaults remained visually correct after the Character focus frame was made Sequence-safe.

The 1440x900 READY-roster evidence was also scanned for obvious outliers; Brant, Lucilla, Phoebe, Qingxiao, Rebecca, Roccia, The Shorekeeper, Yangyang Xuanling and Phrolova received explicit outlier review. Their safe CONTAIN defaults were retained. Other READY Characters keep explicit safe defaults but are not relabelled REVIEWED without an individual review claim.

## Validation

`test/characterHeroArt.test.ts` verifies:

- all 57 released Characters are exactly READY or PENDING;
- no Jingran/Hsin/Suoming leakage;
- every READY runtime file exists;
- every READY local file's Git blob SHA matches its pinned source blob SHA;
- hero assets are WebP focal art and are not 256x256 selector portraits;
- Rover stays fail-closed with exact M/F candidates;
- target/source path drift is rejected;
- malformed provenance is rejected;
- `REVIEWED` presentation status cannot be claimed with missing presentation values.

The normal web build already copies the complete `docs/ui-prototypes/assets/characters` tree, so the hero-art folder and manifest publish under `/ui-preview/assets/characters/hero-art/` without a new build-path special case.

## Build integration

PR216 adds a resolver-derived browser projection at `assets/characters/hero-art/runtime-data.json` and renders READY art in the existing independent center `.focus` layer. Character name remains above the artwork. Selector expansion/collapse does not reposition or scale the focus layer.

The art frame uses a desktop-safe center zone that remains clear of the Sequence rail and Echo stack. The image itself is absolutely contained inside that frame, so `object-fit: contain` cannot silently grow an intrinsic image box beyond the reviewed region.

Rover Aero/Electro/Havoc/Spectro render an explicit `HERO ART PENDING` state with no image source and no guessed gender/portrait substitution. Stats, Skills/Forte, Weapon, Sequence, Echo and Add to Account retain their existing runtime behavior.

Dedicated real-Chrome verification loads all 53 READY mappings, exercises all four Rover pending mappings, checks selector/focus independence, checks Sequence/Echo separation, and reviews 1440x900 / 1920x1080 / 2560x1440. Visual evidence is uploaded for the required sample plus the 53-Character 1440 focus roster.

BUG-030 remains unchanged; this Hero Art slice does not by itself satisfy the wider live/UI parity criteria.
