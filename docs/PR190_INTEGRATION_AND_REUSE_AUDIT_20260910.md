# Execution reuse — source and provider evidence boundary

This page retains the **public evidence and reuse rules** from the September 2026 PR #190 review. Original integration checkpoints and development-priority rankings are historical, not current workflow instructions. Current truth remains in the [code and source catalogs](CHARACTER_DATABASE.md), [DPS execution boundary](DPS_EXECUTION_GAP_MATRIX.md), and [project status](PROJECT_STATUS.md).

## Source-backed reuse

Review a fact once against its exact source/provenance and reuse the canonical owner where its identity and semantics still apply. New Character/profile reach must be measured by joining source facts, equipment identities, team members and effect capability bindings; deduplicate profile/Character counts independently. Potential membership or primitive availability is not proof of a legal event, supported rotation, buff recipient or measurable DPS denominator.

Keep this dependency distinction in all public reporting:

- **Raw evidence missing/conflicted** — keep the source blocker explicit.
- **Verified game fact but not modeled** — do not promote to an executable effect by analogy.
- **Executable isolated primitive** — caller/event/build qualification may still be required.
- **Profile-specific timing/state missing** — the profile and team DPS are **Pending**.
- **Source-verified, bounded executable context** — readiness must pass its own full profile, source and test gates.

Regenerated inventory and tests, rather than an older review document, establish current fanout and readiness. No numerical game values or complete team timelines are added here.

## Provider evidence, trust and rights

External tools are *reference/evidence candidates*, not replacement sources of truth. Keep source metadata, exact upstream commit/path and permission evidence; verify independently before any canonical promotion. Provider license permissions for its code do **not** establish ownership or accuracy of third-party Wuthering Waves data.

The September inspection recorded, for example:

- [FrequencyManager exact revision](https://github.com/Voruzhu/FrequencyManager/blob/f585e47a868cb2b65845367b976a1781f130c758/adapters/game-definitions/wuthering-waves/weapons.ts) and its [MIT license](https://github.com/Voruzhu/FrequencyManager/blob/f585e47a868cb2b65845367b976a1781f130c758/LICENSE). Its derived/parsing fields require a separate game-source check.
- [wuwa-afyg-tool exact revision and integration documentation](https://github.com/d4rkOfficial/wuwa-afyg-tool/blob/d8460d097a10b829a947975b7aa0684ca5c3a4dd/docs/upstream-integration.md) and [license](https://github.com/d4rkOfficial/wuwa-afyg-tool/blob/d8460d097a10b829a947975b7aa0684ca5c3a4dd/LICENSE). Implemented adapter paths and output field names do not settle game-unit/timing semantics.
- [wuwabuild source sync documentation at an inspected commit](https://github.com/DommyMM/wuwabuild/blob/8d8cbdee3ff14a0a384102e1771b4af96ac1d69f/docs/sync-sources.md). Derived or fallback fields must not be accepted as canonical data without their own review.

These links are **historical inspected revisions**, not claims that the upstream provider is current, complete or licensed for blanket data reuse. Preserve original third-party attributions in the owning source files where required.

## Integration and verification

The [merged public PR #190](https://github.com/bellebing/Bellibing-simulator/pull/190) remains the public review record. Source import, effect modeling, profile execution and final DPS require separate validity and readiness gates. Generic game-data review rules are [Data Verification](DATA_VERIFICATION_POLICY.md) and [Content Preflight](CONTENT_PREFLIGHT_AND_IMPACT_AUDIT.md).

No new provider ingestion, model ranking, source fact, private decision policy or runtime feature is introduced by this documentation.
