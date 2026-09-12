# Bellibing UI Agent Start

Use this as the start contract for a new UI-building AI/Codex session.

## Role

You own Bellibing UI implementation only. Backend/data/runtime is a separate lane unless explicitly assigned.

Do not redesign from old Alpha. Continue the accepted v34 UI baseline and make one user-approved slice at a time.

## Mandatory first reads

1. actual GitHub `main` and current UI PR/branch;
2. `docs/UI_UX_STATUS.md`;
3. `docs/UI_BUILD_HANDOFF_V34.md`;
4. `docs/ui-prototypes/v34-functional.html`;
5. `docs/ui-prototypes/assets/v34/README.md`;
6. `docs/ui-prototypes/assets/v34/LIBRARY_SOURCE.md`;
7. `docs/ui-prototypes/assets/v34/fonts/etna/EXTERNAL_PARITY.md`.

If actual GitHub differs from old chat context, actual GitHub wins.

## Current UI lane

At the time this file was written:

- draft PR: `#196`
- branch: `ui/v34-parity-foundation-2026-09-12`
- canonical base at branch creation: `2b1ba64a239338a91919c96afe1f8f4ed9516a73`

Fresh-read before making changes because the head may have advanced.

Do not create another UI branch/PR just because this session is new. Continue PR #196 while it remains the active UI lane unless the user explicitly changes that.

## First task — finish parity foundation, not new features

The accepted v34 HTML shell and build pipeline are already restored. The remaining hard blocker is publishing the **exact processed image bytes**.

Search the ChatGPT Project Library by exact filename:

- `bellibing-ui-build-character-rover.webp`
- `bellibing-ui-improve-character-augusta.webp`
- `bellibing-ui-build-team.webp`

Materialize/copy those files into:

- `docs/ui-prototypes/assets/v34/bellibing-ui-build-character-rover.webp`
- `docs/ui-prototypes/assets/v34/bellibing-ui-improve-character-augusta.webp`
- `docs/ui-prototypes/assets/v34/bellibing-ui-build-team.webp`

Do not use the old PR #192 binary blobs. Do not recompress/re-export the Library assets.

Before commit, exact local verification must equal:

- Rover: 72,646 bytes; SHA-256 `a046d22aa0edaf4951fd3ab9a0aed9266134369a03b9ffadbd1948cd8542aec1`
- Augusta: 122,828 bytes; SHA-256 `329feea213f8193df4149c97fc6379a0617bcf4cf2e563a590e228d1fcfc7a27`
- Team: 387,950 bytes; SHA-256 `afb5e69db9321dbfbfbe209d263301b4bd1371307912d79aba8a7ce354c0c527`

If any check differs, stop that asset publication attempt and recover the exact Library file again. Do not silently substitute a lookalike.

## Font lock

The accepted parity face is ETNA.

Temporary exact visual oracle:

`https://db.onlinewebfonts.com/c/3c1a4128f95e2109303b045eda4bfe8a?family=Etna`

Display declaration:

`font-family: "Etna", Inter, sans-serif;`

Use ETNA for Home titles, `What Character?`, Character names and major/short section headings. Utility/body text stays Inter/system sans.

Do not pick a different Etna, Etna Extended or a lookalike. Do not distort size/weight/letter-spacing just to imitate the wrong font.

Future production-local candidate is the official ETNA Free Font by Krišjānis Mežulis / WILDTYPE / OTF; preserve license/provenance and visually compare against the external oracle before switching.

## Typography composition lock

For card/selector identity:

**text first → visual subject below**.

Short title/Character name is a header, not a footer.

Peer titles/names must remain one line. Do not make `Shorekeeper` wrap while a shorter peer remains one line. Use group/container sizing or one responsive font-size rule for the peer group instead.

Baseline CSS guard:

```css
white-space: nowrap;
overflow-wrap: normal;
word-break: keep-all;
hyphens: none;
```

Compact circular portrait-strip labels may stay beneath the portrait, because that is a separate compact state.

## Home visual lock

Desktop baseline:

- card `390 × 500`;
- wheel spacing `318px`;
- center scale `1.075`;
- immediate side scale about `0.905`;
- side cards stay large and near center;
- Home titles are at the top;
- no grid/space-between redesign.

Exact art crop rules are in `UI_BUILD_HANDOFF_V34.md`. Do not normalize them into one generic `object-fit` rule.

## Character selector lock

Initial desktop:

- `What Character?` first/only focus;
- cards `252 × 352`;
- spacing `228px`;
- center scale ~`1.07`, side ~`0.91`;
- Character name at top of the full/minicard state;
- no inconsistent name wrapping.

After selection:

- compact round portraits `82 × 82`;
- spacing `98px`;
- hover-expanded spacing ~`126px`;
- first large→compact transition ~`920ms`;
- collapse delay `320ms`;
- hover alone never switches Character.

## Desktop first, mobile second

Primary product target now is desktop web + desktop app.

Do not hide desktop Stats/Weapon/Echoes/Sequences behind mobile-style dropdowns just to make one layout universal.

Mobile comes second and should reuse the same components/data with progressive disclosure/tap-open sections when screen space requires it.

## Verification before continuing

After exact assets are committed on the same PR:

1. build the web artifact;
2. verify the three copied files in `dist/ui-preview/assets/v34/` have identical byte counts/SHA-256;
3. run established Verify + Export gates;
4. open `/ui-preview/` in a real desktop browser;
5. verify ETNA rendering, Home center/side scale, all three image crops and one-line headers;
6. verify Build initial Character wheel and selected-state focus;
7. only then add the next feature slice.

Green CI alone is not visual verification.

## Slice workflow after parity

Work:

`preview → browser check → user approval → coherent GitHub checkpoint → next slice`

Do not commit every 3-pixel experiment. Do not build the entire app before checkpointing.

Good next slices after parity:

1. header-first/no-wrap Character selector refinement if not yet fully implemented/verified;
2. Weapon selector;
3. Echo-slot interaction;
4. Sequence interaction;
5. Build/stats refinements.

Do not merge PR #196 without explicit user authorization.
