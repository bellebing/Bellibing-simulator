# Bellibing workers

Read [Development Process v2](docs/DEVELOPMENT_PROCESS.md) before work; it is the canonical worker process.

Recover current truth in order: GitHub `main`/code and relevant PR/CI state → `docs/PROJECT_STATUS.md` → Bellibing Echo Tool — AI Handoff, when available → relevant domain/UI contracts. Current implementation beats stale documents and chat history; an unmerged candidate is separate from main. Read only what the task needs.


## 🔴 OWNER UI LOCK — mandatory for ALL production work

Read **[Owner UI Control](docs/OWNER_UI_CONTROL.md)** before any product-visible edit. The owner has forbidden autonomous UI design and copy. A visible string, button, placement, modal, panel, picker, font, layout, color, state or interaction **requires an owner-approved exact before/after visual proposal first**. No image/approval = `⛔ OWNER UI APPROVAL REQUIRED`; stop the UI edit. No extra instruction text in normal UI. Inline expanders, minimal copy and reuse of approved components are required. This overrides any generic autonomy or earlier concept-design allowance when the target is the real app.

**Active recovery integration stays in one Draft PR #365** (`recovery/one-pr-build-team-improve-20261103`). Do not create a second feature PR, change production UI by guesswork, or treat a test pass as owner acceptance. After each new chat, recover current PR SHA, main, PROJECT_STATUS, Bellibing Echo Tool AI Handoff and the latest owner visual decisions; never ask the owner to repeat them. Prefer one local checkout/worktree and GitHack for owner review. A hard CI approval gate is **planned but not yet installed**; do not claim this document alone blocks writes.

## Clean-slate UI concept work

When the user explicitly commissions a **new, isolated visual concept** (such as a Bellibing UI Lab prototype):

- Start from a **blank, separate preview page and component/layout system**. Read the existing UI for accepted interactions, data meaning, assets and visual references, but **do not use its DOM, CSS layout, dimensions or composition as the design starting point**. Do not incrementally patch the current Improve workspace as a substitute for a fresh concept.
- Treat current product/UI contracts as authoritative for **existing production behavior and safety**, not as a mandate to visually reproduce that layout inside an isolated experiment. An experimental prototype does not supersede those contracts or authorize modifying the real app.
- Keep the prototype separate from real CharacterBuildState, persistence, Echo mechanics, resource spending, evaluator, private policy and deployment. Use genuine available assets and clearly identified demonstration state; never present invented Expected values or gameplay results as real.
- When the requested task includes design research, first inspect the user's examples and optionally relevant public design patterns. Extract layout, resizing and interaction principles rather than copying another site's branding. Ask only questions whose answers materially change the design. If the user requests a discovery review before implementation, **stop at that checkpoint**.
- Build real, reusable, interactive UI components, not screenshot-based substitutes. Avoid unrequested explanatory paragraphs, warnings and informational clutter. Review the prototype in a browser at the requested desktop widths, then deliver a Draft PR and preview for user visual approval.

These concept-specific freedoms change **presentation exploration only**. The Development Process v2, source-validity rules, current production behavior, review requirements and no-merge-without-authorization rule remain in force.
