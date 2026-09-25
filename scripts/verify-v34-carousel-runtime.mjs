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
  const alreadySelected=await evaluate(send,`document.getElementById('buildShell').classList.contains('has-selection')`);
  if(!alreadySelected){
    await evaluate(send,`(()=>{const w=document.getElementById('buildWheel'),i=Number(w.dataset.focusIndex),c=w.querySelectorAll('.choice')[i];if(!c)throw new Error('Focused Build card missing');c.click()})()`);
    await sleep(760);
  }
  const slotBefore=await evaluate(send,`(()=>{const b=document.getElementById('weaponBtn'),h=document.getElementById('weaponSlotHost');return{cardCount:h.querySelectorAll('.weapon-card').length,emptyVisible:getComputedStyle(h.querySelector('.weapon-empty')).opacity,expanded:b.getAttribute('aria-expanded')}})()`);
  if(slotBefore.cardCount!==0) throw new Error(`Fresh Weapon slot must start empty: ${JSON.stringify(slotBefore)}`);

  await evaluate(send,`document.getElementById('weaponBtn').click()`);
  await sleep(560);
  const opened=await evaluate(send,`(()=>{const o=document.getElementById('weaponOverlay'),p=document.getElementById('weaponPanel'),r=p.getBoundingClientRect(),buttons=[...p.querySelectorAll('button')].map(b=>b.textContent.trim()),first=document.querySelector('#weaponChoices .weapon-choice'),firstCard=first?.querySelector('.weapon-card'),fr=firstCard?.getBoundingClientRect();return{mounted:o.classList.contains('mounted'),open:o.classList.contains('open'),hidden:o.getAttribute('aria-hidden'),expanded:document.getElementById('weaponBtn').getAttribute('aria-expanded'),hasCurrent:p.classList.contains('has-current'),currentCount:document.querySelectorAll('#weaponCurrentHost .weapon-card').length,options:document.querySelectorAll('#weaponChoices .weapon-choice').length,visibleOptions:[...document.querySelectorAll('#weaponChoices .weapon-choice')].filter(x=>getComputedStyle(x).display!=='none').length,panel:{left:r.left,top:r.top,right:r.right,bottom:r.bottom},first:fr?{left:fr.left,top:fr.top,width:fr.width,height:fr.height}:null,actionButtons:buttons.filter(t=>/^(save|apply)$/i.test(t)),chooseButtons:buttons.filter(t=>/^choose weapon$/i.test(t))}})()`);
  if(!opened.mounted||!opened.open||opened.hidden!=='false'||opened.expanded!=='true') throw new Error(`Weapon overlay did not open at ${width}x${height}: ${JSON.stringify(opened)}`);
  if(opened.hasCurrent||opened.currentCount!==0||opened.options!==7||opened.visibleOptions!==7||opened.actionButtons.length||opened.chooseButtons.length!==1) throw new Error(`Empty Weapon browse state failed: ${JSON.stringify(opened)}`);
  if(opened.panel.left<-1||opened.panel.top<-1||opened.panel.right>width+1||opened.panel.bottom>height+1) throw new Error(`Weapon overlay escaped viewport at ${width}x${height}: ${JSON.stringify(opened.panel)}`);

  if(width>760&&opened.first){
    const choiceBounds=await evaluate(send,`document.querySelector('#weaponChoices .weapon-choice').getBoundingClientRect().toJSON()`);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:choiceBounds.x+choiceBounds.width*.5,y:choiceBounds.y+choiceBounds.height*.5});
    await sleep(220);
    const hovered=await evaluate(send,`(()=>{const choice=document.querySelector('#weaponChoices .weapon-choice'),card=choice.querySelector('.weapon-card'),r=card.getBoundingClientRect();return{width:r.width,height:r.height,choiceWidth:choice.getBoundingClientRect().width,transform:getComputedStyle(card).transform}})()`);
    if(hovered.width<opened.first.width*1.035||hovered.height<opened.first.height*1.035||hovered.choiceWidth<opened.first.width*.95) throw new Error(`Weapon hover focus did not bubble above the stable grid: ${JSON.stringify({before:opened.first,after:hovered})}`);
  }

  await evaluate(send,`document.querySelector('#weaponChoices .weapon-choice[data-weapon-id="preview-01"]').click()`);
  await sleep(540);
  const firstPreview=await evaluate(send,`(()=>{const p=document.getElementById('weaponPanel'),pane=document.getElementById('weaponPreviewPane'),preview=document.querySelector('#weaponPreviewHost .weapon-card'),source=document.querySelector('#weaponChoices .weapon-choice[data-weapon-id="preview-01"]'),pr=preview?.getBoundingClientRect();return{hasPreview:p.classList.contains('has-preview'),hasCurrent:p.classList.contains('has-current'),hidden:pane.getAttribute('aria-hidden'),previewId:preview?.dataset.weaponId||null,previewName:document.getElementById('weaponPreviewName').textContent.trim(),currentCount:document.querySelectorAll('#weaponCurrentHost .weapon-card').length,sourceGhost:source?.classList.contains('is-preview-source')||false,sourceHasCard:!!source?.querySelector('.weapon-card'),previewRect:pr?{width:pr.width,height:pr.height}:null}})()`);
  if(!firstPreview.hasPreview||firstPreview.hasCurrent||firstPreview.hidden!=='false'||firstPreview.previewId!=='preview-01'||firstPreview.previewName!=='Weapon 01'||firstPreview.currentCount!==0||!firstPreview.sourceGhost||firstPreview.sourceHasCard) throw new Error(`First Weapon preview state failed: ${JSON.stringify(firstPreview)}`);
  if(!firstPreview.previewRect||!opened.first||firstPreview.previewRect.height<opened.first.height*1.25) throw new Error(`Weapon preview did not visibly enlarge from the grid: ${JSON.stringify({grid:opened.first,preview:firstPreview.previewRect})}`);

  await evaluate(send,`document.getElementById('weaponChoose').click()`);
  await sleep(720);
  const firstEquip=await evaluate(send,`(()=>{const p=document.getElementById('weaponPanel'),current=document.querySelector('#weaponCurrentHost .weapon-card'),own=document.querySelector('#weaponChoices .weapon-choice[data-weapon-id="preview-01"]');return{hasPreview:p.classList.contains('has-preview'),hasCurrent:p.classList.contains('has-current'),currentId:current?.dataset.weaponId||null,currentName:document.getElementById('weaponCurrentName').textContent.trim(),ownHidden:getComputedStyle(own).display==='none',ownHasCard:!!own.querySelector('.weapon-card'),visibleOptions:[...document.querySelectorAll('#weaponChoices .weapon-choice')].filter(x=>getComputedStyle(x).display!=='none').length}})()`);
  if(firstEquip.hasPreview||!firstEquip.hasCurrent||firstEquip.currentId!=='preview-01'||firstEquip.currentName!=='Weapon 01'||!firstEquip.ownHidden||firstEquip.ownHasCard||firstEquip.visibleOptions!==6) throw new Error(`First Choose Weapon flow failed: ${JSON.stringify(firstEquip)}`);

  await evaluate(send,`document.querySelector('#weaponChoices .weapon-choice[data-weapon-id="preview-02"]').click()`);
  await sleep(540);
  const secondPreview=await evaluate(send,`(()=>{const p=document.getElementById('weaponPanel'),preview=document.querySelector('#weaponPreviewHost .weapon-card'),current=document.querySelector('#weaponCurrentHost .weapon-card'),source=document.querySelector('#weaponChoices .weapon-choice[data-weapon-id="preview-02"]'),pane=document.getElementById('weaponPreviewPane'),choose=document.getElementById('weaponChoose'),paneRect=pane.getBoundingClientRect(),chooseRect=choose.getBoundingClientRect(),panelRect=p.getBoundingClientRect();return{hasPreview:p.classList.contains('has-preview'),previewId:preview?.dataset.weaponId||null,currentId:current?.dataset.weaponId||null,currentName:document.getElementById('weaponCurrentName').textContent.trim(),sourceGhost:source?.classList.contains('is-preview-source')||false,pane:{top:paneRect.top,bottom:paneRect.bottom},choose:{top:chooseRect.top,bottom:chooseRect.bottom,height:chooseRect.height},panelBottom:panelRect.bottom}})()`);
  if(!secondPreview.hasPreview||secondPreview.previewId!=='preview-02'||secondPreview.currentId!=='preview-01'||secondPreview.currentName!=='Weapon 01'||!secondPreview.sourceGhost) throw new Error(`Preview must not replace Current before Choose: ${JSON.stringify(secondPreview)}`);
  if(secondPreview.choose.height<36||secondPreview.choose.top<secondPreview.pane.top-1||secondPreview.choose.bottom>secondPreview.pane.bottom+1||secondPreview.choose.bottom>secondPreview.panelBottom+1) throw new Error(`Choose Weapon is clipped or outside the preview pane: ${JSON.stringify(secondPreview)}`);
  if(capturePath) await capture(send,capturePath);

  await evaluate(send,`document.getElementById('weaponChoose').click()`);
  await sleep(760);
  const swapped=await evaluate(send,`(()=>{const p=document.getElementById('weaponPanel'),current=document.querySelector('#weaponCurrentHost .weapon-card'),oldSlot=document.querySelector('#weaponChoices .weapon-choice[data-weapon-id="preview-01"]'),newSlot=document.querySelector('#weaponChoices .weapon-choice[data-weapon-id="preview-02"]'),oldCard=oldSlot?.querySelector('.weapon-card');return{hasPreview:p.classList.contains('has-preview'),currentId:current?.dataset.weaponId||null,currentName:document.getElementById('weaponCurrentName').textContent.trim(),oldSlotHidden:getComputedStyle(oldSlot).display==='none',oldReturnedId:oldCard?.dataset.weaponId||null,newSlotHidden:getComputedStyle(newSlot).display==='none',newSlotHasCard:!!newSlot.querySelector('.weapon-card'),previewCount:document.querySelectorAll('#weaponPreviewHost .weapon-card').length,visibleOptions:[...document.querySelectorAll('#weaponChoices .weapon-choice')].filter(x=>getComputedStyle(x).display!=='none').length}})()`);
  if(swapped.hasPreview||swapped.currentId!=='preview-02'||swapped.currentName!=='Weapon 02'||swapped.oldSlotHidden||swapped.oldReturnedId!=='preview-01'||!swapped.newSlotHidden||swapped.newSlotHasCard||swapped.previewCount!==0||swapped.visibleOptions!==6) throw new Error(`Animated Current→grid / Preview→Current swap failed: ${JSON.stringify(swapped)}`);

  await evaluate(send,`document.getElementById('weaponClose').click()`);
  await sleep(500);
  const closed=await evaluate(send,`(()=>{const o=document.getElementById('weaponOverlay'),c=document.querySelector('#weaponSlotHost .weapon-card');return{mounted:o.classList.contains('mounted'),open:o.classList.contains('open'),hidden:o.getAttribute('aria-hidden'),expanded:document.getElementById('weaponBtn').getAttribute('aria-expanded'),parent:c?.parentElement?.id||null,currentId:c?.dataset.weaponId||null,emptyOpacity:getComputedStyle(document.querySelector('#weaponSlotHost .weapon-empty')).opacity}})()`);
  if(closed.mounted||closed.open||closed.hidden!=='true'||closed.expanded!=='false'||closed.parent!=='weaponSlotHost'||closed.currentId!=='preview-02'||Number(closed.emptyOpacity)>.05) throw new Error(`Weapon close/return behavior failed: ${JSON.stringify(closed)}`);
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
    console.log('- Build selector loaded 57/57 released canonical portraits with descender-safe one-line names in EXPANDED, COMPACT and HOVER_EXPANDED states.');
    console.log('- Buling, Lingyang and Yangyang are explicit ETNA descender sentinels.');
    console.log(`- Desktop Build multi-card drag: ${desktopBefore.focus+1}/57 -> ${desktopAfter.focus+1}/57.`);
    console.log(`- Mobile Build touch drag: ${mobileBefore.focus+1}/57 -> ${mobileAfter.focus+1}/57.`);
    console.log(`- Weapon selector grid→preview→Choose→Current flow passed on desktop and mobile; equipped: ${desktopWeapon.equipped} / ${mobileWeapon.equipped}.`);
  }finally{socket.close()}
}catch(error){
  console.error(error);
  if(stderr.trim()) console.error(stderr.slice(-4000));
  process.exitCode=1;
}finally{chrome.kill('SIGTERM')}
