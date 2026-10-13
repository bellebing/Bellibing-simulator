import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getCharacterActionFact} from '../src/data/characterMechanics.ts';
import {readCharacterActionValues} from '../src/characterActionValues.ts';
const hash=b=>createHash('sha256').update(b).digest('hex');
const path='data/source/augusta-pilot-hit-evidence-2026-10-12.json',bytes=readFileSync(path),raw=JSON.parse(bytes);
if(raw.captureSha256!==hash(readFileSync('scripts/capture-augusta-pilot-hits.mjs')))throw Error('Capture script drift');
const reviewPath='data/research/augusta-pilot-binding-review-2026-10-12.json',review=JSON.parse(readFileSync(reviewPath));
const alias=n=>n==='Shorekeeper'?'the-shorekeeper':n.toLowerCase();
const models=raw.records.map(row=>{
 const lib1Counts=new Map();
 const hits=row.hits.map(h=>{
  for(const e of h.entries)if(!review.reviewedStatSources.includes(e.source.replace(/ x\d+$/,'')))throw Error('Unreviewed stat source '+e.source);
  const ids=review.mapping[h.actor+'|'+h.name],bindings=[];
  if(ids){
   for(const id of ids){const fact=getCharacterActionFact(id);if(!fact||fact.characterId!==alias(h.actor)||fact.verificationStatus!=='VERIFIED')throw Error('Invalid canonical action binding');const values=readCharacterActionValues(fact,10);if(values.status!=='SOURCE_VALUES'||values.kind!=='COEFFICIENTS')throw Error('Missing exact coefficient');
    if(h.name==='Forte Heavy - Illation'){bindings.push({factId:id,componentIndex:0,hitCount:1});continue;}
    values.components.forEach((c,i)=>{if(Math.abs(c.coefficient-h.baseMv/10000)<1e-8)bindings.push({factId:id,componentIndex:i,hitCount:1});});}
   if(!bindings.length)throw Error('Unmatched source component: '+h.name+' '+h.baseMv);
   if(h.name==='Liberation - Sword of Eternal Oath'&&bindings.some(b=>b.componentIndex===3))lib1Counts.set(h.actor,0);
   // Lib1 has the same coefficient in components 0 and 2; a source bullet binds once.
   if(h.name==='Liberation - Sword of Eternal Oath'&&bindings.length===2){const used=lib1Counts.get(h.actor)??0;const selected=bindings[used<2?0:1];bindings.splice(0,bindings.length,selected);lib1Counts.set(h.actor,used+1);}
  }
  return {characterId:alias(h.actor),name:h.name,atFrame:h.at,realAtFrame:h.realAt,seq:h.seq,bindings,
   state:h.entries.filter(e=>review.runtimeStateSources.includes(e.source.replace(/ x\d+$/,''))).map(e=>({source:e.source,owner:alias(e.owner??''),stat:e.stat,stacks:Number(e.source.match(/ x(\d+)$/)?.[1]??1)})),
   pending:ids?null:h.actor==='Tune Break'?'SHARED_TUNE_BREAK_NOT_BOUND':h.name.startsWith('Echo - ')?'ECHO_DAMAGE_BINDING_PENDING':'ACTION_BINDING_PENDING'};
 });
 let total=0;const cycles=row.cycles.map((s,i)=>{const startFrame=total;total+=Math.round(s*60);return {number:i+1,startFrame,endFrame:total};});
 return {partnerId:alias(row.partner),cycles,resources:row.resources.map(r=>({...r,characterId:alias(r.actor)})),hits};
});
const output='// Generated bounded pilot state schedules. Quantities remain canonical.\nexport const AUGUSTA_PILOT_HIT_SOURCE = '+JSON.stringify({artifact:path,sha256:hash(bytes),reviewPath,reviewSha256:hash(readFileSync(reviewPath)),sourceCommit:raw.sourceCommit,clock:raw.clock,adaptation:raw.adaptation},null,2)+' as const;\nexport const AUGUSTA_PILOT_HIT_MODELS = '+JSON.stringify(models)+';\n';
const target='src/data/augustaPilotHitModels.ts';if(process.argv.includes('--check')){if(readFileSync(target,'utf8')!==output)throw Error('Pilot generated parity drift');}else writeFileSync(target,output);
console.log(models.map(m=>m.partnerId+': '+m.hits.length+' hit groups').join('; '));
