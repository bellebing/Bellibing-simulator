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

  const fresh=await evaluate(send,`(()=>{const h=document.getElementById('weaponSlotHost');return{slotCount:h.querySelectorAll('.weapon-card').length,currentId:weaponUi.currentId,previewId:weaponUi.previewId}})()`);
  if(fresh.slotCount!==0||fresh.currentId!==null||fresh.previewId!==null) throw new Error(`Fresh Weapon state must start unequipped: ${JSON.stringify(fresh)}`);

  await pointerClick(send,'#weaponBtn',{touch});
  await sleep(470);
  const opened=await evaluate(send,`(()=>{const o=document.getElementById('weaponOverlay'),p=document.getElementById('weaponPanel'),scrim=document.querySelector('.weapon-scrim'),r=p.getBoundingClientRect(),ps=getComputedStyle(p),ss=getComputedStyle(scrim),buttons=[...p.querySelectorAll('button')].map(b=>b.textContent.trim());return{mounted:o.classList.contains('mounted'),open:o.classList.contains('open'),hidden:o.getAttribute('aria-hidden'),expanded:document.getElementById('weaponBtn').getAttribute('aria-expanded'),options:document.querySelectorAll('#weaponChoices .weapon-choice').length,order:[...document.querySelectorAll('#weaponChoices .weapon-choice')].map(x=>x.dataset.weaponId),equipped:document.querySelectorAll('#weaponChoices .weapon-choice.is-equipped').length,previewLayers:document.querySelectorAll('#weaponPreviewStage .weapon-preview-layer').length,previewHidden:document.getElementById('weaponPreviewPane').getAttribute('aria-hidden'),choose:buttons.filter(t=>/^choose weapon$/i.test(t)).length,flying:document.querySelectorAll('.weapon-card.is-flying').length,panel:{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height},visual:{scrimBackground:ss.backgroundColor,panelBackground:ps.backgroundImage,panelBackdrop:ps.backdropFilter}}})()`);
  if(!opened.mounted||!opened.open||opened.hidden!=='false'||opened.expanded!=='true') throw new Error(`Weapon overlay did not open: ${JSON.stringify(opened)}`);
  if(opened.options!==7||opened.equipped!==0||opened.previewLayers!==0||opened.previewHidden!=='true'||opened.choose!==0||opened.flying!==0) throw new Error(`Fresh Select Weapon grid/Preview contract failed: ${JSON.stringify(opened)}`);
  if(width>760&&(Math.abs(opened.panel.width-980)>1.5||Math.abs(opened.panel.height-720)>1.5)) throw new Error(`Locked desktop Weapon panel must be 980x720: ${JSON.stringify(opened.panel)}`);
  if(opened.panel.left<-1||opened.panel.top<-1||opened.panel.right>width+1||opened.panel.bottom>height+1) throw new Error(`Weapon overlay escaped viewport: ${JSON.stringify(opened.panel)}`);
  if(!opened.visual.scrimBackground.includes('0.48')||!opened.visual.panelBackground.includes('0.74')||!opened.visual.panelBackground.includes('0.7')||!opened.visual.panelBackdrop.includes('blur(5px)')) throw new Error(`Weapon overlay glass contract failed: ${JSON.stringify(opened.visual)}`);

  // First click immediately equips slot 1 and opens an independent Preview clone.
  await pointerClick(send,'#weaponChoices .weapon-choice[data-weapon-id="preview-01"]',{touch});
  await waitForUi(send,`!weaponUi.busy&&weaponUi.currentId==='preview-01'&&weaponUi.previewId==='preview-01'`,'First Weapon selection did not settle before second click',3000);
  const first=await evaluate(send,`(()=>{const choices=[...document.querySelectorAll('#weaponChoices .weapon-choice')],first=choices[0],gridCard=first?.querySelector('.weapon-card'),preview=document.querySelector('#weaponPreviewStage .weapon-preview-layer'),slot=document.querySelector('#weaponSlotHost .weapon-card'),badge=gridCard?.querySelector('.weapon-equipped-badge');return{currentId:weaponUi.currentId,previewId:weaponUi.previewId,order:choices.map(x=>x.dataset.weaponId),firstId:first?.dataset.weaponId||null,firstEquipped:first?.classList.contains('is-equipped')||false,gridCardId:gridCard?.dataset.weaponId||null,badgeText:badge?.textContent.trim()||null,badgeDisplay:badge?getComputedStyle(badge).display:null,previewIdDom:preview?.dataset.weaponId||null,previewCardId:preview?.querySelector('.weapon-card')?.dataset.weaponId||null,previewLayers:document.querySelectorAll('#weaponPreviewStage .weapon-preview-layer').length,slotId:slot?.dataset.weaponId||null,flying:document.querySelectorAll('.weapon-card.is-flying').length,gridContains:document.querySelectorAll('#weaponChoices .weapon-card').length}})()`);
  if(first.currentId!=='preview-01'||first.previewId!=='preview-01'||first.firstId!=='preview-01'||!first.firstEquipped||first.gridCardId!=='preview-01'||first.badgeText!=='Active Weapon'||first.badgeDisplay==='none'||first.previewIdDom!=='preview-01'||first.previewCardId!=='preview-01'||first.previewLayers!==1||first.slotId!=='preview-01'||first.flying!==0||first.gridContains!==7) throw new Error(`First click did not produce Active slot 1 + independent Preview: ${JSON.stringify(first)}`);

  // Second click must swap only grid positions while Preview performs the tunnel cross-transition.
  await pointerClick(send,'#weaponChoices .weapon-choice[data-weapon-id="preview-02"]',{touch});
  await waitForUi(send,`weaponUi.currentId==='preview-02'&&weaponUi.previewId==='preview-02'`,'Second Weapon click did not enter the Active/Preview state',1200);
  await sleep(55);
  const tunnel=await evaluate(send,`(()=>{const layers=[...document.querySelectorAll('#weaponPreviewStage .weapon-preview-layer')],incoming=layers.find(x=>x.classList.contains('is-incoming')),outgoing=layers.find(x=>x.classList.contains('is-outgoing'));const keyframes=el=>el?.getAnimations?.()[0]?.effect?.getKeyframes?.()||[];const ik=keyframes(incoming),ok=keyframes(outgoing),spec=weaponUi.previewMotion,trace=weaponUi.lastPreviewTransition;return{reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,count:layers.length,currentId:weaponUi.currentId,previewId:weaponUi.previewId,incomingId:incoming?.dataset.weaponId||null,outgoingId:outgoing?.dataset.weaponId||null,incomingFrom:ik[0]?.transform||null,incomingTo:ik.at(-1)?.transform||null,outgoingFrom:ok[0]?.transform||null,outgoingTo:ok.at(-1)?.transform||null,outgoingOpacity:ok.at(-1)?.opacity??null,spec,trace,flying:document.querySelectorAll('.weapon-card.is-flying').length,gridCards:document.querySelectorAll('#weaponChoices .weapon-card').length}})()`);
  const specOk=tunnel.spec?.incomingFrom===0.64&&tunnel.spec?.incomingTo===1&&tunnel.spec?.outgoingFrom===1&&tunnel.spec?.outgoingTo===1.24&&tunnel.spec?.outgoingOpacity===0&&tunnel.spec?.incomingMs===460&&tunnel.spec?.outgoingMs===360;
  const traceOk=tunnel.trace?.from==='preview-01'&&tunnel.trace?.to==='preview-02'&&tunnel.trace?.incomingFrom===0.64&&tunnel.trace?.outgoingTo===1.24&&tunnel.trace?.outgoingOpacity===0;
  if(!specOk||!traceOk||tunnel.currentId!=='preview-02'||tunnel.previewId!=='preview-02'||tunnel.flying!==0||tunnel.gridCards!==7) throw new Error(`Weapon Preview tunnel motion spec/state failed: ${JSON.stringify(tunnel)}`);
  if(!tunnel.reduced&&(tunnel.count!==2||tunnel.incomingId!=='preview-02'||tunnel.outgoingId!=='preview-01'||!String(tunnel.incomingFrom).includes('scale(0.64)')||!String(tunnel.incomingTo).includes('scale(1)')||!String(tunnel.outgoingTo).includes('scale(1.24)')||String(tunnel.outgoingOpacity)!=='0')) throw new Error(`Weapon Preview live tunnel layers failed: ${JSON.stringify(tunnel)}`);
  if(tunnel.reduced&&(tunnel.count!==1||tunnel.previewId!=='preview-02')) throw new Error(`Weapon Preview reduced-motion fallback failed: ${JSON.stringify(tunnel)}`);

  await sleep(500);
  const second=await evaluate(send,`(()=>{const choices=[...document.querySelectorAll('#weaponChoices .weapon-choice')],first=choices[0],second=choices[1],fourth=choices[3],preview=document.querySelector('#weaponPreviewStage .weapon-preview-layer'),slot=document.querySelector('#weaponSlotHost .weapon-card');return{currentId:weaponUi.currentId,previewId:weaponUi.previewId,order:choices.map(x=>x.dataset.weaponId),firstId:first?.dataset.weaponId||null,firstEquipped:first?.classList.contains('is-equipped')||false,secondId:second?.dataset.weaponId||null,fourthId:fourth?.dataset.weaponId||null,previewIdDom:preview?.dataset.weaponId||null,previewLayers:document.querySelectorAll('#weaponPreviewStage .weapon-preview-layer').length,slotId:slot?.dataset.weaponId||null,flying:document.querySelectorAll('.weapon-card.is-flying').length}})()`);
  const expected=['preview-02','preview-01','preview-03','preview-04','preview-05','preview-06','preview-07'];
  if(second.currentId!=='preview-02'||second.previewId!=='preview-02'||second.firstId!=='preview-02'||!second.firstEquipped||second.secondId!=='preview-01'||second.fourthId!=='preview-04'||second.previewIdDom!=='preview-02'||second.previewLayers!==1||second.slotId!=='preview-02'||second.flying!==0||JSON.stringify(second.order)!==JSON.stringify(expected)) throw new Error(`Active slot 1 / ranked remainder ordering failed: ${JSON.stringify(second)}`);
  if(capturePath) await capture(send,capturePath);

  // Closing is panel-only: no Weapon card may fly toward the viewport corner or Build slot.
  await pointerClick(send,'#weaponClose',{touch});
  await sleep(90);
  const closing=await evaluate(send,`(()=>{const o=document.getElementById('weaponOverlay');return{mounted:o.classList.contains('mounted'),open:o.classList.contains('open'),hidden:o.getAttribute('aria-hidden'),flying:document.querySelectorAll('.weapon-card.is-flying').length,slotId:document.querySelector('#weaponSlotHost .weapon-card')?.dataset.weaponId||null}})()`);
  if(!closing.mounted||closing.open||closing.hidden!=='false'||closing.flying!==0||closing.slotId!=='preview-02') throw new Error(`Weapon close must be panel-only with stable Build slot: ${JSON.stringify(closing)}`);
  await sleep(360);
  const closed=await evaluate(send,`(()=>{const o=document.getElementById('weaponOverlay');return{mounted:o.classList.contains('mounted'),hidden:o.getAttribute('aria-hidden'),expanded:document.getElementById('weaponBtn').getAttribute('aria-expanded'),currentId:weaponUi.currentId,slotId:document.querySelector('#weaponSlotHost .weapon-card')?.dataset.weaponId||null,flying:document.querySelectorAll('.weapon-card.is-flying').length}})()`);
  if(closed.mounted||closed.hidden!=='true'||closed.expanded!=='false'||closed.currentId!=='preview-02'||closed.slotId!=='preview-02'||closed.flying!==0) throw new Error(`Weapon close state failed: ${JSON.stringify(closed)}`);

  // Reopen: Active stays fixed in slot 1 and Preview intentionally resets empty.
  await pointerClick(send,'#weaponBtn',{touch});
  await sleep(470);
  const reopened=await evaluate(send,`(()=>{const choices=[...document.querySelectorAll('#weaponChoices .weapon-choice')],first=choices[0];return{firstId:first?.dataset.weaponId||null,firstEquipped:first?.classList.contains('is-equipped')||false,previewLayers:document.querySelectorAll('#weaponPreviewStage .weapon-preview-layer').length,previewHidden:document.getElementById('weaponPreviewPane').getAttribute('aria-hidden'),flying:document.querySelectorAll('.weapon-card.is-flying').length}})()`);
  if(reopened.firstId!=='preview-02'||!reopened.firstEquipped||reopened.previewLayers!==0||reopened.previewHidden!=='true'||reopened.flying!==0) throw new Error(`Weapon reopen did not preserve Active slot 1 + empty Preview: ${JSON.stringify(reopened)}`);
  await pointerClick(send,'#weaponClose',{touch});await sleep(470);
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
    console.log(`- Weapon selector slot-first/tunnel flow passed: Active stays grid item #1, ranked remainder stays ordered, Preview uses independent zoom/fade layers, and no Weapon card flight exists; equipped: ${desktopWeapon.equipped} / ${mobileWeapon.equipped}.`);
  }finally{socket.close()}
}catch(error){
  console.error(error);
  if(stderr.trim()) console.error(stderr.slice(-4000));
  process.exitCode=1;
}finally{chrome.kill('SIGTERM')}
