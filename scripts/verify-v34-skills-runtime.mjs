import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const UI_URL=process.env.BELLIBING_V34_URL??'http://127.0.0.1:4173/ui-preview/';
const DEBUG_PORT=Number(process.env.BELLIBING_V34_CHROME_DEBUG_PORT??9674);
const CHROME=process.env.CHROME_BIN??'google-chrome';
const MAIN=['normal-attack','skill','circuit','liberation','intro'];
const ALL=[...MAIN,'outro'];
const runtime=JSON.parse(readFileSync('docs/ui-prototypes/assets/sequence-runtime.json','utf8'));
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const assert=(condition,message,detail)=>{if(!condition)throw new Error(message+(detail===undefined?'':': '+JSON.stringify(detail)))};

assert(runtime.schemaVersion===1&&runtime.role==='character-builder.runtime-sequences','Unexpected builder runtime schema');
assert(runtime.characters.length===57,'Skills runtime must cover all 57 released Characters',runtime.characters.length);
const byId=new Map(runtime.characters.map(row=>[row.characterId,row]));
for(const row of runtime.characters){
  assert(row.skills&&ALL.every(role=>row.skills[role]?.role===role&&row.skills[role]?.assetPath?.startsWith('assets/builder-icons/skills/')),'Incomplete source-backed Skills mapping',row.characterId);
  for(const skill of Object.values(row.skills)){
    assert(existsSync(join('docs/ui-prototypes',skill.assetPath)),'Missing published skill asset',{character:row.characterId,path:skill.assetPath});
  }
}

async function waitForChrome(){
  const deadline=Date.now()+15000;
  while(Date.now()<deadline){
    try{const response=await fetch('http://127.0.0.1:'+DEBUG_PORT+'/json/version');if(response.ok)return}catch{}
    await sleep(120);
  }
  throw new Error('Timed out waiting for Chrome DevTools.');
}
async function createPage(){
  const response=await fetch('http://127.0.0.1:'+DEBUG_PORT+'/json/new?'+encodeURIComponent('about:blank'),{method:'PUT'});
  if(!response.ok)throw new Error('Failed to create Chrome page: '+response.status);
  return response.json();
}
function cdp(wsUrl){
  const socket=new WebSocket(wsUrl);let serial=0;const pending=new Map();
  const opened=new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
  socket.addEventListener('message',event=>{
    const message=JSON.parse(String(event.data));if(!message.id)return;
    const waiter=pending.get(message.id);if(!waiter)return;pending.delete(message.id);
    if(message.error)waiter.reject(new Error(message.error.message));else waiter.resolve(message.result);
  });
  async function send(method,params={}){
    await opened;const id=++serial;
    const answer=new Promise((resolve,reject)=>pending.set(id,{resolve,reject}));
    socket.send(JSON.stringify({id,method,params}));return answer;
  }
  return{socket,send};
}
async function evaluate(send,expression){
  const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
  if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description??result.exceptionDetails.text??'Runtime evaluation failed');
  return result.result?.value;
}
async function waitFor(send,expression,message,timeout=10000){
  const deadline=Date.now()+timeout;
  while(Date.now()<deadline){if(await evaluate(send,expression))return;await sleep(55)}
  throw new Error(message);
}
async function navigate(send){
  await send('Page.navigate',{url:UI_URL});
  const deadline=Date.now()+20000;let externalNoticeOpened=false;
  while(Date.now()<deadline){
    const state=await evaluate(send,"(() => ({ready:document.readyState==='complete'&&document.querySelectorAll('#homeStage .home-card').length===3,externalNotice:document.title==='External Content Notice | rawgit.hack'&&!!document.querySelector('.url-action-button')}))()");
    if(state.ready)return;
    if(state.externalNotice&&!externalNoticeOpened){
      const bounds=await evaluate(send,"document.querySelector('.url-action-button').getBoundingClientRect().toJSON()");
      const x=bounds.x+bounds.width/2,y=bounds.y+bounds.height/2;
      await send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});
      await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
      await sleep(35);
      await send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});
      externalNoticeOpened=true;await sleep(600);continue;
    }
    await sleep(100);
  }
  throw new Error('Skills UI preview did not become ready.');
}
async function centerOf(send,selector){
  const q=JSON.stringify(selector);
  const bounds=await evaluate(send,"(() => {const el=document.querySelector("+q+");if(!el)throw new Error('Missing pointer target');const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,iw:innerWidth,ih:innerHeight}})()");
  assert(bounds.width>0&&bounds.height>0&&bounds.x<bounds.iw&&bounds.y<bounds.ih&&bounds.x+bounds.width>0&&bounds.y+bounds.height>0,'Pointer target is not visible',{selector,bounds});
  return{x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2};
}
async function pointerClick(send,selector){
  const p=await centerOf(send,selector);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x,y:p.y});
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x:p.x,y:p.y,button:'left',clickCount:1});
  await sleep(30);
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:p.x,y:p.y,button:'left',clickCount:1});
  await sleep(110);
}
async function layout(send){
  return evaluate(send,"(() => {const box=id=>document.getElementById(id).getBoundingClientRect().toJSON(),side=document.querySelector('.side-left').getBoundingClientRect(),panel=document.getElementById('skillsPanel').getBoundingClientRect(),tree=document.getElementById('skillsMenuTree').getBoundingClientRect(),detail=document.querySelector('.skills-detail-pane').getBoundingClientRect();return{stats:box('buildStatsBlock'),skills:box('skillsBlock'),skillsButton:box('skillsBtn'),weapon:document.getElementById('weaponBtn').closest('.block').getBoundingClientRect().toJSON(),side:side.toJSON(),panel:panel.toJSON(),tree:tree.toJSON(),detail:detail.toJSON(),iw:innerWidth,ih:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight}})()");
}
async function capture(send){
  mkdirSync('artifacts',{recursive:true});
  const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
  writeFileSync('artifacts/ui-preview-skills-menu-1440x900.png',Buffer.from(shot.data,'base64'));
}

const userDir=join(tmpdir(),'bellibing-skills-'+process.pid+'-'+DEBUG_PORT);
const chrome=spawn(CHROME,['--headless=new','--no-sandbox','--disable-gpu','--remote-debugging-port='+DEBUG_PORT,'--remote-debugging-address=127.0.0.1','--user-data-dir='+userDir,'about:blank'],{stdio:'ignore',windowsHide:true});

try{
  await waitForChrome();
  const page=await createPage();
  const{socket,send}=cdp(page.webSocketDebuggerUrl);
  await navigate(send);
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await evaluate(send,'localStorage.clear()');
  await navigate(send);
  await waitFor(send,"releasedCharacters.length===57&&document.documentElement.dataset.sequenceCatalogReady==='true'&&document.documentElement.dataset.buildStatsReady==='true'&&document.documentElement.dataset.skillsMechanicsReady==='true'",'Character/Builder/Skills runtime did not become ready',20000);
  await evaluate(send,"show('build');buildPicker.select('Augusta')");
  await waitFor(send,"skillsUi.characterId==='augusta'&&document.getElementById('skillsBlock').dataset.ready==='true'",'Augusta Skills did not bind');
  await waitFor(send,"!document.getElementById('build').classList.contains('major-enter')&&!document.getElementById('build').classList.contains('go')",'Build entrance did not settle',1800);
  await sleep(800);

  const runtimeSkills=JSON.parse(readFileSync('docs/ui-prototypes/assets/skills-runtime.json','utf8'));
  const sourceById=new Map(runtimeSkills.characters.map(c=>[c.characterId,c]));
  async function clickRole(role){await pointerClick(send,'#skillsMenuTree [data-skill-role="'+role+'"]')}
  async function snapshot(){return evaluate(send,"({character:skillsUi.characterId,investment:skillsUi.investment,selected:skillsUi.selectedRole,title:document.getElementById('skillsSelectedLabel').textContent,description:document.querySelector('.forte-description')?.textContent,values:[...document.querySelectorAll('.forte-value-row strong')].map(x=>x.textContent),active:[...document.querySelectorAll('#skillsMenuTree .skill-link.is-active')].map(x=>x.dataset.skillLink),text:document.getElementById('skillsDetailBody').textContent})")}
  async function checkTopology(root){
    const geometry=await evaluate(send,`(() => {const host=document.querySelector(${JSON.stringify(root)}),box=host.getBoundingClientRect();return{box:box.toJSON(),nodes:[...host.querySelectorAll('[data-skill-role]')].map(n=>({role:n.dataset.skillRole,id:n.dataset.nodeId,r:n.getBoundingClientRect().toJSON(),loaded:n.querySelector('img').naturalWidth})),lines:[...host.querySelectorAll('.skill-link')].map(n=>n.dataset.skillLink)}})()`);
    const expected=sourceById.get(await evaluate(send,'skillsUi.characterId'));
    assert(geometry.nodes.length===16,'Missing Forte nodes',geometry);
    const byRole=new Map(geometry.nodes.map(n=>[n.role,n]));
    for(const n of geometry.nodes){assert(n.r.left>=geometry.box.left-1&&n.r.right<=geometry.box.right+1&&n.r.top>=geometry.box.top-1&&n.r.bottom<=geometry.box.bottom+1,'Node escapes tree',{root,node:n,box:geometry.box})}
    for(let col=0;col<5;col++){
      const main=byRole.get(MAIN[col]);if(col)assert(main.r.x>byRole.get(MAIN[col-1]).r.x,'Wrong five-column order');
      const branch=expected.nodes.filter(n=>n.column===col).sort((a,b)=>a.row-b.row);
      for(let row=1;row<branch.length;row++){
        const child=byRole.get(branch[row].role),parent=byRole.get(branch[row-1].role);
        assert(child.r.y<parent.r.y-8&&Math.abs(child.r.x+child.r.width/2-parent.r.x-parent.r.width/2)<2,'Wrong source branch placement',{child,parent});
      }
    }
    const outer=byRole.get('normal-attack').r,inner=byRole.get('skill').r,center=byRole.get('circuit').r;
    assert(center.y<inner.y&&inner.y<outer.y,'Screenshot stepped silhouette missing');
    assert(byRole.get('outro').r.y>outer.y,'Outro not separate');
    assert(geometry.lines.length===10,'Expected source-owned ten edges',geometry.lines);
  }
  let g=await layout(send);assert(g.stats.bottom<=g.skills.top+1&&g.skills.bottom<=g.weapon.top+1,'Build block overlap',g);
  for(const row of runtime.characters){
    await evaluate(send,'buildPicker.select('+JSON.stringify(row.characterName)+')');
    await waitFor(send,'skillsUi.characterId==='+JSON.stringify(row.characterId),'Character switch failed');
    const actual=await evaluate(send,"Object.fromEntries([...document.querySelectorAll('#skillsMiniTree [data-skill-role]')].map(n=>[n.dataset.skillRole,n.querySelector('img').getAttribute('src')]))");
    for(const node of sourceById.get(row.characterId).nodes)assert(actual[node.role]===node.assetPath,'Wrong Character icon',{character:row.characterId,node});
  }
  await evaluate(send,"buildPicker.select('Augusta')");await pointerClick(send,'#skillsBtn');await sleep(400);
  await waitFor(send,"[...document.querySelectorAll('#skillsMenuTree img')].every(i=>i.naturalWidth>0)",'Forte images failed to load');
  await checkTopology('#skillsMenuTree');await checkTopology('#skillsMiniTree');
  const before=await evaluate(send,'JSON.stringify(draft(skillsUi.characterName).build)');
  await clickRole('skill');let state=await snapshot();assert(state.title==="Warrior's Blade",'Canonical skill name missing',state);
  assert(state.values[0]==='218.7%*3','Wrong Lv10 value',state);assert(!/Kit section|source wording|Bellibing|canonical|fact ID/i.test(state.text),'Developer commentary exposed',state.text);
  assert(await evaluate(send,'JSON.stringify(draft(skillsUi.characterName).build)')===before,'Preview-only selection mutated build');
  await pointerClick(send,'#skillsMenuTree [data-node-id="2"][data-level-step="-1"]');state=await snapshot();assert(state.investment.levels.skill===9&&state.values[0]==='203.36%*3','Level 9 was not selected',state);
  for(let i=0;i<9;i++)await pointerClick(send,'#skillsMenuTree [data-node-id="2"][data-level-step="-1"]');
  state=await snapshot();assert(state.investment.levels.skill===0&&state.values.length===0&&state.investment.enabled['10']===false&&state.investment.enabled['14']===false,'Lv0 fabricated value or failed dependency lowering',state);
  const inactiveSelectionBefore=await evaluate(send,'JSON.stringify(skillsUi.investment)'),inactiveLinksBefore=JSON.stringify(state.active);
  await clickRole('stat-14');state=await snapshot();
  assert(state.selected==='stat-14'&&state.investment.levels.skill===0&&!state.investment.enabled['10']&&!state.investment.enabled['14'],'Selecting inactive stat mutated investment',state);
  assert(await evaluate(send,'JSON.stringify(skillsUi.investment)')===inactiveSelectionBefore&&JSON.stringify(state.active)===inactiveLinksBefore,'Inactive preview selection changed saved Forte state or connectors',state);
  await pointerClick(send,'#skillsDetailBody .forte-toggle');state=await snapshot();
  assert(state.investment.levels.skill===1&&state.investment.enabled['10']&&state.investment.enabled['14'],'Explicit Enable node did not enable prerequisites',state);
  const activeSelectionBefore=await evaluate(send,'JSON.stringify(skillsUi.investment)');
  await clickRole('stat-14');state=await snapshot();
  assert(state.investment.enabled['10']&&state.investment.enabled['14']&&await evaluate(send,'JSON.stringify(skillsUi.investment)')===activeSelectionBefore,'Selecting active stat mutated investment',state);
  await clickRole('normal-attack');state=await snapshot();
  assert(state.selected==='normal-attack'&&state.investment.enabled['10']&&state.investment.enabled['14'],'Enabled node changed while previewing another node',state);
  await clickRole('stat-10');await pointerClick(send,'#skillsDetailBody .forte-toggle');state=await snapshot();
  assert(!state.investment.enabled['10']&&!state.investment.enabled['14'],'Explicit Disable node did not cascade to dependent stat',state);
  const disabledSelectionBefore=await evaluate(send,'JSON.stringify(skillsUi.investment)');
  await clickRole('stat-10');state=await snapshot();
  assert(!state.investment.enabled['10']&&!state.investment.enabled['14']&&await evaluate(send,'JSON.stringify(skillsUi.investment)')===disabledSelectionBefore,'Disabled stat changed while selecting it again',state);
  await clickRole('inherent-1');state=await snapshot();
  assert(state.investment.enabled['4']&&state.investment.enabled['5'],'Selecting active Inherent node mutated investment',state);
  await pointerClick(send,'#skillsDetailBody .forte-toggle');state=await snapshot();
  assert(!state.investment.enabled['4']&&!state.investment.enabled['5'],'Explicit Inherent disable did not cascade',state);
  const inherentDisabledBefore=await evaluate(send,'JSON.stringify(skillsUi.investment)');
  await clickRole('inherent-2');state=await snapshot();
  assert(!state.investment.enabled['4']&&!state.investment.enabled['5']&&state.title==='Blazing Valor'&&await evaluate(send,'JSON.stringify(skillsUi.investment)')===inherentDisabledBefore,'Inactive Inherent preview selection mutated investment',state);
  await pointerClick(send,'#skillsDetailBody .forte-toggle');state=await snapshot();
  assert(state.investment.enabled['4']&&state.investment.enabled['5'],'Explicit Inherent enable did not restore prerequisite',state);
  const strokes=await evaluate(send,"[...document.querySelectorAll('#skillsMenuTree .skill-link')].map(n=>({active:n.classList.contains('is-active'),stroke:getComputedStyle(n).stroke}))");assert(strokes.some(s=>s.active)&&strokes.some(s=>!s.active)&&strokes.every(s=>s.active===s.stroke.includes('skillsMenuGold')),'Gold/grey connector state mismatch',strokes);
  // Independent physical +/- controls for every levelled skill.
  for(const role of MAIN){const node=sourceById.get('augusta').nodes.find(n=>n.role===role);await pointerClick(send,'#skillsMenuTree [data-node-id="'+node.id+'"][data-level-step="-1"]')}
  const saved=await evaluate(send,'JSON.stringify(skillsUi.investment)');
  await pointerClick(send,'#skillsClose');await sleep(400);
  for(const name of ['Aalto','Phoebe','Baizhi','Mornye','The Shorekeeper','Buling']){
    await evaluate(send,'buildPicker.select('+JSON.stringify(name)+')');await pointerClick(send,'#skillsBtn');await sleep(400);await checkTopology('#skillsMenuTree');
    const expected=sourceById.get(await evaluate(send,'skillsUi.characterId'));
    for(const role of ['normal-attack','liberation','inherent-1','outro']){await clickRole(role);state=await snapshot();const node=expected.nodes.find(n=>n.role===role);assert(state.title===node.name&&state.description===node.description,'Preview source text mismatch',{name,role,state});}
    await pointerClick(send,'#skillsClose');await sleep(400);
  }
  await evaluate(send,"buildPicker.select('Augusta')");assert(await evaluate(send,'JSON.stringify(skillsUi.investment)')===saved,'Character switch lost levels');
  await navigate(send);await waitFor(send,"document.documentElement.dataset.skillsMechanicsReady==='true'&&!!window.bellibingForte",'Reload runtime not ready');await evaluate(send,"show('build');buildPicker.select('Augusta')");await sleep(1000);
  assert(await evaluate(send,'JSON.stringify(skillsUi.investment)')===saved,'Reload lost persisted levels');
  await pointerClick(send,'#skillsBtn');await sleep(400);await clickRole('liberation');await capture(send);await pointerClick(send,'#skillsClose');await sleep(400);
  // Missing source description must produce a simple Pending state.
  await evaluate(send,"skillsUi.tree.nodes.find(n=>n.role==='skill').description=null");await pointerClick(send,'#skillsBtn');await clickRole('skill');assert((await snapshot()).description==='Pending','Missing text did not fail closed');await pointerClick(send,'#skillsClose');await sleep(400);
  for(const[width,height]of[[1440,900],[1920,1080],[2560,1440]]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await sleep(200);await pointerClick(send,'#skillsBtn');await sleep(400);g=await layout(send);
    assert(g.panel.left>=0&&g.panel.top>=0&&g.panel.right<=g.iw&&g.panel.bottom<=g.ih&&g.tree.right<=g.detail.left-10,'Desktop panel overlap/overflow',g);await checkTopology('#skillsMenuTree');
    const controls=await evaluate(send,"[...document.querySelectorAll('#skillsMenuTree [data-level-step]')].map(n=>{const r=n.getBoundingClientRect();const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===n||n.contains(hit)})");assert(controls.length===10&&controls.every(Boolean),'Level controls occluded',controls);
    await pointerClick(send,'#skillsClose');await sleep(400);
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  const collapsed=await layout(send);await pointerClick(send,'#buildStatsToggle');const expanded=await layout(send);
  assert(expanded.skills.top>collapsed.skills.top+45&&expanded.weapon.top>collapsed.weapon.top+45&&expanded.stats.bottom<=expanded.skills.top+1&&expanded.skills.bottom<=expanded.weapon.top+1,'Stats expansion no longer flows',expanded);
  assert(expanded.side.top>=0&&expanded.side.bottom<=expanded.ih-8,'Expanded Build column overflows',expanded);
  await evaluate(send,'sequenceUi.commit(4)');assert(await evaluate(send,'sequenceUi.currentLevel')===4,'Sequence regression');await evaluate(send,'sequenceUi.commit(0)');
  console.log('Forte Chrome checks passed: 57 Character icon mappings, five stepped columns, 8 stat + 2 inherent nodes, source text and Lv1/9/10 values, Lv0, dependency lowering/activation, five independent persisted levels, reload/switch isolation, grey/gold paths, source Pending, Stats flow and 1440/1920/2560 desktop geometry.');

  socket.close();
}finally{
  chrome.kill('SIGTERM');
}
