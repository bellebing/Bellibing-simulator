import { CHARACTER_CATALOG } from './data/characters.ts';
import { PROFILE_REGISTRY } from './data/profileCatalogs.ts';
import { getDefaultBuildPreset } from './profileRegistry.ts';
import { SUBSTAT_TYPES } from './echoCoreRules.ts';

/** Presentation-only view of the existing default profile; no stat ranking or policy math. */
export function projectImproveSettingsSources() {
  return CHARACTER_CATALOG.filter(character => character.releaseStatus === 'RELEASED').map(character => {
    const resolved = getDefaultBuildPreset(PROFILE_REGISTRY, character.id);
    const profile = resolved?.statTarget;
    const ready = resolved?.preset.verificationStatus === 'VERIFIED'
      && profile?.verificationStatus === 'VERIFIED' && profile.characterId === character.id
      && profile.targetRules.length > 0
      && profile.targetRules.every(rule => SUBSTAT_TYPES.includes(rule.stat));
    return {
      characterId: character.id,
      status: ready ? 'READY' : 'PENDING',
      presetId: ready ? resolved.preset.id : null,
      profileId: ready ? profile.id : null,
      profileName: ready ? profile.name : null,
      provenance: ready ? profile.provenance : null,
      // Guide build priorities include conditional ER and ties; they do not verify
      // a static Valuable Stats DPR ranking or an Active/default selected set.
      recommendedOrderStatus: 'PENDING',
      recommendedActiveStats: [],
      // Neutral canonical/source order only. No priority/weight inference.
      stats: ready ? profile.targetRules.map(rule => ({ name: rule.stat, note: rule.notes ?? null })) : [],
    };
  });
}
