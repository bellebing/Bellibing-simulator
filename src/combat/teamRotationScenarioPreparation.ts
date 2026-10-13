import {TEAM_ROTATION_COMPOSITION_MODELS} from '../data/teamRotationCompositionModels.ts';
import {composeTeamRotation} from '../teamRotationComposition.ts';
import {CHARACTER_MECHANIC_FACTS} from '../data/characterMechanics.ts';
import {activateIunoOutroTransfer} from './iunoOutroTransferAdapter.ts';
import {activateCharacterOutroTransfers,listCharacterOutroTransferSupport} from './characterOutroTransferAdapter.ts';
import {incomingTransferEffectiveEndSeconds,isIncomingTransferWindowActive,type IncomingTransferWindow,type ResonatorSwitchOutEvent} from './incomingTransferState.ts';
import {createShorekeeperStellarealmState,applyShorekeeperStellarealmEvent,readShorekeeperStellarealmState,resolveShorekeeperStellarealmContract} from './shorekeeperStellarealmState.ts';
import {activateShorekeeperOutroTeamWindow,isShorekeeperOutroTeamWindowActive,type ActiveShorekeeperOutroTeamWindow} from './shorekeeperOutroTeamWindowAdapter.ts';

const nameKey=(name:string)=>name.replace(/^Outro Skill\s*[—–-]\s*|^Outro - /,'').toLowerCase().trim();

/** Explicit reference-scenario assumptions; these are not observations of live gameplay. */
export function prepareTeamRotationScenario(input:Parameters<typeof composeTeamRotation>[0]&{shorekeeper?:{insideStellarealm:boolean;energyRegenRatio:number}}){
 const rotation=composeTeamRotation(input);
 if(rotation.status!=='COMPOSED_REFERENCE_SCENARIO')return rotation;
 const model=TEAM_ROTATION_COMPOSITION_MODELS.find(m=>m.id===rotation.modelId)!;
 let offset=0,cycleStart=0;
 const events=model.phases.filter(p=>p.rotationNumber<=input.rotationNumber).flatMap(p=>{const start=offset;if(p.rotationNumber===input.rotationNumber)cycleStart=start;offset+=p.cycleFrames;return p.events.map(e=>({...e,absoluteSeconds:(start+e.atFrame)/60}));}).sort((a,b)=>a.absoluteSeconds-b.absoluteSeconds||a.seq-b.seq);
 let frames=0;
 const switches:ResonatorSwitchOutEvent[]=model.phases.filter(p=>p.rotationNumber<=input.rotationNumber).flatMap(p=>{const start=frames;frames+=p.cycleFrames;return p.visits.slice(0,-1).map(v=>({kind:'RESONATOR_SWITCH_OUT' as const,actorId:v.characterId,atSeconds:(start+v.endFrame)/60}));});
 const transfers:IncomingTransferWindow[]=[], teamWindows:ActiveShorekeeperOutroTeamWindow[]=[],pending:string[]=[];
 const supported=listCharacterOutroTransferSupport();
 for(const e of events.filter(e=>e.castKind==='OUTRO')){
  if(e.characterId==='the-shorekeeper'&&e.name==='Outro - Binary Butterfly'){
   const window=activateShorekeeperOutroTeamWindow({event:{kind:'OUTRO_SKILL_CAST',actorId:e.characterId,atSeconds:e.absoluteSeconds},teamMemberIds:rotation.characterIds});if(window)teamWindows.push(window);continue;
  }
  const intros=events.filter(i=>i.castKind==='INTRO'&&i.absoluteSeconds===e.absoluteSeconds&&i.seq>e.seq&&i.characterId!==e.characterId);
  if(intros.length!==1){pending.push(`${e.characterId}: Outro recipient not uniquely proven by the source handoff`);continue;}
  const event={kind:'OUTRO_SWITCH' as const,actorId:e.characterId,incomingResonatorId:intros[0].characterId,incomingEntry:'INTRO_SKILL' as const,atSeconds:e.absoluteSeconds};
  if(e.characterId==='iuno'&&e.name==='Outro - From Gloom to Gleam'){const w=activateIunoOutroTransfer({event});if(w)transfers.push(w);continue;}
  const contracts=supported.filter(c=>c.characterId===e.characterId&&CHARACTER_MECHANIC_FACTS.some(f=>f.factId===c.factId&&nameKey(f.name)===nameKey(e.name)));
  if(contracts.length!==1){pending.push(`${e.characterId}: ${e.name} has no reviewed name-matched transfer adapter`);continue;}
  const contract=contracts[0];
  if(contract.stackPolicy&&transfers.some(w=>w.sourceId===contract.factId&&incomingTransferEffectiveEndSeconds(w,switches)>e.absoluteSeconds)){pending.push(`${contract.factId}: repeated active activation semantics unresolved`);continue;}
  transfers.push(...activateCharacterOutroTransfers({factId:contract.factId,event,priorActivationState:'NONE_ACTIVE'}));
 }
 const hasShorekeeper=rotation.characterIds.includes('the-shorekeeper');
 if(input.shorekeeper&&(!hasShorekeeper||!Number.isFinite(input.shorekeeper.energyRegenRatio)||input.shorekeeper.energyRegenRatio<0||typeof input.shorekeeper.insideStellarealm!=='boolean'))throw Error('Invalid explicit Shorekeeper scenario assumptions');
 if(input.shorekeeper){const requirement=model.resources?.find(r=>r.characterId==='the-shorekeeper');if(requirement&&input.shorekeeper.energyRegenRatio*100<requirement.largestRequiredEnergyRegenPercent)pending.push('Supplied Shorekeeper ER is below the source timing requirement; this buff query does not prove executable energy timing');}
 if(hasShorekeeper&&!input.shorekeeper)pending.push('Shorekeeper range and Energy Regen sample required for Stellarealm');
 const origin=cycleStart/60,cycleEnd=origin+rotation.cycleSeconds;
 const realmContract=hasShorekeeper?resolveShorekeeperStellarealmContract():null;
 const breakpoints=new Set([origin,cycleEnd,...events.map(e=>e.absoluteSeconds),...transfers.flatMap(w=>[w.startedAtSeconds,incomingTransferEffectiveEndSeconds(w,switches)]),...teamWindows.flatMap(w=>[w.startedAtSeconds,w.expiresAtSeconds]),...switches.map(e=>e.atSeconds)]);
 if(realmContract)for(const e of events.filter(e=>e.characterId==='the-shorekeeper'&&e.name==='Liberation - End Loop'))breakpoints.add(e.absoluteSeconds+realmContract.durationSeconds);
 const intervals=rotation.visits.flatMap(v=>{
  const start=(cycleStart+v.startFrame)/60,end=(cycleStart+v.endFrame)/60;
  const points=[...new Set([start,end,...[...breakpoints].filter(t=>t>start&&t<end)])].sort((a,b)=>a-b);
  return points.slice(0,-1).map((at,i)=>{
   let stellarealm:ReturnType<typeof readShorekeeperStellarealmState>|null=null;
   if(hasShorekeeper&&input.shorekeeper){
    let state=createShorekeeperStellarealmState(rotation.characterIds);
    try{
     for(const e of events.filter(e=>e.absoluteSeconds<=at)){
      if(e.characterId==='the-shorekeeper'&&e.name==='Liberation - End Loop')state=applyShorekeeperStellarealmEvent(state,{kind:'SHOREKEEPER_RESONANCE_LIBERATION_CAST',actorId:e.characterId,atSeconds:e.absoluteSeconds});
      else if(e.castKind==='INTRO')state=applyShorekeeperStellarealmEvent(state,{kind:'INTRO_SKILL_CAST',actorId:e.characterId,atSeconds:e.absoluteSeconds,insideStellarealm:input.shorekeeper.insideStellarealm,introVariant:e.characterId==='the-shorekeeper'&&e.name==='Intro - Discernment'?'DISCERNMENT':'STANDARD'});
     }
     stellarealm=readShorekeeperStellarealmState(state,{actorId:v.characterId,atSeconds:at,insideStellarealm:input.shorekeeper.insideStellarealm,shorekeeperEnergyRegen:input.shorekeeper.energyRegenRatio});
    }catch(error){pending.push(`Stellarealm: ${(error as Error).message}`);}
   }
   return {characterId:v.characterId,startFrame:Math.round(at*60)-cycleStart,endFrame:Math.round(points[i+1]*60)-cycleStart,startSeconds:(Math.round(at*60)-cycleStart)/60,endSeconds:(Math.round(points[i+1]*60)-cycleStart)/60,stellarealm,
    incomingAmplifications:transfers.filter(w=>isIncomingTransferWindowActive(w,v.characterId,at,switches)),
    shorekeeperOutro:teamWindows.filter(w=>isShorekeeperOutroTeamWindowActive(w,v.characterId,at)).slice(-1)};
  });
 });
 const carryIntervals=intervals.filter(i=>i.characterId===rotation.anchorCharacterId);
 return {...rotation,combatPreparation:{...rotation.combatPreparation,status:'PARTIAL_CANONICAL_EVENT_PREPARATION' as const,scenarioAssumptions:input.shorekeeper??null,
   timeOriginSeconds:origin,eventHistory:events,switchOutHistory:switches,transferWindows:transfers,teamWindows,intervals,
   anchorCoverage:{fieldSeconds:rotation.visits.filter(v=>v.characterId===rotation.anchorCharacterId).reduce((s,v)=>s+v.fieldSeconds,0),
    stellarealmCritRateSeconds:input.shorekeeper&&carryIntervals.every(i=>i.stellarealm!==null)?carryIntervals.filter(i=>i.stellarealm?.appliesToActor&&['INNER','SUPERNAL'].includes(i.stellarealm.stage)).reduce((s,i)=>s+i.endSeconds-i.startSeconds,0):null,
    stellarealmCritDamageSeconds:input.shorekeeper&&carryIntervals.every(i=>i.stellarealm!==null)?carryIntervals.filter(i=>i.stellarealm?.appliesToActor&&i.stellarealm.stage==='SUPERNAL').reduce((s,i)=>s+i.endSeconds-i.startSeconds,0):null},
   pending:[...new Set([...pending,'Other passives, shield/stack states, weapons, Echo/set effects and damage-hit bindings require separate canonical events.','Provider action starts are not per-hit damage timestamps. Buff coverage is field-time coverage, not weighted damage coverage.'])]}};
}

/** Compare declared scenarios on the same provider clock; no DPS benefit is inferred. */
export function compareTeamRotationScenarios(before:Parameters<typeof prepareTeamRotationScenario>[0],after:Parameters<typeof prepareTeamRotationScenario>[0]){
 const baseline=prepareTeamRotationScenario(before),replacement=prepareTeamRotationScenario(after);
 if(baseline.status!=='COMPOSED_REFERENCE_SCENARIO'||replacement.status!=='COMPOSED_REFERENCE_SCENARIO')return {status:'SCENARIO_SELECTION_REQUIRED' as const,baseline,replacement};
 if(baseline.anchorCharacterId!==replacement.anchorCharacterId||baseline.clock!==replacement.clock||baseline.rotationNumber!==replacement.rotationNumber)throw Error('Comparison requires the same carry, clock and cycle phase');
 const summarize=(r:typeof baseline)=>{
  const windows=r.combatPreparation.intervals.filter(i=>i.characterId===r.anchorCharacterId).flatMap(i=>i.incomingAmplifications);
  return [...new Map(windows.map(w=>[w.sourceId+'|'+w.statOrEffect,{sourceId:w.sourceId,sourceActorId:w.sourceActorId,statOrEffect:w.statOrEffect,value:w.value}])).values()];
 };
 const old=summarize(baseline),next=summarize(replacement);
 return {status:'REFERENCE_SCENARIO_COMPARISON' as const,baseline,replacement,cycleSecondsDelta:replacement.cycleSeconds-baseline.cycleSeconds,
  anchorFieldSecondsDelta:replacement.combatPreparation.anchorCoverage.fieldSeconds-baseline.combatPreparation.anchorCoverage.fieldSeconds,
  lostTransfers:old.filter(w=>!next.some(n=>n.sourceId===w.sourceId&&n.statOrEffect===w.statOrEffect)),gainedTransfers:next.filter(w=>!old.some(n=>n.sourceId===w.sourceId&&n.statOrEffect===w.statOrEffect)),
  infoSv:'Kortare partnertid ger inte automatiskt längre buffad carrytid. Jämförelsen visar faktisk fälttäckning i det deklarerade scenariot; buffstyrka, träffar och övriga tillstånd avgör skadan.',teamDpsReady:false as const};
}
