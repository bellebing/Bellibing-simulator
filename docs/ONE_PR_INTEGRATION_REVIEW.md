# One-PR integration — owner review candidate

This candidate is exclusively in Draft #365. Main remains unchanged. **Owner visual approval, FULL/UI Lab and paired private compatibility are pending. This is not completion or release readiness.** The owner-approved Sequence access is the S-level label opening the existing controls.

## Implemented candidate

- Existing Builder: selected-still scene, left Stats/Weapon/Forte cards and five detailed right Echo cards, using existing canonical readers/editors. Explicit Save Build, Add to Account and Character Build Card remain. There is no second Builder.
- Compact Import in Build: upload/drop/paste → real scanner → anchored correction/confirmation → explicit save → same Builder with the imported Character selected. Review shows one Echo at a time beside its original crop; all five are directly selectable. Original card and skill facts remain inspectable. Unknown rank/refinement/Forte facts are retained. Explicit assignment/replacement, corrected tab drafts and revision invalidation are preserved.
- Inventory: one IndexedDB account, physical IDs, separate Echo/Weapon tabs, owner filters, grid/inspector, explicit moves, retained replaced items, fact review, recovery and validated JSON portability. No +0 stack inference.
- My Teams: real saved team references in the same account transaction/backup owner, three distinct saved Characters, actual equipment, create/edit/save/reload and stale-save rejection. No equipment copies or synthetic DPS. Team calculation remains Pending; this is not a new team evaluator or Endgame implementation.
- Improve: original shared Settings/Current/Candidate/five-slot composition and member-only Team DPS module retained. Genuine exact +5…+25 entry, per-slot observations/reload, costs, private allowlisted request capture and contextual invalidation are ported. Manual Candidate editing remains available before an observed candidate exists. Optional selected-slot advice occupies the existing interaction column; the rejected large analysis table is not mounted or bundled.
- Sandbox: original hypothetical workspace retained; it does not open the account store. Its existing RNG clients, settings, resource and comparison behavior remain separate.
- Account sync/Firebase source, emulator tests and isolated account-review tooling from #360 are retained without configuration or activation. #361's 211 concept files are byte-identical, including Endstate; none of its demo store or placeholder workspaces is used in the product.

## Preservation evidence

The [original ledger](recovery/source-files.json) contains 438 source-file observations. The [destination map](recovery/integration-map.json) records exact copies, adapted files and deferred source locations. Run `node scripts/audit-one-pr-recovery.mjs`: 243 frozen files match their original SHA-256, including all #361 files, #360 scanner files and main's Team DPS module / shared Sandbox stylesheet. The shared workspace HTML differs from main only by the observation stylesheet link.

Preserved source histories: #359 through #360 ancestry; #360 functional source; #361 isolated design/assets/reviews; #362 scanner provenance; #363/private #46 deferred; #364 archive retained in its source PR without activation. Useful missing #347/#350/#355 documents are retained with historical labels; #356 does not overwrite newer process contracts. The owner's later scanner clarification commit is retained in this branch history. No source PR is closed or rewritten. No private implementation or original owner image enters public source/artifacts.

## Local verification

- 94 focused Node cases passed by direct execution, covering Inventory validation/moves, store transactions, migration/backup, sync adapters, settings, actual observations/capture, Candidate isolation, transport, presentation, teams and CI guards. Direct-file results are counted; the local isolated runner's per-file summary is not treated as an individual-test count.
- 21 Python scanner regressions passed. Real Chromium WASM startup, the same 21 regressions, actual Tesseract OCR crop recognition, invalid-image rejection and cancellation passed. A generated whole-card sample was correctly rejected; it was not used as recognition accuracy evidence.
- Original owner-supplied Lupa: real OCR → close/reopen correction retention → explicit consent/assignment → existing Build selection → reload with six preserved physical items. Unknown facts remain unknown. No remote image uploads or page errors. Evidence stays private.
- Original Ciaccona: real OCR retained the geometric recognition and reviewable DEF compatibility proposal. This is focused recovery evidence, not a rerun of the complete historical accuracy benchmark.
- Real Chromium ownership journey: Sequence editing/Save, observed roll/reload, team creation/reload, explicit item move, unchanged cardinality, JSON export → empty-profile restore → re-export, resource preservation and Sandbox account isolation. Screenshots cover all six surfaces at 1440×900 and 1920×1080 using an isolated canonical owned account, not a demo store or real user data.
- Chromium process restart / frozen-v0 database upgrade passed. The original built-product resource/Gate persistence and future-schema rescue browser test passed after adapting its Inventory tab assertions.
- Strict web build and public-artifact boundary passed: 1,550 allowlisted assets, 18 approved compiled modules, no source maps. Whitespace and the preservation audit passed.

The integration adds queued durable resource edits so overlapping saves compose without losing another field; failed saves preserve the prior balance and do not poison later edits. Regression coverage exercises both cases. The first remote FAST run stopped on the compare API’s 300-file cap before any checks. Its metadata fallback now paginates the complete PR file list, verifies the exact head before and after, rejects truncated/over-limit results, and retains the same test budgets and FULL gates. Four focused regressions cover these boundaries. The inherited #360 CI checksum test now separately pins its additive Foundation block while preserving the original FULL-step checksum and unchanged UI Lab checksum.

## Desktop visual differences for owner review

| Surface | Candidate difference |
| --- | --- |
| Build | #361 card/still composition over the existing editor; actual canonical art/stats replace demonstrations. S-level access follows the explicit owner choice. Existing save/card actions remain. |
| My Teams | #361 saved-sidebar / three-member-card composition with actual saved references. Create/edit controls replace demo-only selection; numerical cells remain Pending. |
| Inventory | #361 grid/inspector with real item artwork, physical counts, filters and explicit move/recovery controls. Saved Character fact review is collapsed. |
| Improve | Existing layout retained; the primary action records an observation. The compact form/advice lives inside the existing column; Expected/observed net costs remain in the existing table. |
| Sandbox | Workspace composition retained; shared header now links to the real Team route and Inventory. Account initialization is excluded. |
| Import | Compact Build-anchored upload and single-Echo correction review. Save returns to Build. No standalone importer or duplicate Character screen. |

`artifacts/recovery-review/` holds the real desktop PNGs and runtime identity; `before-*` in `artifacts/recovery-audit/` captures main's built baseline. Private original-card screenshots/results are excluded from public output.

## Preview and remaining gates

The compiled artifact is a local UI preview, not an online deployment. Extract the complete web artifact and serve it with `python3 -m http.server 4173 --directory dist` (or serve the extracted artifact root). Open `/build/`; `/improve/`, `/sandbox/`, `/teams/` and `/inventory/` are real routes. `review-build.json` identifies the build. Import recognition additionally requires the documented local scanner launcher or prepared browser-WASM review assets; the plain static artifact does not claim hosted OCR or private runtime availability.

Remaining:

- Owner approval of all six production surfaces. Further material visual changes stop for owner review.
- Exact-head FULL/UI Lab and complete existing browser gates, including adapting historical legacy-storage UX oracles to the explicit Inventory-owned save semantics. No gate is removed or declared green here.
- Firefox persistence browser could not launch in this environment: namespace setup attempted to write read-only `/proc/self/uid_map`. Chromium results do not qualify Firefox.
- Paired private #45 compatibility/runtime execution has not been rerun or activated. #363/private #46 and experimental private #47 remain excluded/deferred. No live numerical DPS/advice, hosted capacity or gameplay readiness is claimed from static/Pending screenshots.
- Firebase emulator/deployed OAuth acceptance, independent scanner accuracy expansion, licensing/distribution clearance, +0 stacks and Endgame remain separate pending boundaries.

No merge, deployment, private backend activation, source PR closure, branch deletion or live account changes occurred.
