import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const UI_URL = process.env.BELLIBING_UI_PREVIEW_URL ?? 'http://127.0.0.1:4173/ui-preview/';
const DEBUG_PORT = Number(process.env.UI_CAROUSEL_CHROME_DEBUG_PORT ?? 9556);
const CHROME = process.env.CHROME_BIN ?? 'google-chrome';
const MATRIX = [[390,844],[768,1024],[1440,900],[1920,1080],[2560,1440],[3440,1440],[7680,2160]];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForJsonVersion() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch('http://127.0.0.1:' + DEBUG_PORT + '/json/version');
      if (response.ok) return response.json();
    } catch {}
    await sleep(150);
  }
  throw new Error('Timed out waiting for Chrome DevTools endpoint.');
}

async function createPage() {
  const response = await fetch('http://127.0.0.1:' + DEBUG_PORT + '/json/new?' + encodeURIComponent('about:blank'), { method: 'PUT' });
  if (!response.ok) throw new Error('Failed to create Chrome page: HTTP ' + response.status);
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
    const result = new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
    socket.send(JSON.stringify({ id, method, params }));
    return result;
  }
  return { socket, send };
}

async function evaluate(send, expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) {
    const detail = result.exceptionDetails.exception?.description ?? result.exceptionDetails.text ?? 'Runtime.evaluate failed';
    throw new Error(detail);
  }
  return result.result?.value;
}

async function setViewport(send, width, height) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width <= 768 });
}

async function navigate(send) {
  await send('Page.navigate', { url: UI_URL });
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const ready = await evaluate(send, "({href:location.href,state:document.readyState,homeCards:document.querySelectorAll('#homeStage .home-card').length})");
      if (String(ready.href).startsWith(UI_URL) && ready.state === 'complete' && ready.homeCards === 3) return;
    } catch {}
    await sleep(100);
  }
  throw new Error('Timed out waiting for New UI runtime.');
}

async function readHome(send) {
  return evaluate(send, "(()=>{const shell=document.getElementById('homeShell').getBoundingClientRect();const stage=document.getElementById('homeStage');const cards=[...stage.querySelectorAll('.home-card')];const rects=cards.map(c=>c.getBoundingClientRect());const visible=r=>Math.max(0,Math.min(innerWidth,r.right)-Math.max(0,r.left));return{pageScrollWidth:document.documentElement.scrollWidth,shell:{left:shell.left,right:shell.right,width:shell.width},focus:Number(stage.dataset.focus),total:Number(stage.dataset.total),cardCount:cards.length,titlesOneLine:cards.every(c=>{const t=c.querySelector('.home-card-title');return t.scrollWidth<=t.clientWidth+1}),localChildren:cards.every(c=>{const cr=c.getBoundingClientRect(),t=c.querySelector('.home-card-title').getBoundingClientRect(),a=c.querySelector('.home-card-art').getBoundingClientRect();return t.left>=cr.left-1&&t.right<=cr.right+1&&a.left>=cr.left-1&&a.right<=cr.right+1}),sideVisible:[visible(rects[0]),visible(rects[2])]}})()");
}

function assertShell(state, width, label) {
  if (state.pageScrollWidth > width + 1) throw new Error(label + ': horizontal page scroll at ' + width + 'px.');
  if (state.shell.width > 1440.5) throw new Error(label + ': AppShell exceeded 1440px.');
  const center = (state.shell.left + state.shell.right) / 2;
  if (Math.abs(center - width / 2) > 1.5) throw new Error(label + ': AppShell is not centered.');
}

function assertHome(state, width, height) {
  assertShell(state, width, 'Home ' + width + 'x' + height);
  if (state.cardCount !== 3 || state.total !== 3 || state.focus !== 2) throw new Error('Home must start at focus 2/3.');
  if (!state.titlesOneLine || !state.localChildren) throw new Error('Home card-local title/art contract failed.');
  if (width <= 768 && state.sideVisible.some((value) => value < 18)) throw new Error('Mobile Home neighbor peek is missing.');
}

async function enterBuild(send) {
  await evaluate(send, "document.querySelector('#homeStage .home-card[aria-label=\"Build a Character\"]').click()");
  await sleep(750);
  const focus = await evaluate(send, "Number(document.getElementById('homeStage').dataset.focus)");
  if (focus !== 1) throw new Error('Home Build card did not become focused.');
  await evaluate(send, "document.querySelector('#homeStage .home-card[aria-label=\"Build a Character\"]').click()");
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const state = await evaluate(send, "({active:document.getElementById('build').classList.contains('active'),count:document.querySelectorAll('#buildWheel .choice').length,loaded:[...document.querySelectorAll('#buildWheel .choice img')].filter(i=>i.complete&&i.naturalWidth>0).length})");
    if (state.active && state.count === 57 && state.loaded === 57) { await sleep(900); return; }
    await sleep(100);
  }
  throw new Error('Timed out entering Build with 57 loaded Character portraits.');
}

async function readBuild(send) {
  return evaluate(send, "(()=>{const app=document.querySelector('#build > .app-shell').getBoundingClientRect(),wheel=document.getElementById('buildWheel'),wr=wheel.getBoundingClientRect(),cards=[...wheel.querySelectorAll('.choice')],images=cards.map(c=>c.querySelector('img')),names=cards.map(c=>c.getAttribute('aria-label')),placements=cards.map(c=>{const n=c.querySelector('.choice-name').getBoundingClientRect(),p=c.querySelector('.choice-portrait').getBoundingClientRect();return{nameBottom:n.bottom,portraitTop:p.top,w:p.width,h:p.height}});return{pageScrollWidth:document.documentElement.scrollWidth,shell:{left:app.left,right:app.right,width:app.width},wheel:{x:wr.x,y:wr.y,width:wr.width,height:wr.height},count:cards.length,loaded:images.filter(i=>i?.complete&&i.naturalWidth>0).length,names,namesAbovePortrait:placements.every(e=>e.nameBottom<=e.portraitTop+.5),squarePortraitFrames:placements.every(e=>Math.abs(e.w-e.h)<=1),noHeaderWrap:cards.every(c=>{const n=c.querySelector('.choice-name');return n.scrollWidth<=n.clientWidth+1}),objectFit:images[0]?getComputedStyle(images[0]).objectFit:null,objectPosition:images[0]?getComputedStyle(images[0]).objectPosition:null,focus:Number(wheel.dataset.focus),total:Number(wheel.dataset.total)}})()");
}

function assertBuild(state, width, height) {
  assertShell(state, width, 'Build ' + width + 'x' + height);
  if (state.count !== 57 || state.loaded !== 57 || state.total !== 57) throw new Error('Expected 57 released Character cards / portraits.');
  if (!state.namesAbovePortrait || !state.squarePortraitFrames || !state.noHeaderWrap) throw new Error('Character card framing/header contract failed.');
  if (state.objectFit !== 'contain' || state.objectPosition !== '50% 50%') throw new Error('Character portraits are cropped or re-anchored.');
  for (const forbidden of ['Jingran','Hsin','Suoming']) if (state.names.includes(forbidden)) throw new Error('Released selector includes ' + forbidden + '.');
  for (const rover of ['Rover (Aero)','Rover (Electro)','Rover (Havoc)','Rover (Spectro)']) if (!state.names.includes(rover)) throw new Error('Missing ' + rover + '.');
}

async function dragBuild(send, state) {
  const b = state.wheel, y = b.y + b.height * .5, startX = b.x + b.width * .76, endX = b.x + b.width * .10, before = state.focus;
  await evaluate(send, "(()=>{const w=document.getElementById('buildWheel');w.__dragTrace={down:0,move:0,up:0};w.addEventListener('pointerdown',()=>w.__dragTrace.down++,{once:true});w.addEventListener('pointermove',()=>w.__dragTrace.move++);w.addEventListener('pointerup',()=>w.__dragTrace.up++,{once:true})})()");
  const hit = await evaluate(send, "(()=>{const page=document.getElementById('build'),app=document.querySelector('#build>.app-shell'),shell=document.getElementById('buildShell'),w=document.getElementById('buildWheel'),r=w.getBoundingClientRect(),ar=app.getBoundingClientRect(),sr=shell.getBoundingClientRect(),x=r.x+r.width*.76,y=r.y+r.height*.5,e=document.elementFromPoint(x,y),cs=getComputedStyle(shell);return{tag:e?.tagName||null,className:e?.className||null,inWheel:!!(e&&w.contains(e)),x,y,windowScrollY:scrollY,pageScrollTop:page.scrollTop,pageClass:page.className,shellClass:shell.className,shellTransform:cs.transform,shellPosition:cs.position,appRect:{x:ar.x,y:ar.y,width:ar.width,height:ar.height},shellRect:{x:sr.x,y:sr.y,width:sr.width,height:sr.height},rect:{x:r.x,y:r.y,width:r.width,height:r.height}}})()");
  await send('Input.dispatchMouseEvent', { type:'mouseMoved', x:startX, y });
  await send('Input.dispatchMouseEvent', { type:'mousePressed', x:startX, y, button:'left', clickCount:1 });
  for (let step=1; step<=12; step++) {
    const x = startX + (endX-startX) * (step/12);
    await send('Input.dispatchMouseEvent', { type:'mouseMoved', x, y, button:'left', buttons:1 });
    await sleep(12);
  }
  await send('Input.dispatchMouseEvent', { type:'mouseReleased', x:endX, y, button:'left', clickCount:1 });
  await sleep(850);
  const after = await evaluate(send, "(()=>{const w=document.getElementById('buildWheel');return{focus:Number(w.dataset.focus),dragging:w.classList.contains('dragging'),trace:w.__dragTrace||null}})()");
  if (after.focus - before < 2) throw new Error('Expected multi-card drag, got ' + before + ' -> ' + after.focus + '; hit=' + JSON.stringify(hit) + '; trace=' + JSON.stringify(after.trace) + '.');
  if (after.dragging) throw new Error('Build wheel stayed in dragging state.');
  return { before, after: after.focus };
}

async function activateFocused(send) {
  const selected = await evaluate(send, "(()=>{const w=document.getElementById('buildWheel'),i=Number(w.dataset.focus)-1,c=w.querySelectorAll('.choice')[i];if(!c)throw new Error('Focused card missing');const label=c.getAttribute('aria-label');c.click();return label})()");
  await sleep(450);
  const state = await evaluate(send, "({hasSelection:document.getElementById('buildShell').classList.contains('has-selection'),name:document.getElementById('buildName').textContent.trim()})");
  if (!state.hasSelection || state.name !== selected) throw new Error('Centered Character activation failed.');
  return selected;
}

async function screenshot(send, path) {
  mkdirSync('artifacts', { recursive:true });
  const capture = await send('Page.captureScreenshot', { format:'png', captureBeyondViewport:false });
  writeFileSync(path, Buffer.from(capture.data, 'base64'));
}

const chrome = spawn(CHROME, [
  '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--hide-scrollbars',
  '--remote-debugging-port=' + DEBUG_PORT,'--remote-debugging-address=127.0.0.1',
  '--user-data-dir=/tmp/bellibing-ui-carousel-runtime-chrome','about:blank',
], { stdio:['ignore','pipe','pipe'] });

let stderr = '';
chrome.stderr.on('data', (chunk) => { stderr += String(chunk); });

try {
  await waitForJsonVersion();
  const page = await createPage();
  if (!page.webSocketDebuggerUrl) throw new Error('Chrome page has no DevTools WebSocket URL.');
  const { socket, send } = cdp(page.webSocketDebuggerUrl);
  try {
    await send('Page.enable');
    await send('Runtime.enable');
    const report = [];
    for (const [width,height] of MATRIX) {
      await setViewport(send,width,height);
      await navigate(send);
      const home = await readHome(send); assertHome(home,width,height);
      await enterBuild(send);
      const build = await readBuild(send); assertBuild(build,width,height);
      report.push(width + 'x' + height);
      if ((width===390&&height===844)||(width===1440&&height===900)||(width===7680&&height===2160)) {
        await screenshot(send,'artifacts/ui-carousel-runtime-build-' + width + 'x' + height + '.png');
      }
    }

    await setViewport(send,1440,900); await navigate(send); await enterBuild(send);
    const desktop = await readBuild(send); const desktopDrag = await dragBuild(send,desktop); const desktopSelected = await activateFocused(send);
    await setViewport(send,390,844); await navigate(send); await enterBuild(send);
    const mobile = await readBuild(send); const mobileDrag = await dragBuild(send,mobile); const mobileSelected = await activateFocused(send);

    console.log('New UI runtime carousel verified in real Chrome:');
    console.log('- responsive matrix: ' + report.join(', '));
    console.log('- finite centered AppShell <= 1440px on Home and Build');
    console.log('- Home: 3 cards, Improve default focus, mobile neighbor peeks');
    console.log('- Build: 57 released Character cards / 57 loaded portraits from canonical manifest');
    console.log('- one-line header-first names; uncropped square card-local portrait frames');
    console.log('- desktop drag ' + desktopDrag.before + '/57 -> ' + desktopDrag.after + '/57; selected ' + desktopSelected);
    console.log('- mobile drag ' + mobileDrag.before + '/57 -> ' + mobileDrag.after + '/57; selected ' + mobileSelected);
  } finally {
    socket.close();
  }
} catch (error) {
  console.error(error);
  if (stderr.trim()) console.error(stderr.slice(-4000));
  process.exitCode = 1;
} finally {
  chrome.kill('SIGTERM');
}
