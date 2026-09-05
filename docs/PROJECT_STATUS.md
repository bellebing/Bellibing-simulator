# Bellibing Simulator — Current Project Status

Last reconciled: 2026-09-05

This is the canonical living roadmap for the latest active Factory branch. Historical PR bodies, old worker branches and update-log rows are context, not competing roadmaps.

## 1. Implementation truth and review stack

### Current `main`

- Canonical runtime/implementation truth remains `main` at `612324b8aba1dd1c4ae8a189ebf74062b291033b` until an explicitly authorized merge changes it.
- This is the post-Mornye/Zani baseline.
- Current-main readiness remains `43 PROFILE_COMPLETE_PENDING_FREEZE / 3 CHARACTER_MECHANICS_SOURCE_BLOCKED / 9 PROFILE_SOURCE_PENDING / 2 DPS_READY`.
- Current-main execution remains `19 reviews / 19 reviewed profiles / 17 profiles with pending execution / 83 exact edges`, queue `40/1/11/5/9/17 = 41 actionable shared`.

### PR #174 — review-ready Factory cutover

- Branch: `factory/cutover-v1-2026-09-05`.
- Review-ready head: `74ee4155f50ebb9a6717f978fc491fbaf3427d08`.
- Preserves the verified #159-#173 Reference Team payload linearly above current main.
- Exact-head Factory Fast #3, Verify #1040, Export #949 and Character Mechanics import #164 succeeded.
- #174 is open, non-draft, mergeable and **not merged**.
- Merge requires explicit user authorization.

### PR #175 — review-ready Factory Milestone 01 stacked on #174

- Branch: `factory/provider-evidence-standard-effect-v1-2026-09-05`.
- Review-ready head: `dfdd8b90a52f01091b97ba030dacefdff31d5825`.
- Base: #174 branch/head, not `main`.
- Scope: tiny multi-provider evidence mapping + reconciliation/exception routing + one declarative standard-effect family + regression proof.
- Factory Fast #11 and full Verify #1043 succeeded on the exact head.
- #175 is open, non-draft, mergeable and **not merged**.
- No Character-by-Character work and no post-#173 Reference Team semantic slicing.

### PR #176 — active Factory Milestone 02 stacked on #175

- Branch: `factory/evidence-reporting-v1-2026-09-05`.
- Base: #175 branch/head, not `main`.
- Scope: deterministic evidence/reconciliation reporting and export over reviewed Factory mappings.
- Code-bearing head `6583e99b17ac9a5410e0ac3772a08ce10afcfd9b` passed full Verify #1046 and Character Mechanics import #167 after a whitespace-only first-pass failure was corrected.
- The current documentation sync is stacked above that verified code head; exact final-head Verify is required before Milestone 02 is considered fully review-ready.
- #176 remains a draft and **not merged**.
- #174, #175 and #176 all require explicit user authorization before any merge.

## 2. One active development direction

**ACTIVE DEVELOPMENT MODEL: BELLIBING FACTORY v1**

**PRODUCT GOAL: BEST AVAILABLE TEAMS**

Factory is a development/data pipeline that feeds, but never bypasses, the existing architecture:

`provider raw evidence → normalized reviewed candidates → canonical raw/source → Character Mechanics / Weapon / Echo / Sonata effects → profiles → execution/combat-DPS → product/UI`

Locked rules:

- external evidence is never canonical/runtime truth by itself;
- `CONFLICT / MISSING / UNKNOWN` and unresolved timeline/state semantics stay fail-closed;
- `SOURCE_SEQUENCE_ONLY` is not executable timing;
- V9.15 is historical oracle/reference only when explicitly required;
- current gameplay scope remains S0-S2 + maxed Character skills;
- S3-S6/lower skill levels remain retained source data but deferred;
- quickswap remains deferred for initial Best Available Teams;
- do not build one calculator per Character or a universal gameplay DSL;
- do not broaden to roster-scale provider ingestion before small-family Factory reuse is proven.

## 3. Reference Team 01 — Factory golden regression

Team: **Augusta / Iuno / The Shorekeeper**.

Preserved through #174 → #175 → #176:

- dependency coverage: `PARTIAL`;
- `dpsReady = false`;
- Augusta historical `.37` static context unchanged;
- Wan Light is not consumed by Augusta DPS;
- Shorekeeper Stellarealm numeric Crit composition is not guessed;
- no Factory provider candidate may close a Reference Team dependency automatically.

Exactly six required dependencies remain `PENDING`:

1. `iuno-wan-light-at-cap-trigger-semantics` — `SOURCE_MISSING`.
2. `iuno-wan-light-augusta-event-overlap` — `TIMELINE_MISSING + STATE_MISSING`.
3. `shorekeeper-stellar-symphony-augusta-window-overlap` — `TIMELINE_MISSING + STATE_MISSING`.
4. `shorekeeper-rejuvenating-augusta-window-overlap` — `TIMELINE_MISSING + STATE_MISSING`.
5. `shorekeeper-fallacy-team-atk-augusta-window-overlap` — `TIMELINE_MISSING`.
6. `shorekeeper-fallacy-wielder-er-stellarealm-state` — `TIMELINE_MISSING + STATE_MISSING`.

Related blockers remain open/relevant:

- `BUG-028` Augusta team-context correctness / duplicated Thunderflare + stale `.37` package assumptions;
- `BUG-029` Iuno Wan Light at-cap + actual Augusta Domain/Shield/action overlap;
- `BUG-008` Impermanence Heron source conflict;
- `BUG-010` Fallacy active-damage variant source semantics.

Milestones 01–02 close none of these blockers.

## 4. Factory Milestone 01 — reusable source/effect proof

PR #175 established two bounded contracts without changing gameplay/DPS/UI truth.

### Tiny multi-provider fact family

- family: `weapon-r1-attribute-dmg-bonus-v1`;
- subject: `ages-of-harvest`;
- field: `r1.attribute-dmg-bonus.value`;
- Prydwen review lane identifies the R1 general DMG Bonus value;
- FrequencyManager pinned `f585e47a868cb2b65845367b976a1781f130c758` supplies the corresponding unconditional structured `elemDmg` value.

The normalizer deliberately maps only the shared numeric R1 attribute/general-DMG value. It does **not** infer trigger, duration, stacking, refresh, target or profile uptime.

Matching evidence yields `CONSENSUS / REVIEW_CANDIDATE / MANUAL_SOURCE_VALIDATION_REQUIRED`; disagreement must yield `CONFLICT / EXCEPTION_QUEUE` rather than Factory selecting a winner.

### First declarative standard-effect family

- family/runtime primitive: `weapon-cast-timed-self-window-v1`;
- proof identities: Ages of Harvest `AH-INTRO` and `AH-SKILL`;
- runtime source authority: `BELLIBING_CANONICAL_WEAPON_EFFECT_CATALOG` only.

Factory specs carry identities only. Numeric values, durations, scope, source trigger text and runtime semantics remain owned by Bellibing canonical effect data and the existing reviewed runtime primitive.

This is generation over an existing mechanic family, not a new gameplay engine.

## 5. Factory Milestone 02 — deterministic evidence/report contract

PR #176 generalizes the review/output boundary without adding another Character or gameplay mechanic slice.

Implemented contracts:

- reviewed mapper registry; unregistered evidence families fail closed;
- deterministic reconciliation and candidate ordering;
- summary counts for `CONSENSUS / SINGLE_SOURCE / CONFLICT / MISSING / UNKNOWN`;
- explicit review-candidate and exception-queue keys;
- provenance-rich provider/source/version/capture output;
- deterministic JSON + Markdown rendering with no generated-at timestamp;
- CLI export from `data/factory/evidence/*.json`;
- checked-in `data/generated/factory-evidence-report.json` and `docs/generated/FACTORY_EVIDENCE_REPORT.md`;
- `audit:factory-evidence-report` drift validation wired into `verify:fast:factory`;
- regressions for deterministic output, duplicate reconciliation keys, unreviewed-family rejection, provenance visibility and manual-promotion preservation.

Current report remains intentionally bounded to the one reviewed Milestone 01 fact family:

- 1 reconciliation;
- 1 `CONSENSUS`;
- 1 review candidate;
- 0 exception rows.

The report is review input only. It never promotes provider evidence into canonical runtime truth.

## 6. Provider/license boundary

Current Factory dispositions:

- Prydwen extraction/review lane — keep `REVIEW_ONLY`; extractor code is MIT, page content still requires Bellibing source review.
- `Voruzhu/FrequencyManager` — MIT; approved for bounded independent-evidence prototypes, not broad auto-ingestion.
- `d4rkOfficial/wuwa-afyg-tool` — repository MIT; provider architecture may be studied, but Wuwa data requires separate provenance/review before any mapping.
- `DommyMM/wuwabuild` — no current repository license found during cutover audit; no new code/data copy without explicit reuse rights.

No external provider has canonical authority.

## 7. Historical PR disposition

- #159-#173 are closed **unmerged** historical/review checkpoints whose intended verified payload is preserved in #174.
- #140/#141/#142/#145-#150 are closed **unmerged** evidence/fixture/Factory-backlog/fresh-review inputs.
- They are not an implicit integration queue.
- Any future reuse starts from then-current Factory truth and imports only the smallest freshly reviewed payload.

## 8. Verification model

### Fast iteration path

`npm run verify:fast:factory` now runs:

1. targeted `test:factory`;
2. deterministic generated-report drift audit;
3. profile-readiness audit;
4. strict web build.

`.github/workflows/factory-fast.yml` also checks diff whitespace when invoked for its configured target/ref. The workflow currently targets pull requests into `main`; stacked Factory PRs should not rewrite or weaken that trigger merely to manufacture a fast-path status.

### Full PR path

`.github/workflows/verify.yml` runs on stacked Factory pull requests, so full repository verification remains available before #174 is merged.

Full Verify includes source/raw/profile gates, Profile × Adapter/readiness, full Node tests, strict build, required real-Chrome regressions and whitespace.

PR #176 code-bearing head `6583e99b17ac9a5410e0ac3772a08ce10afcfd9b` passed full Verify #1046. The first #176 full run failed only diff whitespace; the two trailing-space lines were corrected without weakening any gate, then #1046 passed.

Export remains the main-targeting artifact contract. #174 retains Export #949 SUCCESS; stacked #175/#176 do not substitute for or invalidate it.

## 9. Current next step

Complete Milestone 02 without merging anything:

1. receive exact-head full Verify for the final documentation-synced #176 head;
2. synchronize Bellibing Echo Tool Handoff, UPD-158 and BUG-028/029 preservation notes;
3. keep #176 draft unless/until its exact final state is deliberately promoted to review-ready;
4. keep #174/#175/#176 unmerged until explicit user authorization.

After Milestone 02 is exact-head verified, the preferred next Factory slice is a **second small, already-understood source fact family** through the same reviewed mapper registry and deterministic reporting path. Its purpose is to prove reuse across fact families, not to expand roster breadth.

That next slice must preserve provider raw/provenance separation, fail closed on disagreement/unknowns, require manual canonical promotion, and avoid Character-specific calculators, a universal gameplay DSL and roster-scale ingestion.
