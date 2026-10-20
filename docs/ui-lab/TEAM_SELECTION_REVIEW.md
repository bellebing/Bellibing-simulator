# Source Team Selection — V1 review

The existing Sandbox and Improve workspaces use the same generated `character-contexts.json` and the single source-context/role selector in `docs/ui-lab/v1.1/modules/team-selection.js`. No separate Team Builder, new team database, combat rotation, DPS qualification or private engine change is part of this Draft.

## What to review

- Both `/sandbox/` and `/improve/`: all 59 RELEASED Characters, with source-bound default team, roles from the selected context, portrait choices and source/context link.
- A reviewed full-team choice is atomic. Role changes use complete reviewed context IDs, not independent partner/support lists. Source conditions and relevant mode labels are shown; published model-only discovery stays excluded, except five explicitly approved guide-prose matches (which retain their underlying unranked/model classification).
- Augusta / Iuno / Shorekeeper → Mortefi keeps Shorekeeper only through the reviewed Augusta/Mortefi/Shorekeeper trio.
- Qingxiao / Lynae / Shorekeeper → Denia creates a **Pending Support** slot. Mornye may be explicitly chosen. Denia + Shorekeeper is not inferred from unsupported discovery. A Pending selection is **not** a complete team.
- Source-member identities that are normally sub-DPS or support retain the actual carry and member roles. Standard-team reset and source mode contexts remain selectable. No new supported combination is automatically invented.
- Team changes don't edit Echoes, equipment, settings, account Current/Candidate or resource ownership. Sandbox invalidates old local team-evaluation leases; normal Team DPS is Pending in both workspaces.

## Source audit and tests

`node scripts/report-team-selection-coverage.mjs` generates `artifacts/team-selection/coverage.json` and `coverage.md` with a 59-row inventory, default context IDs and reviewed option/mode/condition counts, enforcing 397/397 context reachability through all three member pages, real roles/source references and no unapproved model discovery.

`node --experimental-strip-types --test test/teamSelection.test.mjs` checks conditional role swaps, default reset, restricted status/modes, and independent user-owned state. The UI Lab Review gate runs these checks and native Chromium over both routes at 1440×900 and 390×844. It uploads the per-Character report and screenshots to `team-selection-review`. These are candidate checks, **not** user visual approval.

## Windows local preview

Use the working Git clones **side by side** (not a GitHub ZIP), with public branch `feat/source-team-selection-sandbox-improve-20261020` and private branch `feat/windows-local-launcher`. Then run the existing `Bellibing-simulator/START_BELLIBING_LOCAL.bat`. It installs/verifies locked source dependencies, builds a motor-free public `dist`, stages the unchanged private Worker only under private ignored local output and opens Build. Use the navigation for Improve or Echo Sandbox. Close by pressing Enter in the launcher window.

Prerequisites: Node.js 22.16+, npm, Git for Windows and the private checkout; first-time private locked source fetch may require authenticated GitHub CLI. The local preview is loopback-only. No merge, deployment or Worker publication is authorized.

**DPS**: all normal rows remain Pending. The existing bounded Augusta synthetic reference must not appear as qualified general Team DPS.
