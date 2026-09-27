import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const UI_URL=process.env.BELLIBING_V34_URL??'http://127.0.0.1:4173/ui-preview/';
const DEBUG_PORT=Number(process.env.BELLIBING_V34_CHROME_DEBUG_PORT??9676);
const CAPTURE=process.env.BELLIBING_HERO_CAPTURE!=='0';
const CHROME=process.env.CHROME_BIN??'google-chrome';
const runtime=JSON.parse(readFileSync('docs/ui-prototypes/assets/characters/hero-art/runtime-data.json','utf8'));
const manifest=JSON.parse(readFileSync('docs/ui-prototypes/assets/characters/hero-art/manifest.json','utf8'));
const required=['augusta','jiyan','iuno','cartethyia','calcharo','lupa','zani'];
const ready=runtime.characters.filter(row=>row.status==='READY');
const pending=runtime.characters.filter(row=>row.status==='PENDING');
const byId=new Map(runtime.characters.map(row=>[row.characterId,row]));
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const assert=(condition,message,detail)=>{if(!condition)throw new Error(message+(detail===undefined?'':': '+JSON.stringify(detail)))};
const close=(a,b,tolerance=.75)=>Math.abs(a-b)<=tolerance;

assert(runtime.schemaVersion===1&&runtime.role==='character.hero-art.runtime','Unexpected Hero Art runtime schema');
assert(runtime.summary.ready===53&&runtime.summary.pending===4&&runtime.summary.releasedCharacters===57,'Unexpected Hero Art coverage',runtime.summary);
assert(ready.length===53&&pending.length===4,'Runtime row counts drifted');
assert(required.every(id=>byId.get(id)?.status==='READY'),'Required visual-review sample is not READY');
assert(!runtime.characters.some(row=>['jingran','hsin','suoming'].includes(row.characterId)),'Upcoming/WIP Character leaked into Hero Art runtime');
for(const row of ready){
  assert(row.assetPath==='assets/characters/hero-art/'+row.characterId+'.webp','Unexpected READY path',row);
  assert(existsSync(join('docs/ui-prototypes',row.assetPath)),'Missing READY Hero Art file',row.assetPath);
  assert(row.presentation?.safeFraming==='CONTAIN','READY Hero Art must begin from safe CONTAIN framing',row.characterId);
  assert(Number.isFinite(row.presentation.scale)&&Number.isFinite(row.presentation.offsetX)&&Number.isFinite(row.presentation.offsetY),'Presentation values must be explicit',row.characterId);
  assert(Number.isFinite(row.presentation.focalAnchor?.x)&&Number.isFinite(row.presentation.focalAnchor?.y),'Focal anchor must be explicit',row.characterId);
}
assert(JSON.stringify(pending.map(row=>row.characterId))===JSON.stringify(['rover-aero','rover-electro','rover-havoc','rover-spectro']),'Rover pending set drifted',pending.map(row=>row.characterId));
for(const row of pending){
  assert(row.reasonCode==='ROVER_VARIANT_IDENTITY_UNRESOLVED','Unexpected Rover pending reason',row);
  assert(!('assetPath' in row)&&!('presentation' in row),'Pending Rover must not carry a guessed visual mapping',row);
}
assert(manifest.characters.length===53&&manifest.pending.length===4,'Provenance manifest coverage drifted');

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
  const socket=new WebSocket(wsUrl);let serial=0;const pendingCalls=new Map();
  const opened=new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
  socket.addEventListener('message',event=>{
    const message=JSON.parse(String(event.data));if(!message.id)return;
    const waiter=pendingCalls.get(message.id);if(!waiter)return;pendingCalls.delete(message.id);
    if(message.error)waiter.reject(new Error(message.error.message));else waiter.resolve(message.result);
  });
  async function send(method,params={}){
    await opened;const id=++serial;
    const answer=new Promise((resolve,reject)=>pendingCalls.set(id,{resolve,reject}));
    socket.send(JSON.stringify({id,method,params}));return answer;
  }
  return{socket,send};
}
async function evaluate(send,expression){
  const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
  if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description??result.exceptionDetails.text??'Runtime evaluation failed');
  return result.result?.value;
}
async function waitFor(send,expression,message,timeout=12000){
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
  throw new Error('Hero Art UI preview did not become ready.');
}
async function centerOf(send,selector){
  const q=JSON.stringify(selector);
  const bounds=await evaluate(send,"(() => {const el=document.querySelector("+q+");if(!el)throw new Error('Missing pointer target');const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,iw:innerWidth,ih:innerHeight}})()");
  assert(bounds.width>0&&bounds.height>0,'Pointer target has no size',{selector,bounds});
  return{x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2};
}
async function movePointer(send,selector){
  const p=await centerOf(send,selector);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x,y:p.y});
  await sleep(90);
}
async function selectCharacter(send,row){
  await evaluate(send,'buildPicker.select('+JSON.stringify(row.characterName)+')');
  await waitFor(send,
    "document.getElementById('buildHeroArt').dataset.heroCharacterId==="+JSON.stringify(row.characterId)+"&&document.getElementById('buildHeroArt').dataset.heroStatus==="+JSON.stringify(row.status),
    'Hero Art state did not switch for '+row.characterId
  );
  if(row.status==='READY')await waitFor(send,"document.getElementById('buildHeroImage').complete&&document.getElementById('buildHeroImage').naturalWidth>256",'Hero Art image did not load for '+row.characterId);
}
async function snapshot(send){
  return evaluate(send,`(() => {
    const r=selector=>document.querySelector(selector).getBoundingClientRect().toJSON();
    const image=document.getElementById('buildHeroImage');
    const host=document.getElementById('buildHeroArt');
    return {
      name:document.getElementById('buildName').textContent,
      status:host.dataset.heroStatus,
      characterId:host.dataset.heroCharacterId,
      reasonCode:host.dataset.heroReasonCode||null,
      src:image.getAttribute('src'),
      imageHidden:image.hidden,
      pendingHidden:document.getElementById('buildHeroPending').hidden,
      pendingText:document.getElementById('buildHeroPending').textContent.replace(/\\s+/g,' ').trim(),
      focus:r('.focus'),
      art:r('#buildHeroArt'),
      image:r('#buildHeroImage'),
      side:r('.side-left'),
      sequence:r('#sequencePanel'),
      echoes:r('.echoes'),
      account:r('#accountBtn'),
      iw:innerWidth,ih:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,
      temp:document.body.textContent.includes('TEMP CHARACTER ART'),
      styles:{
        scale:getComputedStyle(image).getPropertyValue('--hero-scale').trim(),
        x:getComputedStyle(image).getPropertyValue('--hero-x').trim(),
        y:getComputedStyle(image).getPropertyValue('--hero-y').trim(),
        fx:getComputedStyle(image).getPropertyValue('--hero-focal-x').trim(),
        fy:getComputedStyle(image).getPropertyValue('--hero-focal-y').trim(),
        objectFit:getComputedStyle(image).objectFit,
        overflow:getComputedStyle(host).overflow
      }
    };
  })()`);
}
function assertReadyGeometry(s,row,label){
  assert(s.name===row.characterName,'Character name did not stay above matching Hero Art',{label,s,row});
  assert(s.status==='READY'&&s.characterId===row.characterId&&!s.imageHidden&&s.pendingHidden,'READY state mismatch',{label,s,row});
  assert(s.src===row.assetPath,'Hero Art source mismatch',{label,s,row});
  assert(s.temp===false,'TEMP CHARACTER ART leaked into rendered workspace',label);
  assert(s.art.left>=s.focus.left-1&&s.art.right<=s.focus.right+1&&s.art.top>=s.focus.top-1&&s.art.bottom<=s.focus.bottom+1,'Hero Art host escaped focus layer',{label,s});
  assert(s.art.left>=0&&s.art.right<=s.iw&&s.art.top>=0&&s.art.bottom<=s.ih,'Hero Art host escaped viewport',{label,s});
  assert(s.styles.objectFit==='contain'&&s.styles.overflow==='hidden','Safe Hero Art containment is not active',{label,s});
  assert(s.styles.scale===String(row.presentation.scale),'Character-local scale was not applied',{label,s,row});
  assert(s.styles.x===String(row.presentation.offsetX)+'%'&&s.styles.y===String(row.presentation.offsetY)+'%','Character-local offsets were not applied',{label,s,row});
  assert(s.styles.fx===String(row.presentation.focalAnchor.x*100)+'%'&&s.styles.fy===String(row.presentation.focalAnchor.y*100)+'%','Character-local focal anchor was not applied',{label,s,row});
  assert(s.sw<=s.iw+1,'Hero Art integration introduced horizontal page overflow',{label,s});
  assert(s.side.right<=s.art.left+1,'Left Build controls overlap Character art frame',{label,s});
  assert(s.sequence.right<=s.art.left+1,'Sequence controls overlap Character art frame',{label,s});
  assert(s.art.right<=s.echoes.left+1,'Echo controls overlap Character art frame',{label,s});
}
async function captureFull(send,filename){
  mkdirSync('artifacts',{recursive:true});
  const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
  writeFileSync('artifacts/'+filename,Buffer.from(shot.data,'base64'));
}
async function captureFocus(send,id){
  mkdirSync('artifacts/hero-roster',{recursive:true});
  const box=await evaluate(send,"document.querySelector('.focus').getBoundingClientRect().toJSON()");
  const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true,clip:{x:Math.max(0,box.x),y:Math.max(0,box.y),width:Math.min(box.width,1440-Math.max(0,box.x)),height:Math.min(box.height,900-Math.max(0,box.y)),scale:.5}});
  writeFileSync('artifacts/hero-roster/'+id+'.png',Buffer.from(shot.data,'base64'));
}

const userDir=join(tmpdir(),'bellibing-hero-art-'+process.pid+'-'+DEBUG_PORT);
const chrome=spawn(CHROME,['--headless=new','--no-sandbox','--disable-gpu','--remote-debugging-port='+DEBUG_PORT,'--remote-debugging-address=127.0.0.1','--user-data-dir='+userDir,'about:blank'],{stdio:'ignore',windowsHide:true});

try{
  await waitForChrome();
  const page=await createPage();
  const{socket,send}=cdp(page.webSocketDebuggerUrl);
  await navigate(send);
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await evaluate(send,'localStorage.clear()');
  await navigate(send);
  await waitFor(send,"releasedCharacters.length===57&&document.documentElement.dataset.characterHeroArtReady==='true'&&document.documentElement.dataset.sequenceCatalogReady==='true'&&document.documentElement.dataset.buildStatsReady==='true'&&document.documentElement.dataset.skillsMechanicsReady==='true'",'Build runtimes did not become ready',20000);
  await evaluate(send,"show('build')");
  await sleep(850);

  assert(await evaluate(send,"!document.documentElement.outerHTML.includes('TEMP CHARACTER ART')"),'TEMP CHARACTER ART remains in HTML');

  // Every READY mapping must physically load in the Build focus and swap identity/source.
  let previousSrc=null;
  for(const row of ready){
    await selectCharacter(send,row);
    const s=await snapshot(send);
    assertReadyGeometry(s,row,'roster-'+row.characterId);
    if(previousSrc&&row.characterId!=='aalto')assert(s.src!==previousSrc||row.assetPath===previousSrc,'Character switching failed to change Hero Art source',{row,previousSrc});
    previousSrc=s.src;
    if(CAPTURE)await captureFocus(send,row.characterId);
  }

  // Rover stays explicit/fail-closed: no focus image src, no selector portrait substitution, no guessed candidate.
  for(const row of pending){
    await selectCharacter(send,row);
    const s=await snapshot(send);
    assert(s.status==='PENDING'&&s.reasonCode==='ROVER_VARIANT_IDENTITY_UNRESOLVED','Rover pending state not explicit',{row,s});
    assert(s.imageHidden&&s.src===null&&!s.pendingHidden,'Pending Rover rendered an image or hid its pending state',{row,s});
    assert(/HERO ART PENDING/i.test(s.pendingText)&&/visual variant is not explicit/i.test(s.pendingText),'Pending Rover copy is not explicit',{row,s});
    assert(!/male|female|\bM\b|\bF\b/i.test(s.pendingText),'Pending Rover UI guessed/exposed a gender candidate',{row,s});
  }

  // Selector expansion is a separate layer and must not move or scale the center focus.
  const augusta=byId.get('augusta');
  await selectCharacter(send,augusta);
  const before=await snapshot(send);
  // Selector hover behavior itself is covered by the existing picker/carousel gates.
  // This gate owns the layout invariant: expanding/collapsing that independent layer
  // must not move or scale the Character focus.
  await evaluate(send,"document.getElementById('buildShell').classList.add('hover-expanded');buildPicker.repaint()");
  await sleep(160);
  const expanded=await snapshot(send);
  for(const key of ['left','top','width','height'])assert(close(before.focus[key],expanded.focus[key]),'Selector expansion moved/scaled Character focus',{key,before:before.focus,expanded:expanded.focus});
  await evaluate(send,"document.getElementById('buildShell').classList.remove('hover-expanded');buildPicker.repaint()");
  await sleep(360);
  const collapsed=await snapshot(send);
  for(const key of ['left','top','width','height'])assert(close(before.focus[key],collapsed.focus[key]),'Selector collapse moved/scaled Character focus',{key,before:before.focus,collapsed:collapsed.focus});

  // Varied silhouettes: geometry at all desktop target sizes, full screenshots for human review.
  for(const[width,height]of[[1440,900],[1920,1080],[2560,1440]]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    await sleep(180);
    for(const id of required){
      const row=byId.get(id);
      await selectCharacter(send,row);
      await sleep(80);
      const s=await snapshot(send);
      assertReadyGeometry(s,row,width+'x'+height+'-'+id);
      if(CAPTURE)await captureFull(send,'ui-preview-hero-art-'+id+'-'+width+'x'+height+'.png');
    }
  }

  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await selectCharacter(send,augusta);
  // Existing Build state remains callable around Hero Art.
  await evaluate(send,'sequenceUi.commit(4)');
  assert(await evaluate(send,'sequenceUi.currentLevel')===4,'Sequence regression during Hero Art integration');
  await evaluate(send,'sequenceUi.commit(0)');
  assert(await evaluate(send,"typeof weaponUi.show==='function'&&typeof echoUi.show==='function'&&typeof skillsUi.show==='function'&&typeof statsUi.refresh==='function'"),'Surrounding Build controls lost their existing interfaces');
  assert(await evaluate(send,"document.getElementById('accountBtn').textContent==='Add to Account'"),'Add to Account initial state regressed');

  console.log('Character Hero Art Chrome checks passed: 53 READY source swaps, 4 explicit Rover PENDING states, independent selector/focus layers, required varied-silhouette review set, and 1440x900 / 1920x1080 / 2560x1440 containment.');
  socket.close();
}finally{
  chrome.kill('SIGTERM');
}
