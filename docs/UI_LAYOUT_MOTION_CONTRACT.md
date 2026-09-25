# Bellibing UI Layout & Motion Contract

Last reconciled: 2026-09-25

This file is the canonical implementation contract for **containment, responsive layout and motion** in the Bellibing New UI.

It exists to prevent layout drift between chats/agents and to stop viewport-specific pixel fixes from becoming architecture.

## Authority and non-duplication

- `UI_UX_STATUS.md` owns product/interaction semantics.
- This file owns containment, responsive presentation and motion invariants.
- `UI_BUILD_HANDOFF_V34.md` is the accepted v34 visual/parity reference. Exact v34 offsets/crops remain useful reference values, but they do not override this file's containment rules.
- `UI_TYPOGRAPHY.md` owns font truth.

Do not restate a second conflicting layout/motion system in another document. Link here instead.

## 1. Containment hierarchy

Bellibing layout follows this ownership chain:

```text
Viewport
└── AppShell
    └── Surface / Stage
        └── Component
            ├── local art layer
            ├── local text layer
            ├── local controls
            └── local overlays/badges
```

Rules:

- the viewport determines available space but is **not** the direct coordinate parent for ordinary component content;
- the centered `AppShell` owns maximum spread and outer gutters;
- each surface/stage owns the relationship between sibling components;
- each component owns the coordinate system for its own text, image and overlays;
- moving/scaling a card must carry its title, art and card-local controls with it automatically;
- avoid placing card-local content with viewport units such as `vw`/`vh`, browser-edge offsets or unrelated page coordinates;
- fixed/viewport positioning is reserved for intentional global layers such as modal scrims, top-level menus or viewport-safe overlays.

## 2. Maximum spread / ultrawide rule

The application shell must have a **finite maximum inline size** and remain centered.

The exact final max-width token is tuned in the Home reference implementation and then reused; do not spread child components indefinitely as the physical monitor grows.

When viewport width exceeds the application shell:

- extra width becomes outer background/gutter;
- carousel/card spacing stops growing;
- left/right functional groups stay visually connected to the center composition;
- the UI must not migrate toward the monitor edges on 3440px/5120px/7680px displays.

Do not solve ultrawide with per-screen manual offsets. Fix the owning container.

## 3. Component-local coordinates

A visual card/panel is the reference frame for its children.

For Home cards this means:

- card title is positioned relative to the card;
- card art is positioned/cropped relative to the card;
- gradients, badges and future overlays are positioned relative to the card;
- carousel movement changes the card transform, not each child independently.

Character/card art must use reviewed semantic composition rather than geometric transparent-bounds centering.

Presentation data may carry explicit card-local values such as:

```text
anchorX
anchorY
scale
offsetX
offsetY
```

These values describe composition inside the owning component. They are not viewport coordinates and must not be re-guessed every render.

For already reviewed static portrait assets, the image itself remains the portrait source of truth; do not add unnecessary auto-cropping logic.

## 4. Home carousel responsive contract

Home always contains exactly three navigation cards in fixed logical order:

1. Build a Character
2. Improve a Character
3. Build a Team

Improve starts as the default centered focus.

Wide/desktop:

- show the focused card and both neighbors as the three-card composition;
- preserve collectible-card proportions and approved v34 visual intent;
- carousel spacing comes from component/layout tokens, not unrestricted viewport width.

Narrow/mobile:

- keep one clear focused card;
- neighboring cards may remain partially visible as edge peeks;
- swipe/drag moves focus;
- tapping a non-focused visible card may focus it first, then activation enters the destination;
- cards must remain reachable without horizontal page scrolling or clipped navigation.

The same card component/state/data is used at every size. Mobile is a presentation mode, not a second Home implementation.

## 5. Build workspace responsive contract

Desktop/wide keeps the accepted v34 composition:

- Character = central visual anchor;
- Stats = upper-left;
- Weapon = lower-left;
- Sequences = intermediate left;
- five Echo slots = right;
- selector = independent layer;
- Add to Account = separate action.

Narrow/mobile keeps the Character as the visual anchor and progressively discloses tools:

- compact Stats control/icon;
- compact Weapon control/icon;
- compact Sequences control/icon;
- compact Echoes control/icon;
- selecting a control opens the same functional component in a drawer/overlay;
- left-associated tools normally enter from the left, right-associated tools from the right;
- the open drawer sits above the Character stage;
- the stage remains visible beneath a transparent dark scrim with restrained optional blur;
- opening/closing the drawer must not permanently reflow or relocate the Character;
- only one primary drawer is open at a time.

The drawer is a presentation container. Stats/Weapon/Sequences/Echoes data and component logic must not be forked into mobile-only implementations.

## 6. Responsive state selection

Prefer container/component queries where practical so behavior follows the available application surface rather than a specific physical device name.

The implementation may use measured breakpoints, but the product states are:

- `WIDE` — full desktop composition;
- `COMPACT` — reduced spacing/scales while preserving the desktop relationship when it still fits;
- `MOBILE_DISCLOSURE` — focused carousel and tool drawers instead of off-screen side panels.

A breakpoint exists to switch presentation state, not to patch one monitor model.

No important control may become unreachable merely because the viewport is smaller.

## 7. Motion philosophy: continuity / object permanence

Motion should make the interface feel like persistent objects changing state.

Prefer transitions where the user's source object visibly leads into the destination:

- Home card → destination surface;
- Character card/portrait → selected Character focus;
- selected Character focus → portrait/card when returning;
- compact tool control → drawer containing that tool's content.

Do not fake continuity by teleporting the source away and independently popping in an unrelated destination when a shared spatial transition is practical.

## 8. Motion timing bands

These are engineering target bands, not permission to tune every component independently:

- micro feedback: approximately **120–180ms**;
- drawers / ordinary panel transitions: approximately **280–380ms**;
- major card/Character morph or navigation transition: approximately **450–650ms**.

A normal interaction should not exceed roughly 700ms without explicit visual approval. Historical v34 prototype values such as the 920ms selector animation are parity history, not the current timing contract.

Major motion should feel weighted rather than snappy. The existing v34 family `cubic-bezier(.16,.84,.24,1)` is the preferred starting easing for major transforms unless a reviewed transition demonstrates a better fit.

Minor controls may use a simpler fast ease-out.

## 9. Motion implementation rules

Prefer animating:

- `transform`;
- `opacity`;
- scrim/background opacity;
- carefully bounded blur when performance remains acceptable.

Avoid driving major transitions through repeated `top/left/width/height` layout thrash when a transform can express the same motion.

Do not animate unrelated siblings just because one control changed state.

Character selector expansion/collapse and Character focus are independent layers: selector motion must not accidentally rescale/reposition the Character focus.

## 10. Overlay/scrim behavior

Mobile drawers use a top-level overlay layer but their content remains the same feature component.

Required behavior:

- dark transparent scrim preserves awareness of the underlying Character;
- optional blur is subtle and must not destroy legibility/performance;
- explicit close/back affordance;
- tapping scrim closes;
- browser/app back should close the open drawer before abandoning the build where platform integration permits;
- focus/keyboard handling must remain accessible when implemented.

## 10A. Locked reusable glass selector/detail pattern

The Weapon selector review establishes the default visual/motion family for future **item selectors and detail inspectors** such as Weapon, Echo and comparable Build tools. Reuse this pattern instead of inventing a new modal language for each feature.

This is a reusable **presentation and continuity pattern**, not a requirement that every feature share identical product semantics.

### Layering contract

The approved selector is explicitly split into glass and content layers:

- viewport scrim reference: `rgba(4,5,8,.48)`;
- main selector panel reference gradient: `rgba(19,22,28,.74)` → `rgba(10,12,16,.70)`;
- main selector backdrop reference: `blur(5px) saturate(.88)`;
- item cards, artwork, labels, stats and primary action content remain visually solid/full-opacity above the glass;
- do **not** create the transparency by lowering opacity on a parent that contains the cards/content, because that fades the interactive content together with the background;
- preserve enough contrast that the underlying Character/Build stage is clearly contextual but never competes with the active selector.

These values are the approved Bellibing reference target for this family. A feature may require a small accessibility/performance adjustment, but a different visual treatment requires explicit review rather than silent drift.

### Grid/card contract

For browseable visual items:

- cards use a stable local frame and normally a square/near-square visual footprint when the artwork benefits from full silhouette visibility;
- artwork uses contained framing unless a source-backed reviewed crop says otherwise;
- hover on pointer devices gives a subtle bubble/focus lift without reflowing neighbors;
- the approved Weapon reference is approximately 5–8% scale-up with a small upward lift, stronger border/shadow and unchanged grid geometry;
- touch/mobile does not emulate sticky desktop hover.

### Browse → Preview → Commit continuity

Where a feature has meaningful detail inspection before committing a choice, prefer:

`Grid → Preview → explicit domain action → Current`

Rules:

- the clicked/source card should remain the same visual object through the transition when practical;
- temporarily reserve its source position with a ghost/placeholder so the surrounding grid does not jump;
- Preview is inspection state and must not silently mutate Current/Equipped state;
- the domain action (for example `Choose Weapon`) is the commit point when the product semantics require an explicit choice;
- on replacement, the new Preview object moves into Current while the old Current object returns to its own candidate/grid position where applicable;
- avoid duplicated simultaneous representations of the same selected item when object continuity can express the state more clearly;
- close/back returns the current feature representation to its Build control/slot when that continuity is part of the feature.

Do not force an explicit Choose/Apply step on features whose product semantics are intentionally immediate. Reuse the visual hierarchy and object-permanence motion while preserving the owning feature's interaction contract.

### Responsive presentation

- desktop/wide may expose browse/grid and detail/Preview side by side;
- narrow/mobile uses the same state and feature component but may present Preview as a near-full drawer/detail layer;
- underlying Character/Build context remains visible through the approved glass treatment;
- mobile presentation must not fork feature data or business logic;
- entry direction should still respect spatial ownership where meaningful (left-associated tools from left, right-associated tools from right).

### Reuse rule

Before designing a new Build selector/inspector, first test whether this pattern fits. New visual language is justified only when the feature's information architecture genuinely cannot use the established glass + solid-content + continuity model.

## 11. Reduced motion

Respect `prefers-reduced-motion: reduce`.

Reduced motion keeps state changes understandable but removes large spatial travel/zoom:

- replace major morph/zoom with short opacity/crossfade where possible;
- remove decorative parallax;
- keep essential focus/state feedback.

Reduced motion is not permission to skip the final state.

## 12. Verification matrix

A meaningful layout/motion change is not visually complete until checked in a real browser at representative sizes.

Minimum reference matrix:

- **390×844** — phone portrait;
- **768×1024** — tablet/narrow;
- **1440×900** — normal desktop review baseline;
- **1920×1080** — standard full-HD desktop;
- **2560×1440** — wide desktop;
- **3440×1440** — ultrawide;
- **7680×2160** — extreme ultrawide/max-spread guard.

The exact screenshots do not all need to be committed for every tiny change, but the relevant states must be exercised for a coherent slice.

Acceptance checks:

- no important control is off-screen/unreachable;
- no horizontal page scroll is required for Home navigation;
- the app shell stays centered and finite on ultrawide;
- card-local text/art remain attached to the card through carousel motion;
- mobile carousel exposes reachable neighbors/focus;
- mobile Build drawers open/close without moving the underlying Character stage;
- desktop and mobile use the same underlying state/data;
- no visual bug is marked fixed from CI alone when live/browser visual verification is required.

## 13. Home as reference implementation

Before adding more visual complexity, Home carousel is the reference implementation for this contract.

Implementation order:

1. establish the finite centered AppShell;
2. make Home card children strictly card-local;
3. verify desktop carousel behavior;
4. verify mobile focus/peek/swipe behavior;
5. verify the full responsive matrix including 7680px ultrawide;
6. only then use the same containment/motion rules for deeper Build surfaces.

This is an architecture/interaction contract. Exact art framing and final pixel tuning still require user visual approval.
