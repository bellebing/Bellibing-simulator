import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {createCharacterBuilderAssetResolver} from '../src/characterBuilderAssets.ts';
import {projectSequenceCharacter} from '../src/characterSequenceUi.mjs';
import {activeSequenceBuildStats,projectSequenceBuildStatReview} from '../src/characterSequenceBuildStats.mjs';

const manifest=JSON.parse(readFileSync('docs/ui-prototypes/assets/builder-icons/manifest.json','utf8'));
const source=JSON.parse(readFileSync('data/source/character-sequence-ui.json','utf8'));
const review=JSON.parse(readFileSync('data/source/character-sequence-build-stat-review.json','utf8'));
const resolver=createCharacterBuilderAssetResolver(manifest);
const sourceById=new Map(source.characters.map(c=>[c.characterId,c]));
const reviewById=new Map(review.characters.map(c=>[c.characterId,c]));
const projected=[...resolver.listCharacterIds()].map(characterId=>{
  const src=sourceById.get(characterId),assets=resolver.resolve(characterId);
  return projectSequenceBuildStatReview(projectSequenceCharacter(src,assets),src,reviewById.get(characterId));
});

test('review classifies all 57 released Characters / 342 Sequences without runtime prose inference',()=>{
  assert.equal(projected.length,57);
  const chains=projected.flatMap(c=>c.chains);
  assert.equal(chains.length,342);
  assert.equal(chains.filter(c=>c.buildStatClassification==='STATIC_BUILD_STAT').length,20);
  assert.equal(chains.filter(c=>c.buildStatClassification==='NON_STATIC_MECHANIC').length,322);
  assert.equal(chains.filter(c=>c.buildStatClassification==='PENDING').length,0);
  for(const chain of chains){
    if(chain.buildStatClassification==='STATIC_BUILD_STAT'){
      assert.ok(chain.staticBuildStats.length>0);
      for(const fact of chain.staticBuildStats){
        assert.equal(fact.sourceSequence.sequence,chain.sequence);
        assert.equal(fact.sourceSequence.sourceChainId,chain.sourceChainId);
        assert.equal(fact.provenance.commit,source.provenance.characters.commit);
        assert.equal(fact.provenance.gitBlobSha,source.provenance.characters.gitBlobSha);
        assert.ok(fact.provenance.sourceText);
      }
    }else assert.deepEqual(chain.staticBuildStats,[]);
  }
});

test('Qingxiao S1 exposes exactly the reviewed +16% CRIT Rate fact and cumulative activation applies it once',()=>{
  const qingxiao=projected.find(c=>c.characterId==='qingxiao');assert.ok(qingxiao);
  const s1=qingxiao.chains[0];
  assert.equal(s1.sourceChainId,331);
  assert.equal(s1.buildStatClassification,'STATIC_BUILD_STAT');
  assert.deepEqual(s1.staticBuildStats.map(({stat,value})=>({stat,value})),[{stat:'CRIT Rate',value:.16}]);
  assert.deepEqual(activeSequenceBuildStats(qingxiao,0),[]);
  assert.deepEqual(activeSequenceBuildStats(qingxiao,1).map(({stat,value})=>({stat,value})),[{stat:'CRIT Rate',value:.16}]);
  assert.deepEqual(activeSequenceBuildStats(qingxiao,3).map(({stat,value})=>({stat,value})),[{stat:'CRIT Rate',value:.16}]);
});

test('conditional, duration, team, stack and skill-specific Sequence mechanics stay outside static projection',()=>{
  const jiyan=projected.find(c=>c.characterId==='jiyan');assert.ok(jiyan);
  const qingxiao=projected.find(c=>c.characterId==='qingxiao');assert.ok(qingxiao);
  const danjin=projected.find(c=>c.characterId==='danjin');assert.ok(danjin);
  assert.equal(jiyan.chains.find(c=>c.sourceChainId===63)?.buildStatClassification,'NON_STATIC_MECHANIC');
  assert.equal(qingxiao.chains.find(c=>c.sourceChainId===334)?.buildStatClassification,'NON_STATIC_MECHANIC');
  assert.equal(qingxiao.chains.find(c=>c.sourceChainId===333)?.buildStatClassification,'NON_STATIC_MECHANIC');
  const danjinS5=danjin.chains.find(c=>c.sourceChainId===41);assert.ok(danjinS5);
  assert.equal(danjinS5.buildStatClassification,'STATIC_BUILD_STAT');
  assert.deepEqual(danjinS5.staticBuildStats.map(({stat,value})=>({stat,value})),[{stat:'Havoc DMG',value:.15}]);
});
