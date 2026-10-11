# Character Raw Source Review — Batch 4 (Aalto / Chixia / Jianxin)

**Reviewed:** 2026-10-11. **Baseline:** main `a299e3878fb6ef2835f3ab966426ecdef15bded6`. **Scope:** three existing RELEASED characters only; preserve all numeric catalog values, intrinsic owner, skill curves and combat semantics. Decision: independently source-reviewed `VERIFIED / DATA_ONLY` raw records.

## Source semantics

- [Prydwen current Lv90 Stats roster](https://www.prydwen.gg/wuthering-waves/stats) is Bellibing's existing published **game-facing integer** convention for comparable Lv90 HP/ATK/DEF/Max Energy; inspected 2026-10-11. It is a separate raw-attributes table, *not* a post-equipment Build recommendation. The older duplicate `/characters-stats/` results are not treated as a newer source.
- Individual released [Aalto](https://www.prydwen.gg/wuthering-waves/characters/aalto), [Chixia](https://www.prydwen.gg/wuthering-waves/characters/chixia), [Jianxin](https://www.prydwen.gg/wuthering-waves/characters/jianxin) profile cards explicitly identify rarity, element, weapon, Max Energy, CRIT 5% / CRIT DMG 150%, and each permanent Minor Forte pair; profiles are corroborating cards, not the winning source for conflicting Lv90 integers.
- [Wuwa Wiki data-version 3.7](https://wuwa.wiki/en/codex/resonators) codex IDs [1403 (Aalto)](https://wuwa.wiki/en/codex/resonators/1403), [1202 (Chixia)](https://wuwa.wiki/en/codex/resonators/1202), [1405 (Jianxin)](https://wuwa.wiki/en/codex/resonators/1405) independently corroborate released identities, Lv90 family and baseline **100% Energy Regen**, not Max Energy. This is a *mutable* source, not an immutable original game pin.
- [Wuthering Waves Wiki — Max Resonance Energy](https://wutheringwaves.fandom.com/wiki/Resonance_Energy) explicitly separates the named **Max Energy** table from Liberation cost and lists **150** for all three.
- Permanent node totals are already independently `VERIFIED` in `src/data/characterIntrinsicStats.ts`, reused by catalog reference. No new bonuses or derived kit mechanics.

## Exact source-backed record sign-off

| Identity / weapon | Lv90 HP | ATK | DEF | **Max Energy cap** | Base CRIT Rate / CRIT DMG / ER | Permanent Minor Forte | Decision |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| **Aalto**, 4★ Aero / Pistols | 9,850 | 263 | **1,075** | 150 | 5% / 150% / 100% | Aero DMG +12%; ATK% +12% | VERIFIED / DATA_ONLY |
| **Chixia**, 4★ Fusion / Pistols | 9,088 | 300 | 953 | 150 | 5% / 150% / 100% | Fusion DMG +12%; ATK% +12% | VERIFIED / DATA_ONLY |
| **Jianxin**, 5★ Aero / Gauntlets | 14,113 | 338 | 1,124 | 150 | 5% / 150% / 100% | CRIT Rate +8%; ATK% +12% | VERIFIED / DATA_ONLY |

**Aalto DEF precision/presentation:** Prydwen Lv90 roster publishes **1075**, whereas individual Prydwen and Wuwa Wiki character cards show **1076**. This is an adjacent integer display difference, **not** license to recalculate or silently oscillate Bellibing's accepted canonical integer convention. The existing catalog 1075 is retained, not changed, with both presentations explicitly logged. Game facing numeric semantics remain scoped to the designated roster convention. No interpolation or conversion formula.

## Backward impact / non-effects

The three identity/stat rows and their permanent Minor Fortes already existed with exactly the same numeric values. Only the raw record verification status, dated source labels/URLs and source-review assertions change; `CharacterGameData.integrationStatus` stays `DATA_ONLY`. The Character database/export consumes the existing raw record and thus propagates only the source-reviewed verification bit. No weapon/Echo compatibility, Build recommendation, Character Mechanics facts, skills, action motion curves, preflight execution, team/rotation/evaluator/DPS, UI or persistence behavior was changed. No new source fact invalidates an older weapon, team or benchmark; a full backward-impact review remains a separate gate for modeled content.

Status baseline before this PR: **13/59** fully raw-`VERIFIED`. After review of these three and **only if merged**, target **16/59**. Hsin/Jingran, 41 currently partial records and known Max Energy source-semantic blockers do not inherit verified status. One verified stat layer never establishes executed kit/DPS readiness.

## Skill-level boundary

This raw promotion does not touch Skills. Bellibing's older 57-Character source/mechanics pipeline already tracks exact source-backed **Lv1–Lv10** action arrays where provided, but a Character with skill text or an incomplete Lv1/Lv10 pair must not be called complete. Hsin/Jingran **Lv2–Lv9** remain explicit pending in their own evidence reviews; Character skills and raw Lv90 status are independently audited.
