# Character Raw Data — four-Character verification batch 1

**2026-10-11 · Source/data review · base main `102b66edec165f3d2a313a562de4049a26424924`.**

**Explicit decision:** `VERIFIED + DATA_ONLY` for exactly **Cartethyia, Chisa, Ciaccona and Iuno**. Source-review changes only; no numeric stats, source mechanics, gear, recommendations or readiness were changed. Pre-existing manual [Worker 13 research (Draft #264)](https://github.com/bellebing/Bellibing-simulator/pull/264) is evidence, not an automatic approval.

## Source authority and source-family review

Bellibing's [game-data verification policy](DATA_VERIFICATION_POLICY.md) chooses the [Prydwen Lv90 Stats roster](https://www.prydwen.gg/wuthering-waves/stats), updated **2026-10-08**, for published integer HP/ATK/DEF and the **separately labelled Max Energy cap**. The respective individual [Cartethyia](https://www.prydwen.gg/wuthering-waves/characters/cartethyia), [Chisa](https://www.prydwen.gg/wuthering-waves/characters/chisa), [Ciaccona](https://www.prydwen.gg/wuthering-waves/characters/ciaccona) and [Iuno](https://www.prydwen.gg/wuthering-waves/characters/iuno) profiles corroborate explicit named cap 125, base CRIT Rate **5%**, CRIT DMG **150%**, Minor Fortes, and the known 5★ rarity, element and weapon. Each profile and the Stats roster was checked **2026-10-11**. Max Energy **does not mean** Resonance Liberation Cost; no energy cap is inferred from a cost.

The current Wuwa Wiki [Cartethyia](https://wuwa.wiki/en/codex/resonators/1409), [Chisa](https://wuwa.wiki/en/codex/resonators/1508), [Ciaccona](https://wuwa.wiki/en/codex/resonators/1407), [Iuno](https://wuwa.wiki/en/codex/resonators/1410) codex pages independently display matching base CRIT values and **100% base Energy Regen**, as well as their Lv90 HP/ATK/DEF families. Where exposed, the live codex identifies **Data Version 3.7.12**, but is a mutable upstream source, not an immutable pinned original client-data snapshot. Static Minor Fortes remain separately source-`VERIFIED` in the existing `src/data/characterIntrinsicStats.ts` catalog and were not duplicated into raw data.

## Nine raw fields, identity and inherent permanent stat evidence

| Character / release identity | Lv90 HP / ATK / DEF / Max Energy | Base CRIT Rate / CRIT DMG / Energy Regen | Reviewed Minor Forte | Decision |
| --- | --- | --- | --- | --- |
| Cartethyia: RELEASED 5★ Aero Sword | **14800 / 313 / 611 / 125** | **5% / 150% / 100%** | CRIT Rate **+8%**, HP% **+12%** | **VERIFIED raw / DATA_ONLY**. Prydwen roster and profile fully agree. |
| Chisa: RELEASED 5★ Havoc Broadblade | **10775 / 438 / 1136 / 125** | **5% / 150% / 100%** | CRIT Rate **+8%**, ATK% **+12%** | **VERIFIED raw / DATA_ONLY**. Roster first: profile and Wuwa Wiki show adjacent **DEF 1137**, versus common-roster integer **1136**. This is a documented presentation discrepancy, not an inferred decimal rounding algorithm or a silent stat rewrite. |
| Ciaccona: RELEASED 5★ Aero Pistols | **12238 / 375 / 1198 / 125** | **5% / 150% / 100%** | CRIT DMG **+16%**, ATK% **+12%** | **VERIFIED raw / DATA_ONLY**. Same source-backed integer values in roster and individual profile. |
| Iuno: RELEASED 5★ Aero Gauntlets | **10525 / 450 / 1124 / 125** | **5% / 150% / 100%** | CRIT Rate **+8%**, ATK% **+12%** | **VERIFIED raw / DATA_ONLY**. Same source-backed integer values in roster and individual profile. |

**Review status:** all nine `characterRawAudit.ts` required raw fields checked with dated primary/secondary link provenance; identity, release and permanent intrinsic facts reviewed separately. The signed-off status is a **raw-source validity** assessment, not gameplay implementation, full Character Mechanics verification, a tested role or a new DPS-ready character. Existing exported `CharacterDatabase` reads these records from the existing owning catalogs.

**Intentionally still PENDING:** **Denia** retains the disputed **100 vs 125 Max Energy** labels from source review in Draft #264, so no status/value promotion is permitted. Hsin/Jingran still lack full level-90 values; Qingxiao/Rover Electro/Suisui retain explicit semantic `maxEnergy:null` audit exceptions. The Mornye data correction in separate Draft [#268](https://github.com/bellebing/Bellibing-simulator/pull/268) is independent and not included.

## Backward impact and integration boundary

**Reviewed — no numeric, combat, team or gear change**: the current HP/ATK/DEF/Max Energy, element, rarity, weapon, base CRIT/ER, and intrinsic data are unchanged. Updating the **owning raw record's explicit verification status and provenance only** does not add buffs, triggers, damage classes, stack rules, new weapon/echo compatibility, recommendations, rotations, team modifiers or a new DPS engine. Existing `CharacterDatabase`, Character preview and Build Stats continue to consume the same numeric values. Tests protect the precise values and ensure that raw verification **does not** become a DPS-ready disposition. No additional Character is implicitly source-approved.

The final PR must pass focused Character raw, source/intrinsic and database tests, source-data audits, generated parity/strict build and exact-head GitHub CI. Final merge readiness additionally requires the current FULL Verify + relevant browser checks and **separate user merge approval**. No merge in this batch.
