# Improve Settings — public desktop contract

**Improve Settings → Resources → resource controls → separator → accepted settings controls** is the visual hierarchy. Resources is a centered secondary heading. Expanded controls group **Echoes | Tuners | Tubes**, with local Premium Tuner art and four actual Sealed Tube icons (Gold / Purple / Blue / Green) above directly typeable counts. Tube color captions and canonical English item names in accessible labels/tooltips identify denominations without relying on color. Echoes remains text-only because no source-valid neutral item icon was identified. Collapsed settings show a compact line of the same item art and six current values, hide inputs, and retain the accepted settings summaries. Narrow layouts wrap the families and, where needed, Tube denominations without overflow. Enter a whole non-negative count or `∞` / `unlimited`; finite zero remains distinct from unlimited.

Item provenance, pinned identities, byte hashes and the limited fan-companion reuse basis are recorded in [resource-icons/manifest.json](ui-prototypes/assets/resource-icons/manifest.json) and [Asset Source Inventory](ASSET_SOURCE_INVENTORY.md#resource-inventory-item-icons). The build audits the five selective, byte-identical local PNGs and includes them in the explicit public asset boundary.

Resource Inventory is shared user-owned budget context in the existing Improve v3 storage envelope, outside Character records. Old envelopes without inventory start with explicit finite-zero inputs. Corrupt/unsupported saved inventory blocks overwrite and retains recovery bytes; storage write failure cannot commit a changed budget. Character changes, Current/Simulate, exit and simulator reset preserve it. Simulate keeps settings and inventory read-only; return to Current to edit. It is independent of CharacterBuildState, policy and memory-only simulator sessions. No account writeback or spending engine exists.

The visible settings controls are Character Target / Gate / Every Echo / Flex Stats with one Recommended / Customize mode. Gate choices remain +5/+10/+15/+20/+25. These are user inputs, not executable decision policy.

Recommended Character Target displays only an unambiguous source-backed modern DEFAULT Calc reference. Source families never fill gaps in one another. Missing references display Pending.

The accepted PR #224 presentation baseline remains the shared four-column expansion, Recommended / Customize, discrete per-stat roll controls and Show other stats. Recommended Every Echo and Flex Stats display reviewed relevance in canonical order with read-only controls; an unavailable minimum displays Pending without a selected tier while the private runtime is unavailable. Customize preserves user-owned selection, order and exact canonical roll-tier inputs. No hidden acceptance or stopping fields are browser exports.

Settings remain Character-isolated. Context/source drift suspends incompatible saved intent; reset is explicit. Storage failures retain recovery data. Existing v2 data is not overwritten, and source recovery does not invent or retarget user choices. Legacy settings containing retired fields require review instead of being executed.

The detached browser getState API returns user inputs, public presentation and compatibility status only. It does not expose internal decision policy or mutate build/equipment.

Improvement Cost / evaluator uses a private decision-engine contract. Proprietary policy and calibration are not part of the public repository.

Build Need, Improvement Cost, comparison and evaluator output remain Pending. Browser verification covers built and repository-source previews, canonical tier input, persistence/recovery, isolation and neutral Pending states.

See [Echo Simulator direction](ECHO_SIMULATOR_DIRECTION.md) for accepted future reuse of this Improve workspace with Current/Simulate sandbox separation. The bounded [Echo Simulator Foundation candidate](ECHO_SIMULATOR_FOUNDATION.md) adds an isolated Simulate workspace; Current retains this settings contract, and settings are read-only inside the sandbox. Evaluator output remains Pending.
