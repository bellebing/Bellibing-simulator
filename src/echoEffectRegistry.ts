import { CHARACTER_CATALOG } from './data/characters.ts';
import { ECHO_CATALOG } from './data/echoes.ts';
import type { EchoEffectModel } from './echoEffectDomain.ts';
import type { EchoGameData } from './gameDataDomain.ts';

export interface EchoEffectRegistry {
  byId: ReadonlyMap<string, EchoEffectModel>;
  byEchoId: ReadonlyMap<string, readonly EchoEffectModel[]>;
}

const CHARACTER_IDS = new Set(CHARACTER_CATALOG.map((row) => row.id));

export function createEchoEffectRegistry(
  effects: readonly EchoEffectModel[],
): EchoEffectRegistry {
  // Preserve literal generated raw data and widen only at the relationship lookup.
  const echoById: ReadonlyMap<string, EchoGameData> = new Map<string, EchoGameData>(
    ECHO_CATALOG.map((row) => [row.id, row] as [string, EchoGameData]),
  );
  const byId = new Map<string, EchoEffectModel>();
  const grouped = new Map<string, EchoEffectModel[]>();

  for (const effect of effects) {
    if (byId.has(effect.effectId)) throw new Error(`Duplicate Echo effect id: ${effect.effectId}`);
    if (!echoById.has(effect.echoId)) {
      throw new Error(`Unknown Echo id for ${effect.effectId}: ${effect.echoId}`);
    }
    if (!Number.isFinite(effect.value) || effect.value < 0) {
      throw new Error(`${effect.effectId} has invalid value`);
    }
    if (effect.durationSeconds !== null && effect.durationSeconds <= 0) {
      throw new Error(`${effect.effectId} has invalid duration`);
    }
    if (effect.activation === 'MAIN_SLOT_PASSIVE' && effect.durationSeconds !== null) {
      throw new Error(`${effect.effectId} main-slot passive must use permanent/null duration`);
    }
    if (effect.wielderCharacterIds !== undefined) {
      if (effect.wielderCharacterIds.length === 0) {
        throw new Error(`${effect.effectId} has an empty wielder character restriction`);
      }
      if (effect.appliesTo !== 'WIELDER') {
        throw new Error(`${effect.effectId} character restriction must apply to wielder`);
      }
      const seenCharacters = new Set<string>();
      for (const characterId of effect.wielderCharacterIds) {
        if (!CHARACTER_IDS.has(characterId)) {
          throw new Error(`${effect.effectId} references unknown wielder character ${characterId}`);
        }
        if (seenCharacters.has(characterId)) {
          throw new Error(`${effect.effectId} duplicates wielder character ${characterId}`);
        }
        seenCharacters.add(characterId);
      }
    }
    if (effect.activation === 'TRANSFER_WINDOW') {
      if (!effect.activationWindowSeconds || effect.activationWindowSeconds <= 0) {
        throw new Error(`${effect.effectId} transfer effect requires activationWindowSeconds`);
      }
      if (effect.appliesTo !== 'INCOMING_RESONATOR') {
        throw new Error(`${effect.effectId} transfer effect must apply to incoming Resonator`);
      }
    }

    byId.set(effect.effectId, effect);
    const list = grouped.get(effect.echoId) ?? [];
    list.push(effect);
    grouped.set(effect.echoId, list);
  }

  return {
    byId,
    byEchoId: new Map(
      [...grouped.entries()].map(([id, rows]) => [id, Object.freeze([...rows])] as const),
    ),
  };
}

export function getEchoEffects(
  registry: EchoEffectRegistry,
  echoId: string,
): readonly EchoEffectModel[] {
  return registry.byEchoId.get(echoId) ?? [];
}

export function getEchoEffectsForWielder(
  registry: EchoEffectRegistry,
  echoId: string,
  wielderCharacterId: string,
): readonly EchoEffectModel[] {
  if (!CHARACTER_IDS.has(wielderCharacterId)) {
    throw new Error(`Unknown Echo-effect wielder character id: ${wielderCharacterId}`);
  }
  return getEchoEffects(registry, echoId).filter((effect) =>
    effect.wielderCharacterIds === undefined
      || effect.wielderCharacterIds.includes(wielderCharacterId));
}
