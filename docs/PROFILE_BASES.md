# Composable profile bases

Bellibing keeps raw Wuthering Waves game data separate from product defaults and combat assumptions.

## Independent bases

1. `characters.ts` — raw character identity/stats.
2. `weapons.ts` — raw weapon identity/core stats.
3. `echoes.ts` / `sonatas.ts` — raw Echo and Sonata identity.
4. `weaponRecommendations.ts` — character-to-weapon recommendation relationships.
5. `echoLoadoutProfiles.ts` — Echo layout, set, main Echo and main-stat shell.
6. `statTargetProfiles.ts` — source-backed build-stat priority/ties and total-stat gates; **not** Roll Assistant stopping thresholds.
7. `teamProfiles.ts` — team membership.
8. `rotationProfiles.ts` — team-specific/mode-specific source sequence plus an explicit execution boundary: `SOURCE_SEQUENCE_ONLY` or `ENGINE_MODELED`.
9. `characterBuildPresets.ts` — tiny composition records used by future UI.
10. `CharacterRollProfile` in `targetCheckpointPolicy.ts` — separate fallback Roll Assistant policy: minimum roll values, required Core/Useful hit counts, Dead/Filler treatment and first checkpoint.

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
6. Preserve a source-reviewed rotation as `SOURCE_SEQUENCE_ONLY` until a real combat/rotation engine model exists; never invent `engineModelId` merely to complete a profile.
7. Add a `CharacterRollProfile` only when Bellibing has separately verified stopping-policy evidence. A build guide's stat priority alone is not evidence for minimum roll thresholds or required hit counts.
8. Run the required backward-impact audit for every new/changed weapon, set, Echo and team-facing character effect.
9. Rebenchmark affected existing profiles under comparable contexts.
10. Only then mark the intended user-facing integration complete.

The UI discovers `uiSelectable` presets through the registry automatically.

Changing only a recommendation should touch only its owning base. For example, changing a character's preferred substat priority must not require editing raw Character, Weapon, Echo, Team or UI files.

## Verification boundary

Every profile carries provenance and verification status. A missing or disputed relation remains `PENDING`/`PARTIALLY_VERIFIED`; it must not be guessed simply to make a preset complete.

Raw-data verification and profile/recommendation verification are separate claims. Build-stat verification and Roll Assistant policy verification are also separate claims: a current guide can prove that CRIT Rate or Energy Regen is important without proving that a specific in-game roll magnitude should pass or that an Echo must contain a fixed number of Core/Useful hits.

Rotation source verification and rotation execution verification are likewise separate claims. `SOURCE_SEQUENCE_ONLY` may be fully source-verified as recommendation/profile data while remaining non-executable. `ENGINE_MODELED` is reserved for a rotation backed by an actual Bellibing engine model.

New content also carries a third project-level obligation: compatible existing profiles must be screened for backward impact before the patch integration is considered complete.

## Profile readiness and Pre-DPS freeze

`profileReadinessRegistry.ts` is the fail-closed bridge between composable profiles and future Character DPS adapters. It classifies every released Character exactly once:

- `PROFILE_SOURCE_PENDING` — no fully VERIFIED default six-part profile package exists yet;
- `PROFILE_COMPLETE_PENDING_FREEZE` — a fully VERIFIED default package exists, but final current-patch preflight/backward-impact/adapter freeze is not approved;
- `CHARACTER_MECHANICS_SOURCE_BLOCKED` — canonical Character Mechanics is source-blocked and cannot receive a DPS adapter;
- `DPS_READY` — an explicit current-patch freeze approval exists and all preflight gates pass.

A fully VERIFIED preset is therefore **not** equivalent to `DPS_READY`. A source-verified `SOURCE_SEQUENCE_ONLY` rotation may complete the recommendation/profile package, but it cannot satisfy future DPS execution readiness until its required rotation/combat adapter is independently implemented, verified and represented by `ENGINE_MODELED`. A future freeze approval must name the approved preset, preserve current-patch evidence, record backward-impact review and account for every specialized execution adapter required by that supported profile. Raw Character null fields, unresolved intrinsic stats and Character Mechanics source blockers remain independent DPS blockers.

Roll Assistant fallback-policy coverage is not used as a shortcut for DPS readiness. The final stopping policy becomes whole-build DPS-aware after verified Character DPS exists; until then a separately verified `CharacterRollProfile` may provide the guide/fallback checkpoint policy where available.

`npm run audit:profile-readiness` also snapshots the current catalog counts and rejects silent profile drift/orphan components. The audit runs in Verify, Export and Deploy. It is allowed to pass while the backlog is explicitly classified; `preDpsFreezeReady` remains false until that backlog/freeze work is genuinely closed.

Current Version 3.6 baseline at 2026-08-29:

- 57 released Characters classified;
- 1 `PROFILE_COMPLETE_PENDING_FREEZE`: Augusta;
- 3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`: Buling, Danjin, Xiangli Yao;
- 53 `PROFILE_SOURCE_PENDING`;
- 0 `DPS_READY`;
- raw DPS-preflight blockers: Qingxiao, Rover (Electro), Suisui;
- intrinsic DPS-preflight blocker: Mornye.

The pinned `DommyMM/wuwabuild` `/builds` route was checked during this inventory and explicitly describes its records as community-submitted builds. Those observations may be useful research input, but they are not promoted wholesale into Bellibing canonical recommendation/team/rotation truth.

## Generalized Roll Advisor requirements

Fallback Roll Assistant policy lives in `CharacterRollProfile`, separate from the composable build-stat profile. It no longer assumes that every character has exactly two Core targets.

A verified Roll policy may own:

- the Core target set;
- the Useful target set;
- `requiredCoreHits`;
- `requiredUsefulHits`;
- minimum roll magnitudes;
- Dead/Filler routing;
- the first checkpoint to evaluate.

The legacy Bellibing Budget checkpoint behavior around Dead/Filler openers remains the current guide/profile fallback. The final stopping decision is intentionally replaced by whole-build DPS-aware evaluation character-by-character once that Character has a verified DPS adapter.

## Augusta golden composition

The first production fixture is `augusta-standard`, resolved from current V9.15 + current references:

- default weapon: Thunderflare Dominion R1;
- Echo shell: Crown of Valor + 2P Void Thunder, The False Sovereign main Echo;
- current V9.15 main-stat shell: CRIT Rate / Electro / Electro / ATK% / ATK%;
- current source-backed build-stat priority: Energy Regen until satisfied > CRIT Rate = CRIT DMG > ATK% = Heavy Attack DMG among the tracked stats, with the verified ER total gate;
- separate current V9.15 Roll policy: **2 Core + Any 1 Useful** with the audited per-roll thresholds;
- standard team: Augusta / Iuno / Shorekeeper;
- rotation execution: `ENGINE_MODELED` through `AUGUSTA_STD_V1`, 11.17 seconds.

The active Any-1 Roll requirement is locked by parity against the current V9.15 Build Simulator and CURRENT Strategy Cache. Stricter Any-2/Any-3 Roll targets may exist as separate selectable target qualities; they are not the active Augusta Recommended fallback policy.

This document intentionally does not define Aemeath mode links yet. The architecture supports multiple modes, but production links are only added after their contexts are verified.
