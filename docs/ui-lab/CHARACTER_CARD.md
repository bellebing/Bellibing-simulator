# Saved Character Card

This refinement preserves the approved right panel's placement, dimensions, Character framing and shared type/color roles. The previous approved revision is recoverable at `21ee192f3fd464023d381cdfa0cb11d07aed226e`.

## Presentation and ownership

`v1.1/modules/character-card.js` is a read-only presenter mounted by the existing Lab adapter. It reads the fixture's saved/current stat column only. The twelve rows retain their order; Skill/Liberation labels use their full Resonance names. Echo candidates, simulation scope, feedback and run records never supply its values. Comparison headings, projected values and evaluation captions are removed. No real account, persistence or projection engine is imported.

The Character's rarity comes from `src/data/characters.ts` through the existing catalog exporter. Supported 5/4-star identities get five gold/four purple stars and restrained atmosphere in the existing circular region. Missing/unsupported rarity remains explicit and neutral. Element icons reuse the verified builder assets. Existing Character art/framing and Augusta's fixture epithet remain; unknown epithets are not invented.

The Weapon is resolved by the fixture's existing equipped name against the canonical Weapon export. Rarity is independent of Character rarity. Existing Augusta Level 90/R1 context is preserved only for its exact equipped Weapon; generic equipment text for other fixtures cannot resolve an identity, image or rarity. Canonical rarities 1–5 have shared presentation accents; unknown equipment is neutral/unavailable. No signature Weapon is assigned by Character identity.

The right-edge read-only Sequence chain follows the existing Build/Card family: source icons, S6 above S1, circular nodes, gold active states and muted inactive states. Only an explicit saved level in 0–6 supplies activation. The current Lab fixtures have no saved Sequence level; their six nodes show question marks and Unknown, rather than assuming S0.

Native Skills disclosure uses the existing button/chevron vocabulary and occupies real space below Weapon. Stats move down/up; the outer Character panel toggles independently. Its read-only five-column Forte tree reuses the established source node coordinates, parent links and assets from the existing Skills renderer. No production normalizer is called: fresh-build defaults would falsely invent maxed investment. Explicit schema-v1 saved levels/enabled flags can be displayed; current fixtures have none, so known source icons remain available with unknown levels/states. Hsin/Jingran lack a verified presentation tree and show Skills unavailable. Expansion intent is kept per Character in component-local memory.

## Sources and standalone boundary

Read before implementation: `docs/UI_CHARACTER_BUILD_CARD.md`, `docs/ui-prototypes/assets/character-build-card.js`, and the existing `skillsUi.renderTree` / Sequence adapter in `v34-functional.html`.

`tools/export-catalog.mjs` joins canonical Character/Weapon rarity and existing Hero/Sequence/Skills/icon manifests into the generated `catalog.js`. Only presentation identity/assets/topology are copied: no skill coefficients, stat effects, recommendations or formulas. `--check` validates generated parity. Runtime remains standalone ESM with relative local assets, including GitHack; there are no production-only module imports or data fetches. Optional portable packaging knows the new stylesheet/assets but is not generated for this review.

## Verification

`tools/review-character-card.mjs` covers rarity/element/equipment, explicit unknown Sequence/investment, inline Skills flow and keyboard input, exact saved stat values, independence from candidate/run changes, 4/5-star Character switching, missing equipment/tree, independent panel collapse and label fit. It runs at 1440/1920/2560 inside the existing UI Lab verification; Carousel, Workshop, feedback, state-isolation and history checks remain. Focused tests also exercise explicit active/inactive Sequence rendering and reject invented defaults. No media collections or review bundles are generated.
