# Bellibing Simulator

A Wuthering Waves Echo-building decision engine.

The project is migrating the validated ideas from the V9.15 Google Sheets prototype into a versioned application architecture.

## First product question

**"I am building this character and I just rolled this Echo. What should I do with it now?"**

The answer must use actual whole-build Personal Rotation DPS and resource economics rather than generic stat-color or double-crit heuristics.

## Current foundation

- Typed build / Echo / damage contracts
- Whole-build candidate replacement analysis
- ER-gated upgrade semantics
- Per-stat contribution analysis through counterfactual DPS evaluation
- Source-backed July 2026 Echo RNG/value-tier runtime
- Verified +5/+10/+15/+20/+25 EXP/Tuner economy and recycle rates
- Upgrade Monte Carlo summary contract with failed-attempt cost included
- Product contract and V9.15 migration map
- Tests locking the first semantic invariants

## Run tests

```bash
npm test
```

No Wuthering Waves character combat values are hardcoded in the foundation. Echo RNG/economy rules are source-versioned separately from character combat data. Fresh Echo/main-stat acquisition odds and character damage parity are still pending.
