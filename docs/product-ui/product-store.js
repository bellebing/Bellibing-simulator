import {readCharacterFocus} from '../ui-lab/v1.1/modules/character-focus.js';
import {accountSession} from '../ui-lab/inventory/account-session.js';
import {productDraftFromAccount,productDraftFromScan,scanFromProductDraft,applyProductDraft,applyOwnedProductDraft,productDraftBuildIdentity} from '../../src/productBuildDraft.mjs';
import {safeDocument} from '../../src/inventoryAccount.mjs';
import {formatScannerIssues} from '../../src/scannerImportReview.mjs';
import {validateDraft} from './build-candidate/state.js';
import {reconcileProductDrafts,productDraftBases} from '../../src/productDraftReconciliation.mjs';
export async function createProductStore(catalog,trees) {
 const session=await accountSession();
 if(!session.store.status().writable)throw Error(session.store.status().error+' Original account is preserved.');
 let owner=session.stage();
 let baselineRevision=session.store.snapshot()?.revision??null;
 const key='bellibing.product.build-drafts.v1:'+session.profile;
 let serialized=localStorage.getItem(key),saved;
 if(serialized){try{saved=JSON.parse(serialized);}catch{throw Error('Build drafts need recovery. Original draft bytes are preserved.');}}
 if(saved&&(saved.version!==1||!saved.accountId||!saved.drafts||!saved.selected))throw Error('Unsupported Build drafts. Original bytes preserved.');
 if(saved?.workshopPreviews)safeDocument(saved.workshopPreviews);
 if(saved?.baseDrafts)safeDocument(saved.baseDrafts);
 if(saved?.previewCharacters)safeDocument(saved.previewCharacters);
 if(saved&&saved.accountId!==owner.id) {
  // A new stage on an empty profile has no durable identity yet. Do not attach
  // old drafts to a different existing/cloud account automatically.
  if(session.store.snapshot())throw Error('Build drafts belong to another account. Export them before switching accounts.');
  owner.id=saved.accountId;
 }
 const projected={};
 for(const id of [...Object.keys(owner.characters),...Object.keys(owner.unownedDrafts??{})])projected[id]=productDraftFromAccount(owner,id,trees.find(t=>t.characterId===id));
 const {drafts,conflicts}=reconcileProductDrafts({account:owner,projected,saved,trees});
 // The saved account always wins for an owned Character. Older local drafts,
 // workshop previews and the retired global Preview mode are recovery data,
 // never an alternative Current Build. Preserve the ORIGINAL bytes before the
 // first local write; leaving this page untouched does not mutate storage.
 const ownedIds=new Set(Object.keys(owner.characters));
 const oldPreviews=saved?.workshopPreviews??{};
 const needsRecovery=!!serialized&&([...ownedIds].some(id=>
  (saved?.drafts?.[id]&&productDraftBuildIdentity(saved.drafts[id])!==productDraftBuildIdentity(projected[id]))
  ||saved?.previewCharacters?.[id]
  ||Object.keys(oldPreviews).some(key=>key.startsWith(id+':'))));
 let recoveryBytes=needsRecovery?serialized:null;
 for(const id of ownedIds){drafts[id]=projected[id];conflicts.delete(id);}
 const workshopPreviews=Object.fromEntries(Object.entries(oldPreviews).filter(([key])=>![...ownedIds].some(id=>key.startsWith(id+':'))));
 let state={schemaVersion:1,revision:0,selected:readCharacterFocus(saved?.selected??Object.keys(owner.characters)[0]??'augusta'),drafts,savedDrafts:structuredClone(projected),workshopPreviews:structuredClone(workshopPreviews),account:owner};
 if(!catalog.characters.some(c=>c.id===state.selected))state.selected='augusta';
 const api={session,snapshot:()=>structuredClone(state),commit(next){
  if(localStorage.getItem(key)!==serialized)throw Error('Build drafts changed in another tab. Reload before editing.');
  if(recoveryBytes!==null){
   localStorage.setItem(key+':before-single-current-build:'+crypto.randomUUID(),recoveryBytes);
   recoveryBytes=null; // On quota failure, throw before changing the live draft.
  }
  // Preserve unresolved unowned draft bases across reloads.
  const {baseCharacters,baseDrafts}=productDraftBases({account:owner,savedDrafts:state.savedDrafts,saved,conflicts});
  const payload={version:1,accountId:owner.id,selected:next.selected,drafts:next.drafts,workshopPreviews:next.workshopPreviews??{},baseCharacters,baseDrafts};
  const bytes=JSON.stringify(payload);localStorage.setItem(key,bytes);serialized=bytes;state={...structuredClone(next),account:owner};return api.snapshot();
 },stageImport(scan){
  const imported=productDraftFromScan(scan,catalog,trees.find(t=>t.characterId===scan.character?.id));
  // Preserve an overwritten local draft before staging another observation.
  const previous=state.drafts[imported.characterId];
  if(previous)localStorage.setItem(key+':before-import:'+crypto.randomUUID(),JSON.stringify({accountId:owner.id,draft:previous,createdAt:new Date().toISOString()}));
  if(owner.characters[imported.characterId]?.owned){
   // Old import entrypoints cannot replace the one Current Build implicitly.
   localStorage.setItem(key+':pending-owned-import:'+crypto.randomUUID(),JSON.stringify({accountId:owner.id,draft:imported,createdAt:new Date().toISOString()}));
   throw Error('Imported observation preserved for recovery. The saved Character was not changed.');
  }
  const next=api.snapshot();next.selected=imported.characterId;next.drafts[imported.characterId]=imported;
  return api.commit(next);
 },async saveDraft(draft){
  const savingBytes=serialized;
  if(conflicts.has(draft.characterId))throw Error('This saved build changed since your local draft. The draft is preserved; review it against Account tools before replacing the saved build.');
  if(localStorage.getItem(key)!==serialized)throw Error('Build drafts changed in another tab. Reload before saving.');
  if(draft.importObservation){
   safeDocument(draft);
   // Previously reviewed originals remain immutable; routine edits are
   // validated against the actual Account schema, not rescanned every time.
   const reviewed=owner.characters[draft.characterId]?.record?.build?.importObservation;
   if(JSON.stringify(reviewed)!==JSON.stringify(draft.importObservation)){

   const observation=scanFromProductDraft(draft);
   let result;
   if(globalThis.bellibingScannerPromise)result=await (await globalThis.bellibingScannerPromise).validate(observation);
   else{const response=await fetch('/local-import/validate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(observation)});result=await response.json();if(!response.ok)throw Error(result.error??'Import validation unavailable.');}
   if(!Array.isArray(result.issues))throw Error('Import validation unavailable.');
   if(result.issues.length)throw Error(formatScannerIssues(result.issues));
   // Awaiting validation must not permit a different tab to replace the draft.
   if(localStorage.getItem(key)!==savingBytes)throw Error('Build draft changed during validation. Review it before saving.');
   }
  }else validateDraft(draft,catalog,trees,{account:owner});
  // stage() preserves the current authoritative account and resource envelope.
  if((session.store.snapshot()?.revision??null)!==baselineRevision)throw Error('Account changed. Reload before updating this build.');
  const current=session.stage();if(!session.store.snapshot())current.id=owner.id;
  if(current.id!==owner.id)throw Error('Account changed. Reload and review before saving.');
  if(session.legacyBytes()&&!session.store.snapshot())throw Error('Back up and migrate the existing account using Account tools before saving.');
  const owned=!!current.characters[draft.characterId]?.owned;
  const next=owned?applyOwnedProductDraft(current,draft,catalog):applyProductDraft(current,draft,catalog);
  owner=await session.store.commit(next,{expectedRevision:baselineRevision,expectedAccountId:session.store.snapshot()?.id??null,reason:'EXPLICIT_PRODUCT_BUILD_SAVE'});
  baselineRevision=owner.revision;state.account=owner;
  const projection=productDraftFromAccount(owner,draft.characterId,trees.find(t=>t.characterId===draft.characterId));
  state.savedDrafts[draft.characterId]=structuredClone(projection);
  if(productDraftBuildIdentity(draft)===productDraftBuildIdentity(state.drafts[draft.characterId]))state.drafts[draft.characterId]=structuredClone(projection);
  try{api.commit(state);}catch{ /* The durable account is already saved; preserve the previous draft bytes for recovery. */ }
  return api.snapshot();
 },rawDrafts:()=>serialized};
 return api;
}

