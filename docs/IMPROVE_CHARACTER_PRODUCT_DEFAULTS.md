# Improve Character Hard/Flex product defaults and Expected Tuners (Draft #365)

## Scope and source boundary

This is **presentation/account Improve only**, not a gameplay claim or a rewrite of the
canonical Improve policy, Echo RNG, private gross-Tuner Bellman mathematics,
AccountStore, Build, Inventory or DPS Lab. The source of relative substat relevance is
`src/data/characterEquipmentAssociations.ts` projected via
`src/characterRecommendations.mjs` and `src/characterPriorityGuidance.mjs`.
Those guide records provide rankings and conditions; **none supplies a universal
per-Echo minimum, required Hard pair, or required Flex count**.

Bellibing explicitly chooses a product convention for a conservative, reviewed
set of ordinary CRIT DPS characters: Hard **CRIT Rate + CRIT DMG**, Flex
the first (up to 3) individually mapped, unconditioned applicable non-CRIT
substats in actual guide priority order, **all Hard AND at least 1 Flex**.
All minima are the **lowest existing canonical Rank-5 substat roll tier**,
not source-verbatim target thresholds or estimated optimum values.
Conditional whole-build Energy Regen is excluded: its target depends on actual
build/rotation and cannot be forced on every Echo. Compound tied aliases are
not arbitrarily promoted as individual priorities. ER Target remains separate.
Manual / Customize preferences are account-owned and take precedence.
A visible **Restore Hard/Flex Recommended** control explicitly restores the
Character's product default and clears only that Character's saved V3 override
through AccountStore. A Character without an approved default instead sees
**Restore source priorities (Hard/Flex default pending)**. Existing resource
budgets, other Characters and pending legacy settings are preserved.

## Verified source eligibility / pending coverage

- **26 scoped ordinary CRIT DPS**: Aemeath, Calcharo, Camellya, Carlotta,
  Changli, Chisa, Chixia, Danjin, Encore, Galbrena, Hsin, Jinhsi, Jiyan,
  Lingyang, Lucilla, Lucy, Luuk Herssen, Phoebe, Phrolova, Qingxiao,
  Qiuyuan, Rebecca, Roccia, Rover (Havoc), Xiangli Yao, Zani.
  These must all have an unambiguous CRIT Rate/CRIT DMG source main-stat
  first cost-4 slot and valid mapped priority content, or the adapter
  deliberately returns Pending.
- **Augusta**: retains the previously owner-approved, canonical
  Hard CRIT Rate/CRIT DMG, Flex ATK% / Heavy Attack DMG / Energy Regen /
  Flat ATK, Flex count 1, minimum tiers unchanged. The existing ordinary
  account Improve adapter treats **Energy Regen as a separate whole-build
  target** and therefore shows three Flex rows (ATK%, Heavy Attack DMG, Flat ATK)
  in the per-Echo UI; no ER math or policy semantics were changed.
- **32 Pending** (complete source-ID list): `aalto`, `baizhi`, `brant`,
  `buling`, `cantarella`, `cartethyia`, `ciaccona`, `denia`, `hiyuki`,
  `iuno`, `jianxin`, `jingran`, `lumi`, `lupa`, `lynae`, `mornye`,
  `mortefi`, `rover-aero`, `rover-electro`, `rover-spectro`, `sanhua`,
  `sigrika`, `suisui`, `taoqi`, `the-shorekeeper`, `verina`,
  `yangyang`, `yangyang-xuanling`, `yinlin`, `youhu`, `yuanwu`,
  `zhezhi`. The reasons differ: support/healer or hybrid priorities, HP/DEF
  mechanics, conditional CRIT/ER, no unambiguous reviewed DPS scope, or a
  source configuration that does not justify automatic per-Echo Hard/Flex.
  Existing source priority display is not a reviewed requirement policy.
  **Pending is not a claim that these Characters can never benefit from CRIT.**

Coverage refers to **Bellibing product defaults**: 27 of 59 including Augusta.
It is **not** 27 source-certified per-Echo requirement policies.

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

## Test and release boundaries

- Focused Node: roster exact count, source gate, Qingxiao/Support/Augusta
  boundaries, canonical minima, explicit Recommended/reset and
  verified/Pending status-DTO adapter.
- Chromium: actual compiled Improve account UI for Augusta, Qingxiao,
  Baizhi with isolated synthetic owned records; manual edit -> Character
  switch/reload -> Recommended; HTTP mock covers verified and
  unavailable response display; unchanged Inventory item bytes.
  Historical source-only accounts may present an editable default after
  existing account normalization; that is not a reviewed Hard/Flex policy.
- Existing CI account/Build/Inventory/Improve and filter regressions run in
  the same Draft gate. Mock HTTP is not private-engine numeric verification.
- Remaining: real owner Windows account/character/preset reproduction,
  actual paired private echo-advisor response for Qingxiao/default and
  other representative presets, broader FULL/UI Lab, production acceptance.
  No merge or deployment.
