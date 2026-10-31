import {createShell} from './shell.js';
const $=id=>document.getElementById(id);
const catalog=await fetch('/api/catalog').then(r=>r.json());
let draft=null,original=null,imageURL=null,bitmap=null,issues=[],revision=0,validating=false,timer=null,reviewedDraft=null;
let sourceFile=null,scanning=false,confirmationRevision=null,pendingImport=null;
const shell=createShell(catalog,{onReview:openStage,onImport:()=>openImport(),onImage:scanFile,onBuildReview:mountBuildReview,onBeforeRender:parkReview,onDismissImport:options=>{if(!$('importPanel').hidden&&!$('confirmation').open)closeImport(options);}});
const node=(tag,text,attrs={})=>{const n=document.createElement(tag);if(text!==null)n.textContent=text;for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;};
const flat=name=>name?.startsWith('Flat ');
const display=(name,value)=>value==null?'':flat(name)?String(value):String(Number((value*100).toFixed(8)));
const read=(obj,path)=>path.split('.').reduce((v,k)=>v?.[k],obj);
function write(path,value){const keys=path.split('.');const last=keys.pop();keys.reduce((v,k)=>v[k],draft)[last]=value;}
function changed(){revision++;reviewedDraft=null;$('checked').checked=false;$('accepted').textContent='';$('continueActions').hidden=true;$('accept').disabled=true;$('importBadge').hidden=false;clearTimeout(timer);timer=setTimeout(validate,100);}
function field(parent,label,path,options=null,{percent=false}={}){
 const wrapper=node('label',null,{class:'field'});wrapper.append(node('span',label));
 const value=read(draft,path);let input;
 if(options){input=node('select',null,{'data-path':path,'aria-label':label});input.append(node('option','Unknown · choose',{value:''}));for(const o of options)input.append(node('option',o.name,{value:o.id}));input.value=value??'';}
 else {input=node('input',null,{type:'number',step:'any','data-path':path,'aria-label':label,placeholder:'Unknown'});input.value=percent&&value!=null?Number((value*100).toFixed(8)):value??'';}
 input.addEventListener('change',()=>{write(path,options?(input.value||null):input.value===''?null:Number(input.value)/(percent?100:1));input.classList.add('edited');changed();});
 wrapper.append(input);parent.append(wrapper);return input;
}
function stat(parent,title,base,options){
 const row=node('div',null,{class:'stat-row'});
 const name=field(row,title,base+'.name',options.map(o=>({id:o.name,name:o.name})));
 const value=read(draft,base);const amount=field(row,flat(value?.name)?'Value':'Value %',base+'.value',null,{percent:!flat(value?.name)});
 // Names can change between flat/percent. Always bind value conversion to the
 // current name, preserving entered digits and letting validation expose conflicts.
 const replacement=amount.cloneNode(true);amount.replaceWith(replacement);
 replacement.addEventListener('change',()=>{write(base+'.value',replacement.value===''?null:Number(replacement.value)/(flat(read(draft,base+'.name'))?1:100));replacement.classList.add('edited');changed();});
 name.addEventListener('change',()=>{replacement.closest('label').firstChild.textContent=flat(name.value)?'Value':'Value %';write(base+'.value',replacement.value===''?null:Number(replacement.value)/(flat(name.value)?1:100));changed();});
 if(value?.needsReview){
  const verified=value.normalization?.status==='VERIFIED_IMPORT_COMPATIBILITY';
  const prefix=verified?'Card reading':'Check OCR';
  const note=verified?' · verified importer mapping; card display cause unverified. Review required.':value.normalization?' · unverified conversion; review required.':'';
  row.append(node('span',`${prefix}: ${value.rawName||'?'} ${value.rawValue||'?'}${value.name?' · suggested canonical tier '+display(value.name,value.value)+(flat(value.name)?'':'%'):''}${note}`,{class:'raw'}));
 }
 parent.append(row);
}
function parkReview(){ $('reviewParking').append($('review')); }
function mountBuildReview(view){if(!draft)return false;view.append($('review'));$('review').hidden=false;return true;}
function refreshCharacter(){
 const c=catalog.characters.find(c=>c.id===draft.character.id);$('buildReviewName').textContent=c?.name??'Imported Character';
 const art=catalog.characterArt.find(a=>a.characterId===draft.character.id)?.targetPath;
 $('buildReviewArt').replaceChildren();if(art)$('buildReviewArt').append(node('img',null,{src:'/'+art,alt:c?.name??'Character'}));
}
function render(){
 refreshCharacter();
 $('checked').checked=false;$('accept').disabled=true;
 $('identity').replaceChildren();$('skills').replaceChildren();$('echoes').replaceChildren();
 field($('identity'),'Character','character.id',catalog.characters).addEventListener('change',refreshCharacter);field($('identity'),'Character level','character.level');
 field($('identity'),'Sequence','sequence',Array.from({length:7},(_,i)=>({id:String(i),name:'S'+i}))).addEventListener('change',e=>{draft.sequence=e.target.value===''?null:Number(e.target.value);changed();});
 field($('identity'),'Weapon','weapon.id',catalog.weapons);field($('identity'),'Weapon level','weapon.level');
 const skillNames={basic:'Basic Attack',skill:'Resonance Skill',circuit:'Forte Circuit',intro:'Intro Skill',liberation:'Resonance Liberation'};
 for(const [k,n]of Object.entries(skillNames))field($('skills'),n,'skills.'+k);
 draft.echoes.forEach((echo,i)=>{
  const p=`echoes.${i}`,section=node('article',null,{class:'echo-card'});section.append(node('h3',`Echo ${i+1}`));
  const canvas=node('canvas',null,{class:'echo-image','aria-label':`Original Echo ${i+1} panel`});canvas.width=368;canvas.height=413;
  const xs=[24,395,771,1146,1519];canvas.getContext('2d').drawImage(bitmap,xs[i],650,368,413,0,0,368,413);section.append(canvas);
  const eid=field(section,'Echo identity',p+'.echoId',catalog.echoes);
  const known=catalog.echoes.find(c=>c.id===echo.echoId);
  const sonata=field(section,'Sonata',p+'.sonataId',catalog.sonataSets.filter(s=>!known||known.sonataSetIds.includes(s.id)));
  eid.addEventListener('change',()=>{const c=catalog.echoes.find(c=>c.id===draft.echoes[i].echoId);draft.echoes[i].cost=c?.cost??null;const old=sonata.value;sonata.replaceChildren(node('option','Unknown · choose',{value:''}));for(const s of catalog.sonataSets.filter(s=>c?.sonataSetIds.includes(s.id)))sonata.append(node('option',s.name,{value:s.id}));sonata.value=old;draft.echoes[i].sonataId=sonata.value||null;changed();render();validate();});
  if(echo.evidence?.suggestion){const guess=echo.evidence.suggestion;const name=catalog.echoes.find(c=>c.id===guess.echoId)?.name;const b=node('button',`Confirm image match: ${name||'Unknown'}`,{type:'button',class:'suggestion'});b.onclick=()=>{draft.echoes[i].echoId=guess.echoId;draft.echoes[i].sonataId=guess.sonataId;draft.echoes[i].cost=catalog.echoes.find(c=>c.id===guess.echoId)?.cost??null;delete draft.echoes[i].evidence.suggestion;changed();render();validate();};section.append(b);}
  section.append(node('div','Rank: unknown · Level: unknown',{class:'meta'}));
  const costs=known?[String(known.cost)]:['1','3','4'];
  const mainOptions=[...new Map(costs.flatMap(c=>catalog.statEditor.mainStatsByCostAndLevel[c]['25']).map(s=>[s.name,s])).values()];
  section.append(node('p','MAIN STATS',{class:'subhead'}));stat(section,'Main stat',p+'.mainStat',mainOptions);
  stat(section,'Secondary',p+'.secondaryMainStat',[{name:'Flat ATK'},{name:'Flat HP'}]);
  section.append(node('p','OBSERVED ROLLS',{class:'subhead'}));for(let j=0;j<5;j++)stat(section,`Roll ${j+1}`,p+`.substats.${j}`,catalog.statEditor.substats);
  const raw=node('details');raw.append(node('summary','OCR evidence'));raw.append(node('p',`Main: ${echo.evidence?.main||'Unreadable'} · Secondary: ${echo.evidence?.secondary||'Unreadable'}`,{class:'raw'}));raw.append(node('p','Image matching scores are heuristics, not accuracy percentages. Confirm the identity against the image.',{class:'hint'}));section.append(raw);
  raw.append(node('p',echo.evidence?.method||'Identity needs review',{class:'hint'}));
  $('echoes').append(section);
 });
}
async function validate(){
 if(!draft)return false;const at=revision;validating=true;$('accept').disabled=true;
 try{const response=await fetch('/api/validate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(draft)});if(!response.ok)throw Error('Validation unavailable.');const r=await response.json();if(at!==revision)return false;issues=r.issues;
 $('issues').replaceChildren(...issues.map(i=>node('li',`${i.path}: ${i.message}`)));
 document.querySelectorAll('[data-path]').forEach(n=>{const bad=issues.some(i=>n.dataset.path===i.path||n.dataset.path.startsWith(i.path+'.'));n.classList.toggle('invalid',bad);n.setAttribute('aria-invalid',String(bad));});
 $('cost').textContent=`Total cost: ${draft.echoes.reduce((n,e)=>n+(catalog.echoes.find(c=>c.id===e.echoId)?.cost??0),0)} / 12`;
 validating=false;$('accept').disabled=issues.length>0||!$('checked').checked;return issues.length===0;
 }catch{if(at===revision){validating=false;issues=[{path:'validation',message:'Validation unavailable.'}];$('status').textContent='Validation unavailable. Your corrections remain in this draft.';$('accept').disabled=true;}return false;}
}
function positionImport(){
 const panel=$('importPanel');if(panel.hidden)return;
 const anchor=$('globalImportToggle').getBoundingClientRect();
 const width=Math.min(300,innerWidth-32);
 const left=Math.max(16,Math.min(anchor.right-width,innerWidth-width-16));
 const top=Math.max(anchor.bottom+12,document.querySelector('.site-header').getBoundingClientRect().bottom+8);
 panel.style.width=width+'px';panel.style.left=left+'px';panel.style.top=top+'px';
 panel.style.maxHeight=Math.max(120,innerHeight-top-16)+'px';
}
function openImport({focus=true}={}){
 $('importPanel').hidden=false;$('globalImportToggle').setAttribute('aria-expanded','true');positionImport();
 if(focus)$('dropzone').focus({preventScroll:true});
}
function closeImport({restoreFocus=true}={}){
 $('importPanel').hidden=true;$('dropzone').classList.remove('is-dragging');$('globalImportToggle').setAttribute('aria-expanded','false');
 if(restoreFocus)$('globalImportToggle').focus({preventScroll:true});
}
window.addEventListener('resize',positionImport);
window.addEventListener('scroll',positionImport,true);
document.addEventListener('pointerdown',e=>{
 if(!$('importPanel').hidden&&!$('confirmation').open&&!$('importPanel').contains(e.target)&&!$('globalImportToggle').contains(e.target))closeImport({restoreFocus:false});
});
async function applyImage(file){
 const next=await createImageBitmap(file);if(bitmap)bitmap.close();if(imageURL)URL.revokeObjectURL(imageURL);
 bitmap=next;sourceFile=file;imageURL=URL.createObjectURL(file);$('source').src=imageURL;
}
async function scanFile(file){
 if(!file)return;openImport({focus:false});
 if(scanning||$('confirmation').open){$('status').textContent='Finish the current scan or confirmation first.';return;}
 if(file.size>5*1024*1024){$('status').textContent='Choose a card up to 5 MiB. Your existing review is unchanged.';return;}
 if(file.type&&!['image/png','image/jpeg'].includes(file.type)){$('status').textContent='Use an original JPEG or PNG card. Your existing review is unchanged.';return;}
 const ticket=++revision;scanning=true;clearTimeout(timer);$('upload').disabled=true;$('review').inert=true;$('reviewImport').disabled=true;$('importPanel').classList.add('is-reading');$('importBadge').hidden=false;
 $('status').textContent='Reading Character, Weapon, Skills and five Echoes…';
 try{
  const response=await fetch('/api/scan',{method:'POST',headers:{'Content-Type':file.type||'application/octet-stream'},body:file});const result=await response.json();if(!response.ok)throw Error(result.error);if(ticket!==revision)return;
  pendingImport={draft:result.draft,file};$('importActions').hidden=false;
  $('status').textContent=catalog.characters.find(c=>c.id===result.draft.character.id)?.name??'Character detected · check values in Build';
 }catch(e){$('status').textContent=(e.message||'Could not read this card.')+(draft?' Your previous review is unchanged.':'');}
 finally{scanning=false;$('upload').disabled=false;$('reviewImport').disabled=!pendingImport;$('review').inert=false;$('importPanel').classList.remove('is-reading');}
}
async function openStage(stage){
 if(scanning||$('confirmation').open)return;
 revision++;clearTimeout(timer);await applyImage(stage.file);draft=structuredClone(stage.draft);original=structuredClone(stage.originalDraft);reviewedDraft=null;$('accepted').textContent='';$('continueActions').hidden=true;
 render();await validate();closeImport({restoreFocus:false});shell.openBuild();$('workspace').focus({preventScroll:true});
}
$('reviewImport').onclick=async()=>{
 if(!pendingImport||scanning)return;const next=pendingImport;
 await openStage({draft:next.draft,file:next.file,originalDraft:next.draft});
 if(pendingImport===next){pendingImport=null;$('importActions').hidden=true;$('status').textContent='';}
};
$('globalImportToggle').onclick=()=>{$('importPanel').hidden?openImport():closeImport();};
$('checked').onchange=()=>{$('accept').disabled=scanning||validating||issues.length>0||!$('checked').checked;};
$('upload').onchange=event=>{scanFile(event.target.files[0]);event.target.value='';};
$('dropzone').onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&e.target===$('dropzone')){e.preventDefault();$('upload').click();}};
document.addEventListener('dragover',e=>{if([...e.dataTransfer.types].includes('Files')){e.preventDefault();openImport({focus:false});$('dropzone').classList.add('is-dragging');}});
document.addEventListener('dragleave',e=>{if(!e.relatedTarget)$('dropzone').classList.remove('is-dragging');});
document.addEventListener('drop',e=>{if(![...e.dataTransfer.types].includes('Files'))return;e.preventDefault();$('dropzone').classList.remove('is-dragging');const files=[...e.dataTransfer.files];if(files.length!==1){$('status').textContent='Import one Character card at a time.';return;}scanFile(files[0]);});
document.addEventListener('paste',e=>{const file=[...e.clipboardData.items].find(i=>i.kind==='file')?.getAsFile();if(file){e.preventDefault();scanFile(file);}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('confirmation').open&&!$('importPanel').hidden){e.preventDefault();closeImport();}});
$('reset').onclick=()=>{draft=structuredClone(original);changed();render();validate();};
$('accept').onclick=async()=>{if(await validate()&&$('checked').checked){confirmationRevision=revision;$('confirmation').querySelector('h2').textContent=shell.hasStage(draft.character.id)?'Replace this Character’s staged review?':'Stage this reviewed build?';$('confirmation').returnValue='';$('confirmation').showModal();}};
$('confirmation').addEventListener('close',()=>{if($('confirmation').returnValue==='confirm'&&draft&&!issues.length&&$('checked').checked&&confirmationRevision===revision){reviewedDraft=structuredClone(draft);shell.stage(reviewedDraft,sourceFile,original);$('accepted').textContent=`${catalog.characters.find(c=>c.id===draft.character.id).name} staged for this session. Not saved to Inventory; Current is unchanged.`;$('continueActions').hidden=false;$('importBadge').hidden=true;}});
$('openImportedImprove').onclick=()=>{if(!reviewedDraft)return;closeImport();shell.openImprove(reviewedDraft.character.id);$('workspace').scrollIntoView({block:'start'});$('workspace').focus({preventScroll:true});};
