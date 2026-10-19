import {createSandboxState} from '../../docs/ui-lab/v1.1/modules/sandbox-state.js';
import catalog from '../../docs/ui-prototypes/assets/echoes/browser-data.json' with {type:'json'};

// Isolated, source-valid test account. Not product defaults or simulated observations.
export function uxAccountFixture(){
 const state=createSandboxState('augusta'),editor=catalog.statEditor;
 const cards=state.configurationSession.configurations.map(t=>({echoId:t.echoId,selectedSonataSetId:t.selectedSonataSetId,rank:t.rank,cost:t.cost,level:25,
  mainStat:editor.mainStatsByCostAndLevel[t.cost]['25'].find(s=>s.name===t.mainStatName),secondaryMainStat:editor.secondaryMainStatsByCostAndLevel[t.cost]['25'],substats:editor.substats.slice(0,5).map(s=>({name:s.name,value:s.values[0]}))}));
 const build={weaponId:state.sandboxBuild.weaponId,sequenceLevel:0,forte:structuredClone(state.forte),echoSets:{activeSetId:'owned',sets:{owned:{slots:cards}}}};
 const account={characters:['Augusta'],drafts:{Augusta:{character:'Augusta',build}}};
 const candidate=structuredClone(cards[0]);candidate.level=5;candidate.mainStat=editor.mainStatsByCostAndLevel[candidate.cost]['5'].find(s=>s.name===candidate.mainStat.name);candidate.secondaryMainStat=editor.secondaryMainStatsByCostAndLevel[candidate.cost]['5'];candidate.substats=candidate.substats.slice(0,1);
 return {account,build,cards,candidate};
}
