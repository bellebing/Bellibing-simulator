import type { RotationProfile } from '../profileDomain.ts';
import {
  engineModelsMechanicFact,
  getRotationEngineRegistration,
} from '../rotationEngineRegistry.ts';
import { CHARACTER_MECHANIC_FACT_BY_ID } from './characterMechanics.ts';

export interface RotationMechanicsAuditIssue {
  factId: string;
  issue: string;
}

export interface RotationMechanicsDependencyAudit {
  rotationId: string;
  modeledFactCount: number;
  assumedFactCount: number;
  issues: readonly RotationMechanicsAuditIssue[];
}

/**
 * Validates the boundary between a verified rotation and the raw mechanic facts
 * it depends on. A modeled dependency must either already be globally MODELED
 * or be explicitly executed by this concrete engine registration; an assumed
 * dependency must at least be source VERIFIED. This preserves raw-source status
 * instead of mutating MODEL_READY facts just because one profile engine supports
 * them.
 */
export function auditRotationMechanicDependencies(
  rotation: RotationProfile,
): RotationMechanicsDependencyAudit {
  const issues: RotationMechanicsAuditIssue[] = [];
  const modeled = new Set(rotation.modeledMechanicFactIds);
  const assumed = new Set(rotation.assumedMechanicFactIds);

  if (modeled.size !== rotation.modeledMechanicFactIds.length) {
    issues.push({ factId: '*', issue: 'duplicate modeled mechanic dependency' });
  }
  if (assumed.size !== rotation.assumedMechanicFactIds.length) {
    issues.push({ factId: '*', issue: 'duplicate assumed mechanic dependency' });
  }

  const engine = getRotationEngineRegistration(rotation.engineModelId);
  if (rotation.executionStatus === 'ENGINE_MODELED') {
    if (!engine) {
      issues.push({ factId: '*', issue: `unknown engine model ${String(rotation.engineModelId)}` });
    } else if (engine.characterId !== rotation.characterId) {
      issues.push({ factId: '*', issue: `engine model belongs to ${engine.characterId}` });
    }
  } else if (rotation.engineModelId !== null) {
    issues.push({ factId: '*', issue: 'SOURCE_SEQUENCE_ONLY rotation cannot declare engineModelId' });
  }

  for (const factId of modeled) {
    if (assumed.has(factId)) {
      issues.push({ factId, issue: 'same fact cannot be both modeled and assumed' });
    }
    const fact = CHARACTER_MECHANIC_FACT_BY_ID.get(factId);
    if (!fact) {
      issues.push({ factId, issue: 'unknown modeled mechanic fact' });
      continue;
    }
    if (fact.characterId !== rotation.characterId) {
      issues.push({ factId, issue: `modeled fact belongs to ${fact.characterId}` });
    }
    if (fact.verificationStatus !== 'VERIFIED') {
      issues.push({ factId, issue: `modeled fact is ${fact.verificationStatus}, not VERIFIED` });
    }
    if (fact.modelingStatus !== 'MODELED' && !engineModelsMechanicFact(rotation.engineModelId, factId)) {
      issues.push({
        factId,
        issue: `declared modeled but fact modelingStatus is ${fact.modelingStatus} and engine ${String(rotation.engineModelId)} does not register coverage`,
      });
    }
  }

  for (const factId of assumed) {
    const fact = CHARACTER_MECHANIC_FACT_BY_ID.get(factId);
    if (!fact) {
      issues.push({ factId, issue: 'unknown assumed mechanic fact' });
      continue;
    }
    if (fact.characterId !== rotation.characterId) {
      issues.push({ factId, issue: `assumed fact belongs to ${fact.characterId}` });
    }
    if (fact.verificationStatus !== 'VERIFIED') {
      issues.push({ factId, issue: `assumed fact is ${fact.verificationStatus}, not VERIFIED` });
    }
  }

  return {
    rotationId: rotation.id,
    modeledFactCount: modeled.size,
    assumedFactCount: assumed.size,
    issues,
  };
}

export function findRotationsDependingOnMechanicFact(
  factId: string,
  rotations: readonly RotationProfile[],
): readonly RotationProfile[] {
  return rotations.filter(
    (rotation) => rotation.modeledMechanicFactIds.includes(factId) || rotation.assumedMechanicFactIds.includes(factId),
  );
}
