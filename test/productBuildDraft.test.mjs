import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,scan} from './fixtures/inventory.mjs';
import {emptyAccount,saveReviewedScan,saveOwnedTeam,exportAccount,parseBackup} from '../src/inventoryAccount.mjs';
import {applyProductDraft,productDraftFromAccount,productInvestmentPending,productDraftFromScan,scanFromProductDraft} from '../src/productBuildDraft.mjs';
const seeded=()=>saveReviewedScan(emptyAccount(),scan(),catalog,{reviewed:true,assign:true});

test('OCR draft preserves exact observed values and safely merges only the active build',()=>{
 const before=seeded(),id=Object.keys(before.characters)[0],b=before.characters[id].record.build;
 b.echoSets.sets.alternative={...structuredClone(b.echoSets.sets['set-1']),id:'alternative'};
 const observation={kind:'bellibing-scanner-review',schemaVersion:1,...scan(id)};
 const tree={nodes:[{kind:'skill',role:'normal-attack',parents:[]}]};
 const draft=productDraftFromScan(observation,catalog,tree);
 assert.equal(draft.weaponRank,1);assert.equal(draft.echoes[0].rank,5);assert.equal(draft.echoes[0].level,25);
 assert.equal(draft.importObservation.weapon.refinement,null);
 assert.equal(scanFromProductDraft(draft).skills.basic,10);
 const next=applyProductDraft(before,draft,catalog);
 assert.deepEqual(next.characters[id].record.build.echoSets.sets.alternative,b.echoSets.sets.alternative);
 for(const [key,item]of Object.entries(before.items))assert.deepEqual(next.items[key],item);
 assert.deepEqual(next.items[draft.echoes[0].instanceId].provenance.evidence.originalObservation,observation.echoes[0]);
 observation.skills.basic=null;
 const missing=productDraftFromScan(observation,catalog,tree);
 assert.equal(scanFromProductDraft(missing).skills.basic,null,'normalization must not turn an unknown skill into an observed zero');
 observation.echoes[0].echoId=null;
 const unresolved=productDraftFromScan(observation,catalog,tree);
 assert.equal(unresolved.echoes[0],null,'unidentified Echo stays an empty editable slot');
 assert.deepEqual(unresolved.importObservation.echoes[0],observation.echoes[0],'unidentified source observation is retained');
});
test('accepted Build adapter preserves inactive sets, physical IDs, provenance, observations and unknown investments',()=>{
 const before=seeded(),person=Object.values(before.characters)[0],id=person.id;
 person.record.build.retainedDetail={rotation:'source-reviewed'};person.record.extra={keep:true};
 const active=person.record.build.echoSets.activeSetId;
 person.record.build.echoSets.sets.backup={...structuredClone(person.record.build.echoSets.sets[active]),id:'backup',name:'Alternative'};
 person.record.build.characterLevel=null;
 before.userData.observations={keep:{value:42}};
 const weapon=before.items[person.record.build.weaponInstanceId];weapon.data.level=null;
 const draft=productDraftFromAccount(before,id,{nodes:[]});
 assert.equal(draft.weaponRank,1);draft.sequence=1;
 const next=applyProductDraft(before,draft,catalog);
 assert.equal(next.characters[id].record.build.characterLevel,null);
 assert.equal(next.items[weapon.id].data.level,null);
 assert.deepEqual(next.characters[id].record.extra,{keep:true});
 assert.deepEqual(next.characters[id].record.build.echoSets.sets.backup,person.record.build.echoSets.sets.backup);
 for(const [key,item]of Object.entries(before.items)){const expected=structuredClone(item);if(expected.kind==='weapon')expected.data.refinement??=1;if(expected.kind==='echo'){expected.data.rank=5;expected.data.level=25;}assert.deepEqual(next.items[key],expected);}
 assert.deepEqual(next.userData,before.userData);
 assert.equal(next.characters[id].record.build.sequenceLevel,1);
 assert.equal(next.characters[id].record.build.minorForteUnknown,true);assert.equal(productInvestmentPending(next,id),true);
 assert.equal(before.characters[id].record.build.sequenceLevel,0);
 assert.deepEqual(parseBackup(JSON.stringify(exportAccount(next,catalog)),catalog),next);
});
test('build replacement retains removed equipment and rejects physical identity reassignment',()=>{
 const before=seeded(),id=Object.keys(before.characters)[0],draft=productDraftFromAccount(before,id,{nodes:[]});
 const removed=draft.echoes[0].instanceId;draft.echoes[0]=null;
 const next=applyProductDraft(before,draft,catalog);assert.deepEqual(next.items[removed],before.items[removed]);
 const wrong=productDraftFromAccount(before,id,{nodes:[]});wrong.echoes[0].speciesId=wrong.echoes[1].speciesId;
 assert.throws(()=>applyProductDraft(before,wrong,catalog),/identity cannot change/);
});
