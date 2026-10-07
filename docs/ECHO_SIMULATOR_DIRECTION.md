# Echo Simulator — accepted future product direction

## Purpose and readiness

This is the canonical long-term product direction for Bellibing's Echo Simulator, preserving the accepted concept for a future PM/builder. It describes the full future behavior. The bounded [Echo Simulator Foundation candidate](ECHO_SIMULATOR_FOUNDATION.md) establishes sandbox/card ownership only; this direction does not claim an active evaluator, RNG orchestration or Improvement Cost feature.

The north-star question is: **“If I use my real Echo resources with these Improve settings, how difficult/expensive is it to actually improve this Character?”**

This returns to Bellibing's original spreadsheet motivation: quickly rolling/testing Echoes and seeing resource difficulty. Excel, V9.15 and older sheets are historical UX/product inspiration only. Do not port their behavior wholesale or treat them as current architecture or an implementation oracle. Current source-backed Bellibing architecture, Build Need and the private evaluator are authoritative.

Read this alongside [current project status](PROJECT_STATUS.md), the [current Improve settings contract](UI_IMPROVE_SIMPLE_SETTINGS.md), the [public product contract](PRODUCT_CONTRACT.md), [Echo Engine Boundaries](ECHO_ENGINE_BOUNDARIES.md) and the [private decision runtime boundary](DECISION_MODEL.md). These current contracts remain in force; this direction does not activate Pending outputs.

## Improve workspace and sandbox ownership

The primary UX lives inside **Improve a Character** and reuses the current Improve layout. Character, Stats, Skills, Improve Settings and the five existing Echo slots remain the main playing field. A separate standalone simulator page is not the primary experience.

Conceptually add a clear **Current | Simulate** mode:

- **Current** shows the user's real build.
- **Simulate** creates a temporary sandbox for the same Character context (including Weapon / Sequence / Forte where needed), starting with exactly five empty Echo slots. Real equipped Echoes and alternate account sets are not simulation equipment. The user's Improve settings/resource context is retained without copying account Echoes.
- Running a simulation must never overwrite or mutate the real Character/build. Accepting a simulated Echo updates only simulated Current. This direction does not authorize writing simulation results back to real equipment.

For a selected slot, for example Echo 2:

| Existing surface | Meaning in Simulate |
| --- | --- |
| Current Echo | Best/accepted simulated Echo for that slot, or Empty if none has been accepted. |
| New Echo | The active candidate being rolled/tested now. |
| Middle / NEXT STEP | Very short feedback about the observed checkpoint and decision. |
| Five Echo cards | Best/accepted Echo for each corresponding slot. |

Examples of short feedback are `+5 · DEF%`, `No useful outcome`, `TRASH`, `+10 · CRIT Rate`, `CONTINUE`, `Improves Current` and `ACCEPT`. They illustrate presentation, not a rule mapping any particular stat to a decision. Reason text is simple and user-friendly and must not expose private evaluator policy or calibration.

## Cards, acceptance and physical Trash Piles

The simulation should feel like a card game. A candidate card arrives at New Echo, develops checkpoint by checkpoint, then has one of two main outcomes:

- **Accepted:** the card moves up into the selected Echo slot and becomes its best/accepted card.
- **Rejected:** the card animates down into that slot's Trash Pile.

Place **five corresponding physical Trash Piles directly under the five Echo slots**, in Echo 1–5 order. Every rejected candidate belongs to the pile of the slot being simulated. This is the primary visual history; do not put history in the main panel, a sidebar or a long list. No permanent large history table is needed in the main view.

Cards stack with a small physical offset: one reject looks like one card; two to five clearly form a growing pile; an expensive slot should visibly become a thick bundle. Large piles may use compressed rendering, but must still feel as though they grow. A count such as `×37` may supplement the stack.

A user can select/lift an old card from a pile to inspect its actual history, for example:

```text
Echo #27
Reached +20
+5 CRIT Rate
+10 ATK%
+15 Heavy DMG
+20 Flat DEF
Stopped because …
```

The reason remains a safe public explanation. When inspection ends, the card returns to the pile.

Trash-card color/frame may communicate **verifiable checkpoint progression / decision depth**, never a hidden quality score. Illustrative concepts: a clearly red early +5 reject; intermediate +10/+15; a closer +20 candidate; a distinct “near miss” for a +25 candidate that still loses to simulated Current. The exact palette and styling remain open. Reaching a later checkpoint does not independently prove Character usefulness.

## Per-slot interaction and presentation modes

Each slot can be simulated separately, for example **Echo 3 → Simulate**. The user chooses the slot; the flow must not require Echo 1 → 2 → 3 → 4 → 5 order. When a slot meets its eventual improvement/completion criterion, feedback may say `ECHO 3 IMPROVED ✓`. The user may then continue that slot or choose another. A future global **Simulate Build** may automate the whole build, but per-slot simulation is the core interaction; whole-build availability in V1 is undecided.

| Mode | Presentation of the same simulation and decisions |
| --- | --- |
| Interactive | Automatically advance through steps with no decision; pause at real evaluator decision points so the user can see the outcome before the next card/step. |
| Auto | Show candidate arrival, rolls/checkpoints, acceptance or rejection quickly; cards move and Trash Piles grow live. |
| Eventual Instant | Run the same engine without animation, including `Run 1,000` / `Run 10,000` for distributions and Improvement Cost. |

Interactive, Auto and Instant must share simulation engine and decision logic. Only presentation/timing differs. Roughly 5–10 seconds per Echo for Interactive and around 15 seconds for a compressed visual Auto run are possible UX directions, not locked timings or guarantees.

## Resources, canonical mechanics and source gates

The user-facing simulator resources are exactly **Tuners | Tubes | Echoes**.

- **Echoes** means candidate Echoes / attempts, not a modeled farming drop rate.
- Never display raw Echo EXP/XP or an abstract EXP total such as `142600` to the user.
- A technical EXP unit may remain internal to apply verified checkpoint costs behind the Tube model. It is an implementation detail, not another visible resource.
- **Tube denominations and conversion to the user's actual materials must be source-valid before exact resource simulation is enabled. Do not guess conversion.** Effective internal feed/recycle recovery does not by itself prove exact material conversion or rounding.
- Shell Credits are not a user-facing simulator resource in this accepted direction. Adding them requires a new product decision; their presence in internal mechanics does not authorize a visible fourth resource.
- Do not combine resources into one score through arbitrary weights. Tuners, Tubes and Echoes retain separate meanings.

Reuse current canonical mechanics rather than duplicating rules in a simulator or presentation layer:

| Canonical owner | Reusable truth / boundary |
| --- | --- |
| [Echo Core rules](../src/echoCoreRules.ts) | Rank-5 substat types, exact tiers and reviewed probabilities; +5/+10/+15/+20/+25 progression; checkpoint spend/refund primitives and their provenance. |
| [Echo Core runtime](../src/echoCoreRuntime.ts) and [domain](../src/echoCoreDomain.ts) | Character-free rolling of already-eligible candidates and resource primitives; acquisition coverage is explicitly bounded. |
| [Echo main stats](../src/echoMainStats.ts) | Source-backed Rank-5 progression/main-stat growth. |
| [Echo data pipeline](ECHO_DATA_PIPELINE.md) | Raw identity/species/Source separation; raw data is not recommendation or combat readiness. |

Existing character-free strategy modeling, including [Echo strategy simulator](../src/echoStrategySimulator.ts), is not the real Character-improvement evaluator. Its name-based strategy outcomes and internal resource shapes do not establish this future product's acceptance, Tube mapping or readiness. Echo Core remains character-free; the simulator consumes canonical mechanics plus the same private evaluator semantics as Improve.

V1 need not model all Tacet Field/farming acquisition. It may begin with **“I have N candidate Echoes to test.”** Fresh Echo acquisition/main-stat probabilities and farming rates are separate source questions and remain Pending where unsupported. Later Farming Simulation may ask how many runs/days are needed to obtain enough candidates, only once acquisition data is source-valid.

## Evaluator semantics and evolving simulated Current

The simulator must not invent whether an Echo is good. It consumes the same Build Need / usefulness semantics as Improve:

```text
Current
 → Candidate Echo
 → checkpoint / new outcome
 → Build Need / usefulness assessment
 → continue / reject / accept
```

Every candidate is assessed relative to the evolving simulated build, which starts empty and grows from 0 → 5 accepted Echoes. Reset returns to five empty simulated slots; Current/exit reveals the unchanged real account build. No simulated candidate, accepted card, Trash Pile or history is persisted into CharacterBuildState. A real-build source snapshot may be retained for identity/context/isolation, never as the simulated Echo baseline.

Private Worker 8 Fas 3 trusted measurement currently requires five complete Echo cards. Simulated builds with 0–4 Echoes therefore remain evaluator-Pending until a future private capability explicitly supports partial builds. This direction does not authorize fake browser evaluation or an availability claim for five cards without private ingress. When an Echo is accepted, that build becomes the new **simulated Current**; future candidates must be reassessed against it. The original real build remains untouched. Short public feedback reflects evaluator results without publishing the private reasoning machinery.

A future run may stop when the build reaches a separately defined accepted/completion level, but **“finished enough” is PENDING** and belongs to the Build Need / evaluator contract. **Character Target reached does not mean finished.** Character Target is directional/reference data, not an automatic stop-line. Neither the simulator nor this document defines an acceptance threshold or completion algorithm.

## Distributions and empirical Improvement Cost

Once Worker 8 Fas 3 can assess outcomes that truly improve Current, repeated runs of the same rolling simulation can measure the cost of the next real Character improvement empirically: Tuners, Tubes, candidate Echoes and variation/percentiles between runs. Avoid an abstract intrinsic Echo score.

Eventually show many Instant runs as a distribution against which the user's live run can be compared, for example **Average / Current run / Percentile**. Graphs must be selectable per actual resource: **Tuners | Tubes | Echoes**. Do not substitute a combined resource score.

Possible results include candidate Echoes tested, Tuners used, Tubes used, hardest slot, cheapest slot and the current run's position in the simulation distribution. Hardest/cheapest comparisons must retain a stated resource basis rather than inventing a weighted total. Exact graphs, percentile/report defaults and presentation remain open; this document implements none of them.

## Roadmap dependencies

The accepted order is:

1. **Character Truth bulk capture.**
2. **Worker 8 Fas 3: real Character usefulness / outcome assessment.**
3. **Echo Simulator Foundation.**
4. **Improvement Cost via repeated simulation.**
5. **Farming/acquisition simulation when source-valid.**
6. **Deeper Character/team optimization integration.**

This is roadmap direction, not a claim that these steps are implemented. Source-backed Character Target data, current Echo primitives or a private runtime foundation alone do not prove real Build Need/usefulness readiness. Exact resource simulation additionally depends on verified Tube mapping; completion-dependent runs additionally need the separate completion contract.

## Confidential engine separation

Public ownership may include source-backed Echo mechanics, user-visible simulation state/contracts, UI/card presentation, resource labels and wire-safe result shapes. Proprietary evaluator policy, weighting/calibration and private decision orchestration remain private and must not appear in public browser code or public docs.

Document product behavior and safe result meanings, not secret implementation. Preserve the [confidential engine boundary](ECHO_ENGINE_BOUNDARIES.md) and neutral Pending behavior when the required private runtime or source-valid semantics are unavailable. Presentation modes must not create browser-side substitute decision logic.

## LOCKED PRODUCT DIRECTION

- Simulator lives in Improve a Character and reuses the current Improve layout.
- Current/Simulate sandbox separation; simulation never mutates the real Current Character/build.
- Five slot-centric Echo cards represent best/accepted Echoes; New Echo is the active candidate.
- Accepted Echo → selected slot; rejected Echo → corresponding Trash Pile.
- Five Trash Piles under the slots, physically stacked/offset cards that visibly grow; history cards can be inspected and returned.
- Verifiable progression/decision depth may drive visual frame state; no hidden stat/quality score.
- Per-slot Simulate with free slot choice is core interaction.
- Interactive and Auto share one engine/decision logic; eventual Instant bulk mode uses that same engine.
- Tuners/Tubes/Echoes are the only user-facing simulator resources; no visible raw Echo EXP/XP, no Shell Credits without a new product decision, no combined resource score.
- The real evaluator determines Character improvement relative to evolving simulated Current; safe, short reason text does not expose proprietary policy/calibration.

## OPEN / NOT YET DECIDED

- Exact card styling and animation.
- Exact color palette.
- Exact Interactive/Auto timing.
- Exact Tube denominations/conversion, with source validity required.
- Exact “finished enough” criterion, separate from Character Target.
- Exact graph presentation.
- Exact initial candidate acquisition model.
- Farming rates/main-stat acquisition probabilities, with source validity required.
- Whether global whole-build Simulate ships in the first simulator version.
- Exact percentile/report defaults.
