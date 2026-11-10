import test from 'node:test';
import assert from 'node:assert/strict';
import {accountTeamBasis,sameDpsModelBasis,expectedMatchesAccountTeam} from '../docs/ui-lab/v1.1/modules/improve-comparison-basis.js';
const input=()=>({mode:'IMPROVE',selectedCharacterId:'carry',team:{id:'selected',characterIds:['carry','partner','support']},records:['carry','partner','support'].map(characterId=>({characterId,status:'OBSERVED_PRODUCTION_BUILD_RECORD',buildState:{weaponId:'original',sequenceLevel:0}})),actualInvestments:{carry:{weaponRefinement:1}},scope:{slot:0,gate:10}});
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
