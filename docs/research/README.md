# Bellibing source research — evidence index

This directory collects **research evidence**, not a replacement for the canonical game-data models. The accepted authority remains current GitHub `main` and owning source/code audits, then [Project Status](../PROJECT_STATUS.md), the AI Handoff, and relevant domain contracts. A source labelled `VERIFIED` in a worker report may mean **the cited source was observed to make that statement**, not that Bellibing has independently validated the mechanic in the current game client. Source conditions, version, conflicting reports, and `PENDING` fields must remain attached.

## Echo economy — actual game receipts still needed

| Evidence | Scope and implementation boundary |
| --- | --- |
| [Shell Credits: +0→+25 / B2](SHELL_CREDITS_RANK5_B2_2026-10-11.md) | Rank-5 EXP and tune costs, overflow credit preview; checkpoint carry, committed Tube returns and fractional rounding remain unclosed. |
| [EXP carry / B2 follow-up](ECHO_EXP_CARRY_EVIDENCE.md) | Additional source statements and controlled-capture requirements; does **not** close B2. |
| [Feed versus Data Recovery / B3](ECHO_RECOVERY_EVIDENCE.md) | Recovery fractions and source-described whole-Tube examples; exact modern receipts and resource-inventory transaction semantics remain unclosed. |

Do not implement an assumed recoverable Tube denomination vector or Shell Credit rounding mode from these reports alone. The first simulation driver must respect the bounded/pending behavior in the current exact-spending contract and [V1 plan candidate](https://github.com/bellebing/Bellibing-simulator/pull/250).

## Character facts — separate raw data, interpretation and runtime

| Evidence | Scope and implementation boundary |
| --- | --- |
| [Released-roster Character facts coverage](CHARACTER_FACTS_COVERAGE.md) | All released identities, per-layer coverage, source blockers and implemented-versus-source distinctions. |
| [Raw Character sign-off gaps](CHARACTER_RAW_VERIFICATION_GAPS.md) | Why populated data can still be `PARTIALLY_VERIFIED`; selective pilot and provenance work needed before promotion. |
| [Hsin facts](CHARACTER_HSIN_FACTS_EVIDENCE.md) | Candidate stats and kit data; Level-90 presentation, Max Energy, complete Lv1–Lv10 curves and kit promotion remain pending. |
| [Jingran facts](CHARACTER_JINGRAN_FACTS_EVIDENCE.md) | Candidate kit and Lv90 stats; ATK presentation, raw/effective DEF, Max Energy and full source curves remain pending. |
| [Character Max Energy](CHARACTER_MAX_ENERGY_EVIDENCE.md) | Qingxiao, Rover (Electro), Suisui: cap/source-field conflicts, no approved canonical values. |
| [Mornye Healing Bonus](MORNYE_HEALING_BONUS_EVIDENCE.md) | Original-game-tree evidence for fully unlocked +12%; reconciliation of the older intrinsic +10% requires a separate tested source/data change. |
| [Danjin Ruby Blossom](DANJIN_RUBY_BLOSSOM_EVIDENCE.md) | Multilingual evidence supports 120 as a candidate threshold; source blocker remains open without the required further verification. |
| [Xiangli Yao Pivot - Impale](XIANGLI_YAO_PIVOT_IMPALE_EVIDENCE.md) | Damage-bonus class remains `PENDING`, even though source-backed coefficients exist. |

## Character equipment and recommendations — **not universal BiS facts**

| Evidence | Scope and implementation boundary |
| --- | --- |
| [Released-roster build/context coverage](CHARACTER_BUILD_DATA_COVERAGE.md) | Which source-reviewed roles, teams, weapon references, sets and stat priorities exist; no global optimality or executable DPS implied. |
| [Augusta contextual builds](CHARACTER_AUGUSTA_BIS_EVIDENCE.md) | Guide and DPR recommendations and differing benchmarks; preserve exact team, weapon-rank, rotation and source contexts. |
| [Cartethyia contextual builds](CHARACTER_CARTETHYIA_BIS_EVIDENCE.md) | Erosion, equipment, stat and team alternatives; distinct comparison baselines cannot be merged into one ranking. |
| [Character–Equipment associations](CHARACTER_EQUIPMENT_ASSOCIATIONS.md) | Mechanically Character-restricted effects, official thematic associations, guide signature claims, co-release and contextual recommendations are different kinds of relation. |

**Game facts:** source-scoped identity, stats, text, effects, actual restrictions and rules. **Recommendations:** what a source proposes for an explicit Character/build/team/gear context. **Bellibing evaluation:** a separate, tested calculation based on the player's current inventory, team and real executable mechanics. None of the evidence files creates new raw facts, effect models, recommendations, gameplay transactions or UI functionality by itself.

## Consolidation provenance and next gates

This index gathers the **unaltered** Markdown research files originally proposed in worker Draft PRs [#252–#265](https://github.com/bellebing/Bellibing-simulator/pulls?q=is%3Apr+is%3Aopen+252..265). The original PRs remain separate historical/review references; a consolidated documentation PR does not implicitly approve their claims, merge those PRs, or authorize code changes. The independent Buling study in [PR #251](https://github.com/bellebing/Bellibing-simulator/pull/251) is **not included** in this batch and remains a separate review candidate.

Future changes to canonical raw values, effects, profiles, simulator economics or UI must use the **existing owning modules**, their source/impact audits, appropriate focused tests and the required merge verification. Close a blocker only on evidence meeting its actual exit criteria. Do not infer `DPS_READY`, `VERIFIED` source promotion or fixed UI bugs from this evidence collection.
