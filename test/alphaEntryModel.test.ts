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
    assert.ok(selection.rotation.sourceSequence.length > 0);
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
