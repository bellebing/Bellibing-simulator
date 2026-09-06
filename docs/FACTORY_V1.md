# Bellibing Factory v1

Status: **ACTIVE DEVELOPMENT MODEL — Milestone 04 Provider Intake / Refresh v1 integrated on `main` through PR #179**

Product goal remains **Best Available Teams**. Factory is a development/data pipeline; provider evidence never becomes gameplay/runtime truth by itself.

## Architecture boundary

`external provider source`
→ `provider-specific extraction`
→ `Factory raw evidence with provenance`
→ `reviewed mapper registry`
→ `reconciliation`
→ `review candidate / exception queue`
→ **manual source validation only**
→ `canonical Bellibing source layer`
→ `effects / profiles / execution / combat-DPS / UI`.

No provider bypasses canonical source ownership.

## Core evidence contract

Classifications remain `CONSENSUS`, `SINGLE_SOURCE`, `CONFLICT`, `MISSING`, `UNKNOWN`.

Routing remains:

- `CONSENSUS` / `SINGLE_SOURCE` → `REVIEW_CANDIDATE`;
- `CONFLICT` / `MISSING` / `UNKNOWN` → `EXCEPTION_QUEUE`;
- every reconciliation retains `MANUAL_SOURCE_VALIDATION_REQUIRED`.

Milestone 04 adds a refresh-health guard above generic reconciliation: an expected refreshed provider row that changes, disappears or becomes uninterpretable is forced into intake exception review rather than silently appearing healthy because another carried-forward source remains present.

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
- Milestone 04 intake limited to two already-reviewed targets.

### Other providers

- `d4rkOfficial/wuwa-afyg-tool` — MIT; bounded provenance/review required before mapping.
- `DommyMM/wuwabuild` — no established reuse license; reference only, no new copy.

## Milestones 00–04

Milestones 00–03 are integrated on `main` through PR #178. Historical PRs #174–#177 remain closed unmerged milestone evidence.

Milestone 04 is integrated on `main` through PR #179. Final review head `553bcb1dd9b18989f76ff000bba77307db6b0866` was merged with a normal merge commit as `1c396832f6658df7a1bd17305c4a3e488d6878b1`; its parents are prior `main` `3a7fc098320fb51c1a1c941c60774343c1958121` and the verified PR head.

Milestones 00–04 establish provider/provenance contracts, reviewed mapping families, deterministic reconciliation/reporting, exception routing, declarative generation through existing canonical primitives, and the first real bounded automated provider-intake refresh lane.

Abyss Surges level-90 Base ATK remains deliberately parked: Prydwen `587` vs pinned FrequencyManager `588`. No coercion or Base ATK mapper exists.

## Milestone 04 — Factory Provider Intake / Refresh v1

Purpose: remove the manual evidence-authoring step between a provider-specific source artifact and Factory review backlog creation.

### Bounded real provider lane

Pinned source:

`Voruzhu/FrequencyManager@f585e47a868cb2b65845367b976a1781f130c758`

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

`.github/workflows/factory-provider-refresh.yml`:

- read-only repository permission;
- checks out FrequencyManager at pinned/manual ref;
- resolves exact upstream SHA with `git rev-parse HEAD`;
- generates and uploads review artifacts only;
- never commits/writes canonical/runtime data.

Local fixtures and `factoryProviderIntake*.test.ts` keep normal test/Verify network-independent.

### Effective refresh routing

- unchanged + valid reviewed mapping → normal reconciliation route;
- changed relevant provider value → `SOURCE_CHANGED / EXCEPTION_QUEUE`; existing targets demonstrate mapper-level `CONFLICT` under disagreement;
- missing expected provider row → `SOURCE_MISSING / EXCEPTION_QUEUE` even if generic reconciliation would be `SINGLE_SOURCE`;
- unsupported/unparseable row → `SOURCE_UNKNOWN / EXCEPTION_QUEUE`;
- invalid/non-exact SHA → fail before evidence generation.

No route auto-promotes canonical truth.

## Real provider proof

Factory Provider Refresh #1 and #2 succeeded against the real pinned FrequencyManager repository.

Generated artifact:

`factory-provider-intake-frequency-manager-f585e47a868cb2b65845367b976a1781f130c758`.

Observed state:

- `abyss-surges::rarity.stars` → `UNCHANGED / CONSENSUS / REVIEW_CANDIDATE`;
- `ages-of-harvest::r1.attribute-dmg-bonus.value` → `UNCHANGED / CONSENSUS / REVIEW_CANDIDATE`;
- exact upstream SHA retained in `sourceVersion` and pinned blob URL;
- refreshed FrequencyManager capture timestamps are fresh;
- carried-forward Prydwen reviewed anchors keep original capture timestamps;
- `MANUAL_SOURCE_VALIDATION_REQUIRED` remains intact.

This is a real provider-input → generated evidence → mapper → reconciliation → deterministic review-backlog path with no manual refresh evidence JSON.

## `profile-source-extract.yml` disposition

The old workflow remains branch-bound to `feat/profile-source-import-accelerator-20260830` and is a roster-wide Prydwen profile accelerator.

Milestone 04 classification: **reuse-by-pattern / future refactor-or-supersede candidate; not mechanical reuse**.

Its artifact schema, scope and Chromium/network lane do not match bounded Factory fact-family intake. It is unchanged; Prydwen remains `REVIEW_ONLY`.

## Reference Team golden regression

Augusta / Iuno / The Shorekeeper remains `PARTIAL / dpsReady=false` with exactly the same six required `PENDING` dependencies. BUG-028, BUG-029, BUG-008 and BUG-010 remain open/relevant.

Milestone 04 changes no Reference Team gameplay/DPS semantics.

## Verification

Final PR #179 review head `553bcb1dd9b18989f76ff000bba77307db6b0866` passed:

- Factory Fast #37 — SUCCESS;
- full Verify #1056 — SUCCESS;
- Export #955 — SUCCESS;
- Character Mechanics import #172 — SUCCESS.

Actual Milestone 04 integration merge commit `1c396832f6658df7a1bd17305c4a3e488d6878b1` passed:

- full Verify #1057 — SUCCESS;
- Export #956 — SUCCESS;
- Deploy #141 — SUCCESS;
- Deploy #141 live-site verification — SUCCESS, including Chrome checks for Alpha/Roll Assist, Augusta upgrade loop and Ciaccona owned-build path.

Factory fast-path remains an iteration accelerator only and does not replace full Verify. No correctness gate was weakened.

## Handoff

The Milestone 04 pre-merge Google Sheets sync succeeded and established UPD-158 with the review-state evidence and blocker preservation.

Post-merge Handoff synchronization is external bookkeeping and is performed at most once only after the final post-merge `main` state is verified green. Its result does not alter canonical GitHub implementation truth.

## Milestone exit

**Stop after Milestone 04. Do not start Milestone 05 automatically.**

Exit answer: **YES, bounded**. Factory can create review backlog from real FrequencyManager provider input without manual Factory evidence-authoring for the two existing reviewed targets. It cannot be interpreted as roster-scale provider ingestion, automatic provider trust, or canonical promotion.

Milestone 04 integration is complete on `main`; a new explicit bounded objective is required before further Factory development.
