import {SUBSTAT_VALUE_TABLE,type Echo} from '../echoCore.ts';
import {projectRank5EchoStats} from '../echoStatProjection.ts';
import {validateEchoLoadout} from '../loadoutValidator.ts';
import {CHARACTER_CATALOG} from '../data/characters.ts';
import {CHARACTER_INTRINSIC_BY_ID} from '../data/characterIntrinsicStats.ts';
import {WEAPON_CATALOG} from '../data/weapons.ts';
import {WEAPON_EFFECT_CATALOG} from '../data/weaponEffectCatalog.ts';
import {SONATA_EFFECT_MODELS} from '../data/sonataEffects.ts';
import {ECHO_EFFECT_MODELS} from '../data/echoEffects.ts';
import {ECHO_ATTACK_PROFILES} from '../data/echoAttacks.ts';
import {getCharacterActionFact,getCharacterMechanicFact} from '../data/characterMechanics.ts';
import {readCharacterActionValues} from '../characterActionValues.ts';
import {AUGUSTA_PILOT_HIT_MODELS,AUGUSTA_PILOT_HIT_SOURCE} from '../data/augustaPilotHitModels.ts';
import {AUGUSTA_PILOT_ECHO_SOURCE_FACTS} from '../data/augustaPilotEchoSourceFacts.ts';
import {resolveShorekeeperStellarealmContract} from './shorekeeperStellarealmState.ts';
import {resolveIunoOutroTransferContract} from './iunoOutroTransferAdapter.ts';
import {resolveIunoWanLightRecipientContract} from './iunoWanLightRecipientState.ts';
import {resolveShorekeeperOutroTeamWindowContract} from './shorekeeperOutroTeamWindowAdapter.ts';
import {listCharacterOutroTransferSupport} from './characterOutroTransferAdapter.ts';
import {IMPERMANENCE_HERON_TRANSFER_DISPOSITION} from './echoTransferWindowAdapter.ts';
import {expectedDamage,defenseMultiplier,resistanceMultiplier} from './damageKernel.ts';

const presets={augusta:{weaponId:'thunderflare-dominion',sequence:0,equipment:'augusta-cov3-void2-false-sovereign'},iuno:{weaponId:'moongazers-sigil',sequence:0,equipment:'iuno-cov3-sierra2-lady'},mortefi:{weaponId:'static-mist',sequence:6,equipment:'mortefi-moonlit5-heron'},'the-shorekeeper':{weaponId:'stellar-symphony',sequence:0,equipment:'shorekeeper-rejuvenating5-fallacy'}} as const;
export type AugustaPilotCharacterId=keyof typeof presets;
export interface AugustaPilotBuild {characterId:AugustaPilotCharacterId;sequence:number;weapon:{id:string;rank:number};equipmentPresetId:string;echoes:readonly Echo[]}
export interface AugustaPilotEnemy {defense:number;resistanceByElement:Readonly<Record<string,number>>;damageReduction:number}
export interface AugustaPilotInput {partnerId:'iuno'|'mortefi';builds:readonly AugustaPilotBuild[];enemy:AugustaPilotEnemy;cycleNumber:1|2|3|4;acceptReferenceStateSchedule:true;heronTransfer:'PUBLISHED_DAMAGE_BONUS'|'DISABLED_SENSITIVITY'}
const weaponValue=(id:string)=>{const e=WEAPON_EFFECT_CATALOG.find(e=>e.effectId===id);if(!e||!Number.isFinite(e.rankValues[0]))throw Error('Missing canonical weapon effect '+id);return e.rankValues[0];};
const setValue=(id:string)=>{const e=SONATA_EFFECT_MODELS.find(e=>e.effectId===id);if(!e||!Number.isFinite(e.value))throw Error('Missing canonical Sonata '+id);return e.value;};
const echoValue=(id:string)=>{const e=ECHO_EFFECT_MODELS.find(e=>e.effectId===id);if(!e||!Number.isFinite(e.value))throw Error('Missing canonical Echo effect '+id);return e.value;};
const percent=(id:string,index=0)=>{const f=getCharacterMechanicFact(id);if(!f||f.verificationStatus!=='VERIFIED'||!('effectSummary' in f))throw Error('Missing canonical effect '+id);const values=[...f.effectSummary.matchAll(/([0-9]+(?:\.[0-9]+)?)%/g)];if(!values[index])throw Error('Unparseable canonical percent '+id);return Number(values[index][1])/100;};
const classStat:Record<string,string>={BASIC:'Basic Attack DMG',HEAVY:'Heavy Attack DMG',SKILL:'Skill DMG',LIBERATION:'Liberation DMG'};
export function assembleAugustaPilotBuild(build:AugustaPilotBuild){
 const preset=presets[build.characterId];if(!preset||build.sequence!==preset.sequence||build.weapon?.id!==preset.weaponId||build.weapon.rank!==1||build.equipmentPresetId!==preset.equipment)throw Error('Pilot requires its exact declared sequence/R1 weapon/equipment preset');
 const projection=projectRank5EchoStats(build.echoes);if(!validateEchoLoadout(projection.cards).valid||projection.cards.map(c=>c.cost).join(',')!=='4,3,3,1,1')throw Error('Pilot requires a valid ordered 43311 loadout');
 const character=CHARACTER_CATALOG.find(c=>c.id===build.characterId)!,weapon=WEAPON_CATALOG.find(w=>w.id===build.weapon.id)!;
 if(!character||character.level90.atk===null||character.level90.hp===null||!weapon||weapon.level90BaseAtk===null||!weapon.secondary)throw Error('Canonical build stats incomplete');
 const stats:Record<string,number>={...projection.totals};const add=(stat:string,value:number)=>stats[stat]=(stats[stat]??0)+value;
 CHARACTER_INTRINSIC_BY_ID.get(build.characterId)!.stats.forEach(s=>add(s.stat,s.value));add(weapon.secondary.stat,weapon.secondary.value);
 WEAPON_EFFECT_CATALOG.filter(e=>e.weaponId===weapon.id&&e.effectType==='PERMANENT').forEach(e=>add(e.statOrEffect,e.rankValues[0]));
 if(build.characterId==='augusta'){add('Electro DMG',echoValue('FALSE_SOV_ELECTRO'));add('Electro DMG',SONATA_EFFECT_MODELS.find(e=>e.sonataSetId==='sonata-3'&&e.pieces===2)!.value);add('Heavy Attack DMG',echoValue('FALSE_SOV_HEAVY'));}
 if(build.characterId==='iuno'){add('Aero DMG',echoValue('ECHO_60001605_AERO_DMG'));add('Aero DMG',SONATA_EFFECT_MODELS.find(e=>e.sonataSetId==='sonata-4'&&e.pieces===2)!.value);add('Liberation DMG',echoValue('ECHO_60001605_RESONANCE_LIBERATION_DMG'));}
 if(build.characterId==='mortefi')add('Energy Regen',setValue('S08_2PC_ENERGY_REGEN'));
 if(build.characterId==='the-shorekeeper')add('Energy Regen',percent('the-shorekeeper-inherent-self-gravitation'));
 const baseAtk=character.level90.atk+weapon.level90BaseAtk,baseHp=character.level90.hp;
 return {characterId:build.characterId,baseAtk,baseHp,stats,atk:baseAtk*(1+(stats['ATK%']??0))+(stats['Flat ATK']??0),hp:baseHp*(1+(stats['HP%']??0))+(stats['Flat HP']??0),critRate:character.baseCombat.critRate!+(stats['CRIT Rate']??0),critDamage:character.baseCombat.critDamage!+(stats['CRIT DMG']??0),energyRegen:character.baseCombat.energyRegen!+(stats['Energy Regen']??0),echoStatKey:projection.key};
}

/** Experimental standard-state replay: canonical quantities, source-pinned event/state schedule. */
export function evaluateAugustaTeamPilot(input:AugustaPilotInput){
 if(input.acceptReferenceStateSchedule!==true||!['iuno','mortefi'].includes(input.partnerId)||!Number.isInteger(input.cycleNumber)||input.cycleNumber<1||input.cycleNumber>4||!['PUBLISHED_DAMAGE_BONUS','DISABLED_SENSITIVITY'].includes(input.heronTransfer))throw Error('Explicit pilot scenario selection required');
 const party=['augusta',input.partnerId,'the-shorekeeper'];if(input.builds.length!==3||new Set(input.builds.map(b=>b.characterId)).size!==3||input.builds.some(b=>!party.includes(b.characterId)))throw Error('Require the exact pilot trio with unique owned builds');
 if(!input.enemy||!Number.isFinite(input.enemy.defense)||input.enemy.defense<0||!Number.isFinite(input.enemy.damageReduction)||input.enemy.damageReduction<0||input.enemy.damageReduction>1)throw Error('Explicit supported enemy required');
 const builds=new Map(input.builds.map(b=>[b.characterId,assembleAugustaPilotBuild(b)]));
 const model=AUGUSTA_PILOT_HIT_MODELS.find(m=>m.partnerId===input.partnerId)!,cycle=model.cycles.find(c=>c.number===input.cycleNumber)!;
 const requirements=model.resources.map(r=>({characterId:r.characterId,required:r.requiredEnergyRegenPercent/100,actual:builds.get(r.characterId as AugustaPilotCharacterId)!.energyRegen}));
 if(requirements.some(r=>r.actual+1e-9<r.required))return {status:'ENERGY_REQUIREMENT_NOT_MET' as const,requirements,scenarioDps:null,teamDpsReady:false as const};
 const realm=resolveShorekeeperStellarealmContract(),wan=resolveIunoWanLightRecipientContract();
 const hits=model.hits.filter(h=>h.atFrame>=cycle.startFrame&&h.atFrame<cycle.endFrame);const evaluated: {characterId:string;name:string;factId:string;atSeconds:number;damageClass:string;expectedDamage:number;critRate:number;critDamage:number;amplification:number;damageBonus:number;defIgnore:number}[]=[];
 const pending=new Set<string>(['State schedule is a pinned reference model, not a native Bellibing resource/proc simulator.','All scheduled hits land; team stays in range; shields are not broken; no enemy motion, incoming damage or Tune Break damage is simulated.','Wan Light cap refresh, coordinated-attack cadence and resource validity still require native event-model verification.']);
 for(const hit of hits){
  if(hit.characterId==='tune break'){pending.add('Shared Tune Break excluded explicitly from both teams.');continue;}
  const build=builds.get(hit.characterId as AugustaPilotCharacterId)!;if(!build)throw Error('Hit actor outside party');
  const parts:{factId:string;coefficient:number;damageClass:string;scalingStat:string;element:string;guaranteedCrit:boolean}[]=hit.bindings.map(b=>{const f=getCharacterActionFact(b.factId)!;const v=readCharacterActionValues(f,10);if(v.status!=='SOURCE_VALUES'||v.kind!=='COEFFICIENTS')throw Error('Missing coefficient');return {factId:b.factId,coefficient:v.components[b.componentIndex].coefficient*b.hitCount,damageClass:f.damageClass!,scalingStat:f.scalingStat,element:CHARACTER_CATALOG.find(c=>c.id===hit.characterId)!.element!,guaranteedCrit:b.factId==='the-shorekeeper-intro-skill-proof-of-existence-discernment-dmg'};});
  if(hit.name.startsWith('Echo - ')){
   const ids:Record<string,[string,string]>={'Echo - False Sovereign':['echo-60001215','FALSE_SOV_ACTIVE_SPIN'],'Echo - False Sovereign (Intro)':['echo-60001215','FALSE_SOV_INTRO_SUMMON'],'Echo - Fallacy of No Return':['echo-60000605','FALLACY_INITIAL_BLAST']};
   if(ids[hit.name]){const [id,key]=ids[hit.name],a=ECHO_ATTACK_PROFILES.find(p=>p.echoId===id)!.attacks.find(a=>a.attackId===key)!;parts.push({factId:key,coefficient:a.components.reduce((s,c)=>s+c.motionValuePerHit*c.hits,0),damageClass:'ECHO',scalingStat:a.scalingStat,element:a.element,guaranteedCrit:false});}
   else{const a=AUGUSTA_PILOT_ECHO_SOURCE_FACTS.find(a=>a.name===hit.name);if(!a){pending.add('Missing Echo damage: '+hit.name);continue;}parts.push({factId:a.echoId,coefficient:a.components.reduce((s,c)=>s+c.coefficient*c.hits,0),damageClass:'ECHO',scalingStat:a.scalingStat,element:a.element,guaranteedCrit:false});if(a.name.includes('Lady'))pending.add(a.boundary);}
  }
  if(!parts.length){pending.add('Unbound damage action '+hit.name);continue;}
  for(const part of parts){
   let atkPct=0,bonus=(build.stats[part.element+' DMG']??0)+(build.stats[classStat[part.damageClass]]??0),amp=0,cr=build.critRate,cd=build.critDamage,ignore=0,finalMultiplier=1;
   for(const s of hit.state){
    const n=s.stacks;if(!Number.isInteger(n)||n<1||n>50)throw Error('Unsupported source stack count');if((s.source.includes('(shield)')&&n>5)||(s.source.startsWith('Augusta: Crown of Wills')&&n>1))throw Error('Pilot source exceeds canonical shield/Crown cap');
    if(s.source.startsWith('Crown of Valor ')){if(n>5)throw Error('Crown cap exceeded');if(s.stat===6)atkPct+=setValue('COV_ATK')*n;if(s.stat===10)cd+=setValue('COV_CD')*n;}
    else if(s.source.startsWith('Augusta: Crown of Wills'))bonus+=percent('augusta-crown-of-wills-effect')*n;
    else if(s.source==='Augusta: Outro')amp+=percent('augusta-outro-battlesong-effect');
    else if(s.source.startsWith('Iuno: Blessing')){if(n>wan.maxStacks)throw Error('Wan Light cap exceeded');amp+=wan.amplificationPerStack*n;}
    else if(s.source==='Iuno: Outro'&&part.damageClass==='HEAVY')amp+=resolveIunoOutroTransferContract().amplification;
    else if(s.source==='Mortefi: Outro'&&part.damageClass==='HEAVY')amp+=listCharacterOutroTransferSupport().find(c=>c.characterId==='mortefi')!.amplifications[0].value;
    else if(s.source==='Shorekeeper: Outro')amp+=resolveShorekeeperOutroTeamWindowContract().amplification;
    else if(s.source==='Rejuvenating Glow 5pc')atkPct+=setValue('REJUV_ATK');
    else if(s.source==='Moonlit Clouds 5pc (outro)')atkPct+=setValue('S08_5PC_INCOMING_ATK');
    else if(s.source==='Static Mist: Stormy Resolution R1')atkPct+=weaponValue('STM-NEXT-ATK');
    else if(s.source==='Stellar Symphony: Astral Evolvement R1 (team)')atkPct+=weaponValue('SSY-TEAM-ATK');
    else if(s.source==='Fallacy of No Return'&&s.stat===6)atkPct+=echoValue('FALLACY_TEAM_ATK');
    else if(s.source.startsWith('Mortefi S6'))atkPct+=percent('mortefi-s6-apoplectic-instrumental');
    else if(s.source.startsWith('Mortefi S3')&&hit.name.includes('Marcato'))cd+=percent('mortefi-s3-flaming-recitativo');
    else if(s.source==='Inherent: Harmonic Control'&&hit.name.includes('Fury Fugue'))bonus+=percent('mortefi-inherent-harmonic-control');
    else if(s.source.startsWith('Inherent: Rhythmic Vibrato')&&hit.name.includes('Marcato'))bonus+=percent('mortefi-inherent-rhythmic-vibrato')*n;
    else if(s.source.includes('Thunderblaze Eminence R1 (intro/skill)')&&part.damageClass==='HEAVY')bonus+=weaponValue('TFD-HEAVY');
    else if(s.source.includes('Thunderblaze Eminence R1 (shield)')&&part.damageClass==='HEAVY')ignore+=weaponValue('TFD-DEF')*n;
    else if(s.source.includes('Plenilune Radiance R1 (intro/lib)')&&part.damageClass==='LIBERATION')bonus+=weaponValue('MGS-LIB');
    else if(s.source.includes('Plenilune Radiance R1 (shield)')&&part.damageClass==='LIBERATION')ignore+=weaponValue('MGS-DEF')*n;
    else if(s.source==='Shorekeeper: Inner Stellarealm'||s.source==='Shorekeeper: Supernal Stellarealm'){
     const sk=builds.get('the-shorekeeper')!,er=sk.energyRegen+(hit.state.some(e=>e.source==='Fallacy of No Return'&&e.stat===6)?echoValue('FALLACY_WIELDER_ER'):0);
     if(s.stat===9)cr+=Math.min(er/realm.innerCritRate.energyRegenStep*realm.innerCritRate.bonusPerStep,realm.innerCritRate.cap);
     if(s.stat===10)cd+=Math.min(er/realm.supernalCritDamage.energyRegenStep*realm.supernalCritDamage.bonusPerStep,realm.supernalCritDamage.cap);
    }else if(s.source==='Impermanence Heron: Outro'&&input.heronTransfer==='PUBLISHED_DAMAGE_BONUS'){
     const claim=IMPERMANENCE_HERON_TRANSFER_DISPOSITION.sourceConflict[0].claim,match=claim.match(/\+([0-9]+)%/);if(!match)throw Error('Heron source claim missing');bonus+=Number(match[1])/100;pending.add('Heron uses the publisher damage-bonus interpretation; compare DISABLED_SENSITIVITY. Generic Heron transfer remains source-blocked.');
    }
   }
   if(hit.name.includes('S5 Funerary Quartet'))finalMultiplier*=1-percent('mortefi-s5-funerary-quartet');
   if(part.guaranteedCrit)cr=1;
   const res=input.enemy.resistanceByElement[part.element];if(!Number.isFinite(res))throw Error('Enemy resistance missing for '+part.element);
   const scaling=part.scalingStat==='HP'?build.hp:build.atk+build.baseAtk*atkPct;
   const damage=expectedDamage({scalingStat:scaling,motionValue:part.coefficient,damageBonus:bonus,amplification:amp,critRate:cr,critDamage:cd,defenseMultiplier:defenseMultiplier({attackerLevel:90,enemyDefense:input.enemy.defense,defIgnore:ignore}),resistanceMultiplier:resistanceMultiplier(res),damageReduction:input.enemy.damageReduction})*finalMultiplier;
   if(!Number.isFinite(damage)||damage<0)throw Error('Invalid pilot damage');
   evaluated.push({characterId:hit.characterId,name:hit.name,factId:part.factId,atSeconds:(hit.atFrame-cycle.startFrame)/60,damageClass:part.damageClass,expectedDamage:damage,critRate:cr,critDamage:cd,amplification:amp,damageBonus:bonus,defIgnore:ignore});
  }
 }
 const seconds=(cycle.endFrame-cycle.startFrame)/60,totalDamage=evaluated.reduce((s,h)=>s+h.expectedDamage,0);
 return {status:'EXPERIMENTAL_REFERENCE_SCENARIO' as const,source:AUGUSTA_PILOT_HIT_SOURCE,partnerId:input.partnerId,cycleNumber:input.cycleNumber,cycleSeconds:seconds,scenarioDamage:totalDamage,scenarioDps:totalDamage/seconds,
  members:party.map(characterId=>{const damage=evaluated.filter(h=>h.characterId===characterId).reduce((s,h)=>s+h.expectedDamage,0);return {characterId,damage,dps:damage/seconds,share:totalDamage?damage/totalDamage:0};}),builds:[...builds.values()],requirements,hits:evaluated,pending:[...pending],teamDpsReady:false as const,authorizesUpgradeVerdict:false as const};
}

export function compareAugustaPilotTeams(input:{builds:readonly AugustaPilotBuild[];enemy:AugustaPilotEnemy;cycleNumber:1|2|3|4;heronTransfer:AugustaPilotInput['heronTransfer']}){
 if(input.builds.length!==4||new Set(input.builds.map(b=>b.characterId)).size!==4||Object.keys(presets).some(id=>!input.builds.some(b=>b.characterId===id)))throw Error('Comparison requires one build for each of the four pilot characters');
 const run=(partnerId:'iuno'|'mortefi')=>evaluateAugustaTeamPilot({...input,partnerId,builds:input.builds.filter(b=>b.characterId!== (partnerId==='iuno'?'mortefi':'iuno')),acceptReferenceStateSchedule:true});
 const iuno=run('iuno'),mortefi=run('mortefi');
 return {iuno,mortefi,scenarioDpsDelta:iuno.scenarioDps!==null&&mortefi.scenarioDps!==null?mortefi.scenarioDps-iuno.scenarioDps:null,
  percentChange:iuno.scenarioDps!==null&&mortefi.scenarioDps!==null&&iuno.scenarioDps>0?(mortefi.scenarioDps/iuno.scenarioDps-1)*100:null,
  comparisonBasis:'SAME_AUGUSTA_SHOREKEEPER_BUILDS_AND_ENEMY_SEPARATE_COMPLETE_TEAM_CYCLES' as const,authorizesUpgradeVerdict:false as const};
}

export function compareAugustaPilotEcho(input:{scenario:AugustaPilotInput;characterId:AugustaPilotCharacterId;slotIndex:number;candidate:Echo}){
 if(!Number.isInteger(input.slotIndex)||input.slotIndex<0||input.slotIndex>=5)throw Error('Select an existing Echo slot');
 const original=input.scenario.builds.find(b=>b.characterId===input.characterId);if(!original)throw Error('Replacement character outside pilot party');
 if(input.candidate.cost!==original.echoes[input.slotIndex].cost)throw Error('Echo replacement must retain COST and equipment preset');
 const echoes=original.echoes.map((e,i)=>i===input.slotIndex?input.candidate:e);
 const current=evaluateAugustaTeamPilot(input.scenario),candidate=evaluateAugustaTeamPilot({...input.scenario,builds:input.scenario.builds.map(b=>b===original?{...b,echoes}:b)});
 return {current,candidate,scenarioDpsDelta:current.scenarioDps!==null&&candidate.scenarioDps!==null?candidate.scenarioDps-current.scenarioDps:null,
  percentChange:current.scenarioDps!==null&&candidate.scenarioDps!==null&&current.scenarioDps>0?(candidate.scenarioDps/current.scenarioDps-1)*100:null,authorizesUpgradeVerdict:false as const};
}

/** Next legal roll tier, evaluated against this build rather than universal stat weights. */
export function analyzeAugustaPilotEchoRolls(input:{scenario:AugustaPilotInput;characterId:AugustaPilotCharacterId;slotIndex:number}){
 const b=input.scenario.builds.find(b=>b.characterId===input.characterId);if(!b||!Number.isInteger(input.slotIndex)||!b.echoes[input.slotIndex])throw Error('Select a pilot character and Echo slot');
 const echo=b.echoes[input.slotIndex];
 return echo.substats.map(roll=>{
  const value=SUBSTAT_VALUE_TABLE[roll.name]?.find(v=>v>roll.value+1e-12);
  if(value===undefined)return {stat:roll.name,from:roll.value,to:null,scenarioDpsDelta:null,gainPerUnit:null};
  const candidate={...echo,substats:echo.substats.map(r=>r.name===roll.name?{...r,value}:r)};
  const result=compareAugustaPilotEcho({...input,candidate});
  return {stat:roll.name,from:roll.value,to:value,scenarioDpsDelta:result.scenarioDpsDelta,gainPerUnit:result.scenarioDpsDelta===null?null:result.scenarioDpsDelta/(value-roll.value)};
 });
}
