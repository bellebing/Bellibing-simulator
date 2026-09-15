import type { Echo } from '../echoCore.ts';
import type { Element } from '../gameDataDomain.ts';
import { CHARACTER_CATALOG } from '../data/characters.ts';
import { CHARACTER_INTRINSIC_BY_ID } from '../data/characterIntrinsicStats.ts';
import { WEAPON_CATALOG } from '../data/weapons.ts';
import { getWeaponEffects } from '../effectRegistry.ts';
import type { WeaponEffectData } from '../effectDomain.ts';
import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import { getCharacterActionFact } from '../data/characterMechanics.ts';
import { readCharacterActionValues } from '../characterActionValues.ts';
import { projectRank5EchoStats } from '../echoStatProjection.ts';
import { validateEchoLoadout } from '../loadoutValidator.ts';
import { listCharacterDirectHitSupport, supportsCharacterDirectHit, type CharacterDirectHitInput } from './characterDirectHitAdapter.ts';
import { compareCharacterHitEchoReplacement, type EchoBuildHitContext } from './characterEchoComparison.ts';

export const CHARACTER_HIT_CONTEXT_ID = 'character-source-qualified-hit-context-v1';
export function listCharacterHitContextSupport() {
  return listCharacterDirectHitSupport().map(row => ({ ...row, primitiveId: CHARACTER_HIT_CONTEXT_ID,
    scope: 'PARTIAL_NON_ECHO_CONTEXT' as const, requiresRemainingContextProof: true as const,
    assembles: ['CHARACTER_BASE', 'MAX_MINOR_FORTES', 'WEAPON_CORE', 'PERMANENT_WEAPON_STATS'],
    authorizesRotationDps: false as const }));
}
export type ContextHit = Omit<CharacterDirectHitInput, 'snapshot'>;
export interface CharacterHitContextSelection {
  readonly hit: ContextHit;
  readonly damageElement: Element;
  readonly eventContextId: string;
  readonly characterLevel: 90;
  readonly maxMinorFortes: true;
  readonly weapon: { readonly id: string; readonly level: 90; readonly rank: number };
}
export interface StatContribution {
  readonly sourceId: string;
  readonly stat: string;
  readonly value: number;
}
const text = (x: unknown): x is string => typeof x === 'string' && x.trim().length > 0;
const statNames = new Set(['ATK%', 'HP%', 'DEF%', 'Flat ATK', 'Flat HP', 'Flat DEF',
  'CRIT Rate', 'CRIT DMG', 'Energy Regen', 'Healing Bonus', 'All Attribute DMG',
  'Aero DMG', 'Electro DMG', 'Fusion DMG', 'Glacio DMG', 'Havoc DMG', 'Spectro DMG',
  'Basic Attack DMG', 'Heavy Attack DMG', 'Skill DMG', 'Liberation DMG', 'Intro DMG', 'Outro DMG']);

/** Exact canonical stat labels only. Never parse effect prose or infer a trigger. */
export function contextStatName(name: string): string | null {
  const aliases: Record<string, string> = {
    'All-Attribute DMG': 'All Attribute DMG',
    'Resonance Skill DMG': 'Skill DMG', 'Resonance Liberation DMG': 'Liberation DMG',
    'Glacio DMG Bonus': 'Glacio DMG', 'Fusion DMG Bonus': 'Fusion DMG',
    'Electro DMG Bonus': 'Electro DMG', 'Aero DMG Bonus': 'Aero DMG',
    'Spectro DMG Bonus': 'Spectro DMG', 'Havoc DMG Bonus': 'Havoc DMG',
  };
  const result = aliases[name] ?? name;
  return statNames.has(result) ? result : null;
}

function isStaticWeaponStat(effect: WeaponEffectData): boolean {
  return effect.effectType === 'PERMANENT' && effect.trigger === 'Passive'
    && effect.mechanicsStatus === 'VERIFIED_MODELED' && effect.appliesTo === 'SELF'
    && effect.simulatorMode === 'ALWAYS' && effect.valueUnit === 'DECIMAL_MULTIPLIER'
    && effect.conditions.length === 0 && effect.durationSeconds === null
    && effect.triggerCooldownSeconds === null && effect.maxStacks === 1 && effect.stackIntervalSeconds === 0
    && effect.rankValues.length === 5 && effect.rankValues.every(x => Number.isFinite(x) && x >= 0)
    && contextStatName(effect.statOrEffect) !== null;
}

/** Identity-only discovery. Values retain their canonical ownership. */
export function listStaticWeaponContextSupport() {
  return WEAPON_EFFECT_CATALOG.filter(isStaticWeaponStat).map(e => ({ effectId: e.effectId, weaponId: e.weaponId,
    primitiveId: CHARACTER_HIT_CONTEXT_ID, scope: 'PERMANENT_SELF_STAT' as const,
    dependsOnEchoStats: false as const })).sort((a, b) => a.effectId.localeCompare(b.effectId));
}

/** Partial source assembly. Pending effect/context requirements are never zero. */
export function assembleCharacterHitContext(selection: CharacterHitContextSelection, echoes: readonly Echo[]) {
  const { hit, weapon } = selection;
  const fact = getCharacterActionFact(hit?.factId);
  if (!fact || fact.characterId !== hit.characterId || !supportsCharacterDirectHit(fact)
    || hit.sequence !== 0 || hit.maxSkills !== true || selection.characterLevel !== 90
    || selection.maxMinorFortes !== true || !text(selection.eventContextId)
    || !['Aero', 'Electro', 'Fusion', 'Glacio', 'Havoc', 'Spectro'].includes(selection.damageElement)) {
    throw new Error('Require exact supported S0/max-skill hit, Lv90/max Minor Fortes and explicit hit element/context');
  }
  const values = readCharacterActionValues(fact, 10);
  if (values.status !== 'SOURCE_VALUES' || values.kind !== 'COEFFICIENTS'
    || !Number.isInteger(hit.componentIndex) || hit.componentIndex < 0 || !values.components[hit.componentIndex]
    || !Number.isInteger(hit.landedHitCount) || hit.landedHitCount < 0
    || hit.landedHitCount > values.components[hit.componentIndex].hitCount) {
    throw new Error('Require exact coefficient component and explicit landed-hit count');
  }
  const character = CHARACTER_CATALOG.find(c => c.id === hit.characterId);
  const intrinsic = CHARACTER_INTRINSIC_BY_ID.get(hit.characterId);
  const selectedWeapon = WEAPON_CATALOG.find(w => w.id === weapon?.id);
  if (!character || character.releaseStatus !== 'RELEASED' || intrinsic?.verificationStatus !== 'VERIFIED'
    || !selectedWeapon || selectedWeapon.releaseStatus !== 'RELEASED' || selectedWeapon.verificationStatus !== 'VERIFIED'
    || selectedWeapon.weaponType !== character.weaponType || weapon.level !== 90
    || !Number.isInteger(weapon.rank) || weapon.rank < 1 || weapon.rank > 5) {
    throw new Error('Require canonical released Character/intrinsic and compatible verified Lv90/R1-R5 weapon');
  }
  // Existing parked core-stat conflict, independent from AUDITED_EFFECTS.
  if (weapon.id === 'abyss-surges') throw new Error('SOURCE_CONFLICT: Abyss Surges base ATK remains disputed');
  const baseKey = { ATK: 'atk', HP: 'hp', DEF: 'def' } as const;
  const scalingStat = fact.scalingStat as keyof typeof baseKey;
  const rawBase = character.level90[baseKey[scalingStat]];
  if (rawBase === null || !Number.isFinite(rawBase) || rawBase <= 0
    || selectedWeapon.level90BaseAtk === null || !Number.isFinite(selectedWeapon.level90BaseAtk)
    || selectedWeapon.level90BaseAtk <= 0 || !selectedWeapon.secondary
    || [character.baseCombat.critRate, character.baseCombat.critDamage, character.baseCombat.energyRegen]
      .some(x => x === null || !Number.isFinite(x))) throw new Error('SOURCE_REVIEW_REQUIRED: incomplete canonical base stats');
  const baseScalingStat = rawBase + (scalingStat === 'ATK' ? selectedWeapon.level90BaseAtk : 0);
  const projection = projectRank5EchoStats(echoes);
  const legal = validateEchoLoadout(projection.cards);
  if (!legal.valid) throw new Error(`Invalid equipped Echo loadout: ${legal.violations.join(', ')}`);
  const contributions: StatContribution[] = [];
  const add = (sourceId: string, stat: string, value: number) => {
    const key = contextStatName(stat);
    if (!key || !Number.isFinite(value) || value < 0) throw new Error(`Unsupported canonical stat: ${sourceId}/${stat}`);
    contributions.push({ sourceId, stat: key, value });
  };
  intrinsic.stats.forEach(s => add(`character:${character.id}:intrinsic`, s.stat, s.value));
  add(`weapon:${weapon.id}:secondary`, selectedWeapon.secondary.stat, selectedWeapon.secondary.value);
  const requirements = [
    `character:${character.id}:self-effects`, 'main-echo-effects', 'sonata-effects',
    'selected-team-effects', 'target-state-and-other-effects', 'event-resource-state-feasibility',
  ];
  for (const effect of getWeaponEffects(weapon.id)) {
    if (isStaticWeaponStat(effect)) add(`weapon:${effect.effectId}`, effect.statOrEffect, effect.rankValues[weapon.rank - 1]);
    else requirements.push(`weapon:${effect.effectId}`);
  }
  const stats: Record<string, number> = {};
  for (const c of contributions) stats[c.stat] = (stats[c.stat] ?? 0) + c.value;
  const baseCombat = { ...character.baseCombat } as { critRate: number; critDamage: number; energyRegen: number };
  const identity = { selection, echoStatKey: projection.key, baseScalingStat, baseCombat, contributions,
    requirements: [...requirements].sort() };
  return structuredClone({ primitiveId: CHARACTER_HIT_CONTEXT_ID, scope: 'PARTIAL_NON_ECHO_CONTEXT' as const,
    ...identity, assemblyKey: JSON.stringify(identity), stats, scalingStat, damageClass: fact.damageClass,
    authorizesRotationDps: false as const, authorizesUpgradeVerdict: false as const });
}

export type AssembledCharacterHitContext = ReturnType<typeof assembleCharacterHitContext>;
export type RemainingHitContext = { readonly status: 'PENDING'; readonly reason: string } | {
  readonly status: 'QUALIFIED';
  readonly assemblyKey: string;
  readonly evidenceId: string;
  /** Covers every named missing scope separately, for this exact build and hit.
   * Includes activation/applicability, dependencies and recomputation. Neither
   * presence in this manifest nor a stat key is itself source proof. */
  readonly requirements: readonly { readonly id: string; readonly evidenceId: string }[];
  readonly buildDependentEffectsRecomputed: true;
  /** Only contributions NOT assembled above. All fields are explicit, even zero.
   * Flat/percent scaling terms belong to the tagged ATK/HP/DEF stat. */
  readonly scalingPercent: number;
  readonly scalingFlat: number;
  readonly critRate: number;
  readonly critDamage: number;
  readonly damageBonus: number;
  readonly amplification: number;
  readonly defenseMultiplier: number;
  readonly resistanceMultiplier: number;
  readonly damageReduction: number;
};

const classStat = { BASIC: 'Basic Attack DMG', HEAVY: 'Heavy Attack DMG', SKILL: 'Skill DMG',
  LIBERATION: 'Liberation DMG', INTRO: 'Intro DMG', OUTRO: 'Outro DMG' } as const;

function qualifiedContext(a: AssembledCharacterHitContext, proof: RemainingHitContext): EchoBuildHitContext {
  if (proof?.status === 'PENDING') {
    if (!text(proof.reason)) throw new Error('Pending context requires a reason');
    return { ...proof };
  }
  if (!proof || proof.status !== 'QUALIFIED' || proof.assemblyKey !== a.assemblyKey || !text(proof.evidenceId)
    || proof.buildDependentEffectsRecomputed !== true || !Array.isArray(proof.requirements)
    || proof.requirements.some(r => !text(r.evidenceId))
    || JSON.stringify(proof.requirements.map(r => r.id).sort()) !== JSON.stringify(a.requirements)
    || [proof.scalingPercent, proof.scalingFlat, proof.critRate, proof.critDamage, proof.damageBonus,
      proof.amplification, proof.defenseMultiplier, proof.resistanceMultiplier, proof.damageReduction].some(x => !Number.isFinite(x))) {
    throw new Error('Require fresh per-build proof for every remaining context scope and explicit finite residual values');
  }
  const stat = (key: string) => a.stats[key] ?? 0;
  const hit = a.selection.hit;
  const damageClass = a.damageClass as keyof typeof classStat;
  return { status: 'QUALIFIED', characterId: hit.characterId, factId: hit.factId,
    componentIndex: hit.componentIndex, landedHitCount: hit.landedHitCount,
    eventContextId: a.selection.eventContextId, echoStatKey: a.echoStatKey, evidenceId: proof.evidenceId,
    damageElement: a.selection.damageElement, scalingBaseBeforePercentBonuses: a.baseScalingStat,
    allNonEchoSourcesQualified: true, echoDependentEffectsRecomputed: true, equipmentStateQualified: true,
    nonEchoSnapshot: {
      scalingStat: a.scalingStat, damageClass,
      totalScalingStat: a.baseScalingStat * (1 + stat(a.scalingStat + '%') + proof.scalingPercent)
        + stat('Flat ' + a.scalingStat) + proof.scalingFlat,
      critRate: a.baseCombat.critRate + stat('CRIT Rate') + proof.critRate,
      critDamage: a.baseCombat.critDamage + stat('CRIT DMG') + proof.critDamage,
      damageBonus: stat(a.selection.damageElement + ' DMG') + stat('All Attribute DMG') + stat(classStat[damageClass]) + proof.damageBonus,
      amplification: proof.amplification, defenseMultiplier: proof.defenseMultiplier,
      resistanceMultiplier: proof.resistanceMultiplier, damageReduction: proof.damageReduction,
    } };
}

/** Existing #197 comparison consumes freshly assembled current/candidate context.
 * No complete snapshot or old-build context is silently reused. */
export function compareCharacterHitWithAssembledContext(input: {
  readonly selection: CharacterHitContextSelection;
  readonly slotIndex: number;
  readonly current: { readonly echoes: readonly Echo[]; readonly remaining: RemainingHitContext };
  readonly candidate: { readonly echoes: readonly Echo[]; readonly remaining: RemainingHitContext };
}) {
  const current = assembleCharacterHitContext(input.selection, input.current.echoes);
  const candidate = assembleCharacterHitContext(input.selection, input.candidate.echoes);
  const comparison = compareCharacterHitEchoReplacement({ hit: input.selection.hit,
    eventContextId: input.selection.eventContextId, slotIndex: input.slotIndex,
    current: { echoes: input.current.echoes, context: qualifiedContext(current, input.current.remaining) },
    candidate: { echoes: input.candidate.echoes, context: qualifiedContext(candidate, input.candidate.remaining) } });
  return { currentAssembly: current, candidateAssembly: candidate, comparison };
}
