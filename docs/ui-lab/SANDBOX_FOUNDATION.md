# Standalone Sandbox foundation — S1

The new standalone review entrypoint is `v1.1/index.html?sandbox=true&settings=expanded`. The original Lab entrypoint and `?demonstration=true` remain recoverable comparison/regression surfaces. This is a separate Draft candidate on #311, not production or an account connector. The [S1–S6 roadmap](../SANDBOX_SIMULATOR_ROADMAP.md) owns program order; S2 is not authorized by S1.

## Build and state contract

`sandbox-state.js` owns an in-memory workspace and one Character-owned `SANDBOX_BUILD` per released identity. The build carries schema/compiler version, random session-local ID, explicit Character/preset/source context, immutable source bindings, source baseline and Weapon identity/revision. Character changes advance a workspace context revision, including away-and-back. Resources use one separate canonical finite/unlimited memory inventory and revision, shared across Sandbox Characters and panel modes. Nothing reads/imports account builds or writes localStorage/IndexedDB/account Settings/inventory.

The standardized baseline is explicitly a Bellibing convention: Lv90 Character and Weapon, S0, R1, max canonical five skill roles and unlocked canonical permanent nodes. It is not a claim that a player owns these investments. Existing canonical Forte normalization supplies 57 presentation-backed trees. Hsin/Jingran use the original reviewed release tree and checked max-skill roles; their art/tree **presentation** remains Pending, independently of data/configuration validity. No skill coefficient or combat effect is inferred.

Configured templates contain only canonical Echo/Cost/Rank/Main/Sonata. They are not +25 cards, and contain no rolled substats. Selected, Configured, Active and actual Simulated Current are separate. All five defaults appear immediately. Edit Echo reuses the existing memory-hosted Workshop; saved manual choices take precedence. Use Echo is the only template commit, Cancel/Escape leave the stored slot untouched, and opening/filters never equip an account Echo. Reset clears results/history and advances session revision while retaining manual configuration, activation, Settings and resources.

`readContext()` reads actual owners synchronously. Character, mode, Weapon, template identity/Cost/Main/Sonata, Settings, inventory, selection, active mask and reset/session revisions are captured together. Sandbox result tokens compare complete owner values and monotonic counters, not a decorative digest. A detected stale token is permanently invalidated. A future S2 transport must check freshness at request preparation, dispatch/cached retries, after asynchronous work and before rendering. S1 creates no results and offers no provider-output injection through the UI.

The baseline Weapon row reuses the existing artwork/typography and exposes a compact native selector of released same-type canonical Weapons. It edits only this Character's Sandbox Weapon at the fixed S1 Lv90/R1 baseline. No effects, rolls or account writes occur. Current mode is the empty **Sandbox Current**, not real equipment; Character Stats are explicitly Pending rather than the Lab's old illustrative account numbers. Simulation Stats preserves canonical recommendation references and existing Pending semantics, not fabricated runs.

## Source policy and coverage

The [machine matrix](v1.1/modules/sandbox-defaults.json) and [human matrix](SANDBOX_COVERAGE.md) have 59 source-complete **configuration** rows: 59 Weapon choices and 59 legal five-template shells. This does not promote any row to private execution, DPR or DPS readiness. Every row retains source URLs/revisions/hashes, original Main/Weapon/set alternatives, exact source-selected conditions, rejected shell reasons, identity basis, piece composition, source-reviewed activation sections and separate Pending dimensions.

Dedicated verified signatures are `SIGNATURE`; no-signature Characters use a `REVIEWED_ALTERNATIVE`. Both are explicitly `SANDBOX_STANDARD`. Source order is a deterministic convention, not a fabricated provider ranking. Canonical source-ranked Main tiers precede tied first-written alternatives. Augusta and Cartethyia retain their existing exact reviewed shells. Remaining Characters use their own first source-primary shell that has a complete compatible configuration, retaining its actual team/role conditions as an explicit **reference context**, not an executed/optimal team.

Canonical highest piece thresholds determine the selected shell convention. Three-piece shells use a source-listed two-piece companion. Lucy's one-piece source set uses two distinct source-listed two-piece companions. Canonical unused filler identities are compatibility examples, not guide species recommendations. For source main Echoes that have Cost 3 (Rover Electro, Suisui, Luuk Herssen), the source Cost-3/Main pair moves to slot 1 and the original Cost-4/Main pair takes its vacated position. The five source pairs are preserved, never assigning a Cost-4-only Main to a Cost-3 Echo.

`sandboxSonata.mjs` separates legal equipment from set eligibility. Original count/Cost validation remains unchanged. The reviewed [Echo system rule](https://www.prydwen.gg/wuthering-waves/guides/echoes-explained) and [Sonata reference](https://wutheringwaves.fandom.com/wiki/Sonata) establish that repeat copies of the same species do not add set pieces; Phantom artwork is not a new species. Generated defaults use five globally distinct canonical identities. The checker counts distinct species per assigned Sonata against canonical thresholds and reports **eligible piece bonuses**, never executes Shield/Intro/Heal/team/timing effects. Invalid membership rejects. Meeting a threshold is independent of modeled trigger/uptime/effect readiness.

The left Sonata selector and its stale compact Crown image are absent in Sandbox only. The legacy `sonataPool` field is retained as an empty compatibility field; it neither chooses a template nor filters Workshop. Existing Workshop `sourceSetIds` prioritizes the selected Character's source sets plus the saved custom Sonata; All makes all released valid sets discoverable. Filter changes alone never commit a new Sonata. No canonical Sonata mechanic or production persistence field is removed.

## Settings, costs and S2 boundary

Augusta initializes its canonical user-approved Hard/four-Flex intent. Other Characters keep explicitly unconfigured Customize requirements; reviewed Echo requirements remain Pending (BUG-042), rather than deriving invented requirements from guide priorities. Edits remain Character-owned in memory. Baseline/source-template validity does not imply a configured executable economic goal.

`sandboxConfigurationBridge.mjs` reuses #311's canonical Settings adapter and compiler with an explicit detached Sandbox host/v3 intent envelope and canonical neutral session. It requires no production Build ID, account record or persisted account Settings. It validates baseline/source version, released Character/Weapon type and own revisions before handoff. It does **not** change `ACCOUNT_BUILD`/production compiler requirements. Only Augusta's exact standard source-to-private-preset mapping is currently proven; other 58 valid configurations return an explicit mapping Pending, not an invented mode binding. The shared resource ledger/real execution remain disconnected.

S2 can begin with an isolated local Augusta/default host using that versioned input, existing reviewed private transport and safe DTO. Before any browser/guest ingress it needs server-owned isolated sessions, bounded work/rates/budgets, idempotency, fresh authoritative revisions, atomic asynchronous transitions, stale-result rejection, safe trace/JSON export, reset/abort/reconnect and reviewed public retirement/mirror handling. No endpoint, private policy, account integration or execution is activated in S1. See the [cost contract](SANDBOX_RESOURCE_COST.md) and preserved [production bridge plan](PRODUCTION_CONFIGURATION_BRIDGE.md).

## DPS concept and verification

The four-column DPS **concept** is directly below Character Stats: Augusta / Iuno / Shorekeeper / Team Total, with a subtle gold final column. All values are `—`, explicitly Concept/Pending. It has no graph, calculation or impact on Character Stats. Its future input shape names team, contributions, total, unit, window, provider/version/status and source context; numeric outputs are deliberately not accepted as verified by S1. S4 must validate that total and attribution belong to the same team run; independent Character sums are insufficient.

Reproduce with Node 22.18+ or 24:

```sh
node --experimental-strip-types --test test/sandboxFoundation.test.mjs test/simulationConfigurationBridge.test.mjs docs/ui-lab/tools/configuration.test.mjs docs/ui-lab/tools/state.test.mjs
node docs/ui-lab/tools/export-sandbox.mjs --check
node docs/ui-lab/tools/verify-configuration-source.mjs
npm run build
UI_LAB_CHROME_PATH=/usr/bin/chromium node docs/ui-lab/tools/verify-sandbox-browser.mjs
python3 -m http.server 8000
# Open http://localhost:8000/docs/ui-lab/v1.1/index.html?sandbox=true&settings=expanded
```

The dedicated coverage gate fails if any released identity lacks five canonical templates, a source-supported compatible Weapon, baseline or eligible source composition. Other readiness dimensions are always checked separately. Browser tests exercise all 59 selections, all five Workshop prefills, manual Main commit/Cancel, independent activation, Weapon changes, resources/Unlimited, reset, Character isolation, mode changes, keyboard, four equal DPS columns and overflow at 1440/1920/2560. Existing Lab/production-contract regressions remain separate and must continue to pass. Exact head/check/preview evidence belongs in the Draft PR, not a second live status ledger here.
