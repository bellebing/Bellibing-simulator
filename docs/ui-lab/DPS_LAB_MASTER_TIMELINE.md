# DPS Lab V1 — Native Master Timeline contract (development only)

Status: V2 source-native lifecycle candidate in PR #365; not deployed or merged.
A real private runTeam(..., true) remains the only calculator. Browser data
is a bounded, presentation-only DTO over one native reference cycle.

## Shared native clock

- BELLIBING_DPS_TIMELINE_V1 is attached to the existing
  BELLIBING_DPS_LAB_V1 response at result.timeline.
- runIdentity must match the DPS summary, all instants and all intervals.
- timebase: SOURCE_NATIVE_GAME_FRAMES_60_PER_SECOND.
- originFrame is the selected cycle's original game-frame origin. Pinned
  runRotations() starts at frame 0; TeamRun.sectionSeconds is calculated from
  native section-boundary frames in the same team run.
- dpsCycleSeconds is exactly result.durationSeconds. Team DPS remains
  result.totalDamage / result.durationSeconds. The timeline never adds damage.
- visibleEndSeconds is the maximum of cycle end, native interval ends and
  native instant times. An optional longer display window (currently 60s)
  never changes the DPS denominator.
- activeRotationSeconds: null means the executor does not expose a separately
  proven total on-field occupancy time. Do not sum overlapping actions.

## Objects and provenance

timeline.instants are points (atSeconds); timeline.intervals are spans
(startSeconds, endSeconds). Each has runIdentity, typed type, track, name,
characterId, and unique id.

| Type | Source data | Does NOT establish |
| --- | --- | --- |
| NATIVE_ACTION_START | traced ResolvedSnapshot.frame | final animation end, custom action legality |
| NATIVE_ACTION_CLOCK_SPAN | frame + frames if frames > 0 | full animation, complete on-field visit or buff lifetime |
| NATIVE_DAMAGE_LANDING | state.hits matched one-to-one by source time, member, slot and average | extra DPS damage or universal hit ownership |
| CLOCK_SPAN_OF_ACTION | interval sourceEventId references exact action instant | a buff activation |
| NATIVE_HIT_MATCH | unique hit ↔ snapshot correlation | attribution for ambiguous hits |

A hit without a unique correlation is counted in unlinkedHitCount and not
placed on an assumed track or assigned a made-up action cause. The source
damage totals are calculated ONCE by the existing native team evaluator.

All events from a chosen native cycle share one source game-frame clock.
The legacy events[] contract remains for V0 consumers; V1 never fabricates
intervals from a legacy point-only response.

## Pending boundaries

- Held-buff snapshots are not verified buff activation/expiration ledgers.
  V2 uses an actual **native Pool grant/refresh/revoke observer** to prove
  only allowlisted Inner/Supernal Stellarealm and Ages of Harvest buff
  instances. Every other buff remains Pending; no general lifecycle bridge
  is implied.
- Intro/Outro casts and swap-associated actions exist in native traces;
  Concerto gates for arbitrary user-edited swaps are not independently proven.
- Native inactive-actor actions can be shown off-field. Coordinated attack,
  Echo, summon classification and exact summon lifetimes remain partial.
- Native snapshot.frames means game-clock time *charged by a press*, including
  native cancel/timestop semantics; not necessarily the whole animation.
- Practical DPS delays are not implemented. A future profile must modify
  native scheduling, not multiply theoretical DPS by a heuristic factor.

## Tests and boundary

Public test/dpsLab.test.ts verifies typed/causal invariants, interval
geometry, same-run identity and display/cycle separation. Private
test/dps-lab.test.mjs replays a real supported native source trio. Private
test/dps-lab-bridge.test.mjs runs the actual PR #365 local HTTP bridge and
public validator against a private run. Private test/dps-lab-browser.test.mjs
uses Chromium for true five-row alignment, interval widths, details and
desktop/mobile layouts. Native browser screenshots stay in private CI.

Private optimization policy, evaluator source and account builds never enter
the public browser bundle. Improve, Build and Teams are unchanged.
No gameplay qualification or general free-rotation support is implied.

## V2: independent effects sharing the action clock

V2 does **not** introduce a second DPS system. An action causes zero or more
native damage/resource/effect consequences; a buff lives in its own native
member/team Pool and expires according to the same State's effect clock.
`NATIVE_BUFF_LIFECYCLE` is an interval independent of the native action
clock span, with explicit origin gear and triggering action/actor. Causal
`NATIVE_BUFF_ACTIVATED` and `NATIVE_BUFF_STAT_APPLIED` links connect
results. `timeline.priorSources` contains real actions that opened a buff
*before* the selected cycle; the global native frame of activation is retained
even when the visible bar is clipped to x=0. DPS summary and denominator stay
untouched. Only native stat ledger entries establish affected attacks.

See [DPS Lab V2 full source/native proof](DPS_LAB_BUFF_V2.md) for concrete
Shorekeeper/Jinhsi cases, weapon-vs-action provenance, 119 unresolved hit
analysis, and the minimum safe future pinned-source integration points.
