import contexts from './production-settings.json' with {type:'json'};
import {ECHO_SETTING_STATS} from './settings-catalog.js';
// Canonical projection only. This is not the production persisted Settings owner.
export function initializeCanonicalSettings(state){
 const row=contexts.characters.find(row=>row.characterId===state.id);
 state.canonicalSettingsSource=row?{owner:contexts.owner,presetId:row.presetId,applicability:structuredClone(row.applicability),persisted:false}:null;
 return restoreCanonicalSettings(state);
}
export function restoreCanonicalSettings(state){
 if(!state.canonicalSettingsSource)return false;
 const row=contexts.characters.find(row=>row.characterId===state.id),requirements=row?.requirements.value;
 if(!requirements||!['VERIFIED','USER_DEFINED'].includes(row.requirements.status))return false;
 const hard=requirements.requiredOnEveryEcho,groups=requirements.groups??[];
 if(groups.length!==1)return false; // UI presents exactly one explicit Flex pool.
 const flex=groups[0].members;
 const tier=rule=>{const i=ECHO_SETTING_STATS.find(row=>row.id===rule.stat)?.tiers.indexOf(rule.minimum);if(i===undefined||i<0)throw Error('Canonical minimum tier missing');return i;};
 state.statSections={hard:hard.map(r=>r.stat),flex:flex.map(r=>r.stat),other:ECHO_SETTING_STATS.map(r=>r.id).filter(id=>![...hard,...flex].some(r=>r.stat===id))};
 state.minima=Object.fromEntries(ECHO_SETTING_STATS.map(r=>[r.id,0]));for(const rule of [...hard,...flex])state.minima[rule.stat]=tier(rule);
 state.flexCount=groups[0].minimumCount;state.settingsMode='Recommended';state.erTarget={enabled:false,valuePercent:null};state.otherExpanded=false;return true;
}
