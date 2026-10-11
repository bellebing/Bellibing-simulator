# Augusta — Character BiS evidence (research only)

**Snapshot:** 2026-10-11. **Repository base:** [main at 102b66ed](https://github.com/bellebing/Bellibing-simulator/commit/102b66edec165f3d2a313a562de4049a26424924). **Scope:** Augusta build recommendations, NOT a gameplay/data/profile/UI change.

**Decision:** Augusta S0 Electro Broadblade main DPS has a strong, already-reviewed standard baseline: **3-piece Crown of Valor + 2-piece Void Thunder**, **The False Sovereign**, **4/3/3/1/1**, **Thunderflare Dominion R1**, with **Energy Regen conditioned on team and rotation**. "BiS" here is a *published recommendation for a stated context*, not an unconditional simulator-scored optimum. The 2026-10-05 Prydwen guide differs from some older embedded percentages; this document records, rather than silently migrates, that drift.

## Status and promotion contract

| Status | Meaning here |
| --- | --- |
| **VERIFIED — CANONICAL** | Existing, independently reviewed Bellibing source/model fact on current main; reuse unchanged. Verification is scoped to the precise fact/domain, not DPS uptime or universal ranking. |
| **VERIFIED — SOURCE EVIDENCE** | Exact, identifiable fact directly read from a named current guide/approved native DPR sheet during this investigation. Useful for review and future source candidates, **not** a new canonical approval. |
| **PENDING** | Missing identity, conditions, benchmark parity, specialized adapter, manual review, or evidence; cannot be represented as executable or global recommendation. |
| **CONFLICT** | Different source snapshots, contexts, orderings or incompatible presentations requiring explicit reconciliation. Not a license to average values. |

The standing review gates in [data verification policy](../DATA_VERIFICATION_POLICY.md), [Augusta source review](../CHARACTER_RECOMMENDATIONS_AUGUSTA_REVIEW.md), [DPR review](../CHARACTER_RECOMMENDATIONS_DPR_REVIEW.md) and [Echo/Sonata coverage](../ECHO_SONATA_EFFECT_COVERAGE.md) still apply. Prydwen/Game8 guide statements do not automatically become canonical recommendation rows. DPR's approved benchmark *references* are not minima, preferred targets, hard caps or executable damage.

## Sources and provenance

| Key | Source; specific locator | Date / trust boundary |
| --- | --- | --- |
| **C-BUILD** | [src/data/characterBuildPresets.ts](../../src/data/characterBuildPresets.ts), Augusta standard | VERIFIED — CANONICAL pointers to S0 standard, Iuno/Shorekeeper, linked profiles; not proof of all team execution. |
| **C-ECHO** | [src/data/echoLoadoutProfiles.ts](../../src/data/echoLoadoutProfiles.ts), augusta-standard-echoes | VERIFIED — CANONICAL five slot costs/main-stat defaults, canonical set and main Echo identities. |
| **C-WEAPON** | [src/data/weaponRecommendations.ts](../../src/data/weaponRecommendations.ts), augusta-standard-weapons | VERIFIED — CANONICAL *stored historic reviewed profile* and ranks, originally checked 2026-08-23; percentages are context/version-bound and must be re-reviewed against changed Prydwen. |
| **C-STAT** | [src/data/statTargetProfiles.ts](../../src/data/statTargetProfiles.ts), augusta-recommended-targets-v915-current | VERIFIED — CANONICAL priority and legacy 1.16/1.25 gate in its existing consumer only; not the newer dedicated Prydwen recommendation semantics. |
| **C-RAW** | [src/data/characters.ts](../../src/data/characters.ts), [src/data/weapons.ts](../../src/data/weapons.ts), [src/data/echoes.ts](../../src/data/echoes.ts), [src/data/sonatas.ts](../../src/data/sonatas.ts) | VERIFIED — CANONICAL raw identities, types, cost and membership as delimited by audits; raw catalog item flags/activation alone do not prove modeled effects or uptime. |
| **C-TARGET** | [docs/CHARACTER_RECOMMENDATIONS_AUGUSTA_REVIEW.md](../CHARACTER_RECOMMENDATIONS_AUGUSTA_REVIEW.md); reviewed Prydwen capture | VERIFIED — CANONICAL **7/7** Level 90 S0 total-stat recommendation rows, 2026-10-03 review of externally supplied Patch 3.6 / 2026-09-10 source capture. Reviewed SHA-256 source binding: d0fbfd02fa424cfe553c44e61655a34dc17433e88a8eada428bbda8eea135ea4. |
| **C-DPR** | [docs/CHARACTER_RECOMMENDATIONS_DPR_REVIEW.md](../CHARACTER_RECOMMENDATIONS_DPR_REVIEW.md); [native DPR Calc Results, Augusta tab](https://docs.google.com/spreadsheets/d/1eoCTrwYIsRpacvL3KrcQpR5rwY3pbJ6gEljZdBj_DHs/edit#gid=1282888305) | USER_APPROVED_PROJECT_SOURCE. VERIFIED — CANONICAL 5 GENERAL_RECOMMENDATION + 5 CALC_BENCHMARK DEFAULT **reference values**, V1 semantic SHA d3ca38885f16cadf82aa86ea5e48318e205dd9f3a42e4e1037a8c341fdcb0a8d. Additional native set/weapon/team comparison rows inspected here are **SOURCE EVIDENCE** only, not a new globally reviewed ranking. Native sheet cell ranges given below; externally imported upstream formula is not reverse-engineered. |
| **P-NEW** | [Prydwen — Augusta Build](https://www.prydwen.gg/wuthering-waves/characters/augusta), Build / Best Weapons / Best Echo Sets / Best Echo Stats / Gameplay | Read 2026-10-11. Profile **updated 2026-10-05**, review and major build/calcs **Patch 3.6**; newer page than the prior captured 2026-09-10 review. Exact page URL, section and capture date are evidence; no repository research pin or approval was changed. |
| **G8** | [Game8 — Augusta Best Builds and Teams](https://game8.co/games/Wuthering-Waves/archives/524890), Build Guide / Echo Sets / Weapons / Teams | Published revision **2026-04-06**; dated older cross-check / alternatives, NOT a newer numeric authority than Prydwen. |
| **H** | [Bellibing Echo Tool — AI Handoff](https://docs.google.com/spreadsheets/d/12xvC-hItxLBBJNgO_xoBcm-K1bAarzz4Udfc5_uFj4k/edit), Mål & Handoff / Buggar | Read current connected native workbook 2026-10-11. Supports source ownership, reuse-first, BUG-042 as KNOWN GAP; not an alternative numerical build oracle. |
| **LEGACY** | Old V9.15 spreadsheet named in the canonical profiles | Historical parity/reference only; this investigation does not re-promote its layout as today's architecture. |

## 1. Existing VERIFIED canonical Augusta baseline

| Dimension | Exact retained canonical fact | Meaning / caveat |
| --- | --- | --- |
| Character/variant | augusta; S0; modeKey standard; Electro, Broadblade | Character preset links the reviewed equipment/stat/team/rotation profiles. Does not cover all sequences/teams. [C-BUILD, C-RAW] |
| Set | **3P Crown of Valor** (sonata-20) + **2P Void Thunder** (sonata-3) | Exactly three + two Echo pieces, not both full 5-piece sets. Raw Crown of Valor activates at 3P; Void Thunder 2P gives +10% Electro DMG. [C-ECHO, C-RAW] |
| Main Echo | **The False Sovereign**, echo-60001215, COST 4, Crown of Valor membership | The main Echo is explicitly identified; its passive/active/summon effects are separately conditional. [C-ECHO, C-RAW] |
| Five COST slots | **4 / 3 / 3 / 1 / 1** | Total Echo cost 12; cost layout verified as a recommended loadout, not a requirement that every other build is invalid. [C-ECHO] |
| Main stats | **CRIT Rate / Electro DMG / Electro DMG / ATK% / ATK%** | Current canonical standard preference, *one exact shell*. Alternate CRIT DMG 4-cost and ATK% 3-cost are published by Prydwen but not contained in this five-slot canonical profile. [C-ECHO] |
| Substats | **ER until requirement met > CRIT Rate = CRIT DMG > ATK% = Heavy Attack DMG** | Existing reviewed stat priorities only; they do not define marginal optimizer weights, minimum Echo rolls or discard thresholds. [C-STAT] |
| ER in legacy stat target | minimum 116%, preferred 125% | **Legacy gate contract only**; newer dedicated recommendation treats 116%–125% as bounded source recommendation endpoints, not automatically as minimum+preferred for every team. [C-STAT, C-TARGET] |
| Weapon default | **Thunderflare Dominion R1** (thunderflare-dominion) | Existing ranked list has 12 alternatives at explicitly distinct R1/R5 ranks. Historic stored relativePerformance values remain in code, unchanged. [C-WEAPON] |
| Team / rotation | Augusta + Iuno (sub DPS) + The Shorekeeper (support); augusta-standard-iuno-shorekeeper | Existing personal Augusta rotation engine model is the historical V9.15 parity context (11.17 s), not a complete, current team-DPS or every-Prydwen-rotation proof. [C-BUILD, src/data/teamProfiles.ts, src/data/rotationProfiles.ts] |

**Crown of Valor trigger:** reviewed raw/effect source describes applying a shield to the equipped Resonator; each proc supplies +6% ATK and +4% CRIT DMG for 4 s, maximum 5 stacks, proc interval 0.5 s. A possible fully stacked +30% ATK/+20% CRIT DMG is a **conditional stack maximum**, not unconditional equipped stats. Prydwen relates the shield supply to Augusta's kit; combat chronology, stack uptime and refresh must be supplied/verified by the execution layer. Do not embed constant 100% uptime in an Echo recommendation.

**The False Sovereign:** Prydwen gives a main-slot passive +12% Electro and +12% Heavy Attack DMG, an Intro-linked auto-summon and an optional transform cast. These are separate owner/event paths; source-reviewed Echo execution coverage is not a guarantee that every component fires in a specific supported rotation. The canonical main-Echo identity is already VERIFIED; the newly re-read guide description is **VERIFIED — SOURCE EVIDENCE** for conditions only. A user with only Tempest Mephis cannot be silently treated as equipped with The False Sovereign.

## 2. New or independently reconfirmed source evidence — sets, Echoes and slots

| Candidate | Status | Exact source/context and simulator implication |
| --- | --- | --- |
| **3P Crown of Valor + 2P Void Thunder**, The False Sovereign | **VERIFIED — CANONICAL**, corroborated by **P-NEW**, **G8**, **C-DPR** | Strong S0 general default; native DPR Augusta set-comparison baseline with Iuno S0 and Shorekeeper S0R1 is 100.00% (1,201,850.29, set comparison rows A27:C34). |
| **3P Crown of Valor + 2P Lingering Tunes**, same main Echo | **VERIFIED — SOURCE EVIDENCE**, promotion **PENDING** | G8 explicitly calls second-best. Native DPR same standard 43311 ELE/ELE comparison: **99.26%**, 1,192,996.25 vs CoV+Void Thunder 100.00%, exact worksheet comparison; not a general ~0.74% universal loss. Raw Lingering Tunes 2P +10% ATK (sonata-9) is already cataloged. |
| **3P Crown of Valor + other 2P** (Endless Resonance, Reel of Spliced Memories, Moonlit Clouds, Empyrean Anthem, Tidebreaking Courage) | **VERIFIED — SOURCE EVIDENCE** that P-NEW lists them; **PENDING** rank, full Echo membership checks and activation-compatibility comparison | Guide lists permissible choices without a complete equal-context Augusta ranking. Do not fill in relativePerformance, 3-cost allocation or damage values. |
| **5P Void Thunder** + **Tempest Mephis** (ordinary, echo-60000395) | **VERIFIED — SOURCE EVIDENCE**, promotion **PENDING** | G8 offers accessible early-game/budget third option; native DPR's VT 43311 comparison **90.05%** relative to CoV+2P VT in the stated Iuno/SK set test. **Nightmare: Tempest Mephis** is a distinct Echo with Skill-based focus; not a replacement alias. Game8 says Tempest Mephis claw must hit for its buffs and activation may cost DPS. This is not the present default. |
| **3P Crown of Valor + 2P Void Thunder, 4/4/1/1/1 CR/CD** | **VERIFIED — SOURCE EVIDENCE**, conversion **PENDING** | Native DPR source comparison: **91.31%** in the S0R1 set matrix; footnote says 44111 is poor for S2/S3 and advises stat diversification. Cannot project this S0 reference onto all sequences. |
| **3P Crown of Valor, 4/3/3/1/1 ATK/Electro** | **VERIFIED — SOURCE EVIDENCE**, option **PENDING** | Native DPR set matrix gives **96.89%** vs ELE/ELE 100.00% at its controlled setup; Prydwen permits second 3-cost **Electro > ATK%**. DPS delta changes with weapon, total bonuses, rolls and team. |
| **4-cost CRIT Rate OR CRIT DMG** | **VERIFIED — SOURCE EVIDENCE** on P-NEW and G8, canonical profile still CRIT Rate | CRIT DMG is a situational main-stat candidate. Choice must account for actual CRIT balance, weapon and sequence; no always-best CRIT main stat. |
| **1-cost pair ATK%/ATK%** | **VERIFIED — CANONICAL**, corroborated by P-NEW/G8 | Other stat shells require separate evidence; no evidence for replacing either 1-cost on the current standard. |
| Remaining four Echo *species* for a fixed 3P/2P loadout | **PENDING** | Sources and canonical loadout specify Sonata *membership*, cost, main Echo and stat shell, **not** one uniquely best named species per additional slot. Filter the existing 181-Echo canonical catalog for valid membership/cost and available main stat; do not fabricate a species tier list. |

The above DPR numbers come from the **Augusta** native sheet, **“Augusta S0R1 Set Comparison with Iuno S0, SK S0R1”** (A25:C34, with notes immediately below). They are a controlled, published *source comparison*, not preflight-verified runtime DPS and not interchangeable with the Prydwen weapon-comparison denominator. The same sheet remarks that one additional high ATK% roll may offset the “no 2pc” case (95.82%); it does not imply that replacing 2P bonuses is optimal in every roll distribution.

## 3. Substats, total targets and Energy Regen

**New 2026-10-05 Prydwen exact ordered source priority (VERIFIED — SOURCE EVIDENCE):**

**Energy Regen (until satisfied) > CRIT Rate = CRIT DMG > ATK% = Heavy Attack DMG% > flat ATK > Resonance Skill DMG%.** The first four groups agree with the existing C-STAT precedence. Flat ATK and Skill DMG are *new source-visible lower tiers*, not yet a reviewed change to the existing default profile. G8 places CRIT Rate/CD first and ER fifth in a bare ranking without the same conditional wording: **CONFLICT / CONTEXT-UNSPECIFIED** if used as a strict universal order. Preserve Prydwen's explicit “until satisfied” condition rather than assigning permanent top ER marginal priority after the needed rotation works.

### Reuse the 7 existing Prydwen VERIFIED S0 Level-90 total-stat recommendations

Source display convention: **active in party, out of combat, in-game stat screen**; weapon unspecified; unknown conditions stay unknown. This is NOT equal to substat roll targets.

| Metric | Source wording | Reviewed interpretation | Status |
| --- | --- | --- | --- |
| HP | 14500+ | minimum 14,500 points | **VERIFIED — CANONICAL** |
| DEF | 1100+ | minimum 1,100 points | **VERIFIED — CANONICAL** |
| Total ATK | 2000-2800+ | OPEN_ENDED_BAND minimum 2,000; upperReference 2,800, **not cap** | **VERIFIED — CANONICAL** |
| Total CRIT Rate | 65-80%+ | OPEN_ENDED_BAND 0.65 / 0.80, **not cap** | **VERIFIED — CANONICAL** |
| Total CRIT DMG | 210-260%+ | OPEN_ENDED_BAND 2.10 / 2.60, **not cap** | **VERIFIED — CANONICAL** |
| Total Energy Regen | 116%-125% | BOUNDED_RANGE 1.16–1.25 (recommendation endpoints; not global preferred/hard max) | **VERIFIED — CANONICAL** |
| Electro DMG Bonus | 40-70%+ | OPEN_ENDED_BAND 0.40 / 0.70, **not cap** | **VERIFIED — CANONICAL** |

P-NEW (updated 2026-10-05) still shows the **same seven written recommendations**, independently supporting the existing reviewed content. It does **not** automatically update the older source capture SHA, source timestamps or seven comparisonStatus=PENDING entries.

**Team/rotation ER dependency:** The guide attributes **116%** to **Mortefi + Shorekeeper** and **125%** to **Iuno + Shorekeeper**; both estimates depend on assumed rotations/buffs. A different team, altered field time, weapon-generated energy, quickswap, missed attack or differently timed Echo can change energy sufficiency. P-NEW says **Waning Redshift R5** supplies flat Resonance Energy enough to avoid ER *substats* in the guide's studied setup; this is **conditional** and does not rewrite the dedicated total-ER source wording, nor grant all weapons/teams a free 100% ER policy. Exact energy ledger/rotation validation stays **PENDING** for any new context.

### Separate DPR DEFAULT references (already canonical; no conversion to Prydwen endpoints)

[Native DPR Augusta tab](https://docs.google.com/spreadsheets/d/1eoCTrwYIsRpacvL3KrcQpR5rwY3pbJ6gEljZdBj_DHs/edit#gid=1282888305), **GENERAL_RECOMMENDATION** E4:F8 and **CALC_BENCHMARK** E11:F15:

| Metric | General reference | Calc reference | Status |
| --- | ---: | ---: | --- |
| CRIT Rate | 78.70% | 84.70% | **VERIFIED — CANONICAL source values** |
| CRIT DMG | 213.00% | 225.00% | **VERIFIED — CANONICAL source values** |
| ATK | 2268.668 | 2406.536 | **VERIFIED — CANONICAL source values** |
| Heavy Attack DMG | 21.30% | 29.20% | **VERIFIED — CANONICAL source values** |
| ER | 120.00% | 120.00% | **VERIFIED — CANONICAL source values** |

The **120%** Calc ER is an exact benchmark assumption, **not** proof that 120% passes every Iuno team rotation. DPR Calc also does not become a Prydwen 120%-minimum. DPR “Substat Value” sensitivity columns, weapon/set/team percentages and rDPR are **not** Character total stats and were not imported into these rows.

## 4. Weapons — explicit rank and context

**Already-reviewed canonical option identities/ranks:** Thunderflare Dominion R1 (default), Verdant Summit R1, Ages of Harvest R1, Wildfire Mark R1, Radiance Cleaver R1, Kumokiri R1, Lustrous Razor R1, Aureate Zenith R5, Autumntrace R5, Waning Redshift R5, Helios Cleaver R5, Meditations on Mercy R5. Weapon R1/R5 is **weapon refinement rank**; Augusta character S0/S1/S2 is separate.

**P-NEW weapon numbers are VERIFIED — SOURCE EVIDENCE, NOT migrated to canonical**. Guide uses Augusta with Iuno on **Moongazer's Sigil + Crown of Valor/Sierra Gale + Lady of the Sea** and Shorekeeper on **Stellar Symphony + Rejuvenating Glow + Fallacy of No Return**. All values below normalize **Thunderflare Dominion R1 = 100% in that precise Prydwen team/buff calculation**. The old C-WEAPON column is shown solely to identify drift, NOT as an alternative simultaneous truth.

| Weapon | Rank | Existing stored C-WEAPON | Prydwen 2026-10-05 page | Result |
| --- | --- | ---: | ---: | --- |
| Thunderflare Dominion | R1 | 100.0% | **100.0%** | **VERIFIED default**, context unchanged at top |
| Verdant Summit | R1 | 90.3% | **93.6%** | **CONFLICT — numeric source drift** |
| Ages of Harvest | R1 | 80.4% | **82.0%** | **CONFLICT — numeric source drift** |
| Wildfire Mark | R1 | 77.3% | **78.5%** | **CONFLICT — numeric source drift** |
| Radiance Cleaver | R1 | 77.3% | **78.5%** | **CONFLICT — numeric source drift** |
| Kumokiri | R1 | 77.2% | **78.3%** | **CONFLICT — numeric source drift** |
| Lustrous Razor | R1 | 74.3% | **74.8%** | **CONFLICT — changed ordering with Aureate** |
| Aureate Zenith | R5 | 73.2% | **75.4%** | **CONFLICT — now above Lustrous Razor** |
| Autumntrace | R5 | 71.0% | **70.9%** | **CONFLICT — minor source drift** |
| Waning Redshift | R5 | 66.5% | **66.9%** | **CONFLICT — numeric source drift** |
| Helios Cleaver | R5 | 63.9% | **63.9%** | **VERIFIED source agreement for numeric value** |
| Meditations on Mercy | R5 | 60.7% | **61.3%** | **CONFLICT — numeric source drift** |

**Interpretation:** “best limited alternative” Verdant Summit remains a strong next candidate, Aureate Zenith R5 remains Prydwen's best four-star, and Thunderflare R1 stays the best Prydwen published DPS reference in this setup. Neither the Oct-2026 page ordering nor the old percentages are an unconditional Bellibing simulator ranking for a user's actual rolls, targets or other teams. Keep old canonical rows unchanged until explicit source refresh, source binding, context comparison and backward-impact review.

**Independent DPR cross-check, different baseline:** Native DPR Augusta weapon table (A16:C23), label **“Augusta S0 Weapon Comparison S0 with Iuno S0, SK S0R1”**, has **Lustrous Razor = 100.00%** as its *own* reference (not signature). Signature 1,201,850.29 / **135.21%**; Verdant Summit 1,118,880.49 / **125.87%**; Ages of Harvest 994,878.59 / **111.92%**; Aureate Zenith R5 894,195.40 / **100.60%**; Lustrous Razor 888,888.61 / **100.00%**; Autumntrace R5 881,155.85 / **99.13%**. These are **VERIFIED — SOURCE EVIDENCE** of the sheet's reported comparison cells, not new canonical percentages; same-team/normalization assumptions must be reviewed before any cross-provider reconciliation. Do **not** claim 135.21% signature vs itself or merge DPR numerators with Prydwen's ratios.

Game8 independently lists **Guardian Broadblade (3-star)** as an accessible low-end F2P option. That is **VERIFIED — SOURCE EVIDENCE**, but no reviewed exact-rank/equal-build Augusta comparison is available here; **PENDING** inclusion and performance, not an automatic 13th numeric canonical option.

## 5. Team, sequence and rotation variants — context changes the winner

| Scenario | Evidence | Safe implication |
| --- | --- | --- |
| Augusta **S0R1**, Iuno **S0**, Shorekeeper **S0R1** | Native DPR personal weapon/set comparison; existing Bellibing standard team pointer | **VERIFIED** comparator identity. Its weapon and set percentages are context-bound, not generic team-DPS readiness. |
| Same general support shell, **Iuno Moonlit Clouds vs Iuno Crown of Valor** | Native DPR team-damage setup rows around A42:F60, **25–28s looping rotation**: **1,839,878.44** (Moonlit Iuno S0R1, SK S0R1) vs **1,829,351.32** (Crown Iuno S0R1, SK S0R1); values are total team setup outputs | **VERIFIED — SOURCE EVIDENCE** that very similar team totals can hide materially different damage distribution. Source footnote: Moonlit Heron dash-cancel may lower energy generation and be awkward. Do not change **Augusta's** 3P Crown baseline because **Iuno** can wear a different set. |
| Augusta with **Mortefi + Shorekeeper** | Prydwen lower ER endpoint **116%**; DPR setup used as 100% team-comparison reference | **VERIFIED source context**, but alternative teammate field time/sequence/ranks differ; no universal comparison to Iuno except specifically listed native sheet configurations. |
| Augusta with Iuno + Shorekeeper | Prydwen higher ER endpoint **125%**; most teams use **3 Forte** rotation | **VERIFIED source context**; the previous Bellibing 11.17 s Augusta personal fixture is not proof that all these source events are now fully simulated. |
| **Fast 2-Forte**, usual **3-Forte**, extended **4-Forte** or double-Intro/quickswap | Prydwen Gameplay and teams / Rotation sections | **VERIFIED — SOURCE EVIDENCE** of alternative sequence layouts; **PENDING** executable schedules/ER and apples-to-apples ranked DPS. Echo transform casts can be skipped or depend on swaps. |
| Augusta **S2/S3** | DPR 44111 footnote and separate sequence-comparison rows; Prydwen kit S2 explicitly adds CRIT Rate and overshoot conversion semantics | **PENDING** per-sequence BiS/crit balance and marginal valuation. Do not reuse S0's ideal CRIT ratio or one set comparison as an S2/S3 claim; the user-facing product currently focuses S0–S2. |
| Alternative teammates / weapon choices / target resistances | Game8 lists Mortefi, Yinlin, Lynae, Phrolova etc.; Prydwen team list is patch-current | **PENDING** exact team comparison until matching Character/weapon/sequence/rotation/target conditions are captured and simulator has sufficient executable coverage. |

## 6. Conflict and missing-evidence register

| ID | Status | Issue and next review step |
| --- | --- | --- |
| AUG-BIS-01 | **CONFLICT** | Old canonical weapon-performance fractions from 2026-08-23 vs Prydwen profile updated 2026-10-05 differ in 10 of 12 shown values; importantly **Aureate Zenith R5 overtakes Lustrous Razor R1**. Capture and manually review the new Prydwen comparison setup/revision before a **separate** canonical change. |
| AUG-BIS-02 | **CONFLICT / CONTEXT** | Game8 (Apr 2026) bare substat ranking places ER after crit/attack, Prydwen (Oct 2026) ranks **ER until satisfied first**. Clarify energy sufficiency with supported weapon/team/rotation; no unconditional transitive numeric priority. |
| AUG-BIS-03 | **PENDING** | No source-backed numeric comparison for all Prydwen-listed alternate 2P sets, all viable Echo species, 4 CR vs CD conditioned on true build, and varied equipment roll distributions. |
| AUG-BIS-04 | **PENDING** | Whether every weapon is correctly rank-normalized in independent DPR/Prydwen contexts. DPR uses Lustrous as 100% and differs in team/rotation details; provenance records must preserve the denominator. |
| AUG-BIS-05 | **PENDING** | Independent, rotation-executable **ER sufficiency** across S0/S1/S2, Iuno/other teams, variations in weapon and quickswap. 116–125% is a reviewed recommended band; no universal hard gate or guarantee of no ER rolls with Waning Redshift. |
| AUG-BIS-06 | **PENDING** | Exact per-rotation shield application, Crown of Valor stacks/expiration, The False Sovereign optional active cast and Intro damage, target states and uptime. Echo/sonata raw/effect coverage does not prove all needed event execution. |
| AUG-BIS-07 | **PENDING** | 4/4/1/1/1 and S2/S3 alternatives require separate sequencing and same-context marginal comparisons; current DPR warning is not a blanket prohibition for every hypothetical build. |
| AUG-BIS-08 | **PENDING** | Roster-wide BUG-042 reviewed Echo requirements/preferences remains open. This Augusta research **does not** satisfy it, authorize auto-default policy migration, fix evaluator readiness or change combat support. |

**No confirmed game-mechanics contradiction** was resolved by averaging sources. Weapon percentage drift is **temporal/context provenance conflict**, while set and Echo alternatives are legitimate *different context* candidates. Missing data remains missing, never interpreted as zero.

## 7. Simulator reuse / future integration boundary

| Data to consume later | Readiness / owner | Do not do yet |
| --- | --- | --- |
| Augusta DEFAULT equipment shell, canonical set/main Echo IDs and 4/3/3/1/1 default | **VERIFIED — CANONICAL** in Echo loadout profile; safe to display as an existing, source-backed recommendation | Do not hardcode Augusta in Echo Core or force it on user builds. |
| Augusta S0 Prydwen stat bands and ER conditions | **VERIFIED — CANONICAL** dedicated Character recommendation projection; source reviewed 7/7 | Do not convert open-ended upper references into caps or 116–125 into universal minimum/preferred/stop rules. |
| DPR DEFAULT exact General and Calc reference rows | **VERIFIED — CANONICAL** independent family; existing visible Calc is already sourced from its explicit DEFAULT Calc rows | Do not blend General, Calc and Prydwen into a single fabricated optimum; never promote “Substat Value” sensitivity into total Character stats. |
| Weapon identities/refinement ranks and current stored historical relativePerformance | **VERIFIED — CANONICAL**, but **CONFLICT** with Oct-2026 guide snapshots | Do not silently re-rank in UI or economic/evaluator models. Schedule separate review if adopted. |
| Alternate Main Stats, set combinations, budget weapon/Tempest Mephis, lower-tier substats | **VERIFIED — SOURCE EVIDENCE**, **PENDING** manual promotion and per-consumer schema/provenance binding | No direct runtime/profiles import from this Markdown; no unsupported Echo species or unproven stat weights. |
| DPR published set/weapon/team comparison rows | **VERIFIED — SOURCE EVIDENCE**, **PENDING** review for quantified simulator-consumable context | Do not ingest damage percentages without denominators, team, ranks, source versions and execution assumptions. |
| Real build-dependent BiS, ER, DPS / candidate ranking | **PENDING** exact supported inputs, snapshot, relevant effect semantics, effect/attack/rotation execution, parity and backward-impact gates | Do not declare Character DPS ready, set mandatory substats or compute proprietary evaluator decisions from a public guide. |

**Changes in this PR:** this research document only. The existing canonical Character/Weapon/Echo/Sonata/Profile data, private evaluator, other branches/PRs and Handoff are deliberately unchanged. Per [Development Process v2](../DEVELOPMENT_PROCESS.md), **FAST docs-only** verification is file/diff/link/whitespace/content-provenance review, not the full MERGE Verify/Export/browser suite. A later actual source-data promotion would require source-semantic review, deterministic audits, relevant consumers and backward-impact checks.
