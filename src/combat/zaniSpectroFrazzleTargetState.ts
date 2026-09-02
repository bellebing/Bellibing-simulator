export const ZANI_SPECTRO_FRAZZLE_TARGET_STATE_ADAPTER_ID = 'zani-spectro-frazzle-target-state-v1' as const;

export const ZANI_SPECTRO_FRAZZLE_TARGET_STATE_REVIEW_20260831 = {
  reviewId: 'ZANI-SPECTRO-FRAZZLE-TARGET-STATE-2026-08-31-01',
  checkedAt: '2026-08-31',
  heliacalEmberMaxStacks: 60,
  heliacalEmberDurationSeconds: 6,
  blazePerConvertedHeliacalEmber: 5,
  targetedActionBlazeGain: 10,
  outroDamageModifierPerHeliacalEmber: 0.10,
  eternalRadianceAttackThresholdStacks: 10,
  sourceLabels: [
    'Bellibing current VERIFIED Zani Character Mechanics',
    'Prydwen — current Zani kit semantics',
  ],
  sourceUrls: [
    'src/data/characterMechanics/zaniRawSupport.ts',
    'https://www.prydwen.gg/wuthering-waves/characters/zani',
  ],
  notes: [
    'Spectro Frazzle application, Frazzle stack count, atomic consumption/conversion, Heliacal Ember lifetime, Heliacal Ember consumption and Zani Blaze deltas are separate events/contracts.',
    'This primitive never assumes a target already has Spectro Frazzle and never invents a teammate application. The caller must supply the exact post-application Frazzle stack count observed before Zani conversion.',
    'Heliacal Ember is TARGET state here. The returned Blaze delta belongs to Zani SELF state and is deliberately not applied by this target-state primitive.',
    'Heliacal Ember counts as Spectro Frazzle only for Eternal Radiance stack-count evaluation. That equivalence does not prove that creating/converting Heliacal Ember fires Eternal Radiance’s separate “Inflict Spectro Frazzle” event trigger.',
    'Each Heliacal Ember stack receives its own six-second expiry. Current reviewed source does not prove overflow/refresh ordering at the 60-stack cap, so any event that would overflow the live cap fails closed instead of replacing or refreshing stacks.',
  ],
} as const;

export const ZANI_DIRECT_HELIACAL_APPLICATION_FACT_IDS = [
  'zani-resonance-skill-restless-watch-targeted-action-dmg',
  'zani-resonance-skill-restless-watch-forcible-riposte-dmg',
] as const;

export type ZaniDirectHeliacalApplicationFactId = typeof ZANI_DIRECT_HELIACAL_APPLICATION_FACT_IDS[number];

export interface ZaniSpectroFrazzleApplicationEvent {
  readonly atSeconds: number;
  readonly targetId: string;
  readonly sourceActorId: string;
  readonly sourceFactId: string;
  /**
   * Exact target stack count after the incoming Spectro Frazzle application and
   * immediately before Zani's source-proven atomic conversion.
   */
  readonly frazzleStacksOnTargetAfterApplication: number;
}

export interface ZaniFrazzleConversionResult {
  readonly kind: 'SPECTRO_FRAZZLE_APPLICATION_CONVERTED';
  readonly atSeconds: number;
  readonly targetId: string;
  readonly sourceActorId: string;
  readonly sourceFactId: string;
  readonly appliedFrazzleStateObservedStacks: number;
  readonly consumedSpectroFrazzleStacks: number;
  readonly createdHeliacalEmberStacks: number;
  readonly heliacalEmberExpiresAtSeconds: number;
  readonly triggersSpectroFrazzleDamageResolution: true;
  readonly zaniSelfBlazeDelta: number;
}

export interface ZaniDirectHeliacalApplicationResult {
  readonly kind: 'DIRECT_HELIACAL_EMBER_APPLICATION';
  readonly atSeconds: number;
  readonly targetId: string;
  readonly sourceActorId: 'zani';
  readonly sourceFactId: ZaniDirectHeliacalApplicationFactId;
  readonly createdHeliacalEmberStacks: 1;
  readonly heliacalEmberExpiresAtSeconds: number;
  readonly zaniSelfBlazeDelta: 10;
}

export interface ZaniEternalRadianceTargetView {
  readonly targetId: string;
  readonly spectroFrazzleStacks: 0;
  readonly heliacalEmberStacks: number;
  readonly effectiveFrazzleStacksForEternalRadiance: number;
  readonly attackTenStackConditionMet: boolean;
  /** Heliacal equivalence is stack-count truth, not proof of this event trigger. */
  readonly provesInflictSpectroFrazzleTrigger: false;
}

export interface ZaniHeliacalOutroConsumeResult {
  readonly targetId: string;
  readonly atSeconds: number;
  readonly consumedHeliacalEmberStacks: number;
  readonly sourceDeclaredDamageModifierPerStack: 0.10;
  readonly sourceDeclaredTotalDamageModifier: number;
}

export interface ZaniSpectroFrazzleTargetSnapshot extends ZaniEternalRadianceTargetView {
  readonly nextHeliacalExpirySeconds: number | null;
}

interface HeliacalEmberStackState {
  readonly expiresAtSeconds: number;
  readonly sourceActorId: string;
  readonly sourceFactId: string;
  readonly origin: 'FRAZZLE_CONVERSION' | 'DIRECT_ZANI_APPLICATION';
}

function requireFiniteNonNegativeSeconds(atSeconds: number): void {
  if (!Number.isFinite(atSeconds) || atSeconds < 0) {
    throw new Error(`Zani target state requires a finite non-negative timestamp, got ${atSeconds}.`);
  }
}

function requirePositiveInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} requires a positive integer, got ${value}.`);
  }
}

function requireNonBlank(value: string, label: string): void {
  if (!value.trim()) throw new Error(`${label} must not be blank.`);
}

export class ZaniSpectroFrazzleTargetState {
  readonly targetId: string;
  private heliacalEmberStacks: HeliacalEmberStackState[] = [];
  private lastObservedAtSeconds = 0;

  constructor(targetId: string) {
    requireNonBlank(targetId, 'Zani target id');
    this.targetId = targetId;
  }

  private advanceTo(atSeconds: number): void {
    requireFiniteNonNegativeSeconds(atSeconds);
    if (atSeconds < this.lastObservedAtSeconds) {
      throw new Error(`Zani target-state events must be monotonic: ${atSeconds} < ${this.lastObservedAtSeconds}.`);
    }
    this.heliacalEmberStacks = this.heliacalEmberStacks.filter((stack) => stack.expiresAtSeconds > atSeconds);
    this.lastObservedAtSeconds = atSeconds;
  }

  private requireTarget(targetId: string): void {
    if (targetId !== this.targetId) {
      throw new Error(`Zani target state is bound to ${this.targetId}, got event for ${targetId}.`);
    }
  }

  private requireCapacity(stacksToCreate: number): void {
    const nextCount = this.heliacalEmberStacks.length + stacksToCreate;
    if (nextCount > ZANI_SPECTRO_FRAZZLE_TARGET_STATE_REVIEW_20260831.heliacalEmberMaxStacks) {
      throw new Error(
        `Zani Heliacal Ember event would overflow the source cap (${nextCount} > ${ZANI_SPECTRO_FRAZZLE_TARGET_STATE_REVIEW_20260831.heliacalEmberMaxStacks}); overflow/refresh ordering is not source-proven.`,
      );
    }
  }

  private createHeliacalStacks(
    count: number,
    atSeconds: number,
    sourceActorId: string,
    sourceFactId: string,
    origin: HeliacalEmberStackState['origin'],
  ): number {
    this.requireCapacity(count);
    const expiresAtSeconds = atSeconds + ZANI_SPECTRO_FRAZZLE_TARGET_STATE_REVIEW_20260831.heliacalEmberDurationSeconds;
    for (let index = 0; index < count; index += 1) {
      this.heliacalEmberStacks.push({ expiresAtSeconds, sourceActorId, sourceFactId, origin });
    }
    return expiresAtSeconds;
  }

  applyIncomingSpectroFrazzle(event: ZaniSpectroFrazzleApplicationEvent): ZaniFrazzleConversionResult {
    this.requireTarget(event.targetId);
    requireNonBlank(event.sourceActorId, 'Spectro Frazzle source actor id');
    requireNonBlank(event.sourceFactId, 'Spectro Frazzle source fact id');
    requirePositiveInteger(event.frazzleStacksOnTargetAfterApplication, 'Spectro Frazzle post-application stack count');
    this.advanceTo(event.atSeconds);

    const convertedStacks = event.frazzleStacksOnTargetAfterApplication;
    const expiresAtSeconds = this.createHeliacalStacks(
      convertedStacks,
      event.atSeconds,
      event.sourceActorId,
      event.sourceFactId,
      'FRAZZLE_CONVERSION',
    );

    return {
      kind: 'SPECTRO_FRAZZLE_APPLICATION_CONVERTED',
      atSeconds: event.atSeconds,
      targetId: event.targetId,
      sourceActorId: event.sourceActorId,
      sourceFactId: event.sourceFactId,
      appliedFrazzleStateObservedStacks: convertedStacks,
      consumedSpectroFrazzleStacks: convertedStacks,
      createdHeliacalEmberStacks: convertedStacks,
      heliacalEmberExpiresAtSeconds: expiresAtSeconds,
      triggersSpectroFrazzleDamageResolution: true,
      zaniSelfBlazeDelta: convertedStacks * ZANI_SPECTRO_FRAZZLE_TARGET_STATE_REVIEW_20260831.blazePerConvertedHeliacalEmber,
    };
  }

  applyDirectZaniHeliacalEmber(
    atSeconds: number,
    sourceFactId: ZaniDirectHeliacalApplicationFactId,
    targetId = this.targetId,
  ): ZaniDirectHeliacalApplicationResult {
    this.requireTarget(targetId);
    if (!ZANI_DIRECT_HELIACAL_APPLICATION_FACT_IDS.includes(sourceFactId)) {
      throw new Error(`Zani direct Heliacal Ember source fact is not reviewed: ${sourceFactId}.`);
    }
    this.advanceTo(atSeconds);
    const expiresAtSeconds = this.createHeliacalStacks(1, atSeconds, 'zani', sourceFactId, 'DIRECT_ZANI_APPLICATION');
    return {
      kind: 'DIRECT_HELIACAL_EMBER_APPLICATION',
      atSeconds,
      targetId,
      sourceActorId: 'zani',
      sourceFactId,
      createdHeliacalEmberStacks: 1,
      heliacalEmberExpiresAtSeconds: expiresAtSeconds,
      zaniSelfBlazeDelta: ZANI_SPECTRO_FRAZZLE_TARGET_STATE_REVIEW_20260831.targetedActionBlazeGain,
    };
  }

  eternalRadianceView(atSeconds: number): ZaniEternalRadianceTargetView {
    this.advanceTo(atSeconds);
    const effectiveStacks = this.heliacalEmberStacks.length;
    return {
      targetId: this.targetId,
      spectroFrazzleStacks: 0,
      heliacalEmberStacks: effectiveStacks,
      effectiveFrazzleStacksForEternalRadiance: effectiveStacks,
      attackTenStackConditionMet: effectiveStacks >= ZANI_SPECTRO_FRAZZLE_TARGET_STATE_REVIEW_20260831.eternalRadianceAttackThresholdStacks,
      provesInflictSpectroFrazzleTrigger: false,
    };
  }

  consumeHeliacalEmberForBeaconForTheFuture(atSeconds: number): ZaniHeliacalOutroConsumeResult {
    this.advanceTo(atSeconds);
    const consumed = this.heliacalEmberStacks.length;
    this.heliacalEmberStacks = [];
    return {
      targetId: this.targetId,
      atSeconds,
      consumedHeliacalEmberStacks: consumed,
      sourceDeclaredDamageModifierPerStack: 0.10,
      sourceDeclaredTotalDamageModifier: consumed * ZANI_SPECTRO_FRAZZLE_TARGET_STATE_REVIEW_20260831.outroDamageModifierPerHeliacalEmber,
    };
  }

  snapshot(atSeconds: number): ZaniSpectroFrazzleTargetSnapshot {
    const view = this.eternalRadianceView(atSeconds);
    return {
      ...view,
      nextHeliacalExpirySeconds: this.heliacalEmberStacks[0]?.expiresAtSeconds ?? null,
    };
  }
}
