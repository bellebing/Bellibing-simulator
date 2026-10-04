import type { CharacterRecommendationMetric, RecommendationUnit } from './characterRecommendationDomain.ts';
import { CHARACTER_RECOMMENDATION_UNITS } from './characterRecommendationDomain.ts';
import type { CanonicalDprReferenceRow, DprCharacterReferenceProfile } from './dprCharacterStatReferences.ts';
import { projectDprCharacterStatReferences } from './dprCharacterStatReferences.ts';
import { CHARACTER_CATALOG } from './data/characters.ts';

/** Labels and insertion order belong to presentation, separately from Customize. */
export const CHARACTER_TARGET_LABELS: Readonly<Record<CharacterRecommendationMetric, string>> = {
  TOTAL_HP: 'HP', TOTAL_DEF: 'DEF', TOTAL_ATK: 'ATK', TOTAL_CRIT_RATE: 'CRIT Rate',
  TOTAL_CRIT_DAMAGE: 'CRIT DMG', TOTAL_ENERGY_REGEN: 'Energy Regen', ELECTRO_DMG_BONUS: 'Electro DMG Bonus',
  BASIC_ATTACK_DMG_BONUS: 'Basic Attack DMG', HEAVY_ATTACK_DMG_BONUS: 'Heavy Attack DMG',
  RESONANCE_SKILL_DMG_BONUS: 'Resonance Skill DMG', RESONANCE_LIBERATION_DMG_BONUS: 'Resonance Liberation DMG',
};

export interface CharacterTargetStatPresentation {
  readonly metric: CharacterRecommendationMetric;
  readonly label: string;
  readonly unit: RecommendationUnit;
  readonly status: 'READY' | 'PENDING';
  readonly displayValue: string;
  /** Exact Calc source value/role survives display rounding; no evaluator semantics. */
  readonly sourceValue: { readonly kind: 'REFERENCE'; readonly role: 'CALC_BENCHMARK'; readonly reference: number } | null;
}
export interface CharacterTargetPresentation {
  readonly characterId: string;
  readonly status: 'READY' | 'PENDING';
  readonly rows: readonly CharacterTargetStatPresentation[];
}

/** Round only display strings. Percent precision suppresses binary arithmetic noise. */
export function formatCharacterReference(reference: number, unit: RecommendationUnit): string {
  return unit === 'POINTS'
    ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(reference)
    : new Intl.NumberFormat('en-US', { maximumFractionDigits: 6, useGrouping: false }).format(reference * 100) + '%';
}

function calcReference(row: CanonicalDprReferenceRow | undefined, metric: CharacterRecommendationMetric,
  profile: DprCharacterReferenceProfile): number | null {
  return row?.status === 'VERIFIED' && row.metric === metric
    && row.characterId === profile.characterId && row.variantKey === 'DEFAULT' && row.sheetId === profile.sheetId
    && row.unit === CHARACTER_RECOMMENDATION_UNITS[metric] && row.sectionRole === 'CALC_BENCHMARK'
    && row.value?.kind === 'REFERENCE' && row.value.role === 'CALC_BENCHMARK' && Number.isFinite(row.value.reference)
    ? row.value.reference : null;
}

/** Bellibing's single visible target basis is modern DEFAULT Calc, without source cross-fill.
 * Pure presentation only: no equipment, persistence, General/canonical fallback or evaluator input.
 */
export function characterTargetPresentation(characterId: string,
  profiles: readonly DprCharacterReferenceProfile[]): CharacterTargetPresentation {
  const defaults = profiles.filter(profile => profile.characterId === characterId && profile.variantKey === 'DEFAULT');
  const profile = defaults.length === 1 && defaults[0].sourceReviewStatus !== 'REVIEW_REQUIRED' ? defaults[0] : null;
  const rows: CharacterTargetStatPresentation[] = [];
  if (profile) for (const metric of Object.keys(CHARACTER_TARGET_LABELS) as CharacterRecommendationMetric[]) {
    const calcRows = profile.rows.filter(row => row.metric === metric && row.sectionRole === 'CALC_BENCHMARK');
    if (!calcRows.length) continue; // Only explicit Calc metrics own row truth, including blank Pending rows.
    const reference = calcRows.length === 1 ? calcReference(calcRows[0], metric, profile) : null;
    const unit = CHARACTER_RECOMMENDATION_UNITS[metric];
    rows.push({ metric, label: CHARACTER_TARGET_LABELS[metric], unit,
      status: reference !== null ? 'READY' : 'PENDING',
      displayValue: reference !== null ? formatCharacterReference(reference, unit) : 'Pending',
      sourceValue: reference !== null ? { kind: 'REFERENCE', role: 'CALC_BENCHMARK', reference } : null });
  }
  return { characterId, status: rows.some(row => row.status === 'READY') ? 'READY' : 'PENDING', rows };
}

export async function projectCharacterTargetPresentation(characterId: string): Promise<CharacterTargetPresentation> {
  return characterTargetPresentation(characterId, await projectDprCharacterStatReferences(characterId));
}

export async function projectCharacterTargetPresentations(): Promise<readonly CharacterTargetPresentation[]> {
  return Promise.all(CHARACTER_CATALOG.map(character => projectCharacterTargetPresentation(character.id)));
}
