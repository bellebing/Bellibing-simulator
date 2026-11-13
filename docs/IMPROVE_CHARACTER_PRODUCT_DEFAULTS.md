# Improve Character Hard/Flex product defaults and Expected Tuners (Draft #365)

## Scope and source boundary

This is **presentation/account Improve only**, not a gameplay claim or a rewrite of the
canonical Improve policy, Echo RNG, private gross-Tuner Bellman mathematics,
AccountStore, Build, Inventory or DPS Lab. The source of relative substat relevance is
`src/data/characterEquipmentAssociations.ts` projected via
`src/characterRecommendations.mjs` and `src/characterPriorityGuidance.mjs`.
Those guide records provide rankings and conditions; **none supplies a universal
per-Echo minimum, required Hard pair, or required Flex count**.

Bellibing explicitly chooses product standards for **all 59 Characters**:
the existing 26 ordinary CRIT DPS rules are unchanged; the 32 newly covered
Characters use actual DPR `Substat / Substat Value` marginal percentages
(13) where available, otherwise the existing reviewed Prydwen relative
substat priorities (19). Hard may be zero, one or two for support/special
mechanics; Flex defaults to **at least 1 selected stat**, with all Hard
Requirements AND at least N Flex retained. No gameplay or per-Echo source
requirement is inferred.
All minima are the **lowest existing canonical Rank-5 substat roll tier**,
not source-verbatim target thresholds or estimated optimum values.
Conditional whole-build Energy Regen is excluded: its target depends on actual
build/rotation and cannot be forced on every Echo. Compound tied aliases are
not arbitrarily promoted as individual priorities. ER Target remains separate.
Manual / Customize preferences are account-owned and take precedence.
A visible **Restore Hard/Flex Recommended** control explicitly restores the
Character's product default and clears only that Character's saved V3 override
through AccountStore. Other Characters, resource budgets and pending legacy
settings are preserved. Settings display their source family and link:
**DPR Substat Value** (scenario-specific) or **Prydwen guide** (relative order).
DPR numbers are the percentage *sensitivity*, never the much larger
`General Stat Recommendation` or `Stats used for Calcs` total stat values.

## Finished product coverage — 59/59

All 59 released Characters have a usable default **in the ordinary Improve
account UI**. Count by exclusive source family: **13 DPR**, **45 Prydwen**
(26 existing unchanged + 19 added), and **1 Augusta owner-approved canonical**
default. This is 59 **product** policies, **not** 59 source-certified
per-Echo rules, native team-DPS profiles or verified private Expected results.

### 27 unchanged defaults

The original **26 Prydwen-backed ordinary CRIT DPS** retain their previous
Hard CRIT Rate / CRIT DMG and guide-ordered Flex selection:
Aemeath, Calcharo, Camellya, Carlotta, Changli, Chisa, Chixia, Danjin,
Encore, Galbrena, Hsin, Jinhsi, Jiyan, Lingyang, Lucilla, Lucy,
Luuk Herssen, Phoebe, Phrolova, Qingxiao, Qiuyuan, Rebecca, Roccia,
Rover (Havoc), Xiangli Yao and Zani.

**Augusta** keeps canonical approved Hard CRIT Rate / CRIT DMG and the
full historical Flex ATK% / Heavy Attack DMG / Energy Regen / Flat ATK
with Flex1 at its existing valid tiers. The ordinary account UI already
separates whole-build Energy Regen from the per-Echo pool and thus displays
three per-Echo Flex entries. No policy/math alteration was made.

### 13 newly implemented DPR Substat Value defaults

The source snapshot is **`src/data/improveDprSubstatSensitivities.mjs`**,
captured from live `DPR Calc Results` on 2026-11-13. It contains all thirteen
source-row percentages (including recorded zeros) and each sheet ID, tab
title, exact cells, source URL and WIP marker. It is *source data*, **not**
a second recommendation/policy database. The product selector
`src/improveProductEchoDefaults.mjs` sorts positive DPR marginal values,
separately excludes Energy Regen from per-Echo requirements and applies the
following explicitly bounded Hard choices. Flex order below follows measured
non-Hard sensitivity. Every default requires **at least one Flex**.

| Character (DPR tab) | Hard | Flex, highest measured priority first |
| --- | --- | --- |
| Buling (WIP) | CRIT Rate, CRIT DMG | ATK%, Liberation DMG, Flat ATK |
| Cartethyia | CRIT Rate | HP%, Basic Attack DMG, CRIT DMG |
| Ciaccona | CRIT Rate, CRIT DMG | ATK%, Flat ATK, Liberation DMG |
| Denia | CRIT Rate, CRIT DMG | ATK%, Liberation DMG, Flat ATK |
| Hiyuki | CRIT Rate, CRIT DMG | ATK%, Liberation DMG, Flat ATK |
| Iuno (Sub DPS tab) | CRIT Rate, CRIT DMG | ATK%, Liberation DMG, Flat ATK |
| Jingran | CRIT Rate, CRIT DMG | Heavy Attack DMG, ATK%, Flat ATK |
| Lupa | CRIT Rate, CRIT DMG | ATK%, Liberation DMG, Flat ATK |
| Lynae | CRIT Rate, CRIT DMG | ATK%, Basic Attack DMG, Flat ATK |
| Mornye | *none* | Liberation DMG, CRIT DMG, DEF% |
| Sigrika | CRIT Rate, CRIT DMG | ATK%, Flat ATK |
| Suisui | CRIT DMG | CRIT Rate, HP%, Basic Attack DMG |
| Yangyang Xuanling (Xuanling tab) | CRIT Rate, CRIT DMG | Heavy Attack DMG, ATK%, Flat ATK |

Examples, verified in the live source's actual **Substat Value** area:

- **Iuno** (`I27:J39`): CRIT DMG **6.29%**, CRIT Rate **5.40%**,
  ATK% **2.99%**, Liberation DMG **2.80%**. This is the `Iuno`
  tab, not the separate `Iuno MDPS (WIP)` variant.
- **Cartethyia** (`K27:L39`): CRIT Rate **5.20%**, HP% **2.42%**,
  Basic Attack DMG **1.70%**, CRIT DMG **1.51%**. HP scaling is
  not replaced by a blind double-CRIT Hard.
- **Hiyuki** (`I27:J39`): CRIT DMG **4.79%**, CRIT Rate
  **4.42%**, ATK% **2.38%**.
- **Sigrika** (`I27:J39`): CRIT Rate **5.42%**, CRIT DMG
  **4.57%**, ATK% **2.46%**, Energy Regen **2.23%**.
  The next non-ER candidate after Flat ATK contributes only **0.14%**
  in this scenario, so the owner default keeps two meaningful Flex entries.
- **Mornye** (`J27:K39`): Liberation DMG **3.88%**, CRIT DMG
  **3.79%**, Energy Regen **3.52%**, DEF% **2.78%**. There is
  *no forced CRIT Hard*; ER remains the separate whole-build goal.

**Scenario limitation:** DPR Substat Value is marginal percentage
sensitivity *within the tab's scenario*. WIP data such as Buling are
explicitly flagged, not disguised as stable universal rules.
A DPR **0.00%** Energy Regen sensitivity does not imply that ER is
useless or unnecessary for a different team/rotation.
Jingran's **HP until 50,000** and other conditional build-stat goals
do not gain invented targets from these substat comparisons.

### 19 newly implemented Prydwen guide-only defaults

No usable DPR `Substat / Substat Value` pair was available for these
Characters in the selected source sheet. Their existing, separately
reviewed `characterEquipmentAssociations.ts` stat ordering is reused,
without a scraper, duplicate source model or fabricated quantitative
sensitivity. Hard and optional role-scoping are **Bellibing's choices**.

| Character | Hard | Guide-ordered Flex |
| --- | --- | --- |
| Aalto | *none* | CRIT Rate, CRIT DMG, ATK% |
| Baizhi | *none* | HP%, Flat HP |
| Brant | CRIT Rate, CRIT DMG | Basic Attack DMG, ATK%, Flat ATK |
| Cantarella | CRIT Rate, CRIT DMG | ATK%, Flat ATK, Basic Attack DMG |
| Jianxin | *none* | CRIT Rate, CRIT DMG, ATK% |
| Lumi | CRIT Rate, CRIT DMG | ATK%, Flat ATK |
| Mortefi | *none* | CRIT Rate, CRIT DMG, ATK% |
| Rover Aero | *none* | CRIT Rate, CRIT DMG, ATK% |
| Rover Electro | CRIT Rate, CRIT DMG | ATK%, Skill DMG, Flat ATK |
| Rover Spectro | *none* | CRIT Rate, CRIT DMG, ATK% |
| Sanhua | *none* | CRIT Rate, CRIT DMG, ATK% |
| Taoqi | *none* | DEF%, Flat DEF |
| Shorekeeper | *none* | CRIT DMG, Liberation DMG, HP% |
| Verina | *none* | ATK%, Flat ATK |
| Yangyang | *none* | CRIT Rate, CRIT DMG, ATK% |
| Yinlin | CRIT Rate, CRIT DMG | ATK%, Flat ATK, Skill DMG |
| Youhu | *none* | ATK%, Flat ATK, Skill DMG |
| Yuanwu | *none* | DEF%, Flat DEF |
| Zhezhi | CRIT Rate, CRIT DMG | ATK%, Basic Attack DMG, Flat ATK |

All Hard and Flex rows map to existing legal substat names. Their minimums
are the **lowest verified Rank-5 canonical roll tiers chosen by Bellibing**,
not source-provided thresholds. The existing **all Hard + at least 1 of
selected Flex** engine contract remains unchanged. There are **no remaining
Character source-priority gaps** for this bounded product-standard task.

### Qingxiao example

Source substats: conditional Energy Regen, CRIT Rate = CRIT DMG, ATK%,
Flat ATK, and the joint Heavy/Liberation/Basic DMG% tier.
Product default: Hard **CRIT Rate, CRIT DMG**; Flex **ATK%, Flat ATK**,
minimum one of two. The compound damage priority is preserved as source
guidance and not misrepresented as three independent prioritized requirements.
Minimums: CRIT Rate **6.3%**, CRIT DMG **12.6%**, ATK% **6.4%**,
Flat ATK **30** (existing exact roll tiers). Those are product-selected
minimums, not Prydwen acceptance thresholds.

## Missing Expected Tuners — factual diagnostic

The report says **probably** Qingxiao. No session trace establishing the
actual user-selected Character, preset, Gate, observed roll or account
settings has been provided, so the exact original session remains unconfirmed.

The old source-only Recommended adapter for Qingxiao had zero Hard, source
priorities under Flex but `flexCount:null` **before account-mode normalization**.
Its canonical default policy projection has `presetId:null` /
`No verified default preset`. However, the existing ordinary Improve account
adapter `normalizeAccountStatSettings()` removes Energy Regen and, for
source-only guidance with remaining Flex, auto-sets an **editable, non-source-
certified Flex count of 1** and switches to Customize. Therefore the visible
ordinary account route may already have passed a *structurally valid* target,
rather than passing null to the engine. We must not claim the absent Expected
was proved to be caused by a null count in the owner's original session.

The actual visible-blank defect is proven by `stat-target-cost.js`: it mapped
all private Pending/certificate/transport failures to `cost:null` without
retaining their reason; the resource table rendered only an em dash.
The original observed character/preset/Gate/private response code remains
unknown until a live replay. The new product default supplies a clearer,
source-ranked Hard2/Flex2 target for Qingxiao without changing the private
math; it does not by itself establish why the owner saw no number.

The private standalone gross-Tuner stat-target calculator has **no Character
ID or preset requirement**; it consumes canonical stat names/tiers,
a feasible Hard/Flex target and explicit Gate. Its status is distinct from
DPS, actual team readiness and canonical per-Character Recommended
policies. The new Qingxiao product target is structurally eligible.
Actual private numeric output for this exact preset must still be tested
against the paired private branch/launcher before claiming a verified
numeric result.

Unavailable costs now preserve a reason:
`UNSUPPORTED_ECHO_TARGET_OR_ROLLS`, `SEARCH_LIMIT`,
`TARGET_HAS_NO_FINITE_EXPECTATION`, missing local service and
unresolved current-checkpoint cost remain Pending. A supported verified
certificate still displays its computed value unchanged, with the exact
fresh-start-vs-observed checkpoint distinction. No fabricated estimate.

## Verification and release boundaries

- 59/59 source-backed product eligibility is a **pure configuration / UI**
  readiness assertion. Guide source rows retain their existing
  `SOURCE_PRIORITY_GUIDANCE_ONLY` semantics for other consumers.
- Focused Node checks guard all 59 policies, uniqueness, per-Echo feasibility,
  legal canonical minima, DPR-vs-guide family/provenance, exact percentages,
  unchanged Augusta, support/HP/DEF cases, explicit Recommended reset and
  override/AccountStore protections.
- Built Chromium covers Augusta, Iuno, Cartethyia, Mornye, Baizhi,
  guide-only Brant, existing Qingxiao/Jiyan, Character navigation,
  manual override/reload/Recommended and unchanged physical Inventory items.
  Expected responses in the browser gate use a synthetic HTTP DTO,
  **not a private-engine numeric claim**.
- Existing account/inventory/Build/test/build gates are retained. Broader FULL
  and live owner Windows/public-private Expected-Tuner replay remain
  separate pending work. No merge or deployment.

