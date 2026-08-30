import type { WeaponEffectData } from '../effectDomain.ts';
import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import {
  AeroErosionTargetState,
  timedEffectCoversRemainingShortRotation,
  type AeroErosionTargetSnapshot,
} from './aeroErosionTargetState.ts';

function weaponEffect(effectId: string): WeaponEffectData {
  const effect = WEAPON_EFFECT_CATALOG.find((row) => row.effectId === effectId);
  if (!effect) throw new Error(`Missing weapon effect ${effectId}.`);
  return effect;
}

function rankValue(effect: WeaponEffectData, rank: number): number {
  if (!Number.isInteger(rank) || rank < 1 || rank > effect.rankValues.length) {
    throw new Error(`${effect.effectId}: rank must be 1-${effect.rankValues.length}, got ${rank}.`);
  }
  return effect.rankValues[rank - 1];
}

const WA_AERO = weaponEffect('WA-AERO');
const WA_AERO_RES = weaponEffect('WA-AERO-RES');
const DT_AERO_AMP = weaponEffect('DT-AERO-AMP');

export const AERO_EROSION_WEAPON_ADAPTER_REVIEW_20260830 = {
  adapterId: 'aero-erosion-weapon-target-state-v1',
  checkedAt: '2026-08-30',
  supportedEffectIds: ['WA-AERO', 'WA-AERO-RES', 'DT-AERO-AMP'],
  closesPendingExecutionIds: [
    'weapon:woodland-aria:WA-AERO:trigger-uptime-adapter',
    'weapon:woodland-aria:WA-AERO-RES:target-state-adapter',
    'weapon:defiers-thorn:DT-AERO-AMP:target-state-adapter',
  ],
  notes: [
    'The adapter consumes explicit Aero Erosion application/target state; it never assumes the target starts affected.',
    'Woodland Aria trigger windows are activated only after the source-proven event that triggers them. The triggering damage itself does not receive a newly-created buff/debuff because source text does not prove same-hit ordering.',
    'Defier’s Thorn DT-AERO-AMP is a state query only: it is active exactly when the supplied target state is affected by Aero Erosion. DT-DEF remains a separate source-semantics blocker and is not touched here.',
  ],
} as const;

export interface WoodlandAriaExecutionSnapshot {
  readonly target: AeroErosionTargetSnapshot;
  readonly aeroDamageBonusActive: boolean;
  readonly targetAeroResReductionActive: boolean;
}

/**
 * Woodland Aria execution adapter for one fixed short rotation.
 *
 * No per-action timestamps are invented. The verified 10s/20s weapon windows
 * are only treated as lasting to the end when each full supported rotation is
 * shorter than the source duration.
 */
export class WoodlandAriaAeroExecutionState {
  readonly target: AeroErosionTargetState;
  readonly rank: number;
  private aeroDamageBonusActive = false;
  private targetAeroResReductionActive = false;

  constructor(target: AeroErosionTargetState, rank = 1) {
    this.target = target;
    this.rank = rank;
    rankValue(WA_AERO, rank);
    rankValue(WA_AERO_RES, rank);
    if (!timedEffectCoversRemainingShortRotation(target.rotationSeconds, WA_AERO.durationSeconds)) {
      throw new Error(`WA-AERO ${WA_AERO.durationSeconds}s window does not prove full ${target.rotationSeconds}s short-rotation coverage.`);
    }
    if (!timedEffectCoversRemainingShortRotation(target.rotationSeconds, WA_AERO_RES.durationSeconds)) {
      throw new Error(`WA-AERO-RES ${WA_AERO_RES.durationSeconds}s window does not prove full ${target.rotationSeconds}s short-rotation coverage.`);
    }
  }

  get aeroDamageBonus(): number {
    return this.aeroDamageBonusActive ? rankValue(WA_AERO, this.rank) : 0;
  }

  get targetAeroResReduction(): number {
    return this.targetAeroResReductionActive ? rankValue(WA_AERO_RES, this.rank) : 0;
  }

  snapshot(): WoodlandAriaExecutionSnapshot {
    return {
      target: this.target.snapshot(),
      aeroDamageBonusActive: this.aeroDamageBonusActive,
      targetAeroResReductionActive: this.targetAeroResReductionActive,
    };
  }

  /** Called after an action has source-proven Aero Erosion application. */
  afterAeroErosionApplication(eventIndex: number, sourceFactId: string, stacksApplied = 1): WoodlandAriaExecutionSnapshot {
    this.target.apply(eventIndex, sourceFactId, stacksApplied);
    this.aeroDamageBonusActive = true;
    return this.snapshot();
  }

  /**
   * Called after damage resolution. The caller must pass whether the target was
   * affected before that hit; this prevents the adapter from granting the RES
   * reduction to the same hit that creates the relevant target state.
   */
  afterTargetHit(targetWasAffectedBeforeHit: boolean): WoodlandAriaExecutionSnapshot {
    if (targetWasAffectedBeforeHit) this.targetAeroResReductionActive = true;
    return this.snapshot();
  }
}

export function defiersThornAeroDamageTakenAmplification(
  target: AeroErosionTargetState,
  rank = 1,
): number {
  return target.snapshot().affected ? rankValue(DT_AERO_AMP, rank) : 0;
}
