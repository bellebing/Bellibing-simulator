# Bellibing Simulator — Current Project Status

This file is the canonical **current-state + active-roadmap** checkpoint for Bellibing Simulator.

Detailed history belongs in Git history and the external `Bellibing Echo Tool — AI Handoff` update/bug logs. This file should stay current and compact rather than accumulating completed workstream chronology.

## North star

Bellibing is an Echo-building decision tool. Its job is to answer what the user should do next with the Echo/build in front of them, using the selected Character/build/rotation context rather than universal stat-score rules.

The product contract remains: **one useful decision at a time**, with complex combat/probability/economy logic kept behind the decision instead of exposed as a dashboard by default.

## Verified current baseline — 2026-09-02

Current `main`:

- commit: `c4f67bc65dda110709b5f98056f4b8d513c7bda1`;
- PR #151 (`docs: stabilize current project baseline`) is merged;
- PR #151 changed documentation only, so product/gameplay code remains the PR #139 product baseline;
- post-merge Verify run `33655536945`: **SUCCESS**;
- post-merge Export run `33655536834`: **SUCCESS**;
- post-merge GitHub Pages build/deploy/live verification run `33655536894`: **SUCCESS**.

Current canonical readiness remains:

- **43 `PROFILE_COMPLETE_PENDING_FREEZE`**;
- **3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`**;
- **9 `PROFILE_SOURCE_PENDING`**;
- **2 `DPS_READY`** — Augusta and Ciaccona.

Current main execution inventory remains:

- **18 backward-impact reviews**;
- **18 reviewed canonical profiles**;
- **16 profiles with pending execution dependencies**;
- **72 exact pending execution edges**;
- semantic queue: **30 UNREVIEWED / 1 SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING / 11 PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE / 5 BLOCKED_SOURCE_CONFLICT / 9 BLOCKED_SOURCE_SEMANTICS / 16 PROFILE_SPECIFIC_EXECUTION** = **31 actionable shared edges**.

Branch-local worker counts are never canonical main truth until that work is integrated and reverified.

## Active initial scope

Initial implementation/product support is deliberately narrower than retained source data:

- **Sequences:** S0, S1 and S2.
- **Character skills:** maxed skills only — Lv10 wherever source data owns an exact Lv1-Lv10 curve.
- **Deferred:** S3-S6 and Character skill levels below max.
- **Retention:** deferred sequence/skill values remain canonical raw/source-facing data and must not be deleted or flattened away.
- **Consumer rule:** in-scope runtime selects the max skill value explicitly; raw Lv1-Lv10 curves stay intact.
- **Completeness rule:** S0-safe is not automatically S0-S2-complete. Missing/disputed S1/S2 semantics remain pending.

Deferred scope must not create new combat adapters, DPS/profile work or UI/product complexity until an explicit later scope change.

## Architecture boundary

Preserve separation between:

1. raw Character / Weapon / Echo / Sonata source data;
2. Character Mechanics/source-facing facts;
3. Weapon / Echo / Sonata effects;
4. composable profiles;
5. execution/combat-DPS logic;
6. product/UI projection.

Rules:

- GitHub current code is source truth above documentation/history.
- Never guess Wuthering Waves values, state, timing or lifecycle semantics.
- `SOURCE_SEQUENCE_ONLY` is not executable timing evidence.
- A reusable primitive does not close a profile until the canonical event/state/timeline evidence required by that profile exists.
- V9.15 is historical oracle/reference only when explicitly needed.
- UI must project canonical data; it must not create a second Character/profile database.

## Current source coverage

### Characters

- 60 Character records; 57 `RELEASED`.
- Character Mechanics: **54 VERIFIED / 3 SOURCE_BLOCKED / 1866 canonical facts**.
- Mechanics blockers: **Buling, Danjin, Xiangli Yao**.
- Raw/static blockers: **Qingxiao `maxEnergy`, Rover (Electro) `maxEnergy`, Suisui `maxEnergy`**.

### Weapons

- **121 / 121 released Weapons** have source-audited effect coverage across **236 effect rows**.
- Trigger/state/stack/target execution semantics remain separate from source-text coverage.

### Echo / Sonata

- **181 / 181 released Echoes** reviewed for stable identity/COST/Sonata membership.
- **34 / 34 released Sonata sets** reviewed.
- Sonata Effect review: **62 / 62 activation tuples / 86 source-backed rows**.
- **181 / 181 released Echo skills** are source-reviewed.
- Main exact Rank-5 Echo attack catalog: **5 attack profiles / 6 attack facts**.

## Profiles and product support

Exact `PROFILE_SOURCE_PENDING` on main:

- semantic: **Baizhi, Brant, Jianxin, Phoebe, Verina, Yuanwu**;
- raw/static: **Qingxiao, Rover (Electro), Suisui**.

Current `DPS_READY` profiles:

- Augusta — `augusta-standard` / `AUGUSTA_STD_V1`;
- Ciaccona — `ciaccona-cartethyia-aero` / `CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1`.

Product boundary:

- Augusta has verified Roll Assist policy + owned-build evaluator.
- Ciaccona has verified +25 whole-build/completed-candidate DPS support under its locked context, but no Roll Assist checkpoint/stopping-policy binding.
- `DPS_READY` does not automatically authorize Roll Assist or owned-build support; each product adapter/policy remains explicit.

## Active known gaps on main

Keep these fail closed:

- **BUG-002** — accepted `BETTER` replacement lifecycle is not yet explicit end-to-end verified as the next incumbent/best-so-far state.
- **BUG-008** — Impermanence Heron transfer: source conflict.
- **BUG-009** — Stringmaster / Rime-Draped Sprouts skill-stack lifetime: refresh/expiry semantics unresolved.
- **BUG-010** — Fallacy profile cast variant: normal/tap vs hold/release unresolved in supported rotations.
- **BUG-011** — Defier's Thorn `DT-DEF`: timing grammar unresolved.
- **BUG-012** — Rover (Aero) support execution: exact total/timeline/branch semantics unresolved.
- **BUG-013** — Blazing Brilliance at-cap stack lifecycle unresolved.
- **BUG-014** — Changli Standard Rotation exact denominator unresolved.

Resolved bugs stay in the external bug register/history rather than being repeated here.

## Existing worker backlog

Gameplay/data PRs **#140-#150** remain unmerged sibling work from the old `2af8221b` baseline. Their exact-head verification remains useful evidence, but every selected worker must be rebased/integrated against current main and freshly verified before merge.

Current integration order from stabilization review:

1. **#143 Mornye** — first candidate; small/local additive surface.
2. **#144 Zani** — next candidate only after #143 has been independently integrated and main rechecked.
3. **#141 Rover (Havoc)** — next candidate only after #144 has been independently integrated and main rechecked.

All other #140-#150 workers remain parked for later individual review. Do not bulk-compose sibling branches.

Control/UI cleanup:

- **#152** stale Mornye rehearsal: closed without merge; historical evidence only.
- **#153** unintended dropdown UI workstream: closed without merge; branch/history retained for possible later UI work.

## Active roadmap

There is one active roadmap for the current initial scope.

### Phase 1 — clean integration baseline

Integrate useful existing worker work **one PR at a time** from current main. After every main movement:

- re-read current source truth;
- resolve only real integration conflicts;
- run the full verification contract;
- update current status/Handoff;
- select the next worker only after the new baseline is green.

Do not create more parallel Character workers while the current sibling backlog is being integrated.

### Phase 2 — S0-S2 + max-skill coverage

Once the integration backlog is under control, audit supported Characters/profiles specifically for the active scope:

- S0 execution truth;
- S1 effects/semantics;
- S2 effects/semantics;
- max-skill damage/resource facts;
- required Weapon/Echo/Sonata/team state;
- exact source blockers.

This is a coverage audit, not permission to invent missing execution data.

### Phase 3 — executable combat / DPS closure

Promote profiles only when their actual dependencies close.

A Character worker must stop when the remaining blockers require missing/conflicting source, unavailable exact timeline/state evidence or an explicitly deferred scope. Do not keep producing review-only/validation-only layers that close no real canonical dependency.

`ENGINE_MODELED` and `DPS_READY` remain exact claims, not architecture milestones.

### Phase 4 — product activation

For each sufficiently verified Character/profile, connect the existing product architecture rather than creating Character-specific calculators:

- owned five-Echo build evaluation;
- mandatory gates;
- candidate-vs-incumbent replacement;
- Roll Assist/stopping policy when independently verified;
- Upgrade Mode / best next improvement economics.

The product should continue answering the user's next action, not expose internal engine complexity by default.

### Deferred until later

- S3-S6 implementation/product support;
- Character skill levels below max;
- nonessential UI polish such as the parked #153 dropdown pass;
- unsupported account-sync/API promises;
- other side work that does not move the active S0-S2/max-skill decision-tool path.

## Verification contract

A merge-intended head must pass:

- source/raw/profile audits;
- Profile × Adapter/readiness audits;
- full Node tests;
- strict web build;
- permanent real-Chrome Alpha/Roll Assist/owned-build regressions;
- diff/whitespace checks;
- artifact packaging / Export.

After merge, recheck main. UI/live behavior claims require deployed real-Chrome verification where applicable.
