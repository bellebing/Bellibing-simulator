import { mkdirSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';

const UI_URL = process.env.BELLIBING_V34_URL ?? 'http://127.0.0.1:4173/ui-preview/';
const DEBUG_PORT = Number(process.env.BELLIBING_V34_CHROME_DEBUG_PORT ?? 9666);
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
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const ready = await evaluate(send, `document.readyState === 'complete' && document.querySelectorAll('#homeStage .home-card').length === 3`);
    if (ready) return;
    await sleep(100);
  }
  throw new Error('UI preview did not become ready.');
}

async function setViewport(send, width, height) {
  const mobile=width<=768;
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  await send('Emulation.setTouchEmulationEnabled', { enabled: mobile, maxTouchPoints: mobile ? 5 : 1 });
  await sleep(60);
}

async function homeMetrics(send) {
  return evaluate(send, `(() => {
    const stage=document.getElementById('homeStage');
    const r=stage.getBoundingClientRect();
    const cards=[...document.querySelectorAll('#homeStage .home-card')];
    return {
      count:cards.length,
      focus:Number(stage.dataset.focusIndex),
      shellWidth:r.width,
      shellCenter:r.left+r.width/2,
      viewportCenter:innerWidth/2,
      scrollWidth:document.documentElement.scrollWidth,
      innerWidth,
      titlesAttached:cards.every(card=>card.contains(card.querySelector('.home-card-title'))&&card.contains(card.querySelector('.home-card-art')))
    };
  })()`);
}

async function drag(send, selector, direction=-1, fraction=.66, {touch=false}={}) {
  const bounds = await evaluate(send, `document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect().toJSON()`);
  const y=bounds.y+bounds.height*.5;
  const startX=bounds.x+bounds.width*(direction<0?.78:.22);
  const endX=bounds.x+bounds.width*(direction<0?Math.max(.05,.78-fraction):Math.min(.95,.22+fraction));
  if(touch){
    await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:startX,y,id:1,radiusX:1,radiusY:1,force:1}]});
    for(let i=1;i<=12;i++){
      const x=startX+(endX-startX)*(i/12);
      await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y,id:1,radiusX:1,radiusY:1,force:1}]});
      await sleep(12);
    }
    await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }else{
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:startX,y});
    await send('Input.dispatchMouseEvent',{type:'mousePressed',x:startX,y,button:'left',clickCount:1});
    for(let i=1;i<=12;i++){
      const x=startX+(endX-startX)*(i/12);
      await send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,button:'left',buttons:1});
      await sleep(12);
    }
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:endX,y,button:'left',clickCount:1});
  }
  await sleep(760);
}

async function pointerClick(send, selector, {touch=false}={}) {
  await evaluate(send,`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw new Error('Missing pointer target: '+${JSON.stringify(selector)});el.scrollIntoView({block:'center',inline:'center',behavior:'instant'})})()`);
  await sleep(60);
  const bounds=await evaluate(send,`(()=>{const el=document.querySelector(${JSON.stringify(selector)});const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,innerWidth,innerHeight}})()`);
  if(bounds.width<=0||bounds.height<=0||bounds.x+bounds.width<=0||bounds.y+bounds.height<=0||bounds.x>=bounds.innerWidth||bounds.y>=bounds.innerHeight) throw new Error(`Pointer target is not visible in viewport: ${selector} ${JSON.stringify(bounds)}`);
  const x=bounds.x+bounds.width*.5,y=bounds.y+bounds.height*.5;
  if(touch){
    await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1,radiusX:1,radiusY:1,force:1}]});
    await sleep(28);
    await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }else{
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});
    await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
    await sleep(28);
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});
  }
  await sleep(42);
}

async function waitForUi(send, expression, message, timeout=4000) {
  const deadline=Date.now()+timeout;
  while(Date.now()<deadline){
    if(await evaluate(send,expression)) return;
    await sleep(50);
  }
  throw new Error(message);
}

async function verifyRealPointerMenus(send) {
  await setViewport(send,1440,900);
  await navigate(send);

  // Default-centered Home card: one physical mouse click must activate Improve.
  await pointerClick(send,'#homeStage .card-improve');
  await waitForUi(send,`document.getElementById('improve').classList.contains('active')`,'Mouse click did not activate centered Improve a Character');
  await sleep(760);
  await pointerClick(send,'#improve [data-home]');
  await waitForUi(send,`document.getElementById('home').classList.contains('active')`,'Mouse click did not return from Improve to Home');

  // Build: real drag focuses the side card, real click activates it.
  await drag(send,'#homeStage',1,.48);
  const buildFocused=await evaluate(send,`Number(document.getElementById('homeStage').dataset.focusIndex)===0`);
  if(!buildFocused) throw new Error('Real mouse drag did not focus Build a Character before click audit');
  await pointerClick(send,'#homeStage .card-build');
  await waitForUi(send,`document.getElementById('build').classList.contains('active')`,'Mouse click did not activate Build a Character');
  await waitForUi(send,`document.querySelectorAll('#buildWheel .choice').length===57`,'Build Character picker did not load for mouse click audit',15000);

  // Second menu: centered Character card must be a genuine mouse target, not keyboard-only.
  const buildFocus=await evaluate(send,`Number(document.getElementById('buildWheel').dataset.focusIndex)`);
  const buildLabel=await evaluate(send,`document.querySelectorAll('#buildWheel .choice')[Number(document.getElementById('buildWheel').dataset.focusIndex)]?.getAttribute('aria-label')||''`);
  if(!Number.isInteger(buildFocus)||!buildLabel) throw new Error('Build Character picker has no focused card for mouse audit');
  await pointerClick(send,`#buildWheel .choice[aria-label="${buildLabel.replace(/"/g,'\\\"')}"]`);
  await waitForUi(send,`document.getElementById('buildShell').classList.contains('has-selection')`,'Mouse click did not select centered Character card');
  const selected=await evaluate(send,`document.getElementById('buildName').textContent.trim()`);
  if(selected!==buildLabel) throw new Error(`Mouse-selected Character mismatch: expected ${buildLabel}, got ${selected}`);

  // Make one owned Character so Improve's second carousel can be audited with a real click too.
  await pointerClick(send,'#accountBtn');
  await sleep(80);
  await pointerClick(send,'#build [data-home]');
  await waitForUi(send,`document.getElementById('home').classList.contains('active')`,'Mouse click did not return from Build to Home');

  await pointerClick(send,'#homeStage .card-improve');
  await waitForUi(send,`document.getElementById('improve').classList.contains('active')`,'Second Improve mouse entry failed');
  await waitForUi(send,`document.querySelectorAll('#improveWheel .choice').length===1`,'Improve Character picker did not expose the owned Character');
  await pointerClick(send,'#improveWheel .choice');
  await waitForUi(send,`document.getElementById('improveShell').classList.contains('has-selection')`,'Mouse click did not select Character in Improve picker');
  const improved=await evaluate(send,`document.getElementById('improveFocus').textContent.trim()`);
  if(improved!==buildLabel) throw new Error(`Improve mouse-selected Character mismatch: expected ${buildLabel}, got ${improved}`);
  await pointerClick(send,'#improve [data-home]');
  await waitForUi(send,`document.getElementById('home').classList.contains('active')`,'Mouse click did not return from Improve after picker audit');

  // Team side card uses the same Home carousel: focus by real drag, then activate by real click.
  await drag(send,'#homeStage',-1,.48);
  const teamFocused=await evaluate(send,`Number(document.getElementById('homeStage').dataset.focusIndex)===2`);
  if(!teamFocused) throw new Error('Real mouse drag did not focus Build a Team before click audit');
  await pointerClick(send,'#homeStage .card-team');
  await waitForUi(send,`document.getElementById('team').classList.contains('active')`,'Mouse click did not activate Build a Team');
  await pointerClick(send,'#team [data-home]');
  await waitForUi(send,`document.getElementById('home').classList.contains('active')`,'Mouse click did not return from Team to Home');

  return {character:buildLabel};
}

async function enterBuild(send) {
  await evaluate(send, `document.querySelector('#homeStage .card-build').click()`);
  await sleep(700);
  await evaluate(send, `document.querySelector('#homeStage .card-build').click()`);
  const deadline=Date.now()+10000;
  while(Date.now()<deadline){
    const active=await evaluate(send,`document.getElementById('build').classList.contains('active')`);
    if(active) break;
    await sleep(100);
  }
  const readyDeadline=Date.now()+15000;
  while(Date.now()<readyDeadline){
    const count=await evaluate(send,`document.querySelectorAll('#buildWheel .choice').length`);
    if(count===57) return;
    await sleep(100);
  }
  throw new Error('Build selector did not load 57 released Characters.');
}

async function buildMetrics(send) {
  return evaluate(send, `(() => {
    const cards=[...document.querySelectorAll('#buildWheel .choice')];
    const images=cards.map(card=>card.querySelector('img'));
    const names=cards.map(card=>card.getAttribute('aria-label'));
    const shell=document.getElementById('buildShell');
    const state=shell.classList.contains('hover-expanded')?'HOVER_EXPANDED':shell.classList.contains('has-selection')?'COMPACT':'EXPANDED';
    const typography=cards.map(card=>{
      const name=card.querySelector('.choice-name');
      const portrait=card.querySelector('.choice-portrait');
      const style=getComputedStyle(name);
      const nameRect=name.getBoundingClientRect();
      const portraitRect=portrait.getBoundingClientRect();
      const fontSize=parseFloat(style.fontSize);
      const lineHeight=parseFloat(style.lineHeight);
      const paddingBottom=parseFloat(style.paddingBottom);
      const lineBoxSafe=Number.isFinite(fontSize)&&Number.isFinite(lineHeight)&&lineHeight>=fontSize*1.18&&paddingBottom>=3;
      const layoutWidth=parseFloat(style.width);
      const oneLine=Number.isFinite(layoutWidth)&&name.scrollWidth<=layoutWidth+1&&name.scrollHeight<=name.clientHeight+1;
      const placementSafe=state==='COMPACT'?nameRect.top>=portraitRect.bottom+2:nameRect.bottom<=portraitRect.top-2;
      return {label:card.getAttribute('aria-label'),lineBoxSafe,oneLine,placementSafe,overflow:style.overflow,scrollWidth:name.scrollWidth,layoutWidth,clientWidth:name.clientWidth,scrollHeight:name.scrollHeight,clientHeight:name.clientHeight};
    });
    const descenderLabels=typography.filter(item=>/[gjpqy]/i.test(item.label||''));
    return {
      count:cards.length,
      loaded:images.filter(img=>img?.complete&&img.naturalWidth>0).length,
      focus:Number(document.getElementById('buildWheel').dataset.focusIndex),
      focusName:names[Number(document.getElementById('buildWheel').dataset.focusIndex)]??null,
      names,
      state,
      oneLine:typography.every(item=>item.oneLine),
      overflowLabels:typography.filter(item=>!item.oneLine).map(item=>({label:item.label,scrollWidth:item.scrollWidth,layoutWidth:item.layoutWidth,clientWidth:item.clientWidth,scrollHeight:item.scrollHeight,clientHeight:item.clientHeight})),
      textMetricsSafe:typography.every(item=>item.lineBoxSafe&&item.placementSafe&&item.overflow==='visible'),
      descenderMetricsSafe:descenderLabels.length>0&&descenderLabels.every(item=>item.lineBoxSafe&&item.placementSafe&&item.overflow==='visible'),
      descenderLabels:descenderLabels.map(item=>item.label),
      headerFirst:state==='COMPACT'?true:typography.every(item=>item.placementSafe),
      fit:images[0]?getComputedStyle(images[0]).objectFit:null,
      pos:images[0]?getComputedStyle(images[0]).objectPosition:null,
      noHorizontalPageScroll:document.documentElement.scrollWidth<=innerWidth+1
    };
  })()`);
}

async function verifyWeaponOverlay(send, width, height, capturePath) {
  const touch=width<=760;
  const alreadySelected=await evaluate(send,`document.getElementById('buildShell').classList.contains('has-selection')`);
  if(!alreadySelected){
    await evaluate(send,`(()=>{const w=document.getElementById('buildWheel'),i=Number(w.dataset.focusIndex),c=w.querySelectorAll('.choice')[i];if(!c)throw new Error('Focused Build card missing');c.click()})()`);
    await sleep(760);
  }

  const fresh=await evaluate(send,`(()=>{const h=document.getElementById('weaponSlotHost'),b=document.getElementById('weaponBtn'),wr=b.getBoundingClientRect(),weaponHeading=b.closest('.block')?.querySelector('h2'),statsHeading=document.querySelector('.side-left .block h2'),echoHeading=document.querySelector('.echoes h2');return{slotCount:h.querySelectorAll('.weapon-card').length,currentId:weaponUi.currentId,previewId:weaponUi.previewId,button:{width:wr.width,height:wr.height},align:{weapon:weaponHeading?getComputedStyle(weaponHeading).textAlign:null,stats:statsHeading?getComputedStyle(statsHeading).textAlign:null,echo:echoHeading?getComputedStyle(echoHeading).textAlign:null}}})()`);
  if(fresh.slotCount!==0||fresh.currentId!==null||fresh.previewId!==null) throw new Error(`Fresh Weapon state must start unequipped: ${JSON.stringify(fresh)}`);
  if(width>760&&(Math.abs(fresh.button.height-108)>1.5||fresh.button.width<220||fresh.button.width/fresh.button.height<2)) throw new Error(`Desktop Build Weapon summary must be a wide 108px-high equipment card: ${JSON.stringify(fresh.button)}`);
  if(width>760&&(fresh.align.weapon!=='center'||fresh.align.stats!=='center'||fresh.align.echo!=='center')) throw new Error(`Desktop Build section headings must be centered: ${JSON.stringify(fresh.align)}`);

  await pointerClick(send,'#weaponBtn',{touch});
  await sleep(470);
  const opened=await evaluate(send,`(()=>{const o=document.getElementById('weaponOverlay'),p=document.getElementById('weaponPanel'),scrim=document.querySelector('.weapon-scrim'),r=p.getBoundingClientRect(),ps=getComputedStyle(p),ss=getComputedStyle(scrim),equip=document.getElementById('weaponEquip');return{mounted:o.classList.contains('mounted'),open:o.classList.contains('open'),hidden:o.getAttribute('aria-hidden'),expanded:document.getElementById('weaponBtn').getAttribute('aria-expanded'),options:document.querySelectorAll('#weaponChoices .weapon-choice').length,order:[...document.querySelectorAll('#weaponChoices .weapon-choice')].map(x=>x.dataset.weaponId),equipped:document.querySelectorAll('#weaponChoices .weapon-choice.is-equipped').length,previewLayers:document.querySelectorAll('#weaponPreviewStage .weapon-preview-layer').length,previewHidden:document.getElementById('weaponPreviewPane').getAttribute('aria-hidden'),equipText:equip?.textContent.trim()||null,equipDisabled:equip?.disabled??null,flying:document.querySelectorAll('.weapon-card.is-flying').length,panel:{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height},align:{panelTitle:getComputedStyle(document.getElementById('weaponTitle')).textAlign,optionsTitle:getComputedStyle(document.querySelector('.weapon-options-head h3')).textAlign,cardCopy:getComputedStyle(document.querySelector('#weaponChoices .weapon-card-copy')).textAlign,previewCopy:getComputedStyle(document.querySelector('.weapon-preview-copy')).textAlign,previewStats:getComputedStyle(document.querySelector('.weapon-preview-stats')).textAlign,previewEffect:getComputedStyle(document.querySelector('.weapon-preview-effect')).textAlign},visual:{scrimBackground:ss.backgroundColor,panelBackground:ps.backgroundImage,panelBackdrop:ps.backdropFilter}}})()`);
  if(!opened.mounted||!opened.open||opened.hidden!=='false'||opened.expanded!=='true') throw new Error(`Weapon overlay did not open: ${JSON.stringify(opened)}`);
  if(opened.options!==7||opened.equipped!==0||opened.previewLayers!==0||opened.previewHidden!=='true'||opened.equipText!=='Equip Weapon'||opened.equipDisabled!==true||opened.flying!==0) throw new Error(`Fresh Select Weapon grid/Preview/Equip contract failed: ${JSON.stringify(opened)}`);
  if(width>760&&(Math.abs(opened.panel.width-980)>1.5||Math.abs(opened.panel.height-720)>1.5)) throw new Error(`Locked desktop Weapon panel must be 980x720: ${JSON.stringify(opened.panel)}`);
  if(opened.panel.left<-1||opened.panel.top<-1||opened.panel.right>width+1||opened.panel.bottom>height+1) throw new Error(`Weapon overlay escaped viewport: ${JSON.stringify(opened.panel)}`);
  if(!opened.visual.scrimBackground.includes('0.48')||!opened.visual.panelBackground.includes('0.74')||!opened.visual.panelBackground.includes('0.7')||!opened.visual.panelBackdrop.includes('blur(5px)')) throw new Error(`Weapon overlay glass contract failed: ${JSON.stringify(opened.visual)}`);
  if(width>760&&(opened.align.panelTitle!=='center'||opened.align.optionsTitle!=='center'||opened.align.cardCopy!=='center'||opened.align.previewCopy!=='center'||opened.align.previewStats!=='left'||opened.align.previewEffect!=='left')) throw new Error(`Weapon text hierarchy alignment failed: ${JSON.stringify(opened.align)}`);

  // Click means Preview only. Active, slot 1, grid order and Build slot must remain untouched.
  await pointerClick(send,'#weaponChoices .weapon-choice[data-weapon-id="preview-01"]',{touch});
  await waitForUi(send,`!weaponUi.busy&&weaponUi.currentId===null&&weaponUi.previewId==='preview-01'`,'First Weapon Preview did not settle without equipping',3000);
  const previewOnly=await evaluate(send,`(()=>{const choices=[...document.querySelectorAll('#weaponChoices .weapon-choice')],equip=document.getElementById('weaponEquip'),preview=document.querySelector('#weaponPreviewStage .weapon-preview-layer');return{currentId:weaponUi.currentId,previewId:weaponUi.previewId,order:choices.map(x=>x.dataset.weaponId),equipped:choices.filter(x=>x.classList.contains('is-equipped')).length,slotCount:document.querySelectorAll('#weaponSlotHost .weapon-card').length,previewIdDom:preview?.dataset.weaponId||null,previewCardId:preview?.querySelector('.weapon-card')?.dataset.weaponId||null,equipText:equip.textContent.trim(),equipDisabled:equip.disabled,flying:document.querySelectorAll('.weapon-card.is-flying').length,gridCards:document.querySelectorAll('#weaponChoices .weapon-card').length}})()`);
  const baseOrder=['preview-01','preview-02','preview-03','preview-04','preview-05','preview-06','preview-07'];
  if(previewOnly.currentId!==null||previewOnly.previewId!=='preview-01'||previewOnly.equipped!==0||previewOnly.slotCount!==0||previewOnly.previewIdDom!=='preview-01'||previewOnly.previewCardId!=='preview-01'||previewOnly.equipText!=='Equip Weapon'||previewOnly.equipDisabled||previewOnly.flying!==0||previewOnly.gridCards!==7||JSON.stringify(previewOnly.order)!==JSON.stringify(baseOrder)) throw new Error(`Weapon click mutated Active before Equip: ${JSON.stringify(previewOnly)}`);

  // Explicit Equip is the first point allowed to mutate Active / slot 1.
  await pointerClick(send,'#weaponEquip',{touch});
  await waitForUi(send,`!weaponUi.busy&&weaponUi.currentId==='preview-01'&&weaponUi.previewId==='preview-01'`,'Equip Weapon did not commit first Active Weapon',3000);
  const firstActive=await evaluate(send,`(()=>{const choices=[...document.querySelectorAll('#weaponChoices .weapon-choice')],first=choices[0],equip=document.getElementById('weaponEquip'),host=document.getElementById('weaponSlotHost'),button=document.getElementById('weaponBtn'),badge=first?.querySelector('.weapon-equipped-badge');return{currentId:weaponUi.currentId,previewId:weaponUi.previewId,order:choices.map(x=>x.dataset.weaponId),firstId:first?.dataset.weaponId||null,firstEquipped:first?.classList.contains('is-equipped')||false,badgeText:badge?.textContent.trim()||null,badgeDisplay:badge?getComputedStyle(badge).display:null,buildCards:host.querySelectorAll('.weapon-card').length,buildCardId:host.querySelector('.weapon-card')?.dataset.weaponId||null,buildHasWeapon:host.classList.contains('has-weapon'),buttonLabel:button.getAttribute('aria-label'),equipText:equip.textContent.trim(),equipDisabled:equip.disabled,flying:document.querySelectorAll('.weapon-card.is-flying').length}})()`);
  if(firstActive.currentId!=='preview-01'||firstActive.previewId!=='preview-01'||firstActive.firstId!=='preview-01'||!firstActive.firstEquipped||firstActive.badgeText!=='Active Weapon'||firstActive.badgeDisplay==='none'||firstActive.buildCards!==1||firstActive.buildCardId!=='preview-01'||!firstActive.buildHasWeapon||firstActive.buttonLabel!=='Open Weapon menu. Active: Weapon 01'||firstActive.equipText!=='Active Weapon'||!firstActive.equipDisabled||firstActive.flying!==0||JSON.stringify(firstActive.order)!==JSON.stringify(baseOrder)) throw new Error(`Explicit Equip did not establish Active slot 1 + Build Weapon summary: ${JSON.stringify(firstActive)}`);

  if(touch){
    if(capturePath) await capture(send,capturePath);
    await pointerClick(send,'#weaponClose',{touch:true});await sleep(470);
    const mobileClosed=await evaluate(send,`(()=>{const o=document.getElementById('weaponOverlay'),host=document.getElementById('weaponSlotHost'),button=document.getElementById('weaponBtn');return{mounted:o.classList.contains('mounted'),hidden:o.getAttribute('aria-hidden'),currentId:weaponUi.currentId,buildCards:host.querySelectorAll('.weapon-card').length,buildCardId:host.querySelector('.weapon-card')?.dataset.weaponId||null,buildHasWeapon:host.classList.contains('has-weapon'),buttonLabel:button.getAttribute('aria-label'),flying:document.querySelectorAll('.weapon-card.is-flying').length}})()`);
    if(mobileClosed.mounted||mobileClosed.hidden!=='true'||mobileClosed.currentId!=='preview-01'||mobileClosed.buildCards!==1||mobileClosed.buildCardId!=='preview-01'||!mobileClosed.buildHasWeapon||mobileClosed.buttonLabel!=='Open Weapon menu. Active: Weapon 01'||mobileClosed.flying!==0) throw new Error(`Mobile Weapon preview/equip smoke close failed: ${JSON.stringify(mobileClosed)}`);
    return {previewed:'Weapon 01',equipped:'Weapon 01',mobileDetailPending:true};
  }

  // Desktop: browse multiple previews without touching Active or grid ordering.
  for(const id of ['preview-02','preview-03','preview-04','preview-06']){
    await pointerClick(send,`#weaponChoices .weapon-choice[data-weapon-id="${id}"]`);
    await waitForUi(send,`!weaponUi.busy&&weaponUi.currentId==='preview-01'&&weaponUi.previewId==='${id}'`,`Preview ${id} incorrectly changed Active or failed to settle`,3000);
    const state=await evaluate(send,`(()=>({currentId:weaponUi.currentId,previewId:weaponUi.previewId,order:[...document.querySelectorAll('#weaponChoices .weapon-choice')].map(x=>x.dataset.weaponId),firstId:document.querySelector('#weaponChoices .weapon-choice')?.dataset.weaponId||null,buildCards:document.querySelectorAll('#weaponSlotHost .weapon-card').length,buildCardId:document.querySelector('#weaponSlotHost .weapon-card')?.dataset.weaponId||null,buildHasWeapon:document.getElementById('weaponSlotHost').classList.contains('has-weapon'),buttonLabel:document.getElementById('weaponBtn').getAttribute('aria-label'),equipText:document.getElementById('weaponEquip').textContent.trim(),equipDisabled:document.getElementById('weaponEquip').disabled,flying:document.querySelectorAll('.weapon-card.is-flying').length}))()`);
    if(state.currentId!=='preview-01'||state.previewId!==id||state.firstId!=='preview-01'||state.buildCards!==1||state.buildCardId!=='preview-01'||!state.buildHasWeapon||state.buttonLabel!=='Open Weapon menu. Active: Weapon 01'||state.equipText!=='Equip Weapon'||state.equipDisabled||state.flying!==0||JSON.stringify(state.order)!==JSON.stringify(baseOrder)) throw new Error(`Preview browsing mutated Active/grid/Build Weapon summary for ${id}: ${JSON.stringify(state)}`);
  }

  // User-like return to Weapon 02: tunnel transition changes Preview only.
  await pointerClick(send,'#weaponChoices .weapon-choice[data-weapon-id="preview-02"]');
  await waitForUi(send,`weaponUi.currentId==='preview-01'&&weaponUi.previewId==='preview-02'`,'Weapon 02 did not enter Preview while Weapon 01 stayed Active',1200);
  await sleep(55);
  const tunnel=await evaluate(send,`(()=>{const layers=[...document.querySelectorAll('#weaponPreviewStage .weapon-preview-layer')],incoming=layers.find(x=>x.classList.contains('is-incoming')),outgoing=layers.find(x=>x.classList.contains('is-outgoing'));const keyframes=el=>el?.getAnimations?.()[0]?.effect?.getKeyframes?.()||[];const ik=keyframes(incoming),ok=keyframes(outgoing),spec=weaponUi.previewMotion,trace=weaponUi.lastPreviewTransition;return{reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,count:layers.length,currentId:weaponUi.currentId,previewId:weaponUi.previewId,incomingId:incoming?.dataset.weaponId||null,outgoingId:outgoing?.dataset.weaponId||null,incomingFrom:ik[0]?.transform||null,incomingTo:ik.at(-1)?.transform||null,outgoingTo:ok.at(-1)?.transform||null,outgoingOpacity:ok.at(-1)?.opacity??null,spec,trace,firstId:document.querySelector('#weaponChoices .weapon-choice')?.dataset.weaponId||null,buildCards:document.querySelectorAll('#weaponSlotHost .weapon-card').length,buildCardId:document.querySelector('#weaponSlotHost .weapon-card')?.dataset.weaponId||null,buttonLabel:document.getElementById('weaponBtn').getAttribute('aria-label'),flying:document.querySelectorAll('.weapon-card.is-flying').length,gridCards:document.querySelectorAll('#weaponChoices .weapon-card').length}})()`);
  const specOk=tunnel.spec?.incomingFrom===0.64&&tunnel.spec?.incomingTo===1&&tunnel.spec?.outgoingFrom===1&&tunnel.spec?.outgoingTo===1.24&&tunnel.spec?.outgoingOpacity===0&&tunnel.spec?.incomingMs===460&&tunnel.spec?.outgoingMs===360;
  const traceOk=tunnel.trace?.from==='preview-06'&&tunnel.trace?.to==='preview-02'&&tunnel.trace?.incomingFrom===0.64&&tunnel.trace?.outgoingTo===1.24&&tunnel.trace?.outgoingOpacity===0;
  if(!specOk||!traceOk||tunnel.currentId!=='preview-01'||tunnel.previewId!=='preview-02'||tunnel.firstId!=='preview-01'||tunnel.buildCards!==1||tunnel.buildCardId!=='preview-01'||tunnel.buttonLabel!=='Open Weapon menu. Active: Weapon 01'||tunnel.flying!==0||tunnel.gridCards!==7) throw new Error(`Weapon Preview tunnel changed Active/grid/Build Weapon summary state: ${JSON.stringify(tunnel)}`);
  if(!tunnel.reduced&&(tunnel.count!==2||tunnel.incomingId!=='preview-02'||tunnel.outgoingId!=='preview-06'||!String(tunnel.incomingFrom).includes('scale(0.64)')||!String(tunnel.incomingTo).includes('scale(1)')||!String(tunnel.outgoingTo).includes('scale(1.24)')||String(tunnel.outgoingOpacity)!=='0')) throw new Error(`Weapon Preview live tunnel layers failed: ${JSON.stringify(tunnel)}`);
  if(tunnel.reduced&&tunnel.count!==1) throw new Error(`Weapon Preview reduced-motion fallback failed: ${JSON.stringify(tunnel)}`);

  await waitForUi(send,`!weaponUi.busy&&weaponUi.currentId==='preview-01'&&weaponUi.previewId==='preview-02'`,'Final Weapon 02 Preview did not settle',3000);
  if(capturePath) await capture(send,capturePath);

  // Only Equip Weapon may now promote Weapon 02 to slot 1. Old Active Weapon 01 returns to ranked remainder.
  await pointerClick(send,'#weaponEquip');
  await waitForUi(send,`!weaponUi.busy&&weaponUi.currentId==='preview-02'&&weaponUi.previewId==='preview-02'`,'Equip Weapon did not promote Preview to Active',3000);
  const committed=await evaluate(send,`(()=>{const choices=[...document.querySelectorAll('#weaponChoices .weapon-choice')],first=choices[0],second=choices[1],equip=document.getElementById('weaponEquip'),host=document.getElementById('weaponSlotHost'),button=document.getElementById('weaponBtn');return{currentId:weaponUi.currentId,previewId:weaponUi.previewId,order:choices.map(x=>x.dataset.weaponId),firstId:first?.dataset.weaponId||null,firstEquipped:first?.classList.contains('is-equipped')||false,secondId:second?.dataset.weaponId||null,buildCards:host.querySelectorAll('.weapon-card').length,buildCardId:host.querySelector('.weapon-card')?.dataset.weaponId||null,buildHasWeapon:host.classList.contains('has-weapon'),buttonLabel:button.getAttribute('aria-label'),equipText:equip.textContent.trim(),equipDisabled:equip.disabled,flying:document.querySelectorAll('.weapon-card.is-flying').length}})()`);
  const expected=['preview-02','preview-01','preview-03','preview-04','preview-05','preview-06','preview-07'];
  if(committed.currentId!=='preview-02'||committed.previewId!=='preview-02'||committed.firstId!=='preview-02'||!committed.firstEquipped||committed.secondId!=='preview-01'||committed.buildCards!==1||committed.buildCardId!=='preview-02'||!committed.buildHasWeapon||committed.buttonLabel!=='Open Weapon menu. Active: Weapon 02'||committed.equipText!=='Active Weapon'||!committed.equipDisabled||committed.flying!==0||JSON.stringify(committed.order)!==JSON.stringify(expected)) throw new Error(`Equip commit did not perform Active slot 1 swap + Build Weapon summary update correctly: ${JSON.stringify(committed)}`);

  // Closing is panel-only; Preview is discarded but Active remains committed.
  await pointerClick(send,'#weaponClose');await sleep(90);
  const closing=await evaluate(send,`(()=>{const o=document.getElementById('weaponOverlay'),host=document.getElementById('weaponSlotHost'),button=document.getElementById('weaponBtn');return{mounted:o.classList.contains('mounted'),open:o.classList.contains('open'),hidden:o.getAttribute('aria-hidden'),currentId:weaponUi.currentId,buildCards:host.querySelectorAll('.weapon-card').length,buildCardId:host.querySelector('.weapon-card')?.dataset.weaponId||null,buildHasWeapon:host.classList.contains('has-weapon'),buttonLabel:button.getAttribute('aria-label'),flying:document.querySelectorAll('.weapon-card.is-flying').length}})()`);
  if(!closing.mounted||closing.open||closing.hidden!=='false'||closing.currentId!=='preview-02'||closing.buildCards!==1||closing.buildCardId!=='preview-02'||!closing.buildHasWeapon||closing.buttonLabel!=='Open Weapon menu. Active: Weapon 02'||closing.flying!==0) throw new Error(`Weapon close must preserve committed Active in Build Weapon summary with no card flights: ${JSON.stringify(closing)}`);
  await sleep(360);
  if(capturePath&&width>760) await capture(send,capturePath.replace('weapon-overlay','weapon-build-active'));

  await pointerClick(send,'#weaponBtn');await sleep(470);
  const reopened=await evaluate(send,`(()=>{const choices=[...document.querySelectorAll('#weaponChoices .weapon-choice')],first=choices[0],equip=document.getElementById('weaponEquip');return{firstId:first?.dataset.weaponId||null,firstEquipped:first?.classList.contains('is-equipped')||false,currentId:weaponUi.currentId,previewId:weaponUi.previewId,previewLayers:document.querySelectorAll('#weaponPreviewStage .weapon-preview-layer').length,previewHidden:document.getElementById('weaponPreviewPane').getAttribute('aria-hidden'),equipText:equip.textContent.trim(),equipDisabled:equip.disabled,flying:document.querySelectorAll('.weapon-card.is-flying').length}})()`);
  if(reopened.firstId!=='preview-02'||!reopened.firstEquipped||reopened.currentId!=='preview-02'||reopened.previewId!==null||reopened.previewLayers!==0||reopened.previewHidden!=='true'||reopened.equipText!=='Equip Weapon'||!reopened.equipDisabled||reopened.flying!==0) throw new Error(`Weapon reopen did not preserve Active + reset Preview: ${JSON.stringify(reopened)}`);
  await pointerClick(send,'#weaponClose');await sleep(470);
  return {previewed:'Weapon 02',equipped:'Weapon 02'};
}

async function capture(send, path) {
  const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true});
  mkdirSync('artifacts',{recursive:true});
  writeFileSync(path,Buffer.from(shot.data,'base64'));
}

const matrix=[[390,844],[768,1024],[1440,900],[1920,1080],[2560,1440],[3440,1440],[7680,2160]];
const chrome=spawn(CHROME,[
  '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
  `--remote-debugging-port=${DEBUG_PORT}`,'--remote-debugging-address=127.0.0.1',
  '--user-data-dir=/tmp/bellibing-v34-carousel-runtime','about:blank'
],{stdio:['ignore','pipe','pipe']});
let stderr='';chrome.stderr.on('data',chunk=>{stderr+=String(chunk)});

try{
  await waitForChrome();
  const page=await createPage();
  if(!page.webSocketDebuggerUrl) throw new Error('Chrome page has no DevTools websocket URL.');
  const {socket,send}=cdp(page.webSocketDebuggerUrl);
  try{
    await send('Page.enable');await send('Runtime.enable');
    for(const [width,height] of matrix){
      await setViewport(send,width,height);await navigate(send);
      const home=await homeMetrics(send);
      if(home.count!==3||home.focus!==1) throw new Error(`Home invariant failed at ${width}x${height}: ${JSON.stringify(home)}`);
      if(home.shellWidth>1280.5||Math.abs(home.shellCenter-home.viewportCenter)>1.5) throw new Error(`Home AppShell failed at ${width}x${height}: ${JSON.stringify(home)}`);
      if(home.scrollWidth>home.innerWidth+1||!home.titlesAttached) throw new Error(`Home containment failed at ${width}x${height}: ${JSON.stringify(home)}`);
    }

    const pointerMenus=await verifyRealPointerMenus(send);

    await setViewport(send,1440,900);await navigate(send);
    await drag(send,'#homeStage',-1,.62);
    const homeAfter=await homeMetrics(send);
    if(homeAfter.focus!==2) throw new Error(`Desktop Home drag did not freewheel to Team: ${JSON.stringify(homeAfter)}`);

    await navigate(send);await enterBuild(send);
    await evaluate(send,`document.querySelector('#buildWheel .choice[aria-label="Lingyang"]').click()`);
    await sleep(760);
    const expandedNames=await buildMetrics(send);
    if(expandedNames.focusName!=='Lingyang') throw new Error(`Lingyang did not center for typography review: ${JSON.stringify(expandedNames)}`);
    if(expandedNames.count!==57||expandedNames.loaded!==57||!expandedNames.oneLine||!expandedNames.headerFirst||!expandedNames.textMetricsSafe||!expandedNames.descenderMetricsSafe||expandedNames.fit!=='contain'||expandedNames.pos!=='50% 50%') throw new Error(`Expanded Build typography contract failed: ${JSON.stringify(expandedNames)}`);
    for(const sentinel of ['Buling','Lingyang','Yangyang']) if(!expandedNames.descenderLabels.includes(sentinel)) throw new Error(`Missing descender sentinel ${sentinel} from typography audit.`);
    await capture(send,'artifacts/ui-preview-build-names-expanded-1440x900.png');

    await evaluate(send,`document.querySelector('#buildWheel .choice[aria-label="Lingyang"]').click()`);
    await sleep(700);
    const compactNames=await buildMetrics(send);
    if(compactNames.state!=='COMPACT'||!compactNames.oneLine||!compactNames.textMetricsSafe||!compactNames.descenderMetricsSafe) throw new Error(`Compact Build typography contract failed: ${JSON.stringify(compactNames)}`);
    await evaluate(send,`document.getElementById('buildShell').classList.add('hover-expanded');window.dispatchEvent(new Event('resize'))`);
    await sleep(700);
    const hoverNames=await buildMetrics(send);
    if(hoverNames.state!=='HOVER_EXPANDED'||!hoverNames.oneLine||!hoverNames.headerFirst||!hoverNames.textMetricsSafe||!hoverNames.descenderMetricsSafe) throw new Error(`Hover-expanded Build typography contract failed: ${JSON.stringify(hoverNames)}`);
    await capture(send,'artifacts/ui-preview-build-names-hover-expanded-1440x900.png');
    const desktopWeapon=await verifyWeaponOverlay(send,1440,900,'artifacts/ui-preview-weapon-overlay-1440x900.png');

    await navigate(send);await enterBuild(send);
    await waitForUi(send,`(()=>{const cards=[...document.querySelectorAll('#buildWheel .choice')],images=cards.map(card=>card.querySelector('img'));return cards.length===57&&images.every(img=>img?.complete&&img.naturalWidth>0)})()`,'Desktop Build portraits did not settle to 57/57 after navigation',15000);
    const desktopBefore=await buildMetrics(send);
    if(desktopBefore.count!==57||desktopBefore.loaded!==57||!desktopBefore.oneLine||!desktopBefore.headerFirst||!desktopBefore.textMetricsSafe||desktopBefore.fit!=='contain'||desktopBefore.pos!=='50% 50%') throw new Error(`Desktop Build card contract failed: ${JSON.stringify(desktopBefore)}`);
    for(const forbidden of ['Jingran','Hsin','Suoming']) if(desktopBefore.names.includes(forbidden)) throw new Error(`${forbidden} leaked into released Build selector.`);
    for(const rover of ['Rover (Aero)','Rover (Electro)','Rover (Havoc)','Rover (Spectro)']) if(!desktopBefore.names.includes(rover)) throw new Error(`Missing ${rover}.`);
    await drag(send,'#buildWheel',-1,.72);
    const desktopAfter=await buildMetrics(send);
    if(desktopAfter.focus-desktopBefore.focus<2) throw new Error(`Desktop Build drag did not traverse multiple cards: ${desktopBefore.focus} -> ${desktopAfter.focus}`);

    await setViewport(send,390,844);await navigate(send);await enterBuild(send);
    const mobileBefore=await buildMetrics(send);
    if(!mobileBefore.noHorizontalPageScroll||!mobileBefore.textMetricsSafe) throw new Error(`Mobile Build contract failed: ${JSON.stringify(mobileBefore)}`);
    await drag(send,'#buildWheel',-1,.72,{touch:true});
    const mobileAfter=await buildMetrics(send);
    if(mobileAfter.focus-mobileBefore.focus<2) throw new Error(`Mobile Build drag did not traverse multiple cards: ${mobileBefore.focus} -> ${mobileAfter.focus}`);
    const mobileWeapon=await verifyWeaponOverlay(send,390,844,'artifacts/ui-preview-weapon-overlay-390x844.png');

    console.log('v34 runtime carousel verification passed in real Chrome.');
    console.log('- Home finite centered shell passed 390x844 through 7680x2160.');
    console.log('- Home mouse drag reached Team from default Improve focus.');
    console.log(`- Real mouse click navigation passed for Home Build/Improve/Team plus Build and Improve Character pickers; selected: ${pointerMenus.character}.`);
    console.log('- Build selector loaded 57/57 released canonical portraits with descender-safe one-line names in EXPANDED, COMPACT and HOVER_EXPANDED states.');
    console.log('- Buling, Lingyang and Yangyang are explicit ETNA descender sentinels.');
    console.log(`- Desktop Build multi-card drag: ${desktopBefore.focus+1}/57 -> ${desktopAfter.focus+1}/57.`);
    console.log(`- Mobile Build touch drag: ${mobileBefore.focus+1}/57 -> ${mobileAfter.focus+1}/57.`);
    console.log(`- Weapon Preview/Equip separation passed with restored wide Build equipment summary showing the committed Weapon card; Preview remains independent and no card flights exist; desktop equipped: ${desktopWeapon.equipped}, mobile smoke equipped: ${mobileWeapon.equipped}.`);
  }finally{socket.close()}
}catch(error){
  console.error(error);
  if(stderr.trim()) console.error(stderr.slice(-4000));
  process.exitCode=1;
}finally{chrome.kill('SIGTERM')}
