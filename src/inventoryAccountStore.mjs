import {validateAccount,legacyProjection,LEGACY_BUILD_KEY,withUserData,ACCOUNT_DATA_KEYS} from './inventoryAccount.mjs';
// IndexedDB is the only new persistence owner. Projections are memory-only.
export async function openAccountStore({catalog,profile='default',indexedDB=globalThis.indexedDB,BroadcastChannel=globalThis.BroadcastChannel,initialStorage=()=>({})}={}){
 if(!/^[a-zA-Z0-9_-]{1,80}$/.test(profile))throw Error('Invalid local profile.');
 const db=await new Promise((resolve,reject)=>{let blocked=false;const r=indexedDB.open('bellibing-owned-inventory',3);r.onupgradeneeded=()=>{for(const name of ['accounts','outbox','sync'])if(!r.result.objectStoreNames.contains(name))r.result.createObjectStore(name);if(!r.result.objectStoreNames.contains('recovery'))r.result.createObjectStore('recovery',{autoIncrement:true});};r.onsuccess=()=>{if(blocked){r.result.close();return;}resolve(r.result);};r.onerror=()=>reject(r.error);r.onblocked=()=>{blocked=true;reject(Error('Close other account tabs before upgrading.'));};});
 db.onversionchange=()=>{db.close();};
 const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('bellibing-owned-inventory'):null;
 const listeners=new Set();let snapshot=null,readFailure=null,rawRecord=null;
 const notify=()=>{for(const fn of listeners){try{fn(api.snapshot());}catch{console.warn('Inventory view could not refresh; saved data is intact.');}}};
 const api={profile,snapshot:()=>structuredClone(snapshot),status:()=>({writable:!readFailure,error:readFailure?.message??null}),rawRecovery:()=>({format:'bellibing-raw-recovery',version:1,profile,account:structuredClone(rawRecord)}),subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},
  async refresh(){const value=await new Promise((resolve,reject)=>{const tx=db.transaction('accounts','readonly'),r=tx.objectStore('accounts').get(profile);r.onsuccess=()=>{try{rawRecord=structuredClone(r.result??null);readFailure=null;resolve(r.result?validateAccount(r.result,catalog):null);}catch(error){readFailure=error;reject(error);}};r.onerror=()=>reject(r.error);});snapshot=value;return api.snapshot();},
  async commit(next,{expectedRevision=snapshot?.revision??null,expectedAccountId=snapshot?.id??null,reason='EXPLICIT_SAVE',cloud=null}={}){
   if(readFailure)throw readFailure;validateAccount(next,catalog);
   const candidate=/ROLLBACK|RESTORE/.test(reason)?structuredClone(next):withUserData(next,{storage:initialStorage()});
   validateAccount(candidate,catalog);
   await new Promise((resolve,reject)=>{
    const tx=db.transaction(['accounts','recovery','outbox','sync'],'readwrite'),accounts=tx.objectStore('accounts');let issue=null;
    if(cloud){
     if(typeof cloud.uid!=='string'||!cloud.uid||!Number.isSafeInteger(cloud.remoteRevision)||cloud.remoteRevision<1){tx.abort();reject(Error('Invalid cloud account binding.'));return;}
     const binding=tx.objectStore('sync').get(profile),pending=tx.objectStore('outbox').get(profile);
     binding.onsuccess=()=>{const old=binding.result;if(old&&old.uid!==cloud.uid||!cloud.approved&&(!old||old.accountId!==candidate.id||cloud.remoteRevision<=old.remoteRevision)){issue=Error('Cloud account identity changed.');tx.abort();}};
     pending.onsuccess=()=>{if(pending.result&&!cloud.approved){issue=Error('Local changes must be resolved before downloading.');tx.abort();}};
    }
    const r=accounts.get(profile);r.onsuccess=()=>{try{
     const old=r.result??null;
     if((old?.revision??null)!==expectedRevision||(old?.id??null)!==expectedAccountId)throw Error('Account changed in another tab. Reload and review again.');
     if(old&&candidate.id!==old.id&&!['EXPLICIT_JSON_RESTORE','EXPLICIT_ROLLBACK','EXPLICIT_CLOUD_RESTORE'].includes(reason))throw Error('Account replacement requires explicit restore.');
     // An empty-profile JSON restore preserves the exported account byte-for-byte.
     // Replacing an occupied profile must advance the revision for stale-tab safety.
     const jsonRestore=reason==='EXPLICIT_JSON_RESTORE';
     if(!jsonRestore){
      const previousBuilds=old?legacyProjection(old).drafts:{},nextBuilds=legacyProjection(candidate).drafts;
      for(const c of Object.values(candidate.characters)){
       const previous=old?.characters[c.id];
       const unchanged=previous&&previous.owned===c.owned&&JSON.stringify(previousBuilds[c.name]?.build)===JSON.stringify(nextBuilds[c.name]?.build);
       c.revision=previous?(previous.revision??1)+(unchanged?0:1):(c.revision??1);
      }
     }
     if(!jsonRestore||old)candidate.revision=Math.max(old?.revision??0,candidate.revision)+1;
     const protectedPoint=!!old&&!old.userData||/MIGRAT|CONFLICT|ROLLBACK|RESTORE/.test(reason);
     tx.objectStore('recovery').add({profile,reason,protected:protectedPoint,previous:old,nextRevision:candidate.revision,createdAt:new Date().toISOString()});
     // Prune only ordinary points in this profile, in the same transaction.
     const ordinary=[],cursor=tx.objectStore('recovery').openCursor();
     cursor.onsuccess=()=>{const row=cursor.result;if(!row){for(const key of ordinary.slice(0,-10))tx.objectStore('recovery').delete(key);return;}if(row.value.profile===profile&&!row.value.protected)ordinary.push(row.key);row.continue();};
     accounts.put(candidate,profile);
     if(cloud){tx.objectStore('outbox').delete(profile);tx.objectStore('sync').put({uid:cloud.uid,accountId:candidate.id,remoteRevision:cloud.remoteRevision},profile);}
     else{
      // A local account replacement must not inherit the old cloud account link.
      if(jsonRestore&&old?.id!==candidate.id)tx.objectStore('sync').delete(profile);
      tx.objectStore('outbox').put({profile,accountId:candidate.id,revision:candidate.revision,operationId:crypto.randomUUID(),account:structuredClone(candidate)},profile);
     }
    }catch(e){issue=e;tx.abort();}};
    tx.oncomplete=resolve;tx.onabort=()=>reject(issue??tx.error??Error('Save aborted; account unchanged.'));tx.onerror=()=>{};
   });snapshot=candidate;rawRecord=structuredClone(candidate);channel?.postMessage({profile,revision:candidate.revision});notify();return api.snapshot();
  },
  async recovery(){return new Promise((resolve,reject)=>{const tx=db.transaction('recovery','readonly'),rows=tx.objectStore('recovery').getAll(),keys=tx.objectStore('recovery').getAllKeys();tx.oncomplete=()=>resolve(rows.result.map((x,i)=>({...x,key:keys.result[i]})).filter(x=>x.profile===profile));const r=rows;r.onerror=()=>reject(r.error);});},
  async rollback(entry,{expectedRevision=snapshot?.revision??null,expectedAccountId=snapshot?.id??null}={}){
   if(entry.profile!==profile)throw Error('Wrong recovery profile.');
   const saved=(await api.recovery()).find(x=>x.key===entry.key);if(!saved)throw Error('Recovery point no longer exists.');entry=saved;
   if(entry.previous)return api.commit(entry.previous,{expectedRevision,expectedAccountId,reason:'EXPLICIT_ROLLBACK'});
   await new Promise((resolve,reject)=>{const tx=db.transaction(['accounts','recovery','outbox'],'readwrite'),accounts=tx.objectStore('accounts');let issue=null;
    const r=accounts.get(profile);r.onsuccess=()=>{if((r.result?.revision??null)!==expectedRevision||(r.result?.id??null)!==expectedAccountId){issue=Error('Account changed; review recovery again.');tx.abort();return;}tx.objectStore('recovery').add({profile,reason:'EXPLICIT_RETURN_TO_LEGACY_OR_EMPTY',protected:true,previous:r.result??null,createdAt:new Date().toISOString()});accounts.delete(profile);tx.objectStore('outbox').delete(profile);};
    tx.oncomplete=resolve;tx.onabort=()=>reject(issue??tx.error??Error('Recovery aborted.'));tx.onerror=()=>{};
   });snapshot=null;rawRecord=null;channel?.postMessage({profile,revision:null});notify();return null;
  },
  async pendingSync(){return new Promise((resolve,reject)=>{const tx=db.transaction('outbox','readonly'),r=tx.objectStore('outbox').get(profile);tx.oncomplete=()=>resolve(r.result??null);tx.onabort=()=>reject(tx.error);});},
  async syncBinding(){return new Promise((resolve,reject)=>{const tx=db.transaction('sync','readonly'),r=tx.objectStore('sync').get(profile);tx.oncomplete=()=>resolve(r.result??null);tx.onabort=()=>reject(tx.error);});},
  async applyCloud({uid,account,remoteRevision,approved=false,expectedRevision=snapshot?.revision??null,expectedAccountId=snapshot?.id??null}){
   return api.commit(account,{expectedRevision,expectedAccountId,reason:approved?'EXPLICIT_CLOUD_RESTORE':'REMOTE_SYNC_APPLY',cloud:{uid,remoteRevision,approved}});
  },
  async bindSync(uid,{approved=false}={}){
   if(readFailure)throw readFailure;
   if(!approved||typeof uid!=='string'||!uid||uid.length>128||!snapshot)throw Error('Explicit account linking required.');
   await new Promise((resolve,reject)=>{const tx=db.transaction(['accounts','sync','outbox'],'readwrite'),r=tx.objectStore('sync').get(profile),account=tx.objectStore('accounts').get(profile);let issue;
    tx.oncomplete=resolve;tx.onabort=()=>reject(issue??tx.error);
    account.onsuccess=()=>{if(account.result?.id!==snapshot.id||account.result?.revision!==snapshot.revision){issue=Error('Account changed; review linking again.');tx.abort();}};
    r.onsuccess=()=>{if(r.result&&r.result.uid!==uid){issue=Error('This local profile belongs to another Google account.');tx.abort();return;}
     if(!r.result){tx.objectStore('sync').put({uid,accountId:snapshot.id,remoteRevision:0},profile);tx.objectStore('outbox').put({profile,accountId:snapshot.id,revision:snapshot.revision,operationId:crypto.randomUUID(),account:structuredClone(snapshot)},profile);}};
   });return api.syncBinding();
  },
  async acknowledgeSync({uid,accountId,operationId,remoteRevision}){
   await new Promise((resolve,reject)=>{const tx=db.transaction(['sync','outbox'],'readwrite'),binding=tx.objectStore('sync').get(profile),pending=tx.objectStore('outbox').get(profile);let issue;
    tx.oncomplete=resolve;tx.onabort=()=>reject(issue??tx.error);
    binding.onsuccess=()=>{const old=binding.result;if(!old||old.uid!==uid||old.accountId!==accountId||!Number.isSafeInteger(remoteRevision)||remoteRevision<old.remoteRevision){issue=Error('Stale sync identity.');tx.abort();return;}tx.objectStore('sync').put({...old,remoteRevision},profile);};
    pending.onsuccess=()=>{if(pending.result?.operationId===operationId)tx.objectStore('outbox').delete(profile);};
   });
  },
  async saveUserData(key,value,{initialStorage={}}={}){
   if(!snapshot)throw Error('Save the reviewed account before editing account settings.');
   if(!ACCOUNT_DATA_KEYS.includes(key))throw Error('Unsupported account setting.');
   const next=withUserData(snapshot,{storage:initialStorage});
   if(value===null)delete next.userData.storage[key];else next.userData.storage[key]=value;
   return api.commit(next,{reason:'EXPLICIT_ACCOUNT_SETTINGS_SAVE'});
  },
  async saveWorkspaceSettings(characterId,value){
   if(!snapshot?.characters[characterId]?.owned)throw Error('Save the owned Character before its settings.');
   const next=withUserData(snapshot,{storage:initialStorage()});
   next.userData.workspaceSettings??={};next.userData.workspaceSettings[characterId]=structuredClone(value);
   return api.commit(next,{reason:'EXPLICIT_WORKSPACE_SETTINGS_SAVE'});
  },
  async saveObservations(characterId,value){
   if(!snapshot?.characters[characterId]?.owned)throw Error('Owned Character required for observed rolls.');
   if(value?.characterId!==characterId||value?.kind!=='OBSERVED_IMPROVE_CHECKPOINT'||value.version!==1)throw Error('Invalid observed session.');
   const next=withUserData(snapshot,{storage:initialStorage()});next.userData.observations[characterId]=structuredClone(value);
   return api.commit(next,{reason:'EXPLICIT_OBSERVATION_SAVE'});
  },
  storage(legacyStorage){return {getItem(key){
   if(readFailure)throw readFailure;
   if(key===LEGACY_BUILD_KEY&&snapshot)return JSON.stringify(legacyProjection(snapshot));
   if(snapshot?.userData&&ACCOUNT_DATA_KEYS.includes(key))return snapshot.userData.storage[key]??null;
   return legacyStorage.getItem(key);
  }};},
  close(){channel?.close();db.close();}
 };
 if(channel)channel.onmessage=async e=>{if(e.data?.profile===profile){try{await api.refresh();notify();}catch{notify();}}};
 try{await api.refresh();return api;}catch(error){if(readFailure)return api;channel?.close();db.close();throw error;}
}
