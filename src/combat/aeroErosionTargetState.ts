export const AERO_EROSION_EXECUTION_REVIEW_20260830 = {
  reviewId: 'AERO-EROSION-EXECUTION-SEMANTICS-2026-08-30-01',
  checkedAt: '2026-08-30',
  sourceLabels: [
    'Wuthering Waves Wiki — Negative Status',
  ],
  sourceUrls: [
    'https://wutheringwaves.fandom.com/wiki/Negative_Status',
  ],
  minimumStackPersistenceSeconds: 15,
  notes: [
    'Current source states that Aero Erosion stacks are reduced every 15 seconds.',
    'This primitive intentionally exposes only a conservative minimum-persistence guarantee needed by short fixed rotations. It does not invent stack tick damage, stack caps, refresh cadence, per-stack expiry timestamps or a generic status-damage formula.',
    'A caller may only prove target-state persistence when its entire supported rotation is shorter than or equal to the reviewed 15-second reduction interval.',
  ],
} as const;

export interface AeroErosionApplication {
  readonly eventIndex: number;
  readonly sourceFactId: string;
  readonly stacksApplied: number;
}

export interface AeroErosionTargetSnapshot {
  readonly affected: boolean;
  readonly observedStacks: number;
  readonly applicationCount: number;
  readonly lastApplicationEventIndex: number | null;
}

/**
 * Ordered target-state primitive for source-proven Aero Erosion applications.
 *
 * This is deliberately event-indexed rather than timestamped. Current closure
 * work has a verified total rotation duration but no source-backed timestamp for
 * each action, so the model must not fabricate per-action timing.
 */
export class AeroErosionTargetState {
  private observedStacks = 0;
  private readonly applications: AeroErosionApplication[] = [];

  constructor(
    readonly rotationSeconds: number,
    readonly minimumPersistenceSeconds = AERO_EROSION_EXECUTION_REVIEW_20260830.minimumStackPersistenceSeconds,
  ) {
    if (!Number.isFinite(rotationSeconds) || rotationSeconds <= 0) {
      throw new Error(`Aero Erosion target state requires a positive finite rotation duration, got ${rotationSeconds}.`);
    }
    if (!Number.isFinite(minimumPersistenceSeconds) || minimumPersistenceSeconds <= 0) {
      throw new Error(`Aero Erosion target state requires a positive finite persistence interval, got ${minimumPersistenceSeconds}.`);
    }
  }

  /**
   * The only persistence claim this primitive makes: once an application is
   * observed, it cannot be assumed to expire inside a rotation whose full
   * duration fits inside the reviewed reduction interval.
   */
  get persistenceGuaranteedForRotation(): boolean {
    return this.rotationSeconds <= this.minimumPersistenceSeconds;
  }

  apply(eventIndex: number, sourceFactId: string, stacksApplied = 1): AeroErosionTargetSnapshot {
    if (!Number.isInteger(eventIndex) || eventIndex < 0) {
      throw new Error(`Aero Erosion application requires a non-negative integer event index, got ${eventIndex}.`);
    }
    if (!sourceFactId.trim()) throw new Error('Aero Erosion application requires a source fact id.');
    if (!Number.isInteger(stacksApplied) || stacksApplied <= 0) {
      throw new Error(`Aero Erosion application requires a positive integer stack count, got ${stacksApplied}.`);
    }
    const previous = this.applications.at(-1);
    if (previous && eventIndex < previous.eventIndex) {
      throw new Error(`Aero Erosion events must be applied in order: ${eventIndex} < ${previous.eventIndex}.`);
    }
    if (!this.persistenceGuaranteedForRotation) {
      throw new Error(
        `Aero Erosion persistence is not proven for a ${this.rotationSeconds}s rotation from the reviewed ${this.minimumPersistenceSeconds}s interval.`,
      );
    }

    this.observedStacks += stacksApplied;
    this.applications.push({ eventIndex, sourceFactId, stacksApplied });
    return this.snapshot();
  }

  snapshot(): AeroErosionTargetSnapshot {
    const last = this.applications.at(-1) ?? null;
    return {
      affected: this.observedStacks > 0,
      observedStacks: this.observedStacks,
      applicationCount: this.applications.length,
      lastApplicationEventIndex: last?.eventIndex ?? null,
    };
  }

  /**
   * Explicit reset hook for a future engine boundary. No expiry is simulated
   * implicitly because the current source review does not justify one.
   */
  clear(): void {
    this.observedStacks = 0;
    this.applications.length = 0;
  }
}

export function timedEffectCoversRemainingShortRotation(
  rotationSeconds: number,
  durationSeconds: number | null,
): boolean {
  return durationSeconds !== null
    && Number.isFinite(durationSeconds)
    && durationSeconds > 0
    && durationSeconds >= rotationSeconds;
}
