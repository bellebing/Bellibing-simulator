import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const UI_URL=process.env.BELLIBING_V34_URL??'http://127.0.0.1:4173/ui-preview/';
const DEBUG_PORT=Number(process.env.BELLIBING_V34_CHROME_DEBUG_PORT??9674);
const CHROME=process.env.CHROME_BIN??'google-chrome';
const CORE=['normal-attack','skill','circuit','liberation','intro','outro'];
const runtime=JSON.parse(readFileSync('docs/ui-prototypes/assets/sequence-runtime.json','utf8'));
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const assert=(condition,message,detail)=>{if(!condition)throw new Error(message+(detail===undefined?'':': '+JSON.stringify(detail)))};

assert(runtime.schemaVersion===1&&runtime.role==='character-builder.runtime-sequences','Unexpected builder runtime schema');
assert(runtime.characters.length===57,'Skills runtime must cover all 57 released Characters',runtime.characters.length);
const byId=new Map(runtime.characters.map(row=>[row.characterId,row]));
for(const row of runtime.characters){
  assert(row.skills&&CORE.every(role=>row.skills[role]?.role===role&&row.skills[role]?.assetPath?.startsWith('assets/builder-icons/skills/')),'Incomplete core Skills mapping',row.characterId);
  for(const skill of Object.values(row.skills)){
    assert(existsSync(join('docs/ui-prototypes',skill.assetPath)),'Missing published skill asset',{character:row.characterId,path:skill.assetPath});
  }
}

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
async function waitFor(send,expression,message,timeout=10000){
  const deadline=Date.now()+timeout;
  while(Date.now()<deadline){if(await evaluate(send,expression))return;await sleep(55)}
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
  throw new Error('Skills UI preview did not become ready.');
}
async function centerOf(send,selector){
  const q=JSON.stringify(selector);
  const bounds=await evaluate(send,"(() => {const el=document.querySelector("+q+");if(!el)throw new Error('Missing pointer target');const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,iw:innerWidth,ih:innerHeight}})()");
  assert(bounds.width>0&&bounds.height>0&&bounds.x<bounds.iw&&bounds.y<bounds.ih&&bounds.x+bounds.width>0&&bounds.y+bounds.height>0,'Pointer target is not visible',{selector,bounds});
  return{x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2};
}
async function pointerClick(send,selector){
  const p=await centerOf(send,selector);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x,y:p.y});
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x:p.x,y:p.y,button:'left',clickCount:1});
  await sleep(30);
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:p.x,y:p.y,button:'left',clickCount:1});
  await sleep(95);
}
async function skillSnapshot(send){
  return evaluate(send,"(() => {const read=root=>Object.fromEntries([...document.querySelectorAll(root+' [data-skill-role]')].map(node=>[node.dataset.skillRole,{src:node.querySelector('img')?.getAttribute('src')??null,loaded:node.querySelector('img')?.naturalWidth??0,selected:node.classList.contains('is-selected')} ]));return{character:skillsUi.characterId,open:skillsUi.open,selected:skillsUi.selectedRole,compact:read('#skillsMiniTree'),menu:read('#skillsMenuTree'),inherent:read('#skillsInherent'),compactActive:[...document.querySelectorAll('#skillsMiniTree .skill-link.is-active')].map(x=>x.dataset.skillLink).sort(),menuActive:[...document.querySelectorAll('#skillsMenuTree .skill-link.is-active')].map(x=>x.dataset.skillLink).sort(),overlayOpen:document.getElementById('skillsOverlay').classList.contains('open'),overlayMounted:document.getElementById('skillsOverlay').classList.contains('mounted'),selectedLabel:document.getElementById('skillsSelectedLabel').textContent.trim()}})()");
}
async function layout(send){
  return evaluate(send,"(() => {const box=id=>document.getElementById(id).getBoundingClientRect().toJSON(),side=document.querySelector('.side-left').getBoundingClientRect(),panel=document.getElementById('skillsPanel').getBoundingClientRect();return{stats:box('buildStatsBlock'),skills:box('skillsBlock'),skillsButton:box('skillsBtn'),weapon:document.getElementById('weaponBtn').closest('.block').getBoundingClientRect().toJSON(),side:side.toJSON(),panel:panel.toJSON(),iw:innerWidth,ih:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight}})()");
}
async function capture(send){
  mkdirSync('artifacts',{recursive:true});
  const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
  writeFileSync('artifacts/ui-preview-skills-menu-1440x900.png',Buffer.from(shot.data,'base64'));
}

const userDir='/tmp/bellibing-skills-'+process.pid+'-'+DEBUG_PORT;
const chrome=spawn(CHROME,['--headless=new','--no-sandbox','--disable-gpu','--remote-debugging-port='+DEBUG_PORT,'--remote-debugging-address=127.0.0.1','--user-data-dir='+userDir,'about:blank'],{stdio:'ignore'});

try{
  await waitForChrome();
  const page=await createPage();
  const{socket,send}=cdp(page.webSocketDebuggerUrl);
  await navigate(send);
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await evaluate(send,'localStorage.clear()');
  await navigate(send);
  await waitFor(send,"releasedCharacters.length===57&&document.documentElement.dataset.sequenceCatalogReady==='true'&&document.documentElement.dataset.buildStatsReady==='true'",'Character/Builder runtime did not become ready',15000);
  await evaluate(send,"show('build');buildPicker.select('Augusta')");
  await waitFor(send,"skillsUi.characterId==='augusta'&&document.getElementById('skillsBlock').dataset.ready==='true'",'Augusta Skills did not bind');
  await waitFor(send,"!document.getElementById('build').classList.contains('major-enter')&&!document.getElementById('build').classList.contains('go')",'Build entrance did not settle',1800);
  await sleep(800);

  let g=await layout(send);
  assert(g.stats.top<g.skills.top&&g.skills.top<g.weapon.top,'Left Build column order is not Stats → Skills → Weapon',g);
  assert(g.stats.bottom<=g.skills.top+1&&g.skills.bottom<=g.weapon.top+1,'Left Build blocks overlap',g);

  // The real Character-switch path must immediately bind every canonical core icon for all released Characters.
  for(const row of runtime.characters){
    await evaluate(send,"buildPicker.select("+JSON.stringify(row.characterName)+")");
    await waitFor(send,"skillsUi.characterId==="+JSON.stringify(row.characterId),'Skills Character switch failed for '+row.characterName);
    const state=await skillSnapshot(send);
    for(const role of CORE)assert(state.compact[role]?.src===row.skills[role].assetPath,'Incorrect canonical compact icon after Character switch',{character:row.characterId,role,expected:row.skills[role].assetPath,actual:state.compact[role]?.src});
  }

  await evaluate(send,"buildPicker.select('Augusta')");
  await waitFor(send,"skillsUi.characterId==='augusta'",'Return to Augusta failed');
  let state=await skillSnapshot(send),augusta=byId.get('augusta');
  assert(CORE.every(role=>state.compact[role]?.src===augusta.skills[role].assetPath),'Augusta compact core mapping mismatch',state.compact);
  await waitFor(send,"[...document.querySelectorAll('#skillsMiniTree [data-skill-role] img')].every(img=>img.naturalWidth>0)",'Augusta compact skill artwork did not load');
  const neutral=await evaluate(send,"(() => [...document.querySelectorAll('#skillsMiniTree .skill-link')].map(x=>({active:x.classList.contains('is-active'),stroke:getComputedStyle(x).stroke,filter:getComputedStyle(x).filter})))()");
  assert(neutral.length===5&&neutral.every(x=>!x.active&&!String(x.stroke).includes('skillsCompactGold')),'Compact Skills neutral connectors are not grey/inactive',neutral);

  await pointerClick(send,'#skillsBtn');
  await waitFor(send,"skillsUi.open&&document.getElementById('skillsOverlay').classList.contains('open')",'Skills menu did not open');
  state=await skillSnapshot(send);
  assert(CORE.every(role=>state.menu[role]?.src===augusta.skills[role].assetPath),'Expanded Skills menu did not use Augusta canonical icons',state.menu);
  assert(Object.keys(state.inherent).length===Object.keys(augusta.skills).filter(role=>role.startsWith('inherent-')).length,'Source-backed inherent icon count mismatch',{runtime:augusta.skills,dom:state.inherent});

  await pointerClick(send,'#skillsMenuTree .skills-menu-outro');
  await waitFor(send,"skillsUi.selectedRole==='outro'",'Expanded Skills selection shell did not select Outro');
  state=await skillSnapshot(send);
  assert(JSON.stringify(state.menuActive)===JSON.stringify(['liberation-outro','root-liberation'])&&JSON.stringify(state.compactActive)===JSON.stringify(['liberation-outro','root-liberation']),'Selected skill path did not use expected tree connectors',state);
  assert(state.selectedLabel==='Outro Skill','Selected role detail shell label mismatch',state);
  const connectorVisual=await evaluate(send,"(() => {const active=document.querySelector('#skillsMenuTree .skill-link.is-active'),neutral=document.querySelector('#skillsMenuTree .skill-link:not(.is-active)');return{activeStroke:getComputedStyle(active).stroke,activeFilter:getComputedStyle(active).filter,neutralStroke:getComputedStyle(neutral).stroke,neutralFilter:getComputedStyle(neutral).filter}})()");
  assert(String(connectorVisual.activeStroke).includes('skillsMenuGold')&&String(connectorVisual.activeFilter).includes('skillsMenuGlow'),'Active Skills connector is not gold/glowing',connectorVisual);
  assert(!String(connectorVisual.neutralStroke).includes('skillsMenuGold'),'Inactive Skills connector is not neutral grey',connectorVisual);
  await capture(send);

  await pointerClick(send,'#skillsClose');
  await waitFor(send,"!skillsUi.open&&!document.getElementById('skillsOverlay').classList.contains('mounted')",'Skills menu did not fully close',2000);

  // Existing Sequence behavior is untouched; only its committed connector gets the same gold/grey visual language.
  await evaluate(send,'sequenceUi.commit(4)');
  await sleep(280);
  const seqVisual=await evaluate(send,"(() => {const line=document.getElementById('sequenceLine'),before=getComputedStyle(line,'::before'),after=getComputedStyle(line,'::after');return{progress:line.style.getPropertyValue('--seq-progress'),beforeBackground:before.backgroundColor,afterBackground:after.backgroundImage,afterShadow:after.boxShadow,afterHeight:parseFloat(after.height),current:sequenceUi.currentLevel}})()");
  assert(seqVisual.current===4&&Number(seqVisual.progress)>.5&&seqVisual.afterHeight>0&&String(seqVisual.afterBackground).includes('linear-gradient')&&seqVisual.afterShadow!=='none','Committed Sequence connector is not gold/progressive',seqVisual);
  assert(seqVisual.beforeBackground!=='rgba(0, 0, 0, 0)'&&seqVisual.beforeBackground!=='transparent','Inactive Sequence connector base is missing',seqVisual);
  await evaluate(send,'sequenceUi.commit(0)');

  // Stats expansion must naturally push both Skills and Weapon down.
  const collapsed=await layout(send);
  await pointerClick(send,'#buildStatsToggle');
  await waitFor(send,"statsUi.expanded===true",'Stats did not expand');
  const expanded=await layout(send);
  assert(expanded.skills.top>collapsed.skills.top+45&&expanded.weapon.top>collapsed.weapon.top+45,'Stats expansion did not push Skills + Weapon downward',{collapsed,expanded});
  assert(expanded.stats.bottom<=expanded.skills.top+1&&expanded.skills.bottom<=expanded.weapon.top+1,'Expanded left-column blocks overlap',expanded);
  assert(expanded.side.top>=0&&expanded.side.bottom<=expanded.ih-8&&expanded.sw<=expanded.iw+1&&expanded.sh<=expanded.ih+1,'1440×900 left column does not fit after Stats expansion',expanded);
  await pointerClick(send,'#buildStatsToggle');
  await waitFor(send,"statsUi.expanded===false",'Stats did not collapse');

  for(const[width,height]of[[1920,1080],[2560,1440]]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await sleep(180);
    await pointerClick(send,'#buildStatsToggle');await waitFor(send,"statsUi.expanded===true",'Stats did not expand at '+width+'×'+height);
    g=await layout(send);
    assert(g.stats.bottom<=g.skills.top+1&&g.skills.bottom<=g.weapon.top+1&&g.side.top>=0&&g.side.bottom<=g.ih-8&&g.sw<=g.iw+1&&g.sh<=g.ih+1,'Build left-column sanity failed at '+width+'×'+height,g);
    await pointerClick(send,'#buildStatsToggle');await waitFor(send,"statsUi.expanded===false",'Stats did not collapse at '+width+'×'+height);
    await pointerClick(send,'#skillsBtn');await waitFor(send,"skillsUi.open&&document.getElementById('skillsOverlay').classList.contains('open')",'Skills menu did not open at '+width+'×'+height);
    g=await layout(send);
    assert(g.panel.left>=0&&g.panel.top>=0&&g.panel.right<=g.iw&&g.panel.bottom<=g.ih,'Skills panel overflows at '+width+'×'+height,g);
    await pointerClick(send,'#skillsClose');await waitFor(send,"!skillsUi.open&&!document.getElementById('skillsOverlay').classList.contains('mounted')",'Skills menu did not fully close at '+width+'×'+height,2000);
  }

  console.log('v34 Skills verified in real Chrome: Stats → Skills → Weapon flow, all 57 Character core-icon swaps, compact tree + expanded glass shell, source-backed inherent icons, neutral/gold selected paths, shared Sequence grey/gold connector language, Stats push-down, and 1440/1920/2560 desktop geometry.');
  socket.close();
}finally{
  chrome.kill('SIGTERM');
}
