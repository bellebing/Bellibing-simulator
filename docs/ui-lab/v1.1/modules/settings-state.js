import { ECHO_SETTING_STATS, selectedFlexRequirement, SELECTED_FLEX_GROUP_ID } from './settings-catalog.js';
export const STAT_SECTIONS = ['hard','flex','other'];
export const MINIMUM_TIERS = Object.fromEntries(ECHO_SETTING_STATS.map(stat=>[stat.id,stat.labels]));
export function initialSettings(id) {
  const hard = id === 'augusta' ? ['CRIT Rate','CRIT DMG'] : [];
  const flex = id === 'augusta' ? ['ATK%','Heavy Attack DMG'] : [];
  const other = ECHO_SETTING_STATS.map(stat=>stat.id).filter(stat=>!hard.includes(stat)&&!flex.includes(stat));
  if (id === 'augusta') other.sort((a,b)=>a==='Flat ATK'?-1:b==='Flat ATK'?1:0);
  return {settingsMode:id==='augusta'?'Recommended':'Customize',
    minima:Object.fromEntries(ECHO_SETTING_STATS.map(stat=>[stat.id,0])),statSections:{hard,flex,other},flexCount:id==='augusta'?1:null,
    erTarget:{enabled:false,valuePercent:null},otherExpanded:false};
}
export function moveSettingStat(state,id,destination,beforeId=null) {
  if(!ECHO_SETTING_STATS.some(stat=>stat.id===id)||!STAT_SECTIONS.includes(destination))throw Error('Unknown canonical stat or section');
  if(id===beforeId)return;
  STAT_SECTIONS.forEach(section=>{state.statSections[section]=state.statSections[section].filter(stat=>stat!==id);});
  const list=state.statSections[destination], index=beforeId===null?list.length:list.indexOf(beforeId);
  list.splice(index<0?list.length:index,0,id);
  state.settingsMode='Customize'; if(destination==='other')state.otherExpanded=true;
  // Minima and the explicit count are intentionally untouched, even if infeasible.
}
export function flexCountPresentation(state) {
  const requirements={groups:state.flexCount===null?[]:[{id:SELECTED_FLEX_GROUP_ID,minimumCount:state.flexCount}]};
  return selectedFlexRequirement(requirements,state.statSections.flex.length,state.statSections.hard.length);
}
export function editFlexCount(state,count) {
  const {maximum}=flexCountPresentation(state);
  if(!Number.isInteger(count)||count<1||count>maximum)throw Error('Invalid Flex count');
  state.flexCount=count; state.settingsMode='Customize';
}
export function restoreRecommendedSettings(state) {
  if(state.id!=='augusta')return false;
  Object.assign(state,initialSettings(state.id)); return true;
}
// A presentation-only conditional comparison. No total is projected here and no
// Echo requirement, acceptance decision or build state is modified.
export function erTargetPresentation({characterId,target,total=null,allowIllustrative=false}) {
  const base={status:'DISABLED',isDemo:false,totalPercent:null};
  if(!target.enabled)return base;
  if(!Number.isFinite(target.valuePercent)||target.valuePercent<0)return {...base,status:'UNCONFIGURED'};
  const supported=total?.characterId===characterId && (total.status==='VERIFIED'||allowIllustrative&&total.status==='ILLUSTRATIVE')
    && Number.isFinite(total.valuePercent)&&total.valuePercent>=0;
  if(!supported)return {...base,status:'UNAVAILABLE'};
  return {status:total.valuePercent>=target.valuePercent?'REACHED':'OUTSTANDING',isDemo:total.status==='ILLUSTRATIVE',totalPercent:total.valuePercent};
}
