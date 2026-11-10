import catalog from './character-contexts.json' with {type:'json'};

// Guide ranges are build guidance, not proof that a team rotation is legal.
export function characterErGuidance(id){
 if(id==='augusta')return {minimum:115,maximum:125,label:'115–125%',basis:'OWNER_RANGE',conditions:[]};
 const row=catalog.characters.find(c=>c.characterId===id)?.recommendations?.endgameStats.find(r=>/energy.*regen/i.test(r.sourceStatName));
 if(!row)return null;
 const match=row.sourceText.trim().match(/^(\d+(?:\.\d+)?)%?\s*[-–]?\s*(?:(\d+(?:\.\d+)?)%)?\+?$/);
 if(!match)return null;
 return {minimum:Number(match[1]),maximum:match[2]?Number(match[2]):null,label:row.sourceText,basis:'REVIEWED_GUIDE_RANGE',conditions:[...row.conditions]};
}
export function effectiveErTarget(id,target){
 // Preserve explicit numeric choices, including legacy values.
 return Number.isFinite(target?.valuePercent)?target.valuePercent:characterErGuidance(id)?.minimum??null;
}
