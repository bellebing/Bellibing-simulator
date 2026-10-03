# Recommended Character Stats — Augusta pilot source review

Reviewed 2026-10-03 from canonical main `269682d30fb395ed58414a3f671677c1586f56b3`, after PR224 merged. Iteration scope ends at a dedicated source/domain projection. No visible UI changes, Build Need, Improvement Cost or evaluator; no roster expansion. AI Handoff UPD-319 was read and remains unedited.

## Proposed canonical schema

`characterRecommendationDomain.ts` reuses the six existing `BuildStatMetric` identities and adds the narrowly scoped `ELECTRO_DMG_BONUS` identity in **CharacterRecommendationMetric**. This does not enlarge persisted Customize metrics or reinterpret Echo `StatName`. Units are defined once by metric: HP/DEF/ATK are POINTS; CRIT/ER/Electro bonus are RATIO (100% = 1).

Pipeline: captured/discovery evidence → explicit per-metric source review → `projectRecommendedCharacterStats()` → later Improve policy projection → later UI → later Build Need. Existing Improve projections and legacy profile gates continue serving their existing consumers; they are not the dedicated recommendation dataset. Character priorities, Echo policy, weapon stats and main-stat layouts cannot supply recommendations.

Each source evidence record retains source identity/URL, capture date, artifact/locator, exact wording (nullable when unavailable), a distinct excerpt and context. Context preserves conditions, team, weapon, sequence, rotation and measurement basis, each nullable when unknown. Conditions remain prose evidence, never executable predicates. Review date is separate from evidence capture date. Reviews explicitly choose APPROVED_FOR_CANONICAL_VERIFIED, PENDING or REVIEW_REQUIRED for each metric and separately record Bellibing's numeric interpretation.

Each canonical row includes metric/unit, review ID, exact SHA-256 source binding, detached evidence/conditions, comparisonStatus PENDING, and either a VERIFIED value or null with PENDING/REVIEW_REQUIRED and reason. `sourceReviewStatus` summarizes the result. Unsupported Characters return PENDING with no invented universal row set. Augusta's seven row identities are an explicit review scope, not seven verified facts. New genuine metrics require a typed domain addition and source review.

The source binding uses Improve's stable canonical serialization/SHA-256 helper and covers the entire source package, including wording, provenance, conditions and the research artifact pin. A deterministic test verifies the repository research bytes against that pin. Runtime projects the reviewed source snapshot; it does not fetch remote pages or reread research files. Any supplied source snapshot drift fails closed. Review records are maintained explicitly in source control; matching a pin or parsing text alone never approves it.

APPROVED requires primary-source captured wording, complete provenance, explicit interpretation and agreement of every cited statement. Candidate-only and legacy-profile references remain insufficient even if someone changes their review decision to approved. Disagreement, unsupported wording or a mismatched interpretation yields REVIEW_REQUIRED with all cited evidence retained, never an average. A changed primary source requires a fresh capture, semantic review and new source pin. Conditional verified rows retain their conditions; this API does not choose a universal target or establish current-build applicability/comparability.

## Numeric semantics

`interpretRecommendationText()` recognizes narrowly defined numeric syntax for discovery. The returned normalization is never a review approval. The review must explicitly approve its interpretation before projection can return VERIFIED. The original source wording remains stored separately.

| Source syntax example (contract examples only) | Interpretation |
| --- | --- |
| `14500+` | MINIMUM, minimum 14500; open-ended display retains `+` |
| `116-125%` | BOUNDED_RANGE, minimum 1.16, upper recommended endpoint 1.25; no preferred target or hard gameplay cap inferred |
| `100%` | EXACT, target 1; not an invented minimum/preferred pair |
| `2000-2800+` | UNRESOLVED with source endpoints 2000/2800; no canonical minimum/preferred/upper inferred |
| `65-80%+`, `40-70%+` | UNRESOLVED with ratio endpoints; trailing plus range semantics require further review |
| Conditional range | Preserve conditions alongside exact numeric wording; inline prose that cannot be separated safely remains UNRESOLVED |
| Typo, missing unit, reversed range, nonfinite or unsupported prose | UNRESOLVED; canonical approval fails closed |

The existing `CharacterStatTarget` minimum/preferred contract is not changed or used to flatten these values. The dedicated discriminated union supplies minimum-only, bounded range and exact semantics. Future policy/UI wiring must explicitly handle each shape and unresolved text; no automatic conversion is provided. Display text belongs to preserved source evidence, not a prototype-owned numeric dataset.

## Augusta evidence and outcome

Direct Prydwen Augusta guide access returned `curl: (56) CONNECT tunnel failed, response 403`. An independent guide discovery attempt at WutheringWaves.gg returned the same policy denial; page existence/content was not established. No source payload from either was captured, so neither counts as current checked evidence or independent corroboration. The research artifact records the attempt date separately.

`data/research/profile-horizontal-source-candidates-2026-08-31.json` remains **CANDIDATE_ONLY / NOT_VERIFIED**. It has no Augusta row. Its semantic review and canonical mappings concern other scoped Characters; they do not approve Augusta recommendations. The checked-in August 30 candidates and associated cohort semantic promotion review were inspected as context; they do not supply an Augusta primary total-stat capture either. The original candidate artifact/provenance is unchanged and its bytes are pinned in the new research record.

Available Augusta evidence is a legacy repository ER-gate **paraphrase**, captured 2026-08-29, in `src/data/statTargetProfiles.ts` at `augusta-recommended-targets-v915-current / gates[0].notes`. Its Prydwen attribution is preserved independently from the legacy V9.15 provenance. This review does not read values from V9.15 or infer targets from that gate's `minimum`/`preferred` fields. Exact primary wording and measurement basis are not available for the new dataset. The existing legacy gate remains valid for its existing consumer; its existence is not complete recommendation coverage.

| Metric | Canonical numeric value | Original source wording | Available source/reference | Conditions | Status |
| --- | --- | --- | --- | --- | --- |
| HP / TOTAL_HP | null | Not captured | No Augusta total-stat evidence | Unknown | PENDING |
| DEF / TOTAL_DEF | null | Not captured | No Augusta total-stat evidence | Unknown | PENDING |
| ATK / TOTAL_ATK | null | Not captured | No Augusta total-stat evidence | Unknown | PENDING |
| CRIT Rate / TOTAL_CRIT_RATE | null | Not captured | No Augusta total-stat evidence | Unknown | PENDING |
| CRIT DMG / TOTAL_CRIT_DAMAGE | null | Not captured | No Augusta total-stat evidence | Unknown | PENDING |
| Energy Regen / TOTAL_ENERGY_REGEN | null; legacy paraphrase suggests 1.16–1.25, unpromoted | Not captured. Repository excerpt: “Current Prydwen endgame band is 116%-125%; higher end is estimated for Iuno + Shorekeeper, matching the existing standard context.” | Legacy Prydwen-attributed repository reference, checked 2026-08-29 | Higher end estimated for Iuno + Shorekeeper; weapon/sequence/rotation/measurement basis not captured | PENDING |
| Electro DMG Bonus / ELECTRO_DMG_BONUS | null | Not captured | No Augusta total-stat evidence | Unknown | PENDING |

No additional source-backed whole-build metric was captured. No Flat ATK recommendation is added. Source disagreements cannot be determined without primary payloads; lack of access is not agreement. **0/7 VERIFIED, 7/7 PENDING** is the actual pilot coverage. The model/tests are complete for review; Augusta numeric sourcing remains blocked. Next source step is an authorized primary guide capture with surrounding context, independent relevant comparison when available, and explicit metric review. No roster or UI continuation is started.

## Validation and unchanged boundaries

Focused command: `node --experimental-strip-types --test --test-isolation=none test/characterRecommendations.test.ts test/improvePolicySources.test.ts`: **37/37 PASS** (24 new recommendation tests, 13 existing Improve source tests). Synthetic fixtures are clearly labelled contract tests and never enter canonical gameplay data. Tests cover provenance/date/conditions/pins, units, minimum/range/exact and trailing-plus semantics, candidate rejection, disagreements, missing evidence, drift, detached results, unsupported roster and unchanged legacy/UI projection.

`npx tsc -p tsconfig.web.json --noEmit`: PASS. Strict `npm run build`: PASS, including generated Improve-module/data parity. Whitespace check: PASS. No full suite, browser matrix or repository Verify/Export workflow is run under the user's iteration constraint. UI assets, generated Improve policy data, presentation adapter, persistence and existing contracts remain unchanged. The unrelated post-merge Sequence spacing observation in Verify #1803 remains unresolved and outside scope.
