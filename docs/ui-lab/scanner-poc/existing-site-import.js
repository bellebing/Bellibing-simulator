// Local visual integration on the original #361 page. Never load the scanner's
// development shell or write its experimental data into the concept's demo store.
async function mount(){
 const [html,baseCss,shellCss]=await Promise.all([
  fetch('/index.html').then(r=>r.text()),fetch('/style.css').then(r=>r.text()),fetch('/shell.css').then(r=>r.text())
 ]);
 const source=new DOMParser().parseFromString(html,'text/html');
 const header=document.querySelector('.site-header .header-inner');
 if(!header)throw Error('Existing Bellibing header unavailable');
 const trigger=source.getElementById('globalImportToggle').cloneNode(true);
 trigger.className='inventory-link';trigger.style.background='transparent';trigger.style.fontFamily='inherit';
 trigger.setAttribute('aria-controls','character-import-host');
 header.insertBefore(trigger,header.querySelector('.inventory-link'));
 const host=document.createElement('div');host.id='character-import-host';
 const root=host.attachShadow({mode:'open'}),style=document.createElement('style');
 // Shadow isolation keeps the existing site's CSS, layout and controls intact.
 style.textContent=baseCss+'\n'+shellCss+'\n:host{font:inherit;color:inherit}';
 const panel=source.getElementById('importPanel').cloneNode(true);
 root.append(style,panel);document.body.append(host);
 const $=id=>root.getElementById(id);let busy=false;
 function position(){
  if(panel.hidden)return;const anchor=trigger.getBoundingClientRect(),width=Math.min(300,innerWidth-32);
  panel.style.width=width+'px';panel.style.left=Math.max(16,Math.min(anchor.right-width,innerWidth-width-16))+'px';
  panel.style.top=Math.max(anchor.bottom+12,document.querySelector('.site-header').getBoundingClientRect().bottom+8)+'px';
 }
 function open(){panel.hidden=false;trigger.setAttribute('aria-expanded','true');position();}
 function close(){panel.hidden=true;trigger.setAttribute('aria-expanded','false');$('dropzone').classList.remove('is-dragging');}
 trigger.onclick=()=>panel.hidden?open():close();
 document.addEventListener('pointerdown',e=>{if(!e.composedPath().includes(host)&&!e.composedPath().includes(trigger))close();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){close();trigger.focus({preventScroll:true});}});
 addEventListener('resize',position);addEventListener('scroll',position,true);
 async function scan(file){
  if(!file||busy)return;open();busy=true;$('upload').disabled=true;
  $('status').textContent='Reading build card…';
  try{
   if(file.size>5*1024*1024)throw Error('Choose a card up to 5 MiB.');
   if(!['image/png','image/jpeg'].includes(file.type))throw Error('Use JPEG or PNG.');
   const response=await fetch('/api/scan',{method:'POST',headers:{'Content-Type':file.type},body:file});
   const result=await response.json();if(!response.ok)throw Error(result.error);
   // Recognition is real. This visual adapter deliberately stops before mapping
   // an imported build into the separate concept/production ownership models.
   $('status').textContent='Card detected · existing Build connection pending';
  }catch(error){$('status').textContent=error.message;}
  finally{busy=false;$('upload').disabled=false;}
 }
 $('upload').onchange=e=>{scan(e.target.files[0]);e.target.value='';};
 $('dropzone').onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();$('upload').click();}};
 document.addEventListener('dragover',e=>{if([...e.dataTransfer.types].includes('Files')){e.preventDefault();open();$('dropzone').classList.add('is-dragging');}});
 document.addEventListener('dragleave',e=>{if(!e.relatedTarget)$('dropzone').classList.remove('is-dragging');});
 document.addEventListener('drop',e=>{if([...e.dataTransfer.types].includes('Files')){e.preventDefault();$('dropzone').classList.remove('is-dragging');if(e.dataTransfer.files.length===1)scan(e.dataTransfer.files[0]);}});
 document.addEventListener('paste',e=>{const file=[...e.clipboardData.items].find(i=>i.kind==='file')?.getAsFile();if(file){e.preventDefault();scan(file);}});
 trigger.dataset.importReady='true';
}
if(!new URL(location.href).searchParams.has('baseline'))await mount();
