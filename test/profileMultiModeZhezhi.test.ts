import assert from 'node:assert/strict';
import test from 'node:test';

import { getCharacterPreflight } from '../src/data/characterPreflight.ts';
import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { PROFILE_MULTIMODE_ZHEZHI_IMPACT_REVIEWS } from '../src/data/profileMultiModeZhezhiImpact20260829.ts';
import { auditProfileReadiness } from '../src/profileReadinessRegistry.ts';
import { listCharacterPresets, resolveBuildPreset } from '../src/profileRegistry.ts';

test('Zhezhi preserves the source-conditioned Empyrean endgame and Moonlit fallback modes', () => {
  const presets = listCharacterPresets(PROFILE_REGISTRY, 'zhezhi');
  assert.deepEqual(
    presets.map((row) => [row.id, row.modeKey, row.displayLabel, row.isDefault]),
    [
      ['zhezhi-empyrean-endgame', 'empyrean-endgame', 'Endgame 5★ — Empyrean', true],
      ['zhezhi-moonlit-fallback', 'moonlit-fallback', 'Fallback — Moonlit', false],
    ],
  );
  assert.equal(presets.every((row) => row.sequence === 0 && row.verificationStatus === 'VERIFIED'), true);

  const endgame = resolveBuildPreset(PROFILE_REGISTRY, 'zhezhi-empyrean-endgame');
  const fallback = resolveBuildPreset(PROFILE_REGISTRY, 'zhezhi-moonlit-fallback');

  assert.equal(endgame.weaponRecommendation.defaultWeaponId, 'rime-draped-sprouts');
  assert.equal(endgame.weaponRecommendation.options[0]?.rank, 1);
  assert.equal(fallback.weaponRecommendation.id, endgame.weaponRecommendation.id);

  assert.deepEqual(endgame.echoLoadout.sonataSetIds, ['sonata-13']);
  assert.equal(endgame.echoLoadout.mainEchoId, 'echo-60001055');
  assert.deepEqual(fallback.echoLoadout.sonataSetIds, ['sonata-8']);
  assert.equal(fallback.echoLoadout.mainEchoId, 'echo-60000525');

  assert.match(endgame.preset.provenance.notes?.join(' ') ?? '', /9-10 CRIT-substat investment threshold/);
  assert.match(fallback.echoLoadout.provenance.notes?.join(' ') ?? '', /fallback when either.*CRIT-substat.*5-star-weapon/i);
});

test('Zhezhi keeps set-specific ER gates and Echo timing in the same Carlotta + Shorekeeper context', () => {
  const endgame = resolveBuildPreset(PROFILE_REGISTRY, 'zhezhi-empyrean-endgame');
  const fallback = resolveBuildPreset(PROFILE_REGISTRY, 'zhezhi-moonlit-fallback');

  assert.deepEqual(endgame.team.members, [
    { characterId: 'carlotta', role: 'DPS' },
    { characterId: 'zhezhi', role: 'SUB_DPS' },
    { characterId: 'the-shorekeeper', role: 'SUPPORT' },
  ]);
  assert.equal(fallback.team.id, endgame.team.id);

  assert.equal(endgame.statTarget.gates[0]?.minimum, 1.28);
  assert.equal(endgame.statTarget.gates[0]?.preferred, 1.28);
  assert.equal(fallback.statTarget.gates[0]?.minimum, 1.16);
  assert.equal(fallback.statTarget.gates[0]?.preferred, 1.16);

  assert.equal(endgame.rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.equal(fallback.rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.ok(endgame.rotation.sourceSequence.some((step) => /Lampylumen.*flexible timing/.test(step)));
  assert.ok(fallback.rotation.sourceSequence.some((step) => /Creation's Zenith \(Dash cancel into Echo\)/.test(step)));
  assert.ok(fallback.rotation.sourceSequence.some((step) => /Impermanence Heron.*switch cancel/.test(step)));
});

test('Zhezhi onboarding reviews keep both mode-specific execution gaps explicit', () => {
  assert.deepEqual(
    PROFILE_MULTIMODE_ZHEZHI_IMPACT_REVIEWS.map((row) => [row.presetId, row.reviewedSonataSetIds, row.reviewedEchoIds, row.result]),
    [
      ['zhezhi-empyrean-endgame', ['sonata-13'], ['echo-60001055'], 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['zhezhi-moonlit-fallback', ['sonata-8'], ['echo-60000525'], 'REVIEWED_WITH_PENDING_EXECUTION'],
    ],
  );
  assert.ok(PROFILE_MULTIMODE_ZHEZHI_IMPACT_REVIEWS.every((row) => row.pendingExecutionIds.length > 0));
  assert.ok(PROFILE_MULTIMODE_ZHEZHI_IMPACT_REVIEWS[0]?.pendingExecutionIds.some((id) => id.includes('S13_5PC_ACTIVE_ATK')));
  assert.ok(PROFILE_MULTIMODE_ZHEZHI_IMPACT_REVIEWS[1]?.pendingExecutionIds.includes('echo:echo-60000525:impermanence-heron-active-transfer-adapter'));
});

test('Zhezhi becomes build-ready with two verified presets but remains non-executable for DPS', () => {
  const summary = auditProfileReadiness();
  assert.deepEqual(summary.issues, []);
  const zhezhi = summary.characters.find((row) => row.characterId === 'zhezhi');
  assert.ok(zhezhi);
  assert.equal(zhezhi.disposition, 'PROFILE_COMPLETE_PENDING_FREEZE');
  assert.deepEqual(zhezhi.presetIds, ['zhezhi-empyrean-endgame', 'zhezhi-moonlit-fallback']);
  assert.deepEqual(zhezhi.verifiedPresetIds, ['zhezhi-empyrean-endgame', 'zhezhi-moonlit-fallback']);
  assert.deepEqual(zhezhi.freezeApprovalPresetIds, []);
  assert.ok(summary.profileCompletePendingFreezeIds.includes('zhezhi'));
  assert.equal(summary.profileSourcePendingIds.includes('zhezhi'), false);

  const build = getCharacterPreflight('zhezhi', 'BUILD_PROFILE');
  const dps = getCharacterPreflight('zhezhi', 'DPS_MODEL');
  assert.ok(build && dps);
  assert.equal(build.ready, true);
  assert.equal(dps.ready, false);
  assert.ok(dps.blockers.some((row) => row.area === 'ROTATION_PROFILE'));
  assert.ok(dps.blockers.some((row) => row.area === 'COMBAT_MODEL'));
});
