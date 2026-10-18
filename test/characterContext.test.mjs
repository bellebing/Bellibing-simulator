import test from 'node:test';
import assert from 'node:assert/strict';
import catalog from '../docs/ui-lab/v1.1/modules/character-contexts.json' with {type:'json'};
import {characterContext,selectCharacterTeam,teamMemberStandards} from '../docs/ui-lab/v1.1/modules/character-context.js';
import {recommendedGuidance} from '../docs/ui-lab/v1.1/modules/recommended-guidance.js';
import {dpsConceptMarkup} from '../docs/ui-lab/v1.1/modules/dps-concept.js';
import {createSandboxWorkspace} from '../docs/ui-lab/v1.1/modules/sandbox-state.js';
import {restoreRecommendedSettings} from '../docs/ui-lab/v1.1/modules/settings-state.js';

test('generated canonical projection retains 59 Characters and 390 reviewed source contexts',()=>{
 assert.equal(catalog.characters.length,59);assert.equal(catalog.teams.length,390);
 for(const c of catalog.characters){
  const context=characterContext(c.characterId);
  assert.equal(context.memberIds[0],c.characterId);
  assert.ok(context.options.every(t=>t.characterIds.includes(c.characterId)&&t.sourceRefs.length));
  assert.ok(c.recommendations.sourceLinesSha256);
  assert.equal(c.coverage.standardBuild,'VALID');
  assert.equal(c.coverage.dps,'PENDING_VERIFIED_TEAM_EXECUTION');
  if(context.team){assert.equal(new Set(context.memberIds).size,3);assert.ok(teamMemberStandards(context).every(Boolean));}
  else assert.deepEqual(context.memberIds,[c.characterId,null,null]);
 }
});
test('ambiguous Iuno and Phrolova contexts do not inherit Augusta or infer first-option defaults',()=>{
 for(const id of ['iuno','phrolova']){
  const context=characterContext(id);assert.equal(context.status,'PENDING_AMBIGUOUS_TEAM');assert.equal(context.team,null);
  const explicit=characterContext(id,context.options[0].id);assert.equal(explicit.memberIds[0],id);assert.equal(explicit.status,'USER_SELECTED_SOURCE_CONTEXT');
 }
 assert.equal(characterContext('augusta').character.defaultBasis.kind,'CANONICAL_TEAM_PROFILE');
 assert.deepEqual(characterContext('augusta').memberIds,['augusta','iuno','the-shorekeeper']);
});
test('source choices retain Character ownership, retire expert context and reject cross-Character context IDs',()=>{
 const w=createSandboxWorkspace(),a=w.select('augusta'),f=w.select('phrolova');
 const id=characterContext('phrolova').options[0].id;
 f.sandboxEvaluationContext={kind:'SYNTHETIC_REFERENCE_TEAM'};selectCharacterTeam(f,id);
 assert.equal(f.sandboxEvaluationContext,null);assert.equal(w.select('phrolova').sandboxTeamContextId,id);
 assert.equal(a.sandboxTeamContextId,undefined);
 assert.throws(()=>selectCharacterTeam(a,id),/NOT_AVAILABLE/);
});
test('Phrolova exposes exact conditional CR/CD source guidance without manufacturing ER or Echo Hard/Flex',()=>{
 const w=createSandboxWorkspace(),f=w.select('phrolova');
 const before=structuredClone(f.statSections);f.settingsMode='Customize';f.erTarget={enabled:true,valuePercent:123};
 assert.equal(restoreRecommendedSettings(f),false);assert.deepEqual(f.statSections,before);assert.equal(f.settingsMode,'Customize');assert.equal(f.erTarget.valuePercent,123);
 const markup=recommendedGuidance('phrolova');
 assert.match(markup,/60%\+ \(before Echo set bonuses\)/);assert.match(markup,/215-260%\+ \(before any Aftersound stacks\)/);
 assert.match(markup,/ER target Pending/);assert.match(markup,/Hard\/Flex mapping Pending/);
});
test('comparison rows stay Pending even when passed synthetic, stale or flat values',()=>{
 const markup=dpsConceptMarkup({characterId:'iuno',teamTotal:123,calculationStatus:'VERIFIED'});
 assert.equal((markup.match(/data-dps-scenario=/g)??[]).length,3);
 assert.equal((markup.match(/<td/g)??[]).length,12);
 assert.doesNotMatch(markup,/No DPS context|DMG\/s|synthetic reference scenario/);
 assert.match(markup,/Teammate Pending/);
});
