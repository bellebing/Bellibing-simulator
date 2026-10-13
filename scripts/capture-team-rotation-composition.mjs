/** Replay a pinned published calculator for timing research only. No provider damage is exported. */
import {writeFileSync,readFileSync,readdirSync} from 'node:fs';
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
const mod=p=>import(pathToFileURL(sourceDir+'/dist/src/'+p+'.js').href);
const sourceProof=JSON.parse(readFileSync('data/source/team-timing-model-evidence-2026-10-12.json'));
for(const f of sourceProof.sourceFiles)if(createHash('sha256').update(readFileSync(sourceDir+'/'+f.path)).digest('hex')!==f.sha256)throw Error('Pinned source file drift: '+f.path);
const {ALL_TEAMS}=await mod('teams');
const {member,comboOf}=await mod('solver');
const {runTeam,shortOf,erRollsFor}=await mod('teamrun');
const {ROVER_HAVOC}=await mod('resonators/havoc/rover_havoc');
const {DANJIN}=await mod('resonators/havoc/danjin');
const {SHOREKEEPER}=await mod('resonators/spectro/shorekeeper');
const {ActionGroup,CancelledStep,ECHO}=await mod('engine/rotation');
function relaxed(a){
 if(a instanceof CancelledStep)return relaxed(a.of);
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

const roster=JSON.parse(readFileSync('data/source/alternative-team-model-roster-2026-10-12.json'));
const review=JSON.parse(readFileSync('data/source/alternative-team-context-review-2026-10-12.json'));
const contexts=readFileSync('src/data/alternativeTeamContexts.ts','utf8').split('\n').filter(l=>l.startsWith('{"id":')).map(l=>JSON.parse(l.replace(/,$/,'')));
const alias=n=>review.aliases[n]??n.toLowerCase();
const released=new Set(contexts.flatMap(c=>c.characterIds));
const modeNames={'tune-rupture':'Resonance Mode - Tune Rupture','tune-strain':'Resonance Mode - Tune Strain','fusion-burst':'Resonance Mode - Fusion Burst','unison':'Resonance Mode - Unison','electro-flare':'Resonance Mode - Electro Flare','glacio-chafe':'Resonance Mode - Glacio Chafe','echo-skill':'Resonance Mode - Echo'};
const requests=roster.rows.map(row=>({row,entry:ALL_TEAMS[row.publisherRow],compositionContextId:null}));
const modulePool=new Map();const moduleDefinitions=new Map();
for(const row of roster.rows)for(let i=0;i<3;i++){const m=row.members[i];if(!modulePool.has(m.sourceLoadoutIndex))modulePool.set(m.sourceLoadoutIndex,{member:m,loadout:ALL_TEAMS[row.publisherRow].loadouts[i]});}
for(const element of readdirSync(sourceDir+'/dist/src/resonators').sort())for(const file of readdirSync(sourceDir+'/dist/src/resonators/'+element).filter(f=>f.endsWith('.js')).sort()){
 const exports=await mod('resonators/'+element+'/'+file.slice(0,-3));
 for(const [exportName,loadout] of Object.entries(exports))if(loadout?.resonator&&typeof loadout.rotationAt==='function'){
  moduleDefinitions.set(loadout,{exportName,sourcePath:'src/resonators/'+element+'/'+file.replace(/\.js$/,'.ts')});
  if(exportName==='ROVER_HAVOC')modulePool.set(10000,{member:{sourceName:loadout.resonator.name,sourceMode:null,sourceLoadoutIndex:10000,isMainDamage:true},loadout});
 }
}
const semanticModes={PHOEBE_CONFESSION:'confession',PHOEBE_ABSOLUTION:'absolution',CIACCONA_YELLOW:'spectro-frazzle',CIACCONA:'aero-erosion',IUNO:'semi-dps',IUNO_MDPS:'dps',BRANT:'standard',BRANT_MDPS:'dps',ROVER_HAVOC:'single-carry'};
const semanticMatch=(loadout,id,mode)=>!['confession','absolution','aero-erosion','spectro-frazzle','single-carry'].includes(mode)||semanticModes[moduleDefinitions.get(loadout)?.exportName]===mode;
for(const c of contexts.filter(c=>c.evidenceBasis!=='PUBLISHED_MODEL_ROSTER_ONLY')){
 if(roster.rows.some(row=>row.members.every(m=>c.characterIds.includes(alias(m.sourceName)))))continue;
 if(!c.roleAssignment.support||!c.roleAssignment.partner)continue;
 const order=[c.roleAssignment.support,c.roleAssignment.partner,c.anchorCharacterId];
 const modules=order.map((id,i)=>[...modulePool.values()].find(p=>alias(p.member.sourceName)===id&&p.member.isMainDamage===(i===2)&&(!modeNames[c.modeRequirements[id]]||p.member.sourceMode===modeNames[c.modeRequirements[id]])&&semanticMatch(p.loadout,id,c.modeRequirements[id])));
 if(modules.some(m=>!m))continue;
 requests.push({row:{publisherRow:null,members:modules.map(m=>m.member)},entry:{loadouts:modules.map(m=>m.loadout),mdps:[false,false,true]},compositionContextId:c.id});
}
requests.push(...requests.filter(r=>r.entry.loadouts.some(l=>['Jianxin','Roccia'].includes(l.resonator.name))).map(r=>({...r,higherSequence:true})));
const records=[];
for(const {row,entry,compositionContextId,higherSequence} of requests){
 const ids=row.members.map(m=>alias(m.sourceName));
 if(ids.some(id=>!released.has(id)))continue;
 if(entry.loadouts.some((l,i)=>l.resonator.name!==row.members[i].sourceName))throw Error('Roster drift');
 const record={id:(compositionContextId?'composed-'+compositionContextId:'published-'+row.publisherRow)+(higherSequence?'-higher-sequence':''),compositionContextId,publisherRow:row.publisherRow,characterIds:ids,modules:row.members.map((m,i)=>({characterId:ids[i],loadoutIndex:m.sourceLoadoutIndex,mode:m.sourceMode,semanticMode:semanticModes[moduleDefinitions.get(entry.loadouts[i])?.exportName]??null,definition:moduleDefinitions.get(entry.loadouts[i]),isMainDamage:m.isMainDamage})),phases:[],failure:null};
 try{
 const loads=entry.loadouts.map(l=>relaxedLoadout(l));
 const members=loads.map((l,i)=>member(l,entry.mdps[i]));
 let combo=loads.map((l,i)=>comboOf(l,{weapon:0,echo:0,mainstat:0,sequence:higherSequence&&l.resonator.name==='Jianxin'?2:higherSequence&&l.resonator.name==='Roccia'?6:l.resonator.name==='Havoc Rover'?2:['Buling','Suisui','Aero Rover','Electro Rover','Sanhua','Danjin','Mortefi','Chixia','Aalto','Yangyang','Baizhi','Youhu','Yuanwu','Lumi'].includes(l.resonator.name)?6:0,refine:0,matrix:false,highSubs:false}));
 const teamKey='composition-'+record.id;
 let run=runTeam(teamKey,members,combo,true);
 const sourceMainstatFallbacks=[];
 for(let actor=0;actor<3;actor++){
  if(shortOf(teamKey,members,combo)[actor]!=='er')continue;
  const choices=loads[actor].mainstats.map((m,index)=>({m,index})).filter(c=>/\bER\b/.test(c.m.name)).slice(0,8);
  for(const choice of choices){
   const trial=combo.slice();trial[actor]=comboOf(loads[actor],{weapon:0,echo:0,mainstat:choice.index,sequence:combo[actor].sequence,refine:0,matrix:false,highSubs:false});
   const trialKey=teamKey+'-er-'+actor+'-'+choice.index;
   try{const trialRun=runTeam(trialKey,members,trial,true);if(shortOf(trialKey,members,trial)[actor]===null){combo=trial;run=trialRun;sourceMainstatFallbacks.push({characterId:ids[actor],mainstatIndex:choice.index});break;}}catch{}
  }
 }
 record.sourceMainstatFallbacks=sourceMainstatFallbacks;
 record.builds=combo.map((c,i)=>({characterId:ids[i],sequence:c.sequence,weapon:c.weapon.name,echo:c.echo.name??c.echo.mainslot?.name??c.echo.pieces().map(p=>p.name).join(' / '),mainstat:c.mainstat.name}));
 const shortages=shortOf(teamKey,members,combo), rolls=erRollsFor(teamKey,members,combo);
 record.resources=run.state.slots.map((slot,i)=>({characterId:ids[i],energyRegenPercent:slot.constEr,largestRequiredEnergyRegenPercent:slot.erWorst,requiredErRolls:rolls[i],shortfall:shortages[i]}));
 if(shortages.some(Boolean))record.failure='SOURCE_BUILD_STAT_REQUIREMENT_UNMET';
 record.phases=run.rotationLines.map((lines,i)=>{
 const all=lines.flatMap(l=>l.members?.length?l.members:[l.snap]).sort((a,b)=>a.seq-b.seq);
 const casts=all.filter(s=>!s.triggered&&s.active);
 const start=casts[0]?.frame??0, end=start+Math.round(run.sectionSeconds[i]*60);
 const visits=[];
 for(const s of casts){const id=alias(s.slot);if(!ids.includes(id))throw Error('Unknown actor');
 if(!visits.length||visits.at(-1).characterId!==id){if(visits.length)visits.at(-1).endFrame=s.frame-start;visits.push({characterId:id,startFrame:s.frame-start,endFrame:end-start,actions:[]});}
 visits.at(-1).actions.push({name:s.action.name,atFrame:s.frame-start,waitFrames:s.action.gameWait?s.action.animFrames:0,castUnmet:!!s.castUnmet});}
 const events=[...new Map(all.filter(s=>(!s.triggered&&[4,5].includes(s.action.cast))||s.action.cast===6).map(s=>[s.seq,s])).values()].map(s=>({characterId:alias(s.slot),name:s.action.name,castKind:({4:'LIBERATION',5:'INTRO',6:'OUTRO'})[s.action.cast],atFrame:s.frame-start,seq:s.seq,triggered:!!s.triggered}));
 return {rotationNumber:i+1,cycleFrames:end-start,visits,events};});
 if(record.phases.some(p=>p.visits.some(v=>v.actions.some(a=>a.castUnmet))))record.failure='SOURCE_CAST_REQUIREMENT_UNMET';
 }catch(e){record.failure=String(e.message);record.phases=[];}
 records.push(record);
 if(records.length%50===0)console.log(records.length);
}
const artifact={schemaVersion:1,sourceCommit:sha,sourceUrl:'https://github.com/riley31415/wuwa_calc/tree/'+sha,clock:'PROVIDER_MODEL_GAME_FRAMES_AT_60FPS_EXCLUDING_TIMESTOP',authority:'ADAPTED_PUBLISHED_MODEL_NOT_MEASURED_GAMEPLAY',adaptation:'Complete cancelled actions as in timing research; ordinary swaps retained. First weapon/echo/mainstat, or first source-declared ER mainstat that resolves a member shortage (up to 8 source-order candidates, no DPS ranking); S6 four-stars/alternate Rover, other S0; R1. All four cycles replayed as a whole team. No provider damage exported.',captureSha256:createHash('sha256').update(readFileSync('scripts/capture-team-rotation-composition.mjs')).digest('hex'),rosterSha256:createHash('sha256').update(readFileSync('data/source/alternative-team-model-roster-2026-10-12.json')).digest('hex'),sourceFiles:sourceProof.sourceFiles,records};
writeFileSync(output,JSON.stringify(artifact)+'\n');
console.log('Captured',records.length,'rows;',records.filter(r=>!r.failure).length,'legal model runs');
