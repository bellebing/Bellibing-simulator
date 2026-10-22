# Character Mechanics — Source Review Dispositions

Current canonical source-area coverage is **59/59 RELEASED Characters**. This
is source-fact coverage, including the explicitly identified owner interpretation
below. It is not 59 executable teams, combat readiness or gameplay qualification.
The deterministic Character Mechanics, ACTIONS, FORTE_RULES, INHERENT_PASSIVES
and OUTRO_EFFECT audits own their exact inventory and structural checks.

## Danjin — full-meter translation resolved by the owner

The unchanged pinned English Forte text for move `1000807` has parameters
`[60, 120, 120, 120]`: normal Chaoscleave unlocks at 60, full power consumes
120, the maximum is 120, but the English full-power clause says “over 120”.
That literal clause cannot be satisfied under the same cap.

The owner has already resolved this translation issue and reaffirmed the decision
for Issue #348 on 2026-10-22: **exactly 120 is full meter and qualifies for the
full-power Chaoscleave/Scatterbloom branch; consume 120**. Do not reopen the same
owner decision. This is an explicit interpretation, not a new independent official
mechanics source or an upstream text correction.

`src/data/characterMechanics/danjinInterpretation.ts` records that authority and
threshold. The stable Forte fact ID is retained; its former source blocker is
removed. Source raw text, coefficients, capacity and source pins are unchanged.
The canonical six-area source profile now passes; modeling status and product
DPS readiness remain separate. Private M0 tests inspect the unchanged native
full-power action at 119/120 and its 120-resource spend. Invalid native casts can
still produce exploratory damage, so the cast guard must never be bypassed.

## Previously resolved damage-classification omissions

Buling's Five Thunders Spell Array is Liberation DMG, original released damage
row `1307019002`, Type 2. Xiangli Yao's Pivot — Impale is Basic DMG, original
rows `1305011001`, `1305012001–4`, `1305013001–2`, Type 0. These are resolved
from the original release fields, independently of skill-panel ownership.
See [original release review](CHARACTER_RELEASE_3_7_FACTS_REVIEW.md).

Buling S4 grants 20% Healing Bonus. The six source Sequences remain raw facts;
active product investment is S0–S2. Source completeness does not permit S4/S5/S6
in a baseline calculation, fabricate trigger ordering or qualify Electro Flare.

## Runtime boundary

Canonical facts → effects → profiles/rotation → private calculator → UI remain
separate. An audit, source label or owner wording resolution does not establish
complete resource execution, independent numeric parity, a live Chromium flow,
Expected DPS or any gameplay-qualified team. Missing evidence stays Pending.
