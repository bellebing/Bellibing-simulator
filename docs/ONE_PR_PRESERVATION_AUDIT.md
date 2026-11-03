# Recovery preservation and UI-delta audit

This is the pre-port audit for the scope in [the recovery contract](ONE_PR_RECOVERY_2026-11-03.md). It is not implementation, visual approval, or release evidence. The owner clarification also excludes a standalone/full-page importer: Build → compact Import → scan → correct/confirm → Save → existing Build.

## Source preservation

[source-files.json](recovery/source-files.json) inventories 438 source-file observations with original commit, Git blob, SHA-256, byte count, binary classification, main comparison and disposition. Diffs use each source's merge base with main, so newer main contributions are not mistaken for deletions in older PRs. The initial checkout was clean, with one worktree and no unpublished local application changes. The recovery plan already in this branch is retained.

- Main is the recovery document's base. Its compact member-only Team DPS module is byte-identical to #360; keep it unchanged. Do not replay already integrated M0 work.
- #359 is an ancestor of #360. Preserve its observed-roll/session/economics tests and functionality through #360's later implementation.
- #360 has 114 changed files against main. Domain capture/session, physical ownership, migration, recovery, account settings, scanner and tests are functional sources. Build/account integration must preserve explicit saves, stale-write rejection, old items and unknown facts. Its large Improve opportunity section and native optimization selectors are **not** approved presentation. Its status/handoff documents contain superseded #360-only publication instructions; retain their source history without making those instructions current.
- #361 has 211 concept files. Retain all original files, authored assets and review records as isolated visual evidence. Port only Build, My Teams and Inventory presentation to real owners. Its Improve/Sandbox placeholders, synthetic team DPS and demo store must not enter production. Endstate remains the original isolated concept.
- #362's 24 original scanner files: 18 identical in #360, six changed. [scanner-comparison.json](recovery/scanner-comparison.json) records both content hashes. Changed README/UPSTREAM preserve original attribution and historical accuracy separately from newer evidence; scanner.py adds geometric recognition and reviewable DEF compatibility; test_scanner.py adds regressions; vendor/card.py and vendor/data.py retain the narrow alias. #360 adds icon_recognition.py, browser adaptations, cost icons and compatibility evidence. Preserve all of these improvements and GPL source/license; do not revert to the earlier recognizer.
- #363 diverges from #360, removing later account/session persistence and investment bindings. Never apply it wholesale. Its compact comparison presentation needs private #46 and owner review; retained in #363 pending paired compatibility. #360 already includes some version-aware presentation helpers, which is not proof that private main supports the newer result.
- #364 remains an art archive at its original commit/PR. Ledger records each original asset hash; no runtime activation, including the unapproved later Electro material edit.
- Closed #347 has unique PRODUCT_JOURNEY_ROADMAP and ROADMAP_DOCUMENT_AUDIT documents; #350 has DPS_M0_CN_SOURCE_AND_RESONANCE_MODE_REVIEW; #355 has UI_INSPIRATION_BANK. Retain useful documents as historical candidates, not current readiness. #356's desktop restriction is already expressed by current UI_AGENT_START and UI_LAYOUT_MOTION_CONTRACT. Do not overwrite newer DEVELOPMENT_PROCESS or PROJECT_STATUS with old snapshots.
- Private #41/#43/#45 are merged; only their existing public allowlisted API is reusable. #46/#47 remain open. #46 compatibility is pending; #47 experimental implementation is excluded. No private source, fixture or policy is copied into this ledger or public artifacts.

All source PRs remain intact. A disposition of deferred/reference means the original file is safely retained at the recorded source commit, **not** that its behavior has been implemented here.

## Production route ownership

| Route | Existing owner | Required port / preservation |
| --- | --- | --- |
| `/build/` | build-sandbox.mjs wrapper → ui-preview/index.html → v34-functional.html; Character-owned build, existing editor modules | Port selected-still/card composition from #361 onto this Builder. Keep actual Weapon/Echo/Sequence/Forte editors and explicit #360 Save. Compact Import returns here. No second Builder. |
| `/improve/` | build-sandbox.mjs → v1.1/index.html + modules/app.js, echo-advisor.js, account-projection/settings and dps-concept.js | Preserve Settings/Current/Candidate/five equipped slots and compact Team DPS. Port actual observations, costs, contextual persistence and private capture independently of rejected large presentation. |
| `/sandbox/` | same shared workspace; sandbox-state/workspace/client | Preserve hypothetical RNG, independent settings/resources/equipment and existing layout. No account-store or demo replacement. |
| `/inventory/` | #360 build-inventory.mjs + inventory/integration.js + account-session.js | Approved #361 grid/inspector over #360's single IndexedDB owner, physical IDs, moves and JSON recovery. No demo store or inferred +0 stacks. |
| Team Builder | presently disabled in shared workspace-navigation.js | Port #361 My Teams to a real route using saved Character references and actual equipment. No synthetic DPS. New durable team references must use the same account transaction/backup owner. |
| Import | #360 inventory/integration.js review sheet | One compact entry in Build. Keep OCR, original evidence, explicit corrections/consent, tab staging/revision invalidation and explicit save. No independent page/menu or automatic equip. |

## Isolated concept route ownership

`docs/ui-lab/inventory-concept/preview.html` is #361's packaged interactive reference; index.html/concept.js/concept.css plus hero-team.js/hero-team.css are its modular source. Its selected-stills assets and review records remain original. Build/Teams/Inventory are visual oracles only; Endgame remains concept-only. No product navigation should route into this demo. The rejected accepted-improve.png filename does not confer approval.

## UI delta constraints before implementation

| Surface | Approved delta | Rejected / requires owner decision |
| --- | --- | --- |
| Build | #361 still/canvas, Stats/Weapon/Forte cards and five detailed Echo cards, backed by existing editors | Independent Character screen, invented arrangement, or hiding existing editing functionality |
| Team | #361 saved-team sidebar and three member cards, real owned references | Demo values, inferred roles/rotation/Endgame implementation |
| Inventory | #361 collection grid + inspector; actual artwork/physical ownership | Concept inventory persistence, synthetic item counts or +0 stacks |
| Improve | Real observed substat/value entry and advice within existing approved surfaces | #360's large pre-workspace analysis section/table; nine ordinary optimization modes; #361 placeholder; restored Team DPS prose |
| Sandbox | Functional preservation | Any replacement layout or Inventory ownership coupling |
| Import | Compact upload; necessary correction/confirmation; save to existing Builder | Standalone full-page importer or second Character menu |

If an essential flow cannot fit these surfaces without material layout change, stop with a concrete owner-review question before implementing that change. Browser screenshots and passing checks do not grant visual approval.

## Verification baseline and limits

At audit time #365's FAST passed; its FULL/deploy jobs were skipped. #360's latest Verify and UI review are failed, so its older claims are not current-head evidence. Local baseline build passed the public boundary (1,531 assets, 18 compiled modules). Screenshots must be freshly captured from the built routes with an isolated canonical owned fixture; a 404, empty demo or old source image is not acceptance evidence. Final integration needs focused ownership/restore/session/scanner tests, relevant builds and all six real desktop surfaces at 1440/1920 before owner approval. FULL and paired private compatibility remain later gates.
