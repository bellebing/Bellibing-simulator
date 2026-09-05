import type { CharacterPassiveFact } from '../characterMechanicsDomain.ts';
import { THE_SHOREKEEPER_PASSIVE_FACTS } from '../data/characterMechanics/theShorekeeperRawFacts.ts';
import { SONATA_EFFECT_MODELS } from '../data/sonataEffects.ts';
import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import type { SonataEffectModel } from '../sonataEffectDomain.ts';
import type { WeaponEffectData } from '../effectDomain.ts';

const SHOREKEEPER_HEALING_FACT_ID = 'the-shorekeeper-skill-chaos-theory-healing';
const STELLAR_SYMPHONY_TEAM_ATK_EFFECT_ID = 'SSY-TEAM-ATK';
const REJUVENATING_GLOW_TEAM_ATK_EFFECT_ID = 'REJUV_ATK';
const ADAPTER_ID = 'shorekeeper-healing-support-team-windows-v1';

export interface ShorekeeperHealingSkillCastEvent {
  readonly kind: 'RESONANCE_SKILL_CAST';
  readonly actorId: string;
  readonly healingSourceFactId: typeof SHOREKEEPER_HEALING_FACT_ID;
  readonly atSeconds: number;
}

export interface ShorekeeperHealAppliedEvent {
  readonly kind: 'HEAL_APPLIED';
  readonly healerId: string;
  readonly targetId: string;
  readonly healingSourceFactId: typeof SHOREKEEPER_HEALING_FACT_ID;
  readonly atSeconds: number;
}

export interface ShorekeeperHealingSupportWindow {
  readonly adapterId: typeof ADAPTER_ID;
  readonly sourceLayer: 'WEAPON' | 'SONATA';
  readonly effectId: string;
  readonly sourceId: string;
  readonly sourceCharacterId: 'the-shorekeeper';
  readonly statOrEffect: string;
  readonly value: number;
  readonly teamMemberIds: readonly string[];
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
}

export const SHOREKEEPER_HEALING_SUPPORT_SEMANTIC_SPLIT = {
  adapterId: ADAPTER_ID,
  sourceFactId: SHOREKEEPER_HEALING_FACT_ID,
  reviewedAt: '2026-09-04',
  closesPendingExecutionIds: [] as readonly string[],
  requiresProfileEventTimeline: true,
  resolvedSemantics: [
    'Chaos Theory is a Shorekeeper Resonance Skill that applies party healing',
    'Stellar Symphony team-ATK activation from an explicit healing-qualified Resonance Skill cast',
    'Rejuvenating Glow team-ATK activation from an explicit heal-applied event',
    'source-declared values, team scope and durations from selected canonical gear effects',
  ],
  notes: [
    'The weapon and Sonata effects retain separate trigger semantics: Stellar Symphony needs the healing-capable Skill cast, while Rejuvenating Glow needs an explicit heal-applied event.',
    'A Chaos Theory cast alone is not silently converted into a Rejuvenating Glow heal event; a caller must supply HEAL_APPLIED so full-HP or other healing-state assumptions are not invented.',
    'No Reference Team overlap or DPS contribution is inferred until an executable team timeline supplies the actual events.',
  ],
} as const;

function uniqueCharacterFact(
  facts: readonly CharacterPassiveFact[],
  factId: string,
): CharacterPassiveFact | null {
  const matches = facts.filter((fact) => fact.factId === factId);
  if (matches.length === 0) return null;
  if (matches.length > 1) throw new Error(`Duplicate Character fact ${factId}`);
  return matches[0];
}

function uniqueWeaponEffect(
  catalog: readonly WeaponEffectData[],
  effectId: string,
): WeaponEffectData | null {
  const matches = catalog.filter((effect) => effect.effectId === effectId);
  if (matches.length === 0) return null;
  if (matches.length > 1) throw new Error(`Duplicate Weapon effect ${effectId}`);
  return matches[0];
}

function uniqueSonataEffect(
  catalog: readonly SonataEffectModel[],
  effectId: string,
): SonataEffectModel | null {
  const matches = catalog.filter((effect) => effect.effectId === effectId);
  if (matches.length === 0) return null;
  if (matches.length > 1) throw new Error(`Duplicate Sonata effect ${effectId}`);
  return matches[0];
}

function validateTeamMemberIds(teamMemberIds: readonly string[]): readonly string[] {
  if (teamMemberIds.length === 0) throw new Error('Shorekeeper healing-support selected team must not be empty');
  for (const characterId of teamMemberIds) {
    if (!characterId.trim()) throw new Error('Shorekeeper healing-support team member id must not be blank');
  }
  if (new Set(teamMemberIds).size !== teamMemberIds.length) {
    throw new Error('Shorekeeper healing-support selected team contains duplicate Character ids');
  }
  if (!teamMemberIds.includes('the-shorekeeper')) {
    throw new Error('Shorekeeper healing-support selected team must include the-shorekeeper');
  }
  return Object.freeze([...teamMemberIds]);
}

function validateEventTime(atSeconds: number, label: string): void {
  if (!Number.isFinite(atSeconds) || atSeconds < 0) {
    throw new Error(`${label} must be a finite non-negative number: ${atSeconds}`);
  }
}

export function validateShorekeeperHealingSupportContracts(params: {
  readonly characterFacts?: readonly CharacterPassiveFact[];
  readonly weaponCatalog?: readonly WeaponEffectData[];
  readonly sonataCatalog?: readonly SonataEffectModel[];
} = {}): readonly string[] {
  const {
    characterFacts = THE_SHOREKEEPER_PASSIVE_FACTS,
    weaponCatalog = WEAPON_EFFECT_CATALOG,
    sonataCatalog = SONATA_EFFECT_MODELS,
  } = params;
  const issues: string[] = [];

  let healingFact: CharacterPassiveFact | null = null;
  let stellarSymphony: WeaponEffectData | null = null;
  let rejuvenatingGlow: SonataEffectModel | null = null;
  try {
    healingFact = uniqueCharacterFact(characterFacts, SHOREKEEPER_HEALING_FACT_ID);
    stellarSymphony = uniqueWeaponEffect(weaponCatalog, STELLAR_SYMPHONY_TEAM_ATK_EFFECT_ID);
    rejuvenatingGlow = uniqueSonataEffect(sonataCatalog, REJUVENATING_GLOW_TEAM_ATK_EFFECT_ID);
  } catch (error) {
    issues.push(error instanceof Error ? error.message : String(error));
    return issues;
  }

  if (!healingFact) {
    issues.push(`missing canonical Shorekeeper healing fact ${SHOREKEEPER_HEALING_FACT_ID}`);
  } else {
    if (healingFact.characterId !== 'the-shorekeeper') issues.push(`${SHOREKEEPER_HEALING_FACT_ID} character drift`);
    if (healingFact.verificationStatus !== 'VERIFIED') issues.push(`${SHOREKEEPER_HEALING_FACT_ID} must remain VERIFIED`);
    if (healingFact.section !== 'RESONANCE_SKILL') issues.push(`${SHOREKEEPER_HEALING_FACT_ID} section drift`);
    if (healingFact.scope !== 'TEAM') issues.push(`${SHOREKEEPER_HEALING_FACT_ID} must remain TEAM scope`);
    if (healingFact.conditional) issues.push(`${SHOREKEEPER_HEALING_FACT_ID} unexpectedly became conditional`);
    if (healingFact.triggerSummary !== 'Cast Resonance Skill Chaos Theory.') {
      issues.push(`${SHOREKEEPER_HEALING_FACT_ID} trigger drift`);
    }
    if (!healingFact.effectSummary.startsWith('Restore HP for all nearby party members.')) {
      issues.push(`${SHOREKEEPER_HEALING_FACT_ID} healing semantic drift`);
    }
  }

  if (!stellarSymphony) {
    issues.push(`missing canonical Weapon effect ${STELLAR_SYMPHONY_TEAM_ATK_EFFECT_ID}`);
  } else {
    if (stellarSymphony.weaponId !== 'stellar-symphony') issues.push(`${STELLAR_SYMPHONY_TEAM_ATK_EFFECT_ID} weapon drift`);
    if (stellarSymphony.effectType !== 'TRIGGERED') issues.push(`${STELLAR_SYMPHONY_TEAM_ATK_EFFECT_ID} must remain TRIGGERED`);
    if (stellarSymphony.trigger !== 'Cast Resonance Skill that heals') issues.push(`${STELLAR_SYMPHONY_TEAM_ATK_EFFECT_ID} trigger drift`);
    if (stellarSymphony.appliesTo !== 'TEAM') issues.push(`${STELLAR_SYMPHONY_TEAM_ATK_EFFECT_ID} must remain TEAM`);
    if (stellarSymphony.mechanicsStatus !== 'VERIFIED_CONDITIONAL') issues.push(`${STELLAR_SYMPHONY_TEAM_ATK_EFFECT_ID} mechanics status drift`);
    if (stellarSymphony.durationSeconds === null || !Number.isFinite(stellarSymphony.durationSeconds) || stellarSymphony.durationSeconds <= 0) {
      issues.push(`${STELLAR_SYMPHONY_TEAM_ATK_EFFECT_ID} must retain a positive finite duration`);
    }
    if (!stellarSymphony.conditions.includes('The cast Resonance Skill applies healing')) {
      issues.push(`${STELLAR_SYMPHONY_TEAM_ATK_EFFECT_ID} healing qualification drift`);
    }
    if (stellarSymphony.rankValues.some((value) => !Number.isFinite(value))) {
      issues.push(`${STELLAR_SYMPHONY_TEAM_ATK_EFFECT_ID} contains non-finite rank value`);
    }
  }

  if (!rejuvenatingGlow) {
    issues.push(`missing canonical Sonata effect ${REJUVENATING_GLOW_TEAM_ATK_EFFECT_ID}`);
  } else {
    if (rejuvenatingGlow.sonataSetId !== 'sonata-7' || rejuvenatingGlow.pieces !== 5) {
      issues.push(`${REJUVENATING_GLOW_TEAM_ATK_EFFECT_ID} set identity drift`);
    }
    if (rejuvenatingGlow.effectType !== 'TRIGGERED') issues.push(`${REJUVENATING_GLOW_TEAM_ATK_EFFECT_ID} must remain TRIGGERED`);
    if (rejuvenatingGlow.trigger !== 'Heal ally') issues.push(`${REJUVENATING_GLOW_TEAM_ATK_EFFECT_ID} trigger drift`);
    if (rejuvenatingGlow.valueMode !== 'FLAT') issues.push(`${REJUVENATING_GLOW_TEAM_ATK_EFFECT_ID} must remain FLAT`);
    if (rejuvenatingGlow.appliesTo !== 'TEAM') issues.push(`${REJUVENATING_GLOW_TEAM_ATK_EFFECT_ID} must remain TEAM`);
    if (rejuvenatingGlow.mechanicsStatus !== 'VERIFIED_CONDITIONAL') issues.push(`${REJUVENATING_GLOW_TEAM_ATK_EFFECT_ID} mechanics status drift`);
    if (rejuvenatingGlow.durationSeconds === null || !Number.isFinite(rejuvenatingGlow.durationSeconds) || rejuvenatingGlow.durationSeconds <= 0) {
      issues.push(`${REJUVENATING_GLOW_TEAM_ATK_EFFECT_ID} must retain a positive finite duration`);
    }
    if (!Number.isFinite(rejuvenatingGlow.value)) issues.push(`${REJUVENATING_GLOW_TEAM_ATK_EFFECT_ID} value must remain finite`);
  }

  return issues;
}

const CONTRACT_ISSUES = validateShorekeeperHealingSupportContracts();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Shorekeeper healing-support contracts: ${CONTRACT_ISSUES.join('; ')}`);
}

export function activateStellarSymphonyTeamAtkWindow(params: {
  readonly event: ShorekeeperHealingSkillCastEvent;
  readonly selectedWeapon: { readonly id: string; readonly rank: number };
  readonly teamMemberIds: readonly string[];
  readonly weaponCatalog?: readonly WeaponEffectData[];
}): ShorekeeperHealingSupportWindow | null {
  const { event, selectedWeapon, teamMemberIds, weaponCatalog = WEAPON_EFFECT_CATALOG } = params;
  if (event.kind !== 'RESONANCE_SKILL_CAST') {
    throw new Error(`unsupported Shorekeeper healing Skill event kind: ${String(event.kind)}`);
  }
  if (!event.actorId.trim()) throw new Error('Shorekeeper healing Skill actorId must not be blank');
  validateEventTime(event.atSeconds, 'Shorekeeper healing Skill event time');
  if (event.actorId !== 'the-shorekeeper') return null;
  if (event.healingSourceFactId !== SHOREKEEPER_HEALING_FACT_ID) return null;
  if (selectedWeapon.id !== 'stellar-symphony') return null;
  if (!Number.isInteger(selectedWeapon.rank) || selectedWeapon.rank < 1 || selectedWeapon.rank > 5) {
    throw new Error(`Stellar Symphony rank must be an integer from 1 to 5: ${selectedWeapon.rank}`);
  }

  const effect = uniqueWeaponEffect(weaponCatalog, STELLAR_SYMPHONY_TEAM_ATK_EFFECT_ID);
  if (!effect) throw new Error(`Missing Weapon effect ${STELLAR_SYMPHONY_TEAM_ATK_EFFECT_ID}`);
  const value = effect.rankValues[selectedWeapon.rank - 1];
  const durationSeconds = effect.durationSeconds;
  if (value === undefined || !Number.isFinite(value)) throw new Error(`Missing finite ${STELLAR_SYMPHONY_TEAM_ATK_EFFECT_ID} rank value`);
  if (durationSeconds === null || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    throw new Error(`${STELLAR_SYMPHONY_TEAM_ATK_EFFECT_ID} has no executable duration`);
  }

  return {
    adapterId: ADAPTER_ID,
    sourceLayer: 'WEAPON',
    effectId: effect.effectId,
    sourceId: effect.weaponId,
    sourceCharacterId: 'the-shorekeeper',
    statOrEffect: effect.statOrEffect,
    value,
    teamMemberIds: validateTeamMemberIds(teamMemberIds),
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds: event.atSeconds + durationSeconds,
  };
}

export function activateRejuvenatingGlowTeamAtkWindow(params: {
  readonly event: ShorekeeperHealAppliedEvent;
  readonly selectedSonataSetIds: readonly string[];
  readonly teamMemberIds: readonly string[];
  readonly sonataCatalog?: readonly SonataEffectModel[];
}): ShorekeeperHealingSupportWindow | null {
  const { event, selectedSonataSetIds, teamMemberIds, sonataCatalog = SONATA_EFFECT_MODELS } = params;
  if (event.kind !== 'HEAL_APPLIED') {
    throw new Error(`unsupported Shorekeeper heal event kind: ${String(event.kind)}`);
  }
  if (!event.healerId.trim()) throw new Error('Shorekeeper heal event healerId must not be blank');
  if (!event.targetId.trim()) throw new Error('Shorekeeper heal event targetId must not be blank');
  validateEventTime(event.atSeconds, 'Shorekeeper heal event time');
  if (event.healerId !== 'the-shorekeeper') return null;
  if (event.healingSourceFactId !== SHOREKEEPER_HEALING_FACT_ID) return null;
  if (!selectedSonataSetIds.includes('sonata-7')) return null;

  const selectedTeamMemberIds = validateTeamMemberIds(teamMemberIds);
  if (!selectedTeamMemberIds.includes(event.targetId)) return null;

  const effect = uniqueSonataEffect(sonataCatalog, REJUVENATING_GLOW_TEAM_ATK_EFFECT_ID);
  if (!effect) throw new Error(`Missing Sonata effect ${REJUVENATING_GLOW_TEAM_ATK_EFFECT_ID}`);
  const durationSeconds = effect.durationSeconds;
  if (!Number.isFinite(effect.value)) throw new Error(`${REJUVENATING_GLOW_TEAM_ATK_EFFECT_ID} has no finite value`);
  if (durationSeconds === null || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    throw new Error(`${REJUVENATING_GLOW_TEAM_ATK_EFFECT_ID} has no executable duration`);
  }

  return {
    adapterId: ADAPTER_ID,
    sourceLayer: 'SONATA',
    effectId: effect.effectId,
    sourceId: effect.sonataSetId,
    sourceCharacterId: 'the-shorekeeper',
    statOrEffect: effect.statOrEffect,
    value: effect.value,
    teamMemberIds: selectedTeamMemberIds,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds: event.atSeconds + durationSeconds,
  };
}

export function isShorekeeperHealingSupportWindowActive(
  window: ShorekeeperHealingSupportWindow,
  actorId: string,
  atSeconds: number,
): boolean {
  if (!actorId.trim()) throw new Error('Shorekeeper healing-support query actorId must not be blank');
  validateEventTime(atSeconds, 'Shorekeeper healing-support query time');
  return window.teamMemberIds.includes(actorId)
    && atSeconds >= window.startedAtSeconds
    && atSeconds < window.expiresAtSeconds;
}
