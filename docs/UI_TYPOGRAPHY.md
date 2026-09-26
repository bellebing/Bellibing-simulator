# Bellibing UI Typography

Last reconciled: 2026-09-24

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

Official source references:

- product: `https://wildtype.design/product/etna-free-typeface/`;
- license: `https://wildtype.design/license/`;
- creator Gumroad product: `https://wildtype.gumroad.com/l/INIw`.

The official WILDTYPE product page identifies ETNA Free Font by Krišjānis Mežulis and OTF format. The general WILDTYPE license page currently says listed Free Fonts may be used for the previously listed uses including websites/apps/commercial work. However, the current creator Gumroad product simultaneously exposes the zero-price option as **Personal use** alongside separate paid license variants.

Because those official surfaces are inconsistent, **do not vendor the OTF binary into the public Bellibing repository yet**. A local production binary requires a clearly applicable website/self-hosting license or direct creator clarification. Do not resolve the conflict by using a mirror or by assuming the zero-price Personal-use option covers the public site.

When a local font file is legitimately introduced:

1. retain source/license/provenance beside the binary;
2. render the same representative strings with the same font size, weight, line height and letter spacing as the external oracle;
3. compare Home titles, `What Character?`, Character names and major headings in a real browser;
4. only replace the external source if the result is visually equivalent and explicitly accepted.

## Current repository boundary

The accepted New UI preview currently uses the external v34 ETNA oracle; no production-local ETNA binary is the typography source of truth.

This file intentionally does **not** own or name the active UI PR/branch. Fresh-read GitHub + PROJECT_STATUS + AI Handoff for current implementation state. Historical UI PR numbers are not font truth.

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

### Display-label vertical-metric safety

ETNA has meaningful descenders on letters such as `g`, `j`, `p`, `q` and `y`. A label is not visually valid merely because its text node exists, is one line, or fits horizontally.

For constrained Character/card labels:

- reserve an explicit descender-safe line box and bottom breathing room; do not use `line-height: 1` as the default for ETNA labels inside clipped/tightly packed card geometry;
- keep the text container itself overflow-visible unless a reviewed design explicitly requires clipping;
- in header-first states, reserve a measurable gap between the complete text line box and the portrait/art region;
- in compact below-portrait states, reserve a measurable gap between portrait and label rather than hanging the glyph directly against the image boundary;
- apply typography changes to the peer component/state, never as per-Character offsets;
- verify the complete released Character roster in every selector presentation state that uses the label. The current Character selector states are `EXPANDED`, `COMPACT` and `HOVER_EXPANDED`;
- include descender-heavy sentinel names such as `Buling`, `Lingyang` and `Yangyang` in browser regression checks. These are sentinels, not special cases;
- keep a real-browser visual artifact for meaningful Character-card typography changes so metric assertions do not replace visual review.

Current validated Character-card baseline uses approximately `line-height: 1.22` plus explicit bottom padding. Do not tighten that vertical budget below roughly `1.18` without renewed real-browser proof across the full peer group.

Positioning/containment of typography inside cards/components is governed by `docs/UI_LAYOUT_MOTION_CONTRACT.md`; this file owns font/typographic behavior only.
