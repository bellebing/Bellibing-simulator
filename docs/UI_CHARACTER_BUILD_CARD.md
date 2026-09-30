# Character Build Card

The first `CharacterBuildCard` is a read-only view of one saved Character build. It is implemented above PR218 head `c1709692cbf29d1d544216e7a6eeb06e2f276924` and is awaiting user visual review. Improve and the Echo Workspace retain their existing behavior.

## First consumer: Build completion

`Add to Account` still promotes the selected Character into the account. After promotion, Build opens **Here is your Character** with that Character's card. **Back to Build**, Close, Escape and clicking the scrim return to the existing editing surface. **View Character Card** reopens the card for the currently selected account Character, including after reload.

The card does not save a second build or change ownership. Opening, rendering and closing it do not write saved gameplay state. Build remains the editor.

## Component and state ownership

- `docs/ui-prototypes/assets/character-build-card.js` exposes `CharacterBuildCard(host, {source, presentation: 'standard'})`.
- `setCharacter(name)` changes the presentation's identity; `refresh()` reads current values; `destroy()` removes the subscription and DOM.
- The source adapter in `v34-functional.html` reads existing Character-owned `state.drafts[name].build`. It owns no cached or copied build model.
- The component subscribes to saved-build and canonical-source readiness events through the adapter. Multiple mounted consumers can render the same build with unique Forte SVG IDs.
- The `presentation` option reserves the API boundary for future modes. Only `standard` is implemented; compact/comparison, Team and image export are deferred.

The same component can be mounted by a future Team, comparison, results or share surface. Such a consumer must reuse the owning build/projection readers; export must not introduce a second designed card layout.

## Existing source projections

- Character identity and art come from the canonical released roster and Hero Art runtime, preserving Character-local framing. Unresolved art remains Pending.
- Sequence uses the same source chain icons, saved level, normalizer and visual node family as Build, read-only from S6 at the top to S1 at the bottom.
- Weapon reads the saved equipped ID and canonical current name/art/secondary/Base ATK values.
- Skills use `skillsUi.renderTree` with the existing Forte model, saved investment, compact mode and `readOnly: true`. No second Skills layout/model is introduced.
- Stats call the existing `statsUi.project(name)`. Its default remains the current Build Character, so existing Build callers retain their behavior. The same existing static projection boundaries still apply; this card adds no combat, DPS or Sonata-effect calculations.
- The six primary Stats always appear in fixed order. Extra rows come from the existing stat specs and appear only when the current projection provides a finite, nonzero value. No Character-specific importance weights are inferred.
- All five committed Echo slots remain visible together. Identity/art/Cost/Sonata resolve through existing canonical maps; current Main Stat, Secondary Main Stat and every saved Substat use the existing stat formatter. Empty and unresolved values remain explicit; no Echo Score is computed.

## Locked desktop layout

Sequence runs vertically from S6 to S1 immediately left of Character art. The single Stats list sits to the right of the art. Weapon sits below the art, with Skills/Forte below Stats. The upper area stays compact while the card's width supports five readable Echo cards in one horizontal row.

Echo names, Cost, artwork, Sonata, both Main Stats and every saved Substat remain visible directly. The row does not wrap or hide details. Presentation changes retain the same source adapter and saved-build projection.

## Verification

`node scripts/verify-v34-character-build-card.mjs` runs against `BELLIBING_V34_URL` in real Chrome. It covers physical Add to Account/reopen/close, ownership versus draft semantics, read-only persistence, canonical values, dynamic bonus rows, all five Echo stat cards, multiple consumers, editing through Build, Character switching, reload and desktop geometry at 1440×900, 1920×1080 and 2560×1440. The normal Verify workflow runs it and includes its screenshots in the visual artifact.

Screenshots use canonical configured test builds in an isolated Chrome profile. They are not the user's private account data or invented display-only stat values. A new browser profile can reproduce the product flow through Build → choose a Character → configure the build → Add to Account.

PR218's known live Echo/Sonata raw coverage drift remains a separate source-reconciliation boundary. This UI slice does not weaken the gate or update gameplay sources to bypass it. Exact head and Verify status belong in the stacked draft PR and review report. No merge is authorized.
