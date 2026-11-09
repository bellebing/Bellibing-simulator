import test from 'node:test';
import assert from 'node:assert/strict';
import {dpsObjectiveFeedback} from '../docs/ui-lab/v1.1/modules/improve-feedback.js';
import {temporaryTeamReview} from '../docs/ui-lab/v1.1/modules/temporary-team-review.js';
const result=teamTotal=>({status:'EXPERIMENTAL',teamTotal,rotationAcceptance:{status:'MET'},contextIdentity:'same'});
test('DPS minimum accepts all higher results and requires comparable completed candidate',()=>{
 const review={reference:result(100),candidate:result(120)};
 assert.equal(dpsObjectiveFeedback({minimumDpsPercent:115},review,{level:25}).title,'DPS target met');
 assert.equal(dpsObjectiveFeedback({minimumDpsPercent:115},review,{level:20}).actual,null);
 assert.equal(dpsObjectiveFeedback({minimumDpsPercent:115},{...review,candidate:result(110)},{level:25}).title,'Below DPS target');
 assert.equal(dpsObjectiveFeedback({minimumDpsPercent:95},null,null).target,null);
});
test('temporary team uses detached source profiles with selected gear and stable comparison context',async()=>{
 const cards=Array.from({length:5},(_,i)=>({echoId:'echo-'+i,cost:i?1:4,level:25,rank:5,mainStat:{name:'ATK%',value:.18},secondaryMainStat:{name:'Flat HP',value:2280},substats:[],selectedSonataSetId:'a'}));
 const input={selectedCharacterId:'augusta',team:{id:'source-team'},records:[{characterId:'augusta',buildState:{weaponId:'weapon',echoSets:{activeSetId:'a',sets:{a:{slots:cards}}}}}],candidates:[{...cards[0],substats:[{name:'CRIT Rate',value:.105}]}]};
 const before=structuredClone(input),requests=[];
 const reply=await temporaryTeamReview(input,async payload=>{requests.push(payload);return {protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',result:{current:result(100),candidate:result(120)}};});
 assert.equal(requests.length,2);assert.deepEqual(requests[0].sandbox.ownership,requests[1].sandbox.ownership);
 assert.equal(requests[0].sandbox.ownership.kind,'SANDBOX_BUILD');assert.equal(reply.scenario,'TEMPORARY_REFERENCE_TEAM');
 assert.deepEqual(input,before);assert.equal(reply.reference.teamTotal,100);
});
