# Bellibing workers

Read [Development Process v2](docs/DEVELOPMENT_PROCESS.md) before work; it is the canonical worker process.

Recover current truth in order: GitHub `main`/code and relevant PR/CI state → `docs/PROJECT_STATUS.md` → Bellibing Echo Tool — AI Handoff, when available → relevant domain/UI contracts. Current implementation beats stale documents and chat history; an unmerged candidate is separate from main. Read only what the task needs.

Before any costly final CI, Ready/label transition or merge proposal, first review the implemented product against the owner's **whole** requested function, using source/diff inspection without tests when the owner asks for read-only review. CI is technical evidence after product-scope review, never a substitute for it. See Development Process v2 → PRODUCT ACCEPTANCE. Do not trigger duplicate Actions, polling or intermediate push/CI churn against the owner's instructions.

## Clean-slate UI concept work

When the user explicitly commissions a **new, isolated visual concept** (such as a Bellibing UI Lab prototype):

- Start from a **blank, separate preview page and component/layout system**. Read the existing UI for accepted interactions, data meaning, assets and visual references, but **do not use its DOM, CSS layout, dimensions or composition as the design starting point**. Do not incrementally patch the current Improve workspace as a substitute for a fresh concept.
- Treat current product/UI contracts as authoritative for **existing production behavior and safety**, not as a mandate to visually reproduce that layout inside an isolated experiment. An experimental prototype does not supersede those contracts or authorize modifying the real app.
- Keep the prototype separate from real CharacterBuildState, persistence, Echo mechanics, resource spending, evaluator, private policy and deployment. Use genuine available assets and clearly identified demonstration state; never present invented Expected values or gameplay results as real.
- When the requested task includes design research, first inspect the user's examples and optionally relevant public design patterns. Extract layout, resizing and interaction principles rather than copying another site's branding. Ask only questions whose answers materially change the design. If the user requests a discovery review before implementation, **stop at that checkpoint**.
- Build real, reusable, interactive UI components, not screenshot-based substitutes. Avoid unrequested explanatory paragraphs, warnings and informational clutter. Review the prototype in a browser at the requested desktop widths, then deliver a Draft PR and preview for user visual approval.

These concept-specific freedoms change **presentation exploration only**. The Development Process v2, source-validity rules, current production behavior, review requirements and no-merge-without-authorization rule remain in force.
