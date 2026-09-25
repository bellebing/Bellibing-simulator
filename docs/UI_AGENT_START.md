# Bellibing UI Agent Start

Last reconciled: 2026-09-25

Use this as the first-read contract for a new Bellibing UI-building chat or Codex session.

## Source order

Before UI work:

1. fresh-read GitHub `main` and all current active UI branch/PR candidates;
2. read `docs/PROJECT_STATUS.md`;
3. read `docs/UI_UX_STATUS.md`;
4. read `docs/UI_LAYOUT_MOTION_CONTRACT.md`;
5. read `docs/UI_BUILD_HANDOFF_V34.md`;
6. read `docs/UI_TYPOGRAPHY.md`;
7. read the Bellibing Echo Tool — AI Handoff for the latest UI update/bug evidence.

GitHub current implementation beats old chat context.

Do **not** hardcode an active PR number or branch in this onboarding file. The active lane changes; recover it from current GitHub + PROJECT_STATUS + AI Handoff every time.

## Authority map

- `UI_UX_STATUS.md` = product/interaction semantics.
- `UI_LAYOUT_MOTION_CONTRACT.md` = containment, responsive presentation, mobile disclosure, motion and viewport verification.
- `UI_BUILD_HANDOFF_V34.md` = accepted v34 visual/composition reference and parity measurements.
- `UI_TYPOGRAPHY.md` = font truth.
- `PROJECT_STATUS.md` + AI Handoff = current implementation/lane state.

If an old v34 measurement conflicts with the newer layout/motion contract, preserve the accepted visual intent while following the newer containment/responsive rule. Do not invent a second parallel layout system.

## Role

Continue the accepted Bellibing New UI direction. Old Alpha is legacy runtime/regression material only; do not use it as design authority and do not preserve its UX merely for compatibility.

The user is the designer; implementation should translate approved behavior/composition into small buildable slices.

## Core implementation locks

- Home always shows three primary cards in fixed order `Build a Character` / `Improve a Character` / `Build a Team`, with Improve centered by default.
- Home navigation is not hidden by account count; destination surfaces handle unavailable/empty states.
- Home uses the same carousel component across desktop/mobile.
- UI content lives in a centered finite-width AppShell; ultrawide adds gutters rather than unlimited UI spread.
- Component children are positioned relative to their owning component. A card moves with its title/art/overlays as one unit.
- Mobile is designed with each component from the start through progressive disclosure; it is not a later separate rewrite.
- Mobile Build keeps the Character as visual anchor and opens Stats/Weapon/Sequences/Echoes in overlay drawers from compact controls.
- Character is the desktop Build visual anchor; five Echo slots and S1-bottom→S6-top Sequence rail remain.
- Motion uses continuity/object permanence: card/portrait/focus states should visually transform into one another where practical.
- Comparable selector/detail tools reuse the locked Bellibing glass pattern: transparent contextual background/panel, solid item/content layer, non-reflowing hover focus, and source-object continuity into Preview/Current where the feature semantics fit. See `UI_LAYOUT_MOTION_CONTRACT.md#10a-locked-reusable-glass-selectordetail-pattern`.
- Major motion is weighted, not abrupt; exact timing bands and reduced-motion behavior live in `UI_LAYOUT_MOTION_CONTRACT.md`.
- Autosave and `Add to Account` remain separate semantics.
- Card/hero image framing uses explicit component-local presentation values or reviewed derivatives, never geometric viewport/bounding-box guesses.
- Real-browser responsive verification is required before visual completion claims.

## Typography shortcut

Canonical font contract: `docs/UI_TYPOGRAPHY.md`.

The accepted temporary v34 oracle is the exact OnlineWebFonts ETNA stylesheet documented there. The future production-local candidate remains license-gated until the documented conflict is resolved.

Do not substitute another font called Etna, Extended, or a lookalike.

## Visual shortcut

Canonical v34 visual baseline: `docs/UI_BUILD_HANDOFF_V34.md`.

Use it for the approved visual direction, proportions and parity reference. Do not copy its historical pixel values into new viewport-relative layout hacks.

## Functional PR preview protocol

When the user asks for a UI `preview`, `PR preview`, `test link`, `functional preview` or equivalent, treat that as an explicit review workflow request rather than returning screenshots only.

Required sequence:

1. recover the current active UI PR/branch from GitHub + `PROJECT_STATUS.md` + AI Handoff; never assume an old PR number;
2. ensure the requested UI work is committed on that active PR branch;
3. verify the **exact PR head** with the repository's existing Verify/Export workflow; do not present a stale head as current;
4. for the current standalone New UI prototype entrypoint, construct an immutable exact-head review URL in this form:

   `https://rawcdn.githack.com/bellebing/Bellibing-simulator/<HEAD_SHA>/docs/ui-prototypes/v34-functional.html`

5. return that URL prominently as **Open functional UI preview**, together with the PR number and exact head SHA;
6. the preview is for interaction review only and must not be described as the deployed Bellibing site or canonical `main`;
7. do not merge merely to make a preview available.

The raw.githack service serves source-hosted HTML/assets with browser-usable content types. Exact commit URLs are immutable, which makes the review link correspond to one verified PR head. A first browser visit may show the service's HTML safety confirmation before opening the page.

If the UI review entrypoint later moves away from `docs/ui-prototypes/v34-functional.html`, update this protocol in the same change that moves the entrypoint. Do not keep emitting a dead historical URL.

If the external preview service is unavailable, say so explicitly and fall back to the repository-local `npm run build` + `python3 -m http.server 4173 --directory dist` flow. Never claim a clickable preview was verified when it was not.

## Merge boundary

Do not merge an active UI PR without explicit user authorization.
