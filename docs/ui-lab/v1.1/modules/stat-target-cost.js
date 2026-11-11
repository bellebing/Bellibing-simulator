import {manualTargetExpectedCost} from './improve-feedback.js';

// Exact fresh-echo policies, deduplicated across equivalent slots. No DPS results.
export function createStatTargetCost({request,onChange=()=>{}}){
 let binding=null,generation=0;const entries=new Map();
 const targets=c=>c?.statTargets??Array(5).fill(c?.target);
 const identity=(c,target)=>c?.dpsPlan?.dpsEnabled||!target?null:JSON.stringify([c.owner?.characterId,target,c.gate]);
 return {
  read(c,slot=0){return entries.get(identity(c,targets(c)[slot]))?.cost??null;},
  sync(c){
   const next=c?.dpsPlan?.dpsEnabled?null:JSON.stringify([c?.owner?.characterId,targets(c),c?.gate]);if(next===binding)return;
   binding=next;const token=++generation;entries.clear();if(next===null)return;
   for(const target of targets(c)){
    const key=identity(c,target);if(key===null||entries.has(key))continue;
    entries.set(key,{cost:null});
    Promise.resolve().then(()=>request({target,gate:c.gate,rolls:[]})).then(reply=>{
     if(token!==generation)return;entries.set(key,{cost:manualTargetExpectedCost({targetGuidance:reply?.result})});onChange();
    }).catch(()=>{if(token===generation){entries.set(key,{cost:null});onChange();}});
   }
  }
 };
}
