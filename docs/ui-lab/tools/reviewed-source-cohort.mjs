import {CHARACTER_CATALOG} from '../../../src/data/characters.ts';
import {CHARACTER_GUIDE_RECOMMENDATIONS} from '../../../src/data/characterEquipmentAssociations.ts';

// Historical source-reviewed 3.7 reference cohort, not today's full product roster.
// New RELEASED Characters stay in the canonical catalog and product surfaces.
// Never synthesize missing guide/Sandbox settings for them to pass export parity.
export function reviewedSourceCohort(){
 const released=CHARACTER_CATALOG.filter(person=>person.releaseStatus==='RELEASED');
 const guideIds=CHARACTER_GUIDE_RECOMMENDATIONS.map(guide=>guide.characterId),reviewed=new Set(guideIds);
 const cohort=released.filter(person=>reviewed.has(person.id));
 const pending=released.filter(person=>!reviewed.has(person.id)).map(person=>person.id).sort();
 if(released.length!==61||guideIds.length!==59||reviewed.size!==59||cohort.length!==59||
    JSON.stringify(pending)!==JSON.stringify(['lily','suoming'])){
  throw Error('Historical source-reviewed cohort drift; independently review new source bindings: '+JSON.stringify({released:released.length,guideRows:guideIds.length,reviewed:cohort.length,pending}));
 }
 return cohort;
}
