import { mkdirSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const UI_URL = process.env.BELLIBING_V34_URL ?? 'http://127.0.0.1:4173/docs/ui-prototypes/v34-functional.html';
const DEBUG_PORT = Number(process.env.BELLIBING_V34_ECHO_DEBUG_PORT ?? 9671);
const CHROME = process.env.CHROME_BIN ?? 'google-chrome';
const VERIFY_MOBILE = process.env.BELLIBING_VERIFY_MOBILE === '1';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForChrome() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      if (response.ok) return;
    } catch {}
    await sleep(120);
  }
  throw new Error('Timed out waiting for Chrome DevTools.');
}

async function createPage() {
  const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' });
  if (!response.ok) throw new Error(`Failed to create Chrome page: ${response.status}`);
  return response.json();
}

function cdp(wsUrl) {
  const socket = new WebSocket(wsUrl);
  let serial = 0;
  const pending = new Map();
  const opened = new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data));
    if (!message.id) return;
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(message.error.message));
    else waiter.resolve(message.result);
  });
  async function send(method, params = {}) {
    await opened;
    const id = ++serial;
    const answer = new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
    socket.send(JSON.stringify({ id, method, params }));
    return answer;
  }
  return { socket, send };
}

async function evaluate(send, expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text ?? 'Runtime evaluation failed');
  }
  return result.result?.value;
}

async function navigate(send) {
  await send('Page.navigate', { url: UI_URL });
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    const ready = await evaluate(send, `document.readyState==='complete'&&document.querySelectorAll('#homeStage .home-card').length===3`);
    if (ready) return;
    await sleep(100);
  }
  throw new Error('UI preview did not become ready.');
}

async function setViewport(send, width, height) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width <= 768 });
  await sleep(80);
}

async function waitForUi(send, expression, message, timeout = 5000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(send, expression)) return;
    await sleep(50);
  }
  throw new Error(message);
}

async function pointerClick(send, selector) {
  await evaluate(send, `(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw new Error('Missing pointer target: '+${JSON.stringify(selector)});el.scrollIntoView({block:'center',inline:'center',behavior:'instant'})})()`);
  await sleep(50);
  const bounds = await evaluate(send, `(()=>{const el=document.querySelector(${JSON.stringify(selector)});const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,innerWidth,innerHeight}})()`);
  if (bounds.width <= 0 || bounds.height <= 0 || bounds.x + bounds.width <= 0 || bounds.y + bounds.height <= 0 || bounds.x >= bounds.innerWidth || bounds.y >= bounds.innerHeight) {
    throw new Error(`Pointer target is not visible: ${selector} ${JSON.stringify(bounds)}`);
  }
  const x = bounds.x + bounds.width * .5;
  const y = bounds.y + bounds.height * .5;
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await sleep(500);
  const current = await evaluate(send, `(()=>{const el=document.querySelector(${JSON.stringify(selector)}),r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return {x,y,hit:el.contains(document.elementFromPoint(x,y))}})()`);
  if (!current.hit) throw new Error('Pointer target covered '+selector+' '+JSON.stringify(current));
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x:current.x, y:current.y, button: 'left', clickCount: 1 });
  await sleep(32);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x:current.x, y:current.y, button: 'left', clickCount: 1 });
  await sleep(70);
}

const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
  // Headless Linux has no physical pointing device. Declare the desktop mouse
  // capabilities (as Playwright's Chromium launcher does), then send real CDP
  // mouse events. Do not force app classes or replace matchMedia in the page.
  '--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4',
  `--remote-debugging-port=${DEBUG_PORT}`, '--remote-debugging-address=127.0.0.1',
  '--user-data-dir='+join(tmpdir(),'bellibing-v34-echo-workspace-'+process.pid), 'about:blank',
], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
let stderr = '';
chrome.stderr.on('data', (chunk) => { stderr += String(chunk); });


try {
  await waitForChrome();
  const page = await createPage();
  const { socket, send } = cdp(page.webSocketDebuggerUrl);
  const read = expression => evaluate(send, expression);
  const check = async (expression, label) => { if (!await read(expression)) throw new Error(label+' '+JSON.stringify(await read('({state:window.bellibingImproveSettings.getState(),text:document.getElementById("improveSettings").innerText})'))); console.log('PASS '+label); };
  const click = async selector => { await pointerClick(send, selector); await sleep(100); };
  const focus = key => '#improveSettings [data-focus-key='+JSON.stringify(key)+']';
  const slider = (list, name) => focus('roll:'+list+':'+name);
  const state = 'window.bellibingImproveSettings.getState()';
  const key = async name => {
    await send('Input.dispatchKeyEvent', {type:'keyDown', key:name, code:name, windowsVirtualKeyCode:({ArrowLeft:37,ArrowRight:39,Home:36,End:35})[name]});
    await send('Input.dispatchKeyEvent', {type:'keyUp', key:name, code:name}); await sleep(80);
  };
  try {
    await send('Page.enable'); await send('Runtime.enable'); await setViewport(send,1440,900);
    await navigate(send); await read('localStorage.clear()'); await navigate(send);
    await waitForUi(send, 'releasedCharacters.length===57&&echoDataLoaded&&document.getElementById("improveSettings").dataset.sourceStatus==="READY" || releasedCharacters.length===57&&echoDataLoaded&&document.getElementById("improveSettings").dataset.sourceStatus==="PENDING"', 'Sources unavailable',15000);
    await read("addOwned('Augusta');show('improve');improvePicker.select('Augusta')"); await sleep(800);
    await waitForUi(send, 'document.getElementById("improveSettings").dataset.sourceStatus==="READY"', 'Augusta unavailable');
    await click('#improve-setting-every'); await sleep(500);
    await read('document.getElementById("improveShell").scrollTop=0');
    const targetBefore = await read('document.querySelector("[data-setting=target]").innerText');
    await check('JSON.stringify([...document.querySelectorAll(".improve-setting-label")].map(n=>n.textContent))===JSON.stringify(["Character Target","Gate","Every Echo","Flex Stats"])&&!/Roll Quality|All Rolls|Mid\\+|High\\+|Threshold mapping/.test(document.getElementById("improveSettings").innerText)', 'Roll Quality removed; four columns');
    await check(`(()=>{const owners=[...document.querySelectorAll('.improve-setting')], root=document.getElementById('improveSettings').getBoundingClientRect();return owners.every((n,i)=>{const r=n.getBoundingClientRect();return r.left>=root.left&&r.right<=root.right&&(!i||owners[i-1].getBoundingClientRect().right<=r.left)})&&[...document.querySelectorAll('.improve-roll-slider')].every(n=>n.getBoundingClientRect().width>=65)&&[...document.querySelectorAll('.improve-echo-row')].every(n=>n.scrollWidth<=n.clientWidth+1)&&document.documentElement.scrollWidth===1440})()`, '1440×900 columns, readable sliders, compact rows fit');
    for (const [list,name,value,index] of [['every','CRIT Rate','9.3%',5],['every','CRIT DMG','21%',7],['flex','ATK%','6.4%',0],['flex','Energy Regen','6.8%',0],['flex','Heavy Attack DMG','6.4%',0]]) {
      const sel=JSON.stringify(slider(list,name));
      await check(`(()=>{const n=document.querySelector(${sel});return n.disabled&&Number(n.value)===${index}&&n.getAttribute('aria-valuetext')===${JSON.stringify(value)}&&n.parentElement.querySelector('output').textContent===${JSON.stringify(value)}})()`, 'Recommended '+name+' '+value+' exact disabled position');
    }
    await check(`document.querySelector('[data-setting=flex] .improve-build-need h3').textContent==='Build Need'&&document.querySelector('[data-setting=flex] .improve-build-need p').textContent==='Pending'&&document.querySelector('[data-setting=gate] .improve-setting-summary').textContent==='+5'&&${state}.overrides.echoPreferences===undefined`, 'Build Need Pending; Gate unchanged; no fabricated Recommended preference');
    await click(focus('mode:MANUAL'));
    await check('[...document.querySelectorAll(".improve-roll-slider")].every(n=>!n.disabled)', 'Customize unlocks same sliders');
    await click(slider('every','CRIT Rate')); await key('Home');
    const expected=['6.3%','6.9%','7.5%','8.1%','8.7%','9.3%','9.9%','10.5%'];
    for(let index=0;index<expected.length;index++) {
      if(index) await key('ArrowRight');
      await check(`(()=>{const n=document.querySelector(${JSON.stringify(slider('every','CRIT Rate'))});return Number(n.value)===${index}&&n.getAttribute('aria-valuetext')===${JSON.stringify(expected[index])}&&n.parentElement.querySelector('output').textContent===${JSON.stringify(expected[index])}&&${state}.overrides.echoRequirements.requiredOnEveryEcho.find(r=>r.stat==='CRIT Rate').minimum===[.063,.069,.075,.081,.087,.093,.099,.105][${index}]})()`, 'CRIT Rate keyboard exact tier '+expected[index]);
    }
    await key('ArrowLeft'); await check(`${state}.overrides.echoRequirements.requiredOnEveryEcho.find(r=>r.stat==='CRIT Rate').minimum===.099`, 'Left moves one tier');
    await key('Home'); await key('End');
    await check(`${state}.overrides.echoRequirements.requiredOnEveryEcho.find(r=>r.stat==='CRIT Rate').minimum===.105`, 'Home/End canonical endpoints');
    for (const [list,name,value,minimum] of [['every','CRIT DMG','21%',.21],['flex','ATK%','11.6%',.116],['flex','Energy Regen','12.4%',.124],['flex','Heavy Attack DMG','11.6%',.116]]) {
      await click(slider(list,name)); await key('End');
      await check(`(()=>{const n=document.querySelector(${JSON.stringify(slider(list,name))});return n.getAttribute('aria-valuetext')===${JSON.stringify(value)}&&n.parentElement.querySelector('output').textContent===${JSON.stringify(value)}})()`, name+' own canonical endpoint');
    }
    // Native pointer drag must update on input, retain pointer ownership, and save.
    await read(`document.querySelector(${JSON.stringify(slider('every','CRIT Rate'))}).scrollIntoView({block:'center'})`);
    const bounds=await read(`document.querySelector(${JSON.stringify(slider('every','CRIT Rate'))}).getBoundingClientRect().toJSON()`);
    const x=bounds.right-5,y=bounds.y+bounds.height/2;
    await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:bounds.left+5,y,button:'left',buttons:1});
    await check(`${state}.overrides.echoRequirements.requiredOnEveryEcho.find(r=>r.stat==='CRIT Rate').minimum===.063&&document.querySelector(${JSON.stringify(slider('every','CRIT Rate'))}).parentElement.querySelector('output').textContent==='6.3%'`, 'Pointer drag updates value immediately before release');
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:bounds.left+5,y,button:'left',clickCount:1});
    await click(focus('every:Energy Regen'));
    await check(`!document.querySelector(${JSON.stringify(slider('flex','Energy Regen'))})&&document.querySelector('[data-setting=flex] [data-stat-name="Energy Regen"] button').disabled&&document.querySelector('[data-setting=flex] [data-stat-name="Energy Regen"]').innerText.includes('Required')&&${state}.overrides.echoPreferences.every(r=>r.stat!=='Energy Regen')`, 'Every Echo/Flex single active owner');
    await click(focus('every:Energy Regen')); await click(focus('flex:Energy Regen'));
    await check(`document.querySelector(${JSON.stringify(slider('flex','Energy Regen'))}).getAttribute('aria-valuetext')==='6.8%'`, 'Reactivated Flex uses source-backed minimum');
    await click(focus('flex:ATK%'));
    await check(`!document.querySelector(${JSON.stringify(slider('flex','ATK%'))})&&document.querySelector('[data-setting=flex] [data-stat-name="ATK%"]:not(.is-active)')`, 'Inactive stats keep neutral rows without sliders');
    await click(focus('flex:ATK%')); await click(slider('flex','ATK%')); await key('End');
    const saved=await read(`${state}.overrides`);
    await navigate(send);
    await waitForUi(send, 'releasedCharacters.length===57&&document.getElementById("improveSettings").dataset.sourceStatus!=="LOADING"', 'Reload source readiness',15000);
    await read("show('improve');improvePicker.select('Augusta')");
    await waitForUi(send, `${state}?.characterId==='augusta'&&document.getElementById('improveSettings').dataset.sourceStatus==='READY'`, 'Reload failed',15000);
    await check(`JSON.stringify(${state}.overrides)===${JSON.stringify(JSON.stringify(saved))}`, 'Save/reload retains custom thresholds and selection');
    await click('#improve-setting-flex'); await sleep(500);
    await click(focus('reset:echo'));
    await check(`${state}.overrides.echoRequirements===undefined&&${state}.overrides.echoPreferences===undefined&&document.querySelector(${JSON.stringify(slider('every','CRIT Rate'))}).getAttribute('aria-valuetext')==='9.3%'&&document.querySelector(${JSON.stringify(slider('flex','ATK%'))}).getAttribute('aria-valuetext')==='6.4%'`, 'Reset restores source thresholds and selection/order');
    await click(focus('mode:RECOMMENDED'));
    await check(`document.querySelector('[data-setting=target]').innerText===${JSON.stringify(targetBefore)}&&[...document.querySelectorAll('.improve-roll-slider')].every(n=>n.disabled)`, 'Character Target unchanged; Recommended remains read-only');
    await read('document.getElementById("improveShell").scrollTop=0'); await sleep(400);
    const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true});
    mkdirSync('artifacts',{recursive:true});writeFileSync('artifacts/pr224-minimum-roll-1440.png',Buffer.from(shot.data,'base64'));
    console.log('Focused minimum-roll verification PASS in real Chrome at 1440×900 only.');
  } finally { socket.close(); }
} catch(error) { console.error(error);console.error(stderr.slice(-2000));process.exitCode=1; }
finally { chrome.kill('SIGTERM'); }
