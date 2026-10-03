import test from 'node:test';
import assert from 'node:assert/strict';
import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { IMPROVE_POLICY_SOURCE_REVIEW } from '../src/data/improvePolicySourceReview.ts';
import { resolveBuildPreset } from '../src/profileRegistry.ts';
import type { ProfileRegistry } from '../src/profileRegistry.ts';
import type { ResolvedBuildPreset } from '../src/profileDomain.ts';
import { resolveRollAssistProfileBinding } from '../src/rollAssistProfileRegistry.ts';
import { AUGUSTA_RECOMMENDED_V915 } from '../src/characters/augustaRecommended.ts';
import { projectImproveSettingsSources } from '../src/improveSettingsProjection.ts';
import {
  improvePolicySourceBinding, projectRecommendedImprovePolicy, projectReleasedImprovePolicies,
} from '../src/improvePolicySources.ts';
import type { PolicySection } from '../src/improvePolicyDomain.ts';

function content<T>(section: PolicySection<T>): T {
  assert.equal(section.status, 'VERIFIED');
  if (section.status !== 'VERIFIED') throw new Error(section.reason);
  assert.equal(section.content, 'PRESENT');
  assert.equal(section.origin, 'PROFILE');
  return section.value;
}

function changedRegistry(change: (resolved: ResolvedBuildPreset) => void): ProfileRegistry {
  const resolved = structuredClone(resolveBuildPreset(PROFILE_REGISTRY, 'augusta-standard'));
  change(resolved);
  return {
    ...PROFILE_REGISTRY,
    presets: new Map(PROFILE_REGISTRY.presets).set('augusta-standard', resolved.preset),
    statTargets: new Map(PROFILE_REGISTRY.statTargets).set('augusta-recommended-targets-v915-current', resolved.statTarget),
    echoLoadouts: new Map(PROFILE_REGISTRY.echoLoadouts).set(resolved.echoLoadout.id, resolved.echoLoadout),
    teams: new Map(PROFILE_REGISTRY.teams).set(resolved.team.id, resolved.team),
    rotations: new Map(PROFILE_REGISTRY.rotations).set(resolved.rotation.id, resolved.rotation),
  };
}

test('Augusta separates numeric ER targets from priorities without inventing CRIT totals', async () => {
  const result = await projectRecommendedImprovePolicy({ characterId: 'augusta' });
  assert.equal(result.mode, 'RECOMMENDED');
  assert.equal(result.presetId, 'augusta-standard');
  const numeric = content(result.characterTarget.numericTargets);
  assert.deepEqual(numeric, [{ metric: 'TOTAL_ENERGY_REGEN', unit: 'RATIO', minimum: 1.16, preferred: 1.25,
    basis: { kind: 'SOURCE_DESCRIBED', comparisonStatus: 'PENDING',
      description: resolveBuildPreset(PROFILE_REGISTRY, 'augusta-standard').statTarget.gates[0]!.notes } }]);
  assert.deepEqual(content(result.characterTarget.priorities), [
    { stat: 'Energy Regen', priorityGroup: 1,
      condition: { kind: 'SOURCE_DESCRIBED', text: 'Until the source-backed total ER requirement is satisfied.' } },
    { stat: 'CRIT Rate', priorityGroup: 2, condition: null },
    { stat: 'CRIT DMG', priorityGroup: 2, condition: null },
    { stat: 'ATK%', priorityGroup: 3, condition: null },
    { stat: 'Heavy Attack DMG', priorityGroup: 3, condition: null },
  ]);
  assert.ok(numeric.every(row => !row.metric.includes('CRIT')));
});

test('Augusta retains exact context, source basis and provenance without claiming static comparability', async () => {
  const resolved = resolveBuildPreset(PROFILE_REGISTRY, 'augusta-standard');
  const result = await projectRecommendedImprovePolicy({ characterId: 'augusta' });
  const section = result.characterTarget.numericTargets;
  content(section);
  if (section.status !== 'VERIFIED') return;
  assert.deepEqual(section.source.provenance, resolved.statTarget.provenance);
  assert.equal(section.source.sourceId, resolved.statTarget.id);
  assert.equal(section.source.applicability.teamProfileId, 'augusta-iuno-shorekeeper');
  assert.equal(section.source.applicability.rotationProfileId, resolved.rotation.id);
  assert.equal(section.source.applicability.sequence, 0);
  assert.equal(section.source.applicability.echoLoadoutProfileId, resolved.echoLoadout.id);
  assert.equal(section.source.sourceBinding.length, 64);
  assert.equal(section.source.applicability.contextBinding.length, 64);
  assert.equal(section.value[0]!.basis.comparisonStatus, 'PENDING');
});

test('registered Augusta roll policy maps two individual requirements and one any-Useful group exactly', async () => {
  const result = await projectRecommendedImprovePolicy({ characterId: 'augusta', presetId: 'augusta-standard' });
  assert.deepEqual(content(result.echoPolicy.requirements), {
    requiredOnEveryEcho: [{ stat: 'CRIT DMG', minimum: 0.21 }, { stat: 'CRIT Rate', minimum: 0.093 }],
    groups: [{ id: 'AUGUSTA_RECOMMENDED_V915:USEFUL', minimumHits: 1, members: [
      { stat: 'ATK%', minimum: 0.064 }, { stat: 'Energy Regen', minimum: 0.068 },
      { stat: 'Heavy Attack DMG', minimum: 0.064 },
    ] }],
    acceptanceConstraints: { nonTargetRoles: AUGUSTA_RECOMMENDED_V915.nonTargetRoles, maximumDeadStats: 1 },
  });
  assert.equal(result.echoPolicy.scope, 'FINISHED_CANDIDATE_ECHO');
  assert.deepEqual(result.echoPolicy.checkpointReference, AUGUSTA_RECOMMENDED_V915);
  assert.equal(result.echoPolicy.preferences.status, 'PENDING');
  assert.equal(result.echoPolicy.preferences.value, null);
  if (result.echoPolicy.requirements.status === 'VERIFIED') {
    assert.equal(result.echoPolicy.requirements.source.provenance, AUGUSTA_RECOMMENDED_V915.provenance);
  }
});

test('verified build priorities never establish per-Echo requirements or preference order', async () => {
  const result = await projectRecommendedImprovePolicy({ characterId: 'cartethyia' });
  const priorities = content(result.characterTarget.priorities);
  assert.ok(priorities.some(row => row.stat === 'CRIT Rate'));
  assert.equal(result.echoPolicy.requirements.status, 'PENDING');
  assert.equal(result.echoPolicy.requirements.value, null);
  assert.equal(result.echoPolicy.preferences.status, 'PENDING');
  assert.equal(result.echoPolicy.checkpointReference, null);
});

test('priority-only source remains useful while prose numeric ranges are not promoted', async () => {
  const result = await projectRecommendedImprovePolicy({ characterId: 'chixia' });
  content(result.characterTarget.priorities);
  assert.equal(result.characterTarget.numericTargets.status, 'PENDING');
  assert.equal(result.characterTarget.numericTargets.value, null);
});

test('pre-effect basis and source-level conditions survive unchanged', async () => {
  const result = await projectRecommendedImprovePolicy({ characterId: 'the-shorekeeper' });
  const targets = content(result.characterTarget.numericTargets);
  assert.equal(targets[0]!.minimum, 2.3);
  assert.equal(targets[0]!.preferred, undefined);
  assert.match(targets[0]!.basis.description!, /before the \+10% Fallacy.*\+10% passive/);
  const section = result.characterTarget.priorities;
  content(section);
  if (section.status === 'VERIFIED') {
    assert.deepEqual(section.source.provenance,
      resolveBuildPreset(PROFILE_REGISTRY, result.presetId!).statTarget.provenance);
  }
});

test('unsupported source names, unavailable presets and Character/context mismatches fail closed', async () => {
  for (const input of [
    { characterId: 'qiuyuan' }, { characterId: 'baizhi' }, { characterId: 'unknown' },
    { characterId: 'augusta', presetId: 'missing' },
    { characterId: 'cartethyia', presetId: 'augusta-standard' },
  ]) {
    const result = await projectRecommendedImprovePolicy(input);
    assert.equal(result.characterTarget.priorities.status, 'PENDING');
    assert.equal(result.characterTarget.priorities.value, null);
    assert.equal(result.echoPolicy.requirements.status, 'PENDING');
    assert.equal(result.echoPolicy.requirements.value, null);
  }
});

test('target values, conditional notes and provenance drift invalidate Character source sections independently', async () => {
  const changes: ((resolved: ResolvedBuildPreset) => void)[] = [
    row => { row.statTarget.gates = [{ ...row.statTarget.gates[0]!, minimum: 1.17 }]; },
    row => { row.statTarget.gates = [{ ...row.statTarget.gates[0]!, preferred: 1.26 }]; },
    row => { row.statTarget.targetRules = row.statTarget.targetRules.map(rule => ({ ...rule, notes: 'different condition' })); },
    row => { row.statTarget.provenance = { ...row.statTarget.provenance, checkedAt: '2026-10-04' }; },
    row => { row.statTarget.verificationStatus = 'PENDING'; },
    row => { row.statTarget.characterId = 'cartethyia'; },
  ];
  for (const change of changes) {
    const result = await projectRecommendedImprovePolicy({ characterId: 'augusta' }, { registry: changedRegistry(change) });
    assert.equal(result.characterTarget.numericTargets.status, 'PENDING');
    assert.equal(result.characterTarget.priorities.status, 'PENDING');
    // Independent readiness: unchanged registered Echo policy is still valid.
    content(result.echoPolicy.requirements);
  }
});

test('preset, team, Echo shell and rotation/provenance drift invalidate applicability', async () => {
  const changes: ((resolved: ResolvedBuildPreset) => void)[] = [
    row => { row.preset.sequence = 1; },
    row => { row.preset.modeKey = 'different'; },
    row => { row.team.members = [{ characterId: 'augusta', role: 'DPS' }]; },
    row => { row.echoLoadout.slots = []; },
    row => { row.rotation.provenance = { ...row.rotation.provenance, checkedAt: '2026-10-04' }; },
  ];
  for (const change of changes) {
    const result = await projectRecommendedImprovePolicy({ characterId: 'augusta' }, { registry: changedRegistry(change) });
    assert.equal(result.characterTarget.numericTargets.status, 'PENDING');
    assert.equal(result.characterTarget.priorities.status, 'PENDING');
    assert.equal(result.echoPolicy.requirements.status, 'PENDING');
    assert.equal(result.echoPolicy.checkpointReference, null);
  }
});

test('registered roll thresholds, required hits, roles, slots, identity and provenance drift fail closed', async () => {
  const original = resolveRollAssistProfileBinding('augusta-standard')!;
  const changes: ((binding: typeof original) => void)[] = [
    row => { row.policy.targets = row.policy.targets.map(target => ({ ...target, minimum: 0.01 })); },
    row => { row.policy.requiredCoreHits = 1; },
    row => { row.policy.requiredUsefulHits = 2; },
    row => { row.policy.nonTargetRoles = {}; },
    row => { row.policy.slots = []; },
    row => { row.policy.characterId = 'Cartethyia'; },
    row => { row.policy.provenance += ' changed'; },
  ];
  for (const change of changes) {
    const binding = structuredClone(original);
    change(binding);
    const result = await projectRecommendedImprovePolicy({ characterId: 'augusta' }, { rollBinding: () => binding });
    assert.equal(result.echoPolicy.requirements.status, 'PENDING');
    assert.equal(result.echoPolicy.requirements.value, null);
    assert.equal(result.echoPolicy.checkpointReference, null);
    content(result.characterTarget.numericTargets);
  }
});

test('temporary roll source failure masks only the dependent section and recovery restores it', async () => {
  for (const rollBinding of [() => null, () => { throw new Error('unavailable'); }]) {
    const result = await projectRecommendedImprovePolicy({ characterId: 'augusta' }, { rollBinding });
    assert.equal(result.echoPolicy.requirements.status, 'PENDING');
    content(result.characterTarget.numericTargets);
  }
  content((await projectRecommendedImprovePolicy({ characterId: 'augusta' })).echoPolicy.requirements);
});

test('roster readiness is audited independently and old PR224 source projection stays unchanged', async () => {
  const before = structuredClone(projectImproveSettingsSources());
  const rows = await projectReleasedImprovePolicies();
  assert.equal(rows.length, 57);
  assert.equal(rows.filter(row => row.characterTarget.numericTargets.status === 'VERIFIED').length, 24);
  assert.equal(rows.filter(row => row.characterTarget.priorities.status === 'VERIFIED').length, 44);
  assert.deepEqual(rows.filter(row => row.echoPolicy.requirements.status === 'VERIFIED').map(row => row.characterId), ['augusta']);
  assert.equal(rows.filter(row => row.echoPolicy.preferences.status === 'VERIFIED').length, 0);
  assert.ok(rows.every(row => row.echoPolicy.requirements.status !== 'VERIFIED'
    || row.echoPolicy.requirements.content === 'PRESENT'));
  assert.deepEqual(projectImproveSettingsSources(), before);
  for (const review of IMPROVE_POLICY_SOURCE_REVIEW) {
    const preset = PROFILE_REGISTRY.presets.get(review.presetId)!;
    const row = await projectRecommendedImprovePolicy({ characterId: preset.characterId, presetId: preset.id });
    // Every source pin is exercised, including alternate presets.
    assert.notEqual(row.characterTarget.priorities.status === 'PENDING'
      && /drift/.test(row.characterTarget.priorities.reason), true);
  }
});

test('source signatures ignore object key insertion order but preserve values and array order', async () => {
  assert.equal(await improvePolicySourceBinding({ a: 1, b: 2 }), await improvePolicySourceBinding({ b: 2, a: 1 }));
  assert.notEqual(await improvePolicySourceBinding([1, 2]), await improvePolicySourceBinding([2, 1]));
});
