import assert from 'node:assert/strict';
import test from 'node:test';

import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import {
  REFERENCE_TEAM_01_CONTRIBUTION_DEPENDENCIES,
  REFERENCE_TEAM_01_EXECUTION_CONTEXT,
  REFERENCE_TEAM_01_MEMBER_PRESET_IDS,
  buildReferenceTeam01ExecutionContext,
} from '../src/data/referenceTeam01ExecutionContext.ts';
import { resolveTeamExecutionContext } from '../src/teamExecutionContext.ts';

test('Reference Team 01 binds exact selected member preset/loadout identity', () => {
  const context = buildReferenceTeam01ExecutionContext();
  assert.equal(context.teamProfileId, 'augusta-iuno-shorekeeper');
  assert.equal(context.actorPresetId, 'augusta-standard');
  assert.deepEqual(context.members.map((member) => member.presetId), [...REFERENCE_TEAM_01_MEMBER_PRESET_IDS]);

  const augusta = context.members.find((member) => member.characterId === 'augusta');
  const iuno = context.members.find((member) => member.characterId === 'iuno');
  const shorekeeper = context.members.find((member) => member.characterId === 'the-shorekeeper');
  assert.ok(augusta);
  assert.ok(iuno);
  assert.ok(shorekeeper);

  assert.deepEqual(augusta.defaultWeapon, { id: 'thunderflare-dominion', rank: 1 });
  assert.equal(augusta.echoLoadoutProfileId, 'augusta-standard-echoes');
  assert.equal(augusta.rotationExecutionStatus, 'ENGINE_MODELED');
  assert.equal(augusta.rotationEngineModelId, 'AUGUSTA_STD_V1');

  assert.deepEqual(iuno.defaultWeapon, { id: 'moongazers-sigil', rank: 1 });
  assert.equal(iuno.echoLoadoutProfileId, 'iuno-augusta-moonlit-heron');
  assert.deepEqual(iuno.sonataSetIds, ['sonata-8']);
  assert.equal(iuno.rotationExecutionStatus, 'SOURCE_SEQUENCE_ONLY');

  assert.deepEqual(shorekeeper.defaultWeapon, { id: 'stellar-symphony', rank: 1 });
  assert.equal(shorekeeper.echoLoadoutProfileId, 'shorekeeper-rejuvenating-fallacy');
  assert.deepEqual(shorekeeper.sonataSetIds, ['sonata-7']);
  assert.equal(shorekeeper.mainEchoId, 'echo-60000605');
  assert.equal(shorekeeper.rotationExecutionStatus, 'SOURCE_SEQUENCE_ONLY');
});

test('Reference Team 01 separates resolved source lifecycles/relative overlaps from pending state overlap', () => {
  const context = REFERENCE_TEAM_01_EXECUTION_CONTEXT;
  assert.equal(context.dependencyCoverageStatus, 'PARTIAL');
  assert.equal(context.dpsReady, false);

  const expectedResolved = [
    ['augusta-thunderflare-permanent-atk', 'TFD-ATK'],
    ['iuno-outro-handoff-lifecycle-contract', 'iuno-outro-from-gloom-to-gleam'],
    ['iuno-outro-augusta-window-overlap', 'iuno-outro-from-gloom-to-gleam'],
    ['iuno-moonlit-incoming-atk-lifecycle-contract', 'S08_5PC_INCOMING_ATK'],
    ['iuno-moonlit-augusta-window-overlap', 'S08_5PC_INCOMING_ATK'],
    ['iuno-wan-light-recipient-stack-core-contract', 'iuno-full-moon-domain-wan-light-recipient'],
    ['shorekeeper-outro-team-amplification-lifecycle-contract', 'the-shorekeeper-outro-binary-butterfly'],
    ['shorekeeper-outro-augusta-window-overlap', 'the-shorekeeper-outro-binary-butterfly'],
    ['shorekeeper-stellar-symphony-team-atk-lifecycle-contract', 'SSY-TEAM-ATK'],
    ['shorekeeper-rejuvenating-team-atk-lifecycle-contract', 'REJUV_ATK'],
    ['shorekeeper-fallacy-team-atk-lifecycle-contract', 'FALLACY_TEAM_ATK'],
    ['shorekeeper-fallacy-wielder-er-lifecycle-contract', 'FALLACY_WIELDER_ER'],
    ['shorekeeper-stellarealm-lifecycle-contract', 'the-shorekeeper-liberation-stellarealms'],
    ['shorekeeper-stellarealm-party-crit-to-augusta', 'the-shorekeeper-liberation-stellarealms'],
  ] as const;
  for (const [id, sourceId] of expectedResolved) {
    const dependency = context.contributions.find((row) => row.id === id);
    assert.ok(dependency, `missing ${id}`);
    assert.equal(dependency.sourceId, sourceId);
    assert.equal(dependency.resolutionStatus, 'RESOLVED');
  }

  const expectedPending = [
    ['iuno-wan-light-at-cap-trigger-semantics', 'iuno-full-moon-domain-wan-light-recipient'],
    ['iuno-wan-light-augusta-event-overlap', 'iuno-full-moon-domain-wan-light-recipient'],
    ['shorekeeper-stellar-symphony-augusta-window-overlap', 'SSY-TEAM-ATK'],
    ['shorekeeper-rejuvenating-augusta-window-overlap', 'REJUV_ATK'],
    ['shorekeeper-fallacy-team-atk-augusta-window-overlap', 'FALLACY_TEAM_ATK'],
    ['shorekeeper-fallacy-wielder-er-stellarealm-state', 'FALLACY_WIELDER_ER'],
  ] as const;
  for (const [id, sourceId] of expectedPending) {
    const dependency = context.contributions.find((row) => row.id === id);
    assert.ok(dependency, `missing ${id}`);
    assert.equal(dependency.sourceId, sourceId);
    assert.equal(dependency.resolutionStatus, 'PENDING');
  }

  assert.deepEqual(
    context.unresolvedDependencies.map((dependency) => dependency.id),
    expectedPending.map(([id]) => id),
  );
});

test('partial dependency coverage remains fail-closed even when listed dependencies are resolved', () => {
  const context = resolveTeamExecutionContext(PROFILE_REGISTRY, {
    actorPresetId: 'augusta-standard',
    memberPresetIds: REFERENCE_TEAM_01_MEMBER_PRESET_IDS,
    dependencyCoverageStatus: 'PARTIAL',
    contributionDependencies: REFERENCE_TEAM_01_CONTRIBUTION_DEPENDENCIES.map((dependency) => ({
      ...dependency,
      resolutionStatus: 'RESOLVED' as const,
    })),
  });

  assert.equal(context.unresolvedDependencies.length, 0);
  assert.equal(context.dpsReady, false);
});

test('team execution resolver rejects incomplete or mismatched teammate selection', () => {
  assert.throws(
    () => resolveTeamExecutionContext(PROFILE_REGISTRY, {
      actorPresetId: 'augusta-standard',
      memberPresetIds: ['augusta-standard', 'iuno-augusta-hybrid'],
      dependencyCoverageStatus: 'PARTIAL',
      contributionDependencies: [],
    }),
    /expected 3 member presets/,
  );

  assert.throws(
    () => resolveTeamExecutionContext(PROFILE_REGISTRY, {
      actorPresetId: 'augusta-standard',
      memberPresetIds: ['augusta-standard', 'iuno-augusta-hybrid', 'cartethyia-aero-erosion'],
      dependencyCoverageStatus: 'PARTIAL',
      contributionDependencies: [],
    }),
    /does not match actor team/,
  );
});

test('team execution resolver rejects contribution sources that are not selected', () => {
  assert.throws(
    () => resolveTeamExecutionContext(PROFILE_REGISTRY, {
      actorPresetId: 'augusta-standard',
      memberPresetIds: REFERENCE_TEAM_01_MEMBER_PRESET_IDS,
      dependencyCoverageStatus: 'PARTIAL',
      contributionDependencies: [
        {
          id: 'invalid-unselected-source',
          sourceKind: 'CHARACTER_MECHANIC',
          sourceId: 'some-source',
          sourceCharacterId: 'cartethyia',
          sourcePresetId: 'cartethyia-aero-erosion',
          targetCharacterId: 'augusta',
          resolutionStatus: 'PENDING',
          requiredForDps: true,
          requirementSummary: 'Test-only invalid source selection.',
        },
      ],
    }),
    /source preset cartethyia-aero-erosion is not selected/,
  );
});
