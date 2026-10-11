# Hsin — Character Facts Evidence (Worker 7)

**Research date:** 2026-10-11 · **Repository:** bellebing/Bellibing-simulator · **baseline:** main commit [102b66ed](https://github.com/bellebing/Bellibing-simulator/commit/102b66edec165f3d2a313a562de4049a26424924) · **game release:** Wuthering Waves **Version 3.7** (2026-09-30). **Hsin ID:** hsin; database source ID seen on wuther.in: 1311.

**Scope:** Evidence and unresolved work for Hsin only. No Character creation, Build recommendation, BiS, signature association, gameplay implementation, canonical fact promotion, UI change or merge. The source websites below show a live post-release Hsin kit but are **not Bellibing-reviewed source pins**. This is an independently reviewable candidate register, not a claim of simulator readiness.

## Evidence grades and current state

- **VERIFIED (official identity/release only):** Hsin = **RELEASED**, **5★ Electro / Rectifier**; officially named 心. Kuro's [3.7 patch notes](https://wutheringwaves.kurogames.com/zh-tw/main/news/detail/5562) and [phase-I Convene](https://wutheringwaves.kurogames.com/zh-tw/main/news/detail/5528) establish availability as reviewed in [Character Catalog Freshness Review](../CHARACTER_CATALOG_FRESHNESS_REVIEW.md). Existing Bellibing catalog already has this. Do not replace official truth with obsolete provider capture releaseStatusAtCapture=UNRELEASED_WIP.
- **SOURCE_CANDIDATE (not canonical VERIFIED):** exact text/numbers visible on live third-party sources, transcribed below with source and observation date; game-version metadata of those database exports is **not explicitly pinned**. These can be considered for subsequent manual source-validity review, not inserted into production.
- **CONFLICT:** genuinely divergent fields/durations, preserved as alternatives rather than chosen values.
- **PENDING:** absent independently reviewed data/semantics; not zero and not implicitly disabled.
- **IMPLEMENTATION:** current main has **no Hsin Character Mechanics profile, source-backed Skills/Forte/Sequence UI snapshot, intrinsic profile or simulator adapter**. Source text, even if accurate, does not confer executable mechanics or DPS readiness.

Read first: [AGENTS](../../AGENTS.md), [Development Process](../DEVELOPMENT_PROCESS.md), [Project Status](../PROJECT_STATUS.md), [Worker 6 Facts Coverage in unmerged Draft PR #257](https://github.com/bellebing/Bellibing-simulator/blob/research/worker-6-character-build-data-coverage-20261011/docs/research/CHARACTER_FACTS_COVERAGE.md), and [Data Verification Policy](../DATA_VERIFICATION_POLICY.md). PR #257 is an independent unmerged candidate; it has **all Hsin kit/progression columns PENDING**. This PR does not change it.

## Sources and version control

| Key | Surface / retained reference | Recorded time / game version | Role and limits |
| --- | --- | --- | --- |
| **O1** | [Kuro 3.7 notes](https://wutheringwaves.kurogames.com/zh-tw/main/news/detail/5562), [phase-I Convene](https://wutheringwaves.kurogames.com/zh-tw/main/news/detail/5528) | Notes/Convene 2026-09-29–30; game **v3.7**; reviewed in catalog 2026-10-06 | **Official, VERIFIED** for identity, release and type only, **not** kit multipliers. |
| **W1** | [wuther.in Hsin 1311](https://wuther.in/en/character/1311/) | Viewed 2026-10-11; skill slider visibly **Lv10**, stat slider **Lv90**; site data patch **unspecified** | Third-party source candidate for Lv10, mechanisms, Minor Forte, Intro/Outro and S1–S6. |
| **W2** | [Wuthering.gg Hsin](https://wuthering.gg/characters/hsin) | Viewed 2026-10-11; displayed skill details **Lv1**, stat **Lv90**; site data patch **unspecified** | Third-party source candidate for Lv1, Lv90 462 ATK and **Max Resonance Energy** field. |
| **W3** | [WuWaBuild Hsin](https://www.wuwabuild.com/resonators/hsin) | Live page reviewed 2026-10-11; advertised v3.7; actual data pin not supplied | Corroborative kit text; **conflicts** with W1/W2 on Electro Rover inherent buff duration. Recommendations on page are out of scope. |
| **W4** | [Wutheringlab Hsin](https://wutheringlab.com/character/hsin-build/) | Published/updated around 2026-10-02; viewed 2026-10-11; data pin unspecified | Independent textual cross-check; 7s inherent candidate, not canonical fact. Recommendations ignored. |
| **P1** | [Current Prydwen Hsin](https://www.prydwen.gg/wuthering-waves/characters/hsin), [Prydwen roster Stats](https://www.prydwen.gg/wuthering-waves/characters-stats/) | Checked 2026-10-11; captured repository snapshot 2026-10-05 | Hsin profile/capture reports **Stats unavailable**; roster table does not yet establish Hsin's accepted Lv90 integer convention. No implied Prydwen confirmation. |
| **C1** | [Wuthering.gg provider snapshot](../../data/factory/character-truth/wuthering-gg-character-truth.json), [Prydwen progression snapshot](../../data/factory/character-truth/prydwen-progression-truth.json), [truth summary](../../data/factory/character-truth/character-truth-audit-summary.json) | captured **2026-10-05**, before catalog review | Noncanonical **MANUAL_SOURCE_VALIDATION_REQUIRED** capture. Wuthering.gg repeats 10300/462/1112 and maxResonanceEnergy=140; Prydwen progression has level90=null and Stats unavailable. |
| **R1** | [CharacterGameData](../../src/gameDataDomain.ts), [catalog](../../src/data/characters.ts), [raw audit](../../src/data/characterRawAudit.ts), [mechanics source blockers](../../src/data/characterMechanicsSourceReview.ts), [Character Mechanics](../../src/data/characterMechanics.ts) | Current main at above SHA, checked 2026-10-11 | **Implementation truth**, not evidence that Hsin's pending facts were checked. |

Third-party fields here are **provisional**. No Hsin skills source has the immutable upstream commit/hash, explicit full Lv1–Lv10 payload, character-source ID join, parameter mapping and six-area effect review required for canonical promotion. Reusing another Character's old pin is insufficient.

## 1. Level 90 HP, ATK, DEF, Max Energy

Bellibing convention: game-facing Lv90 integers, Prydwen dedicated Stats roster preferred where available; never locally round decimals. Current Hsin row has **null** for all four fields, verificationStatus=**PARTIALLY_VERIFIED**, and all four remain in the [explicit pending raw audit](../../src/data/characterRawAudit.ts).

| Raw field | Observed candidates and precise labels | Evidence assessment | Canonical main | Required next proof |
| --- | --- | --- | --- | --- |
| **HP** | **10,300** on W1 (Base HP, Lv90), W2 (HP, Lv90), C1 | **SOURCE_CANDIDATE**, convergent but still no reviewed Bellibing Lv90 source/pin | **null** | Resolve against current approved Lv90 convention / original game-facing stat. |
| **ATK** | **463** on W1 (Base ATK, Lv90); **462** on W2/C1 (ATK, Lv90) | **CONFLICT / integer-presentation disagreement**, do **not** choose or round | **null** | Independent game-facing integer or current Prydwen Stats roster plus source-family reconciliation. Adjacent integer is not automatically a gameplay conflict, but neither display can yet be silently promoted. |
| **DEF** | **1,112** on W1 (Base DEF, Lv90), W2 (DEF, Lv90), C1 | **SOURCE_CANDIDATE**, convergent, not promoted | **null** | Accepted integer convention + reviewed source provenance. |
| **Max Energy** | W2/C1 report **140**, but their field is labeled **Max Resonance Energy**; W1 does **not** show a separately labeled Max Energy statistic | **PENDING: field semantic relationship and independent confirmation** | **null** | Verify explicit Max Energy/Resonance Energy cap, not cost, on a trusted source/game. |

**Do not confuse:** W1/W2 list **Pillars Across Heaven Resonance Cost = 125** under Liberation. **125 is a cost, not Max Energy**. Neither 125 nor the separately labeled third-party 140 is canonical Max Energy here. No raw-field promotion authorized by this report.

## 2. Skill curves — exact visible values vs missing Lv2–Lv9

Five source skill families are **Manifold Bloom** (Normal), **Heartward by Moon** (Resonance Skill), **Forms Turn, Heart Abides** (Forte Circuit), **Nexus Alight** (Resonance Liberation), **Glance on a Whim** (Intro). W2 visibly exposes **Lv1** rows; W1 slider exposes **Lv10** rows. Every coefficient below is exactly a *source-displayed formatted expression*, not a re-derived damage coefficient or a Bellibing-verification. Multiplication, plus signs and hit components are retained, not summed.

**Coverage: 37 named variable DMG rows × 10 levels; 74 candidate endpoints (Lv1/Lv10), 296 explicitly missing intermediate values (Lv2 through Lv9).** All eight distinct levels **Lv2, Lv3, Lv4, Lv5, Lv6, Lv7, Lv8, Lv9 = PENDING on every row**. Do not interpolate a growth curve, scale it from another character, or pretend Lv10-only data is a complete exact 10-level source. Revalidate even candidate endpoints against a single version-pinned full source before import.

| Family | Exact move / mode | Lv1 W2 | Lv2–Lv9 | Lv10 W1 |
| --- | --- | --- | --- | --- |
| NORMAL | Answering Basic Attack Stage 1 | <code>14.00%+21.00%</code> | **PENDING ×8** | <code>27.84%+41.76%</code> |
| NORMAL | Answering Basic Attack Stage 2 | <code>7.62%*2+34.28%+26.66%</code> | **PENDING ×8** | <code>15.15%*2+68.14%+53.00%</code> |
| NORMAL | Answering Basic Attack Stage 3 | <code>15.85%*2+11.89%*2+23.78%</code> | **PENDING ×8** | <code>31.51%*2+23.63%*2+47.26%</code> |
| NORMAL | Answering Basic Attack Stage 4 | <code>19.98%+19.98%+59.93%</code> | **PENDING ×8** | <code>39.72%+39.72%+119.15%</code> |
| NORMAL | Answering Heavy: Reign at Ease | <code>14.00%*25</code> | **PENDING ×8** | <code>27.84%*25</code> |
| NORMAL | Answering Mid-air: Reign at Ease | <code>11.29%</code> | **PENDING ×8** | <code>22.44%</code> |
| NORMAL | Answering Heavy Attack | <code>5.17%+10.34%+5.17%+10.34%*3</code> | **PENDING ×8** | <code>10.28%+20.55%+10.28%+20.55%*3</code> |
| NORMAL | Answering Mid-air Attack | <code>11.29%</code> | **PENDING ×8** | <code>22.44%</code> |
| NORMAL | Answering Dodge Counter | <code>22.63%*2+33.94%+33.94%</code> | **PENDING ×8** | <code>44.98%*2+67.47%+67.47%</code> |
| NORMAL | Illumining Basic Attack Stage 1 | <code>6.32%*2+18.94%</code> | **PENDING ×8** | <code>12.55%*2+37.65%</code> |
| NORMAL | Illumining Modular Heartlock | <code>10.52%*2</code> | **PENDING ×8** | <code>20.92%*2</code> |
| NORMAL | Illumining Basic Attack Stage 2 | <code>17.50%*2</code> | **PENDING ×8** | <code>34.80%*2</code> |
| NORMAL | Illumining Basic Attack Stage 3 | <code>4.58%*4+9.16%*2+13.74%*4</code> | **PENDING ×8** | <code>9.11%*4+18.21%*2+27.31%*4</code> |
| NORMAL | Illumining Heavy Attack | <code>27.13%*2</code> | **PENDING ×8** | <code>53.93%*2</code> |
| NORMAL | Illumining Upward Cut | <code>17.62%+26.43%</code> | **PENDING ×8** | <code>35.03%+52.54%</code> |
| NORMAL | Illumining Mid-air Attack | <code>6.78%+4.52%</code> | **PENDING ×8** | <code>13.47%+8.98%</code> |
| NORMAL | Illumining Dodge Counter | <code>48.13%*2</code> | **PENDING ×8** | <code>95.68%*2</code> |
| NORMAL | Dominion / Pillars Aligned Basic Stage 1 | <code>14.52%*3</code> | **PENDING ×8** | <code>28.86%*3</code> |
| NORMAL | Dominion / Pillars Aligned Basic Stage 2 | <code>19.23%*3</code> | **PENDING ×8** | <code>38.23%*3</code> |
| NORMAL | Dominion / Pillars Aligned Basic Stage 3 | <code>10.74%*5</code> | **PENDING ×8** | <code>21.35%*5</code> |
| NORMAL | Dominion / Pillars Aligned Basic Stage 4 | <code>8.37%*7+25.10%</code> | **PENDING ×8** | <code>16.64%*7+49.90%</code> |
| NORMAL | Dominion / Pillars Aligned Dodge Counter | <code>33.23%*3</code> | **PENDING ×8** | <code>66.07%*3</code> |
| SKILL | Heartward by Moon — Answering | <code>12.60%+12.60%+12.60%+8.40%*2+29.40%</code> | **PENDING ×8** | <code>25.06%+25.06%+25.06%+16.71%*2+58.46%</code> |
| SKILL | Heartward by Moon — Illumining | <code>5.60%*4+89.60%</code> | **PENDING ×8** | <code>11.14%*4+178.14%</code> |
| FORTE | Realm Wanderer | <code>22.96%+5.74%*6+229.59%</code> | **PENDING ×8** | <code>45.65%+11.42%*6+456.45%</code> |
| FORTE | Realm Protector | <code>49.96%+12.49%*6+499.55%</code> | **PENDING ×8** | <code>99.32%+24.83%*6+993.15%</code> |
| FORTE | Beholding All Horizons | <code>5.17%*4+185.96%</code> | **PENDING ×8** | <code>10.27%*4+369.70%</code> |
| FORTE | Stilling All Horizons | <code>13.61%*4+489.66%</code> | **PENDING ×8** | <code>27.05%*4+973.49%</code> |
| FORTE | Pillars Aligned | <code>90.26%*4+9.03%+18.06%*2+22.57%*2</code> | **PENDING ×8** | <code>179.43%*4+17.95%+35.89%*2+44.86%*2</code> |
| LIBERATION | Pillars Across Heaven | <code>40.50%+45.56%+30.38%+50.62%+35.44%+809.88%</code> | **PENDING ×8** | <code>80.51%+90.57%+60.38%+100.64%+70.45%+1610.12%</code> |
| LIBERATION | Soaring Pillar coordinated hit | <code>5.72%</code> | **PENDING ×8** | <code>11.37%</code> |
| INTRO | Answering / Electro Flare | <code>3.97%*2+3.97%*2+63.39%</code> | **PENDING ×8** | <code>7.88%*2+7.88%*2+126.02%</code> |
| INTRO | Answering / Unison | <code>5.17%+10.34%+5.17%+10.34%*3</code> | **PENDING ×8** | <code>10.28%+20.55%+10.28%+20.55%*3</code> |
| INTRO | Answering / Manifold Unison | <code>30.48%+60.95%+30.48%+60.95%*3</code> | **PENDING ×8** | <code>60.59%+121.18%+60.59%+121.18%*3</code> |
| INTRO | Illumining / Electro Flare | <code>5.75%*4+5.75%*2+20.11%*4</code> | **PENDING ×8** | <code>11.42%*4+11.42%*2+39.97%*4</code> |
| INTRO | Illumining / Unison | <code>28.47%*4+2.85%+5.70%*2+7.12%*2</code> | **PENDING ×8** | <code>56.59%*4+5.66%+11.32%*2+14.15%*2</code> |
| INTRO | Illumining / Manifold Unison | <code>79.08%*4+7.91%+15.82%*2+19.77%*2</code> | **PENDING ×8** | <code>157.22%*4+15.73%+31.45%*2+39.31%*2</code> |

**Non-scaling shown parameter candidates** (independent skill text check still needed): Skill Answering cooldown **12s**, Illumining cooldown **20s**; Forte Pillars Aligned cooldown **12s**; Liberation Formshift cooldown **25s** and Invoked Form cooldown **1.5s**; Pillars Across Heaven **Resonance Cost 125**, Formshift **Concerto Regen 20**, Pillars Across Heaven **Concerto Regen 20**; Intro variants **Concerto Regen 10**; Reign at Ease stamina cost **5** and **5/s**, mid-air finish **30**, Answering Heavy **20**, normal Answering midair **30**, Illumining midair Basic **5**, Illumining Heavy **20**, Illumining Midair **30**. Source W1 and W2. These are source candidates and should not be mistaken for complete simulation timing.

## 3. Forte Circuit, states and resources — candidate rules, NOT executable

**Primary form cycle (W1/W2).** **Answering Form** gains **Answering Heart (cap 100)** on eligible *active Hsin* attack/Skill/Intro hits, with Answering Intro additionally granting **60**. At 100, Heavy becomes **Realm Wanderer**, spends **100 Answering Heart and 20 STA**, grants **Resolution of Wishes**; when that buff is available, the strike becomes **Realm Protector** (consumes the buff). **Resolution of Wishes** can be granted only **once every 24s**. That heavy unlocks **Formshift** when not in Heart Manifest. These transformed Heavy DMG instances are **explicitly considered Resonance Skill DMG**; do not classify every Heavy by its button.

**Formshift/Illumining.** Casting Formshift shifts to **Illumining Form**, enters **Heart Manifest (45s, interruption resistance)** and opens the Illumining kit. **Illumining Heart cap 300** is gained from eligible on-field hits; at 300, grounded **Pillars Aligned** consumes/uses the full-resource opportunity and enters **Mechanism Dominion for 13s**. During Dominion, Normal/Dodge attacks are replaced; hits spend Illumining Heart. Exiting clears Illumining Heart. At zero during Dominion, Heavy becomes **Beholding All Horizons**; it can instead become **Stilling All Horizons** by consuming **Law of Heaven** (gain only once/24s). Both are explicitly **Resonance Skill DMG**, end Dominion and unlock **Pillars Across Heaven**. Liberation finisher requires **full Resonance Energy**, returns Answering Form and ends Heart Manifest. Mode/form changes are not presumed to have any unstated timing or stack persistence.

**Resonance Mode — Unison (W1/W2).** Hsin can trigger **Unison Response**, except co-op; a qualifying Answering Intro arms Formshift to grant **Unison for 5s**. On a qualifying swap-in/Intro, Unison Response grants team **Unison Boon for 30s** (Hsin's own grant limited to one); base Unison Boon **2 stacks max**, **3% total DMG per stack** to eligible Unison Response Resonators (not an unqualified global team buff). **Source Intent** can replace an Intro with **Manifold Unison**; the enhanced Intro is explicitly **Resonance Skill DMG**. Illumining Intro in this mode directly enters Dominion with **300 Illumining Heart**. The source states switching mode clears various benefits; do not merge the two mode rules.

**Resonance Mode — Electro Flare (W1/W2).** Other Resonators' **Electro Rage** applied to targets converts to Hsin's **Heart of Thunder** (up to **100**; removes those Rage stacks). Heartward by Moon's last stage triggers one Electro Flare DMG event with source formula **35% × Heart-of-Thunder stacks × target's current Electro-Flare-stack multiplier**; S1 replaces the 35% with 42%. A qualifying Skill interruption/swapped-out state cancels the described effects; remaining Heart of Thunder later clears at an unspecified precise instant (**timing PENDING**). ≥50 Heart of Thunder allows temporary stagnation for Illumining Skill. Post-Formshift applies **5 Electro Flare** locally and permits up to **5** qualifying Dominion Basic/Dodge inflictions; specific transformed attacks inflict **5** or **1** stacks as described in W1. Mode switch clears Heart of Thunder. Do not infer Electro Flare damage from an unrelated field/bucket.

**Other state/resource facts from W1/W2.** **Edict**: Formshift gives **21 stacks for 45s**, one can be consumed **at most once/s** following qualified on-field damage in its 3s trigger window to summon one **Soaring Pillar coordinated attack**; the coordinated hit does *not* trigger itself; knockout clears Edict. **Modular Heartlock** appears on Illumining Basic Stage 1 and collapses on specified follow-ups. **Moon Fox / Dustless Tread** is an out-of-combat movement state; restores **6% max HP / 3s** out of combat, not a generic active combat heal; Liberation unavailable in Fox. **Nightglow, Shared Light, Source Intent, Resolution of Wishes, Law of Heaven, Heart Manifest, Mechanism Dominion, Unison, Unison Boon, Thunderglow (cap 10), Fleeting Thunder, Radiance Ward (S1)** are distinct owners/conditions, not interchangeable universal buffs. **Fleeting Thunder** may load Electro Flare up to **16 stacks** while qualified in Heart Manifest; removal/range/mode conditions apply.

**Unreviewed interpretation:** source descriptions use “some time after”, “within a certain range” and unstated ordering. Those times/ranges, target ownership, tick alignment, reset priority and executable buff-scope mapping remain **PENDING_INTERPRETATION**, even where source numeric text is explicit.

## 4. Intro and Outro candidates

- **Intro: Glance on a Whim** (W1/W2). Answering Form and Illumining Form have mode-specific numeric rows above; **Manifold Unison** variants have explicit source **Resonance Skill DMG** classification (do not extrapolate this classification to the other Intro variants). Answering Intro chains toward different Basic stages depending on Unison/Electro Flare. Illumining Unison Intro enters Dominion via Forte conditions. Displayed Concerto Regen 10 each.
- **Outro: Herself a Thousand Lanterns** (W1/W2). Direct **Electro DMG = 100% of Hsin's ATK** on target. Hsin gets **Nightglow** entering combat or casting Pillars Across Heaven; Outro consumes it to enable mode-conditioned effects. Under **Unison**, *other* qualified Resonators with **Shared Light** receive **20% All DMG Amplification for 30s**. Under **Electro Flare**, other party Resonators receive **20% Electro DMG Amplification for 20s**. The source says these effects end early on Hsin Resonance Mode change. Preserve amplification terminology and eligibility; do **not** classify Outro as an unconditional 20% all-damage buff.

## 5. Inherent Skills and Minor Forte candidates

**Tides of Succession (Inherent 1):**
- In **Unison**, casting eligible Manifold Unison Intro gives **Hsin ATK +50% for 8s**; switching Resonator or mode removes it.
- In **Electro Flare**, allied inflictions give Hsin **Electro DMG Bonus +25%**, up to **2 stacks**, each Resonator can qualify **once**; team/mode changes reset as specified.
- With **Rover: Electro**, Rover's **Thunderous Fury Intro** gives both **Electro DMG Bonus +20%** but its **duration CONFLICTS**: **30s (W1/W2)** vs **7s (W3/W4)**. Never choose 30 or 7 for canonical effect without a version-pinned authoritative comparison.

**Gleaning Simple Joys (Inherent 2):**
- **Unison:** raises eligible Unison Boon maximum stacks by **+1**; qualifying Unison Response grants the party **one additional stack for 30s**, subject to source stacking restriction.
- **Electro Flare:** eligible other-party inflictions grant **Thunderglow** to Hsin, at most **10**; during Heart Manifest can add Electro Flare to nearby targets at zero stacks and, when Thunderglow is full, apply **Fleeting Thunder** and Electro Flare up to **16 stacks**. Leaves its explicit range/form/mode constraints pending if no exact measure is provided.

**Minor Forte (permanent stat-node candidates, W1):** eight nodes:
| Owner / skill-tree branch | Node 1 | Node 2 | Branch subtotal |
| --- | ---: | ---: | ---: |
| Manifold Bloom / Normal | CRIT Rate **+1.20%** | CRIT Rate **+2.80%** | CRIT Rate **+4.00%** |
| Glance on a Whim / Intro | CRIT Rate **+1.20%** | CRIT Rate **+2.80%** | CRIT Rate **+4.00%** |
| Heartward by Moon / Skill | ATK **+1.80%** | ATK **+4.20%** | ATK **+6.00%** |
| Nexus Alight / Liberation | ATK **+1.80%** | ATK **+4.20%** | ATK **+6.00%** |

All eight invested: **CRIT Rate +8.00%, ATK% +12.00%**. This is an arithmetic summary of **candidate nodes**, **not** a published Bellibing intrinsic profile or assumed always-active contribution; Build UI must later use actual enabled-node state and prevent double counting.

## 6. S1–S6 Resonance Chain — named candidate effects

Each row is a **SOURCE_CANDIDATE**, not a verified canonical SEQUENCE fact nor an engine-modeled effect. No “S0 passive”; baseline is S0. Keep trigger, character, target, mode, stack, duration and exclusions. Source W1; W2/C1 corroborate names or text, not independent source pins.

| Chain | Name | Source-described actual mechanical effects (not build advice) |
| --- | --- | --- |
| **S1** | **A Boat to Cross the Rising Tide** | **Formshift** grants **2 Radiance Ward** (cap 2); switching back to Answering clears them; enemy hit consumes one for **−60% damage taken** and interruption immunity **1s**, at most once/s. **Unison:** +15% Manifold Unison Intro DMG multiplier and **+10% per Unison Boon**, at most **4** applicable stacks. **Electro Flare:** on combat entry raises Heart of Thunder to **at least 50**, once/12s; changes Heartward Electro Flare DMG factor to **42% × Heart-of-Thunder stacks × target Electro Flare multiplier**. |
| **S2** | **To Wake Is to Wonder What I Am** | **+60% DMG multipliers** for **Realm Wanderer**, **Realm Protector**, **Beholding All Horizons**, **Stilling All Horizons**. On combat entry resets the **Resolution of Wishes / Law of Heaven acquisition cooldowns** and additionally restores **100 Answering Heart**; once/12s. Conditional form context should be checked, not assumed global. |
| **S3** | **A Dream of Return Among the Hills** | **Pillars Across Heaven DMG multiplier +70%**; **Unison:** that finisher's **CRIT DMG +20%** and **+15% per Unison Boon stack**, up to **4**; **Electro Flare:** finisher last hit on a marked target triggers Electro Flare DMG with **1500% × corresponding target-stack Electro Flare multiplier**. |
| **S4** | **A River of Lanterns, a River of Wishes** | Team **All-Attribute DMG Bonus +20% for 30s** when a party Resonator (a) inflicts Electro Flare or Electro Rage, (b) newly gains Unison, or (c) triggers Unison Response. Trigger alternatives are disjunctive; repeat/refresh policy requires independent scrutiny. |
| **S5** | **Forms Turn as the Heart Wills** | In **Illumining Form**, incoming damage to Hsin **−20%**. Lethal hit instead restores **100% of Max HP** and grants **damage + interruption immunity for 1s**, once every **10 minutes**. Not equivalent to a generic heal trigger. |
| **S6** | **The Moon Owes Its Light to the Living** | Targets receive **+40% Resonance Skill DMG from Hsin**; Hsin's Skill DMG **ignores 20% target DEF**. **Unison:** eligible Unison Boon max **+1 more**, and Unison Response grants **+1 more stack for 30s** (nonstacking). **Electro Flare:** nearby targets' Electro Flare damage can **crit** at fixed **80% CRIT Rate and 230% CRIT DMG** during combat. |

Descriptions are summarized in source terminology; implementation still requires source-explicit multiplier operations (e.g., “multiplier increased” versus generic additive damage bonus), on-hit identification, damage class and update ordering. No adapter is authorized.

## 7. Explicit contradictions, pending evidence and blockers

1. **Lv90 ATK 463 (W1) versus 462 (W2/C1)**: integer presentation and accepted Lv90 convention unresolved. Neither imported.
2. **Max Energy**: W2 reports 140 **Max Resonance Energy** but official/approved current Level-90 Max Energy verification is absent; W1 shows **125 Resonance Cost**, a *different field*. Leave canonical **null**.
3. **Tides of Succession Rover: Electro +20% Electro DMG duration = 30s (W1/W2) or 7s (W3/W4).** Source conflict; effect timing **PENDING**.
4. **All Lv2–Lv9 curves** for the 37 rows are missing explicitly accessed unambiguous values; **no estimated coefficients**. No immutable new Hsin source pin, skill value IDs, formatting parameter mapping, or source-version lock.
5. **Forte/Sequence detailed execution:** unknown event ordering, “short time”, delayed Heart-of-Thunder consumption, approximate radius, proc stacking/refresh, target scope and damage-snapshot ordering. They remain **PENDING_INTERPRETATION**, not engine-ready. Verify attack-source class per move (not based on section label).
6. **Canonical Hsin source + UI snapshots:** no verified tree node index, node/asset manifest join or sequence ID/icon join in old 57-character pins. Existing provider six chain names do **not** satisfy the S1–S6 effect or UI contract.
7. **Captured release label drift:** C1 captured Hsin as UNRELEASED_WIP on Oct 5 even though official v3.7 release was already live. Canonical current main correctly marks RELEASED; never downgrade from capture.
8. **Other provider's “guide,” “signature,” “best” or recommended weapon** does not establish an objective Hsin Signature/gameplay association; out of scope.
9. **Hsin Character Mechanics source-VERIFIED ≠ runtime:** currently neither exists. Do not mark data, UI or DPS complete because text has been found.

## 8. Existing owner models and precise follow-up boundaries (NO changes in this PR)

| Later reviewed work | Existing canonical owner(s), no new parallel model | Required verification before changing |
| --- | --- | --- |
| Lv90 raw / Max Energy | [characters.ts](../../src/data/characters.ts), [gameDataDomain.ts](../../src/gameDataDomain.ts), [characterRawAudit.ts](../../src/data/characterRawAudit.ts) | Per-field accepted Lv90 source, integer convention, independently named Max Energy, updated source metadata/status; remove only actually resolved pending exceptions. |
| Eight static Minor Forte nodes | [characterIntrinsicStats.ts](../../src/data/characterIntrinsicStats.ts), [UI Forte source](../UI_FORTE_TREE_SOURCE.md) | Review original source node IDs, stat values, enable/prerequisite behavior and no double count; source-VERIFIED intrinsic status only after source review. |
| All five Lv1–Lv10 skill families | [characterMechanics.ts](../../src/data/characterMechanics.ts), [characterMechanicsDomain.ts](../../src/characterMechanicsDomain.ts), [ACTIONS audit](../CHARACTER_ACTIONS_COVERAGE.md) | Version-pinned 10-level coefficient arrays, value IDs and component/hit class, original names, provenance per fact. Missing Lv2–9 cannot be backfilled by arithmetic. |
| Forte, modes, states, resources & Inherent | [Forte audit](../CHARACTER_FORTE_RULES_COVERAGE.md), [Inherent audit](../CHARACTER_INHERENT_PASSIVES_COVERAGE.md), [source blocker registry](../../src/data/characterMechanicsSourceReview.ts) | Trigger/persistence/stack/target classification and the conflicting Rover duration; model source facts separately from executable effects. |
| Intro, Outro and chain S1–S6 | [Character mechanics coverage audit](../../src/data/characterMechanicsAudit.ts), [Sequence source review](../UI_SEQUENCE_SOURCE.md), canonical Character Mechanics | Six independently verified areas ACTIONS, FORTE_RULES, INHERENT_PASSIVES, OUTRO_EFFECT, RESOURCE_RULES, SEQUENCES. Reviewed source text and mechanics != executable runtime. |
| Build/Skills/Sequence UI and assets | [Forte source snapshot](../../data/source/character-forte-ui.json), [Sequence snapshot](../../data/source/character-sequence-ui.json), existing Character presentation Pending gates | New explicitly reviewed Hsin asset identity/source node, S1–S6 chain IDs, on-state UI, actual render/browser checks; no workaround using another character's 57 snapshot. |
| Combat/DPS | Existing [Character Mechanics](../../src/data/characterMechanics.ts), effect adapters and readiness preflight | Independent source class, event model, state timing, and relevant audits + tests; no implicit promotion from this research file. |

**Research stop / acceptance:** Official RELEASED 5★ Electro/Rectifier is verified. HP/DEF and many detailed kit/chain/source facts have specific named third-party evidence but **remain unreviewed candidates**. ATK, Max Energy and the Rover-linked Inherent duration remain explicitly unresolved; Lv2–Lv9 are absent. No simulatorimplementation, Canonical Character data, PR #257, other PR, source snapshot or merge changed. This is the complete focused evidence pass as of **2026-10-11**; do not continue speculative sourcing or fill holes.

**Docs-only FAST verification plan:** exact repo baseline, link/path integrity, Markdown table integrity and whitespace; diff must show **only this new file**. Full tests/build/Chrome/FULL Verify are not performed or claimed for an evidence-only Draft PR.
