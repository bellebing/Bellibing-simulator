# Sandbox static stats, source priorities and comparison boundary

Follow-up to Draft #320 and Issue #319. No new gameplay values or native DPS
qualification are introduced. Existing canonical source modules remain unchanged.

## Working behavior

Character Stats projects the selected Lv90/S0 Character, Lv90/R1 Weapon and max
minor Forte baseline using the existing static projector. All 59 source identities
are exported, including identities lacking hero art. A baseline without Echoes is
labelled explicitly. A valid zero is displayed as zero within this static scope.

Five complete observed +25 cards from the current run replace that baseline with
an observed static build in Character Stats and fill Simulated stat cells. Species,
set, cost, rank and main-stat choices must match the current configuration; card
values pass canonical stat validation. Missing/incomplete/stale runs do not fill
Simulated cells. This does not persist equipment or synthesize observations.

Sonata eligibility counts distinct species through the existing inspector. Only
reviewed, permanent, modeled, additive self effects enter the projection. Source
IDs and exclusions remain visible. Conditional Weapon/Sonata/Echo effects,
Character transformations and team rotation buffs are not full combat totals.
Recommended Calc benchmark values retain their separate existing source basis;
Expected stat cells remain Pending.

Recommended retains Augusta's approved quantitative policy. Elsewhere, reviewed
source labels become ordered Flex guidance with original rank, ties and conditions.
No priorities become numeric weights, per-Echo minima, required counts or ER
thresholds. Whole-build HP conditions stay whole-build guidance. Unknown capture
syntax stays unresolved. Customize exposes the existing exact canonical tier and
count controls, preserving dormant user minima and ER choices.

## Team DPS contract

`src/teamDpsComparison.mjs` defines a common three-row Sandbox/two-row Improve
comparison contract. The latter is a reusable presentation boundary, not an account
workflow. Numeric admission requires an explicitly registered provider, exact
source/team/enemy/rotation/cycle/duration/fixed-equipment context, legal complete
runs, distinct same-run actor contributions and a matching team total. Expected
requires a registered statistical team-run model; DPS at average stats is rejected.
Deltas require two admitted rows from the same unchanged comparison.

The public provider registry is empty. Normal Recommended/Expected/Simulated DPS
therefore stays Pending. This contract does not qualify an engine, generate runs,
add an Expected producer, or turn experimental expert results into product DPS.

## Validation and next review

Focused Node regressions cover source priorities, static card validation, defaults,
provider/context/attribution admission and comparison deltas. Generator parity,
the existing production build and one focused Chromium contract interaction cover
the wiring. Browser cards are controlled HTTP fixtures, not private rolling proof.
Existing automatic UI Lab gates retain their checks and run the new regressions.
No manual FULL run or broad browser campaign is required for this slice.

Independent review should assess source priority interpretation, static scope labels,
observed-card invalidation and visual fit. Native rotation/buff/proc/resource and
same-run loadout qualification, team-specific equipment prescriptions, a statistical
Expected producer and missing exact per-Echo recommendation policies remain Pending.
