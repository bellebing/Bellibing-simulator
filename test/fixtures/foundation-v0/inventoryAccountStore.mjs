import {validateAccount,legacyProjection,LEGACY_BUILD_KEY} from './inventoryAccount.mjs';
// IndexedDB is the only new persistence owner. Projections are memory-only.
export async function openAccountStore({catalog,profile='default',indexedDB=globalThis.indexedDB}={}){
 if(!/^[a-zA-Z0-9_-]{1,80}$/.test(profile))throw Error('Invalid local profile.');
 const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('bellibing-owned-inventory',1);r.onupgradeneeded=()=>{r.result.createObjectStore('accounts');r.result.createObjectStore('recovery',{autoIncrement:true});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('Close other account tabs before upgrading.'));});
 const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('bellibing-owned-inventory'):null;
 const listeners=new Set();let snapshot=null;
 const notify=()=>{for(const fn of listeners){try{fn(api.snapshot());}catch{console.warn('Inventory view could not refresh; saved data is intact.');}}};
 const api={profile,snapshot:()=>structuredClone(snapshot),subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},
  async refresh(){snapshot=await new Promise((resolve,reject)=>{const tx=db.transaction('accounts','readonly'),r=tx.objectStore('accounts').get(profile);r.onsuccess=()=>{try{resolve(r.result?validateAccount(r.result,catalog):null);}catch(error){reject(error);}};r.onerror=()=>reject(r.error);});return api.snapshot();},
  async commit(next,{expectedRevision=snapshot?.revision??null,expectedAccountId=snapshot?.id??null,reason='EXPLICIT_SAVE'}={}){
   validateAccount(next,catalog);const candidate=structuredClone(next);
   await new Promise((resolve,reject)=>{
    const tx=db.transaction(['accounts','recovery'],'readwrite'),accounts=tx.objectStore('accounts');let issue=null;
    const r=accounts.get(profile);r.onsuccess=()=>{try{
     const old=r.result??null;
     if((old?.revision??null)!==expectedRevision||(old?.id??null)!==expectedAccountId)throw Error('Account changed in another tab. Reload and review again.');
     if(old&&candidate.id!==old.id&&!['EXPLICIT_JSON_RESTORE','EXPLICIT_ROLLBACK'].includes(reason))throw Error('Account replacement requires explicit restore.');
     const previousBuilds=old?legacyProjection(old).drafts:{},nextBuilds=legacyProjection(candidate).drafts;
     for(const c of Object.values(candidate.characters)){
      const previous=old?.characters[c.id];
      const unchanged=previous&&previous.owned===c.owned&&JSON.stringify(previousBuilds[c.name]?.build)===JSON.stringify(nextBuilds[c.name]?.build);
      c.revision=previous?(previous.revision??1)+(unchanged?0:1):(c.revision??1);
     }
     candidate.revision=(old?.revision??0)+1;tx.objectStore('recovery').add({profile,reason,previous:old,nextRevision:candidate.revision,createdAt:new Date().toISOString()});accounts.put(candidate,profile);
    }catch(e){issue=e;tx.abort();}};
    tx.oncomplete=resolve;tx.onabort=()=>reject(issue??tx.error??Error('Save aborted; account unchanged.'));tx.onerror=()=>{};
   });snapshot=candidate;channel?.postMessage({profile,revision:candidate.revision});notify();return api.snapshot();
  },
  async recovery(){return new Promise((resolve,reject)=>{const tx=db.transaction('recovery','readonly'),r=tx.objectStore('recovery').getAll();r.onsuccess=()=>resolve(r.result.filter(x=>x.profile===profile));r.onerror=()=>reject(r.error);});},
  async rollback(entry,{expectedRevision=snapshot?.revision??null,expectedAccountId=snapshot?.id??null}={}){
   if(entry.profile!==profile)throw Error('Wrong recovery profile.');
   if(entry.previous)return api.commit(entry.previous,{expectedRevision,expectedAccountId,reason:'EXPLICIT_ROLLBACK'});
   await new Promise((resolve,reject)=>{const tx=db.transaction(['accounts','recovery'],'readwrite'),accounts=tx.objectStore('accounts');let issue=null;
    const r=accounts.get(profile);r.onsuccess=()=>{if((r.result?.revision??null)!==expectedRevision||(r.result?.id??null)!==expectedAccountId){issue=Error('Account changed; review recovery again.');tx.abort();return;}tx.objectStore('recovery').add({profile,reason:'EXPLICIT_RETURN_TO_LEGACY_OR_EMPTY',previous:r.result??null,createdAt:new Date().toISOString()});accounts.delete(profile);};
    tx.oncomplete=resolve;tx.onabort=()=>reject(issue??tx.error??Error('Recovery aborted.'));tx.onerror=()=>{};
   });snapshot=null;channel?.postMessage({profile,revision:null});notify();return null;
  },
  storage(legacyStorage){return {getItem(key){return key===LEGACY_BUILD_KEY&&snapshot?JSON.stringify(legacyProjection(snapshot)):legacyStorage.getItem(key);}};},
  close(){channel?.close();db.close();}
 };
 if(channel)channel.onmessage=async e=>{if(e.data?.profile===profile){await api.refresh();notify();}};
 await api.refresh();return api;
}
