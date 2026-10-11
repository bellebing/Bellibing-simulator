# Rank-5 Echo recovery — source evidence for blocker B3

**Research date:** 2026-10-11. **Live game version at review:** Wuthering Waves **3.7** (released 2026-09-30; [official 3.7 announcement](https://wutheringwaves.kurogames.com/m/en/main/news), [official Chinese 3.7 notes](https://mc.kurogames.com/main/news/detail/5569)). **Target:** already-upgraded Rank-5 Echoes at +5/+10/+15/+20/+25, direct **Feed** versus backpack **Data Recovery**. **Repository baseline:** `main` `102b66edec165f3d2a313a562de4049a26424924`. This is **research only**, not a source promotion or executable recovery algorithm.

## Bottom line for B3

**VERIFIED — distinct outputs.** Feeding a leveled Echo into another Echo supplies fractional recovered **EXP to that destination Echo**, while Data Recovery consumes the donor and produces **whole Sealed Tube items in the backpack**. Both operations can return Premium Tuners associated with **actually tuned** substats (3 per 10 Tuners spent). A common 75% EXP rule is documented, but rounding to whole Tube items makes Data Recovery materially different from Feed. Shell Credits already spent are **not** refunded. A recovered EXP *value* is not a Resource Inventory credit until the **actual item denominations** are identified. [S1, S2, S3, S4, S6]

**VERIFIED — concrete receipts at +25 and a +20 carry example.** Japanese player wiki gives a Rank-5 +25 donor as **106,950 EXP if fed**, but **21 Premium + 1 Medium + 1 Basic Sealed Tube** (106,500 EXP) on Data Recovery, 450 EXP less; tuner return is **3 per tuned substat**. An October 2026 video-derived illustrated guide gives a specific +20 donor that feeds **60,750 EXP**, versus a Data Recovery dialog showing **12 Premium + 1 Basic** (60,500 EXP) and **12 Tuners**. The +20 example **must not be confused with a minimal-input +20** donor; its 60,750 direct-feed figure implies 81,000 invested/stored EXP under the 75% rule rather than the bare +20 threshold of 79,100. Exact 81,000 EXP input was **inferred**, not independently verified from a donor ledger. [S2, S4]

**PENDING — complete implementable receipt function.** We do **not** have version-3.7, pre/post-inventory +5 tuned receipts at exact threshold and with carry, nor equivalent every-checkpoint/mixed-Feed/cap cases. The player-reported level-by-level Data Recovery EXP figures below corroborate rounding, **not all four real Tube item vectors**. Do not silently fill them with a greedy decomposition. B3 is **partially evidenced, not cleared**. [B3, S1–S6]

## Sources and evidence quality

| ID | Evidence; source date / version | What it actually proves; limits |
| --- | --- | --- |
| S1 | [Wuthering Waves Wiki — Echo/Leveling](https://wutheringwaves.fandom.com/wiki/Echo/Leveling), indexed/cross-checked 2026-10-11 (page not version-pinned) | +5 to +25 cumulative EXP; Tube item sizes; 75% Feed, 30% spent Tuners, Data Recovery rounds down by up to 499 EXP; no Shell Credit refund. Wiki not a transaction screenshot. |
| S2 | [Japanese 鳴潮 player Wiki — 音骸, “強化済み音骸の再利用”](https://wikiwiki.jp/w-w/%E9%9F%B3%E9%AA%B8), last modified **2026-09-21** (3.6-era edit; site inspected 2026-10-11) | Explicit **+25 Feed 106,950 EXP** vs **Data Recovery 21 Premium + 1 Medium + 1 Basic = 106,500 EXP**, 3 Tuners per tuned slot; Feed uses 10,695 Shell Credits. Strong item-vector report, **not** an inspected 3.7 inventory delta. Also says unmodified Echoes cannot be Feed material. |
| S3 | [TapTap — 声骸强化策略01](https://www.taptap.cn/moment/653721509444978488), **2025-03-25** (historical, likely 2.x) | Author labels Data Recovery at **minimal Tube-only cumulative investment** as *tested*: +5 3,000; +10 12,000; +15 30,000; +20 59,500; +25 106,500 EXP; tuned returns 3/6/9/12/15. These are **EXP totals**, **not** enumerated Tube item denominations; historical patch, not 3.7 re-capture. |
| S4 | [WuWaBuild / Optimized Gaming — “How to level echoes”](https://www.wuwabuild.com/news/wuthering-waves-how-to-level-echoes), **2026-10-02** (3.7) and [linked video](https://www.youtube.com/watch?v=8QY0V_8tobU), timestamps **3:33–4:45** | Illustrated Feed/+20 and Data Recovery/+20 example: **60,750 EXP Feed**, **12 Premium + 1 smaller 500-EXP Basic** and **12 Tuners** via Data Recovery. The article provides timestamped image captions; raw game frame and video were **not independently downloaded/played** in this review. The displayed +20 result differs from minimum-input +20 in S3: carry/overfill is relevant. |
| S5 | [Reddit — “FYI, discarding echoes for tubes is not more efficient than feeding … with numbers”](https://www.reddit.com/r/WutheringWaves/comments/1lr7pr7/), **2025-07-04** | Player test: Feed a 50,000-EXP invested donor gives **37,500 EXP**; Data Recovery gives **7 Premium + 1 Advanced + 1 Basic** = **37,500 EXP**. Another 12,500-EXP example gives Feed **9,375**, Data Recovery **1 Premium + 2 Advanced = 9,000**. Supports exact *denomination* and rounding mechanics; sample donor level not stated. |
| S6 | [Reddit — Sept 2026 Tuners/Tubes discussion](https://www.reddit.com/r/WutheringWaves/comments/1wkd3l1/), **2026-09-19/20** | Contemporary users confirm **30% Tuners also when feeding**, not exclusively by trash/Data Recovery; anecdotal only, not a counted transaction receipt. |
| S7 | [Kuro Games — 2.5 Patch Notes](https://wutheringwaves.kurogames.com/en/main/news/detail/2966), official | **Sync Tuning optional**; reaching a tunable level alone need not consume Tuners. If insufficient Tuners, substat stays locked. Therefore refund depends on tuned slots, **not merely level**. |
| S8 | [Kuro Games / dev notice reproduced by wiki — 2024 recovery error](https://wutheringwaves.fandom.com/wiki/Mail/Explanation_Regarding_Abnormal_Item_Output_During_Recovery_of_Developed_Echoes) and [Prydwen reprint](https://blog.prydwen.gg/2024/06/02/wuthering-waves-dev-note-timeline-adjustments/) | 2024 anomalous Shell Credit output on recycling was a **bug fixed by hotfix**, not intended Shell Credit recovery. Do not derive modern receipts from 1.0 bug screenshots. |
| S9 | [Wuthering Waves Wiki — Data Merge](https://wutheringwaves.fandom.com/wiki/Data_Merge) | **Data Merge** (5 unupgraded Echoes → new random Echo) is **not Data Recovery** of an upgraded donor. |
| S10 | [Kuro Games — version 3.7 notes](https://mc.kurogames.com/main/news/detail/5569), official 2026-09-30 | Anchors current patch; not a recovery receipt. No reviewed official item-by-item refund schedule for 3.7. |

**Status convention:** VERIFIED = documented observation/rule **within the named source and version**, not a claim of independent live-play parity. PENDING = specific missing receipt/semantic proof. CONFLICT = materially different observed figures or claims that must not be flattened together. Player reports are labeled as such.

## Quantities: exact-threshold vs minimal Tube-only vs actual inventory receipts

Canonical **thresholds**, from the current `src/echoCoreRules.ts` and S1 (the threshold is **not** necessarily what the player put into the donor):

| Rank-5 donor level | Stored minimum at threshold | Minimal **Tube-only** EXP supplied to reach level | Conditional 75% **Feed** based on that invested/stored value (theoretical, **not Tubes**) | **Data Recovery** reported/tested at minimal Tube-only input (S3, historical) | Premium Tuner receipt if all reachable slots **actually tuned** |
| --- | ---: | ---: | ---: | ---: | ---: |
| +5 | 4,400 | 4,500 | 3,375 EXP | **3,000 EXP worth of items** | 3 |
| +10 | 16,500 | 16,500 | 12,375 EXP | **12,000 EXP worth of items** | 6 |
| +15 | 39,600 | 40,000 | 30,000 EXP | **30,000 EXP worth of items** | 9 |
| +20 | 79,100 | 79,500 | 59,625 EXP | **59,500 EXP worth of items** | 12 |
| +25 | 142,600 **cap** | 143,000 | 106,950 EXP (**75% × capped 142,600**) | **106,500 EXP worth of items** | 15 |

Important restrictions on this table:

1. **VERIFIED** threshold numbers and four item values; **VERIFIED as S3's historical player-tested EXP-equivalents** for the Data Recovery column. **PENDING** actual denomination vectors at +5/+10/+15/+20 minimal-input cases, or independently captured exact 3.7 results. In particular **do not** report 3,000, 12,000, 30,000 or 59,500 as "Tubes awarded". They are EXP **equivalents**.
2. **MODELED/theoretical Feed column:** multiplication of the **specified** assumed donor stored EXP by 0.75. The donor can contain carry above a checkpoint; replace the input with **actual donor stored EXP**, not just `CHECKPOINT_CUMULATIVE_COST[level].exp`. At +25 the EXP cap is 142,600; the extra 400 from a 143,000-EXP Tube spend is **not donor EXP**. S2 explicitly corroborates 106,950 and S3/S2 106,500.
3. S1 describes recovery to whole items in 500-EXP units, with downward loss below 500 EXP. The **working hypothesis**, not yet a universally verified game implementation rule, is `recoverableWholeTubeEXP = 500 * floor(0.75 * storedDonorEXP / 500)`, followed by a denomination assignment. It fits S2–S5 examples. **Do not ship this as an unconditional authoritative conversion function** before exact/carry receipts and denomination proof.
4. Tune receipt `3 × number of actually tuned substats` follows S2, S3, S6 and S7. For example, **+20 but only +5 and +10 tuned → 6 Tuners** expected, **not automatically 12**. No tuner consumption means no Tuner Recovery. Exact UI timing for a canceled/uncommitted action remains PENDING.
5. These figures assume a **single donor** and exclude other Tube/Feed materials, same-action cap return and multiple donors. Neither real donor acquisition refunds nor Shell Credits appear as return items.

### Whole-item receipts actually documented

| Scenario | Feed EXP added to target | Data Recovery **item receipt** | Tuner receipt | Status |
| --- | ---: | --- | --- | --- |
| Rank-5 +25, at EXP cap, fully tuned | **106,950 EXP** | **Premium ×21; Medium ×1; Basic ×1** (= 106,500 EXP) | **15 Premium Tuners** | **VERIFIED player Wiki example** S2; parity on 3.7 PENDING |
| Rank-5 +20 **specific carried/overfilled example** in video-derived guide | **60,750 EXP** | **Premium ×12; Basic ×1** (= 60,500 EXP) | **12 Premium Tuners** | **VERIFIED guide-described screenshot**, S4; exact donor EXP and independent frame review PENDING |
| 50,000-EXP upgraded donor (checkpoint unspecified) | **37,500 EXP** | **Premium ×7; Advanced ×1; Basic ×1** (= 37,500 EXP) | Not reported | **VERIFIED Reddit self-test**, S5; level/version-current parity PENDING |
| 12,500-EXP upgraded donor (checkpoint unspecified) | **9,375 EXP** | **Premium ×1; Advanced ×2** (= 9,000 EXP) | Not reported | **VERIFIED Reddit self-test**, S5; level/version-current parity PENDING |

For +20, **CONFLICT only if falsely treated as the same donor**: S3's +20/79,500 input → 59,500 recovered-item EXP; S4's distinct donor → 60,500 recovered-item EXP. This is **not evidence that +20 always refunds one fixed number**. A carry-dependent model resolves the arithmetic, but its exact state/source rule still requires controlled receipts.

**Comparison/strategy caution:** S4 recommends Data Recovery at high levels to keep Tube spending optional before the next substat checkpoint; S5 shows that **direct Feed can give equal or more EXP than Data Recovery**, with a maximum 499-EXP denomination loss in Data Recovery. These claims address **different decisions** (next-checkpoint control vs raw EXP conservation). An unconditional "recycling yields more EXP" claim is **CONFLICT / unsupported**. Direct Feed can push a fresh target **past** the player's intended stop/checkpoint and expose EXP to another 25% loss if that target is rejected; Data Recovery leaves unspent Tube items reusable. Neither mode is universally economically best without the user's next action, actual Tube stocks and destination state.

## Trigger / flow / rounding boundaries

| Question | Evidence status and rule |
| --- | --- |
| Eligible donor | **VERIFIED** only **upgraded**, unequipped and unlocked Echoes can be reused as Feed material; upgraded Echoes cannot be Data Merged. See S1, S2, S9. More exact flag/stack UX under 3.7: **PENDING**. |
| Feed | **VERIFIED** consumes donor on committed upgrade and applies effective 75% donor EXP directly to destination; **no Sealed Tubes are returned as recovery items** in that operation. 30% already-spent Tuners are returned on feed (S1, S2, S6). Destination EXP/tuning remains its own transaction. |
| Data Recovery | **VERIFIED** uses backpack dispose/trash/Data Recovery, consumes donor and awards an **item-vector receipt** to inventory; this need not match continuous 75%-EXP Feed exactly (S1, S2, S4, S5). |
| Tuners | **VERIFIED** refunded **per actual tune**, three Premium Tuners per 10 originally spent. A donor's EXP level and `tunedThrough` are separate; automatic Sync Tuning is optional (S7). Exact recovery UI displays/atomicity: **PENDING**. |
| Loss and rounding | **VERIFIED** Data Recovery returns whole Tube-value EXP at a discount; examples support downward 500-EXP quantum (S1–S5). **PENDING** universal order/algorithm, cross-source or non-500 donor input, and round/truncate points when intermediate EXP is fractional. |
| Shell Credits | **VERIFIED** no recovery of previously spent currency. Feeding donated EXP incurs destination upgrade Credits in S2 (+25 example: 10,695) and S1's per-EXP spend rule. 1.0 recycling over-refund was fixed bug S8. **PENDING** current 3.7 exceptional cap/carry charging, handled by separate B2. |
| +25 / excess | **VERIFIED** capped Rank-5 donor stores 142,600 EXP; +25 Feed 106,950 and Data Recovery 106,500 (S2). **PENDING** live receipt and overflow handling when a **Feed donor** alone oversupplies a target near +25, multiple donors mix with Tubes, or +25 donor's original overfill involved denomination returns. |
| Locked/selected/equipped, bulk, capacity | **PENDING** exact 3.7 restrictions, bag stack/cap behavior, auto-discard vs actual Data Recovery, receipt aggregation and failure/no-space behavior. Do not translate hypothetical dispose to Data Merge. |

## Resource Inventory implications / implementation handoff

Current `main`: `src/resourceInventory.ts` stores **finite whole counts or UNLIMITED** for Echoes, Tuners and each **Premium/Advanced/Medium/Basic** Tube; `src/data/echoTubeSource.ts` owns item EXP values 5,000/2,000/1,000/500. `src/echoCoreRules.ts` exposes `effectiveRefundAtLevel(level)` as **fractional effective EXP and Tuners** based solely on checkpoint level. `src/echoCoreRuntime.ts` and `src/echoStrategySimulator.ts` consume that modeled helper for strategy costs. Neither is a valid **recovery receipt → Resource Inventory** implementation. `src/echoExactTubeSpending.ts` provides exact **forward Tube spending/carry/+25 overflow returns** and explicit tuning; its cap-return decomposition is **not evidence for Data Recovery conversion**. The current contracts explicitly leave Feed/Data Recovery pending.

For an eventual separately authorized implementation, do **not** subtract an EXP-equivalent scalar from Tube budgets. Record a separately committed operation and exact `returned: { premium, advanced, medium, basic, tuners }` counts **only for Data Recovery**, and a destination EXP delta **only for Feed**; debit the actual donor once; preserve per-denomination gross spend/returns and receipt ownership. Do not fabricate Shell Credit refunds, extra Echo templates, or level-based tuning where not tuned. Keep all of this in Echo Core/domain/transaction code rather than UI; current simulator must remain **PENDING** on unsupported receipts and avoid spending the user's saved inventory while hypothetical runs are detached.

**Independently verify before B3 can close (bounded request for 3.7 captures):**

1. A **single +5, once-tuned Rank-5** donor at **exact 4,400 stored EXP** (possible only with an appropriate exact source) and another at **4,500 EXP** (Tube-only): pre/post donor, bag four Tube counts, Tuners, and Data Recovery preview + confirmed receipt. Repeat using **Feed** to a fresh +0 target. Confirm fractional EXP displays and confirm whether a 4,400 exact-input donor can exist under in-game consumption. Capture cancellation/no-spend path if possible.
2. Repeat at +10/+15/+20/+25 with **minimal Tube-only spent** (16,500/40,000/79,500/143,000; at cap record 142,600 stored) and at least one **carried overfill** at +10 and +20. Capture **all four denomination counts**, not just a grand total. Include **partially tuned +20** (two tunes) and **untuned leveled +20** to test Tuner Recovery trigger.
3. Feed into destinations near a tuning boundary and near +25 cap; confirm whether cap overflow is returned as whole items and the ordering, plus exact Shell Credit transaction and what happens when destination already has EXP carry. Confirm donor lock/equipped/marked-discard eligibility and whether bulk Data Recovery aggregates before or after 500-EXP rounding.
4. **Version pin** every receipt with game version/date and screenshot/video of the before inventory, action preview, completion and after inventory; record donor source (exact Tube/item amounts), stored EXP, level and number of actual tunes. A preview alone is not an applied inventory delta.

**B3 conclusion:** Overall **PENDING**. VERIFIED core rate/operation split, multiple whole-item examples, +25 and carried +20. PENDING exact modern per-level 4-denomination receipts and all carry/rounding/cap/bulk edge cases. No simulator or existing PR changed by this document.
