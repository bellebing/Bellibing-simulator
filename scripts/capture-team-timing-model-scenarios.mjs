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
const {ALL_TEAMS}=await mod('teams');
const {member,comboOf}=await mod('solver');
const {runTeam}=await mod('teamrun');
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
const requests=[
 ['hsin-jinhsi-shorekeeper-unison',['Jinhsi','Hsin','Shorekeeper']],
 ['hsin-rover-electro-buling-flare',['Buling','Electro Rover','Hsin']],
 ['hsin-rover-electro-suisui-flare',['Suisui','Electro Rover','Hsin']],
 ['aemeath-changli-quickswap',['Shorekeeper','Changli','Aemeath']],
 ['cartethyia-chisa-rover-aero',['Chisa','Aero Rover','Cartethyia']],
 ['cartethyia-low-erosion',['Shorekeeper','Sanhua','Cartethyia']],
 ['phrolova-lucilla-qiuyuan',['Phrolova','Qiuyuan','Lucilla']],
 ['brant-lupa-mornye-dps',['Mornye','Lupa','Brant']],
 ['jinhsi-zhezhi',['Shorekeeper','Zhezhi','Jinhsi']],
 ['zani-phoebe-confession',['Shorekeeper','Phoebe','Zani']],
 ['rover-havoc-danjin-hypercarry',['Shorekeeper','Danjin','Havoc Rover']],
 ['rover-havoc-danjin-shared-dps',['Shorekeeper','Danjin','Havoc Rover']],
];
const records=[];
for(const [caseId,names] of requests){
 const entry=ALL_TEAMS.find(t=>t.loadouts.every((l,i)=>l.resonator.name===names[i]));
 const sourceLoads=entry?.loadouts ?? (names.includes('Havoc Rover')?[SHOREKEEPER,DANJIN,ROVER_HAVOC]:null);
 const loads=sourceLoads?.map(l=>relaxedLoadout(l,caseId==='rover-havoc-danjin-shared-dps'));
 if(!loads){throw Error('Missing source team: '+caseId);}
 const members=loads.map((l,i)=>member(l,entry?.mdps[i]??i===2));
 const picks=loads.map(l=>({weapon:0,echo:0,mainstat:0,sequence:['Buling','Suisui','Aero Rover','Electro Rover','Sanhua','Danjin'].includes(l.resonator.name)?6:l.resonator.name==='Havoc Rover'?2:0,refine:0,matrix:false,highSubs:false}));
 const combo=loads.map((l,i)=>comboOf(l,picks[i]));
 try{
 const run=runTeam('bellibing-research-'+caseId,members,combo,true);
 const phases=run.rotationLines.map((lines,i)=>{
  const snaps=lines.flatMap(l=>l.members?.length?l.members:[l.snap]);
  const casts=snaps.filter(s=>!s.triggered&&s.active).sort((a,b)=>a.seq-b.seq);
  const start=casts[0]?.frame??0;
  const end=start+Math.round(run.sectionSeconds[i]*60);
  const visits=[];
  for(const s of casts){
   const at=s.frame;
   if(at<start||at>end)throw Error('cast outside section');
   if(!visits.length||visits.at(-1).actor!==s.slot){
    if(visits.length)visits.at(-1).endFrame=at-start;
    visits.push({actor:s.slot,startFrame:at-start,endFrame:end-start,actions:[]});
   }
   visits.at(-1).actions.push({name:s.action.name,atFrame:at-start,realAtFrame:s.realStarts,tag:s.tag,waitFrames:s.action.gameWait?s.action.animFrames:0,castUnmet:s.castUnmet});
  }
  return {rotationNumber:i+1,cycleFrames:end-start,visits};
 });
 records.push({caseId,publishedTeam:!!entry,builds:combo.map((c,i)=>({actor:members[i].name,mode:loads[i].mode?.name??null,sequence:c.sequence,weapon:c.weapon.name,echo:c.echo.name??c.echo.mainslot?.name??c.echo.pieces().map(p=>p.name).join(' / '),mainstat:c.mainstat.name,highSubs:c.highSubs})),phases});
 console.log(caseId,run.sectionSeconds,phases[1].visits.map(v=>`${v.actor}:${((v.endFrame-v.startFrame)/60).toFixed(2)}`).join(' | '));
 }catch(e){throw Error(caseId+': '+e.message);}
}
const files=[];
function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const p=dir+'/'+e.name;if(e.isDirectory())walk(p);else if(e.name.endsWith('.ts'))files.push({path:p.slice(sourceDir.length+1),sha256:createHash('sha256').update(readFileSync(p)).digest('hex')});}}
walk(sourceDir+'/src');
const artifact={schemaVersion:1,role:'team-timing.published-model-derived-scenarios',capturedAt:'2026-10-12',provider:'RILEY_CALCS',sourceCommit:sha,sourceUrl:'https://github.com/riley31415/wuwa_calc/tree/'+sha,sourceFiles:files,clock:'PROVIDER_MODEL_GAME_FRAMES_AT_60FPS_EXCLUDING_TIMESTOP',adaptation:'Complete CancelledStep wrappers and cancelled action forms before advancing; retain ordinary exit swaps, Echo handoffs and kit-native timing. Havoc Rover S2 avoids provider S4 stat-hook failure; omit final cooldown-blocked Wingblade, use two/one Umbra strings in carry/shared variants.',authority:'REFERENCE_MODEL_NOT_MEASURED_GAMEPLAY_OR_CANONICAL_MECHANICS',records};
writeFileSync(output,JSON.stringify(artifact,null,2)+'\n');
