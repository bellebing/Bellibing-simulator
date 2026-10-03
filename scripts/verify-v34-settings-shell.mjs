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
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await sleep(32);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  await sleep(70);
}

async function capture(send, path) {
  const shot = await send('Page.captureScreenshot', { format:'png', fromSurface:true });
  mkdirSync('artifacts', { recursive:true }); writeFileSync(path, Buffer.from(shot.data,'base64'));
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
  try {
    await send('Page.enable'); await send('Runtime.enable');
    await setViewport(send,1440,900); await navigate(send);
    await evaluate(send,'localStorage.clear()'); await navigate(send);
    await waitForUi(send, 'releasedCharacters.length===57&&echoDataLoaded&&document.getElementById("improveSettings").dataset.sourceStatus!=="LOADING"', 'Settings sources not ready');
    await evaluate(send,"addOwned('Augusta');show('improve');improvePicker.select('Augusta')");
    const settle = async () => { await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:20,y:800}); await evaluate(send,'document.getElementById("improveShell").scrollTop=0'); await sleep(850); };
    const check = async (expression,message) => { if (!await evaluate(send,expression)) throw new Error(message); };
    const geometry = () => evaluate(send,`({settings:document.getElementById('improveSettings').getBoundingClientRect().toJSON(),card:document.getElementById('improveBuildCard').getBoundingClientRect().toJSON(),fields:[...document.querySelectorAll('.improve-setting-trigger')].map(n=>n.getBoundingClientRect().toJSON())})`);
    await settle();
    const baseline = await geometry();
    await check(`document.querySelectorAll('.improve-setting.is-expanded').length===0&&[...document.querySelectorAll('.improve-setting-expansion')].every(n=>n.inert&&n.getAttribute('aria-hidden')==='true')`, 'Collapsed state');
    await check(`JSON.stringify([...document.querySelectorAll('.improve-setting-label')].map(n=>n.textContent))==='["Character Target","Gate","Echo Policy","Roll Quality"]'&&[...document.querySelectorAll('.improve-setting')].every(n=>n.querySelector('label').getBoundingClientRect().bottom<=n.querySelector('button').getBoundingClientRect().top&&n.querySelector('button').children.length===2)&&[...document.querySelectorAll('.improve-setting-trigger')].every(n=>n.getBoundingClientRect().width<150)`, 'Labels above compact fields');
    await check(`(()=>{const h=document.getElementById('improveSettingsTitle').getBoundingClientRect(),s=document.getElementById('improveSettings').getBoundingClientRect();return Math.abs((h.left+h.right-s.left-s.right)/2)<1})()`, 'Heading true center');
    await check(`document.querySelector('[data-setting="target"] strong').textContent==='Recommended'&&document.querySelector('[data-setting="echo"] strong').textContent==='Recommended'`, 'Concise policy fields');
    const wheel = await evaluate(send,'document.querySelector("#improveWheel .choice").getBoundingClientRect().toJSON()');
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:wheel.x+wheel.width/2,y:wheel.y+wheel.height/2}); await sleep(850);
    await check(`document.getElementById('improveShell').classList.contains('hover-expanded')&&[...document.querySelectorAll('#improveWheel .choice')].every(n=>n.getBoundingClientRect().bottom+8<=document.getElementById('improveSettings').getBoundingClientRect().top)`, 'Physical selector hover clearance');
    await settle(); await capture(send,'artifacts/settings-shell-collapsed-1440x900.png');
    for (const id of ['target','gate','echo','quality']) {
      await pointerClick(send,'#improve-setting-'+id); await settle();
      await check(`document.querySelectorAll('.improve-setting.is-expanded').length===4&&[...document.querySelectorAll('.improve-setting-expansion')].every(n=>!n.inert&&getComputedStyle(n).visibility==='visible')`, 'All four sections open from '+id);
      const expanded = await geometry();
      if (expanded.card.top<=baseline.card.top+50||expanded.card.top<expanded.settings.bottom||expanded.card.width!==baseline.card.width||expanded.card.height!==baseline.card.height) throw new Error('Workspace flow/size');
      if (!expanded.fields.every((r,i)=>Math.abs(r.x-baseline.fields[i].x)<1&&Math.abs(r.y-baseline.fields[i].y)<1&&Math.abs(r.width-baseline.fields[i].width)<1)) throw new Error('Fields shifted on open');
      await check(`(()=>{const owners=[...document.querySelectorAll('.improve-setting')];return owners.every(n=>{const r=n.getBoundingClientRect(),p=n.querySelector('.improve-setting-expansion').getBoundingClientRect();return Math.abs(p.left-r.left)<1&&p.width<=r.width+1&&[...n.querySelectorAll('.improve-setting-options *')].every(c=>{const b=c.getBoundingClientRect();return !b.width||(b.left>=r.left-1&&b.right<=r.right+1)})})&&document.documentElement.scrollWidth===innerWidth})()`, 'Owned columns contain content');
      await pointerClick(send,'#improve-setting-'+id); await settle();
      await check(`document.querySelectorAll('.improve-setting.is-expanded').length===0`, 'Shared close from '+id);
    }
    await pointerClick(send,'#improve-setting-gate'); await settle();
    for (const [id,labels] of [['gate',['+5','+10','+15','+20','+25']],['quality',['All Rolls','Mid+','High+']]]) {
      await check(`(()=>{const nodes=[...document.querySelectorAll('[data-setting="${id}"] .improve-setting-list button')],r=nodes.map(n=>n.getBoundingClientRect());return JSON.stringify(nodes.map(n=>n.textContent))===${JSON.stringify(JSON.stringify(labels))}&&r.every((b,i)=>Math.abs(b.left-r[0].left)<1&&(!i||b.top>=r[i-1].bottom))})()`, 'Vertical '+id+' choices');
    }
    for (const [id,value] of [['gate','10'],['quality','Mid+']]) {
      await pointerClick(send,`[data-setting="${id}"] [data-setting-value="${value}"]`); await settle();
      await check(`document.querySelectorAll('.improve-setting.is-expanded').length===4&&document.querySelector('[data-setting="${id}"] [data-setting-value="${value}"]').getAttribute('aria-pressed')==='true'&&document.querySelector('[data-setting="${id}"] .improve-setting-summary').textContent===${JSON.stringify(id==='gate'?'+10':'Mid+')}&&document.activeElement.dataset.focusKey===${JSON.stringify(id+':'+value)}`, 'Selection remains open/highlighted '+id);
    }
    await check(`document.querySelector('[data-metric="TOTAL_ENERGY_REGEN"]').innerText.includes('Minimum 116%')&&document.querySelector('[data-policy-section="combinations"]').innerText.includes('At least 1 of:')`, 'Existing policy content retained');
    await capture(send,'artifacts/settings-shell-expanded-1440x900.png');
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27}); await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27}); await settle();
    await check(`document.querySelectorAll('.improve-setting.is-expanded').length===0&&document.activeElement.id==='improve-setting-gate'`, 'Escape closes and restores opener focus');
    console.log('PASS: real Google Chrome 1440×900; collapsed/shared expansion, all four openers, labels/compact fields, centered heading, vertical choices, +10/Mid+ retained open with highlight/focus, owned columns, workspace flow/size, selector hover clearance, Escape/focus.');
  } finally { socket.close(); }
} catch(error) { console.error(error); if(stderr.trim()) console.error(stderr.slice(-2000)); process.exitCode=1; }
finally { chrome.kill('SIGTERM'); }
