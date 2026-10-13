# Unified Improve UI coverage

The current candidate combines the previously separate UI work on the current application base. The functional entrypoint is `docs/ui-prototypes/v34-functional.html`; the strict build exposes the same runtime at `dist/ui-preview/`.

| Capability | Integrated behavior |
| --- | --- |
| Screenshot-based simulator workspace | Current/Simulate, character/stat comparison, five slots, New Echo, bounded 1 Slot / Full Set generation and actual histories |
| Prepared/manual Echo setup | Shared workshop, exact canonical stat validation, same simulated slot owner as generated equipment, no budget debit |
| Activation | Small pointer/keyboard controls; inactive cards are retained; static projection removes/restores their contribution |
| Persistent Sonata selection | Character-owned filters from the newer settings surface; explicit empty and multi-select intent retained |
| Resource inventory and locks | Seven saved counts including Shell Credits, canonical recovery, serialized same-tab and cross-tab writes |
| Resource scrubbing | Direct count/∞, horizontal gestures and keyboard stepping use that same writer |
| Navigation/text | Two visible mode buttons; extra stats and read-only Skills/Sequence folded; compact section summaries; explanations/history expandable |
| Existing account/build | Current/Candidate ownership, equipment, Weapon/Skills/Sequence source facts and build persistence retained |
| Pure +5 transaction groundwork | Preserved and tested; not bound to the live UI, which only spends its detached +25 simulation budget |

The persistent multi-select supersedes the older memory-only two-set replacement picker. Selected families are eligibility filters; reviewed default slot distributions and already equipped assignments remain separate. The removed global Recommended/Customize bar and Add stat action are replaced by direct section edits/reset and preservation of already saved numeric targets.

No new game facts, rotation defaults, team damage engine, private evaluator or upgrade recommendation is introduced. Gate early rejection, Shell Credit simulation charges, discard/recovery economics, Expected, Improvement Cost and full DPS UI remain unsupported. See the [foundation contract](ECHO_SIMULATOR_FOUNDATION.md) for the executable boundaries.

Legacy UI PRs should stay available for traceability until this integrated candidate has been reviewed and landed. Preview acceptance does not establish FULL/merge readiness.
