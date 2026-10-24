// Workspace-owned inputs -> detached local experimental requests.
import {createFixedTeamScenarioRequest} from './fixedTeamScenario.mjs';
import {localTeamReference} from './localTeamReference.mjs';
const clone=v=>structuredClone(v);
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value)))),b=>b.toString(16).padStart(2,'0')).join('');
const card=(value,id)=>value&&({id,speciesId:value.echoId??value.speciesId,selectedSonataSetId:value.selectedSonataSetId,rank:value.rank,cost:value.cost,level:value.level,
 mainStat:clone(value.mainStat),secondaryMainStat:clone(value.secondaryMainStat),substats:clone(value.substats)});
export async function captureLocalTeamBuilds(input){
 const fail=reason=>({status:'PENDING',reason});

 const {mode,selectedCharacterId,team,scope}=input;
 if(!team?.id||!Array.isArray(team.characterIds)||team.characterIds.length!==3)return fail('SOURCE_TEAM_CONTEXT_PENDING');
 if(mode==='SANDBOX'){
  const build=scope?.buildContext;
  if(build?.kind!=='SANDBOX_BUILD'||build.characterId!==selectedCharacterId||!team.characterIds.includes(selectedCharacterId))return fail('SANDBOX_REFERENCE_INPUT_PENDING');
  // No account records or account-owned equipment enter the Sandbox payload.
  const ownership={kind:'SANDBOX_BUILD',id:build.id,revision:await hash({team,scope,candidates:input.candidates})};
  const configurations=scope.slots?.map(s=>s.configuration&&({speciesId:s.configuration.echoId,cost:s.configuration.cost,selectedSonataSetId:s.configuration.selectedSonataSetId}));
  const observed=(input.candidates??[]).some(Boolean);
  const cards=observed?Array.from({length:5},(_,i)=>card(input.candidates?.[i],`sandbox:${build.id}:${i}`)??null):null;
  return {status:'CAPTURED',payload:{sandbox:{version:'SOURCE_SANDBOX_REFERENCE_V1',teamContextId:team.id,selectedCharacterId,ownership,baseline:clone(build.baseline),weaponId:build.weaponId,configurations,cards}}};
 }
 if(mode!=='IMPROVE')return fail('BUILD_OWNERSHIP_PENDING');
 if(!input.acceptReferenceInvestment)return fail('CONFIRM_REFERENCE_INVESTMENT');
 const records=input.records;
 if(!Array.isArray(records)||team.characterIds.some(id=>records.find(r=>r.characterId===id)?.status!=='OBSERVED_PRODUCTION_BUILD_RECORD'))return fail('COMPLETE_ACCOUNT_TEAM_REQUIRED');
 const kind='ACCOUNT_BUILD';
 const ownership={kind,id:'local-account-observation:'+mode,revision:await hash({team,records,scope,investment:'EXPLICIT_LV90_R1_REFERENCE'})};
 const builds=team.characterIds.map(characterId=>{
  const b=records.find(r=>r.characterId===characterId).buildState,slots=b.echoSets?.sets?.[b.echoSets.activeSetId]?.slots;
  return {characterId,kind,ownerId:ownership.id,ownerRevision:ownership.revision,modeId:team.modeRequirements?.[characterId]??'default',
   // v34 stores the weapon ID, actual Sequences/Forte and Echoes. It does not
   // store Character/Weapon levels/refinement: these are explicit review
   // scenario choices, never inferred as real account investment.
   baseline:{characterLevel:90,weaponLevel:90,weaponRefinement:1,sequenceLevel:b.sequenceLevel,forte:clone(b.forte)},
   weapon:{id:b.weaponId,rank:1,level:90},echoes:slots?.map((c,i)=>card(c,`observation:${characterId}:${i}`))};
 });
 const common={mode,selectedCharacterId,teamContextId:team.id,ownership,cycleNumber:2,enemy:localTeamReference(team.id).enemy,acceptReferenceStateSchedule:true};
 const current=createFixedTeamScenarioRequest({...common,builds});if(current.status!=='CAPTURED')return fail(current.reason);
 if(builds.some(b=>b.echoes?.length!==5||b.echoes.some(c=>!c)))return fail('FIVE_COMPLETE_ACCOUNT_ECHOES_REQUIRED');
 const next=clone(builds),selected=next.find(b=>b.characterId===selectedCharacterId),slots=[];
 for(const [i,c]of (input.candidates??[]).entries())if(c){slots.push(i);selected.echoes[i]=card(c,`candidate:${selectedCharacterId}:${i}`);}
 if(input.candidateBaseline)selected.baseline=clone(input.candidateBaseline);
 if(input.candidateWeapon)selected.weapon=clone(input.candidateWeapon);
 const candidate=slots.length?createFixedTeamScenarioRequest({...common,builds:next}):null;
 if(candidate&&candidate.status!=='CAPTURED')return fail(candidate.reason);
 return {status:'CAPTURED',payload:{current:current.request,...(candidate?{candidate:candidate.request,slots}:{})}};
}
