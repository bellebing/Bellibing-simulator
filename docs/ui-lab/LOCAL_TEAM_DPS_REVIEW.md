# Local actual-team DPS review

This is an opt-in local experimental consumer of the existing fixed-scenario
adapter, not qualified product DPS. Normal Character/Team DPS and Expected DPS
remain Pending. No algorithm is added to the public application or Worker.

## Start and use

Use the paired current Draft branches in sibling Git clones.
Run `START_BELLIBING_LOCAL.bat` on Windows or
`node scripts/start-bellibing-local.mjs` from the public repository. The existing
launcher verifies sources, builds the public site, stages the existing Worker
under private ignored output and opens Build. Enter/Ctrl+C stops the server.

1. Save all three complete builds in Build. Supported local experiments include
   the preserved Augusta / Iuno / Shorekeeper pilot and 89 source-bound trios
   across 34 Characters, including Carlotta / Zhezhi / Shorekeeper and
   Aemeath / Denia / Lupa. Select the corresponding reviewed team and mode.
2. Open Improve or Sandbox, retain their supported source team, and opt into
   **Lv90 / R1 reference** in Experimental DPS (fixed cycle 2).
3. Improve: use Workshop to inspect a legal +25 Candidate. Current, Candidate and
   Change show the three individual contributions and total. Select another
   Candidate slot to review it independently; this does not equip Candidates.
4. Sandbox: complete an actual RNG run. Account / Replacement compares the copied
   account team with completed active-slot replacements. Unselected slots retain
   their account cards; this separate reference comparison is not the normal
   simulated-loadout activation projection. Reset retires the replacement.

All three builds must meet their source-bound S0/Weapon/max-skill,
Echo species/Sonata shell and whole-build ER requirements. Missing builds, invalid
cards, insufficient ER or incompatible equipment remain Pending. There is no
synthetic teammate fallback and no requirement to fabricate missing account gear.

## Observation and reference boundaries

The account reader supplies actual stored weapon IDs, Sequences, Fortes and Echo
values. Legacy account storage has no Character/Weapon level or refinement fields:
Lv90/R1 is therefore an explicit reference scenario, **not verified account
investment**. Cycle 2 is fixed. Augusta retains DEF 1520 / 10% resistance; the source-model
experiments explicitly use the source calculator enemy DEF 1592 / 20% resistance.
The tooltip shows the selected reference. Verina uses source Variation; other
Weapons retain their required signatures. Card IDs identify local measurement slots, not authenticated game items.
Ownership binds observations and comparisons; it is not account authentication.

Improve retains ACCOUNT_BUILD. Sandbox uses a detached SANDBOX_BUILD copy.
Neither calculation writes Current or account storage. Settings/resources/owner,
Character/team/mode, active slots, investment and teammate changes invalidate the
comparison. Aborted or late responses cannot restore retired values. Only the
selected Improve Candidate is compared; independent Candidate slots remain intact.

## Transport and separation

Only the local launcher enables `/local-review/team-dps`. The existing preview
binds loopback and validates Host; the handler requires same Origin, a custom
header, JSON, bounded input/output and a single bounded private child process.
No CORS access is granted. The child executes from the private checkout and returns
allowlisted aggregates, never source, coefficients, build dumps or diagnostics.
Static preview/Pages has no executor; no new private browser code is shipped.
The public dist remains engine-free with `PENDING_REVIEW` / empty release files.
The existing Worker is staged only in private ignored LOCAL_REVIEW_ONLY output.

## Additional source-model experiments

The shared adapter joins existing reviewed published rotation variants to the pinned Riley calculator. Automatic numeric evidence covers 89 distinct trios; no new team database or per-team calculator is added. Canonical standard gear selects matching source-declared options. The same selected source equipment profile defines a fixed action/hit schedule; actual observed builds must preserve it, satisfy all-member ER/cast constraints and provide all 15 legal +25 cards. Other profile bindings stay Pending.

Only actual Echo main/substats replace synthetic stat pieces. No ER rolls or missing teammate stats are invented. The UI labels numbers **Experimental · Riley source model**. Support remains S0, explicit Lv90/R1, max skills and the supported existing ordered standard Echo species/Sonata shells. Selecting another reviewed team uses the same Current/Candidate/Change or Account/Replacement table. A known composition or published timing reference alone does not make its DPS executable. There are no new qualified product teams.

The paired private source setup is invoked by the existing local launcher and
keeps source/runtime under private ignored cache. No new private algorithm is
shipped to a browser or included in the public build. Both paths reuse the same
read-only account capture, ownership, comparison and UI.

## Verification and reuse

Public capture/transport/client tests cover complete detached observations,
workspace ownership, context revisions, same-origin bounds and a late successful
response arriving after a newer Pending context. Existing team-selection and
Improve ownership tests are retained. Canonical source parity and public artifact
checks remain mandatory.

The paired private `scripts/team-dps/browser-review.mjs` exercises genuine RNG,
Build observations, real Workshop Candidates, unchanged Current/storage, teammate
invalidation, Sandbox replacement/export/reset and direct-evaluator numeric parity
in Chromium desktop/mobile. Evidence and test account exports stay private and
ignored; they must not be uploaded as public artifacts. Stdio tests compare exact
aggregates with the unchanged evaluator and reject malformed/oversized input.

The same capture, bridge, stale-response guard and table serve both workspaces and
future source-supported teams. New teams need private source-qualified execution,
not another UI/calculator. S1/S2 state variants, Mortefi's incompatible S6 capture,
other weapons/Echo shells/teams, statistical Expected DPS, native-state/live-game
qualification and hosted runtime remain Pending. Experimental is not an upgrade
verdict or permission to publish the engine.
