# Character Mechanics FORTE_RULES Coverage

This report is deterministic output from the canonical Character Mechanics registry. It reports **FORTE_RULES only**. Source verification is separate from runtime modeling: a source-verified Forte relationship may remain `PENDING_INTERPRETATION` for timing/resource execution without inventing semantics.

## Roster-wide status

- **RELEASED Characters:** 59
- **FORTE_RULES VERIFIED Characters:** 58
- **FORTE_RULES PARTIAL Characters:** 0
- **FORTE_RULES BLOCKED Characters:** 1

### VERIFIED

aalto, aemeath, augusta, baizhi, brant, buling, calcharo, camellya, cantarella, carlotta, cartethyia, changli, chisa, chixia, ciaccona, denia, encore, galbrena, hiyuki, hsin, iuno, jianxin, jingran, jinhsi, jiyan, lingyang, lucilla, lucy, lumi, lupa, luuk-herssen, lynae, mornye, mortefi, phoebe, phrolova, qingxiao, qiuyuan, rebecca, roccia, rover-aero, rover-electro, rover-havoc, rover-spectro, sanhua, sigrika, suisui, taoqi, the-shorekeeper, verina, xiangli-yao, yangyang, yangyang-xuanling, yinlin, youhu, yuanwu, zani, zhezhi

### PARTIAL

none

### BLOCKED

- `FORTE-DANJIN-1000807-FULL-POWER-THRESHOLD` — `danjin`: Serene Vigil says the full-power branch requires Ruby Blossom to reach over 120 while the same source says Ruby Blossom can hold at most 120. The activation threshold cannot be normalized to >=120 or =120 without inference. Source moves 1000807; canonical facts danjin-forte-full-power-threshold-conflict.

## Audit issues

- none

## Scope boundary

This report audits Forte source facts independently from runtime execution, recommendations, Team and DPS readiness. Original released damage rows resolve Buling's array and Xiangli Yao's Pivot classifications. Danjin remains fail-closed because the source's over-120 full-power clause contradicts its maximum of 120 Ruby Blossom.
