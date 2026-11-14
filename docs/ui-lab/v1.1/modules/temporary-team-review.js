import {sandboxStandard} from './sandbox-state.js';

// A detached reference scenario. No teammates or equipment are saved to account.
export function temporaryTeamScenario(input) {
 const standard=sandboxStandard(input.selectedCharacterId);
 const record=input.records?.find(r=>r.characterId===input.selectedCharacterId);
 const build=record?.buildState;
 const slots=build?.echoSets?.sets?.[build.echoSets.activeSetId]?.slots;
 if(!standard||!input.team||!Array.isArray(slots)||slots.length!==5)return null;
 const card=(value,index)=>value&&({id:'temporary-slot-'+index,speciesId:value.echoId??value.speciesId,selectedSonataSetId:value.selectedSonataSetId,rank:value.rank,cost:value.cost,level:value.level,mainStat:value.mainStat,secondaryMainStat:value.secondaryMainStat,substats:value.substats});
 const configurations=slots.map(e=>e&&({speciesId:e.echoId,cost:e.cost,selectedSonataSetId:e.selectedSonataSetId,mainStatName:e.mainStat?.name}));
 const context={version:'SOURCE_SANDBOX_REFERENCE_V1',teamContextId:input.team.id,selectedCharacterId:input.selectedCharacterId,
  ownership:{kind:'SANDBOX_BUILD',id:'temporary-team:'+input.selectedCharacterId,revision:JSON.stringify({team:input.team.id,build})},
  baseline:{...standard.baseline,sequenceLevel:build.sequenceLevel},weaponId:build.weaponId,configurations};
 return {...context,cards:slots.map(card)};
}

export async function temporaryTeamReview(input, post, signal) {
 const context=temporaryTeamScenario(input);
 if(!context){const reason='FIVE_COMPLETE_ACCOUNT_ECHOES_REQUIRED';return {status:'PENDING',reason,current:{status:'PENDING',reason},candidate:null};}
 const slots=context.cards;
 const card=(value,index)=>value&&({...value,id:'temporary-slot-'+index,speciesId:value.speciesId??value.echoId});
 const run=async cards=>{
  const reply=await post({sandbox:{...context,cards:cards.map(card)}},signal);
  if(reply.protocol!=='BELLIBING_LOCAL_TEAM_REVIEW_V1')throw Error('PROTOCOL');
  return reply.result;
 };
 const current=await run(slots);
 const replacements=input.candidates??[];
 const candidate=replacements.some(Boolean)?await run(slots.map((value,index)=>replacements[index]??value)):null;
 const selected=current.candidate??current.current??{status:'PENDING',reason:current.reason??'LOCAL_REVIEW_UNAVAILABLE'};
 return {status:selected.status,reason:selected.reason??null,current:selected,candidate:candidate?(candidate.candidate??{status:'PENDING',reason:candidate.reason??'LOCAL_REVIEW_UNAVAILABLE'}):null,reference:current.current,
  scenario:'TEMPORARY_REFERENCE_TEAM',scope:'Source team, reference levels, Skills and R1; selected Character uses your Echoes, Sequence and weapon identity'};
}
