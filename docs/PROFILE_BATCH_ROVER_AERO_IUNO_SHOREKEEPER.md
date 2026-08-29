# Source-backed profile batch — Rover (Aero), Iuno, The Shorekeeper

Checked: 2026-08-29  
Patch baseline: 3.6

This note records the reviewed source context for the second composable profile population batch. It is profile/source evidence, not a DPS execution claim.

## Rover (Aero) — Cartethyia + Ciaccona support

Source: Prydwen Rover (Aero) current build/rotation page.

- Weapon: Bloodpact's Pledge R1.
- Echo shell in the reviewed high-investment Cartethyia + Ciaccona context: Windward Pilgrimage / Reminiscence: Fleurdelys.
- Main-stat source shape: CRIT Rate = CRIT DMG 4-cost; Aero DMG 3-cost; Aero DMG > ATK% second 3-cost; ATK% / ATK% 1-costs.
- Build priority: ER until satisfied > CRIT Rate = CRIT DMG > ATK% > Skill DMG > flat ATK.
- Context ER target: 138% total, the high end of the source 128%-138% band for Cartethyia + Ciaccona.
- Standard source sequence and separate Echo-use guidance are stored as `SOURCE_SEQUENCE_ONLY`.

Execution remains pending for Bloodpact healing/Unbound Flow team-amplification events, Fleurdelys character restriction/active damage, and the rotation engine model.

## Iuno — Augusta Hybrid/Sub DPS

Source: Prydwen Iuno current build/rotation page.

- Mode is Hybrid/Sub DPS with Augusta, not Main DPS Iuno.
- Weapon: Moongazer's Sigil R1.
- Echo shell: Moonlit Clouds / Impermanence Heron.
- Main-stat source shape: CRIT Rate = CRIT DMG 4-cost; Aero DMG 3-cost; Aero DMG > ATK% second 3-cost; ATK% / ATK% 1-costs.
- Build priority: ER until satisfied > CRIT Rate = CRIT DMG > Liberation DMG >= ATK% > flat ATK. Bellibing keeps the non-equality conservatively instead of inventing a tie.
- Hybrid ER band: 120%-130%+ in the reviewed Augusta context.
- The source Sub DPS sequence plus Heron cancel guidance is stored as `SOURCE_SEQUENCE_ONLY`.

Execution remains pending for Moongazer trigger/shield-stack state, Heron active transfer/damage lifecycle, and the rotation engine model.

## The Shorekeeper — Augusta + Iuno support

Source: Prydwen The Shorekeeper current build/rotation page.

- Weapon: Stellar Symphony R1.
- Echo shell: Rejuvenating Glow / Fallacy of No Return.
- Main-stat source shape: CRIT DMG > HP% 4-cost; ER first 3-cost; ER = Spectro DMG alternatives on the second 3-cost; HP% / HP% 1-costs.
- Build priority: ER until 230% > CRIT DMG >= Liberation DMG > HP% > CRIT Rate > flat HP > ATK% = flat ATK.
- The source 230% ER target is explicitly before the +10% Fallacy effect and Shorekeeper's +10% passive contribution.
- Standard source sequence uses Fallacy before Liberation and is stored as `SOURCE_SEQUENCE_ONLY`.

Execution remains pending for Stellar Symphony resource/healing-qualified team events, Fallacy active damage, and the rotation engine model. Fallacy's non-damage cast effects are already source-modeled separately.

## Readiness effect

After this batch, the intended fail-closed readiness snapshot is:

- 6 `PROFILE_COMPLETE_PENDING_FREEZE`;
- 3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`;
- 48 `PROFILE_SOURCE_PENDING`;
- 0 `DPS_READY`.

No freeze approval is added by this batch.
