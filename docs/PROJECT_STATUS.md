# Bellibing Simulator — Current Project Status

This document is the current implementation and roadmap checkpoint for Bellibing Simulator. Detailed pre-2026-08-29 chronology lives in [`PROJECT_STATUS_HISTORY_2026-08-29.md`](PROJECT_STATUS_HISTORY_2026-08-29.md) and Git history.

`FOUNDATION` means architecture exists and is tested but supported-content coverage is incomplete. `COMPLETE` means the layer has the data/behavior required for its supported scope with no known blocking gap. `BLOCKED` means a known gap prevents that layer from being called complete.

Bellibing has **not** passed the full Pre-DPS Completeness Gate. Broad roster-wide Character DPS remains blocked. Narrow vertical slices may become `DPS_READY` only after their exact source, execution and freeze requirements close.

## Current baseline

Last fully verified deployed main before this checkpoint: `4f7ca1701ad85c74c421d417940a62e066da6215` after merged PR #132.

Live registry-derived readiness remains:

- **43 `PROFILE_COMPLETE_PENDING_FREEZE`**;
- **3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`**;
- **9 `PROFILE_SOURCE_PENDING`**;
- **2 `DPS_READY`** — Augusta and Ciaccona.

PR #129 integrated the reviewer-approved 2026-08-31 horizontal tranche into the canonical profile registries. Six canonical VERIFIED packages were added for **Chixia, Encore, Lucilla, Rover (Havoc), Yangyang and Mornye**. All six rotations remain `SOURCE_SEQUENCE_ONLY`; no execution timing, uptime or DPS freeze was inferred.

PR #131 changed the public product entry without changing readiness: the root is now a registry-driven Alpha shell built from canonical profile truth. It also added one exact Rank-5 Nightmare: Thundering Mephis active Echo attack fact. Calcharo was explicitly **not** promoted: the unresolved Void Thunder stack semantics remain fail-closed. PR #132 then aligned the GitHub Pages smoke contract with that new root and live-verified Alpha, Echo Lab and Roll Assist.

The same source tranche keeps **Baizhi, Brant, Jianxin, Phoebe, Verina and Yuanwu** parked on their previously reviewed explicit semantic blockers. Do not re-research these six without new evidence. Mornye's separately reviewed node-level intrinsic DEF resolution is canonical at **15.20%**, so there is no remaining released intrinsic DPS blocker.

The current `PROFILE_SOURCE_PENDING` queue is exactly:

- semantic blockers: **Baizhi, Brant, Jianxin, Phoebe, Verina, Yuanwu**;
- raw/static preflight blockers: **Qingxiao, Rover (Electro), Suisui** — each still has unresolved `maxEnergy` source truth.

Canonical backward-impact / execution inventory remains:

- **18 backward-impact reviews**;
- **18 reviewed canonical profiles**;
- **16 profiles with pending execution dependencies**;
- **72 exact pending execution edges**.

The semantic execution partition remains **30 UNREVIEWED / 1 SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING / 11 PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE / 5 BLOCKED_SOURCE_CONFLICT / 9 BLOCKED_SOURCE_SEMANTICS / 16 PROFILE_SPECIFIC_EXECUTION**, leaving **31 actionable shared edges**. Queue order is only a throughput hint; the active strategy is shortest verified path to new `DPS_READY` plus reusable overlap.

## Architecture boundary

Preserve the separation between raw game/source data, Character Mechanics, Weapon/Echo/Sonata effects, composable profiles/recommendations, execution/combat-DPS logic and UI. The old V9.15 spreadsheet is a historical oracle only when explicitly needed. `SOURCE_SEQUENCE_ONLY` never becomes executable by assumption.

The Alpha UI is a projection of canonical registries, not a second profile database. Frontend selection must never invent a Character, mode, team, weapon, Echo shell, timing, roll policy or DPS claim that the underlying registries do not support.

## Source coverage

### Characters

- 60 Character records; 57 `RELEASED`.
- Raw/static blockers: Qingxiao `maxEnergy`, Rover (Electro) `maxEnergy`, Suisui `maxEnergy`.
- Intrinsic DPS blockers: **none**.
- Character Mechanics source review: **54 VERIFIED / 3 SOURCE_BLOCKED / 1866 canonical facts**.
- Mechanics blockers remain Buling, Danjin and Xiangli Yao.

### Weapons

- **121 / 121 released Weapons** have source-audited effect coverage across **236 effect rows**.
- Conditional trigger/state/stack/target semantics remain separate execution concerns; source text never implies automatic uptime.

### Echo / Sonata

- **181 / 181 released Echoes** verified current for stable identity/COST/Sonata membership.
- **34 / 34 released Sonata sets** verified current.
- Sonata Effect review: **62 / 62 activation tuples / 86 source-backed rows**.
- **181 / 181 released Echo skills** are source-reviewed.
- Echo non-damage effect coverage remains **63 modeled rows across 37 Echoes** with specialized adapter boundaries explicit.
- Exact Rank-5 Echo attack catalog: **5 attack profiles / 6 attack facts**. Nightmare: Thundering Mephis is exact at Rank 5 as one 405% ATK Electro active hit with 25-second cooldown; storing that attack fact does not imply a Calcharo rotation closure.

## Composable profiles

Independent Weapon Recommendation, Echo Loadout, Stat Target, Team, Rotation and Character Preset catalogs are live and cross-validated. The candidate/profile pipeline remains fail closed: extraction/staging cannot approve semantic truth, `SOURCE_SEQUENCE_ONLY` never implies timing or uptime, readiness is registry-derived, and ambiguous source truth stays pending instead of receiving defaults.

Two deterministic horizontal tranches are reproducible in-repo:

- 2026-08-30: 13 reviewer-approved canonical packages, 11 parked rows;
- 2026-08-31: 6 reviewer-approved canonical packages, 6 parked rows, materialized as deterministic split modules.

`audit:profile-horizontal-green-lane` regenerates both tranches. Committed source-subset JSON must remain structurally identical to regeneration and canonical TypeScript must remain byte-identical. The original Profile Source Extract checkpoint is pinned to workflow run `33327547829`, head `dd13cbdbd4e1010179b2004b0d4baf650651ea6e`, artifact `9736802750`, SHA256 `04663fefac62141f6b0d82b15d28d32a3e77aedfad4d89d7cc46830ca8ef365b`.

## Shared execution primitives and exact dependency closure

`src/data/profileExecutionClosures20260830.ts` removes an exact pending ID only when the expected review/preset/ID still exists. Reapplying or drifting a closure throws.

Available source-safe primitives include:

- `echo-character-restriction-v1` — static Fleurdelys extra Aero applicability for canonical Cartethyia / Rover Aero only;
- `echo-active-damage-v1` — exact source-backed active Echo damage without inventing cast timing;
- `weapon-cast-timed-self-window-v1` — explicit wielder cast event → timed SELF weapon window;
- `incoming-transfer-state-v1` — explicit outgoing/incoming transfer state under thin source-locked Echo/Sonata adapters;
- `sonata-cast-timed-self-window-v1` — current Molten Rift 5-piece Skill-cast → 15s SELF +30% Fusion DMG contract;
- shared Aero Erosion target-state execution used by the Ciaccona closure.

### Narrow DPS-ready fixtures

- Augusta — `augusta-standard` / `AUGUSTA_STD_V1`;
- Ciaccona — `ciaccona-cartethyia-aero` / `CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1`.

Freeze approval requires canonical verified profile truth, current backward-impact review, zero pending IDs, independently tested execution, `ENGINE_MODELED` rotation, verified BuildContext bridge and the normal repository verification surface.

## Existing execution blockers

Keep these fail-closed until stronger source or an explicitly approved measurement method changes the evidence:

- **BUG-008 — Impermanence Heron transfer:** `BLOCKED_SOURCE_CONFLICT`; hit-armed versus cancel/cast-armed evidence conflicts.
- **BUG-009 — Stringmaster / Rime-Draped Sprouts skill-stack lifetime:** `BLOCKED_SOURCE_SEMANTICS`; stack refresh/expiry policy is unresolved.
- **BUG-010 — Fallacy profile cast variant:** `BLOCKED_SOURCE_SEMANTICS`; supported rotations do not identify normal/tap versus hold/release execution.
- **BUG-011 — Defier's Thorn `DT-DEF`:** `BLOCKED_SOURCE_SEMANTICS`; timing grammar remains ambiguous. Cartethyia stays non-DPS-ready.
- **BUG-012 — Rover (Aero) exact support execution:** `BLOCKED_SOURCE_SEMANTICS`; exact total rotation duration, BPP-SKILL overlap and one fixed optional-Skyfall path remain unresolved.
- **BUG-013 — Blazing Brilliance Searing Feather at-cap lifecycle:** `BLOCKED_SOURCE_SEMANTICS`; source does not define what qualifying +1/+5 events at 14 stacks do to the 12-second removal timer.
- **BUG-014 — Changli Standard Rotation denominator:** `BLOCKED_SOURCE_SEMANTICS`; source gives a 1.37-second variant delta but no exact total duration.

Calcharo is additionally parked as a current execution candidate rather than receiving a new false closure: the source-facing Void Thunder 5-piece text does not currently prove enough stack-family semantics to authorize an executable peak-stack model.

Carlotta has also been inspected and is not a truthful quick `DPS_READY` closure. Her canonical review still has five pending IDs; the current source sequence has no exact total rotation duration/DPS denominator, and Sentry Construct has no exact Rank-5 attack profile in Bellibing's Echo attack catalog. The Last Dance can reuse the existing cast-window primitive only after a real timeline exists. No blocked dependency is implemented by assumption.

## Echo Core / Alpha / Echo Lab / Roll Assist

- Echo Core: complete for eligible-candidate tuning.
- Public root: registry-driven **Alpha** shell.
- Alpha flow exposes **Character → mode → recommended starting build → Echoes → Analyze** from canonical registry truth.
- `analysisReady` is fail-closed: only `DPS_READY` + `ENGINE_MODELED` profiles can claim executable analysis. `SOURCE_SEQUENCE_ONLY` profiles can expose source-backed build guidance but not fabricated timing or DPS.
- Profile-aware Roll Assist routing is a separate verified-policy capability, not a consequence of DPS readiness. The current binding is **only** `augusta-standard` → `AUGUSTA_RECOMMENDED_V915`, and the binding asserts that the canonical 4/3/3/1/1 CRIT/Electro/Electro/ATK/ATK Echo layout still matches the roll policy.
- Ciaccona remains `DPS_READY` but deliberately has no Roll Assist binding because no independently verified checkpoint policy exists for its canonical Echo shell.
- Unsupported profile-aware Roll Assist URLs fail closed and never silently reuse Augusta policy. Direct `/roll-assistant.html` remains Augusta-compatible for backward compatibility.
- Echo Lab remains the mechanical/debug oracle at `/echo-lab.html`.
- Roll policy: foundation; whole-build DPS-aware stopping remains later scope.
- BUG-001 remains fixed/live-verified with permanent Chrome regression.
- BUG-002 remains the known +25 best-so-far/equipment lifecycle gap.

## Alpha product direction

The product is no longer dashboard-first. The current root establishes the registry-driven Alpha shell and the Echo step can route into a verified canonical Roll Assist policy when one actually exists.

The UI should continue asking one question / presenting one decision at a time. Next product work should add owned-Echo input/profile-aware analysis without creating a phantom build. DPS claims continue to require genuinely executable profile truth, and Roll Assist claims require their own verified policy binding.

## Verification contract

A final PR head intended for merge must pass source/raw/profile audits, Profile × Adapter/readiness audits, full Node tests, strict web build, real Chrome Alpha + Roll Assist regression, diff/whitespace checks, Verify artifact packaging and Export artifact workflow. Post-merge main is rechecked; UI/live claims require real browser/live verification.

PR #131 final exact head `934044a7ece9df65718056de5fad0e1fb78118e5` passed **Verify #608** and **Export #580**, including **556 tests**, strict web build and real Chrome Alpha + Roll Assist regression. PR #132 then fixed the changed root smoke contract; merged main `4f7ca1701ad85c74c421d417940a62e066da6215` passed **Verify #613**, **Export #585** and **Deploy #124**, including live Alpha `/`, Echo Lab `/echo-lab.html`, Roll Assist `/roll-assistant.html` and real-Chrome Alpha + Roll Assist paths.

## Recent completed checkpoints

- PR #121 — source-safe Fleurdelys character restriction.
- PR #123 — shared Aero Erosion state, Ciaccona executable rotation/freeze, Cartethyia reduced to two genuine blockers.
- PR #124 — exact Fleurdelys Rank-5 attack data, reusable `echo-active-damage-v1`, Rover source-only closure review and registry-derived execution-doc sync.
- PR #125 — Profile Source Import Accelerator exact green extraction checkpoint.
- PR #126 — 13 canonical horizontal VERIFIED packages; 11 genuine ambiguities parked; readiness moved to 37/3/15/2.
- PR #128 — Changli semantic checkpoint; Molten Rift primitive added, BUG-013/014 parked, no false closure.
- PR #129 — six additional canonical VERIFIED horizontal packages integrated; six semantic rows remain parked; Mornye intrinsic DEF blocker closed; readiness moved to 43/3/9/2.
- PR #131 — registry-driven Alpha root, Echo Lab split to debug route, exact Nightmare: Thundering Mephis attack fact, real-Chrome Alpha regression; readiness unchanged at 43/3/9/2 and Calcharo deliberately remains non-DPS-ready.
- **PR #132 — Alpha/Echo Lab/Roll Assist live-smoke contract aligned with the new public root and verified on deployed main.**

## Next work

1. Work from the **9-row `PROFILE_SOURCE_PENDING` backlog**, never the old 15.
2. Do **not** re-research Baizhi, Brant, Jianxin, Phoebe, Verina or Yuanwu without new evidence. Keep their explicit semantic blockers intact.
3. Inspect the three real raw/static blockers — Qingxiao, Rover (Electro), Suisui `maxEnergy` — horizontally. Close only if stronger current evidence resolves the source truth; otherwise keep them pending explicitly.
4. Continue the shortest `DPS_READY` search only where a real source/evidence change can close the missing denominator, Echo attack or semantic blocker. Carlotta is parked on missing exact denominator + Sentry attack data; Calcharo remains parked on Void Thunder semantics; BUG-008/009/010/011/012/013/014 stay fail-closed.
5. Deepen the Alpha path with owned-Echo input and verified profile-aware routing. Add new Roll Assist bindings only when a real checkpoint policy is independently verified against the canonical Echo layout.
6. Never fabricate teams, defaults, ER requirements, rotations, mechanics, trigger uptime, stack-refresh policy, roll policies or timestamps.
