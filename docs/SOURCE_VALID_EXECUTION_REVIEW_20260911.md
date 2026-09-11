# Source-valid execution follow-up after PR191

Baseline: merged and post-merge-verified #191, `3fe1544f81ba7658fccd2ebbe4c4471bf6dd7d89`. Work belongs to `codex/source-valid-execution-2026-09-11`, with one new draft PR and no further merge authorization. UI and the separately preserved Flamewing WIP are outside this branch.

## Baseline and closure review

Fresh registry derivation: 83 open profile-dependency edges / 72 distinct IDs; 26 UNREVIEWED, 24 PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE, 7 BLOCKED_SOURCE_CONFLICT, 9 BLOCKED_SOURCE_SEMANTICS, 17 PROFILE_SPECIFIC_EXECUTION. Readiness remains 43/3/9/2; only Augusta and Ciaccona are DPS_READY. All 17 pending profiles are SOURCE_SEQUENCE_ONLY and lack canonical rotationSeconds.

The exact queue, rotations, source sequences, equipment and teams were joined in `artifacts/next-lane-baseline-closure.json`. Cartethyia's low edge count still hides missing DEF timing; Calcharo needs S03 lifecycle and a profile recipe; Carlotta needs S10 lifecycle, exact Sentry variant/charge history and a denominator; Lumi retains Heron/resource/timing gaps; Rover Aero retains BUG-012 healing/rotation gaps; both Denia modes lack event/resource/variant/timing proof. An isolated primitive supplies none of these missing inputs. No full new executable profile can be claimed.

## Bounded Sonata lifecycle review

Canonical numbers, caps and durations in `sonataEffects.ts` remain unchanged. The review concerns missing execution semantics only.

| Contract | Existing proof | Missing proof / disposition |
| --- | --- | --- |
| `S03_5PC_ELECTRO` | Canonical SELF, exact set/pieces, Heavy or Skill cast categories and per-stack values/duration/cap. | Category-independent timers versus one shared counter, sub-cap/at-cap timer mutation, refresh and trigger/damage ordering are not sufficiently established. PARK; no runtime promotion. |
| `S10_5PC_SKILL_STACK` | Canonical SELF, exact set/pieces and Liberation cast category with per-stack values/duration/cap. | Shared versus independent expiry, sub-cap/at-cap refresh and trigger/damage ordering are not established. PARK; no runtime promotion. |

The [Void Thunder game-text mirror](https://wuthering.wiki/item_50000066.html), read 2026-09-11, supplies no complete timer transition contract. A [2024 player test report](https://www.reddit.com/r/WutheringWaves/comments/1de4xx0) claims category independence, while current guide prose describes different acquisition behavior. That old report is a research lead, not a current versioned experiment proving every required transition. Neither interpretation is promoted. The [current Carlotta source guide](https://www.prydwen.gg/wuthering-waves/characters/carlotta), read 2026-09-11, describes repeated Liberations and a source sequence but does not establish stack refresh or a complete executable denominator. Its uptime/rotation advice is not timer evidence. No calculator implementation was used as gameplay proof.

No explicit target requirement is added to the canonical cast triggers. Actual trigger occurrence, owner, exact equipped set/pieces and query ordering would remain caller obligations even if the missing lifecycle were proved. No generic stack engine or first-stack shortcut is introduced.

## Re-ranked independent work

1. **Lupa isolated Outro transfer:** existing VERIFIED/RAW_ONLY canonical fact, exact provenance and simple incoming/switch-out clause; five existing presets across Changli, Chixia, Encore, Lupa and Mortefi. Reuses the existing lifecycle without new state/timing facts. Implemented below.
2. **Qiuyuan isolated Outro transfer:** existing canonical incoming Echo amplification fact, five presets across Cantarella, Galbrena, Phrolova, Qiuyuan and Sigrika. Implemented after reviewing the exact fact below; Character-owned ECHO damage remains separate from an equipped Echo cast.
3. **Lynae/Cantarella:** their exact scope and single-cap metadata are now reviewed and bound below. Jianxin has no current preset consumers and ranks lower.
4. **Resource/Echo/profile closure:** remaining gaps retain the [PR191 audit](PR191_EXECUTION_CLOSURE_REVIEW_20260910.md) findings. Provider resource field names alone do not establish cast-versus-hit, owner, units or ER behavior. Denia/Moth scaling and Mourning Aix target/modifier remain unresolved. None is silently cleared to increase coverage.

## Lupa isolated canonical transfer

`lupa-outro-stand-by-me-warrior` now joins the existing isolated Outro family. The adapter reads the existing canonical amounts and duration; no source row is edited or duplicated. Its exact incoming Fusion and Basic amplification terms remain separate. Pack Hunt, Glory, resource state and sequence effects are not inferred from an Outro.

Execution requires a real owner/recipient Outro switch, explicit absence of a previous activation, recipient switch history and tied-event order. Unknown repeats/refresh remain unsupported, with RAW_ONLY and null maxStacks unchanged. Tests reject scope, source identity/provenance, trigger, duration and text drift; exercise expiry/switch ordering; and feed the Basic term into an explicit Encore hit through the existing kernel. All five consuming rotations remain source sequences. The post-slice closure recheck still finds 83 open edges, six Reference Team blockers and unchanged readiness.

## Qiuyuan isolated canonical transfer

`qiuyuan-outro-strike-before-ready-amplification` supplies only its existing incoming Echo Skill amplification. The canonical fact separately identifies Character-owned Outro ECHO damage; the transfer neither calculates that damage nor treats it as an equipped Echo cast. Its exact owner, pinned source URL, original checked date, scope, trigger and complete sentence shape are required. No number or source fact is duplicated.

The same prior-state/order/recipient/expiry contract is reused. Tests cover source drift, repeated/mixed activation rejection, source-only consumer rotations, detached database projection, and a caller-proven Cantarella/Lorelei hit: no landed hit gives zero damage, omitted landed count fails, and a Character fact cannot masquerade as an Echo attack. Five current presets gain discovery; the closure recheck still supplies no missing profile events, equipment state, resources or duration. All 83 edges and six Reference Team blockers remain pending.

## Lynae and Cantarella: known cap, isolated lifecycle

`lynae-outro-lets-hit-the-road-amplification` and `cantarella-outro-gentle-tentacles` preserve their existing VERIFIED/RAW_ONLY and maxStacks=1 metadata. Their exact canonical owner, pinned provenance, original checked date, incoming scope, trigger and sentence shape are required. Single-cap metadata does not establish refresh at a repeated activation, so the same strict isolated policy applies. No generic RAW_ONLY or maxStacks=1 promotion is added.

The All/Liberation and Havoc/Skill terms remain separately scoped. Lynae's source-fixed Outro hit remains a separate ACTION and is not calculated by the transfer. Tests exercise altered scope/provenance/cap/status, wrong owner, repeated/mixed activations, both kinds of tied order, expiry, permanent recipient switch-out, and direct-hit composition for Calcharo Basic and Roccia Skill. Buff selection/composition remains caller-proven; no All+Liberation or Havoc+Skill aggregation is inferred.

Lynae has four current preset consumers and Cantarella two; one Cantarella consumer already belongs to the Qiuyuan cohort. Across the four new owners the union is **15 presets / 15 Characters**, exposing seven additional independent source terms. Total Outro contracts grow from nine to thirteen. The post-slice queue/rotation audit still finds all 83 open edges / 72 IDs, the same 26/24/7/9/17 partition, readiness43/3/9/2 and six Reference Team blockers. No profile is newly executable or DPS_READY.

## Reviewability boundary

The runtime diff extends one existing adapter for four exact canonical owners; it introduces no new kernel, lifecycle engine, source value table or UI path. Lupa, Qiuyuan and Lynae/Cantarella are the three coherent implementation slices. This exhausts the reviewed high-fanout simple Outro cohort selected in this pass. Jianxin has no current preset consumers; Phrolova couples the description to Maestro/Hecate execution; Brant remains PENDING_INTERPRETATION. Broader Character state, resource ingestion, Sonata lifecycles and profile engines need separately evidenced scopes. Freeze this draft's feature scope and perform integration readiness review before any such follow-up.

All six Reference Team blockers, BUG-008/010/012/028/029, Zani Frazzle-infliction mapping, Abyss Surges 587/588, unresolved Max Energy, Buling/Danjin/Xiangli Yao, Denia/Moth attack scaling, Moth hold-hit occurrence and Mourning Aix target/modifier remain unchanged. This boundary is review scope, not a claim that no future safe backend work exists.
