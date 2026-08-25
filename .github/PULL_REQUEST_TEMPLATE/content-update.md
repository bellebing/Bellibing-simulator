# Bellibing content update

Use this template for a new/changed Character, Weapon, Sonata set, Echo or combat-affecting effect.

Reference: `docs/CONTENT_PREFLIGHT_AND_IMPACT_AUDIT.md`

## Content changed

- Content kind(s):
- IDs/names:
- Patch/version:
- Release status:

## Source verification

- [ ] DPR Calc Results checked first where a compatible quantitative benchmark exists
- [ ] Prydwen/Game8 recommendation sources checked where relevant
- [ ] Raw-data sources cross-checked where relevant
- [ ] Official/current release state checked
- [ ] Conflicted/missing values are explicit pending/null rather than guessed
- [ ] Provenance and checked date recorded

## New-content preflight

### Character, when applicable

- [ ] Identity / rarity / element / weapon type
- [ ] Lv90 HP / ATK / DEF / Max Energy
- [ ] Base CR / CD / ER + intrinsic/static nodes
- [ ] Required skill/Forte/passive/sequence facts
- [ ] Weapon Recommendation profile
- [ ] Echo/Sonata/main Echo/main-stat profile
- [ ] Stat Target + Core/Useful requirement counts + gates
- [ ] Team profile
- [ ] Rotation profile
- [ ] Character Build Preset
- [ ] DPS context remains blocked unless its own verification/parity gates pass

### Weapon, when applicable

- [ ] Lv90 Base ATK + secondary stat/value
- [ ] R1-R5 effect values
- [ ] Trigger / duration / stacks / caps / scope
- [ ] Conditional/pending portions explicit

### Sonata/Echo, when applicable

- [ ] Identity / COST / memberships
- [ ] Piece effects or active-skill facts
- [ ] Trigger / duration / stacks / scope / restrictions
- [ ] Attack facts separated from non-damage effects

## Mandatory backward-impact audit

- [ ] Candidate existing profiles were identified using compatibility, not marketing/signature labels
- [ ] Plausible old profiles were rebenchmarked under comparable contexts
- [ ] Character↔Weapon relations updated where warranted
- [ ] Echo/Sonata/main-Echo relations updated where warranted
- [ ] Team/Rotation profiles updated or versioned where warranted
- [ ] ER/stat gates rechecked when energy/stat saturation can change
- [ ] Personal/Team DPS contexts rechecked when a new support/effect can change them
- [ ] Every plausible candidate has either `impact found` or `reviewed — no impact`

### Screen performed

- New/changed Character -> existing characters potentially helped by team effects:
- New/changed Weapon -> existing same-type users screened:
- New/changed Sonata set -> compatible existing modes screened:
- New/changed Echo -> compatible main-Echo/loadout modes screened:

## Regression

- [ ] Tests pass
- [ ] Existing verified parity fixtures remain unchanged unless this PR intentionally versions them
- [ ] No WIP/unreleased content became production-routable accidentally
- [ ] No raw data was edited merely to represent a recommendation change

## Pending blockers

List anything deliberately left pending. A pending effect is not zero and must not be silently treated as inactive.
