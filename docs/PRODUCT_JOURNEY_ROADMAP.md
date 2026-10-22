# Bellibing Simulator — master product journey and delivery roadmap

> **Product-owner direction — 2026-10-21.** This document owns the *end-to-end future user journey and ordered product milestones*. It is not a source for game values, a claim that a feature is merged, or permission to bypass CI. `docs/PROJECT_STATUS.md` owns current implementation/nearest roadmap; GitHub owns live PR/commit/CI truth; `AGENTS.md` → `docs/DEVELOPMENT_PROCESS.md` owns worker process; AI Handoff owns product decisions/context. The historical program documents remain useful evidence but **must not override this journey's priority/order**.

## North star — one believable path through the whole product

A player should be able to **import or create a Character → inspect/correct actual owned equipment → save Build → improve one real Echo with live, mathematically honest guidance → freely simulate a source-supported standard team and five-Echo investments in Sandbox → save/compare valid teams → eventually optimize the best set of teams across their available roster**.

The interface should be a **guided decision assistant**, not an internal configuration/dashboard. Reuse the accepted Improve visual language (width, cards, responsive composition, collapsible inline sections, drag handles, imagery, restrained gold). The user's current Improve layout is a **visual baseline to preserve**, not a reason to copy its accidental bugs. Avoid cramped overlay-on-overlay editors, scrollable mini-dropdowns, duplicate team menus and large explanatory prose. Provide brief labels, visible actions, and only actionable error/unsupported states.

### Invariants across every phase

- **Source/engine separation:** external/raw evidence → reviewed canonical facts/effects → Character/Weapon/Echo profiles and source-bound team/mode/rotation → combat & private DPS/economics → public presentation. Preserve Echo Core as Character-free. Do not duplicate calculators or expose private policy.
- **No invention:** Characters, signatures, best sets, Echo identities, stats/tiers, rotations, ER energy/timing, costs and DPS require existing reviewed evidence and valid provenance. Suggestions can be *templates*, never automatically user-owned or falsely scored. Missing is Pending/Unsupported, never zero.
- **Ownership:** `Build/Current` is durable user-owned equipment. `Candidate`, Improve advice sessions and Sandbox simulation are separate. No preview, import, simulation, advice, team swap or browser reload may silently mutate Current, shared inventory or another Character. Explicit save/accept, revision binding and rollback required.
- **Accuracy:** a reviewed trio/context is not executable DPS; experimental/native-calculator parity is not qualified gameplay DPS. A modeled result states its real supported scope. Source-invalid or incomplete computation never gets a fabricated number or false green status.
- **One obvious action:** allow advanced optional inspection only when needed; hide unsupported actions rather than presenting disabled controls with long diagnostic text. Normal view prefers a title/number/action, not implementation vocabulary.
- **Responsive and accessible:** full-size clickable cards, inline accordion stages, pointer/touch/keyboard/screen-reader and focus preservation. Validate 1440 desktop, wider when needed, mobile and real Windows local launch.

## Delivery map (execution order — owner confirmed 2026-10-22)

**The order below is now authoritative. Complete the integrated DPS V1 and pursue **at least ONE genuinely executable source-validated team for EACH of the 59 released selectable Characters** first.** Begin with a short existing public/private stack audit (freeze speculative bulk team expansion during this reconciliation), then close verified missing-character gaps using genuine source modules/profiles without new parallel calculators. Do not start a parallel production Build rewrite or scanner implementation while this priority is unresolved; if hard source gaps prevent 59/59, record each blocked Character precisely and ask the owner for a scope decision rather than claim completion. Non-overlapping concept/research may be prepared but **Build concept visual approval and Build production work follow the DPS V1 checkpoint**. Later gameplay qualification is a separate ongoing source-evidence effort, not a reason to freeze product UX until all 59 Characters qualify.

| Order | Workstream and user outcome | Priority | Delivery gate |
| --- | --- | --- | --- |
| **0 — NOW** | **DPS V1 + 59-Character first-team coverage**: consolidate the public/private Draft stack, verify real Improve/Sandbox comparisons, then pursue **≥1 runnable team with the selected Character and computed individual DPS for each of all 59 released Characters**. Only source-backed execution counts. | **P0** | **59-row selected-Character coverage matrix**, one reproducible scenario per admitted Character, exact source/gear/rotation/mode/ER gates, individual/Team Total, real browser/Windows evidence, independent proof, relevant FULL and owner GO for merge. Hard source gaps must be listed, not labeled completed. |
| **1** | **Full UX ownership audit + isolated interactive Build/Echo concept**, using accepted Improve visual language for direction. | **P0 next** | Owner reviews desktop/mobile interactive concept **before** production Build changes. |
| **2** | **Build a Character owned-build UX**, reliable five Echo slots and fast inline +5…+25 editor. | **P0** | Authorize Current writes only; real save/cancel/reload and browser regression. |
| **3** | **Screenshot/card scanner**, mapping uncertain imported fields into the **same editable Build draft**. | **P0/P1** | Validated owner-reviewed image fixtures and explicit save. |
| **4** | **Improve live advisor**, dynamic recommendation after actual reveal, comparison and receipts, safe Current/Candidate. | **P1** | Honest verified RNG + odds/cost scope, precise Gate and owner isolation. |
| **5** | **Sandbox five-Echo/full-set playground**, default standard-team model where supported and resource experiments. | **P1** | No account required; comparisons only for matching executable contexts. |
| **6** | **Broader DPS/ER source fidelity and gameplay qualification**, building on completed V1, not a blocker for Build. | **P1/P2** | New team/variant only with pinned source, execution, independent parity and real game evidence where claimed. |
| **7** | **Investment economics & real DPS/cost curves**; future Tubes, recovery and finite-budget strategy. | **P2** | Comparable verified model/simulation samples; no made-up diminishing-returns curve. |
| **8** | **Teams / Best Available Teams / Endstate Matrix**, owned roster and global multi-team constraints. | **P2/P3** | Honest single-team results and source-supported multi-team assignment. |
| **9** | **Release/integration hardening**: local↔hosted, security, data migration/restore and launch. | **Release gate** | Exact-head FULL and separate explicit owner GO for each merge/deployment/private publication. |

The end-to-end **player journey** remains Build → Improve → Sandbox → Teams; the table describes **development execution order**, beginning with stabilizing the already-built DPS foundation. Keep the old reviewed catalogs, math and experimental evidence intact. Codex should deliver one coherent testable outcome per workstream, not "fix one label" PRs.

## M0 — DPS V1 integration & consolidated validation (FIRST — current priority)

**Owner decisions 2026-10-22:** first stabilize the existing DPS V1 pipeline, then **aim to provide at least one genuine, source-backed experimentally calculable team for each of the 59 released selectable Characters**, BEFORE Build redesign. This is a **per-selected-Character execution target**, not merely 59 source-valid UI teams or one shared team containing many Characters. For each selected Character, the team calculation must produce that member's numerical damage/DPS contribution and consistent Team Total. The target is NOT a demand to label experimental outputs as gameplay-qualified or to fabricate a missing source model. The next work starts from current real public/private GitHub branches, not historical PR numbers or copied CI results. At decision time the relevant unmerged pair was public #346 and private #39; inspect all stacked ancestors, exact HEADs and CI before acting.

1. **Audit the entire stacked public/private DPS chain and enumerate the 59 Character coverage gaps**: dependency/base/head graph, source-pin provenance, schema/transport, private runtime, UI consumer and ownership. The earlier 269 context bindings / 258 experimental trios / 45 Characters are **historically reported bounded model-executable figures, not confirmed 45/59 per-selected-Character end-to-end readiness**. Generate a reproducible 59-row matrix from the canonical released roster; for each Character identify its source-reviewed standard/alternate trio, intended source role, published/native modules, exact mode/rotation/ER/gear/Sequence, executable vs blocked status, independent numeric evidence and UI availability. Do not count appearance as a teammate alone, static portraits, published team contexts or adapter bindings as runnable DPS.
2. **One exact comparable current-build path in Improve**: real persisted Current equipment and observed Candidate, same Character/Weapon/Sequence/team context/enemy/reference/rotation, three actor contributions, Team Total and correct delta, with full stale-result/revision invalidation. No synthetic or reference teammate may silently replace the user's actual owned Build.
3. **One exact no-account path in Sandbox**: precomputed source-valid default Reference DPS (where executable), actual five legal RNG Echoes -> Simulated/Change under the *same* frozen reference teammate profiles and fixed source-bound context. Validate reset/team/weapon/mode/owner invalidation and no Current writes.
4. **Fix blocking integration defects as part of V1**, notably the reported Improve Current slot `Edit` dispatching to the Candidate editor if reproducible on the exact current head. Do not reopen a wholesale Build redesign during this phase; implement the minimal safe routing/ownership fix, with save/cancel/reload tests, or document a proven blocker. Do not mark a bug resolved merely from tests without live UI verification.
5. **Independent calculation evidence**: source/pinned model parity, actor/total sums, actual equipment/levels/skill investment, buffs/rotation/ER gates and negative/unsupported scenarios. Check the public/private boundary; no leaking private algorithm/fixture. Preserve `Model estimate`/Experimental markers. **Zero gameplay-qualified teams must not be promoted merely because CI is green.**
6. **Acceptance matrix & consolidated FULL**: record supported team/profile/mode/gear/ER/Sequence requirements, actual numeric parity, pending reasons, browser desktop/mobile and Windows local start; run proportionate focused checks during iteration and existing exact-head FAST/REVIEW/FULL gates at the process-approved integration stage. Do not bypass source/ER checks to produce more green numbers.
7. **After the integration audit, work through all missing selected-Character first-team scenarios** in source-backed groups on the *same existing calculator*. Reuse canonical standard teams or their source-reviewed alternatives, never invent unsupported members or run unknown rotations. Extend pinned source proof/effects/model capabilities where legitimately evidenced; do not weaken ER/cast/CR/gear or owner guards. Important known blockers from earlier private review include **ten missing native resonator modules in the pinned upstream source**, Hsin/Suhsin mechanic conflicts, Jianxin R1/rotation limitations and some investment-dependent native gates. Revalidate exact remaining characters against live sources rather than assuming those old blocker counts are final. **Do not claim 59/59 before every row has independent runnable evidence.**
8. **Finish with one explicit 59-row coverage report and consolidated DPS V1 candidate**, including source refs, exact fixture/run, per-actor and Team Total, same-context delta, private independent parity, local UI owner tests and reasons for each hard failure. Distinguish: source team reviewed; native module available; experimental team runnable; works for selected Character's reference build; verified browser; independently gameplay-qualified. A missing upstream module is an evidence blocker, never an invitation to copy an unrelated Character implementation. If all 59 cannot be executed from verified sources, stop with an exact blocked list and request an explicit owner decision before relaxing 59/59 or advancing the main roadmap. No automatic merge, deployment or private-engine publication.

**M0 has a user-requested COVERAGE GOAL of 59/59 released Characters, each with ≥1 source-backed experimentally runnable team and that selected Character's individual DPS and correct Team Total; an explicit run/fixture and UI check are required per row. Integration is not 'done' when just 258 trios / 45 Characters are reported or when a 59-entry UI catalog exists. When exact source blockers make a row unattainable, mark it BLOCKED with evidence, do not label the whole milestone complete, and present a scoped owner decision. **Full independent gameplay-DPS qualification of all 59 is NOT required** for a model-based V1; broader qualification and multi-team depth continue under M6.**

## M1 — product concept and friction audit (SECOND — after DPS V1)

**Deliverable: concept, not a surprise replacement of live UI.**

1. Walk the actual local end-to-end path: first launch → Character → Weapon, level/Sequence/Skills → five Echo cards (+0/+5/+10/+15/+20/+25) → save/reload → Improve edit + Candidate → new RNG → Sandbox → team change. Check keyboard, touch, browser scaling and real Windows launcher.
2. Record steps/clicks, dead ends, stale context, wrong target, hidden assumptions, poor status text, excess popups, inaccurate values and privacy/ownership risks. Separate **reproduced bugs**, **design friction**, **missing features** and **unsupported source/math**.
3. Present one interactive isolated desktop/mobile **Build & Echo Entry concept**: same broad composition/card hierarchy as accepted Improve, but independent DOM/CSS. Possible layout: left Character stats/Skills/Sequence, centered Character focus/Weapon, the five Echoes in a broad row below; revise based on actual 1440–2560 widths. Use real art/data where available; no invented gameplay values.
4. Include state-machine sketches for **manual build entry**, **import review**, **Improve live advisor**, **Sandbox run**, **team member swap**. One page of click-by-click acceptance, with screenshots and honest pending states.
5. **Stop for owner visual approval of the concept before rebuilding production Build UI.** This is a design checkpoint, not merge permission.

## M2 — Build a Character: fast, trustworthy owned-build entry

- Preserve existing Character choice, source-valid signature/Weapon choice, baseline levels, S0–S2, source-owned max Skills, Forte, Character Stats and saved state. Weapon ranking uses only reviewed source order *where that order is supported*; do not silently infer missing BiS ranking.
- Build uses a genuinely wide, responsive workspace informed by accepted Improve; five large Echo cards are visible/inspectable without a modal labyrinth. Editing/adding happens **inline in an expanding working region**, keeping the Character/build context and keyboard focus visible.
- For each slot propose a **source-reviewed** compatible Echo/Sonata/Main Stat template (Augusta / The False Sovereign / Crown of Valor is a first acceptance case). Provide a clear explicit override. Preselected template is **not owned** and contains **no invented rolled substats**.
- Main Stat is selected by direct visible cards/rows. +5 panel expands; choose **substat on left, one of its legal canonical tier values on right**. A value selection commits just that observed checkpoint draft, collapses it and expands +10; repeat +15/+20/+25. Edits to completed checkpoints reopen inline, validate duplicates and update dependent Main/Secondary stats/level according to the canonical engine.
- No `Substat 1` placeholder dropdown/170px scrolling popup; full-width inline expanding stage, direct-value click and clear selection states. Preserve partial +5/+10/+15/+20 cards; support save/undo/cancel/reload and real cost-/set-validity checks.
- **Critical reproduced workflow gap to fix:** `Edit` on a Current loadout slot in Improve currently enters the observed **Candidate** editor. Build owns explicit saved Current editing; Improve may *navigate to that exact Build slot* (or use an authorized transactional Current edit), never silently write Current through Candidate. Candidate has separate ADD/EDIT and cannot alter Current. Test cancel, interrupted/reload recovery and no-other-Character mutation.
- Do not replace the functional stat/equipment domain/state components merely to get a new layout; migrate safely if needed.

**Done:** novice manually creates Augusta with owned Weapon and five correct observed Echoes and can review/edit/reload without data loss; Current and Candidate remain separate; full real browser regression incl. incomplete cards.

## M3 — scanner / import from Wuthering Waves images

- Investigate the actual **share-card/screenshot formats players obtain from game or Discord**; identify which fields can be reliably extracted from examples, licenses and privacy. Image import is a convenience input, not a new source of canonical game facts and not a claim that every Discord post is parseable.
- Upload image(s) locally through a clearly scoped UI. Detect Character identity, Weapon/refinement, levels, Sequence, Skills/Forte and each Echo's identity/Sonata/Cost/Main/Secondary/+5…+25 substats only when visually evidenced. Preserve source image during review, flag uncertainty per field and reject unsupported/unreadable formats.
- Map parsed values to the **same Build draft validation/editor** as manual entry. Show one full-screen/inline review with corrections; no automatic equipment/account write until **explicit Import/Save**. Duplicate/new/overwrite intents clearly distinguished.
- Never silently assign fake rolls, ownership, DPS or unloaded weapon facts. Test adversarial screenshots, wrong Character, partial Echo, ambiguous stat labels, mismatched costs, rotated/cropped images and data retention/privacy.
- Scanner and fast manual entry both end in the **same exact saved CharacterBuildState**. If scan fails, manual entry remains efficient.

**Done:** a set of owner-approved real screenshots can be imported, corrected and explicitly saved; resulting Build matches manually entered fixtures byte-/field-equivalently; unsupported inputs are safe.

## M4 — Improve a Character: living Echo advisor

Preserve the accepted Improve page/card proportions; redesign the **center feedback behavior**, not the entire layout.

- **Before first roll:** central title `Ready to Simulate` and the next `SIMULATE +5` action. If mathematically supported, show compact probability to reach the defined target and projected *future* Tuners. **Do not render Discard/Continue buttons before any observation.**
- **After real +5/+10/+15/+20 observation:** use existing canonical RNG and private exact advice. Center title says the **recommended next action**: `Continue to +10`, `Start New Echo` etc. Left **NEW ECHO**, right **CONTINUE +next checkpoint**, each with comparable one-attempt chance and expected *remaining gross Tuners* to first target success; brief savings/delta. Color for *lower cost*, not blindly highest probability; ties neutral. Respect Gate; before Gate do not invent a reject decision.
- **At +25:** show target reached / failed, observed stats, actual Echo/Tuner receipts and next action; no Continue past +25. Full Build/Current/Candidate when genuine source comparison exists.
- Settings/Gate changes recompute **the same observed roll history** without new RNG. Changing owner/Character/team/Weapon/Echo/Mode invalidates inappropriate comparisons, cancels stale async responses, preserves Current.
- A short **session cost counter** tracks actual Echoes tried and gross Tuners spent separately from forecast; later: Tubes, recovery/net cost, per-Character spend ledger and saved sessions. Current accounting model assumes XP sufficient and no recovery: never show fake Tube/Net/Expected DPS.
- ER target UI: one always-on percent field; `100%` = no *user-chosen extra ER threshold*, **not** permission to execute an energy-insufficient rotation. Remove redundant checkbox only after persistence/migration check; below-native-ER DPS requires a separately sourced rotation-delay model, not disabling ER gates.

**Done:** live on desktop/mobile for first source-/math-supported Character; clear visible before/after states, fair odds horizons, correct optimal winner, gate behavior, zero Current writes; no large technical explanation blocks.

## M5 — Echo Sandbox: source-bound playground, NOT an account Build

- Select any released Character, load its supported standard team/reference shell (source-backed Weapon/level/rotation and Echo-set suggestions). User ownership not required. **59 source shells does not mean 59 automatic DPS providers.**
- True five-slot isolated RNG from source-valid template, per-slot and eventually whole-build runs, configurable goals/Gate/resources, 0→5 actual accepted Echoes, checkpoint/history/Trash inspection, safe reset/export; no changes to Current or shared account budget.
- A supported team can show automatic **Reference DPS** before rolling; **Simulated / Change** only with sufficient legal observed Echoes and same executable context. Unavailable combinations say short, precise `DPS unavailable` rather than anonymous `Pending` or `Complete your team in Build`.
- Expose concise Expected versus Simulated cost only for proven **matching goal/policy/unlimited scope**; round displayed Tuners (≈ integer), keep full precision in math. Different finite budgets, incomplete runs, Tube/recovery absence must not be shown as comparable.
- Later Full Set mode: strategy for accepted five-card set, speed modes/100–10,000 runs using the *same* RNG/strategy semantics, percentile/risk views, actual gross resource totals.

**Done:** clean no-account Sandbox from Augusta standard through five completed real Echoes to a sourced comparison; pending/unsupported paths and team swaps must not retain stale DPS.

## M6 — DPS/ER fidelity, expanded coverage and independent gameplay qualification (AFTER V1)

- Reuse existing private pinned source calculator, canonical effects/roles and reviewed contexts. Current stacked candidates demonstrate **experimentally executable subsets** (including 258 distinct trios / 45 Characters in reported bounded evidence), **not** product-wide gameplay-qualified DPS. Confirm exact HEAD/source before refreshing counts.
- One user-facing comparison: Sandbox `Reference / Simulated / Change`; Improve `Current / Candidate / Change`, three member contributions + Team Total. Experimental `Model estimate` remains visibly different from independently gameplay-qualified DPS; no duplicate panels or opt-in for a baseline that is already configured.
- Source-support for actual owned Weapon, Sequence, hit/buff/ER/mode and shared enemy model must be proven. Reject mismatched baseline/scenario/model numbers; enforce revision freshness.
- Model **missing ER → additional legal energy acquisition/longer rotation → modified DPS** only when verified energy events, action availability and timings exist. Separate user's minimum target from actual whole-team rotation feasibility; unsupported delays stay Pending. No simplistic scalar `duration × ER ratio`.
- Expand coverage by real source-backed executable pathways and independent parity evidence, not by just adding team labels. Strengthen qualification against game evidence before a `ready` product claim.

## M7 — economics & graphs (once source-grounded)

- Provide actual cumulative **Tuners, Echo attempts and (when verified) Tube denominations**, resource policies, recovery and finite-budget advising. Source-valid XP/exact spending already has bounded domain work; wiring it into advice is a separate task.
- For Sandbox chart **investment cost on horizontal axis**, **Character/Team DPS on vertical**, with actual modeled samples for identical source contexts. Mark scatter/quantiles/error bands and supported scope. Optional secondary display: marginal DPS gain per incremental resource.
- The hoped-for **diminishing-return / plateau** is a hypothesis to *measure*, never a curve to draw or claim without simulation. Distinguish expectation, observed samples, RNG variance and gated/unsupported points. Allow side-by-side strategies rather than invented utility units.
- Save reproducible simulation seed, sources, model and version with summaries; no false statement that a single run establishes expectation.

## M8 — Teams / Best Available Teams (after the single-team loop works)

- Users can create/save named teams from **their owned/available Characters**; separate proposed source-reviewed templates from account-owned builds. Clear Main/Partner/Third roles, with third slot allowed to be a source-supported second Sub DPS rather than falsely relabeled Support.
- Member chooser: **one Character portrait/name per replacement**, no duplicate entries for every supporting context. Retain third member if the whole new composition is reviewed; otherwise clear, never invent. Context/mode disambiguation only when material; source conditions remain in domain, not long menus.
- Future Teams workbench may use three portraits per saved team as in owner concept, but do **not** reintroduce `Team Options` duplication inside Improve/Sandbox.
- Endstate Matrix / multi-team content allocates each available Character globally across all simultaneous teams and bosses according to supported constraints; optimize **overall modeled result**, not greedily choose the first strongest team. Existing Best Available Teams direction remains architectural reference.
- Do not build a big Team Builder on the assumption that catalog trios are DPS-qualified.

## Cross-workspace acceptance journey (required at every relevant milestone)

1. Fresh user opens Build, manually adds Augusta or imports an approved screenshot. Selected source-backed default Echo is a suggestion until saved. Correct Weapon, stats, partial/full Echo rolls, five slots and reload.
2. Open Improve: exact saved Current appears; Edit Current updates only authorized Build owner, ADD Candidate only candidate. Aborted edit and rejected candidate preserve Current.
3. With a valid supported goal, center panel starts clean, real RNG reveals +5→+25, advice changes only according to verified Gate/cost model, actual spend ledger increments; Settings edits re-evaluate same rolls. Unsupported goals fail closed.
4. Open Sandbox with **no account**: standard team/reference and legal five-slot experiment. Source-supported Reference/Simulated/Change and matching cost scopes display; context/team/Weapon changes invalidate old numbers.
5. Team slot replacement deduplicates Characters, preserves valid existing third member or explicitly empties it; never secretly carries DPS/buffs over.
6. Later: save teams, compute multi-team constraints, inspect cost-vs-modeled-DPS curves with reproducible samples and uncertainty.

## Release and work orchestration

- **Current execution instruction (2026-10-22): DPS V1 integration + **attempt verified one runnable team for each of 59 released selected Characters** first (M0); after 59/59 or documented blocker + explicit owner scope decision, M1 Build concept/owner review, M2 Build, M3 scanner, M4 Improve, M5 Sandbox, then M6–M8.** Do not treat earlier Build-first snapshots as live priority.
- Codex must read **the whole roadmap for direction** and then implement the **next coherent milestone**, not claim the full product in one unverifiable commit. Small enough to review, large enough to deliver an end-to-end outcome. No ten micro-PRs for one interaction. Isolated visual concept review before Build rewrite.
- At workstream start read live code/main + stacked Drafts, `AGENTS.md`, `DEVELOPMENT_PROCESS.md`, `PROJECT_STATUS.md`, Handoff and affected contracts; choose implementation details autonomously. Prioritized bugfixes may interrupt milestone when they block correct Current/Candidate data.
- FAST focused tests during coding; real-browser REVIEW + owner visual review for UI; source/maths/ownership tests for behavior; exact-head FULL before any merge-intended candidate per canonical process. Existing mandatory gates may not be weakened.
- All work in separate reviewed Draft PRs; prevent unrelated PR stack merge or deployment. **No merge, production deploy, private engine publication, force-push or destructive source deletion without separate explicit owner GO.**
- Update `PROJECT_STATUS.md` for current product state/nearest milestones, Handoff for meaningful decisions, `Uppdateringslogg` for one major workstream record, `Buggar` only for a verified bug state change. GitHub owns exact-head status.
- Historical roadmaps, old snapshots and source reviews are audit evidence, **not current orders**. Use `docs/ROADMAP_DOCUMENT_AUDIT.md` for dispositions; preserve unique evidence, canonical source data and links before archiving anything.
