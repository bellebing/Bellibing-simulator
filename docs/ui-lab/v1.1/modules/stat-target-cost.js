import {manualTargetExpectedCost} from './improve-feedback.js';

// Exact fresh-echo policies, deduplicated across equivalent slots. No DPS results.
// A missing expectation is a typed Pending state, never an inferred zero.
export function expectedTunerReason(code){
 const reasons={
  ECHO_TARGET_REQUIRED:'Choose a valid Hard/Flex target in Improve Settings.',
  UNSUPPORTED_ECHO_TARGET_OR_ROLLS:'The selected Hard/Flex combination or its minimum rolls is not supported by the local calculator.',
  SEARCH_LIMIT:'This Hard/Flex combination exceeds the local calculator limit.',
  TARGET_HAS_NO_FINITE_EXPECTATION:'This target cannot be reached with a finite expected Tuner cost.',
  PRIVATE_SERVICE_UNAVAILABLE:'The private local Echo calculator is unavailable. Restart the local launcher.',
  REVIEW_BUSY:'The local Echo calculator is busy. Try again.',
  RATE_LIMITED:'The local Echo calculator is busy. Try again.',
  UNAVAILABLE:'Expected Tuners are not available for this configuration.'
 };
 return reasons[code]??'The local calculator has not verified Expected Tuners for this target.';
}
export function createStatTargetCost({request,onChange=()=>{}}){
 let binding=null,generation=0;const entries=new Map();
 const targets=c=>c?.statTargets??Array(5).fill(c?.target);
 const identity=(c,target)=>c?.dpsPlan?.dpsEnabled||!target?null:JSON.stringify([c.owner?.characterId,target,c.gate]);
 return {
  read(c,slot=0){
   const key=identity(c,targets(c)[slot]);
   if(key===null)return null;
   const row=entries.get(key);
   return row?.cost??{status:'PENDING',reason:row?.reason??'Expected Tuners are waiting for the local calculator.'};
  },
  sync(c){
   const next=c?.dpsPlan?.dpsEnabled?null:JSON.stringify([c?.owner?.characterId,targets(c),c?.gate]);if(next===binding)return;
   binding=next;const token=++generation;entries.clear();if(next===null)return;
   for(const target of targets(c)){
    const key=identity(c,target);if(key===null||entries.has(key))continue;
    entries.set(key,{cost:null,reason:'Calculating Expected Tuners for the selected stat target…'});
    Promise.resolve().then(()=>request({target,gate:c.gate,rolls:[]})).then(reply=>{
     if(token!==generation)return;
     const result=reply?.result;
     const cost=manualTargetExpectedCost({targetGuidance:result});
     const reason=cost?null:result?.status==='PENDING'?expectedTunerReason(result.reason):expectedTunerReason('UNAVAILABLE');
     entries.set(key,{cost,reason});onChange();
    }).catch(error=>{
     if(token!==generation)return;
     entries.set(key,{cost:null,reason:expectedTunerReason(error?.message??'PRIVATE_SERVICE_UNAVAILABLE')});onChange();
    });
   }
  }
 };
}
