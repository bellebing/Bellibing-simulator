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
// Per-slot Build suggestions come directly from the reviewed Prydwen slotOrder.
// They are browser filters/presentation, never equipment or an Improve policy.
export function recommendedEchoSlot(characterId, slotIndex) {
 if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex > 4) return null;
 const profile = recommendationProfile(characterId);
 const matches = profile?.mainStats.filter(row => row.slotOrder === slotIndex + 1) ?? [];
 if (matches.length !== 1 || ![1, 3, 4].includes(matches[0].cost) || !matches[0].names.length) return null;
 const row = matches[0];
 return {cost: row.cost, mainStats: [...row.names], sourceText: row.sourceText, sourceLine: row.sourceLine, sourceUrl: profile.sourceUrl};
}
// An explicitly connected first companion is a recommended *option*, not
// a mandate to equip any Sonata or to invent a 5-piece/2-piece assignment.
export function recommendedEchoFilterSetIds(characterId) {
 const rows = recommendationProfile(characterId)?.sets ?? [];
 const primary = rows.find(row => row.section === 'BEST_ECHO_SETS' && row.usage === 'PRIMARY');
 if (!primary) return [];
 const companion = rows.find(row => row.section === 'BEST_ECHO_SETS' && row.usage === 'COMPANION_OPTION' && row.companionToOrder === primary.sourceOrder);
 return unique([primary.setId, companion?.setId]);
}
export function recommendationOrder(items,ids,getId=row=>row.id){
 const ranks=new Map(ids.map((id,index)=>[id,index]));
 return [...items].sort((a,b)=>(ranks.get(getId(a))??Infinity)-(ranks.get(getId(b))??Infinity));
}
