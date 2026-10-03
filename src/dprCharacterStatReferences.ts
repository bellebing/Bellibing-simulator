import type { CharacterRecommendationSourceClass, DprReferenceRole } from './characterRecommendationDomain.ts';
import type { DprExtractedRow, DprExtraction } from './dprCharacterStatExtraction.ts';
import { DPR_NORMALIZATION_VERSION, DPR_SPREADSHEET_ID, DPR_SPREADSHEET_TITLE, dprSemanticBinding } from './dprCharacterStatExtraction.ts';
import { CHARACTER_RECOMMENDATION_UNITS } from './characterRecommendationDomain.ts';
import { DPR_CHARACTER_STAT_EXTRACTION } from './data/dprCharacterStatReferences.ts';
import { DPR_CHARACTER_STAT_REFERENCE_REVIEW } from './data/dprCharacterStatReferenceReview.ts';

export interface DprReferenceReview {
  readonly id: string; readonly checkedAt: string;
  readonly spreadsheetId: string; readonly sourceClass: CharacterRecommendationSourceClass;
  readonly normalizationVersion: string; readonly semanticSha256: string;
  readonly decision: 'APPROVED_PROJECT_REFERENCE_EXTRACTION' | 'PENDING';
  readonly userAuthorization: string;
}
export type CanonicalDprReferenceRow = DprExtractedRow & {
  readonly status: 'VERIFIED' | 'PENDING' | 'REVIEW_REQUIRED';
  readonly value: { readonly kind: 'REFERENCE'; readonly role: DprReferenceRole; readonly reference: number } | null;
  readonly comparisonStatus: 'PENDING'; readonly reason: string | null;
};
export interface DprCharacterReferenceProfile {
  readonly characterId: string; readonly variantKey: string; readonly sheetId: number; readonly sheetTitle: string;
  readonly sourceFamily: 'DPR_CALC'; readonly sourceClass: 'USER_APPROVED_PROJECT_SOURCE';
  readonly reviewId: string; readonly sourceBinding: string;
  readonly sourceReviewStatus: 'CURRENT' | 'PENDING' | 'REVIEW_REQUIRED';
  readonly rows: readonly CanonicalDprReferenceRow[];
}

/** Independent reference family. Never overwrites/averages Prydwen or feeds an evaluator. */
export async function projectDprCharacterStatReferences(
  characterId: string,
  dependencies: { readonly extraction?: DprExtraction; readonly review?: DprReferenceReview } = {},
): Promise<readonly DprCharacterReferenceProfile[]> {
  const extraction = structuredClone(dependencies.extraction ?? DPR_CHARACTER_STAT_EXTRACTION) as DprExtraction;
  const review = structuredClone(dependencies.review ?? DPR_CHARACTER_STAT_REFERENCE_REVIEW);
  const binding = await dprSemanticBinding(extraction);
  const valid = binding === extraction.semanticSha256 && binding === review.semanticSha256
    && extraction.spreadsheetId === DPR_SPREADSHEET_ID && extraction.spreadsheetTitle === DPR_SPREADSHEET_TITLE
    && review.spreadsheetId === extraction.spreadsheetId
    && review.normalizationVersion === DPR_NORMALIZATION_VERSION && extraction.normalizationVersion === DPR_NORMALIZATION_VERSION
    && review.sourceClass === 'USER_APPROVED_PROJECT_SOURCE' && extraction.sourceClass === review.sourceClass
    && review.decision === 'APPROVED_PROJECT_REFERENCE_EXTRACTION'
    && /^\d{4}-\d{2}-\d{2}$/.test(review.checkedAt) && !!review.userAuthorization.trim();
  const profiles = new Map<string, DprCharacterReferenceProfile>();
  for (const row of extraction.rows.filter(r => r.characterId === characterId)) {
    const key = row.sheetId+':'+row.variantKey;
    let profile = profiles.get(key);
    if (!profile) {
      profile = { characterId, variantKey: row.variantKey, sheetId: row.sheetId, sheetTitle: row.sheetTitle,
        sourceFamily: 'DPR_CALC', sourceClass: 'USER_APPROVED_PROJECT_SOURCE', reviewId: review.id,
        sourceBinding: binding, sourceReviewStatus: valid ? 'CURRENT' : 'REVIEW_REQUIRED', rows: [] };
      profiles.set(key,profile);
    }
    const unavailable = row.extractionStatus === 'UNAVAILABLE';
    const rowValid = Object.hasOwn(CHARACTER_RECOMMENDATION_UNITS,row.metric)
      && CHARACTER_RECOMMENDATION_UNITS[row.metric] === row.unit
      && ['GENERAL_RECOMMENDATION','CALC_BENCHMARK'].includes(row.sectionRole)
      && (unavailable ? row.normalizedNumericValue === null : Number.isFinite(row.normalizedNumericValue)
        && row.normalizedNumericValue === row.effectiveValue?.numberValue);
    const issue = extraction.issues.some(i => i.sheetId === row.sheetId);
    const status = !valid || !rowValid || issue ? 'REVIEW_REQUIRED' : unavailable ? 'PENDING' : 'VERIFIED';
    const canonical: CanonicalDprReferenceRow = { ...row, status, comparisonStatus: 'PENDING',
      value: status === 'VERIFIED' ? { kind: 'REFERENCE', role: row.sectionRole, reference: row.normalizedNumericValue! } : null,
      reason: status === 'VERIFIED' ? null : status === 'PENDING' ? 'Blank source value; no inference.'
        : 'Missing, unreviewed, ambiguous or drifted semantic source binding.' };
    const nextRows = [...profile.rows,canonical];
    profiles.set(key,{ ...profile, rows: nextRows,
      sourceReviewStatus: nextRows.some(r => r.status === 'REVIEW_REQUIRED') ? 'REVIEW_REQUIRED'
        : nextRows.some(r => r.status === 'PENDING') ? 'PENDING' : 'CURRENT' });
  }
  return [...profiles.values()];
}
