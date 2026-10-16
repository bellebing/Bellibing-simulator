# Manual Echo Workshop integration candidate

The approved PR #292 presentation is ported into `docs/workshop/v1.1/` and opened
from the existing application's Improve → Echo Workshop entry. The review URL is
`docs/ui-prototypes/v34-functional.html?workshop=1` (built: `/ui-preview/?workshop=1`).
The same-origin presentation frame contains the approved CSS and DOM independently
of the older Build/Improve stylesheet. `workshop-source.js` is a narrow adapter to
the existing application owner, not an account store. Build returns to that owner.

## Ownership and manual execution

- Canonical released Characters and existing account membership drive the carousel.
  Browsing does not add Characters. Simulate requires an existing account Character.
- Real equipment remains in the existing Character-owned `drafts[name].build`
  (`CharacterBuildState`). The adapter returns detached reads, including canonical
  static stats, current equipment, Weapon, Forte and Sequence. No equipment writer
  is exposed to the Workshop.
- Current shows saved equipment. Simulate retains non-Echo Character context and
  starts five empty simulated slots. One candidate belongs to each selected slot
  through the existing `EchoSimulatorSession` identity/revision/history model.
- Candidate identity, assigned Sonata and legal primary main-stat pool are canonical.
  Creating an eligible Rank-5 +0 candidate spends one session Echo, without modeling
  farming or main-stat acquisition probability. Each user click rolls one checkpoint
  using `VerifiedWuwaEchoRuntime` and records the actual observed card.
- The session snapshots the existing shared Resource Inventory. Saved inputs remain
  shared and editable; simulated spending never writes them. Changed saved inputs
  take effect on a fresh session/reset. No second persistent inventory exists.
- Each checkpoint funds exact whole Tubes, carries EXP per candidate, tunes using
  the canonical exact resource engine and commits RNG, inventory and history together.
  Failed funding, invalid RNG and stale actions leave the session unchanged. Tube
  receipts retain gross spending, cap returns, carry and loss; UI shows whole Tube
  counts, Tuners and Echoes, with remaining detached balances.
- Slot changes retain candidates and their individual carry. Reset, Current, Character
  selection, exit and reload discard the sandbox. Reset snapshots the current saved
  budget. Current equipment and saved balances remain unchanged.

Candidates remain unequipped. Inspection shows their actual +0/+5/+10/+15/+20/+25
snapshots. No acceptance, rejection, refunds, automatic repeat search or Full Set
execution is connected. Trash Piles remain empty. Gate/Hard/Flex edits use existing
validated settings operations and persistence; they do not control manual rolling.
Conditional ER Target, Expected, DPS and economic decisions remain Pending.

Only candidate creation controls, inspection access and truthful status/material
text extend the approved presentation. Layout, card structure, carousel motion,
side-panel priority and desktop dimensions remain from PR #292.

## Future account inventory requirement

Existing account Characters and equipped Echo/Weapon records remain authoritative.
The current application does not provide a general account-owned item-instance
inventory with stable ownership IDs for unequipped Echoes/Weapons. A future Inventory
page must establish that canonical model and reuse the existing Character/equipment
and Resource Inventory owners. This milestone creates neither that model nor a UI
for it. Sandbox candidates must never be promoted to account-owned instances
implicitly.

## Verification

`test/echoManualWorkshop.test.ts` covers canonical runtime parity, real history,
exact ledgers/carry/cap returns, finite and unlimited budgets, insufficient funding,
invalid RNG, stale actions and nested/slot/Character isolation. The existing session,
resource-engine and persistence suites remain applicable.

`scripts/verify-echo-workshop.mjs` exercises the actual source and strict built
application in Chromium with pointer/keyboard controls at 1440×900, 1920×1080 and
2560×1440. It verifies selection, candidate creation, all checkpoints, history,
budget depletion/failure, unchanged real equipment/inventory, transitions/reset/reload,
Pending boundaries and geometry. It produces no screenshots or recordings.
FULL Verify includes both entrypoints. Its optional `capture_media=false` dispatch
input suppresses only image capture/upload; all behavioral, source, build and
browser assertions still execute.
