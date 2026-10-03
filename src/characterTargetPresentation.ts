import type { CharacterRecommendationMetric, RecommendationUnit, RecommendationValue,
  RecommendedCharacterStats } from './characterRecommendationDomain.ts';
import { CHARACTER_RECOMMENDATION_UNITS } from './characterRecommendationDomain.ts';
import type { CanonicalDprReferenceRow, DprCharacterReferenceProfile } from './dprCharacterStatReferences.ts';
import { projectDprCharacterStatReferences } from './dprCharacterStatReferences.ts';
import { projectRecommendedCharacterStats } from './characterRecommendationSources.ts';
import { CHARACTER_CATALOG } from './data/characters.ts';

/** Labels and insertion order belong to presentation, separately from Customize. */
export const CHARACTER_TARGET_LABELS: Readonly<Record<CharacterRecommendationMetric, string>> = {
  TOTAL_HP: 'HP', TOTAL_DEF: 'DEF', TOTAL_ATK: 'ATK', TOTAL_CRIT_RATE: 'CRIT Rate',
  TOTAL_CRIT_DAMAGE: 'CRIT DMG', TOTAL_ENERGY_REGEN: 'Energy Regen', ELECTRO_DMG_BONUS: 'Electro DMG Bonus',
  BASIC_ATTACK_DMG_BONUS: 'Basic Attack DMG', HEAVY_ATTACK_DMG_BONUS: 'Heavy Attack DMG',
  RESONANCE_SKILL_DMG_BONUS: 'Resonance Skill DMG', RESONANCE_LIBERATION_DMG_BONUS: 'Resonance Liberation DMG',
};

type PrimaryRecommendation =
  | { readonly family: 'CANONICAL'; readonly value: RecommendationValue; readonly originalText: string }
  | { readonly family: 'DPR_GENERAL'; readonly value: { readonly kind: 'REFERENCE';
      readonly role: 'GENERAL_RECOMMENDATION'; readonly reference: number } };
export interface CharacterTargetStatPresentation {
  readonly metric: CharacterRecommendationMetric;
  readonly label: string;
  readonly unit: RecommendationUnit;
  readonly status: 'READY' | 'PENDING';
  readonly displayValue: string;
  readonly secondaryDisplay: string | null;
  /** Exact source values survive display rounding; these are not executable targets. */
  readonly primary: PrimaryRecommendation | null;
  readonly dprGeneral: number | null;
  readonly dprCalc: number | null;
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

function reference(row: CanonicalDprReferenceRow | undefined, metric: CharacterRecommendationMetric,
  role: 'GENERAL_RECOMMENDATION' | 'CALC_BENCHMARK'): number | null {
  return row?.status === 'VERIFIED' && row.metric === metric
    && row.unit === CHARACTER_RECOMMENDATION_UNITS[metric] && row.sectionRole === role
    && row.value?.kind === 'REFERENCE' && row.value.role === role && Number.isFinite(row.value.reference)
    ? row.value.reference : null;
}

/** Pure presentation of verified projections. No equipment, persistence or evaluator input. */
export function characterTargetPresentation(characterId: string, canonical: RecommendedCharacterStats,
  profiles: readonly DprCharacterReferenceProfile[]): CharacterTargetPresentation {
  const defaults = profiles.filter(profile => profile.characterId === characterId && profile.variantKey === 'DEFAULT');
  const profile = defaults.length === 1 && defaults[0].sourceReviewStatus !== 'REVIEW_REQUIRED' ? defaults[0] : null;
  const canonicalRows = canonical.characterId === characterId && canonical.sourceReviewStatus !== 'REVIEW_REQUIRED'
    ? canonical.rows : [];
  const rows: CharacterTargetStatPresentation[] = [];
  for (const metric of Object.keys(CHARACTER_TARGET_LABELS) as CharacterRecommendationMetric[]) {
    const recommendations = canonicalRows.filter(row => row.metric === metric);
    const recommendation = recommendations.length === 1 ? recommendations[0] : undefined;
    const generalRows = profile?.rows.filter(row => row.metric === metric && row.sectionRole === 'GENERAL_RECOMMENDATION') ?? [];
    const calcRows = profile?.rows.filter(row => row.metric === metric && row.sectionRole === 'CALC_BENCHMARK') ?? [];
    if (!recommendations.length && !generalRows.length) continue; // Calc alone cannot create a recommendation row.
    const unit = CHARACTER_RECOMMENDATION_UNITS[metric];
    const pairValid = generalRows.length <= 1 && calcRows.length <= 1
      && [...generalRows, ...calcRows].every(row => row.characterId === characterId && row.variantKey === 'DEFAULT'
        && row.sheetId === profile?.sheetId && row.unit === unit
        && (row.value === null || row.value.role === row.sectionRole));
    const general = pairValid ? reference(generalRows[0], metric, 'GENERAL_RECOMMENDATION') : null;
    const calc = pairValid ? reference(calcRows[0], metric, 'CALC_BENCHMARK') : null;
    const wording = recommendation?.status === 'VERIFIED' && recommendation.unit === unit
      ? recommendation.evidence.find(item => item.metric === metric && item.originalText?.trim())?.originalText : null;
    const primary: PrimaryRecommendation | null = wording && recommendation?.status === 'VERIFIED'
      ? { family: 'CANONICAL', value: structuredClone(recommendation.value), originalText: wording }
      : general !== null ? { family: 'DPR_GENERAL', value: { kind: 'REFERENCE', role: 'GENERAL_RECOMMENDATION', reference: general } } : null;
    const secondary = primary?.family === 'CANONICAL' && general !== null ? ['DPR ' + formatCharacterReference(general, unit)] : [];
    if (primary && calc !== null) secondary.push('Calc ' + formatCharacterReference(calc, unit));
    rows.push({ metric, label: CHARACTER_TARGET_LABELS[metric], unit, status: primary ? 'READY' : 'PENDING',
      displayValue: primary?.family === 'CANONICAL' ? primary.originalText
        : primary ? formatCharacterReference(primary.value.reference, unit) : 'Pending',
      secondaryDisplay: secondary.length ? secondary.join(' · ') : null, primary,
      dprGeneral: general, dprCalc: primary ? calc : null });
  }
  return { characterId, status: rows.some(row => row.status === 'READY') ? 'READY' : 'PENDING', rows };
}

export async function projectCharacterTargetPresentation(characterId: string): Promise<CharacterTargetPresentation> {
  const [canonical, profiles] = await Promise.all([
    projectRecommendedCharacterStats(characterId), projectDprCharacterStatReferences(characterId),
  ]);
  return characterTargetPresentation(characterId, canonical, profiles);
}

export async function projectCharacterTargetPresentations(): Promise<readonly CharacterTargetPresentation[]> {
  return Promise.all(CHARACTER_CATALOG.map(character => projectCharacterTargetPresentation(character.id)));
}
