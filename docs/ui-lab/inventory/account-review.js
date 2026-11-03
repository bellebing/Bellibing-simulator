// Local, synthetic-account review only. Not part of the production artifact.
import {onAuthStateChanged} from 'firebase/auth';
import {createFirebaseAccountClient} from '../../../src/firebaseAccountClient.mjs';
import {createAccountSync} from '../../../src/accountSync.mjs';
import {emptyAccount,exportAccount} from '../../../src/inventoryAccount.mjs';

const owner=await globalThis.bellibingAccountSessionPromise;
if(!owner||!owner.profile.startsWith('foundation-review-'))throw Error('Use a foundation-review-* synthetic profile for the local account proposal.');
while(!document.querySelector('.inventory-actions'))await new Promise(resolve=>setTimeout(resolve,50));
const host=document.querySelector('.inventory-actions'),button=document.createElement('button'),status=document.createElement('span'),dialog=document.createElement('dialog');
button.type='button';button.textContent='Continue with Google';button.dataset.accountReview='';status.textContent='Saved locally';status.setAttribute('role','status');status.style.cssText='font-size:12px;color:#aaa;margin-right:8px';
host.prepend(status,button);dialog.style.cssText='background:#151b20;color:#eee;border:1px solid #786641;border-radius:8px;max-width:420px;padding:24px';document.body.append(dialog);
const client=createFirebaseAccountClient({name:'bellibing-foundation-local-review',config:{apiKey:'demo-api-key',authDomain:'localhost',projectId:'demo-bellibing-foundation'},emulators:{host:'127.0.0.1',authPort:9099,firestorePort:8085}});
const sync=createAccountSync({store:owner.store,catalog:owner.catalog,remote:client.remote,readUid:client.uid});
let unsubscribe=null,signedIn=null,working=false,again=false;
function backup(){const blob=new Blob([JSON.stringify(exportAccount(owner.stage(),owner.catalog),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Bellibing_Before_Account_Choice.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function choose(title,options){return new Promise(resolve=>{
 dialog.replaceChildren();const heading=document.createElement('h3');heading.textContent=title;dialog.append(heading);
 for(const [label,value]of options){const b=document.createElement('button');b.type='button';b.textContent=label;b.style.margin='8px';b.onclick=()=>{dialog.close();resolve(value);};dialog.append(b);}
 dialog.oncancel=()=>resolve(null);dialog.showModal();
});}
async function run(){
 if(working){again=true;return;}working=true;
 try{do{again=false;status.textContent='Syncing…';const result=await sync.run();
  if(result.status==='CONFLICT'){
   if(!result.remote){status.textContent='Saved locally · account review required';return;}
   const pending=await owner.store.pendingSync(),choice=await choose('Choose the account version',[['Keep this device','LOCAL'],['Use cloud version','CLOUD'],['Cancel',null]]);
   if(choice){backup();await sync.resolveConflict({choice,remoteRevision:result.remote.revision,localOperationId:pending.operationId,approved:true});again=true;}else status.textContent='Saved locally · sync paused';
  }else status.textContent=result.status==='UNLINKED'?'Saved locally':'Synced';
 }while(again&&client.uid());}catch{status.textContent='Saved locally · sync paused';}finally{working=false;}
}
onAuthStateChanged(client.auth,async user=>{
 signedIn=user;unsubscribe?.();unsubscribe=null;sync.stop();
 if(!user){button.textContent='Continue with Google';status.textContent='Saved locally';return;}
 button.textContent='Sign out';const binding=await owner.store.syncBinding();
 if(binding&&binding.uid!==user.uid){status.textContent='Use a separate local profile for this account';return;}
 if(!binding){try{
  const cloud=await sync.download(),local=owner.store.snapshot();
  const separate=cloud&&local&&cloud.account.id!==local.id;
  const options=cloud?[[separate?'Keep local only':local?'Keep this device':'Start locally',separate?'STAY':'LOCAL'],['Use cloud account','CLOUD'],['Cancel',null]]:[['Sync this account','LOCAL'],['Cancel',null]];
  const choice=await choose('Save with Google',options);if(!choice||choice==='STAY'){status.textContent='Saved locally';return;}
  if(choice==='CLOUD'){if(local)backup();await owner.store.applyCloud({uid:user.uid,account:cloud.account,remoteRevision:cloud.head.revision,approved:true});}
  else{if(!local)await owner.store.commit(emptyAccount());await owner.store.bindSync(user.uid,{approved:true});}
 }catch{status.textContent='Saved locally · sync paused';return;}}
 unsubscribe=client.remote.subscribe(user.uid,run,()=>{status.textContent='Saved locally · sync paused';});run();
});
button.onclick=async()=>{try{if(signedIn){sync.stop();unsubscribe?.();await client.signOut();const url=new URL(location.href);url.searchParams.set('profile','foundation-review-guest-'+crypto.randomUUID());location.href=url;}else await client.signIn();}catch(error){button.dataset.authError=error.code??'SIGN_IN_UNAVAILABLE';status.textContent='Saved locally · sign-in unavailable';}};
owner.store.subscribe(()=>{if(client.uid())run();});addEventListener('online',run);
addEventListener('pagehide',()=>{sync.stop();unsubscribe?.();client.close();});
