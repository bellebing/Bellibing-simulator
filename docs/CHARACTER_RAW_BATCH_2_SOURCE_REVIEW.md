# Character Raw Data — verification Batch 2

**2026-10-11.** Review base: current `main@102b66edec165f3d2a313a562de4049a26424924`. **Decision:** complete the nine-field raw source review for **Baizhi, Sanhua, Verina, Yangyang** only. Source-VERIFIED **raw records** remain **`DATA_ONLY`**, not executable Character rotations or DPS. No numeric raw value, Minor Forte, effect, profile, recommendation, UI layout or combat calculation is changed.

## Source-review authority

Per [DATA_VERIFICATION_POLICY.md](DATA_VERIFICATION_POLICY.md), the [Prydwen Wuthering Waves Lv90 Stats roster](https://www.prydwen.gg/wuthering-waves/stats) (published **08 October 2026**) owns the consistent **game-facing integer HP / ATK / DEF** convention and provides a separately named **Max Energy** column. Each individual Prydwen profile is a cross-check for the **same named Max Energy cap**, 5% starting CRIT Rate, 150% starting CRIT DMG, rarity, element, weapon and published Minor Forte summaries. **Max Energy is never inferred from the Resonance Liberation cost or a guide's Energy Regen recommendation.**

- [Baizhi profile](https://www.prydwen.gg/wuthering-waves/characters/baizhi) and [Wuwa Wiki Baizhi](https://wuwa.wiki/en/codex/resonators/1103).
- [Sanhua profile](https://www.prydwen.gg/wuthering-waves/characters/sanhua) and [Wuwa Wiki Sanhua](https://wuwa.wiki/en/codex/resonators/1102).
- [Verina profile](https://www.prydwen.gg/wuthering-waves/characters/verina) and [Wuwa Wiki Verina](https://wuwa.wiki/en/codex/resonators/1503).
- [Yangyang profile](https://www.prydwen.gg/wuthering-waves/characters/yangyang) and [Wuwa Wiki Yangyang](https://wuwa.wiki/en/codex/resonators/1402).

Each Wuwa Wiki Resonator's **Base Stats** independently labels starting **Energy Regen 100.0%**, **Crit. Rate 5.0%** and **Crit. DMG 150.0%**, plus the displayed Level-90 HP/ATK/DEF. The observed codex pages are **mutable** and may report different game-data versions; they are not immutable original game-data snapshots. Prydwen character pages include build recommendations, but **none of those recommendations or combat effects are used in this raw review**. Permanent Minor Forte values are owned by the existing **`src/data/characterIntrinsicStats.ts` VERIFIED profiles**; they were cross-checked but not copied into `src/data/characters.ts`.

## Individual decisions: all nine raw fields plus independent Minor Forte check

| Character and released identity | Lv90 HP / ATK / DEF / **Max Energy** | Base CRIT Rate / CRIT DMG / Energy Regen | Permanent Minor Fortes (existing owner) | Raw decision |
| --- | --- | --- | --- | --- |
| Baizhi (`baizhi`), RELEASED 4★ Glacio / Rectifier | **12813 / 213 / 1002 / 175** | 5% / 150% / 100% | HP% +12%; Healing Bonus +12% | `VERIFIED` raw / `DATA_ONLY` |
| Sanhua (`sanhua`), RELEASED 4★ Glacio / Sword | **10063 / 275 / 941 / 100** | 5% / 150% / 100% | Glacio DMG +12%; ATK% +12% | `VERIFIED` raw / `DATA_ONLY` |
| Verina (`verina`), RELEASED 5★ Spectro / Rectifier | **14238 / 338 / 1100 / 175** | 5% / 150% / 100% | ATK% +12%; Healing Bonus +12% | `VERIFIED` raw / `DATA_ONLY` |
| Yangyang (`yangyang`), RELEASED 4★ Aero / Sword | **10200 / 250 / 1100 / 100** | 5% / 150% / 100% | Aero DMG +12%; ATK% +12% | `VERIFIED` raw / `DATA_ONLY` |

All four Level-90 integer rows **exactly match** Prydwen's current Stats roster and corresponding individual profile; Wuwa Wiki independently matches the HP/ATK/DEF families, and the base CRIT/ER values. No ambiguous energy-field substitution, incompatible raw semantic claim or game-facing integer disagreement was found for these four in the reviewed surfaces. The source review date is explicit on each canonical record. The prior imported `V9.15` provenance alone did not earn VERIFIED status; each record is now independently signed off.

## Scope boundaries and backward impact

`src/data/characters.ts` is the only **raw owner**, and all four records retain their existing `DATA_ONLY` status. The generated `CharacterDatabase` continues to read them from the same canonical source; **no parallel database or static equipment recommendation relationship** is introduced. Expected consumer changes: *verification status and provenance only*. The raw HP/ATK/DEF, Max Energy, base CRIT/ER, element/rarity/weapon/release and previously verified Minor Fortes are unchanged; therefore the existing Build Stats numerical projection is unchanged, as are Weapon/Echo/Sonata relations, Character Mechanics fact IDs, buffs, rotations, and DPS readiness.

**Backward-impact review: reviewed — no numeric/gameplay/profile impact.** New tests preserve complete nine-field values, per-Character review metadata, raw source/provenance export parity and absence of new `DPS_READY` approval. `RELEASED_CHARACTER_RAW_PENDING` remains unchanged because these four had no missing fields. Source validity of these four does **not** establish whole-roster completeness.

**Excluded blockers remain explicit:** Denia has a conflicting same-named Max Energy claim (**100 vs 125**); Hsin and Jingran lack full Level-90 raw source approval; Qingxiao, Rover Electro and Suisui retain pending Max Energy semantic exceptions. The proposed [Raw Batch 1 Draft #269](https://github.com/bellebing/Bellibing-simulator/pull/269) is **not merged** and touches separate Character entries. Its hardcoded candidate-local count of `VERIFIED` rows will require rebaselining when both batches integrate; Batch 2 deliberately does **not** assert a global number of VERIFIED Characters in its tests. [Mornye Draft #268](https://github.com/bellebing/Bellibing-simulator/pull/268) and [Research PR #266](https://github.com/bellebing/Bellibing-simulator/pull/266) remain separate review candidates.

Source/data acceptance: focused raw-catalog and database tests, source/audit gates, build/generated parity and exact-head FAST. Later MERGE needs exact-head FULL Verify and existing real-browser/build gates, followed by **separate user merge authorization**. No merge in this change.
