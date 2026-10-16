// Real Chromium, physical controls and canonical account fixtures. No media artifacts.
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const url=process.env.BELLIBING_WORKSHOP_URL??'http://127.0.0.1:4174/docs/ui-prototypes/v34-functional.html';
const port=Number(process.env.BELLIBING_WORKSHOP_DEBUG_PORT??9791);
const profile=mkdtempSync(join(tmpdir(),'bellibing-workshop-'));
const chrome=spawn(process.env.CHROME_BIN??'google-chrome',['--headless=new','--no-sandbox','--disable-dev-shm-usage',`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let socket;
try{
 for(let n=0;n<100;n++){try{if((await fetch(`http://127.0.0.1:${port}/json/version`)).ok)break;}catch{}await sleep(100);}
 const page=await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();
 socket=new WebSocket(page.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
 let id=0;const pending=new Map();
 socket.onmessage=event=>{const r=JSON.parse(event.data);if(!r.id)return;const p=pending.get(r.id);pending.delete(r.id);if(r.error)p.reject(Error(r.error.message));else p.resolve(r.result);};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});socket.send(JSON.stringify({id:key,method,params}));});
 const read=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text);return r.result.value;};
 const frame="document.getElementById('echoWorkshopFrame').contentWindow";
 const inFrame=expr=>read(`(()=>{const w=${frame},d=w.document;return (${expr})})()`);
 const state=()=>inFrame('w.bellibingWorkshop.snapshot()');
 async function wait(expr,label,framed=true){for(let i=0;i<300;i++){try{if(await (framed?inFrame(expr):read(expr)))return;}catch{}await sleep(100);}throw Error(label+': '+await read("document.getElementById('echoWorkshopFrame')?.contentDocument?.getElementById('feedbackText')?.textContent"));}
 async function click(selector,framed=true){const expression=`(()=>{const e=${framed?frame+'.document':'document'}.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing ${selector}');e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height,disabled:e.disabled,hit:e.contains(e.ownerDocument.elementFromPoint(r.x+r.width/2,r.y+r.height/2)),top:e.ownerDocument.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.outerHTML.slice(0,250)}})()`;let b;for(let n=0;n<35;n++){b=await read(expression);if(b.hit)break;await sleep(100);}assert.ok(b.hit,selector+' is unobstructed '+JSON.stringify(b));assert.ok(b.w&&b.h&&!b.disabled,selector+' is visible and enabled');await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:b.x,y:b.y});await send('Input.dispatchMouseEvent',{type:'mousePressed',x:b.x,y:b.y,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:b.x,y:b.y,button:'left',clickCount:1});await sleep(90);}
 async function key(key,modifiers=0){await send('Input.dispatchKeyEvent',{type:'keyDown',key,modifiers,windowsVirtualKeyCode:key==='Enter'?13:key==='a'?65:undefined});await send('Input.dispatchKeyEvent',{type:'keyUp',key,modifiers});}
 async function input(selector,value){await click(selector);await key('a',2);await send('Input.insertText',{text:value});await key('Enter');}
 async function navigate(){await send('Page.navigate',{url});await wait('window.bellibingWorkshopSource?.ready()','parent ready',false);}
 await navigate();
 await read(`(()=>{localStorage.clear();return true})()`);await navigate();
 // Canonical, saved account fixtures use the existing application's own writers.
 await read(`(()=>{addOwned('Augusta');addOwned('Cartethyia');const item=echoCatalog.find(e=>e.cost===4);commitEchoSlot('Augusta',0,makeEchoStatCard(item,item.sonataSetIds[0]));autosave('Augusta',{weaponId:'thunderflare-dominion',sequenceLevel:1});show('improve');return true})()`);

 for(const [width,height] of [[1440,900],[1920,1080],[2560,1440]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
  await read("show('improve');improvePicker.select('Augusta')");await sleep(600);const equipment=await read("localStorage.getItem('bellibing-ui-checkpoint-v34')");await click('#openEchoWorkshop',false);await wait("d.documentElement.dataset.workshopReady==='true'",'Workshop ready');
  assert.equal((await state()).selectedId,'augusta');assert.equal((await state()).session,null);
  await click('#settingsToggle');
  await input('[data-resource="echoes"] input','5');await input('[data-resource="tuners"] input','50');await input('[data-resource="premium"] input','100');
  const savedInventory=await read('JSON.stringify(window.bellibingResourceInventory.getState())');
  await click('[data-mode="simulate"]');
  let s=await state();assert.ok(s.session.slots.every(slot=>slot.candidate===null));assert.ok(s.session.simulatedBuild.echoSets.sets[s.session.source.activeSetId].slots.every(slot=>slot===null));
  assert.equal(await inFrame('d.querySelectorAll("#piles .empty-pile").length'),5);
  await click('[data-slot="5"]');await click('#simulate');await wait('d.querySelector("#candidateSetup").open','candidate dialog');
  // Native select receives pointer/keyboard interaction; legal options are canonical.
  await click('#candidateSpecies');await key('Escape');await key('Home');await key('ArrowDown');await key('Enter');
  await click('#candidateForm button[type="submit"]');
  s=await state();assert.equal(s.session.slots[4].candidate.card.level,0);assert.equal(s.session.manual.inventory.echoes.count,4);
  const identity=s.session.slots[4].candidate.id;
  for(const level of [5,10,15,20,25]){
   await click('#simulate');s=await state();const card=s.session.slots[4].candidate.card;
   assert.equal(card.level,level);assert.equal(card.substats.length,level/5);assert.equal(new Set(card.substats.map(stat=>stat.name)).size,level/5);
   assert.equal(s.session.manual.inventory.tuners.count,50-level/5*10);
   assert.equal(s.session.slots[4].candidate.id,identity);
   assert.equal(await inFrame('d.querySelectorAll("#newCard .substat:not(.empty)").length'),level/5);
  }
  assert.deepEqual(s.session.slots[4].candidate.history.map(card=>card.level),[0,5,10,15,20,25]);
  assert.equal(await inFrame('d.querySelector("#simulate").disabled'),true);
  await click('#inspectCandidate');assert.equal(await inFrame('d.querySelectorAll("#checkpoints .checkpoint").length'),6);await click('#closeInspection');
  await click('[data-slot="2"]');await click('#simulate');await click('#candidateForm button[type="submit"]');
  const before=JSON.stringify((await state()).session);await click('#simulate');assert.equal(JSON.stringify((await state()).session),before);assert.match(await inFrame('d.querySelector("#feedbackTitle").textContent'),/Tuners/);
  assert.equal(await read('JSON.stringify(window.bellibingResourceInventory.getState())'),savedInventory);
  assert.equal(await read("localStorage.getItem('bellibing-ui-checkpoint-v34')"),equipment);
  s=await state();assert.ok(s.session.slots.every(slot=>!slot.accepted.length&&!slot.trash.length));assert.equal(s.session.evaluator.status,'PENDING');
  assert.equal(await inFrame('d.querySelector("#fullSet").disabled'),true);
  assert.equal(await inFrame('d.querySelectorAll("[data-role=expected] strong").length>0&&[...d.querySelectorAll("[data-role=expected] strong")].every(e=>e.textContent==="Pending")'),true);
  assert.equal(await inFrame('/illustrative|demo build|demonstration/i.test(d.body.innerText)'),false);
  // Geometry at all approved widths, with physical side-panel toggling.
  await click('#characterToggle');await sleep(250);
  const geometry=await inFrame('(()=>{const r=d.querySelector(".workshop").getBoundingClientRect();return {width:r.width,right:r.right,viewport:w.innerWidth,scroll:d.documentElement.scrollWidth}})()');
  assert.ok(geometry.width>=1000&&geometry.right<=width+1&&geometry.scroll<=width+1,JSON.stringify(geometry));
  await click('#reset');assert.ok((await state()).session.slots.every(slot=>!slot.candidate));assert.equal((await state()).session.manual.inventory.echoes.count,5);
  await click('[data-mode="current"]');assert.equal((await state()).session,null);
  // Select the second real account Character through the approved wheel.
  await click('.portrait.selected');await click('[data-filter="account"]');await click('#galleryArt');await key('End');await sleep(850);await key('Enter');await sleep(800);
  assert.equal((await state()).selectedId,'cartethyia');assert.equal((await state()).session,null);
  await click('[data-mode="simulate"]');assert.ok((await state()).session,JSON.stringify(await inFrame('({feedback:d.querySelector("#feedbackTitle").textContent,mode:[...d.querySelectorAll(".mode-switch button")].map(b=>({text:b.textContent,pressed:b.getAttribute("aria-pressed")}))})')));assert.equal((await state()).session.source.characterId,'cartethyia');assert.ok((await state()).session.slots.every(slot=>!slot.candidate));
  await send('Page.reload');await wait("d.documentElement.dataset.workshopReady==='true'",'reload');assert.equal((await state()).session,null);
  assert.equal(await read("localStorage.getItem('bellibing-ui-checkpoint-v34')"),equipment);assert.equal(await read('JSON.stringify(window.bellibingResourceInventory.getState())'),savedInventory);
  await click('button[data-navigate="build"]');await wait("!document.getElementById('echoWorkshopFrame')",'return to app',false);
  await read("show('improve')");
  console.log(`PASS ${width}x${height}: canonical manual rolling, budgets, history, isolation, transitions, reset/reload, Pending and layout`);
 }
 console.log('PASS integrated production Workshop: '+url);
}finally{socket?.close();chrome.kill();await sleep(250);rmSync(profile,{recursive:true,force:true});}
