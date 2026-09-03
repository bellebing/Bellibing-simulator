import { THE_SHOREKEEPER_PASSIVE_FACTS } from './characterMechanics/theShorekeeperRawFacts.ts';
import { PROFILE_REGISTRY } from './profileCatalogs.ts';
import { BROADBLADE_WEAPON_EFFECT_CATALOG } from './weaponEffectsBroadblade.ts';
import { validateIunoOutroTransferContract } from '../combat/iunoOutroTransferAdapter.ts';
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
    id: 'iuno-outro-handoff-lifecycle-contract',
    sourceKind: 'CHARACTER_MECHANIC',
    sourceId: 'iuno-outro-from-gloom-to-gleam',
    sourceCharacterId: 'iuno',
    sourcePresetId: 'iuno-augusta-hybrid',
    targetCharacterId: 'augusta',
    resolutionStatus: 'RESOLVED',
    requiredForDps: true,
    requirementSummary:
      'Canonical Iuno Outro target/value/duration and affected-Resonator switch-out lifecycle are executable when an explicit Iuno OUTRO_SWITCH event is supplied.',
  },
  {
    id: 'iuno-outro-augusta-window-overlap',
    sourceKind: 'CHARACTER_MECHANIC',
    sourceId: 'iuno-outro-from-gloom-to-gleam',
    sourceCharacterId: 'iuno',
    sourcePresetId: 'iuno-augusta-hybrid',
    targetCharacterId: 'augusta',
    resolutionStatus: 'PENDING',
    requiredForDps: true,
    requirementSummary:
      'Requires a source-valid Reference Team event timeline proving when Iuno Outro hands off to Augusta and which evaluated Augusta Heavy Attack events occur before switch-out or duration expiry.',
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

  const iunoOutroIssues = validateIunoOutroTransferContract();
  if (iunoOutroIssues.length > 0) {
    throw new Error(`Reference Team 01: invalid canonical Iuno Outro transfer contract: ${iunoOutroIssues.join('; ')}`);
  }

  const stellarealm = THE_SHOREKEEPER_PASSIVE_FACTS.find(
    (fact) => fact.factId === 'the-shorekeeper-liberation-stellarealms',
  );
  if (!stellarealm || stellarealm.characterId !== 'the-shorekeeper' || stellarealm.verificationStatus !== 'VERIFIED') {
    throw new Error('Reference Team 01: canonical Shorekeeper Stellarealm source is missing or unverified');
  }
}

/**
 * Bounded Reference Team 01 execution-context foundation.
 *
 * Dependency coverage is intentionally PARTIAL. Source-valid primitive/lifecycle
 * semantics may be marked RESOLVED independently from profile timeline overlap,
 * but the context cannot become DPS-ready until the audited dependency set is
 * complete and every required execution dependency is resolved.
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
