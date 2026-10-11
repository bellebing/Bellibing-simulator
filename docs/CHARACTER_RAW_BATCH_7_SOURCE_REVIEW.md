# Character Raw Facts — Batch 7 source review

Reviewed **2026-10-11** on main `a299e3878fb6ef2835f3ab966426ecdef15bded6`. Only Lingyang, Lumi and Lupa, all already released and populated. No numerical changes; promotion concerns source verification only.

**Sources and roles:** [Prydwen comparable Lv90 Stats roster](https://www.prydwen.gg/wuthering-waves/characters-stats/) publishes the **Level90 game-facing integer convention** and a separately named **Max Energy** column. Individual profiles [Lingyang](https://www.prydwen.gg/wuthering-waves/characters/lingyang), [Lumi](https://www.prydwen.gg/wuthering-waves/characters/lumi), [Lupa](https://www.prydwen.gg/wuthering-waves/characters/lupa) cross-check rarity/element/weapon and permanent Minor Fortes. Version 3.7.12 current [Wuwa Wiki Lingyang](https://wuwa.wiki/en/codex/resonators/1104), [Lumi](https://wuwa.wiki/en/codex/resonators/1504), [Lupa](https://wuwa.wiki/en/codex/resonators/1207) independently gives Lv90 family and separately published **100% base Energy Regen, 5% CRIT Rate, 150% CRIT DMG**. Permanent stat-node totals are owned by the already independently VERIFIED `src/data/characterIntrinsicStats.ts` profiles, not copied as new raw node implementations.

| Character | Released identity | Lv90 HP | ATK | DEF | **Max Energy cap** | Base CRIT / CDMG / ER | Static Minor Forte |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| Lingyang | 5★ Glacio / Gauntlets | 10388 | 438 | 1210 | 125 | 5% / 150% / 100% | Glacio DMG +12%; ATK% +12% |
| Lumi | 4★ Electro / Broadblade | 8500 | 338 | 880 | 125 | 5% / 150% / 100% | CRIT Rate +8%; ATK% +12% |
| Lupa | 5★ Fusion / Broadblade | 11913 | 388 | **1185** | 125 | 5% / 150% / 100% | CRIT Rate +8%; ATK% +12% |

**Discrepancy:** Wuwa Wiki lists Lupa DEF **1186**, whereas the Prydwen comparable Lv90 roster lists **1185**. Canonical existing 1185 stays unchanged. The project's previous notes identify underlying decimal 1185.55; this is a **display-convention discrepancy**, not evidence to invent universal rounding.

**Boundary / impact:** Only three raw rows change `PARTIALLY_VERIFIED → VERIFIED / DATA_ONLY` and gain dated source provenance. Existing numeric raw catalog values, intrinsic source data, all effects/skills (including Lv1–Lv10), Character Mechanics, build/recommendation/team/equipment consumers, DPS, UI and persistence are unchanged. Exported raw status changes by design, not executable-readiness. Hsin/Jingran still lack full skill Lv2–Lv9 and remain explicitly pending. Main is **13/59**; this batch adds **+3 only if independently merged**. Batches #277–#279 are separate ready/pending candidates and must not be counted as main, nor are merges pre-authorized.

**Gate:** source check, deterministic Character raw/test/export audits, exact-head FAST and FULL CI, strict build, browser and merge approval.
