# Bellibing Local Beta — status and release gates

> **Owner decision 2026-11-14.** Bellibing is a *usable local beta candidate* on Windows. This is a scope/priority change, **not** a released beta, online deployment, or claim of universal correctness. The candidate lives only in [Draft PR #365](https://github.com/bellebing/Bellibing-simulator/pull/365); published `main` remains a separate state. Read current GitHub head/CI and real implementation before trusting dated counts below.

## Start here — one active queue

- **Active beta backlog and priorities:** [GitHub Issue #368 — local beta tracker](https://github.com/bellebing/Bellibing-simulator/issues/368). Each actionable bug or feature gets its own linked GitHub Issue (including [#366](https://github.com/bellebing/Bellibing-simulator/issues/366) and [#367](https://github.com/bellebing/Bellibing-simulator/issues/367)); avoid shadow task lists.
- **Historical bug IDs and implementation evidence:** private *Bellibing Echo Tool — AI Handoff*, tabs `Buggar` and `Uppdateringslogg`. Do not publish player data, private image scans, account backups or private engine details in public issues. Reference existing `BUG-xxx` IDs in Issues and handoff logs; avoid dual independent status decisions.
- **Detailed source/feature inventory:** [PROJECT_STATUS.md](PROJECT_STATUS.md), [current integration candidate](ONE_PR_INTEGRATION_REVIEW.md), [character import notes](CHARACTER_IMPORT_PIPELINE.md), and [source ownership / development process](DEVELOPMENT_PROCESS.md). Dates and old experimental coverage counts in long documents are historical unless the current implementation confirms them.
- **Documentation index, active contracts and archive classification:** [README.md](README.md).

## What is available in the local candidate

| Area | Evidence / usable scope | What this **does not** prove |
| --- | --- | --- |
| Build | Single Current Build per owned Character; source-backed Character, Weapon, five physical Echoes, Skills/Sequences where covered. Owned changes persist via the common AccountStore. | No unrestricted stat/DPS projection or false facts for missing investment/Minor Forte. |
| Image import | Python/OpenCV/Tesseract on localhost, reviewed real Discord-card OCR and strict legal Echo tiers. **Owner smoke report 2026-11-14:** several own cards appear to import and save successfully. | Not general OCR accuracy, every format/rarity or a completed exact-head Windows regression/backup campaign. |
| Inventory / account | Authoritative IndexedDB owner with physical item identity and versioned JSON backup/restore pathways; Chromium focused exercises previously passed. | Not cloud sync; not proof that the user's own export/restore has been repeated on today's head. |
| Improve | Saved Current Build, isolated Candidate, source/product Hard/Flex guidance, local Echo advice where supported. Product defaults were reviewed for the original **59** Characters. | Not universal Expected numeric results, source-certified limits for every stat, or Lily/Suoming-specific verified recommendations. |
| Sandbox / Teams | Detached simulation and saved actual team references exist in the local candidate. | Saved teams **are not** gameplay-qualified Team DPS or an Endgame optimizer. |
| Character source | Draft #365 covers **61 RELEASED** canonical Characters; Hsin, Lily and Suoming passed targeted real Chromium Build/Inventory usability checks in the Character Import Pipeline. | New Character Sequences (18 static Build effects), private mechanics/rotations/DPS and the missing improve source defaults remain Pending. |

**Release-state separation:** `Verify FAST` passed on candidate commit `d1285814` as of 2026-11-14. Five other targeted workflows were **skipped**, not PASS. Full browser/UI Lab, entire test suite, current private-pair compatibility and owner Windows acceptance are **not** certified for merge/deploy. Recheck exact head before release; do not infer correctness from past green statuses.

## Beta priorities and open work

**P0 — blocker before calling it beta-ready:** source/ownership errors, lost or overwritten Account/backup, invented gameplay numbers, private code escaping into public artifacts, broken real save/reload. Stop/recover rather than auto-correct user data.

**P1 — local beta core:** [#367](https://github.com/bellebing/Bellibing-simulator/issues/367) verify a *small, targeted* real Windows source-card → reviewed Echoes → Add Character → reload → Inventory → Improve Current journey and invalid-data nonmutation, with the locally installed **same** candidate revision. Historical `BUG-068`–`BUG-071` are **FIX IN PR**, not independently FIXED. Check JSON export/restore **on an isolated profile**, preserving physical IDs/account separation. Inspect any actual broken navigation/status that the owner sees; resolve before claiming local beta acceptance.

**P2 — polish, not blocker:** [#366](https://github.com/bellebing/Bellibing-simulator/issues/366) total Character Stats show `Pending` in the *unsaved* OCR preview but appear after Add Character. Do not bypass safety gate or silently save to show a preview.

**Later / explicitly parked:** mass OCR benchmarking (owner chose not to pursue now), unsupported card formats / unobserved 4★ cards, general private DPS & rotations, full online auth/sync, production private backend, teams/endgame optimisation and speculative character data. Keep existing [#325](https://github.com/bellebing/Bellibing-simulator/issues/325), [#327](https://github.com/bellebing/Bellibing-simulator/issues/327), [#330](https://github.com/bellebing/Bellibing-simulator/issues/330), [#348](https://github.com/bellebing/Bellibing-simulator/issues/348), [#352](https://github.com/bellebing/Bellibing-simulator/issues/352) as historical/future work sources, not five simultaneous release blockers.

## Definition of done — local beta candidate

1. **Truth & ownership:** actually tested source-backed Build → Add → save/reload → Inventory → Improve Current and safe rejection/recovery in a local test account; no shadow copies of Current, no synthetic DPS.
2. **Persistence:** export a supported versioned JSON backup, restore into a separate empty profile and re-export/reload with stable item IDs and no other-account overwrite. Never test destructive restore on the owner's only data.
3. **Owner usability:** fix actual P0/P1 regressions, write down known P2 gaps (including unsaved preview Pending). One focused Windows acceptance campaign; broad unrelated OCR batch tests are not required for this local scope.
4. **Verification:** focused tests while iterating. One appropriately scoped **MERGE-level** full test/build/browser/UI and private compatibility review on the exact future candidate **only when** a merge/release is being requested. Failed/skipped gates remain visible; no repetitive heavy CI during normal development.
5. **Release decision:** Owner explicitly authorizes branch merge and deployment separately. Public online beta and cloud/private hosting have their own risks and plans; local usability never auto-authorizes them.

## Beta bug lifecycle

**Observe → open Issue → prioritize P0/P1/P2/Parked → reproduce → fix in PR → verify on relevant real surface → close Issue.** A commit, green FAST, or synthetic scan is not a user-visible fix. For UI bugs, confirm actual browser UI; for local-scanner issues, Windows/image acceptance; for storage, save/reload and nonmutation. Use [GitHub New Issue](https://github.com/bellebing/Bellibing-simulator/issues/new) immediately with reproducible details, expected vs actual, environment/commit and sanitized evidence. A structured [beta-bug template](../.github/ISSUE_TEMPLATE/beta-bug.yml) is included in Draft PR #365; GitHub will only offer that form through the normal main-branch Issues UI **after a separately approved merge**. Link `BUG-xxx` when known. Do not close old bugs merely because the same category seems to work informally.

## Documentation policy

Keep canonical source/data/mechanics and safety contracts. Use [docs index](README.md) to separate active docs from dated source evidence and superseded priorities. Archive by *label/index first*, not deleting/relinking thousands of assets; only remove files after reference/build/public-artifact audit. This beta overview is the **navigation/triage** source, not a second calculator, release automation or replacement for GitHub code.
