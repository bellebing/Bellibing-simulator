import {comparisonStatValues} from '../docs/ui-lab/v1.1/modules/stat-disclosure.js';
import {sandboxStats} from '../docs/ui-lab/v1.1/modules/sandbox-stats.js';
import {characterCardModel} from '../docs/ui-lab/v1.1/modules/character-card.js';
import {echoCard,echoStatus} from '../docs/ui-lab/v1.1/modules/echo-card.js';
import {observedSlots} from '../docs/ui-lab/v1.1/modules/sandbox-presentation.js';
import {configuredCard} from '../docs/ui-lab/v1.1/modules/configured-card.js';
import {createLabResourceInventory} from '../docs/ui-lab/v1.1/modules/resource-state.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {accountProjection} from '../docs/ui-lab/v1.1/modules/account-projection.js';
import {CHARACTER_CATALOG} from '../docs/ui-lab/v1.1/modules/catalog.js';
import {characterContext,teamSlotAlternatives,selectTeamSlot} from '../docs/ui-lab/v1.1/modules/character-context.js';
import {createConfigurationSession,activateConfigurationSlot,configurationSnapshot} from '../docs/ui-lab/v1.1/modules/simulation-configuration.js';
import {createSandboxState} from '../docs/ui-lab/v1.1/modules/sandbox-state.js';
import {uxAccountFixture} from './helpers/uxAccountFixture.mjs';
const person=CHARACTER_CATALOG.find(c=>c.id==='augusta');
test('Current/Candidate reads five owned Echoes and replaces exactly one without writing the account',()=>{
 const {account,candidate}=uxAccountFixture(),before=JSON.stringify(account),storage={getItem:()=>JSON.stringify(account),setItem:()=>assert.fail('Read-only projection')};
 const current=accountProjection(person,storage),comparison=accountProjection(person,storage,{candidate,slot:0});
 assert.equal(comparison.currentValues.ELECTRO_DMG_BONUS,'70%','Reuse reviewed permanent Sonata effects');assert.equal(comparison.kind,'ACCOUNT_BUILD');assert.equal(comparison.status,'STATIC_COMPARISON');assert.deepEqual(comparison.current,current.current);assert.notEqual(comparison.candidate.critRate,comparison.current.critRate);assert.ok(comparison.current.echoCardCount===5&&comparison.candidate.echoCardCount===5);assert.equal(JSON.stringify(account),before);
 for(const mutate of [a=>a.characters=[],a=>a.drafts.Augusta.build.echoSets.sets.owned.slots[4]=null,a=>a.drafts.Augusta.build.forte=null]){const a=structuredClone(account);mutate(a);const p=accountProjection(person,{getItem:()=>JSON.stringify(a)},{candidate,slot:0});assert.equal(p.status,'PENDING');assert.equal(p.candidate,null);}
 assert.equal(accountProjection(person,storage,{candidate:{...candidate,mainStat:{name:'CRIT Rate',value:999}},slot:0}).status,'PENDING');
});
test('per-portrait alternatives preserve the other two members and only choose an existing source context',()=>{
 const s=createSandboxState('augusta'),context=characterContext('augusta'),options=teamSlotAlternatives(context,1),replacement=options.find(t=>t.characterId==='mortefi');assert.ok(replacement);
 const selected=selectTeamSlot(s,1,replacement.contextId);assert.deepEqual(selected.memberIds,[context.memberIds[0],'mortefi',context.memberIds[2]]);assert.equal(selected.team.id,replacement.contextId);assert.throws(()=>selectTeamSlot(s,2,'invented'),/NOT_AVAILABLE/);assert.equal(s.sandboxEvaluationContext,null);
});
test('an empty slot can switch On/Off while remaining invalid for simulation until configured',async()=>{
 const s=createSandboxState('augusta');s.configurationSession=createConfigurationSession('augusta',{initializeDefaults:false});const before=structuredClone(s.configurationSession.current);
 activateConfigurationSlot(s.configurationSession,3,true);assert.equal(s.configurationSession.active[3],true);assert.equal(s.configurationSession.configurations[3],null);const snap=await configurationSnapshot(s,createLabResourceInventory().read());assert.ok(snap.validation.issues.includes('ACTIVE_SLOT_NOT_CONFIGURED'));
 activateConfigurationSlot(s.configurationSession,3,false);assert.deepEqual(s.configurationSession.current,before);assert.equal(s.configurationSession.active[2],false);
});

test('observed completion drives Kept/Temporary, while account observation alone establishes neither',()=>{
 const {cards}=uxAccountFixture(),raw={...cards[0],speciesId:cards[0].echoId};
 const current=complete=>observedSlots({slots:[{slot:1,...(complete===undefined?{}:{complete}),current:raw}]})[0].current;
 assert.equal(echoStatus(current(true)).label,'Kept');
 assert.equal(echoStatus(current(false)).label,'Temporary');
 assert.equal(current(undefined).disposition,undefined);
 assert.equal(echoStatus(current(undefined),{footer:'EQUIPPED'}).label,'Equipped');
 assert.equal(raw.disposition,undefined);
});
test('a single footer preserves actual discard checkpoint and cannot call a template or candidate Kept',()=>{
 const template=configuredCard(createSandboxState('augusta').configurationSession.configurations[0]);
 assert.equal(echoStatus(template).label,'Configured');
 const {cards}=uxAccountFixture(),raw={...cards[0],speciesId:cards[0].echoId,level:10};
 const discarded=observedSlots({slots:[{slot:1,trash:[{card:raw,reason:'observed rejection'}]}]})[0].trash[0];
 const html=echoCard(discarded,{compactFooter:true,rankPending:true});
 assert.match(html,/data-echo-status="DISCARDED"/);assert.match(html,/<small>\+10<\/small>/);assert.doesNotMatch(html,/data-rank-status/);
 assert.equal(echoStatus({...discarded,disposition:undefined},{candidate:true}).label,'Candidate');
 assert.equal(echoStatus(null).label,'Empty');
});
test('Echo rarity five and static roll values cannot invent Improve ranks',()=>{
 const {cards}=uxAccountFixture();
 for(const raw of cards){
  const card=observedSlots({slots:[{slot:1,current:{...raw,speciesId:raw.echoId}}]})[0].current;
  const html=echoCard(card,{compactFooter:true,rankPending:true,footer:'EQUIPPED'});
  assert.match(html,/data-rank-status="PENDING"/);assert.match(html,/Rank <span>Pending<\/span>/);
  assert.doesNotMatch(html,/Rank <span>[1-5]<\/span>/);
 }
 assert.doesNotMatch(echoCard(null,{compactFooter:true,rankPending:true}),/data-rank-status/);
});

test('three-column stats keep Sandbox Current fixed and never substitute reference/sample numbers for Expected',()=>{
 const s=createSandboxState('augusta'),{cards}=uxAccountFixture();
 s.sandboxStatProjection=sandboxStats(s);const before=comparisonStatValues(characterCardModel(person,s),s,4);
 assert.notEqual(before[0],null);assert.equal(before[1],null);assert.equal(before[2],null);
 const view={slots:cards.map((c,i)=>({slot:i+1,complete:true,current:{...c,id:'observed-'+i,speciesId:c.echoId}}))};
 s.sandboxStatProjection=sandboxStats(s,{view});s.hasRecordedRun=true;s.stats[4]=['999%','999%'];
 const after=comparisonStatValues(characterCardModel(person,s),s,4);
 assert.equal(after[0],before[0]);assert.equal(after[1],null);assert.notEqual(after[2],null);assert.notEqual(after[2],after[0]);assert.notEqual(after[2],'999%');
});
test('Improve columns bind Current and observed Candidate to the same owned build, with Expected Pending',()=>{
 const {account,candidate}=uxAccountFixture(),storage={getItem:()=>JSON.stringify(account)};
 const s={id:person.id,accountProjection:accountProjection(person,storage,{candidate,slot:0}),stats:[]};
 const values=comparisonStatValues(characterCardModel(person,s),s,4);
 assert.equal(values[0],s.accountProjection.currentValues.TOTAL_CRIT_RATE);assert.equal(values[1],null);assert.equal(values[2],s.accountProjection.candidateValues.TOTAL_CRIT_RATE);
 s.accountProjection=accountProjection(person,storage);assert.equal(comparisonStatValues(characterCardModel(person,s),s,4)[2],null);
});
