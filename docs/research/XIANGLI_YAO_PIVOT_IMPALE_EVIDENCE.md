# Xiangli Yao — Pivot - Impale damage-class evidence

**Worker 11 | research date: 2026-10-11 | source baseline: `main@102b66edec165f3d2a313a562de4049a26424924` | documentation only.**

## Verdict and existing canonical state

**PENDING. The blocker must not be closed.** Neither currently reviewed source text nor a reproducible controlled in-game damage comparison establishes which damage-bonus bucket applies to Pivot - Impale stages 1–3: **Basic Attack DMG Bonus**, **Resonance Liberation DMG Bonus**, **Resonance Skill DMG Bonus**, or another classification. A Basic Attack input, location on the Resonance Liberation talent page, and execution in `Intuition` are not individually sufficient evidence.

On current `main` Xiangli Yao (`xiangli-yao`) is `PARTIALLY_VERIFIED`. `ACTIONS` is `PARTIAL`, while `FORTE_RULES` and `INHERENT_PASSIVES` are separately source-`VERIFIED`. The three Pivot action facts have `damageClass: null`, `verificationStatus: PARTIALLY_VERIFIED` and `modelingStatus: PENDING_INTERPRETATION`. Their existing ATK-scaling Lv1–Lv10 curves/hit counts remain source-preserved. Other full-profile areas cannot be promoted by resolving this one issue.

Canonical owners: [source-review disposition](../CHARACTER_MECHANICS_SOURCE_REVIEW.md), [ACTIONS coverage audit](../CHARACTER_ACTIONS_COVERAGE.md), [source-blocker registry](../../src/data/characterMechanicsSourceReview.ts), [ACTIONS and value facts](../../src/data/characterMechanics/rosterActionCompletion.ts), [FORTE rules](../../src/data/characterMechanics/rosterForteCompletion.ts).

[Worker 6 Draft PR #257](https://github.com/bellebing/Bellibing-simulator/pull/257) is **unmerged** at research time. Its `CHARACTER_FACTS_COVERAGE.md` independently records the Xiangli Yao ACTIONS blocker; `CHARACTER_BUILD_DATA_COVERAGE.md` marks his mechanics `X` and no reviewed own build preset. Neither is a gameplay test or a source promotion.

## Exact source identity, description and values

- Character identifier: `xiangli-yao` / upstream character `1305`.
- Move `1002303`: **Resonance Liberation — Cogitation Model**, source paragraph describing `Intuition`.
- Value IDs: `1305015` Pivot Stage 1; `1305016` Pivot Stage 2; `1305017` Pivot Stage 3.
- Canonical fact IDs: `xiangli-yao-pivot-impale-stage-1`, `xiangli-yao-pivot-impale-stage-2`, `xiangli-yao-pivot-impale-stage-3`.
- Canonical blocker ID: `ACTIONS-XIANGLI-YAO-1305015-1305017-DAMAGE-CLASS`.
- Earlier blocker review source: [`DommyMM/wuwabuild@5fa70b11f1d84fb644e4dbed47873708da0fe66f` / `public/Data/Characters.json`](https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json); checked 2026-08-29 in `characterMechanicsSourceReview.ts`.
- Current imported ACTION source: [`DommyMM/wuwabuild@2b57a127b26b062ab58d272cd6735338507de1cd` / `public/Data/Characters.json`](https://github.com/DommyMM/wuwabuild/blob/2b57a127b26b062ab58d272cd6735338507de1cd/public/Data/Characters.json); checked 2026-10-01 in `rosterActionCompletion.ts`. **Keep these different source snapshots distinct.**
- FORTE text/tree provenance: [`WutheringWaves_Data@353f2eaed119bc9f680eab92807d20ac75a79b40` / skilltree](https://github.com/Arikatsu/WutheringWaves_Data/blob/353f2eaed119bc9f680eab92807d20ac75a79b40/BinData/skillTree/skilltree.json) and [English MultiText](https://github.com/Arikatsu/WutheringWaves_Data/blob/353f2eaed119bc9f680eab92807d20ac75a79b40/Textmaps/en/multi_text/MultiText.json). These pin text/state relationships, **not** the unknown damage-class tag.

**Exact relevant game-description sentence** (source-preserved English wording, corroborated by current skill-text mirrors):

> Basic Attack and Heavy Attack are replaced with Basic Attack Pivot - Impale, which performs up to 3 consecutive attacks, dealing Electro DMG.

The **same** Cogitation Model paragraph expressly calls the replacement Dodge Counter **Unfathomed** “considered as Resonance Liberation DMG”; it does **not** attach that classification to Pivot - Impale. `Intuition` provides 3 Hypercubes, lasts up to 24 seconds, and ends earlier after the Hypercubes are consumed. **Source text is not a direct modifier test.** Independent transcriptions: [Prydwen](https://www.prydwen.gg/wuthering-waves/characters/xiangli-yao), [Wuthering Waves Wiki / Fandom](https://wutheringwaves.fandom.com/wiki/Xiangli_Yao/Combat), [wuthering.wiki ID 1305](https://wuthering.wiki/character_1305.html).

| Pivot stage | Value ID | Lv1 coefficient × hit count | Lv10 coefficient × hit count | Damage class |
| --- | --- | --- | --- | --- |
| 1 | `1305015` | 60.19% × 1 | 119.67% × 1 | `null` / **PENDING** |
| 2 | `1305016` | 30.65% × 4 | 60.92% × 4 | `null` / **PENDING** |
| 3 | `1305017` | 67.03% × 2 | 133.25% × 2 | `null` / **PENDING** |

Intermediate levels, component scaling and hit counts already exist in the canonical ACTION facts; **do not reconstruct them**. `actionKind: BASIC` describes the replacement input; `section: RESONANCE_LIBERATION` describes the talent source; neither proves a bonus modifier classification.

## Skill versus Forte versus Liberation: existing classification

| Action | Source move/value | Attack/button relationship | Existing canonical damage class | Evidence boundary |
| --- | --- | --- | --- | --- |
| Probe normal Basic | `1002301` / `1305001–1305005` | Regular Basic Attack chain | `BASIC` | Regular action, not Pivot replacement. |
| Probe Heavy | `1002301` / `1305006` | Regular Heavy Attack | `HEAVY` | Regular Heavy action. |
| Deduction | `1002302` / `1305011` | Regular Resonance Skill | `SKILL` | Normal skill. |
| Cogitation Model initial damage | `1002303` / `1305014` | Resonance Liberation cast | `LIBERATION` | Does not classify the replacement chain. |
| **Pivot - Impale stages 1–3** | `1002303` / `1305015–1305017` | Replacement Basic Attack under Intuition | **`null` / PENDING** | No explicit damage-bonus class. |
| Divergence | `1002303` / `1305018` | Replacement Resonance Skill under Intuition | `SKILL` | Being in Intuition does not imply LIBERATION. |
| Unfathomed | `1002303` / `1305019` | Replacement Dodge Counter | `LIBERATION` | **Explicit text** classifies it. |
| Decipher | `1002307` / `1305027` | Forte-triggered replacement Resonance Skill | `LIBERATION` | **Explicit text** classifies it. |
| Law of Reigns | `1002307` / `1305028` | Forte, enhanced Resonance Skill | `LIBERATION` | **Explicit text** classifies it. |
| Revamp | `1002307` / `1305029` | Forte follow-up triggered using Basic Attack | `LIBERATION` | **Explicit text** classifies it. |

The already-reviewed Forte relationships (`Intuition` replacement state, 24s limit, `Capacity=100` → Decipher, `Performance Capacity=5` → Law of Reigns, Revamp follow-up) stay source-`VERIFIED`; numeric “shortly after” timing remains `PENDING_INTERPRETATION`. **Talent-level multiplier source, button kind, Forte state and damage-bonus class are different axes.** An attack can use a Basic input while explicitly dealing Liberation DMG (Revamp); another can be used during Intuition while classed as Skill DMG (Divergence).

## Evidence ledger — distinguish observations, text and interpretation

| Evidence ID | Link / source checked 2026-10-11 | What it supports | Classification |
| --- | --- | --- | --- |
| `XY-PIVOT-E01` | [Canonical source review](../CHARACTER_MECHANICS_SOURCE_REVIEW.md) + [blocker registry](../../src/data/characterMechanicsSourceReview.ts) | Intentional null Pivot bonus class; blocker stays open. | **VERIFIED canonical status**, not a positive class. |
| `XY-PIVOT-E02` | [ACTION facts](../../src/data/characterMechanics/rosterActionCompletion.ts), [FORTE facts](../../src/data/characterMechanics/rosterForteCompletion.ts) | Exact coefficients, ATK scaling and hit shapes; separate classification for Unfathomed, Divergence and Forte moves. | **VERIFIED existing source-backed facts**. |
| `XY-PIVOT-E03` | [Prydwen](https://www.prydwen.gg/wuthering-waves/characters/xiangli-yao), [Fandom combat](https://wutheringwaves.fandom.com/wiki/Xiangli_Yao/Combat), [wuthering.wiki](https://wuthering.wiki/character_1305.html) | Replacement wording, Electro damage, absent Pivot conversion statement and source multiplier page. | **Corroborated text only**; not an A/B modifier test. |
| `XY-PIVOT-E04` | [WutheringWaves.gg early analysis](https://wutheringwaves.gg/xiangli-yao-early-analysis/), [current guide](https://wutheringwaves.gg/xiangli-yao-guide/) | Pivot uses **Liberation talent multipliers** despite its Basic-chain identity; author describes Divergence as Skill DMG. | **Theoretical/guide interpretation**; talent source ≠ bonus class. |
| `XY-PIVOT-E05` | [Community question, Dec 2024](https://www.reddit.com/r/WutheringWavesGuide/comments/1hfm8ct), [Jianxin showcase claim, Sep 2024](https://www.reddit.com/r/WutheringWaves/comments/1feholr) | Posters assert “all” attacks in Intuition count as Liberation DMG; one comment explicitly admits uncertainty. | **Uncontrolled anecdote**, no hit-level values or stat-isolated A/B; potentially conflicts with canonical Divergence. |
| `XY-PIVOT-E06` | [Official Kuro character event notice](https://wutheringwaves.kurogames.com/en/main/news/detail/1250), [official resonator showcase](https://www.youtube.com/watch?v=eTkkBkUvi0Q) | Official character/event/video context. | **Official material**, but **no published Pivot bonus-class statement or measurement identified**. |
| `XY-PIVOT-E07` | [Worker 6 PR #257](https://github.com/bellebing/Bellibing-simulator/pull/257) (unmerged `CHARACTER_FACTS_COVERAGE.md` / `CHARACTER_BUILD_DATA_COVERAGE.md`) | Independent audit preserves exact same unresolved blocker. | **Repository audit**, not an in-game test. |

**Direct in-game results found: NONE suitable for promotion.** No reproducible attack-specific current-version Pivot Stage 1/2/3 damage log was found comparing isolated **Basic Attack**, **Liberation**, and **Skill DMG Bonus** modifiers while holding stats, target, crit and buffs constant. This worker did **not** run the game. Build guides, headline damage screenshots, “all Intuition attacks are Liberation” comments and Liberation-oriented weapon recommendations are **not** controlled verification.

## Damage modifier implications: VERIFIED versus PENDING

**VERIFIED:** Pivot hits deal **Electro DMG**, with **ATK**-based source multipliers and the three known hit shapes. Electro elemental damage/ATK scaling does **not** reveal the Basic/Skill/Liberation bonus type.

**PENDING:** Which of **Basic Attack DMG Bonus**, **Resonance Skill DMG Bonus**, **Resonance Liberation DMG Bonus**, other damage bonuses or Deepen applies to **each individual Pivot hit**. Do not mistake general Electro/ATK/CRIT amplification or talent scaling for a category-specific positive result. No ratio, stack assumption or classification is invented.

## Required evidence to close the blocker

1. Record client version/build/date, Xiangli Yao sequence (prefer S0), skill levels, weapon/refinement, Echoes/sets, ATK/Electro/CRIT and all other buffs, target identity/level/DEF/resistance/phase; ensure no uncontrolled state changes.
2. Capture baseline Pivot **Stage 1, each of Stage 2's four hits, and each of Stage 3's two hits**, with raw damage numbers, critical/noncritical flags and video/frame evidence. Keep Intuition and Knowing stacks identical across conditions.
3. Repeat with a documented **isolated Basic Attack DMG Bonus**, then **isolated Resonance Liberation DMG Bonus**, then **isolated Resonance Skill DMG Bonus**, preserving all other stats (or explicitly normalizing incidental differences). Compare observed hit-by-hit ratios with formula predictions including rounding and enemy DEF/resistance; repeat to exclude variance.
4. Use positive/negative controls on the same target: Probe Basic for Basic; Deduction/Divergence for Skill; Cogitation Model, Unfathomed or Law of Reigns for Liberation. Record whether each applied modifier was actually active on the tested hit.
5. Corroborate the experimental outcome with **official in-game wording or current client attack/hit metadata**, preserving exact source revision, hit/action ID and evidence screenshots. If metadata and measured ratios disagree, remain **PENDING**.
6. Request a **separate approval** before changing canonical `damageClass`, provenance or gameplay code; then rerun affected deterministic audits/tests and the complete six-area readiness gate. Closing Pivot alone does not establish full character/DPS readiness.

**Final disposition:** `XY-PIVOT-E01–E07` verify source values and unresolved semantics but not the disputed damage-bonus class. **Blocker OPEN / PENDING; no canonical classification, gameplay-code change or merge authorized by this report.**
