// Stat policy only. DPS is evaluated independently by local-team-review, even
// when these targets fail or this service cannot produce advice.
export async function localObservedAdvice(body,{targetAdvice}) {
 if(!Number.isInteger(body.slot)||body.slot<0||body.slot>4)throw Error('INVALID_CANDIDATE_SLOT');
 // Preserve actual local service/calculation failures as typed Pending advice.
 let guidance;
 try{
  const reply=await targetAdvice({target:body.target,gate:body.gate,rolls:body.candidate.substats});
  guidance=reply?.result?.status?reply.result:{status:'PENDING',reason:'INVALID_ADVICE_RESPONSE'};
 }catch(error){
  // Never expose private stack/path text through the public client.
  const code=typeof error?.message==='string'&&/^[A-Z][A-Z0-9_]{1,79}$/.test(error.message)?error.message:'LOCAL_CALCULATOR_ERROR';
  guidance={status:'PENDING',reason:code};
 }
 const checkpoint=body.candidate.level;
 const result={kind:'CURRENT_BOUND_ECHO_ADVICE',status:'TARGET_GUIDANCE',checkpoint,
  decision:guidance?.status==='TARGET_SUCCESS'?'Target met':guidance?.status==='BEFORE_GATE'?'Record next checkpoint':guidance?.winner==='CONTINUE'?'Continue':guidance?.winner==='DISCARD'?'Start new Echo':guidance?.status==='PENDING'?'Target advice unavailable':'Check target settings',
  targetGuidance:guidance,goalStatus:guidance?.status==='TARGET_SUCCESS'?'MET':checkpoint===25&&guidance?.status==='VERIFIED'?'NOT_MET':'PENDING',
  scope:'MANUAL_ECHO_TARGETS_ONLY',winner:null,choices:[],
  buildComparison:{status:'PENDING',reason:checkpoint<25?'COMPLETE_CANDIDATE_REQUIRED':'ACTUAL_TEAM_REQUIRED'}};
 return result;
}
