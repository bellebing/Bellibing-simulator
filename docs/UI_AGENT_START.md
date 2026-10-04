# Bellibing UI Agent Start

Last reconciled: 2026-09-27

Start from [AGENTS.md](../AGENTS.md) and [Development Process v2](DEVELOPMENT_PROCESS.md) for source order, scope, verification, autonomy and documentation. This file is the UI product-contract index. Read the relevant contracts below for the authorized UI work.

Do **not** hardcode an active PR number or branch in this onboarding file; recover the relevant lane from current GitHub.

## Authority map

- `UI_UX_STATUS.md` = product/interaction semantics.
- `UI_LAYOUT_MOTION_CONTRACT.md` = containment, the current desktop-first acceptance phase, deferred mobile targets, motion and viewport verification.
- `UI_BUILD_HANDOFF_V34.md` = accepted v34 visual/composition reference and parity measurements.
- `UI_TYPOGRAPHY.md` = font truth.
- GitHub = current implementation/PR/CI state; `PROJECT_STATUS.md` and AI Handoff = product status, decisions and blockers.

If an old v34 measurement conflicts with the newer layout/motion contract, preserve the accepted visual intent while following the newer containment/responsive rule. Do not invent a second parallel layout system.

## Role

Continue the accepted Bellibing New UI direction. Old Alpha is legacy runtime/regression material only; do not use it as design authority and do not preserve its UX merely for compatibility.

The user is the designer; implementation should translate approved behavior/composition into small buildable slices.

## Core implementation locks

- Home always shows three primary cards in fixed order `Build a Character` / `Improve a Character` / `Build a Team`, with Improve centered by default.
- Home navigation is not hidden by account count; destination surfaces handle unavailable/empty states.
- Home keeps one shared component/state model; current acceptance is desktop-first.
- Shared carousel input must preserve native card clicks: pointer capture starts only after the drag threshold, never on pointerdown alone; physical **mouse** activation is part of the current real-browser gate. Touch-specific verification is deferred with mobile.
- UI content lives in a centered finite-width AppShell; desktop widening adds gutters rather than unlimited UI spread.
- Component children are positioned relative to their owning component. A card moves with its title/art/overlays as one unit.
- **Current phase: desktop-first functional stabilization.** Primary UI acceptance is 1440×900; 1920×1080 and 2560×1440 are desktop sanity checks.
- Do not add or repair 390×844 / 768×1024 mobile layouts, progressive-disclosure drawers, touch-only behavior or mobile-specific polish unless the user explicitly starts the Mobile Adaptation Pass.
- Preserve existing mobile code and keep feature state/data/component logic reusable. Do not create desktop-only business logic that would force a second implementation later.
- Character is the desktop Build visual anchor; five Echo slots and S1-bottom→S6-top Sequence rail remain.
- Motion uses continuity/object permanence: card/portrait/focus states should visually transform into one another where practical.
- Comparable selector/detail tools reuse the locked Bellibing glass pattern: transparent contextual background/panel, solid item/content layer and non-reflowing hover focus. For the approved Weapon reference, grid cards stay stable, Preview uses an independent clone/tunnel layer, and only `Equip Weapon` commits to Active slot 1. See `UI_UX_STATUS.md#locked-weapon-interaction-reference` and `UI_LAYOUT_MOTION_CONTRACT.md#10a-locked-reusable-glass-selectordetail-pattern`.
- New UI form controls must follow `UI_UX_STATUS.md#locked-new-ui-formcontrol-contract`: no platform-native select popup UI, stat name/value stay separate, deterministic derived values do not fake editability, and identity/art/text regions do not overlap. Primary action/footer composition follows `UI_LAYOUT_MOTION_CONTRACT.md#3a-panel-contentaction-composition`; do not invent a second control or panel system.
- Major motion is weighted, not abrupt; exact timing bands and reduced-motion behavior live in `UI_LAYOUT_MOTION_CONTRACT.md`.
- Autosave and `Add to Account` remain separate semantics.
- Card/hero image framing uses explicit component-local presentation values or reviewed derivatives, never geometric viewport/bounding-box guesses.
- Real-browser **desktop** verification is required before visual completion claims in the current phase. Mobile/narrow verification is not a completion gate until the Mobile Adaptation Pass is explicitly reopened.

## Typography shortcut

Canonical font contract: `docs/UI_TYPOGRAPHY.md`.

The accepted temporary v34 oracle is the exact OnlineWebFonts ETNA stylesheet documented there. The future production-local candidate remains license-gated until the documented conflict is resolved.

Do not substitute another font called Etna, Extended, or a lookalike.

## Visual shortcut

Canonical v34 visual baseline: `docs/UI_BUILD_HANDOFF_V34.md`.

Use it for the approved visual direction, proportions and parity reference. Do not copy its historical pixel values into new viewport-relative layout hacks.

## Functional PR preview protocol

When the user asks for a UI `preview`, `PR preview`, `test link`, `functional preview` or equivalent, treat that as an explicit review workflow request rather than returning screenshots only.

Follow Development Process v2's REVIEW level and identify the preview revision and relevant checks. Use a local preview, an existing build artifact or an immutable source URL; a preview request does not require a commit or full Verify/Export by itself.

For a committed standalone New UI source entrypoint, the immutable URL format is:

`https://rawcdn.githack.com/bellebing/Bellibing-simulator/<HEAD_SHA>/docs/ui-prototypes/v34-functional.html`

Return the usable review path prominently as **Open functional UI preview**, with the revision and PR when applicable. A candidate preview is interaction-review evidence, separate from deployed main. Do not merge merely to make a preview available.

The raw.githack service serves source-hosted HTML/assets with browser-usable content types. Exact commit URLs are immutable, which identifies the source revision; verification evidence is reported separately. A first browser visit may show the service's HTML safety confirmation before opening the page.

If the UI review entrypoint later moves away from `docs/ui-prototypes/v34-functional.html`, update this protocol in the same change that moves the entrypoint. Do not keep emitting a dead historical URL.

If the external preview service is unavailable, say so explicitly and fall back to the repository-local `npm run build` + `python3 -m http.server 4173 --directory dist` flow. Never claim a clickable preview was verified when it was not.

## Merge boundary

Do not merge an active UI PR without explicit user authorization.
