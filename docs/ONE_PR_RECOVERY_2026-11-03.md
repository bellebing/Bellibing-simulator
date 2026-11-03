# One-PR UI + integration recovery — owner scope 2026-11-03

> **STATUS: RECOVERY CONTRACT; LOCAL INTEGRATION CANDIDATE, NOT UI-APPROVED.** The [preservation audit](ONE_PR_PRESERVATION_AUDIT.md) precedes porting; the [integration review](ONE_PR_INTEGRATION_REVIEW.md) distinguishes implemented behavior, local evidence and remaining gates. Keep this PR Draft until the owner signs off. No merge, deployment, PR closure, backend activation, private engine copying, or live account changes.

## Purpose and exact separation

Combine **the new Build a Character, Build a Team/My Teams and Inventory UX** the owner approved in the #361 interactive concept **with the real implementation and cross-workspace data links developed in #360**. Preserve the **working Improve a Character and Echo Sandbox** from current main and the actual #360 functional capabilities, without importing #361's placeholder Improve/Sandbox or #359/#360's oversized Improve replacement view.

The user's specific UI commitments:
- **Build a Character**: #361 selected-stills / cards UX is the presentation reference, with actual existing Character Builder and owned items. #360 already integrates six selected backgrounds; avoid a second builder or fake state.
- **Build a Team**: #361 My Teams/Team Builder UX is the presentation reference. #360 explicitly defers the real Team Builder; **it is NOT already production-integrated**. Connect the concept UI to actual saved owner/Character/Equipment data, using existing canonical team/DPS contracts only when supported. No demo scores as real results.
- **Inventory**: #361 grid + inspector is the approved UX; #360 supplies actual owner, physical IDs and item artwork. Make it one shared owner, not a concept demo store. Preserve equipped/move/replaced items, item cardinality, export/restore.
- **Improve a Character**: preserve product workspace composition: five actual owned Echo slots, Current vs Candidate, compact settings and the #345+ Team DPS simplification. #360's observed roll collection, private allowlisted advice, probabilities, costs and contextual persistence are FUNCTIONALITY TO KEEP; refactor their presentation into existing approved surfaces only, without a large replacement layout, giant five-slot analysis table or independent character screen. If UI cannot accommodate an essential flow without material change, **STOP and ask owner**, do not invent a view.
- **Echo Sandbox**: retain current hypothetical RNG, its original independent presentation/settings/ownership. Never turn it into Inventory, account equipment or #361 placeholder.
- **Endstate Matrix**: keep the #361 concept isolated, deferred and unmodified. The owner provisionally accepts it existing as a concept, NOT as a fully implemented Endgame system.
- **Character Import**: one compact upload entry; review source card facts and corrections explicitly; saved imported Character appears in existing Build, not a second new Character menu. Keep tab staging/revisions, no automatic equip or guessed facts. Account/login entry is not authorization for a new login layout.
- **No text clutter**: do not restore `Team options`, `Standard team`, `Reviewed core variant`, generic guide-slot/source summaries or `Team conditions` in ordinary Team DPS. The #345 cleanup is already present on main. One compact member-based Team DPS panel is the baseline.

## Exact source refs — revalidate before editing

| Source | Revision | What to do |
| --- | --- | --- |
| Public `main` / #358 | `f22c37b822f1ab653b37c11f1c692d31f84586f4` | **Base**. Already contains #345 UI cleanup, #349 59-character experimental DPS integrated via merged #353, #354 CI work, #357, #358. Do not replay them blindly. |
| #359 | `9e979a138c6c011a2e56f5f2c4734e3f7569aeac` | Its history is included in #360. Preserve actual-roll/economics capabilities, not unsolicited large UI. |
| #360 | `2ab42d5e7c879576c0540f16b28c5065bfa6f1eb` | **Functional integration source**: indexed-owned Inventory, import/scanner, JSON restore, Build/Improve continuity. 114 changed files. Audit every change vs main. Do not wholesale adopt unauthorized Improve UI. |
| #361 | `9b457579818c212380d5911592a34c2076d64282` | **Approved Build/Team/Inventory visual reference**, 211 isolated concept files in `docs/ui-lab/inventory-concept/`. Do not copy its demo state as production. Preserve its authored assets, review records and design refs. |
| #362 | `0849a117bf9a913e8ffcc900783bbae7a0af6a99` | Scanner proof, paths overlap #360; compare **blob content** and license/evidence before saying fully subsumed. |
| #363 | `8a4f64e3849d9755b0c2ddf9bce3de284116a00c` | Compact Continue/Start new Echo concept; has **diverged** from later #360 head; depends on private #46. Preserve separately pending until compatibility + owner visual review. |
| #364 | `9c799b3aed6bcd1744e0f13ec35adb97fb40f468` | Art archive only, later Electro material edit still awaiting approval. Preserve as source assets, do not activate as new backgrounds. |
| #347, #350, #355, #356 | closed independent docs/process work | Audit missing files/content; preserve useful history without reverting newer process docs. |
| Private engine #41, #43, #45 | merged | Reuse existing private API; never publish implementation in public assets. |
| Private engine #46, #47 | open | #46 needed for #363's versioned neutral comparison; #47 experimental and untested — **not ready**. |

**Important**: `main` is a branch; #358 is the PR whose merge yielded the current base at the time of review, not a permanent synonym for main. Recheck every SHA when starting work.

## Screenshots / primary interactive visual oracles

- #361 **Build**: https://raw.githack.com/bellebing/Bellibing-simulator/9b457579818c212380d5911592a34c2076d64282/docs/ui-lab/inventory-concept/preview.html#build
- #361 **My Teams**: https://raw.githack.com/bellebing/Bellibing-simulator/9b457579818c212380d5911592a34c2076d64282/docs/ui-lab/inventory-concept/preview.html#teams
- #361 **Inventory**: https://raw.githack.com/bellebing/Bellibing-simulator/9b457579818c212380d5911592a34c2076d64282/docs/ui-lab/inventory-concept/preview.html#inventory
- #361 **Endstate**: use Teams -> Endgame inside the same preview; retain concept as-is.
- #345 **after** Team DPS: `docs/ui-lab/reviews/member-team-dps/after-improve-1440.png` at `00550a033e2522c0f886d82c6aae05d121b6c8c6`. Empty-account capture intentionally hides five real Echo cards; **do not mistake it for accepted whole-page Improve**.
- #345 **before** `before-improve-1440.png`: preserves five Echo composition but includes **rejected old prose**. Composition reference only. Product main `docs/ui-lab/v1.1/modules/dps-concept.js` has removed those visible source strings and matches #360's version.

Do not present `docs/ui-lab/inventory-concept/hero-correction-review/accepted-improve.png` as the approved Improve reference — **the owner explicitly rejected that picture**.

## Scanner provenance and required compact flow — owner clarification 2026-11-03

**Do not confuse scanner implementation with its UI placement.** Verified sources:
- **#361** has only a `Build → Add Character` planned scanner entry in its concept and explicitly states **no real OCR**. Its Build/Inventory visual flow is the approved starting point, but #361 is NOT the scanner algorithm source.
- **#362** is the original real, isolated Discord-card OCR/image-recognition proof (real local scanner, five panels, inline correction, confirmation; intentionally disconnected `Save to Inventory`). This is the historical scanner source/oracle; preserve actual recognition algorithms, provenance, license and focused tests.
- **#360** carries a subsequently integrated/extended real scanner plus ownership/persistence, improved recognition, import staging and Save Build linkage. Reuse its verified **functional changes and data adapters** if correct; reject any separate full-page Character Import screen or large duplicate editable Character Builder presentation.

**OWNER'S NONNEGOTIABLE END-TO-END INTERACTION:**
1. Open existing **Build a Character**, choose its compact Import / Add Character control (or a small unobtrusive anchored popover). Accept a Discord build card via upload/drop/paste. No redirect to a separate full-page import wizard, no parallel standalone Character menu, and no new full-screen scanner interface.
2. Run the real #362/#360 recognition on that image; allow **necessary compact review of uncertain/corrected scan facts**, but do not invent Character editor clones. Review provenance/unrecognized fields explicitly; never fill unknown weapon rank/refinement, skills/level or Echo details by guessing.
3. On explicit confirmation, save into the existing canonical account / Inventory owner and create/update the real Character Build under its standard Character identity. After successful import, **navigate/focus existing Build a Character** with that imported character selected and the exact confirmed owned items; never display a second Character Build page. No automatic equipment/overwrite if conflict/revision checks fail.
4. Keep corrected draft recovery, physical Echo/Weapon IDs, replacing equipped items safely, atomic save, before-state/rollback, JSON export/restore and in-Build Skills/Forte completion; distinguish staging from saved owned data. Genuine scanner functionality may come from #360 when #362 lacks it; this does **not** authorize #360's UI.
5. Test real upload → recognition → minimal review → explicit save → Build a Character selected → reload → Inventory → Improve sees saved Current. Verify cancel, corrupted file, duplicate, conflicting equipment, missing facts, revision freshness, keyboard/pointer, no redundant view, zero lost items, and complete record/source provenance.
6. Present scanner preview showing its **actual compact UI within Build** and screenshots for owner approval. If sufficient OCR review genuinely cannot fit the approved compact flow, **STOP for owner approval rather than introducing a new screen**.

**Any previous statement that the complete scanner was implemented in #361 is incorrect.** #361 = visual entry concept; #362 = OCR source; #360 = integrated scanner implementation + data continuity. Choose functions from verified code, UI only from approved presentation. Keep everything in #365.

## Mandatory execution: one branch, one Draft PR

1. **Before writing code:** check current GitHub main, working trees and open/closed PR ancestry; read `AGENTS.md`, `docs/DEVELOPMENT_PROCESS.md`, `docs/PROJECT_STATUS.md`, Bellibing Echo Tool AI Handoff and relevant UI/data contracts. Recover any local-only unpublished work before changing files.
2. Make a **lossless preservation ledger**: original SHA, filename, behavior/visual reference, destination in this PR or already-main, if deferred then which existing PR safely retains it. Include source docs, binary hashes, GPL scanner attribution, old tests and uncommitted local edits. Compare actual #362/#360 scanner contents, #363 vs current #360, and private result versions. Do not close/squash/rebase/force-push existing PRs.
3. Create **two explicit route maps**: (a) production routes `/build/`, `/improve/`, `/sandbox/`, `/inventory/`, Team Builder; (b) isolated `docs/ui-lab/inventory-concept/` preview. Identify which route, DOM/CSS/module should own each approved production surface. Keep real data ownership; remove temporary concept links from product navigation, without changing settled Improve/Sandbox layout.
4. Port approved **Build** and **My Teams** presentation to real routes and wire actual saved data; retain #360's real Inventory and import pipeline. For Improve/Sandbox, integrate **functionality without new page layout**. No extra Character importer menu. If a proposed change must alter a user-approved layout, stop for owner review.
5. Guard against silently lost work: compare expected item IDs/counts, equipped owner, replacement, +0 stacks (currently deferred unless source-validated), Character/Weapon/Skills facts, revised Import, corrections, resource balances, account revision, JSON export/empty restore/re-export. No synthetic DPS, fabricated source data, duplicated storage, automatic equipment writes or Sandbox ownership leak.
6. Run focused FAST checks and real local Chromium desktop at 1440x900 with meaningful equipped account, not only empty-demo. Check all **six** surfaces (Build, Improve, Sandbox, My Teams, Inventory, Import). Supply **real screenshot files or an accessible clickable GitHack/preview link**, before/after evidence and one line per material visual difference. User **alone** approves UI. Do not equate green UI tests with approval.
7. Only then exact-head FULL Verify, UI Lab Review, strict build, artifact boundary/source audits, full persistence and restore checks, real browser regressions, paired private engine compatibility. Keep Draft; NO merge, backend activation, deployment, source PR cleanup or closure without a new explicit owner GO.
8. Update `docs/PROJECT_STATUS.md` and Bellibing Echo Tool AI Handoff update log + bug register **after meaningful implemented/tested work**, and distinguish pending from verified.

## Required Codex result after each coherent step

State explicitly: committed SHA; what is now **implemented vs still planned**; main vs this Draft; list of source PRs preserved; tested exact head and CI URLs; UI screenshot/preview evidence; known gaps and blocking owner decisions. No claim of completed Build Team, import or Improve based only on copied concept HTML or a green build. Do not make more feature PRs.
