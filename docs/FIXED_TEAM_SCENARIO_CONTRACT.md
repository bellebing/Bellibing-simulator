# Fixed-team actual-build request

`src/fixedTeamScenario.mjs` is a transport/capture boundary over the existing
397-context / 59-Character catalog. It contains no damage, effects, rotation
execution, Character data store or provider qualification. Both Sandbox and
Improve can describe the same fixed source scenario using
`BELLIBING_FIXED_TEAM_SCENARIO_V1`.

`createFixedTeamScenarioRequest` requires the selected reviewed complete team,
three explicit builds with its declared modes, an owner/revision and the correct
`SANDBOX_BUILD` or `ACCOUNT_BUILD` kind, a selected source cycle, enemy and explicit
experimental reference acceptance. It never fills missing teammates. CAPTURED
means a detached request, **not** a validated build or qualified DPS result.
Investment, source/equipment, legal rolls and whole-team ER are the private
consumer's responsibility. Ownership is a comparison binding, not authentication.

`fixedTeamComparisonContext` retains the selected Character/team, owner/revision,
all member investment/weapon fields, cycle and enemy. Only Echo observations are
the intended comparison variable. A consumer must additionally check which
Character/slots may change and revalidate each changed build. Settings/resource
changes must advance the caller-owned revision; this module cannot invent account
identity or certify provenance from a self-described JSON object.

The private offline actual-team adapter reuses the existing immutable pilot for
Augusta/Iuno/Shorekeeper S0, maxed skills and its existing source equipment. It can
consume three real completed Sandbox owners, check each member's total ER and
compare 1–5 declared selected-member replacements without mutating Current. No
synthetic teammate fallback or new damage math is needed. The exact private
implementation/evidence belongs in the private repository.

**No public UI behavior or runtime registration changes.** The new contract is
not wired to the player-facing DPS panel or browser Worker. Normal DPS and
Expected DPS remain Pending; experimental results are not admitted by the empty
qualified-provider registry. No private source or new algorithm bundle is
published by this change. A reviewed runtime consumer remains necessary.

Mortefi's existing S6 capture is incompatible with current S0–S2 product scope.
S1/S2 source mechanics that alter the state schedule, alternative gear/teams and
missing proc/resource/timing evidence stay Pending. This adds zero qualified
product teams; source team choices must not be counted as executable DPS coverage.

Verification: the request tests cover all 397 contexts, both workspace kinds,
mode/membership/owner failures, detached input and comparison-context changes.
Existing team-selector/comparison/source-pin tests and the strict public build
remain applicable. Native RNG, numeric parity and runtime-output evidence are
kept private; no public Action checks out private code.
