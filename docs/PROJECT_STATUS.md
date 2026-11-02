# Bellibing Simulator — Current Project Status

[Development Process v2](DEVELOPMENT_PROCESS.md) owns the worker process.
GitHub owns remote branches, PRs, checks and deployment evidence. Local evidence
is not a claim that a candidate is merged, published or gameplay-qualified.

## Current priority

The active goal is [Foundation V1](FOUNDATION_V1.md): continue locally through
M0–M5 using #360 as the only public integration owner. IndexedDB remains the
account owner; desktop/original English cards and supported execution are scope.
#361/#362 are selectively reused. #363/private #46 are now paired locally;
#47 and the research/artwork archives remain parked. Current implementation adds
portable account state, protected recovery, durable sync and browser-local OCR
reuse. Local/emulator evidence is separate from final FULL and hosted acceptance.
External Firebase activation, major account UX, real-data migration, publication,
merge and deployment still need their specific approvals.

## Local import / Inventory candidate

The [local integration contract](CHARACTER_IMPORT_LOCAL.md) and
[continuation handoff](CHARACTER_IMPORT_HANDOFF.md) describes setup,
ownership, migration, supported fields, licensing and remaining limits.

- Import Character opens at its button over the real active tool. Upload/drop/
  paste and tab-scoped corrected drafts preserve context across close/navigation.
  The centered primary workspace group and recurring Inventory entry remain.
- Recognition uses the actual local GPL scanner and canonical catalogs. Images,
  full OCR records, user backups and browser evidence remain outside public source.
- Recovered geometric recognition handles the three supplied cards; raw DEF
  compatibility/provenance and immutable originals remain reviewable.
- Review and save are explicit. Assigning imported equipment as Current requires
  its own choice; replacing an existing Character requires confirmation. Uncertain
  identity and normalization proposals stay visible. Unprinted facts stay unknown.
- IndexedDB owns stable physical Echo/Weapon instances and CharacterBuildState
  references. Transactions save an account and recovery before-state together;
  revision/identity checks reject stale writers. Unowned legacy drafts/templates
  remain drafts and never silently become owned physical items.
- Explicit Inventory fact review and Build Skills/Forte confirmation preserve
  physical IDs. Unknown/unsupported facts remain Pending; saved investments flow
  to Improve without a reference fallback.
- The existing Build editor and #360 Improve reader use the same committed owner
  through memory-only projections. Build edits are staged until explicit save.
  Per-Character revisions separate unrelated account additions from Current.
- JSON backup/restore validates schema, canonical binding, exact values, identities
  and assignments. Existing legacy keys are retained unchanged; migration needs a
  validated backup first. Explicit recovery can restore before-states or return
  to original legacy/empty storage. No automatic merge or deduplication.
- Local checks exercise real images, reload, Build/Improve and restoration, plus
  transaction failures and ownership boundaries. This is focused local evidence;
  full/MERGE verification, production migration and hosted acceptance are separate.

The first slice retains the real functional Build composition with the six
approved #361 still backgrounds and an item-art Inventory grid/inspector. Full #361
visual parity, +0 stacking and broader scanner formats remain deferred. Google
login/cloud sync are local candidates awaiting service and UX approval. No private decision implementation is added to public assets.

## Build / account foundation

The existing Character builder includes selection, local Character-owned builds,
Weapon/Echo slots, Sequence/Forte, static Build Stats, Character art and Build Card.
The historical owner is v34 `bellibing-ui-checkpoint-v34`; the new local candidate
retains those bytes as recovery and adapts CharacterBuildState to one Inventory.

[Build handoff](UI_BUILD_HANDOFF_V34.md), [UI semantics](UI_UX_STATUS.md) and
[layout/motion](UI_LAYOUT_MOTION_CONTRACT.md) remain references. Current owner scope
prioritizes desktop and a functional local journey, rather than new visual work.

Inventory ownership does not establish combat readiness. Rank, level, refinement,
Minor Forte, actual teammates and source-supported schedules must not be invented.
An incomplete imported build can be preserved while evaluation remains Pending.

## Improve

Public #360 implements actual +5…+25 observations, explained five-slot opportunities,
net resource estimates, source provenance and private Continue/Restart advice.
Its backend integration is in private main; public integration/release remains
separate. See [observed Improve contract](ui-lab/INTERACTIVE_ECHO_ADVICE.md).

Current/Candidate, saved resources and the fun RNG Sandbox remain separate.
Unsupported actual context is Pending. Optional numerical contribution needs a
legal comparable reference. Neither static priorities nor tiny positive DPS
changes establish a meaningful improvement or globally optimal strategy.

The compact neutral-choice extension from #363/private #46 is paired locally. Automatic
context-qualified five-best-stat selection, account prioritization, meaningful-gain
policy and alignment of all decision objectives remain unfinished. This workstream
does not tune them or expand the private evaluator.

## Canonical data / recommendations / DPS

- Catalog: 59 released selectable identities; Suoming is confirmed upcoming.
  Source-data coverage and presentation/execution readiness are distinct.
- Source-backed signature relationships and Prydwen guide references cover the
  released roster. See [equipment review](CHARACTER_EQUIPMENT_AND_RECOMMENDATIONS_REVIEW.md).
- Modern DEFAULT Calc target references cover 19 released identities. Variant-only,
  blank, legacy-only and missing-source groups remain Pending. See the
  [DPR review](CHARACTER_RECOMMENDATIONS_DPR_REVIEW.md). Targets are not marginal DPS.
- BUG-042 remains the reviewed Echo requirements/preferences coverage gap. Public
  Recommended defaults do not infer missing per-Echo minima, counts or ER policy.
- Source-native first-team coverage code from public #349/private #40 is present
  in current mains through later integration. Its 59 selected-Character model,
  independent parity and observed-build proofs are bounded experimental evidence;
  gameplay-qualified coverage remains 0/59. Arbitrary gear/teams are not promised.
- [First-team coverage](DPS_FIRST_TEAM_COVERAGE.md) and private numeric/source proofs
  distinguish executable references from actual supported rolled builds. Historical
  documents saying all of this is still unmerged are not current GitHub truth.
- The fixed Augusta/Iuno/Shorekeeper pilot and shared pinned source calculator keep
  whole-team energy, equipment, mode, Sequence, schedule and freshness gates. No new
  general damage engine, invented rotation or reference-team fallback is planned.
- Current product investment scope remains S0–S2 and source-supported max Skills.
  Other raw/source facts are retained without implying executable coverage.

## Sandbox / Teams / runtime

Sandbox has real detached RNG, canonical resource transactions and run receipts.
Its no-account reference comparisons do not create owned Inventory items. Expected
DPS, unsupported goals/profiles and unavailable execution remain Pending. Resource
Inventory counts are separate from physical Echo instances and simulation spend.

Source-reviewed team selection exists in Improve/Sandbox. Production Team Builder,
saved-team optimization and Best Available Teams remain downstream. The #361 team
screens demonstrate interactions, not an implemented calculator/account team store.

M0 server transport and CI efficiency changes are in current main. Existing
historical deployment evidence does not establish present backend capacity or
compatibility with new candidates. The local import launcher starts only local
OCR and serves private-runtime Pending; it consumes no hosted compute budget.

## Remaining boundaries

- Google/Firebase sync is implemented locally with emulator isolation tests;
  production activation and account-UX approval remain pending. Run exports are not backups.
- Version-2 backups include live account settings/resources/observations; older
  incompatible catalogs need reviewed migration, with original data retained.
- Six Reference Team 01 dependencies and broader gameplay qualification remain.
- Scanner GPL compatibility, upstream calculator reuse rights, game artwork and
  production font clearance need their appropriate review before distribution.
- Missing facts remain Pending/Unknown. No merge, deployment or private publication
  follows from local feature acceptance. Next is owner review of this local slice.
