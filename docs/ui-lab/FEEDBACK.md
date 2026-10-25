# Workshop feedback review contract

This refinement continues the approved V1.1 and typography revision (`00c8532`), both recoverable in Git. V1 stays byte-identical. There is no production integration.

## Data boundary

`workshop-feedback.js` receives `{ severity, title, message?, explanation?, affectedSlots?, actionAllowed, recordedMaterials, demonstration }`. It presents that state, opens a nonmodal explanation, and highlights caller-supplied slot identifiers. It does not import or implement a validator, simulator, evaluator, spending engine, fix strategy or account state. Future Suggest a Fix capability belongs outside this renderer; there is no automatic fix action here.

`feedback-fixtures.js` is the isolated review scenario provider. Severity and action permission are explicit, never inferred as validated gameplay. Warning/error fixtures are supplied for Augusta only. Changing a review scenario swaps its explicit presentation equipment; clicking SIMULATE only exposes a static run record and leaves equipment, candidate values and Character comparisons untouched. Previously recorded materials survive later warning/error scenarios; reset/reload deliberately discards the demo session. Other Characters have no invented material record.

## Review entrypoints

Use `?feedback=ready` (default), `warning`, `error`, `result` or `combination`. Add `&recorded=true` to inspect a warning/error with previously recorded spending. Existing `settings=expanded` and `compact=true` compose with them. The same scenarios are selectable inside the existing **Demonstration** disclosure, so they work in the offline portable file without editing a URL. This control is absent from normal Workshop chrome.

- Ready: no recorded spending, no Materials Used group.
- Warning: the demonstration omits slot 03; two Crown of Valor Echoes remain toward an explicitly selected three-piece target. The action remains enabled.
- Error: slot 05 uses the approved Cost-4 Sovereign fixture; total Cost is 15 against a supplied endgame cap of 12. The action is disabled by the explicit presentation fixture, not a production simulation rule. How to Fix identifies slot 05 and shows the supplied values. Shared names are not a violation.
- Result: original material record (12 Echoes, 120 Tuners, 24 Premium Tubes), never computed spending or a calculated result. Zero-use entries are omitted; unavailable records/quantities remain explicitly unavailable.
- Combination: **Combination Check Pending**, with an explanation that no verified violation was supplied; it does not invent a name-duplication rule or block the action.

How to Fix opens a compact native popover with Close, Escape and outside-click dismissal. Temporary highlights clear on close, Character/slot/scenario change, reset or other feedback updates. Normal motion uses one restrained emphasis; reduced motion removes it. No equipment is changed by the explanation.

## Canonical evidence and limits

- `test/loadoutValidator.test.ts`: four Cost-4 Echoes remain legal to simulate but fail equip validation afterwards. **Cost is not established as a rolling blocker.** The requested red/disabled Cost scenario is therefore labelled “Blocking presentation fixture”; it illustrates the renderer’s supplied permission flag and must not be promoted into a production simulation rule.
- `src/loadoutValidator.ts`, `DEFAULT_ENDGAME_LOADOUT_RULES` and `LOADOUT_RULES_PROVENANCE`: up to five Echoes, endgame Cost cap 12. The source explicitly states: “No Sonata, species-duplication or other equip restriction is enforced here until separately verified and modeled.” The Lab does not invoke this validator.
- `src/data/sonatas.ts`: `sonata-20` Crown of Valor has `activationPieces: [3]`; `sonata-3` Void Thunder has `[2, 5]`.
- `src/echoSonataUiProjection.ts` and `docs/UI_UX_STATUS.md`: production effect presentation consumes committed selected assignments and source-reviewed reached thresholds. Compatibility, counts, chosen requirements and triggered effects are distinct.

The Lab summary therefore shows **equipped composition** (`×3`, `×2`), with accessible names/tooltips, never universal `3/3`, `2/2` activation claims. It counts the existing illustrative assignments only. Selected target progress appears in the warning explanation. Shield/attack triggers, effect uptime and bonus execution remain outside this Lab.

## Shared visual rules

The three segmented selectors share one component: connected dark track, miniature warm-gold gradient on selection, the primary action's lighting/border vocabulary, restrained depth, hover/press feedback and visible keyboard focus. SIMULATE retains its approved size, location and stronger gold emphasis. Current still reports its existing unconnected-mode boundary.

Secondary Stats use the next existing type role above Substats: 16px working/inspection, 14px slot/pile, versus 12px ordinary rows. Spacing compensates within the card anatomy. Discarded cards have one red footer, **DISCARDED AT +N** (unknown remains unknown); unrolled rows retain **Not rolled**.

## Resource readiness and number presentation

Normal Sandbox and detached Improve Candidate searches check the configured
resource inventory before enabling SIMULATE. Missing one resource group shows
**Missing Echoes**, **Missing Tuners** or **Missing Echo XP**. Multiple groups
show **Missing resources**. A restrained orange pulsing outline identifies the
affected inputs; reduced-motion preferences retain a static outline. Valid zero
counts remain valid inputs. Correcting the inventory clears the mark without
changing saved equipment or spending real resources.

This is a fresh-start check using the existing first-checkpoint cost and Tube
denominations, not a guarantee that a finite budget can finish the whole goal.
Runtime support/source checks still apply; enough resources never turn an
unavailable backend or unsupported configuration into Ready.

Expected Echoes/Tuners and Team DPS values use nearest-whole-number presentation.
Expected values retain the approximation marker. Source values, calculations,
exports, Gold-equivalent Tube quantities and stat thresholds retain precision.
Experimental DPS and Pending remain distinct.

Deferred owner direction: an optional Guide button may later walk through
Resources → Gate → Hard Requirements → Flex Stats with one short instruction
and a highlighted region at a time. This guide is not implemented in this slice.
