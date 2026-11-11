import {SUBSTAT_VALUE_TABLE} from '../../../assets/echoCoreRules.js';
import {effectiveErTarget} from './character-er-guidance.js';

// Account Improve owns a separate whole-build ER goal. Sandbox presets are untouched.
export function normalizeAccountStatSettings(state){
 if(!state.accountProjection)return;
 const oldFlex=state.statSections.flex.length;
 for(const section of ['hard','flex'])state.statSections[section]=state.statSections[section].filter(id=>id!=='Energy Regen');
 // Keep the persisted canonical partition complete; the UI hides this dormant row.
 if(!state.statSections.other.includes('Energy Regen'))state.statSections.other.push('Energy Regen');
 const maximum=Math.min(state.statSections.flex.length,5-state.statSections.hard.length);
 if(oldFlex!==state.statSections.flex.length&&state.flexCount!==null)state.flexCount=maximum?Math.min(state.flexCount,maximum):null;
 // An editable UI starting point, never a source-authored per-Echo requirement.
 if(state.sourcePreferenceGuidance&&state.flexCount===null&&maximum>0){
  state.flexCount=1;state.settingsMode='Customize';
  state.simpleTargetBasis='EDITABLE_ONE_SOURCE_PRIORITY_AT_CANONICAL_MINIMUM';
 }
}

// The other four Echoes and permanent gear stats are already included in baseER.
// Do not demand ER on every Echo or pretend one substat can repair any deficit.
export function accountStatTarget({characterId,target,erTarget,baseER,currentER}){
 const clean={hard:target.hard.filter(r=>r.name!=='Energy Regen'),flex:target.flex.filter(r=>r.name!=='Energy Regen'),flexCount:target.flexCount};
 if(!clean.flex.length)clean.flexCount=0;
 const goal=effectiveErTarget(characterId,erTarget);
 if(!erTarget?.enabled)return {target:clean,er:{status:'DISABLED'}};
 if(!Number.isFinite(goal)||!Number.isFinite(baseER))return {target:clean,er:{status:'UNAVAILABLE',goal}};
 const deficit=goal/100-baseER;
 if(deficit<=1e-9)return {target:clean,er:{status:'COVERED_BY_BUILD',goal}};
 const values=SUBSTAT_VALUE_TABLE['Energy Regen'],minimum=values.find(v=>v+1e-9>=deficit);
 const room=clean.hard.length+(clean.flex.length?clean.flexCount:0)<5;
 if(minimum===undefined&&Number.isFinite(currentER)&&baseER>currentER+1e-9)return {target:clean,er:{status:'PROGRESS_TOWARD_BUILD',goal,minimum:0,deficitPercent:deficit*100}};
 if(minimum===undefined&&room&&Number.isFinite(currentER)){
  // One replacement cannot finish the global goal. Require the cheapest legal
  // positive ER step, not a max roll, and never claim this reaches the full goal.
  const progress=values.find(v=>baseER+v>currentER+1e-9);
  if(progress!==undefined)return {target:{...clean,hard:[...clean.hard,{name:'Energy Regen',minimum:progress}]},er:{status:'PROGRESS_TOWARD_BUILD',goal,minimum:progress,deficitPercent:deficit*100}};
 }
 if(minimum===undefined||!room)return {target:clean,er:{status:'NEEDS_OTHER_SLOTS_OR_MAIN_STAT',goal,deficitPercent:deficit*100}};
 return {target:{...clean,hard:[...clean.hard,{name:'Energy Regen',minimum}]},er:{status:'REQUIRED_FOR_BUILD',goal,minimum}};
}
