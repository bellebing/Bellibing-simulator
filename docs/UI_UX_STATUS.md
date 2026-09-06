# Bellibing UI/UX Status

Last reconciled: 2026-09-06

This document is the source-of-truth handoff for the **new Bellibing UI/UX direction** while it is still isolated from the current production Alpha web UI.

## Checkpoint

Current UI checkpoint: **v34 — five Echo slots + Sequence rail**.

Functional repo prototype:

- `docs/ui-prototypes/v34-functional.html`
- branch: `ui/ux-checkpoint-v34-2026-09-06`

The repo prototype intentionally uses **temporary no-art placeholders**. The current Character/Home artwork used during chat prototyping is not canonical production asset material and will be replaced/re-sourced later. The checkpoint preserves interaction, hierarchy, layout direction and motion behavior rather than claiming final assets.

## Isolation from current live site

The existing GitHub Pages root remains the old Bellibing Simulator Alpha implementation:

- `web/index.html`
- `src/web/alpha-entry.ts`
- current deploy workflow remains `.github/workflows/deploy-pages.yml`

The new UI prototype is **not wired into the production build or Pages deploy** yet. Do not replace the current live root or remove Alpha/runtime routes until an explicitly reviewed migration step exists.

## Locked product semantics

### Home

- Center-oriented, minimal UI.
- Home functions are large visual vertical cards with collectible-card proportions.
- Function availability is account-derived:
  - 0 owned Characters → `Build a Character` only.
  - 1 owned Character → add `Improve a Character`.
  - 2+ owned Characters → add `Build a Team`.
- `Build a Character` means create/build a Character draft, then explicitly add it to the account.
- `Improve a Character` operates only on Characters already added to the account.
- `Build a Team` is a separate future Team surface using account Characters.

### Account vs autosave

- Character work is autosaved continuously after changes.
- Navigation must never destroy Character work.
- Every Character has its own persistent draft/build state.
- Returning to a Character restores its previous build state.
- `Add to Account` is **not a Save button**. It promotes the Character from draft/work-in-progress into the user's account/bag.
- Opening `Build a Character` from Home always starts at the large Character selector, even when Character drafts already exist.

## Character selector

One selector component has two primary states plus one temporary expanded state:

1. `EXPANDED` — initial large horizontal Character-card wheel under `What Character?`.
2. `COMPACT` — after selection, same wheel moves to the top and becomes small circular portrait placeholders.
3. `HOVER_EXPANDED` — desktop hover over the compact wheel unfolds it into smaller Character cards; leaving the area collapses it after a short delay.

Behavior:

- drag/swipe/scroll/keyboard style horizontal navigation;
- center item is the active selection target;
- switching Character after entering a build requires confirmation;
- hover never switches Character by itself;
- release chronology/order is still pending source-backed metadata and must not be guessed.

`Improve a Character` uses the same selector behavior but its item source is **account-owned Characters only**.

## Motion language

Bellibing should not feel like abrupt page teleportation.

### Major choices

Examples: Home → Build / Improve / Team.

- selected Home card moves slightly forward and fades;
- surrounding Home cards fade;
- destination content appears from depth using scale + fade;
- motion is deliberate but not slow.

### Character selection

- large Character cards visibly glide upward while shrinking/morphing into compact portraits;
- this transition is intentionally softer/slower than a normal button response;
- compact hover expansion/collapse is also softened and collapse is delayed slightly.

### Minor actions

- should still have small responsive transitions;
- do not use the full cinematic major transition for every click.

## Build a Character layout direction

After a Character is selected, Character focus and selector are independent layers. Expanding/collapsing the selector must not move, scale or dim the main Character art.

Current layout study:

- Character name + large Character art centered as the primary visual anchor.
- left upper area: `Stats` placeholder.
- left lower area: `Weapon` placeholder.
- right side: **five** vertical Echo slots.
- left/intermediate side: vertical `Sequences` rail.
  - S1 at bottom;
  - progression upward to S6;
  - circular nodes gradually grow toward S6;
  - real game Sequence icons are future asset work.
- `Add to Account` remains a separate account action.

This exact placement is **not final**. It is the functional layout base for testing. Visual spacing, iconography and final assets remain open.

## Current asset status

Temporary only:

- Character art used during prototyping;
- Home card artwork;
- portrait icons;
- Sequence icons;
- Echo/Weapon art.

Do not treat prototype artwork as production-cleared assets. Asset provenance/rights and final sourcing remain a later explicit workstream.

## Next UI work

Continue from this checkpoint rather than rebuilding the interaction model from old Alpha UI.

Near-term UI work should stay page-by-page and small-slice:

1. validate Build layout/function placement;
2. add functional Weapon selection surface;
3. add functional Echo slot interaction;
4. add Sequence interaction;
5. only then refine exact art/assets and visual polish;
6. later migrate the accepted UI into the production `src/web` architecture and connect to canonical runtime/data.

The old Alpha UI remains a useful runtime integration/regression surface during this migration and should be moved/retained as a legacy/internal route rather than deleted blindly.
