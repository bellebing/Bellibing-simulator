import test from 'node:test';
import assert from 'node:assert/strict';
import {accountTeamBasis,sameDpsModelBasis,expectedMatchesAccountTeam,dpsComparisonWinner} from '../docs/ui-lab/v1.1/modules/improve-comparison-basis.js';
const input=()=>({mode:'IMPROVE',selectedCharacterId:'carry',team:{id:'selected',characterIds:['carry','partner','support']},records:['carry','partner','support'].map(characterId=>({characterId,status:'OBSERVED_PRODUCTION_BUILD_RECORD',buildState:{weaponId:'original',sequenceLevel:0}})),actualInvestments:{carry:{weaponRefinement:1}},scope:{slot:0,gate:10}});

test('DPS winner requires comparable model results and ignores numeric ties',()=>{
 const current={status:'EXPERIMENTAL',rotationAcceptance:{status:'MET'},teamTotal:25000,comparisonIdentity:'a'.repeat(64),provider:{sourceBinding:'b'.repeat(64)}};
 const next={...current,teamTotal:25750};
 assert.equal(dpsComparisonWinner(current,next),'new');assert.equal(dpsComparisonWinner(next,current),'current');
 assert.equal(dpsComparisonWinner(current,current),null);
 assert.equal(dpsComparisonWinner(current,{...current,teamTotal:25000+1e-8}),null);
 assert.equal(dpsComparisonWinner(current,{...next,comparisonIdentity:'c'.repeat(64)}),null);
 assert.equal(dpsComparisonWinner(current,{...next,status:'PENDING'}),null);
 const planned={...next,status:'CONDITIONAL',basis:'PLANNED_ROTATION_ASSUMING_ENERGY_AVAILABLE',rotationAcceptance:{status:'NOT_MET'}};
 assert.equal(dpsComparisonWinner(current,planned),'new');
 assert.equal(dpsComparisonWinner(current,{...planned,basis:'UNSPECIFIED'}),null);
});
test('Expected belongs to all three actual builds, investments and the selected context',()=>{
 const base=input(),estimate={status:'ESTIMATED',characterId:'carry',teamBuildIdentity:accountTeamBasis(base),useReference:false};
 assert.equal(expectedMatchesAccountTeam(estimate,base,false),true);
 for(const change of [x=>x.records[1].buildState.weaponId='new',x=>x.records[2].buildState.sequenceLevel=2,x=>x.actualInvestments.carry.weaponRefinement=2,x=>x.team.id='another',x=>x.scope.gate=15,x=>x.selectedCharacterId='partner']){
  const next=structuredClone(base);change(next);assert.equal(expectedMatchesAccountTeam(estimate,next,false),false);
 }
 assert.equal(expectedMatchesAccountTeam(estimate,base,true),false);
 const reordered=structuredClone(base);reordered.records.reverse();assert.equal(accountTeamBasis(base),accountTeamBasis(reordered));
});
test('a declared Echo effect may change execution while the fixed model basis stays comparable',()=>{
 const baseline={contextIdentity:'a'.repeat(64),comparisonIdentity:'b'.repeat(64),provider:{sourceBinding:'c'.repeat(64)}};
 const candidate={...baseline,contextIdentity:'d'.repeat(64)};
 assert.equal(sameDpsModelBasis(baseline,candidate),true);
 assert.equal(sameDpsModelBasis(baseline,{...candidate,comparisonIdentity:'e'.repeat(64)}),false);
 assert.equal(sameDpsModelBasis(baseline,{...candidate,provider:{sourceBinding:'f'.repeat(64)}}),false);
 assert.equal(sameDpsModelBasis({},{}),false);
 assert.equal(sameDpsModelBasis({contextIdentity:'a'.repeat(64),provider:baseline.provider},{contextIdentity:'a'.repeat(64),provider:baseline.provider}),true);
});
