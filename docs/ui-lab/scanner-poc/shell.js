// Isolated local workspace. Staged observations never become owned account state.
export function createShell(catalog,{onReview,onImport,onImage}){
 const host=document.getElementById('workspace'),stages=new Map(),views=new Map();
 const routes={home:'Home',build:'Build a Character',improve:'Improve a Character',teams:'Build a Team',sandbox:'Echo Sandbox',inventory:'Inventory',account:'Account'};
 let selected=null,team=['','',''];
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
 const character=id=>catalog.characters.find(c=>c.id===id);
 const fmt=s=>!s||s.value==null?'Unknown':s.name?.startsWith('Flat ')?String(s.value):`${Number((s.value*100).toFixed(3))}%`;
 const button=(label,fn,cls='')=>{const b=el('button',label,cls);b.type='button';b.onclick=fn;return b;};
 const asset=(path,alt,cls)=>{if(!path)return null;const img=el('img',null,cls);img.src='/'+path;img.alt=alt;return img;};
 const art=id=>catalog.characterArt.find(c=>c.characterId===id)?.targetPath;
 function title(container,name,description,eyebrow='YOUR WORKSPACE'){
  const header=el('div',null,'page-title'),text=el('div');text.append(el('p',eyebrow,'eyebrow'),el('h1',name));if(description)text.append(el('p',description));header.append(text);container.append(header);return header;
 }
 function empty(container,heading,description){const s=el('section',null,'empty-surface');s.append(el('h2',heading),el('p',description),button('Import Character',onImport,'primary'));container.append(s);}
 function go(route,id=null){if(id)selected=id;if(location.hash==='#'+route)render();else location.hash=route;}
 function badge(){return el('span','STAGED · NOT SAVED','staged-badge');}
 function echoCard(e){
  const c=catalog.echoes.find(c=>c.id===e.echoId),card=el('article',null,'preview-echo');
  const image=asset(catalog.echoIcons.find(i=>i.echoId===e.echoId)?.targetPath,c?.name??'Unknown Echo');if(image)card.append(image);
  card.append(el('h3',c?.name??'Unknown Echo'),el('div',catalog.sonataSets.find(s=>s.id===e.sonataId)?.name??'Unknown Sonata','set'));
  for(const [i,s]of [e.mainStat,e.secondaryMainStat,...e.substats].entries()){
   const row=el('div',null,'mini-stat'+(i===0?' mini-main':''));row.append(el('span',s?.name??'Unknown'),el('strong',fmt(s)));card.append(row);
   if(s?.needsReview&&s.rawValue)card.append(el('small',`Card: ${s.rawValue} · reviewed proposal`,'raw-import-value'));
  }
  return card;
 }
 function roster(container){
  const grid=el('div',null,'staged-roster');
  for(const [id,stage]of stages){const d=stage.draft,c=character(id),card=el('article',null,'stage-item');const img=asset(art(id),c.name);if(img)card.append(img);
   const text=el('div');text.append(badge(),el('h3',c.name),el('small',`${c.element} · Lv. ${d.character.level} · ${d.echoes.length} Echoes`));
   const actions=el('div',null,'workspace-actions');actions.append(button('Review',()=>onReview(stage)),button('Build preview',()=>go('build',id)),button('Preview in Improve',()=>go('improve',id)));card.append(text,actions);grid.append(card);
  }
  container.append(grid);
 }
 function selector(container){
  const select=el('select',null,'character-select');select.setAttribute('aria-label','Staged Character');
  for(const id of stages.keys()){const o=el('option',character(id).name);o.value=id;select.append(o);}
  if(!stages.has(selected))selected=stages.keys().next().value??null;select.value=selected??'';
  select.onchange=()=>{selected=select.value;render();};container.append(select);return stages.get(selected);
 }
 function buildPreview(container,stage,mode='build'){
  const d=stage.draft,c=character(d.character.id),layout=el('section',null,'build-preview'),hero=el('div',null,'character-hero');
  const image=asset(art(c.id),c.name);if(image)hero.append(image);hero.append(el('h2',c.name));
  const overview=el('div',null,'build-overview'),invest=el('div',null,'investment');
  for(const [label,value]of [['Level',d.character.level],['Sequence','S'+d.sequence],['Element',c.element]]){const item=el('span',label);item.append(el('strong',String(value)));invest.append(item);}
  const weapon=catalog.weapons.find(w=>w.id===d.weapon.id),wp=el('div',null,'weapon-summary'),wi=asset(catalog.weaponIcons.find(w=>w.weaponId===d.weapon.id)?.targetPath,weapon?.name??'Unknown Weapon');if(wi)wp.append(wi);
  const wt=el('div');wt.append(el('p','WEAPON','eyebrow'),el('h3',weapon?.name??'Unknown Weapon'),el('p',`Lv. ${d.weapon.level} · Refinement unknown`));wp.append(wt);
  const skills=el('div',null,'investment');for(const [label,key]of [['Basic','basic'],['Skill','skill'],['Circuit','circuit'],['Intro','intro'],['Liberation','liberation']]){const item=el('span',label);item.append(el('strong',String(d.skills[key])));skills.append(item);}
  if(mode==='build')overview.append(badge());overview.append(invest,wp,skills);layout.append(hero,overview);container.append(layout);
  const cards=el('div',null,'preview-echoes');for(const e of d.echoes)cards.append(echoCard(e));container.append(cards);
  const actions=el('div',null,'workspace-actions');actions.append(button('Review imported values',()=>onReview(stage)),button(mode==='improve'?'Open Build preview →':'Preview in Improve →',()=>go(mode==='improve'?'build':'improve',c.id),'primary'));container.append(actions);
 }
 function renderPage(route,view){
  view.replaceChildren();
  if(route==='home'){
   title(view,'A better build starts here.','Build your Characters, explore improvements and experiment with Echoes.','BELLIBING SIMULATOR');
   const grid=el('div',null,'home-grid');for(const [i,id,desc]of [['01','build','Review a Character and their equipment.'],['02','improve','Keep your Current build separate from possibilities.'],['03','teams','Bring your reviewed Characters together.']]){const a=el('a',null,'home-card');a.href='#'+id;a.append(el('span',i),el('h2',routes[id]),el('p',desc),el('b','→'));grid.append(a);}view.append(grid);
   const sandbox=el('a',null,'standalone-link');sandbox.href='#sandbox';sandbox.append(el('strong','Echo Sandbox'),el('span','Standalone experiments · no account required →'));view.append(sandbox);if(stages.size)roster(view);
  }else if(route==='build'){
   const heading=title(view,routes[route],'Review imported equipment here before the shared Inventory is connected.','CHARACTER BUILD PREVIEW');
   if(!stages.size){empty(view,'Start with your Character.','Import a Discord card to review your actual equipment. Nothing is added to your account automatically.');return;}
   const stage=selector(heading);buildPreview(view,stage);
  }else if(route==='improve'){
   const heading=title(view,routes[route],null,'CHARACTER WORKSPACE');
   const boundaries=el('div',null,'ownership-columns');for(const [name,copy]of [['Current','No saved owned build is connected. Staged imports do not overwrite Current.'],['Candidate','No Candidate selected. An imported review does not become a Candidate automatically.']]){const section=el('section');section.append(el('h2',name),el('p',copy));boundaries.append(section);}view.append(boundaries);
   if(!stages.size){empty(view,'Review a Character first.','Import a card from here. The review will stay separate from saved Builds and Improve Current.');return;}
   const stage=selector(heading),label=el('div',null,'staging-heading');label.append(el('h2',`${character(stage.draft.character.id).name} · imported preview`),badge());view.append(label,el('p','This is a read-only staged preview. Saving an owned Build and starting evaluation are not connected in this prototype.','stage-note'));buildPreview(view,stage,'improve');
  }else if(route==='teams'){
   title(view,routes[route],'Arrange staged Characters in a local Team draft. Saved ownership and team evaluation are not connected.','TEAM DRAFT');
   if(!stages.size){empty(view,'Your Characters, together.','Import and review a Character to begin a staged Team draft.');return;}
   const slots=el('div',null,'team-slots');for(let i=0;i<3;i++){
    const slot=el('section',null,'team-slot'),label=el('label',`Character ${i+1}`),select=el('select');select.setAttribute('aria-label',`Team Character ${i+1}`);
    const blank=el('option','Choose staged Character');blank.value='';select.append(blank);
    for(const id of stages.keys()){const option=el('option',character(id).name);option.value=id;option.disabled=team.includes(id)&&team[i]!==id;select.append(option);}select.value=team[i];select.onchange=()=>{team[i]=select.value;render();};label.append(select);slot.append(label);
    const image=asset(art(team[i]),character(team[i])?.name??'');if(image)slot.append(image);if(team[i])slot.append(badge());slots.append(slot);
   }view.append(slots);
  }else if(route==='inventory'){
   title(view,'Inventory','Shared Inventory is not connected. Reviewed imports below are staged in this tab; none are saved or equipped.','IMPORT STAGING');
   if(!stages.size){empty(view,'No staged Characters yet.','Import a card and explicitly confirm its reviewed values.');return;}
   roster(view);
   for(const [id,stage]of stages){const h=el('div',null,'section-heading');h.append(el('h2',`${character(id).name} · staged Echoes`),badge());view.append(h);const cards=el('div',null,'staged-items');for(const e of stage.draft.echoes)cards.append(echoCard(e));view.append(cards);}
  }else if(route==='account'){
   title(view,'Account',null,'LOCAL SESSION');const section=el('section',null,'empty-surface');section.append(el('h2','Guest workspace'),el('p','Your reviewed imports stay in this tab. Reloading clears them. Google sign-in, synchronization and persistent Inventory will be connected in a later step.'),button('Review staged imports',()=>go('inventory')));view.append(section);
  }
 }
 function sandboxView(){
  const view=el('section');title(view,'Echo Sandbox','Independent experiments. Imported Characters and staged equipment are not sent to Sandbox.','STANDALONE TOOL');
  const frame=el('iframe',null,'sandbox-frame');frame.id='sandboxFrame';frame.title='Existing standalone Echo Sandbox';frame.src='/docs/ui-lab/v1.1/index.html?sandbox=true';
  let boundDocument=null;
  function connectImport(){
   const doc=frame.contentDocument;
   if(!doc||doc.URL==='about:blank'||!doc.head){requestAnimationFrame(connectImport);return;}
   if(boundDocument===doc)return;boundDocument=doc;
   const css=doc.createElement('link');css.rel='stylesheet';css.href='/sandbox-frame.css';doc.head.append(css);
   // File ingress is shared with the outer shell. No imported state is sent
   // into the Sandbox, and its existing selection/run state stays mounted.
   doc.addEventListener('paste',e=>{const f=[...e.clipboardData.items].find(i=>i.kind==='file')?.getAsFile();if(f){e.preventDefault();onImage(f);}});
   doc.addEventListener('dragover',e=>{if([...e.dataTransfer.types].includes('Files'))e.preventDefault();});
   doc.addEventListener('drop',e=>{if(e.dataTransfer.files.length===1){e.preventDefault();onImage(e.dataTransfer.files[0]);}});
   frame.dataset.importReady='true';
  }
  frame.onload=connectImport;view.append(frame);requestAnimationFrame(connectImport);return view;
 }
 function render(){
  const raw=location.hash.slice(1).split('?')[0],route=routes[raw]?raw:'home';
  for(const [key,view]of views)view.hidden=key!==route;
  let view=views.get(route);
  if(!view){view=route==='sandbox'?sandboxView():el('section');view.dataset.page=route;views.set(route,view);host.append(view);}
  view.hidden=false;if(route!=='sandbox')renderPage(route,view);
  document.querySelectorAll('[data-nav]').forEach(n=>{if(n.dataset.nav===route)n.setAttribute('aria-current','page');else n.removeAttribute('aria-current');});
  document.getElementById('stageCount').textContent=stages.size?`${stages.size} staged Character${stages.size===1?'':'s'} · not saved`:'No staged imports';
  document.body.dataset.route=route;
 }
 window.addEventListener('hashchange',()=>{render();if(document.getElementById('importPanel').hidden)window.scrollTo(0,0);});render();
 return {
  stage(draft,file,originalDraft){const id=draft.character.id;const record={draft:structuredClone(draft),file,originalDraft:structuredClone(originalDraft)};stages.set(id,record);if(!selected)selected=id;render();return record;},
  openImprove(id){go('improve',id);},
  hasStage(id){return stages.has(id);},
 };
}
