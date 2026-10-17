# Echo Workshop configuration

The default Lab entrypoint configures future simulation inputs. Each of five existing cards has a small **Edit Echo** button. The button opens the existing `v34-functional.html` Echo Workspace with a separate configuration owner; it does not open a new editor. Echo identity/Cost filtering, Main Stat combobox, automatic secondary stat, Sonata assignment and confirmation are reused. Rank is fixed to the existing source-backed Rank-5 editor. Other ranks are not offered. Future substat controls and real Build-slot equip actions are excluded from this owner.

## Four owners

- Selected slot: the card currently inspected, independent of all other states.
- Configured slot: a canonical template selection (`echoId`, Cost, Rank, Main Stat name and compatible Sonata), retained per Character.
- Active slot: the user's independent inclusion flag. A valid configured slot can activate while Simulated Current remains empty. Saving a template does not automatically activate it.
- Simulated Current: actual accepted results only. It starts with five nulls; candidates and histories start empty. Phase 6A creates none of them.

The card presenter shows a configured template whenever no accepted Simulated Current exists. It reads canonical artwork/name/Cost/Main/Sonata directly from the saved configuration, labels it **CONFIGURED** in the existing top metadata position, and leaves numeric stats unavailable and all substats Not rolled. The working-card caption becomes CONFIGURED ECHO. These objects never enter actual result/stat projection inputs. The existing card dimensions, artwork area and five rows are retained; Edit Echo remains in its footer without covering the configured label. Reopening reads the confirmed choice, while Cancel leaves both state and visible cards unchanged.

The reused Workshop filter follows the selected source context plus the confirmed custom Sonata, rather than selecting one of the six profiles solely by Character ID. Custom filter inclusion never receives a source-recommended star.

Current mode remains a read-only view of the Lab's existing illustrative source cards, not an integration with real account equipment. Its Edit/activation controls are disabled. Switching mode/Character retains that Character's explicit choices and Customize settings. Non-Augusta functional contexts start without the Lab's illustrative Augusta Sonata-pool default. Reset clears simulated results, candidates and simulation histories, while retaining template selections, activation, Settings and shared resources. No account state or production persistence is written.

## Source-bound initial choices

The checked generator `tools/export-loadouts.mjs` projects reviewed profiles/guides into `default-loadouts.json` and the [59-Character coverage matrix](DEFAULT_LOADOUT_COVERAGE.md). It preserves provider order and source conditions, and never ranks by guide percentages. Fresh sessions initialize once from available valid slots, with those slots active. Editing later does not implicitly activate; manual choices receive CUSTOM_OVERRIDE provenance and survive Character switches and Reset. Defaults carry RECOMMENDED_DEFAULT provenance, source hashes, context, and SOURCE_MAIN_ECHO versus CANONICAL_COMPATIBLE_EXAMPLE identity roles. Both use identical canonical template fields and snapshot validation.

Only the general Augusta Standard and Shorekeeper support profiles are eligible without assuming a team/mode. The other four verified profiles remain explicit context-bound references; they do not silently override general guides. Augusta's explicit two-piece Void Thunder companion fills the last two example positions. Other general guide slots use compatible examples from the first displayed primary set; missing captured piece counts remain Pending, not a claimed source five-piece prescription. Filler identity choice follows canonical catalog order, avoiding reuse when possible; it is a reproducible example assignment, not a gameplay ranking or species rule.

Unresolved slash/equal Main Stat alternatives and non-unique main Echo choices remain unconfigured. Explicit `>`/`≥` preference keeps the first source option. Seven reviewed first options require absent team/role/mode context and do not fall back to another set. Source excerpts and alternatives remain in the generated projection. Current coverage is **1 complete / 50 partial / 8 empty**, not 59 executable configurations. Only Augusta has all five resolved legal initial templates. All other identities have exact per-slot Pending dimensions in the matrix. Existing verified Build/mode/Settings-v3 binding and execution remain Pending for every Character; a source general reference is not an actual selected production Build.

## Canonical validation and reuse

`assets/echo-template-configuration.mjs` validates against the existing exported Echo browser contract, which is generated from `ECHO_CATALOG`, `SONATA_CATALOG` and `src/echoStatEditor.ts`. Cost belongs to the chosen canonical identity; Main Stats come from its Cost/Rank pool; Sonata must belong to that Echo. Secondary Main Stat is read from the same source contract. No game values or independent probability/stat tables are added.

The Lab exports the original pure `validateEchoLoadout` and default rules from `src/loadoutValidator.ts` through the existing checked Settings exporter. This checks active configuration capacity without inventing a species restriction or changing the user mask. An invalid active selection remains explicit and cannot become an executable configuration.

The Workshop's opt-in `workshopOwner=ui-lab` host replaces only its frame-local Storage objects with memory before application scripts initialize. It exposes a narrow configuration-only owner port; save validates and invokes that owner's callback before any real Equip branch. Character/Settings/slot/session changes invalidate a pending editor commit. Normal Workshop URLs retain their existing equipped/candidate owners and storage behavior. No HTTP endpoint is added.

## Snapshot and readiness

`window.bellibingLabConfiguration.snapshot()` returns a detached, versioned public configuration snapshot, not a run request to a private engine. It includes default source context, per-slot default/custom provenance, Character ID, current UI Settings, all five numbered slots, configured template IDs and canonical Echo IDs, activation, separate null/actual result fields, shared canonical inventory, event-owned selection/configuration/session/settings revisions and the shared inventory owner’s revision and a source-contract SHA-256 binding. Template IDs hash normalized canonical choices; they are public selection identities, not claimed private engine identifiers.

`validation.status` separates a valid template selection from invalid/missing selections and canonical loadout violations. `capability.status` remains **PENDING**. The UI Lab lacks a verified production CharacterBuildState/build-mode binding and canonical persisted Settings v3 adapter. These fields remain null/Pending; no illustrative cards or approved Lab presets are promoted to those roles. The public snapshot is prepared for a subsequent reviewed adapter, not advertised as already accepted by an execution compiler.

SIMULATE only reads active configured slot indices and retains its Pending behavior. No rolls, results, acceptance, account inventory debit, provider calculations or private policy execute. Recommended, Expected, Simulated and saved Character Stats remain separate. `?demonstration=true` explicitly preserves the earlier isolated fixture-review surface; it is not the functional configuration entrypoint.

## Verification

`configuration.test.mjs` checks every released Echo/Main/Sonata combination against canonical source rules, rejects invalid fields/rolled-card inputs atomically, and covers four-state separation, Character isolation, Customize, revision binding, retained histories and loadout validation. `review-configuration.mjs` uses real mouse/keyboard input for two Characters, multiple slots, template/Main/Sonata changes, stale-context rejection, configured-but-empty activation, cancel/reset/mode exit, resource preservation and storage isolation. Legacy visual/interaction reviews run through explicit demonstration opt-in; the default functional flow has its own review.
