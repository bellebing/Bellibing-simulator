# Owner UI Control — Bellibing Simulator

The owner controls all product-visible appearance, copy and interaction, including the current PR. Preserve existing UI unless the exact difference is explicitly approved. This includes adding/removing/hiding controls, text, styling, layout, states and flows; bug fixes, component reuse and test needs are not exemptions.

## Propose once, then implement

For a change without exact approval:

1. Show an accurate **BEFORE / proposed AFTER**, marking changed areas, with exact added/changed/removed UI copy and interaction. Current screenshots must be real; label mockups as proposals. Use immediately viewable images or a directly openable isolated visual proposal, not prose, a ZIP or a generic PR link.
2. Ask separately: **UI DECISION — owner approval required: [change]**. Use the available question tool's separate card/thread, otherwise a standalone message. Ask whether the owner approves implementing that exact proposal, and wait. Never bury it in status, plans, PR text or general/merge approval. Silence, preselected answers, a general "continue" and green tests are not approval.
3. Implement only the approved difference and show the real result in the requested preview. Reuse an existing exact approval; do not ask again for technical details, files, tests, corrections to match the design, retries or new chats. If a new visible deviation is necessary, pause that deviation and request a new UI DECISION; unchanged approved work remains authorized. Showing the result checks conformance, not permission to implement again.

Missing exact visual approval: **⛔ OWNER UI APPROVAL REQUIRED**; pause the UI change and continue only independent authorized work. Suggestions/concepts are not implementation permission, and UI approval does not itself authorize publication, merge or deployment. The automatic owner UI-diff/authentication gate is **not installed**; never claim documentation technically blocks writes.

## Bellibing presentation

- Minimal, natural UI: necessary headings, actions, state labels and errors. No redundant helper paragraphs, game-rule narration, developer metadata or text explaining a button beside that button.
- Prefer existing **inline expandable cards/panels** for choices/editing, including equipment. No unnecessary popup/modal or second editor. Existing popup replacements are future UI work requiring an exact approved proposal; this rule does not authorize changing them now.
- Follow the affected surface's approved reference and existing styles/tokens. [Typography](UI_TYPOGRAPHY.md) owns ETNA display / Inter-system utility font guidance; [Layout & Motion](UI_LAYOUT_MOTION_CONTRACT.md) owns containment, spacing, responsive and motion rules. Read the relevant part, not every UI document. Do not substitute fonts or restyle the current PR to reconcile an old document: show conflicts to the owner.
- [UI/UX Status](UI_UX_STATUS.md#current-owner-decisions) holds product decisions and reusable patterns. Reuse accepted components/behavior without inventing variants; a recorded direction is not proof of implementation or permission for a new visible change.

## Isolated proposals

Keep proposals separate from product routes, CharacterBuildState, persistence, resource spending, mechanics, evaluator, private policy and deployment. Identify demo state; never fabricate real gameplay/Expected results. For an explicitly commissioned clean-slate concept, start a blank separate layout/component system, inspect supplied examples and build interactive components rather than screenshot substitutes. Stop at requested discovery checkpoints and review at requested widths. Concept approval does not authorize production integration; follow the same UI DECISION procedure and workspace rule.
