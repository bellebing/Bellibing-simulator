// Stat policy only. DPS is evaluated independently by local-team-review, even
// when these targets fail or this service cannot produce advice.
export async function localObservedAdvice(body,{targetAdvice}) {
 if(!Number.isInteger(body.slot)||body.slot<0||body.slot>4)throw Error('INVALID_CANDIDATE_SLOT');
 const target=await targetAdvice({target:body.target,gate:body.gate,rolls:body.candidate.substats}).catch(()=>null);
 const guidance=target?.result,checkpoint=body.candidate.level;
 const result={kind:'CURRENT_BOUND_ECHO_ADVICE',status:'TARGET_GUIDANCE',checkpoint,
  decision:guidance?.status==='TARGET_SUCCESS'?'Target met':guidance?.status==='BEFORE_GATE'?'Record next checkpoint':guidance?.winner==='CONTINUE'?'Continue':guidance?.winner==='DISCARD'?'Start new Echo':guidance?'Check target settings':'Target advice unavailable',
  targetGuidance:guidance,goalStatus:guidance?.status==='TARGET_SUCCESS'?'MET':checkpoint===25&&guidance?.status==='VERIFIED'?'NOT_MET':'PENDING',
  scope:'MANUAL_ECHO_TARGETS_ONLY',winner:null,choices:[],
  buildComparison:{status:'PENDING',reason:checkpoint<25?'COMPLETE_CANDIDATE_REQUIRED':'ACTUAL_TEAM_REQUIRED'}};
 return result;
}
