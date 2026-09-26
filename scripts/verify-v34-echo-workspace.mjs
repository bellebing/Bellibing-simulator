import { mkdirSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';

const UI_URL = process.env.BELLIBING_V34_URL ?? 'http://127.0.0.1:4173/ui-preview/';
const DEBUG_PORT = Number(process.env.BELLIBING_V34_ECHO_DEBUG_PORT ?? 9671);
const CHROME = process.env.CHROME_BIN ?? 'google-chrome';
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
  const shot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  mkdirSync('artifacts', { recursive: true });
  writeFileSync(path, Buffer.from(shot.data, 'base64'));
}

async function prepareBuild(send, characterName = 'Augusta') {
  await waitForUi(send, `releasedCharacters.length===57&&document.documentElement.dataset.echoCatalogReady==='true'&&document.documentElement.dataset.weaponCatalogReady==='true'`, 'Canonical UI data did not load', 15000);
  await evaluate(send, `(()=>{show('build');buildPicker.reset();buildPicker.render();buildPicker.select(${JSON.stringify(characterName)});return true})()`);
  await waitForUi(send, `buildPicker.selected===${JSON.stringify(characterName)}&&echoUi.characterName===${JSON.stringify(characterName)}`, 'Build Character did not bind Echo UI');
  await evaluate(send, `document.querySelector('.echo[data-echo-slot="0"]')?.scrollIntoView({block:'center',inline:'center',behavior:'instant'})`);
  await waitForUi(send, `(()=>{const host=document.querySelector('.echoes'),slot=document.querySelector('.echo[data-echo-slot="0"]');if(!host||!slot||parseFloat(getComputedStyle(host).opacity)<.99)return false;const r=slot.getBoundingClientRect();if(r.width<=0||r.height<=0||r.bottom<=0||r.top>=innerHeight)return false;const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return slot===hit||slot.contains(hit)})()`, 'Settled Build Echo slot was not physically hit-testable', 2500);
}

async function verifyFilter(send, filter) {
  await pointerClick(send, `[data-echo-filter="${filter}"]`);
  const result = await evaluate(send, `(()=>{const filter=${JSON.stringify(filter)},all=[...document.querySelectorAll('#echoChoices .echo-choice')],visible=all.filter(x=>!x.hidden),expected=echoCatalog.filter(item=>filter==='all'||String(item.cost)===filter);return{filter,total:all.length,visible:visible.length,expected:expected.length,bad:visible.filter(x=>filter!=='all'&&x.dataset.cost!==filter).map(x=>x.dataset.echoId),active:document.querySelector('.echo-filter.active')?.dataset.echoFilter||null}})()`);
  if (result.total !== 181 || result.visible !== result.expected || result.bad.length || result.active !== filter) {
    throw new Error(`Echo Cost filter failed: ${JSON.stringify(result)}`);
  }
}

async function verifyDesktop(send) {
  await setViewport(send, 1440, 900);
  await navigate(send);
  await evaluate(send, 'localStorage.clear()');
  await navigate(send);
  await prepareBuild(send, 'Augusta');

  await evaluate(send, `(()=>{window.__echoPointerAudit=[];for(const type of ['pointerdown','pointerup','click'])document.addEventListener(type,event=>{const choice=event.target?.closest?.('.echo-choice');const slot=event.target?.closest?.('[data-echo-slot],[data-echo-target]');window.__echoPointerAudit.push({type,echoId:choice?.dataset.echoId||null,slot:slot?.dataset.echoSlot??slot?.dataset.echoTarget??null});},true);return true})()`);

  await pointerClick(send, '.echo[data-echo-slot="0"]');
  await waitForUi(send, `echoUi.open&&document.getElementById('echoOverlay').classList.contains('mounted')`, 'Physical Build Echo-slot click did not open workspace');
  await waitForUi(send, `[...document.querySelectorAll('#echoChoices .echo-choice img')].length===181&&[...document.querySelectorAll('#echoChoices .echo-choice img')].every(img=>img.complete&&img.naturalWidth>0)`, 'Canonical Echo artwork did not fully resolve in browser', 12000);

  const opened = await evaluate(send, `(()=>({target:echoUi.targetSlot,workspaceSlots:document.querySelectorAll('#echoWorkspaceSlots .echo-workspace-slot').length,cards:document.querySelectorAll('#echoChoices .echo-choice').length,scrollable:document.getElementById('echoBrowser').scrollHeight>document.getElementById('echoBrowser').clientHeight,allArtLoaded:[...document.querySelectorAll('#echoChoices .echo-choice img')].every(img=>img.complete&&img.naturalWidth>0),filter:echoUi.filter,previewId:echoUi.previewId,storage:localStorage.getItem('bellibing-ui-checkpoint-v34')}))()`);
  if (opened.target !== 0 || opened.workspaceSlots !== 5 || opened.cards !== 181 || !opened.scrollable || !opened.allArtLoaded || opened.filter !== 'all' || opened.previewId !== null) {
    throw new Error(`Echo Workspace opening contract failed: ${JSON.stringify(opened)}`);
  }

  await verifyFilter(send, '4');
  await verifyFilter(send, '3');
  await verifyFilter(send, '1');
  await verifyFilter(send, 'all');

  const ids = await evaluate(send, `echoCatalog.slice(0,6).map(item=>item.id)`);
  if (!Array.isArray(ids) || ids.length < 6) throw new Error('Echo browser did not expose enough canonical cards.');

  const beforePreview = await evaluate(send, `localStorage.getItem('bellibing-ui-checkpoint-v34')`);
  await pointerClick(send, `#echoChoices .echo-choice[data-echo-id="${ids[0]}"]`);
  await waitForUi(send, `echoUi.previewId===${JSON.stringify(ids[0])}`, 'Physical Echo card click did not enter Preview');
  const preview = await evaluate(send, `(()=>{const item=echoById.get(${JSON.stringify(ids[0])}),art=document.getElementById('echoPreviewArt');return{previewId:echoUi.previewId,savedSlot:draft(buildPicker.selected).build.echoSets?.sets?.['set-1']?.slots?.[0]??null,storage:localStorage.getItem('bellibing-ui-checkpoint-v34'),cardStillPresent:!!document.querySelector('#echoChoices .echo-choice[data-echo-id="${ids[0]}"]'),artSrc:art.getAttribute('src'),artLoaded:art.complete&&art.naturalWidth>0,name:document.getElementById('echoPreviewName').textContent.trim(),cost:document.getElementById('echoPreviewCost').textContent.trim(),sonatas:[...document.querySelectorAll('#echoPreviewSonatas .echo-sonata-chip')].map(x=>x.textContent.trim()),expectedSonatas:item.sonataSetIds.map(id=>echoSonataById.get(id)?.name)}})()`);
  if (preview.savedSlot !== null || preview.storage !== beforePreview || !preview.cardStillPresent || !preview.artLoaded || preview.name !== (await evaluate(send, `echoById.get(${JSON.stringify(ids[0])}).name`)) || JSON.stringify(preview.sonatas) !== JSON.stringify(preview.expectedSonatas)) {
    throw new Error(`Echo grid click mutated committed state or Preview failed: ${JSON.stringify(preview)}`);
  }
  const pointerAudit = await evaluate(send, `window.__echoPointerAudit.filter(x=>x.echoId===${JSON.stringify(ids[0])})`);
  if (!pointerAudit.some(x=>x.type==='pointerdown') || !pointerAudit.some(x=>x.type==='pointerup') || !pointerAudit.some(x=>x.type==='click')) {
    throw new Error(`Echo card did not receive a physical mouse pointerdown/up/native click chain: ${JSON.stringify(pointerAudit)}`);
  }

  await pointerClick(send, '#echoEquip');
  await waitForUi(send, `draft(buildPicker.selected).build.echoSets?.sets?.['set-1']?.slots?.[0]===${JSON.stringify(ids[0])}`, 'Equip Echo did not commit slot 1');
  const firstCommit = await evaluate(send, `(()=>{const e=draft(buildPicker.selected).build.echoSets;return{open:echoUi.open,previewId:echoUi.previewId,activeSetId:e.activeSetId,defaultSetId:e.defaultSetId,setName:e.sets?.['set-1']?.name,slots:e.sets?.['set-1']?.slots,buildHas:document.querySelector('.echo[data-echo-slot="0"]').classList.contains('has-echo')}})()`);
  if (!firstCommit.open || firstCommit.previewId !== ids[0] || firstCommit.activeSetId !== 'set-1' || firstCommit.defaultSetId !== 'set-1' || firstCommit.setName !== 'Set 1' || firstCommit.slots[0] !== ids[0] || !firstCommit.buildHas) {
    throw new Error(`Equip Echo commit/state shape failed: ${JSON.stringify(firstCommit)}`);
  }

  for (let slot = 1; slot < 5; slot++) {
    await pointerClick(send, `#echoWorkspaceSlots [data-echo-target="${slot}"]`);
    await waitForUi(send, `echoUi.targetSlot===${slot}`, `Echo target slot ${slot + 1} did not activate`);
    await pointerClick(send, `#echoChoices .echo-choice[data-echo-id="${ids[slot]}"]`);
    await waitForUi(send, `echoUi.previewId===${JSON.stringify(ids[slot])}`, `Echo slot ${slot + 1} Preview did not change`);
    await pointerClick(send, '#echoEquip');
    await waitForUi(send, `draft(buildPicker.selected).build.echoSets?.sets?.['set-1']?.slots?.[${slot}]===${JSON.stringify(ids[slot])}`, `Equip Echo targeted wrong slot ${slot + 1}`);
  }

  const committedSlots = await evaluate(send, `draft(buildPicker.selected).build.echoSets.sets['set-1'].slots.slice()`);
  if (JSON.stringify(committedSlots) !== JSON.stringify(ids.slice(0,5))) {
    throw new Error(`Five-slot Echo target commit mismatch: ${JSON.stringify({committedSlots,expected:ids.slice(0,5)})}`);
  }

  await capture(send, 'artifacts/ui-preview-echo-workspace-1440x900.png');
  await pointerClick(send, '#echoClose');
  await waitForUi(send, `!echoUi.open&&!document.getElementById('echoOverlay').classList.contains('mounted')&&echoUi.previewId===null`, 'Echo close did not clear transient Preview');

  const closed = await evaluate(send, `(()=>({saved:draft(buildPicker.selected).build.echoSets.sets['set-1'].slots.slice(),buildFilled:[...document.querySelectorAll('.echo[data-echo-slot]')].filter(x=>x.classList.contains('has-echo')).length}))()`);
  if (JSON.stringify(closed.saved) !== JSON.stringify(ids.slice(0,5)) || closed.buildFilled !== 5) {
    throw new Error(`Closing Echo Workspace lost committed state: ${JSON.stringify(closed)}`);
  }

  await evaluate(send, `buildPicker.select('Aalto')`);
  await waitForUi(send, `echoUi.characterName==='Aalto'`, 'Character switch to Aalto did not bind Echo state');
  const aaltBefore = await evaluate(send, `readEchoSets('Aalto').sets['set-1'].slots.slice()`);
  if (aaltBefore.some(Boolean)) throw new Error(`Second Character inherited first Character Echoes: ${JSON.stringify(aaltBefore)}`);

  await pointerClick(send, '.echo[data-echo-slot="0"]');
  await waitForUi(send, `echoUi.open&&echoUi.targetSlot===0`, 'Aalto Echo Workspace did not open');
  await pointerClick(send, `#echoChoices .echo-choice[data-echo-id="${ids[5]}"]`);
  await pointerClick(send, '#echoEquip');
  await waitForUi(send, `draft('Aalto').build.echoSets?.sets?.['set-1']?.slots?.[0]===${JSON.stringify(ids[5])}`, 'Aalto Echo commit failed');
  await pointerClick(send, '#echoClose');

  await evaluate(send, `buildPicker.select('Augusta')`);
  await waitForUi(send, `echoUi.characterName==='Augusta'`, 'Character switch back to Augusta did not bind');
  const restoredAugusta = await evaluate(send, `readEchoSets('Augusta').sets['set-1'].slots.slice()`);
  const buildRestored = await evaluate(send, `[...document.querySelectorAll('.echo[data-echo-slot]')].filter(x=>x.classList.contains('has-echo')).length`);
  if (JSON.stringify(restoredAugusta) !== JSON.stringify(ids.slice(0,5)) || buildRestored !== 5) {
    throw new Error(`Augusta draft Echo state did not restore: ${JSON.stringify({restoredAugusta,buildRestored})}`);
  }
  await evaluate(send, `buildPicker.select('Aalto')`);
  const restoredAalto = await evaluate(send, `readEchoSets('Aalto').sets['set-1'].slots.slice()`);
  if (restoredAalto[0] !== ids[5] || restoredAalto.slice(1).some(Boolean)) {
    throw new Error(`Aalto draft Echo state did not restore independently: ${JSON.stringify(restoredAalto)}`);
  }

  return { ids: ids.slice(0,5), secondCharacterEcho: ids[5] };
}

async function verifyMobileSmoke(send) {
  await setViewport(send, 390, 844);
  await navigate(send);
  await prepareBuild(send, 'Augusta');
  await pointerClick(send, '.echo[data-echo-slot="2"]');
  await waitForUi(send, `echoUi.open&&echoUi.targetSlot===2`, 'Mobile Echo Workspace physical slot click failed');
  const metrics = await evaluate(send, `(()=>{const p=document.getElementById('echoPanel').getBoundingClientRect(),b=document.getElementById('echoBrowser');return{slots:document.querySelectorAll('#echoWorkspaceSlots .echo-workspace-slot').length,left:p.left,right:p.right,innerWidth,scrollable:b.scrollHeight>b.clientHeight}})()`);
  if (metrics.slots !== 5 || metrics.left < -1 || metrics.right > metrics.innerWidth + 1 || !metrics.scrollable) {
    throw new Error(`Mobile Echo Workspace containment/scroll failed: ${JSON.stringify(metrics)}`);
  }
  const id = await evaluate(send, `echoCatalog.find(item=>item.cost===4)?.id`);
  await pointerClick(send, '[data-echo-filter="4"]');
  await pointerClick(send, `#echoChoices .echo-choice[data-echo-id="${id}"]`);
  await waitForUi(send, `echoUi.previewId===${JSON.stringify(id)}`, 'Mobile physical Echo card click did not Preview');
  await capture(send, 'artifacts/ui-preview-echo-workspace-390x844.png');
  await pointerClick(send, '#echoClose');
  return { previewed: id };
}

const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
  `--remote-debugging-port=${DEBUG_PORT}`, '--remote-debugging-address=127.0.0.1',
  '--user-data-dir=/tmp/bellibing-v34-echo-workspace', 'about:blank',
], { stdio: ['ignore', 'pipe', 'pipe'] });
let stderr = '';
chrome.stderr.on('data', (chunk) => { stderr += String(chunk); });

try {
  await waitForChrome();
  const page = await createPage();
  if (!page.webSocketDebuggerUrl) throw new Error('Chrome page has no DevTools websocket URL.');
  const { socket, send } = cdp(page.webSocketDebuggerUrl);
  try {
    await send('Page.enable');
    await send('Runtime.enable');
    const desktop = await verifyDesktop(send);
    const mobile = await verifyMobileSmoke(send);
    console.log('v34 Echo Workspace Slice 1 verification passed in real Chrome.');
    console.log(`- Desktop: 181-card browser, canonical Cost filters, Preview-only physical mouse click, five target slots, Equip-only commit, close-preserve and Character draft restore passed.`);
    console.log(`- Committed desktop slots: ${desktop.ids.join(', ')}; independent Aalto slot: ${desktop.secondCharacterEcho}.`);
    console.log(`- Mobile 390x844: contained scrollable workspace + physical Echo Preview passed (${mobile.previewed}).`);
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
