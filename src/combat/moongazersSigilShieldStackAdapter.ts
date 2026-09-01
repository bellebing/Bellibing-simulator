import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import type { WeaponEffectData } from '../effectDomain.ts';

export interface MoongazersSigilShieldStackContract {
  readonly shieldPendingExecutionId: 'weapon:moongazers-sigil:MGS-DEF:shield-stack-state-adapter';
  readonly introPendingExecutionId: 'weapon:moongazers-sigil:MGS-MAX-STACK:cross-effect-stack-override-adapter';
  readonly shieldEffectId: 'MGS-DEF';
  readonly introEffectId: 'MGS-MAX-STACK';
  readonly weaponId: 'moongazers-sigil';
  readonly shieldDurationSeconds: 7;
  readonly triggerCooldownSeconds: 0.5;
  readonly maxStacks: 5;
  readonly introForcedMaxDurationSeconds: 3;
  readonly rankValuesPerStack: readonly [0.072, 0.084, 0.096, 0.108, 0.12];
}

export interface MoongazersSigilKnownShieldState {
  readonly adapterId: 'moongazers-sigil-known-shield-stack-v1';
  readonly ownerId: string;
  /**
   * Expiry timestamps for source-known organic MGS-DEF stacks. Each entry is one
   * accepted Obtain Shield event whose seven-second lifetime is independently known.
   */
  readonly organicStackExpiriesSeconds: readonly number[];
  /** Last source-known accepted shield trigger, including one whose stack has expired. */
  readonly lastAcceptedShieldAtSeconds: number | null;
}

export interface MoongazersSigilShieldEvent {
  readonly actorId: string;
  readonly atSeconds: number;
}

export type MoongazersSigilShieldEventResult =
  | {
      readonly status: 'IGNORED_OTHER_ACTOR';
      readonly state: MoongazersSigilKnownShieldState;
    }
  | {
      readonly status: 'TRIGGER_COOLDOWN';
      readonly state: MoongazersSigilKnownShieldState;
    }
  | {
      readonly status: 'STACK_GRANTED';
      readonly state: MoongazersSigilKnownShieldState;
      readonly grantedStackExpiresAtSeconds: number;
    }
  | {
      readonly status: 'SOURCE_CAP_REFRESH_UNRESOLVED';
      readonly state: MoongazersSigilKnownShieldState;
      readonly unresolvedSemantics: readonly string[];
    };

export interface MoongazersSigilIntroEvent {
  readonly actorId: string;
  readonly atSeconds: number;
}

export interface MoongazersSigilForcedMaxWindow {
  readonly adapterId: 'moongazers-sigil-intro-forced-max-window-v1';
  readonly effectId: 'MGS-MAX-STACK';
  readonly ownerId: string;
  readonly forcedStackCount: 5;
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
}

export interface MoongazersSigilDefIgnoreRead {
  readonly effectId: 'MGS-DEF';
  readonly statOrEffect: 'Resonance Liberation DMG DEF Ignore';
  readonly damageClass: 'RESONANCE_LIBERATION';
  readonly rank: 1 | 2 | 3 | 4 | 5;
  readonly activeOrganicStackCount: number;
  readonly valuePerStack: number;
  readonly totalOrganicValue: number;
}

export const MOONGAZERS_SIGIL_SHIELD_STACK_CONTRACT: MoongazersSigilShieldStackContract = {
  shieldPendingExecutionId: 'weapon:moongazers-sigil:MGS-DEF:shield-stack-state-adapter',
  introPendingExecutionId: 'weapon:moongazers-sigil:MGS-MAX-STACK:cross-effect-stack-override-adapter',
  shieldEffectId: 'MGS-DEF',
  introEffectId: 'MGS-MAX-STACK',
  weaponId: 'moongazers-sigil',
  shieldDurationSeconds: 7,
  triggerCooldownSeconds: 0.5,
  maxStacks: 5,
  introForcedMaxDurationSeconds: 3,
  rankValuesPerStack: [0.072, 0.084, 0.096, 0.108, 0.12],
};

export const MOONGAZERS_SIGIL_SHIELD_STACK_SEMANTIC_REVIEW = {
  status: 'BLOCKED_SOURCE_SEMANTICS',
  blockerId: 'BUG-017',
  reviewedAt: '2026-09-01',
  organicPrimitiveId: 'moongazers-sigil-known-shield-stack-v1',
  introPrimitiveId: 'moongazers-sigil-intro-forced-max-window-v1',
  pendingExecutionIds: [
    MOONGAZERS_SIGIL_SHIELD_STACK_CONTRACT.shieldPendingExecutionId,
    MOONGAZERS_SIGIL_SHIELD_STACK_CONTRACT.introPendingExecutionId,
  ],
  sourceEstablished: [
    'Each accepted Obtain Shield trigger grants one seven-second MGS-DEF stack, up to five stacks, at most once every 0.5 seconds.',
    'MGS-DEF applies only to Resonance Liberation DMG and its rank value is per stack.',
    'Casting Intro Skill makes the MGS-DEF effect reach five stacks immediately for three seconds.',
  ],
  unresolvedSemantics: [
    'Current source does not explicitly establish what a qualifying Obtain Shield event does while five organic MGS-DEF stacks are already active; refresh/replacement/ignore behavior at cap is not inferred.',
    'The three-second Intro forced-max statement proves the observable maximum-stack window but does not explicitly define how that temporary override mutates or preserves any underlying organic stack expiry schedule.',
    'Lingyang canonical source sequence does not provide exact shield acquisition timestamps, so profile uptime cannot be inferred from team membership or action adjacency.',
  ],
  closesPendingExecutionIds: [] as readonly string[],
  notes: [
    'The organic primitive executes only explicit owner Shield events from caller-supplied known state and fails closed on a valid at-cap event.',
    'The Intro primitive is represented as a separate three-second forced-max read window; it never fabricates five seven-second organic stack expiries.',
    'No teammate Shield producer or uptime is assumed. Both canonical pending IDs remain open until source-safe profile events and the remaining cross-effect semantics are independently closed.',
  ],
} as const;

function uniqueEffect(catalog: readonly WeaponEffectData[], effectId: string): WeaponEffectData | null {
  const matches = catalog.filter((effect) => effect.effectId === effectId);
  if (matches.length === 0) return null;
  if (matches.length > 1) throw new Error(`Duplicate weapon effect id ${effectId}`);
  return matches[0];
}

export function validateMoongazersSigilShieldStackContract(
  catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG,
): readonly string[] {
  const issues: string[] = [];
  const contract = MOONGAZERS_SIGIL_SHIELD_STACK_CONTRACT;
  const shield = uniqueEffect(catalog, contract.shieldEffectId);
  const intro = uniqueEffect(catalog, contract.introEffectId);

  if (!shield) {
    issues.push(`missing weapon effect ${contract.shieldEffectId}`);
  } else {
    if (shield.weaponId !== contract.weaponId) issues.push('MGS-DEF weapon identity drift');
    if (shield.statOrEffect !== 'Resonance Liberation DMG DEF Ignore') issues.push('MGS-DEF stat drift');
    if (shield.effectType !== 'STACKING') issues.push('MGS-DEF must remain STACKING');
    if (shield.trigger !== 'Obtain Shield') issues.push(`MGS-DEF trigger drift: ${shield.trigger}`);
    if (shield.durationSeconds !== contract.shieldDurationSeconds) issues.push(`MGS-DEF duration drift: ${String(shield.durationSeconds)}`);
    if (shield.triggerCooldownSeconds !== contract.triggerCooldownSeconds) issues.push(`MGS-DEF trigger cooldown drift: ${String(shield.triggerCooldownSeconds)}`);
    if (shield.stackIntervalSeconds !== contract.triggerCooldownSeconds) issues.push(`MGS-DEF stack interval drift: ${String(shield.stackIntervalSeconds)}`);
    if (shield.maxStacks !== contract.maxStacks) issues.push(`MGS-DEF maxStacks drift: ${shield.maxStacks}`);
    if (shield.appliesTo !== 'SELF') issues.push('MGS-DEF must remain SELF');
    if (shield.valueUnit !== 'DECIMAL_MULTIPLIER') issues.push('MGS-DEF value unit drift');
    if (shield.mechanicsStatus !== 'VERIFIED_CONDITIONAL') issues.push('MGS-DEF mechanics status must remain VERIFIED_CONDITIONAL');
    if (!shield.conditions.includes('Damage is Resonance Liberation DMG')) issues.push('MGS-DEF Liberation-only condition drift');
    if (shield.rankValues.length !== contract.rankValuesPerStack.length || shield.rankValues.some((value, index) => value !== contract.rankValuesPerStack[index])) {
      issues.push('MGS-DEF rank values drift');
    }
  }

  if (!intro) {
    issues.push(`missing weapon effect ${contract.introEffectId}`);
  } else {
    if (intro.weaponId !== contract.weaponId) issues.push('MGS-MAX-STACK weapon identity drift');
    if (intro.statOrEffect !== 'MGS-DEF Forced Stack Count') issues.push('MGS-MAX-STACK stat drift');
    if (intro.effectType !== 'TRIGGERED') issues.push('MGS-MAX-STACK must remain TRIGGERED');
    if (intro.trigger !== 'Cast Intro Skill') issues.push(`MGS-MAX-STACK trigger drift: ${intro.trigger}`);
    if (intro.durationSeconds !== contract.introForcedMaxDurationSeconds) issues.push(`MGS-MAX-STACK duration drift: ${String(intro.durationSeconds)}`);
    if (intro.maxStacks !== 1) issues.push(`MGS-MAX-STACK maxStacks drift: ${intro.maxStacks}`);
    if (intro.appliesTo !== 'SELF') issues.push('MGS-MAX-STACK must remain SELF');
    if (intro.valueUnit !== 'FLAT_AMOUNT') issues.push('MGS-MAX-STACK value unit drift');
    if (intro.mechanicsStatus !== 'VERIFIED_RAW_PENDING_MODEL') issues.push('MGS-MAX-STACK mechanics status must remain VERIFIED_RAW_PENDING_MODEL');
    if (!intro.conditions.includes('Mutates MGS-DEF stack state')) issues.push('MGS-MAX-STACK cross-effect condition drift');
    if (!intro.rankValues.every((value) => value === contract.maxStacks)) issues.push('MGS-MAX-STACK must force five stacks at every rank');
  }

  const unresolvedSemantics: readonly string[] = MOONGAZERS_SIGIL_SHIELD_STACK_SEMANTIC_REVIEW.unresolvedSemantics;
  if (unresolvedSemantics.length === 0) issues.push('Moongazer shield-stack review must retain explicit unresolved semantics');
  return issues;
}

const CONTRACT_ISSUES = validateMoongazersSigilShieldStackContract();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Moongazer shield-stack contract: ${CONTRACT_ISSUES.join('; ')}`);
}

function assertFiniteNonNegative(label: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be a finite non-negative number: ${value}`);
}

function activeOrganicExpiries(state: MoongazersSigilKnownShieldState, atSeconds: number): readonly number[] {
  return state.organicStackExpiriesSeconds.filter((expiresAtSeconds) => expiresAtSeconds > atSeconds);
}

export function createMoongazersSigilKnownShieldState(params: {
  readonly ownerId: string;
  readonly organicStackExpiriesSeconds: readonly number[];
  readonly lastAcceptedShieldAtSeconds: number | null;
  readonly knownAtSeconds: number;
}): MoongazersSigilKnownShieldState {
  const { ownerId, organicStackExpiriesSeconds, lastAcceptedShieldAtSeconds, knownAtSeconds } = params;
  if (!ownerId.trim()) throw new Error('Moongazer ownerId must be non-blank');
  assertFiniteNonNegative('Moongazer knownAtSeconds', knownAtSeconds);
  if (organicStackExpiriesSeconds.length > MOONGAZERS_SIGIL_SHIELD_STACK_CONTRACT.maxStacks) {
    throw new Error(`Moongazer known organic stack count cannot exceed ${MOONGAZERS_SIGIL_SHIELD_STACK_CONTRACT.maxStacks}`);
  }
  const sortedExpiries = [...organicStackExpiriesSeconds].sort((a, b) => a - b);
  for (const expiry of sortedExpiries) {
    assertFiniteNonNegative('Moongazer organic stack expiry', expiry);
    if (expiry <= knownAtSeconds) throw new Error(`Moongazer known organic stack expiry must be after knownAtSeconds: ${expiry}`);
  }
  if (lastAcceptedShieldAtSeconds !== null) {
    assertFiniteNonNegative('Moongazer lastAcceptedShieldAtSeconds', lastAcceptedShieldAtSeconds);
    if (lastAcceptedShieldAtSeconds > knownAtSeconds) throw new Error('Moongazer last accepted Shield event cannot be after knownAtSeconds');
  }
  return {
    adapterId: 'moongazers-sigil-known-shield-stack-v1',
    ownerId,
    organicStackExpiriesSeconds: sortedExpiries,
    lastAcceptedShieldAtSeconds,
  };
}

export function applyMoongazersSigilShieldEvent(
  state: MoongazersSigilKnownShieldState,
  event: MoongazersSigilShieldEvent,
): MoongazersSigilShieldEventResult {
  if (!event.actorId.trim()) throw new Error('Moongazer Shield event actorId must be non-blank');
  assertFiniteNonNegative('Moongazer Shield event time', event.atSeconds);

  const prunedState: MoongazersSigilKnownShieldState = {
    ...state,
    organicStackExpiriesSeconds: activeOrganicExpiries(state, event.atSeconds),
  };

  if (event.actorId !== state.ownerId) return { status: 'IGNORED_OTHER_ACTOR', state: prunedState };

  const lastAccepted = state.lastAcceptedShieldAtSeconds;
  if (lastAccepted !== null && event.atSeconds < lastAccepted) {
    throw new Error('Moongazer Shield events must not move backward before the last accepted Shield event');
  }
  if (lastAccepted !== null && event.atSeconds - lastAccepted < MOONGAZERS_SIGIL_SHIELD_STACK_CONTRACT.triggerCooldownSeconds) {
    return { status: 'TRIGGER_COOLDOWN', state: prunedState };
  }

  if (prunedState.organicStackExpiriesSeconds.length >= MOONGAZERS_SIGIL_SHIELD_STACK_CONTRACT.maxStacks) {
    return {
      status: 'SOURCE_CAP_REFRESH_UNRESOLVED',
      state: prunedState,
      unresolvedSemantics: MOONGAZERS_SIGIL_SHIELD_STACK_SEMANTIC_REVIEW.unresolvedSemantics,
    };
  }

  const grantedStackExpiresAtSeconds = event.atSeconds + MOONGAZERS_SIGIL_SHIELD_STACK_CONTRACT.shieldDurationSeconds;
  return {
    status: 'STACK_GRANTED',
    grantedStackExpiresAtSeconds,
    state: {
      ...prunedState,
      organicStackExpiriesSeconds: [...prunedState.organicStackExpiriesSeconds, grantedStackExpiresAtSeconds].sort((a, b) => a - b),
      lastAcceptedShieldAtSeconds: event.atSeconds,
    },
  };
}

export function resolveMoongazersSigilOrganicDefIgnore(params: {
  readonly state: MoongazersSigilKnownShieldState;
  readonly rank: 1 | 2 | 3 | 4 | 5;
  readonly atSeconds: number;
}): MoongazersSigilDefIgnoreRead {
  const { state, rank, atSeconds } = params;
  assertFiniteNonNegative('Moongazer DEF-ignore query time', atSeconds);
  if (!Number.isInteger(rank) || rank < 1 || rank > 5) throw new Error(`Moongazer rank must be an integer from 1 through 5: ${rank}`);
  const activeOrganicStackCount = activeOrganicExpiries(state, atSeconds).length;
  const valuePerStack = MOONGAZERS_SIGIL_SHIELD_STACK_CONTRACT.rankValuesPerStack[rank - 1];
  return {
    effectId: 'MGS-DEF',
    statOrEffect: 'Resonance Liberation DMG DEF Ignore',
    damageClass: 'RESONANCE_LIBERATION',
    rank,
    activeOrganicStackCount,
    valuePerStack,
    totalOrganicValue: activeOrganicStackCount * valuePerStack,
  };
}

export function activateMoongazersSigilIntroForcedMaxWindow(params: {
  readonly ownerId: string;
  readonly event: MoongazersSigilIntroEvent;
}): MoongazersSigilForcedMaxWindow | null {
  const { ownerId, event } = params;
  if (!ownerId.trim()) throw new Error('Moongazer ownerId must be non-blank');
  if (!event.actorId.trim()) throw new Error('Moongazer Intro event actorId must be non-blank');
  assertFiniteNonNegative('Moongazer Intro event time', event.atSeconds);
  if (event.actorId !== ownerId) return null;
  return {
    adapterId: 'moongazers-sigil-intro-forced-max-window-v1',
    effectId: 'MGS-MAX-STACK',
    ownerId,
    forcedStackCount: MOONGAZERS_SIGIL_SHIELD_STACK_CONTRACT.maxStacks,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds: event.atSeconds + MOONGAZERS_SIGIL_SHIELD_STACK_CONTRACT.introForcedMaxDurationSeconds,
  };
}

export function isMoongazersSigilIntroForcedMaxActive(
  window: MoongazersSigilForcedMaxWindow,
  atSeconds: number,
): boolean {
  assertFiniteNonNegative('Moongazer forced-max query time', atSeconds);
  return atSeconds >= window.startedAtSeconds && atSeconds < window.expiresAtSeconds;
}
