# Bellibing UI/UX Status

Last reconciled: 2026-09-20

This document is the product/interaction source of truth for the **new Bellibing UI/UX direction** while it remains isolated from the current production Alpha web UI.

Durable companion docs on `main`:

- `docs/UI_AGENT_START.md` — first-read contract for new UI chats/agents;
- `docs/UI_BUILD_HANDOFF_V34.md` — accepted v34 visual/composition baseline;
- `docs/UI_TYPOGRAPHY.md` — canonical font/typography contract.

A new chat should not need old PR #192 or old chat transcripts to recover the accepted font or visual rules.

## Checkpoint

Current accepted UI foundation: **v34 — Home wheel + Character selector + five Echo slots + Sequence rail**.

Functional prototype:

- `docs/ui-prototypes/v34-functional.html`;
- deployed separately at `/ui-preview/` when the corresponding UI implementation checkpoint reaches `main`.

The preview may use recovered processed v34 Home artwork as **temporary prototype/parity assets**. They are not production-cleared material and must not be treated as final licensed assets.

## Product target

Primary target: desktop web + desktop app.

Mobile is a separate presentation pass. Desktop should show useful build context directly rather than hiding everything behind dropdowns. Mobile should reuse the same data/components with progressive disclosure when screen space requires it.

The collectible-card interaction language is intentionally reusable across desktop and mobile.

## Isolation from current live site

The existing GitHub Pages root remains the Bellibing Simulator Alpha/runtime regression implementation:

- `web/index.html`;
- `src/web/alpha-entry.ts`.

Do not replace the live root or remove Alpha/runtime routes until an explicitly reviewed migration exists. The new UI continues in the isolated `/ui-preview/` route during visual/product development.

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
- 0 owned Characters → `Build a Character` only;
- 1 owned Character → add `Improve a Character`;
- 2+ owned Characters → add `Build a Team`;
- Build means create/build a Character draft, then explicitly add it to the account;
- Improve operates only on Characters already added to the account;
- Team is a separate surface using account Characters.

Home visual baseline and exact card/art geometry are documented in `docs/UI_BUILD_HANDOFF_V34.md` and should not be freely redesigned by a new agent.

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
2. `COMPACT` — after selection, same wheel moves to the top and becomes small circular portrait placeholders;
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

Bellibing should not feel like abrupt page teleportation.

Major choices (Home → Build / Improve / Team): selected Home card advances/fades, surrounding cards recede/fade, destination enters from depth with deliberate overlap.

Character selection: large Character cards visibly glide upward while shrinking/morphing into compact portraits; this is intentionally softer/slower than a normal button response. Hover collapse is delayed slightly.

Minor actions remain faster/lighter; do not use the full cinematic transition for every click.

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

Visual spacing can evolve through user-approved iterations, but Character focus/scale must not regress while surrounding controls are refined.

## Asset status

Temporary prototype/parity assets belong under `docs/ui-prototypes/assets/v34/` when used by the implementation lane and should be copied into the built `/ui-preview/assets/v34/` artifact only after exact byte-valid assets are present.

Prototype art does not imply production rights clearance. Final Character/portrait/Sequence/Echo/Weapon asset sourcing remains a separate later workstream.

## UI development workflow

Continue from the accepted v34 baseline rather than rebuilding from old Alpha or from prose alone.

For each meaningful slice:

1. build/preview quickly;
2. verify in a real browser;
3. get user approval;
4. checkpoint the coherent slice in GitHub;
5. continue.

Do not make a GitHub commit for every tiny pixel adjustment, but also do not wait until an entire large surface is finished before checkpointing.

Near-term implementation order is owned by the active UI lane and must be fresh-read before work. Do not assume a historical PR number is still current.

The old Alpha UI remains a runtime integration/regression surface during migration and should be retained as legacy/internal functionality rather than deleted blindly.
