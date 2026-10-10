// BUG-045: real multi-tab Chromium, same-origin native localStorage and Web Locks.
// Runs against the exact dist/ browser bundle after the strict build; no fake lock/CAS.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const PORT = Number(process.env.BELLIBING_CROSS_TAB_DEBUG_PORT ?? 9774);
const CHROME = process.env.CHROME_BIN ?? 'google-chrome';
const URL = process.env.BELLIBING_CROSS_TAB_URL ?? 'http://127.0.0.1:4173/REVIEW_UI_PREVIEW.txt';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu',
  '--disable-dev-shm-usage', '--remote-debugging-address=127.0.0.1',
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
  await p.send('Page.navigate',{url:URL});
  for(let i=0;i<150;i++) {
    if (await evaluate(p,"document.readyState === 'complete' && location.origin === 'http://127.0.0.1:4173'")) return;
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
      window.seed=(count=1)=>{let inv=window.r.emptyResourceInventory();
        for(const [id,n] of [['echoes',count],['tuners',count*10],['shellCredits',count*2440],['basic',count*9]])
          inv=window.r.updateResourceInventory(inv,id,{kind:'FINITE',count:n});
        localStorage.setItem(window.key,JSON.stringify({version:3,characters:{},pendingV2Characters:{},resourceInventory:inv}));
      };
      true`;
    await Promise.all([evaluate(A,'(async()=>{'+setup+'})()'),evaluate(B,'(async()=>{'+setup+'})()')]);
    assert.equal(await evaluate(A,'!!navigator.locks && typeof navigator.locks.request==="function"'),true,'Chromium Web Locks unavailable');
    // Both snapshots from before either exclusive commit: exactly one paid attempt.
    await evaluate(A,'localStorage.clear();seed();window.snap=t.readRank5Plus5Snapshot(localStorage);true');
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
    // Quota/serialization write error must preserve bytes and allow safe retry.
    await evaluate(A,"seed();window.retrySnap=t.readRank5Plus5Snapshot(localStorage);true");
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
    // A real lock held in one tab forces the other tab to wait, not race writes.
    await evaluate(A,`seed();window.holding=false;
      window.hold=navigator.locks.request(key,{mode:'exclusive'},async()=>{window.holding=true;await new Promise(resolve=>window.releaseHold=resolve)});
      true`);
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
    console.log('PASS BUG-045 Chromium: 2 tabs, 1 debit + receipt, stale Settings/Resources, direct/missing/rejected locks, quota retry, exclusive contention.');
  } finally { A.socket.close(); B.socket.close(); }
}
try { await main(); }
catch (error) { console.error(error); if (stderr.trim()) console.error(stderr.slice(-1400)); process.exitCode=1; }
finally { chrome.kill('SIGTERM'); }
