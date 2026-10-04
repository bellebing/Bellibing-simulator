# Bellibing Simulator — Current Project Status

## Current work — Character Target Recommended UI wiring (checkpoint)

PR #228 is **MERGED / CLOSED** at canonical main `d95a3ccf439e4346a6496d91b95bce665622ee52`, from reviewed head `f24053c8255f0b5011a259d9c4e14345af599a3f`. AI Handoff **UPD-321** records the merge closeout, with accepted pre-merge evidence in UPD-320. Post-merge **Verify #1805 / Export #1527 / Deploy #169 SUCCESS**. The source/domain foundation is integrated; obsolete OPEN/DRAFT merge-review wording is superseded.

Draft **PR #229** continues **Improve → Character Target Recommended UI wiring**, based on that canonical main. The user-selected product policy is now a single visible target basis: **verified modern DPR DEFAULT CALC_BENCHMARK**. Exactly one safe modern DEFAULT profile is required; its explicit Calc rows alone own the displayed stat table. Each row contains one label and one formatted value, without secondary lines or source annotations. Exact unrounded Calc references retain their source role underneath. This establishes Bellibing's presentation policy; it does not relabel the DPR source as a universal recommendation or introduce evaluator semantics.

Prydwen recommendations remain preserved and VERIFIED; DPR **GENERAL_RECOMMENDATION** remains preserved independently. Neither family is displayed in Character Target, and neither fills missing Calc metrics. Brant's legacy **CALC_SCENARIO_REFERENCE** remains preserved contextual data and never supplies an automatic target. Variant-only Aemeath, Iuno and Qiuyuan stay Pending; Galbrena uses DEFAULT rather than its WIP variant. Suoming retains five explicitly blank Calc Pending rows. Missing modern sources show compact overall Pending. Deterministic `character-targets.mjs` is generated from the source-owned adapter with strict source parity shared by source/GitHack and built previews.

Under this rule **19 catalog identities** have usable automatic Calc targets: Augusta, Cartethyia, Chisa, Denia, Galbrena, Hiyuki, Hsin, Jingran, Lucilla, Lucy, Luuk Herssen, Lynae, Mornye, Phrolova, Qingxiao, Rebecca, Sigrika, Suisui and Xuanling (`yangyang-xuanling`). **17 are RELEASED/selectable**; Hsin and Jingran retain their canonical pre-release status. Pending groups: **3 variant-only** (Aemeath/Iuno/Qiuyuan), **1 blank Calc** (Suoming), **1 legacy-only** (Brant), **36 without usable modern source profiles**. Prydwen or General existence alone cannot contribute to this coverage. Without usable modern source profiles: `aalto`, `baizhi`, `buling`, `calcharo`, `camellya`, `cantarella`, `carlotta`, `changli`, `chixia`, `ciaccona`, `danjin`, `encore`, `jianxin`, `jinhsi`, `jiyan`, `lingyang`, `lumi`, `lupa`, `mortefi`, `phoebe`, `roccia`, `rover-aero`, `rover-electro`, `rover-havoc`, `rover-spectro`, `sanhua`, `taoqi`, `the-shorekeeper`, `verina`, `xiangli-yao`, `yangyang`, `yinlin`, `youhu`, `yuanwu`, `zani`, `zhezhi`.

Augusta displays exactly **ATK 2,407 / CRIT Rate 84.7% / CRIT DMG 225% / Energy Regen 120% / Heavy Attack DMG 29.2%**, from Calc references 2406.536 / .847 / 2.25 / 1.2 / .292. Prydwen HP/DEF/Electro rows are absent from this selected basis. Customize target metrics, persistence, Gate, Every Echo, Flex Stats and CharacterBuildState retain their existing contracts. **Build Need, Improvement Cost, Character comparison and the new Improve evaluator remain Pending. BUG-042 remains MEDIUM / KNOWN GAP**. Roster-wide recommendation completion is not claimed.

Checkpoint audit is against freshly fetched canonical main `d95a3ccf439e4346a6496d91b95bce665622ee52`, continuing the accepted reviewed iteration `d9885d31130c376b2936e169f9df63739ebb2bae`. The complete PR diff preserves PR228 source/domain data, evaluator/combat code, policy/state semantics and equipment ownership. Checkpoint-only changes extend the Character Target browser verifier to three desktop sizes and Suoming, run it in Verify, retain screenshots, bound Chrome profile cleanup retries, and update this current section; historical sections remain intact.

Local checkpoint: **158/158 focused tests PASS**, including **25 presentation tests**; the full repository runner reports **215/215 test files PASS** (Node 22 isolates each test file). Explicit strict TypeScript (`tsc -p tsconfig.web.json --noEmit`), strict build, generated browser/source parity, modern/legacy DPR extraction JSON/module parity, semantic source pins and whitespace **PASS**. Source and built real **Chrome 151.0.7922.173** pass **1440×900 / 1920×1080 / 2560×1440** for Augusta's exact five rows, Galbrena DEFAULT, Aemeath/Chixia Pending, Suoming's five blank Pending rows, one value per row and compact containment. The existing full Improve regression covers accepted settings layout, Gate, Every Echo/Flex, Customize minimum/preferred validation, editing/addition, reload, Use Recommended/reset, source outage/recovery and migration, selector clearance, five Echoes and Current/Candidate ownership. No product behavior was changed for checkpoint.

The final exact-head **Verify / Export** results and SHA are recorded in the PR229 checkpoint evidence and the single new AI Handoff update after the required workflows finish; each workflow is launched once by the final checkpoint push. Initial checkpoint Verify #1806 passed **1,355/1,355 individual full-suite tests** and the entire Character Target matrix in Chrome 154.0.8037.57, then failed on an ENOTEMPTY temporary Chrome-profile cleanup race; the verifier now uses bounded removal retries. Export #1528 succeeded on that initial checkpoint head. This validation-only repair does not change product behavior. **PR #229 remains OPEN / DRAFT / UNMERGED**, ready for final user merge review only after those checks succeed. BUG-042 remains **MEDIUM / KNOWN GAP**; BUG-043/044 remain **FIXED**. Build Need, Improvement Cost and evaluator remain Pending. Remote GitHack cannot be fetched in this environment (proxy CONNECT 403); source-relative and built runtime checks establish local/CI evidence, not remote-host availability.

## Integrated Character recommendation source/domain foundation — merged PR #228

See [schema, source review and pilot outcome](CHARACTER_RECOMMENDATIONS_AUGUSTA_REVIEW.md). Typed metric/unit and recommendation semantics, exact evidence/context pins and fail-closed domain projection remain separate from legacy `StatTargetProfile.gates`, priorities and Echo policy. Direct primary guide access was blocked; the exact externally supplied current Prydwen capture retains its provenance and source binding. Explicit reviewed interpretations now preserve trailing-plus ranges as **OPEN_ENDED_BAND** with minimum/upperReference and no evaluator meaning. **Augusta: 7/7 VERIFIED, 0 PENDING, 0 REVIEW_REQUIRED; source review CURRENT, all 7 comparison statuses PENDING**. Candidate/legacy evidence cannot auto-promote, and cited current-source disagreement still requires review. Roster-wide Character recommendation coverage remains **Pending**. Native DPR discovery scanned **56** tabs (including hidden tabs), found **25** explicit General/Calc tabs across **23** Character identities and **25** variants, and preserves **236 VERIFIED numeric / 10 blank PENDING / 0 ambiguous** rows. General and Calc remain independent REFERENCE roles. The native Sheet identity plus deterministic semantic extraction is pinned by SHA-256 `d3ca38885f16cadf82aa86ea5e48318e205dd9f3a42e4e1037a8c341fdcb0a8d`; old/new XLSX byte hashes are transport provenance only and never block ingestion. The count is dynamically discovered, not hardcoded, and does not prove complete RELEASED coverage. See [DPR source strategy and complete mapped inventory](CHARACTER_RECOMMENDATIONS_DPR_REVIEW.md). Second-pass native legacy discovery inspected all **18** Character tabs without modern blocks, yielding Brant **12 independent CALC_SCENARIO_REFERENCE scenarios / 36 VERIFIED ER/CR/CD rows**, and one unpromoted Aerover component-layout ambiguity. The complete matrix covers **43 Character tabs / 38 identities**, with **23 identities having usable numeric DPR references / 15 without**. V2 semantic manifest pin is `ee779803e784355bd1de45a954b43cf54cfc4f7a25475886a7825bca42fd5698` under **DPR_NATIVE_SEMANTIC_V2**, transitively binding the unchanged V1 modern pin. Combined DPR numeric coverage is **272 VERIFIED / 10 blank PENDING**; source scenarios are never averaged/ranked into recommendations, and Substat Value/damage/rDPR tables remain excluded. This does not prove complete 57-Character recommendations.

The source/domain foundation did not change the visible UI. The presentation iteration above now wires its reviewed projections while all comparison/evaluator work remains Pending. Legacy scenario and source trust boundaries are preserved.

## Accepted Improve Settings foundation — merged PR #224

The Improve Settings UX has been **visually accepted** through iterative review at runtime head `8a592765a67488c22dc5fddd2ed4e6bd7ed20a31`. PR #224 is **MERGED / CLOSED** at canonical main `269682d30fb395ed58414a3f671677c1586f56b3`. Its accepted checkpoint evidence is recorded on PR #224 and in AI Handoff UPD-318/UPD-319; post-merge Verify has the unrelated unresolved Sequence observation described above.

The current controls are **Character Target / Gate / Every Echo / Flex Stats**, with one visible global **Recommended / Customize** mode (`MANUAL` remains the persisted enum). All four sections expand together in their own columns. **Roll Quality is retired from the visible UI**; historical persisted labels and recovery copies remain compatible and have no new global Mid+/High+ threshold mapping.

**Every Echo** expresses hard per-Echo stat requirements. **Flex Stats** expresses relevant/value-producing stats, not “at least one required.” Active rows are highlighted without checkboxes. Customize supports stat toggles, Every Echo/Flex exclusivity, ordered Flex stats with physical drag and keyboard reorder, and Reset to Recommended. Show other stats exposes less-relevant canonical stats. Source requirement groups remain preserved domain evidence; the UI's Flex projection does not execute their acceptance condition or fabricate a reviewed preference ranking.

Both columns use **per-stat discrete minimum-roll sliders** from canonical `SUBSTAT_VALUE_TABLE` Rank-5 values. Recommended keeps grey read-only tracks, visible thumbs at the exact threshold and readable numeric values; Customize uses gold interactive sliders. Augusta's source-backed minima are Every Echo **CRIT Rate 9.3% / CRIT DMG 21%**, Flex **ATK% 6.4% / Energy Regen 6.8% / Heavy Attack DMG 6.4%**. No arbitrary percentages, new canonical values, or global quality mapping are introduced.

**Character Target canonical recommendation coverage remains Pending.** Recommended shows a Pending scaffold, including Augusta HP/DEF/ATK/CRIT Rate/CRIT DMG/Energy Regen/Electro DMG Bonus; legacy ER-only guidance is not the complete Character recommendation. Customize's six user-defined target metrics remain separate, with validated ratio/point persistence and Pending comparison basis. Gate keeps **+5/+10/+15/+20/+25** behavior. **Build Need remains Pending; Improvement Cost and the new Improve evaluator are not implemented.** This does not remove independent legacy evaluators elsewhere in the repository.

Shared v3 intent/state/migration and canonical policy sources retain fail-closed source/context recovery. v1/v2 storage remains untouched recovery input; Recommended clears overrides and preserves Gate/legacy labels, while Customize alone adds none. CharacterBuildState remains equipment truth; Current/Candidate ownership, five equipped Echoes, selector clearance and accepted workspace are unchanged. Source and built previews both use canonical compiled modules with generated-module parity. This checkpoint repairs the built preview's missing `echo-policy-presentation.mjs` copy and aligns the existing Chrome suite with the accepted controls.

**BUG-042 remains MEDIUM / KNOWN GAP** for missing roster-wide reviewed Echo requirements/preferences: 1/57 reviewed Echo requirements, 0/57 reviewed Recommended Echo preference orders. The existing 24/57 numeric source targets and 44/57 priorities are historical source-section coverage, **not** a complete dedicated Recommended Character Stats dataset. BUG-043's source packaging fix remains independently verified. Unrelated bugs retain their recorded status. Remaining work includes dedicated canonical Character recommendations, roster-wide Echo policy coverage, Build Need, Improvement Cost, comparison/ER satisfaction, replacement evaluation, DPR/DPS, weights/probabilities, Team and mobile. The new Augusta-only source/data work above is now authorized; UI/evaluation work remains deferred.

## Historical Improve policy UI integration — PR #224

PR #224 remains **OPEN / DRAFT / UNMERGED**, awaiting **visual review**. Improve Settings uses global Recommended / Manual mode with four compact controls: Character Target, Gate, Echo Policy and Roll Quality. The visible v2 Valuable Stats model and Simple badge are retired; compiled shared v3 state and a pure TypeScript adapter drive the browser. v1/v2 storage and migration assets remain untouched recovery inputs.

The raw repository/GitHack review runtime is now self-contained. `docs/ui-prototypes/assets/improve-settings.js` resolves its policy imports through checked-in `docs/assets/echoCoreRules.js`, `docs/assets/improvePolicyState.js` and `docs/assets/improvePolicyPresentation.js`. These files are deterministic TypeScript compiler output from the canonical `src/` modules, generated by `scripts/export-ui-improve-settings.ts`; they are not a second hand-maintained policy implementation. Strict build recompiles the canonical sources independently and fails on generated-module drift. The built Export review path remains supported in parallel.

Augusta distinctly shows whole-build ER **116% minimum / 125% preferred**, conditional ER-first priorities and CRIT/ATK ties. Echo Policy separately displays **CRIT Rate ≥9.3%, CRIT DMG ≥21%**, plus **at least one** of ATK% ≥6.4%, ER ≥6.8%, Heavy Attack DMG ≥6.4%. Recommended Echo preference ordering remains Pending. Source coverage remains numeric targets 24/57, canonical priorities 44/57, Echo requirements 1/57 and Echo preferences 0/57.

Manual supports six numeric target metrics with canonical ratio/point storage, validation, USER_DEFINED basis and Pending comparison; requirements without invented thresholds; sparse section inheritance/reset; explicit empty preferences; physical drag and keyboard preference ordering. Combination groups stay intact. Build priorities remain read-only and generic group authoring is deferred visibly. Temporary source failures preserve intent; context drift surfaces Needs review. Gate, Quality, CharacterBuildState, Candidate, selector clearance and accepted workspace dimensions remain intact.

Runtime checkpoint `3557ae279a60326fd06f186b3c32f69614e82113` passed **57/57 focused tests**, **1254/1254 full tests**, standard `npm test` (**210 files**), strict web build/generated-module parity and whitespace. Repository Verify served the repository root and built `dist` separately and ran the same real-Chrome Improve/workspace regression against both. The source/GitHack-relative runtime and built Export runtime each passed **1440×900, 1920×1080 and 2560×1440**, including the Settings heading/mode/controls, Augusta source policy, Character Target and Echo Policy expansions, exact ER/Echo requirements, physical selector hover/clearance, Manual editing/order, source outage/recovery, migration/reload isolation and unchanged Candidate/equipment/workspace ownership. Verify run 37109970344 and Export run 37109970338 are SUCCESS for that runtime checkpoint. Final exact-head evidence is recorded on PR #224 and AI Handoff. See [current UI contract](UI_IMPROVE_SIMPLE_SETTINGS.md).

**BUG-043 is FIXED in PR #224**: the source/GitHack entrypoint previously imported browser policy modules that existed only in the Export tree, so module loading stopped before Settings DOM population. The checked-in generated source modules plus source-preview Chrome regression close that packaging gap. **BUG-042 remains KNOWN GAP** for missing roster-wide reviewed Echo policy/preference coverage. Build Need, comparison/ER satisfaction, replacement evaluation, DPR/DPS, weights, probabilities, Roll Quality mapping, Team and mobile remain **PENDING**. Do not merge or automatically start the evaluation slice; stop for visual review.

## Historical Improve policy state and v2 migration — PR #224

PR #224 remains **OPEN / DRAFT / UNMERGED**. The authorized continuation adds a DOM-free policy state/reducer and explicit migration API only. The accepted visible Valuable Stats v2 UI and its original storage/module remain unchanged. CharacterBuildState is still the sole equipment/build truth; no Build Need, ER satisfaction, deficit, score, replacement ranking, Roll Quality threshold, Team or mobile logic is added.

`src/improvePolicyState.ts` introduces **schema/envelope version 3**, stored separately at **`bellibing.improve.policy.v3`**. Per-Character intent includes preset/reviewed context binding, one `RECOMMENDED` / `MANUAL` mode, sparse numeric-target / Character-priority / Echo-requirement / Echo-preference overrides, Gate, Roll Quality and migration-review information. Domain section types are reused. Recommended has no user overrides and resolves current reviewed sources on every read; missing sections remain PENDING. Choosing Manual alone creates no overrides. Absent sections inherit Recommended; explicit empty arrays remain user-defined empty sections. Reset or Manual → Recommended clears policy intent, preserves Gate/Quality and cannot resurrect deferred legacy intent.

The source contract now exposes reviewed `applicability` independently of section readiness and distinguishes current source review, temporary unavailability and review-required drift. Manual overrides retain their original Character/preset/context binding. Mismatched contexts and invalid saved section content suspend effective overrides while preserving their original saved intent. Compatible overrides survive independent source-section drift; untouched Recommended sections fail closed. Temporary context failure masks effective sections without overwriting saved mode/overrides, so reload and Gate/Quality edits survive and recovery restores compatible intent. Compatibility/review reasons are available to the later UI.

Explicit v2 → v3 migration leaves **`bellibing.improve.simple-settings.v2` untouched as the recovery copy**:

- Preserve valid Gate and Roll Quality; invalid legacy labels normalize to +5 / All Rolls. Deferred v1 records already held inside the v2 envelope carry only these labels forward, without interpreting their old selected pool/count.
- v2 Recommended → Recommended with no overrides; its old empty Active list is not policy content.
- Require both the top-level and nested Valuable Stats schema to be v2, then validate the exact Character/preset/profile/provenance/pool/notes binding against the old projection and current reviewed source context. Valid Manual Active order becomes **Echo preferences only**, with unique eligible canonical stat names in saved order and deterministic priority groups 1…N. No weights, thresholds, Echo requirements, Character targets/priorities or Build Need are inferred.
- Explicitly empty Manual Active becomes Manual with an explicit empty Echo-preference override. Invalid/duplicate names are excluded effectively with original order retained for review; all-invalid nonempty intent is suspended rather than reinterpreted as explicit empty.
- Unverifiable/incompatible bindings retain original migration intent as PENDING or REVIEW_REQUIRED with effective user preferences suspended. Gate/Quality edits and reload preserve that intent; only matching source recovery may complete migration. Reset/clear explicitly discards the deferred preference intent.
- Unvisited Characters stay independently deferred. Persistence writes only intent/bindings/review information, never Recommended projections, Available pools, builds, totals, deficits or evaluations. Writes are immutable and failed writes do not mark a store committed. Unknown/corrupt new versions fail closed rather than falling back over saved state.

API: `loadImprovePolicyStorage`, `readImprovePolicyState`, `resolveImprovePolicyState`, `updateImprovePolicyState`, `persistImprovePolicyState`, plus explicit create/migrate functions. Reducer actions set/clear each section, select mode/reset and edit Gate/Quality; no UI adapter calls them in this slice.

Validation: **23/23 new state/migration tests**, **47/47 combined state/source/v2 focused tests**, **1244/1244 full tests**, standard `npm test` (**209 files**), strict web build and whitespace **PASS**. Initial state implementation checkpoint `3159cfb083bbab583629ef8363c1ed23706215a3` passed [Verify #1787](https://github.com/bellebing/Bellibing-simulator/actions/runs/37104628426) and [Export #1509](https://github.com/bellebing/Bellibing-simulator/actions/runs/37104628437), including the full Chrome regression and clean exact-head review-build assertion (1242/1242 tests at that checkpoint). The final nested-schema/deferred-label hardening adds two focused regressions. Exact final head and repository Verify/Export evidence are recorded on [PR #224](https://github.com/bellebing/Bellibing-simulator/pull/224) and AI Handoff to avoid self-referential status commits; the existing full Chrome regression remains required.

**Stop for state/migration review. Do not merge or automatically start the UI/evaluation slice.** UI integration/controls, measurement-basis comparison, missing numeric targets, Qiuyuan canonical naming, Echo requirements for other 56 Characters, Recommended Echo preferences for all 57 and Roll Quality mapping remain **PENDING**. **BUG-042 is unchanged**; migration does not establish the missing v2 ranking/default recommendation data.

## Historical Improve policy domain/source contract — PR #224

PR #224 remains **OPEN / DRAFT / UNMERGED**. The approved continuation adds only the separate Improve policy domain/source contract: Character numeric targets, Character build priorities, finished-candidate Echo requirements and Echo preferences have independent readiness/origin. The contract defines one `RECOMMENDED` / `MANUAL` mode and sparse user override sections; omitted sections inherit Recommended policy. This slice introduces no Manual editor, persistence migration or UI adapter.

`src/improvePolicyDomain.ts` owns the unambiguous types; `src/improvePolicySources.ts` projects current verified registry data against the explicit source review in `src/data/improvePolicySourceReview.ts`. Numeric gates preserve minimum/preferred and source-described basis separately from priorities. Priority groups preserve ties; source conditions/relations remain verbatim notes/provenance, never parsed into executable predicates or numeric deficits. Source-valid targets do not yet establish comparability with static Build Stats: comparison remains **PENDING**.

Default RELEASED-roster coverage is independently audited:

| Concept | Verified projection | Remaining scope |
| --- | --- | --- |
| Numeric total-stat targets | **24/57**, all existing ER-total gates | No CRIT/ATK/HP targets inferred from prose; missing gates PENDING |
| Build-stat priorities | **44/57** canonical projections | 45 verified default source profiles exist; Qiuyuan's `Heavy Attack DMG%` is unsupported and remains PENDING |
| Finished-Echo requirements | **1/57**, matching Augusta standard context | Other 56 Characters PENDING; no inference from build priorities |
| Echo preference order/ties | **0/57** | Core/Useful roles do not establish preference ordering |
| Build Need / replacement evaluation | **Not implemented** | Requires a later qualified CharacterBuildState comparison/evaluation slice |

Augusta's Character Target retains **116% ER minimum / 125% preferred** with the recorded context/basis. CRIT Rate = CRIT DMG and ATK% = Heavy Attack DMG remain tied build priorities without invented numeric total targets. Its explicitly approved registered `AUGUSTA_RECOMMENDED_V915` supplies **CRIT Rate ≥9.3% + CRIT DMG ≥21%** on a finished candidate Echo, plus **minimumHits=1** from ATK% ≥6.4%, ER ≥6.8%, Heavy Attack DMG ≥6.4%. Existing non-target roles, final dead-stat constraint, Echo shell applicability, checkpoint reference and provenance remain separate from whole-build targets. No checkpoint/evaluator is executed by this projection, and V9.15 remains a bounded reference rather than current architecture.

Reviewed SHA-256 bindings cover composition, exact source values, notes and provenance for 47 verified presets and the one registered Echo policy. Drift or unavailable sources fail closed to **PENDING with null content**. Explicitly verified-empty is representable but no current missing section is promoted to it. Source pins are not refreshed automatically by builds.

The existing PR224 Valuable Stats v2 UI, state/storage, source export and persisted user settings remain unchanged. CharacterBuildState remains the sole equipment/build truth. No new layout/controls, Build Need, ER satisfaction, DPR, scores/weights, weakest/cheapest replacement, Roll Quality mapping, Advanced Settings, Team logic or mobile adaptation is introduced.

Verified implementation checkpoint: `38852d70a11dc7bc9aeefb046bf4342ace5b9c57`; **13/13 focused domain/source tests**, **1221/1221 full tests**, standard `npm test` (208 test files), strict web build and whitespace PASS. [Verify #1785 / run 37084181317](https://github.com/bellebing/Bellibing-simulator/actions/runs/37084181317) and [Export #1507 / run 37084181315](https://github.com/bellebing/Bellibing-simulator/actions/runs/37084181315) are **SUCCESS** on that exact implementation head, including the existing full browser regression. The final closeout head and its exact Verify/Export evidence belong on PR #224 and AI Handoff to avoid self-referential status commits.

**Stop for domain/source review. Do not merge or automatically start the UI/state or evaluation slice.**

## Historical Improve Valuable Stats v2 foundation — PR #224

PR #224 remains OPEN / DRAFT / UNMERGED. The Valuable Stats-only continuation replaces the required-hit count model with ordered Active and derived Available vertical lists, Manual selection/reordering, accessible up/down actions and Reset to Recommended. Gate, Roll Quality and the accepted Improve workspace/selector clearance are preserved.

Current verified profiles provide **44 READY / 13 PENDING** stat pools, but no static v2 DPR ranking or default Active set. Recommended ranking remains **PENDING**; baseline Active is empty (**0 of M selected**) and Available uses neutral canonical/source order. No ER, tier, DPR or evaluator logic is introduced.

Versioned v2 storage preserves valid Gate/Quality, discards semantically incompatible v1 eligible-pool/count settings, migrates Characters independently and retains deferred legacy or valid v2 configuration during temporary source failure. Binding/profile/provenance drift fails closed. See [Valuable Stats v2 contract](UI_IMPROVE_SIMPLE_SETTINGS.md) for exact migration and source boundaries. Final verification evidence and exact review head belong on PR #224 and AI Handoff. Stop for visual review; do not merge or start another slice.

## Historical Improve Simple Settings — PR #224 functional review repair

Canonical main at the functional-repair checkpoint was `b2c160333c4391988f02ae01fab5309791e47bd4` (PR #223 merged). PR #224 remains **DRAFT / UNMERGED**. Its original head `67ea031cc0660de4cf55146a15fd595b4676cda2` failed **Verify #1755** with `Improve Settings: hover selector collision at 1440`. The earlier local pass did not establish a green full Verify.

The functional review target is now the exact-head **built `bellibing-web-dist` artifact**, opened through `START_UI_PREVIEW.bat` at `/ui-preview/`. `review-build.json` identifies its commit and working-tree state. Both Verify and Export check out the PR head explicitly. Rawcdn source HTML is no longer the functional review target; `?improve-layout-preview=1` remains supplemental layout evidence only.

The old Character loader conflated an empty catalog with an active request. Its catch logged the failure but left the picker showing `Loading Characters…` indefinitely. The loader now exposes **PENDING → READY (57)** or **ERROR**, rerenders after settlement, and aborts an actual stalled request after 15 seconds. A failed request displays `Character catalog unavailable. Reload to retry.` The exact old rawcdn URL returned an external-content notice and then loaded 57 Characters during fresh reproduction; the user's original transport failure was not recoverable. Blocking that manifest request reproduced the stuck label on the original code.

Improve reserves the selector's actual animated bounds during entrance/hover as well as its settled 250px envelope. The old entrance was measured with a card bottom at 704px over Settings starting at 340px. Card dimensions, scale, spacing and easing are preserved. Settings and the accepted workspace retain their existing design and normal vertical flow. No Advanced Settings or decision-engine work is included.

Verify #1756 exposed a second verification issue: Linux headless Chrome did not activate physical hover. The old assertion reported both missing hover and overlapping bounds as "hover selector collision". The harness now declares and asserts desktop mouse capabilities at browser launch, using Chromium's standard settings also used by Playwright, and checks activation separately from geometry. No app class or `matchMedia` result is injected.

Verify #1757 passed the real-Chrome account, every-frame hover, Settings and Candidate regressions. Its later carousel check still compared the wheel with the shell's outer border box, ignoring the symmetric native scrollbar gutters. That assertion now requires an exact match to the shell's content box while independently retaining center, width cap, roster, spacing and horizontal clipping checks. All distinct Verify suites remain; duplicate runs against the same built runtime were removed after replacing the source-HTML target.

Local repair validation: **1203/1203 tests**, strict build and whitespace pass. A fresh-profile real-Chrome regression physically runs **Home → empty Improve → Build catalog (57) → Augusta → configure S1 → Add to Account → Improve → Augusta → interactive Simple Settings**. It checks every animation frame for collision at **1440×900 / 1920×1080 / 2560×1440**, pending/failure/reload recovery and unchanged equipped/Candidate ownership. Existing Settings and Candidate suites pass. **Full Verify #1758 / run 36964129738 SUCCESS**, including all coverage gates, 1203/1203 tests, strict build, the complete real-Chrome regression, visual artifact and whitespace check. **Export #1480 / run 36964129740 SUCCESS**. These runs validate the repaired implementation; this final documentation update does not change runtime code. The exact final documentation head and its checks are recorded on [PR #224](https://github.com/bellebing/Bellibing-simulator/pull/224) and AI Handoff.

The existing source/state contract remains **44 READY / 13 PENDING** Valuable Stats profiles, per-Character settings storage, and **Pending** universal roll-tier thresholds. See [Improve Simple Settings](UI_IMPROVE_SIMPLE_SETTINGS.md). **Stop for review; do not merge.**

## Character Mechanics INHERENT_PASSIVES closeout — PR #223

PR #222 is **MERGED / CLOSED** on canonical `main` as `eaaa4b0f4b5942ee6392cb72d5e95386305399ae`, from reviewed FORTE_RULES head `0c9061728a64630997c8b12ae14267be093b89c3`. PR #223 is the current **INHERENT_PASSIVES closeout** on top of that merged baseline. It does not duplicate or replace the already-integrated ACTIONS/FORTE_RULES work.

Scope remains **INHERENT_PASSIVES only**, plus the required Cartethyia/Rover Windstrings compatibility fix exposed by exact-head verification. No new Character Mechanics area is started. No UI work has started as part of this closeout, and Improve / the decision engine remain untouched.

The pinned Skills/Forte payload contains exactly **114 Inherent Skill rows** across **57 RELEASED Characters** — exactly two per Character. Deterministic RELEASED-roster INHERENT_PASSIVES coverage is **57 VERIFIED / 0 PARTIAL / 0 BLOCKED**. Buling, Danjin and Xiangli Yao receive the six previously missing source-backed Inherent Skill facts; source-explicit triggers/effects/values are preserved and unstated runtime semantics remain `PENDING_INTERPRETATION`.

### Cartethyia Windstrings compatibility checkpoint

PR #223 preserves the source-normalized canonical Cartethyia Inherent Skill fact and fixes the downstream Rover Windstrings consumer contract that still matched an older Bellibing paraphrase. The canonical fact remains source-backed by pinned Skills/Forte move `1003504` (`A Heart's Truest Wishes`): with Rover: Aero in the team, casting `Omega Storm` restores exactly **25 Windstrings**.

The compatibility boundary is explicit and fail-closed. `cartethyiaWindstringsSourceContract.ts` owns the reviewed canonical projection plus pinned source identity/provenance, while `readCartethyiaWindstringsGain()` validates that exact contract instead of regex-parsing stale prose. Wrong Character/fact/name/section/scope/semantic text/provenance/source identity still rejects; existing Rover nominal-gain, team-proof and readiness semantics are unchanged.

Existing independent blockers remain unchanged and fail-closed:

- ACTIONS: **55 VERIFIED / 0 PARTIAL / 2 BLOCKED** — `ACTIONS-BULING-1307031-DAMAGE-CLASS` and `ACTIONS-XIANGLI-YAO-1305015-1305017-DAMAGE-CLASS`.
- FORTE_RULES: **55 VERIFIED / 0 PARTIAL / 2 BLOCKED** — `FORTE-BULING-1307031-DAMAGE-CLASS` and `FORTE-DANJIN-1000807-FULL-POWER-THRESHOLD`.
- Full Character Mechanics: **54/57 VERIFIED** — Buling, Danjin and Xiangli Yao remain `PARTIALLY_VERIFIED`; Outro effects, generic Resource rules and Sequences remain pending for those profiles.

The checked-in [Character Mechanics INHERENT_PASSIVES Coverage](CHARACTER_INHERENT_PASSIVES_COVERAGE.md) report and Verify gate cross-check every RELEASED Character against the pinned source payload. Exact-head Verify remains the merge gate; final review-head and run identifiers belong in the external AI Handoff so this living status file does not become self-referential.

## Merged Character Mechanics FORTE_RULES roster completion — PR #222

PR #222 was normal-merged to canonical `main` as `eaaa4b0f4b5942ee6392cb72d5e95386305399ae` from exact reviewed head `0c9061728a64630997c8b12ae14267be093b89c3`. Its FORTE_RULES payload is now baseline truth for PR #223.

The existing 54 source-complete Character Mechanics profiles keep their already-canonical Forte facts. PR #222 filled only the remaining RELEASED-roster Forte-rule gaps for Buling, Danjin and Xiangli Yao through the existing `ACTION` / `PASSIVE` fact architecture and pinned Skills/Forte payload. Deterministic RELEASED-roster `FORTE_RULES` coverage is **57 total / 55 VERIFIED / 0 PARTIAL / 2 BLOCKED**.

The exact remaining FORTE_RULES blockers are:

- `FORTE-BULING-1307031-DAMAGE-CLASS` — Five Thunders Spell Array cadence, Electro Flare application, Yin-Yang Balance/Harmony replacement and Thunder Spell team-state progression are source-explicit, but the array's own continuous damage still has no source-explicit Character damage-bonus classification. The separate 10%/25% team Resonance Skill DMG Bonus states are not used to infer it.
- `FORTE-DANJIN-1000807-FULL-POWER-THRESHOLD` — Serene Vigil requires Ruby Blossom to reach **over 120** for the full-power branch while the same source caps Ruby Blossom at **120**. Bellibing does not normalize that contradiction to `>=120` or `=120`.

Xiangli Yao's source-explicit Intuition transformations, 24s source limit, Decipher/Law of Reigns thresholds and replacement relationships, and Revamp follow-up are canonical. The source only says Revamp is available “shortly after” Decipher or Divergence, so no numeric input window is invented; runtime timing remains `PENDING_INTERPRETATION`.

PR #221 ACTIONS coverage remains regression-locked at **57 total / 55 VERIFIED / 0 PARTIAL / 2 BLOCKED**. Full Character Mechanics remains **54/57 VERIFIED**. PR #222 is **MERGED / CLOSED**; its source blockers remain explicit and unchanged.

See [Character Mechanics FORTE_RULES Coverage](CHARACTER_FORTE_RULES_COVERAGE.md), [Character Mechanics ACTIONS Coverage](CHARACTER_ACTIONS_COVERAGE.md), and [Character Mechanics Source Review Dispositions](CHARACTER_MECHANICS_SOURCE_REVIEW.md).

## Merged Character Mechanics ACTIONS roster completion — PR #221

PR #221 was explicitly approved and normal-merged to canonical `main` as `fbb84dcffebc8d3e8dc590977bf9be6153dbc0fc` from exact reviewed head `ed583460f1be6271654430a0d041bb8772531e49`. Its pre-merge exact-head Verify #1730 passed **1181/1181 tests**, all source/audit/profile gates, strict build and the full real-Chrome regression. The ACTIONS implementation remains the baseline for PR #222.

PR #221 is the ACTIONS-only Character Mechanics continuation from the prior PR #220 main base. It reuses the existing Skills/Forte source and Character Mechanics candidate/parser architecture; no second skill model is introduced. The canonical registry now carries ACTION-only partial profiles for the three former unstarted Characters so ACTIONS coverage can be audited independently without promoting unrelated mechanics areas.

Deterministic RELEASED-roster ACTIONS coverage is **57 total / 55 VERIFIED / 0 PARTIAL / 2 BLOCKED**. Danjin's ACTIONS are fully source-verified, including exact Lv1-Lv10 enhanced Chaoscleave/Scatterbloom curves, while the contradictory Ruby Blossom `over 120` vs max-120 trigger remains outside ACTIONS as the existing full-profile RESOURCE_RULES/source-review blocker. Buling remains ACTIONS-blocked only by `ACTIONS-BULING-1307031-DAMAGE-CLASS` (Five Thunders Spell Array Continuous DMG classification). Xiangli Yao remains ACTIONS-blocked only by `ACTIONS-XIANGLI-YAO-1305015-1305017-DAMAGE-CLASS` (Pivot - Impale stages 1-3 classification). Exact curves/components/hit shapes/scaling that current sources do support are preserved; the missing damage classes are not inferred.

PR #221 also adds the required shared-system Tune Break ACTION contract for Buling, Danjin and Xiangli Yao, a fail-closed roster-wide ACTIONS audit, a deterministic checked-in coverage report and a regression that derives the newly promoted curves/components through the existing Character Mechanics source parser. Full Character Mechanics verification remains **54/57**: Buling, Danjin and Xiangli Yao are `PARTIALLY_VERIFIED` overall, and all non-ACTIONS coverage areas added by this slice stay `PENDING`.

Scope is intentionally narrow. PR #221 does **not** implement Improve, Team, DPS rotations, profiles/recommendations, UI/layout, Forte rules, resource rules, Inherent passives or Sequence mechanics. It does not reinterpret the V9.15 spreadsheet as current architecture. PR #221 is **MERGED / CLOSED**. Its two source blockers remain explicit and are not changed by merge status.

See [Character Mechanics ACTIONS Coverage](CHARACTER_ACTIONS_COVERAGE.md) and [Character Mechanics Source Review Dispositions](CHARACTER_MECHANICS_SOURCE_REVIEW.md).

## Character Build Card — first reusable read-only presentation

The new `ui/character-build-card-pr218` slice starts from current draft PR218 head `c1709692cbf29d1d544216e7a6eeb06e2f276924`. `Add to Account` retains its existing ownership-promotion semantics and then reveals the newly added Character's build card. The same card can be reopened from Build after edits or reload. It reads the existing saved Character build, canonical Hero Art/Weapon/Echo identities, existing compact read-only Forte renderer and Build Stats projection; no second build model or card persistence is introduced. All five Echoes show their committed stats directly. Primary Stats remain fixed, while finite nonzero bonus rows appear/disappear with saved build changes.

See [Character Build Card contract](UI_CHARACTER_BUILD_CARD.md) for the component API, state ownership and verification. The new real-Chrome gate covers account semantics, canonical presentation, live changes, zero/nonzero rows, five Echoes, multiple card instances, Character isolation, reload and 1440×900 / 1920×1080 / 2560×1440. Existing Improve, Echo Workspace, Team and gameplay/evaluation scope are preserved. Review screenshots use isolated canonical test builds.

This is a **DRAFT / UNMERGED** slice awaiting user visual review. PR218's Verify #1711 is blocked by upstream Echo/Sonata raw coverage drift (six missing Echoes, three missing Sonatas and twelve changed mappings). That source reconciliation is outside this UI slice; the gate remains intact. The continuation PR records its exact head and current Verify result. No merge is authorized.

## PR216 Sequence static Build Stats / Chrome lifecycle stabilization checkpoint

Draft PR #216 now also contains the reviewed **Sequence static Build Stats** projection. The review covers all **57 released Characters / 342 S1–S6 chains** and classifies exactly **20** Sequence levels as permanent/unconditional static Build-stat contributions, **322** as non-static mechanics, and **0** as pending review. Static facts are cumulative: selecting Sx applies reviewed static facts from **S1 through Sx exactly once**. Qingxiao S1 is explicitly reviewed as **+16% CRIT Rate** (sourceChainId 331). Conditional/duration/stack/target/team/skill-specific/combat-state mechanics remain outside Build Stats and fail closed. Sequence state remains Character-owned alongside Weapon, Echo and Forte state; Character switching and reload restore each Character's committed build independently.

The implementation/verifier checkpoint before this status sync is `bed7987be4ae58efc367db9b7201840f38e2cac9`. [Verify #1698](https://github.com/bellebing/Bellibing-simulator/actions/runs/36518357474) completed **SUCCESS** on that exact head with **1171/1171 tests**, strict web build, whitespace and the full browser regression step green. The Sequence real-Chrome verifier passed twice in that run — local built preview and immutable exact-head preview — covering 57 Characters / 342 source-backed details, 20 static Build-stat Sequences / 322 non-static mechanics, Qingxiao S1 provenance, read-only hover, cumulative Set/Remove semantics, Character isolation, reload persistence and desktop geometry. The Build Stats browser gate also passed Qingxiao S0/S1/S3/removal, Character switch/reload isolation and committed Weapon/Echo/Forte/Sequence ownership.

Verify #1697 had already passed all source/unit gates, **1171/1171 tests** and strict build before failing only inside `verify-v34-sequence-runtime.mjs` with `Inspected target navigated or closed`. No product defect was found. The verifier was self-reloading through `Runtime.evaluate("location.reload()")`, allowing Chrome to destroy that execution context before the CDP command received its response. Checkpoint `bed7987...` changes only that verifier lifecycle call to the existing `navigate(send)` path; product/runtime implementation and Sequence mechanics are unchanged.

PR #216 remains **OPEN / DRAFT / UNMERGED**. Do not merge. Preserve the current Sequence static Build Stats behavior, Character-owned build state, cumulative semantics and fail-closed non-static boundary. BUG-030 remains unchanged; BUG-035 and BUG-036 remain **FIX IN PR** pending integration/live verification.

## PR216 finite AppShell / ultrawide review checkpoint

Draft PR #216 now contains a verified desktop finite-workspace checkpoint for the shared New UI. Functional checkpoint `881cf238ca4774a0fc963733a109079966984348` caps the shared application composition at the existing **1280px AppShell maximum** on desktop. The Build workspace now keeps **Stats / Skills / Weapon → Sequence → Character focus → Echoes** inside one centered shell instead of letting viewport-relative offsets diverge toward physical monitor edges. The same shared Character picker implementation is bounded for both **Build** and **Improve** in **EXPANDED / COMPACT / HOVER_EXPANDED** states; the underlying 57-Character roster and existing drag / wheel / keyboard / click semantics remain intact.

Exact functional verification is [Verify #1685](https://github.com/bellebing/Bellibing-simulator/actions/runs/36469469192): **14/14 focused Sequence tests**, **1164/1164 full tests**, strict web build, browser regressions, visual-artifact upload and whitespace all passed. Real Chrome acceptance explicitly passed at **1440×900, 1920×1080, 2560×1440, 3440×1440 and 7680×2160**. The shared Build/Improve picker gate confirms a centered **1280px cap** in all three selector states, fixed shell-local Build relationships, a centerable final roster Character, no horizontal page scroll, preserved physical pointer activation and no selector-driven Hero Art focus movement. Sequence flyout and Character Hero Art gates also pass 3440/7680 containment. A transient immutable Weapon-image load race in the browser verifier was hardened by waiting for the selected Preview image to finish loading; Weapon product behavior/assets were unchanged.

This remains **OPEN / DRAFT / UNMERGED** review-candidate UI work. It does not start the Mobile Adaptation Pass and changes no Character data/mechanics, Build Stats projection, Forte/skill semantics, Sequence commit/effects, Weapon/Echo behavior or team/combat/DPS logic. **BUG-030 remains unchanged**. The documentation-only status commit following the functional checkpoint must retain a green exact-head Verify before this checkpoint is treated as final review-ready state.

## Active draft Character Hero Art integration

PR #216 is a small stacked follow-up based on exact PR #214 head `b2bf583f6729a3cf01b280fca890f73f0d44cd5e`. It reuses PR #215's source-backed `characterHeroArt` resolver/provenance contract and exact IconRolePile blobs, projects that resolver into browser runtime data, and replaces the v34 Build `TEMP CHARACTER ART` center placeholder for 53 READY released Characters. Rover Aero/Electro/Havoc/Spectro remain explicit fail-closed PENDING with no guessed portrait/gender; Jingran/Hsin/Suoming remain excluded. The independent Character focus frame is Sequence-safe and selector expansion/collapse does not move or scale it. Required varied silhouettes and obvious outliers have real-browser visual review evidence; BUG-030 is unchanged. PR #214, #215 and #216 remain draft/unmerged.

## Active draft Forte UI continuation

PR214 continues the existing Build UI stack with a source-ingested Forte tree, persisted per-skill levels and original English skill previews. See [Forte tree source and state contract](UI_FORTE_TREE_SOURCE.md). This is draft/unmerged UI behavior; existing Stats and combat calculations are unchanged, including the documented Mornye source discrepancy. BUG-030 is unchanged. Final exact-head CI evidence belongs on PR214 and in AI Handoff.

## Post-PR203 UI asset state

PR #202 and PR #203 are **MERGED, deployed and post-merge verified**. PR #202 normal-merged the source-backed 181/181 Echo portrait library at `c98ea1162757cd1f78261825a95ab666cdf36476`. PR #203 then normal-merged the selective New UI builder icon foundation at `c6b768ad43ebfa84c692ee4bd406d733c323e137`, with reviewed head `1524a58041e7e40393beb45c176616245f78e73a`; the merge tree exactly matches the reviewed head tree.

The integrated builder foundation contains exactly **819 physical image assets**: 6 Character element icons, 34/34 Sonata icons, 411 unique Character skill icons across 58 source-resolved logical kits, 348 Character-specific S1–S6 chain icons, 20 stat labels backed by 17 unique stat files, and Echo COST 1/3/4. Existing 122/122 Weapon item icons are reused rather than duplicated. Hsin and Suoming remain `UNRELEASED_WIP` and intentionally receive no guessed Character assets. EXP/Tuner/material icons remain `PENDING_SOURCE_MAPPING` until item ID → canonical name → exact asset path is source-resolved.

Post-merge PR #203 verification is green on the exact merge commit: Verify run `35946018624`, Export run `35946018786`, and Deploy run `35946018679` all completed successfully, including live-site verification. This asset work changes no Character mechanics, combat/DPS logic, profiles, readiness or canonical gameplay data. Backend capability therefore remains the post-PR198 state below: PARTIAL_L3 = **54**, PARTIAL_L4 = **28**, readiness **43/3/9/2**, with all **83 pending edges / 72 dependency IDs** and all six Reference Team blockers still open; only Augusta/Ciaccona are DPS_READY.

The active UI lane still includes functional wiring against the integrated manifest-backed libraries, and draft PR #205 remains a separate Character-identity candidate requiring its own user review/merge decision. **The New UI is now in a desktop-first functional stabilization phase.** Until the user explicitly opens the later Mobile Adaptation Pass, UI acceptance is centered on real Chrome at **1440×900** with **1920×1080** and **2560×1440** desktop sanity checks. Do not spend slice scope on new 390×844 / 768×1024 layouts, mobile drawers, touch-specific polish, or mobile acceptance fixes. Existing mobile code is preserved rather than removed, and desktop work must continue to reuse the same state/data/components so the later mobile pass adapts the finished product instead of rebuilding business logic. Mobile adaptation resumes only after the desktop Build/Weapon/Sequence/Echo/Stats/Preview/commit surfaces are functionally and visually frozen. Canonical implementation rules live in `docs/UI_LAYOUT_MOTION_CONTRACT.md`; `docs/UI_BUILD_HANDOFF_V34.md` remains visual/parity reference rather than a second architecture. **BUG-030 remains open** until the relevant real UI/live visual parity is verified; asset availability or documentation alone is not a UI fix.

## Post-PR198 current state

PR #198 is **MERGED, deployed and post-merge verified** at main merge commit `dde1023f0841eb4ea4b553bbc9a76a76ff7a6b2b`. Its parents are previous main `3ce9b150a7a5b1f4bc8947f74411d6df9ac859bf` and reviewed PR198 head `1d1fe8c8f1d095624a79a0ca3673428a545ed759`. Post-merge [Verify](https://github.com/bellebing/Bellibing-simulator/actions/runs/35495502015), [Export](https://github.com/bellebing/Bellibing-simulator/actions/runs/35495502038) and [Deploy](https://github.com/bellebing/Bellibing-simulator/actions/runs/35495502014) all completed successfully on that exact merge commit; Deploy's `Verify live site` job also passed its Alpha, Echo Lab, Roll Assist and Chrome checks. Current capability remains PARTIAL_L3 = **54**, PARTIAL_L4 = **28**, readiness **43/3/9/2**, with all **83 pending edges / 72 dependency IDs** and all six Reference Team blockers still open; only Augusta/Ciaccona are DPS_READY.

Historical PR197 checkpoint: PR #197 is **MERGED, deployed and post-merge verified** at `3ce9b150a7a5b1f4bc8947f74411d6df9ac859bf`. Its parents are previous main `f2f8db676ba9433d065e7b18d854e0245e77d9dd` and the exact authorized reviewed head `7c84b1d4c7246954400cc66e281828592d6487df`. Tree `c4b66ff8ea2cf2cfcea4c9e5ec6bfa64a6285e3d` exactly matches the reviewed payload; no squash, rebase or branch rewrite occurred.

Post-merge [Verify #1150](https://github.com/bellebing/Bellibing-simulator/actions/runs/34781244713), [Export #1049](https://github.com/bellebing/Bellibing-simulator/actions/runs/34781244703) and [Deploy #152](https://github.com/bellebing/Bellibing-simulator/actions/runs/34781244705) passed on that exact main commit. Local and all three CI test logs report **864/864 tests, zero failures**. All nine local audits, strict build, whitespace and the local/live Chrome regressions pass. All 289 exported files match the reviewed and local builds; Alpha, `/ui-preview/`, Echo Lab, Roll Assist, Character database and four relevant runtime modules also match the public site byte for byte.

Shared Echo-stat reconstruction and same-hit Echo replacement comparison are now integrated for the existing 54 Character hit paths / 492 facts. Both current and candidate equipped loadouts use the canonical validator; qualified caller context cannot override the COST limit. Ciaccona consumes the shared stat reconstruction. This adds no executable profile or DPS_READY Character: only Augusta/Ciaccona remain ready, all 83 edges / 72 dependency IDs and six Reference Team blockers remain open, and readiness stays 43/3/9/2. See the [product contract](BACKEND_PRODUCT_CAPABILITY_AUDIT_20260913.md).

After PR197, the separately authorized 2026-09-15 backend campaign started from that verified main on `codex/source-qualified-combat-context-2026-09-15`. Its scope was source-qualified combat context assembly for existing isolated-hit calculations, and that campaign is now integrated through merged PR #198. UI PR196/BUG-030 and original Flamewing WIP remain separate and preserved. Earlier stop statements below describe historical passes.

Canonical GitHub main now includes the PR198 combat-context payload; that context assembly is deployed capability rather than a separate candidate.

### Historical PR198 candidate checkpoint

Before integration, draft PR #198 was **OPEN / UNMERGED** on `codex/source-qualified-combat-context-2026-09-15`, based on then-canonical main `3ce9b150a7a5b1f4bc8947f74411d6df9ac859bf`. Its latest mechanic checkpoint was `ceef2369092bd6682916875607ff1b5886d7cf5e`. [Verify #1388](https://github.com/bellebing/Bellibing-simulator/actions/runs/35455744721) and [Export #1287](https://github.com/bellebing/Bellibing-simulator/actions/runs/35455744708) passed on that exact runtime head with **1090/1090 tests, zero failures**, all deterministic source/profile/readiness gates, strict build, real-Chrome regressions and whitespace checks. The subsequent cohort reconciliation was committed at `74007f57f215a42af20c69faea43499ad149ae64`; the provenance stabilization below added no mechanic coverage. This paragraph preserves the pre-merge candidate checkpoint; the integrated state is recorded above.

The current provenance boundary explicitly separates `BELLIBING_ASSEMBLED_PARTIAL` contributions from `CALLER_QUALIFIED` residuals and complete same-hit snapshots. `RemainingHitContext` and qualified `EchoBuildHitContext` now require the latter discriminator. The three complete-context qualification flags live under `callerAssertions`; neither opaque evidence IDs nor finite numeric validation establish engine-resolved sources. `callerQualifiedContext()` preserves that distinction through conversion, and both evaluated comparison sides retain `CALLER_QUALIFIED`. Invalid/missing provenance fails closed. Every existing assembly/card/build binding and DEF Ignore, RES Reduction and scoped-amplification guard remains in place.

Local stabilization verification: **224/224 focused tests**, **1096/1096 full tests**, all nine audits, strict build and whitespace pass. A pre-change comparison across all 492 facts / 54 Characters and zero/one landed hit (984 scenarios) preserves snapshots, damage results, deltas and assembly keys exactly. The deterministic coverage report and canonical Character export are byte-identical to the reconciliation baseline. All repository callers are migrated; external qualified callers must add `provenance: 'CALLER_QUALIFIED'`, and direct complete-context callers must move the three flags under `callerAssertions`. Pending contexts are unchanged. See the [provenance contract](COMBAT_CONTEXT_CAMPAIGN_20260915.md#remaining-context-provenance-boundary) for the construction path and limits.

Checkpoint24 adds bounded Hack - Shifting weapon context. One caller-qualified `HACK_SHIFTING_APPLIED` occurrence may activate the reviewed Spectral Trigger pair `SPT-HEAVY-AMP` / `SPT-HEAVY-DEF` or Skull Thrasher pair `SKT-HACK-BASIC` / `SKT-HACK-TEAM`, depending on exact selected weapon/rank and source actor. Spectral Trigger's Heavy amplification has the canonical 14-second timer; its Heavy-only DEF Ignore inherits that exact active state and has no independent timer. Skull Thrasher's self Basic DMG window lasts 14 seconds and its TEAM ATK% window lasts 30 seconds with canonical same-name non-stacking semantics.

Every build must independently prove exact weapon/rank, source actor/target/source fact, explicit Hack qualification, isolated lifecycle and same-timestamp ordering; Skull Thrasher TEAM ATK additionally requires an explicit selected team including the wielder. Reapplication/refresh is outside one isolated proof. `SPT-SPECTRO` remains parked because its two-stack cast history is not reviewed and Hack evidence does not manufacture those stacks.

Exact Export artifact `10588386951` contains two `weaponHackShiftingStatHitContext` rows (`SKT-HACK-BASIC`, `SKT-HACK-TEAM`), one `weaponHackShiftingAmplificationHitContext` row (`SPT-HEAVY-AMP`) and one `weaponHackShiftingDefenseHitContext` row (`SPT-HEAVY-DEF`). Deterministic report reconstruction confirms **PARTIAL_L3 = 54** and **PARTIAL_L4 = 28**, up from checkpoint23's 27: **Lucy** is the one new unique Character cohort. **Rebecca** gains additional Hack - Shifting capability but was already PARTIAL_L4 through Skull Thrasher `SKT-INTRO-BASIC` in the existing weapon-cast context. The earlier total of 29 double-counted Rebecca; this is a documentation correction, not a coverage or counting-definition change. See the exact [cohort reconciliation](COMBAT_CONTEXT_CAMPAIGN_20260915.md#checkpoint24-cohort-reconciliation). Direct-hit facts remain 492. Complete L3–L7 remains Augusta/Ciaccona only, readiness remains 43/3/9/2, and all 83 pending edges / 72 dependency IDs plus all six Reference Team blockers remain open.

At the final pre-merge checkpoint, the campaign note was to fresh-rerank remaining reviewed conditional families from the then-current code/report, preferring a bounded single-window or already-structured prerequisite with direct Character-hit fan-out. `SPT-SPECTRO`, Wildfire Mark `WM-FUSION`, stack-history/mode/refresh, DMG Taken and unreviewed RES Ignore were parked unless a source-valid prerequisite could be represented without inferred occurrence. This is preserved as historical campaign guidance only; this reconciliation does not start or authorize a follow-up workstream. See [the combat-context campaign](COMBAT_CONTEXT_CAMPAIGN_20260915.md).

## Historical post-PR195 checkpoint

PR #195 is **MERGED and post-merge verified** at `f2f8db676ba9433d065e7b18d854e0245e77d9dd`. Parents are previous main `2b1ba64a239338a91919c96afe1f8f4ed9516a73` and reviewed `3348771486a32dc048e48dc5b6a9fedb19ccf90e`; tree `52e7fdc8bb5c255d5caf9f3687562f6eede78612` exactly matches the reviewed candidate. Post-merge [Verify1144](https://github.com/bellebing/Bellibing-simulator/actions/runs/34714534066), [Export1043](https://github.com/bellebing/Bellibing-simulator/actions/runs/34714534057) and [Deploy151](https://github.com/bellebing/Bellibing-simulator/actions/runs/34714534042) passed with 851/851 tests, full audits/strict build/whitespace/Chrome and five-surface local/Export/live parity. All 83 edges/72 IDs, readiness 43/3/9/2 and six Reference Team blockers remain unchanged.

At the historical PR195 checkpoint, PR197 was the separate draft backend candidate. It is now merged and deployed as recorded above. The integrated Windstrings fragment and all pending full-profile execution boundaries remain unchanged.

Earlier candidate and stop statements below are historical checkpoints; they do not override the post-PR198 integrated state above.

Last reconciled: 2026-10-01

This is the canonical living roadmap for repository `main`. The repository `main` branch head is authoritative implementation/runtime truth. This document intentionally does not hardcode the live branch-head SHA, because a docs commit would make that value stale by construction.

## 1. Current implementation truth

Repository `main` branch head = authoritative implementation/runtime truth.

Factory v1 through Milestone 05 is integrated on `main` through PR #180.

- PR #179 final review head: `553bcb1dd9b18989f76ff000bba77307db6b0866`.
- Milestone 04 integration merge checkpoint: `1c396832f6658df7a1bd17305c4a3e488d6878b1`.
- Post-merge canonical cleanup checkpoint: `72e4de8de8ce52a98293cb6f18a48292a94f5597`.
- PR #180 final head `c3bce5e3eebd57f06cc1776e1069ec2368f75945` was integrated with normal merge commit `4f507f59e9b3be7a5cfa72f872803740c5a15a36`.
- The integration parents are prior main `b789cc7e44bdcda5a44176d8d17b5355567bc807` and that exact verified PR head.
- PRs #174–#177 remain closed unmerged superseded milestone evidence; PR #178 remains the canonical integration record for Milestones 00–03.
- Milestone 05 changes no Character Mechanics, combat/DPS, profiles, UI or canonical gameplay data.

PR #183 integrated the isolated UI/UX v34 checkpoint after M05. `docs/UI_UX_STATUS.md` owns the new UI interaction contract. Normal builds publish its prototype at `/ui-preview/`; the existing Alpha root and runtime regression routes remain intact. Backend work must preserve both payloads and must not alter the user's UI behavior. The historical UI integration checkpoint is `2a3b16f6122d81a8c2d39ab378e70971d8f1244d`.

The Character backend stack #182/#184–#188 is **integrated on main through merged PR #189**. Its normal merge checkpoint is `b16552da92a35a717c179a3801b262d728cbba97`, with prior main `2a3b16f6122d81a8c2d39ab378e70971d8f1244d` and verified integration head `0cfe37eac5942410898b788bd4d2b761c8ae767c` as parents. Post-merge Verify #1085, Export #984 and Deploy #146 passed on that exact commit, including 734 tests, strict build and live browser checks. Published Alpha, `/ui-preview/` and Character database bytes matched the reviewed payload. See [integration evidence](CHARACTER_BACKEND_INTEGRATION_REVIEW.md); its earlier candidate state is historical.

PR #190 is **MERGED and post-merge verified**. Normal merge commit `c37b3ea5c0833f0483e2da2ac9cca36d42e1902f` has parents prior main `b16552da92a35a717c179a3801b262d728cbba97` and reviewed PR head `707563b91a2a5e892eae711739b14fa1c47e46ae`; the merge tree exactly matches that reviewed head. Post-merge Verify #1102, Export #1001 and Deploy #147 (including live browser checks) passed; all three CI test logs show 800/800 tests and zero failures. Published Alpha, `/ui-preview/`, Echo Lab, Roll Assist and Character database bytes match Export. No branch was deleted.

PR #191 is **MERGED and post-merge verified** at `3fe1544f81ba7658fccd2ebbe4c4471bf6dd7d89`. Its parents are prior main `c37b3ea5c0833f0483e2da2ac9cca36d42e1902f` and reviewed head `30058599ae7f52eb70b0011d00066e1cbaebdfc8`; the resulting tree `212d91add597d26504cc8d3888779ac303c1afe0` exactly matches the reviewed payload. Post-merge [Verify #1110](https://github.com/bellebing/Bellibing-simulator/actions/runs/34630158510), [Export #1009](https://github.com/bellebing/Bellibing-simulator/actions/runs/34630158564) and [Deploy #148](https://github.com/bellebing/Bellibing-simulator/actions/runs/34630158501) passed, each with 819/819 tests and zero failures. All source/profile audits, strict build, whitespace and real-browser regressions passed. Published Alpha, UI preview, Echo Lab, Roll Assist and Character database bytes match Export and the exact merge-head local build. No branch was deleted.

PR #193 is **MERGED and post-merge verified** at `b03d43b3f1810b502099efb321be225ccfbba46c`. Parents: prior main `3fe1544f81ba7658fccd2ebbe4c4471bf6dd7d89` and reviewed head `4e19968e0a2a15ee5506f257d0f318579f4d87b1`; tree `8edb29dd5bf7e6ba641b7776b62ad8e5c0f03812` exactly matches that reviewed payload. [Verify #1127](https://github.com/bellebing/Bellibing-simulator/actions/runs/34673436423), [Export #1026](https://github.com/bellebing/Bellibing-simulator/actions/runs/34673436425) and [Deploy #149](https://github.com/bellebing/Bellibing-simulator/actions/runs/34673436460) passed on the merge commit: 832/832 tests, full audits, strict build, whitespace and real-Chrome regressions. Alpha, `/ui-preview/`, Echo Lab, Roll Assist and Character database match local/Export/live bytes. No branch was deleted; PR #192 and the preserved Flamewing WIP were untouched.

The four canonical Lupa/Qiuyuan/Lynae/Cantarella isolated Outro contracts are now canonical, with seven terms and 15 existing preset/Character consumers. This supplies no profile timeline or new DPS_READY Character. The [PR193 review](SOURCE_VALID_EXECUTION_REVIEW_20260911.md) records the historical candidate and parked lifecycle review.

PR #194 is **MERGED and post-merge verified** at `2b1ba64a239338a91919c96afe1f8f4ed9516a73`. Parents: prior main `b03d43b3f1810b502099efb321be225ccfbba46c` and reviewed head `790bc054a1aac0fb62c26798e9ba21aeda877900`; tree `ba9d619f4c24c41f89cf70a4a4a06caa2fc48691` exactly matches the reviewed payload. [Verify #1133](https://github.com/bellebing/Bellibing-simulator/actions/runs/34697986741), [Export #1032](https://github.com/bellebing/Bellibing-simulator/actions/runs/34697986625) and [Deploy #150](https://github.com/bellebing/Bellibing-simulator/actions/runs/34697986650) passed with 839/839 tests, full audits, strict build, whitespace and real-Chrome regressions. Alpha, `/ui-preview/`, Echo Lab, Roll Assist and Character database match local/Export/live bytes. All 83 edges/72 IDs remain pending, partition24/24/7/11/17 and readiness43/3/9/2; six Reference Team blockers remain. No branch was deleted; UI/PR192 and Flamewing WIP were preserved.

Explicit authorization to merge #194 supersedes its earlier integration stop. A new separate branch `codex/rover-resource-state-2026-09-12` starts from this verified main for source-valid resource/state execution toward real profile closure. No later merge is authorized. Existing nominal amounts are reused; initial state, overflow, full profile events and denominator remain proof obligations.

The reviewed PR #195 candidate, now integrated, was developed on `codex/rover-resource-state-2026-09-12`. It adds exact Unbound Flow stage spends, explicit non-overflow Windstrings fragments and one source-qualified off-field Stage2 suffix with an independent post-swap observation. Existing canonical amounts and the four nominal gains are unchanged. One identity-only `resourceStateSupport` entry serves the existing Rover preset; no generic resource engine, full profile timeline or new DPS_READY Character is added. Integration review corrected actual-team/preset qualification. Initial profile state, overflow, full events/energy and denominator remain pending. See [resource/state review](ROVER_RESOURCE_STATE_REVIEW_20260912.md). Its former integration freeze was superseded by explicit PR195 merge authorization and completed post-merge verification. The later PR198 backend draft referenced by that checkpoint is now merged and post-merge verified as recorded above.

The integrated payload isolates the historical Augusta team fixture, shares verified profile/default-equipment resolution, detaches team manifests, exports canonical gear, and extends the existing Echo identity family. Shared resource, Outro, explicit Echo-hit, damage-event, applied-heal and target-event bindings reuse canonical source facts. Cast capability export exposes existing contracts. No UI behavior or profile engine is added. See the [integration and reuse-first audit](PR190_INTEGRATION_AND_REUSE_AUDIT_20260910.md).

At the merged #193 baseline all **83 pending execution edges / 72 distinct dependency IDs** remain open: **26 UNREVIEWED / 24 PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE / 7 BLOCKED_SOURCE_CONFLICT / 9 BLOCKED_SOURCE_SEMANTICS / 17 PROFILE_SPECIFIC_EXECUTION**. Only Augusta and Ciaccona are DPS_READY; all six Reference Team blockers remain unresolved. Zani's Eternal Radiance stack view supports the isolated Spectro target window only, never the separate Frazzle-infliction trigger.

Merged #191 implements isolated-activation bindings for the existing canonical Zhezhi and Lumi Outro facts. Six current presets across five Characters discover them through existing team membership. Canonical RAW_ONLY and `maxStacks: null` remain unchanged. The existing transfer lifecycle requires caller-proven absence of an earlier activation, actual outgoing/incoming identities and timestamp, plus explicit query and recipient-switch ordering. Independent terms remain separate; rotations/readiness and repeated-activation semantics remain unresolved. The second slice adds exact Lorelei and Nightmare: Lampylumen ATK attack facts from supplemental damage-entry evidence. Existing Echo readers/kernel/export consume them; Cantarella/Zhezhi timelines remain pending. Roccia and Sanhua additionally reuse the isolated-transfer contract, bringing the four new Outro owners to nine presets/eight Characters. Integration review found and fixed a Voidwing caller-catalog validation gap in `ee7b6ff`; the reviewed runtime passes 819/819 local tests, strict build and all repository source/profile audits. The subsequent documentation checkpoint requires its own exact-head Verify/Export before landing readiness; final run IDs belong to PR #191 and AI Handoff. The follow-up adds two Sentry Construct attack alternatives; no capacitor/reset/freeze state is inferred. Voidwing Moth additionally has a separately reviewed use-to-Outro ATK transfer with explicit Rank-5/use/recipient/prior-state/order requirements; damage scaling stays pending. All 17 pending profiles still lack a canonical rotation denominator. See [current closure review](PR191_EXECUTION_CLOSURE_REVIEW_20260910.md) for the complete integration review, validation fix and parked boundaries. That integration stop was superseded by explicit authorization to merge #191 and begin the new backend pass after post-merge verification. That historical authorization was later superseded by the explicit #193-only merge and new execution-closure pass above; UI change and Flamewing inclusion remain unauthorized.

## 2. Milestone 04 exit capability

Milestone 04 proves this bounded real chain:

`provider source / pinned upstream`
→ `automated provider-specific extraction`
→ `provenance-rich generated Factory raw evidence`
→ `reviewed mapper registry`
→ `reconciliation`
→ `deterministic evidence + intake reports`
→ `REVIEW_CANDIDATE` or `EXCEPTION_QUEUE`.

The real lane remains `Voruzhu/FrequencyManager`, MIT-licensed and bounded `EVIDENCE_ONLY`. Broad/roster-scale ingestion remains disabled.

The lane still reuses only the two existing reviewed families:

- `weapon-rarity-v1` → `abyss-surges::rarity.stars`;
- `weapon-r1-attribute-dmg-bonus-v1` → `ages-of-harvest::r1.attribute-dmg-bonus.value`.

No third Wuthering Waves fact family has been added.

## 3. Milestone 05 — Provider Refresh Change Detection / Triage v1

Milestone 05 addresses the operational gap above Milestone 04: a successful refresh should distinguish between new human review work and a healthy no-change check without changing Factory evidence/reconciliation semantics.

The triage dispositions are operational only:

- `NO_REVIEW_REQUIRED` — provider refresh completed correctly and every bounded target is `UNCHANGED`;
- `REVIEW_REQUIRED` — refresh completed, but at least one target is `SOURCE_CHANGED`, `SOURCE_MISSING` or `SOURCE_UNKNOWN`;
- `REFRESH_FAILURE` — provider checkout, provenance resolution or global intake execution could not complete safely. This does not fabricate Factory evidence classifications or reconciliation data.

A provider commit advance by itself never creates review. A new exact upstream SHA with identical bounded semantic facts remains `NO_REVIEW_REQUIRED`.

## 4. Milestone 05 implementation

PR #180 adds:

- `src/factory/providerIntake/refreshTriage.ts` — deterministic operational triage above the unchanged Milestone 04 intake report;
- `test/factoryProviderRefreshTriage.test.ts` — no-change, timestamp determinism, new-SHA/same-facts, changed, missing, unknown and pre-intake/global-failure regressions;
- `scripts/generate-factory-provider-intake.ts` — emits deterministic triage JSON/Markdown alongside the full Milestone 04 evidence bundle, and emits a failure-only triage artifact when intake cannot safely run;
- `.github/workflows/factory-provider-refresh.yml` — adds scheduled bounded refresh, provider-configured default ref `master`, exact resolved SHA validation, Actions summary output and explicit operational failure handling while retaining `contents: read`.

The parser is not hardcoded to a permanent default-branch name. `master` is workflow/provider configuration; manual dispatch still accepts an explicit ref/SHA.

No issue creation, canonical write, provider auto-trust or runtime mutation path exists.

## 5. Determinism and fail-closed behavior

Semantic triage excludes volatile execution metadata such as capture timestamps and workflow run IDs. For the same baseline plus the same upstream provenance/content/result, rendered triage JSON/Markdown is deterministic.

The successful triage report carries:

- exact upstream SHA and source blob provenance;
- configured provider ref;
- baseline FrequencyManager source ref/version per bounded target;
- current source ref/version per bounded target;
- each target's existing Milestone 04 refresh status;
- triage disposition and `attentionRequired`.

Milestone 04 evidence/reconciliation remains unchanged:

- unchanged reviewed value → normal reconciliation route;
- valid changed relevant value → `SOURCE_CHANGED` and effective `EXCEPTION_QUEUE`;
- expected provider row missing → `SOURCE_MISSING / EXCEPTION_QUEUE`;
- unsupported/unparseable row → `SOURCE_UNKNOWN / EXCEPTION_QUEUE`;
- all reconciliations retain `MANUAL_SOURCE_VALIDATION_REQUIRED`.

`REFRESH_FAILURE` is not a new Factory evidence classification.

## 6. Real provider proof

Real `Factory Provider Refresh` run #7 succeeded against provider-configured `Voruzhu/FrequencyManager@master` after the intake script was hardened to require the workflow/provider-configured `--provider-ref` explicitly.

The uploaded artifact was inspected directly and proves:

- `master` resolved to exact SHA `f585e47a868cb2b65845367b976a1781f130c758`;
- `abyss-surges::rarity.stars` → `UNCHANGED`;
- `ages-of-harvest::r1.attribute-dmg-bonus.value` → `UNCHANGED`;
- triage disposition → `NO_REVIEW_REQUIRED`;
- `attentionRequired=false`;
- baseline and current FrequencyManager source versions/refs are retained;
- canonical promotion policy remains `MANUAL_SOURCE_VALIDATION_REQUIRED`.

This is real provider proof, not fixture-only evidence.

## 7. Existing source extraction workflow audit

`.github/workflows/profile-source-extract.yml` remains branch-bound to the old roster-wide Prydwen profile accelerator `feat/profile-source-import-accelerator-20260830`.

Disposition remains **reuse-by-pattern / future refactor-or-supersede candidate; not mechanical reuse**. Its artifact schema, roster-wide scope and Chromium/network extraction do not match bounded Factory fact-family intake. It is unchanged. Prydwen remains `REVIEW_ONLY`.

## 8. Reference Team 01 — golden regression

Augusta / Iuno / The Shorekeeper remains unchanged:

- dependency coverage `PARTIAL`;
- `dpsReady = false`;
- exactly six required `PENDING` dependencies:
  1. `iuno-wan-light-at-cap-trigger-semantics`;
  2. `iuno-wan-light-augusta-event-overlap`;
  3. `shorekeeper-stellar-symphony-augusta-window-overlap`;
  4. `shorekeeper-rejuvenating-augusta-window-overlap`;
  5. `shorekeeper-fallacy-team-atk-augusta-window-overlap`;
  6. `shorekeeper-fallacy-wielder-er-stellarealm-state`.

`BUG-028`, `BUG-029`, `BUG-008` and `BUG-010` remain open/relevant. Abyss Surges level-90 Base ATK `587` vs `588` remains a parked provider conflict; no Base ATK mapper/coercion was added.

## 9. Provider/canonical boundary

- Prydwen — `REVIEW_ONLY`.
- FrequencyManager — MIT, bounded `EVIDENCE_ONLY`, no canonical authority.
- `d4rkOfficial/wuwa-afyg-tool` — MIT evidence/reference candidate only after bounded review.
- `DommyMM/wuwabuild` — no established reuse license; no new code/data copying.

All Factory reconciliations retain `MANUAL_SOURCE_VALIDATION_REQUIRED`. Provider source changes, `CONFLICT`, `MISSING` and `UNKNOWN` never auto-promote.

## 10. Verification state

Milestone 04 integration remains green as previously recorded through PR #179 and its post-merge checkpoints.

Milestone 05 code/test/docs payload before the final proof-reference-only documentation sync passed:

- Factory Fast #47 — SUCCESS;
- full Verify #1064 verify job — SUCCESS, including tests, strict web build, browser regression and whitespace gate;
- Export #963 — SUCCESS;
- Factory Provider Refresh #7 — SUCCESS against real `FrequencyManager/master` on the current runtime-code payload;
- direct artifact inspection — SUCCESS with `NO_REVIEW_REQUIRED`, `attentionRequired=false` and exact upstream SHA/baseline/current provenance.

Final PR #180 head passed Factory Fast #49, full Verify #1066 and Export #965. The real Provider Refresh #7 runtime/script/workflow payload is unchanged at the final head; only documentation and a failure-path regression followed it. Its downloaded artifact SHA-256 was checked and the two `UNCHANGED` targets and provenance were read directly before integration.

Integration checkpoint `4f507f59e9b3be7a5cfa72f872803740c5a15a36` passed full Verify #1067, Export #966 and Deploy #144 including live-site verification. Exact checks for subsequent work are recorded on its PR and in Handoff. No verification gate is weakened.

## 11. Handoff synchronization

The external Bellibing Echo Tool — AI Handoff remains the place to record the final exact PR review-head SHA and final verification run identifiers without creating a self-referential GitHub-doc problem.

UPD-162 records M05 integration and the unmerged Character database slice; UPD-163 records the integrated UI checkpoint. Subsequent backend Handoff records must distinguish verified branch heads from canonical main. No Handoff write changes canonical GitHub implementation/runtime truth.

## 12. Milestone boundary

**Current responsibility: Character data and reusable backend models. The user is building the UI separately.**

Prioritize the shortest source-valid path to supporting many Characters: reuse existing canonical rows, review shared fact/mechanic families in batches, and reuse execution primitives. Add Character-specific code only where actual mechanics require it. Follow `BEST_AVAILABLE_TEAMS_DIRECTION.md` for the downstream product contract; keep the six Reference Team dependencies open until independently resolved.

The current backend slice adds `characterActionValues.ts` and `characterDatabase.ts`: a common exact source-value reader across 54 verified mechanics profiles, reused by Ciaccona, and a deterministic JSON export for all 60 canonical identities (57 released), 1868 facts and 47 presets. `npm run export:characters` writes the standalone database; normal builds include `dist/data/character-database.json`. See `CHARACTER_DATABASE.md` for the consumer contract and batch workflow.

No gameplay facts, source approvals, DPS-ready Characters or Reference Team dependencies change. Existing readiness remains 43 profile-complete/pending-freeze, 3 mechanics-source-blocked, 9 profile-source-pending and 2 DPS-ready. Further Factory infrastructure needs a concrete throughput or modeling benefit. A universal gameplay DSL, speculative facts, automatic canonical promotion and UI implementation remain outside this backend slice.

The current overnight backend pass has **no merge authorization** and uses one long-lived branch/draft PR from fresh main. The user's new overnight instruction supersedes the earlier stop-after-#188 instruction: reconcile status, audit Reference Team 01 end-to-end with `KEEP`, `SIMPLIFY`, `PARK/DELETE` and `MISSING`, then implement bounded source-valid findings and continue safe backend work on the same branch. Document the audit before implementation. Preserve all six Reference Team blockers without source/execution proof. No direct main writes, branch deletion, history rewrite, UI implementation or guessed gameplay semantics. A completed commit or green CI is not an instruction to stop this authorized pass.

The [current Reference Team architecture audit](REFERENCE_TEAM_01_ARCHITECTURE_AUDIT_20260908.md) records the end-to-end trace before implementation. It preserves the partial source/timeline boundary and identifies three source-neutral changes: isolate the historical Augusta team fixture, share verified profile/default-weapon resolution, and detach resolved team snapshots. The historical `.37` ATK correction and arbitrary-team execution remain parked until current contribution proof exists.

## 13. Integrated backend batches — historical implementation sequence

The following branch/parent references record the original review sequence. Every payload below is integrated through #189; intermediate coverage counts describe the point at which each batch was implemented. GitHub automatically marked #182 merged; #184–#188 remain historical open drafts whose payloads are already on main. UPD-172 records full post-merge verification.

The first dependent batch, `codex/character-basic-hit-batch`, added explicit ATK Basic Attack hit evaluation for 268 canonical actions across 52 Characters on verified #182 head `9240cfea5541de739f418e64fa124d4f388b1413`. Coverage is exposed in `hitPrimitives.basicHits`; hit occurrence and fully assembled combat context remain caller-owned. No rotation, readiness, source blocker or UI behavior changes. See `CHARACTER_DATABASE.md` for the exact family and fail-closed contract.

The next stacked batch, `codex/character-direct-hit-families`, built on verified draft #184 head `86b6263e410b251846065798c456a697516308ce`. It extends shared isolated-hit evaluation to 492 already-verified ordinary-damage actions across 54 Characters, with exact source damage-class and ATK/HP/DEF snapshot binding. Existing Basic Attack compatibility remains intact. No full Character execution/readiness claim follows from hit-primitive coverage; special-system, conditional and unresolved semantics remain excluded.

The third stacked batch, `codex/weapon-team-amplify-window`, builds on verified draft #185 head `181a23248482556f7f880a059dc7b9d8c8972394`. It implements the already-reviewed Bloodpact Unbound Flow team-amplification window with caller-proven recipient eligibility and event timing. The BPP execution dependency now has a reusable primitive but stays pending until a verified profile timeline/team state exists. No raw gameplay fact, full DPS approval, Reference Team closure or UI change is introduced. The execution-gap document is reconciled to the actual 19-profile/83-edge registry; final CI/head evidence belongs in the PR and Handoff.

The fourth stacked batch, `codex/shared-support-stat-windows`, builds on verified draft #186 head `dac0aa15e2e64685eee7830910117e502d09f46e`. Static Mist now uses the existing incoming-transfer primitive, and Rejuvenating Glow has a shared applied-heal path reused by the existing Shorekeeper adapter and available to the Chisa dependency. The registry retains all 83 pending edges; 14 now have reusable primitives requiring a timeline. No UI or full DPS/readiness changes. Exact final head/CI evidence is recorded on its draft PR and Handoff.

The fifth stacked batch, `codex/canonical-cast-window-batch`, builds on verified draft #187 head `7a0188028f6fd5c4be35ea459a28bb8a7b92e8cf`. Existing cast-window primitives now execute 34 canonical effects on 27 weapons and six Sonata effects. Their values and explicit event contracts remain source-bound; no cooldown, stack, hit/status trigger or profile uptime is inferred. Frosty Resolve's Glacio dependency is primitive-available/requires-timeline, while its separate Skill-stack dependency stays open. The registry still has 83 exact pending edges, including 15 with available primitives requiring timelines. No source, DPS readiness, Reference Team or UI change.

Repeated Export failures on the unauthenticated GitHub API source-head lookup were observed during this batch. CI now supplies its existing GitHub token only to the raw-audit step; the fetch helper sends it only to the exact HTTPS GitHub API origin and rejects authenticated redirects. Public raw downloads receive no credential. Source-head resolution, live projection comparison and all failure gates remain mandatory. This workflow change does not dispatch a deployment or grant new permissions.
