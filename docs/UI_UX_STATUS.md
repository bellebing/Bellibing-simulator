# Bellibing UI/UX status — design freedom

**Owner reset 2026-11-05:** The previous locked visual system is retired. All old mandatory positions, widths, carousel designs, form controls, copy, inline/modal preference, animations, motion timing and micro-approvals have no authority over new UI work. Historical content survives in Git history for inspiration, not as a rulebook.

## Functional surface boundaries (not visual instructions)

- **Build:** real Character drafts, equipment, Sequence/Skills and explicit account ownership.
- **Improve:** real owned Characters, Current/Candidate, five actual Echo slots and observed upgrade rolls. Unsupported DPS/advice stays Pending.
- **Sandbox:** independent hypothetical simulation; never mutates account equipment.
- **Inventory:** physical owned items, explicit transfers, recovery and saved-state integrity.
- **My Teams:** references to actual owned Characters and equipment; no invented scores.
- **Import:** real image evidence/OCR, user-reviewed corrections and explicit save.
- One canonical state owner. No screenshot-based fake controls, invented item artwork/values or data loss.

## What remains visually recognizable

ETNA display / Inter-system utility typography ([UI Typography](UI_TYPOGRAPHY.md)). All other presentation is open to redesign from the current user brief. Old v34, #361 and Improve screenshots remain **optional visual references**.

## QA

Validate real browser behavior at relevant sizes and preserve existing tests. Visual quality is judged on the result, not by counting old design-rule compliance. **BUG-054 remains open** until its real save/migration/Inventory/Improve issues are separately verified.
