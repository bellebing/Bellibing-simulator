/** Replay a pinned published calculator for timing research only. No provider damage is exported. */
import {writeFileSync,readFileSync,readdirSync,mkdtempSync,cpSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const sourceDir=resolve(process.argv[2]??'');
const output=process.argv[3];
if(!process.argv[2]||!output)throw Error('Usage: node scripts/capture-team-timing-model-scenarios.mjs PINNED_RILEY_CHECKOUT OUTPUT');
const sha='195a22f1b7a1b55b953224e26742b896a719e1c3';
const head=readFileSync(sourceDir+'/.git/HEAD','utf8').trim();
const ref=head.startsWith('ref: ')?head.slice(5):null;
let actual=head;
if(ref){try{actual=readFileSync(sourceDir+'/.git/'+ref,'utf8').trim();}catch{actual=readFileSync(sourceDir+'/.git/packed-refs','utf8').split('\n').find(l=>l.endsWith(' '+ref))?.split(' ')[0];}}
if(actual!==sha)throw Error('Wrong source revision; review required');
const observerDir=mkdtempSync('/tmp/bellibing-pilot-observer-');
cpSync(sourceDir+'/dist',observerDir+'/dist',{recursive:true});
const evaluatorPath=observerDir+'/dist/src/engine/evaluate.js';
const evaluator=readFileSync(evaluatorPath,'utf8');
const anchor='state.hits.push({ at: result.starts, slot: result.slot, member: result.member, avg: result.avg, variantAvg: result.variantAvg });';
if(evaluator.split(anchor).length!==2)throw Error('Observer insertion needs source review');
writeFileSync(evaluatorPath,evaluator.replace(anchor,'{ globalThis.__BELLI_CAPTURE?.(result, state); '+anchor+' }'));
const mod=p=>import(pathToFileURL(observerDir+'/dist/src/'+p+'.js').href);
const sourceProof=JSON.parse(readFileSync('data/source/team-timing-model-evidence-2026-10-12.json'));
for(const f of sourceProof.sourceFiles)if(createHash('sha256').update(readFileSync(sourceDir+'/'+f.path)).digest('hex')!==f.sha256)throw Error('Pinned source file drift: '+f.path);
const {ALL_TEAMS}=await mod('teams');
const {member,comboOf}=await mod('solver');
const {runTeam,shortOf,erRollsFor}=await mod('teamrun');
const {effectiveRes,effectiveShred}=await mod('engine/damage');
const {ROVER_HAVOC}=await mod('resonators/havoc/rover_havoc');
const {DANJIN}=await mod('resonators/havoc/danjin');
const {SHOREKEEPER}=await mod('resonators/spectro/shorekeeper');
const {ActionGroup,CancelledStep,ECHO}=await mod('engine/rotation');
function relaxed(a){
 if(a instanceof CancelledStep)return relaxed(a.of);
 if(a.name==='Echo Placeholder (insta swap)'||a.name==='Echo Placeholder (swap)')return ECHO;
 if(a instanceof ActionGroup)return new ActionGroup(a.name,a.actions.map(relaxed),a.trailing);
 if(a.formOf||a.cancelOf){const base=a.formOf??a.cancelOf;if(typeof base?.swap!=='function')return a;return a.swapsAfterHit||String(a.tag).includes('swap')?base.swap():base;}
 return a;
}
function relaxedLoadout(l,shortRover=false){
 const copy=Object.assign(Object.create(Object.getPrototypeOf(l)),l);
 copy.rotationAt=(n)=>{const r=l.rotationAt(n);const out=Object.assign(Object.create(Object.getPrototypeOf(r)),r);
  for(const key of ['opener','intro','doubleIntro','firstDoubleIntro','firstIntro','firstOpener'])if(r[key])out[key]={...r[key],body:r[key].body.map(relaxed),cast:r[key].cast?relaxed(r[key].cast):undefined};
  if(l.resonator.name==='Havoc Rover'){
   const body=out.intro.body;const lastSkill=body.findLastIndex(a=>a.name==='Skill - Wingblade');
   out.intro.body=body.filter((a,i)=>i!==lastSkill);
   if(shortRover){let strings=0;out.intro.body=out.intro.body.filter(a=>{if(a.name==='Forte Basic - Umbra 12345')return ++strings===1;return a.name!=='Basic - Umbra 1';});}
  }
  out.intros=r.intros.map(c=>c?{...c,body:c.body.map(relaxed),cast:c.cast?relaxed(c.cast):undefined}:null);return out;};
 return copy;
}


const records=[],benchmarks=[];
for(const partner of ['Iuno','Mortefi']){
 const entry=ALL_TEAMS.find(t=>t.loadouts.map(l=>l.resonator.name).join('|')==='Shorekeeper|'+partner+'|Augusta');
 const loads=entry.loadouts.map(l=>relaxedLoadout(l)), members=loads.map((l,i)=>member(l,entry.mdps[i]));
 const combo=loads.map(l=>comboOf(l,{weapon:0,echo:0,mainstat:0,sequence:l.resonator.name==='Mortefi'?6:0,refine:0,matrix:false,highSubs:false}));
 const hitsByState=new Map();
 globalThis.__BELLI_CAPTURE=(r,state)=>{if(!hitsByState.has(state))hitsByState.set(state,[]);hitsByState.get(state).push({benchmark:r.slot==='Augusta'&&r.action.name==='Intro - Stride of Goldenflare'?{scalingStat:Math.floor(r.atk),motionValue:r.mv/10000,damageBonus:r.dmgBonus/100,amplification:r.amp/100,critRate:r.stats[9]/100,critDamage:r.stats[10]/100,enemyDefense:r.enemyDef*(1-effectiveShred(r)),enemyResistance:effectiveRes(r)/100,providerExpectedDamage:r.avg}:null,actor:r.slot,name:r.action.name,at:r.starts,realAt:r.realStarts,mv:r.mv,baseMv:r.action.mv,type:r.type,scaling:r.action.scaling,element:r.action.lastBullet?.element??r.action.element,entries:r.entries?.map(e=>({stat:e.stat,value:e.value,source:e.source,owner:e.owner})),held:r.heldLocal,active:r.active,seq:r.seq});};
 const run=runTeam('pilot-'+partner,members,combo,true);
 const captured=hitsByState.get(run.state)??[];
 const benchmark=captured.find(h=>h.benchmark)?.benchmark;if(benchmark)benchmarks.push({partner,...benchmark});
 const hits=captured.map(({benchmark,...h})=>h);
 const snapshots=run.rotationLines.flatMap(lines=>lines.flatMap(l=>l.members?.length?l.members:[l.snap]));
 const unmet=snapshots.filter(s=>s.castUnmet?.some(Boolean)).map(s=>({actor:s.slot,name:s.action.name,at:s.frame}));
 const shortfalls=shortOf('pilot-'+partner,members,combo);
 if(unmet.length||shortfalls.some(Boolean))throw Error('Publisher pilot resource gate failed');
 records.push({partner,sourceCastRequirementsUnmet:unmet,sourceStatShortfalls:shortfalls,cycles:run.sectionSeconds,hits:hits.filter(h=>h.entries),resources:run.state.slots.map(s=>({actor:s.name,energyRegenPercent:s.constEr,requiredEnergyRegenPercent:s.erWorst}))});
}
const artifact={sourceCommit:sha,sourceFiles:sourceProof.sourceFiles,captureSha256:createHash('sha256').update(readFileSync('scripts/capture-augusta-pilot-hits.mjs')).digest('hex'),scope:'SOURCE_HIT_ORDER_AND_STATE_OBSERVATIONS_NOT_DAMAGE_VALUES',adaptation:'Complete cancelled actions and Echo placeholders as full on-field casts, retaining explicit Outro. Four continuous cycles; S0 limited characters, S6 Mortefi. No provider damage is used by production; independent benchmark is separate.',clock:'PROVIDER_MODEL_GAME_FRAMES_AT_60FPS_EXCLUDING_TIMESTOP',observerAnchor:anchor,compiledEvaluatorSha256:createHash('sha256').update(evaluator).digest('hex')};
const recordText=records.map(({hits,...meta})=>JSON.stringify(meta,null,2).slice(0,-2)+',\n  "hits": [\n'+hits.map(h=>JSON.stringify(h)).join(',\n')+'\n  ]\n}').join(',\n');
writeFileSync(output,JSON.stringify(artifact,null,2).slice(0,-2)+',\n  "records": [\n'+recordText+'\n  ]\n}\n');

writeFileSync(process.argv[4]??'data/research/augusta-pilot-kernel-benchmark-2026-10-12.json',JSON.stringify({sourceCommit:sha,role:'INDEPENDENT_PROVIDER_KERNEL_BENCHMARK_NOT_PRODUCTION_DAMAGE',records:benchmarks},null,2)+'\n');
