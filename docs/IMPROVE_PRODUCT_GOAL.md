# Bellibing product goal — public facts, private upgrade decisions

**Owner-updated 2026-10-26.** Durable product/acceptance guidance for future AI agents. This guide supersedes the 2026-10-25 wording in *this document* where refined below. The private [owner contract](https://github.com/bellebing/Bellibing-engine-private/issues/44) is a companion product goal; its original PR SHAs and lists of then-missing features are **historical snapshots**, not current implementation status. Always read actual public/private main, relevant PR heads, `docs/PROJECT_STATUS.md`, Development Process v2 and Bellibing Echo Tool — AI Handoff before work. A candidate on this documentation branch is **not merged main**.

## The actual product

Bellibing is **not an intrinsic Echo scorer**. Its differentiator is a context-dependent, mathematically defensible answer to: **"Which equipped Echo should I try replacing next, why, at what probability, for what expected net resources and DPS benefit, and should I Continue or Restart this *real* candidate after the next observed checkpoint?"**

An ordinary DPS calculator can tell a user how much damage a build deals. Merely sorting five Echoes by CRIT, individual quality or apparent DPS contribution does **not** answer which replacement is easiest, cheapest or best value. The owner requires a joint assessment of the relevant **distinct** decision dimensions; do not compress them into an unjustified universal scalar score or invent an exchange rate between resources.

### Two independent user experiences

**Public Echo Simulator / Sandbox** is the optional *fun, hypothetical RNG* mode. It rolls generated, lawful game outcomes using source-verified public Echo mechanics, stats, legal tiers and EXP/Tuner/Tube/Recovery transactions. The user knows the rolls are simulated.

**Real-game Improve** observes what the player actually owns and actually rolls in Wuthering Waves. The user records the observed substat **name and exact tier/value** at +5, +10, +15, +20 and +25. Earlier observations remain immutable. **Never use generated RNG as an observed Improve roll.** RNG remains valid as the internal model of *unobserved future* outcomes. Recommendations do not auto-equip, debit or overwrite real account data.

## Responsibility boundary — what is worth keeping private?

| Public, reusable facts and evaluation providers | Private, differentiating decision intelligence |
| --- | --- |
| Character kits, legal mechanics, scaling, stats, weapon and Sequence data, Echo/Sonata rules and source identities | Policy for assessing replaceability and choosing what to level next |
| Verified RNG, roll probabilities, EXP/Tuners/Tubes, canonical transaction and recovery rules | Joint, context-conditioned opportunity search across all five slots |
| Character Profile, source recommendations and DPR references, with source/context limits | Upgrade chance, cost-to-first-strict-DPS-success and adaptive economic reasoning |
| A general source-backed, versioned DPS calculator/provider **may be public** | Private choice, stopping/Continue/Restart strategy and explanation selection |
| Public UI and allowlisted results | Private policy, search decisions, intermediate analyses, caches and evaluator orchestration |

Do **not** treat general-purpose DPS math or publicly known gameplay data as proprietary merely because today's implementation places a DPS adapter in the private repository. **Target architecture:** a provider-independent private Improve engine calling a versioned, trusted DPS provider via a stable `evaluate(fullActualBuild,sourceContext)` interface. Its returned data must include readiness, source/provider/version/context identity, a *comparable* selected Character/Team modeled DPS and any meaningful feasibility/reason details.

The DPS provider's **source can be public while its library runs locally inside the private server**. This avoids sending private candidate enumeration or policy internals to browsers or third-party calculators. Relocation of existing pinned/private DPS adapter code is **future work**, subject to third-party license/provenance review and source-parity testing; do **not** move it during an already frozen PR/CI candidate. No proprietary private decision algorithm, internal policy or diagnostic may enter public bundles, public Actions, client scripts or public documentation. Neither a public scalar DPS input nor a default Character fallback is an adequate provider contract.

## What the assessment must distinguish — not collapse

1. **Current Echo contribution / contextual quality:** What does this *already equipped* Echo contribute in the actual five-Echo Character/team context? An Echo has **no context-free individual DPS value**. A numeric per-slot contribution requires an explicitly defined, legal and comparable **counterfactual reference** for that slot. For instance, compare full Current with a clearly identified eligible slot-specific replacement; disclose whether different main stats, costs or set effects make comparisons reference-dependent. Do not label it objective "weakest Echo" or equate a reference-dependent counterfactual with marginal cost to upgrade.
2. **Ease / chance of a strict replacement upgrade:** For each slot, keep the other four actual Echoes and the entire selected Character, weapon, investments, Sequence, team, rotation, enemy and modeled DPS context fixed. Compare full-build `DPS(Current with candidate in slot) − DPS(Current)` for canonical legal outcomes. Use **strictly positive** modeled delta as success under a named objective (selected Character or Team DPS). Report the probability and its support/uncertainty, and attempts to first success **under a named leveling/recovery policy**. A low-current-contribution Echo need not be easiest to replace.
3. **Expected resource economics / feasibility:** Price each slot separately in **net Tuners, Echoes, EXP and Tube denominations**, including direct feed/Data Recovery as appropriate, sunk versus incremental costs, genuine finite inventory, carry and modeled recovery assumptions. Distinguish unlimited-reference expected attempts/net cost, available-stock success probability, expected spend until exhaustion/success and any censored horizon. There is no invented universal Tuners-to-DPS or EXP-to-Tuners exchange rate. Cheapest positive gain need not be the largest damage increase.
4. **Payoff / opportunity cost:** Show expected *retained* modeled DPS gain, **conditional gain on a successful replacement**, possible gain range/uncertainty and DPS gain per separately reported resource. Compare against the *next-best slot*: probability difference, attempts difference, expected net-cost difference and expected DPS-gain difference. Users should understand what extra resources buy in expected damage, not just see a winner label.
5. **Adaptive checkpoint decisions:** After each **actual** +5…+25 observation, compute the chance that the *remaining legal rolls* surpass the same Current, and compare expected **future net** cost for Continue versus the viable restart/recovery methods. Do not charge sunk resources twice; do not automatically discard for one bad-looking roll. At +25, keep a strictly positive modeled upgrade **for comparison only**; never silently equip. Context, other Echoes, actual stock or source revision changes invalidate earlier advice while preserving genuine user observations when appropriate.

These are complementary dimensions, **not five fixed coefficients for one score**. Product choice can explicitly prioritize the owner's objective (e.g. *lowest expected net Tuners to any strict DPS upgrade*, constrained by finite stock); also show separate *highest upgrade probability*, *best expected DPS per Tuner/EXP/Echo* and *largest likely improvement*. When criteria conflict, show the trade-off and leave preference/unsupported weighting explicit. Do **not** call any slot an established overall winner without a declared objective.

### Why Character Profile, DPR and DPS must cooperate

- **Character/Profile/recommendations** identify source-backed mechanic dependencies, potentially relevant stats, baseline targets, energy conditions and build legality. They are not universal "CRIT worth 10, DEF worth 0" weights.
- **DPR** is an independently versioned, context-bound sensitivity/recommendation signal. It may guide relevance or safe search acceleration; it is **not verified total DPS**, and its reference values are not automatic marginal DPS derivatives or final Character-upgrade verdicts.
- **DPS provider** scores actual *whole-build* comparisons and captures build/team/rotation-dependent interactions, caps and requirements. Different total CRIT/ATK/ER and partner buffs can reverse rankings. For a DEF-scaling Character, DEF may be critical; for another Character it may contribute no modeled damage. A zero effect must come from the evaluated context, not a blanket blacklist.
- **Canonical RNG** still includes all legal low-value/irrelevant substats and their probability mass. Any acceleration must preserve the exact legal outcome distribution and must not silently remove failed outcomes or misrepresent the chance of improvement.
- **Private Improve strategy** combines these inputs to choose which alternatives to recommend and why; it must not hard-code a Character-specific engine or duplicate public source facts.

## The five-slot comparative evidence the user must see

The first view should be concise, human-readable at **desktop 1440×900**, with further evidence available on demand. A safe result can communicate:

- Actual selected Character and Team DPS under a named source/model and unchanged Current; explicit **EXPERIMENTAL, VERIFIED or PENDING** status as justified.
- Five comparable slot rows: upgrade chance with probability interval, expected Echo attempts with bounds/unknowns, expected net cost per resource, available-stock success feasibility and expected conditional/retained gain.
- **Side-by-side explanation** of recommended vs second-best or selected comparison slot: *difference* in success chance, attempts, expected net Tuners/Tubes/EXP/Echoes, conditional DPS gain and expected gain per resource — with uncertainty/context. Say **why** the recommendation wins under the stated objective.
- A **separate** contextual Current-contribution/quality comparison only if the counterfactual denominator/reference is explicitly defined, legal and comparable. Otherwise label it **UNAVAILABLE**, not a fabricated per-Echo DPS rank.
- After +5…+25: the observed actual stat/tier, Continue/Restart alternatives, incremental future net cost, remaining success chance and uncertainty; keep real Current and account stock unchanged.

Avoid raw dumps, hidden weights, proprietary enumeration or proof internals in the public UI. A **checkable numerical rationale** can consist of the modeled Current/Candidate delta, source context, a named policy, bounded estimates and the resulting pairwise trade-offs. Do not claim this proves Bellibing's secret strategy or a globally optimal policy.

### What "proof" means here

- **Exact within a named model:** `DPS(candidate) − DPS(Current)` is reproducible only if both use the same pinned provider and compatible source/team/rotation context. This is not live-game damage qualification.
- **Estimated distribution:** Canonical future-roll frequencies, Monte Carlo intervals and expected costs are **estimates** unless an exact enumeration/proof applies. An interval crossing the rival slot's performance does not justify a certified ordering. A rare unobserved success is not mathematical impossibility.
- **Optimization claim:** A proven best adaptive policy requires an actual optimization proof for its named state, available actions, stopping rules, inventory and objective. A fixed `complete to +25, recover failures` renewal model and separately recalculated Continue/Restart advice are useful **reference-policy** economics, **not** a proof of globally minimal long-run resources under arbitrary checkpoint strategies.
- **Source readiness:** Public 59/59 experimental first-team reference coverage is **not** 59/59 arbitrary real team/loadout DPS coverage, nor independent game qualification. Unsupported combinations remain `PENDING`; never infer functionality from a generic API signature.

## Implementation snapshot — read current code, not old AI claims

At owner clarification (2026-10-26), the reviewed unmerged paired heads were **private PR #43 `cb7c115`** and **public PR #359 `9e979a1`**. Treat these as a dated snapshot; refresh actual refs before any continuation.

**Already present in those candidate heads:** private provider-injected `stepCurrentImprove(input,evaluate,...)`; full-Current one-slot replacement with fixed other four; five probability/cost/opportunity rows; named renewal-reference attempt/cost estimators with bounded sampling; independent finite-stock reporting and per-checkpoint advice; public manually observed +5…+25 name/value flow and nonmutating Current. **Do not resurrect 2026-10-25 bug text claiming the real Improve still RNG-generates observed rolls or only uses 4/8 samples.** Those statements describe old candidate versions.

**Not established as a delivered owner experience in those heads:** a meaningful **counterfactual Current-contribution/quality comparison** for all five actual Echoes and a clear **quantified side-by-side decision explanation** (best vs runner-up in DPS gain, expected attempts and per-resource cost with uncertainty). The existing five-row UI and simple `Easiest / Cheapest / Best DPS/Tuner` labels do not alone meet this refined evidence requirement. The reference-policy expected-cost calculation is not a certified globally optimal adaptive strategy. Normal arbitrary DPS teams/gear/investments and sustained server capacity remain bounded/Pending. These are **open acceptance points**, not claims of newly failing tests.

## Workflow and safety

- Read actual current GitHub main and relevant PR heads first, then `docs/PROJECT_STATUS.md`, AI Handoff and this product goal. Protect the private computation/policy boundary and the separate public Simulator. Keep raw facts, mechanics, effects, Character profiles, DPR/DPS providers, resource transactions, private decisions and public UI separate.
- **Do not silently reconcile historic Phase 1–5 or Issue #44 text into completed functionality.** Current candidate implementation determines what exists; owner product goals determine what must exist. Explicitly flag contradictions and record superseded historical statements.
- Do a focused read-only product acceptance review before costly final verification. Never reinterpret owner's no-redundant-CI instruction as permission to bypass required final gates. Avoid repeat PR pushes/Actions/polling; preserve in-flight final exact-head verification. No merge, release, cloud activation or public publication without explicit owner GO.
- M0 desktop-only: prioritize 1440×900; preserve existing responsive code; no mobile-specific implementation or verification unless expressly authorized. Any change to private/public integration requires its own proper evidence, not inherited success from unchanged heads.
