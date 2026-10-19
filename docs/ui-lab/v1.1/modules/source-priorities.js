import priorities from './source-priorities.json' with {type:'json'};
import {ECHO_SETTING_STATS} from './settings-catalog.js';
export function restoreSourcePriorities(state){
 const source=priorities.characters.find(c=>c.characterId===state.id);
 if(!(state.sandboxBuild||state.accountProjection)||!source?.orderedStats.length)return false;
 state.sourcePreferenceGuidance=structuredClone(source);
 state.statSections={hard:[],flex:[...source.orderedStats],other:ECHO_SETTING_STATS.map(s=>s.id).filter(id=>!source.orderedStats.includes(id))};
 // Canonical tier selectors retain dormant user values. The source does not
 // supply per-Echo minima/count and these priorities cannot qualify a goal.
 state.flexCount=null;state.settingsMode='Recommended';state.otherExpanded=false;
 return true;
}
export function sourcePriorityMode(state){return state.settingsMode==='Recommended'&&state.sourcePreferenceGuidance?.kind==='SOURCE_PRIORITY_GUIDANCE_ONLY';}
