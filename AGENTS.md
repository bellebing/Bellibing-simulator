# Bellibing workers

Read [Development Process v2](docs/DEVELOPMENT_PROCESS.md) before work; it is the canonical worker process.

Recover current truth in order: GitHub `main`/code and relevant PR/CI state → `docs/PROJECT_STATUS.md` → Bellibing Echo Tool — AI Handoff, when available → relevant domain/UI contracts. Current implementation beats stale documents and chat history; an unmerged candidate is separate from main. Read only what the task needs.

For the product owner's **complete goal and current milestone order**, read [Product Journey Roadmap](docs/PRODUCT_JOURNEY_ROADMAP.md). Read its [document authority audit](docs/ROADMAP_DOCUMENT_AUDIT.md) when an older roadmap, dated handoff, proposal or prompt appears to contradict it. The roadmap governs **what** to build, not permissions: Development Process v2 still governs **how** to work and stopping/merge rules. **First current milestone (2026-10-22) is consolidated DPS V1 integration/audit, then a source-proven attempt to achieve ≥1 actually executable team per each of 59 released selectable Characters using the shared public/private Draft pipeline. Pause new trio additions only during the initial stack audit; then resolve uncovered first-team gaps from verified sources, with a 59-row reproducible coverage/blocked matrix and no invented game facts. If verified source gaps prevent 59/59, request the owner's explicit scope decision. Then Build's first step is an isolated interactive concept for owner review**, not a silent production rewrite. Broad gameplay-qualified DPS is a later evidence goal and not required for all 59 Characters before proceeding.

## Clean-slate UI concept work

When the user explicitly commissions a **new, isolated visual concept** (such as a Bellibing UI Lab prototype):

- Start from a **blank, separate preview page and component/layout system**. Read the existing UI for accepted interactions, data meaning, assets and visual references, but **do not use its DOM, CSS layout, dimensions or composition as the design starting point**. Do not incrementally patch the current Improve workspace as a substitute for a fresh concept.
- Treat current product/UI contracts as authoritative for **existing production behavior and safety**, not as a mandate to visually reproduce that layout inside an isolated experiment. An experimental prototype does not supersede those contracts or authorize modifying the real app.
- Keep the prototype separate from real CharacterBuildState, persistence, Echo mechanics, resource spending, evaluator, private policy and deployment. Use genuine available assets and clearly identified demonstration state; never present invented Expected values or gameplay results as real.
- When the requested task includes design research, first inspect the user's examples and optionally relevant public design patterns. Extract layout, resizing and interaction principles rather than copying another site's branding. Ask only questions whose answers materially change the design. If the user requests a discovery review before implementation, **stop at that checkpoint**.
- Build real, reusable, interactive UI components, not screenshot-based substitutes. Avoid unrequested explanatory paragraphs, warnings and informational clutter. Review the prototype in a browser at the requested desktop widths, then deliver a Draft PR and preview for user visual approval.

These concept-specific freedoms change **presentation exploration only**. The Development Process v2, source-validity rules, current production behavior, review requirements and no-merge-without-authorization rule remain in force.
