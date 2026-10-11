# Hsin / Jingran — partial Lv90 game-facing raw-stat reconciliation

**Review:** 2026-10-11 · **Bellibing base:** `a299e3878fb6ef2835f3ab966426ecdef15bded6` · **Scope:** 5 individually reviewed Lv90 numeric values, not complete Character raw/facts signoff.

## Source authority

- [Wuwa Wiki / Hsin 1311](https://wuwa.wiki/en/codex/resonators/1311), game data label **3.7.12**, explicit *Base Stats*: HP **10300**, ATK **463**, DEF **1112**.
- [wuther.in / Hsin 1311](https://wuther.in/en/character/1311/), displayed **Lv90 Base HP 10300 / ATK 463 / DEF 1112**. This independently corroborates the game-facing integer convention; Wuthering.gg's 462 ATK is a neighboring display/precision convention.
- [Wuwa Wiki / Jingran 1212](https://wuwa.wiki/en/codex/resonators/1212), game data label **3.7.12**, *Base Stats* HP **15375**, ATK **313**, displayed DEF **0**.
- [Gacha.gg / Jingran](https://www.gacha.gg/wuthering-waves/characters/jingran) reports Lv90 HP **15375** and **312.5** ATK decimal. Other independent published game-facing sources report integer ATK **313**; Wuthering.gg displays neighboring **312**. We adopt corroborated integer convention **313**, not a fabricated global rounding rule.
- Independent original game dump [Arikatsu/WutheringWaves_Data at `9218d612ad815e398e064e577e42aaf878899968` (3.7)](https://github.com/Arikatsu/WutheringWaves_Data/tree/9218d612ad815e398e064e577e42aaf878899968) includes both original RoleInfo IDs **1311** (Hsin) and **1212** (Jingran), verifying current character source identity joins; no assertion is made that those RoleInfo identity rows by themselves supply Lv90 stats.
- [Prydwen Hsin](https://www.prydwen.gg/wuthering-waves/characters/hsin) still displays “Stats aren't available yet”, and the [dedicated Prydwen Stats table](https://www.prydwen.gg/wuthering-waves/characters-stats/) is from June 2026; **neither** currently covers these two characters' October Lv90 values. Do not cite Prydwen as numeric authority here.

### Exact source-to-canonical review

| Character | Field | Before | Reviewed source-supported value | After |
| --- | --- | --- | --- | --- |
| Hsin | Lv90 HP | null | 10300 (Wuwa Wiki 3.7.12 + wuther.in Lv90) | **10300** |
| Hsin | Lv90 ATK | null | 463 game-facing (Wuwa Wiki + wuther.in), adjacent Wuthering.gg 462 | **463** |
| Hsin | Lv90 DEF | null | 1112 (Wuwa Wiki + wuther.in) | **1112** |
| Jingran | Lv90 HP | null | 15375 (Wuwa Wiki + Gacha.gg) | **15375** |
| Jingran | Lv90 ATK | null | 313 game-facing (Wuwa Wiki, other integer displays; Gacha.gg raw 312.5) | **313** |
| Jingran | Lv90 DEF | null | published 0 **but could be kit-fixed effective DEF** | **null — pending** |
| Both | Max Energy | null | disputed 125 vs 140 energy labels; Liberation/Resonance Cost 125 **is not Max Energy** | **null — pending** |

The published Jingran **DEF 0** is not silently promoted because his **Nether to Light** kit explicitly fixes effective DEF at zero; mapping an effective kit rule to unmodified `CharacterGameData.level90.def` needs independent source-semantic confirmation.

## Owning changes, tests and boundaries

Only `src/data/characters.ts` (partial numeric + record provenance), `src/data/characterRawAudit.ts` (remove exactly resolved exceptions) and the two focused catalog/export tests change. Hsin/Jingran continue `PARTIALLY_VERIFIED`, `DATA_ONLY` and RELEASED. The exact released-raw audit must report zero unexpected or stale pending entries; partial values round-trip the detached Character Database without granting Mechanics, DPS readiness, UI Skill/Sequence or recommendations.

**Still pending:** complete source-pinned Lv1–Lv10 skill curves (not just Lv1/Lv10), original source-tree permanent Minor Forte, full Forte/Passive/Outro/Sequence source review, Jingran DEF semantic identity and independently labeled Max Energy caps. The research PR #275 owns the full source-candidate registers and explicit promotion gate. Do not mark either character raw-record verified until all required fields and permanent intrinsics are reviewed.
