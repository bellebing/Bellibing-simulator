// Presentation adapter: owner product defaults, not canonical profile facts.
// Works only when the caller explicitly opts into ordinary Improve account mode.
import {improveProductEchoDefault} from '../../../../src/improveProductEchoDefaults.mjs';
import {ECHO_SETTING_STATS} from './settings-catalog.js';
export function restoreProductEchoDefaults(state){
 const approved=improveProductEchoDefault(state.id);
 if(!approved)return false;
 const selected=new Set([...approved.hard,...approved.flex]);
 if(selected.size!==approved.hard.length+approved.flex.length)return false;
 const minima=Object.fromEntries(ECHO_SETTING_STATS.map(stat=>[stat.id,0]));
 if([...selected].some(name=>!ECHO_SETTING_STATS.some(s=>s.id===name&&s.tiers.length>0)))return false;
 state.statSections={hard:[...approved.hard],flex:[...approved.flex],
  other:ECHO_SETTING_STATS.map(stat=>stat.id).filter(id=>!selected.has(id))};
 state.minima=minima;state.flexCount=approved.flexCount;state.settingsMode='Recommended';
 state.otherExpanded=false;state.sourcePreferenceGuidance=null;
 state.productEchoDefault=approved; // Read-only presentation provenance, not an account record.
 // Whole-build ER and Sonata selections are separate; no guessed ER threshold.
 return true;
}
