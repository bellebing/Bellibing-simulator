import type { FactoryEvidenceReconciliation } from '../evidence.ts';
import {
  FACTORY_WEAPON_R1_ATTRIBUTE_DMG_FAMILY_ID,
  buildWeaponR1AttributeDmgEvidenceReport,
  type FactoryWeaponAttributeDmgEvidenceSnapshot,
} from './weaponAttributeDmg.ts';

interface FactoryEvidenceSnapshotEnvelope {
  readonly schemaVersion: number;
  readonly familyId: string;
  readonly subjectId: string;
  readonly fieldId: string;
  readonly capturedAt: string;
  readonly providers: readonly unknown[];
}

function readEnvelope(snapshot: unknown): FactoryEvidenceSnapshotEnvelope {
  if (typeof snapshot !== 'object' || snapshot === null || Array.isArray(snapshot)) {
    throw new Error('Factory evidence mapper: snapshot must be an object');
  }

  const row = snapshot as Readonly<Record<string, unknown>>;
  if (typeof row.schemaVersion !== 'number') throw new Error('Factory evidence mapper: schemaVersion must be numeric');
  if (typeof row.familyId !== 'string' || row.familyId.trim().length === 0) {
    throw new Error('Factory evidence mapper: familyId must be non-empty');
  }
  if (typeof row.subjectId !== 'string' || row.subjectId.trim().length === 0) {
    throw new Error('Factory evidence mapper: subjectId must be non-empty');
  }
  if (typeof row.fieldId !== 'string' || row.fieldId.trim().length === 0) {
    throw new Error('Factory evidence mapper: fieldId must be non-empty');
  }
  if (typeof row.capturedAt !== 'string' || row.capturedAt.trim().length === 0) {
    throw new Error('Factory evidence mapper: capturedAt must be non-empty');
  }
  if (!Array.isArray(row.providers)) throw new Error('Factory evidence mapper: providers must be an array');

  return row as unknown as FactoryEvidenceSnapshotEnvelope;
}

export function reconcileFactoryEvidenceSnapshot(snapshot: unknown): FactoryEvidenceReconciliation {
  const envelope = readEnvelope(snapshot);

  if (envelope.familyId === FACTORY_WEAPON_R1_ATTRIBUTE_DMG_FAMILY_ID) {
    return buildWeaponR1AttributeDmgEvidenceReport(
      snapshot as FactoryWeaponAttributeDmgEvidenceSnapshot,
    ).reconciliation;
  }

  throw new Error(`Factory evidence mapper: no reviewed mapper registered for family ${envelope.familyId}`);
}
