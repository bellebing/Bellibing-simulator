# Recommended Character Stats — Augusta pilot source review

Reviewed 2026-10-03 from canonical main `269682d30fb395ed58414a3f671677c1586f56b3`, after PR224 merged. Iteration scope ends at a dedicated source/domain projection. The original pilot had no roster expansion. The subsequent [DPR iteration](CHARACTER_RECOMMENDATIONS_DPR_REVIEW.md) adds an independent reference family; this Prydwen source/review remains intact. No visible UI changes, Build Need, Improvement Cost or evaluator. AI Handoff UPD-319 was read and remains unedited.

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
| `2000-2800+` | OPEN_ENDED_BAND, minimum 2000, upperReference 2800; trailing `+` preserved |
| `65-80%+`, `210-260%+`, `40-70%+` | OPEN_ENDED_BAND with ratio minimum/upperReference .65/.80, 2.10/2.60, .40/.70 |
| Conditional range | Preserve conditions alongside exact numeric wording; inline prose that cannot be separated safely remains UNRESOLVED |
| Typo, missing unit, reversed range, nonfinite or unsupported prose | UNRESOLVED; canonical approval fails closed |

A trailing-plus range is **OPEN_ENDED_BAND**: `minimum` is the lower recommendation endpoint; `upperReference` is the source's upper band reference. The `+` explicitly leaves the recommendation open above that reference, so values above it are not rejected by this source representation. `upperReference` is neither a maximum, gameplay cap nor automatically a preferred target. Likewise, BOUNDED_RANGE's `upper` is a recommendation endpoint, never a gameplay maximum; values above it are not thereby invalid. Build Need interpretation remains deferred: no discard rule, saturation point, preferred target or marginal-value behavior is defined. Original wording and context remain evidence for later display without reconstructing punctuation from evaluator semantics.

The existing `CharacterStatTarget` minimum/preferred contract is not changed or used to flatten these values. The dedicated discriminated union supplies minimum-only, bounded range, open-ended band and exact semantics. Future policy/UI wiring must explicitly handle each shape and unresolved text; no automatic conversion is provided. Display text belongs to preserved source evidence, not a prototype-owned numeric dataset.

## Augusta evidence and outcome

Codex direct Prydwen Augusta guide access returned `curl: (56) CONNECT tunnel failed, response 403`. An independent guide discovery attempt at WutheringWaves.gg returned the same policy denial; page existence/content was not established. These failed retrieval observations remain unchanged in the research artifact. They do not establish source unavailability.

A current direct Prydwen capture was subsequently supplied **externally** by the user for repository review on 2026-10-03. Codex did not fetch the page. Its separate successful evidence record is `CAPTURED / EXTERNALLY_SUPPLIED_SOURCE_CAPTURE`. The current guide context is **Patch 3.6**, page/profile updated **2026-09-10**. It recommends Level 90 endgame total stats for a 5-star at S0, measured in the in-game stat screen while the Character is out of combat but active in the party. Exact captured wording and surrounding context are checked in, pinned by the research artifact SHA-256 and the source package binding. Canonical review can therefore proceed.

Exact captured stat line:

`HP: 14500+; DEF: 1100+; ATK: 2000-2800+; CRIT Rate: 65-80%+; CRIT DMG: 210-260%+; Energy Regen: 116%-125%; Electro DMG Bonus: 40-70%+`

`data/research/profile-horizontal-source-candidates-2026-08-31.json` remains **CANDIDATE_ONLY / NOT_VERIFIED**. It has no Augusta row; its bytes and provenance remain pinned independently. Neither it nor the research artifact automatically approves semantic truth. Explicit per-metric review below approves source-agreeing interpretations, including the lossless trailing-plus band kind.

The legacy repository ER-gate paraphrase, captured 2026-08-29 in `src/data/statTargetProfiles.ts`, remains discovery evidence in the source package. It lacks verbatim primary wording and is not cited by these canonical rows. The existing legacy gate continues serving its existing consumer; its minimum/preferred values are not the dedicated canonical source.

All seven rows below cite the externally supplied current Prydwen capture and share the Level 90 / S0 / out-of-combat active-party total stat-screen basis. Unknown weapon and rotation remain null. ER team endpoints are preserved as source conditions, without executable predicates or a universal team assumption.

| Metric | Exact source wording | Bellibing canonical value | Additional source conditions | Status |
| --- | --- | --- | --- | --- |
| HP / TOTAL_HP | `14500+` | MINIMUM 14500 POINTS | None supplied | VERIFIED |
| DEF / TOTAL_DEF | `1100+` | MINIMUM 1100 POINTS | None supplied | VERIFIED |
| ATK / TOTAL_ATK | `2000-2800+` | OPEN_ENDED_BAND minimum 2000, upperReference 2800 | None supplied | VERIFIED |
| CRIT Rate / TOTAL_CRIT_RATE | `65-80%+` | OPEN_ENDED_BAND minimum .65, upperReference .80 | None supplied | VERIFIED |
| CRIT DMG / TOTAL_CRIT_DAMAGE | `210-260%+` | OPEN_ENDED_BAND minimum 2.10, upperReference 2.60 | None supplied | VERIFIED |
| Energy Regen / TOTAL_ENERGY_REGEN | `116%-125%` | BOUNDED_RANGE 1.16–1.25 RATIO | 1.16: Mortefi + Shorekeeper; 1.25: Iuno + Shorekeeper | VERIFIED |
| Electro DMG Bonus / ELECTRO_DMG_BONUS | `40-70%+` | OPEN_ENDED_BAND minimum .40, upperReference .70 | None supplied | VERIFIED |

**7/7 VERIFIED, 0 PENDING, 0 REVIEW_REQUIRED**. All seven comparison statuses remain PENDING and aggregate source review status is CURRENT. The four formerly unresolved rows now have explicit reviewed interpretations that agree with their exact captured primary wording and preserve the trailing `+` losslessly. Parsing alone does not approve them: provenance, source binding, primary evidence and per-row approval checks still apply.

The externally supplied historical comparison is the [WWPlus Augusta 2.8 guide](https://wwplus.net/augusta/): ATK >=2200, CRIT Rate >=70%, CRIT DMG >=270%, Energy Regen >=110%, Electro DMG Bonus 40%–70%. Its page update date and measurement basis were not supplied and remain null. It is recorded as HISTORICAL_NON_CURRENT research context, not equal-current corroboration or disagreement for Patch 3.6, and is not cited by canonical metric reviews. No averaging occurs. Its materially different recommendations illustrate why source identity, patch/time and measurement context must remain attached to evidence.

Source binding: `d0fbfd02fa424cfe553c44e61655a34dc17433e88a8eada428bbda8eea135ea4`.

The source/domain semantic decision is implemented for Augusta only. This iteration stops for semantic/domain review; roster-wide Character recommendations, UI wiring, Build Need, Improvement Cost and evaluator behavior remain Pending.

## Validation and unchanged boundaries

Focused command: `node --experimental-strip-types --test --test-isolation=none test/characterRecommendations.test.ts test/improvePolicySources.test.ts`: **47/47 PASS** (34 Character Recommendation tests, 13 existing Improve source tests). Synthetic fixtures are clearly labelled contract tests and never enter canonical gameplay data. Tests cover provenance/date/conditions/pins, units, minimum/range/exact and open-ended band semantics, rejection of lossy or mismatched interpretations, candidate rejection, disagreements, missing evidence, drift, detached results, unsupported roster and unchanged legacy/UI projection.

`npx tsc -p tsconfig.web.json --noEmit`: PASS. Strict `npm run build`: PASS, including generated Improve-module/data parity. Whitespace check: PASS. No full suite, browser matrix or repository Verify/Export workflow is run under the user's iteration constraint. UI assets, generated Improve policy data, presentation adapter, persistence and existing contracts remain unchanged. The unrelated post-merge Sequence spacing observation in Verify #1803 remains unresolved and outside scope.
