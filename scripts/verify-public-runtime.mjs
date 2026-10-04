import { mkdirSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const UI_URL = new URL('.', process.env.BELLIBING_LIVE_ROLL_ASSIST_URL ?? process.env.BELLIBING_ALPHA_URL ?? 'https://bellebing.github.io/Bellibing-simulator/').href;
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
  await send('Page.enable'); await send('Runtime.enable');
  await setViewport(send,1440,900);
  for (const route of ['', '?character=ciaccona&preset=ciaccona-cartethyia-aero', 'roll-assistant.html',
    'roll-assistant.html?character=augusta&preset=augusta-standard',
    'roll-assistant.html?character=unknown&preset=missing', 'echo-lab.html']) {
    await send('Page.navigate',{url:new URL(route,UI_URL).href});
    await waitForUi(send, '!!document.querySelector("[data-decision-status]")', 'Public Pending surface missing',15000);
    const result = await evaluate(send, `({status:document.querySelector('[data-decision-status]').dataset.decisionStatus,
      text:document.querySelector('[data-decision-status]').textContent, title:document.querySelector('h1').textContent,
      resources:performance.getEntriesByType('resource').map(row=>row.name)})`);
    if(result.status!=='PENDING'||result.text!=='Pending') throw new Error('Unavailable decision surface failed closed: '+route);
    if(result.resources.some(url=>/Evaluator|CheckpointAnalysis|targetCheckpointPolicy|ownedBuildAnalysis/.test(url))) throw new Error('Retired runtime requested by '+route);
    if(route==='echo-lab.html') {
      await pointerClick(send,'#generate'); await pointerClick(send,'#roll');
      const mechanics = await evaluate(send, `JSON.parse(document.getElementById('echoes').textContent)`);
      if(mechanics.echoes.length!==5||mechanics.echoes.some(echo=>echo.level!==5||echo.substats.length!==1)
        ||mechanics.spent.tuners!==50||mechanics.spent.exp!==22000) throw new Error('Canonical Echo mechanics failed');
    }
    console.log('PASS public runtime '+route);
  }
  mkdirSync('artifacts',{recursive:true});
  const shot=await send('Page.captureScreenshot',{format:'png'});
  writeFileSync('artifacts/public-echo-lab-1440x900.png',Buffer.from(shot.data,'base64'));
  socket.close();
} catch(error) { console.error(error); if(stderr)console.error(stderr); process.exitCode=1; }
finally { chrome.kill(); }
