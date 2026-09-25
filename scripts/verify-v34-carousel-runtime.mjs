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
  const slotBefore=await evaluate(send,`(()=>{const b=document.getElementById('weaponBtn'),h=document.getElementById('weaponSlotHost');return{cardCount:h.querySelectorAll('.weapon-card').length,emptyVisible:getComputedStyle(h.querySelector('.weapon-empty')).opacity,expanded:b.getAttribute('aria-expanded')}})()`);
  if(slotBefore.cardCount!==0) throw new Error(`Fresh Weapon slot must start empty: ${JSON.stringify(slotBefore)}`);

  await pointerClick(send,'#weaponBtn',{touch});
  await sleep(120);
  const opening=await evaluate(send,`(()=>{const o=document.getElementById('weaponOverlay'),p=document.getElementById('weaponPanel'),ps=getComputedStyle(p);return{mounted:o.classList.contains('mounted'),open:o.classList.contains('open'),hidden:o.getAttribute('aria-hidden'),expanded:document.getElementById('weaponBtn').getAttribute('aria-expanded'),busy:weaponUi.busy,transition:ps.transitionDuration}})()`);
  if(!opening.mounted||!opening.open||opening.hidden!=='false'||opening.expanded!=='true'||!opening.transition.includes('0.38s')) throw new Error(`Weapon no-current open animation did not start: ${JSON.stringify(opening)}`);
  await sleep(360);

  const opened=await evaluate(send,`(()=>{const o=document.getElementById('weaponOverlay'),p=document.getElementById('weaponPanel'),scrim=document.querySelector('.weapon-scrim'),r=p.getBoundingClientRect(),buttons=[...p.querySelectorAll('button')].map(b=>b.textContent.trim()),first=document.querySelector('#weaponChoices .weapon-choice'),firstCard=first?.querySelector('.weapon-card'),fr=firstCard?.getBoundingClientRect(),ps=getComputedStyle(p),ss=getComputedStyle(scrim);return{mounted:o.classList.contains('mounted'),open:o.classList.contains('open'),hidden:o.getAttribute('aria-hidden'),expanded:document.getElementById('weaponBtn').getAttribute('aria-expanded'),hasCurrentHost:!!document.getElementById('weaponCurrentHost'),options:document.querySelectorAll('#weaponChoices .weapon-choice').length,visibleOptions:[...document.querySelectorAll('#weaponChoices .weapon-choice')].filter(x=>getComputedStyle(x).display!=='none').length,equippedCount:document.querySelectorAll('#weaponChoices .weapon-choice.is-equipped').length,panel:{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height},first:fr?{left:fr.left,top:fr.top,width:fr.width,height:fr.height}:null,actionButtons:buttons.filter(t=>/^(save|apply)$/i.test(t)),chooseButtons:buttons.filter(t=>/^choose weapon$/i.test(t)),visual:{scrimBackground:ss.backgroundColor,panelBackground:ps.backgroundImage,panelBackdrop:ps.backdropFilter,cardBackground:firstCard?getComputedStyle(firstCard).backgroundImage:null,cardOpacity:firstCard?getComputedStyle(firstCard).opacity:null,chooseOpacity:getComputedStyle(document.getElementById('weaponChoose')).opacity}}})()`);
  if(!opened.mounted||!opened.open||opened.hidden!=='false'||opened.expanded!=='true') throw new Error(`Weapon overlay did not open at ${width}x${height}: ${JSON.stringify(opened)}`);
  if(opened.hasCurrentHost||opened.options!==7||opened.visibleOptions!==7||opened.equippedCount!==0||opened.actionButtons.length||opened.chooseButtons.length!==1) throw new Error(`Empty Weapon browse state failed: ${JSON.stringify(opened)}`);
  if(opened.panel.left<-1||opened.panel.top<-1||opened.panel.right>width+1||opened.panel.bottom>height+1) throw new Error(`Weapon overlay escaped viewport at ${width}x${height}: ${JSON.stringify(opened.panel)}`);
  if(width>760&&(Math.abs(opened.panel.width-980)>1.5||Math.abs(opened.panel.height-720)>1.5)) throw new Error(`Locked desktop Weapon panel must be 980x720: ${JSON.stringify(opened.panel)}`);
  if(!opened.visual.scrimBackground.includes('0.48')||!opened.visual.panelBackground.includes('0.74')||!opened.visual.panelBackground.includes('0.7')||!opened.visual.panelBackdrop.includes('blur(5px)')) throw new Error(`Weapon overlay transparency contract failed: ${JSON.stringify(opened.visual)}`);
  if(opened.visual.cardOpacity!=='1'||opened.visual.chooseOpacity!=='1'||!opened.visual.cardBackground?.includes('linear-gradient')) throw new Error(`Weapon content must remain solid above transparent glass: ${JSON.stringify(opened.visual)}`);

  // Closing with no equipped Weapon must still visibly animate instead of unmounting immediately.
  await pointerClick(send,'#weaponClose',{touch});
  await sleep(90);
  const emptyClosing=await evaluate(send,`(()=>{const o=document.getElementById('weaponOverlay');return{mounted:o.classList.contains('mounted'),open:o.classList.contains('open'),hidden:o.getAttribute('aria-hidden'),busy:weaponUi.busy}})()`);
  if(!emptyClosing.mounted||emptyClosing.open||emptyClosing.hidden!=='false'||!emptyClosing.busy) throw new Error(`No-current Weapon close did not preserve the closing animation: ${JSON.stringify(emptyClosing)}`);
  await sleep(360);
  const emptyClosed=await evaluate(send,`(()=>{const o=document.getElementById('weaponOverlay');return{mounted:o.classList.contains('mounted'),hidden:o.getAttribute('aria-hidden'),expanded:document.getElementById('weaponBtn').getAttribute('aria-expanded')}})()`);
  if(emptyClosed.mounted||emptyClosed.hidden!=='true'||emptyClosed.expanded!=='false') throw new Error(`No-current Weapon close did not finish cleanly: ${JSON.stringify(emptyClosed)}`);

  await pointerClick(send,'#weaponBtn',{touch});
  await sleep(620);

  if(width>760&&opened.first){
    const choiceBounds=await evaluate(send,`document.querySelector('#weaponChoices .weapon-choice').getBoundingClientRect().toJSON()`);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:choiceBounds.x+choiceBounds.width*.5,y:choiceBounds.y+choiceBounds.height*.5});
    await sleep(220);
    const hovered=await evaluate(send,`(()=>{const choice=document.querySelector('#weaponChoices .weapon-choice'),card=choice.querySelector('.weapon-card'),r=card.getBoundingClientRect();return{width:r.width,height:r.height,choiceWidth:choice.getBoundingClientRect().width,transform:getComputedStyle(card).transform}})()`);
    if(hovered.width<opened.first.width*1.035||hovered.height<opened.first.height*1.035||hovered.choiceWidth<opened.first.width*.95) throw new Error(`Weapon hover focus did not bubble above the stable grid: ${JSON.stringify({before:opened.first,after:hovered})}`);
  }

  await pointerClick(send,'#weaponChoices .weapon-choice[data-weapon-id="preview-01"]',{touch});
  await sleep(600);
  const firstPreview=await evaluate(send,`(()=>{const p=document.getElementById('weaponPanel'),preview=document.querySelector('#weaponPreviewHost .weapon-card'),source=document.querySelector('#weaponChoices .weapon-choice[data-weapon-id="preview-01"]'),pr=preview?.getBoundingClientRect(),choose=document.getElementById('weaponChoose');return{hasPreview:p.classList.contains('has-preview'),previewId:preview?.dataset.weaponId||null,previewName:document.getElementById('weaponPreviewName').textContent.trim(),currentId:weaponUi.currentCard?.dataset.weaponId||null,sourceGhost:source?.classList.contains('is-preview-source')||false,sourceHasCard:!!source?.querySelector('.weapon-card'),chooseText:choose.textContent.trim(),chooseDisabled:choose.disabled,previewRect:pr?{width:pr.width,height:pr.height}:null}})()`);
  if(!firstPreview.hasPreview||firstPreview.previewId!=='preview-01'||firstPreview.previewName!=='Weapon 01'||firstPreview.currentId!==null||!firstPreview.sourceGhost||firstPreview.sourceHasCard||firstPreview.chooseText!=='Choose Weapon'||firstPreview.chooseDisabled) throw new Error(`First Weapon preview state failed: ${JSON.stringify(firstPreview)}`);
  if(!firstPreview.previewRect||!opened.first||firstPreview.previewRect.height<opened.first.height*1.20) throw new Error(`Weapon preview did not visibly enlarge from the grid: ${JSON.stringify({grid:opened.first,preview:firstPreview.previewRect})}`);

  await pointerClick(send,'#weaponChoose',{touch});
  await sleep(650);
  const firstEquip=await evaluate(send,`(()=>{const p=document.getElementById('weaponPanel'),choices=document.getElementById('weaponChoices'),first=choices.firstElementChild,card=first?.querySelector('.weapon-card'),badge=card?.querySelector('.weapon-equipped-badge');return{hasPreview:p.classList.contains('has-preview'),currentId:weaponUi.currentCard?.dataset.weaponId||null,firstId:first?.dataset.weaponId||null,firstEquipped:first?.classList.contains('is-equipped')||false,firstCardId:card?.dataset.weaponId||null,badgeText:badge?.textContent.trim()||null,badgeDisplay:badge?getComputedStyle(badge).display:null,visibleOptions:[...choices.children].filter(x=>getComputedStyle(x).display!=='none').length,previewCount:document.querySelectorAll('#weaponPreviewHost .weapon-card').length,slotCount:document.querySelectorAll('#weaponSlotHost .weapon-card').length}})()`);
  if(firstEquip.hasPreview||firstEquip.currentId!=='preview-01'||firstEquip.firstId!=='preview-01'||!firstEquip.firstEquipped||firstEquip.firstCardId!=='preview-01'||firstEquip.badgeText!=='Currently Equipped'||firstEquip.badgeDisplay==='none'||firstEquip.visibleOptions!==7||firstEquip.previewCount!==0||firstEquip.slotCount!==0) throw new Error(`First Choose Weapon / equipped-first contract failed: ${JSON.stringify(firstEquip)}`);

  await pointerClick(send,'#weaponChoices .weapon-choice[data-weapon-id="preview-02"]',{touch});
  await sleep(600);
  const secondPreview=await evaluate(send,`(()=>{const p=document.getElementById('weaponPanel'),preview=document.querySelector('#weaponPreviewHost .weapon-card'),source=document.querySelector('#weaponChoices .weapon-choice[data-weapon-id="preview-02"]'),choices=document.getElementById('weaponChoices'),first=choices.firstElementChild,choose=document.getElementById('weaponChoose'),pane=document.getElementById('weaponPreviewPane'),chooseRect=choose.getBoundingClientRect(),paneRect=pane.getBoundingClientRect();return{hasPreview:p.classList.contains('has-preview'),previewId:preview?.dataset.weaponId||null,currentId:weaponUi.currentCard?.dataset.weaponId||null,firstId:first?.dataset.weaponId||null,firstEquipped:first?.classList.contains('is-equipped')||false,sourceGhost:source?.classList.contains('is-preview-source')||false,choose:{top:chooseRect.top,bottom:chooseRect.bottom,height:chooseRect.height},pane:{top:paneRect.top,bottom:paneRect.bottom}}})()`);
  if(!secondPreview.hasPreview||secondPreview.previewId!=='preview-02'||secondPreview.currentId!=='preview-01'||secondPreview.firstId!=='preview-01'||!secondPreview.firstEquipped||!secondPreview.sourceGhost) throw new Error(`Preview must preserve Currently Equipped as grid item #1: ${JSON.stringify(secondPreview)}`);
  if(secondPreview.choose.height<36||secondPreview.choose.top<secondPreview.pane.top-1||secondPreview.choose.bottom>secondPreview.pane.bottom+1) throw new Error(`Choose Weapon is clipped or outside Preview: ${JSON.stringify(secondPreview)}`);
  if(capturePath) await capture(send,capturePath);

  await pointerClick(send,'#weaponChoose',{touch});
  await sleep(680);
  const swapped=await evaluate(send,`(()=>{const p=document.getElementById('weaponPanel'),choices=document.getElementById('weaponChoices'),first=choices.children[0],second=choices.children[1],firstCard=first?.querySelector('.weapon-card'),oldCard=second?.querySelector('.weapon-card'),badge=firstCard?.querySelector('.weapon-equipped-badge');return{hasPreview:p.classList.contains('has-preview'),currentId:weaponUi.currentCard?.dataset.weaponId||null,firstId:first?.dataset.weaponId||null,firstCardId:firstCard?.dataset.weaponId||null,firstEquipped:first?.classList.contains('is-equipped')||false,badgeText:badge?.textContent.trim()||null,secondId:second?.dataset.weaponId||null,oldReturnedId:oldCard?.dataset.weaponId||null,visibleOptions:[...choices.children].filter(x=>getComputedStyle(x).display!=='none').length,previewCount:document.querySelectorAll('#weaponPreviewHost .weapon-card').length}})()`);
  if(swapped.hasPreview||swapped.currentId!=='preview-02'||swapped.firstId!=='preview-02'||swapped.firstCardId!=='preview-02'||!swapped.firstEquipped||swapped.badgeText!=='Currently Equipped'||swapped.secondId!=='preview-01'||swapped.oldReturnedId!=='preview-01'||swapped.visibleOptions!==7||swapped.previewCount!==0) throw new Error(`Flowy Preview→equipped-first / old-current→grid swap failed: ${JSON.stringify(swapped)}`);

  await pointerClick(send,'#weaponClose',{touch});
  await sleep(110);
  const closing=await evaluate(send,`(()=>{const o=document.getElementById('weaponOverlay'),flight=document.querySelector('body > .weapon-card.is-flying');return{mounted:o.classList.contains('mounted'),open:o.classList.contains('open'),hidden:o.getAttribute('aria-hidden'),flightId:flight?.dataset.weaponId||null,busy:weaponUi.busy}})()`);
  if(!closing.mounted||closing.open||closing.hidden!=='false'||closing.flightId!=='preview-02'||!closing.busy) throw new Error(`Equipped Weapon close animation did not fly Current back to Build slot: ${JSON.stringify(closing)}`);
  await sleep(520);
  const closed=await evaluate(send,`(()=>{const o=document.getElementById('weaponOverlay'),c=document.querySelector('#weaponSlotHost .weapon-card');return{mounted:o.classList.contains('mounted'),open:o.classList.contains('open'),hidden:o.getAttribute('aria-hidden'),expanded:document.getElementById('weaponBtn').getAttribute('aria-expanded'),parent:c?.parentElement?.id||null,currentId:c?.dataset.weaponId||null,emptyOpacity:getComputedStyle(document.querySelector('#weaponSlotHost .weapon-empty')).opacity}})()`);
  if(closed.mounted||closed.open||closed.hidden!=='true'||closed.expanded!=='false'||closed.parent!=='weaponSlotHost'||closed.currentId!=='preview-02'||Number(closed.emptyOpacity)>.05) throw new Error(`Weapon close/return behavior failed: ${JSON.stringify(closed)}`);

  // Reopen proves the equipped Weapon returns to item #1 instead of a duplicate Current row.
  await pointerClick(send,'#weaponBtn',{touch});
  await sleep(650);
  const reopened=await evaluate(send,`(()=>{const choices=document.getElementById('weaponChoices'),first=choices.firstElementChild;return{firstId:first?.dataset.weaponId||null,firstEquipped:first?.classList.contains('is-equipped')||false,firstCardId:first?.querySelector('.weapon-card')?.dataset.weaponId||null,slotCount:document.querySelectorAll('#weaponSlotHost .weapon-card').length,currentHost:!!document.getElementById('weaponCurrentHost')}})()`);
  if(reopened.firstId!=='preview-02'||!reopened.firstEquipped||reopened.firstCardId!=='preview-02'||reopened.slotCount!==0||reopened.currentHost) throw new Error(`Reopen did not restore equipped Weapon as grid item #1: ${JSON.stringify(reopened)}`);
  await pointerClick(send,'#weaponClose',{touch});await sleep(650);
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
    console.log(`- Weapon selector real-pointer flow passed: 980x720 desktop, no-current close motion, Preview, equipped-first grid ordering and symmetric close return; equipped: ${desktopWeapon.equipped} / ${mobileWeapon.equipped}.`);
  }finally{socket.close()}
}catch(error){
  console.error(error);
  if(stderr.trim()) console.error(stderr.slice(-4000));
  process.exitCode=1;
}finally{chrome.kill('SIGTERM')}
