import type { CharacterGameData } from '../gameDataDomain.ts';
import { CHARACTER_CATALOG } from './characters.ts';

export type ReleasedCharacterRequiredRawField =
  | 'element'
  | 'weaponType'
  | 'hp'
  | 'atk'
  | 'def'
  | 'maxEnergy'
  | 'critRate'
  | 'critDamage'
  | 'energyRegen';

export interface CharacterRawPendingField {
  characterId: string;
  fields: readonly ReleasedCharacterRequiredRawField[];
  checkedAt: string;
  reason: string;
}

/**
 * Explicit exceptions for RELEASED characters only.
 *
 * A null required field is allowed only while it appears here with a reason.
 * As soon as the field is resolved, the audit intentionally fails until the
 * stale pending exception is removed too. This prevents silent half-records.
 */
export const RELEASED_CHARACTER_RAW_PENDING: readonly CharacterRawPendingField[] = [
  {
    characterId: 'qingxiao',
    fields: ['maxEnergy'],
    checkedAt: '2026-08-25',
    reason: 'Current sources conflict on Max Energy / energy-field semantics. Resonance Liberation cost is not substituted for Max Energy.',
  },
  {
    characterId: 'rover-electro',
    fields: ['maxEnergy'],
    checkedAt: '2026-08-25',
    reason: 'Current sources disagree between 125 and 140. One source separately reports 125 Liberation cost, which does not prove the Max Energy cap.',
  },
  {
    characterId: 'suisui',
    fields: ['maxEnergy'],
    checkedAt: '2026-08-25',
    reason: 'Current databases expose incompatible 125/140/175 energy-labelled values; semantic ownership remains unresolved.',
  },
] as const;

export interface CharacterRawAuditIssue {
  characterId: string;
  field: ReleasedCharacterRequiredRawField;
}

export interface CharacterRawCompletenessAudit {
  releasedCount: number;
  unexpectedMissing: readonly CharacterRawAuditIssue[];
  stalePending: readonly CharacterRawAuditIssue[];
  unknownPendingCharacters: readonly string[];
}

function missingRequiredFields(character: CharacterGameData): ReleasedCharacterRequiredRawField[] {
  const missing: ReleasedCharacterRequiredRawField[] = [];
  if (character.element === null) missing.push('element');
  if (character.weaponType === null) missing.push('weaponType');
  if (character.level90.hp === null) missing.push('hp');
  if (character.level90.atk === null) missing.push('atk');
  if (character.level90.def === null) missing.push('def');
  if (character.level90.maxEnergy === null) missing.push('maxEnergy');
  if (character.baseCombat.critRate === null) missing.push('critRate');
  if (character.baseCombat.critDamage === null) missing.push('critDamage');
  if (character.baseCombat.energyRegen === null) missing.push('energyRegen');
  return missing;
}

function pendingKey(characterId: string, field: ReleasedCharacterRequiredRawField): string {
  return `${characterId}:${field}`;
}

export function auditReleasedCharacterRawCompleteness(
  catalog: readonly CharacterGameData[] = CHARACTER_CATALOG,
  pending: readonly CharacterRawPendingField[] = RELEASED_CHARACTER_RAW_PENDING,
): CharacterRawCompletenessAudit {
  const released = catalog.filter((character) => character.releaseStatus === 'RELEASED');
  const releasedById = new Map(released.map((character) => [character.id, character]));
  const pendingKeys = new Set<string>();
  const unknownPendingCharacters = new Set<string>();

  for (const exception of pending) {
    if (!releasedById.has(exception.characterId)) unknownPendingCharacters.add(exception.characterId);
    for (const field of exception.fields) pendingKeys.add(pendingKey(exception.characterId, field));
  }

  const unexpectedMissing: CharacterRawAuditIssue[] = [];
  const actualMissingKeys = new Set<string>();
  for (const character of released) {
    for (const field of missingRequiredFields(character)) {
      const key = pendingKey(character.id, field);
      actualMissingKeys.add(key);
      if (!pendingKeys.has(key)) unexpectedMissing.push({ characterId: character.id, field });
    }
  }

  const stalePending: CharacterRawAuditIssue[] = [];
  for (const exception of pending) {
    for (const field of exception.fields) {
      const key = pendingKey(exception.characterId, field);
      if (!actualMissingKeys.has(key)) stalePending.push({ characterId: exception.characterId, field });
    }
  }

  return {
    releasedCount: released.length,
    unexpectedMissing,
    stalePending,
    unknownPendingCharacters: [...unknownPendingCharacters].sort(),
  };
}
