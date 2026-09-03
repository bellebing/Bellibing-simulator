import { IUNO_ACTION_FACTS } from './characterMechanics/iunoRawFacts.ts';
import { THE_SHOREKEEPER_PASSIVE_FACTS } from './characterMechanics/theShorekeeperRawFacts.ts';
import { PROFILE_REGISTRY } from './profileCatalogs.ts';
import { BROADBLADE_WEAPON_EFFECT_CATALOG } from './weaponEffectsBroadblade.ts';
import {
  resolveTeamExecutionContext,
  type ResolvedTeamExecutionContext,
  type TeamExecutionContributionDependency,
} from '../teamExecutionContext.ts';

export const REFERENCE_TEAM_01_MEMBER_PRESET_IDS = [
  'augusta-standard',
  'iuno-augusta-hybrid',
  'shorekeeper-augusta-support',
] as const;

export const REFERENCE_TEAM_01_CONTRIBUTION_DEPENDENCIES: readonly TeamExecutionContributionDependency[] = [
  {
    id: 'augusta-thunderflare-permanent-atk',
    sourceKind: 'WEAPON_EFFECT',
    sourceId: 'TFD-ATK',
    sourceCharacterId: 'augusta',
    sourcePresetId: 'augusta-standard',
    targetCharacterId: 'augusta',
    resolutionStatus: 'RESOLVED',
    requiredForDps: true,
    requirementSummary:
      'Selected Augusta preset must resolve Thunderflare Dominion and its canonical permanent/ALWAYS self effect.',
  },
  {
    id: 'iuno-outro-heavy-amplification-to-augusta',
    sourceKind: 'CHARACTER_MECHANIC',
    sourceId: 'iuno-outro-from-gloom-to-gleam',
    sourceCharacterId: 'iuno',
    sourcePresetId: 'iuno-augusta-hybrid',
    targetCharacterId: 'augusta',
    resolutionStatus: 'PENDING',
    requiredForDps: true,
    requirementSummary:
      'Requires executable Iuno Outro → Augusta targeting plus source-valid transfer-window and switch lifecycle during the evaluated Augusta damage window.',
  },
  {
    id: 'shorekeeper-stellarealm-party-crit-to-augusta',
    sourceKind: 'CHARACTER_MECHANIC',
    sourceId: 'the-shorekeeper-liberation-stellarealms',
    sourceCharacterId: 'the-shorekeeper',
    sourcePresetId: 'shorekeeper-augusta-support',
    targetCharacterId: 'augusta',
    resolutionStatus: 'PENDING',
    requiredForDps: true,
    requirementSummary:
      'Requires executable Stellarealm evolution plus source-valid Shorekeeper Energy Regen state before the party crit contribution can be resolved.',
  },
] as const;

function assertReferenceTeam01CanonicalSources(context: ResolvedTeamExecutionContext): void {
  const augusta = context.members.find((member) => member.characterId === 'augusta');
  if (!augusta) throw new Error('Reference Team 01: Augusta member selection is missing');

  const thunderflareAtk = BROADBLADE_WEAPON_EFFECT_CATALOG.find((effect) => effect.effectId === 'TFD-ATK');
  if (!thunderflareAtk) throw new Error('Reference Team 01: canonical TFD-ATK source is missing');
  if (thunderflareAtk.weaponId !== augusta.defaultWeapon.id) {
    throw new Error(
      `Reference Team 01: TFD-ATK belongs to ${thunderflareAtk.weaponId}, selected Augusta weapon is ${augusta.defaultWeapon.id}`,
    );
  }
  if (thunderflareAtk.effectType !== 'PERMANENT' || thunderflareAtk.simulatorMode !== 'ALWAYS') {
    throw new Error('Reference Team 01: TFD-ATK is not source-safe for unconditional resolution');
  }
  if (thunderflareAtk.appliesTo !== 'SELF') {
    throw new Error('Reference Team 01: TFD-ATK no longer applies to SELF');
  }
  if (thunderflareAtk.rankValues[augusta.defaultWeapon.rank - 1] === undefined) {
    throw new Error(`Reference Team 01: TFD-ATK has no value for selected rank ${augusta.defaultWeapon.rank}`);
  }

  const iunoOutro = IUNO_ACTION_FACTS.find((fact) => fact.factId === 'iuno-outro-from-gloom-to-gleam');
  if (!iunoOutro || iunoOutro.characterId !== 'iuno' || iunoOutro.verificationStatus !== 'VERIFIED') {
    throw new Error('Reference Team 01: canonical Iuno Outro source is missing or unverified');
  }

  const stellarealm = THE_SHOREKEEPER_PASSIVE_FACTS.find(
    (fact) => fact.factId === 'the-shorekeeper-liberation-stellarealms',
  );
  if (!stellarealm || stellarealm.characterId !== 'the-shorekeeper' || stellarealm.verificationStatus !== 'VERIFIED') {
    throw new Error('Reference Team 01: canonical Shorekeeper Stellarealm source is missing or unverified');
  }
}

/**
 * First bounded Reference Team 01 execution-context slice.
 *
 * Dependency coverage is intentionally PARTIAL. This context therefore cannot
 * become DPS-ready even if the currently listed pending dependencies are later
 * resolved; the remaining audited execution blockers must first be represented.
 */
export function buildReferenceTeam01ExecutionContext(): ResolvedTeamExecutionContext {
  const context = resolveTeamExecutionContext(PROFILE_REGISTRY, {
    actorPresetId: 'augusta-standard',
    memberPresetIds: REFERENCE_TEAM_01_MEMBER_PRESET_IDS,
    dependencyCoverageStatus: 'PARTIAL',
    contributionDependencies: REFERENCE_TEAM_01_CONTRIBUTION_DEPENDENCIES,
  });

  assertReferenceTeam01CanonicalSources(context);
  return context;
}

export const REFERENCE_TEAM_01_EXECUTION_CONTEXT = buildReferenceTeam01ExecutionContext();
