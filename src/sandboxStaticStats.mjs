import {projectStaticBuildStats} from './buildStatProjection.mjs';
import {projectExpectedStaticBuildStats} from './expectedBuildStatProjection.mjs';
import {inspectSandboxSonata} from './sandboxSonata.mjs';

export const SANDBOX_STATIC_STATS_VERSION='BELLIBING_SANDBOX_STATIC_STATS_V1';
export const STATIC_STAT_FIELDS=[
 ['TOTAL_HP','hp',true],['TOTAL_ATK','atk',true],['TOTAL_DEF','def',true],
 ['TOTAL_ENERGY_REGEN','energyRegen'],['TOTAL_CRIT_RATE','critRate'],['TOTAL_CRIT_DAMAGE','critDamage'],
 ['ELEMENT_DMG_BONUS','elementDamageBonus'],['BASIC_ATTACK_DMG_BONUS','basicAttackDamageBonus'],
 ['HEAVY_ATTACK_DMG_BONUS','heavyAttackDamageBonus'],['RESONANCE_SKILL_DMG_BONUS','resonanceSkillDamageBonus'],
 ['RESONANCE_LIBERATION_DMG_BONUS','resonanceLiberationDamageBonus'],['HEALING_BONUS','healingBonus']
];
const aliases={'Resonance Skill DMG Bonus':'Skill DMG','Resonance Liberation DMG Bonus':'Liberation DMG'};
const supported=new Set(['HP%','ATK%','DEF%','Energy Regen','CRIT Rate','CRIT DMG','Healing Bonus','Basic Attack DMG','Heavy Attack DMG','Skill DMG','Liberation DMG',...['Aero','Fusion','Glacio','Electro','Spectro','Havoc'].map(e=>e+' DMG')]);
const pending=reason=>({version:SANDBOX_STATIC_STATS_VERSION,status:'PENDING',reason,values:null,sources:null});
const canonicalStat=name=>aliases[name]??name.replace(/ DMG Bonus$/,' DMG');

// Shared source-bound permanent self effects; equipment ownership stays with callers.
export function staticSonataRows(cards,{echoes,sonataSets,sonataEffects=[]}){
 const eligible=inspectSandboxSonata(cards.filter(Boolean).map(c=>({echoId:c.speciesId??c.echoId,selectedSonataSetId:c.selectedSonataSetId})),{echoes,sonataSets});
 const active=sonataEffects.filter(e=>eligible.some(s=>s.setId===e.sonataSetId&&s.eligiblePieceBonuses.includes(e.pieces)));
 const permanent=active.filter(e=>e.effectType==='PERMANENT'&&e.valueMode==='FLAT'&&e.appliesTo==='SELF'&&e.mechanicsStatus==='VERIFIED_MODELED'&&supported.has(canonicalStat(e.statOrEffect)));
 return {active,permanent,rows:permanent.map(e=>({stat:canonicalStat(e.statOrEffect),value:e.value}))};
}

/** Public facts only. Reuse the canonical static projector for all arithmetic.
 * The shared projector's additive stat-row input is reused for reviewed self
 * Sonata rows; output attribution keeps Weapon and Sonata sources separate.
 * This static component is never a claim of full buffed Character/combat stats.
 */
export function projectSandboxStaticStats({character,weapon,baseline,echoSlots=null,echoStatContract,echoes,sonataSets,sonataEffects=[]}={}){
 try{
  if(!character||!weapon||character.weaponType!==weapon.weaponType||baseline?.characterLevel!==90||baseline.weaponLevel!==90||baseline.weaponRefinement!==1||baseline.sequenceLevel!==0)return pending('STATIC_BASELINE_CONTEXT_PENDING');
  if(!baseline.forte?.enabled||Object.keys(baseline.forte.enabled).length!==10||Object.values(baseline.forte.enabled).some(v=>v!==true)||!['normal-attack','skill','liberation','intro','circuit'].every(k=>baseline.forte.levels?.[k]===10))return pending('MAX_MINOR_FORTE_CONTEXT_PENDING');
  const observed=echoSlots!==null;
  if(observed&&(!Array.isArray(echoSlots)||echoSlots.length!==5||echoSlots.some(c=>!c||c.level!==25)||new Set(echoSlots.map(c=>c.id)).size!==5))return pending('FIVE_ACTUAL_COMPLETE_CARDS_REQUIRED');
  if(observed&&echoSlots.some(c=>echoes.find(e=>e.id===c.speciesId)?.cost!==c.cost))return pending('ECHO_SPECIES_COST_MISMATCH');
  const {active,permanent,rows:sonataStats}=staticSonataRows(observed?echoSlots:[],{echoes,sonataSets,sonataEffects});
  const numeric=projectStaticBuildStats({character,weapon,echoSlots:echoSlots??[],echoStatContract,
   activeForteStats:character.intrinsicStats,activeSequenceStats:[],activeWeaponStats:[...(weapon.staticBuildStats??[]),...sonataStats]});
  const values=Object.fromEntries(STATIC_STAT_FIELDS.map(([id,key])=>[id==='ELEMENT_DMG_BONUS'?character.element.toUpperCase()+'_DMG_BONUS':id,numeric[key]]));
  return {version:SANDBOX_STATIC_STATS_VERSION,status:'SOURCE_BACKED_STATIC_COMPONENT',reason:null,
   scope:observed?'OBSERVED_FIVE_CARD_STATIC_BUILD':'CHARACTER_WEAPON_BASELINE_WITHOUT_ECHOES',values,
   sources:{characterId:character.id,weaponId:weapon.id,weaponRefinement:1,minorForte:'MAX_SOURCE_BASELINE',sequence:0,
    echoIds:echoSlots?.map(c=>c.id)??[],sonataEffectIds:permanent.map(e=>e.effectId)},
   pending:{echoes:!observed,sonata:active.filter(e=>!permanent.includes(e)).map(e=>e.effectId),
    mechanics:['CONDITIONAL_WEAPON_EFFECTS','CHARACTER_MECHANIC_TRANSFORMATIONS','CONDITIONAL_SONATA_AND_ECHO_SKILLS','TEAM_ROTATION_BUFFS']},
   authorizesDps:false};
 }catch{return pending('INVALID_OR_UNSUPPORTED_STATIC_BUILD_INPUT');}
}

export function formatStaticStats(projection){
 if(!['SOURCE_BACKED_STATIC_COMPONENT','EXPECTED_STATIC_COMPONENT'].includes(projection?.status))return {};
 return Object.fromEntries(STATIC_STAT_FIELDS.map(([metric,,whole])=>{
  const key=metric==='ELEMENT_DMG_BONUS'?Object.keys(projection.values).find(k=>/^(AERO|FUSION|GLACIO|ELECTRO|SPECTRO|HAVOC)_DMG_BONUS$/.test(k)):metric;
  const value=projection.values[key];
  return [key,Number.isFinite(value)?whole?Math.round(value).toLocaleString('en-US'):`${Number((value*100).toFixed(1))}%`:null];
 }));
}

export function projectSandboxExpectedStats(input,configurations,expected){
 try{
  const baseline=projectSandboxStaticStats(input);if(baseline.status!=='SOURCE_BACKED_STATIC_COMPONENT')return baseline;
  if(expected?.status!=='VERIFIED_EXACT_POLICY_MOMENTS'||expected.scope!=='FIRST_QUALIFIED_25'||!Array.isArray(configurations)||configurations.length!==5)return pending('MATCHING_EXPECTED_BUILD_REQUIRED');
  const contract=input.echoStatContract,means=expected.substats;
  if(!Array.isArray(means)||means.length!==contract.substats.length||new Set(means.map(s=>s.name)).size!==means.length)return pending('INCOMPLETE_EXPECTED_SUBSTATS');
  const rolls=means.map(s=>{const valid=contract.substats.find(r=>r.name===s.name),v=s.value?.approximate;if(!valid||!Number.isFinite(v)||v<0||v>Math.max(...valid.values)+1e-12)throw Error('Invalid expected substat');return {stat:s.name,value:v};});
  const cards=configurations.map(t=>{const echo=input.echoes.find(e=>e.id===t?.echoId);if(!echo||echo.cost!==t.cost||t.rank!==5||!echo.sonataSetIds.includes(t.selectedSonataSetId))throw Error('Invalid expected equipment');return {...t,speciesId:t.echoId};});
  if(cards.reduce((n,c)=>n+c.cost,0)>12)throw Error('Expected build exceeds Cost');
  const contributions=cards.flatMap(t=>{const main=contract.mainStatsByCostAndLevel[t.cost][25].find(r=>r.name===t.mainStatName),secondary=contract.secondaryMainStatsByCostAndLevel[t.cost][25];if(!main)throw Error('Invalid expected Main Stat');return [main,secondary].map(r=>({stat:r.name,value:r.value})).concat(rolls);});
  const sonata=staticSonataRows(cards,input);
  const numeric=projectExpectedStaticBuildStats({character:input.character,weapon:input.weapon,activeForteStats:input.character.intrinsicStats,activeSequenceStats:[],activeWeaponStats:[...(input.weapon.staticBuildStats??[]),...sonata.rows]},contributions);
  const values=Object.fromEntries(STATIC_STAT_FIELDS.map(([id,key])=>[id==='ELEMENT_DMG_BONUS'?input.character.element.toUpperCase()+'_DMG_BONUS':id,numeric[key]]));
  return {...baseline,status:'EXPECTED_STATIC_COMPONENT',scope:'FIRST_QUALIFIED_FIVE_ECHO_STATIC_MEAN',values,authorizesDps:false};
 }catch{return pending('INVALID_EXPECTED_BUILD_INPUT');}
}
