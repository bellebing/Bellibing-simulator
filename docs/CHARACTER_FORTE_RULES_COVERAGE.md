# Character Mechanics FORTE_RULES Coverage

This report is deterministic output from the canonical Character Mechanics registry. It reports **FORTE_RULES only**. Source verification is separate from runtime modeling: a source-verified Forte relationship may remain `PENDING_INTERPRETATION` for timing/resource execution without inventing semantics.

## Roster-wide status

- **RELEASED Characters:** 57
- **FORTE_RULES VERIFIED Characters:** 55
- **FORTE_RULES PARTIAL Characters:** 0
- **FORTE_RULES BLOCKED Characters:** 2

### VERIFIED

aalto, aemeath, augusta, baizhi, brant, calcharo, camellya, cantarella, carlotta, cartethyia, changli, chisa, chixia, ciaccona, denia, encore, galbrena, hiyuki, iuno, jianxin, jinhsi, jiyan, lingyang, lucilla, lucy, lumi, lupa, luuk-herssen, lynae, mornye, mortefi, phoebe, phrolova, qingxiao, qiuyuan, rebecca, roccia, rover-aero, rover-electro, rover-havoc, rover-spectro, sanhua, sigrika, suisui, taoqi, the-shorekeeper, verina, xiangli-yao, yangyang, yangyang-xuanling, yinlin, youhu, yuanwu, zani, zhezhi

### PARTIAL

none

### BLOCKED

- `FORTE-BULING-1307031-DAMAGE-CLASS` — `buling`: Five Thunders Spell Array is an explicit Forte result with source-fixed cadence/state semantics and an exact ATK-scaling Lv1-Lv10 damage curve, but current source does not state the Character damage-bonus classification of its continuous damage. The separate 10%/25% team Resonance Skill DMG Bonus states are not evidence for the array damage class. Source moves 1004307; canonical facts buling-forte-five-thunders-spell-array.
- `FORTE-DANJIN-1000807-FULL-POWER-THRESHOLD` — `danjin`: Serene Vigil says the full-power branch requires Ruby Blossom to reach over 120 while the same source says Ruby Blossom can hold at most 120. The activation threshold cannot be normalized to >=120 or =120 without inference. Source moves 1000807; canonical facts danjin-forte-full-power-threshold-conflict.

## Audit issues

- none

## Scope boundary

This report does not change ACTIONS coverage from PR #221 and does not promote full Character Mechanics profiles. Inherent passives, Outro effects, generic resource rules, Sequence mechanics, profiles/recommendations, Team, DPS rotations and UI remain outside this slice. Buling and Danjin stay fail-closed on the exact Forte blockers above; Xiangli Yao's FORTE_RULES can be source-VERIFIED while Pivot — Impale remains an independent ACTIONS damage-class blocker.
