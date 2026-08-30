import assert from 'node:assert/strict';
import test from 'node:test';

import { getCharacterPreflight } from '../src/data/characterPreflight.ts';
import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { PROFILE_MULTIMODE_DENIA_IMPACT_REVIEWS } from '../src/data/profileMultiModeDeniaImpact20260829.ts';
import { auditProfileReadiness } from '../src/profileReadinessRegistry.ts';
import { listCharacterPresets, resolveBuildPreset } from '../src/profileRegistry.ts';

test('Denia preserves Fusion Burst/Aemeath default and Tune Strain/Luuk alternate modes', () => {
  const presets = listCharacterPresets(PROFILE_REGISTRY, 'denia');
  assert.deepEqual(
    presets.map((row) => [row.id, row.modeKey, row.displayLabel, row.isDefault]),
    [
      ['denia-fusion-burst-aemeath', 'fusion-burst', 'Fusion Burst — Aemeath', true],
      ['denia-tune-strain-luuk', 'tune-strain', 'Tune Strain — Luuk', false],
    ],
  );
  assert.equal(presets.every((row) => row.sequence === 0 && row.verificationStatus === 'VERIFIED'), true);

  const fusion = resolveBuildPreset(PROFILE_REGISTRY, 'denia-fusion-burst-aemeath');
  const tune = resolveBuildPreset(PROFILE_REGISTRY, 'denia-tune-strain-luuk');
  assert.equal(fusion.weaponRecommendation.defaultWeaponId, 'forged-dwarf-star');
  assert.equal(fusion.weaponRecommendation.options[0]?.rank, 1);
  assert.equal(tune.weaponRecommendation.id, fusion.weaponRecommendation.id);
  assert.match(fusion.preset.provenance.notes?.join(' ') ?? '', /main reason to get\/use Denia/);
  assert.match(tune.preset.provenance.notes?.join(' ') ?? '', /Aemeath already has a strong team/);
});

test('Denia keeps source mode-specific Echo sets and existing verified team contexts', () => {
  const fusion = resolveBuildPreset(PROFILE_REGISTRY, 'denia-fusion-burst-aemeath');
  const tune = resolveBuildPreset(PROFILE_REGISTRY, 'denia-tune-strain-luuk');

  assert.deepEqual(fusion.echoLoadout.sonataSetIds, ['sonata-28']);
  assert.equal(fusion.echoLoadout.mainEchoId, 'echo-60002005');
  assert.deepEqual(tune.echoLoadout.sonataSetIds, ['sonata-31']);
  assert.equal(tune.echoLoadout.mainEchoId, 'echo-60001985');

  assert.equal(fusion.team.id, 'aemeath-denia-chisa');
  assert.deepEqual(fusion.team.members, [
    { characterId: 'aemeath', role: 'DPS' },
    { characterId: 'denia', role: 'SUB_DPS' },
    { characterId: 'chisa', role: 'SUPPORT' },
  ]);
  assert.equal(tune.team.id, 'luuk-herssen-denia-mornye');
  assert.deepEqual(tune.team.members, [
    { characterId: 'luuk-herssen', role: 'DPS' },
    { characterId: 'denia', role: 'SUB_DPS' },
    { characterId: 'mornye', role: 'SUPPORT' },
  ]);
});

test('Denia preserves Energy Regen priority without fabricating numeric gates for mismatched source contexts', () => {
  for (const presetId of ['denia-fusion-burst-aemeath', 'denia-tune-strain-luuk']) {
    const resolved = resolveBuildPreset(PROFILE_REGISTRY, presetId);
    assert.deepEqual(resolved.statTarget.gates, []);
    const er = resolved.statTarget.targetRules.find((row) => row.stat === 'Energy Regen');
    assert.ok(er);
    assert.equal(er.priority, 1);
    assert.match(er.notes ?? '', /No numeric total-ER gate/);
  }

  const fusion = resolveBuildPreset(PROFILE_REGISTRY, 'denia-fusion-burst-aemeath');
  assert.match(fusion.statTarget.provenance.notes?.join(' ') ?? '', /108%-122%.*Aemeath \+ Lupa.*Aemeath \+ Shorekeeper/);
});

test('Denia reuses the standard source rotation while preserving mode-specific Echo timing', () => {
  const fusion = resolveBuildPreset(PROFILE_REGISTRY, 'denia-fusion-burst-aemeath');
  const tune = resolveBuildPreset(PROFILE_REGISTRY, 'denia-tune-strain-luuk');

  assert.equal(fusion.rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.equal(tune.rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.ok(fusion.rotation.sourceSequence.some((step) => /Reminiscence: Denia.*source timing is flexible/.test(step)));
  assert.ok(tune.rotation.sourceSequence.some((step) => /Voidwing Moth.*swap-cancel/.test(step)));
  assert.deepEqual(
    fusion.rotation.sourceSequence.filter((step) => !step.startsWith('Echo:') && !step.startsWith('Outro')),
    tune.rotation.sourceSequence.filter((step) => !step.startsWith('Echo:') && !step.startsWith('Outro')),
  );
});

test('Denia onboarding reviews preserve both mode-specific execution gaps', () => {
  assert.deepEqual(
    PROFILE_MULTIMODE_DENIA_IMPACT_REVIEWS.map((row) => [row.presetId, row.reviewedSonataSetIds, row.reviewedEchoIds, row.result]),
    [
      ['denia-fusion-burst-aemeath', ['sonata-28'], ['echo-60002005'], 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['denia-tune-strain-luuk', ['sonata-31'], ['echo-60001985'], 'REVIEWED_WITH_PENDING_EXECUTION'],
    ],
  );
  assert.ok(PROFILE_MULTIMODE_DENIA_IMPACT_REVIEWS.every((row) => row.pendingExecutionIds.length > 0));
  assert.ok(PROFILE_MULTIMODE_DENIA_IMPACT_REVIEWS[0]?.pendingExecutionIds.some((id) => id.includes('chromatic-foam')));
  assert.ok(PROFILE_MULTIMODE_DENIA_IMPACT_REVIEWS[1]?.pendingExecutionIds.some((id) => id.includes('reel-tune-strain')));
});

test('Denia becomes build-ready with two verified presets but remains non-executable for DPS', () => {
  const summary = auditProfileReadiness();
  assert.deepEqual(summary.issues, []);
  assert.equal(summary.dpsReadyCount, 2);

  const denia = summary.characters.find((row) => row.characterId === 'denia');
  assert.ok(denia);
  assert.equal(denia.disposition, 'PROFILE_COMPLETE_PENDING_FREEZE');
  assert.deepEqual(denia.presetIds, ['denia-fusion-burst-aemeath', 'denia-tune-strain-luuk']);
  assert.deepEqual(denia.verifiedPresetIds, ['denia-fusion-burst-aemeath', 'denia-tune-strain-luuk']);
  assert.deepEqual(denia.freezeApprovalPresetIds, []);
  assert.ok(summary.profileCompletePendingFreezeIds.includes('denia'));
  assert.equal(summary.profileSourcePendingIds.includes('denia'), false);

  const build = getCharacterPreflight('denia', 'BUILD_PROFILE');
  const dps = getCharacterPreflight('denia', 'DPS_MODEL');
  assert.ok(build && dps);
  assert.equal(build.ready, true);
  assert.equal(dps.ready, false);
  assert.ok(dps.blockers.some((row) => row.area === 'ROTATION_PROFILE'));
  assert.ok(dps.blockers.some((row) => row.area === 'COMBAT_MODEL'));
});
