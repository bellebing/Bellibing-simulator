import assert from 'node:assert/strict';
import test from 'node:test';

import {
  THE_SHOREKEEPER_PASSIVE_FACTS,
  THE_SHOREKEEPER_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/theShorekeeperRawFacts.ts';
import {
  applyShorekeeperStellarealmEvent,
  createShorekeeperStellarealmState,
  readShorekeeperStellarealmState,
  resolveShorekeeperStellarealmContract,
  validateShorekeeperStellarealmContract,
} from '../src/combat/shorekeeperStellarealmState.ts';

const TEAM = ['augusta', 'iuno', 'the-shorekeeper'] as const;

function liberation(atSeconds: number) {
  return {
    kind: 'SHOREKEEPER_RESONANCE_LIBERATION_CAST' as const,
    actorId: 'the-shorekeeper',
    atSeconds,
  };
}

function intro(
  actorId: string,
  atSeconds: number,
  insideStellarealm = true,
  introVariant: 'STANDARD' | 'DISCERNMENT' = 'STANDARD',
) {
  return {
    kind: 'INTRO_SKILL_CAST' as const,
    actorId,
    atSeconds,
    insideStellarealm,
    introVariant,
  };
}

function query(actorId: string, atSeconds: number, shorekeeperEnergyRegen = 2.5, insideStellarealm = true) {
  return { actorId, atSeconds, shorekeeperEnergyRegen, insideStellarealm };
}

function assertClose(actual: number, expected: number, epsilon = 1e-12) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} is not within ${epsilon} of ${expected}`);
}

test('Shorekeeper Stellarealm contract remains source-owned and exact for S0 Reference Team use', () => {
  assert.deepEqual(validateShorekeeperStellarealmContract(), []);
  const contract = resolveShorekeeperStellarealmContract();
  assert.equal(contract.sourceFactId, 'the-shorekeeper-liberation-stellarealms');
  assert.equal(contract.sourceCharacterId, 'the-shorekeeper');
  assert.equal(contract.durationSeconds, 30);
  assert.deepEqual(contract.innerCritRate, {
    energyRegenStep: 0.002,
    bonusPerStep: 0.0001,
    cap: 0.125,
  });
  assert.deepEqual(contract.supernalCritDamage, {
    energyRegenStep: 0.001,
    bonusPerStep: 0.0001,
    cap: 0.25,
  });
  assert.equal(contract.selectedSequence, 0);
  assert.equal(contract.s0DiscernmentEndsCurrentRealm, true);
  assert.equal(contract.activeRealmRecastSemantics, 'SOURCE_BOUNDARY_UNRESOLVED');
});

test('explicit in-range party Intros evolve Outer to Inner to Supernal and 250% ER reaches both caps', () => {
  let state = createShorekeeperStellarealmState(TEAM);
  state = applyShorekeeperStellarealmEvent(state, liberation(0));
  assert.deepEqual(readShorekeeperStellarealmState(state, query('augusta', 0)), {
    actorId: 'augusta',
    stage: 'OUTER',
    realmActive: true,
    appliesToActor: true,
    critRateBonus: 0,
    critDamageBonus: 0,
    startedAtSeconds: 0,
    expiresAtSeconds: 30,
  });

  state = applyShorekeeperStellarealmEvent(state, intro('iuno', 2));
  assert.deepEqual(readShorekeeperStellarealmState(state, query('augusta', 2)), {
    actorId: 'augusta',
    stage: 'INNER',
    realmActive: true,
    appliesToActor: true,
    critRateBonus: 0.125,
    critDamageBonus: 0,
    startedAtSeconds: 0,
    expiresAtSeconds: 30,
  });

  state = applyShorekeeperStellarealmEvent(state, intro('augusta', 5));
  assert.deepEqual(readShorekeeperStellarealmState(state, query('augusta', 5)), {
    actorId: 'augusta',
    stage: 'SUPERNAL',
    realmActive: true,
    appliesToActor: true,
    critRateBonus: 0.125,
    critDamageBonus: 0.25,
    startedAtSeconds: 0,
    expiresAtSeconds: 30,
  });
});

test('Stellarealm crit conversion consumes the explicit current ER sample rather than assuming timed support uptime', () => {
  let state = createShorekeeperStellarealmState(TEAM);
  state = applyShorekeeperStellarealmEvent(state, liberation(0));
  state = applyShorekeeperStellarealmEvent(state, intro('iuno', 1));
  state = applyShorekeeperStellarealmEvent(state, intro('augusta', 2));

  const belowCap = readShorekeeperStellarealmState(state, query('augusta', 3, 2.4));
  assertClose(belowCap.critRateBonus, 0.12);
  assertClose(belowCap.critDamageBonus, 0.24);

  const aboveCap = readShorekeeperStellarealmState(state, query('augusta', 3, 3.0));
  assert.equal(aboveCap.critRateBonus, 0.125);
  assert.equal(aboveCap.critDamageBonus, 0.25);
});

test('Intro evolution requires explicit in-range proof and ignores non-party Intro events', () => {
  let state = createShorekeeperStellarealmState(TEAM);
  state = applyShorekeeperStellarealmEvent(state, liberation(0));
  state = applyShorekeeperStellarealmEvent(state, intro('iuno', 1, false));
  assert.equal(readShorekeeperStellarealmState(state, query('augusta', 1)).stage, 'OUTER');

  state = applyShorekeeperStellarealmEvent(state, intro('not-a-team-member', 2));
  assert.equal(readShorekeeperStellarealmState(state, query('augusta', 2)).stage, 'OUTER');

  state = applyShorekeeperStellarealmEvent(state, intro('iuno', 3));
  assert.equal(readShorekeeperStellarealmState(state, query('augusta', 3)).stage, 'INNER');
});

test('party crit does not apply to an actor outside the realm even while the realm itself is active', () => {
  let state = createShorekeeperStellarealmState(TEAM);
  state = applyShorekeeperStellarealmEvent(state, liberation(0));
  state = applyShorekeeperStellarealmEvent(state, intro('iuno', 1));
  state = applyShorekeeperStellarealmEvent(state, intro('augusta', 2));

  assert.deepEqual(readShorekeeperStellarealmState(state, query('augusta', 3, 2.5, false)), {
    actorId: 'augusta',
    stage: 'SUPERNAL',
    realmActive: true,
    appliesToActor: false,
    critRateBonus: 0,
    critDamageBonus: 0,
    startedAtSeconds: 0,
    expiresAtSeconds: 30,
  });
});

test('S0 Discernment explicitly terminates Supernal Stellarealm', () => {
  let state = createShorekeeperStellarealmState(TEAM);
  state = applyShorekeeperStellarealmEvent(state, liberation(0));
  state = applyShorekeeperStellarealmEvent(state, intro('iuno', 1));
  state = applyShorekeeperStellarealmEvent(state, intro('augusta', 2));
  state = applyShorekeeperStellarealmEvent(state, intro('the-shorekeeper', 10, true, 'DISCERNMENT'));

  assert.deepEqual(readShorekeeperStellarealmState(state, query('augusta', 10)), {
    actorId: 'augusta',
    stage: 'NONE',
    realmActive: false,
    appliesToActor: false,
    critRateBonus: 0,
    critDamageBonus: 0,
    startedAtSeconds: null,
    expiresAtSeconds: null,
  });
});

test('exact 30s expiry is fail-closed inactive and active-realm End Loop recast remains unresolved', () => {
  let state = createShorekeeperStellarealmState(TEAM);
  state = applyShorekeeperStellarealmEvent(state, liberation(0));
  assert.equal(readShorekeeperStellarealmState(state, query('augusta', 29.999)).realmActive, true);
  assert.equal(readShorekeeperStellarealmState(state, query('augusta', 30)).realmActive, false);
  assert.throws(
    () => applyShorekeeperStellarealmEvent(state, liberation(25)),
    /recast while a Stellarealm is active is source-boundary unresolved/,
  );
});

test('Stellarealm event processing rejects retroactive events and queries', () => {
  let state = createShorekeeperStellarealmState(TEAM);
  state = applyShorekeeperStellarealmEvent(state, liberation(2));
  assert.throws(
    () => applyShorekeeperStellarealmEvent(state, intro('iuno', 1.5)),
    /non-decreasing time order/,
  );
  assert.throws(
    () => readShorekeeperStellarealmState(state, query('augusta', 1.5)),
    /precedes processed event history/,
  );
});

test('S0 runtime rejects impossible Discernment/Intro states instead of inventing sequence behavior', () => {
  assert.throws(
    () => createShorekeeperStellarealmState(TEAM, 1),
    /supports selected sequence 0 only/,
  );

  let state = createShorekeeperStellarealmState(TEAM);
  state = applyShorekeeperStellarealmEvent(state, liberation(0));
  assert.throws(
    () => applyShorekeeperStellarealmEvent(state, intro('the-shorekeeper', 1, true, 'DISCERNMENT')),
    /requires an active Supernal Stellarealm/,
  );

  state = applyShorekeeperStellarealmEvent(state, intro('iuno', 2));
  state = applyShorekeeperStellarealmEvent(state, intro('augusta', 3));
  assert.throws(
    () => applyShorekeeperStellarealmEvent(state, intro('the-shorekeeper', 4, true, 'STANDARD')),
    /must be explicit Discernment at S0/,
  );
});

test('source wording drift fails the Stellarealm contract closed', () => {
  const driftedPassiveFacts = THE_SHOREKEEPER_PASSIVE_FACTS.map((fact) =>
    fact.factId === 'the-shorekeeper-liberation-stellarealms'
      ? { ...fact, effectSummary: fact.effectSummary.replace('bonus Crit. Rate', 'Crit Rate') }
      : fact,
  );
  assert.match(
    validateShorekeeperStellarealmContract(driftedPassiveFacts, THE_SHOREKEEPER_SEQUENCE_FACTS).join('; '),
    /parseable ER-to-party-crit formulas/,
  );

  const driftedSequenceFacts = THE_SHOREKEEPER_SEQUENCE_FACTS.map((fact) =>
    fact.factId === 'the-shorekeeper-s1-unspoken-conjecture'
      ? { ...fact, effectSummary: fact.effectSummary.replace('no longer ends', 'does not modify') }
      : fact,
  );
  assert.match(
    validateShorekeeperStellarealmContract(THE_SHOREKEEPER_PASSIVE_FACTS, driftedSequenceFacts).join('; '),
    /termination override drift/,
  );
});
