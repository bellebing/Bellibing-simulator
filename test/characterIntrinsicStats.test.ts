import assert from 'node:assert/strict';
import test from 'node:test';

import { auditReleasedCharacterIntrinsics } from '../src/data/characterIntrinsicAudit.ts';
import {
  CHARACTER_INTRINSIC_BY_ID,
  RELEASED_CHARACTER_INTRINSIC_PENDING,
} from '../src/data/characterIntrinsicStats.ts';
import { getCharacterGameData } from '../src/data/characters.ts';

test('all 57 released characters have explicit intrinsic coverage', () => {
  const audit = auditReleasedCharacterIntrinsics();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.profileCount, 57);
  assert.deepEqual(audit.issues, []);
});

test('Mornye DEF is the only unresolved released intrinsic category', () => {
  assert.deepEqual(RELEASED_CHARACTER_INTRINSIC_PENDING, [
    {
      characterId: 'mornye',
      stat: 'DEF%',
      checkedAt: '2026-08-25',
      reason: 'Current Prydwen reports DEF% +11%; current Wutheringlab reports DEF% +15%. Do not choose either value until the discrepancy is resolved.',
    },
  ]);

  const mornye = CHARACTER_INTRINSIC_BY_ID.get('mornye');
  assert.ok(mornye);
  assert.equal(mornye.verificationStatus, 'PARTIALLY_VERIFIED');
  assert.deepEqual(mornye.stats, [{ stat: 'Healing Bonus', value: 0.10 }]);
});

test('representative non-ATK intrinsic families are preserved exactly', () => {
  const cases = [
    ['aalto', [{ stat: 'Aero DMG', value: 0.12 }, { stat: 'ATK%', value: 0.12 }]],
    ['encore', [{ stat: 'Fusion DMG', value: 0.12 }, { stat: 'ATK%', value: 0.12 }]],
    ['rover-spectro', [{ stat: 'Spectro DMG', value: 0.12 }, { stat: 'ATK%', value: 0.12 }]],
    ['taoqi', [{ stat: 'Havoc DMG', value: 0.12 }, { stat: 'DEF%', value: 0.152 }]],
    ['yuanwu', [{ stat: 'Electro DMG', value: 0.12 }, { stat: 'DEF%', value: 0.152 }]],
    ['the-shorekeeper', [{ stat: 'HP%', value: 0.12 }, { stat: 'Healing Bonus', value: 0.12 }]],
    ['suisui', [{ stat: 'Healing Bonus', value: 0.12 }, { stat: 'HP%', value: 0.12 }]],
  ] as const;

  for (const [characterId, expected] of cases) {
    assert.deepEqual(CHARACTER_INTRINSIC_BY_ID.get(characterId)?.stats, expected, characterId);
    assert.deepEqual(getCharacterGameData(characterId)?.intrinsicStats, expected, `${characterId} roster mirror`);
  }
});

test('Qingxiao current intrinsic labels are not inferred from a missing parser label', () => {
  const qingxiao = CHARACTER_INTRINSIC_BY_ID.get('qingxiao');
  assert.ok(qingxiao);
  assert.deepEqual(qingxiao.stats, [
    { stat: 'CRIT DMG', value: 0.16 },
    { stat: 'ATK%', value: 0.12 },
  ]);
  assert.ok(qingxiao.provenance.sourceLabels.some((label) => label.includes('Wutheringlab')));
});
