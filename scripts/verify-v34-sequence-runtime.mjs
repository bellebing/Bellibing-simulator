import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const UI_URL = process.env.BELLIBING_V34_URL ?? 'http://127.0.0.1:4173/ui-preview/';
const DEBUG_PORT = Number(process.env.BELLIBING_V34_CHROME_DEBUG_PORT ?? 9670);
const CHROME = process.env.CHROME_BIN ?? 'google-chrome';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const assert = (condition, message, detail) => { if (!condition) throw new Error(message + (detail === undefined ? '' : ': ' + JSON.stringify(detail))); };

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

async function centerOf(send, selector) {
  const selectorJson = JSON.stringify(selector);
  const bounds = await evaluate(send, "(() => {const el=document.querySelector(" + selectorJson + ");if(!el)throw new Error('Missing pointer target');return el.getBoundingClientRect().toJSON()})()");
  assert(bounds && bounds.width > 0 && bounds.height > 0, 'Pointer target is not visible', { selector, bounds });
  return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2, bounds };
}

async function movePointer(send, selector) {
  const point = await centerOf(send, selector);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y });
  return point.bounds;
}

async function moveAway(send) {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 24, y: 24 });
}

async function pointerClick(send, selector) {
  const point = await centerOf(send, selector);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
  await sleep(30);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
  await sleep(90);
}

async function hoverNode(send, sequence, duration = 760) {
  await movePointer(send, '#sequenceLine .node[data-sequence="' + sequence + '"]');
  await sleep(duration);
}

async function snapshot(send) {
  return evaluate(send, "(() => {const content=document.getElementById('sequenceFlyoutContent'),desc=content.querySelector('.seq-flyout-description'),chain=sequenceUi.openSequence?sequenceUi.chain(sequenceUi.openSequence):null;return{character:sequenceUi.characterId,current:sequenceUi.currentLevel,open:sequenceUi.openSequence,hover:sequenceUi.hoverSequence,hoverDelay:sequenceUi.hoverDelay,closeDelay:sequenceUi.closeDelay,saved:buildPicker.selected?sequenceUi.normalizeLevel(draft(buildPicker.selected).build.sequenceLevel):null,order:[...document.querySelectorAll('#sequenceLine .node')].map(x=>Number(x.dataset.sequence)),active:[...document.querySelectorAll('#sequenceLine .node.is-active')].map(x=>Number(x.dataset.sequence)).sort((a,b)=>a-b),currentActive:[...document.querySelectorAll('#sequenceLine .node.is-current-active')].map(x=>Number(x.dataset.sequence)),srcs:[...document.querySelectorAll('#sequenceLine .node img')].map(x=>x.getAttribute('src')),loaded:[...document.querySelectorAll('#sequenceLine .node img')].map(x=>x.naturalWidth),flyoutOpen:document.getElementById('sequenceFlyout').classList.contains('open'),flyoutHidden:document.getElementById('sequenceFlyout').getAttribute('aria-hidden'),actionText:document.getElementById('sequenceAction').textContent.trim(),hint:document.getElementById('sequenceConsequence').textContent.trim(),flyoutLabel:document.getElementById('sequenceFlyoutLabel').textContent.trim(),contentText:content.textContent.trim(),flyoutTitle:content.querySelector('.seq-flyout-title')?.textContent.trim()??'',description:desc?.textContent??'',contentStatus:chain?.contentStatus??null,runtimeName:chain?.name??null,runtimeDescription:chain?.description??null,contentClientHeight:content.clientHeight,contentScrollHeight:content.scrollHeight,contentOverflow:getComputedStyle(content).overflowY,descriptionWhiteSpace:desc?getComputedStyle(desc).whiteSpace:null,currentText:document.getElementById('sequenceCurrent').textContent.trim(),openCount:document.querySelectorAll('.seq-flyout.open').length}})()");
}

async function flyoutGeometry(send, sequence) {
  return evaluate(send, "(() => {const node=document.querySelector('#sequenceLine .node[data-sequence=\"" + sequence + "\"]'),fly=document.getElementById('sequenceFlyout'),content=document.getElementById('sequenceFlyoutContent');return{node:node.getBoundingClientRect().toJSON(),fly:fly.getBoundingClientRect().toJSON(),content:content.getBoundingClientRect().toJSON(),contentClientHeight:content.clientHeight,contentScrollHeight:content.scrollHeight,overflowY:getComputedStyle(content).overflowY,vw:innerWidth,vh:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight}})()");
}

function rgbChannels(value) {
  const match = String(value).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return match ? match.slice(1, 4).map(Number) : null;
}

async function assertGoldVisuals(send) {
  const visuals = await evaluate(send, "(() => [...document.querySelectorAll('#sequenceLine .node')].map(node=>{const img=node.querySelector('img'),tag=node.querySelector('.seq-tag'),ns=getComputedStyle(node),is=getComputedStyle(img),ts=getComputedStyle(tag);return{sequence:Number(node.dataset.sequence),active:node.classList.contains('is-active'),current:node.classList.contains('is-current-active'),border:ns.borderTopColor,shadow:ns.boxShadow,filter:is.filter,opacity:is.opacity,tagColor:ts.color,tagText:tag.textContent.trim(),tagRect:tag.getBoundingClientRect().toJSON()}}))()");
  for (const row of visuals) {
    assert(row.tagText === 'S' + row.sequence && row.tagRect.width > 0 && row.tagRect.height > 0 && !row.tagColor.includes('0, 0, 0, 0'), 'Sequence text overlay is not visible', row);
    if (row.sequence <= 5) {
      assert(row.active, 'Expected active Sequence node', row);
      assert(row.filter.includes('sepia(1)'), 'Active Sequence artwork is not gold-filtered', row);
      const rgb = rgbChannels(row.border);
      assert(rgb && rgb[0] > rgb[1] && rgb[1] > rgb[2] && Math.max(...rgb) < 250, 'Active Sequence ring is not gold / is too white', row);
    } else {
      assert(!row.active && !row.filter.includes('sepia(1)'), 'Inactive S6 should remain subdued rather than gold', row);
    }
  }
  const s5 = visuals.find((row) => row.sequence === 5), s4 = visuals.find((row) => row.sequence === 4);
  assert(s5?.current && s5.shadow !== s4?.shadow, 'Highest committed Sequence does not have the stronger gold ring/glow', { s5, s4 });
}

async function captureSequenceEvidence(send) {
  mkdirSync('artifacts', { recursive: true });
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, fromSurface: true });
  writeFileSync('artifacts/ui-preview-sequence-hover-1440x900.png', Buffer.from(shot.data, 'base64'));
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
    const diagnostic = await evaluate(send, "(async()=>({characterCards:document.querySelectorAll('#buildWheel .choice').length,characterManifestError:document.documentElement.dataset.characterManifestError||null,sequenceReady:document.documentElement.dataset.sequenceCatalogReady||null,sequenceError:document.documentElement.dataset.sequenceCatalogError||null,sequenceFetch:await fetch('assets/sequence-runtime.json',{cache:'no-store'}).then(async r=>({status:r.status,ok:r.ok,text:(await r.text()).slice(0,120)})).catch(e=>({error:String(e)}))}))()");
    throw new Error(error.message + ': ' + JSON.stringify(diagnostic));
  }

  const coverage = await evaluate(send, "(() => {const invalid=[];let sourceBacked=0,pending=0,staticBuild=0,nonStatic=0,pendingReview=0;for(const [id,row] of sequenceAssetsByCharacter){const chains=row?.chains||[];if(chains.length!==6||chains.some((chain,index)=>chain.sequence!==index+1||!Number.isInteger(chain.sourceChainId)||!chain.assetId||chain.assetPath!=='assets/builder-icons/chains/'+id+'/s'+(index+1)+'.webp'||!['SOURCE_BACKED','PENDING'].includes(chain.contentStatus)||!['STATIC_BUILD_STAT','NON_STATIC_MECHANIC','PENDING'].includes(chain.buildStatClassification)||!Array.isArray(chain.staticBuildStats)))invalid.push(id);for(const chain of chains){if(chain.contentStatus==='SOURCE_BACKED'&&chain.name&&chain.description)sourceBacked++;else if(chain.contentStatus==='PENDING'&&(!chain.name||!chain.description))pending++;else invalid.push(id+':S'+chain.sequence);if(chain.buildStatClassification==='STATIC_BUILD_STAT'&&chain.staticBuildStats.length)staticBuild++;else if(chain.buildStatClassification==='NON_STATIC_MECHANIC'&&!chain.staticBuildStats.length)nonStatic++;else if(chain.buildStatClassification==='PENDING'&&!chain.staticBuildStats.length)pendingReview++;else invalid.push(id+':review:S'+chain.sequence)}}const q=sequenceAssetsByCharacter.get('qingxiao')?.chains?.[0];return{count:sequenceAssetsByCharacter.size,invalid:[...new Set(invalid)],sourceBacked,pending,staticBuild,nonStatic,pendingReview,qingxiaoS1:q?{sourceChainId:q.sourceChainId,classification:q.buildStatClassification,stats:q.staticBuildStats.map(x=>({stat:x.stat,value:x.value}))}:null,samples:['aalto','augusta','chisa','the-shorekeeper'].map(id=>({id,chains:(sequenceAssetsByCharacter.get(id)?.chains||[]).map(chain=>({sourceChainId:chain.sourceChainId,name:chain.name,src:chain.assetPath}))}))}})()");
  assert(coverage.count === 57 && coverage.invalid.length === 0 && coverage.sourceBacked === 342 && coverage.pending === 0 && coverage.staticBuild===20 && coverage.nonStatic===322 && coverage.pendingReview===0, 'Source-backed Sequence runtime/review coverage failed', coverage);
  assert(coverage.qingxiaoS1?.sourceChainId===331&&coverage.qingxiaoS1?.classification==='STATIC_BUILD_STAT'&&JSON.stringify(coverage.qingxiaoS1.stats)===JSON.stringify([{stat:'CRIT Rate',value:.16}]),'Qingxiao S1 reviewed static fact drifted',coverage.qingxiaoS1);
  assert(coverage.samples.every((sample) => sample.chains.length === 6 && sample.chains.every(chain=>chain.sourceChainId&&chain.name&&chain.src)), 'Sample Sequence identity/content coverage missing', coverage.samples);

  const fingerprints = await evaluate(send, "(async()=>{const ids=['aalto','augusta','chisa','the-shorekeeper'];const out={};for(const id of ids){out[id]=[];for(const chain of sequenceAssetsByCharacter.get(id).chains){const bytes=await fetch(chain.assetPath,{cache:'no-store'}).then(r=>r.arrayBuffer());const digest=await crypto.subtle.digest('SHA-256',bytes);out[id].push([...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join(''))}}return out})()");
  for (const [id, hashes] of Object.entries(fingerprints)) assert(hashes.length === 6 && new Set(hashes).size === 6, 'Character Sequence icons are not six distinct source assets for ' + id, hashes);
  assert(new Set(Object.values(fingerprints).map((hashes) => hashes.join(':'))).size === Object.keys(fingerprints).length, 'Several Character icon sets were not source-distinct', fingerprints);

  await evaluate(send, "show('build');buildPicker.select('Chisa')");
  await waitFor(send, "sequenceUi.characterId==='chisa' && sequenceUi.assets?.chains?.length===6 && [...document.querySelectorAll('#sequenceLine .node img')].every(x=>x.naturalWidth>0)", 'Chisa Sequence UI did not bind/load');
  await sleep(900);

  let state = await snapshot(send);
  assert(state.current === 0 && state.open === null && state.active.length === 0 && state.loaded.every((x) => x > 0), 'Initial Chisa S0 state failed', state);
  assert(JSON.stringify(state.order) === JSON.stringify([6,5,4,3,2,1]), 'S6→S1 DOM order changed', state.order);
  assert(state.hoverDelay === 700 && state.closeDelay === 130, 'Sequence hover/grace delays drifted', { hoverDelay: state.hoverDelay, closeDelay: state.closeDelay });

  const initialVisuals = await evaluate(send, "(() => [...document.querySelectorAll('#sequenceLine .node')].map(node=>({sequence:Number(node.dataset.sequence),tag:node.querySelector('.seq-tag').textContent.trim(),tagColor:getComputedStyle(node.querySelector('.seq-tag')).color,imgOpacity:Number(getComputedStyle(node.querySelector('img')).opacity),imgFilter:getComputedStyle(node.querySelector('img')).filter})))()");
  assert(initialVisuals.every((row) => row.tag === 'S' + row.sequence && row.imgOpacity >= 0.4 && row.imgFilter.includes('grayscale')), 'Inactive Sequence icon/text treatment is not recognizable/subdued', initialVisuals);

  const surfaceContract = await evaluate(send, "(() => ({position:getComputedStyle(document.getElementById('sequenceFlyout')).position,role:document.getElementById('sequenceFlyout').getAttribute('role'),inspectorCount:document.querySelectorAll('.seq-inspector,#sequenceInspector').length,sequenceDialogCount:document.querySelectorAll('#sequencePanel [role=dialog]').length,contentText:document.getElementById('sequenceFlyoutContent').textContent.trim(),panelText:document.getElementById('sequencePanel').textContent}))()");
  assert(surfaceContract.position === 'absolute' && !surfaceContract.role && surfaceContract.inspectorCount === 0 && surfaceContract.sequenceDialogCount === 0, 'Sequence surface regressed to inspector/modal workflow', surfaceContract);
  assert(surfaceContract.contentText === '' && !/sourceChainId|canonical|fact ID|Bellibing audit/i.test(surfaceContract.panelText), 'Developer/source commentary leaked into Sequence shell', surfaceContract);

  await evaluate(send, "buildPicker.select('Aemeath')");
  await waitFor(send, "sequenceUi.characterId==='aemeath' && sequenceUi.assets?.chains?.length===6", 'Aemeath Sequence UI did not bind');
  await hoverNode(send, 1, 760);
  let longState=await snapshot(send),longGeometry=await flyoutGeometry(send,1);
  assert(longState.saved===0&&longState.flyoutTitle==='Gilded Glimmer of the First Dawn'&&longState.description===longState.runtimeDescription&&longState.description.length>1200,'Long source-backed Sequence content did not render unchanged/read-only',longState);
  assert(longState.contentOverflow==='auto'&&longState.descriptionWhiteSpace==='pre-line'&&longGeometry.contentScrollHeight>longGeometry.contentClientHeight,'Long Sequence description is not contained/readable in its flyout scroll area',{longState,longGeometry});
  assert(longGeometry.fly.left>=longGeometry.node.right+6&&longGeometry.fly.top>=0&&longGeometry.fly.right<=longGeometry.vw&&longGeometry.fly.bottom<=longGeometry.vh,'Long Sequence flyout escapes 1440x900 viewport',longGeometry);
  await moveAway(send);await sleep(180);
  await evaluate(send, "buildPicker.select('Chisa')");
  await waitFor(send, "sequenceUi.characterId==='chisa' && sequenceUi.currentLevel===0", 'Return to Chisa after long-content check failed');

  await pointerClick(send, '#sequenceLine .node[data-sequence="6"]');
  await sleep(120);
  state = await snapshot(send);
  assert(state.current === 0 && state.open === null && state.active.length === 0, 'Direct Sequence node click committed/opened state', state);
  await moveAway(send); await sleep(180);

  await movePointer(send, '#sequenceLine .node[data-sequence="5"]');
  await sleep(520);
  state = await snapshot(send);
  assert(state.open === null && !state.flyoutOpen && state.current === 0, 'Hover under 700 ms opened flyout or committed state', state);
  await moveAway(send); await sleep(180);

  const beforeReadOnlyHover=await snapshot(send);
  await hoverNode(send, 5, 760);
  state = await snapshot(send);
  assert(state.open === 5 && state.flyoutOpen && state.flyoutHidden === 'false' && state.actionText === 'Set S5' && state.hint === 'Activates S1–S5' && state.flyoutLabel === 'S5' && state.contentStatus === 'SOURCE_BACKED' && state.flyoutTitle === state.runtimeName && state.description === state.runtimeDescription && state.description.length > 0, 'Sustained S5 hover did not open correct source-backed inactive flyout', state);
  assert(state.saved===beforeReadOnlyHover.saved&&state.current===beforeReadOnlyHover.current,'Hovering/reading Sequence content mutated saved state',{before:beforeReadOnlyHover,after:state});
  let geometry = await flyoutGeometry(send, 5);
  assert(geometry.fly.left >= geometry.node.right + 6 && geometry.fly.top <= geometry.node.top - 4, 'Sequence flyout is not anchored right/up from node', geometry);

  await movePointer(send, '#sequenceFlyout');
  await sleep(220);
  state = await snapshot(send);
  assert(state.open === 5 && state.flyoutOpen, 'Flyout closed while pointer travelled node → flyout', state);

  await moveAway(send);
  await sleep(70);
  state = await snapshot(send);
  assert(state.open === 5, 'Flyout closed before grace delay elapsed', state);
  await sleep(100);
  state = await snapshot(send);
  assert(state.open === null && !state.flyoutOpen, 'Flyout did not close after leaving node and flyout', state);

  await hoverNode(send, 2, 760);
  state = await snapshot(send);
  assert(state.open === 2 && state.openCount === 1, 'S2 flyout failed to open', state);
  await movePointer(send, '#sequenceLine .node[data-sequence="4"]');
  await sleep(150);
  state = await snapshot(send);
  assert(state.open === null && state.openCount === 0, 'Previous flyout stayed open while switching hover target', state);
  await sleep(620);
  state = await snapshot(send);
  assert(state.open === 4 && state.openCount === 1, 'New hover target did not become the sole open flyout', state);
  await moveAway(send); await sleep(180);

  await hoverNode(send, 5, 760);
  state = await snapshot(send);
  assert(state.actionText === 'Set S5' && state.hint === 'Activates S1–S5', 'Inactive S5 action/hint incorrect before commit', state);
  await pointerClick(send, '#sequenceAction');
  await waitFor(send, 'sequenceUi.currentLevel===5', 'Set S5 did not commit level 5');
  state = await snapshot(send);
  assert(state.saved === 5 && JSON.stringify(state.active) === JSON.stringify([1,2,3,4,5]) && state.actionText === 'Remove S5' && state.hint === '' && JSON.stringify(state.currentActive) === JSON.stringify([5]), 'Set S5 active range/action state failed', state);
  await assertGoldVisuals(send);
  await captureSequenceEvidence(send);

  await hoverNode(send, 3, 760);
  state = await snapshot(send);
  assert(state.actionText === 'Remove S3' && state.hint === 'Also removes S4–S5', 'Active S3 remove consequence hint incorrect', state);
  await pointerClick(send, '#sequenceAction');
  await waitFor(send, 'sequenceUi.currentLevel===2', 'Remove S3 from S5 did not produce S2');
  state = await snapshot(send);
  assert(state.saved === 2 && JSON.stringify(state.active) === JSON.stringify([1,2]), 'Remove S3 did not clear S3 and every higher Sequence', state);

  await hoverNode(send, 5, 760);
  await pointerClick(send, '#sequenceAction');
  await waitFor(send, 'sequenceUi.currentLevel===5', 'Second Set S5 did not commit');
  await hoverNode(send, 1, 760);
  state = await snapshot(send);
  assert(state.actionText === 'Remove S1' && state.hint === 'Also removes S2–S5', 'Remove S1 cascade hint incorrect', state);
  await pointerClick(send, '#sequenceAction');
  await waitFor(send, 'sequenceUi.currentLevel===0', 'Remove S1 did not produce S0');
  state = await snapshot(send);
  assert(state.saved === 0 && state.active.length === 0 && state.currentText === 'S0', 'Remove S1 / S0 state failed', state);

  await hoverNode(send, 2, 760);
  await pointerClick(send, '#sequenceAction');
  await waitFor(send, 'sequenceUi.currentLevel===2', 'Chisa Set S2 failed');
  const chisaState = await snapshot(send);
  assert(chisaState.saved === 2, 'Chisa S2 did not persist', chisaState);

  await hoverNode(send, 4, 760);
  state=await snapshot(send);
  assert(state.open === 4, 'Chisa S4 flyout did not open before Character switch');
  const chisaS4Name=state.runtimeName;
  await evaluate(send, "buildPicker.select('Augusta')");
  await waitFor(send, "sequenceUi.characterId==='augusta'", 'Character switch did not bind Augusta');
  await sleep(250);
  state = await snapshot(send);
  assert(state.open === null && !state.flyoutOpen && state.current === 0 && state.srcs.every((src) => src?.includes('/augusta/')), 'Character switch did not close flyout/reset state/use Augusta icons', state);
  assert(state.srcs.every((src, index) => src !== chisaState.srcs[index]), 'Character switch did not replace all six Character-specific Sequence assets', { chisa: chisaState.srcs, augusta: state.srcs });
  await moveAway(send);await sleep(60);await hoverNode(send,4,760);
  await waitFor(send,'sequenceUi.openSequence===4','Augusta S4 content did not open after Character switch');
  state=await snapshot(send);
  assert(state.flyoutTitle===state.runtimeName&&state.description===state.runtimeDescription&&state.flyoutTitle!==chisaS4Name,'Character switch did not immediately replace source-backed Sequence content',{chisaS4Name,augusta:state});
  await moveAway(send);await sleep(180);

  await hoverNode(send, 1, 760);
  state = await snapshot(send);
  assert(state.actionText === 'Set S1', 'Augusta inactive S1 action incorrect', state);
  await pointerClick(send, '#sequenceAction');
  await waitFor(send, 'sequenceUi.currentLevel===1', 'Augusta Set S1 failed');
  assert((await snapshot(send)).saved === 1, 'Augusta S1 did not persist');

  await evaluate(send, "buildPicker.select('Chisa')");
  await waitFor(send, "sequenceUi.characterId==='chisa' && sequenceUi.currentLevel===2", 'Chisa persisted S2 did not restore');
  state = await snapshot(send);
  assert(state.open === null && state.saved === 2 && state.srcs.every((src) => src?.includes('/chisa/')), 'Chisa isolation restore failed', state);
  await evaluate(send, "buildPicker.select('Augusta')");
  await waitFor(send, "sequenceUi.characterId==='augusta' && sequenceUi.currentLevel===1", 'Augusta persisted S1 did not restore');
  await evaluate(send, "buildPicker.select('Chisa')");
  await waitFor(send, "sequenceUi.characterId==='chisa' && sequenceUi.currentLevel===2", 'Return to Chisa S2 failed');

  await navigate(send);
  await waitFor(send, "document.readyState==='complete' && document.documentElement.dataset.sequenceCatalogReady==='true' && releasedCharacters.length===57", 'Reload did not restore catalogs', 15000);
  await evaluate(send, "show('build');buildPicker.select('Chisa')");
  await waitFor(send, "sequenceUi.characterId==='chisa' && sequenceUi.currentLevel===2", 'Reload did not restore Chisa committed Sequence');
  await sleep(900);
  state = await snapshot(send);
  assert(state.current === 2 && state.saved === 2 && JSON.stringify(state.active) === JSON.stringify([1,2]), 'Reload persistence failed', state);

  await evaluate(send, "buildPicker.select('Aemeath')");
  await waitFor(send, "sequenceUi.characterId==='aemeath'", 'Aemeath did not bind for desktop long-content sanity');
  for (const [width, height] of [[1920,1080],[2560,1440],[3440,1440],[7680,2160]]) {
    await moveAway(send);
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await sleep(180);
    await hoverNode(send, 1, 760);
    state = await snapshot(send);
    assert(state.open === 1 && state.actionText === 'Set S1' && state.flyoutTitle === 'Gilded Glimmer of the First Dawn' && state.description === state.runtimeDescription, 'Desktop source-backed long-content hover failed at ' + width + '×' + height, state);
    geometry = await flyoutGeometry(send, 1);
    assert(geometry.fly.left >= geometry.node.right + 6 && geometry.fly.top >= 0 && geometry.fly.right <= geometry.vw && geometry.fly.bottom <= geometry.vh && geometry.contentScrollHeight > geometry.contentClientHeight, 'Long flyout containment/readability failed at ' + width + '×' + height, geometry);
    await moveAway(send); await sleep(180);
  }

  console.log('v34 Sequence runtime verified: 57 Characters / 342 source-backed S1-S6, 20 reviewed static Build-stat Sequences / 322 non-static mechanics, Qingxiao S1 provenance, read-only hover, cumulative Set/Remove, Character isolation, reload persistence and desktop geometry.');
  socket.close();
} finally {
  chrome.kill('SIGTERM');
}
