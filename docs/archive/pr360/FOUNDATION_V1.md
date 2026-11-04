# Foundation V1 — implementation contract

Continue the approved M0–M5 goal through public #360 only. This is a local
implementation record, not a release or hosted-readiness claim.

## M0 disposition

| Existing work | Foundation disposition |
| --- | --- |
| Public #360 | Sole public integration owner; extend its history. |
| Public #361 | Selected six stills already reused; retain remaining visual references. No concept account store or redesign. |
| Public #362 | Recognition already integrated and extended; retain GPL source/attribution and regression evidence. Do not reinstate prototype storage. |
| Public #363 / private #46 | Paired versioned neutral advice; integrate and verify together. |
| Private #47 | Preservation only; experimental implementation excluded. |
| Public #364 | Artwork archive only; no runtime activation. |
| Public #304 / private #12 | Parked research migration; not a prerequisite. |

M0 runtime consolidation and private #45 are already in their respective mains.
Older stacked PRs must not be landed a second time. No PR is closed or modified
by this local work. Remote heads remain owned by GitHub.

## Acceptance and boundaries

- M1: stable physical IDs; atomic writes; old-version migration; complete portable
  account; validated restore; bounded normal recovery plus protected migrations.
- M2: original English 1920×1080 cards, browser-local OCR, editable review;
  no silent defaults and no user image upload to external services.
- M3: actual owned Current and actual supported team; observed rolls retained;
  Sandbox detached; real private execution distinct from recorded-response tests.
- M4: IndexedDB owner plus Google/Firebase Spark sync; atomic local outbox,
  immutable remote versions, revision conflicts and account isolation.
- M5: required exact-head public/private tests and browser evidence, then
  separately approved hosting/merge/publication and deployed acceptance.

Desktop is the implementation scope. Preserve existing required CI gates.
No new engine, roster expansion, account-priority policy or experimental artwork.
No external account service activation, payment, user-data migration, backend
activation, push/publication or merge follows from local implementation.

## Distribution review

The retained scanner is GPL-3.0 (scanner-poc/LICENSE and UPSTREAM.md).
The HTTP/process boundary is not distribution clearance. Browser adaptation
must retain applicable license/source notices. Upstream calculator reuse rights,
game/generated art and fonts still need release clearance. Private engine code,
fixtures, release mappings and user images must never enter public artifacts.

## Verification

`npm run test:foundation` is an explicit Node gate for the ownership/backup/store
regressions omitted by the historical TypeScript-only test glob. Real browser
upgrade/restart tests supplement it; fake IndexedDB tests alone are not browser
acceptance. FAST is not FULL. A local build is not deployed acceptance.

## Implemented local candidate

| Milestone | Implemented and exercised | Remaining acceptance |
| --- | --- | --- |
| M0 | Existing PR disposition above; neutral presentation and paired private classification integrated locally. | Scanner/calculator/art/font distribution clearance. No archive PR is landed. |
| M1 | Atomic account/recovery/outbox; stable IDs; version-1 upgrade; portable version-2 backup; additive catalog compatibility; resources, settings and observed prefixes; corrupt/future-version read-only rescue. | Final exact-head FULL and owner-approved production migration. |
| M2 | Existing Python scanner runs inside a browser worker with pinned self-hosted WASM/OCR; same-WASM source-bound SIFT cache; cancellation; editable review/save. | Independent held-out original cards, broader accuracy matrix and distribution approval. Proof assets are excluded from production build. |
| M3 | Owned Current/settings/resources reconnect after reload; observed sessions resume without rerolling or debiting the account; neutral choices paired with private implementation; ownership IDs excluded from deterministic sampling. | Final public/private exact-head gates and hosted supported-context journey. No new gameplay qualification. |
| M4 | Durable local sync outbox; immutable chunked snapshots; compare-and-swap cloud head; owner-only rules; reviewed conflict resolution; Google provider emulator and isolated account-UX proposal. | Owner approval of account UX and external Firebase project/region/configuration. Real Google OAuth/domain acceptance, quota monitoring and deployed rules. |
| M5 | Regression gates added without removing existing checks; local strict build and Chromium/Firefox persistence/scanner proofs. | Remote FULL, Worker/release verification, approved deployment and deployed end-to-end acceptance. |

Local acceptance on the implementation candidate includes:

- Browser process restart and database upgrade from frozen original #360 source
  in Chromium and Firefox; resource/settings persistence and future-schema rescue
  in the built product, at desktop widths.
- Scanner startup, all 21 retained recognizer regressions, real OCR calls, review
  validation and cancellation in Chromium and Firefox. The 45-second worker limit
  is retained. Browser requests for external scanner assets are rejected by tests.
- Three original English cards exercised privately: review/correction, 18 physical
  items, reload, independent-profile backup/restore, zero image-upload requests and
  zero page errors. One card required a visible main-stat correction. This is a
  journey proof, not a held-out or field-complete accuracy benchmark. Original
  images, account contents and screenshots are excluded from public source.
- Firebase local emulators: per-user isolation, immutable history, failed/stale
  writes, idempotent retries, second-device synchronization and Google-provider
  identity/sign-out. A separate local popup exercise covers explicit first link,
  successful sync and sign-out with synthetic accounts. Real Google OAuth is not
  proved by the emulator. The cloud environment needed a TLS-verified proxy relay
  for Google's public API loader script during this popup exercise.
- Private real engine over local HTTP and an owned-Inventory browser journey:
  five-slot analysis, an observed +5 roll, reload and retained IDs/prefix, with
  account resources and owned equipment unchanged by detached simulation.

## Reproduce the isolated review

Use `npm ci`, `npm run build`, and `npm run test:foundation`. Browser verification
requires `npx playwright install chromium firefox`. Run
`npm run test:foundation:browser` and `npm run test:foundation:firebase` (Java 21).

For the separate browser scanner proof, install Python NumPy/Pillow, then run:

```sh
npm run scanner:browser:prepare
node scripts/cache-browser-scanner.mjs
npm run scanner:browser:prepare
python3 scripts/create-scanner-smoke.py
npm run test:scanner:browser
IMPORT_SCANNER=browser node scripts/start-character-import.mjs
```

The last command starts the local import launcher.
Generated WASM/models/descriptors stay in ignored `artifacts/browser-scanner`.
The build-only cache contains public reference-image descriptors, never user cards.

The account proposal is deliberately separate from the production artifact:
`node scripts/build-account-review.mjs`, start the demo Firebase emulators, then
run `IMPORT_SCANNER=browser ACCOUNT_REVIEW=1 node scripts/start-character-import.mjs`.
Open Inventory with a synthetic `?profile=foundation-review-*` profile. It adds
one Google action and compact save/sync status to existing header actions, with
explicit first-link and conflict choices. It does not create a production project.

A local build/test does not satisfy the remaining approvals. In particular, no
service, billing, data replacement, push, PR mutation, merge or deployment is
implied by this record.
