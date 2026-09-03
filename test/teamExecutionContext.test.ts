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
  assert.equal(iuno.rotationExecutionStatus, 'SOURCE_SEQUENCE_ONLY');

  assert.deepEqual(shorekeeper.defaultWeapon, { id: 'stellar-symphony', rank: 1 });
  assert.equal(shorekeeper.echoLoadoutProfileId, 'shorekeeper-rejuvenating-fallacy');
  assert.equal(shorekeeper.rotationExecutionStatus, 'SOURCE_SEQUENCE_ONLY');
});

test('Reference Team 01 separates resolved Iuno handoff lifecycle from pending team overlap', () => {
  const context = REFERENCE_TEAM_01_EXECUTION_CONTEXT;
  assert.equal(context.dependencyCoverageStatus, 'PARTIAL');
  assert.equal(context.dpsReady, false);

  const thunderflare = context.contributions.find(
    (dependency) => dependency.id === 'augusta-thunderflare-permanent-atk',
  );
  assert.ok(thunderflare);
  assert.equal(thunderflare.sourceKind, 'WEAPON_EFFECT');
  assert.equal(thunderflare.sourceId, 'TFD-ATK');
  assert.equal(thunderflare.resolutionStatus, 'RESOLVED');

  const iunoLifecycle = context.contributions.find(
    (dependency) => dependency.id === 'iuno-outro-handoff-lifecycle-contract',
  );
  assert.ok(iunoLifecycle);
  assert.equal(iunoLifecycle.sourceId, 'iuno-outro-from-gloom-to-gleam');
  assert.equal(iunoLifecycle.resolutionStatus, 'RESOLVED');

  const iunoOverlap = context.contributions.find(
    (dependency) => dependency.id === 'iuno-outro-augusta-window-overlap',
  );
  assert.ok(iunoOverlap);
  assert.equal(iunoOverlap.sourceId, 'iuno-outro-from-gloom-to-gleam');
  assert.equal(iunoOverlap.resolutionStatus, 'PENDING');

  const stellarealm = context.contributions.find(
    (dependency) => dependency.id === 'shorekeeper-stellarealm-party-crit-to-augusta',
  );
  assert.ok(stellarealm);
  assert.equal(stellarealm.sourceId, 'the-shorekeeper-liberation-stellarealms');
  assert.equal(stellarealm.resolutionStatus, 'PENDING');

  assert.deepEqual(
    context.unresolvedDependencies.map((dependency) => dependency.id),
    ['iuno-outro-augusta-window-overlap', 'shorekeeper-stellarealm-party-crit-to-augusta'],
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
