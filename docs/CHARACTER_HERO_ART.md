# Character Hero Art Foundation

Status: separate asset/runtime workstream. No Build UI integration in this slice.

## Purpose

Provide source-backed Character focal artwork for the large center presentation in the v34 Build workspace without enlarging the 256x256 Character selector portraits.

This workstream intentionally stays out of `v34-functional.html` while the PR214 Skills/Forte lane has completed-but-unpushed work. A small follow-up integration can consume this contract after that lane is pushed.

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

Numeric values remain `null` until they are reviewed in the real Build frame. They are not inferred from transparent pixel bounds.

Source composition was inspected for a deliberately varied sample:

- Augusta
- Jiyan
- Iuno
- Cartethyia
- Calcharo
- Lupa
- Zani

These show materially different semantic focal balance from long hair, wide poses, fabric/cape mass and foreground elements. A single blind `object-position: 50% 50%` rule is therefore not treated as reviewed presentation metadata.

When the Build integration is done, review the real component at:

- 1440x900
- 1920x1080
- 2560x1440

and store any required Character-specific values in the hero-art presentation mapping.

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

## Follow-up integration boundary

After the PR214 Skills/Forte lane is pushed, the smallest safe Build integration is:

1. load the hero-art manifest/resolver alongside released Character identity;
2. render the selected Character's READY `assetPath` inside the existing center `.focus` art layer;
3. keep Character name above the art;
4. preserve Stats / Skills / Weapon / Sequence / Echo layout and behavior;
5. apply reviewed component-local presentation metadata only;
6. contain the art behind surrounding Build controls;
7. leave a clear pending state for unresolved Rover identity rather than substituting a portrait or arbitrary Rover gender;
8. perform the three desktop live-browser reviews before claiming visual parity.

BUG-030 is not affected by this foundation.
