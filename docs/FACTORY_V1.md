# Bellibing Factory v1

Status: **ACTIVE DEVELOPMENT MODEL — Milestone 04 integrated on `main`; Milestone 05 Provider Refresh Change Detection / Triage v1 is review-ready in unmerged PR #180**

Product goal remains **Best Available Teams**. Factory is a development/data pipeline; provider evidence never becomes gameplay/runtime truth by itself.

The repository `main` branch head is authoritative implementation/runtime truth. This living document intentionally does not hardcode the exact live branch-head SHA; docs commits would make such a value stale by construction. Historical integration/checkpoints and unmerged review state are recorded separately below.

## Architecture boundary

`external provider source`
→ `provider-specific extraction`
→ `Factory raw evidence with provenance`
→ `reviewed mapper registry`
→ `reconciliation`
→ `review candidate / exception queue`
→ **operational refresh triage**
→ **manual source validation only**
→ `canonical Bellibing source layer`
→ `effects / profiles / execution / combat-DPS / UI`.

No provider bypasses canonical source ownership.

## Core evidence contract

Classifications remain exactly:

- `CONSENSUS`;
- `SINGLE_SOURCE`;
- `CONFLICT`;
- `MISSING`;
- `UNKNOWN`.

Routing remains:

- `CONSENSUS` / `SINGLE_SOURCE` → `REVIEW_CANDIDATE`;
- `CONFLICT` / `MISSING` / `UNKNOWN` → `EXCEPTION_QUEUE`;
- every reconciliation retains `MANUAL_SOURCE_VALIDATION_REQUIRED`.

Milestone 05 does **not** add a new evidence classification or reconciliation route. Its triage result is operational metadata above the Milestone 04 report.

## Provider boundary

### Prydwen

- remains `REVIEW_ONLY`;
- existing browser/profile extraction is review evidence only;
- timing/state/gameplay semantics are never inferred automatically.

### `Voruzhu/FrequencyManager`

- MIT licensed;
- bounded `EVIDENCE_ONLY` use;
- no canonical authority;
- broad ingestion disabled;
- Milestone 04/05 lane remains limited to the same two already-reviewed targets and the same weapon source path.

### Other providers

- `d4rkOfficial/wuwa-afyg-tool` — MIT; bounded provenance/review required before mapping.
- `DommyMM/wuwabuild` — no established reuse license; reference only, no new copy.

## Milestones 00–04

Milestones 00–03 are integrated on `main` through PR #178. Historical PRs #174–#177 remain closed unmerged milestone evidence.

Milestone 04 is integrated on `main` through PR #179. Final review head `553bcb1dd9b18989f76ff000bba77307db6b0866` was merged with a normal merge commit as integration checkpoint `1c396832f6658df7a1bd17305c4a3e488d6878b1`.

Post-merge canonical cleanup checkpoint `72e4de8de8ce52a98293cb6f18a48292a94f5597` changed only `docs/PROJECT_STATUS.md` and `docs/FACTORY_V1.md`.

Milestones 00–04 establish provider/provenance contracts, reviewed mapping families, deterministic reconciliation/reporting, exception routing, declarative generation through existing canonical primitives, and the first real bounded automated provider-intake refresh lane.

Abyss Surges level-90 Base ATK remains deliberately parked: Prydwen `587` vs pinned FrequencyManager `588`. No coercion or Base ATK mapper exists.

## Milestone 04 — Factory Provider Intake / Refresh v1

Purpose: remove the manual evidence-authoring step between a provider-specific source artifact and Factory review backlog creation.

### Bounded real provider lane

Reviewed baseline source:

`Voruzhu/FrequencyManager@f585e47a868cb2b65845367b976a1781f130c758`

Path:

`adapters/game-definitions/wuthering-waves/weapons.ts`

Reused reviewed targets only:

- `weapon-rarity-v1` → `abyss-surges::rarity.stars`;
- `weapon-r1-attribute-dmg-bonus-v1` → `ages-of-harvest::r1.attribute-dmg-bonus.value`.

No new Wuthering Waves fact family was added.

### Intake components

`src/factory/providerIntake/frequencyManager.ts`:

- requires exact 40-character upstream SHA;
- parses only the two bounded reviewed targets;
- produces `PRESENT / MISSING / UNKNOWN` provider rows;
- records `UNCHANGED / SOURCE_CHANGED / SOURCE_MISSING / SOURCE_UNKNOWN`;
- retains exact source ref/version and provider-specific capture time.

`scripts/generate-factory-provider-intake.ts`:

- reads provider source artifact;
- automatically generates refreshed Factory evidence snapshots;
- runs existing reviewed mapper registry/reconciliation;
- emits deterministic intake JSON/Markdown and standard Factory evidence JSON/Markdown.

### Effective refresh routing

- unchanged + valid reviewed mapping → normal reconciliation route;
- changed relevant provider value → `SOURCE_CHANGED / EXCEPTION_QUEUE`;
- missing expected provider row → `SOURCE_MISSING / EXCEPTION_QUEUE` even if generic reconciliation would be `SINGLE_SOURCE`;
- unsupported/unparseable row → `SOURCE_UNKNOWN / EXCEPTION_QUEUE`;
- invalid/non-exact SHA → fail before evidence generation.

No route auto-promotes canonical truth.

## Milestone 05 — Provider Refresh Change Detection / Triage v1

Purpose: reduce recurring human refresh/review work by distinguishing healthy no-change refreshes from refreshes that actually need attention, without altering the Milestone 04 evidence contract.

PR #180 is the bounded unmerged implementation/review record. Merge requires separate explicit authorization.

### Operational triage contract

`NO_REVIEW_REQUIRED`:

- provider refresh completed safely;
- every bounded target is `UNCHANGED`;
- `attentionRequired=false`.

`REVIEW_REQUIRED`:

- provider refresh completed safely;
- at least one bounded target is `SOURCE_CHANGED`, `SOURCE_MISSING` or `SOURCE_UNKNOWN`;
- `attentionRequired=true`.

`REFRESH_FAILURE`:

- provider checkout, provenance resolution or global intake execution could not complete safely;
- `attentionRequired=true`;
- no Factory evidence classification/reconciliation is fabricated for the failed refresh.

These are operational states only. `REFRESH_FAILURE` is not `UNKNOWN`, `MISSING`, `CONFLICT` or any other Factory evidence classification.

### Commit advance behavior

A provider commit advance alone never creates review.

A new exact upstream SHA with unchanged bounded semantic facts remains:

`NO_REVIEW_REQUIRED`.

The triage output still records the new exact SHA/current blob provenance so provenance changes remain visible without becoming false review work.

### Deterministic semantic report

`src/factory/providerIntake/refreshTriage.ts` consumes the successful Milestone 04 intake report plus the reviewed baselines and emits a deterministic semantic triage report containing:

- provider ID/repository;
- configured provider ref;
- exact resolved upstream SHA and source blob;
- canonical promotion policy;
- each bounded target's refresh status;
- baseline FrequencyManager source ref/version;
- current FrequencyManager source ref/version;
- disposition;
- `attentionRequired`.

Volatile execution metadata such as capture timestamps and workflow run IDs are intentionally absent from semantic triage. Regression tests prove JSON/Markdown byte stability across different capture timestamps for the same semantic run.

### Script output

`scripts/generate-factory-provider-intake.ts` now writes:

- the unchanged Milestone 04 refreshed evidence snapshots;
- Milestone 04 intake JSON/Markdown;
- standard Factory evidence JSON/Markdown;
- `frequency-manager-refresh-triage.json`;
- `frequency-manager-refresh-triage.md`.

If intake execution fails before a valid Milestone 04 report exists, only the operational failure triage is generated for that failure path; no reconciliation rows are invented.

### Scheduled/read-only provider lane

`.github/workflows/factory-provider-refresh.yml` remains `contents: read` and now supports:

- scheduled bounded refresh;
- provider-configured default ref `master`;
- manual `workflow_dispatch` with explicit ref/SHA override;
- exact `git rev-parse HEAD` provenance validation before Factory processing;
- explicit provider-checkout/provenance/intake failure handling;
- human-readable Actions summary;
- uploaded review/triage artifacts only.

The FrequencyManager parser is not hardcoded to a permanent branch name. `master` exists in workflow/provider configuration and can be changed there if the upstream default branch changes.

No issue creation, canonical writes, runtime mutation or provider auto-trust exists.

## Real provider proof

Milestone 04 Provider Refresh #1/#2 proved real pinned-provider intake.

Milestone 05 Factory Provider Refresh #7 proved the configured live lane against real `Voruzhu/FrequencyManager@master` after the intake script was hardened to require the workflow/provider-configured ref explicitly.

Direct inspection of the uploaded artifact proves:

- configured provider ref: `master`;
- resolved exact SHA: `f585e47a868cb2b65845367b976a1781f130c758`;
- `abyss-surges::rarity.stars` → `UNCHANGED`;
- `ages-of-harvest::r1.attribute-dmg-bonus.value` → `UNCHANGED`;
- disposition → `NO_REVIEW_REQUIRED`;
- `attentionRequired=false`;
- baseline/current FrequencyManager provenance retained;
- `MANUAL_SOURCE_VALIDATION_REQUIRED` retained.

The real proof confirms a healthy unchanged refresh creates no new human review work while the full Milestone 04 evidence bundle still exists.

## `profile-source-extract.yml` disposition

The old workflow remains branch-bound to `feat/profile-source-import-accelerator-20260830` and is a roster-wide Prydwen profile accelerator.

Classification remains **reuse-by-pattern / future refactor-or-supersede candidate; not mechanical reuse**.

Its artifact schema, scope and Chromium/network lane do not match bounded Factory fact-family intake. It is unchanged; Prydwen remains `REVIEW_ONLY`.

## Reference Team golden regression

Augusta / Iuno / The Shorekeeper remains `PARTIAL / dpsReady=false` with exactly the same six required `PENDING` dependencies.

`BUG-028`, `BUG-029`, `BUG-008` and `BUG-010` remain open/relevant.

Milestone 05 changes no Reference Team gameplay/DPS semantics.

## Verification

Milestone 04 integration/checkpoint verification remains preserved as previously recorded.

Milestone 05 code/test/docs payload before the final proof-reference-only documentation sync passed:

- Factory Fast #47 — SUCCESS;
- full Verify #1064 verify job — SUCCESS;
- Export #963 — SUCCESS;
- Factory Provider Refresh #7 — SUCCESS against real `FrequencyManager/master` on the current runtime-code payload;
- direct artifact inspection — SUCCESS with `NO_REVIEW_REQUIRED`, `attentionRequired=false`, exact SHA and baseline/current provenance.

The final proof-reference-only documentation sync changes only Factory docs and must retain full Verify/Export on the final review head. Factory fast-path remains an iteration accelerator only and does not replace full Verify. No correctness gate is weakened.

## Handoff

The external Bellibing Echo Tool — AI Handoff records final exact review-head SHA and final verification identifiers after the review head is green. This avoids the self-referential living-doc SHA problem.

No Handoff write changes canonical GitHub implementation/runtime truth.

## Milestone exit

**Stop after Milestone 05 review-ready. Do not start coverage expansion or Milestone 06 automatically.**

Milestone 05 remains bounded to one provider, one source path and the same two already-reviewed targets. It cannot be interpreted as roster-scale provider ingestion, Character-by-Character expansion, Reference Team continuation, a universal gameplay DSL, automatic provider trust or canonical promotion.

PR #180 remains unmerged until separate explicit merge authorization is given.