const $=id=>document.getElementById(id);
const catalog=await fetch('/api/catalog').then(r=>r.json());
let draft=null,original=null,imageURL=null,bitmap=null,issues=[],revision=0,validating=false,timer=null,reviewedDraft=null;
const node=(tag,text,attrs={})=>{const n=document.createElement(tag);if(text!==null)n.textContent=text;for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;};
const flat=name=>name?.startsWith('Flat ');
const display=(name,value)=>value==null?'':flat(name)?String(value):String(Number((value*100).toFixed(8)));
const read=(obj,path)=>path.split('.').reduce((v,k)=>v?.[k],obj);
function write(path,value){const keys=path.split('.');const last=keys.pop();keys.reduce((v,k)=>v[k],draft)[last]=value;}
function changed(){revision++;reviewedDraft=null;$('checked').checked=false;$('accepted').textContent='';$('accept').disabled=true;clearTimeout(timer);timer=setTimeout(validate,100);}
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
 if(value?.needsReview){row.append(node('span',`Check OCR: ${value.rawName||'?'} ${value.rawValue||'?'}${value.name?' · suggested canonical tier '+display(value.name,value.value)+(flat(value.name)?'':'%'):''}`,{class:'raw'}));}
 parent.append(row);
}
function render(){
 $('review').hidden=false;$('checked').checked=false;$('accept').disabled=true;
 $('identity').replaceChildren();$('skills').replaceChildren();$('echoes').replaceChildren();
 field($('identity'),'Character','character.id',catalog.characters);field($('identity'),'Character level','character.level');
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
 }catch{if(at===revision){validating=false;$('status').textContent='Validation unavailable. Your corrections remain in this draft.';$('accept').disabled=true;}return false;}
}
$('checked').onchange=()=>{$('accept').disabled=validating||issues.length>0||!$('checked').checked;};
$('upload').onchange=async event=>{
 const file=event.target.files[0];if(!file)return;revision++;draft=null;original=null;reviewedDraft=null;$('review').hidden=true;$('accepted').textContent='';
 if(imageURL)URL.revokeObjectURL(imageURL);if(bitmap)bitmap.close();imageURL=null;bitmap=null;
 if(file.size>5*1024*1024){$('status').textContent='Choose a card up to 5 MiB.';return;}
 const ticket=revision;event.target.disabled=true;$('status').textContent='Reading Character, Weapon, Skills and five Echoes…';
 try{const response=await fetch('/api/scan',{method:'POST',headers:{'Content-Type':file.type||'application/octet-stream'},body:file});const result=await response.json();if(!response.ok)throw Error(result.error);if(ticket!==revision)return;
 bitmap=await createImageBitmap(file);imageURL=URL.createObjectURL(file);$('source').src=imageURL;draft=result.draft;original=structuredClone(draft);issues=result.issues;
 render();await validate();$('status').textContent=`Scan complete in ${(result.elapsedMs/1000).toFixed(1)} s. Review every value before confirming.`;
 }catch(e){$('status').textContent=e.message||'Could not read this card.';}finally{event.target.disabled=false;event.target.value='';}
};
$('reset').onclick=()=>{draft=structuredClone(original);changed();render();validate();};
$('accept').onclick=async()=>{if(await validate()&&$('checked').checked)$('confirmation').showModal();};
$('confirmation').addEventListener('close',()=>{if($('confirmation').returnValue==='confirm'&&draft&&!issues.length&&$('checked').checked){reviewedDraft=structuredClone(draft);$('accepted').textContent='Reviewed draft confirmed for this session. Inventory has not been changed.';}});
