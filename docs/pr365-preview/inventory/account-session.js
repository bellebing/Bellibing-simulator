import {accountFromLegacy,emptyAccount,withUserData,LEGACY_BUILD_KEY,RECOVERY_KEYS} from './inventoryAccount.mjs';
import {openAccountStore} from './inventoryAccountStore.mjs';
export {accountFromLegacy};
export async function accountSession(){
 if(globalThis.bellibingAccountSessionPromise)return globalThis.bellibingAccountSessionPromise;
 globalThis.bellibingAccountSessionPromise=(async()=>{
  const profile=new URL(location.href).searchParams.get('profile')??'default';
  // Raw source previews and built product routes share the same generated catalog.
  const catalogUrl=import.meta.url.includes('/docs/ui-lab/inventory/')?new URL('../../../dist/inventory/catalog.json',import.meta.url):new URL('../inventory/catalog.json',location.href);
  const catalog=await fetch(catalogUrl).then(r=>{if(!r.ok)throw Error('Canonical catalog unavailable; run npm run build first.');return r.json();});
  const originalStorage=globalThis.localStorage;
  const legacyBytes=()=>profile==='default'?originalStorage.getItem(LEGACY_BUILD_KEY):null;
  const recovery=()=>Object.fromEntries(RECOVERY_KEYS.flatMap(k=>{const text=profile==='default'?originalStorage.getItem(k):null;return text===null?[]:[[k,text]];}));
  const store=await openAccountStore({catalog,profile,initialStorage:()=>Object.fromEntries(Object.entries(recovery()).filter(([key])=>key!==LEGACY_BUILD_KEY))});
  let staged=null,stagedBytes=null;
  const stage=()=>{if(!store.status().writable)throw Error(store.status().error);const current=store.snapshot();if(current)return withUserData(current,{storage:Object.fromEntries(Object.entries(recovery()).filter(([key])=>key!==LEGACY_BUILD_KEY))});const text=legacyBytes();if(!staged||text!==stagedBytes){staged=text?accountFromLegacy(JSON.parse(text),catalog,{recovery:recovery()}):emptyAccount();stagedBytes=text;}return structuredClone(staged);};
  const storage=store.storage({getItem:key=>profile==='default'?originalStorage.getItem(key):key===LEGACY_BUILD_KEY?JSON.stringify({characters:[],drafts:{}}):null});
  const session={catalog,store,storage,profile,stage,legacyBytes,recovery};
  globalThis.bellibingAccountSession=session;
  store.subscribe(()=>{dispatchEvent(new Event('bellibing-build-state-changed'));dispatchEvent(new Event('bellibing-inventory-changed'));});
  return session;
 })();
 return globalThis.bellibingAccountSessionPromise;
}
