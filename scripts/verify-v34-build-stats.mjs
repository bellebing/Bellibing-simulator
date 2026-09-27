import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const UI_URL=process.env.BELLIBING_V34_URL??'http://127.0.0.1:4173/ui-preview/';
const DEBUG_PORT=Number(process.env.BELLIBING_V34_CHROME_DEBUG_PORT??9672);
const CHROME=process.env.CHROME_BIN??'google-chrome';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const assert=(condition,message,detail)=>{if(!condition)throw new Error(message+(detail===undefined?'':': '+JSON.stringify(detail)))};

async function waitForChrome(){
  const deadline=Date.now()+15000;
  while(Date.now()<deadline){
    try{const response=await fetch('http://127.0.0.1:'+DEBUG_PORT+'/json/version');if(response.ok)return}catch{}
    await sleep(120);
  }
  throw new Error('Timed out waiting for Chrome DevTools.');
}

async function createPage(){
  const response=await fetch('http://127.0.0.1:'+DEBUG_PORT+'/json/new?'+encodeURIComponent('about:blank'),{method:'PUT'});
  if(!response.ok)throw new Error('Failed to create Chrome page: '+response.status);
  return response.json();
}

function cdp(wsUrl){
  const socket=new WebSocket(wsUrl);let serial=0;const pending=new Map();
  const opened=new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
  socket.addEventListener('message',event=>{
    const message=JSON.parse(String(event.data));if(!message.id)return;
    const waiter=pending.get(message.id);if(!waiter)return;pending.delete(message.id);
    if(message.error)waiter.reject(new Error(message.error.message));else waiter.resolve(message.result);
  });
  async function send(method,params={}){
    await opened;const id=++serial;
    const answer=new Promise((resolve,reject)=>pending.set(id,{resolve,reject}));
    socket.send(JSON.stringify({id,method,params}));return answer;
  }
  return{socket,send};
}

async function evaluate(send,expression){
  const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
  if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description??result.exceptionDetails.text??'Runtime evaluation failed');
  return result.result?.value;
}

async function waitFor(send,expression,message,timeout=8000){
  const deadline=Date.now()+timeout;
  while(Date.now()<deadline){if(await evaluate(send,expression))return;await sleep(60)}
  throw new Error(message);
}

async function navigate(send){
  await send('Page.navigate',{url:UI_URL});
  const deadline=Date.now()+20000;let externalNoticeOpened=false;
  while(Date.now()<deadline){
    const state=await evaluate(send,"(() => ({ready:document.readyState==='complete'&&document.querySelectorAll('#homeStage .home-card').length===3,externalNotice:document.title==='External Content Notice | rawgit.hack'&&!!document.querySelector('.url-action-button')}))()");
    if(state.ready)return;
    if(state.externalNotice&&!externalNoticeOpened){
      const bounds=await evaluate(send,"document.querySelector('.url-action-button').getBoundingClientRect().toJSON()");
      const x=bounds.x+bounds.width/2,y=bounds.y+bounds.height/2;
      await send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});
      await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
      await sleep(35);
      await send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});
      externalNoticeOpened=true;await sleep(600);continue;
    }
    await sleep(100);
  }
  throw new Error('Build Stats UI preview did not become ready.');
}

async function centerOf(send,selector){
  const selectorJson=JSON.stringify(selector);
  const bounds=await evaluate(send,"(() => {const el=document.querySelector("+selectorJson+");if(!el)throw new Error('Missing pointer target');const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,innerWidth,innerHeight}})()");
  assert(bounds.width>0&&bounds.height>0&&bounds.x<bounds.innerWidth&&bounds.y<bounds.innerHeight&&bounds.x+bounds.width>0&&bounds.y+bounds.height>0,'Pointer target is not visible',{selector,bounds});
  return{x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2};
}

async function pointerClick(send,selector){
  const point=await centerOf(send,selector);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:point.x,y:point.y});
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1});
  await sleep(30);
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x,y:point.y,button:'left',clickCount:1});
  await sleep(90);
}

async function statsSnapshot(send){
  return evaluate(send,"(() => {const rows=[...document.querySelectorAll('#buildStatsRows .build-stat-row')];const map=Object.fromEntries(rows.map(row=>[row.dataset.statKey,{raw:row.querySelector('.build-stat-value')?.dataset.raw??null,text:row.querySelector('.build-stat-value')?.textContent.trim()??'',label:row.querySelector('.build-stat-label')?.textContent.trim()??'',hidden:row.hidden,icon:row.querySelector('.build-stat-icon')?.getAttribute('src')??null,loaded:row.querySelector('.build-stat-icon')?.naturalWidth??0}]));return{character:statsUi.characterId,expanded:statsUi.expanded,ready:document.getElementById('buildStatsBlock')?.dataset.ready??null,toggle:document.getElementById('buildStatsToggle')?.textContent.trim()??'',rows:map,projection:statsUi.lastProjection?JSON.parse(JSON.stringify(statsUi.lastProjection)):null,weaponId:buildPicker.selected?draft(buildPicker.selected).build.weaponId??null:null,echoSlots:buildPicker.selected?(readEchoSets(buildPicker.selected).sets[readEchoSets(buildPicker.selected).activeSetId]?.slots??[]):[]}})()");
}

async function geometry(send){
  return evaluate(send,"(() => {const side=document.querySelector('.side-left').getBoundingClientRect(),stats=document.getElementById('buildStatsBlock').getBoundingClientRect(),panel=document.getElementById('buildStatsPanel').getBoundingClientRect(),skillsBlock=document.getElementById('skillsBlock').getBoundingClientRect(),skills=document.getElementById('skillsBtn').getBoundingClientRect(),weaponBlock=document.getElementById('weaponBtn').closest('.block').getBoundingClientRect(),weapon=document.getElementById('weaponBtn').getBoundingClientRect();return{side:side.toJSON(),stats:stats.toJSON(),panel:panel.toJSON(),skillsBlock:skillsBlock.toJSON(),skills:skills.toJSON(),weaponBlock:weaponBlock.toJSON(),weapon:weapon.toJSON(),innerWidth,innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight}})()");
}

function raw(snapshot,key){const value=Number(snapshot.rows[key]?.raw);return Number.isFinite(value)?value:NaN}
const near=(a,b,tolerance=1e-9)=>Number.isFinite(a)&&Math.abs(a-b)<=tolerance;

async function assertAugustaBase(send){
  const state=await statsSnapshot(send);
  assert(state.ready==='true'&&state.character==='augusta'&&state.projection,'Augusta Build Stats did not become ready',state);
  assert(near(raw(state,'hp'),10300),'Augusta HP base projection mismatch',state.rows.hp);
  assert(near(raw(state,'atk'),518.56),'Augusta ATK intrinsic projection mismatch',state.rows.atk);
  assert(near(raw(state,'def'),1112),'Augusta DEF base projection mismatch',state.rows.def);
  assert(near(raw(state,'energyRegen'),1),'Augusta Energy Regen base mismatch',state.rows.energyRegen);
  assert(near(raw(state,'critRate'),.13),'Augusta CRIT Rate intrinsic projection mismatch',state.rows.critRate);
  assert(near(raw(state,'critDamage'),1.5),'Augusta CRIT DMG base mismatch',state.rows.critDamage);
  assert(state.rows.hp.text==='10,300'&&state.rows.energyRegen.text==='100%'&&state.rows.critRate.text==='13%'&&state.rows.critDamage.text==='150%','Primary Build Stats display formatting mismatch',state.rows);
  assert(Object.values(state.rows).every(row=>row.icon?.startsWith('assets/builder-icons/stats/')&&row.loaded>0),'Canonical stat icon binding/load failed',state.rows);
  assert(state.rows.elementDamageBonus.label==='Electro DMG Bonus','Character element stat label did not follow Augusta',state.rows.elementDamageBonus);
  assert(near(raw(state,'elementDamageBonus'),0)&&near(raw(state,'basicAttackDamageBonus'),0)&&near(raw(state,'heavyAttackDamageBonus'),0)&&near(raw(state,'resonanceSkillDamageBonus'),0)&&near(raw(state,'resonanceLiberationDamageBonus'),0)&&near(raw(state,'healingBonus'),0),'Unsupported/nonexistent bonuses leaked into unequipped Augusta stats',state.rows);
  const primaryKeys=['hp','atk','def','energyRegen','critRate','critDamage'];
  const extraKeys=['elementDamageBonus','basicAttackDamageBonus','heavyAttackDamageBonus','resonanceSkillDamageBonus','resonanceLiberationDamageBonus','healingBonus'];
  assert(primaryKeys.every(key=>state.rows[key]&&!state.rows[key].hidden)&&extraKeys.every(key=>state.rows[key]?.hidden),'Collapsed Stats row visibility contract failed',state.rows);
  assert(state.toggle==='More stats ▾'&&!state.expanded,'Collapsed Stats toggle state failed',state);
  return state;
}

async function capture(send,path){
  mkdirSync('artifacts',{recursive:true});
  const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
  writeFileSync(path,Buffer.from(shot.data,'base64'));
}

const userDir='/tmp/bellibing-build-stats-'+process.pid+'-'+DEBUG_PORT;
const chrome=spawn(CHROME,['--headless=new','--no-sandbox','--disable-gpu','--remote-debugging-port='+DEBUG_PORT,'--remote-debugging-address=127.0.0.1','--user-data-dir='+userDir,'about:blank'],{stdio:'ignore'});

try{
  await waitForChrome();
  const page=await createPage();
  const{socket,send}=cdp(page.webSocketDebuggerUrl);
  await navigate(send);
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await evaluate(send,'localStorage.clear()');
  await navigate(send);
  await waitFor(send,"releasedCharacters.length===57&&document.documentElement.dataset.weaponCatalogReady==='true'&&document.documentElement.dataset.echoCatalogReady==='true'&&document.documentElement.dataset.buildStatsReady==='true'&&typeof window.bellibingProjectStaticBuildStats==='function'",'Build Stats / Character / Weapon / Echo runtime did not become ready',15000);

  const runtime=await evaluate(send,"(() => ({count:buildStatsCharacterById.size,iconCount:buildStatsIconByLabel.size,scopeSource:typeof window.bellibingProjectStaticBuildStats==='function',error:document.documentElement.dataset.buildStatsError||null}))()");
  assert(runtime.count===57&&runtime.iconCount===17&&runtime.scopeSource&&!runtime.error,'Build Stats runtime coverage failed',runtime);

  await evaluate(send,"show('build');buildPicker.select('Augusta')");
  await waitFor(send,"statsUi.characterId==='augusta'&&document.getElementById('buildStatsBlock').dataset.ready==='true'&&document.querySelectorAll('#buildStatsRows .build-stat-value[data-raw]').length===12",'Augusta Stats rows did not render');
  await waitFor(send,"!document.getElementById('build').classList.contains('major-enter')&&!document.getElementById('build').classList.contains('go')",'Build entrance did not settle',1800);
  await sleep(900);
  const base=await assertAugustaBase(send);

  const collapsedGeometry=await geometry(send);
  await pointerClick(send,'#buildStatsToggle');
  await waitFor(send,"statsUi.expanded===true&&document.querySelectorAll('#buildStatsRows .build-stat-row:not([hidden])').length===12",'More stats did not expand same Stats panel');
  const expanded=await statsSnapshot(send),expandedGeometry=await geometry(send);
  assert(expanded.toggle==='Less stats ▴'&&Object.values(expanded.rows).every(row=>!row.hidden),'Expanded Stats visibility/toggle failed',expanded);
  assert(expandedGeometry.skills.top>collapsedGeometry.skills.top+45,'Skills did not visibly move downward when Stats expanded',{collapsed:collapsedGeometry.skills,expanded:expandedGeometry.skills});
  assert(expandedGeometry.weapon.top>collapsedGeometry.weapon.top+45,'Weapon did not visibly move downward when Stats expanded',{collapsed:collapsedGeometry.weapon,expanded:expandedGeometry.weapon});
  assert(expandedGeometry.stats.bottom<=expandedGeometry.skillsBlock.top+1,'Expanded Stats overlaps Skills block',expandedGeometry);
  assert(expandedGeometry.skillsBlock.bottom<=expandedGeometry.weaponBlock.top+1,'Skills overlaps Weapon block',expandedGeometry);
  assert(expandedGeometry.side.top>=0&&expandedGeometry.side.bottom<=expandedGeometry.innerHeight-8,'Expanded Stats + Skills + Weapon do not fit 1440×900 viewport',expandedGeometry);
  assert(expandedGeometry.scrollWidth<=expandedGeometry.innerWidth+1&&expandedGeometry.scrollHeight<=expandedGeometry.innerHeight+1,'Expanded Stats caused page scroll at 1440×900',expandedGeometry);
  await capture(send,'artifacts/ui-preview-build-stats-expanded-1440x900.png');

  await pointerClick(send,'#buildStatsToggle');
  await waitFor(send,"statsUi.expanded===false",'Less stats did not collapse panel');
  const recollapsedGeometry=await geometry(send);
  assert(Math.abs(recollapsedGeometry.skills.top-collapsedGeometry.skills.top)<2,'Skills did not return upward after Stats collapse',{initial:collapsedGeometry.skills,after:recollapsedGeometry.skills});
  assert(Math.abs(recollapsedGeometry.weapon.top-collapsedGeometry.weapon.top)<2,'Weapon did not return upward after Stats collapse',{initial:collapsedGeometry.weapon,after:recollapsedGeometry.weapon});

  await evaluate(send,"buildPicker.select('Baizhi')");
  await waitFor(send,"statsUi.characterId==='baizhi'&&Math.abs(statsUi.lastProjection.hp-14350.56)<1e-9",'Character switch did not update Stats for Baizhi');
  let characterState=await statsSnapshot(send);
  assert(near(raw(characterState,'hp'),14350.56)&&near(raw(characterState,'atk'),213)&&near(raw(characterState,'def'),1002)&&near(raw(characterState,'healingBonus'),.12),'Baizhi source-backed Stats mismatch after Character switch',characterState);
  assert(characterState.rows.elementDamageBonus.label==='Glacio DMG Bonus','Element row did not update on Character switch',characterState.rows.elementDamageBonus);

  await evaluate(send,"buildPicker.select('Augusta')");
  await waitFor(send,"statsUi.characterId==='augusta'&&Math.abs(statsUi.lastProjection.atk-518.56)<1e-9",'Return to Augusta Stats failed');

  const beforeWeaponPreview=await statsSnapshot(send);
  await pointerClick(send,'#weaponBtn');
  await waitFor(send,"weaponUi.open&&!weaponUi.panelBusy&&document.getElementById('weaponOverlay').classList.contains('open')",'Weapon overlay did not open');
  await pointerClick(send,'#weaponChoices .weapon-choice[data-weapon-id="ages-of-harvest"]');
  await waitFor(send,"weaponUi.previewId==='ages-of-harvest'&&!weaponUi.busy",'Weapon Preview did not select Ages of Harvest');
  const afterWeaponPreview=await statsSnapshot(send);
  assert(JSON.stringify(afterWeaponPreview.projection)===JSON.stringify(beforeWeaponPreview.projection)&&afterWeaponPreview.weaponId===null,'Weapon Preview changed committed Build Stats',{before:beforeWeaponPreview,after:afterWeaponPreview});

  await pointerClick(send,'#weaponEquip');
  await waitFor(send,"weaponUi.currentId==='ages-of-harvest'&&draft(buildPicker.selected).build.weaponId==='ages-of-harvest'&&!weaponUi.busy",'Weapon Equip did not commit Ages of Harvest',8000);
  await waitFor(send,"statsUi.lastProjection&&Math.abs(statsUi.lastProjection.atk-1176)<1e-9",'Weapon Equip did not update Build Stats');
  const afterWeaponEquip=await statsSnapshot(send);
  assert(near(raw(afterWeaponEquip,'atk'),1176)&&near(raw(afterWeaponEquip,'critRate'),.373),'Equipped Weapon base/secondary did not project correctly',afterWeaponEquip);
  await pointerClick(send,'#weaponClose');
  await waitFor(send,"!weaponUi.open&&!document.getElementById('weaponOverlay').classList.contains('mounted')",'Weapon overlay did not close',3000);

  const beforeEchoPreview=await statsSnapshot(send);
  await pointerClick(send,'.echo[data-echo-slot="0"]');
  await waitFor(send,"echoUi.open&&document.getElementById('echoOverlay').classList.contains('open')",'Echo Workspace did not open');
  const echoChoice=await evaluate(send,"(() => {const choice=[...document.querySelectorAll('#echoChoices .echo-choice')].find(node=>!node.hidden);return choice?{id:choice.dataset.echoId,cost:Number(choice.dataset.cost)}:null})()");
  assert(echoChoice?.id,'No visible Echo Preview choice available',echoChoice);
  await pointerClick(send,'#echoChoices .echo-choice[data-echo-id="'+echoChoice.id+'"]');
  await waitFor(send,"echoUi.previewId==="+JSON.stringify(echoChoice.id)+"&&!!echoUi.editorDraft",'Echo Preview did not bind selected Echo');
  const afterEchoPreview=await statsSnapshot(send);
  assert(JSON.stringify(afterEchoPreview.projection)===JSON.stringify(beforeEchoPreview.projection)&&afterEchoPreview.echoSlots.every(slot=>slot===null),'Echo Preview changed committed Build Stats',{before:beforeEchoPreview,after:afterEchoPreview});

  await pointerClick(send,'#echoEquip');
  await waitFor(send,"statsUi.lastProjection?.echoCardCount===1&&!!readEchoSets(buildPicker.selected).sets[readEchoSets(buildPicker.selected).activeSetId].slots[0]",'Echo Equip did not commit/update Build Stats',5000);
  const afterEchoEquip=await statsSnapshot(send);
  assert(afterEchoEquip.projection.echoCardCount===1&&(Math.abs(raw(afterEchoEquip,'hp')-raw(beforeEchoPreview,'hp'))>1e-9||Math.abs(raw(afterEchoEquip,'atk')-raw(beforeEchoPreview,'atk'))>1e-9),'Committed Echo stat card did not affect projected Stats',{before:beforeEchoPreview,after:afterEchoEquip});
  await pointerClick(send,'#echoClose');
  await waitFor(send,"!echoUi.open&&!document.getElementById('echoOverlay').classList.contains('mounted')",'Echo Workspace did not close',3000);

  const exclusion=afterEchoEquip.projection;
  assert(exclusion.includesWeaponEffects===false&&exclusion.includesSonataEffects===false&&exclusion.includesEchoSkillEffects===false&&exclusion.includesSequenceEffects===false&&exclusion.includesTeamBuffs===false&&exclusion.includesCombatUptime===false,'Forbidden effect sources leaked into static Stats projection',exclusion);

  for(const[width,height]of[[1920,1080],[2560,1440]]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await sleep(180);
    if(!(await evaluate(send,'statsUi.expanded')))await pointerClick(send,'#buildStatsToggle');
    await waitFor(send,"statsUi.expanded===true",'Stats did not expand at '+width+'×'+height);
    const g=await geometry(send);
    assert(g.stats.bottom<=g.skillsBlock.top+1&&g.skillsBlock.bottom<=g.weaponBlock.top+1&&g.side.top>=0&&g.side.bottom<=g.innerHeight-8&&g.scrollWidth<=g.innerWidth+1&&g.scrollHeight<=g.innerHeight+1,'Expanded Stats + Skills + Weapon layout failed at '+width+'×'+height,g);
    await pointerClick(send,'#buildStatsToggle');await waitFor(send,"statsUi.expanded===false",'Stats did not collapse at '+width+'×'+height);
  }

  console.log('v34 Build Stats verified in real Chrome: source-backed Character/intrinsic + committed Weapon/Echo static stats, canonical icons, same-panel More/Less flow, Skills + Weapon natural push-down/up, Character switch, Preview-no-change / Equip-change semantics, forbidden-effect exclusions, and 1440/1920/2560 desktop fit.');
  socket.close();
}finally{
  chrome.kill('SIGTERM');
}
