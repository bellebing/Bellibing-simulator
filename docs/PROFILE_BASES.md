# Composable profile bases

Bellibing keeps raw Wuthering Waves game data separate from product defaults and combat assumptions.

## Independent bases

1. `characters.ts` — raw character identity/stats.
2. `weapons.ts` — raw weapon identity/core stats.
3. `echoes.ts` / `sonatas.ts` — raw Echo and Sonata identity.
4. `weaponRecommendations.ts` — character-to-weapon recommendation relationships.
5. `echoLoadoutProfiles.ts` — Echo layout, set, main Echo and main-stat shell.
6. `statTargetProfiles.ts` — Core/Useful targets, minimum rolls and build gates.
7. `teamProfiles.ts` — team membership.
8. `rotationProfiles.ts` — team-specific/mode-specific rotation metadata pointing at an engine model.
9. `characterBuildPresets.ts` — tiny composition records used by future UI.

The UI must select a preset/profile ID and resolve it through `profileRegistry.ts`. It must not maintain hard-coded character arrays or copy build data into frontend components.

## Multiple modes

A single raw character may have any number of presets. This is how Bellibing represents characters whose correct build depends on playstyle, teammate, mechanic state or rotation family.

Example shape:

- `character-x-standard`
- `character-x-melee`
- `character-x-team-y`

All may point at the same raw Character record while selecting different weapon recommendation, Echo shell, stat target, team and rotation profile IDs.

Exactly one preset may be marked default for a character. Other presets are alternatives.

## Patch/update workflow

Adding a new character should be data work, not UI work:

1. Run the Character Preflight in [`CONTENT_PREFLIGHT_AND_IMPACT_AUDIT.md`](CONTENT_PREFLIGHT_AND_IMPACT_AUDIT.md).
2. Add/update the raw Character record.
3. Add new raw Weapons/Echoes/Sonatas only if the patch introduced them.
4. Add the relevant independent recommendation/profile records.
5. Add one or more `CharacterBuildPreset` composition records.
6. Run the required backward-impact audit for every new/changed weapon, set, Echo and team-facing character effect.
7. Rebenchmark affected existing profiles under comparable contexts.
8. Only then mark the intended user-facing integration complete.

The UI discovers `uiSelectable` presets through the registry automatically.

Changing only a recommendation should touch only its owning base. For example, changing a character's preferred substat requirement must not require editing raw Character, Weapon, Echo, Team or UI files.

## Verification boundary

Every profile carries provenance and verification status. A missing or disputed relation remains `PENDING`/`PARTIALLY_VERIFIED`; it must not be guessed simply to make a preset complete.

Raw-data verification and profile/recommendation verification are separate claims.

New content also carries a third project-level obligation: compatible existing profiles must be screened for backward impact before the patch integration is considered complete.

## Generalized Roll Advisor requirements

Fallback roll profiles no longer assume that every character has exactly two Core targets.

The selected character/mode profile owns:

- the Core target set;
- the Useful target set;
- `requiredCoreHits`;
- `requiredUsefulHits`;
- minimum rolls;
- conditional gates.

The legacy Bellibing Budget checkpoint behavior around Dead/Filler routing remains a guide-profile fallback. The final requirement itself is data-driven.

## Augusta golden composition

The first production fixture is `augusta-standard`, resolved from current V9.15 + current references:

- default weapon: Thunderflare Dominion R1;
- Echo shell: Crown of Valor + 2P Void Thunder, The False Sovereign main Echo;
- current V9.15 main-stat shell: CRIT Rate / Electro / Electro / ATK% / ATK%;
- current V9.15 active target policy: **2 Core + Any 1 Useful**;
- standard team: Augusta / Iuno / Shorekeeper;
- rotation engine model: `AUGUSTA_STD_V1`, 11.17 seconds.

The active Any-1 requirement is locked by parity against the current V9.15 Build Simulator and CURRENT Strategy Cache. Stricter Any-2/Any-3 targets may exist as separate selectable target qualities; they are not the active Augusta Recommended fixture.

This document intentionally does not define Aemeath mode links yet. The architecture supports multiple modes, but production links are only added after their contexts are verified.
