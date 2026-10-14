import { CHARACTER_TARGET_PRESENTATIONS } from './improve-settings/character-targets.mjs';

/** Read generated source-owned presentation only; never writes settings or evaluates a build. */
export function recommendedCharacterStatsPresentation(characterId) {
  return structuredClone(CHARACTER_TARGET_PRESENTATIONS.find(item => item.characterId === characterId)?.rows ?? []);
}

/** Descriptive static-stat comparison only. Never an upgrade verdict or stop rule. */
export function simulatedCharacterTargets(characterId, projection, settings) {
  const keys = { TOTAL_ATK: 'atk', TOTAL_CRIT_RATE: 'critRate', TOTAL_CRIT_DAMAGE: 'critDamage',
    TOTAL_ENERGY_REGEN: 'energyRegen', HEAVY_ATTACK_DMG_BONUS: 'heavyAttackDamageBonus' };
  const policy = settings?.presentation.characterTarget.numericTargets;
  const suspended = settings?.compatibility.suspendedSections?.includes('numericTargets');
  if (settings?.compatibility.context !== 'MATCH' || suspended || settings?.migration) return [];
  const recommended = recommendedCharacterStatsPresentation(characterId);
  const rows = policy?.status === 'USER_DEFINED'
    ? (policy.value ?? []).map(row => ({ ...row, label: recommended.find(item => item.metric === row.metric)?.label ?? row.metric,
      target: row.minimum, basisLabel: 'Custom minimum' }))
    : recommended.map(row => ({ ...row, target: row.status === 'READY' ? row.sourceValue?.reference : undefined, basisLabel: 'Recommended reference' }));
  return rows.map(row => {
    const actual = projection?.[keys[row.metric]], target = row.target;
    const known = Number.isFinite(actual) && Number.isFinite(target);
    return { ...row, actual, target, status: known ? actual >= target ? 'MET' : 'BELOW' : 'PENDING' };
  });
}
