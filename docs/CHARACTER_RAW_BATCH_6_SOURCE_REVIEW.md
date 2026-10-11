# Character Raw Facts — Batch 6 source sign-off

> Historical batch snapshot retained for provenance. The combined [release 3.7 review](CHARACTER_RELEASE_3_7_FACTS_REVIEW.md) supersedes its pending roster scope and any Max Energy decisions that conflict with the original dedicated capacity field.

**Reviewed:** 2026-10-11 · starting main `a299e3878fb6ef2835f3ab966426ecdef15bded6`. Three existing RELEASED identities only: Changli, Jinhsi, Jiyan. Numerical values and separately owned static Minor Forte data stay unchanged.

**Authority and independent cross-check:** [Prydwen Level90 roster](https://www.prydwen.gg/wuthering-waves/stats), updated 2026-10-08, publishes game-facing HP/ATK/DEF and a **separately labelled Max Energy**. Each [Changli](https://www.prydwen.gg/wuthering-waves/characters/changli), [Jinhsi](https://www.prydwen.gg/wuthering-waves/characters/jinhsi), [Jiyan](https://www.prydwen.gg/wuthering-waves/characters/jiyan) profile confirms identity, rarity, weapon, element, base CRIT and permanent Minor Forte totals (+8% CRIT Rate and +12% ATK). Independent current [Wuwa Wiki Changli](https://wuwa.wiki/en/codex/resonators/1205), [Jinhsi](https://wuwa.wiki/en/codex/resonators/1304), [Jiyan](https://wuwa.wiki/en/codex/resonators/1404) game-data 3.7.12 character codex verifies 100% base Energy Regen, CRIT 5% / CRIT DMG 150%, HP/ATK/DEF where identical. These mutable providers are reviewed snapshots, not immutable original code pins.

| Character | Released | HP | ATK | DEF (canonical Prydwen roster integer) | Max Energy cap | Base CRIT/CRIT DMG/ER | Permanent Minor Forte |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| Changli | 5★ Fusion / Sword | 10388 | 463 | 1100 | 125 | 5% / 150% / 100% | CRIT Rate +8%, ATK% +12% |
| Jinhsi | 5★ Spectro / Broadblade | 10825 | 413 | 1259 | 125 | 5% / 150% / 100% | CRIT Rate +8%, ATK% +12% |
| Jiyan | 5★ Aero / Broadblade | 10488 | 438 | **1185** | 125 | 5% / 150% / 100% | CRIT Rate +8%, ATK% +12% |

**Known Jiyan display:** The Prydwen roster table has Level90 DEF 1185, while the individual Prydwen page and Wuwa Wiki print 1186. This is an adjacent-integer *presentation* discrepancy already disclosed in the catalog; preserve existing chosen roster convention, no synthesized rounding rule. Max Energy refers to the explicit cap column, not a Liberation Cost.

**Backward impact:** All numerical fields and existing independently VERIFIED canonical intrinsic profiles remain unchanged. Exactly three catalog `verificationStatus` entries are promoted to `VERIFIED / DATA_ONLY` with dated source provenance. No action/skill coefficient, level progression, gameplay effect, team/support, recommendation, UI, weapon ownership, combat/DPS execution or readiness is modified. The Character DB/export projects identical numeric values and now only shows raw sign-off. Existing raw/null audit continues to protect missing fields. 13/59 on main; +3 if this PR alone merges, and +9 total from independent batches #277/#278/this PR if all are separately authorized, verified and integrated. Hsin/Jingran Skill levels 2–9 remain explicitly unverified.

**Gate:** focused catalog/export invariants, strict build, exact-head FAST/FULL Verify including browser and post-merge if authorized. Never claim kit or simulation readiness from raw sign-off.
