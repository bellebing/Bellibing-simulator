# Bellibing UI Agent Start

Last reconciled: 2026-09-22

Use this as the first-read contract for a new Bellibing UI-building chat or Codex session.

## Source order

Before UI work:

1. fresh-read GitHub `main` and the current active UI branch/PR;
2. read `docs/PROJECT_STATUS.md`;
3. read `docs/UI_UX_STATUS.md`;
4. read `docs/UI_BUILD_HANDOFF_V34.md`;
5. read `docs/UI_TYPOGRAPHY.md`;
6. read the Bellibing Echo Tool — AI Handoff for the latest UI update/bug evidence.

GitHub current implementation beats old chat context.

## Current lane note

At this reconciliation checkpoint, canonical `main` is `148f890f4002fbf8152b20c4dee9ee1f2e734b39` and draft PR #201 (`ui/asset-foundation-2026-09-20`) is the active New UI/asset lane. Fresh-read before acting because the branch/head may advance.

PR #196 is historical reference only and must not be continued as the active implementation lane. Old PR #192 is historical and closed unmerged.

## Role

Continue the accepted Bellibing New UI direction. Old Alpha is legacy runtime/regression material only; do not use it as design authority and do not preserve its UX merely for compatibility.

The user is the designer; implementation should translate the approved behavior/composition into small buildable slices.

## Typography shortcut

Canonical font contract: `docs/UI_TYPOGRAPHY.md`.

The accepted temporary v34 oracle is the exact OnlineWebFonts ETNA stylesheet documented there. The future production-local candidate is only the official ETNA Free Font by Krišjānis Mežulis / WILDTYPE / OTF after visual parity verification.

Do not substitute another font called Etna, Extended, or a lookalike.

## Visual shortcut

Canonical visual baseline: `docs/UI_BUILD_HANDOFF_V34.md`.

Important locks include:

- Home always shows the three primary cards in fixed order `Build` / `Improve` / `Build Team`, with Improve centered by default;
- Home card geometry and wheel scale/spacing;
- header-first one-line titles/names;
- exact per-art crop rules rather than generic whole-image contain;
- Character as the visual anchor;
- five Echo slots;
- Sequence rail S1 bottom → S6 top;
- desktop-first composition and mobile progressive disclosure;
- autosave vs `Add to Account` semantics;
- real-browser verification before visual completion claims.

## Merge boundary

Do not merge an active UI PR without explicit user authorization.
