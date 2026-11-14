import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,scan} from './fixtures/inventory.mjs';
import {emptyAccount,saveReviewedScan} from '../src/inventoryAccount.mjs';
import {productDraftFromAccount,applyProductDraft} from '../src/productBuildDraft.mjs';
import {reconcileProductDrafts,productDraftBases} from '../src/productDraftReconciliation.mjs';
const setup=()=>{
 const before=saveReviewedScan(emptyAccount(),scan(),catalog,{reviewed:true,assign:true}),id=Object.keys(before.characters)[0];
 const draft=productDraftFromAccount(before,id,{nodes:[]});
 const replacement=structuredClone(draft);replacement.echoes[0].instanceId=crypto.randomUUID();
 const account=applyProductDraft(before,replacement,catalog);
 const projected={[id]:productDraftFromAccount(account,id,{nodes:[]})};
 const saved={drafts:{[id]:draft},baseCharacters:{[id]:JSON.stringify(before.characters[id].record)},baseDrafts:{[id]:structuredClone(draft)}};
 return {before,id,account,projected,saved};
};
test('an unchanged local draft follows a later account Equip, retaining old inventory and input bytes',()=>{
 const x=setup(),before=structuredClone(x);
 const out=reconcileProductDrafts(x);
 assert.deepEqual(out.drafts[x.id],x.projected[x.id]);assert.equal(out.conflicts.size,0);
 assert.ok(x.account.items[x.saved.drafts[x.id].echoes[0].instanceId]);assert.deepEqual(x,before);
});
test('legacy draft files recover their old comparison base from retained physical equipment',()=>{
 const x=setup();delete x.saved.baseDrafts;
 const out=reconcileProductDrafts(x);assert.deepEqual(out.drafts[x.id],x.projected[x.id]);assert.equal(out.conflicts.size,0);
});
test('real unsaved changes remain intact and block an overwrite after an account Equip',()=>{
 const x=setup();x.saved.drafts[x.id].sequence=2;
 const out=reconcileProductDrafts(x);assert.equal(out.drafts[x.id].sequence,2);assert.ok(out.conflicts.has(x.id));
 assert.notEqual(out.drafts[x.id].echoes[0].instanceId,x.projected[x.id].echoes[0].instanceId);
});
test('a draft already matching the new account adopts authoritative metadata without a conflict',()=>{
 const x=setup();x.saved.drafts[x.id]=structuredClone(x.projected[x.id]);x.saved.drafts[x.id].localNote='presentation only';
 const out=reconcileProductDrafts(x);assert.deepEqual(out.drafts[x.id],x.projected[x.id]);assert.equal(out.conflicts.size,0);
});
test('unreadable prior records and account removal cannot silently replace real local work',()=>{
 const x=setup();x.saved.baseCharacters[x.id]='not json';delete x.saved.baseDrafts;
 assert.ok(reconcileProductDrafts(x).conflicts.has(x.id));
 const removed=setup();delete removed.account.characters[removed.id];delete removed.projected[removed.id];
 const out=reconcileProductDrafts(removed);assert.deepEqual(out.drafts[removed.id],removed.saved.drafts[removed.id]);assert.ok(out.conflicts.has(removed.id));
});
test('saving another workspace edit and reloading cannot erase an unresolved account conflict',()=>{
 for(const legacy of [false,true]){
  const x=setup();if(legacy)delete x.saved.baseDrafts;
  x.saved.drafts[x.id].sequence=2;
  const first=reconcileProductDrafts(x),bases=productDraftBases({account:x.account,savedDrafts:x.projected,saved:x.saved,conflicts:first.conflicts});
  const persisted=JSON.parse(JSON.stringify({...x.saved,...bases,drafts:first.drafts}));
  const reloaded=reconcileProductDrafts({...x,saved:persisted});
  assert.ok(reloaded.conflicts.has(x.id));assert.equal(reloaded.drafts[x.id].sequence,2);
 }
});
test('following an account Equip establishes the new base for subsequent local editing',()=>{
 const x=setup(),first=reconcileProductDrafts(x),bases=productDraftBases({account:x.account,savedDrafts:x.projected,saved:x.saved,conflicts:first.conflicts});
 const persisted=JSON.parse(JSON.stringify({...x.saved,...bases,drafts:first.drafts}));
 persisted.drafts[x.id].sequence=2;
 const edited=reconcileProductDrafts({...x,saved:persisted});
 assert.equal(edited.conflicts.size,0);assert.equal(edited.drafts[x.id].sequence,2);
 assert.equal(edited.drafts[x.id].echoes[0].instanceId,x.projected[x.id].echoes[0].instanceId);
});
