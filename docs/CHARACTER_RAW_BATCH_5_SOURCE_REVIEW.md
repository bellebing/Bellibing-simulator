# Character raw verification — Batch 5

> Historical batch snapshot retained for provenance. The combined [release 3.7 review](CHARACTER_RELEASE_3_7_FACTS_REVIEW.md) supersedes its pending roster scope and any Max Energy decisions that conflict with the original dedicated capacity field.

Reviewed **2026-10-11** against canonical main `a299e3878fb6ef2835f3ab966426ecdef15bded6`. Exactly three existing RELEASED raw records are individually signed off. The numeric values and existing independently VERIFIED permanent Minor Fortes do not change.

## Source basis

- [Prydwen comparable Lv90 Stats roster](https://www.prydwen.gg/wuthering-waves/stats): separately named HP, ATK, DEF and Max Energy at Level 90. This project uses its published game-facing **integer convention** rather than automatic database-decimal rounding; source observed October 11.
- Prydwen [Calcharo](https://www.prydwen.gg/wuthering-waves/characters/calcharo), [Cantarella](https://www.prydwen.gg/wuthering-waves/characters/cantarella), [Carlotta](https://www.prydwen.gg/wuthering-waves/characters/carlotta): identity/release, weapon, element, Minor Forte totals, base CRIT rate and CRIT DMG, and explicitly labeled Max Energy.
- Wuwa Wiki current character codex: [Calcharo 1301](https://wuwa.wiki/en/codex/resonators/1301), [Cantarella 1607](https://wuwa.wiki/en/codex/resonators/1607), [Carlotta 1107](https://wuwa.wiki/en/codex/resonators/1107). Independent corroboration of HP/ATK/DEF, element/weapon and **Energy Regen 100%**. Wiki publishes mutable game-data versions, not an immutable original-source pin.
- `src/data/characterIntrinsicStats.ts`: already VERIFIED raw permanent stat-node totals, unchanged and reused. Neither Prydwen build recommendations nor skill-level priority are used as raw source facts.

## Character-by-character raw sign-off

| Character | RELEASED rarity/type | HP | ATK | DEF | **Max Energy cap** | Base CRIT Rate / CRIT DMG / ER | Permanent Minor Forte |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| Calcharo | 5★ Electro / Broadblade | 10,500 | 438 | **1,185** | 125 | 5% / 150% / 100% | CRIT DMG +16%, ATK% +12% |
| Cantarella | 5★ Havoc / Rectifier | 11,600 | 400 | 1,100 | 125 | 5% / 150% / 100% | CRIT Rate +8%, ATK% +12% |
| Carlotta | 5★ Glacio / Pistols | 12,450 | 463 | 1,198 | 125 | 5% / 150% / 100% | CRIT Rate +8%, ATK% +12% |

### Presentation discrepancy

For Calcharo the Prydwen comparable Lv90 roster displays DEF **1185**; both the Prydwen individual Character profile and Wuwa Wiki codex show **1186**. This is an explicit adjacent-integer presentation difference under existing Bellibing policy, not a mechanism to silently overwrite the project’s agreed roster integer. We retain the catalog 1185 and document the competing display. No universal floor/round conversion is inferred.

## Scope and impact

All underlying Character identity, numerical Lv90/baseCombat values and intrinsic entries remain **identical** to main. Only these three raw `verificationStatus` fields change from `PARTIALLY_VERIFIED` to `VERIFIED`, with independently dated field-level provenance. Status remains `DATA_ONLY`. No action or skill curves, effects, UI, recommendations, teams, equipment compatibility, combat execution, DPS or readiness are promoted. Existing Character export consumes the same numeric data. Tests explicitly assert values and stable owner boundary.

Main status: 13/59 full raw-VERIFIED. This independently reviewed batch would bring an integrated roster to 16/59 **if merged in isolation**. PR #277 is another independently pending three-character batch; if both merge without overlapping records, total would become **19/59**, not 59/59. Canonical skill coefficients for most older Character source kits already use exact Lv1–Lv10 representations; Hsin/Jingran Lv2–9 remain pending independently from raw source status.
