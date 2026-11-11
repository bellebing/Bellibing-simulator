// PUBLIC PRESENTATION ONLY. One private native run is the sole source of facts.
// No guessed animation end, buff expiry, summon lifetime or damage attribution.
export const TRACKS=Object.freeze([
 {id:'onField',name:'On-field Rotation'},
 {id:'swap',name:'Intro / Outro / Swap'},
 {id:'buffs',name:'Active Buffs'},
 {id:'offField',name:'Off-field / Coordinated'}
]);
const validNumber=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
const text=s=>typeof s==='string'&&s.length>0&&s.length<=256;
const near=(a,b)=>Math.abs(a-b)<=1e-6*Math.max(1,Math.abs(a),Math.abs(b));
const trackIds=new Set(TRACKS.map(t=>t.id));
const pending=reason=>({status:'PENDING',reason});

export function normalizeDpsLab(reply){
 const r=reply?.protocol==='BELLIBING_DPS_LAB_V1'?reply.result:null;
 if(!r||r.status!=='EXPERIMENTAL')return pending(r?.reason||'PRIVATE_NATIVE_REVIEW_UNAVAILABLE');
 if(!text(r.runIdentity)||!validNumber(r.durationSeconds)||r.durationSeconds<=0||!validNumber(r.teamTotal)||!validNumber(r.totalDamage)||!near(r.teamTotal*r.durationSeconds,r.totalDamage))return pending('RESULT_IDENTITY_OR_TOTAL_MISMATCH');
 if(!r.rotation||!text(r.rotation.id)||!Array.isArray(r.rotation.characterIds)||r.rotation.characterIds.length!==3||new Set(r.rotation.characterIds).size!==3||r.rotation.characterIds.some(id=>!text(id)))return pending('TEAM_IDENTITY_PENDING');
 if(!Array.isArray(r.characterContributions)||r.characterContributions.length!==3||!r.rotation.characterIds.every(id=>r.characterContributions.filter(c=>c.characterId===id&&validNumber(c.damage)&&validNumber(c.dps)&&near(c.damage/r.durationSeconds,c.dps)).length===1))return pending('MEMBER_CONTRIBUTIONS_PENDING');
 if(!near(r.totalDamage,r.characterContributions.reduce((s,c)=>s+c.damage,0))||!near(r.teamTotal,r.characterContributions.reduce((s,c)=>s+c.dps,0)))return pending('SAME_RUN_DAMAGE_MISMATCH');
 if(!Array.isArray(r.events)||r.events.length>1200||!r.events.every(e=>text(e.id)&&text(e.name)&&trackIds.has(e.track)&&validNumber(e.atSeconds)&&e.atSeconds<=r.durationSeconds+1e-6&&r.rotation.characterIds.includes(e.characterId)&&text(e.kind)&&e.runIdentity===r.runIdentity)||new Set(r.events.map(e=>e.id)).size!==r.events.length)return pending('EVENT_TIMELINE_INVALID');
 if(!r.coverage||!TRACKS.every(t=>['EXPOSED','PARTIAL','NOT_EXPOSED'].includes(r.coverage[t.id])))return pending('COVERAGE_PENDING');
 if(r.timeline!==undefined){
  const t=r.timeline;
  if(t?.version!=='BELLIBING_DPS_TIMELINE_V1'||t.runIdentity!==r.runIdentity||t.timebase!=='SOURCE_NATIVE_GAME_FRAMES_60_PER_SECOND'||!validNumber(t.originFrame)||!validNumber(t.dpsCycleSeconds)||!near(t.dpsCycleSeconds,r.durationSeconds)||!validNumber(t.visibleEndSeconds)||t.visibleEndSeconds<r.durationSeconds-1e-6||!(t.activeRotationSeconds===null||validNumber(t.activeRotationSeconds)))return pending('TIMELINE_CLOCK_INVALID');
  if(!Array.isArray(t.instants)||!Array.isArray(t.intervals)||!Array.isArray(t.links)||t.instants.length>2400||t.intervals.length>1600||t.links.length>3600||!Number.isSafeInteger(t.unlinkedHitCount)||t.unlinkedHitCount<0)return pending('TIMELINE_SHAPE_INVALID');
  if(t.unlinkedHitReasons!==undefined){
   const reasons=t.unlinkedHitReasons;
   const allowed=['FOLDED_MULTIHIT_CAST_ROW','PRIOR_CYCLE_CAST_OR_QUEUED_WINDOW',
    'ALREADY_CONSUMED_NUMERIC_MATCH','NO_SOURCE_SLOT_IN_TRACE','TRACE_TIMING_OR_AVERAGE_UNRESOLVED'];
   if(!reasons||typeof reasons!=='object'||Array.isArray(reasons)||
    Object.keys(reasons).some(key=>!allowed.includes(key))||
    !allowed.every(key=>Number.isSafeInteger(reasons[key])&&reasons[key]>=0)||
    allowed.reduce((s,key)=>s+reasons[key],0)!==t.unlinkedHitCount
   )return pending('HIT_GAP_DIAGNOSTICS_INVALID');
  }
  const prior=t.priorSources??[];
  if(!Array.isArray(prior)||prior.length>100||
     !prior.every(e=>text(e.id)&&text(e.name)&&e.runIdentity===r.runIdentity&&
      r.rotation.characterIds.includes(e.characterId)&&validNumber(e.atFrame)&&e.atFrame<t.originFrame&&
      e.kind==='NATIVE_BUFF_CAUSE'&&e.sourceCycle==='PRIOR_TO_SELECTED_CYCLE'))return pending('TIMELINE_PRIOR_CAUSE_INVALID');
  const validBase=e=>text(e.id)&&text(e.type)&&text(e.name)&&trackIds.has(e.track)&&r.rotation.characterIds.includes(e.characterId)&&e.runIdentity===r.runIdentity;
  if(!t.instants.every(e=>validBase(e)&&validNumber(e.atSeconds)&&e.atSeconds<=t.visibleEndSeconds+1e-6&&(e.damage===undefined||validNumber(e.damage))))return pending('TIMELINE_INSTANT_INVALID');
  if(!t.intervals.every(e=>validBase(e)&&validNumber(e.startSeconds)&&validNumber(e.endSeconds)&&e.endSeconds>e.startSeconds&&e.endSeconds<=t.visibleEndSeconds+1e-6&&text(e.sourceEventId)))return pending('TIMELINE_INTERVAL_INVALID');
  // A buff is an independent effect, not an action's animation. A carry-in
  // block begins at visual x=0 but preserves its actual older native start.
  for(const b of t.intervals.filter(e=>e.type==='NATIVE_BUFF_LIFECYCLE')){
   if(b.track!=='buffs'||!['CHARACTER_ABILITY','WEAPON','ECHO','SONATA','PASSIVE','OTHER_NATIVE'].includes(b.originKind)||
    !text(b.originName)||!text(b.sourceAction)||!text(b.sourceGear)||!text(b.activationCondition)||
    !r.rotation.characterIds.includes(b.sourceCharacterId)||!r.rotation.characterIds.includes(b.triggerCharacterId)||b.characterId!==b.sourceCharacterId||
    !['TEAM','MEMBER'].includes(b.recipientKind)||!Array.isArray(b.recipients)||
    b.recipients.length<1||b.recipients.length>3||new Set(b.recipients).size!==b.recipients.length||
    !b.recipients.every(x=>r.rotation.characterIds.includes(x))||
    (b.recipientKind==='TEAM'&&b.recipients.length!==3)||
    (b.recipientKind==='MEMBER'&&b.recipients.length!==1)||
    !validNumber(b.activationFrame)||!validNumber(b.expirationFrame)||b.expirationFrame<=b.activationFrame||
    !validNumber(b.cycleOriginFrame)||!near(b.cycleOriginFrame,t.originFrame)||
    b.carryIn!==(b.activationFrame<t.originFrame)||
    !near(b.startSeconds,Math.max(0,(b.activationFrame-t.originFrame)/60))||
    !near(b.endSeconds,(b.expirationFrame-t.originFrame)/60)||
    !['DURATION_EXPIRED','NATIVE_REVOKED_OR_CONSUMED'].includes(b.endReason)||
    !(b.endCauseAction===null||text(b.endCauseAction))||
    !Array.isArray(b.refreshes)||b.refreshes.length>100||!b.refreshes.every(x=>validNumber(x.atFrame)&&validNumber(x.expiresAtFrame)&&x.expiresAtFrame>x.atFrame&&x.atFrame>=b.activationFrame&&x.atFrame<=b.expirationFrame&&
      (x.viaAction===null||text(x.viaAction)))||
    !Array.isArray(b.nativeDamageActionIds)||b.nativeDamageActionIds.length>500||
    !Array.isArray(b.nativeMatchedHitIds)||b.nativeMatchedHitIds.length>500||
    !Array.isArray(b.effectRows)||b.effectRows.length>8||
    !b.effectRows.every(x=>typeof x.stat==='string'&&x.stat.length<=80&&Number.isFinite(x.value))
   )return pending('BUFF_LIFECYCLE_INVALID');
  }
  const objects=[...t.instants,...t.intervals,...prior],ids=new Set(objects.map(e=>e.id));
  if(ids.size!==objects.length||!t.intervals.every(e=>
      e.type==='NATIVE_BUFF_LIFECYCLE'?objects.some(i=>i.id===e.sourceEventId):t.instants.some(i=>i.id===e.sourceEventId))||
   !t.instants.every(e=>!e.sourceEventId||ids.has(e.sourceEventId))||
   !t.links.every(l=>ids.has(l.fromId)&&ids.has(l.toId)&&l.fromId!==l.toId&&
    ['CLOCK_SPAN_OF_ACTION','NATIVE_HIT_MATCH','NATIVE_BUFF_ACTIVATED','NATIVE_BUFF_STAT_APPLIED'].includes(l.relation)))return pending('TIMELINE_CAUSALITY_INVALID');
  if(!t.intervals.filter(e=>e.type==='NATIVE_BUFF_LIFECYCLE').every(b=>
    t.links.some(l=>l.fromId===b.sourceEventId&&l.toId===b.id&&l.relation==='NATIVE_BUFF_ACTIVATED')&&
    b.nativeDamageActionIds.every(id=>t.instants.some(i=>i.id===id&&i.type==='NATIVE_ACTION_START')&&
      t.links.some(l=>l.fromId===b.id&&l.toId===id&&l.relation==='NATIVE_BUFF_STAT_APPLIED'))&&
    b.nativeMatchedHitIds.every(id=>t.instants.some(i=>i.id===id&&i.type==='NATIVE_DAMAGE_LANDING'&&b.nativeDamageActionIds.includes(i.sourceEventId)))
  ))return pending('BUFF_CAUSE_OR_HIT_PROOF_INVALID');
  if(!r.events.every(e=>t.instants.some(i=>i.id===e.id&&near(i.atSeconds,e.atSeconds)&&i.track===e.track)))return pending('TIMELINE_EVENT_MISMATCH');
  const derivedEnd=Math.max(r.durationSeconds,...t.instants.map(e=>e.atSeconds),...t.intervals.map(e=>e.endSeconds));
  if(!near(derivedEnd,t.visibleEndSeconds))return pending('TIMELINE_VISIBLE_END_MISMATCH');
 }
 return r;
}

// Pure view adapter. Old V0 results remain points, NEVER fabricated intervals.
export function timelineView(run,requestedWindow=0){
 const t=run.timeline??{version:'LEGACY_POINTS_ONLY',instants:run.events.map(e=>({...e,type:'NATIVE_ACTION_START'})),intervals:[],links:[],unlinkedHitCount:0,visibleEndSeconds:run.durationSeconds,dpsCycleSeconds:run.durationSeconds,activeRotationSeconds:null};
 return {...t,displayEndSeconds:Math.max(t.visibleEndSeconds,requestedWindow===60?60:0)};
}

// Deterministic lane packing: exact game-clock x and exact interval width.
// The extra width here is LABEL COLLISION ONLY; it never changes block geometry.
export function placeTimelineObjects(instants,intervals,pixelsPerSecond){
 const all=[
  ...instants.map(e=>({data:e,shape:'point',x:e.atSeconds*pixelsPerSecond,width:0})),
  ...intervals.map(e=>({data:e,shape:'interval',x:e.startSeconds*pixelsPerSecond,width:(e.endSeconds-e.startSeconds)*pixelsPerSecond}))
 ].sort((a,b)=>a.x-b.x||(a.shape==='interval'?-1:1));
 const until=[];
 for(const item of all){
  const left=item.shape==='point'?item.x-9:item.x;
  const right=item.shape==='point'?item.x+10:item.x+Math.max(12,item.width);
  let row=until.findIndex(x=>x+5<=left);
  if(row<0){row=until.length;until.push(right);}else until[row]=right;
  item.row=row;
 }
 return {items:all,rows:Math.max(1,until.length)};
}

const d=typeof document==='undefined'?null:document;
if(typeof window!=='undefined'&&d){
 const $=id=>d.getElementById(id),format=n=>n.toLocaleString('sv-SE',{maximumFractionDigits:2});
 const set=(el,value)=>{el.textContent=String(value);return el;};
 const status=(message,error=false)=>{set($('connection'),message);$('connection').classList.toggle('error',error);};
 const post=async body=>{
  const res=await fetch('../local-review/dps-lab',{method:'POST',headers:{'content-type':'application/json','x-bellibing-review':'1'},body:JSON.stringify(body)});
  if(!res.ok)throw Error('HTTP_'+res.status);
  return res.json();
 };
 const make=(tag,cls,contents)=>{const el=d.createElement(tag);if(cls)el.className=cls;if(contents!==undefined)set(el,contents);return el;};
 let presets=[],currentRun=null;
 const memberView=preset=>{
  $('members').replaceChildren();
  for(const id of preset?.characterIds||[]){
   const card=make('div','member');card.append(make('strong','',id),make('small','','Source-native reference build · exakt utrustningslista ej exponerad'));$('members').append(card);
  }
 };
 const detailRow=(container,key,value)=>{
  const row=make('div','detail-row');row.append(make('span','detail-key',key+':'),d.createTextNode(String(value)));container.append(row);
 };
 const showDetails=(item,t)=>{
  const panel=$('selected');panel.replaceChildren();panel.append(make('strong','',item.name));
  detailRow(panel,'Objekt',item.type);
  detailRow(panel,'Karaktär',item.characterId);
  if('atSeconds' in item)detailRow(panel,'Tidpunkt',format(item.atSeconds)+' s');
  if('startSeconds' in item){detailRow(panel,'Start',format(item.startSeconds)+' s');detailRow(panel,'Slut',format(item.endSeconds)+' s');detailRow(panel,'Klockintervall',format(item.endSeconds-item.startSeconds)+' s');}
  if(item.kind)detailRow(panel,'Native typ',item.kind);
  if(item.type==='NATIVE_BUFF_LIFECYCLE'){
   detailRow(panel,'Effektursprung',item.originKind+' · '+item.originName);
   detailRow(panel,'Utlösande handling',item.sourceAction+' · '+item.triggerCharacterId);
   detailRow(panel,'Native villkor',item.activationCondition);
   detailRow(panel,'Aktivering (global frame)',item.activationFrame);
   detailRow(panel,'Avslutning (global frame)',item.expirationFrame);
   detailRow(panel,'Orsak till avslutning',item.endReason+(item.endCauseAction?' · '+item.endCauseAction:''));
   detailRow(panel,'Omfattning',item.recipientKind+' · '+item.recipients.join(', '));
   detailRow(panel,'Överförd från tidigare cykel',item.carryIn?'JA · originalstart bevarad':'Nej');
   detailRow(panel,'Native refresh',item.refreshes.length?item.refreshes.map(x=>x.atFrame+' → '+x.expiresAtFrame+' ('+(x.viaAction||'okänd')+')').join('; '):'Ingen');
   detailRow(panel,'Verifierade statbidrag',item.effectRows.length?item.effectRows.map(x=>x.stat+' = '+x.value).join('; '):'PENDING · inga i aktuell cykel');
   detailRow(panel,'Påverkade native actions',item.nativeDamageActionIds.length);
   detailRow(panel,'Entydigt länkade hit records',item.nativeMatchedHitIds.length+' · övrig hit-attribution PENDING');
  }
  detailRow(panel,'Mottagare',item.targetId||'PENDING · inte exponerad');
  if(item.damage!==undefined)detailRow(panel,item.type==='NATIVE_DAMAGE_LANDING'?'Hit ledger-skada':'Action-medelskada',format(item.damage));
  if(item.concertoBefore!==undefined)detailRow(panel,'Concerto snapshot',format(item.concertoBefore)+' → '+format(item.concertoAfter));
  if(item.sourceEventId){
   const source=t.instants.find(e=>e.id===item.sourceEventId)||t.priorSources?.find(e=>e.id===item.sourceEventId);
   detailRow(panel,'Orsak / källa',source?source.name+' ('+source.id+')':'PENDING');
  }else detailRow(panel,'Verifierat parent-event','PENDING');
  if(item.note)detailRow(panel,'Begränsning',item.note);
  const outgoing=t.links.filter(l=>l.fromId===item.id);
  if(outgoing.length)detailRow(panel,'Relaterade objekt',outgoing.map(l=>l.toId+' ['+l.relation+']').join(', '));
  detailRow(panel,'Körningsidentitet',item.runIdentity.slice(0,12)+'…');
 };
 const renderTracks=run=>{
  const scroller=$('timeline-scroll'),oldScroll=scroller.scrollLeft;
  const root=$('timeline-inner');root.replaceChildren();
  const t=run?timelineView(run,Number($('window').value)):null;
  const seconds=t?.displayEndSeconds||30;
  const pxPerSecond=Math.max(27,680/seconds),width=Math.ceil(seconds*pxPerSecond);
  const tickEvery=seconds>90?10:seconds>28?5:2;
  const ticks=[0];for(let value=tickEvery;value<seconds-1e-6;value+=tickEvery)ticks.push(value);
  if(seconds>0)ticks.push(seconds);
  const makeRow=(label,caption,axis=false)=>{
   const row=make('div','timeline-row'+(axis?' axis-row':''));
   const side=make('div','row-label',label);side.append(make('small','',caption));
   const plot=make('div',axis?'plot axis-plot':'plot lane-plot');plot.style.width=width+'px';
   row.append(side,plot);root.append(row);return plot;
  };
  const ruler=makeRow('MASTER','Native cycle-relative spelklocka',true);
  for(const value of ticks){
   const x=value*pxPerSecond;
   const mark=make('span','tick'+(near(value,0)?' first':'')+(near(value,seconds)?' last':''),format(value)+'s');
   mark.style.left=x+'px';ruler.append(mark);
  }
  const cycleEnd=t?.dpsCycleSeconds??0;
  if(cycleEnd>0&&cycleEnd<seconds-1e-6){
   const line=make('div','time-guide cycle-end');line.style.left=cycleEnd*pxPerSecond+'px';ruler.append(line);
   const badge=make('span','cycle-flag','DPS-cykel');badge.style.left=cycleEnd*pxPerSecond+'px';ruler.append(badge);
  }
  for(const track of TRACKS){
   const events=t?.instants.filter(e=>e.track===track.id)||[];
   const spans=t?.intervals.filter(e=>e.track===track.id)||[];
   const plot=makeRow(track.name,run?.coverage[track.id]||'PENDING');
   const layout=placeTimelineObjects(events,spans,pxPerSecond);
   plot.style.height=Math.max(61,layout.rows*25+24)+'px';
   for(const value of ticks){
    const guide=make('div','time-guide');guide.style.left=value*pxPerSecond+'px';plot.append(guide);
   }
   if(cycleEnd>0&&cycleEnd<seconds-1e-6){
    const guide=make('div','time-guide cycle-end');guide.style.left=cycleEnd*pxPerSecond+'px';plot.append(guide);
   }
   if(!layout.items.length){
    const notice=run?.coverage[track.id]==='NOT_EXPOSED'?'NOT_EXPOSED · Native motorn exponerar inget verifierat intervall för detta spår.':
     run?'Inga verifierade objekt i denna native-cykel.':'Kör en native rotation.';
    plot.append(make('div','empty',notice));continue;
   }
   for(const entry of layout.items){
    const item=entry.data,btn=make('button','timeline-item '+entry.shape+' '+track.id+(item.type==='NATIVE_DAMAGE_LANDING'?' hit':''));
    btn.type='button';btn.dataset.eventId=item.id;btn.dataset.shape=entry.shape;
    btn.style.left=entry.x+'px';btn.style.top=(entry.row*25+16)+'px';
    const when=entry.shape==='point'?format(item.atSeconds)+' s':format(item.startSeconds)+'–'+format(item.endSeconds)+' s';
    btn.setAttribute('aria-label',item.name+' · '+when+' · '+track.name);
    btn.title=item.name+' · '+when;
    if(entry.shape==='interval'){
     btn.style.width=entry.width+'px';if(entry.width<30)btn.classList.add('short');
     set(btn,item.name);
    }else btn.append(make('span','tag',item.name));
    btn.onclick=()=>{
     root.querySelectorAll('.timeline-item.selected').forEach(el=>el.classList.remove('selected'));
     btn.classList.add('selected');showDetails(item,t);
    };
    plot.append(btn);
   }
  }
  scroller.scrollLeft=oldScroll;
 };
 const reset=()=>{
  currentRun=null;
  for(const id of ['damage','duration','dps','visible-end'])set($(id),'—');
  set($('active-duration'),'PENDING');
  set($('shares'),'Ingen körning än.');set($('selected'),'Klicka på en punkt eller ett block.');
  set($('clock'),'— s');renderTracks(null);
 };
 const render=run=>{
  currentRun=run;const t=timelineView(run,Number($('window').value));
  set($('damage'),format(run.totalDamage));set($('duration'),format(run.durationSeconds)+' s');set($('dps'),format(run.teamTotal));
  set($('active-duration'),t.activeRotationSeconds===null?'PENDING · ej exponerad':format(t.activeRotationSeconds)+' s');
  set($('visible-end'),format(t.displayEndSeconds)+' s');
  set($('clock'),'0–'+format(t.displayEndSeconds)+' s');
  $('shares').replaceChildren();
  for(const c of run.characterContributions){
   const line=make('div','share');line.append(make('span','',c.characterId),make('strong','',format(c.damage)+' dmg · '+format(c.dps)+' DPS'));$('shares').append(line);
  }
  set($('coverage'),(run.explanation||'Endast native-exponerad data.')+
   (t.intervals.some(x=>x.type==='NATIVE_BUFF_LIFECYCLE')?' · Buff-spåret visar endast källverifierade effektinstanser.':' · Fullständiga buff-livscykler Pending.')+
   (t.unlinkedHitCount?' · '+t.unlinkedHitCount+' native HitRecords saknar garanterat action-ID. Typning: '+
    (t.unlinkedHitReasons?Object.entries(t.unlinkedHitReasons).filter(([_,n])=>n>0).map(([k,n])=>k+'='+n).join(', '):'PENDING')+'.':''));
  set($('selected'),'Klicka på native action, träff eller buff för att se ursprung → orsak → effekter. Ej verifierade buffs/summons är Pending.');
  renderTracks(run);
 };
 const populate=reply=>{
  if(reply?.protocol!=='BELLIBING_DPS_LAB_V1'||reply.result?.status!=='AVAILABLE'||!Array.isArray(reply.result.presets))throw Error('INVALID_PRESETS');
  presets=reply.result.presets.filter(p=>text(p.id)&&Array.isArray(p.characterIds)&&p.characterIds.length===3&&p.characterIds.every(text));
  $('rotation').replaceChildren();
  for(const p of presets){const opt=make('option','',p.label||p.id);opt.value=p.id;$('rotation').append(opt);}
  $('rotation').disabled=!presets.length;$('run').disabled=!presets.length;
  memberView(presets[0]);status(presets.length+' source-native presets tillgängliga från privat lokal motor.');
 };
 $('window').addEventListener('change',()=>{if(currentRun)render(currentRun);else renderTracks(null);});
 $('rotation').addEventListener('change',()=>{reset();memberView(presets.find(p=>p.id===$('rotation').value));});
 $('run').addEventListener('click',async()=>{
  reset();$('run').disabled=true;status('Beräknar native rotation och klockhändelser…');
  try{
   const reply=await post({action:'run',presetId:$('rotation').value});
   const run=normalizeDpsLab(reply);
   if(run.status!=='EXPERIMENTAL'){status('PENDING: '+run.reason,true);set($('coverage'),'Samma-körning-verifiering saknas. DPS visas inte.');return;}
   render(run);status('Native replay klar · EXPERIMENTAL; verifierade buffkedjor kan visas, övriga är Pending.');
  }catch(error){status('PENDING: lokal privat motor ej tillgänglig ('+error.message+').',true);}
  finally{$('run').disabled=!presets.length;}
 });
 reset();
 post({action:'list'}).then(populate).catch(()=>{
  $('rotation').replaceChildren(make('option','','Privat lokal motor ej ansluten'));
  status('PENDING: starta lokal HTTP-review med privat engine-checkout. Ingen demodata visas.',true);
 });
}
