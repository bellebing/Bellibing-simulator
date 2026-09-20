# Bellibing UI Build Handoff — v34 visual baseline

Last reconciled: 2026-09-12

This is the working visual/implementation handoff for the new Bellibing UI. It complements `docs/UI_UX_STATUS.md`: that file owns product semantics; this file owns the accepted v34 visual baseline and the rules a new UI-building agent must follow before changing it.

## Working rule

Do not redesign the accepted composition from memory or from the old Alpha UI. Open the current `/ui-preview/`, read this file, and make one small user-approved slice at a time.

UI workflow:

1. prototype/preview the slice quickly;
2. verify visually in a real browser;
3. user approves the slice;
4. checkpoint the coherent slice in GitHub;
5. continue to the next slice.

Do not create a commit for every tiny pixel adjustment, and do not wait until the whole app is finished before checkpointing.

## Product target and responsive priority

Primary target now: desktop web + desktop app.

Mobile is phase two. Desktop must not be degraded into dropdown-heavy/mobile-style UI just to make one layout serve every screen immediately.

However, components must remain structurally reusable on mobile. The intended mobile adaptation is progressive disclosure: the same Character/build data and controls, but Echoes/Weapon/Stats/Sequences may become tap-open sections because the screen cannot show all desktop panels at once.

The card language is intentional because it can scale/reflow well across desktop and mobile.

## Locked display font

Display/brand face: **ETNA**, matching the accepted v34 parity oracle.

Exact temporary parity stylesheet used by the accepted preview:

```html
<link rel="stylesheet"
  href="https://db.onlinewebfonts.com/c/3c1a4128f95e2109303b045eda4bfe8a?family=Etna">
```

Exact family declaration:

```css
font-family: "Etna", Inter, sans-serif;
```

Use ETNA for:

- Home card titles;
- `What Character?`;
- Character names;
- major page headings;
- short section headings where the accepted preview uses the display face.

Body/utility copy remains Inter/system sans.

Do not replace ETNA with an arbitrary font named Etna, Etna Extended, or a lookalike. The production-local target is the official **ETNA Free Font by Krišjānis Mežulis / WILDTYPE / OTF**, but a local file must be visually compared with the parity oracle before it replaces the external stylesheet. Keep source/license/provenance beside any future local font binary.

## Typography/layout rule: header first

Short identifying text comes before the visual subject whenever the component is a card/selector:

- title/name at the top as a header;
- artwork/Character below;
- interaction target is the card/visual area.

Do not casually move a card title or Character name to the bottom as a footer.

### No inconsistent wrapping

Peer labels must not end up with one item on one line and another comparable item split over two lines merely because it is a few letters longer.

For short UI headings, Character names, and card titles:

```css
white-space: nowrap;
overflow-wrap: normal;
word-break: keep-all;
hyphens: none;
```

If a label does not fit:

1. first adjust the component width/spacing if appropriate;
2. otherwise reduce the approved font size for the whole peer group/responsive breakpoint;
3. if copy can be shortened without changing meaning, change the approved copy;
4. do not solve it by wrapping only the longer peer item.

Do not individually shrink one Character/card title while its peers remain visually larger unless the user explicitly approves that exception.

## Home visual baseline

Center-oriented and minimal. One visual focus at a time.

Home cards are vertical collectible-card proportions, not Pokémon styling.

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

So the center card is about `1.075`, immediate neighbors about `0.905`. Side cards stay large and close; do not turn Home into a three-column grid or push tiny cards to the viewport edges.

Responsive wheel spacing from accepted baseline:

- under 520px: `238px`;
- under 900px: `270px`;
- desktop: `318px`.

When three functions are available, `Improve a Character` starts centered, Build is left, Team is right.

## Home title baseline

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

One title, one main artwork composition, no stats/descriptions/buttons on the Home card face.

## Exact temporary preview assets

These are prototype parity assets, not production-cleared game art. Do not silently treat them as final licensed product assets.

Paths:

- `docs/ui-prototypes/assets/v34/bellibing-ui-build-character-rover.webp`
- `docs/ui-prototypes/assets/v34/bellibing-ui-improve-character-augusta.webp`
- `docs/ui-prototypes/assets/v34/bellibing-ui-build-team.webp`

Expected exact extracted preview bytes:

- Rover: 72,646 bytes — SHA-256 `a046d22aa0edaf4951fd3ab9a0aed9266134369a03b9ffadbd1948cd8542aec1`
- Augusta: 122,828 bytes — SHA-256 `329feea213f8193df4149c97fc6379a0617bcf4cf2e563a590e228d1fcfc7a27`
- Team: 387,950 bytes — SHA-256 `afb5e69db9321dbfbfbe209d263301b4bd1371307912d79aba8a7ce354c0c527`

Do not normalize all three images to one generic `object-fit: contain` crop. Their accepted compositions are different.

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

The build must copy `docs/ui-prototypes/assets/v34/` to `dist/ui-preview/assets/v34/`.

## Character selector baseline

Initial Build focus is only `What Character?` + the large horizontal Character wheel. Do not show the build workspace before a Character is chosen.

Desktop starting values:

```css
--character-card-w: 252px;
--character-card-h: 352px;
```

Large-wheel spacing: `228px` desktop.

Center scale about `1.07`; immediate sides about `0.91`.

Character names on large/minicard selector cards use the header-first rule: name at the top, visual below. Keep names one line.

After selection the same selector moves upward and becomes compact round portraits:

- `82 × 82px` portrait baseline;
- compact spacing `98px`;
- desktop hover expansion spacing `126px`;
- first large→compact morph around `920ms`;
- hover-collapse delay `320ms`.

Compact portrait labels may sit beneath the circular portrait because that state is a portrait strip, not the original collectible card. They must still remain one line.

Hover alone never switches Character. Switching after entering a build requires confirmation.

Release chronology is pending source-backed metadata; do not invent it.

## Build workspace focus

After Character selection, the selected Character is the independent viewport-center anchor. Selector expansion/collapse must not move, scale, dim, or re-center the main Character.

Surrounding desktop structure:

- upper-left: Stats;
- lower-left: Weapon;
- intermediate left of Character: Sequences;
- center: Character name + large Character;
- right: exactly five Echo slots;
- Add to Account remains a separate account action.

Sequence rail: S1 bottom → S6 top, circular nodes grow toward S6, thin connector line.

The exact future visual spacing can be iterated, but the Character must remain the primary visual focus rather than becoming a tiny figure between oversized side panels.

## Motion language

Major transitions: Home → Build / Improve / Team.

Accepted feel:

- selected Home card advances slightly and fades;
- neighboring cards fade/recede;
- destination comes from depth around scale `~0.84 → 1`;
- total overlap roughly `0.7–0.9s`.

Character large→compact selector transition is slower/readable. Minor controls should be faster and lighter. Do not make every click cinematic.

## Locked account semantics

- Character changes autosave;
- each Character has its own persistent draft/build;
- navigation never destroys build work;
- entering Build from Home always starts at large `What Character?`;
- selecting an existing Character restores its draft;
- draft does not imply account ownership;
- `Add to Account` is an account action, not Save;
- Improve lists account-owned Characters only;
- Team becomes available at 2+ account-owned Characters.

## Immediate UI-building workflow for a new AI

Before any UI edit:

1. fresh-read current GitHub main and active UI branch/PR;
2. read `docs/UI_UX_STATUS.md`;
3. read this file;
4. open `docs/ui-prototypes/v34-functional.html` / deployed `/ui-preview/`;
5. inspect the exact prototype assets;
6. reproduce/verify the existing baseline before adding a new function.

Then work one slice at a time. A completed slice can be Weapon selector, Echo-slot interaction, Sequences, etc. Verify the slice in a real browser before checkpointing it.

Do not rebuild the interaction model from old Alpha. Do not let a refactor change visual scale/centering/account semantics incidentally.
