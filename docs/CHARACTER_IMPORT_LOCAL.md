# Local Character Import integration

The recovery candidate reuses #360's extended #362 scanner and single physical Inventory owner, within the existing Build route. #361 supplies approved Build/Team/Inventory presentation, not OCR. Compact Import opens an anchored review; explicit save returns to the same Builder with the saved Character selected. Unknown observations remain unknown. Current acceptance and pending work are recorded in [the integration review](ONE_PR_INTEGRATION_REVIEW.md).

## Run

Foundation continuation adds local browser-WASM recognition and emulator-only
account review. The original Foundation implementation record remains preserved in #360; it is historical evidence, not current acceptance.
The normal public artifact remains free of private engine code and unapproved
account/Scanner deployment configuration.

Install the scanner prerequisites described in
[its README](ui-lab/scanner-poc/README.md), then:

```sh
npm run build
SCANNER_PYTHON="$PWD/docs/ui-lab/scanner-poc/.venv/bin/python" \
  node scripts/start-character-import.mjs
```

Open http://127.0.0.1:8765/build/. The launcher binds only loopback and runs the
GPL scanner as a separate process on 8766. `IMPORT_PORT` / `SCANNER_PORT` can select
other local ports; `SCANNER_PYTHONPATH` supports an existing local dependency
installation. The preview deliberately returns Pending for the private runtime
release record. It starts no private calculator or remote compute sessions.

Import Character opens a compact button-anchored popover over the current tool.
Upload, drop or paste an original
English 1920×1080 Discord card, correct fields against its image panels, review
uncertain identities/normalizations, and explicitly confirm the review.
Close/reopen and route navigation retain the corrected draft in tab-scoped
sessionStorage, separately from owned Inventory. Confirmation never survives
restoration; review again. Bad uploads retain the previous draft. Storage failure
keeps it on the current page with an explicit warning. Discard clears staging. Saving
items and assigning them as equipped Build are separate choices. Saving over an
existing Character requires explicit replacement; replaced items remain owned.

Inventory lists real saved instances with an inspector and Build/Improve links.
Reload retains IDs and assignments. Same-looking copies are never deduplicated.
The existing Character Builder uses the shared owner through an in-memory
CharacterBuildState projection. Build edits are staged until Save Build; visiting
does not write the legacy account. A stale Build cannot overwrite a newer save.

## Persistence and recovery

- `bellibing-owned-inventory` IndexedDB is the authoritative new item/build store.
  Atomic transactions write the account and a recoverable before-state together.
  Profile, account identity and revision checks reject stale writes. Per-Character
  revisions keep unrelated imports from changing another Character's Current.
- The v34 CharacterBuildState shape is retained for compatibility. Its old
  localStorage bytes are not rewritten or deleted; they are recovery evidence,
  not a second live writer. No Candidate, template or simulation becomes owned.
- First migration stages existing legitimate drafts/builds and preserves their
  additional fields. Export a validated backup before saving the migration.
  Corrupt/unsupported legacy records block migration without changing them.
- JSON uses `bellibing-inventory` backup version 2 with independent account/catalog
  versions, physical IDs, supported
  Character/equipment data and original legacy recovery snapshots. Size, shape,
  identity, exact tiers and assignments are validated before any write. Restore
  into empty profiles or explicitly replace after backup; automatic merge is
  deferred. Cancel/errors leave the account unchanged. Recovery before-states
  support explicit rollback, including return to original legacy/empty storage.
- Existing resource/settings ownership stays intact. Import neither spends nor
  edits it. Backups now include live known
  account settings/resource envelopes and observed-session checkpoints. Original
  legacy bytes stay untouched. Additive catalog updates are revalidated; changed
  identities/mechanics require reviewed migration. Future unreadable accounts
  remain read-only with an original-data download, never an empty replacement.

`?profile=NAME` selects an isolated local profile. Navigation preserves it. Use
fresh browser profiles/test data for review; do not delete an actual account to
test restoration. Closing a normal browser does not imply a cloud backup exists.

## Source, evaluation and licensing boundaries

Canonical catalogs and exact stat tiers are reused. Inventory legality is
independent of recommended loadouts or evaluator support. Rank, Echo level,
refinement and Minor Forte facts absent from the image stay unknown. Partial
observations can be saved; they do not qualify an executable build. Inventory
provides explicit actual level/refinement/rank review without changing item IDs.
Build → Skills exposes the real existing tree and an explicit confirmation of
unprinted Minor Forte facts; these edits remain staged until Save Build.
Improve reads saved investments instead of silently substituting reference values.
The existing Lv90/R1 static projection remains Pending for other imported
investments or unknown Forte. Completing facts does not create provider coverage. Actual team
and investment/source requirements remain mandatory. Unsupported context is
Pending; there is no reference-team or synthetic-DPS fallback.

Scanner uploads stay in memory and use only loopback. Original images, OCR
records, account backups, screenshots and user-specific acceptance artifacts must
remain outside the public repository. Aggregate test results are not a general
scanner-accuracy claim. The three known cards are a development set.

Recovered recognition/provenance improvements remain inside the GPL scanner
process. The product UI receives plain observation JSON over loopback; it imports
no GPL scanner JavaScript or Python. Canonical data remains public-source-owned.
The scanner remains GPL-3.0 with retained upstream source/license notices. The new
client communicates via data-only HTTP; this is not a legal compatibility or
distribution clearance. Review that boundary before publication. No private
engine is copied, modified or redistributed by this local milestone.

Deferred: broader formats, automatic duplicate/merge resolution, +0 stacks,
production cloud activation/account-UX approval, Team Builder, new DPS coverage, recommendation tuning and the
full #361 visual redesign. The existing Build surface remains the functional
editor; this milestone does not claim full visual parity with the concept.

## Presentation and continuation

The real Build uses the six approved static #361 backgrounds according to the
selected Character element. Inventory reuses canonical item icons with a real
grid/inspector. No #364 experimental artwork or concept account store is active.
Source artwork attribution and exact upstream identity are retained under `art/`.

Continue exclusively in Draft #365. Source PRs and their recorded histories remain preserved; no source PR closure, history rewrite, merge, deployment or backend activation is authorized. The account/sync review remains isolated from the public artifact.

#363/private #46 remain deferred for paired compatibility and owner approval. The preserved version-aware presentation helpers do not establish a compatible deployed result producer. Private #47 is excluded.
