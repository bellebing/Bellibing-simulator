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
   the preserved Augusta / Iuno / Shorekeeper pilot and 154 source-bound trios
   across 43 Characters, including Carlotta / Zhezhi / Shorekeeper and
   Aemeath / Denia / Lupa. Select the corresponding reviewed team and mode.
2. Open Improve or Sandbox, retain their supported source team, and opt into
   **Lv90 / R1 reference** in Experimental DPS (fixed cycle 2).
3. Improve: use Workshop to inspect a legal +25 Candidate. Current, Candidate and
   Change show the three individual contributions and total. Select another
   Candidate slot to review it independently; this does not equip Candidates.
4. Sandbox: complete an actual RNG run. Account / Replacement compares the copied
   account team with completed active-slot replacements. Both sides retain account Weapons, Sequences and Fortes, even when the independent
   Sandbox loadout uses different investment. Unselected slots retain
   their account cards; this separate reference comparison is not the normal
   simulated-loadout activation projection. Reset retires the replacement.

All three builds must meet their source-bound Sequence/Weapon/max-skill,
Main Echo/active Sonata effects, canonical equipment legality and whole-build ER requirements. Missing builds, invalid
cards, insufficient ER or incompatible equipment remain Pending. There is no
synthetic teammate fallback and no requirement to fabricate missing account gear.

## Observation and reference boundaries

The account reader supplies actual stored weapon IDs, Sequences, Fortes and Echo
values. Legacy account storage has no Character/Weapon level or refinement fields:
Lv90/R1 is therefore an explicit reference scenario, **not verified account
investment**. Cycle 2 is fixed. Augusta retains DEF 1520 / 10% resistance; the source-model
experiments explicitly use the source calculator enemy DEF 1592 / 20% resistance.
The tooltip shows the selected reference. The shared Riley adapter supports S0–S2 and exact source-declared equipped R1 Weapon options. The original Augusta pilot retains its S0/signature requirements. Inactive Echo species or COST changes may compare when canonical legality, active source effects and the fixed schedule remain compatible; changing Main Echo/active Sonata effects remains a different reference. Card IDs identify local measurement slots, not authenticated game items.
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

The shared adapter joins existing reviewed published rotation variants to the pinned Riley calculator. Automatic numeric evidence covers 154 distinct trios; no new team database or per-team calculator is added. Actual Main Echo, equipped Weapon and active distinct-species Sonata bonuses select matching source-declared options. The five observed cards must satisfy canonical species/COST/membership rules and the endgame COST limit; inactive species/order and 43311/44111 layouts need not equal a recommended standard. The same selected source equipment profile defines a fixed action/hit schedule; actual observed builds must preserve it, satisfy all-member ER/cast constraints and provide all 15 legal +25 cards. Missing native equipment/effects and unmet requirements stay Pending.

Only actual Echo main/substats replace synthetic stat pieces. No ER rolls or missing teammate stats are invented. The UI labels numbers **Experimental · Riley source model**. Support includes S0–S2 and source-supported actual equipped Weapons; explicit Lv90/R1, max skills and source-supported Main Echo/Sonata profiles remain required. Selecting another reviewed team uses the same Current/Candidate/Change or Account/Replacement table. The same equipped investment establishes the fixed reference timeline for Current and Candidate; an Echo change cannot silently use another schedule. Change shows absolute DPS and the percentage against each Current actor/total; a zero baseline has no percentage. A known composition or published timing reference alone does not make its DPS executable. There are no new qualified product teams.

Three explicitly reviewed Echo identity mappings and the existing native Aero Rover R1 weapon object extend the same execution path without another calculator or public runtime change. This adds 19 source trios and unlocks thirteen canonical standard profiles (102 standards supported). All other actual profiles still require an exact native match. Source conflicts stay Pending; matching an abbreviated name does not qualify a mechanic. Hiyuki/Lucilla/Suisui and Cartethyia/Ciaccona/Aero Rover pass actual local browser review in both workspaces.

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
not another UI/calculator. S3–S6 state variants, Mortefi's incompatible S6 capture,
unsupported weapons/Main Echo/Sonata profiles/teams, statistical Expected DPS, native-state/live-game
qualification and hosted runtime remain Pending. Experimental is not an upgrade
verdict or permission to publish the engine.
