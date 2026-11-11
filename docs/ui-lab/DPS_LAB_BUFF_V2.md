# DPS Lab V2 — native effect instance and causality proof (draft PR #365)

**Status:** Proven as a bounded native-source reference pilot. Not gameplay-qualified,
not a universal effects API, not merged/deployed. Source pin:
`riley31415/wuwa_calc@195a22f1b7a1b55b953224e26742b896a719e1c3`.

The **single native engine** remains the calculation truth. Four tracks are just
views over that engine's evaluated actions, hits and effect instances. Chisa's
hypothetical example in the product brief is **not implemented game data**.

## Actual pinned engine model

- `src/engine/gear.ts`: `GearDef.grants`, native `Trigger`,
  `Grant.onHit`, `BuffDef.duration`, `maxStacks`, `when`,
  `lostOnSwap`, `tick`, and unique `ActionField` for separate summoned hits.
  Buffs are not the only possible effect of a gear or ability.
- `src/engine/context.ts`: `applyCurrent`, `applyTeam`,
  `queueOutro`, `applyOn`, `addBuff`, `revoke*`, `attribute`,
  and `grantedBy`/source ownership. This distinguishes the **origin gear**
  from the **triggering actor and action**.
- `src/engine/state.ts`: member/team/enemy `Pool`s. Their
  `set`/`touch`/`extend`/`expired`/`delete` use original
  `State.frame` and native `expires` (duration in 60fps game frames).
  `State.expireBuffs()` actually removes an expired effect before the next
  evaluated action. `State.hits` remains the authoritative damage ledger.
- `src/engine/evaluate.ts`: phase order distinguishes cast-side grants,
  hit-side grants, stat application and on-hit grants; Intro can adopt an
  earlier queued Outro at its own native QTE frame. This is not equivalent to
  granting the recipient the instant the outgoing character presses Outro.
  `landHit()` folds several split-bullet evaluations into one display row.
- `src/teamrun.ts`: `runTeam()` executes one continuous `State` over four
  sections. It is **not** four state resets. `sectionSeconds` gives the
  selected cycle-relative clock origin, and the same `sectionBySlot` and
  `state.hits` provide original damage/DPS.

## Bounded private observer (no upstream source edits)

Private `scripts/team-dps/native-buff-lifecycle.mjs` wraps the pinned
`Pool` methods **only while the native run executes**, restores every method
in `finally` and retains per-State, per-Pool, per-Buff instances. It records
actual first grant, subsequent refresh/extend, precise scheduled expiry or
native revoke and the invoking `ctx.act`, `ctx.slot` and `ctx.buff`.
No effect is inferred from held-buff snapshots. Private projection
`native-buff-view.mjs` requires an **unambiguous source action identity**
(including original `formOf` for split presses), name/member/frame, known
source definition and actual held stat entries; it fails closed otherwise.
Only three specifically pinned effect definitions are currently allowlisted.

**Actual pinned Jinhsi / Zhezhi / Shorekeeper run (global native frames):**

| Effect instance | Origin vs trigger | Scope | Start → native end | Observed impact |
| --- | --- | --- | --- | --- |
| `Ages of Harvest: Ageless Marking R1` carried from prior section | **Jinhsi's weapon**, triggered by Jinhsi `Intro - Loong's Halo` | Jinhsi only | **1125 → 1845**, 720 frames, timed expiry | Kept on selected cycle's beginning, displayed from x=0 but retains real activation at 1125. No eligible stat-ledger action in this final carry-in fragment, so impact is not invented. |
| `Shorekeeper: Inner Stellarealm` | Shorekeeper **Outer realm** advanced by Shorekeeper `Outro - Binary Butterfly` | all three team members | **1845 → 2249**, revoked by native next-stage transition | Source ledger: **+12.5 Crit Rate**; 14 evaluated action rows with the buff's own `StatEntry`, 8 already uniquely matched native HitRecords. |
| `Shorekeeper: Supernal Stellarealm` | Shorekeeper **Inner realm** advanced by **Jinhsi's** `Outro - Temporal Bender (Unison)` | all three team members | **2249 → 3070**, including **2 observed refreshes**, revoked by native next-stage transition | Source ledger: **+12.5 Crit Rate / +25 Crit DMG**; 29 affected action rows, 16 uniquely matched native HitRecords. |

A later, distinct `Ages of Harvest` activation at 1845 → 2565 has
10 affected action stat rows and 3 uniquely linked hit records. It is a
**different native buff instance**, not the old carry-in block extended by
invented time. A documented native *recipient rule* is distinct from
the individual attacks eligible for its tagged stat contribution.

The public V2 DTO represents each buff as an independent
`NATIVE_BUFF_LIFECYCLE` interval, with `sourceGear`, `originKind`,
`originName`, `sourceAction`, `triggerCharacterId`,
`sourceCharacterId`, `recipients`, `activationFrame`,
`expirationFrame`, `refreshes`, `endReason`, `sourceEventId` and
`effectRows`. `timeline.priorSources` carries real out-of-cycle
provenance into the current view; only its drawn start is clipped.
Causal links are `NATIVE_BUFF_ACTIVATED` and
`NATIVE_BUFF_STAT_APPLIED`. There is **no recomputed DPS in the view**.

## Why 119 V1 hit rows remained unlinked

Actual source/native fixture diagnostic, no made-up assignments:

- **116** are consistent with `landHit()` folding multiple bullet
  evaluations into one aggregate cast row; raw `HitRecord.avg` and its
  landing time do not equal the accumulated display row.
- **1** has a candidate involving a previous-cycle cast/queued hit window.
- **2** are still unresolved by the visible trace and are explicitly Pending.

`HitRecord` has `at`, `member`, `slot`, `avg`, `variantAvg`, but
**no direct source-action/evaluation identifier**. Numeric
`(at,member,slot,avg)` matching is necessarily partial and cannot
assign every bullet correctly. The diagnostic categories explain source
behavior but do **not** change the 119 unlinked records into proven links.

**Minimum safe hit integration point (future separate pinned-source upgrade):**
append an optional traced `sourceEvalSeq` to `HitRecord` at the actual
`state.hits.push` in `src/engine/evaluate.ts`; a traced hit's
`ResolvedSnapshot.seq` and its cast's `gaugeLog` then provide a stable
original parent mapping even through `landHit` folding. Keep scoring
`sumHits` unchanged; pin, parity-test and review before enabling.
Do **not** monkeypatch generic array `push()` or guess identity from damage.

## Future changes to rotation

The minimum safe action-edit entrypoint is the real
`runTeamInner -> runRotations(state, member.loadout.rotationAt(...), 4)`
boundary. A future private, versioned API can accept a validated
native-registered `Action` sequence, with native `minForte`,
`minConcerto`, cooldown, charge, swap and resource guards, then
**rerun the entire same engine**. Never remove timeline blocks or subtract
damage in the browser to simulate an edited rotation.
An upstream-safe optional rotation source needs a separately pinned and
reviewed source extension; V2 does **not** implement free editing.

Other buffs, queued Outro-adoption windows, summon lifetime, on-hit grants,
hit-level effect attribution and all freely edited action legality remain
**Pending** unless each full causal chain is proven. Practical DPS is not
implemented. Improve and account equipment state are untouched.

## Verification

Public PR #365 `test/dpsLab.test.ts` exercises bounded effect DTO,
carry-in and rejection of forged sources/times/links. Private
`test/dps-lab.test.mjs` proves the real reference run, stats, times,
causes, refreshes and 119 hit diagnostics; `test/dps-lab-bridge.test.mjs`
checks actual localhost transport and public validator;
`test/dps-lab-browser.test.mjs` uses real Chromium to click native buff
objects, verify ruler/block geometry, origin, recipient, cause, exit,
and that expanding view time does not change original native DPS.

The broader private Foundation workflow is independent of the dedicated
DPS Lab Smoke gate. This is an experimental reference calculator, not a
gameplay-qualified player-build DPS verdict.
