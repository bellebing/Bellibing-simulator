# Bellibing UI Typography

Last reconciled: 2026-09-20

This file is the canonical typography/font handoff for the new Bellibing UI. It exists so a new chat or implementation agent does not have to reconstruct the accepted font choice from old conversation history or abandoned PRs.

## Display font contract

Accepted v34 display face: **ETNA**.

The exact temporary visual-parity oracle used by the accepted Bellibing v34 preview is:

```html
<link rel="stylesheet"
href="https://db.onlinewebfonts.com/c/3c1a4128f95e2109303b045eda4bfe8a?family=Etna">
```

The exact display-family declaration is:

```css
font-family: "Etna", Inter, sans-serif;
```

Use ETNA for:

- Home card titles;
- `What Character?`;
- Character names;
- major page headings;
- short section headings where the accepted v34 composition uses the display face.

Body copy, controls, status text and utility text remain Inter/system sans.

## Do not substitute a different Etna

Do not choose a font merely because it is named Etna.

Specifically, do not substitute:

- Etna Extended;
- another independently distributed Etna;
- a lookalike;
- a different weight/variant and then compensate with CSS.

Do not change font size, weight or letter spacing merely to make the wrong face resemble the accepted v34 typography. **Correct face first, metrics second.**

## Production-local candidate

The intended future local production candidate is:

**ETNA Free Font — Krišjānis Mežulis — WILDTYPE — OTF**

That local OTF must not replace the external parity oracle until it has been visually compared against the accepted v34 oracle at the same CSS metrics.

When a local font file is introduced:

1. retain source/license/provenance beside the binary;
2. render the same representative strings with the same font size, weight, line height and letter spacing as the external oracle;
3. compare Home titles, `What Character?`, Character names and major headings in a real browser;
4. only replace the external source if the result is visually equivalent and explicitly accepted.

## Current repository status

As of 2026-09-20, current `main` does **not** carry a production-local ETNA binary.

The durable truth is the font contract in this file. UI implementation may temporarily use the exact external parity stylesheet while the official local WILDTYPE OTF is still awaiting parity/provenance verification.

Old PR #192 is historical and closed unmerged. Do not use its earlier local WOFF2 experiment as font truth.

The current UI lane must be fresh-read from GitHub before implementation. At this reconciliation checkpoint, draft PR #196 contains the v34 parity-foundation implementation work, but this typography contract is intentionally independent of that branch so future chats can recover it from `main`.

## Typography composition rules

Short identifying text on cards/selectors is header-first:

**text first → visual subject below**

Peer Character names/card titles should remain one line. Do not let only a longer peer wrap while shorter peers remain single-line.

Baseline guard:

```css
white-space: nowrap;
overflow-wrap: normal;
word-break: keep-all;
hyphens: none;
```

If a peer label does not fit, fix the peer-group/container/responsive rule consistently rather than individually shrinking or wrapping one item unless the user explicitly approves an exception.
