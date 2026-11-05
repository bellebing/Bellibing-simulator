# Character Build Card — implementation notes

The `CharacterBuildCard` is a read-only projection of a saved Character build; Build owns the actual draft and equipment. Its UI design can change freely based on the live interface and the current user request.

## Existing component/API

- `docs/ui-prototypes/assets/character-build-card.js`: `CharacterBuildCard(host, {source, presentation: 'standard'})`.
- `setCharacter(name)`, `refresh()`, and `destroy()` control presentation without adding another saved build.
- Existing Build adapter reads `state.drafts[name].build` and the canonical Character/Weapon/Echo/Forte/Stats sources; Character identity, saved Skills/Sequence and physical equipped Echoes come from those sources.
- On the historical Build route, Add to Account opens a saved-build review card; closing/reopening is a read-only interaction. Check the actual current route before relying on this behavior.
- Unresolved canonical art or stat facts remain Pending, not invented; no extra DPS or Echo Score is computed in the card.

## Testing

`scripts/verify-v34-character-build-card.mjs` exercises saved state, read-only rendering, Character switching, reload, multiple consumers, Echo values and real-browser appearance. The earlier fixed-column/166px card layout was a historical design, **not a requirement**. New visual compositions should be checked for visible text/art, usable controls and correct data; browser selectors may need updating when the implementation actually changes.
