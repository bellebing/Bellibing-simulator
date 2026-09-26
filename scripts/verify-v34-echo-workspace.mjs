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

async function openBellibingCombo(send, id) {
  await pointerClick(send, `#${id}-trigger`);
  await waitForUi(send, `(()=>{const root=document.querySelector('[data-combobox-id="${id}"]'),list=document.getElementById('${id}-listbox');return !!root?.classList.contains('is-open')&&!!list&&!list.hidden&&list.getAttribute('role')==='listbox'})()`, `Bellibing combobox ${id} did not open its owned listbox`);
}

async function chooseBellibingComboOption(send, id, index) {
  await openBellibingCombo(send, id);
  await pointerClick(send, `#${id}-option-${index}`);
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

  await evaluate(send, `(()=>{window.__echoPointerAudit=[];for(const type of ['pointerdown','pointerup','click'])document.addEventListener(type,event=>{const choice=event.target?.closest?.('.echo-choice');const slot=event.target?.closest?.('[data-echo-slot],[data-echo-target]');const sonata=event.target?.closest?.('[data-sonata-id],#echoSonataToggle,#echoSonataAll');const equip=event.target?.closest?.('#echoEquip');window.__echoPointerAudit.push({type,echoId:choice?.dataset.echoId||null,slot:slot?.dataset.echoSlot??slot?.dataset.echoTarget??null,sonata:sonata?.dataset.sonataId||sonata?.id||null,equip:!!equip});},true);return true})()`);

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
      summary:document.getElementById('echoSonataSummary').textContent.trim(),
      selectedIconIds:[...document.querySelectorAll('#echoSonataToggleIcons img')].map(x=>x.dataset.sonataId),
      previewId:echoUi.previewId,
      rank:echoStatContract?.rank,
      levels:echoStatContract?.levels,
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
    || opened.summary !== 'Crown of Valor + Void Thunder'
    || JSON.stringify(opened.selectedIconIds) !== JSON.stringify(['sonata-20','sonata-3'])
    || opened.previewId !== null
    || opened.rank !== 5
    || JSON.stringify(opened.levels) !== JSON.stringify([0,5,10,15,20,25])
    || opened.maxSubstats !== 5
    || opened.visibleSet1
    || opened.headerText !== 'Echo Workspace'
    || !opened.slotsAbovePreview
    || !opened.slotsOnRight
    || !opened.selectorAboveBrowser
    || !opened.selectorOnLeft
  ) {
    throw new Error(`Augusta Echo Workspace Correction 2B opening contract failed: ${JSON.stringify(opened)}`);
  }

  const cardAudit = await evaluate(send, `(()=>{
    const rows=[...document.querySelectorAll('#echoChoices .echo-choice')].map(card=>{
      const item=echoById.get(card.dataset.echoId),artNode=card.querySelector('.echo-choice-art'),copyNode=card.querySelector('.echo-choice-copy'),art=artNode.getBoundingClientRect(),copy=copyNode.getBoundingClientRect(),cardRect=card.getBoundingClientRect(),artStyle=getComputedStyle(artNode),copyStyle=getComputedStyle(copyNode),cardStyle=getComputedStyle(card);
      return {id:item.id,cost:item.cost,stars:card.querySelector('.echo-cost-stars')?.textContent||'',overlap:art.bottom>copy.top+1,hasCostText:!!card.querySelector('.echo-choice-copy small'),rects:{cardTop:cardRect.top,cardBottom:cardRect.bottom,artTop:art.top,artBottom:art.bottom,copyTop:copy.top,copyBottom:copy.bottom},styles:{cardHeight:cardStyle.height,cardTransform:cardStyle.transform,artTop:artStyle.top,artHeight:artStyle.height,copyTop:copyStyle.top,copyHeight:copyStyle.height}};
    });
    return {badStars:rows.filter(x=>x.stars!=='★'.repeat(x.cost)),overlap:rows.filter(x=>x.overlap),costText:rows.filter(x=>x.hasCostText)};
  })()`);
  if (cardAudit.badStars.length || cardAudit.overlap.length || cardAudit.costText.length) {
    throw new Error(`Echo browser card Correction 2B layout failed: ${JSON.stringify(cardAudit)}`);
  }
  await verifyCurrentBrowserFilter(send, 'Augusta Slot 1 recommended');

  const expectedCosts=['4','3','3','1','1'];
  for(let slot=0;slot<5;slot++){
    await pointerClick(send, `#echoWorkspaceSlots [data-echo-target="${slot}"]`);
    await waitForUi(send, `echoUi.targetSlot===${slot}&&echoUi.filter===${JSON.stringify(expectedCosts[slot])}`, `Augusta slot ${slot+1} did not apply profile Cost ${expectedCosts[slot]}`);
    await verifyCurrentBrowserFilter(send, `Augusta Slot ${slot+1}`);
  }
  await pointerClick(send, '#echoWorkspaceSlots [data-echo-target="0"]');

  await pointerClick(send, '#echoSonataToggle');
  await waitForUi(send, `echoUi.sonataMenuOpen&&!document.getElementById('echoSonataMenu').hidden`, 'Physical Sonata selector toggle did not open');
  const groups = await evaluate(send, `(()=>({
    recommended:[...document.querySelectorAll('[data-sonata-group="recommended"] [data-sonata-id]')].map(x=>({id:x.dataset.sonataId,name:x.querySelector('.echo-sonata-option-name')?.textContent.trim(),star:x.querySelector('.echo-sonata-option-star')?.textContent.trim()})),
    otherCount:document.querySelectorAll('[data-sonata-group="other"] [data-sonata-id]').length,
    order:[...document.querySelectorAll('#echoSonataOptions>.echo-sonata-group')].map(x=>x.dataset.sonataGroup)
  }))()`);
  if (
    JSON.stringify(groups.recommended) !== JSON.stringify([
      {id:'sonata-20',name:'Crown of Valor',star:'★'},
      {id:'sonata-3',name:'Void Thunder',star:'★'},
    ])
    || groups.otherCount !== 32
    || JSON.stringify(groups.order) !== JSON.stringify(['recommended','other'])
  ) throw new Error(`Augusta recommended Sonata grouping failed: ${JSON.stringify(groups)}`);

  await pointerClick(send, '#echoSonataAll');
  await waitForUi(send, `echoUi.selectedSonataIds.size===0&&document.getElementById('echoSonataSummary').textContent.trim()==='All Sonata Sets'&&document.querySelectorAll('#echoSonataToggleIcons img').length===0`, '0-selected Sonata summary/icons failed');

  await pointerClick(send, '#echoSonataOptions [data-sonata-id="sonata-20"]');
  await waitForUi(send, `echoUi.selectedSonataIds.size===1&&document.getElementById('echoSonataSummary').textContent.trim()==='Crown of Valor'&&document.querySelectorAll('#echoSonataToggleIcons img').length===1`, '1-selected Sonata summary/icons failed');

  await pointerClick(send, '#echoSonataOptions [data-sonata-id="sonata-3"]');
  await waitForUi(send, `echoUi.selectedSonataIds.size===2&&document.getElementById('echoSonataSummary').textContent.trim()==='Crown of Valor + Void Thunder'&&document.querySelectorAll('#echoSonataToggleIcons img').length===2`, '2-selected Sonata summary/icons failed');
  await verifyCurrentBrowserFilter(send, 'Augusta two-Sonata union');

  const thirdSonata = await evaluate(send, `document.querySelector('[data-sonata-group="other"] [data-sonata-id]')?.dataset.sonataId`);
  if(!thirdSonata) throw new Error('No Other Sonata option found');
  await pointerClick(send, `#echoSonataOptions [data-sonata-id="${thirdSonata}"]`);
  await waitForUi(send, `echoUi.selectedSonataIds.size===3&&document.getElementById('echoSonataSummary').textContent.trim()==='Multiple Sets'&&document.querySelectorAll('#echoSonataToggleIcons img').length===3`, '3+-selected Sonata summary/all-icons failed');
  await pointerClick(send, `#echoSonataOptions [data-sonata-id="${thirdSonata}"]`);
  await waitForUi(send, `echoUi.selectedSonataIds.size===2`, 'Failed to restore two recommended Sonata filters');

  const sonataAudit = await evaluate(send, `window.__echoPointerAudit.filter(x=>x.sonata)`);
  for(const type of ['pointerdown','pointerup','click']){
    if(!sonataAudit.some(x=>x.type===type&&x.sonata==='echoSonataToggle'))throw new Error('Sonata selector toggle missed physical '+type);
    if(!sonataAudit.some(x=>x.type===type&&x.sonata==='sonata-20'))throw new Error('Sonata option missed physical '+type);
  }
  await pointerClick(send, '#echoSonataToggle');
  await waitForUi(send, `!echoUi.sonataMenuOpen`, 'Sonata selector did not close');

  const validationAudit=await evaluate(send,`(()=>{
    const item=echoCatalog.find(x=>x.cost===4),selected=item.sonataSetIds[0],card=makeEchoStatCard(item,selected),r={name:echoStatContract.substats[0].name,value:echoStatContract.substats[0].values[0]};
    return {
      badMain:validateEchoStatCard({...card,mainStat:{name:'Aero DMG',value:.06}},item),
      dup:validateEchoStatCard({...card,level:10,substats:[r,{...r}]},item),
      badSub:validateEchoStatCard({...card,level:5,substats:[{name:'CRIT DMG',value:.999}]},item),
      badSonata:validateEchoStatCard({...card,selectedSonataSetId:'not-canonical'},item)
    }
  })()`);
  if(!/Invalid Main Stat/.test(validationAudit.badMain)||!/Duplicate/.test(validationAudit.dup)||!/Unsupported substat/.test(validationAudit.badSub)||!/Sonata assignment/.test(validationAudit.badSonata)){
    throw new Error('Echo editor runtime rejection failed: '+JSON.stringify(validationAudit));
  }

  const firstId = await evaluate(send, `(()=>{
    const selected=echoUi.selectedSonataIds;
    return echoCatalog.find(item=>item.cost===4&&item.sonataSetIds.length>1&&item.sonataSetIds.some(id=>selected.has(id))&&document.querySelector('#echoChoices .echo-choice[data-echo-id="'+item.id+'"]:not([hidden])'))?.id||null
  })()`);
  if (!firstId) throw new Error('No visible multi-Sonata Cost-4 Echo available for Correction 2B verification.');
  const beforePreview = await evaluate(send, `localStorage.getItem('bellibing-ui-checkpoint-v34')`);
  await pointerClick(send, `#echoChoices .echo-choice[data-echo-id="${firstId}"]`);
  await waitForUi(send, `echoUi.previewId===${JSON.stringify(firstId)}&&!!echoUi.editorDraft`, 'Physical Echo card click did not enter Preview');

  const preview = await evaluate(send, `(()=>{
    const item=echoById.get(${JSON.stringify(firstId)}),ordered=echoUi.orderedAllowedSonataIds(item),matches=ordered.filter(id=>echoUi.selectedSonataIds.has(id)),pane=document.getElementById('echoPreviewPane');
    return {
      savedSlot:draft(buildPicker.selected).build.echoSets?.sets?.['set-1']?.slots?.[0]??null,
      storage:localStorage.getItem('bellibing-ui-checkpoint-v34'),
      previewId:echoUi.previewId,
      open:echoUi.open,
      allowed:item.sonataSetIds,
      optionIds:[...document.querySelectorAll('#echoPreviewSonataChoices [data-sonata-id]')].map(x=>x.dataset.sonataId),
      expectedOptionIds:ordered,
      selected:echoUi.editorDraft.selectedSonataSetId,
      expectedDefault:matches[0]||ordered[0],
      level:echoUi.editorDraft.level,
      main:echoUi.editorDraft.mainStat,
      secondary:echoUi.editorDraft.secondaryMainStat,
      hasOldEyebrow:!!document.querySelector('#echoPreviewPane .echo-set-label'),
      hasOldCost:!!document.getElementById('echoPreviewCost'),
      hasOldChips:!!document.querySelector('#echoPreviewPane .echo-preview-sonata'),
      paneOverflow:getComputedStyle(pane).overflowY
    }
  })()`);
  if (
    preview.savedSlot !== null || preview.storage !== beforePreview || preview.previewId !== firstId || !preview.open
    || JSON.stringify(preview.optionIds) !== JSON.stringify(preview.expectedOptionIds)
    || JSON.stringify([...preview.optionIds].sort()) !== JSON.stringify([...preview.allowed].sort())
    || !preview.allowed.includes(preview.selected) || preview.selected !== preview.expectedDefault
    || preview.level !== 0
    || preview.hasOldEyebrow || preview.hasOldCost || preview.hasOldChips
  ) throw new Error(`Compact Echo Preview contract failed: ${JSON.stringify(preview)}`);

  const layout2d = await evaluate(send, `(()=>{
    const pane=document.getElementById('echoPreviewPane'),shell=pane.querySelector('.echo-preview-shell'),hero=pane.querySelector('.echo-preview-hero'),copy=pane.querySelector('.echo-preview-copy'),context=pane.querySelector('.echo-preview-context'),artRegion=pane.querySelector('.echo-preview-art-region'),art=document.getElementById('echoPreviewArt'),assignment=pane.querySelector('.echo-preview-sonata-assignment'),name=document.getElementById('echoPreviewName'),mainField=pane.querySelector('.echo-main-stat-field'),mainName=document.querySelector('[data-combobox-id="echoMainStatName"]'),mainValue=document.querySelector('[data-combobox-id="echoMainStatValue"]'),mainNameTrigger=document.getElementById('echoMainStatName-trigger'),secondaryField=pane.querySelector('.echo-secondary-field'),secondary=document.getElementById('echoSecondaryMainStat'),secondaryLabel=secondaryField?.querySelector('label'),firstSubstat=document.getElementById('echoSubstat0Name-trigger'),footer=pane.querySelector('.echo-preview-footer'),equip=document.getElementById('echoEquip');
    const pr=pane.getBoundingClientRect(),hr=hero.getBoundingClientRect(),cr=copy.getBoundingClientRect(),xr=context.getBoundingClientRect(),arr=artRegion.getBoundingClientRect(),ar=art.getBoundingClientRect(),sr=assignment.getBoundingClientRect(),mr=mainField.getBoundingClientRect(),fr=footer.getBoundingClientRect(),er=equip.getBoundingClientRect();
    const mainStyle=getComputedStyle(mainNameTrigger),secondaryStyle=getComputedStyle(secondary),substatStyle=getComputedStyle(firstSubstat),nameStyle=getComputedStyle(name);
    const sonataNames=[...document.querySelectorAll('#echoPreviewSonataChoices .echo-preview-sonata-option span')].map(node=>{const style=getComputedStyle(node),line=parseFloat(style.lineHeight);return{text:node.textContent.trim(),clientWidth:node.clientWidth,scrollWidth:node.scrollWidth,clientHeight:node.clientHeight,scrollHeight:node.scrollHeight,lines:Number.isFinite(line)&&line>0?node.scrollHeight/line:null,textOverflow:style.textOverflow,whiteSpace:style.whiteSpace}});
    const mainOptions=[...document.querySelectorAll('#echoMainStatName-listbox .bb-combobox-option')].map(node=>node.textContent.trim());
    const canonical=echoMainOptions(echoById.get(echoUi.previewId).cost,echoUi.editorDraft.level).find(option=>option.name===echoUi.editorDraft.mainStat.name);
    const mainValueText=document.querySelector('#echoMainStatValue-trigger .bb-combobox-value')?.textContent.trim()||'';
    const nameLine=parseFloat(nameStyle.lineHeight);
    return {
      nativeSelects:pane.querySelectorAll('.echo-editor select').length,
      comboCount:pane.querySelectorAll('.echo-editor .bb-combobox').length,
      mainControls:document.querySelectorAll('#echoMainStat>.bb-combobox').length,
      substatRows:[...document.querySelectorAll('#echoSubstats .echo-substat-row')].map(row=>row.querySelectorAll('.bb-combobox').length),
      copyAboveContext:cr.bottom<=xr.top+1,
      artLeftOfSonata:arr.right<=sr.left-4,
      artAndSonataVerticalOverlap:Math.min(arr.bottom,sr.bottom)-Math.max(arr.top,sr.top)>30,
      artTextOverlap:!(ar.bottom<=cr.top||ar.top>=cr.bottom||ar.right<=cr.left||ar.left>=cr.right),
      nameText:name.textContent.trim(),expectedName:echoById.get(echoUi.previewId).name,
      nameWhiteSpace:nameStyle.whiteSpace,nameTextOverflow:nameStyle.textOverflow,nameLines:Number.isFinite(nameLine)&&nameLine>0?name.scrollHeight/nameLine:null,nameFits:name.scrollHeight<=name.clientHeight+1&&name.scrollWidth<=name.clientWidth+1,
      sonataNames,
      mainAfterHero:mr.top>=hr.bottom,
      mainLabel:mainField.querySelector('label')?.textContent.trim()||'',
      mainFontSize:parseFloat(mainStyle.fontSize),mainFontWeight:Number(mainStyle.fontWeight)||0,
      substatFontSize:parseFloat(substatStyle.fontSize),substatFontWeight:Number(substatStyle.fontWeight)||0,
      mainOptions,mainValueText,expectedMainValue:canonical?echoStatValueText(canonical.name,canonical.value):null,
      secondaryLabel:secondaryLabel?.textContent.trim()||'',
      secondaryTag:secondary.tagName,
      secondaryInteractive:secondary.matches('input,select,button,a[href],[tabindex]:not([tabindex="-1"])')||!!secondary.querySelector('input,select,button,a[href],[role="combobox"]'),
      secondaryBorder:[secondaryStyle.borderTopWidth,secondaryStyle.borderRightWidth,secondaryStyle.borderBottomWidth,secondaryStyle.borderLeftWidth],
      secondaryParts:[...secondary.children].map(node=>node.textContent.trim()),
      secondaryExpected:(()=>{const value=echoSecondary(echoById.get(echoUi.previewId).cost,echoUi.editorDraft.level);return value?[value.name,echoStatValueText(value.name,value.value)]:[]})(),
      footerLast:shell.lastElementChild===footer,
      footerBottomGap:pr.bottom-er.bottom,
      footerBelowEditor:fr.top>=pane.querySelector('.echo-editor').getBoundingClientRect().bottom
    };
  })()`);
  if (
    layout2d.nativeSelects!==0 || layout2d.comboCount!==12 || layout2d.mainControls!==2 || layout2d.substatRows.some(count=>count!==2)
    || !layout2d.copyAboveContext || !layout2d.artLeftOfSonata || !layout2d.artAndSonataVerticalOverlap || layout2d.artTextOverlap
    || layout2d.nameText!==layout2d.expectedName || layout2d.nameWhiteSpace==='nowrap' || layout2d.nameTextOverflow==='ellipsis' || !layout2d.nameFits || layout2d.nameLines>2.05
    || !layout2d.sonataNames.length || layout2d.sonataNames.some(x=>!x.text||x.textOverflow==='ellipsis'||x.whiteSpace==='nowrap'||x.scrollWidth>x.clientWidth+1||x.scrollHeight>x.clientHeight+1||x.lines>2.05)
    || !layout2d.mainAfterHero || layout2d.mainLabel!=='MAIN STAT'
    || !(layout2d.mainFontSize>=layout2d.substatFontSize+3) || !(layout2d.mainFontWeight>layout2d.substatFontWeight)
    || layout2d.mainOptions.some(text=>text.includes('—')) || layout2d.mainValueText!==layout2d.expectedMainValue
    || layout2d.secondaryLabel!=='SECONDARY STAT' || layout2d.secondaryTag!=='DIV' || layout2d.secondaryInteractive
    || layout2d.secondaryBorder.some(value=>value!=='0px') || JSON.stringify(layout2d.secondaryParts)!==JSON.stringify(layout2d.secondaryExpected)
    || !layout2d.footerLast || !layout2d.footerBelowEditor || layout2d.footerBottomGap>18
  ) throw new Error(`Echo Preview/Editor Correction 2D structural/control contract failed: ${JSON.stringify(layout2d)}`);

  await openBellibingCombo(send,'echoMainStatName');
  const mainPopup=await evaluate(send,`(()=>{
    const pane=document.getElementById('echoPreviewPane').getBoundingClientRect(),list=document.getElementById('echoMainStatName-listbox'),lr=list.getBoundingClientRect(),style=getComputedStyle(list),root=document.querySelector('[data-combobox-id="echoMainStatName"]'),options=[...list.querySelectorAll('.bb-combobox-option')],current=root.dataset.value,alternative=options.find(node=>!node.disabled&&node.dataset.bbValue!==current);
    return {role:list.getAttribute('role'),hidden:list.hidden,background:style.backgroundColor,left:lr.left,right:lr.right,top:lr.top,bottom:lr.bottom,paneLeft:pane.left,paneRight:pane.right,paneTop:pane.top,paneBottom:pane.bottom,alternativeId:alternative?.id||null,alternativeValue:alternative?.dataset.bbValue||null};
  })()`);
  if(mainPopup.role!=='listbox'||mainPopup.hidden||!/^rgba?\((?:1[0-9]|2[0-9]|3[0-9])[, ]/.test(mainPopup.background)||mainPopup.left<mainPopup.paneLeft-1||mainPopup.right>mainPopup.paneRight+1||mainPopup.top<mainPopup.paneTop-1||mainPopup.bottom>mainPopup.paneBottom+1||!mainPopup.alternativeId){
    throw new Error(`Bellibing Main Stat popup escaped custom panel contract: ${JSON.stringify(mainPopup)}`);
  }
  await pointerClick(send,'#'+mainPopup.alternativeId);
  await waitForUi(send,`echoUi.editorDraft.mainStat.name===${JSON.stringify(mainPopup.alternativeValue)}`,'Physical Main Stat combobox selection did not apply');
  const mainAfterPhysical=await evaluate(send,`(()=>{
    const item=echoById.get(echoUi.previewId),card=echoUi.editorDraft,canonical=echoMainOptions(item.cost,card.level).find(option=>option.name===card.mainStat.name),valueRoot=document.querySelector('[data-combobox-id="echoMainStatValue"]');
    return {card:card.mainStat,canonical,valueText:document.querySelector('#echoMainStatValue-trigger .bb-combobox-value')?.textContent.trim(),valueOptions:[...document.querySelectorAll('#echoMainStatValue-listbox .bb-combobox-option')].map(x=>x.textContent.trim()),deterministic:valueRoot.classList.contains('is-deterministic')};
  })()`);
  if(!mainAfterPhysical.canonical||JSON.stringify(mainAfterPhysical.card)!==JSON.stringify(mainAfterPhysical.canonical)||mainAfterPhysical.valueText!==echoStatValueText(mainAfterPhysical.canonical.name,mainAfterPhysical.canonical.value)||mainAfterPhysical.valueOptions.length!==1||mainAfterPhysical.valueOptions[0]!==mainAfterPhysical.valueText||!mainAfterPhysical.deterministic){
    throw new Error(`Main Stat name/value source-backed separation failed after physical selection: ${JSON.stringify(mainAfterPhysical)}`);
  }
  await openBellibingCombo(send,'echoMainStatValue');
  await pointerClick(send,'#echoMainStatValue-option-0');

  const pointerAudit = await evaluate(send, `window.__echoPointerAudit.filter(x=>x.echoId===${JSON.stringify(firstId)})`);
  if (!pointerAudit.some(x=>x.type==='pointerdown') || !pointerAudit.some(x=>x.type==='pointerup') || !pointerAudit.some(x=>x.type==='click')) {
    throw new Error(`Echo card did not receive physical pointerdown/up/native click: ${JSON.stringify(pointerAudit)}`);
  }

  const alternateSonata = await evaluate(send, `(()=>{
    const item=echoById.get(${JSON.stringify(firstId)});
    return item.sonataSetIds.find(id=>id!==echoUi.editorDraft.selectedSonataSetId)||null
  })()`);
  if(!alternateSonata) throw new Error('Multi-Sonata Echo did not expose an alternate canonical assignment');
  await pointerClick(send, `#echoPreviewSonataChoices [data-sonata-id="${alternateSonata}"]`);
  await waitForUi(send, `echoUi.editorDraft.selectedSonataSetId===${JSON.stringify(alternateSonata)}`, 'Owned Echo Sonata assignment did not change');
  const transientSonata = await evaluate(send, `(()=>({storage:localStorage.getItem('bellibing-ui-checkpoint-v34'),slot:draft('Augusta').build.echoSets?.sets?.['set-1']?.slots?.[0]??null,selected:echoUi.editorDraft.selectedSonataSetId,allowed:echoById.get(${JSON.stringify(firstId)}).sonataSetIds}))()`);
  if(transientSonata.storage!==beforePreview||transientSonata.slot!==null||!transientSonata.allowed.includes(transientSonata.selected)){
    throw new Error(`Owned Echo Sonata assignment leaked before Equip: ${JSON.stringify(transientSonata)}`);
  }

  async function setSubstatRow(index) {
    const expectedName=await evaluate(send,`echoStatContract.substats[${index}].name`);
    await chooseBellibingComboOption(send,'echoSubstat'+index+'Name',index+1);
    await waitForUi(send,`echoUi.editorSubstatRows[${index}]?.name===${JSON.stringify(expectedName)}`,`Physical Substat ${index+1} name selection failed`);
    const expectedValue=await evaluate(send,`String(echoStatContract.substats[${index}].values[0])`);
    await chooseBellibingComboOption(send,'echoSubstat'+index+'Value',1);
    await waitForUi(send,`String(echoUi.editorSubstatRows[${index}]?.value)===${JSON.stringify(expectedValue)}`,`Physical Substat ${index+1} value selection failed`);
  }
  async function assertLevel(count) {
    const expected=count*5;
    const audit=await evaluate(send, `(()=>{
      const card=echoUi.editorDraft,item=echoById.get(echoUi.previewId),main=echoStatContract.mainStatsByCostAndLevel[String(item.cost)][String(card.level)].find(x=>x.name===card.mainStat.name),secondary=echoStatContract.secondaryMainStatsByCostAndLevel[String(item.cost)][String(card.level)];
      return {level:card.level,count:card.substats.length,main:card.mainStat,expectedMain:main,secondary:card.secondaryMainStat,expectedSecondary:secondary,label:document.getElementById('echoPreviewLevel').textContent.trim()}
    })()`);
    if(audit.level!==expected||audit.count!==count||JSON.stringify(audit.main)!==JSON.stringify(audit.expectedMain)||JSON.stringify(audit.secondary)!==JSON.stringify(audit.expectedSecondary)||audit.label!==`Level +${expected}`){
      throw new Error(`Derived Echo level/main-stat progression failed at ${count} substats: ${JSON.stringify(audit)}`);
    }
  }

  await assertLevel(0);
  for(let index=0;index<5;index++){await setSubstatRow(index);await assertLevel(index+1)}

  const desktopFit=await evaluate(send,`(()=>{
    const pane=document.getElementById('echoPreviewPane'),shell=pane.querySelector('.echo-preview-shell'),hero=pane.querySelector('.echo-preview-hero'),editor=pane.querySelector('.echo-editor'),footer=pane.querySelector('.echo-preview-footer'),equip=document.getElementById('echoEquip'),pr=pane.getBoundingClientRect(),sr=shell.getBoundingClientRect(),hr=hero.getBoundingClientRect(),dr=editor.getBoundingClientRect(),fr=footer.getBoundingClientRect(),er=equip.getBoundingClientRect(),rows=[...document.querySelectorAll('#echoSubstats .echo-substat-row')].map(x=>x.getBoundingClientRect()),last=rows.at(-1);
    return {
      scrollHeight:pane.scrollHeight,clientHeight:pane.clientHeight,scrollTop:pane.scrollTop,
      equipTop:er.top,equipBottom:er.bottom,paneBottom:pr.bottom,shellBottom:sr.bottom,heroHeight:hr.height,editorHeight:dr.height,
      rowCount:rows.length,rowsInside:rows.every(r=>r.top>=pr.top-1&&r.bottom<=pr.bottom+1&&r.height>0),
      lastSubstatBottom:last?.bottom??null,equipGap:last?er.top-last.bottom:null,overlap:last?er.top<last.bottom:false,
      footerAfterEditor:fr.top>=dr.bottom,footerBottomGap:pr.bottom-er.bottom,deadBelowEquip:Math.max(0,pr.bottom-er.bottom)
    }
  })()`);
  if(
    desktopFit.scrollHeight>desktopFit.clientHeight+1||desktopFit.scrollTop!==0
    ||desktopFit.equipBottom>desktopFit.paneBottom+1||desktopFit.rowCount!==5||!desktopFit.rowsInside
    ||desktopFit.lastSubstatBottom===null||desktopFit.equipGap<6||desktopFit.overlap||!desktopFit.footerAfterEditor
    ||desktopFit.footerBottomGap>18||desktopFit.deadBelowEquip>18||desktopFit.heroHeight<140
  ){
    throw new Error(`Desktop 1440x900 Correction 2D editor/footer composition failed: ${JSON.stringify(desktopFit)}`);
  }

  await chooseBellibingComboOption(send,'echoSubstat4Name',0);
  await assertLevel(4);

  await pointerClick(send, '#echoEquip');
  await waitForUi(send, `draft('Augusta').build.echoSets?.sets?.['set-1']?.slots?.[0]?.echoId===${JSON.stringify(firstId)}&&echoUi.open`, 'Equip Echo did not commit full slot 1 card');
  const firstCommit = await evaluate(send, `(()=>{
    const e=draft('Augusta').build.echoSets,card=e.sets?.['set-1']?.slots?.[0],item=echoById.get(card.echoId);
    return {open:echoUi.open,activeSetId:e.activeSetId,defaultSetId:e.defaultSetId,setName:e.sets?.['set-1']?.name,card,allowed:item.sonataSetIds}
  })()`);
  if (
    !firstCommit.open || firstCommit.activeSetId!=='set-1' || firstCommit.defaultSetId!=='set-1' || firstCommit.setName!=='Set 1'
    || firstCommit.card?.echoId!==firstId || firstCommit.card?.rank!==5 || firstCommit.card?.level!==20 || firstCommit.card?.substats?.length!==4
    || firstCommit.card?.selectedSonataSetId!==alternateSonata
    || JSON.stringify(firstCommit.card?.sonataSetIds)!==JSON.stringify(firstCommit.allowed)
  ) throw new Error(`Equip-only owned Echo full-card commit failed: ${JSON.stringify(firstCommit)}`);
  const equipAudit=await evaluate(send,`window.__echoPointerAudit.filter(x=>x.equip)`);
  for(const type of ['pointerdown','pointerup','click'])if(!equipAudit.some(x=>x.type===type))throw new Error('Equip Echo missed physical '+type);

  const committedIds=[firstId];
  for(let slot=1;slot<5;slot++){
    await pointerClick(send, `#echoWorkspaceSlots [data-echo-target="${slot}"]`);
    await waitForUi(send, `echoUi.targetSlot===${slot}&&echoUi.filter===${JSON.stringify(expectedCosts[slot])}`, `Slot ${slot+1} Cost recommendation lost during continuous workflow`);
    const id=await evaluate(send, `document.querySelector('#echoChoices .echo-choice:not([hidden])')?.dataset.echoId`);
    if(!id)throw new Error(`No visible Echo for Augusta slot ${slot+1}`);
    committedIds.push(id);
    await pointerClick(send, `#echoChoices .echo-choice[data-echo-id="${id}"]`);
    await pointerClick(send, '#echoEquip');
    await waitForUi(send, `draft('Augusta').build.echoSets?.sets?.['set-1']?.slots?.[${slot}]?.echoId===${JSON.stringify(id)}&&echoUi.open`, `Continuous Equip failed for slot ${slot+1}`);
  }

  await pointerClick(send, '#echoWorkspaceSlots [data-echo-target="0"]');
  await waitForUi(send, `echoUi.editorDraft?.echoId===${JSON.stringify(firstId)}`, 'Committed slot 1 did not reload into editor');
  const committedBeforeClose=await evaluate(send,`JSON.stringify(draft('Augusta').build.echoSets.sets['set-1'].slots[0])`);
  const committedSonata=await evaluate(send,`draft('Augusta').build.echoSets.sets['set-1'].slots[0].selectedSonataSetId`);
  const closeAlternate=await evaluate(send,`echoById.get(${JSON.stringify(firstId)}).sonataSetIds.find(id=>id!==${JSON.stringify(alternateSonata)})||null`);
  if(closeAlternate){
    await pointerClick(send, `#echoPreviewSonataChoices [data-sonata-id="${closeAlternate}"]`);
    await waitForUi(send, `echoUi.editorDraft.selectedSonataSetId===${JSON.stringify(closeAlternate)}`, 'Transient Sonata reassignment before Close failed');
  }
  const storageBeforeClose=await evaluate(send,`localStorage.getItem('bellibing-ui-checkpoint-v34')`);
  const closeMainOption=await evaluate(send,`(()=>{const root=document.querySelector('[data-combobox-id="echoMainStatName"]'),current=root.dataset.value;return [...document.querySelectorAll('#echoMainStatName-listbox .bb-combobox-option')].find(node=>!node.disabled&&node.dataset.bbValue!==current)?.id||null})()`);
  if(closeMainOption){await openBellibingCombo(send,'echoMainStatName');await pointerClick(send,'#'+closeMainOption)}
  if(await evaluate(send,`localStorage.getItem('bellibing-ui-checkpoint-v34')!==${JSON.stringify(storageBeforeClose)}`))throw new Error('Transient equipped Echo edit leaked before Equip');
  await capture(send, 'artifacts/ui-preview-echo-workspace-1440x900.png');
  await pointerClick(send, '#echoClose');
  await waitForUi(send, `!echoUi.open&&echoUi.previewId===null`, 'Echo close did not clear transient Preview');
  const committedAfterClose=await evaluate(send,`JSON.stringify(draft('Augusta').build.echoSets.sets['set-1'].slots[0])`);
  const sonataAfterClose=await evaluate(send,`draft('Augusta').build.echoSets.sets['set-1'].slots[0].selectedSonataSetId`);
  if(committedAfterClose!==committedBeforeClose||sonataAfterClose!==committedSonata)throw new Error('Close without Equip overwrote committed stats/Sonata assignment');

  await evaluate(send, `buildPicker.select('Aalto')`);
  await waitForUi(send, `echoUi.characterName==='Aalto'`, 'Character switch to Aalto did not bind Echo state');
  await pointerClick(send, '.echo[data-echo-slot="0"]');
  await waitForUi(send, `echoUi.open&&echoUi.targetSlot===0`, 'Aalto Echo Workspace did not open');
  const fallback = await evaluate(send, `(()=>({
    profile:echoUi.loadoutProfile,
    filter:echoUi.filter,
    selected:[...echoUi.selectedSonataIds],
    costs:[...document.querySelectorAll('#echoWorkspaceSlots .echo-slot-cost')].map(x=>x.textContent.trim()),
    mode:document.getElementById('echoSlotTargetMode').textContent.trim(),
    recommendedGroups:document.querySelectorAll('[data-sonata-group="recommended"]').length,
    otherGroups:document.querySelectorAll('[data-sonata-group="other"]').length,
    summary:document.getElementById('echoSonataSummary').textContent.trim()
  }))()`);
  if (fallback.profile!==null||fallback.filter!=='all'||fallback.selected.length||fallback.costs.some(x=>x!=='Manual')||fallback.mode!=='Manual Cost'||fallback.recommendedGroups!==0||fallback.otherGroups!==1||fallback.summary!=='All Sonata Sets') {
    throw new Error(`Aalto received invented Echo recommendations: ${JSON.stringify(fallback)}`);
  }
  const aaltId=await evaluate(send, `document.querySelector('#echoChoices .echo-choice:not([hidden])')?.dataset.echoId`);
  await pointerClick(send, `#echoChoices .echo-choice[data-echo-id="${aaltId}"]`);
  const aaltAllowed=await evaluate(send,`echoById.get(${JSON.stringify(aaltId)}).sonataSetIds`);
  const aaltSelected=await evaluate(send,`echoUi.editorDraft.selectedSonataSetId`);
  if(!aaltAllowed.includes(aaltSelected))throw new Error('Aalto manual fallback invented an owned Sonata assignment');
  await pointerClick(send, '#echoEquip');
  await waitForUi(send, `draft('Aalto').build.echoSets?.sets?.['set-1']?.slots?.[0]?.echoId===${JSON.stringify(aaltId)}`, 'Aalto manual Echo commit failed');
  await pointerClick(send, '#echoClose');

  await evaluate(send, `buildPicker.select('Augusta')`);
  await waitForUi(send, `echoUi.characterName==='Augusta'`, 'Character switch back to Augusta did not bind');
  const restoredAugusta = await evaluate(send, `readEchoSets('Augusta').sets['set-1'].slots.map(slot=>echoSlotId(slot))`);
  if (JSON.stringify(restoredAugusta)!==JSON.stringify(committedIds)) throw new Error(`Augusta committed Echoes did not restore independently: ${JSON.stringify(restoredAugusta)}`);

  const persistedBeforeReload=await evaluate(send,`JSON.stringify(readEchoSets('Augusta').sets['set-1'].slots[0])`);
  await navigate(send);
  await prepareBuild(send,'Augusta');
  const persistedAfterReload=await evaluate(send,`JSON.stringify(readEchoSets('Augusta').sets['set-1'].slots[0])`);
  if(persistedAfterReload!==persistedBeforeReload)throw new Error('Reload changed committed Echo stat card');
  await pointerClick(send,'.echo[data-echo-slot="0"]');
  await waitForUi(send,`echoUi.open&&JSON.stringify(echoUi.editorDraft)===${JSON.stringify(persistedAfterReload)}`,'Reload did not restore full committed Echo stat/Sonata card into editor');
  await pointerClick(send,'#echoClose');

  return { ids: committedIds, fallbackEcho: aaltId, ownedSonata: committedSonata };
}

async function verifyMobileSmoke(send) {
  await setViewport(send, 390, 844);
  await navigate(send);
  await prepareBuild(send, 'Augusta');
  await pointerClick(send, '.echo[data-echo-slot="2"]');
  await waitForUi(send, `echoUi.open&&echoUi.targetSlot===2&&echoUi.filter==='3'`, 'Mobile profile-backed Echo slot click failed');
  const metrics = await evaluate(send, `(()=>{
    const p=document.getElementById('echoPanel').getBoundingClientRect(),b=document.getElementById('echoBrowser');
    return{
      slots:document.querySelectorAll('#echoWorkspaceSlots .echo-workspace-slot').length,
      left:p.left,right:p.right,innerWidth,
      scrollable:b.scrollHeight>b.clientHeight,
      selected:[...echoUi.selectedSonataIds],
      selectedIcons:document.querySelectorAll('#echoSonataToggleIcons img').length,
      costs:[...document.querySelectorAll('#echoWorkspaceSlots .echo-slot-cost')].map(x=>x.textContent.trim())
    };
  })()`);
  if (metrics.slots!==5||metrics.left<-1||metrics.right>metrics.innerWidth+1||!metrics.scrollable||JSON.stringify(metrics.selected)!==JSON.stringify(['sonata-20','sonata-3'])||metrics.selectedIcons!==2||JSON.stringify(metrics.costs)!==JSON.stringify(['Cost 4','Cost 3','Cost 3','Cost 1','Cost 1'])) {
    throw new Error(`Mobile Echo Workspace recommendation/containment failed: ${JSON.stringify(metrics)}`);
  }
  await verifyCurrentBrowserFilter(send, 'Mobile Augusta Slot 3');
  const id = await evaluate(send, `document.querySelector('#echoChoices .echo-choice:not([hidden])')?.dataset.echoId`);
  if(!id)throw new Error('Mobile filtered Echo browser has no result');
  await pointerClick(send, `#echoChoices .echo-choice[data-echo-id="${id}"]`);
  await waitForUi(send, `echoUi.previewId===${JSON.stringify(id)}`, 'Mobile physical Echo card click did not Preview');
  const previewMetrics=await evaluate(send,`(()=>{
    const pane=document.getElementById('echoPreviewPane'),panel=document.getElementById('echoPanel'),hero=pane.querySelector('.echo-preview-hero'),copy=pane.querySelector('.echo-preview-copy'),context=pane.querySelector('.echo-preview-context'),artRegion=pane.querySelector('.echo-preview-art-region'),assignment=pane.querySelector('.echo-preview-sonata-assignment'),pr=pane.getBoundingClientRect(),wr=panel.getBoundingClientRect(),hr=hero.getBoundingClientRect(),cr=copy.getBoundingClientRect(),xr=context.getBoundingClientRect(),ar=artRegion.getBoundingClientRect(),sr=assignment.getBoundingClientRect();
    const names=[...document.querySelectorAll('#echoPreviewSonataChoices .echo-preview-sonata-option span')].map(node=>{const style=getComputedStyle(node),line=parseFloat(style.lineHeight);return{clientWidth:node.clientWidth,scrollWidth:node.scrollWidth,clientHeight:node.clientHeight,scrollHeight:node.scrollHeight,text:node.textContent.trim(),lines:Number.isFinite(line)&&line>0?node.scrollHeight/line:null}});
    const combos=[...document.querySelectorAll('#echoPreviewPane .echo-editor .bb-combobox-trigger')].map(node=>node.getBoundingClientRect());
    pane.scrollTop=pane.scrollHeight;
    const equip=document.getElementById('echoEquip').getBoundingClientRect(),last=document.querySelector('#echoSubstats .echo-substat-row:last-child').getBoundingClientRect();
    return{
      paneLeft:pr.left,paneRight:pr.right,panelLeft:wr.left,panelRight:wr.right,overflow:getComputedStyle(pane).overflowY,scrollHeight:pane.scrollHeight,clientHeight:pane.clientHeight,
      heroContained:hr.left>=pr.left-1&&hr.right<=pr.right+1,copyAboveContext:cr.bottom<=xr.top+1,artLeftOfSonata:ar.right<=sr.left-2,namesFit:names.every(x=>x.text&&x.scrollWidth<=x.clientWidth+1&&x.scrollHeight<=x.clientHeight+1&&x.lines<=2.05),
      combosContained:combos.every(r=>r.left>=pr.left-1&&r.right<=pr.right+1),
      nativeSelects:pane.querySelectorAll('.echo-editor select').length,
      equipVisible:Math.min(equip.bottom,pr.bottom)-Math.max(equip.top,pr.top)>0,equipGap:equip.top-last.bottom,overlap:equip.top<last.bottom
    };
  })()`);
  if(
    previewMetrics.paneLeft<previewMetrics.panelLeft-1||previewMetrics.paneRight>previewMetrics.panelRight+1
    ||!['auto','scroll'].includes(previewMetrics.overflow)||!previewMetrics.heroContained||!previewMetrics.copyAboveContext||!previewMetrics.artLeftOfSonata||!previewMetrics.namesFit||!previewMetrics.combosContained||previewMetrics.nativeSelects!==0
    ||!previewMetrics.equipVisible||previewMetrics.equipGap<6||previewMetrics.overlap
  ){
    throw new Error(`Mobile Correction 2D Preview/Editor is not contained/usable: ${JSON.stringify(previewMetrics)}`);
  }
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
    console.log('v34 Echo Workspace Stats Editor Correction 2D verification passed in real Chrome.');
    console.log(`- Desktop: Bellibing-owned custom Main/Substat comboboxes, separate Main name/value, full-width Echo identity over art|Sonata context, plain Secondary Stat, five visible Substats and bottom-anchored Equip passed with all 2B functional regressions.`);
    console.log(`- Committed desktop slots: ${desktop.ids.join(', ')}; owned Sonata: ${desktop.ownedSonata}; manual Aalto slot: ${desktop.fallbackEcho}.`);
    console.log(`- Mobile 390x844: contained identity + art|Sonata hero, Bellibing controls, scrollable editor and physical Echo Preview passed (${mobile.previewed}).`);
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
