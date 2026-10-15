# Character Hero compositions

The approved Character Card is recoverable at `4b05fe1fd2d63c49b066a52ecf21f6f4dc503bf4`. It remains the default when `hero` is absent or unsupported. Neither alternative is designated the winner.

- `?hero=elegant`: left-aligned name and epithet below a fuller artwork region; rarity and concise metadata share a quiet baseline. The artwork leaves a dedicated Sequence lane, with restrained circular light.
- `?hero=cinematic`: closer, slightly offset artwork; deeper radial lighting and a slanted arc; centered rarity, larger name, epithet and metadata. The portrait region is modestly taller.

Both use one existing Character Card presenter. Hero-only markup and `hero-variations.css` change the composition; Weapon, Skills, stats and surrounding UI remain owned by their existing code. Query selection survives Character switching. There is no duplicate app, new fixture or new artwork.

In both alternatives identity is normal-flow content below the artwork, so titles no longer cross faces. Element icons join existing Level/Weapon Type metadata. No level or epithet is invented for other Characters. Sequence uses larger source illustrations, anchored above the artwork's lower edge, S6 above S1. Visible position/unknown placeholders are removed; accessible labels, group state and native tooltips retain the actual unavailable investment information. Unknown investment never becomes S0 or an unlocked chain. Portrait fallbacks get a contained circular treatment.

## Brief reference pass

Reference touchpoints were a [Wuthering Waves Character attributes screen](https://i.postimg.cc/GhD3Yvgp/Wuthering-Waves-20250501120833.jpg) and [Amara showcase artwork](https://www.gamersdecide.com/sites/default/files/2019-10/bdl3-amara.jpg), alongside the actual repository Augusta/Aalto illustrations and approved Bellibing UI. The design decision is to give artwork and identity their own space, using silhouette, scale and a controlled light-to-dark transition. No reference branding/assets are copied. `docs/ui-references/README.md` is absent from this checkout; no claim is made to have re-reviewed its screenshots.

## Verification

`tools/review-hero.mjs` exercises both queries at 1440/1920/2560 in real Chromium, with Augusta, Aalto, Shorekeeper, Jiyan and Hsin. It checks different proportions, 4/5-star identity, portrait fallback, title/metadata bounds, bottom-anchored S6–S1 illustrations, accessible unknowns, Character switching, retained Skills expansion and unchanged Weapon/Workshop dimensions. Existing Character Card, Carousel and Workshop checks continue on the approved default. No screenshots, recordings, before/after images or review bundles are generated.
