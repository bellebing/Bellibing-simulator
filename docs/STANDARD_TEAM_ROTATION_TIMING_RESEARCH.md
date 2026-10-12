# Standard team rotation timing research

The first research pass found published **per-Character field-time tables for 12 trios, each with three rotation records**. Ten of the 19 existing coordination cases have related published timing. These are reproducible reference conditions, not an estimate of average human input speed. Eight trios supply **22 selected contiguous phase scenarios**; other records retain useful aggregate budgets, waits or variant differences.

## Source selection and evidence

[Arab Wuwa's methodology](https://arabwuwa.com/methodology/) describes gameplay-tested timing, three rotations, standardized builds, sufficient Energy and clean execution. It permits animation cancels. We retain the normal/basic recipes, avoid advanced quickswap as a baseline, and flag source-listed intra-Character cancels. These are published clean reference runs; no frame-perfect requirement is established. Slower execution can be modeled later as a declared scenario rather than a claim about an average player.

The methodology does **not** establish whether the timing clock includes cinematics, hitstop or time-stop. This batch labels it `SOURCE_CLOCK_UNSPECIFIED`. Source decimals are retained for reproducibility; display can round them. They are not a guarantee of hundredth-second precision. Patch-specific labels were not exposed on the reviewed tables; their published update date and capture date are retained.

- [Timing evidence](../data/source/standard-team-rotation-timing-evidence-2026-10-12.json) owns numeric tables, row locations, sequence/weapon/refinement/set conditions and the provider's methodology classification. Damage/DPS rankings and long guide text are not imported.
- [Manual review](../data/source/standard-team-rotation-timing-review-2026-10-12.json) owns source selection, actor order, relation to existing cases, related Prydwen references, differences and the search ledger. Hashes pin evidence and existing reference/coordination artifacts.
- `scripts/capture-standard-team-rotation-timing.py --input-dir DIR` reads saved numbered web renders named `timing-SLUG.txt`. The output is candidate evidence; it does not refresh manual approval automatically.
- `node --experimental-strip-types scripts/generate-standard-team-rotation-timing.mjs [--check]` validates joins, publication sums/averages and projections.
- `src/standardTeamRotationTiming.ts` supplies exact-trio candidate lookup and one explicitly requested source/rotation description. It does not pick a player's mode or silently change their gear/reference.

## Published budgets

Seconds below are **later rotation** budgets. An arrow denotes a source-written contiguous actor order. Slash-separated totals denote split or unresolved visits, not chronological blocks. Opening and later records are separately preserved; the provider's three-rotation average is not a loop duration.

| Published team variant | Later Character portions | Published cycle | Treatment |
| --- | --- | --- | --- |
| [Augusta / Iuno / Shorekeeper](https://arabwuwa.com/teams/augusta-iuno-shorekeeper-35/) | Shorekeeper 4.75 → Iuno 9.73 → Augusta 11.58 | 26.06 | Basic loop; Iuno opening 8.21, support opening 6.06. |
| [Aemeath / Lynae / Mornye](https://arabwuwa.com/teams/aemeath-lynae-mornye-86/) | Mornye 5.86 → Lynae 7.30 → Aemeath 12.33 | 25.49 | Tune Rupture/Tune Break variant; source recipe differs from Prydwen preparation. |
| [Cartethyia / Ciaccona / Aero Rover](https://arabwuwa.com/teams/cartethyia-ciaccona-rover-aero-40/) | Rover 5.81 → Ciaccona 6.86 → Cartethyia 13.99 | 26.66 | Normal loop. Opening recipe/table disagree about Ciaccona's cancel variant; opening excluded. Rover S6/R5. |
| [Cartethyia / Ciaccona / Chisa](https://arabwuwa.com/teams/cartethyia-ciaccona-chisa-50/) | Chisa 7.07 → Ciaccona 6.86 → Cartethyia 13.99 | 27.92 | Normal Ciaccona, no jump cancels. Chisa damage setup. |
| [Cartethyia / Ciaccona / Shorekeeper](https://arabwuwa.com/teams/cartethyia-ciaccona-shorekeeper-38/) | Shorekeeper 4.75 → Ciaccona 6.86 → Cartethyia 13.99 | 25.60 | Later normal recipe retained; fast jump-cancel opening excluded. Source does not prove Prydwen's multi-wave timing. |
| [Changli / Brant / Lupa](https://arabwuwa.com/teams/changli-brant-lupa-24/) | Lupa 8.03 → Brant 7.87 → Changli 11.98 | 27.88 | One-Anchor Brant; Changli without internal swaps. Buff-chain variant. |
| [Phrolova / Qiuyuan / Cantarella](https://arabwuwa.com/teams/cantarella-qiuyuan-phrolova-43/) | Phrolova 11.24 → Qiuyuan 6.96 → Cantarella 7.98 | 26.18 | Off-field anchor; Phrolova damage continues during partner work. No Lucilla substitution. |
| [Galbrena / Lucilla / Shorekeeper](https://arabwuwa.com/teams/galbrena-lucilla-shorekeeper-140/) | Shorekeeper 4.75 → Lucilla 8.54 → Galbrena 13.04 | 26.33 | Normal Lucilla with Heron, three Wings and source-listed Hellstride cancels. Additional research trio. |
| [Zani / Phoebe / Shorekeeper](https://arabwuwa.com/teams/zani-phoebe-shorekeeper-33/) | Zani 12.70 / Phoebe 8.24 / Shorekeeper 4.75 | 25.69 | Two Nightfall; Phoebe split around support. Useful standard totals; individual visit boundaries missing. |
| [Jinhsi / Zhezhi / Shorekeeper](https://arabwuwa.com/teams/jinhsi-zhezhi-shorekeeper-58/) | Jinhsi 12.04 / Zhezhi 7.84 / Shorekeeper 4.49 + wait 0.63 | 25.00 | Reentries and cycle boundary unresolved; aggregate research only. |
| [Brant / Lupa / Mornye, one Anchor](https://arabwuwa.com/teams/brant-lupa-mornye-84/) | Brant 7.87 / Lupa 8.03 / Mornye 5.86 + wait 1.26 or 1.98 | 23.02 / 23.74 | Alternative only; cannot time the existing double-Forte case from these numbers. |
| [Xiangli Yao / Yinlin / Shorekeeper](https://arabwuwa.com/teams/xiangli-yao-yinlin-shorekeeper-7/) | Yao 13.10 / Yinlin 4.56 / Shorekeeper 4.75 + later wait 2.59 | 22.41 / 25.00 | Source identifies Liberation cooldown failure. Retained as counterexample, not a sustainable standard loop. |

## Derived timeline contract

Published tables give **Character budgets**, not action timestamps. For an eligible phase with one contiguous visit per actor and zero unplaced wait, Bellibing sums those budgets in the reviewed written actor order. It labels the result `DERIVED_REFERENCE_SCENARIO`.

For Augusta's later recipe, that gives Shorekeeper **0–4.75**, Iuno **4.75–14.48**, Augusta **14.48–26.06**. Those start/end boundaries are arithmetic reference positions; they are not independently measured video handoffs. We do not add outgoing Outro and incoming Intro animation time again: they are already part of the provider's total accounting. Off-field attacks do not create extra active visits or extend the denominator independently.

Split visits remain `AGGREGATE_BUDGETS_ONLY`. Phoebe's 8.24 seconds is not allocated evenly across her two visits; Jinhsi's totals are not copied into every reentry. Source waits are retained separately and reconcile with the cycle total. No unreported waiting location is chosen.

Every Prydwen link is `RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING`. Matching a trio or broad strategy does not prove the timed recipe matches every source command. The existing Prydwen sequences remain unchanged. Consumers must use the timing source's recipe and conditions, rather than assigning its seconds to different action lists.

## Remaining research and combat use

The coverage inventory accounts for all 19 coordination cases, including nine without a matching timing source in this bounded search. Hsin Unison/Flare cases, Aero Rover/Chisa without Ciaccona, low-Erosion variants, Phrolova/Lucilla/Qiuyuan, Havoc Rover/Danjin and advanced Aemeath/Changli need separate evidence or a declared modeled scenario. No source absence is treated as zero time or proof that a rotation does not exist.

The search ledger records other leads: Gwisted publishes complete-cycle totals but no actor boundaries; Maygi publishes an explicitly simplified no-quickswap Cartethyia guide, but the available reader did not expose measurable video handoffs; the community calculator sheet and dynamic WuwaLAB/Tethys timing content were not readable. None supplies guessed values. Gwisted's 26.5s/27.5s scenarios must not be combined with Arab Wuwa's recipes.

These budgets are usable for broad timing displays and explicit consequence scenarios. To resolve actual buff overlap, later work must bind trigger/expiry/exit events to a chosen clock and action positions. To calculate player-build DPS, it also needs exact action/hit coverage, energy/cooldowns, team/weapon/Echo conditions and enemy state. This batch publishes no DPS, automatic buff uptime or upgrade verdict and registers no combat engine. It does not require proof of average human reaction speed.
