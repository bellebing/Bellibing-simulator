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
    const label=await evaluate(send,`(()=>{const w=document.getElementById('buildWheel'),i=Number(w.dataset.focusIndex),c=w.querySelectorAll('.choice')[i];return c?.getAttribute('aria-label')||''})()`);
    if(!label) throw new Error('Focused Build card missing for Weapon verification');
    await pointerClick(send,`#buildWheel .choice[aria-label="${label.replace(/"/g,'\\"')}"]`,{touch});
    await sleep(760);
  }
  await waitForUi(send,`document.documentElement.dataset.weaponCatalogReady==='true'&&weaponUi.characterId&&weaponUi.items.length>0`,'Canonical Weapon catalog did not bind to selected Character',10000);
  await evaluate(send,`(()=>{const name=buildPicker.selected;if(!name)throw new Error('Build Character missing');delete draft(name).build.weaponId;save();weaponUi.setCharacter(name);return true})()`);

  const fresh=await evaluate(send,`(()=>{const h=document.getElementById('weaponSlotHost'),b=document.getElementById('weaponBtn'),wr=b.getBoundingClientRect(),selected=buildPicker.selected,portrait=characterByName.get(selected),canonical=canonicalCharacterById.get(portrait?.id),weaponHeading=b.closest('.block')?.querySelector('h2'),statsHeading=document.querySelector('.side-left .block h2'),echoHeading=document.querySelector('.echoes h2');return{selected,characterId:portrait?.id||null,expectedType:canonical?.weaponType||null,actualType:weaponUi.characterWeaponType,itemCount:weaponUi.items.length,allReleased:weaponUi.items.every(item=>item.releaseStatus==='RELEASED'),allTypeMatch:weaponUi.items.every(item=>item.weaponType===canonical?.weaponType),slotCount:h.querySelectorAll('.weapon-card').length,currentId:weaponUi.currentId,previewId:weaponUi.previewId,button:{width:wr.width,height:wr.height},align:{weapon:weaponHeading?getComputedStyle(weaponHeading).textAlign:null,stats:statsHeading?getComputedStyle(statsHeading).textAlign:null,echo:echoHeading?getComputedStyle(echoHeading).textAlign:null}}})()`);
  if(!fresh.selected||!fresh.characterId||!fresh.expectedType||fresh.actualType!==fresh.expectedType||!fresh.itemCount||!fresh.allReleased||!fresh.allTypeMatch) throw new Error(`Character → canonical Weapon type binding failed: ${JSON.stringify(fresh)}`);
  if(fresh.slotCount!==0||fresh.currentId!==null||fresh.previewId!==null) throw new Error(`Fresh Weapon state must start unequipped: ${JSON.stringify(fresh)}`);
  if(width>760&&(Math.abs(fresh.button.height-108)>1.5||fresh.button.width<220||fresh.button.width/fresh.button.height<2)) throw new Error(`Desktop Build Weapon summary must remain a wide 108px-high equipment card: ${JSON.stringify(fresh.button)}`);
  if(width>760&&(fresh.align.weapon!=='center'||fresh.align.stats!=='center'||fresh.align.echo!=='center')) throw new Error(`Desktop Build section headings must remain centered: ${JSON.stringify(fresh.align)}`);

  await pointerClick(send,'#weaponBtn',{touch});
  await sleep(470);
  await waitForUi(send,`(()=>{const images=[...document.querySelectorAll('#weaponChoices .weapon-card-art img,#weaponChoices .weapon-rarity-frame')];return images.length>0&&images.every(img=>img.complete&&img.naturalWidth>0)})()`,'Canonical Weapon card/frame assets did not load',10000);
  const opened=await evaluate(send,`(()=>{const o=document.getElementById('weaponOverlay'),p=document.getElementById('weaponPanel'),scrim=document.querySelector('.weapon-scrim'),browser=document.getElementById('weaponBrowser'),rail=document.getElementById('weaponScrollRail'),thumb=rail?.querySelector('.weapon-scroll-thumb'),r=p.getBoundingClientRect(),ps=getComputedStyle(p),ss=getComputedStyle(scrim),equip=document.getElementById('weaponEquip'),es=getComputedStyle(equip),bs=getComputedStyle(browser),ts=thumb?getComputedStyle(thumb):null,choices=[...document.querySelectorAll('#weaponChoices .weapon-choice')],five=choices.find(x=>x.dataset.rarity==='5'),four=choices.find(x=>x.dataset.rarity==='4'),fallback=choices.find(x=>Number(x.dataset.rarity)<4);const info=choice=>({id:choice?.dataset.weaponId||null,name:choice?.dataset.name||null,type:choice?.dataset.weaponType||null,rarity:choice?.dataset.rarity||null,art:choice?.querySelector('.weapon-card-art img')?.getAttribute('src')||null,artLoaded:choice?.querySelector('.weapon-card-art img')?.naturalWidth||0,frame:choice?.querySelector('.weapon-rarity-frame')?.getAttribute('src')||null,frameLoaded:choice?.querySelector('.weapon-rarity-frame')?.naturalWidth||0});return{mounted:o.classList.contains('mounted'),open:o.classList.contains('open'),hidden:o.getAttribute('aria-hidden'),expanded:document.getElementById('weaponBtn').getAttribute('aria-expanded'),options:choices.length,order:choices.map(x=>x.dataset.weaponId),realIdentity:choices.every(x=>x.dataset.weaponId&&!x.dataset.weaponId.startsWith('preview-')&&x.dataset.name&&!/^Weapon \\d+/.test(x.dataset.name)),types:[...new Set(choices.map(x=>x.dataset.weaponType))],equipped:choices.filter(x=>x.classList.contains('is-equipped')).length,previewLayers:document.querySelectorAll('#weaponPreviewStage .weapon-preview-layer').length,previewHidden:document.getElementById('weaponPreviewPane').getAttribute('aria-hidden'),equipText:equip?.textContent.trim()||null,equipDisabled:equip?.disabled??null,flying:document.querySelectorAll('.weapon-card.is-flying').length,five:info(five),four:info(four),fallback:info(fallback),fallbackFrames:fallback?.querySelectorAll('.weapon-rarity-frame').length??-1,scroll:{browser:!!browser,rail:!!rail,thumb:!!thumb,scrollbarWidth:bs.scrollbarWidth,overflowY:bs.overflowY,hasScroll:rail?.classList.contains('has-scroll')||false,thumbColor:ts?.color||null},equipStyle:{background:es.backgroundImage,bgColor:es.backgroundColor,color:es.color},panel:{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height},align:{panelTitle:getComputedStyle(document.getElementById('weaponTitle')).textAlign,cardCopy:getComputedStyle(document.querySelector('#weaponChoices .weapon-card-copy')).textAlign,previewCopy:getComputedStyle(document.querySelector('.weapon-preview-copy')).textAlign,previewStats:getComputedStyle(document.querySelector('.weapon-preview-stats')).textAlign},visual:{scrimBackground:ss.backgroundColor,panelBackground:ps.backgroundImage,panelBackdrop:ps.backdropFilter}}})()`);
  if(!opened.mounted||!opened.open||opened.hidden!=='false'||opened.expanded!=='true') throw new Error(`Weapon overlay did not open: ${JSON.stringify(opened)}`);
  if(opened.options!==fresh.itemCount||!opened.realIdentity||opened.types.length!==1||opened.types[0]!==fresh.expectedType||opened.equipped!==0||opened.previewLayers!==0||opened.previewHidden!=='true'||opened.equipText!=='Equip Weapon'||opened.equipDisabled!==true||opened.flying!==0) throw new Error(`Canonical Select Weapon grid/Preview/Equip contract failed: ${JSON.stringify(opened)}`);
  if(!opened.five.id||!opened.five.artLoaded||!opened.five.frameLoaded||!opened.five.frame?.endsWith('/5-star-square.png')) throw new Error(`5★ Weapon frame/art binding failed: ${JSON.stringify(opened.five)}`);
  if(!opened.four.id||!opened.four.artLoaded||!opened.four.frameLoaded||!opened.four.frame?.endsWith('/4-star-square.png')) throw new Error(`4★ Weapon frame/art binding failed: ${JSON.stringify(opened.four)}`);
  if(!opened.fallback.id||!opened.fallback.artLoaded||opened.fallbackFrames!==0||opened.fallback.frame!==null) throw new Error(`1–3★ Weapon neutral fallback regressed: ${JSON.stringify(opened.fallback)}`);
  if(width>760&&(Math.abs(opened.panel.width-980)>1.5||Math.abs(opened.panel.height-720)>1.5)) throw new Error(`Locked desktop Weapon panel must remain 980x720: ${JSON.stringify(opened.panel)}`);
  if(opened.panel.left<-1||opened.panel.top<-1||opened.panel.right>width+1||opened.panel.bottom>height+1) throw new Error(`Weapon overlay escaped viewport: ${JSON.stringify(opened.panel)}`);
  if(!opened.visual.scrimBackground.includes('0.48')||!opened.visual.panelBackground.includes('0.74')||!opened.visual.panelBackground.includes('0.7')||!opened.visual.panelBackdrop.includes('blur(5px)')) throw new Error(`Weapon overlay glass contract failed: ${JSON.stringify(opened.visual)}`);
  if(width>760&&(opened.align.panelTitle!=='center'||opened.align.cardCopy!=='center'||opened.align.previewCopy!=='center'||opened.align.previewStats!=='left')) throw new Error(`Weapon text hierarchy alignment failed: ${JSON.stringify(opened.align)}`);
  if(!opened.scroll.browser||!opened.scroll.rail||!opened.scroll.thumb||opened.scroll.scrollbarWidth!=='none'||opened.scroll.overflowY!=='auto'||!String(opened.scroll.thumbColor).includes('212')) throw new Error(`Custom Weapon scrollbar contract failed: ${JSON.stringify(opened.scroll)}`);
  if(opened.equipStyle.bgColor==='rgb(238, 238, 238)'||opened.equipStyle.color==='rgb(8, 9, 11)') throw new Error(`Disabled Equip Weapon regressed to the old white system-button styling: ${JSON.stringify(opened.equipStyle)}`);

  if(width>760){
    const geometryBefore=await evaluate(send,`[...document.querySelectorAll('#weaponChoices .weapon-choice')].slice(0,5).map(x=>{const r=x.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}})`);
    const hoverId=opened.four.id;
    const hr=await evaluate(send,`document.querySelector('#weaponChoices .weapon-choice[data-weapon-id="${hoverId}"]').getBoundingClientRect().toJSON()`);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:hr.x+hr.width/2,y:hr.y+hr.height/2});await sleep(190);
    const hover=await evaluate(send,`(()=>({transform:getComputedStyle(document.querySelector('#weaponChoices .weapon-choice[data-weapon-id="${hoverId}"] .weapon-card')).transform,geometry:[...document.querySelectorAll('#weaponChoices .weapon-choice')].slice(0,5).map(x=>{const r=x.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}})}))()`);
    const stable=geometryBefore.every((a,i)=>{const b=hover.geometry[i];return Math.abs(a.x-b.x)<.5&&Math.abs(a.y-b.y)<.5&&Math.abs(a.width-b.width)<.5&&Math.abs(a.height-b.height)<.5});
    if(!stable||!hover.transform||hover.transform==='none') throw new Error(`Weapon hover bubble reflowed the grid or failed to lift: ${JSON.stringify({stable,transform:hover.transform})}`);
  }

  const baseOrder=opened.order;
  const firstId=opened.five.id,secondId=opened.four.id;
  await pointerClick(send,`#weaponChoices .weapon-choice[data-weapon-id="${firstId}"]`,{touch});
  await waitForUi(send,`!weaponUi.busy&&weaponUi.currentId===null&&weaponUi.previewId==='${firstId}'`,'First canonical Weapon Preview did not settle without equipping',3000);
  const previewOnly=await evaluate(send,`(()=>{const item=weaponItemById('${firstId}'),choices=[...document.querySelectorAll('#weaponChoices .weapon-choice')],equip=document.getElementById('weaponEquip'),preview=document.querySelector('#weaponPreviewStage .weapon-preview-layer'),hero=preview?.querySelector('.weapon-preview-hero'),art=hero?.querySelector('.weapon-preview-art'),stage=document.getElementById('weaponPreviewStage'),hr=hero?.getBoundingClientRect();return{currentId:weaponUi.currentId,previewId:weaponUi.previewId,order:choices.map(x=>x.dataset.weaponId),equipped:choices.filter(x=>x.classList.contains('is-equipped')).length,slotCount:document.querySelectorAll('#weaponSlotHost .weapon-card').length,previewIdDom:preview?.dataset.weaponId||null,heroId:hero?.dataset.weaponId||null,artSrc:art?.getAttribute('src')||null,artLoaded:art?.naturalWidth||0,nestedPreviewCards:stage.querySelectorAll('.weapon-card').length,previewFrames:stage.querySelectorAll('.weapon-rarity-frame').length,previewSvgs:stage.querySelectorAll('svg').length,heroRect:hr?{width:hr.width,height:hr.height}:null,name:document.getElementById('weaponPreviewName').textContent.trim(),atk:document.getElementById('weaponPreviewAtk').textContent.trim(),secondaryLabel:document.getElementById('weaponPreviewSecondaryLabel').textContent.trim(),secondaryValue:document.getElementById('weaponPreviewSecondaryValue').textContent.trim(),expected:{name:item.name,atk:String(item.level90BaseAtk??'—'),secondaryLabel:item.secondary?.stat||'Secondary',secondaryValue:formatWeaponSecondaryValue(item.secondary?.value),art:item.artSrc},equipText:equip.textContent.trim(),equipDisabled:equip.disabled,flying:document.querySelectorAll('.weapon-card.is-flying').length,gridCards:document.querySelectorAll('#weaponChoices .weapon-card').length}})()`);
  if(previewOnly.currentId!==null||previewOnly.previewId!==firstId||previewOnly.equipped!==0||previewOnly.slotCount!==0||previewOnly.previewIdDom!==firstId||previewOnly.heroId!==firstId||!previewOnly.artLoaded||previewOnly.artSrc!==previewOnly.expected.art||previewOnly.nestedPreviewCards!==0||previewOnly.previewFrames!==0||previewOnly.previewSvgs!==0||!previewOnly.heroRect||previewOnly.heroRect.width<200||previewOnly.heroRect.height<200||previewOnly.name!==previewOnly.expected.name||previewOnly.atk!==previewOnly.expected.atk||previewOnly.secondaryLabel!==previewOnly.expected.secondaryLabel||previewOnly.secondaryValue!==previewOnly.expected.secondaryValue||previewOnly.equipText!=='Equip Weapon'||previewOnly.equipDisabled||previewOnly.flying!==0||previewOnly.gridCards!==fresh.itemCount||JSON.stringify(previewOnly.order)!==JSON.stringify(baseOrder)) throw new Error(`Weapon click did not create real frameless Preview without mutating Active/Build: ${JSON.stringify(previewOnly)}`);

  await pointerClick(send,'#weaponEquip',{touch});
  await waitForUi(send,`!weaponUi.busy&&weaponUi.currentId==='${firstId}'&&weaponUi.previewId==='${firstId}'`,'Equip Weapon did not commit first canonical Active Weapon',3000);
  const firstActive=await evaluate(send,`(()=>{const choices=[...document.querySelectorAll('#weaponChoices .weapon-choice')],first=choices[0],equip=document.getElementById('weaponEquip'),host=document.getElementById('weaponSlotHost'),button=document.getElementById('weaponBtn'),item=weaponItemById('${firstId}'),buildArt=host.querySelector('.weapon-card-art img');return{currentId:weaponUi.currentId,previewId:weaponUi.previewId,order:choices.map(x=>x.dataset.weaponId),firstId:first?.dataset.weaponId||null,firstEquipped:first?.classList.contains('is-equipped')||false,buildCards:host.querySelectorAll('.weapon-card').length,buildCardId:host.querySelector('.weapon-card')?.dataset.weaponId||null,buildArt:buildArt?.getAttribute('src')||null,buildArtLoaded:buildArt?.naturalWidth||0,buildFrames:host.querySelectorAll('.weapon-rarity-frame').length,buildHasWeapon:host.classList.contains('has-weapon'),buttonLabel:button.getAttribute('aria-label'),saved:draft(buildPicker.selected).build.weaponId,equipText:equip.textContent.trim(),equipDisabled:equip.disabled,flying:document.querySelectorAll('.weapon-card.is-flying').length,expectedArt:item.artSrc}})()`);
  const expectedFirst=[firstId,...baseOrder.filter(id=>id!==firstId)];
  if(firstActive.currentId!==firstId||firstActive.previewId!==firstId||firstActive.firstId!==firstId||!firstActive.firstEquipped||firstActive.buildCards!==1||firstActive.buildCardId!==firstId||!firstActive.buildArtLoaded||firstActive.buildArt!==firstActive.expectedArt||firstActive.buildFrames!==0||!firstActive.buildHasWeapon||firstActive.saved!==firstId||firstActive.equipText!=='Active Weapon'||!firstActive.equipDisabled||firstActive.flying!==0||JSON.stringify(firstActive.order)!==JSON.stringify(expectedFirst)) throw new Error(`Explicit Equip did not establish canonical Active slot 1 + Build Weapon summary: ${JSON.stringify(firstActive)}`);

  if(touch){
    if(capturePath) await capture(send,capturePath);
    await pointerClick(send,'#weaponClose',{touch:true});await sleep(470);
    const mobileClosed=await evaluate(send,`(()=>{const o=document.getElementById('weaponOverlay'),host=document.getElementById('weaponSlotHost');return{mounted:o.classList.contains('mounted'),hidden:o.getAttribute('aria-hidden'),currentId:weaponUi.currentId,buildCardId:host.querySelector('.weapon-card')?.dataset.weaponId||null,previewId:weaponUi.previewId,flying:document.querySelectorAll('.weapon-card.is-flying').length}})()`);
    if(mobileClosed.mounted||mobileClosed.hidden!=='true'||mobileClosed.currentId!==firstId||mobileClosed.buildCardId!==firstId||mobileClosed.previewId!==null||mobileClosed.flying!==0) throw new Error(`Mobile Weapon canonical Preview/Equip smoke close failed: ${JSON.stringify(mobileClosed)}`);
    return {character:fresh.selected,type:fresh.expectedType,previewed:opened.five.name,equipped:opened.five.name};
  }

  await pointerClick(send,`#weaponChoices .weapon-choice[data-weapon-id="${secondId}"]`);
  await waitForUi(send,`weaponUi.currentId==='${firstId}'&&weaponUi.previewId==='${secondId}'`,'Second canonical Weapon did not enter Preview while first stayed Active',1200);
  await sleep(55);
  const tunnel=await evaluate(send,`(()=>{const layers=[...document.querySelectorAll('#weaponPreviewStage .weapon-preview-layer')],incoming=layers.find(x=>x.classList.contains('is-incoming')),outgoing=layers.find(x=>x.classList.contains('is-outgoing'));const keyframes=el=>el?.getAnimations?.()[0]?.effect?.getKeyframes?.()||[];const ik=keyframes(incoming),ok=keyframes(outgoing),trace=weaponUi.lastPreviewTransition,spec=weaponUi.previewMotion;return{reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,count:layers.length,currentId:weaponUi.currentId,previewId:weaponUi.previewId,incomingId:incoming?.dataset.weaponId||null,outgoingId:outgoing?.dataset.weaponId||null,incomingArt:incoming?.querySelector('.weapon-preview-art')?.getAttribute('src')||null,outgoingArt:outgoing?.querySelector('.weapon-preview-art')?.getAttribute('src')||null,nestedPreviewCards:document.querySelectorAll('#weaponPreviewStage .weapon-card').length,previewFrames:document.querySelectorAll('#weaponPreviewStage .weapon-rarity-frame').length,incomingFrom:ik[0]?.transform||null,incomingTo:ik.at(-1)?.transform||null,outgoingTo:ok.at(-1)?.transform||null,outgoingOpacity:ok.at(-1)?.opacity??null,spec,trace,firstId:document.querySelector('#weaponChoices .weapon-choice')?.dataset.weaponId||null,buildCardId:document.querySelector('#weaponSlotHost .weapon-card')?.dataset.weaponId||null,flying:document.querySelectorAll('.weapon-card.is-flying').length}})()`);
  const specOk=tunnel.spec?.incomingFrom===0.64&&tunnel.spec?.incomingTo===1&&tunnel.spec?.outgoingFrom===1&&tunnel.spec?.outgoingTo===1.24&&tunnel.spec?.outgoingOpacity===0&&tunnel.spec?.incomingMs===460&&tunnel.spec?.outgoingMs===360;
  const traceOk=tunnel.trace?.from===firstId&&tunnel.trace?.to===secondId&&tunnel.trace?.incomingFrom===0.64&&tunnel.trace?.outgoingTo===1.24&&tunnel.trace?.outgoingOpacity===0;
  if(!specOk||!traceOk||tunnel.currentId!==firstId||tunnel.previewId!==secondId||tunnel.firstId!==firstId||tunnel.buildCardId!==firstId||tunnel.flying!==0||tunnel.nestedPreviewCards!==0||tunnel.previewFrames!==0||!tunnel.incomingArt||!tunnel.outgoingArt) throw new Error(`Weapon real-art Preview tunnel changed Active/grid/Build state or reintroduced frames/cards: ${JSON.stringify(tunnel)}`);
  if(!tunnel.reduced&&(tunnel.count!==2||tunnel.incomingId!==secondId||tunnel.outgoingId!==firstId||!String(tunnel.incomingFrom).includes('scale(0.64)')||!String(tunnel.incomingTo).includes('scale(1)')||!String(tunnel.outgoingTo).includes('scale(1.24)')||String(tunnel.outgoingOpacity)!=='0')) throw new Error(`Weapon real-art Preview live tunnel layers failed: ${JSON.stringify(tunnel)}`);
  if(tunnel.reduced&&tunnel.count!==1) throw new Error(`Weapon Preview reduced-motion fallback failed: ${JSON.stringify(tunnel)}`);

  await waitForUi(send,`!weaponUi.busy&&weaponUi.currentId==='${firstId}'&&weaponUi.previewId==='${secondId}'`,'Final second Weapon Preview did not settle',3000);
  if(capturePath) await capture(send,capturePath);
  await pointerClick(send,'#weaponEquip');
  await waitForUi(send,`!weaponUi.busy&&weaponUi.currentId==='${secondId}'&&weaponUi.previewId==='${secondId}'`,'Equip Weapon did not promote second Preview to Active',3000);
  const committed=await evaluate(send,`(()=>{const choices=[...document.querySelectorAll('#weaponChoices .weapon-choice')],host=document.getElementById('weaponSlotHost'),item=weaponItemById('${secondId}'),buildArt=host.querySelector('.weapon-card-art img');return{order:choices.map(x=>x.dataset.weaponId),firstId:choices[0]?.dataset.weaponId||null,firstEquipped:choices[0]?.classList.contains('is-equipped')||false,currentId:weaponUi.currentId,previewId:weaponUi.previewId,buildCardId:host.querySelector('.weapon-card')?.dataset.weaponId||null,buildArt:buildArt?.getAttribute('src')||null,buildArtLoaded:buildArt?.naturalWidth||0,saved:draft(buildPicker.selected).build.weaponId,flying:document.querySelectorAll('.weapon-card.is-flying').length,expectedArt:item.artSrc}})()`);
  const expectedSecond=[secondId,...baseOrder.filter(id=>id!==secondId)];
  if(committed.currentId!==secondId||committed.previewId!==secondId||committed.firstId!==secondId||!committed.firstEquipped||committed.buildCardId!==secondId||!committed.buildArtLoaded||committed.buildArt!==committed.expectedArt||committed.saved!==secondId||committed.flying!==0||JSON.stringify(committed.order)!==JSON.stringify(expectedSecond)) throw new Error(`Equip commit did not perform canonical Active slot 1 swap + Build summary update: ${JSON.stringify(committed)}`);

  await pointerClick(send,'#weaponClose');await sleep(90);
  const closing=await evaluate(send,`(()=>{const o=document.getElementById('weaponOverlay'),host=document.getElementById('weaponSlotHost');return{mounted:o.classList.contains('mounted'),open:o.classList.contains('open'),hidden:o.getAttribute('aria-hidden'),currentId:weaponUi.currentId,buildCardId:host.querySelector('.weapon-card')?.dataset.weaponId||null,flying:document.querySelectorAll('.weapon-card.is-flying').length}})()`);
  if(!closing.mounted||closing.open||closing.hidden!=='false'||closing.currentId!==secondId||closing.buildCardId!==secondId||closing.flying!==0) throw new Error(`Weapon close must preserve committed canonical Active in Build summary with no card flights: ${JSON.stringify(closing)}`);
  await sleep(360);
  if(capturePath&&width>760) await capture(send,capturePath.replace('weapon-overlay','weapon-build-active'));

  await pointerClick(send,'#weaponBtn');await sleep(470);
  const reopened=await evaluate(send,`(()=>{const choices=[...document.querySelectorAll('#weaponChoices .weapon-choice')],first=choices[0],equip=document.getElementById('weaponEquip');return{firstId:first?.dataset.weaponId||null,firstEquipped:first?.classList.contains('is-equipped')||false,currentId:weaponUi.currentId,previewId:weaponUi.previewId,previewLayers:document.querySelectorAll('#weaponPreviewStage .weapon-preview-layer').length,previewHidden:document.getElementById('weaponPreviewPane').getAttribute('aria-hidden'),equipText:equip.textContent.trim(),equipDisabled:equip.disabled,flying:document.querySelectorAll('.weapon-card.is-flying').length}})()`);
  if(reopened.firstId!==secondId||!reopened.firstEquipped||reopened.currentId!==secondId||reopened.previewId!==null||reopened.previewLayers!==0||reopened.previewHidden!=='true'||reopened.equipText!=='Equip Weapon'||!reopened.equipDisabled||reopened.flying!==0) throw new Error(`Weapon reopen did not preserve canonical Active + reset Preview: ${JSON.stringify(reopened)}`);
  await pointerClick(send,'#weaponClose');await sleep(470);
  return {character:fresh.selected,type:fresh.expectedType,previewed:opened.four.name,equipped:opened.four.name};
}

async function capture(send, path) {
  const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true});
  mkdirSync('artifacts',{recursive:true});
  writeFileSync(path,Buffer.from(shot.data,'base64'));
}


async function selectFocusedCharacterByPointer(send,{touch=false}={}){
  const label=await evaluate(send,`(()=>{const wheel=document.getElementById('buildWheel'),i=Number(wheel.dataset.focusIndex),card=wheel.querySelectorAll('.choice')[i];return card?.getAttribute('aria-label')||''})()`);
  if(!label) throw new Error('Focused Character card missing for Weapon gate.');
  await pointerClick(send,`#buildWheel .choice[aria-label="${label.replace(/"/g,'\\\"')}"]`,{touch});
  await waitForUi(send,`document.getElementById('buildShell').classList.contains('has-selection')`,'Pointer Character selection did not settle',3000);
  const selected=await evaluate(send,`document.getElementById('buildName').textContent.trim()`);
  if(selected!==label) throw new Error(`Pointer Character selection mismatch: expected ${label}, got ${selected}`);
  return label;
}

const chrome=spawn(CHROME,[
  '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
  `--remote-debugging-port=${DEBUG_PORT}`,'--remote-debugging-address=127.0.0.1',
  '--user-data-dir=/tmp/bellibing-v34-weapon-canonical','about:blank'
],{stdio:['ignore','pipe','pipe']});
let stderr='';chrome.stderr.on('data',chunk=>{stderr+=String(chunk)});

try{
  await waitForChrome();
  const page=await createPage();
  if(!page.webSocketDebuggerUrl) throw new Error('Chrome page has no DevTools websocket URL.');
  const {socket,send}=cdp(page.webSocketDebuggerUrl);
  try{
    await send('Page.enable');await send('Runtime.enable');

    await setViewport(send,1440,900);await navigate(send);
    await evaluate(send,`localStorage.clear()`);await navigate(send);await enterBuild(send);
    const desktopCharacter=await selectFocusedCharacterByPointer(send);
    const desktop=await verifyWeaponOverlay(send,1440,900,'artifacts/ui-preview-weapon-canonical-1440x900.png');

    await setViewport(send,390,844);await navigate(send);
    await evaluate(send,`localStorage.clear()`);await navigate(send);await enterBuild(send);
    const mobileCharacter=await selectFocusedCharacterByPointer(send,{touch:true});
    const mobile=await verifyWeaponOverlay(send,390,844,'artifacts/ui-preview-weapon-canonical-390x844.png');

    console.log('v34 canonical Weapon focused verification passed in real Chrome.');
    console.log(`- Desktop 1440x900: ${desktopCharacter} / ${desktop.type}; committed ${desktop.equipped}.`);
    console.log(`- Mobile 390x844: ${mobileCharacter} / ${mobile.type}; committed ${mobile.equipped}.`);
    console.log('- Real canonical IDs/names/assets, released/type filtering, 4★/5★ square frames, frameless Preview, Equip-only commit, Active slot 1, Build-summary gating and no flights all passed.');
  }finally{socket.close()}
}catch(error){
  console.error(error);
  if(stderr.trim()) console.error(stderr.slice(-4000));
  process.exitCode=1;
}finally{chrome.kill('SIGTERM')}
