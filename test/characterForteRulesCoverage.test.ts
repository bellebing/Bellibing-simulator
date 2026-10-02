import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { auditCharacterActionsCoverage } from '../src/data/characterActionsCoverageAudit.ts';
import {
  auditCharacterForteRulesCoverage,
  renderCharacterForteRulesCoverageReport,
} from '../src/data/characterForteRulesCoverageAudit.ts';
import {
  CHARACTER_MECHANIC_FACT_BY_ID,
  CHARACTER_MECHANICS_PROFILE_BY_ID,
} from '../src/data/characterMechanics.ts';

test('released roster FORTE_RULES coverage is deterministic and fail-closed', () => {
  const audit = auditCharacterForteRulesCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.verifiedCharacterIds.length, 55);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.deepEqual(audit.blockedCharacterIds, ['buling', 'danjin']);
  assert.deepEqual(
    audit.blockers.map((blocker) => blocker.blockerId),
    [
      'FORTE-BULING-1307031-DAMAGE-CLASS',
      'FORTE-DANJIN-1000807-FULL-POWER-THRESHOLD',
    ],
  );
  assert.deepEqual(audit.issues, []);
});

test('PR221 ACTIONS coverage stays exactly unchanged', () => {
  const audit = auditCharacterActionsCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.verifiedCharacterIds.length, 55);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.deepEqual(audit.blockedCharacterIds, ['buling', 'xiangli-yao']);
  assert.deepEqual(
    audit.blockers.map((blocker) => blocker.blockerId),
    [
      'ACTIONS-BULING-1307031-DAMAGE-CLASS',
      'ACTIONS-XIANGLI-YAO-1305015-1305017-DAMAGE-CLASS',
    ],
  );
});

test('Forte coverage stays unchanged while OUTRO completion does not promote the three partial full mechanics profiles', () => {
  const buling = CHARACTER_MECHANICS_PROFILE_BY_ID.get('buling');
  const danjin = CHARACTER_MECHANICS_PROFILE_BY_ID.get('danjin');
  const xiangli = CHARACTER_MECHANICS_PROFILE_BY_ID.get('xiangli-yao');

  assert.equal(buling?.verificationStatus, 'PARTIALLY_VERIFIED');
  assert.equal(danjin?.verificationStatus, 'PARTIALLY_VERIFIED');
  assert.equal(xiangli?.verificationStatus, 'PARTIALLY_VERIFIED');

  assert.equal(buling?.coverage.find((entry) => entry.area === 'FORTE_RULES')?.status, 'PARTIAL');
  assert.equal(danjin?.coverage.find((entry) => entry.area === 'FORTE_RULES')?.status, 'PARTIAL');
  assert.equal(xiangli?.coverage.find((entry) => entry.area === 'FORTE_RULES')?.status, 'VERIFIED');

  for (const profile of [buling, danjin, xiangli]) {
    assert.equal(profile?.coverage.find((entry) => entry.area === 'INHERENT_PASSIVES')?.status, 'VERIFIED');
    assert.equal(profile?.coverage.find((entry) => entry.area === 'OUTRO_EFFECT')?.status, 'VERIFIED');
    assert.equal(profile?.coverage.find((entry) => entry.area === 'RESOURCE_RULES')?.status, 'PENDING');
    assert.equal(profile?.coverage.find((entry) => entry.area === 'SEQUENCES')?.status, 'PENDING');
  }
});

test('new Forte rule facts re-derive source-explicit thresholds and transformations from the pinned Skills/Forte payload', async () => {
  const source = JSON.parse(await readFile('data/source/character-forte-ui.json', 'utf8'));
  const byId = new Map(source.characters.map((character: { characterId: string }) => [character.characterId, character]));

  const buling = byId.get('buling') as any;
  const bulingForte = buling.moves.find((move: any) => move.id === 1004307);
  assert.deepEqual(bulingForte.descriptionParams, ['2', '2', '24', '10%', '25%']);
  assert.match(bulingForte.description, /Minor Yang and Minor Yin/);
  assert.match(bulingForte.description, /Thunder Spell - Heaven, Earth, Mind/);

  const danjin = byId.get('danjin') as any;
  const danjinForte = danjin.moves.find((move: any) => move.id === 1000807);
  assert.deepEqual(danjinForte.descriptionParams, ['60', '120', '120', '120']);
  assert.match(danjinForte.description, /reaches over \{1\}/);
  assert.match(danjinForte.description, /hold up to \{3\} Ruby Blossom/);

  const xiangli = byId.get('xiangli-yao') as any;
  const intuition = xiangli.moves.find((move: any) => move.id === 1002303);
  const forte = xiangli.moves.find((move: any) => move.id === 1002307);
  assert.deepEqual(intuition.descriptionParams, ['3', '1']);
  assert.equal(intuition.values.find((value: any) => value.id === 1305020).values[0], '24');
  assert.deepEqual(forte.descriptionParams, ['100', '5', '100', '5', '1', '2', '2', '3', '100', '5', '2']);
});

test('unsupported Forte semantics remain explicitly pending instead of guessed', () => {
  const bulingArray = CHARACTER_MECHANIC_FACT_BY_ID.get('buling-forte-five-thunders-spell-array');
  const danjinThreshold = CHARACTER_MECHANIC_FACT_BY_ID.get('danjin-forte-full-power-threshold-conflict');
  const xiangliRevamp = CHARACTER_MECHANIC_FACT_BY_ID.get('xiangli-yao-forte-revamp-follow-up');

  assert.equal(bulingArray?.verificationStatus, 'PARTIALLY_VERIFIED');
  assert.equal(bulingArray?.modelingStatus, 'PENDING_INTERPRETATION');
  assert.equal(danjinThreshold?.verificationStatus, 'PENDING');
  assert.equal(danjinThreshold?.modelingStatus, 'PENDING_INTERPRETATION');
  assert.equal(xiangliRevamp?.verificationStatus, 'VERIFIED');
  assert.equal(xiangliRevamp?.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(xiangliRevamp?.notes?.join(' ') ?? '', /no numeric input window/i);
});

test('checked-in FORTE_RULES report matches the canonical deterministic render', async () => {
  const expected = renderCharacterForteRulesCoverageReport();
  const current = await readFile('docs/CHARACTER_FORTE_RULES_COVERAGE.md', 'utf8');
  assert.equal(current, expected);
});
