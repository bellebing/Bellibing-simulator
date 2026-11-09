// Keep a future/corrupt account recoverable even if a new product view cannot
// project it. Read-only recovery exports the original bytes; it never resets DB.
const active=document.body.dataset.prototypePage;
try {
 if(active==='build')await import('./build.js');
 else if(active==='inventory')await import('./inventory.js');
 else if(active==='teams')await import('./teams.js');
} catch(error) {
 const owner=globalThis.bellibingAccountSession;
 const section=document.createElement('section');section.className='product-recovery';section.setAttribute('role','alert');
 const title=document.createElement('h1');title.textContent='Account needs review';
 const message=document.createElement('p');message.textContent=error.message+' Saved data has not been reset.';
 section.append(title,message);
 if(owner&&!owner.store.status().writable){
  const button=document.createElement('button');button.type='button';button.dataset.rawRecovery='';button.textContent='Download original account data';
  button.onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(owner.store.rawRecovery(),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='Bellibing_Original_Account_Recovery.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};section.append(button);
 }
 for(const main of document.querySelectorAll('main'))main.hidden=true;
 document.body.append(section);
}
