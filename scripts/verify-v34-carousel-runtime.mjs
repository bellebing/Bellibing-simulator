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
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width <= 768 });
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

    console.log('v34 runtime carousel verification passed in real Chrome.');
    console.log('- Home finite centered shell passed 390x844 through 7680x2160.');
    console.log('- Home mouse drag reached Team from default Improve focus.');
    console.log('- Build selector loaded 57/57 released canonical portraits with descender-safe one-line names in EXPANDED, COMPACT and HOVER_EXPANDED states.');
    console.log('- Buling, Lingyang and Yangyang are explicit ETNA descender sentinels.');
    console.log(`- Desktop Build multi-card drag: ${desktopBefore.focus+1}/57 -> ${desktopAfter.focus+1}/57.`);
    console.log(`- Mobile Build touch drag: ${mobileBefore.focus+1}/57 -> ${mobileAfter.focus+1}/57.`);
  }finally{socket.close()}
}catch(error){
  console.error(error);
  if(stderr.trim()) console.error(stderr.slice(-4000));
  process.exitCode=1;
}finally{chrome.kill('SIGTERM')}
