// Source-valid isolated test account, never product defaults.
import contexts from '../../docs/ui-lab/v1.1/modules/character-contexts.json' with {type:'json'};
import echoCatalog from '../../docs/ui-prototypes/assets/echoes/browser-data.json' with {type:'json'};
import defaults from '../../docs/ui-lab/v1.1/modules/sandbox-defaults.json' with {type:'json'};
import {CHARACTER_CATALOG} from '../../docs/ui-lab/v1.1/modules/catalog.js';
import {readProductionBuildRecord,PRODUCTION_BUILD_STORAGE_KEY} from '../../src/productionBuildRecord.mjs';
export const team=contexts.teams.find(t=>t.id==='guide-augusta-iuno-the-shorekeeper-augusta-slots-4');
export const own=()=>{
 const account={characters:[],drafts:{}};
 for(const id of team.characterIds){const s=defaults.characters.find(s=>s.characterId===id),person=CHARACTER_CATALOG.find(c=>c.id===id);account.characters.push(person.name);account.drafts[person.name]={character:person.name,build:{weaponId:s.weapon.weaponId,sequenceLevel:0,forte:s.baseline.forte,echoSets:{activeSetId:'owned',sets:{owned:{slots:s.slots.map(t=>({echoId:t.configuration.echoId,selectedSonataSetId:t.configuration.selectedSonataSetId,rank:5,cost:t.configuration.cost,level:25,mainStat:echoCatalog.statEditor.mainStatsByCostAndLevel[t.configuration.cost]['25'].find(v=>v.name===t.configuration.mainStatName),secondaryMainStat:echoCatalog.statEditor.secondaryMainStatsByCostAndLevel[t.configuration.cost]['25'],substats:echoCatalog.statEditor.substats.slice(0,5).map(s=>({name:s.name,value:s.values[0]}))}))}}}}};}
 const raw=JSON.stringify(account),storage={getItem:key=>key===PRODUCTION_BUILD_STORAGE_KEY?raw:null};
 return {records:team.characterIds.map(id=>readProductionBuildRecord(storage,CHARACTER_CATALOG.find(c=>c.id===id))),raw};
};
