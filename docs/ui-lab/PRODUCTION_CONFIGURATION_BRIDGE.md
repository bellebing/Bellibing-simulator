# Production configuration bridge — Phase 6B.1

The public host-side compiler translates source-valid UI selections into the existing version-1 private input contract. It never imports an evaluator, runs rolls, opens a route, writes equipment/settings/inventory, or claims a live account connection. The UI Lab remains a separate review environment on top of the Phase 6A.1 configuration/card/activation owners.

## What is actually bound

`src/simulationConfigurationBridge.mjs` separates **VALID_UI_CONFIGURATION**, **BOUND_TO_TRUSTED_HOST**, **PENDING_PRIVATE_PREFLIGHT** and **PRIVATE_CONTRACT_ACCEPTED**. The last state means an external private preflight accepted that exact detached configuration. It is not production ingress, DPR/DPS readiness or a completed simulation.

Canonical source revision is pinned separately from the UI/compiler revision. `tools/verify-configuration-source.mjs` verifies every original canonical source file against that immutable public revision (345 files currently). Newly added bridge/UI modules are not presented as part of the older pin. The private gameplay/source pin is not changed. Drift blocks this proof rather than silently retargeting the private engine.

The compiler validates released Character identity, five numbered slots, separate activation, canonical Echo/Cost/Rank/Main/Sonata, active total Cost, explicit minimum tiers, Hard/Flex uniqueness/count, Gate, workspace mode and canonical finite/unlimited inventory. Caller-supplied template hashes have no authority; canonical fields are validated again. Inactive templates remain stored but are excluded from selected run slots.

`adaptUiSettingsV3` uses `projectRecommendedImprovePolicy`, `createImprovePolicyState`, `updateImprovePolicyState` and `resolveImprovePolicyState`. Recommended must match that exact canonical resolution; Customize becomes a detached canonical override proposal. A proposal must match the actual host-owned persisted v3 Settings before an executable input can be prepared. Nothing auto-commits that proposal. The handoff serializes the allowlisted canonical Echo-settings proposal after proving effective equality with the real saved owner; it does not forward unknown saved fields or unrelated target/presentation sections. An unavailable/mismatched preset, migration, suspended source context or uncommitted UI edit remains Pending. Enabled ER constraints remain Pending because this adapter does not map them to an execution policy.

Augusta/default's **four** Flex choices come from the real canonical resolver: ATK%, Heavy Attack DMG, Energy Regen and Flat ATK. The resolved default is explicitly **USER_DEFINED / user-approved intent**, not newly verified provider Echo requirements. The functional Lab now initializes/restores this checked projection. Historical `?demonstration=true` fixtures retain their earlier illustrative two-row surface for baseline regression. Neither projection is a claim to be persisted account Settings.

## Production state: available data and exact missing owners

The existing account owner is the v34 `characters` / `drafts[Character name].build` model, persisted under its existing key. `src/productionBuildRecord.mjs` reads an owned Character's actual record without calling `draft()`, normalizing a missing record, creating IDs or writing storage. `window.bellibingLabConfiguration.productionEvidence()` exposes that read-only observation on demand. Absence, corruption, unowned Character or missing five-slot structure stays Pending; no Augusta or Lab build fallback occurs.

A successfully observed record is **not yet a trusted compiled production context**. The current owner has no explicit stable Build ID, selected production build-mode identity or coordinated monotonic Character/build/settings/inventory/session revision service. `updatedAt`, an Echo-set ID and a content hash do not substitute for those owners. The observation returns null IDs/revisions, so it cannot accidentally satisfy the compiler. UI Lab's illustrative Character Stats/equipment are never used as that production context.

A trusted future host supplies `readProductionContext()` with Character/Build/mode/preset identity, actual structured build, actual v3 envelope/shared inventory, canonical public Session and owned revision counters. The compiler verifies identities, preset/default-mode correspondence, canonical source compatibility, persisted Settings equality, inventory equality and public Session source/selection. It uses the existing canonical `startEchoSimulator` to detach non-Echo context and clear account Echo sets. Only allowlisted non-Echo fields enter the private input; real gear is retained only in the private host's binding evidence, not imported as simulated Current.

## Freshness and transport

`createSimulationConfigurationBridge({readUiContext, readProductionContext})` takes synchronous **trusted host readers**, not revision assertions from an HTTP request. `prepare()` captures both owners, resolves canonical state asynchronously, and rereads them before issuing an in-process lease. `assertCurrent()` and `guard()` compare complete fresh values as well as real counters on every use. Once detected stale, a lease never revives. A cloned/forged token has no registered ownership. Asynchronous preflight rereads owners after completion and returns only an allowlisted status; private diagnostics do not escape on errors.

The Lab's synchronous `readContext()` reads its actual configuration/settings/resource owners. Its new page context revision advances on Character and Current/Simulate changes, including away-and-back cycles. Existing configuration, selection, settings, shared inventory and reset/session counters remain separate. Browser verification checks the real controls, not only fabricated revision objects.

The host binding retains UI context/configuration/selection/settings/inventory/session revisions, production Character/build/settings/inventory/session revisions, IDs and complete owner snapshots. The existing private contract's four-field revision tuple is supplied without changing its shape; the public lease must additionally guard **every** private `prepare`/`dispatch`/cached retry and late presentation use. The existing private V1 public-Session/private-Session preconditions and idempotency remain in force. Do not bypass the outer lease simply because the older transport has fewer revision fields.

`guard()` is for the existing synchronous in-process boundary. It is not an atomic cross-process database transaction or an authentication mechanism. Remote async execution/resource commits require the server registry/CAS work below. No browser claim, opaque hash or token is an authorization proof.

## Verified readiness matrix

| Layer | Verified scope | Remaining boundary |
| --- | --- | --- |
| Phase 6A.1 configuration | Five Edit Echo controls, source defaults/custom provenance, activation, four distinct states retained | Existing 1 complete / 50 partial / 8 empty automatic-default coverage unchanged |
| Canonical Settings v3 | Source projection, four-Flex Augusta default, detached Recommended/Customize proposals, minimum tiers/Gate/count and actual-owner comparison | Lab is not a persisted production Settings owner; no automatic writes |
| Actual account build observation | Existing owned storage record read without mutation, detached from Lab examples | Explicit Build/mode IDs and coordinated revision owners absent |
| Versioned compiler | Canonical validation, source pin, source/preset/mode match, shared resource equality, selected active templates and detached five-empty-slot build | Trusted production host reader must be supplied; no automatic live Lab binding |
| Owner/revision protection | Fresh complete values + counters, stale leases, Character/build/mode/Settings/resources/activation/selection/reset and async races | Server-authored monotonic registry/cross-tab transaction semantics still needed |
| Augusta/default private preflight | Actual private compiler and owner constructor accept five templates and the canonical four Flex choices in a detached explicit test host | No live account, rolling, resource debit, browser response integration or production capability claim |
| Unsupported settings | Valid UI with higher Gate or higher canonical minimum returns private Pending; invalid tiers/identities reject before handoff | No Bellman/decision-policy expansion |
| Other Characters | Aalto keeps its own partial source configuration; its uncommitted/missing actual Settings are not replaced with Augusta. Hsin lacks a canonical selected preset and stays Pending | Aalto is not declared globally unsupported by the private engine merely because its initial defaults are partial |
| Private V1 transport | Actual offline ABORT, exact retry, duplicate presentation rejection and stale cached-request rejection, no spend/cards | HTTP/auth/authorization/session registration/streaming not implemented |
| Real equipment/resources | No real Current writes, no production storage writes, no account-budget debit | Any future writeback or spending authorization is separate scope |

## Reproduce

Public checks (Node 22+):

```sh
node --experimental-strip-types --test test/simulationConfigurationBridge.test.mjs docs/ui-lab/tools/configuration.test.mjs docs/ui-lab/tools/state.test.mjs
node docs/ui-lab/tools/export-production-settings.mjs --check
node docs/ui-lab/tools/verify-configuration-source.mjs
npm run build
```

The canonical source pin must be present locally (`git fetch --depth=1 origin 259f4881271b5cc84cec5bf2e7f085e6a106a8e3` when necessary). UI Lab Review performs source parity and preserves the existing Chromium matrix in addition to the new compiler tests. Serve the repository root to use the unchanged source-preview entrypoint. No private dependency enters public CI or browser assets.

The operator-run **real private** proof is separate from public CI:

```sh
node docs/ui-lab/tools/verify-private-configuration.mjs --adapter /absolute/private/path/approved-adapter.mjs
```

The external private adapter exposes an actual engine descriptor and a `preflight(input, {assertCurrent, readProductionContext})` facade over the already reviewed compiler, owner constructor and V1 transport. It returns only status, accepted public input fields, and the reviewed transport/presentation methods. Its implementation/private diagnostics stay outside this public repository. The local proof uses an explicitly named detached test host, canonical public state APIs, source-derived five templates/four Flex, and finite test resources (200 Echoes, 10,000 Tuners, 200 Premium Tubes and zero other Tube denominations). It is never bootstrapped as a real account. Public unit stubs test safe status projection only and are not evidence of private acceptance.

The proof checks exact Character/mode/Main/Sonata transfer, all five slots, inactive exclusion, four Flex, actual private Pending for higher Gate/minimum, V1 no-spend abort/idempotency, stale retries and unchanged real-build/test-inventory owners. It does not STEP/roll, run a decision experiment or claim an end-to-end live simulator.

## Phase 6B.2 — next safe integration steps

1. Establish real production Build/mode identities and a trusted canonical read API, retaining existing equipment/persistence ownership. Do not derive authority from a browser hash or timestamp.
2. Add server-owned authenticated account/session registration. Authorize Character/build/mode/settings access and bind each run to one user. CORS is not authentication.
3. Register canonical Settings v3 and shared inventory context with monotonic revision validation. Explicit UI edits must commit through their real owners before a new run configuration binds; preserve failed-write/recovery behavior.
4. Review a private HTTP ingress separately. Enforce narrow versioned request schemas, body/slot/seed limits, request rate/capacity bounds, bounded work and source/engine version compatibility before execution.
5. Carry the full outer owner binding plus existing private V1 preconditions. Recheck fresh trusted owners on every action and idempotent retry; reject stale UI context even when the private four-field tuple happens to match.
6. Scope idempotency by authenticated owner/run/request. Use atomic server CAS/transaction semantics for async actions and remote revision advancement; the current synchronous proof is not that service.
7. Keep run resources detached from real inventory, with explicit canonical receipts and shared run-budget semantics. Never infer an actual account debit from illustrative Materials Used or a preflight.
8. Render only the existing allowlisted V1 presentation DTO. Never send raw private CLI exports, private scores/policy/calibration or internal errors to the browser. JSON download must use a separately validated safe DTO/export schema.
9. Choose a reviewed read-only DTO renderer or fix the neutral public disposition/retirement gap before mutating public simulated history. Preserve physical identity, checkpoint history and replaced Current/Temporary Trash ownership; never touch real Current.
10. Define reset/abort/exit/Character/mode invalidation, canceled-generation disposal, timeout/reconnect/catch-up and export behavior. Old requests, late replies and cached results cannot resurrect a retired run.
11. Connect the actual browser through the authenticated host and verify real controls, stale races, unavailable capabilities, no-spend failures, budget isolation, safe export and recovery at source and built entrypoints.
12. Obtain separate approval for ingress/production activation. This Draft authorizes no endpoint, merge, deploy, new DPS/DPR model or Bellman policy.
