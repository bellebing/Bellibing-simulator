# Character Facts Coverage — released roster

**Worker 6 fact audit · 2026-10-11 · baseline `main` at `102b66edec165f3d2a313a562de4049a26424924`.** This document audits **gameplay facts**, not BiS rankings, Echo preferences, DPS, Character Target or personal optimization. All **59** `RELEASED` records are counted from [`CHARACTER_CATALOG`](../../src/data/characters.ts). `suoming` is `CONFIRMED_UPCOMING` and intentionally excluded. The sibling [Build Data Coverage](CHARACTER_BUILD_DATA_COVERAGE.md) records *conditional* recommendation/profile associations separately.

## Meaning of coverage — do not flatten statuses

- **V = VERIFIED**: the named *fact layer* has source-reviewed data, under its own audit. For identity, the typed ★/element/weapon and `RELEASED` flag are present for every row; **V in a Skills or Forte column means source coverage, not runtime execution**.
- **P = PARTIAL**: the layer is materially present but not fully source-verifiable, or canonical mapping is incomplete. Some exact skill multipliers may already be correct while a damage-bonus class is still unknown.
- **— = PENDING/ABSENT**: no reviewed canonical fact for this identity/category. A missing value is **not zero**, and presence in an unpromoted provider capture is not review.
- **X = CONFLICT**: conflicting meanings/values, not merely an absent feature. Sources must be resolved before making a gameplay claim. *Mornye X is a documented cross-owner discrepancy; its canonical intrinsic record itself is still tagged VERIFIED.*
- **Chain T/M** = `S1–S6` **source text** / **canonical mechanics coverage**. **Effects S/Exec** = Character mechanic/state **source validity** / **actual executable gameplay coverage**. All reviewed Characters still have only **PARTIAL** system-level execution; narrow hit/effect adapters do not form general DPS. **Intro** means source-backed move/text coverage; **Outro** means the *canonical `OUTRO_EFFECT` area*, a stricter criterion.
- **Signature/weapon column:** **R** = a source-reviewed `WeaponRecommendationProfile` is associated to that Character in a named build context; **—** = no such contextual recommendation. **R is NOT a verified objective Signature Weapon fact.** No standalone character→signature fact link exists in [Character/Weapon raw contracts](../../src/gameDataDomain.ts), and a guide's “Signature / best” label cannot be promoted by this audit.
- **UI S** = source-backed 57-Character Skills/Forte/Sequence presentation data exists, not a per-Character real-browser acceptance claim. `—` = Hsin/Jingran presentation source currently pending. UI Build Stats and canonical source-fact objects have separate owners.

## Per-Character matrix (59 RELEASED)

Identity shown here is the released-roster **catalog association**, not an assertion that every row's `verificationStatus` is fully `VERIFIED`. The **Lv90** column preserves each row's actual catalog verification and pending-status distinction. ★/element/weapon type are literal current catalog values.

| Character ID | Identity ★ Element / Weapon Type | Lv90 | Minor Forte | Skills/ACTIONS | Forte rules | Inherent | Intro source | Outro effect | Chain T/M | Effects S/Exec | Sig/ref | UI | Material fact gap / evidence |
| --- | --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | --- |
| `aalto` | 4★ Aero / Pistols | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `aemeath` | 5★ Fusion / Sword | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `augusta` | 5★ Electro / Broadblade | V | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `baizhi` | 4★ Glacio / Rectifier | P | V | V | V | V | V | V | V/V | V/P | — | S | — |
| `brant` | 5★ Fusion / Sword | P | V | V | V | V | V | V | V/V | V/P | — | S | Mechanics provenance notes 125/140 Max Energy header disagreement; canonical Lv90 125 is retained; re-review source labeling before a consumer needs it. |
| `buling` | 4★ Electro / Rectifier | P | V | P | P | V | V | P | V/P | P/P | — | S | ACTIONS/FORTE: Five Thunders Spell Array (value 1307031) damage-bonus class not stated; no guessed Skill DMG. |
| `calcharo` | 5★ Electro / Broadblade | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `camellya` | 5★ Havoc / Sword | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `cantarella` | 5★ Havoc / Rectifier | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `carlotta` | 5★ Glacio / Pistols | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `cartethyia` | 5★ Aero / Sword | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `changli` | 5★ Fusion / Sword | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `chisa` | 5★ Havoc / Broadblade | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `chixia` | 4★ Fusion / Pistols | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `ciaccona` | 5★ Aero / Pistols | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `danjin` | 4★ Havoc / Sword | P | V | V | X | V | V | P | V/P | P/P | — | S | FORTE: full-power Ruby Blossom text says over 120 while cap is 120; contradictory threshold, not >=120. |
| `denia` | 5★ Fusion / Rectifier | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `encore` | 5★ Fusion / Rectifier | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `galbrena` | 5★ Fusion / Pistols | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `hiyuki` | 5★ Glacio / Sword | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `hsin` | 5★ Electro / Rectifier | — | — | — | — | — | — | — | —/— | —/— | — | — | Official release/identity verified; all Lv90 core values and Character Mechanics/UI kit/Sequence source pending. |
| `iuno` | 5★ Aero / Gauntlets | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `jianxin` | 5★ Aero / Gauntlets | P | V | V | V | V | V | V | V/V | V/P | — | S | — |
| `jingran` | 5★ Fusion / Broadblade | — | — | — | — | — | — | — | —/— | —/— | — | — | Official release/identity verified; all Lv90 core values and Character Mechanics/UI kit/Sequence source pending. |
| `jinhsi` | 5★ Spectro / Broadblade | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `jiyan` | 5★ Aero / Broadblade | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `lingyang` | 5★ Glacio / Gauntlets | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `lucilla` | 5★ Glacio / Rectifier | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `lucy` | 5★ Spectro / Pistols | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `lumi` | 4★ Electro / Broadblade | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `lupa` | 5★ Fusion / Broadblade | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `luuk-herssen` | 5★ Spectro / Gauntlets | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `lynae` | 5★ Spectro / Pistols | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `mornye` | 5★ Fusion / Broadblade | P | X | V | V | V | V | V | V/V | V/P | R | S | Minor-Forte catalog Healing Bonus +10% vs pinned tree Build UI +12%; source discrepancy explicitly pending reconciliation. |
| `mortefi` | 4★ Fusion / Pistols | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `phoebe` | 5★ Spectro / Rectifier | P | V | V | V | V | V | V | V/V | V/P | — | S | — |
| `phrolova` | 5★ Havoc / Rectifier | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `qingxiao` | 5★ Aero / Sword | X | V | V | V | V | V | V | V/V | V/P | — | S | Max Energy source-label semantics conflict; Liberation cost cannot substitute. |
| `qiuyuan` | 5★ Aero / Sword | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `rebecca` | 5★ Electro / Pistols | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `roccia` | 5★ Havoc / Gauntlets | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `rover-aero` | 5★ Aero / Sword | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `rover-electro` | 5★ Electro / Sword | X | V | V | V | V | V | V | V/V | V/P | — | S | Max Energy 125/140 source conflict; Liberation cost cannot substitute. |
| `rover-havoc` | 5★ Havoc / Sword | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `rover-spectro` | 5★ Spectro / Sword | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `sanhua` | 4★ Glacio / Sword | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `sigrika` | 5★ Aero / Gauntlets | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `suisui` | 5★ Glacio / Rectifier | X | V | V | V | V | V | V | V/V | V/P | — | S | Max Energy sources label 125/140/175 incompatibly; leave null. |
| `taoqi` | 4★ Havoc / Broadblade | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `the-shorekeeper` | 5★ Spectro / Rectifier | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `verina` | 5★ Spectro / Rectifier | P | V | V | V | V | V | V | V/V | V/P | — | S | — |
| `xiangli-yao` | 5★ Electro / Gauntlets | P | V | P | V | V | V | P | V/P | P/P | — | S | ACTIONS: Pivot - Impale 1305015–1305017 damage-bonus class absent; no guess from move label. |
| `yangyang` | 4★ Aero / Sword | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `yangyang-xuanling` | 5★ Havoc / Sword | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `yinlin` | 5★ Electro / Rectifier | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `youhu` | 4★ Glacio / Gauntlets | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `yuanwu` | 4★ Electro / Gauntlets | P | V | V | V | V | V | V | V/V | V/P | — | S | — |
| `zani` | 5★ Spectro / Gauntlets | P | V | V | V | V | V | V | V/V | V/P | R | S | — |
| `zhezhi` | 5★ Glacio / Rectifier | P | V | V | V | V | V | V | V/V | V/P | R | S | — |

## Reconciled coverage — exact denominator matters

| Fact family | Recorded + reviewed | Remaining work | Owner / deterministic evidence |
| --- | --- | --- | --- |
| Identity/release | **59/59 RELEASED**, typed rarity/element/weapon source in catalog; Hsin/Jingran official patch release identity separately reviewed | This is not blanket `CharacterGameData.VERIFIED`; Suoming is UPCOMING | [catalog](../../src/data/characters.ts), [release freshness review](../CHARACTER_CATALOG_FRESHNESS_REVIEW.md) |
| Lv90 HP/ATK/DEF/Max Energy | **54/59 fully populated numeric fields**, but **only 1/59 entire raw records flagged VERIFIED** (Augusta); 53 populated records are PARTIALLY_VERIFIED | **2** missing four fields (Hsin/Jingran); **3** have Max Energy null with source conflicts (Qingxiao/Rover Electro/Suisui) | [Character raw pending](../../src/data/characterRawAudit.ts), [verification policy](../DATA_VERIFICATION_POLICY.md) |
| Minor Forte static values | **57** `CharacterIntrinsicProfile` source-verified records by catalog status | Hsin/Jingran absent; **Mornye's 10% vs 12% Healing Bonus presentation contradiction** must remain explicitly open | [intrinsic catalog](../../src/data/characterIntrinsicStats.ts), [Forte UI source review](../UI_FORTE_TREE_SOURCE.md) |
| Skills/ACTIONS (Lv1–Lv10/source-fixed) | **55 VERIFIED**, 2 PARTIAL, 2 new-ID PENDING; source skill/value facts typed in [mechanic domain](../../src/characterMechanicsDomain.ts) | Buling and Xiangli Yao each have exact source rows but missing damage-bonus classification; Hsin/Jingran have no canonical mechanics kit | [ACTIONS audit](../CHARACTER_ACTIONS_COVERAGE.md), [raw-fact aggregator](../../src/data/characterMechanics.ts) |
| Forte rules | **55 VERIFIED**, 2 incomplete/conflicted, 2 new-ID PENDING | Buling array class missing (PARTIAL), Danjin over-120/max-120 threshold CONFLICT, Hsin/Jingran PENDING | [FORTE audit](../CHARACTER_FORTE_RULES_COVERAGE.md) |
| Inherent Skills | **57/59 VERIFIED** (114 pinned source rows, exact two for each original 57) | Hsin/Jingran pending | [Inherent audit](../CHARACTER_INHERENT_PASSIVES_COVERAGE.md), [pinned Skills/Forte UI source](../../data/source/character-forte-ui.json) |
| Intro | **57/59 source-backed Skills/Forte Intro nodes/text** | Hsin/Jingran missing; this does not override partial whole-ACTIONS classifications on Buling/Xiangli Yao | [Forte source contract](../UI_FORTE_TREE_SOURCE.md), [source projection](../../src/characterForteUi.mjs) |
| Outro | **54/59 canonical `OUTRO_EFFECT` source-VERIFIED** via full six-area Character Mechanics profiles | Buling/Danjin/Xiangli Yao `OUTRO_EFFECT: PENDING` despite separately available UI source text; Hsin/Jingran no promoted kit | [mechanics source review](../CHARACTER_MECHANICS_SOURCE_REVIEW.md), [canonical profiles](../../src/data/characterMechanics.ts) |
| S1–S6 descriptions/Sequence effects | **57/59 source-backed, 342/342 original S1–S6 text rows**, **54/59 canonical `SEQUENCES` area verified** | Canonical Sequence mechanics PENDING on Buling/Danjin/Xiangli Yao; all six UI/source rows absent for Hsin/Jingran. **S0 is baseline, not a separate S0 passive** | [pinned sequence text](../../data/source/character-sequence-ui.json), [Sequence UI review](../UI_SEQUENCE_SOURCE.md), [canonical six-area audit](../../src/data/characterMechanicsAudit.ts) |
| Sequence→Build Stats | **342** explicitly reviewed S1–S6 source rows; **20** `STATIC_BUILD_STAT`, **322** `NON_STATIC_MECHANIC`, **0** ambiguous/unreviewed in original 57 | Classification is not global combat execution: non-static Sequence effects still need source-valid adapters; no S1–S6 UI work for Hsin/Jingran | [Sequence stat review](../../data/source/character-sequence-build-stat-review.json), [runtime projection](../../src/characterSequenceBuildStats.mjs) |
| Character state/effects | **54/59 full six-area source-VERIFIED mechanics profiles**, **3 partial**, **2 missing**; 57/59 have explicit source-review dispositions | Three named semantic blockers below; many otherwise VERIFIED passives/effects retain `RAW_ONLY` or `PENDING_INTERPRETATION` execution. `sourceReviewComplete` means gaps classified, **not** gameplay complete | [mechanics audit](../../src/data/characterMechanicsAudit.ts), [source blocker registry](../../src/data/characterMechanicsSourceReview.ts) |
| Signature Weapon fact | **No distinct canonical, independently VERIFIED character→Signature Weapon fact family is represented**; 45 contextual weapon recommendation profiles exist | Any actual signature association requires explicit source verification and a separately scoped relationship; do not infer from `defaultWeaponId`/guide rankings | [raw Character/Weapon contracts](../../src/gameDataDomain.ts), [recommendation relations](../../src/profileDomain.ts), [profile catalog](../../src/data/profileCatalogs.ts) |
| UI implementation | Skills/Forte/Sequence content projections for existing 57 have pinned source plus reviewed UI contracts | Hsin/Jingran separate Skills/Sequence/Hero presentation remains pending; no per-row live Chrome proof performed in this research audit | [Forte UI](../UI_FORTE_TREE_SOURCE.md), [Sequence UI](../UI_SEQUENCE_SOURCE.md), [Project status](../PROJECT_STATUS.md) |

**Special case — data present but classified differently:** Buling and Xiangli Yao have source-preserved exact ACTION coefficient rows even while their entire ACTIONS coverage is `PARTIAL` because source classification is missing. Danjin's ordinary ACTIONS are VERIFIED while her Forte/Resource threshold is contradictory. Their Inherent Skills are VERIFIED independently. This is *not* three all-empty kits.

## Concrete missing/disputed facts

1. **Hsin and Jingran — PENDING factual kit, not unreleased.** Both are `RELEASED` in the current roster; official source review supports their rarity/element/weapon. **HP, ATK, DEF and Max Energy Lv90 are null** for both. Their canonical mechanics, two Inherent Skills, current skill curves, Forte/status, Intro/Outro effect, source S1–S6 and presentation snapshots are not promoted. `data/factory/character-truth/*` provider evidence and DPR numeric scenarios cannot fill these cells without a new manual source-validity review.
2. **Buling — PARTIAL, not a numeric coefficient hole.** `ACTIONS-BULING-1307031-DAMAGE-CLASS` and `FORTE-BULING-1307031-DAMAGE-CLASS` lack an explicit Character damage-bonus classification for Five Thunders Spell Array Continuous DMG. Source text for nearby **team** Resonance Skill DMG Bonus does not classify this damage.
3. **Xiangli Yao — PARTIAL classification.** `ACTIONS-XIANGLI-YAO-1305015-1305017-DAMAGE-CLASS` lacks the source-explicit Basic-versus-Liberation (or other) damage class for Pivot - Impale stages 1–3. Action replacement names and the Intuition state cannot decide the class.
4. **Danjin — CONFLICT.** `FORTE-DANJIN-1000807-FULL-POWER-THRESHOLD` says full-power Ruby Blossom must reach **over 120** while capacity is **120**; neither `>=120` nor `=120` is source-safe.
5. **Qingxiao, Rover (Electro), Suisui — CONFLICT.** Their Level-90 `maxEnergy` stays null (multiple differently labeled 125/140/175 values). In particular `Resonance Cost` or other Energy fields must **not** be substituted for Max Energy.
6. **Mornye — cross-owner CONFLICT.** [`characterIntrinsicStats.ts`](../../src/data/characterIntrinsicStats.ts) records `Healing Bonus: 0.10` and currently marks the profile VERIFIED, while the pinned skill-tree nodes produce **12% Healing Bonus**; the interactive Build Stats uses 12%. [Forte UI source review](../UI_FORTE_TREE_SOURCE.md) explicitly leaves this divergence pending. Reconcile at the owning source boundary; this audit changes neither number.
7. **Brant — source discrepancy worth a targeted check.** Brant mechanics provenance notes current headers disagree on `Max Energy` (125 vs 140) while `characters.ts` stores 125; this is *not* a registered `characterRawAudit.ts` null exception. Don't change it based on `Resonance Cost`, and don't silently call the disagreement resolved.
8. **S1–S6 versus engine execution.** Original 57 have full source text, but only 20 Sequence rows have a separately reviewed **unconditional static Build Stats** projection. The other **322** are reviewed as *non-static* (not “missing”) and are not thereby generic timeline/buff/status execution. The source review of 54 mechanics profiles is similarly not blanket ENGINE_MODELED coverage.

## Fact/recommendation architecture review

**Separation is correctly expressed in current type contracts.** `CharacterGameData` is identity, intrinsic and Level-90 raw values and explicitly excludes Signature/default/recommended weapon, Echo, team and rotation. `WeaponGameData` owns weapon stats, with effects separately modeled. `CharacterMechanicFact` preserves provenance, `verificationStatus` and **distinct** `modelingStatus` (`MODEL_READY`, `RAW_ONLY`, `PENDING_INTERPRETATION`). `ProfileCatalogs` owns the contextual `WeaponRecommendationProfile`, `EchoLoadoutProfile`, `StatTargetProfile`, `TeamProfile`, source-only `RotationProfile` and the pure-pointer `CharacterBuildPreset`. `src/characterDatabase.ts` projects these owners without inventing a second fact store.

**Potentially misleading presentation/source labels:** a profile's `defaultWeaponId` or `Signature / current reference` label is **not an independent signature-ownership game fact**, and “source VERFIED” attached to a recommendation does not prove player optimality. A source-verified Sequence description is not a fully implemented Sequence effect. The Mornye Minor Forte total differs across owners, so UI and raw consumers can display incompatible results until reconciled. These are review boundaries, not findings authorizing a schema rewrite today.

**No new parallel Character table, inferred weapon/set ranking, automatic canonical promotion, backfilled Level-90 value, runtime behavior or UI state was introduced.**

## Priority for fact completion (separate from build recommendations)

1. **P0 — complete Hsin/Jingran factual source candidates:** separately verify Level-90 convention/Max Energy semantics, Lv1–Lv10 and exact source-fixed move values, Forte/Intro/Outro, passives/sequence, permanent Minor Fortes and provenance. Reuse existing capture; promote nothing without manual review. Only then consider Skills/Sequence/Build UI.
2. **P0 — source-blocked mechanics:** seek authoritative damage-bonus classification for Buling Five Thunders and Xiangli Yao Pivot - Impale, and a source-valid answer to Danjin's impossible full-power threshold. Keep the existing exact coefficients and partial profiles; do not reconstruct numeric values that already exist.
3. **P1 — Mornye Minor Forte:** reconcile +10% (intrinsic summary) against +12% (pinned node tree and active Build Stats) and explicitly update the shared source/audit boundary if evidence warrants it. Avoid a silent UI-only fix.
4. **P1 — pending Max Energy and Brant review:** preserve Qingxiao/Rover Electro/Suisui `null` until field semantics are independently established; inspect Brant's retained provenance conflict only when it materially affects a consumer.
5. **P2 — independent Signature Weapon fact relationship only if needed:** source-review the *factual* relation separately from guide-recommended/default weapon candidates; otherwise keep it out of the gameplay catalog.
6. **P2 — sequence/effect execution proof:** when a specific Character is prioritized downstream, reuse existing source-verified states, buffs and S1–S6 descriptions, and add scoped/verified adapters for trigger, scope, resource, stack, target, duration and ordering. Do not mark gameplay or UI COMPLETE because the raw facts exist.

## Audit provenance and test boundary

Authoritative owner chain: [AGENTS](../../AGENTS.md) → [Development Process](../DEVELOPMENT_PROCESS.md) → [Project Status](../PROJECT_STATUS.md) → [Character Database](../CHARACTER_DATABASE.md) and [Data Verification Policy](../DATA_VERIFICATION_POLICY.md). Scoped fact owners: [Character catalog](../../src/data/characters.ts), [raw pending](../../src/data/characterRawAudit.ts), [intrinsic](../../src/data/characterIntrinsicStats.ts), [mechanics](../../src/data/characterMechanics.ts), [ACTIONS](../CHARACTER_ACTIONS_COVERAGE.md), [FORTE](../CHARACTER_FORTE_RULES_COVERAGE.md), [Inherent](../CHARACTER_INHERENT_PASSIVES_COVERAGE.md), [sequence source](../../data/source/character-sequence-ui.json), [Sequence projection](../UI_SEQUENCE_SOURCE.md), [Forte source](../UI_FORTE_TREE_SOURCE.md), [mechanics source blockers](../../src/data/characterMechanicsSourceReview.ts), [source review dispositions](../CHARACTER_MECHANICS_SOURCE_REVIEW.md), [six-area audit](../../src/data/characterMechanicsAudit.ts), [weapon core audit](../../src/data/weaponRawAudit.ts), [Weapon Effects audit](../../src/data/weaponEffectAudit.ts).

**Verification on this documentation-only change:** independent deterministic joins of all `RELEASED` Character IDs, Lv90 nulls/catalog status, existing canonical ACTIONS/FORTE/Inherent audit partitions and original 57/342 Sequence source snapshot plus 20/322 classification review; inspect Markdown row counts, relative links and changed files. No new gameplay tests, real-browser validation, source pin changes or full CI was run as part of the fact inventory. All Worker 4 Augusta and Worker 5 Cartethyia branches/docs remain untouched. No merge.
