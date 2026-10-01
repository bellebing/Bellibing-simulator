import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { parseTenLevelCoefficientRow } from '../scripts/lib/character-mechanics-import.mjs';
import {
  CHARACTER_MECHANIC_FACT_BY_ID,
  CHARACTER_MECHANICS_PROFILE_BY_ID,
} from '../src/data/characterMechanics.ts';
import {
  auditCharacterActionsCoverage,
  renderCharacterActionsCoverageReport,
} from '../src/data/characterActionsCoverageAudit.ts';
import {
  BULING_ACTION_FACTS,
  DANJIN_ACTION_FACTS,
  XIANGLI_YAO_ACTION_FACTS,
} from '../src/data/characterMechanics/rosterActionCompletion.ts';

test('released-roster ACTIONS coverage is fail-closed with only exact current-source blockers', () => {
  const audit = auditCharacterActionsCoverage();

  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.verifiedCharacterIds.length, 55);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.deepEqual(audit.blockedCharacterIds, ['buling', 'xiangli-yao']);
  assert.deepEqual(audit.blockers.map((blocker) => blocker.blockerId), [
    'ACTIONS-BULING-1307031-DAMAGE-CLASS',
    'ACTIONS-XIANGLI-YAO-1305015-1305017-DAMAGE-CLASS',
  ]);
  assert.deepEqual(audit.issues, []);
});

test('ACTIONS coverage stays unchanged while Forte completion does not promote the three full Character Mechanics profiles', () => {
  const buling = CHARACTER_MECHANICS_PROFILE_BY_ID.get('buling');
  const danjin = CHARACTER_MECHANICS_PROFILE_BY_ID.get('danjin');
  const xiangli = CHARACTER_MECHANICS_PROFILE_BY_ID.get('xiangli-yao');

  for (const profile of [buling, danjin, xiangli]) {
    assert.ok(profile);
    assert.equal(profile.verificationStatus, 'PARTIALLY_VERIFIED');
    const expectedVerifiedAreas = profile.characterId === 'buling' ? 0 : 1;
    assert.equal(profile.coverage.filter((entry) => entry.status === 'VERIFIED').length, expectedVerifiedAreas);
    assert.ok(profile.coverage.filter((entry) => !['ACTIONS', 'FORTE_RULES'].includes(entry.area)).every((entry) => entry.status === 'PENDING'));
  }

  assert.equal(buling.coverage.find((entry) => entry.area === 'ACTIONS')?.status, 'PARTIAL');
  assert.equal(danjin.coverage.find((entry) => entry.area === 'ACTIONS')?.status, 'VERIFIED');
  assert.equal(xiangli.coverage.find((entry) => entry.area === 'ACTIONS')?.status, 'PARTIAL');

  for (const [characterId, facts] of [
    ['buling', BULING_ACTION_FACTS],
    ['danjin', DANJIN_ACTION_FACTS],
    ['xiangli-yao', XIANGLI_YAO_ACTION_FACTS],
  ] as const) {
    const tuneBreak = facts.filter((fact) => fact.section === 'TUNE_BREAK');
    assert.equal(tuneBreak.length, 1, characterId);
    assert.equal(tuneBreak[0].actionRole, 'SHARED_SYSTEM_DAMAGE');
    assert.equal(tuneBreak[0].damageClass, 'OTHER');
    assert.equal(tuneBreak[0].scalingStat, 'SHARED_SYSTEM');
    assert.equal(tuneBreak[0].motionValue, null);
    assert.equal(tuneBreak[0].hitCount, null);
  }
});

test('new canonical ACTION curves/components are byte-derived from the existing Skills/Forte source pipeline', async () => {
  const source = JSON.parse(await readFile(new URL('../data/source/character-forte-ui.json', import.meta.url), 'utf8'));
  const sourceCharacters = new Map(source.characters.map((character: any) => [character.characterId, character]));

  const facts = [...BULING_ACTION_FACTS, ...DANJIN_ACTION_FACTS, ...XIANGLI_YAO_ACTION_FACTS];
  for (const fact of facts) {
    if (fact.section === 'TUNE_BREAK') {
      const moveMatch = fact.notes?.[0]?.match(/move (\d+)/);
      assert.ok(moveMatch, fact.factId);
      const sourceCharacter: any = sourceCharacters.get(fact.characterId);
      const move = sourceCharacter.moves.find((candidate: any) => candidate.id === Number(moveMatch[1]));
      assert.equal(move?.type, 12, fact.factId);
      continue;
    }

    if (fact.factId === 'xiangli-yao-outro-chain-rule') {
      const sourceCharacter: any = sourceCharacters.get('xiangli-yao');
      const move = sourceCharacter.moves.find((candidate: any) => candidate.id === 1002309);
      assert.equal(move.descriptionParams[1], '237.63%');
      assert.equal(fact.sourceFixedMotionValue, 2.3763);
      assert.equal(fact.hitCount, 1);
      continue;
    }

    const identity = fact.notes?.[0]?.match(/move (\d+) .*value rows? ([\d, ]+)/);
    assert.ok(identity, fact.factId);
    const moveId = Number(identity[1]);
    const valueIds = identity[2].split(',').map((value) => Number(value.trim())).filter(Number.isFinite);
    const sourceCharacter: any = sourceCharacters.get(fact.characterId);
    const move = sourceCharacter.moves.find((candidate: any) => candidate.id === moveId);
    assert.ok(move, fact.factId);

    const parsed = valueIds.map((valueId) => {
      const value = move.values.find((candidate: any) => candidate.id === valueId);
      assert.ok(value, `${fact.factId} source row ${valueId}`);
      const parsedRow = parseTenLevelCoefficientRow(value.values);
      assert.ok(parsedRow, `${fact.factId} parse row ${valueId}`);
      return parsedRow;
    });

    if (parsed.length > 1) {
      assert.ok(parsed.every((entry) => entry.representation === 'CURVE'), fact.factId);
      assert.deepEqual(
        fact.motionValueComponents,
        parsed.map((entry: any) => ({ curve: entry.curve, hitCount: entry.hitCount })),
        fact.factId,
      );
      assert.equal(fact.hitCount, null, fact.factId);
      continue;
    }

    const [entry]: any = parsed;
    if (entry.representation === 'CURVE') {
      assert.deepEqual(fact.motionValueCurve, entry.curve, fact.factId);
      assert.equal(fact.hitCount, entry.hitCount, fact.factId);
    } else {
      assert.deepEqual(fact.motionValueComponents, entry.components, fact.factId);
      assert.equal(fact.hitCount, null, fact.factId);
    }
  }

  const bulingBlocked = CHARACTER_MECHANIC_FACT_BY_ID.get('buling-forte-five-thunders-spell-array');
  assert.equal(bulingBlocked?.verificationStatus, 'PARTIALLY_VERIFIED');
  assert.equal(bulingBlocked?.kind === 'ACTION' ? bulingBlocked.damageClass : 'wrong-kind', null);

  for (const factId of ['xiangli-yao-pivot-impale-stage-1', 'xiangli-yao-pivot-impale-stage-2', 'xiangli-yao-pivot-impale-stage-3']) {
    const fact = CHARACTER_MECHANIC_FACT_BY_ID.get(factId);
    assert.equal(fact?.verificationStatus, 'PARTIALLY_VERIFIED');
    assert.equal(fact?.kind === 'ACTION' ? fact.damageClass : 'wrong-kind', null);
  }
});

test('checked-in ACTIONS coverage report is deterministic', async () => {
  const expected = renderCharacterActionsCoverageReport();
  const actual = await readFile(new URL('../docs/CHARACTER_ACTIONS_COVERAGE.md', import.meta.url), 'utf8');
  assert.equal(actual, expected);
});
