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

async function readBrowserFilterState(send) {
  return evaluate(send, `(()=>{
    const selected=[...echoUi.selectedSonataIds];
    const all=[...document.querySelectorAll('#echoChoices .echo-choice')];
    const visible=all.filter(choice=>!choice.hidden);
    const expected=echoCatalog.filter(item=>{
      const costMatch=echoUi.filter==='all'||String(item.cost)===echoUi.filter;
      const sonataMatch=!selected.length||item.sonataSetIds.some(id=>selected.includes(id));
      return costMatch&&sonataMatch;
    });
    return {
      filter:echoUi.filter,
      selected,
      visible:visible.map(choice=>choice.dataset.echoId),
      expected:expected.map(item=>item.id),
      activeCost:document.querySelector('.echo-filter.active')?.dataset.echoFilter||null
    };
  })()`);
}

async function verifyCurrentBrowserFilter(send, label) {
  const result = await readBrowserFilterState(send);
  if (result.activeCost !== result.filter || JSON.stringify(result.visible) !== JSON.stringify(result.expected)) {
    throw new Error(`${label} browser filter mismatch: ${JSON.stringify(result)}`);
  }
  return result;
}

async function verifyManualCostFilter(send, filter) {
  await pointerClick(send, `[data-echo-filter="${filter}"]`);
  await waitForUi(send, `echoUi.filter===${JSON.stringify(filter)}`, `Manual Cost ${filter} filter did not activate`);
  return verifyCurrentBrowserFilter(send, `Manual Cost ${filter}`);
}

async function verifyDesktop(send) {
  await setViewport(send, 1440, 900);
  await navigate(send);
  await evaluate(send, 'localStorage.clear()');
  await navigate(send);
  await prepareBuild(send, 'Augusta');

  await evaluate(send, `(()=>{window.__echoPointerAudit=[];for(const type of ['pointerdown','pointerup','click'])document.addEventListener(type,event=>{const choice=event.target?.closest?.('.echo-choice');const slot=event.target?.closest?.('[data-echo-slot],[data-echo-target]');const sonata=event.target?.closest?.('[data-sonata-id],#echoSonataToggle,#echoSonataAll');window.__echoPointerAudit.push({type,echoId:choice?.dataset.echoId||null,slot:slot?.dataset.echoSlot??slot?.dataset.echoTarget??null,sonata:sonata?.dataset.sonataId||sonata?.id||null});},true);return true})()`);

  await pointerClick(send, '.echo[data-echo-slot="0"]');
  await waitForUi(send, `echoUi.open&&document.getElementById('echoOverlay').classList.contains('mounted')`, 'Physical Build Echo-slot click did not open workspace');
  await waitForUi(send, `[...document.querySelectorAll('#echoChoices .echo-choice img')].length===181&&[...document.querySelectorAll('#echoChoices .echo-choice img')].every(img=>img.complete&&img.naturalWidth>0)`, 'Canonical Echo artwork did not fully resolve in browser', 12000);
  await waitForUi(send, `[...document.querySelectorAll('#echoSonataOptions img')].length===34&&[...document.querySelectorAll('#echoSonataOptions img')].every(img=>img.complete&&img.naturalWidth>0)`, 'Canonical Sonata artwork did not fully resolve in selector', 12000);

  const opened = await evaluate(send, `(()=>{
    const slots=[...document.querySelectorAll('#echoWorkspaceSlots .echo-workspace-slot')];
    const slotBox=document.getElementById('echoWorkspaceSlots').getBoundingClientRect();
    const previewBox=document.getElementById('echoPreviewPane').getBoundingClientRect();
    const selectorBox=document.getElementById('echoSonataSelector').getBoundingClientRect();
    const browserBox=document.getElementById('echoBrowser').getBoundingClientRect();
    return {
      target:echoUi.targetSlot,
      workspaceSlots:slots.length,
      recommendedCosts:slots.map(x=>x.dataset.recommendedCost||null),
      costLabels:slots.map(x=>x.querySelector('.echo-slot-cost')?.textContent.trim()||null),
      profileId:echoUi.loadoutProfile?.profileId||null,
      characterId:echoUi.characterId,
      filter:echoUi.filter,
      selected:[...echoUi.selectedSonataIds],
      previewId:echoUi.previewId,
      rank:echoStatContract?.rank,
      level:echoStatContract?.level,
      maxSubstats:echoStatContract?.maxSubstats,
      headerText:document.querySelector('.echo-panel-head')?.textContent.trim(),
      visibleSet1:!!document.querySelector('.echo-panel-head .echo-set-label'),
      slotsAbovePreview:slotBox.bottom<=previewBox.top+2,
      slotsOnRight:slotBox.left>=previewBox.left-2,
      selectorAboveBrowser:selectorBox.bottom<=browserBox.top+2,
      selectorOnLeft:selectorBox.left<=browserBox.left+4
    };
  })()`);
  if (
    opened.target !== 0
    || opened.workspaceSlots !== 5
    || JSON.stringify(opened.recommendedCosts) !== JSON.stringify(['4','3','3','1','1'])
    || JSON.stringify(opened.costLabels) !== JSON.stringify(['Cost 4','Cost 3','Cost 3','Cost 1','Cost 1'])
    || opened.profileId !== 'augusta-standard-echoes'
    || opened.characterId !== 'augusta'
    || opened.filter !== '4'
    || JSON.stringify(opened.selected) !== JSON.stringify(['sonata-20','sonata-3'])
    || opened.previewId !== null
    || opened.rank !== 5 || opened.level !== 25 || opened.maxSubstats !== 5
    || opened.visibleSet1
    || opened.headerText !== 'Echo Workspace'
    || !opened.slotsAbovePreview
    || !opened.slotsOnRight
    || !opened.selectorAboveBrowser
    || !opened.selectorOnLeft
  ) {
    throw new Error(`Augusta Echo Workspace recommendation/layout contract failed: ${JSON.stringify(opened)}`);
  }
  await verifyCurrentBrowserFilter(send, 'Augusta Slot 1 recommended');

  // Profile-backed slot clicks own the normal Cost filter: 4 / 3 / 3 / 1 / 1.
  const expectedCosts=['4','3','3','1','1'];
  for(let slot=0;slot<5;slot++){
    await pointerClick(send, `#echoWorkspaceSlots [data-echo-target="${slot}"]`);
    await waitForUi(send, `echoUi.targetSlot===${slot}&&echoUi.filter===${JSON.stringify(expectedCosts[slot])}`, `Augusta slot ${slot+1} did not apply profile Cost ${expectedCosts[slot]}`);
    await verifyCurrentBrowserFilter(send, `Augusta Slot ${slot+1}`);
  }

  // Sonata selector is a user override: recommended two-set union, then deselect/reselect, then All/manual.
  await pointerClick(send, '#echoWorkspaceSlots [data-echo-target="0"]');
  await pointerClick(send, '#echoSonataToggle');
  await waitForUi(send, `echoUi.sonataMenuOpen&&!document.getElementById('echoSonataMenu').hidden`, 'Physical Sonata selector toggle did not open');
  const initialUnion = await verifyCurrentBrowserFilter(send, 'Augusta two-Sonata union');
  if (JSON.stringify(initialUnion.selected) !== JSON.stringify(['sonata-20','sonata-3'])) {
    throw new Error(`Augusta recommended Sonata defaults drifted: ${JSON.stringify(initialUnion)}`);
  }

  await pointerClick(send, '#echoSonataOptions [data-sonata-id="sonata-20"]');
  await waitForUi(send, `echoUi.selectedSonataIds.size===1&&echoUi.selectedSonataIds.has('sonata-3')`, 'Physical Sonata deselect did not update selection');
  await verifyCurrentBrowserFilter(send, 'Augusta Sonata deselect');

  await pointerClick(send, '#echoSonataOptions [data-sonata-id="sonata-20"]');
  await waitForUi(send, `echoUi.selectedSonataIds.size===2&&echoUi.selectedSonataIds.has('sonata-20')&&echoUi.selectedSonataIds.has('sonata-3')`, 'Physical Sonata reselect did not restore two-set union');
  await verifyCurrentBrowserFilter(send, 'Augusta Sonata reselect union');

  const sonataAudit = await evaluate(send, `window.__echoPointerAudit.filter(x=>x.sonata)`);
  for(const type of ['pointerdown','pointerup','click']){
    if(!sonataAudit.some(x=>x.type===type&&x.sonata==='echoSonataToggle'))throw new Error('Sonata selector toggle missed physical '+type);
    if(!sonataAudit.some(x=>x.type===type&&x.sonata==='sonata-20'))throw new Error('Sonata option missed physical '+type);
  }

  await pointerClick(send, '#echoSonataAll');
  await waitForUi(send, `echoUi.selectedSonataIds.size===0`, 'Sonata All/manual state did not clear selection');
  await verifyCurrentBrowserFilter(send, 'Sonata All/manual');
  await verifyManualCostFilter(send, '4');
  await verifyManualCostFilter(send, '3');
  await verifyManualCostFilter(send, '1');
  await verifyManualCostFilter(send, 'all');

  // Returning to a profile-backed slot restores its recommended Cost; manually reselect two Sonata sets.
  await pointerClick(send, '#echoWorkspaceSlots [data-echo-target="0"]');
  await waitForUi(send, `echoUi.filter==='4'`, 'Profile-backed slot did not reclaim Cost filter after manual override');
  await pointerClick(send, '#echoSonataOptions [data-sonata-id="sonata-20"]');
  await pointerClick(send, '#echoSonataOptions [data-sonata-id="sonata-3"]');
  await waitForUi(send, `echoUi.selectedSonataIds.size===2`, 'Two Sonata selections were not restored');
  await verifyCurrentBrowserFilter(send, 'Restored recommended union');
  await pointerClick(send, '#echoSonataToggle');
  await waitForUi(send, `!echoUi.sonataMenuOpen`, 'Sonata selector did not close');

  const validationAudit=await evaluate(send,`(()=>{const item=echoCatalog.find(x=>x.cost===4),card=makeEchoStatCard(item),r={name:echoStatContract.substats[0].name,value:echoStatContract.substats[0].values[0]};return{badMain:validateEchoStatCard({...card,mainStat:{name:'Aero DMG',value:.3}},item),dup:validateEchoStatCard({...card,substats:[r,{...r}]},item),badSub:validateEchoStatCard({...card,substats:[{name:'CRIT DMG',value:.999}]},item)}})()`);if(!/Invalid Main Stat/.test(validationAudit.badMain)||!/Duplicate/.test(validationAudit.dup)||!/Unsupported substat/.test(validationAudit.badSub))throw new Error('Stat validation regression '+JSON.stringify(validationAudit));

  // Echo click remains Preview-only and opens Stats Editor.
  const firstId = await evaluate(send, `document.querySelector('#echoChoices .echo-choice:not([hidden])')?.dataset.echoId`);
  if (!firstId) throw new Error('No visible Echo available for Augusta Slot 1 recommendation.');
  const beforePreview = await evaluate(send, `localStorage.getItem('bellibing-ui-checkpoint-v34')`);
  await pointerClick(send, `#echoChoices .echo-choice[data-echo-id="${firstId}"]`);
  await waitForUi(send, `echoUi.previewId===${JSON.stringify(firstId)}`, 'Physical Echo card click did not enter Preview');
  const preview = await evaluate(send, `(()=>({savedSlot:draft(buildPicker.selected).build.echoSets?.sets?.['set-1']?.slots?.[0]??null,storage:localStorage.getItem('bellibing-ui-checkpoint-v34'),previewId:echoUi.previewId,open:echoUi.open}))()`);
  if (preview.savedSlot !== null || preview.storage !== beforePreview || preview.previewId !== firstId || !preview.open || !(await evaluate(send,`!!echoUi.editorDraft&&document.getElementById('echoMainStat').options.length>0`))) {
    throw new Error(`Echo Preview mutated committed state: ${JSON.stringify(preview)}`);
  }

  const pointerAudit = await evaluate(send, `window.__echoPointerAudit.filter(x=>x.echoId===${JSON.stringify(firstId)})`);
  if (!pointerAudit.some(x=>x.type==='pointerdown') || !pointerAudit.some(x=>x.type==='pointerup') || !pointerAudit.some(x=>x.type==='click')) {
    throw new Error(`Echo card did not receive physical pointerdown/up/native click: ${JSON.stringify(pointerAudit)}`);
  }

  await evaluate(send,`(()=>{const row=document.querySelector('#echoSubstats .echo-substat-row'),n=row.querySelectorAll('select')[0];n.value=echoStatContract.substats[4].name;n.dispatchEvent(new Event('change',{bubbles:true}));const v=row.querySelectorAll('select')[1];v.value=String(echoStatContract.substats[4].values.at(-1));v.dispatchEvent(new Event('change',{bubbles:true}));return true})()`);
  if(await evaluate(send,`localStorage.getItem('bellibing-ui-checkpoint-v34')!==${JSON.stringify(beforePreview)}`))throw new Error('Transient Stats edit committed before Equip');
  // Equip remains the only commit and Workspace stays open.
  await pointerClick(send, '#echoEquip');
  await waitForUi(send, `draft(buildPicker.selected).build.echoSets?.sets?.['set-1']?.slots?.[0]?.echoId===${JSON.stringify(firstId)}`, 'Equip Echo did not commit full slot 1 card');
  const firstCommit = await evaluate(send, `(()=>{const e=draft(buildPicker.selected).build.echoSets;return{open:echoUi.open,previewId:echoUi.previewId,activeSetId:e.activeSetId,defaultSetId:e.defaultSetId,setName:e.sets?.['set-1']?.name,slot:e.sets?.['set-1']?.slots?.[0]}})()`);
  if (!firstCommit.open || firstCommit.previewId !== firstId || firstCommit.activeSetId !== 'set-1' || firstCommit.defaultSetId !== 'set-1' || firstCommit.setName !== 'Set 1' || firstCommit.slot !== firstId) {
    throw new Error(`Equip-only commit / hidden Set 1 architecture failed: ${JSON.stringify(firstCommit)}`);
  }

  const committedIds=[firstId];
  for(let slot=1;slot<5;slot++){
    await pointerClick(send, `#echoWorkspaceSlots [data-echo-target="${slot}"]`);
    await waitForUi(send, `echoUi.targetSlot===${slot}&&echoUi.filter===${JSON.stringify(expectedCosts[slot])}`, `Slot ${slot+1} Cost recommendation lost during continuous workflow`);
    const id=await evaluate(send, `document.querySelector('#echoChoices .echo-choice:not([hidden])')?.dataset.echoId`);
    if(!id)throw new Error(`No visible Echo for Augusta slot ${slot+1}`);
    committedIds.push(id);
    await pointerClick(send, `#echoChoices .echo-choice[data-echo-id="${id}"]`);
    await pointerClick(send, '#echoEquip');
    await waitForUi(send, `draft(buildPicker.selected).build.echoSets?.sets?.['set-1']?.slots?.[${slot}]?.echoId===${JSON.stringify(id)}&&echoUi.open`, `Continuous Equip failed for slot ${slot+1}`);
  }

  await capture(send, 'artifacts/ui-preview-echo-workspace-1440x900.png');
  await pointerClick(send, '#echoClose');
  await waitForUi(send, `!echoUi.open&&echoUi.previewId===null`, 'Echo close did not clear transient Preview');
  const closedSlots=await evaluate(send, `draft('Augusta').build.echoSets.sets['set-1'].slots.map(slot=>echoSlotId(slot))`);
  if(JSON.stringify(closedSlots)!==JSON.stringify(committedIds))throw new Error(`Closing Workspace changed committed slots: ${JSON.stringify({closedSlots,committedIds})}`);

  // A Character without VERIFIED loadout profile gets no invented Cost/Sonata recommendation.
  await evaluate(send, `buildPicker.select('Aalto')`);
  await waitForUi(send, `echoUi.characterName==='Aalto'`, 'Character switch to Aalto did not bind Echo state');
  await pointerClick(send, '.echo[data-echo-slot="0"]');
  await waitForUi(send, `echoUi.open&&echoUi.targetSlot===0`, 'Aalto Echo Workspace did not open');
  const fallback = await evaluate(send, `(()=>({profile:echoUi.loadoutProfile,filter:echoUi.filter,selected:[...echoUi.selectedSonataIds],costs:[...document.querySelectorAll('#echoWorkspaceSlots .echo-slot-cost')].map(x=>x.textContent.trim()),mode:document.getElementById('echoSlotTargetMode').textContent.trim()}))()`);
  if (fallback.profile !== null || fallback.filter !== 'all' || fallback.selected.length || fallback.costs.some(x=>x!=='Manual') || fallback.mode !== 'Manual Cost') {
    throw new Error(`Aalto received invented Echo recommendations: ${JSON.stringify(fallback)}`);
  }

  const aaltId=await evaluate(send, `document.querySelector('#echoChoices .echo-choice:not([hidden])')?.dataset.echoId`);
  await pointerClick(send, `#echoChoices .echo-choice[data-echo-id="${aaltId}"]`);
  await pointerClick(send, '#echoEquip');
  await waitForUi(send, `draft('Aalto').build.echoSets?.sets?.['set-1']?.slots?.[0]?.echoId===${JSON.stringify(aaltId)}`, 'Aalto manual Echo commit failed');
  await pointerClick(send, '#echoClose');

  await evaluate(send, `buildPicker.select('Augusta')`);
  await waitForUi(send, `echoUi.characterName==='Augusta'`, 'Character switch back to Augusta did not bind');
  const restoredAugusta = await evaluate(send, `readEchoSets('Augusta').sets['set-1'].slots.map(slot=>echoSlotId(slot))`);
  if (JSON.stringify(restoredAugusta)!==JSON.stringify(committedIds)) {
    throw new Error(`Augusta committed Echoes did not restore independently: ${JSON.stringify(restoredAugusta)}`);
  }

  return { ids: committedIds, fallbackEcho: aaltId };
}

async function verifyMobileSmoke(send) {
  await setViewport(send, 390, 844);
  await navigate(send);
  await prepareBuild(send, 'Augusta');
  await pointerClick(send, '.echo[data-echo-slot="2"]');
  await waitForUi(send, `echoUi.open&&echoUi.targetSlot===2&&echoUi.filter==='3'`, 'Mobile profile-backed Echo slot click failed');
  const metrics = await evaluate(send, `(()=>{
    const p=document.getElementById('echoPanel').getBoundingClientRect(),b=document.getElementById('echoBrowser');
    return{slots:document.querySelectorAll('#echoWorkspaceSlots .echo-workspace-slot').length,left:p.left,right:p.right,innerWidth,scrollable:b.scrollHeight>b.clientHeight,selected:[...echoUi.selectedSonataIds],costs:[...document.querySelectorAll('#echoWorkspaceSlots .echo-slot-cost')].map(x=>x.textContent.trim())};
  })()`);
  if (metrics.slots !== 5 || metrics.left < -1 || metrics.right > metrics.innerWidth + 1 || !metrics.scrollable || JSON.stringify(metrics.selected)!==JSON.stringify(['sonata-20','sonata-3']) || JSON.stringify(metrics.costs)!==JSON.stringify(['Cost 4','Cost 3','Cost 3','Cost 1','Cost 1'])) {
    throw new Error(`Mobile Echo Workspace recommendation/containment failed: ${JSON.stringify(metrics)}`);
  }
  await verifyCurrentBrowserFilter(send, 'Mobile Augusta Slot 3');
  const id = await evaluate(send, `document.querySelector('#echoChoices .echo-choice:not([hidden])')?.dataset.echoId`);
  if(!id)throw new Error('Mobile filtered Echo browser has no result');
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
    console.log('v34 Echo Workspace + Stats Editor restack verification passed in real Chrome.');
    console.log(`- Desktop: profile-backed 4/3/3/1/1 target Costs, Crown of Valor + Void Thunder multi-select union, manual overrides/fallback, Preview-only physical click, Equip-only commit, hidden Set 1 UI and Character isolation passed.`);
    console.log(`- Committed desktop slots: ${desktop.ids.join(', ')}; manual Aalto slot: ${desktop.fallbackEcho}.`);
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
