import assert from 'node:assert/strict';
import test from 'node:test';

import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { assertProfileReadinessAudit } from '../src/profileReadinessRegistry.ts';
import { listAlphaCharacterOptions, resolveAlphaSelection } from '../src/alphaEntryModel.ts';

const options = listAlphaCharacterOptions();
const readiness = assertProfileReadinessAudit();
const readinessById = new Map(readiness.characters.map((row) => [row.characterId, row]));

test('Alpha character choices are registry-derived released profiles with exactly one default', () => {
  assert.ok(options.length > 0);
  for (const option of options) {
    const character = CHARACTER_CATALOG.find((row) => row.id === option.characterId);
    assert.equal(character?.releaseStatus, 'RELEASED');
    assert.ok(option.presets.length > 0);
    assert.equal(option.presets.filter((preset) => preset.isDefault).length, 1);
  }
});

test('Alpha default selection resolves real profile relationships without phantom build rows', () => {
  for (const option of options) {
    const selection = resolveAlphaSelection(option.characterId);
    assert.equal(selection.character.characterId, option.characterId);
    assert.equal(selection.preset.isDefault, true);
    assert.ok(selection.weapon.name.length > 0);
    assert.equal(selection.echoes.slots.length, 5);
    assert.ok(selection.team.length === 3);
    assert.ok(selection.statPriorities.length > 0);
    if (selection.rotation.executionStatus === 'SOURCE_SEQUENCE_ONLY') {
      assert.ok(selection.rotation.sourceSequence.length > 0);
      assert.equal(selection.rotation.engineModelId, null);
    } else {
      assert.ok(selection.rotation.engineModelId);
    }
    if (selection.rollAssist.supported) {
      assert.ok(selection.rollAssist.policyId);
      assert.ok(selection.rollAssist.href?.startsWith('./roll-assistant.html?'));
    } else {
      assert.equal(selection.rollAssist.policyId, null);
      assert.equal(selection.rollAssist.href, null);
    }
  }
});

test('Alpha analysis gate mirrors readiness and executable rotation truth', () => {
  for (const option of options) {
    for (const preset of option.presets) {
      const selection = resolveAlphaSelection(option.characterId, preset.id);
      const readinessRow = readinessById.get(option.characterId)!;
      const expected = readinessRow.disposition === 'DPS_READY'
        && selection.rotation.executionStatus === 'ENGINE_MODELED'
        && selection.rotation.engineModelId !== null;
      assert.equal(selection.analysisReady, expected, `${option.characterId}/${preset.id}`);
    }
  }
});

test('current Alpha surface exposes both DPS-ready and source-only truth', () => {
  const selections = options.map((option) => resolveAlphaSelection(option.characterId));
  assert.ok(selections.some((selection) => selection.analysisReady));
  assert.ok(selections.some((selection) => !selection.analysisReady));
});

test('Alpha exposes Roll Assist only where an independently verified policy binding exists', () => {
  const augusta = resolveAlphaSelection('augusta', 'augusta-standard');
  assert.equal(augusta.analysisReady, true);
  assert.equal(augusta.rollAssist.supported, true);
  assert.equal(augusta.rollAssist.policyId, 'AUGUSTA_RECOMMENDED_V915');
  assert.equal(augusta.rollAssist.href, './roll-assistant.html?character=augusta&preset=augusta-standard');

  const ciaccona = resolveAlphaSelection('ciaccona', 'ciaccona-cartethyia-aero');
  assert.equal(ciaccona.analysisReady, true);
  assert.equal(ciaccona.rollAssist.supported, false, 'DPS_READY must not imply a roll checkpoint policy.');

  const carlotta = resolveAlphaSelection('carlotta', 'carlotta-standard');
  assert.equal(carlotta.analysisReady, false);
  assert.equal(carlotta.rollAssist.supported, false);
});
