# Character-aware Sandbox contexts

This Draft implements the source-context and presentation slice of Issue #319,
on top of public Draft #318. It does not qualify new DPS providers.

`tools/export-character-contexts.mjs` projects the existing canonical team,
rotation, guide and Settings catalogs. Run it with `--check` to check parity.
`v1.1/modules/character-contexts.json` is generated, never a manually authored
team database. Its 59 Character records include a field-based coverage matrix:
standard configuration, source-ranked stat guidance, exact modern DEFAULT Calc
metrics, Recommended UI mapping, Hard/Flex, ER and DPS boundaries.

## Working behavior

- All 59 Characters have reviewed source team options. The selected Character is
  always the first displayed member, including when a support selects a context
  whose original anchor is another Character. Model-only discovery is excluded.
- Default selection uses explicit reviewed context-ID/source/mode bindings from
  `data/source/prydwen-sandbox-default-bindings-2026-10-18.json`, resolved by
  `src/characterDefaultTeams.mjs`. Multiple alternatives never block a reviewed
  default. All 59 have one: 27 explicit guide standards and 32 member standards.
  Member standards need not equal the carry's own default or be globally ranked.
- The first published source mode is used where the guide distinguishes modes
  (Aemeath: Fusion Burst; Tune Rupture remains selectable). Explicit source
  rationale resolves choices such as Camellya/Lynae/Mornye, Phrolova/Lucilla/
  Qiuyuan, and hybrid Iuno in Jingran/Iuno/Shorekeeper. Source array order is
  never treated as a rank; Roccia appearing before Lynae does not override the
  guide's explicit preference for Lynae in Camellya teams.
- Support/Sub-DPS pages include contexts anchored by another carry. The selected
  Character leads the visible columns only; original carry, roles and mode are
  retained. Lupa uses Galbrena/Lupa/Mornye, for example, without becoming carry.
- The 390 existing reviewed guide contexts remain available. Five existing
  catalog trios previously labelled model-only receive explicit Prydwen prose
  composition bindings; unrelated model discovery remains excluded. Original
  model evidence and modes are not promoted to verified execution. Two missing
  source-explicit trios extend the same context registry: Chixia/Brant/Lupa and
  Lingyang/Lynae/Mornye. Their timing variants remain empty/Pending. The browser
  projection exposes 397 source-bound contexts, with no duplicate team roster.
- Each default retains source owner, URL, source-lines hash, locators, decision,
  modes and conditions. The capture's image-only Example Team rosters remain
  unverified: these bindings use explicit guide prose/reviewed standard or member
  context decisions, and do not claim image extraction for all Team #1 panels.
- The same Team DPS panel follows both Character Stats and Simulation Stats.
  Portraits/names appear once above four equal value columns. Recommended,
  Expected and Simulated are horizontal rows, with per-cell Pending reasons.
- Source details join all three members to existing standard Weapon/Echo-shell
  configurations and retain team mode, conditions, rotation references, timing
  variant/resource coverage and provenance. A standard shell is not a complete
  numeric baseline or team-specific gear prescription.
- Team choices live in each detached Character state. A team change advances
  the context revision, invalidates results and clears the expert evaluation
  context. These reference choices are not passed off as executable host teams.
- Recommended opens source guidance for all 59 Characters, including original
  priorities, endgame strings, conditions and source measurement/sequence basis.
  Augusta retains its approved quantitative Hard/Flex policy. For the other
  Characters, Recommended maps reviewed source labels to ordered Flex priorities
  without inventing minima, counts or ER targets. Original conditions and ties
  remain attached; unknown aliases stay unresolved. Explicit Customize enables
  canonical per-Echo controls. Dormant minima and custom ER intent are preserved.
- The compact Character Target now uses each Character's existing modern DEFAULT
  Calc projection (19 covered identities), without a guide fallback.
- Host diagnostics live under Simulation details beside SIMULATE. Resource Cost
  retains its own cost details; repeated DPR/DPS Pending text is removed.

## Phrolova / Frolova

The canonical identity is `phrolova`. The reviewed Prydwen capture lists
`CRIT RATE = CRIT DMG > ATK% > Skill DMG% > ATK`, `60%+ (before Echo set bonuses)`
and `215-260%+ (before any Aftersound stacks)`. These now appear in Recommended
source guidance. This capture contains no numeric ER target. Neither conditional
total-stat ranges nor priorities establish per-Echo Hard requirements, Flex
minimum/count or an unconditional crit threshold. Those mappings remain Pending;
BUG-042 is not closed.

## Pending and review mode

All three normal DPS rows remain Pending: no approved complete Recommended
baseline, statistical Expected team-DPS producer or qualified Simulated team
provider is introduced. There is no DPS delta, E[DPS] approximation or implied
buff uptime. The follow-up [static stats and comparison contract](SANDBOX_BUILD_STATS.md)
adds source-backed static components and a shared versioned comparison boundary.
Full conditional combat stats, qualified numeric team comparisons and account
integration remain Pending.

`?sandbox=true&review=expert` exposes a separate collapsed synthetic-reference
review control for Augusta. Explicit opt-in retains the existing private host's
strict qualification and same-call contribution/total guard. Its experimental
values never populate the normal comparison rows or define a default source
team. The [observed Echo comparison](OBSERVED_ECHO_SCENARIO.md) reuses this fixed
scenario for same-run one-Echo alternatives and experimental aggregate deltas. Normal product mode has no synthetic DPS selector.

## Verification boundary

FAST: generated parity and focused default/context/ownership/Custom/Pending
tests; the existing strict build evidence covers the unchanged build pipeline. One focused Chromium interaction checks panel sharing, explicit
team selection, Character changes and Phrolova guidance. Existing automatic UI
Lab Review retains its width/host/export gates and includes the new regression.
Independent final source/visual/runtime review remains required. No extra FULL,
private research reproduction, merge, deployment or account write is performed.

Next independent review should inspect the explicit default-source decisions
(particularly source-standard versus member-standard choices), mode/gear
compatibility, per-Character switching and panel layout at the existing desktop
widths. Actual private-host qualification is needed before introducing numeric
comparison rows; a public UI test cannot establish that qualification.
