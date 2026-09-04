import { THE_SHOREKEEPER_PASSIVE_FACTS } from './characterMechanics/theShorekeeperRawFacts.ts';
import { PROFILE_REGISTRY } from './profileCatalogs.ts';
import { BROADBLADE_WEAPON_EFFECT_CATALOG } from './weaponEffectsBroadblade.ts';
import { validateFallacySupportContracts } from '../combat/fallacySupportWindowAdapter.ts';
import { validateIunoOutroTransferContract } from '../combat/iunoOutroTransferAdapter.ts';
import { validateShorekeeperHealingSupportContracts } from '../combat/shorekeeperHealingSupportWindowAdapter.ts';
import { validateShorekeeperOutroTeamWindowContract } from '../combat/shorekeeperOutroTeamWindowAdapter.ts';
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
    id: 'shorekeeper-outro-team-amplification-lifecycle-contract',
    sourceKind: 'CHARACTER_MECHANIC',
    sourceId: 'the-shorekeeper-outro-binary-butterfly',
    sourceCharacterId: 'the-shorekeeper',
    sourcePresetId: 'shorekeeper-augusta-support',
    targetCharacterId: 'augusta',
    resolutionStatus: 'RESOLVED',
    requiredForDps: true,
    requirementSummary:
      'Canonical Shorekeeper Outro TEAM scope, DMG Amplification value and duration are executable when an explicit Shorekeeper OUTRO_SKILL_CAST event plus selected-team membership are supplied.',
  },
  {
    id: 'shorekeeper-outro-augusta-window-overlap',
    sourceKind: 'CHARACTER_MECHANIC',
    sourceId: 'the-shorekeeper-outro-binary-butterfly',
    sourceCharacterId: 'the-shorekeeper',
    sourcePresetId: 'shorekeeper-augusta-support',
    targetCharacterId: 'augusta',
    resolutionStatus: 'PENDING',
    requiredForDps: true,
    requirementSummary:
      'Requires a source-valid Reference Team event timeline proving Shorekeeper Outro cast timing and which evaluated Augusta damage events occur inside the source-declared team window.',
  },
  {
    id: 'shorekeeper-stellar-symphony-team-atk-lifecycle-contract',
    sourceKind: 'WEAPON_EFFECT',
    sourceId: 'SSY-TEAM-ATK',
    sourceCharacterId: 'the-shorekeeper',
    sourcePresetId: 'shorekeeper-augusta-support',
    targetCharacterId: 'augusta',
    resolutionStatus: 'RESOLVED',
    requiredForDps: true,
    requirementSummary:
      'Selected Stellar Symphony team-ATK source semantics are executable from an explicit Shorekeeper healing-qualified Resonance Skill cast.',
  },
  {
    id: 'shorekeeper-stellar-symphony-augusta-window-overlap',
    sourceKind: 'WEAPON_EFFECT',
    sourceId: 'SSY-TEAM-ATK',
    sourceCharacterId: 'the-shorekeeper',
    sourcePresetId: 'shorekeeper-augusta-support',
    targetCharacterId: 'augusta',
    resolutionStatus: 'PENDING',
    requiredForDps: true,
    requirementSummary:
      'Requires an executable Reference Team timeline proving the healing-qualified Shorekeeper Skill cast and Augusta damage overlap inside the source-declared weapon window.',
  },
  {
    id: 'shorekeeper-rejuvenating-team-atk-lifecycle-contract',
    sourceKind: 'SONATA_EFFECT',
    sourceId: 'REJUV_ATK',
    sourceCharacterId: 'the-shorekeeper',
    sourcePresetId: 'shorekeeper-augusta-support',
    targetCharacterId: 'augusta',
    resolutionStatus: 'RESOLVED',
    requiredForDps: true,
    requirementSummary:
      'Selected Rejuvenating Glow team-ATK source semantics are executable from an explicit Shorekeeper heal-applied event.',
  },
  {
    id: 'shorekeeper-rejuvenating-augusta-window-overlap',
    sourceKind: 'SONATA_EFFECT',
    sourceId: 'REJUV_ATK',
    sourceCharacterId: 'the-shorekeeper',
    sourcePresetId: 'shorekeeper-augusta-support',
    targetCharacterId: 'augusta',
    resolutionStatus: 'PENDING',
    requiredForDps: true,
    requirementSummary:
      'Requires an executable Reference Team timeline proving a Shorekeeper heal-applied event and Augusta damage overlap inside the source-declared Sonata window.',
  },
  {
    id: 'shorekeeper-fallacy-team-atk-lifecycle-contract',
    sourceKind: 'ECHO_EFFECT',
    sourceId: 'FALLACY_TEAM_ATK',
    sourceCharacterId: 'the-shorekeeper',
    sourcePresetId: 'shorekeeper-augusta-support',
    targetCharacterId: 'augusta',
    resolutionStatus: 'RESOLVED',
    requiredForDps: true,
    requirementSummary:
      'Selected Fallacy of No Return team-ATK source semantics are executable from an explicit generic Fallacy Echo Skill cast without selecting an active-damage variant.',
  },
  {
    id: 'shorekeeper-fallacy-team-atk-augusta-window-overlap',
    sourceKind: 'ECHO_EFFECT',
    sourceId: 'FALLACY_TEAM_ATK',
    sourceCharacterId: 'the-shorekeeper',
    sourcePresetId: 'shorekeeper-augusta-support',
    targetCharacterId: 'augusta',
    resolutionStatus: 'PENDING',
    requiredForDps: true,
    requirementSummary:
      'Requires an executable Reference Team timeline proving the Fallacy cast timestamp and Augusta damage overlap inside the canonical team-ATK window.',
  },
  {
    id: 'shorekeeper-fallacy-wielder-er-lifecycle-contract',
    sourceKind: 'ECHO_EFFECT',
    sourceId: 'FALLACY_WIELDER_ER',
    sourceCharacterId: 'the-shorekeeper',
    sourcePresetId: 'shorekeeper-augusta-support',
    targetCharacterId: 'the-shorekeeper',
    resolutionStatus: 'RESOLVED',
    requiredForDps: true,
    requirementSummary:
      'Selected Fallacy of No Return wielder Energy Regen source semantics are executable from an explicit generic Fallacy Echo Skill cast and remain scoped to Shorekeeper.',
  },
  {
    id: 'shorekeeper-fallacy-wielder-er-stellarealm-state',
    sourceKind: 'ECHO_EFFECT',
    sourceId: 'FALLACY_WIELDER_ER',
    sourceCharacterId: 'the-shorekeeper',
    sourcePresetId: 'shorekeeper-augusta-support',
    targetCharacterId: 'the-shorekeeper',
    resolutionStatus: 'PENDING',
    requiredForDps: true,
    requirementSummary:
      'Requires actual Fallacy cast timing plus source-resolved Stellarealm Energy Regen sampling/formula before the wielder ER window may affect Shorekeeper party-crit state.',
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
      'Requires executable Stellarealm evolution plus source-valid Shorekeeper Energy Regen state, including timed ER effects, before the party crit contribution can be resolved.',
  },
] as const;

function assertReferenceTeam01CanonicalSources(context: ResolvedTeamExecutionContext): void {
  const augusta = context.members.find((member) => member.characterId === 'augusta');
  if (!augusta) throw new Error('Reference Team 01: Augusta member selection is missing');
  const shorekeeper = context.members.find((member) => member.characterId === 'the-shorekeeper');
  if (!shorekeeper) throw new Error('Reference Team 01: Shorekeeper member selection is missing');

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

  const shorekeeperOutroIssues = validateShorekeeperOutroTeamWindowContract();
  if (shorekeeperOutroIssues.length > 0) {
    throw new Error(`Reference Team 01: invalid canonical Shorekeeper Outro team-window contract: ${shorekeeperOutroIssues.join('; ')}`);
  }

  if (shorekeeper.defaultWeapon.id !== 'stellar-symphony') {
    throw new Error(`Reference Team 01: selected Shorekeeper weapon is ${shorekeeper.defaultWeapon.id}, expected stellar-symphony`);
  }
  if (!shorekeeper.sonataSetIds.includes('sonata-7')) {
    throw new Error('Reference Team 01: selected Shorekeeper loadout does not contain Rejuvenating Glow / sonata-7');
  }
  const shorekeeperHealingSupportIssues = validateShorekeeperHealingSupportContracts();
  if (shorekeeperHealingSupportIssues.length > 0) {
    throw new Error(`Reference Team 01: invalid Shorekeeper healing-support contracts: ${shorekeeperHealingSupportIssues.join('; ')}`);
  }

  if (shorekeeper.mainEchoId !== 'echo-60000605') {
    throw new Error(`Reference Team 01: selected Shorekeeper main Echo is ${String(shorekeeper.mainEchoId)}, expected Fallacy of No Return`);
  }
  const fallacySupportIssues = validateFallacySupportContracts();
  if (fallacySupportIssues.length > 0) {
    throw new Error(`Reference Team 01: invalid Fallacy support contracts: ${fallacySupportIssues.join('; ')}`);
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
