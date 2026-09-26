import { spawn } from 'node:child_process';

const UI_URL = process.env.BELLIBING_V34_URL ?? 'http://127.0.0.1:4173/ui-preview/';
const DEBUG_PORT = Number(process.env.BELLIBING_V34_CHROME_DEBUG_PORT ?? 9670);
const CHROME = process.env.CHROME_BIN ?? 'google-chrome';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForChrome() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try { const response = await fetch('http://127.0.0.1:' + DEBUG_PORT + '/json/version'); if (response.ok) return; } catch {}
    await sleep(120);
  }
  throw new Error('Timed out waiting for Chrome DevTools.');
}

async function createPage() {
  const response = await fetch('http://127.0.0.1:' + DEBUG_PORT + '/json/new?' + encodeURIComponent('about:blank'), { method: 'PUT' });
  if (!response.ok) throw new Error('Failed to create Chrome page: ' + response.status);
  return response.json();
}

function cdp(wsUrl) {
  const socket = new WebSocket(wsUrl);
  let serial = 0;
  const pending = new Map();
  const opened = new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data));
    if (!message.id) return;
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(message.error.message)); else waiter.resolve(message.result);
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
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text ?? 'Runtime evaluation failed');
  return result.result?.value;
}

async function waitFor(send, expression, message, timeout = 8000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) { if (await evaluate(send, expression)) return; await sleep(60); }
  throw new Error(message);
}

async function navigate(send) {
  await send('Page.navigate', { url: UI_URL });
  const deadline = Date.now() + 20000;
  let externalNoticeOpened = false;
  while (Date.now() < deadline) {
    const state = await evaluate(send, "(() => ({ready:document.readyState==='complete' && document.querySelectorAll('#homeStage .home-card').length===3,externalNotice:document.title==='External Content Notice | rawgit.hack' && !!document.querySelector('.url-action-button')}))()");
    if (state.ready) return;
    if (state.externalNotice && !externalNoticeOpened) {
      const bounds = await evaluate(send, "document.querySelector('.url-action-button').getBoundingClientRect().toJSON()");
      const x = bounds.x + bounds.width / 2, y = bounds.y + bounds.height / 2;
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
      await sleep(35);
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
      externalNoticeOpened = true;
      await sleep(600);
      continue;
    }
    await sleep(100);
  }
  throw new Error('Sequence UI preview did not become ready.');
}

async function pointerClick(send, selector) {
  const selectorJson = JSON.stringify(selector);
  await evaluate(send, "(() => {const el=document.querySelector(" + selectorJson + ");if(!el)throw new Error('Missing pointer target');el.scrollIntoView({block:'center',inline:'center',behavior:'instant'})})()");
  await sleep(55);
  const bounds = await evaluate(send, "document.querySelector(" + selectorJson + ").getBoundingClientRect().toJSON()");
  if (!bounds || bounds.width <= 0 || bounds.height <= 0) throw new Error('Pointer target is not visible: ' + selector);
  const x = bounds.x + bounds.width / 2, y = bounds.y + bounds.height / 2;
  const hit = await evaluate(send, "(() => {const el=document.elementFromPoint(" + x + "," + y + ");return{tag:el?.tagName||null,id:el?.id||null,className:typeof el?.className==='string'?el.className:null,closest:!!el?.closest?.(" + selectorJson + ")}})()");
  if (!hit.closest) throw new Error('Pointer center does not hit requested target: ' + selector + ' ' + JSON.stringify({ bounds, hit }));
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await sleep(30);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  await sleep(90);
}

async function snapshot(send) {
  return evaluate(send, "(() => ({character:sequenceUi.characterId,current:sequenceUi.currentLevel,preview:sequenceUi.previewSequence,saved:buildPicker.selected?draft(buildPicker.selected).build.sequenceLevel:null,active:[...document.querySelectorAll('#sequenceLine .node.is-active')].map(x=>Number(x.dataset.sequence)).sort((a,b)=>a-b),previewed:[...document.querySelectorAll('#sequenceLine .node.is-preview')].map(x=>Number(x.dataset.sequence)),srcs:[...document.querySelectorAll('#sequenceLine .node img')].map(x=>x.getAttribute('src')),loaded:[...document.querySelectorAll('#sequenceLine .node img')].map(x=>x.naturalWidth),inspectorOpen:document.getElementById('sequenceInspector').classList.contains('open'),inspectorHidden:document.getElementById('sequenceInspector').getAttribute('aria-hidden'),commitText:document.getElementById('sequenceCommit').textContent.trim(),s0Text:document.getElementById('sequenceSetZero').textContent.trim()}))()");
}

const userDir = '/tmp/bellibing-sequence-' + process.pid + '-' + DEBUG_PORT;
const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=' + DEBUG_PORT, '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + userDir, 'about:blank'], { stdio: 'ignore' });

try {
  await waitForChrome();
  const page = await createPage();
  const { socket, send } = cdp(page.webSocketDebuggerUrl);
  await navigate(send);
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  try {
    await waitFor(send, "releasedCharacters.length===57 && document.documentElement.dataset.sequenceCatalogReady==='true'", 'Character/Sequence catalogs did not become ready', 15000);
  } catch (error) {
    const diagnostic = await evaluate(send, "(async()=>({characterCards:document.querySelectorAll('#buildWheel .choice').length,characterManifestError:document.documentElement.dataset.characterManifestError||null,sequenceReady:document.documentElement.dataset.sequenceCatalogReady||null,sequenceError:document.documentElement.dataset.sequenceCatalogError||null,sequencePath:typeof SEQUENCE_RUNTIME_DATA_PATH==='string'?SEQUENCE_RUNTIME_DATA_PATH:null,sequenceFetch:await fetch('assets/sequence-runtime.json',{cache:'no-store'}).then(async r=>({status:r.status,ok:r.ok,text:(await r.text()).slice(0,120)})).catch(e=>({error:String(e)}))}))()");
    throw new Error(error.message + ': ' + JSON.stringify(diagnostic));
  }

  const coverage = await evaluate(send, "(() => {const c=sequenceAssetsByCharacter.get('chisa'),a=sequenceAssetsByCharacter.get('augusta');return{count:sequenceAssetsByCharacter.size,chisa:c?.chains||[],augusta:a?.chains||[]}})()");
  const validSix = (rows, id) => rows.length === 6 && rows.every((row, index) => row.sequence === index + 1 && row.name && row.assetPath.endsWith('/' + id + '/s' + (index + 1) + '.webp'));
  if (coverage.count !== 57 || !validSix(coverage.chisa, 'chisa') || !validSix(coverage.augusta, 'augusta')) throw new Error('Resolver-backed Sequence runtime coverage failed: ' + JSON.stringify(coverage));

  await evaluate(send, "show('build');buildPicker.select('Chisa')");
  await waitFor(send, "sequenceUi.characterId==='chisa' && sequenceUi.assets?.chains?.length===6 && [...document.querySelectorAll('#sequenceLine .node img')].every(x=>x.naturalWidth>0)", 'Chisa Sequence UI did not bind/load');
  await sleep(900);
  let state = await snapshot(send);
  if (state.current !== 0 || state.preview !== null || state.saved !== undefined || state.active.length !== 0 || state.loaded.some((x) => x <= 0)) throw new Error('Initial Chisa S0 state failed: ' + JSON.stringify(state));

  await pointerClick(send, '#sequenceLine .node[data-sequence="6"]');
  state = await snapshot(send);
  if (state.preview !== 6 || state.current !== 0 || state.saved !== undefined || !state.inspectorOpen || state.inspectorHidden !== 'false' || state.commitText !== 'Set S6') throw new Error('Physical S6 click mutated state instead of Preview-only: ' + JSON.stringify(state));

  await pointerClick(send, '#sequenceCommit');
  await waitFor(send, 'sequenceUi.currentLevel===6', 'Set S6 did not commit');
  state = await snapshot(send);
  if (state.saved !== 6 || JSON.stringify(state.active) !== JSON.stringify([1,2,3,4,5,6]) || state.commitText !== 'Current S6') throw new Error('Set S6 commit/active range failed: ' + JSON.stringify(state));

  await pointerClick(send, '#sequenceLine .node[data-sequence="2"]');
  state = await snapshot(send);
  if (state.preview !== 2 || state.current !== 6 || state.saved !== 6) throw new Error('S2 Preview changed committed S6 before explicit commit: ' + JSON.stringify(state));
  await pointerClick(send, '#sequenceCommit');
  await waitFor(send, 'sequenceUi.currentLevel===2', 'Set S2 did not lower committed Sequence');
  state = await snapshot(send);
  if (state.saved !== 2 || JSON.stringify(state.active) !== JSON.stringify([1,2])) throw new Error('S6 -> S2 lowering failed: ' + JSON.stringify(state));

  await pointerClick(send, '#sequenceSetZero');
  state = await snapshot(send);
  if (state.current !== 0 || state.saved !== 0 || state.preview !== null || state.active.length !== 0) throw new Error('Explicit Set S0 failed: ' + JSON.stringify(state));

  await pointerClick(send, '#sequenceLine .node[data-sequence="3"]');
  if ((await snapshot(send)).preview !== 3) throw new Error('Chisa S3 Preview did not open before Character switch');
  await evaluate(send, "buildPicker.select('Augusta')");
  await waitFor(send, "sequenceUi.characterId==='augusta'", 'Character switch did not bind Augusta');
  await sleep(900);
  state = await snapshot(send);
  if (state.preview !== null || state.current !== 0 || state.srcs.some((src) => !src?.includes('/augusta/'))) throw new Error('Character switch failed to clear Preview/update icons: ' + JSON.stringify(state));

  await pointerClick(send, '#sequenceLine .node[data-sequence="1"]');
  await pointerClick(send, '#sequenceCommit');
  await waitFor(send, 'sequenceUi.currentLevel===1', 'Augusta Set S1 failed');
  await evaluate(send, "buildPicker.select('Chisa')");
  await waitFor(send, "sequenceUi.characterId==='chisa'", 'Return to Chisa failed');
  await sleep(900);
  state = await snapshot(send);
  if (state.current !== 0 || state.saved !== 0) throw new Error('Character-independent Chisa state did not restore after Augusta change: ' + JSON.stringify(state));

  await pointerClick(send, '#sequenceLine .node[data-sequence="2"]');
  await pointerClick(send, '#sequenceCommit');
  await waitFor(send, 'sequenceUi.currentLevel===2', 'Chisa Set S2 before reload failed');
  await evaluate(send, 'location.reload()');
  await waitFor(send, "document.readyState==='complete' && document.documentElement.dataset.sequenceCatalogReady==='true' && releasedCharacters.length===57", 'Reload did not restore catalogs', 15000);
  await evaluate(send, "show('build');buildPicker.select('Chisa')");
  await waitFor(send, "sequenceUi.characterId==='chisa' && sequenceUi.currentLevel===2", 'Reload did not restore Chisa committed Sequence');
  await sleep(900);
  state = await snapshot(send);
  if (state.current !== 2 || state.saved !== 2 || JSON.stringify(state.active) !== JSON.stringify([1,2])) throw new Error('Reload persistence failed: ' + JSON.stringify(state));

  console.log('v34 Sequence runtime verified: resolver assets, physical Preview-only clicks, explicit commit/lowering/S0, Character isolation and reload persistence.');
  socket.close();
} finally {
  chrome.kill('SIGTERM');
}
