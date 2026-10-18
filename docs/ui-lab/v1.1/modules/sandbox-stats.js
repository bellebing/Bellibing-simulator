import facts from './sandbox-stat-sources.json' with {type:'json'};
import weapons from '../../../ui-prototypes/assets/weapons/browser-data.json' with {type:'json'};
import echoes from '../../../ui-prototypes/assets/echoes/browser-data.json' with {type:'json'};
import {projectSandboxStaticStats,formatStaticStats} from '../../../../src/sandboxStaticStats.mjs';

// Called only with the fresh client's current run. Read numeric observations,
// never formatted Echo-card strings, configured shells or sample fixtures.
export function sandboxStats(state,run=null){
 if(!state.sandboxBuild)return null;
 const character=facts.characters.find(c=>c.id===state.id),weapon=weapons.weapons.find(w=>w.id===state.sandboxBuild.weaponId);
 const input={character,weapon,baseline:state.sandboxBuild.baseline,echoStatContract:echoes.statEditor,echoes:echoes.echoes,sonataSets:echoes.sonataSets,sonataEffects:facts.sonataEffects};
 const baseline=projectSandboxStaticStats(input);
 let observed=null;
 const slots=run?.view?.slots;
 if(Array.isArray(slots)&&slots.length===5&&new Set(slots.map(s=>s.slot)).size===5&&[1,2,3,4,5].every(n=>slots.some(s=>s.slot===n&&s.complete&&s.current))){
  const cards=[1,2,3,4,5].map(n=>slots.find(s=>s.slot===n).current);
  const matching=cards.every((c,i)=>{const t=state.configurationSession.configurations[i];return t&&c.speciesId===t.echoId&&c.selectedSonataSetId===t.selectedSonataSetId&&c.cost===t.cost&&c.rank===t.rank&&c.mainStat?.name===t.mainStatName;});
  if(matching)observed=projectSandboxStaticStats({...input,echoSlots:cards});
 }
 return {baseline,observed,baselineValues:formatStaticStats(baseline),observedValues:formatStaticStats(observed)};
}
