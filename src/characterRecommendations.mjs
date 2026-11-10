import {CHARACTER_GUIDE_RECOMMENDATIONS} from './data/characterEquipmentAssociations.ts';
import {sourcePriorityGuidance} from './characterPriorityGuidance.mjs';

// Presentation of the reviewed guide snapshot. Source order and conditions are
// retained; these are neither per-Echo acceptance rules nor DPS weights.
const projected=new Map();
const guides=new Map(CHARACTER_GUIDE_RECOMMENDATIONS.map(row=>[row.characterId,row]));
const unique=rows=>[...new Set(rows.filter(Boolean))];
const mainName=text=>text.trim().replace(/^(Aero|Electro|Fusion|Glacio|Havoc|Spectro) DMG%$/,'$1 DMG');
function recommendationProfile(characterId){
 if(projected.has(characterId))return projected.get(characterId);
 const guide=guides.get(characterId);if(!guide)return null;
 const mainStats=guide.mainStats.map(row=>({...structuredClone(row),names:unique(row.sourceText.split(/[/>=≥]+/).map(mainName))}));
 const result={characterId,kind:'REVIEWED_GUIDE_PRESENTATION_NOT_DPS_OPTIMISATION',sourceUrl:guide.sourceUrl,capturedAt:guide.capturedAt,sourceLinesSha256:guide.sourceLinesSha256,
  weapons:structuredClone(guide.weapons),sets:structuredClone(guide.echoSets),mainStats,priorities:sourcePriorityGuidance(guide),
  teammateGroups:structuredClone(guide.teammateGroups),generalTeamGuidance:structuredClone(guide.generalTeamGuidance),calculationContexts:structuredClone(guide.calculationContexts)};
 projected.set(characterId,result);return result;
}
export function characterRecommendations(characterId){const profile=recommendationProfile(characterId);return profile?structuredClone(profile):null;}
export function recommendedMainStats(characterId,cost,allowedNames=null){
 return unique(recommendationProfile(characterId)?.mainStats.filter(row=>row.cost===cost).flatMap(row=>row.names)??[]).filter(name=>!allowedNames||allowedNames.includes(name));
}
export function recommendedSetIds(characterId){return unique(recommendationProfile(characterId)?.sets.map(row=>row.setId)??[]);}
export function recommendedWeaponIds(characterId){return unique(recommendationProfile(characterId)?.weapons.map(row=>row.weaponId)??[]);}
export function recommendationOrder(items,ids,getId=row=>row.id){
 const ranks=new Map(ids.map((id,index)=>[id,index]));
 return [...items].sort((a,b)=>(ranks.get(getId(a))??Infinity)-(ranks.get(getId(b))??Infinity));
}
