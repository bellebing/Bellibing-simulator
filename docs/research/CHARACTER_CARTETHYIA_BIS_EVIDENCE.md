# Cartethyia — Character BiS build evidence (Worker 5)

**Review date:** 2026-10-11  
**Scope:** source-backed research only; NO implementation, recommendation-row promotion, private-engine change, or merge.  
**Repository baseline:** `main` commit `102b66edec165f3d2a313a562de4049a26424924`.  
**Canonical identity:** `cartethyia`, existing default preset `cartethyia-aero-erosion`, S0. S1/S2 are explicitly separate contexts.

## Evidence status and trust boundary

- **VERIFIED** = an exact statement checked in an already source-reviewed Bellibing record, an approved DPR native cell, or a directly observed published guide with its source/date/context attached. For fresh external guide facts, VERIFIED means *source evidence*, **not** Bellibing canonical-source promotion, combat execution, guaranteed uptime, or a new public Recommended Echo policy.
- **PENDING** = unknown comparison, conditional mechanic, execution requirement, unresolved source semantics, or promotion/review still necessary.
- **CONFLICT** = two evidence records have incompatible context/assumptions or an older internal note contradicts the current implementation. This is not automatically a numeric Wuthering Waves source conflict.
- One fact, one owner: refer to the existing source-owned Character, Weapon, Echo/Sonata, recommendations, profiles and DPR records instead of copying or modifying numeric truth. Never use DPR `CALC_BENCHMARK` as a universal stat target; never turn build priorities into mandatory per-Echo requirements.

### Sources reviewed

| Key | Provenance and scope |
| --- | --- |
| **B1 (canonical composition)** | [`characterBuildPresets.ts`](../../src/data/characterBuildPresets.ts), [`echoLoadoutProfiles.ts`](../../src/data/echoLoadoutProfiles.ts), [`statTargetProfiles.ts`](../../src/data/statTargetProfiles.ts), [`weaponRecommendations.ts`](../../src/data/weaponRecommendations.ts), [`teamProfiles.ts`](../../src/data/teamProfiles.ts), [`rotationProfiles.ts`](../../src/data/rotationProfiles.ts), main baseline above; records primarily checked 2026-08-29. |
| **B2 (canonical effects)** | [`sonataEffects.ts`](../../src/data/sonataEffects.ts), [`echoMainSlotEffects.ts`](../../src/data/echoMainSlotEffects.ts), [`echoCharacterRestrictedEffects.ts`](../../src/data/echoCharacterRestrictedEffects.ts), [`echoAttacks.ts`](../../src/data/echoAttacks.ts), [`weaponEffectsSword.ts`](../../src/data/weaponEffectsSword.ts), [`weapons.ts`](../../src/data/weapons.ts), [`cartethyiaRawFacts.ts`](../../src/data/characterMechanics/cartethyiaRawFacts.ts). Original structured Echo/Character review pins are recorded in those files. |
| **DPR (approved native project source)** | [DPR Calc Results](https://docs.google.com/spreadsheets/d/1eoCTrwYIsRpacvL3KrcQpR5rwY3pbJ6gEljZdBj_DHs/edit), tabs **`Cartethiya`** (native `A1:O75` reviewed live 2026-10-11) and **`Carte Rotation Guide`** (`A1:J55` reviewed live 2026-10-11). The first tab's spelling is a source alias, not a second Character. Approved `USER_APPROVED_PROJECT_SOURCE`, pinned modern semantic V1 digest `d3ca38885f16cadf82aa86ea5e48318e205dd9f3a42e4e1037a8c341fdcb0a8d`. See [DPR source review](../CHARACTER_RECOMMENDATIONS_DPR_REVIEW.md). |
| **P1 (current published guide)** | [Prydwen — Cartethyia](https://www.prydwen.gg/wuthering-waves/characters/cartethyia), viewed 2026-10-11; page states **last updated 2026-10-05**, patch 3.6. The current weapon calculation example uses **Ciaccona + Chisa**, unlike B1's older Ciaccona + Rover (Aero) context. Published guide evidence is not a canonical source update by itself. |
| **P2 (historical corroboration)** | [Game8 — Cartethyia builds](https://game8.co/games/Wuthering-Waves/archives/526299) and Bellibing's reviewed 2026-08-29 Prydwen profile source notes. Treat publication-time and team differences explicitly. |
| **Contracts** | [Development Process](../DEVELOPMENT_PROCESS.md), [Data Verification Policy](../DATA_VERIFICATION_POLICY.md), [Echo/Sonata effect coverage](../ECHO_SONATA_EFFECT_COVERAGE.md), [Project Status](../PROJECT_STATUS.md); connected **Bellibing Echo Tool — AI Handoff**, `Mål & Handoff` and `Buggar` inspected 2026-10-11. |

## Existing VERIFIED build — reuse, do not reimplement

**Existing composition** (`B1`; all IDs are already owned by canonical profiles):

| Layer | Existing ID / meaning | Evidence disposition |
| --- | --- | --- |
| Preset | `cartethyia-aero-erosion`: S0, mode `aero-erosion`, current default | VERIFIED existing composition; pointer validity does not certify executable DPS. |
| Weapon | `cartethyia-aero-erosion-weapons` → `defiers-thorn` R1 source/reference | VERIFIED existing signature selection; alternatives *not* yet in this canonical recommendation profile. |
| Sonata + Echo | `cartethyia-windward-fleurdelys` → 5pc **Windward Pilgrimage** (`sonata-17`), main **Reminiscence: Fleurdelys** (`echo-60001065`) | VERIFIED current preset and published preferred combination. |
| Main stats | 4-cost **CRIT Rate**; 4-cost **CRIT DMG**; three 1-cost **HP%**, i.e. **4/4/1/1/1** | VERIFIED recommended **slot shell**, not proof that every fixed CR/CD roll beats alternatives in every user build. |
| Stat guidance | `cartethyia-aero-erosion-build-stats` | VERIFIED source-reviewed priorities + **ER total 110%+** recommendation; not hard Echo min-roll rules. |
| Team | `cartethyia-ciaccona-rover-aero`: Cartethyia / Ciaccona / Rover (Aero) | VERIFIED **one specific older reviewed context**. |
| Rotation | `cartethyia-basic-ciaccona-rover-aero`, `SOURCE_SEQUENCE_ONLY` | VERIFIED transcription only; **PENDING** exact execution timestamps, full event application and DPS. |

**Do not** add a new parallel recommendation table or silently change these IDs. The submitted research differentiates candidate/current alternatives and records promotion conditions.

## Sonata sets, active Echoes and main-stat configurations

### Windward Pilgrimage, 5pc — VERIFIED preferred source build

- **2pc:** `S17_2PC_AERO`: +10% Aero DMG permanently while correctly equipped.
- **5pc:** `S17_5PC_CR`: +10 percentage points CRIT Rate, 10 seconds; `S17_5PC_AERO`: +30 percentage points Aero DMG, 10 seconds. **Trigger:** hit a target *already affected by Aero Erosion*. These are conditional event effects, **not** passive 100% uptime. The source-backed target-state attack-window primitive exists, but individual rotations still must prove target state/hit/time.
- Main **Reminiscence: Fleurdelys**: unconditional main-slot +10% Aero DMG (`ECHO_60001065_AERO_DMG`), **plus** another +10% Aero DMG only for eligible wielder **Cartethyia or Rover (Aero)** (`ECHO_60001065_AERO_DMG_ROVER_CARTETHYIA`). The extra eligibility was reviewed against pinned multilingual/structured Echo data; do not generalize to every Aero character.
- Active Echo `FLEURDELYS_WINDCLEAVER_SUMMON`: **Rank 5**, **20s cooldown**, ATK-scaled Aero hits **27.36% ×8 + 136.80% ×1 = 355.68% ATK motion**. This is an **Echo summon attack**, not a Character HP-scaling action. The Echo's active attack fact is source-reviewed; cast occurrence, target/hits landed and timing remain **PENDING** until proved for each rotation. No reason to equate the Fleurdelys *Character form* with the identically named Echo summon.
- **CONFLICT (stale internal note only):** `echoLoadoutProfiles.ts` still describes the Cartethyia-specific main-Echo +10% as blocked behind a specialized adapter. `echoCharacterRestrictedEffects.ts` now contains the source-reviewed restricted effect and `echo-character-restriction-v1` capability. Prefer the current effect implementation for static applicability; **active-skill execution** still has its own separate timeline requirements. No game-stat numeric conflict established.

### Other Echo/Sonata choices — evidence limits

**PENDING** a like-for-like quantified **Windward vs Gusts of Welkin vs Sierra Gale** Sonata ranking in the *same* S0 team, weapon, Echo stats, Aero Erosion coverage and rotation. P1 says Windward is preferred specifically for its extra 5pc CRIT Rate when Erosion is present; this does **not** authorize assigning other sets a universal relative DPS percentage. No alternate main Echo for **Cartethyia specifically** is promoted; the current P1/B1 preferred active is Fleurdelys. A Ciaccona, Rover or other teammate Echo suggestion must not be relabeled as Cartethyia's own Echo.

**VERIFIED comparative main-stat shells within the narrow DPR `Cartethiya!A24:E34` setup** (all are **Windward Pilgrimage**; same stated **Cartethyia S0R1, Ciaccona S0R1, Aerover S6R5**, `25–28s` loop assumption for adjacent team table; these numbers are *not* multi-Sonata data):

| DPR setup label | Relative Cartethyia damage vs 44111 CR/CD | Interpretation |
| --- | ---: | --- |
| `WP 44111 CR/CD` | **100.00%** | Reference 4/4/1/1/1, CR/CD; aligns with B1/P1 preferred shell. |
| `WP 41111 CR/HP` | **94.31%** | 4/1/1/1/1 alternative shell, **−5.69%** in this source setup only. |
| `WP 43111 HP/ELE` | **94.09%** | Mixed cost and HP/element option, **−5.91%** source-specific. |
| `WP 43311 HP/ELE` | **91.81%** | 4/3/3/1/1 HP/element variant. |
| `WP 43311 ELE/ELE` | **91.77%** | Element/element variant. |
| `WP 43311 HP/HP` | **90.21%** | HP/HP variant. |

The DPR parallel "DMG with Aerosion" column yields different relative ratios (e.g. **94.98%** for 41111 CR/HP), and its note says it includes only Cartethyia's contribution from Discord/Divinity buffs, **not full team Aero Erosion damage**. Do not mix that column with personal-only ratios or call it total team DPS. No standalone 3-cost or 1-cost reroll success threshold is proven here.

## Substat priority, Energy Regen and total-stat context

**VERIFIED P1 and B1 published priority:** **Energy Regen until sufficient > CRIT Rate = CRIT DMG > HP% > Basic Attack DMG% = Liberation DMG% > Flat HP**. Character facts in `cartethyiaRawFacts.ts` explain the HP-centered kit and why skill ownership does not imply Skill DMG classification: e.g. `Sword to Bear Their Names` is source-classified **Basic Attack DMG** although cast as Resonance Skill; much of her normal/Forte/Liberation damage uses HP scaling, while her main Echo active attack scales with ATK. Therefore **ATK% is not a recommended substitute for HP% on Cartethyia** just because the active Echo summon uses ATK.

**VERIFIED P1 endgame guide suggestions:** total **ER 110%+**, **HP 35,000–50,000+**, **CRIT Rate 65–80%+**, **CRIT DMG 240–270%+**, **Aero DMG Bonus 30%+**. These are approximate **S0 good-quality in-party/out-of-combat guide goals**, explicitly *not* universal hard gates or per-Echo minimum rolls. ER depends on energy generation/rotation/team; adding ER beyond a satisfied need has different marginal value.

**VERIFIED DPR native cells, distinct roles and context:** `Cartethiya!G3:H8` **GENERAL_RECOMMENDATION** gives CR **66.50%** (label `44111 CR/CD`), CD **257.00%**, HP **48,422.4**, Basic Attack DMG **1.40%**, ER **109.20%**; `G10:H15` **CALC_BENCHMARK** uses CR **72.50%**, CD **269.00%**, HP **49,406.4**, Basic Attack DMG **17.20%**, ER **109.20%**. Source scenario header describes **Ciaccona S0R1 + Aerover S6R5** and weapon/sequence calculations; benchmarks are not required build thresholds. The **109.20% DPR assumption vs 110%+ P1 recommendation is NOT a game-value contradiction**: one is a specific calc reference, the other a guide target in an updated team context. Preserve both separately under the existing reviewed DPR reference family.

**PENDING:** a proven exact ER breakpoint by S0/S1/S2, teammates, Intro/Liberation counts, incoming support buffs and each playable rotation. In DPR `K26:L39` the "Substat Value" columns are *marginal sensitivity*, **not** complete stat totals or hard required-roll policy. In particular ER's marginal 0.00% in that one modeled calculation is **not** evidence that ER is unnecessary in playable rotations. The existing BUG-042 roster-wide reviewed Echo requirements gap remains OPEN; do not infer hard per-Echo CR/CD/ER roll minima from this study.

## Weapons and meaningful effects

### Canonical signature and conditions — VERIFIED raw, conditional execution separate

**Defier's Thorn R1** is the existing recommended signature (`B1`); source-reviewed Lv90 raw weapon **412 Base ATK, HP% +72.2% secondary**, plus **+12% HP passive** (`DT-HP`). Relevant separate effects:

- `DT-DEF`: R1 **8% DEF ignore**; the **literal source "15 seconds after" Intro/Basic cast** is not temporally disambiguated into a delayed trigger versus duration window. **PENDING model; BUG-011 remains KNOWN GAP.** Do not give it an invented 15-second buff uptime.
- `DT-AERO-AMP`: R1 **20% target DMG Taken Amplification** if target has **≥1 Aero Erosion stack**. VERIFIED conditional source effect, not permanent global amplification; may require target-state proof in the chosen attack window. Never double-count it as some other team's Aero Erosion damage.
- These effects are independent of the Character's `Wind's Indelible Imprint` incoming-damage condition (source says 1–3 stacks: +30% damage taken **from Cartethyia/Fleurdelys**; >3 stacks adds +10% per additional stack up to three). Character facts are source-reviewed but status timing/stack dynamics need their own execution proof.

### Alternatives: two incompatible comparison baselines — keep separate

**P1 fresh published *weapon calculation* snapshot** (viewed 2026-10-11, patch 3.6; **Ciaccona + Woodland Aria + Gusts of Welkin + Nightmare: Kelpie, AND Chisa + Kumokiri + Thread of Severed Fate + Reminiscence: Threnodian - Leviathan**; these are relative modeled results, NOT source-independent damage multipliers):

| Weapon in P1 | Relative source result | Source context warning |
| --- | ---: | --- |
| **Defier's Thorn R1** | **100.00%** | Reference; source best. |
| **Red Spring R1** | **81.40%** | CRIT Rate secondary and Basic Attack passive; trigger/Concerto uptime not assumed. |
| **Blazing Brilliance R1** | **79.50%** | CRIT DMG source alternative; Skill DMG contributes little in this kit. |
| **Feather Edge R5** | **79.10%** | Battle Pass alternative, CRIT Rate/Liberation bonus. |
| **Emerald Sentence R1** | **78.70%** | CRIT Rate stat source, passive limited here. |
| **Emerald of Genesis R1** | **78.60%** | Guide's best permanently available option. |
| **Guardian Sword R5** | **75.80%** | Last-resort HP% Sword. |

**VERIFIED DPR `Cartethiya!A16:E22` *different* S0 comparison:** **Ciaccona S0R1 + Aerover S6R5**, mixed Echo main-stat shells **as explicitly named in each row**, reference **Emerald of Genesis 100.00%**. Signature **133.50%**, Red Spring **106.21%**, Blazing Brilliance **101.88%**, Guardian Sword R5 **89.75%** (relative to Emerald's **100.00%**). DPR "DMG with Aerosion" has its own baseline: signature **128.44%**, Red Spring **105.28%**, Blazing Brilliance **101.59%**, Guardian Sword **91.30%**. These are different weapons, reference baselines, Echo choices and team assumptions; **do not compare P1 81.40% to DPR 106.21% as conflicting estimates of the same experiment**. They are context-bound evidence, not general canonical rankings.

**Red Spring effect detail in B2:** `RS-ATK` R1 +12% ATK passive; `RS-BASIC` +10% Basic Attack DMG per stack, up to three, 14s after qualified Basic Attack damage; `RS-CONCERTO-BASIC` separate +40% Basic Attack DMG for 10s after consuming Concerto, ends on switch-out. These buffs depend on the rotation's events and cannot all be booked as always active. **PENDING** detailed effects/uptime comparison for other alternatives in the canonical **Rover (Aero)** profile; no numeric row or default weapon is added to `weaponRecommendations.ts`.

## Team, sequence and rotation applicability

| Case | Status | Verified evidence / boundary |
| --- | --- | --- |
| **Existing Bellibing default: Cartethyia + Ciaccona + Rover (Aero)** | VERIFIED existing context | `cartethyia-ciaccona-rover-aero`; Ciaccona supplies Erosion off-field; Rover contributes support/Erosion context. Do not silently attach later **Chisa-based** P1 weapon percentages to this team. Cartethyia's team Inherent gives Rover (Aero) **25 Windstrings after Omega Storm** if Rover is on team; source-verified but still event-dependent. |
| **Current P1 comparison: Cartethyia + Ciaccona + Chisa** | VERIFIED P1 source scenario; PENDING Bellibing promotion | P1 guide weapon calculations use **Chisa + signature Kumokiri**. B1 2026-08-29 note already warned Chisa outperforms Rover under a signature dependency. Same-team rank with non-signature Chisa is NOT verified. |
| **DPR S0R1 team loop (25–28s)** | VERIFIED explicit DPR assumptions | `Cartethiya!A38:F48` reports **Ciaccona S0R1 GoW + Chisa S0R1 ToSF = 110.46%** total including Erosion/TB vs **Ciaccona S0R1 GoW + Aerover S6R5 WP = 100.00%**. These are source-stated **S0/R1/S6/R5** loadouts with a fixed loop, not identical to B1 S0 preset or P1 Chisa/Kumokiri equipment; preserving character, sequence, weapon, and rotation matters. |
| **Other DPR teams** | VERIFIED comparisons within sheet only | Rover Rejuvenating Glow/Bell configuration, Suisui, Shorekeeper, Sanhua and mixed groups appear as distinct rows/benchmarks. Distinct support sets, sequence/refinement and loop assumptions must be preserved; none replaces the default automatically. |
| **Existing basic Cartethyia rotation** | VERIFIED source transcription, **PENDING execution** | `cartethyia-basic-ciaccona-rover-aero` is explicitly `SOURCE_SEQUENCE_ONLY`, not an engine-modeled 25–28s fixed timer. Intro → base Basic 2/3/4 → Skill → mid-air → transform → Fleurdelys Skills/Basic chains → Liberation2 → Outro. An Echo use from a generic guide is not an explicit event in this profile by default. |
| **P1 low-Erosion / optimized quickswap / S2** | VERIFIED distinct source variants; PENDING execution/comparison | P1 differentiates **standard** vs **low Aero Erosion** rotation (other teams need to preserve stacks). S1 adds conditional CRIT DMG on Conviction thresholds; S2 changes Aero Erosion stack cap/application and action multipliers. Neither is automatically a different recommendation under S0, and no event/timing/DPS is inferred. |
| **DPR Carte Rotation Guide** | VERIFIED list of *references*, PENDING executable implementation | Native `Carte Rotation Guide!A1:E18` lists God/Advanced Quickswap, single/double plunge, 123, solo plus linked showcases/transcripts; the guide itself warns that Erosion damage is inaccurate. These links do not supply a single reviewed Bellibing executable rotation or permission to mix timings and simulated damage across variants. |

**CONFLICT — source-context drift, not gameplay contradiction:** B1's August source notes pin Ciaccona + Rover (Aero); P1's October calculation table pins Ciaccona + **Chisa with Kumokiri**. Both are valid *records of their different source contexts*. They cannot jointly authorize a new global Best-in-Slot weapon percentage, default team or default rotation. Reconcile with a separately versioned same-team comparison before any later promotion. The older B1 “Ciaccona/Rover recommended team” remains a documented selectable context, not proof it remains the maximum DPS team under all 3.6 assumptions.

## Research closure matrix

| Requested dimension | Disposition | Coverage |
| --- | --- | --- |
| Sonata | **VERIFIED** preferred 5pc Windward and exact 2/5pc facts; **PENDING** direct same-context alternative-set rankings | No alternative percentage promoted. |
| Echo choice/active | **VERIFIED** Fleurdelys main and conditional 2 × +10% main effects plus Rank-5 summon attack; **PENDING** event/time/hits | Old note about restricted static bonus is **CONFLICT/stale**, modern static applicability modeled. |
| Main stats by cost | **VERIFIED** 4 CR / 4 CD / 1 HP% ×3 and DPR shell alternatives | 6 DPR tested shells, **same Windward set and single source context** only. |
| Substats | **VERIFIED** source priority and HP-scaling rationale | Per-Echo hard roll/hit minima **PENDING**, BUG-042 unaffected. |
| Energy Regen | **VERIFIED** P1 110%+ recommendation and DPR 109.20% benchmark **in distinct roles** | Exact team/rotation/sequence-dependent breakpoint **PENDING**. |
| Weapons | **VERIFIED** signature and candidate alternatives with **separate P1 vs DPR contexts** | Alternative uptime and canonical same-context ranking **PENDING**. |
| Character / weapon effects | **VERIFIED** source-owned facts and conditions; **PENDING** full timing/target-state application | `DT-DEF` timing/BUG-011 **PENDING**; no new effect model. |
| Teams / rotations | **VERIFIED** existing B1 base and external/DPR variant labels; **PENDING** direct comparable executable DPS | Current Chisa vs old Rover source-context **CONFLICT** for naive extrapolation. |

### Follow-up before any canonical promotion

1. Review source drift and exact applicability for **B1 vs P1** in a single explicitly selected team/sequence/refinement/rotation. Check current released character/weapon data against canonical facts; do not rerank by mixing source baselines.
2. For an alternative Sonata, active Echo, or weapon: choose an actual same-context quantitative comparison or leave **PENDING**. Do not treat the current source's generic alternatives as proven universal best.
3. Resolve **BUG-011** timing only from unambiguous new evidence. Do not infer target status, Echo event, S1/S2 uptime, eroded target continuity, skill damage bucket or action timestamps from the build selection.
4. Keep **BUG-042** and per-Echo hard requirements pending; explicit source priorities are not the same as reviewed Roll Assistant hard constraints. Validate any later promotion with extraction/source pins, impact/preflight, focused deterministic checks and relevant build/CI. This research document does **not** perform a promotion.
5. The research-only change itself requires **FAST docs validation** (path, links, headings, whitespace, diff). **No simulator test, browser, full Verify/Export or merge** is claimed or requested; no public or private runtime was modified.

**Bottom line:** **VERIFIED preferred source build = Windward Pilgrimage 5pc, Reminiscence: Fleurdelys main, 4 CR / 4 CD / 1 HP% ×3, Defier's Thorn R1; ER until sufficient (P1: 110%+), CR/CD then HP.** Distinct team and rotation conditions are essential. **PENDING** exact equal-context alternative rankings, combat execution/timing, and hard Echo roll policy. **CONFLICT** identifies stale source/applicability notes only; no invented mechanic or dataset reconciliation.
