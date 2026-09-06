# Bellibing Factory v1

Status: **ACTIVE DEVELOPMENT MODEL — Milestone 04 Provider Intake / Refresh v1 under review**

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

Classifications remain:

- `CONSENSUS`
- `SINGLE_SOURCE`
- `CONFLICT`
- `MISSING`
- `UNKNOWN`.

Routes remain:

- `CONSENSUS` / `SINGLE_SOURCE` → `REVIEW_CANDIDATE`;
- `CONFLICT` / `MISSING` / `UNKNOWN` → `EXCEPTION_QUEUE`;
- all reconciliations retain `MANUAL_SOURCE_VALIDATION_REQUIRED`.

Milestone 04 adds a refresh-health guard above generic reconciliation: a refreshed expected provider row that becomes missing or unparseable is forced to `EXCEPTION_QUEUE` even when another carried-forward reviewed source would make generic reconciliation `SINGLE_SOURCE`. This prevents provider disappearance/schema drift from silently looking healthy.

## Provider boundary

### Prydwen

- remains `REVIEW_ONLY`;
- existing browser/profile extractor is not canonical truth;
- prose/timing/state semantics are never inferred automatically.

### `Voruzhu/FrequencyManager`

- MIT licensed;
- bounded `EVIDENCE_ONLY` use;
- no canonical authority;
- broad ingestion remains disabled;
- Milestone 04 intake is intentionally limited to two already-reviewed targets.

### Other providers

- `d4rkOfficial/wuwa-afyg-tool`: MIT; bounded review required before any data mapping.
- `DommyMM/wuwabuild`: no established reuse license; reference only, no new copy.

## Milestones 00–03

Milestones 00–03 are integrated on `main` through PR #178. Historical PRs #174–#177 remain closed unmerged milestone evidence.

Established capabilities:

- provider descriptors/provenance and fail-closed reconciliation;
- first reviewed fact family `weapon-r1-attribute-dmg-bonus-v1`;
- declarative standard effect generation through existing canonical runtime primitive;
- deterministic evidence reporting and drift audit;
- second reviewed fact family `weapon-rarity-v1` proving mapper/report reuse.

Abyss Surges level-90 Base ATK remains deliberately parked because Prydwen `587` and pinned FrequencyManager `588` disagree. No coercion or Base ATK mapper exists.

## Milestone 04 — Factory Provider Intake / Refresh v1

Purpose: remove the manual step between a provider-specific source artifact and Factory evidence/review backlog creation.

### Bounded real provider lane

Provider source:

`Voruzhu/FrequencyManager@f585e47a868cb2b65845367b976a1781f130c758`

Path:

`adapters/game-definitions/wuthering-waves/weapons.ts`

The pinned source contains the already-reviewed structures used by Factory:

- `abyss-surges` → discrete `rarity`;
- `ages-of-harvest` → explicit unconditional `selfBuffs` `elemDmg` value.

No new Wuthering Waves fact family is added.

### Intake components

- `src/factory/providerIntake/frequencyManager.ts`
  - validates exact 40-character upstream SHA;
  - parses only the two bounded reviewed targets;
  - emits `PRESENT / MISSING / UNKNOWN` provider rows;
  - compares extracted relevant raw shape against the reviewed FrequencyManager baseline and records `UNCHANGED / SOURCE_CHANGED / SOURCE_MISSING / SOURCE_UNKNOWN`;
  - preserves exact source ref/version and provider-specific capture time.
- `scripts/generate-factory-provider-intake.ts`
  - reads the provider source artifact;
  - generates Factory evidence snapshots automatically;
  - runs the existing reviewed mapper registry and reconciliation;
  - emits deterministic intake JSON/Markdown plus normal Factory evidence JSON/Markdown.
- `.github/workflows/factory-provider-refresh.yml`
  - read-only GitHub permissions;
  - checks out FrequencyManager at pinned/manual ref;
  - resolves exact upstream SHA with `git rev-parse HEAD`;
  - generates and uploads review artifacts only;
  - never commits or writes canonical/runtime data.
- local fixtures + `factoryProviderIntake*.test.ts`
  - normal test/Verify requires no network.

### Effective refresh routing

- unchanged + valid reviewed mapping → normal reconciliation route;
- valid changed relevant provider value → `SOURCE_CHANGED`, then fail-closed intake exception; current reviewed targets demonstrate mapper-level `CONFLICT` when values diverge;
- missing expected row → `SOURCE_MISSING / EXCEPTION_QUEUE`;
- structurally unparseable/unsupported row → `SOURCE_UNKNOWN / EXCEPTION_QUEUE`;
- exact SHA absent/invalid → intake generation fails before evidence creation.

No case performs automatic canonical promotion.

## Real provider proof

Factory Provider Refresh #1 and #2 ran against the real pinned FrequencyManager source successfully.

The generated artifact is named:

`factory-provider-intake-frequency-manager-f585e47a868cb2b65845367b976a1781f130c758`.

Observed real refresh state:

- `abyss-surges::rarity.stars` → `UNCHANGED / CONSENSUS / REVIEW_CANDIDATE`;
- `ages-of-harvest::r1.attribute-dmg-bonus.value` → `UNCHANGED / CONSENSUS / REVIEW_CANDIDATE`;
- exact upstream SHA is retained in `sourceVersion` and pinned blob URL;
- refreshed FrequencyManager candidate timestamps are fresh;
- carried-forward Prydwen review anchors retain their original capture timestamps;
- canonical promotion policy remains `MANUAL_SOURCE_VALIDATION_REQUIRED`.

This demonstrates actual provider input → generated evidence → reviewed mapper → reconciliation → deterministic review backlog without manual refresh JSON authoring.

## Old `profile-source-extract.yml` disposition

The workflow remains a branch-bound roster-wide Prydwen profile accelerator for `feat/profile-source-import-accelerator-20260830`.

Milestone 04 disposition: **reuse-by-pattern / future refactor-or-supersede candidate**.

Do not mechanically connect it to Factory intake because its artifact schema, roster-wide scope and browser extraction lane do not match the bounded fact-family contract. It is unchanged by Milestone 04.

## Reference Team golden regression

Augusta / Iuno / The Shorekeeper remains:

- `PARTIAL`;
- `dpsReady=false`;
- exactly six required `PENDING` dependencies;
- BUG-028, BUG-029, BUG-008 and BUG-010 open/relevant.

Milestone 04 closes no Reference Team dependency and changes no gameplay/DPS semantics.

## Verification model

### Fast iteration

`npm run verify:fast:factory` remains network-independent and includes the new local fixture tests through `test:factory`.

Verified during Milestone 04:

- Factory Fast #30 — SUCCESS;
- Factory Provider Refresh #1 — SUCCESS;
- Factory Provider Refresh #2 — SUCCESS after exact capture-provenance correction;
- Factory Fast #34 — SUCCESS with the provider-specific provenance regression.

### Review-ready

Full repository `Verify` remains mandatory on the final Milestone 04 head before review-ready status. Factory fast-path does not replace it.

## Handoff

Google Sheets write permission remains blocked with `403 PERMISSION_DENIED`. After meaningful full-verified Milestone 04 work, make at most one normal sync attempt. No workaround or partial write.

## Milestone exit

Stop after Milestone 04. Do not broaden to roster-scale ingestion or create another fact family merely for coverage.

The exit question is binary: **can Factory create review backlog from provider input without manual Factory evidence-authoring?** The final answer must be based on the real provider workflow + exact-head full verification. If any link is still missing, the next milestone must fix that link instead of broadening coverage.
