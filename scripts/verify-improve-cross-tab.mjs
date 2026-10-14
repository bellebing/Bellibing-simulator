// BUG-045: real multi-tab Chromium, same-origin native localStorage and Web Locks.
// Runs against the exact dist/ browser bundle after the strict build; no fake lock/CAS.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const PORT = Number(process.env.BELLIBING_CROSS_TAB_DEBUG_PORT ?? 9774);
const CHROME = process.env.CHROME_BIN ?? 'google-chrome';
let fixtureUrl = process.env.BELLIBING_CROSS_TAB_URL ?? 'http://127.0.0.1:4173/REVIEW_UI_PREVIEW.txt';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu',
  '--disable-dev-shm-usage', '--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4', ...(process.env.BELLIBING_CHROME_PROXY ? ['--proxy-server='+process.env.BELLIBING_CHROME_PROXY] : []), '--remote-debugging-address=127.0.0.1',
  '--remote-debugging-port='+PORT, '--user-data-dir='+join(tmpdir(), 'bellibing-cross-tab-'+process.pid),
  'about:blank'], { stdio: ['ignore', 'pipe', 'pipe'] });
let stderr = '';
chrome.stderr.on('data', chunk => { stderr += String(chunk); });
async function chromeReady() {
  for (let i = 0; i < 120; i++) {
    try { if ((await fetch('http://127.0.0.1:'+PORT+'/json/version')).ok) return; } catch {}
    await sleep(100);
  }
  throw new Error('Chromium CDP startup timeout');
}
async function page() {
  const response = await fetch('http://127.0.0.1:'+PORT+'/json/new?about:blank', {method:'PUT'});
  if (!response.ok) throw new Error('CDP new page: '+response.status);
  const { webSocketDebuggerUrl } = await response.json();
  const socket = new WebSocket(webSocketDebuggerUrl), pending = new Map();
  let sequence = 0;
  const opened = new Promise((resolve,reject) => {
    socket.addEventListener('open',resolve,{once:true});
    socket.addEventListener('error',reject,{once:true});
  });
  socket.addEventListener('message',event => {
    const row = JSON.parse(String(event.data)); if (!row.id) return;
    const waiting = pending.get(row.id); if (!waiting) return;
    pending.delete(row.id); row.error ? waiting.reject(new Error(row.error.message)) : waiting.resolve(row.result);
  });
  async function send(method,params={}) {
    await opened; const id = ++sequence;
    const result = new Promise((resolve,reject) => pending.set(id,{resolve,reject}));
    socket.send(JSON.stringify({id,method,params}));
    return result;
  }
  return { send, socket };
}
async function evaluate(p,expression) {
  const result = await p.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result?.value;
}
async function attempt(p,body) {
  return evaluate(p, '(async()=>{try{return {ok:true,value:await (async()=>{'+body+'})()}}catch(error){return {ok:false,error:String(error.message)}}})()');
}
async function navigate(p) {
  await p.send('Page.enable'); await p.send('Runtime.enable');
  await p.send('Page.navigate',{url:fixtureUrl});
  for(let i=0;i<150;i++) {
    if (await evaluate(p,`document.readyState === 'complete' && location.origin === ${JSON.stringify(new URL(fixtureUrl).origin)}`)) return;
    await sleep(75);
  }
  throw new Error('Browser fixture navigation timeout');
}
async function main() {
  await chromeReady();
  const A = await page(), B = await page();
  try {
    await Promise.all([navigate(A),navigate(B)]);
    const setup = `window.p=await import('/assets/improvePolicyState.js');
      window.t=await import('/assets/echoResourceTransaction.js');
      window.r=await import('/assets/resourceInventory.js');
      window.presentation=await import('/assets/improvePolicyPresentation.js');
      window.key=window.p.IMPROVE_POLICY_STORAGE_KEY;
      window.seedBytes=(count=1)=>{let inv=window.r.emptyResourceInventory();
        for(const [id,n] of [['echoes',count],['tuners',count*10],['shellCredits',count*2440],['basic',count*9]])
          inv=window.r.updateResourceInventory(inv,id,{kind:'FINITE',count:n});
        return JSON.stringify({version:3,characters:{},pendingV2Characters:{},resourceInventory:inv});
      };
      window.seed=(count=1)=>p.withExclusiveImprovePolicyStorage(()=>localStorage.setItem(key,seedBytes(count)));
      true`;
    await Promise.all([evaluate(A,'(async()=>{'+setup+'})()'),evaluate(B,'(async()=>{'+setup+'})()')]);
    assert.equal(await evaluate(A,'!!navigator.locks && typeof navigator.locks.request==="function"'),true,'Chromium Web Locks unavailable');
    // Both snapshots from before either exclusive commit: exactly one paid attempt.
    await evaluate(A,'localStorage.clear();localStorage.setItem(key,seedBytes());localStorage.setItem(p.IMPROVE_POLICY_V2_KEY,"retained legacy recovery bytes");window.originalBytes=localStorage.getItem(key);window.snap=t.readRank5Plus5Snapshot(localStorage);true');
    // First-use mutation fails after its provisional mirror write, and rollback
    // is unavailable. The separately committed original must still recover it.
    const firstAdoption=await attempt(A,`const put=IDBObjectStore.prototype.put, set=Storage.prototype.setItem;
      IDBObjectStore.prototype.put=function(value,...args){
        if(value.current?.includes('first-adoption'))throw new Error('first write denied');
        return put.call(this,value,...args)};
      Storage.prototype.setItem=function(k,value){
        if(k===key&&value===originalBytes)throw new Error('mirror rollback unavailable');
        return set.call(this,k,value)};
      try{return await t.commitRank5Plus5ResourcesExclusive(localStorage,snap,'first-adoption')}
      finally{IDBObjectStore.prototype.put=put;Storage.prototype.setItem=set}`);
    assert.equal(firstAdoption.ok,false,'failed first write must not report success');
    assert.match(firstAdoption.error,/first write denied/);
    const seeded = await evaluate(A,'(async()=>{await p.withExclusiveImprovePolicyStorage(()=>p.loadImprovePolicyStorage(localStorage));window.snap=t.readRank5Plus5Snapshot(localStorage);return snap.storageBytes})()');
    assert.equal(seeded,await evaluate(A,'originalBytes'),'durable original survives unavailable first-write rollback');
    for (let i=0;i<100 && await evaluate(B,'localStorage.getItem(key)')!==seeded;i++) await sleep(20);
    assert.equal(await evaluate(B,'localStorage.getItem(key)'),seeded,'both tabs see the funded starting envelope');
    await evaluate(B,'window.snap=t.readRank5Plus5Snapshot(localStorage);true');
    const simultaneous=await Promise.all([
      attempt(A,"return t.commitRank5Plus5ResourcesExclusive(localStorage,snap,'first-tab')"),
      attempt(B,"return t.commitRank5Plus5ResourcesExclusive(localStorage,snap,'second-tab')")
    ]);
    assert.equal(simultaneous.filter(x=>x.ok).length,1,'two-tab double-spend');
    assert.match(simultaneous.find(x=>!x.ok)?.error ?? '',/Stale/);
    const winner=simultaneous.find(x=>x.ok).value;
    assert.equal(winner.receipt.consumed.echoes,1);
    assert.equal(winner.receipt.consumed.tuners,10);
    assert.equal(winner.receipt.consumed.shellCredits,2440);
    assert.equal(winner.receipt.consumed.tubes.basic,9);
    assert.deepEqual(await evaluate(A,'p.loadImprovePolicyStorage(localStorage).resourceTransactions'),
      {revision:1,consumedIds:[winner.receipt.transactionId]});
    assert.equal(await evaluate(A,'p.loadImprovePolicyStorage(localStorage).resourceInventory.echoes.count'),0);
    // Deterministic reproduction: a renderer still exposes the pre-debit envelope.
    // Web Locks alone allowed a second receipt; the durable authority must reject it.
    await evaluate(B,'localStorage.setItem(key,snap.storageBytes);true');
    const staleMirror=await attempt(B,"return t.commitRank5Plus5ResourcesExclusive(localStorage,snap,'stale-renderer')");
    assert.equal(staleMirror.ok,false,'stale localStorage must not debit a paid budget twice');
    assert.match(staleMirror.error,/Stale/);
    assert.deepEqual(await evaluate(B,'p.loadImprovePolicyStorage(localStorage).resourceTransactions'),
      {revision:1,consumedIds:[winner.receipt.transactionId]});
    assert.equal(await evaluate(B,'localStorage.getItem(p.IMPROVE_POLICY_V2_KEY)'),'retained legacy recovery bytes','migration/commits preserve legacy recovery bytes');
    // A same-Character stale policy save must not clobber a newer policy record.
    await evaluate(A,"window.oldStore=p.loadImprovePolicyStorage(localStorage);true");
    await evaluate(B,"window.oldStore=p.loadImprovePolicyStorage(localStorage);true");
    const firstSetting=await attempt(A,`const state=p.createImprovePolicyState('augusta',presentation.pendingImprovePolicySource('augusta'));
      return p.withExclusiveImprovePolicyStorage(()=>p.persistImprovePolicyState(oldStore,{...state,gate:10},localStorage))`);
    assert.equal(firstSetting.ok,true,firstSetting.error);
    const staleSetting=await attempt(B,`const state=p.createImprovePolicyState('augusta',presentation.pendingImprovePolicySource('augusta'));
      return p.withExclusiveImprovePolicyStorage(()=>p.persistImprovePolicyState(oldStore,{...state,gate:15},localStorage))`);
    assert.equal(staleSetting.ok,false);assert.match(staleSetting.error,/Stale/);
    assert.equal(await evaluate(A,"p.loadImprovePolicyStorage(localStorage).characters.augusta.gate"),10);
    assert.equal(await evaluate(A,"p.loadImprovePolicyStorage(localStorage).resourceTransactions.revision"),1);
    // Competing resource editors: no stale replacement of the shared budget.
    await evaluate(A,'window.oldStore=p.loadImprovePolicyStorage(localStorage);true');
    await evaluate(B,'window.oldStore=p.loadImprovePolicyStorage(localStorage);true');
    const firstEdit=await attempt(A,`const next=r.updateResourceInventory(oldStore.resourceInventory,'echoes',{kind:'FINITE',count:4});
      return p.withExclusiveImprovePolicyStorage(()=>p.persistResourceInventory(oldStore,next,localStorage))`);
    assert.equal(firstEdit.ok,true,firstEdit.error);
    const staleEdit=await attempt(B,`const next=r.updateResourceInventory(oldStore.resourceInventory,'echoes',{kind:'FINITE',count:5});
      return p.withExclusiveImprovePolicyStorage(()=>p.persistResourceInventory(oldStore,next,localStorage))`);
    assert.equal(staleEdit.ok,false); assert.match(staleEdit.error,/Stale/);
    assert.equal(await evaluate(A,'p.loadImprovePolicyStorage(localStorage).resourceInventory.echoes.count'),4);
    assert.equal(await evaluate(A,'p.loadImprovePolicyStorage(localStorage).resourceTransactions.consumedIds.length'),1);
    // Guard denies even direct native transactions outside an exclusive operation.
    const unguarded=await attempt(B,"return t.commitRank5Plus5Resources(localStorage,t.readRank5Plus5Snapshot(localStorage),'unguarded')");
    assert.equal(unguarded.ok,false); assert.match(unguarded.error,/lock required/);
    const beforeDenied=await evaluate(A,'localStorage.getItem(key)');
    // Simulate missing navigator.locks in tab B; fail closed without lease fallback.
    await evaluate(B,`window.hadLocks=Object.getOwnPropertyDescriptor(navigator,'locks');
      Object.defineProperty(navigator,'locks',{configurable:true,value:undefined});true`);
    const denied=await attempt(B,"return p.withExclusiveImprovePolicyStorage(()=>p.persistResourceInventory(p.loadImprovePolicyStorage(localStorage),r.emptyResourceInventory(),localStorage))");
    assert.equal(denied.ok,false); assert.match(denied.error,/coordination unavailable/);
    await evaluate(B,"if(hadLocks)Object.defineProperty(navigator,'locks',hadLocks);else delete navigator.locks;true");
    assert.equal(await evaluate(A,'localStorage.getItem(key)'),beforeDenied);
    await evaluate(B,`window.hadLocks=Object.getOwnPropertyDescriptor(navigator,'locks');
      Object.defineProperty(navigator,'locks',{configurable:true,value:{request:()=>Promise.reject(new Error('lock denied'))}});true`);
    const rejected=await attempt(B,"return p.withExclusiveImprovePolicyStorage(()=>p.persistResourceInventory(p.loadImprovePolicyStorage(localStorage),r.emptyResourceInventory(),localStorage))");
    assert.equal(rejected.ok,false); assert.match(rejected.error,/lock denied/);
    await evaluate(B,"if(hadLocks)Object.defineProperty(navigator,'locks',hadLocks);else delete navigator.locks;true");
    assert.equal(await evaluate(A,'localStorage.getItem(key)'),beforeDenied);
    await evaluate(B,`window.originalDatabase=Object.getOwnPropertyDescriptor(window,'indexedDB');
      Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});true`);
    const noDatabase=await attempt(B,"return p.withExclusiveImprovePolicyStorage(()=>localStorage.setItem(key,'invalid'))");
    assert.equal(noDatabase.ok,false);assert.match(noDatabase.error,/database unavailable/);
    await evaluate(B,"if(originalDatabase)Object.defineProperty(window,'indexedDB',originalDatabase);else delete window.indexedDB;true");
    assert.equal(await evaluate(A,'localStorage.getItem(key)'),beforeDenied);
    // Quota/serialization write error must preserve bytes and allow safe retry.
    await evaluate(A,"(async()=>{await seed();window.retrySnap=t.readRank5Plus5Snapshot(localStorage);return true})()");
    const beforeQuota=await evaluate(A,'localStorage.getItem(key)');
    const quota=await attempt(A,`const original=Storage.prototype.setItem;
      Storage.prototype.setItem=function(key,value){throw new DOMException('quota','QuotaExceededError')};
      try{return await t.commitRank5Plus5ResourcesExclusive(localStorage,retrySnap,'retry-id')}
      finally{Storage.prototype.setItem=original}`);
    assert.equal(quota.ok,false);assert.match(quota.error,/quota/);
    assert.equal(await evaluate(A,'localStorage.getItem(key)'),beforeQuota);
    const retry=await attempt(A,"return t.commitRank5Plus5ResourcesExclusive(localStorage,retrySnap,'retry-id')");
    assert.equal(retry.ok,true,retry.error);
    assert.deepEqual(await evaluate(A,'p.loadImprovePolicyStorage(localStorage).resourceTransactions.consumedIds'),['retry-id']);
    // Failure after the mirror write, before durable commit: no success or lost receipt.
    await evaluate(A,"(async()=>{await seed();window.abortSnap=t.readRank5Plus5Snapshot(localStorage);return true})()");
    const beforeAbort=await evaluate(A,'localStorage.getItem(key)');
    const aborted=await attempt(A,`const put=IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put=function(){throw new Error('durable write failed')};
      try{return await t.commitRank5Plus5ResourcesExclusive(localStorage,abortSnap,'durable-retry')}
      finally{IDBObjectStore.prototype.put=put}`);
    assert.equal(aborted.ok,false); assert.match(aborted.error,/durable write failed/);
    assert.equal(await evaluate(A,'localStorage.getItem(key)'),beforeAbort);
    const durableRetry=await attempt(A,"return t.commitRank5Plus5ResourcesExclusive(localStorage,abortSnap,'durable-retry')");
    assert.equal(durableRetry.ok,true,durableRetry.error);
    assert.deepEqual(await evaluate(A,'p.loadImprovePolicyStorage(localStorage).resourceTransactions.consumedIds'),['durable-retry']);
    await evaluate(A,"(async()=>{await seed();window.abortSnap=t.readRank5Plus5Snapshot(localStorage);return true})()");
    const beforeAbortEvent=await evaluate(A,'localStorage.getItem(key)');
    const abortEvent=await attempt(A,`const put=IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put=function(...args){const request=put.apply(this,args);this.transaction.abort();return request};
      try{return await t.commitRank5Plus5ResourcesExclusive(localStorage,abortSnap,'abort-event')}
      finally{IDBObjectStore.prototype.put=put}`);
    assert.equal(abortEvent.ok,false);assert.match(abortEvent.error,/aborted/);
    assert.equal(await evaluate(A,'localStorage.getItem(key)'),beforeAbortEvent);
    const completed=await attempt(A,"return t.commitRank5Plus5ResourcesExclusive(localStorage,abortSnap,'after-abort')");
    assert.equal(completed.ok,true,completed.error);
    // A real lock held in one tab forces the other tab to wait, not race writes.
    await evaluate(A,`(async()=>{await seed();window.holding=false;
      window.hold=navigator.locks.request(key,{mode:'exclusive'},async()=>{window.holding=true;await new Promise(resolve=>window.releaseHold=resolve)});
      return true})()`);
    for(let i=0;i<50 && !await evaluate(A,'window.holding');i++)await sleep(20);
    assert.equal(await evaluate(A,'window.holding'),true);
    await evaluate(B,'window.waitSnap=t.readRank5Plus5Snapshot(localStorage);true');
    const beforeHold=await evaluate(A,'localStorage.getItem(key)');
    let settled=false;
    const waiting=attempt(B,"return t.commitRank5Plus5ResourcesExclusive(localStorage,waitSnap,'after-hold')").then(v=>{settled=true;return v});
    await sleep(200);
    assert.equal(settled,false,'cross-tab lock was not exclusive');
    assert.equal(await evaluate(A,'localStorage.getItem(key)'),beforeHold);
    await evaluate(A,'window.releaseHold();true');
    const afterHold=await waiting;
    assert.equal(afterHold.ok,true,afterHold.error);
    assert.deepEqual(await evaluate(A,'p.loadImprovePolicyStorage(localStorage).resourceTransactions.consumedIds'),['after-hold']);
    // Repeated real two-renderer contention; every round has the same funded snapshot.
    for (let round=0;round<20;round++) {
      const bytes=await evaluate(A,'(async()=>{await seed();window.snap=t.readRank5Plus5Snapshot(localStorage);return snap.storageBytes})()');
      for(let i=0;i<100 && await evaluate(B,'localStorage.getItem(key)')!==bytes;i++)await sleep(20);
      assert.equal(await evaluate(B,'localStorage.getItem(key)'),bytes);
      await evaluate(B,'window.snap=t.readRank5Plus5Snapshot(localStorage);true');
      const results=await Promise.all([
        attempt(A,`return t.commitRank5Plus5ResourcesExclusive(localStorage,snap,'round-${round}-a')`),
        attempt(B,`return t.commitRank5Plus5ResourcesExclusive(localStorage,snap,'round-${round}-b')`)
      ]);
      assert.equal(results.filter(result=>result.ok).length,1,'contention round '+round);
      assert.match(results.find(result=>!result.ok)?.error ?? '',/Stale/);
    }
    await evaluate(A,'(async()=>{await seed(2);return true})()');
    fixtureUrl=new URL('/ui-preview/',fixtureUrl).href;
    await Promise.all([A,B].map(tab=>tab.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false})));
    await Promise.all([navigate(A),navigate(B)]);
    for(const tab of [A,B]) {
      for(let i=0;i<200;i++){if(await evaluate(tab,"typeof improveUi!=='undefined'&&window.bellibingImproveSettings&&echoDataLoaded&&window.bellibingEchoSimulator"))break;await sleep(75)}
      await evaluate(tab,"addOwned('Augusta');show('improve');improvePicker.select('Augusta')");
      for(let i=0;i<200 && !await evaluate(tab,'window.bellibingImproveSettings.canAssessEchoRequirements()');i++)await sleep(75);
      assert.equal(await evaluate(tab,'window.bellibingImproveSettings.canAssessEchoRequirements()'),true,'UI requirements fully loaded');
      await evaluate(tab,'window.bellibingImproveSettings.whenIdle().then(()=>true)');
    }
    await evaluate(B,'improveUi.startSimulation();window.originalRandom=Math.random;Math.random=()=>0;document.getElementById("simulatorRoll").click();true');
    for(let i=0;i<200 && !await evaluate(B,"improveUi.simulator.run?.status==='EXHAUSTED'");i++)await sleep(25);
    await evaluate(B,'Math.random=originalRandom;true');
    assert.equal(await evaluate(B,"improveUi.simulator.run?.status==='EXHAUSTED'"),true);
    assert.equal(await evaluate(B,'improveUi.simulator.rolling.attempts>0'),true,'preservation fixture contains actual rolls');
    const histories=await evaluate(B,'JSON.stringify(improveUi.simulator.slots)');
    const sandbox=await evaluate(B,'JSON.stringify(improveWorkspaceSlots("Augusta"))');
    await evaluate(A,"document.getElementById('improve-setting-gate').click();const n=document.querySelector('[data-resource=echoes] input');n.value='19';n.onchange()");
    for(let i=0;i<100;i++){if(await evaluate(B,'window.bellibingResourceInventory.getState().echoes.count===19'))break;await sleep(50)}
    assert.equal(await evaluate(B,'window.bellibingResourceInventory.getState().echoes.count'),19,'native storage event updates second UI tab');
    assert.equal(await evaluate(B,'improveUi.resourcesChanged'),true,'external budget edit requires sandbox reset');
    assert.equal(await evaluate(B,'JSON.stringify(improveWorkspaceSlots("Augusta"))'),sandbox,'external edit retains sandbox equipment');
    assert.equal(await evaluate(B,'JSON.stringify(improveUi.simulator.slots)'),histories,'external edit retains rolled histories and trash');
    assert.equal(await evaluate(B,'document.getElementById("simulatorRoll").disabled'),true,'changed budget cannot continue old run');
    await evaluate(A,"document.querySelector('[data-focus-key=\"sonata:sonata-20\"]').click();true");
    for(let i=0;i<100;i++){if(await evaluate(B,'!window.bellibingImproveSettings.getSonataSetIds().includes("sonata-20")'))break;await sleep(50)}
    assert.equal(await evaluate(B,'window.bellibingImproveSettings.getSonataSetIds().includes("sonata-20")'),false,'native storage event updates Character-owned Sonata filters');
    // A slow valid save must not erase a newer invalid input or its error marker.
    await evaluate(A,`window.inputHoldReady=false;
      navigator.locks.request('bellibing.improve.policy.v3',{mode:'exclusive'},async()=>{
        window.inputHoldReady=true;await new Promise(resolve=>window.releaseInputHold=resolve)});true`);
    for(let i=0;i<100 && !await evaluate(A,'window.inputHoldReady');i++)await sleep(20);
    assert.equal(await evaluate(A,'window.inputHoldReady'),true);
    await evaluate(B,`document.getElementById('improve-setting-gate').click();
      window.resourceInput=document.querySelector('[data-resource=echoes] input');
      resourceInput.value='18';window.pendingInput=resourceInput.onchange();
      resourceInput.value='-1';resourceInput.dispatchEvent(new Event('input'));
      resourceInput.onchange();true`);
    await evaluate(A,'releaseInputHold();true');
    await evaluate(B,'pendingInput.then(()=>true)');
    assert.equal(await evaluate(B,'resourceInput.value'),'-1','earlier completion retains the newer input');
    assert.equal(await evaluate(B,'resourceInput.getAttribute("aria-invalid")'),'true','earlier success cannot clear a later validation error');
    assert.equal(await evaluate(B,'window.bellibingResourceInventory.getState().echoes.count'),18,'only the valid edit commits');
    // A pending save finishing mid-drag must retain the real DOM drag source.
    await B.send('Page.bringToFront');
    await evaluate(B,`(async()=>{resourceInput.value='18';resourceInput.dispatchEvent(new Event('input'));
      await resourceInput.onchange();
      const details=document.querySelector('.improve-other-stats');if(!details.open)details.querySelector('summary').click();
      document.querySelector('[data-focus-key="handle:HP%"] ').scrollIntoView({block:'center',behavior:'instant'});return true})()`);
    await evaluate(A,`window.dragHoldReady=false;
      navigator.locks.request('bellibing.improve.policy.v3',{mode:'exclusive'},async()=>{
        window.dragHoldReady=true;await new Promise(resolve=>window.releaseDragHold=resolve)});true`);
    for(let i=0;i<100 && !await evaluate(A,'window.dragHoldReady');i++)await sleep(20);
    assert.equal(await evaluate(A,'window.dragHoldReady'),true);
    await evaluate(B,`document.querySelector('[data-focus-key="gate:10"]').click();true`);
    await sleep(100);
    const sourcePoint=await evaluate(B,`(()=>{window.dragSource=document.querySelector('.improve-echo-row[data-stat-name="HP%"]');
      const r=dragSource.querySelector('.improve-policy-handle').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await B.send('Input.dispatchMouseEvent',{type:'mouseMoved',...sourcePoint});await sleep(600);
    const dragPoints=await evaluate(B,`(()=>{window.dragSource=document.querySelector('.improve-echo-row[data-stat-name="HP%"]');const a=dragSource.querySelector('.improve-policy-handle').getBoundingClientRect(),
      b=document.querySelector('[data-echo-section=flex]').getBoundingClientRect();
      return [{x:a.x+a.width/2,y:a.y+a.height/2},{x:b.x+b.width/2,y:b.y+16}]})()`);
    const [from,to]=dragPoints;
    await B.send('Input.dispatchMouseEvent',{type:'mouseMoved',...from});
    await B.send('Input.dispatchMouseEvent',{type:'mousePressed',...from,button:'left',buttons:1,clickCount:1});
    for(let step=1;step<=15;step++){await B.send('Input.dispatchMouseEvent',{type:'mouseMoved',
      x:from.x+(to.x-from.x)*step/15,y:from.y+(to.y-from.y)*step/15,button:'left',buttons:1});await sleep(25)}
    const dragStarted=await evaluate(B,'dragSource.classList.contains("is-dragging")');
    if(!dragStarted) console.error(await evaluate(B,`({rect:dragSource.getBoundingClientRect().toJSON(),open:document.querySelector('.improve-other-stats').open,expanded:document.getElementById('improve-setting-gate').getAttribute('aria-expanded'),hit:document.elementFromPoint(${from.x},${from.y})?.outerHTML.slice(0,300),viewport:[innerWidth,innerHeight],active:document.hasFocus()})`));
    assert.equal(dragStarted,true,'real native drag started');
    await evaluate(A,'releaseDragHold();true');
    await evaluate(B,'window.bellibingImproveSettings.whenIdle().then(()=>true)');
    assert.equal(await evaluate(B,'window.bellibingImproveSettings.getState().gate'),10,'older save finished during drag');
    assert.equal(await evaluate(B,'dragSource.isConnected'),true,'save cannot detach the active drag source');
    assert.equal(await evaluate(B,'dragSource.classList.contains("is-dragging")'),true,'save cannot end the active native gesture');
    await B.send('Input.dispatchMouseEvent',{type:'mouseMoved',...to,button:'left',buttons:1});await sleep(150);
    await B.send('Input.dispatchMouseEvent',{type:'mouseReleased',...to,button:'left',clickCount:1});
    await evaluate(B,'window.bellibingImproveSettings.whenIdle().then(()=>true)');
    assert.equal(await evaluate(B,'document.querySelector(\'.improve-echo-row[data-stat-name="HP%"]\').dataset.section'),'flex','real drop survives the concurrent save');
    console.log('PASS native UI storage events: shared budget/Sonatas, reset required, sandbox retained.');
    console.log('PASS BUG-045 Chromium: 2 tabs, 1 debit + receipt, stale Settings/Resources, direct/missing/rejected locks, quota/durable rollback and retry, stale mirrors, 20 contention rounds.');
  } finally { A.socket.close(); B.socket.close(); }
}
try { await main(); }
catch (error) { console.error(error); if (stderr.trim()) console.error(stderr.slice(-1400)); process.exitCode=1; }
finally { chrome.kill('SIGTERM'); }
