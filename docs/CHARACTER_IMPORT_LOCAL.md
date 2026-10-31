# Local Character Import integration

This local candidate starts from the exact public #360 source tree on current
main's foundation. #361 supplies the approved navigation/grid/inspector direction;
#362 supplies the separately licensed recognition program. #363/private #46 and
the preservation vault are untouched. No remote publication or deployment.

## Run

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

Import Character opens inline below the shared header. Upload an original
English 1920×1080 Discord card, correct fields against its image panels, review
uncertain identities/normalizations, and explicitly confirm the review. Saving
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
- JSON uses `bellibing-inventory`, schema/source binding, physical IDs, supported
  Character/equipment data and original legacy recovery snapshots. Size, shape,
  identity, exact tiers and assignments are validated before any write. Restore
  into empty profiles or explicitly replace after backup; automatic merge is
  deferred. Cancel/errors leave the account unchanged. Recovery before-states
  support explicit rollback, including return to original legacy/empty storage.
- Existing resource/settings ownership stays intact. Import neither spends nor
  edits it. The backup includes migration before-state copies of these known
  legacy keys; it is not yet a live post-migration settings/resource sync format.

`?profile=NAME` selects an isolated local profile. Navigation preserves it. Use
fresh browser profiles/test data for review; do not delete an actual account to
test restoration. Closing a normal browser does not imply a cloud backup exists.

## Source, evaluation and licensing boundaries

Canonical catalogs and exact stat tiers are reused. Inventory legality is
independent of recommended loadouts or evaluator support. Rank, Echo level,
refinement and Minor Forte facts absent from the image stay unknown. Partial
observations can be saved; they do not qualify an executable build. Actual team
and investment/source requirements remain mandatory. Unsupported context is
Pending; there is no reference-team or synthetic-DPS fallback.

Scanner uploads stay in memory and use only loopback. Original images, OCR
records, account backups, screenshots and user-specific acceptance artifacts must
remain outside the public repository. Aggregate test results are not a general
scanner-accuracy claim. The three known cards are a development set.

The scanner remains GPL-3.0 with retained upstream source/license notices. The new
client communicates via data-only HTTP; this is not a legal compatibility or
distribution clearance. Review that boundary before publication. No private
engine is copied, modified or redistributed by this local milestone.

Deferred: broader formats, automatic duplicate/merge resolution, +0 stacks,
cloud sync/login, Team Builder, new DPS coverage, recommendation tuning and the
full #361 visual redesign. The existing Build surface remains the functional
editor; this milestone does not claim full visual parity with the concept.
