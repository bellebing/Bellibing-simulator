import { SONATA_EFFECT_MODELS } from '../data/sonataEffects.ts';
import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';

export type MornyeSupportScope = 'SELF' | 'TEAM' | 'NEARBY_TEAM' | 'ACTIVE_RESONATOR' | 'TARGET';

export interface MornyeTimedSupportWindow {
  readonly eventId: string;
  readonly sourceId: string;
  readonly sourceKind: 'CHARACTER' | 'WEAPON' | 'SONATA';
  readonly effect: string;
  readonly appliesTo: MornyeSupportScope;
  readonly value: number | null;
  readonly unit: 'DECIMAL_MULTIPLIER' | 'PERCENT_POINTS' | 'FLAT_AMOUNT' | 'BOOLEAN_STATE';
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
  readonly inputRequired: string | null;
}

export interface MornyeFieldState {
  readonly field: 'SYNTONY' | 'HIGH_SYNTONY';
  readonly createdAtSeconds: number;
  readonly expiresAtSeconds: number;
  readonly durationSeconds: 25;
  readonly nearbyTeamOffTuneBuildupRatePercent: 50;
  readonly nearbyActiveResonatorInterruptionResistance: true;
  readonly healCadenceSeconds: 3;
  readonly firstHealOffsetSeconds: null;
  readonly nearbyTeamDefBonus: 0 | 0.20;
  readonly healingMultiplierIncrease: 0 | 0.40;
}

export interface MornyeBoundednessState {
  readonly sourceActionId: 'EXPECTATION_ERROR' | 'DISTRIBUTED_ARRAY';
  readonly appliesTo: 'TEAM';
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
  readonly durationSeconds: 60;
  readonly acquisitionCooldownSeconds: 300;
  readonly maxCappedHits: 3;
  readonly cappedIncomingDamageMaxHpFraction: 0.30;
  readonly maxFatalPreventions: 1;
  readonly removalHealDefMultiplier: 1.50;
}

function assertEventTime(atSeconds: number): void {
  if (!Number.isFinite(atSeconds) || atSeconds < 0) {
    throw new Error(`Mornye support event time must be a finite non-negative number: ${atSeconds}`);
  }
}

function starfieldTeamCritDmgR1() {
  const effect = WEAPON_EFFECT_CATALOG.find((row) => row.effectId === 'SC-TEAM-CD');
  if (!effect) throw new Error('Missing Starfield Calibrator effect SC-TEAM-CD');
  if (effect.weaponId !== 'starfield-calibrator') throw new Error('SC-TEAM-CD weapon id drift');
  if (effect.effectType !== 'TRIGGERED' || effect.appliesTo !== 'TEAM') throw new Error('SC-TEAM-CD trigger/scope drift');
  if (effect.trigger !== 'Wielder heals Resonators') throw new Error('SC-TEAM-CD source trigger drift');
  if (effect.durationSeconds !== 4) throw new Error('SC-TEAM-CD duration drift');
  const value = effect.rankValues[0];
  if (value !== 0.20) throw new Error('SC-TEAM-CD R1 value drift');
  return { effect, value } as const;
}

function haloTeamAtk() {
  const effect = SONATA_EFFECT_MODELS.find((row) => row.effectId === 'HALO_TEAM_ATK');
  if (!effect) throw new Error('Missing Halo of Starry Radiance effect HALO_TEAM_ATK');
  if (effect.sonataSetId !== 'sonata-25' || effect.pieces !== 5) throw new Error('HALO_TEAM_ATK set identity drift');
  if (effect.valueMode !== 'PER_INPUT_POINT' || effect.value !== 0.002 || effect.capValue !== 0.25) {
    throw new Error('HALO_TEAM_ATK scaling drift');
  }
  if (effect.appliesTo !== 'TEAM' || effect.durationSeconds !== 4) throw new Error('HALO_TEAM_ATK scope/duration drift');
  return effect;
}

export function evaluateHaloTeamAtk(offTuneBuildupRatePercent: number): number {
  if (!Number.isFinite(offTuneBuildupRatePercent) || offTuneBuildupRatePercent < 0) {
    throw new Error(`Off-Tune Buildup Rate percent must be finite and non-negative: ${offTuneBuildupRatePercent}`);
  }
  const effect = haloTeamAtk();
  return Math.min(offTuneBuildupRatePercent * effect.value, effect.capValue ?? Number.POSITIVE_INFINITY);
}

export function buildMornyeHealTriggeredWindows(params: {
  readonly atSeconds: number;
  readonly offTuneBuildupRatePercent?: number;
}): readonly [MornyeTimedSupportWindow, MornyeTimedSupportWindow] {
  assertEventTime(params.atSeconds);
  const starfield = starfieldTeamCritDmgR1();
  const halo = haloTeamAtk();
  const haloValue = params.offTuneBuildupRatePercent === undefined
    ? null
    : evaluateHaloTeamAtk(params.offTuneBuildupRatePercent);

  return [
    {
      eventId: 'mornye-heal-starfield-team-crit-dmg',
      sourceId: starfield.effect.effectId,
      sourceKind: 'WEAPON',
      effect: starfield.effect.statOrEffect,
      appliesTo: 'TEAM',
      value: starfield.value,
      unit: 'DECIMAL_MULTIPLIER',
      startedAtSeconds: params.atSeconds,
      expiresAtSeconds: params.atSeconds + 4,
      inputRequired: null,
    },
    {
      eventId: 'mornye-heal-halo-team-atk',
      sourceId: halo.effectId,
      sourceKind: 'SONATA',
      effect: halo.statOrEffect,
      appliesTo: 'TEAM',
      value: haloValue,
      unit: 'DECIMAL_MULTIPLIER',
      startedAtSeconds: params.atSeconds,
      expiresAtSeconds: params.atSeconds + 4,
      inputRequired: haloValue === null ? 'healer Off-Tune Buildup Rate percent at heal event' : null,
    },
  ] as const;
}

export function createMornyeSyntonyField(createdAtSeconds: number): MornyeFieldState {
  assertEventTime(createdAtSeconds);
  return {
    field: 'SYNTONY',
    createdAtSeconds,
    expiresAtSeconds: createdAtSeconds + 25,
    durationSeconds: 25,
    nearbyTeamOffTuneBuildupRatePercent: 50,
    nearbyActiveResonatorInterruptionResistance: true,
    healCadenceSeconds: 3,
    firstHealOffsetSeconds: null,
    nearbyTeamDefBonus: 0,
    healingMultiplierIncrease: 0,
  };
}

export function createMornyeHighSyntonyField(createdAtSeconds: number): MornyeFieldState {
  assertEventTime(createdAtSeconds);
  return {
    field: 'HIGH_SYNTONY',
    createdAtSeconds,
    expiresAtSeconds: createdAtSeconds + 25,
    durationSeconds: 25,
    nearbyTeamOffTuneBuildupRatePercent: 50,
    nearbyActiveResonatorInterruptionResistance: true,
    healCadenceSeconds: 3,
    firstHealOffsetSeconds: null,
    nearbyTeamDefBonus: 0.20,
    healingMultiplierIncrease: 0.40,
  };
}

export function createMornyeObservationMarker(atSeconds: number): MornyeTimedSupportWindow {
  assertEventTime(atSeconds);
  return {
    eventId: 'mornye-heavy-inversion-observation-marker',
    sourceId: 'mornye-forte-wide-field-syntony-markers',
    sourceKind: 'CHARACTER',
    effect: 'Observation Marker',
    appliesTo: 'TARGET',
    value: null,
    unit: 'BOOLEAN_STATE',
    startedAtSeconds: atSeconds,
    expiresAtSeconds: atSeconds + 30,
    inputRequired: null,
  };
}

export function createMornyeInterferedMarker(atSeconds: number): MornyeTimedSupportWindow {
  assertEventTime(atSeconds);
  return {
    eventId: 'mornye-tune-break-interfered-marker',
    sourceId: 'mornye-forte-wide-field-syntony-markers',
    sourceKind: 'CHARACTER',
    effect: 'Interfered Marker',
    appliesTo: 'TARGET',
    value: null,
    unit: 'BOOLEAN_STATE',
    startedAtSeconds: atSeconds,
    expiresAtSeconds: atSeconds + 8,
    inputRequired: 'Tune Break on target carrying Observation Marker',
  };
}

export function evaluateMornyeInterferedAllDamageAmplification(energyRegenPercent: number): number {
  if (!Number.isFinite(energyRegenPercent) || energyRegenPercent < 0) {
    throw new Error(`Energy Regen percent must be finite and non-negative: ${energyRegenPercent}`);
  }
  const excess = Math.max(0, energyRegenPercent - 100);
  return Math.min(excess * 0.0025, 0.40);
}

export function evaluateMornyeCriticalProtocolCrit(energyRegenPercent: number): {
  readonly critRateBonus: number;
  readonly critDmgBonus: number;
} {
  if (!Number.isFinite(energyRegenPercent) || energyRegenPercent < 0) {
    throw new Error(`Energy Regen percent must be finite and non-negative: ${energyRegenPercent}`);
  }
  const excess = Math.max(0, energyRegenPercent - 100);
  return {
    critRateBonus: Math.min(excess * 0.005, 0.80),
    critDmgBonus: Math.min(excess * 0.01, 1.60),
  };
}

export function createMornyeOutroWindow(atSeconds: number): MornyeTimedSupportWindow {
  assertEventTime(atSeconds);
  return {
    eventId: 'mornye-outro-recursion-team-all-dmg-amplification',
    sourceId: 'mornye-outro-recursion',
    sourceKind: 'CHARACTER',
    effect: 'All DMG Amplification',
    appliesTo: 'TEAM',
    value: 0.25,
    unit: 'DECIMAL_MULTIPLIER',
    startedAtSeconds: atSeconds,
    expiresAtSeconds: atSeconds + 30,
    inputRequired: null,
  };
}

export function createMornyeBoundednessState(params: {
  readonly atSeconds: number;
  readonly sourceActionId: 'EXPECTATION_ERROR' | 'DISTRIBUTED_ARRAY';
  readonly cooldownReady: boolean;
}): MornyeBoundednessState | null {
  assertEventTime(params.atSeconds);
  if (!params.cooldownReady) return null;
  return {
    sourceActionId: params.sourceActionId,
    appliesTo: 'TEAM',
    startedAtSeconds: params.atSeconds,
    expiresAtSeconds: params.atSeconds + 60,
    durationSeconds: 60,
    acquisitionCooldownSeconds: 300,
    maxCappedHits: 3,
    cappedIncomingDamageMaxHpFraction: 0.30,
    maxFatalPreventions: 1,
    removalHealDefMultiplier: 1.50,
  };
}

export const MORNYE_BLUEPRINT_RESOURCE_EVENTS = [
  {
    eventId: 'mornye-blueprint-intro-concerto',
    trigger: 'INTRO_SKILL_CAST',
    resource: 'Concerto Energy',
    appliesTo: 'SELF',
    amount: 20,
    cooldownSeconds: 20,
  },
  {
    eventId: 'mornye-blueprint-wide-field-basic-3-concerto',
    trigger: 'WIDE_FIELD_BASIC_3_CAST',
    resource: 'Concerto Energy',
    appliesTo: 'SELF',
    amount: 20,
    cooldownSeconds: 20,
  },
] as const;
