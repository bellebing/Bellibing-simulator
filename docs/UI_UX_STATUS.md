# Bellibing UI/UX Status

Last reconciled: 2026-09-25

This document is the product/interaction source of truth for the **Bellibing New UI direction**. New UI is the product/design authority. The older Alpha UI is legacy runtime/regression material only and must not constrain New UI design decisions.

Durable companion docs on `main`:

- `docs/UI_AGENT_START.md` — first-read contract for new UI chats/agents;
- `docs/UI_LAYOUT_MOTION_CONTRACT.md` — canonical containment, responsive and motion implementation rules;
- `docs/UI_BUILD_HANDOFF_V34.md` — accepted v34 visual/composition reference;
- `docs/UI_TYPOGRAPHY.md` — canonical font/typography contract.

Authority is intentionally split rather than duplicated:

1. this file owns product/interaction semantics;
2. `UI_LAYOUT_MOTION_CONTRACT.md` owns layout containment, responsive behavior and motion invariants;
3. `UI_BUILD_HANDOFF_V34.md` owns the accepted v34 visual reference and exact parity measurements where still applicable;
4. `UI_TYPOGRAPHY.md` owns font truth.

If an older v34 measurement conflicts with the current layout/motion contract, preserve the approved visual intent while following the current containment/responsive contract. A new chat should not need old PRs or chat transcripts to recover these rules.

## Checkpoint

Current accepted UI foundation: **v34 — Home wheel + Character selector + five Echo slots + Sequence rail**.

Functional prototype:

- `docs/ui-prototypes/v34-functional.html`;
- deployed separately at `/ui-preview/` when the corresponding UI implementation checkpoint reaches `main`.

The preview may use recovered processed v34 Home artwork as **temporary prototype/parity assets**. They are not production-cleared material and must not be treated as final licensed assets.

## Product target

Desktop web + desktop app remain the primary composition surface, but **mobile is not a deferred redesign pass**.

Every new UI component must be built from the start with a defined narrow/mobile presentation using the same component state and data. Desktop may expose more context simultaneously; narrow/mobile uses progressive disclosure rather than a separate product flow.

The collectible-card interaction language is intentionally shared across desktop and mobile.

Responsive product rules:

- wide screens gain outer breathing room, not unlimited separation between UI elements;
- the product surface lives inside a centered finite-width application shell;
- shrinking the viewport must not make navigation or controls disappear beyond the sides;
- component children are positioned relative to their owning component, not directly against the browser viewport;
- mobile reuses the same underlying components/state and changes presentation through carousel focus, compact controls and drawers/overlays.

Detailed implementation rules and verification sizes live in `docs/UI_LAYOUT_MOTION_CONTRACT.md`.

## New UI and current root

New UI is the only forward product/design direction. The existing GitHub Pages root still serves the older Alpha implementation today, but that surface is legacy and is not a design authority.

During the current visual build pass, `/ui-preview/` is the review surface. After the New UI Home baseline is user-approved, replacing the public root and retiring/removing Alpha is an explicit migration step. Do not silently mix that deployment migration into an unrelated visual tweak.

## Locked visual identity

Display/brand face: **ETNA**, matching the accepted v34 parity oracle.

Canonical details, exact temporary stylesheet, exact family declaration and production-local migration rules live in `docs/UI_TYPOGRAPHY.md`.

Use the display face for Home card titles, `What Character?`, Character names and major/short section headings. Body/utility text stays Inter/system sans.

Short identifying text is **header-first** on cards/selectors: title/name above the subject/art, not casually moved to the bottom as a footer.

Comparable short labels must not wrap inconsistently. Character names/card titles/headings should remain one line; solve fit through component/group sizing or approved responsive typography rather than splitting only the longer peer label.

## Locked product semantics

### Home

- center-oriented, minimal UI;
- Home functions are large visual vertical cards with collectible-card proportions;
- Home always presents exactly three primary cards in fixed visual order: `Build a Character` left, `Improve a Character` center/default focus, `Build a Team` right;
- Home-card visibility is no longer account-count gating; account-state constraints belong inside the destination feature/empty state rather than hiding Home navigation;
- the same three-card carousel exists on desktop and mobile;
- desktop/wide presentation may show all three cards clearly, while mobile keeps one focused card with neighboring-card peek and swipe/drag navigation;
- widening the browser adds outer gutters after the application shell reaches its maximum spread; it must not keep pushing the cards toward the physical monitor edges;
- card title, art, overlays and future card-local content move as one component because the card itself owns their coordinate system;
- Build means create/build a Character draft, then explicitly add it to the account;
- Improve operates on Characters already added to the account; empty-state handling remains a later UI slice;
- Team is a separate surface using account Characters; insufficient-account handling belongs in that destination surface rather than Home-card visibility.

Home visual baseline and exact existing card/art geometry are documented in `docs/UI_BUILD_HANDOFF_V34.md`. Layout ownership and responsive behavior are defined in `docs/UI_LAYOUT_MOTION_CONTRACT.md`.

### Account vs autosave

- Character work autosaves continuously;
- navigation must never destroy Character work;
- every Character has its own persistent draft/build state;
- returning to a Character restores its previous build state;
- `Add to Account` is **not Save**; it promotes the Character into the account/bag;
- opening Build from Home always starts at the large Character selector, even when drafts exist.

## Character selector

One selector component has:

1. `EXPANDED` — initial large horizontal Character-card wheel under `What Character?`;
2. `COMPACT` — after selection, same wheel moves to the top and becomes small circular portraits;
3. `HOVER_EXPANDED` — desktop hover over compact wheel unfolds smaller Character cards; leaving collapses after a short delay.

Behavior:

- drag/swipe/scroll/keyboard horizontal navigation;
- center item is active selection target;
- switching Character after entering a build requires confirmation;
- hover never switches Character itself;
- release chronology/order remains pending source-backed metadata and must not be guessed;
- Improve reuses the selector but its item source is account-owned Characters only.

Large/minicard Character names use header-first placement. Compact portrait-strip labels may sit below the portrait but remain one line.

## Motion language

Bellibing should not feel like abrupt page teleportation. The core motion philosophy is **continuity / object permanence**: when practical, the object the user acted on should visibly become or lead into the next state.

Major choices (Home → Build / Improve / Team):

- selected Home card advances/enlarges slightly;
- surrounding cards recede/fade;
- destination enters from depth with deliberate overlap;
- the transition must feel weighted and concrete rather than instant, but must not linger.

Character selection:

- the selected Character card/portrait is the visual origin for the selected Character state;
- large Character cards glide/shrink into the compact selector;
- the Character focus art appears through a coordinated scale/depth transition rather than an unrelated page pop;
- returning reverses the visual logic: the Character focus recedes toward the portrait/card origin;
- selector motion must not move or dim the already-established main Character focus merely because the selector itself expands/collapses.

Panels and minor actions:

- drawers/panels slide with a short weighted transition and background scrim rather than teleporting;
- micro-actions stay faster/lighter than navigation;
- do not apply the full cinematic transition to every button.

Canonical duration bands, easing, reduced-motion behavior and transform rules live in `docs/UI_LAYOUT_MOTION_CONTRACT.md`.

## Locked reusable selector/detail design language

The user-approved Weapon selector defines the default **selector/detail visual language** for comparable New UI tools.

Use this family for Weapon, Echo and future browse/inspect/select surfaces when their information architecture fits:

- transparent dark glass keeps the Character/Build context visible behind the active tool;
- the glass/background may be substantially transparent, while item cards, icons/artwork, labels, stats and primary actions remain solid and high-contrast;
- pointer hover gives the currently targeted card a small non-reflowing bubble/lift;
- inspection and commitment are separate when the feature semantics require it: Preview does not mutate Current/Equipped state;
- a stable browse grid is preferred when repeated comparison matters; Preview may use an independent visual clone/detail representation instead of physically removing the source card from the grid;
- the feature-specific primary action is the commit point;
- desktop can use browse + right-side detail; mobile can use the same state/component in a drawer/detail presentation;
- the Character/Build stage remains contextual beneath the glass and does not permanently reflow.

### Locked Weapon interaction reference

The approved desktop Weapon interaction is:

`Grid click → Preview only → Equip Weapon → Active slot 1`

Rules:

- the Active Weapon occupies grid slot 1;
- clicking another Weapon only changes Preview and must not change Active, Build-slot state or grid ordering;
- Preview is an independent clone/detail layer; the grid card stays in the grid;
- repeated Preview browsing uses the approved depth/tunnel transition and does not move Weapon cards through the viewport;
- `Equip Weapon` is the only commit action;
- on Equip, the previewed Weapon becomes Active and reorders into slot 1;
- the previous Active Weapon returns to the remaining ranked/browse order;
- previewing the already Active Weapon shows a disabled `Active Weapon` action;
- closing the selector clears Preview but preserves committed Active state;
- no Weapon card may use a viewport-corner or Build-slot flight path for Preview/open/close.

This locks a shared **design system**, not identical gameplay semantics. A future Echo selector may reuse the same glass, stable-grid, Preview and action hierarchy while still obeying canonical Echo rules. Do not invent gameplay restrictions or confirmation semantics merely to match the visual pattern.

The exact approved glass values, hover/motion rules, containment requirements and responsive implementation contract live in `docs/UI_LAYOUT_MOTION_CONTRACT.md#10a-locked-reusable-glass-selectordetail-pattern`.

## Build a Character layout direction

After a Character is selected, Character focus and selector are independent layers. Expanding/collapsing the selector must not move, scale or dim the main Character art.

Desktop baseline:

- Character name + large Character centered as primary visual anchor;
- upper-left: Stats;
- lower-left: Weapon;
- right: **five** vertical Echo slots;
- intermediate left: vertical Sequences rail;
- S1 bottom → S6 top, circular nodes grow toward S6;
- `Add to Account` remains separate.

Mobile/narrow baseline:

- Character remains the primary visual anchor rather than being replaced by a stack of full-width sections;
- Stats, Weapon, Sequences and Echoes become compact function controls/icons around the Character workspace;
- activating one opens that same functional component in an overlay drawer, normally from the nearest relevant side;
- the Character workspace remains behind the drawer under a transparent dark scrim, with restrained optional backdrop blur;
- opening a drawer must not reflow or permanently move the Character stage;
- drawer close must be available through an explicit close/back affordance and tapping the scrim; gesture close may be added when verified;
- only one primary mobile drawer is open at a time.

Visual spacing can evolve through user-approved iterations, but Character focus/scale and containment rules must not regress while surrounding controls are refined.

## Asset status

Temporary prototype/parity assets belong under `docs/ui-prototypes/assets/v34/` when used by the implementation lane and should be copied into the built `/ui-preview/assets/v34/` artifact only after exact byte-valid assets are present.

Prototype art does not imply production rights clearance. Final Character/portrait/Sequence/Echo/Weapon asset sourcing remains a separate workstream.

Static portrait/icon asset identity is separate from card/hero presentation framing. Card/hero placement must use explicit component-local presentation metadata or reviewed derivatives rather than recomputing a visual center from transparent bounds, weapons, capes or other silhouette outliers.

## UI development workflow

Continue from the accepted v34 baseline rather than rebuilding from old Alpha or from prose alone.

For each meaningful slice:

1. fresh-read current `main`, current UI PR(s), this document and the layout/motion contract;
2. build/preview quickly;
3. verify in a real browser at the relevant responsive sizes;
4. get user approval;
5. checkpoint the coherent slice in GitHub;
6. continue.

Do not make a GitHub commit for every tiny pixel adjustment, but also do not wait until an entire large surface is finished before checkpointing.

A visual slice is not complete because it looks correct at one 1440px screenshot. Relevant narrow, normal desktop, wide and ultrawide checks from `UI_LAYOUT_MOTION_CONTRACT.md` are part of UI verification. Mobile interaction surfaces require real mobile/narrow verification.

Near-term implementation order is owned by the active UI lane and must be fresh-read before work. Do not assume a historical PR number is still current.

The old Alpha UI remains a runtime integration/regression surface during migration and should be retained as legacy/internal functionality rather than deleted blindly.
