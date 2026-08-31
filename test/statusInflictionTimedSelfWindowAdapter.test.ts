import assert from 'node:assert/strict';
import test from 'node:test';

import {
  activateSonataStatusInflictionWindow,
  activateWeaponStatusInflictionWindow,
  isStatusInflictionWindowActive,
  STATUS_INFLICTION_WINDOW_CONTRACTS,
  STATUS_INFLICTION_WINDOW_SEMANTIC_SPLIT,
  validateStatusInflictionWindowContracts,
} from '../src/combat/statusInflictionTimedSelfWindowAdapter.ts';

test('status-infliction contracts stay source-clean for Everbright Polestar and Trailblazing Star', () => {
  assert.deepEqual(validateStatusInflictionWindowContracts(), []);
  assert.equal(STATUS_INFLICTION_WINDOW_CONTRACTS.length, 4);
  assert.equal(STATUS_INFLICTION_WINDOW_SEMANTIC_SPLIT.adapterId, 'status-infliction-timed-self-window-v1');
  assert.equal(STATUS_INFLICTION_WINDOW_SEMANTIC_SPLIT.requiresProfileEventTimeline, true);

  for (const contract of STATUS_INFLICTION_WINDOW_CONTRACTS) {
    assert.equal(contract.expectedDurationSeconds, 8);
    assert.deepEqual(contract.triggerEvents, [
      'FUSION_BURST_INFLICTED',
      'TUNE_RUPTURE_SHIFTING_INFLICTED',
    ]);
  }
});

test('Everbright Polestar windows require an explicit owner status-infliction event and preserve rank values', () => {
  const fusionBurst = activateWeaponStatusInflictionWindow({
    effectId: 'EP-LIB-DEF',
    ownerId: 'aemeath',
    event: { kind: 'FUSION_BURST_INFLICTED', actorId: 'aemeath', atSeconds: 12.5 },
  });
  assert.ok(fusionBurst);
  assert.deepEqual(
    [fusionBurst.sourceKind, fusionBurst.sourceId, fusionBurst.value, fusionBurst.startedAtSeconds, fusionBurst.expiresAtSeconds],
    ['WEAPON', 'everbright-polestar', 0.32, 12.5, 20.5],
  );
  assert.equal(isStatusInflictionWindowActive(fusionBurst, 20.499), true);
  assert.equal(isStatusInflictionWindowActive(fusionBurst, 20.5), false);

  const tuneRuptureR5 = activateWeaponStatusInflictionWindow({
    effectId: 'EP-LIB-FUSION-RES',
    ownerId: 'aemeath',
    rank: 5,
    event: { kind: 'TUNE_RUPTURE_SHIFTING_INFLICTED', actorId: 'aemeath', atSeconds: 3 },
  });
  assert.ok(tuneRuptureR5);
  assert.equal(tuneRuptureR5.value, 0.30);
  assert.equal(tuneRuptureR5.triggerEvent, 'TUNE_RUPTURE_SHIFTING_INFLICTED');

  assert.equal(
    activateWeaponStatusInflictionWindow({
      effectId: 'EP-LIB-DEF',
      ownerId: 'aemeath',
      event: { kind: 'FUSION_BURST_INFLICTED', actorId: 'denia', atSeconds: 1 },
    }),
    null,
  );
});

test('Trailblazing Star branches activate from either exact status kind without blanket uptime', () => {
  const crit = activateSonataStatusInflictionWindow({
    effectId: 'S27_5PC_CR',
    ownerId: 'aemeath',
    event: { kind: 'FUSION_BURST_INFLICTED', actorId: 'aemeath', atSeconds: 7 },
  });
  const fusion = activateSonataStatusInflictionWindow({
    effectId: 'S27_5PC_FUSION',
    ownerId: 'aemeath',
    event: { kind: 'TUNE_RUPTURE_SHIFTING_INFLICTED', actorId: 'aemeath', atSeconds: 9 },
  });
  assert.ok(crit && fusion);
  assert.deepEqual([crit.statOrEffect, crit.value, crit.expiresAtSeconds], ['CRIT Rate', 0.20, 15]);
  assert.deepEqual([fusion.statOrEffect, fusion.value, fusion.expiresAtSeconds], ['Fusion DMG Bonus', 0.20, 17]);

  assert.equal(
    activateSonataStatusInflictionWindow({
      effectId: 'S27_5PC_CR',
      ownerId: 'aemeath',
      event: { kind: 'FUSION_BURST_INFLICTED', actorId: 'chisa', atSeconds: 7 },
    }),
    null,
  );
});

test('status-infliction primitive rejects malformed event timing instead of inventing a timestamp', () => {
  assert.throws(
    () => activateWeaponStatusInflictionWindow({
      effectId: 'EP-LIB-DEF',
      ownerId: 'aemeath',
      event: { kind: 'FUSION_BURST_INFLICTED', actorId: 'aemeath', atSeconds: Number.NaN },
    }),
    /finite non-negative number/,
  );
  assert.throws(
    () => activateSonataStatusInflictionWindow({
      effectId: 'S27_5PC_CR',
      ownerId: 'aemeath',
      event: { kind: 'TUNE_RUPTURE_SHIFTING_INFLICTED', actorId: 'aemeath', atSeconds: -1 },
    }),
    /finite non-negative number/,
  );
});
