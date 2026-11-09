import {captureLocalTeamBuilds} from '../../../../src/localTeamBuildCapture.mjs';

// Target-policy advice and actual-build DPS are independent answers. A failed
// manual target never rejects an otherwise comparable completed candidate.
export async function localObservedAdvice(body,{targetAdvice,teamReview,capture=captureLocalTeamBuilds}) {
 if(!Number.isInteger(body.slot)||body.slot<0||body.slot>4)throw Error('INVALID_CANDIDATE_SLOT');
 const target=await targetAdvice({target:body.target,gate:body.gate,rolls:body.candidate.substats}).catch(()=>null);
 const guidance=target?.result,checkpoint=body.candidate.level;
 const result={kind:'CURRENT_BOUND_ECHO_ADVICE',status:'TARGET_GUIDANCE',checkpoint,
  decision:guidance?.status==='TARGET_SUCCESS'?'Target met':guidance?.status==='BEFORE_GATE'?'Record next checkpoint':guidance?.winner==='CONTINUE'?'Continue':guidance?.winner==='DISCARD'?'Start new Echo':guidance?'Check target settings':'Target advice unavailable',
  targetGuidance:guidance,goalStatus:guidance?.status==='TARGET_SUCCESS'?'MET':checkpoint===25&&guidance?.status==='VERIFIED'?'NOT_MET':'PENDING',
  scope:'MANUAL_ECHO_TARGETS_ONLY',winner:null,choices:[],
  buildComparison:{status:'PENDING',reason:checkpoint<25?'COMPLETE_CANDIDATE_REQUIRED':'ACTUAL_TEAM_REQUIRED'}};
 if(checkpoint<25)return result;
 result.decision='Review completed Echo';
 if(!body.currentInput)return result;
 const candidates=Array(5).fill(null);candidates[body.slot]=body.candidate;
 const captured=await capture({...body.currentInput,candidates,acceptReferenceInvestment:false});
 if(captured.status!=='CAPTURED'){result.buildComparison.reason=captured.reason;return result;}
 const reply=await teamReview(captured.payload),comparison=reply?.result;
 result.buildComparison=comparison??{status:'PENDING',reason:'COMPARISON_UNAVAILABLE'};
 if(comparison?.status==='EXPERIMENTAL'&&Number.isFinite(comparison.delta?.teamTotal)){
  result.status='EXPERIMENTAL';result.scope='ACTUAL_TEAM_FIXED_ROTATION_COMPARISON';
  const gain=comparison.delta.teamTotal;
  result.decision=gain>0?'Keep for comparison':gain<0?'Current build is stronger':'Same model DPS';
  // Retained within the observed workspace only. Never equips account items.
  if(gain>0)result.winner='KEEP_TEMPORARY';
 }
 return result;
}
