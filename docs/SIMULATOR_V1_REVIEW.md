# Simulator V1 candidate

This is a candidate for main, not a merged/deployed release. The candidate combines the static Sandbox work, UX review fixes and the user's approved compact Echo/Character presentation. GitHub owns its exact revision, CI and review evidence.

## Working scope

- Sandbox uses the existing RNG, source-bound Echo goals, policy, receipts, pre-run certified Expected Echoes/Tuners and exact-scope completed Unlimited cost comparison. Compatible Custom goals work across the 59-Character catalog; that does not qualify every Recommended/Gate/minimum combination.
- Improve reads the existing actual five-Echo account record and saved compatible Custom settings without saving, migrating or equipping anything. The displayed budget is an editable session copy. Missing/malformed owners and unsupported saved intent fail closed.
- Improve generates real observed replacement Candidates for 1–5 selected owned slots through the existing engine. Account ownership leases Current; a separate detached search owns generated Echoes. Only new observations enter the memory-only Candidate projection. Current equipment is never sent to the search as a Sandbox build or silently replaced.
- Both flows retain actual progress, Abort, Reset, histories and run-bound export. Character/settings/slot activation/budget/real-owner changes clear Candidates, histories and derived presentation before reprojection, retire the run/export, and close stale editors without restoring old rollback cards. Merely inspecting another result slot preserves all compatible Candidates and the run/export lease. Reset retains the chosen resources/settings and clears uncommitted Candidates.
- Current and each observed Candidate checkpoint use the same canonical full-build projector: four unchanged equipped Echoes plus the selected replacement, with identical Weapon/Sequence/Forte. Static same-effect/no-ER-change dominance is machine-readable evidence only, not global usefulness, auto-equip permission, cost ranking or DPS.
- Navigation retains Build a Character (the existing Build/editor route), Improve a Character, disabled Team Builder/SOON and Sandbox at the right. Initialization updates existing links without replacing the entire navigation.
- The approved card is the default: Character name in the header, source Element/weapon-type artwork, unchanged graduated S6–S1, Relevant/All replacing one table, and Current/Expected/Simulated or Current/Expected/Candidate columns. Team portraits/names align. Slot controls sit above each card. One Echo footer presents its actual lifecycle; Improve rank remains Pending.

## Preserved Pending boundaries

| Capability | Boundary |
| --- | --- |
| Improve Expected Cost / rank 1–5 | The certified generator cost is for first qualifying Echo targets from empty search slots. It is not the expected cost of a meaningful replacement. No scalar weights or Current-plus-one-tier rule is invented. True replacement economics, ties and dynamic cost ranking remain Pending. |
| Automatic Settings proposals | Source priorities and existing compatible user settings are reused. A proof that an automatically changed target is a meaningful improvement is still required; no arbitrary tier escalation is applied. |
| Expected Character stats | A matching statistical whole-build mean for these exact owners/settings is required. Legacy Calc references and the narrower Augusta example mean do not populate this column. |
| Finite/live Expected, Expected Tubes, Expected DPS | The existing certificate/model gaps remain. Actual physical receipts are still shown. |
| ER and effect trades | Account candidate search with an enabled whole-build ER constraint remains Pending because fresh Sandbox ER scope is different. Cross-stat usefulness, changed Echo effects and ER comparisons are not promoted by static deltas. |
| Production account acceptance | Candidates are observed memory-only inputs. Account identity/revision ownership, explicit equip/accept writes, migration and automated acceptance are not fabricated. Existing Build workspace remains the real equipment editor. |
| Browser motor / qualified DPS | Normal public builds contain no unapproved engine. The unchanged private candidate can be staged locally for review. Publication needs its separate exact-bundle review and GO. Browser reference/qualified team DPS remains Pending. |

## UX/text proposals not implemented

The user's approved compact design and existing controls/copy are reused. These additions need confirmation before implementation:

1. A direct entry from an empty Improve workspace to the existing Build/equipment editor. No new onboarding paragraph, popup or invented account is added.
2. An explicit account Equip/Accept action and its confirmation/undo presentation once the real owner/write contract is approved. `Use Candidate` currently commits a comparison input only.
3. Optional automatic reveal of Character results after a run on narrow desktops. The existing manual panel toggles are retained.
4. A concise recovery control for incompatible/migrating saved settings and unsupported saved roll-quality modes. Original saved data stays intact; no automatic reset or explanatory card is introduced.

These proposals do not authorize new visible text, navigation, account writes or rollout.

## Local browser preview

Build the public artifact, then run `npm run preview:v1`. Open the printed localhost Sandbox or Improve URL. Normal builds honestly retain release Pending. The real account editor remains available at `/ui-preview/`; only actual saved equipment supplies Improve Current.

A reviewer with access to the private repository can use its existing local staging command for the separately reviewed engine, then serve an isolated static review copy with `npm run preview:v1 -- --directory PATH --port 8765`. The server binds only to loopback, serves the selected static build, and never stages, approves or publishes a motor itself. Local engine evidence must remain private; public CI artifacts contain only the ordinary Pending-release build.

## Verification contract

Use one final exact-head FULL Verify and UI Lab run. The public UI checks cover the approved desktop/mobile design, owner separation, observed checkpoint/cancel, runtime Pending and source catalogs. The paired local Chromium review additionally exercises the unchanged Worker for Sandbox and 1/3/5-slot Improve, real receipts, scoped exports, fresh results, Abort/Reset and account immutability. Existing legacy fixtures and their source/host/export regressions remain exercised separately; no gate is removed.
