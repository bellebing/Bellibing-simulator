# Product B integration on #365

The accepted Build / Add Character, Inventory and Teams presentation is now in versioned source under `docs/product-ui/`. `scripts/build-product-ui.mjs` packages it into the existing `/build/`, `/inventory/` and `/teams/` product routes. Improve and Sandbox keep their existing workspaces with the shared navigation. This is a local working-tree integration, not a remote PR-head, main or deployment claim.

## What is preserved

- The accepted isolated prototype remains untouched. `artifacts/product-integration-baseline/manifest.json` and copied sources preserve its migration baseline.
- Existing product `accountSession` / IndexedDB store owns saved Characters, physical equipment, resource/settings data, observations and saved team references. The prototype review-account store is not used by product routes and is not automatically migrated.
- `src/productBuildDraft.mjs` merges only fields owned by the Build editor. Existing Character record fields, inactive Echo sets, removed/replaced physical items, provenance, unknown investments and other user data survive updates. Save uses the existing transaction, recovery and revision checks.
- Per-Character unsaved editor drafts are local, account/profile-bound draft cache, separate from the authoritative saved account. Concurrent/stale saves fail instead of overwriting newer work. Cloud sync is not enabled.
- The previous Build, Inventory and Teams pages remain built as `legacy.html` as unlinked compatibility/archive views. They are not alternative destinations in the product header. Their underlying equipment-move, fact-review, Build Card, backup/restore and recovery code is retained. Remaining Inventory controls still need placement in the new Inventory; team naming, cancel and Open Build have been transferred to the new Teams view.
- Unreadable/future account formats show recovery/download rather than being reset to an empty account.
- Recovery audit retains the historical shared-template hash and adds the exact accepted shared-gallery template hash. The 243 frozen source files remain unchanged; arbitrary template changes still fail the audit.

## Import and Google

Teams currently uses the older Augusta Core composition as a visual reference, combined with the accepted Build materials and typography. The historical Endstate Matrix mockup is explicitly excluded as a design reference. The left column contains teams, the center has three inspectable member/equipment cards, and the right column contains the selected member and available replacements. Automatic suggestions use reviewed guide compositions and account ownership, without DPS ranking; the view remains marked Temporary. A partial account remains visibly incomplete. No demo DPS figures are promoted to product results.

The shared Import action opens a compact image-drop surface. Other routes navigate to Build's same importer while preserving the selected profile. On recognition, the importer closes and stages an unsaved draft in the normal Build view. The old correction form is not shown on product routes. Add to Account / Update is the explicit review/save action; source validation still runs before the canonical save transaction. Original scan evidence and a recoverable copy of the previous local draft are retained. Existing physical equipment and inactive Echo sets survive an update. Unknown rank, Echo level and minor Forte activations are never inferred from a fully rolled card.

Local browser OCR has been prepared in ignored `artifacts/browser-scanner/`. A portable Python runtime and dependency cache are also local artifacts. `npm run preview:product -- --port 8881` starts the built product with that browser-local OCR, without a simulator engine. Explicitly adding `--engine-directory ../Bellibing-engine-private` connects the existing local review artifact and shared advice/team handlers. The local server's browser-asset path containment check works with Windows paths.

Supported import remains an original English 1920×1080 wuwa-bot card up to 5 MiB, with PNG/JPEG and WebP-to-PNG transport. Scanner startup and its 21 regressions passed; the owner-supplied Cartethyia original was also exercised through recognition and isolated save. Scanner assets are not silently added to the public release; distribution/hosting remains a separate release boundary.

**Logga in** reuses the Firebase Auth test entry and owner's `bellibing-simulator` configuration, without Analytics or Firestore reads/writes. Domain authorization and a real owner sign-in still need verification. Moln/cloud sync remains deferred until the common account is reviewed; authentication is not a claim that builds have been uploaded.

## Verification

- The opt-in local product engine validates the review artifact hash, serves it only through the loopback preview, and reuses the existing Node advice/team bridges. No engine bytes are copied into public `dist`. All five Gates have matching execution/expected-cost support in the tested existing configuration. A real Sandbox +25 run completed all five Echoes. The shared local team evaluator displayed the Augusta/Iuno/Shorekeeper reference model and a numeric simulated comparison for an ER-qualified build; unmet ER remained explicitly Pending. Teammates remained fixed reference profiles. This does not establish complete DPS/model coverage or account-wide upgrade ranking. An isolated saved Improve account reached Record +5; its explicit reference-teammate option is still to be implemented.

- Product build, typecheck, source exports and strict public-artifact boundary pass (1,569 allowlisted files; no source maps).
- All 40 Foundation account/resource/observed-session/sync and Build-field preservation tests pass.
- Shared header has one explicit style contract across all five routes, including legacy workspace CSS, verified at 1920 and 1440 px. No old-tool links appear in the header.
- New default-route browser regression passes: Build → Inventory → Build, three saved Characters, Teams choose/save/reload, stale-save rejection and unchanged imported accounts on read.
- Existing recovery browser journey passes through the retained tools: physical moves, exact observed roll/reload, resources, saved teams, backup/restore/re-export and Sandbox independence. This is additional coverage; the new default routes are tested separately.
- Existing Inventory/Improve browser journey passes with the new Inventory selectors, including resource/Gate reload and original-data recovery from an unsupported future schema.
- Built Build/Inventory/Teams have been inspected at 1920 and 1440 px using an isolated canonical pilot account. Screenshots stay in ignored artifacts. All browser checks here used isolated Microsoft Edge/Chromium; no real user browser database was edited.
- Browser Echo matching composites transparent canonical images before extracting features; invisible RGB bytes no longer pollute Fleurdelys matching. Old Echo descriptors are not reused. Original scanner sources and thresholds remain intact. The opt-in `test/scannerOwnerCard.browser.mjs` compares the private Cartethyia original and WebP against five Echo identities, main stats and all 25 substats; the documented DEF 11.9 ? 11.8 exception retains its original observation and appears in Build with expandable evidence.
- Browser-local OCR status READY and all 21 existing scanner regressions pass. The real browser worker also validates a canonical Ciaccona observation without issues.
- Import browser regression verifies WebP-to-PNG transport, recognized draft/reload without account writes, source-validation failure preventing save, Add/Update, correction through the real Echo Workshop and retention of replaced physical items. Recognition is mocked for this routing test; it is not OCR accuracy evidence.

- Broad `npm test`: 1,447 of 1,448 tests passed. The remaining public-artifact security test cannot create its negative-test symlink on this Windows machine (`EPERM`), including outside the sandbox. Its assertions are unchanged. The actual artifact verifier passes; a green complete run in a suitable environment is still required before release.

## Current Improve connection

The candidate Echo card shares Build's substat editor. Revealed rolls can be corrected without extra resource spending, and observations reload through the existing account observation store. The center contains comparison/guidance rather than stat entry, and Improve has no Simulate button. The local observed-roll adapter separates manual Hard/Flex policy from a completed-candidate comparison using the existing actual-team DPS route. A failed manual target does not veto a legal +25 model comparison. A model-positive candidate can be retained in the observed workspace without equipping account items. Incomplete or unsupported team data stays Pending. Local all-slot cost ranking, DPS-based future-roll decisions, calibrated presets and recovery transactions remain separate work.

Desktop side-panel toggles retain independent state. At 1920 and 1440 px, the workbench adapts while both sides remain open. The shared stat-guidance renderer supplies existing reviewed priorities and canonical roll bands to Build, Inventory, Improve and Sandbox. Display preferences never establish numeric DPS value.

## Still separate from this integration

Owner visual review of the built product, deployed Google authentication/cloud-sync acceptance, Firefox/browser matrix, exact-head remote FULL/UI Lab/private paired gates and main/deployment authorization. Full account DPS integration, model coverage and Endgame ranking remain subject to their existing readiness contracts; Pending is preserved. Local Sandbox execution and local advice transport are connected; Teams' numerical ranking is not yet wired to that evaluator.
