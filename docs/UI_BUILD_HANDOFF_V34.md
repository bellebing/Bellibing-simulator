# Bellibing UI Build Handoff — v34 visual baseline

Last reconciled: 2026-09-20

This is the durable visual/implementation handoff for the accepted Bellibing v34 UI baseline. It complements `docs/UI_UX_STATUS.md`, which owns product/interaction semantics, and `docs/UI_TYPOGRAPHY.md`, which owns font truth.

This file belongs on `main` so future chats do not need an old PR or chat transcript to recover the accepted visual rules.

## Working rule

Do not redesign the accepted composition from memory or from the old Alpha UI. Fresh-read current GitHub `main`, the active UI branch/PR, and the current preview before changing UI.

Work one coherent user-approved slice at a time:

1. prototype/preview the slice;
2. verify visually in a real browser;
3. user approves the slice;
4. checkpoint the coherent slice in GitHub;
5. continue.

Do not commit every tiny pixel adjustment, and do not wait until the whole app is finished before checkpointing.

## Product target and responsive priority

Primary target: desktop web + desktop app.

Mobile is a separate presentation pass using the same data/components with progressive disclosure. Do not degrade desktop into dropdown-heavy/mobile-style UI just to force one layout across every screen.

## Typography

Canonical font truth lives in `docs/UI_TYPOGRAPHY.md`.

Accepted display family:

```css
font-family: "Etna", Inter, sans-serif;
```

Use ETNA for Home titles, `What Character?`, Character names, major headings and the short section headings that use the display face. Utility/body text remains Inter/system sans.

Do not substitute Etna Extended, another unrelated Etna, or a lookalike. Do not compensate for the wrong font by changing size/weight/letter-spacing.

## Home visual baseline

Center-oriented and minimal. One visual focus at a time.

Desktop starting geometry:

```css
.home-card {
  width: min(390px, calc(100vw - 64px));
  height: 500px;
  border-radius: 26px;
}
```

Desktop wheel spacing: `318px`.

Scale formula:

```js
Math.max(.72, 1.075 - Math.abs(logicalDistance) * .17)
```

Center card is about `1.075`, immediate neighbors about `0.905`.

Responsive wheel spacing:

- under 520px: `238px`;
- under 900px: `270px`;
- desktop: `318px`.

When all three functions are available, `Improve a Character` starts centered, Build left, Team right.

### Home title baseline

```css
.card-title {
  top: 23px;
  left: 10px;
  right: 10px;
  text-align: center;
  font-family: "Etna", Inter, sans-serif;
  font-size: 32px;
  font-weight: 400;
  line-height: 1;
  white-space: nowrap;
}
```

One title, one main artwork composition. Do not turn Home cards into mini dashboards.

## Temporary v34 artwork composition

These exact compositions are parity references, not production-rights clearance.

Expected processed preview assets:

- `bellibing-ui-build-character-rover.webp` — 72,646 bytes — SHA-256 `a046d22aa0edaf4951fd3ab9a0aed9266134369a03b9ffadbd1948cd8542aec1`
- `bellibing-ui-improve-character-augusta.webp` — 122,828 bytes — SHA-256 `329feea213f8193df4149c97fc6379a0617bcf4cf2e563a590e228d1fcfc7a27`
- `bellibing-ui-build-team.webp` — 387,950 bytes — SHA-256 `afb5e69db9321dbfbfbe209d263301b4bd1371307912d79aba8a7ce354c0c527`

Do not normalize them to one generic `object-fit: contain` rule. The accepted v34 crops are intentionally different:

```css
.card-build img {
  height: 98%;
  width: auto;
  bottom: 0;
  left: 50%;
  transform: translateX(-38%);
}

.card-improve img {
  height: 98%;
  width: auto;
  bottom: 0;
  left: 50%;
  transform: translateX(-62.5%);
}

.card-team img {
  height: 132%;
  width: auto;
  bottom: -80px;
  left: 50%;
  transform: translateX(-49%);
  filter: none;
  mix-blend-mode: normal;
}
```

For future Character-art framing, the Character/face is the visual anchor; weapons, hands, capes and other silhouette outliers must not drive perceived centering.

## Character selector baseline

Initial Build focus is `What Character?` plus the large horizontal Character wheel. Do not show the full build workspace before a Character is chosen.

Desktop starting card size:

```css
--character-card-w: 252px;
--character-card-h: 352px;
```

Large-wheel spacing: `228px`.

Center scale about `1.07`; immediate sides about `0.91`.

Character names in the large/minicard state are header-first and one line.

After selection:

- compact portrait baseline `82 × 82px`;
- compact spacing `98px`;
- hover-expanded spacing about `126px`;
- first large→compact morph about `920ms`;
- hover-collapse delay `320ms`;
- hover alone never switches Character.

Switching Character after entering a build requires confirmation.

Release chronology is pending source-backed metadata and must not be guessed.

## Build workspace focus

Selected Character is the independent viewport-center anchor. Selector expansion/collapse must not move, scale or dim the main Character.

Desktop baseline:

- upper-left: Stats;
- lower-left: Weapon;
- intermediate left: Sequences;
- center: Character name + large Character;
- right: exactly five Echo slots;
- `Add to Account` remains separate.

Sequence rail: S1 bottom → S6 top, circular nodes grow toward S6, thin connector line.

## Motion language

Major Home transitions: selected card advances slightly/fades, neighbors recede/fade, destination enters from depth around `~0.84 → 1`, roughly `0.7–0.9s` overlap.

Character large→compact selector transition is slower/readable. Minor controls stay faster/lighter.

## Account semantics

- Character changes autosave;
- each Character has its own persistent draft/build;
- navigation never destroys work;
- entering Build from Home starts at large `What Character?`;
- selecting an existing Character restores its draft;
- draft does not imply account ownership;
- `Add to Account` is an account action, not Save;
- Improve lists account-owned Characters only;
- Team becomes available at 2+ account-owned Characters.

## Verification

For visual changes, green CI alone is insufficient.

Use:

`preview → real browser check → user approval → coherent GitHub checkpoint`

Verify typography, artwork crop/framing, selector state changes and desktop composition in a real browser before calling a visual bug fixed.
