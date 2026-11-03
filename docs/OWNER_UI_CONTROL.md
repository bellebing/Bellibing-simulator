# Owner UI Lock & One-PR Work Contract — Bellibing Simulator

**Status: binding owner process decision, 2026-11-03. Applies to ALL Codex, ChatGPT, local and cloud contributors from now on.** Read through `AGENTS.md` and `docs/DEVELOPMENT_PROCESS.md`. This contract overrides earlier permissions to autonomously design or alter *any visible production UI*, even when a feature task, UX fix or source PR previously included that UI. It does not waive source, account, security or MERGE verification.

## 0. One workspace, one active integration PR

- **Active integration PR: #365** `recovery/one-pr-build-team-improve-20261103`, based on public main. Continue this exact branch and PR; **no parallel feature PRs or resetting/rebuilding the project**. Do not merge or deploy without explicit owner GO.
- **Preferred work environment: one local Git worktree/checkout** with Codex CLI/IDE and the exact existing PR branch, reused across sessions. GitHub stores all committed checkpoints; no critical work may live only in one temporary local/cloud task. The owner reviews via **one actual GitHack preview link** to this PR, not downloaded ZIPs. Cloud is allowed when needed but must continue the same branch, never silently create a separate PR or divergent source of truth.
- The development worker must state whether the current branch head is identical to remote PR head, preserve other contributors' work and never force-push/rebase/close source PRs automatically.
- This is a rule for the **current #365 integration workstream**, not a ban on normal future PRs *after* this PR is explicitly completed and merged.

## 1. HARD STOP: absolutely no unapproved visible UI changes

An AI worker **MUST NOT** invent, add, move, remove, restyle or change the behavior of any product-visible: label, helper text, placeholder, button, icon, card, modal, dialog, panel, expander, flow, navigation, picker, spacing, layout, typography, color, animation, empty/error state, tooltip, scanner review screen or responsive breakpoint.

**Before touching a visible production UI element:**
1. Identify the **smallest change**, named screen, exact current component/source, reference behavior, why necessary and the resulting visible difference. Search for an already approved reusable component first.
2. Supply an **immediately viewable, accurate visual proposal** to the owner: an actual image in chat or a one-click browser image/GitHack *isolated proposal*. Mark the changed pixels/areas and show BEFORE and AFTER. Screenshots must be real, source-tagged; a conceptual static mock must not be represented as functional UI. A ZIP, local workspace path, empty screenshot, hidden image, or generic PR link is NOT the requested visual proposal.
3. For **every introduced/changed string visible in UI**, quote exact copy and give a user-purpose reason. If it does not prevent a real ambiguity or enable a real action, **delete it from the design**. Example: `No saved teams` is a valid empty-state label. `Save three characters in Build to create a team` is redundant game-rule narration and **is forbidden**. Native `Choose file / No file chosen` cruft must not be exposed as the primary account/backup UI.
4. Obtain **explicit owner approval of that exact proposed difference**. Silence, an older approval of a *different* UI, an AI conclusion, a green test or a PR text comment from the AI is NOT approval.
5. Only then implement the **approved change alone** in the existing PR; record its decision/reference in the PR. Show the real implemented AFTER visually for a second owner check. A change that does not match approved visual stops for correction. **Owner GO to a proposal is not GO to merge or deploy.**

If any of steps 1–4 is missing: **STOP THE UI EDIT** and report `⛔ OWNER UI APPROVAL REQUIRED`. Continue only unrelated, authorized non-visual data/logic work. Do not "improve" copy, create fallback UX, introduce temporary debug panels or use a modal as an easy technical workaround.

### Usability/design defaults that are already settled

- **Minimal screen text**: headings, short state labels, action names and necessary errors only. No onboarding lectures, duplicated game rules, post-button explanations, developer metadata, provenance/debug information or source-policy paragraphs in normal UI. Documentation and advanced provenance live off the main screen.
- **NO new modal/pop-up driven editing in Build**; use the existing **inline expandable card/panel** pattern. Any exceptional destructive confirmation requires prior explicit owner review. Do not replace an unwanted popup merely with a more closable popup.
- Reuse existing **approved** controls; specifically use the working Character carousel from Improve rather than a new one in Build. The owner has superseded the earlier S-level-click decision: **visible compact Sequence selection on the left alongside Stats, Weapon and Skills**, using existing editor and source-supported S levels; no extra S badge menu over the Character.
- Keep **one coherent account/save action area**: unowned → `Add to Account`; owned unchanged → `On Account`; owned modified → `Update` (owner's requested intent), not a second white `Save Build` elsewhere.
- Inventory uses approved #361 equipment grid/inspector and fonts, including a helpful actual empty inventory state; JSON recovery/migration is a secondary technical flow, not the normal inventory landing page.
- Real Character Build → compact inline Import/drop/correction → explicit save → SAME Build; do not create a second Character Builder or full import website. Preserve true OCR from #362/#360 and safety against silent data loss.
- Preserve the prior compact **Improve Current/Candidate/five Echo slots + Team DPS** and independent Echo Sandbox; the owner rejected the oversized replacement Improve view and fake Demo workspaces. #361 Build, My Teams and Inventory are visual references **only**, not finished functional state; DPS unavailable is Pending, never fabricated.
- Keep saved/account/existing legacy data **non-destructively**, and do not mask a failing Build→Inventory→Improve journey with a blank page or workaround that tells the user to reset the browser.

## 2. Work in small vertical slices, no cheese-hill merges

For #365, the **first blocker** is `Build / existing legacy account → safe reviewed migration as needed → Add/Update/Save → Inventory owned state → Improve Current + five equipped Echo cards → My Teams saved references`. This chain must work with a genuinely existing legacy browser state and with a clean new account. Do not delete, overwrite or silently transform data. Distinguish an honestly unequipped Echo slot from a broken account binding.

After **one** coherent, behaviorally testable correction:
1. Run focused tests + local real-browser reproduction for affected state. No repeated broad FULL, hourly polling, GitHack waiting loops or repeated documentation updates.
2. If any visible appearance differs from approved reference, return to **section 1 first**. Do not commit an unsolicited redesign on the theory it can be reviewed later.
3. Push to same Draft PR #365; give exact SHA and **one click-to-open GitHack review URL**. A static GitHack preview may legitimately lack private hosted execution/OCR backend: clearly distinguish this from working product code; never use synthetic success screenshots.
4. Owner visually inspects; capture owner feedback as a short acceptance/bug list. Continue only authorized changes. **FULL/UI Lab/private paired gates are for the final owner-accepted candidate** (or specific demonstrated high risk); they are never replaced or weakened.

No new UI controls or texts solely to ease tests, no duplicate layouts and no hidden green-test claims. Update `BUG-054` until both real functionality and owner visual confirmation are supported.

## 3. Mandatory new-chat handoff (first read, zero user re-explanation)

Every Codex or ChatGPT session supporting this work should:
1. Read `AGENTS.md` → `docs/DEVELOPMENT_PROCESS.md` → **this file**.
2. Read GitHub **current main + Draft #365 head and open issues/comments**, `docs/PROJECT_STATUS.md`, then Bellibing Echo Tool — AI Handoff when available. Source/PR code is implementation truth; the owner approval contract is binding for presentation. Do not treat past PR summaries as current implemented behavior.
3. Identify the most recent owner-accepted UI reference versus currently rejected #365 GitHack visuals. Explicit owner user messages override stale UI decisions.
4. State in **at most five short lines**: current PR+SHA, current smallest blocker, preserved approved UI boundaries, pending owner decision, next safe step. **Do not ask the user to repeat existing decisions.**
5. One PR; one coherent slice; no unrelated work, unannounced UI deltas, extra worktree/PR creation, backend activation, CI polling or merge without the relevant explicit authorization.

## 4. Actual enforcement versus promises

- **Process lock exists when this document and the entrypoint links are committed.** This makes AI behavior contractually clear, but **documentation alone cannot technically prevent an agent with write access from changing HTML/CSS/JS**.
- **Technical red-light gate: NOT YET IMPLEMENTED.** The next independent infrastructure task is a FAIL-CLOSED owner UI-diff gate in existing FAST/PR checks, with owner-authenticated approvals for proposed exact screen/copy differences, safe protected approval records/branch-review settings, and explicit changed-region screenshot evidence. Do **not** claim this guard or branch protection is active until implemented and tested. Do not weaken or bypass current CI to implement it.
- Unapproved visual change, missing screenshot/owner approval, or an implementation that fails the approved screenshot means **NOT ACCEPTED** even if CI passes.

**One-line operating rule:** `NO OWNER-APPROVED IMAGE/EXACT COPY → NO VISIBLE UI EDIT.`
