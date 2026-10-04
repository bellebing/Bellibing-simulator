# Composable profile bases

Bellibing keeps raw Wuthering Waves game data separate from product defaults and combat assumptions.

## Independent bases

1. `characters.ts` — raw character identity/stats.
2. `weapons.ts` — raw weapon identity/core stats.
3. `echoes.ts` / `sonatas.ts` — raw Echo and Sonata identity.
4. `weaponRecommendations.ts` — character-to-weapon recommendation relationships.
5. `echoLoadoutProfiles.ts` — Echo layout, set, main Echo and main-stat shell.
6. `statTargetProfiles.ts` — source-backed build-stat priority/ties and total-stat gates; independent of decision-runtime availability.
7. `teamProfiles.ts` — team membership.
8. `rotationProfiles.ts` — team-specific/mode-specific source sequence plus an explicit execution boundary: `SOURCE_SEQUENCE_ONLY` or `ENGINE_MODELED`.
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
6. Preserve a source-reviewed rotation as `SOURCE_SEQUENCE_ONLY` until a real combat/rotation engine model exists; never invent `engineModelId` merely to complete a profile.
7. Run the required backward-impact audit for every new/changed weapon, set, Echo and team-facing character effect.
8. Rebenchmark affected existing profiles under comparable contexts.
9. Only then mark the intended user-facing integration complete.

The UI discovers `uiSelectable` presets through the registry automatically.

Changing only a recommendation should touch only its owning base. For example, changing a character's preferred substat priority must not require editing raw Character, Weapon, Echo, Team or UI files.

## Verification boundary

Every profile carries provenance and verification status. A missing or disputed relation remains `PENDING`/`PARTIALLY_VERIFIED`; it must not be guessed simply to make a preset complete.

Raw-data verification and profile/recommendation verification are separate claims. Source-backed build-stat presentation does not establish available evaluator or decision capability.

Rotation source verification and rotation execution verification are likewise separate claims. `SOURCE_SEQUENCE_ONLY` may be fully source-verified as recommendation/profile data while remaining non-executable. `ENGINE_MODELED` is reserved for a rotation backed by an actual Bellibing engine model.

New content also carries a third project-level obligation: compatible existing profiles must be screened for backward impact before the patch integration is considered complete.

## Profile readiness and Pre-DPS freeze

`profileReadinessRegistry.ts` is the fail-closed bridge between composable profiles and future Character DPS adapters. It classifies every released Character exactly once:

- `PROFILE_SOURCE_PENDING` — no fully VERIFIED default six-part profile package exists yet;
- `PROFILE_COMPLETE_PENDING_FREEZE` — a fully VERIFIED default package exists, but final current-patch preflight/backward-impact/adapter freeze is not approved;
- `CHARACTER_MECHANICS_SOURCE_BLOCKED` — canonical Character Mechanics is source-blocked and cannot receive a DPS adapter;
- `DPS_READY` — an explicit current-patch freeze approval exists and all preflight gates pass.

A fully VERIFIED preset is therefore **not** equivalent to `DPS_READY`. A source-verified `SOURCE_SEQUENCE_ONLY` rotation may complete the recommendation/profile package, but it cannot satisfy future DPS execution readiness until its required rotation/combat adapter is independently implemented, verified and represented by `ENGINE_MODELED`. A future freeze approval must name the approved preset, preserve current-patch evidence, record backward-impact review and account for every specialized execution adapter required by that supported profile. Raw Character null fields, unresolved intrinsic stats and Character Mechanics source blockers remain independent DPS blockers.


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

## Private runtime boundary

Improvement Cost / evaluator uses a private decision-engine contract. Proprietary policy and calibration are not part of the public repository.
