import {ALTERNATIVE_TEAM_CONTEXTS} from './data/alternativeTeamContexts.ts';

export function findAlternativeTeamContexts(input:{anchorCharacterId:string;ownedCharacterIds?:readonly string[];excludeCharacterIds?:readonly string[];includeRecommendedCore?:boolean;includeModelCandidates?:boolean}){
  const owned=input.ownedCharacterIds?new Set(input.ownedCharacterIds):null,excluded=new Set(input.excludeCharacterIds??[]);
  return ALTERNATIVE_TEAM_CONTEXTS.filter(row=>row.anchorCharacterId===input.anchorCharacterId&&
    (!owned||row.characterIds.every(id=>owned.has(id)))&&!row.characterIds.some(id=>excluded.has(id))&&
    (row.relationship==='ALTERNATIVE'||(input.includeRecommendedCore&&['SOURCE_BIS_REFERENCE','SOURCE_RECOMMENDED_CORE_VARIANT'].includes(row.relationship))||(input.includeModelCandidates&&row.relationship==='UNRANKED_MODEL_CANDIDATE')));
}

/** Only explicit reviewed support-slot alternatives for the same carry/partner core. */
export function findTeamSupportAlternatives(anchorCharacterId:string,partnerCharacterId:string,ownedCharacterIds?:readonly string[]){
  return ALTERNATIVE_TEAM_CONTEXTS.filter(row=>row.evidenceBasis!=='PUBLISHED_MODEL_ROSTER_ONLY'&&row.anchorCharacterId===anchorCharacterId&&row.roleAssignment.partner===partnerCharacterId&&row.roleAssignment.support!==null&&(!ownedCharacterIds||row.characterIds.every(id=>ownedCharacterIds.includes(id))));
}
