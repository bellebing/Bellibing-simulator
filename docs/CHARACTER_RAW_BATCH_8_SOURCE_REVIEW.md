# Character raw source review — Batch 8

> Historical batch snapshot retained for provenance. The combined [release 3.7 review](CHARACTER_RELEASE_3_7_FACTS_REVIEW.md) supersedes its pending roster scope and any Max Energy decisions that conflict with the original dedicated capacity field.

**Reviewed 2026-10-11.** Source base: main `a299e3878fb6ef2835f3ab966426ecdef15bded6`. Scope: Phoebe, Roccia, Phrolova only. Their original numeric values, canonical static Minor Fortes and gameplay/skill effects remain unchanged; this is a data-only individual source signoff.

**Authority:** [Prydwen Level90 comparison table](https://www.prydwen.gg/wuthering-waves/characters-stats/) is Bellibing's chosen game-facing integer convention and explicitly separates Max Energy from Liberation Cost. Independent [Phoebe](https://www.prydwen.gg/wuthering-waves/characters/phoebe), [Roccia](https://www.prydwen.gg/wuthering-waves/characters/roccia), [Phrolova](https://www.prydwen.gg/wuthering-waves/characters/phrolova) kit profiles confirm identity and the already canonically verified static Minor Forte totals. Wuwa Wiki codex [Phoebe 1506](https://wuwa.wiki/en/codex/resonators/1506), [Roccia 1606](https://wuwa.wiki/en/codex/resonators/1606), [Phrolova 1608](https://wuwa.wiki/en/codex/resonators/1608) independently shows the Lv90 stat family and baseline **Energy Regen 100%, CRIT Rate 5%, CRIT DMG 150%** (observed data version 3.7.12). Providers are mutable secondary sources, not original immutable game-data dumps.

| Character | RELEASED identity | HP | ATK | DEF | Max Energy cap | Base CRIT Rate/DMG/ER | Permanent Minor Forte |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| Phoebe | 5★ Spectro / Rectifier | 10825 | 413 | 1259 | 125 | 5% / 150% / 100% | CRIT DMG +16%, ATK% +12% |
| Roccia | 5★ Havoc / Gauntlets | 12250 | 375 | 1198 | 125 | 5% / 150% / 100% | CRIT DMG +16%, ATK% +12% |
| Phrolova | 5★ Havoc / Rectifier | 10775 | 438 | **1136** | 125 | 5% / 150% / 100% | CRIT Rate +8%, ATK% +12% |

**Phrolova DEF discrepancy:** Prydwen's comparator table publishes **1136**, while the individual Prydwen profile and Wuwa Wiki display **1137**. This is a published integer-presentation difference. Preserve the already reviewed canonical comparator convention, do not invent an app-side floor/round rule or conflate a real semantic conflict.

**Backward impact:** No HP/ATK/DEF/Max Energy value, Combat base stat, intrinsic stat, Skills level 1–10, Sequence, Character Mechanics, UI, recommendation, team, combat/DPS or equipment association changes. Only the three existing catalog raw records' `verificationStatus` change `PARTIALLY_VERIFIED` → `VERIFIED`, plus dated provenance. `integrationStatus=DATA_ONLY` and existing readiness gates remain. Missing Hsin/Jingran data, Max Energy disputes and other partial Character rows stay pending. Main is 13/59 raw verified; this batch is +3 only after explicitly approved merge and exact-head CI. Other batch PRs are separate open candidates and **not** merged main.
