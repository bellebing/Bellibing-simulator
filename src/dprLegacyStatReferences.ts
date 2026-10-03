import type {DprReferenceReview} from './dprCharacterStatReferences.ts';
import {projectDprCharacterStatReferences} from './dprCharacterStatReferences.ts';
import type {DprLegacyExtraction,DprLegacyStatRow} from './dprLegacyStatExtraction.ts';
import {DPR_LEGACY_NORMALIZATION_VERSION,dprLegacySemanticBinding,parseLegacyRatioToken} from './dprLegacyStatExtraction.ts';
import {DPR_SPREADSHEET_ID,DPR_SPREADSHEET_TITLE,dprSemanticBinding} from './dprCharacterStatExtraction.ts';
import {DPR_CHARACTER_STAT_EXTRACTION} from './data/dprCharacterStatReferences.ts';
import {DPR_LEGACY_STAT_EXTRACTION} from './data/dprLegacyStatReferences.ts';
import {DPR_LEGACY_STAT_REFERENCE_REVIEW} from './data/dprLegacyStatReferenceReview.ts';

export type CanonicalDprScenarioRow=DprLegacyStatRow & {
  readonly status:'VERIFIED'|'PENDING'|'REVIEW_REQUIRED';
  readonly value:{readonly kind:'REFERENCE';readonly role:'CALC_SCENARIO_REFERENCE';readonly reference:number}|null;
  readonly comparisonStatus:'PENDING';readonly reason:string|null;
};
export interface CanonicalDprScenario {
  readonly characterId:string;readonly variantKey:string;readonly scenarioKey:string;
  readonly scenarioLabel:string;readonly scenarioContext:string;readonly sheetId:number;readonly sheetTitle:string;
  readonly sourceFamily:'DPR_CALC';readonly sourceClass:'USER_APPROVED_PROJECT_SOURCE';
  readonly reviewId:string;readonly sourceBinding:string;readonly sourceReviewStatus:'CURRENT'|'PENDING'|'REVIEW_REQUIRED';
  readonly rows:readonly CanonicalDprScenarioRow[];
}
/** All explicit scenarios survive. No winning/default setup or missing metric inference. */
export async function projectDprCalcScenarioReferences(characterId:string,
  dependencies:{readonly extraction?:DprLegacyExtraction;readonly review?:DprReferenceReview}={}
):Promise<readonly CanonicalDprScenario[]> {
  const extraction=structuredClone(dependencies.extraction??DPR_LEGACY_STAT_EXTRACTION) as DprLegacyExtraction;
  const review=structuredClone(dependencies.review??DPR_LEGACY_STAT_REFERENCE_REVIEW);
  const binding=await dprLegacySemanticBinding(extraction);
  const valid=binding===extraction.semanticSha256 && binding===review.semanticSha256
    && review.normalizationVersion===DPR_LEGACY_NORMALIZATION_VERSION && extraction.normalizationVersion===DPR_LEGACY_NORMALIZATION_VERSION
    && extraction.spreadsheetId===DPR_SPREADSHEET_ID && extraction.spreadsheetTitle===DPR_SPREADSHEET_TITLE
    && review.spreadsheetId===extraction.spreadsheetId && review.sourceClass==='USER_APPROVED_PROJECT_SOURCE'
    && extraction.sourceClass===review.sourceClass && review.decision==='APPROVED_PROJECT_REFERENCE_EXTRACTION'
    && /^\d{4}-\d{2}-\d{2}$/.test(review.checkedAt) && !!review.userAuthorization.trim()
    && extraction.modernSource.normalizationVersion===DPR_CHARACTER_STAT_EXTRACTION.normalizationVersion
    && extraction.modernSource.semanticSha256===DPR_CHARACTER_STAT_EXTRACTION.semanticSha256
    && await dprSemanticBinding(DPR_CHARACTER_STAT_EXTRACTION)===extraction.modernSource.semanticSha256;
  const profiles=new Map<string,CanonicalDprScenario>();
  const metrics=['TOTAL_ENERGY_REGEN','TOTAL_CRIT_RATE','TOTAL_CRIT_DAMAGE'] as const;
  for(const row of extraction.rows.filter(r=>r.characterId===characterId)) {
    const previous=profiles.get(row.scenarioKey);
    const tokens=row.originalValueText?.split('|')??[null,null,null];
    const rowValid=row.sectionRole==='CALC_SCENARIO_REFERENCE' && metrics[row.tokenIndex]===row.metric
      && ['ER','CR','CD'][row.tokenIndex]===row.originalStatLabel && row.unit==='RATIO'
      && tokens.length===3 && (tokens[row.tokenIndex]??null)===row.sourceToken
      && (row.sourceToken?.trim()?parseLegacyRatioToken(row.sourceToken):null)===row.normalizedNumericValue
      && !!row.scenarioLabel.trim() && !!row.scenarioContext.trim();
    const unavailable=row.normalizedNumericValue===null;
    const issue=extraction.issues.some(i=>i.sheetId===row.sheetId);
    const status=!valid || !rowValid || issue?'REVIEW_REQUIRED':unavailable?'PENDING':'VERIFIED';
    const canonical:CanonicalDprScenarioRow={...row,status,comparisonStatus:'PENDING',
      value:status==='VERIFIED'?{kind:'REFERENCE',role:'CALC_SCENARIO_REFERENCE',reference:row.normalizedNumericValue!}:null,
      reason:status==='VERIFIED'?null:status==='PENDING'?'Blank scenario stat; no inference.'
        :'Unreviewed, ambiguous or drifted legacy source/context binding.'};
    const rows=[...(previous?.rows??[]),canonical];
    profiles.set(row.scenarioKey,{characterId,variantKey:row.variantKey,scenarioKey:row.scenarioKey,
      scenarioLabel:row.scenarioLabel,scenarioContext:row.scenarioContext,sheetId:row.sheetId,sheetTitle:row.sheetTitle,
      sourceFamily:'DPR_CALC',sourceClass:'USER_APPROVED_PROJECT_SOURCE',reviewId:review.id,sourceBinding:binding,
      sourceReviewStatus:rows.some(r=>r.status==='REVIEW_REQUIRED')?'REVIEW_REQUIRED':rows.some(r=>r.status==='PENDING')?'PENDING':'CURRENT',rows});
  }
  return [...profiles.values()];
}

/** Combined family discovery only; retains each modern profile and each scenario. */
export async function projectDprAllCharacterStatReferences(characterId:string) {
  return {characterId,modernProfiles:await projectDprCharacterStatReferences(characterId),
    legacyScenarios:await projectDprCalcScenarioReferences(characterId),
    coverage:structuredClone(DPR_LEGACY_STAT_EXTRACTION.coverage.filter(c=>c.characterId===characterId))};
}
