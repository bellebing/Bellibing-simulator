export interface AlternativeTeamContext {
  readonly id:string;
  readonly anchorCharacterId:string;
  readonly characterIds:readonly string[];
  readonly relationship:'SOURCE_BIS_REFERENCE'|'SOURCE_RECOMMENDED_CORE_VARIANT'|'ALTERNATIVE'|'UNRANKED_MODEL_CANDIDATE';
  readonly evidenceBasis:'REVIEWED_GUIDE_SLOT_SYNTHESIS'|'REVIEWED_GUIDE_TRIO'|'PUBLISHED_MODEL_ROSTER_ONLY';
  readonly modeRequirements:Readonly<Record<string,string>>;
  readonly roleAssignment:{readonly partner:string|null;readonly support:string|null};
  readonly accessibility:'NON_LIMITED_PARTNERS'|'MIXED_PARTNERS'|'ALL_LIMITED_PARTNERS';
  readonly partnerAccess:readonly {readonly characterId:string;readonly kind:'FOUR_STAR'|'STANDARD_FIVE_STAR'|'PROTAGONIST'|'LIMITED_FIVE_STAR'}[];
  readonly sustain:'HEALING_MEMBER_PRESENT'|'CONDITIONAL_SUSTAIN'|'HEALING_SETUP_REQUIRED'|'NO_LISTED_HEALER';
  readonly whySv:string;
  readonly conditionsSv:readonly string[];
  readonly sourceRefs:readonly {readonly provider:'PRYDWEN'|'RILEY_CALCS';readonly url:string;readonly locator:string}[];
  readonly reviewedRuleIds:readonly string[];
  readonly publisherRowIds:readonly number[];
  readonly sourceModes:readonly {readonly characterId:string;readonly mode:string|null;readonly loadoutIndex:number}[];
  readonly ranking:'NO_INFERRED_DPS_RANK';
  readonly rotationTimingStatus:'NOT_RESEARCHED_FOR_THIS_ALTERNATIVE_CONTEXT';
}
