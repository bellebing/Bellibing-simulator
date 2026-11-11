// Public, presentation-only. All numbers and timestamps must come from one
// validated local private native run. No private evaluator or demo fallback.
export const TRACKS=[
  {id:'onField',name:'On-field Rotation'},
  {id:'swap',name:'Intro / Outro / Swap'},
  {id:'buffs',name:'Active Buffs'},
  {id:'offField',name:'Off-field / Coordinated'}
];
const validNumber=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
const text=s=>typeof s==='string'&&s.length>0&&s.length<=256;
const near=(a,b)=>Math.abs(a-b)<=1e-6*Math.max(1,Math.abs(a),Math.abs(b));
export function normalizeDpsLab(reply){
 const r=reply?.protocol==='BELLIBING_DPS_LAB_V1'?reply.result:null;
 if(!r||r.status!=='EXPERIMENTAL')return {status:'PENDING',reason:r?.reason||'PRIVATE_NATIVE_REVIEW_UNAVAILABLE'};
 if(!text(r.runIdentity)||!validNumber(r.durationSeconds)||r.durationSeconds<=0||!validNumber(r.teamTotal)||!validNumber(r.totalDamage)||!near(r.teamTotal*r.durationSeconds,r.totalDamage))return {status:'PENDING',reason:'RESULT_IDENTITY_OR_TOTAL_MISMATCH'};
 if(!r.rotation||!text(r.rotation.id)||!Array.isArray(r.rotation.characterIds)||r.rotation.characterIds.length!==3||new Set(r.rotation.characterIds).size!==3||r.rotation.characterIds.some(id=>!text(id)))return {status:'PENDING',reason:'TEAM_IDENTITY_PENDING'};
 if(!Array.isArray(r.characterContributions)||r.characterContributions.length!==3||!r.rotation.characterIds.every(id=>r.characterContributions.filter(c=>c.characterId===id&&validNumber(c.damage)&&validNumber(c.dps)&&near(c.damage/r.durationSeconds,c.dps)).length===1))return {status:'PENDING',reason:'MEMBER_CONTRIBUTIONS_PENDING'};
 if(!near(r.totalDamage,r.characterContributions.reduce((s,c)=>s+c.damage,0))||!near(r.teamTotal,r.characterContributions.reduce((s,c)=>s+c.dps,0)))return {status:'PENDING',reason:'SAME_RUN_DAMAGE_MISMATCH'};
 if(!Array.isArray(r.events)||r.events.length>1200||!r.events.every(e=>text(e.id)&&text(e.name)&&TRACKS.some(t=>t.id===e.track)&&validNumber(e.atSeconds)&&e.atSeconds<=r.durationSeconds+1e-6&&r.rotation.characterIds.includes(e.characterId)&&text(e.kind)&&e.runIdentity===r.runIdentity)||new Set(r.events.map(e=>e.id)).size!==r.events.length)return {status:'PENDING',reason:'EVENT_TIMELINE_INVALID'};
 if(!r.coverage||!TRACKS.every(t=>['EXPOSED','PARTIAL','NOT_EXPOSED'].includes(r.coverage[t.id])))return {status:'PENDING',reason:'COVERAGE_PENDING'};
 return r;
}
const d=typeof document==='undefined'?null:document;
if(typeof window!=='undefined'&&d){
 const $=id=>d.getElementById(id);
 const format=n=>n.toLocaleString('sv-SE',{maximumFractionDigits:2});
 const set=(el,value)=>{el.textContent=String(value);return el;};
 const status=(message,error=false)=>{set($('connection'),message);$('connection').classList.toggle('error',error);};
 const post=async body=>{
  const res=await fetch('../local-review/dps-lab',{method:'POST',headers:{'content-type':'application/json','x-bellibing-review':'1'},body:JSON.stringify(body)});
  if(!res.ok)throw Error('HTTP_'+res.status);
  return res.json();
 };
 let presets=[];
 const memberView=preset=>{
  $('members').replaceChildren();
  for(const id of preset?.characterIds||[]){
   const card=d.createElement('div');card.className='member';
   const name=d.createElement('strong');set(name,id);
   const note=d.createElement('small');set(note,'Source-native reference build • Utrustningsdetaljer inte exponerade');
   card.append(name,note);$('members').append(card);
  }
 };
 const renderTracks=(run)=>{
  $('tracks').replaceChildren();$('ruler').replaceChildren();
  const seconds=run?.durationSeconds||0;
  if(seconds){
   for(let i=0;i<=4;i++){
    const tick=d.createElement('span');tick.className='tick';tick.style.left=(i*25)+'%';set(tick,format(seconds*i/4)+'s');$('ruler').append(tick);
   }
  }
  for(const track of TRACKS){
   const row=d.createElement('div');row.className='track';
   const label=d.createElement('div');label.className='track-label';set(label,track.name);
   const note=d.createElement('small');set(note,run?run.coverage[track.id]:'Ingen körning');
   label.append(note);
   const lane=d.createElement('div');lane.className='track-lane';
   const events=run?.events.filter(e=>e.track===track.id)||[];
   if(!events.length){
    const empty=d.createElement('div');empty.className='empty';
    set(empty,run?.coverage[track.id]==='NOT_EXPOSED'?'Motorn exponerar inte detta spår ännu.':'Inga exponerade händelser.');
    lane.append(empty);
   }
   for(const event of events){
    const btn=d.createElement('button');btn.className='event '+track.id;btn.type='button';
    btn.style.left=Math.min(97,event.atSeconds/seconds*100)+'%';
    btn.style.top=(10+(events.indexOf(event)%3)*27)+'px';
    set(btn,event.name);btn.title=event.name+' • '+format(event.atSeconds)+' s';
    btn.onclick=()=>{
     for(const old of d.querySelectorAll('.event.active'))old.classList.remove('active');
     btn.classList.add('active');
     const details=$('selected');details.replaceChildren();
     const title=d.createElement('strong');set(title,event.name);details.append(title);
     for(const [label,value] of [['Tid',format(event.atSeconds)+' s'],['Karaktär',event.characterId],['Typ',event.kind],['Status',event.note||'Native event']]){
      const line=d.createElement('div');set(line,label+': '+value);details.append(line);
     }
     if(validNumber(event.damage)){const line=d.createElement('div');set(line,'Native action-medelskada: '+format(event.damage));details.append(line);}
     else{const line=d.createElement('div');set(line,'Skada per handling: ej exponerad / ej attribuerad');details.append(line);}
     if(validNumber(event.concertoBefore)&&validNumber(event.concertoAfter)){
      const line=d.createElement('div');set(line,'Concerto (native snapshot): '+format(event.concertoBefore)+' → '+format(event.concertoAfter));details.append(line);
     }
    };lane.append(btn);
   }
   row.append(label,lane);$('tracks').append(row);
  }
 };
 const reset=()=>{
  set($('damage'),'—');set($('duration'),'—');set($('dps'),'—');
  set($('shares'),'Ingen körning än.');set($('selected'),'Klicka på en händelse.');
  set($('clock'),'— s');renderTracks(null);
 };
 const render=run=>{
  set($('damage'),format(run.totalDamage));set($('duration'),format(run.durationSeconds)+' s');set($('dps'),format(run.teamTotal));set($('clock'),format(run.durationSeconds)+' s');
  $('shares').replaceChildren();
  for(const c of run.characterContributions){
   const line=d.createElement('div');line.className='share';
   const id=d.createElement('span');set(id,c.characterId);
   const value=d.createElement('strong');set(value,format(c.damage)+' dmg · '+format(c.dps)+' DPS');
   line.append(id,value);$('shares').append(line);
  }
  set($('coverage'),run.explanation||'Händelsespåren visar endast de data som native-motorn faktiskt exponerade.');
  set($('selected'),'Klicka på en händelse. Exakt hit → action / buff attribution är ännu Pending.');
  renderTracks(run);
 };
 const populate=reply=>{
  if(reply?.protocol!=='BELLIBING_DPS_LAB_V1'||reply.result?.status!=='AVAILABLE'||!Array.isArray(reply.result.presets))throw Error('INVALID_PRESETS');
  presets=reply.result.presets.filter(p=>text(p.id)&&Array.isArray(p.characterIds)&&p.characterIds.length===3&&p.characterIds.every(text));
  $('rotation').replaceChildren();
  for(const p of presets){const opt=d.createElement('option');opt.value=p.id;set(opt,p.label||p.id);$('rotation').append(opt);}
  $('rotation').disabled=!presets.length;$('run').disabled=!presets.length;
  memberView(presets[0]);status(presets.length+' source-native presets från privat motor (lokal utvecklingskörning).');
 };
 $('rotation').addEventListener('change',()=>{reset();memberView(presets.find(p=>p.id===$('rotation').value));});
 $('run').addEventListener('click',async()=>{
  reset();$('run').disabled=true;status('Beräknar verklig native rotation…');
  try{
   const raw=await post({action:'run',presetId:$('rotation').value}),run=normalizeDpsLab(raw);
   if(run.status!=='EXPERIMENTAL'){status('PENDING: '+run.reason,true);set($('coverage'),'Ingen siffra visas utan giltig samma-körning-verifiering.');return;}
   render(run);status('Native replay klar · EXPERIMENTAL, inte gameplay-kvalificerad.');
  }catch(error){status('PENDING: lokal privat beräkningsmotor saknas eller svarar inte ('+error.message+').',true);}
  finally{$('run').disabled=false;}
 });
 reset();
 post({action:'list'}).then(populate).catch(()=>{set($('rotation'),'');$('rotation').replaceChildren();const option=d.createElement('option');set(option,'Privat lokal motor ej ansluten');$('rotation').append(option);status('PENDING: Starta projektets lokala HTTP-review med privat motor-checkout. Ingen demo eller påhittad DPS visas.',true);});
}
