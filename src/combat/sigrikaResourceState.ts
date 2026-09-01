import {
  SIGRIKA_ACTION_FACTS,
  SIGRIKA_PASSIVE_FACTS,
  SIGRIKA_RESOURCE_FACTS,
} from '../data/characterMechanics/sigrikaRawFacts.ts';

export type SigrikaRuneType = 'TRUST' | 'ANSWER';
export type SigrikaRunicBranch = 'RUNIC_CHAIN_WHIP' | 'RUNIC_OUTBURST' | 'RUNIC_SOLISKIN';

export interface SigrikaResourceState {
  readonly runes: readonly SigrikaRuneType[];
  readonly fullStop: number;
  readonly soliskinVitality: number;
  readonly innateGiftStacks: number;
  readonly blessingOfRunesStacks: number;
  readonly decipherExpiresAtSeconds: number | null;
  readonly convergentExpiresAtSeconds: number | null;
  readonly divergentExpiresAtSeconds: number | null;
  readonly learnMyTrueNameCooldownUntilSeconds: number;
  readonly soliskinTriggeredEchoNames: readonly string[];
  readonly blessingTriggeredEchoNames: readonly string[];
}

export interface SigrikaSchemataResult {
  readonly state: SigrikaResourceState;
  readonly branch: SigrikaRunicBranch;
  readonly consumedRunes: readonly [SigrikaRuneType, SigrikaRuneType];
  readonly consumedSoliskinVitality: number;
  readonly runicMultiplierIncrease: number;
  readonly runicDamageAmplification: number;
  readonly innateGiftStackGained: boolean;
}

export const SIGRIKA_RESOURCE_STATE_CONTRACT = Object.freeze({
  adapterId: 'sigrika-resource-state-v1',
  reviewedAt: '2026-09-01',
  sourceUrls: [
    'https://wuthering.gg/characters/sigrika',
    'https://wutheringlab.com/character/sigrika-build/',
  ] as const,
  rune: {
    baseCapacity: 2,
    expandedCapacity: 4,
    expandedCapacityFullStopThreshold: 50,
    trustDirectHitSources: ['ELUCIDATED', 'DODGE_COUNTER_DECIPHER'] as const,
    answerDirectHitSources: ['BIG_BOOMY_BOOM', 'SOLISKIN_TO_THE_AID'] as const,
    overwriteAtCapacity: 'SHIFT_LEFT_REMOVE_LEFTMOST',
    selectionWhenMoreThanTwoRunes: 'UNMODELED_FAIL_CLOSED',
  },
  schemata: {
    runeCost: 2,
    fullStopGain: 50,
    branchByRunePair: {
      'TRUST+TRUST': 'RUNIC_CHAIN_WHIP',
      'TRUST+ANSWER': 'RUNIC_OUTBURST',
      'ANSWER+TRUST': 'RUNIC_OUTBURST',
      'ANSWER+ANSWER': 'RUNIC_SOLISKIN',
    } as const,
  },
  soliskinVitality: {
    max: 60,
    echoSkillCastGain: 10,
    boostedThreshold: 30,
    boostedConsume: 30,
    boostedRunicMultiplierIncrease: 0.50,
    lowVitalityDamageAmplificationPer10: 0.15,
  },
  fullStop: {
    max: 100,
    learnMyTrueNameThreshold: 100,
    learnMyTrueNameConsumesAll: true,
    learnMyTrueNameCooldownSeconds: 25,
  },
  innateGift: {
    maxStacks: 2,
    damageAmplificationPerStack: 0.30,
    clearsOnLearnMyTrueName: true,
    clearsOnSwitchOut: true,
  },
  decipher: {
    durationSeconds: 5,
    endsOnSwitchOut: true,
  },
  convergent: {
    durationSeconds: 20,
    duplicateRuneMode: 'SAME_TYPE',
    suppressedAtFullStop100: true,
  },
  divergent: {
    durationSeconds: 20,
    duplicateRuneMode: 'OPPOSITE_TYPE',
    suppressedAtFullStop100: true,
    convergentHasPriority: true,
  },
  blessingOfRunes: {
    maxStacks: 6,
    aeroDamageBonusPerStack: 0.03,
    echoSkillDamageBonusPerStack: 0.03,
    sigrikaSixStackAdditionalAeroBonus: 0.30,
    sigrikaSixStackAdditionalEchoSkillBonus: 0.30,
    resetsOnLineupChange: true,
  },
} as const);

export function createInitialSigrikaResourceState(): SigrikaResourceState {
  return Object.freeze({
    runes: Object.freeze([]) as readonly SigrikaRuneType[],
    fullStop: 0,
    soliskinVitality: 0,
    innateGiftStacks: 0,
    blessingOfRunesStacks: 0,
    decipherExpiresAtSeconds: null,
    convergentExpiresAtSeconds: null,
    divergentExpiresAtSeconds: null,
    learnMyTrueNameCooldownUntilSeconds: 0,
    soliskinTriggeredEchoNames: Object.freeze([]) as readonly string[],
    blessingTriggeredEchoNames: Object.freeze([]) as readonly string[],
  });
}

function validateTime(atSeconds: number): void {
  if (!Number.isFinite(atSeconds) || atSeconds < 0) {
    throw new Error(`Sigrika event time must be finite and non-negative: ${atSeconds}`);
  }
}

function activeUntil(expiresAtSeconds: number | null, atSeconds: number): boolean {
  return expiresAtSeconds !== null && atSeconds < expiresAtSeconds;
}

function runeCapacity(fullStop: number): 2 | 4 {
  return fullStop >= SIGRIKA_RESOURCE_STATE_CONTRACT.rune.expandedCapacityFullStopThreshold ? 4 : 2;
}

function pushRune(
  runes: readonly SigrikaRuneType[],
  rune: SigrikaRuneType,
  capacity: 2 | 4,
): readonly SigrikaRuneType[] {
  const next = runes.length >= capacity ? [...runes.slice(1), rune] : [...runes, rune];
  return Object.freeze(next);
}

function oppositeRune(rune: SigrikaRuneType): SigrikaRuneType {
  return rune === 'TRUST' ? 'ANSWER' : 'TRUST';
}

export function castSigrikaIntro(state: SigrikaResourceState, atSeconds: number): SigrikaResourceState {
  validateTime(atSeconds);
  return Object.freeze({
    ...state,
    convergentExpiresAtSeconds: atSeconds + SIGRIKA_RESOURCE_STATE_CONTRACT.convergent.durationSeconds,
  });
}

export function castSigrikaLiberation(state: SigrikaResourceState, atSeconds: number): SigrikaResourceState {
  validateTime(atSeconds);
  return Object.freeze({
    ...state,
    divergentExpiresAtSeconds: atSeconds + SIGRIKA_RESOURCE_STATE_CONTRACT.divergent.durationSeconds,
  });
}

export function castSigrikaBasicStage4(state: SigrikaResourceState, atSeconds: number): SigrikaResourceState {
  validateTime(atSeconds);
  return Object.freeze({
    ...state,
    decipherExpiresAtSeconds: atSeconds + SIGRIKA_RESOURCE_STATE_CONTRACT.decipher.durationSeconds,
  });
}

export function canCastSigrikaElucidated(state: SigrikaResourceState, atSeconds: number): boolean {
  validateTime(atSeconds);
  return activeUntil(state.decipherExpiresAtSeconds, atSeconds);
}

export function canCastSigrikaSoliskinToTheAid(state: SigrikaResourceState, atSeconds: number): boolean {
  return canCastSigrikaElucidated(state, atSeconds)
    && state.fullStop >= SIGRIKA_RESOURCE_STATE_CONTRACT.rune.expandedCapacityFullStopThreshold;
}

export function gainSigrikaRuneFromDirectHit(
  state: SigrikaResourceState,
  params: {
    readonly source: 'ELUCIDATED' | 'DODGE_COUNTER_DECIPHER' | 'BIG_BOOMY_BOOM' | 'SOLISKIN_TO_THE_AID';
    readonly atSeconds: number;
  },
): SigrikaResourceState {
  const { source, atSeconds } = params;
  validateTime(atSeconds);

  const trustSource = (SIGRIKA_RESOURCE_STATE_CONTRACT.rune.trustDirectHitSources as readonly string[]).includes(source);
  const answerSource = (SIGRIKA_RESOURCE_STATE_CONTRACT.rune.answerDirectHitSources as readonly string[]).includes(source);
  if (!trustSource && !answerSource) throw new Error(`Unsupported Sigrika Rune source: ${source}`);

  if ((source === 'ELUCIDATED' || source === 'DODGE_COUNTER_DECIPHER' || source === 'BIG_BOOMY_BOOM' || source === 'SOLISKIN_TO_THE_AID')
    && !activeUntil(state.decipherExpiresAtSeconds, atSeconds)) {
    throw new Error(`${source} Rune hit requires active Decipher at ${atSeconds}`);
  }
  if (source === 'SOLISKIN_TO_THE_AID'
    && state.fullStop < SIGRIKA_RESOURCE_STATE_CONTRACT.rune.expandedCapacityFullStopThreshold) {
    throw new Error('SOLISKIN_TO_THE_AID Rune hit requires at least 50 Full Stop');
  }

  const rune: SigrikaRuneType = trustSource ? 'TRUST' : 'ANSWER';
  const capacity = runeCapacity(state.fullStop);
  let runes = pushRune(state.runes, rune, capacity);
  let convergentExpiresAtSeconds = state.convergentExpiresAtSeconds;
  let divergentExpiresAtSeconds = state.divergentExpiresAtSeconds;

  const suppressDuplicate = state.fullStop >= SIGRIKA_RESOURCE_STATE_CONTRACT.fullStop.max;
  const convergentActive = !suppressDuplicate && activeUntil(convergentExpiresAtSeconds, atSeconds);
  const divergentActive = !suppressDuplicate && activeUntil(divergentExpiresAtSeconds, atSeconds);

  if (convergentActive) {
    runes = pushRune(runes, rune, capacity);
    convergentExpiresAtSeconds = null;
  } else if (divergentActive) {
    runes = pushRune(runes, oppositeRune(rune), capacity);
    divergentExpiresAtSeconds = null;
  }

  return Object.freeze({
    ...state,
    runes,
    decipherExpiresAtSeconds: null,
    convergentExpiresAtSeconds,
    divergentExpiresAtSeconds,
  });
}

function resolveRunicBranch(pair: readonly [SigrikaRuneType, SigrikaRuneType]): SigrikaRunicBranch {
  return SIGRIKA_RESOURCE_STATE_CONTRACT.schemata.branchByRunePair[`${pair[0]}+${pair[1]}`];
}

export function castSigrikaSchemataOfRunes(
  state: SigrikaResourceState,
  atSeconds: number,
): SigrikaSchemataResult {
  validateTime(atSeconds);
  if (state.runes.length < 2) throw new Error('Schemata of Runes requires two Runes');
  if (state.runes.length > 2) {
    throw new Error('Schemata Rune selection with more than two stored Runes is not source-modeled; caller must fail closed');
  }
  if (state.soliskinVitality % 10 !== 0) {
    throw new Error(`Soliskin Vitality must remain on source-backed 10-point increments: ${state.soliskinVitality}`);
  }

  const consumedRunes = Object.freeze([state.runes[0], state.runes[1]]) as readonly [SigrikaRuneType, SigrikaRuneType];
  const branch = resolveRunicBranch(consumedRunes);
  const highVitality = state.soliskinVitality >= SIGRIKA_RESOURCE_STATE_CONTRACT.soliskinVitality.boostedThreshold;
  const consumedSoliskinVitality = highVitality
    ? SIGRIKA_RESOURCE_STATE_CONTRACT.soliskinVitality.boostedConsume
    : state.soliskinVitality;
  const runicMultiplierIncrease = highVitality
    ? SIGRIKA_RESOURCE_STATE_CONTRACT.soliskinVitality.boostedRunicMultiplierIncrease
    : 0;
  const runicDamageAmplification = highVitality
    ? 0
    : (consumedSoliskinVitality / 10) * SIGRIKA_RESOURCE_STATE_CONTRACT.soliskinVitality.lowVitalityDamageAmplificationPer10;
  const innateGiftStackGained = highVitality && state.innateGiftStacks < SIGRIKA_RESOURCE_STATE_CONTRACT.innateGift.maxStacks;

  const nextState: SigrikaResourceState = Object.freeze({
    ...state,
    runes: Object.freeze([]) as readonly SigrikaRuneType[],
    fullStop: Math.min(
      SIGRIKA_RESOURCE_STATE_CONTRACT.fullStop.max,
      state.fullStop + SIGRIKA_RESOURCE_STATE_CONTRACT.schemata.fullStopGain,
    ),
    soliskinVitality: state.soliskinVitality - consumedSoliskinVitality,
    innateGiftStacks: Math.min(
      SIGRIKA_RESOURCE_STATE_CONTRACT.innateGift.maxStacks,
      state.innateGiftStacks + (highVitality ? 1 : 0),
    ),
  });

  return Object.freeze({
    state: nextState,
    branch,
    consumedRunes,
    consumedSoliskinVitality,
    runicMultiplierIncrease,
    runicDamageAmplification,
    innateGiftStackGained,
  });
}

export function canCastSigrikaLearnMyTrueName(state: SigrikaResourceState, atSeconds: number): boolean {
  validateTime(atSeconds);
  return state.fullStop === SIGRIKA_RESOURCE_STATE_CONTRACT.fullStop.learnMyTrueNameThreshold
    && atSeconds >= state.learnMyTrueNameCooldownUntilSeconds;
}

export function castSigrikaLearnMyTrueName(state: SigrikaResourceState, atSeconds: number): SigrikaResourceState {
  validateTime(atSeconds);
  if (!canCastSigrikaLearnMyTrueName(state, atSeconds)) {
    throw new Error(`Learn My True Name is not eligible at ${atSeconds}`);
  }
  return Object.freeze({
    ...state,
    fullStop: 0,
    innateGiftStacks: 0,
    learnMyTrueNameCooldownUntilSeconds:
      atSeconds + SIGRIKA_RESOURCE_STATE_CONTRACT.fullStop.learnMyTrueNameCooldownSeconds,
  });
}

export function getSigrikaInnateGiftDamageAmplification(state: SigrikaResourceState): number {
  return state.innateGiftStacks * SIGRIKA_RESOURCE_STATE_CONTRACT.innateGift.damageAmplificationPerStack;
}

function appendUnique(values: readonly string[], value: string): readonly string[] {
  return values.includes(value) ? values : Object.freeze([...values, value]);
}

export function registerSigrikaNearbyEchoSkillCast(
  state: SigrikaResourceState,
  echoName: string,
): SigrikaResourceState {
  const normalizedName = echoName.trim();
  if (!normalizedName) throw new Error('Sigrika Echo Skill source name must be non-blank');

  const soliskinAlreadyTriggered = state.soliskinTriggeredEchoNames.includes(normalizedName);
  const blessingAlreadyTriggered = state.blessingTriggeredEchoNames.includes(normalizedName);

  return Object.freeze({
    ...state,
    soliskinVitality: soliskinAlreadyTriggered
      ? state.soliskinVitality
      : Math.min(
        SIGRIKA_RESOURCE_STATE_CONTRACT.soliskinVitality.max,
        state.soliskinVitality + SIGRIKA_RESOURCE_STATE_CONTRACT.soliskinVitality.echoSkillCastGain,
      ),
    blessingOfRunesStacks: blessingAlreadyTriggered
      ? state.blessingOfRunesStacks
      : Math.min(
        SIGRIKA_RESOURCE_STATE_CONTRACT.blessingOfRunes.maxStacks,
        state.blessingOfRunesStacks + 1,
      ),
    soliskinTriggeredEchoNames: soliskinAlreadyTriggered
      ? state.soliskinTriggeredEchoNames
      : appendUnique(state.soliskinTriggeredEchoNames, normalizedName),
    blessingTriggeredEchoNames: blessingAlreadyTriggered
      ? state.blessingTriggeredEchoNames
      : appendUnique(state.blessingTriggeredEchoNames, normalizedName),
  });
}

export function castSigrikaOutro(state: SigrikaResourceState): SigrikaResourceState {
  return Object.freeze({
    ...state,
    soliskinTriggeredEchoNames: Object.freeze([]) as readonly string[],
  });
}

export function applySigrikaLineupChange(state: SigrikaResourceState): SigrikaResourceState {
  return Object.freeze({
    ...state,
    blessingOfRunesStacks: 0,
    blessingTriggeredEchoNames: Object.freeze([]) as readonly string[],
  });
}

export function switchSigrikaOffField(state: SigrikaResourceState): SigrikaResourceState {
  return Object.freeze({
    ...state,
    innateGiftStacks: 0,
    decipherExpiresAtSeconds: null,
  });
}

export function getSigrikaBlessingBonuses(
  state: SigrikaResourceState,
  actorId: string,
): { readonly aeroDamageBonus: number; readonly echoSkillDamageBonus: number } {
  const stackBonus = state.blessingOfRunesStacks * SIGRIKA_RESOURCE_STATE_CONTRACT.blessingOfRunes.aeroDamageBonusPerStack;
  const sigrikaSixStackBonus = actorId === 'sigrika'
    && state.blessingOfRunesStacks === SIGRIKA_RESOURCE_STATE_CONTRACT.blessingOfRunes.maxStacks
    ? SIGRIKA_RESOURCE_STATE_CONTRACT.blessingOfRunes.sigrikaSixStackAdditionalAeroBonus
    : 0;
  return Object.freeze({
    aeroDamageBonus: stackBonus + sigrikaSixStackBonus,
    echoSkillDamageBonus: stackBonus + sigrikaSixStackBonus,
  });
}

export function getSigrikaEnergyRegenEchoSkillBonus(energyRegen: number): number {
  if (!Number.isFinite(energyRegen) || energyRegen < 0) {
    throw new Error(`Sigrika Energy Regen must be finite and non-negative: ${energyRegen}`);
  }
  const rawBonus = Math.max(0, energyRegen - 1.25) * 2;
  return Math.min(0.50, Number(rawBonus.toFixed(10)));
}

export function validateSigrikaResourceStateContract(): readonly string[] {
  const issues: string[] = [];
  const byResource = new Map(SIGRIKA_RESOURCE_FACTS.map((fact) => [fact.factId, fact]));
  const byPassive = new Map(SIGRIKA_PASSIVE_FACTS.map((fact) => [fact.factId, fact]));
  const actionIds = new Set(SIGRIKA_ACTION_FACTS.map((fact) => fact.factId));

  const rune = byResource.get('sigrika-resource-rune');
  if (!rune || rune.maxValue !== 4) issues.push('Rune raw fact must remain maxValue=4');
  if (!rune?.ruleSummary.includes('up to 2')) issues.push('Rune raw fact must preserve base capacity 2');
  if (!rune?.ruleSummary.includes('leftmost Rune')) issues.push('Rune raw fact must preserve left-shift overwrite');

  const fullStop = byResource.get('sigrika-resource-full-stop');
  if (!fullStop || fullStop.maxValue !== 100) issues.push('Full Stop raw fact must remain maxValue=100');
  if (!fullStop?.ruleSummary.includes('grants 50 Full Stop')) issues.push('Full Stop raw fact must preserve Schemata +50');

  const vitality = byResource.get('sigrika-resource-soliskin-vitality');
  if (!vitality || vitality.maxValue !== 60) issues.push('Soliskin Vitality raw fact must remain maxValue=60');
  if (!vitality?.ruleSummary.includes('Echo Skill casts grant 10')) issues.push('Soliskin Vitality raw fact must preserve Echo Skill +10');

  const innateGift = byResource.get('sigrika-resource-innate-gift');
  if (!innateGift || innateGift.maxValue !== 2) issues.push('Innate Gift raw fact must remain maxValue=2');
  if (!innateGift?.ruleSummary.includes('30% DMG Amplification')) issues.push('Innate Gift raw fact must preserve 30% per stack');
  if (!innateGift?.ruleSummary.includes('switching off field')) issues.push('Innate Gift raw fact must preserve switch-out clear');

  const decipher = byPassive.get('sigrika-basic-decipher');
  if (!decipher || decipher.durationSeconds !== 5) issues.push('Decipher raw fact must remain 5s');
  const convergent = byPassive.get('sigrika-inherent-true-names-invoked');
  if (!convergent || convergent.durationSeconds !== 20) issues.push('Convergent raw fact must remain 20s');
  const blessing = byPassive.get('sigrika-inherent-true-names-aligned');
  if (!blessing || blessing.maxStacks !== 6) issues.push('Blessing of Runes raw fact must remain maxStacks=6');

  for (const actionId of [
    'sigrika-forte-circuit-within-infinity-s-embrace-heavy-attack-schemata-of-runes-dmg',
    'sigrika-forte-circuit-within-infinity-s-embrace-runic-outburst-dmg',
    'sigrika-forte-circuit-within-infinity-s-embrace-runic-chain-whip-dmg',
    'sigrika-forte-circuit-within-infinity-s-embrace-runic-soliskin-dmg',
    'sigrika-forte-circuit-within-infinity-s-embrace-forte-circuit-learn-my-true-name-dmg',
    'sigrika-resonance-liberation-where-trust-leads-me-skill-dmg',
  ]) {
    if (!actionIds.has(actionId)) issues.push(`missing Sigrika action fact ${actionId}`);
  }

  return Object.freeze(issues);
}

const CONTRACT_ISSUES = validateSigrikaResourceStateContract();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Sigrika resource-state source contract: ${CONTRACT_ISSUES.join('; ')}`);
}
