# Bellibing UI Build Handoff — v34 visual baseline

Last reconciled: 2026-09-24

This is the durable visual/implementation handoff for the accepted Bellibing v34 UI baseline.

Authority is deliberately separated:

- `docs/UI_UX_STATUS.md` owns product/interaction semantics;
- `docs/UI_LAYOUT_MOTION_CONTRACT.md` owns containment, responsive behavior and motion;
- this file owns the accepted **v34 visual/parity reference**;
- `docs/UI_TYPOGRAPHY.md` owns font truth.

Exact values below are retained where they are useful to reproduce the accepted v34 look. They are not permission to create viewport-relative positioning or a second responsive architecture. If a historical v34 timing/layout value conflicts with the current layout/motion contract, preserve the visual intent and follow the current contract.

## Working rule

Do not redesign the accepted composition from memory or from the old Alpha UI. Fresh-read current GitHub `main`, active UI PR(s), the current preview and the canonical contracts before changing UI.

Work one coherent user-approved slice at a time:

1. prototype/preview the slice;
2. verify visually in a real browser at relevant responsive sizes;
3. user approves the slice;
4. checkpoint the coherent slice in GitHub;
5. continue.

Do not commit every tiny pixel adjustment, and do not wait until the whole app is finished before checkpointing.

## Product target and responsive priority

Desktop web + desktop app remain the primary composition surface.

Mobile uses the same data/state/components from the beginning with progressive disclosure. It is not a later independent redesign pass. Do not degrade desktop into dropdown-heavy UI, and do not fork feature logic just to create mobile.

The canonical max-spread, component-local positioning, mobile drawer and verification rules live in `UI_LAYOUT_MOTION_CONTRACT.md`.

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

Historical/accepted v34 desktop starting geometry:

```css
.home-card {
  width: min(390px, calc(100vw - 64px));
  height: 500px;
  border-radius: 26px;
}
```

Historical v34 wheel spacing: `318px`.

Scale formula:

```js
Math.max(.72, 1.075 - Math.abs(logicalDistance) * .17)
```

Center card is about `1.075`, immediate neighbors about `0.905`.

Historical responsive wheel spacing reference:

- under 520px: `238px`;
- under 900px: `270px`;
- desktop: `318px`.

These values describe the accepted v34 look; the production implementation must still satisfy the AppShell/max-spread and mobile carousel contract.

When all three functions are shown, `Improve a Character` starts centered, Build left, Team right. **All three Home cards remain visible/available as Home navigation regardless of account count.** Account insufficiency is handled inside the destination surface.

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

The title and art are **card-local**. Moving the Home card moves its title/art/overlays as a single component.

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

These are **card-local parity offsets** for the current processed art, not viewport offsets. Future presentation should express reviewed composition through explicit card-local presentation tokens/metadata or reviewed derivatives rather than repeatedly guessing from transparent bounds.

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
- hover-collapse delay `320ms`;
- hover alone never switches Character.

The historical v34 prototype used a roughly `920ms` first large→compact animation. That number is retained only as prototype history; current major-transition timing is governed by `UI_LAYOUT_MOTION_CONTRACT.md`.

Switching Character after entering a build requires confirmation.

Release chronology is pending source-backed metadata and must not be guessed.

## Build workspace focus

Selected Character is the independent viewport-center visual anchor inside the application surface. Selector expansion/collapse must not move, scale or dim the main Character.

Desktop baseline:

- upper-left: Stats;
- lower-left: Weapon;
- intermediate left: Sequences;
- center: Character name + large Character;
- right: exactly five Echo slots;
- `Add to Account` remains separate.

Sequence rail: S1 bottom → S6 top, circular nodes grow toward S6, thin connector line.

Mobile presentation is defined in `UI_LAYOUT_MOTION_CONTRACT.md`: Character remains the anchor and compact feature controls open Stats/Weapon/Sequences/Echoes in overlay drawers without moving the Character stage.

## Motion visual intent

Major Home transitions: selected card advances, neighbors recede, destination enters from depth.

Character selection: the source card/portrait visibly leads into the selected Character state; returning uses the reverse spatial logic.

Minor controls stay faster/lighter than major transitions.

Canonical timing bands, easing, transform rules and reduced-motion behavior live only in `UI_LAYOUT_MOTION_CONTRACT.md`.

## Account semantics

- Character changes autosave;
- each Character has its own persistent draft/build;
- navigation never destroys work;
- entering Build from Home starts at large `What Character?`;
- selecting an existing Character restores its draft;
- draft does not imply account ownership;
- `Add to Account` is an account action, not Save;
- Improve lists account-owned Characters only;
- Build Team Home navigation remains visible; insufficient account state is handled inside Team.

## Verification

For visual changes, green CI alone is insufficient.

Use:

`preview → real browser responsive check → user approval → coherent GitHub checkpoint`

Verify typography, artwork crop/framing, selector state changes and composition in a real browser. Relevant sizes and the extreme-ultrawide max-spread guard are defined in `UI_LAYOUT_MOTION_CONTRACT.md`.

Do not call a visual bug fixed from a single desktop screenshot.
