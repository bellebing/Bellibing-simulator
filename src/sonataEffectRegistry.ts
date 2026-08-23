import { SONATA_CATALOG } from './data/sonatas.ts';
import type { SonataGameData } from './gameDataDomain.ts';
import type { SonataEffectModel } from './sonataEffectDomain.ts';

export interface SonataEffectRegistry {
  byId: ReadonlyMap<string, SonataEffectModel>;
  bySonataSetId: ReadonlyMap<string, readonly SonataEffectModel[]>;
}

export function createSonataEffectRegistry(
  effects: readonly SonataEffectModel[],
): SonataEffectRegistry {
  // The generated catalog intentionally preserves literal IDs/piece tuples.
  // Widen only at this lookup boundary so arbitrary validated effect records can
  // be checked without weakening the source catalog itself.
  const sonataById: ReadonlyMap<string, SonataGameData> = new Map<string, SonataGameData>(
    SONATA_CATALOG.map((row) => [row.id, row] as [string, SonataGameData]),
  );
  const byId = new Map<string, SonataEffectModel>();
  const grouped = new Map<string, SonataEffectModel[]>();

  for (const effect of effects) {
    if (byId.has(effect.effectId)) throw new Error(`Duplicate Sonata effect id: ${effect.effectId}`);
    const sonata = sonataById.get(effect.sonataSetId);
    if (!sonata) throw new Error(`Unknown Sonata id for ${effect.effectId}: ${effect.sonataSetId}`);
    const activationPieces: readonly number[] = sonata.activationPieces;
    if (!activationPieces.includes(effect.pieces)) {
      throw new Error(`${effect.effectId} uses ${effect.pieces}pc but ${sonata.name} does not support that activation`);
    }
    if (!Number.isFinite(effect.value) || effect.value < 0) {
      throw new Error(`${effect.effectId} has invalid value`);
    }
    if (effect.effectType === 'STACKING' && (!effect.maxStacks || effect.maxStacks < 1)) {
      throw new Error(`${effect.effectId} stacking effect requires maxStacks`);
    }
    if (effect.capValue !== undefined && (!Number.isFinite(effect.capValue) || effect.capValue < effect.value)) {
      throw new Error(`${effect.effectId} has invalid capValue`);
    }
    if (effect.durationSeconds !== null && effect.durationSeconds <= 0) {
      throw new Error(`${effect.effectId} has invalid duration`);
    }

    byId.set(effect.effectId, effect);
    const list = grouped.get(effect.sonataSetId) ?? [];
    list.push(effect);
    grouped.set(effect.sonataSetId, list);
  }

  return {
    byId,
    bySonataSetId: new Map(
      [...grouped.entries()].map(([id, rows]) => [id, Object.freeze([...rows])] as const),
    ),
  };
}

export function getSonataEffects(
  registry: SonataEffectRegistry,
  sonataSetId: string,
): readonly SonataEffectModel[] {
  return registry.bySonataSetId.get(sonataSetId) ?? [];
}
