import assert from 'node:assert/strict';
import test from 'node:test';

import { getCharacterPreflight } from '../src/data/characterPreflight.ts';
import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { auditProfileReadiness } from '../src/profileReadinessRegistry.ts';
import { resolveBuildPreset } from '../src/profileRegistry.ts';

test('Aalto promotes only the source-fixed Hybrid/Jiyan mode and keeps it non-executable', () => {
  const presets = [...PROFILE_REGISTRY.presets.values()].filter((row) => row.characterId === 'aalto');
  assert.equal(presets.length, 1);

  const preset = presets[0]!;
  assert.equal(preset.id, 'aalto-hybrid-jiyan');
  assert.equal(preset.modeKey, 'hybrid-jiyan');
  assert.equal(preset.sequence, 6);
  assert.equal(preset.isDefault, true);
  assert.equal(preset.uiSelectable, true);

  const resolved = resolveBuildPreset(PROFILE_REGISTRY, preset.id);
  assert.equal(resolved.weaponRecommendation.defaultWeaponId, 'static-mist');
  assert.deepEqual(resolved.echoLoadout.sonataSetIds, ['sonata-8']);
  assert.equal(resolved.echoLoadout.mainEchoId, 'echo-60000525');
  assert.deepEqual(resolved.team.members, [
    { characterId: 'jiyan', role: 'DPS' },
    { characterId: 'aalto', role: 'SUB_DPS' },
    { characterId: 'the-shorekeeper', role: 'SUPPORT' },
  ]);
  assert.equal(resolved.rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.deepEqual(resolved.rotation.sourceSequence, [
    "Skill: Mist Avatar (during another character's rotation to allow for cooldown)",
    'Intro',
    'Ultimate',
    'Skill: Mist Avatar (after Basics if still on cooldown)',
    'Basic P1',
    'Basic P2',
    'Basic P3',
    'Basic P4',
    'Basic P5',
    'Echo: Impermanence Heron',
    'Outro to Jiyan',
  ]);
});

test('Aalto Hybrid uses the Jiyan + Shorekeeper ER context instead of collapsing both source modes', () => {
  const resolved = resolveBuildPreset(PROFILE_REGISTRY, 'aalto-hybrid-jiyan');
  assert.deepEqual(resolved.statTarget.gates, [
    {
      stat: 'Energy Regen Total',
      minimum: 1.6,
      preferred: 1.6,
      notes: 'Prydwen upper Hybrid estimate is explicitly based on Jiyan + Shorekeeper. The lower 145% estimate belongs to Iuno + Shorekeeper and is not silently reused for this exact team.',
    },
  ]);
  assert.match(resolved.preset.provenance.notes?.join(' ') ?? '', /Main DPS remains a separate unpromoted mode/);
});

test('Aalto stays profile-complete pending freeze but not DPS-ready as other profiles are added', () => {
  const summary = auditProfileReadiness();
  assert.deepEqual(summary.issues, []);
  assert.equal(summary.dpsReadyCount, 2);

  const aalto = summary.characters.find((row) => row.characterId === 'aalto');
  assert.ok(aalto);
  assert.equal(aalto.disposition, 'PROFILE_COMPLETE_PENDING_FREEZE');
  assert.deepEqual(aalto.verifiedPresetIds, ['aalto-hybrid-jiyan']);
  assert.ok(summary.profileCompletePendingFreezeIds.includes('aalto'));
  assert.equal(summary.profileSourcePendingIds.includes('aalto'), false);

  const build = getCharacterPreflight('aalto', 'BUILD_PROFILE');
  const dps = getCharacterPreflight('aalto', 'DPS_MODEL');
  assert.ok(build && dps);
  assert.equal(build.ready, true);
  assert.equal(dps.ready, false);
  assert.ok(dps.blockers.some((row) => row.area === 'ROTATION_PROFILE'));
  assert.ok(dps.blockers.some((row) => row.area === 'COMBAT_MODEL'));
});
