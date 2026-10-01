import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {createCharacterBuilderAssetResolver} from '../src/characterBuilderAssets.ts';
import {projectSequenceCharacter,sequenceSourceText} from '../src/characterSequenceUi.mjs';

const manifest=JSON.parse(readFileSync('docs/ui-prototypes/assets/builder-icons/manifest.json','utf8'));
const source=JSON.parse(readFileSync('data/source/character-sequence-ui.json','utf8'));
const resolver=createCharacterBuilderAssetResolver(manifest);
const sourceById=new Map(source.characters.map(character=>[character.characterId,character]));
const projected=[...resolver.listCharacterIds()].map(id=>projectSequenceCharacter(sourceById.get(id),resolver.resolve(id)));

test('all released Characters expose source-backed S1-S6 identity, title, description and canonical icon mapping',()=>{
  assert.equal(projected.length,57);
  let chains=0;
  for(const character of projected){
    const assets=resolver.resolve(character.characterId);assert.ok(assets);
    const raw=sourceById.get(character.characterId);assert.ok(raw);
    assert.equal(character.status,'SOURCE_BACKED',character.characterId);
    assert.deepEqual(character.chains.map(chain=>chain.sequence),[1,2,3,4,5,6]);
    for(const chain of character.chains){
      chains++;
      const asset=assets.chains[chain.sequence-1],row=raw.chains.find(candidate=>candidate.sourceChainId===chain.sourceChainId);
      assert.ok(row,character.characterId+' S'+chain.sequence);
      assert.equal(chain.sourceChainId,asset.sourceChainId);
      assert.equal(chain.assetId,asset.assetId);
      assert.equal(chain.assetPath,asset.assetPath);
      assert.equal(chain.contentStatus,'SOURCE_BACKED');
      assert.equal(chain.name,sequenceSourceText(row.name,[]));
      assert.equal(chain.description,sequenceSourceText(row.descriptionTemplate,row.params));
      assert.ok(chain.name&&chain.description);
      const manifestAsset=manifest.assets.find(candidate=>candidate.assetId===chain.assetId);
      assert.equal(manifestAsset.sourceKey,'wuwabuild');
      assert.equal(manifestAsset.sourcePath,'public'+row.icon);
    }
  }
  assert.equal(chains,342);
});

test('safe source formatting substitutes only source params and removes markup without paraphrasing',()=>{
  const aalto=sourceById.get('aalto'),row=aalto.chains[0];
  assert.equal(row.sourceChainId,67);
  assert.equal(row.name,"Trickster's Opening Show");
  assert.equal(sequenceSourceText(row.descriptionTemplate,row.params),'The cooldown of Resonance Skill Shift Trick is reduced by 4s.');
  const multiline='First <color=Highlight>Line</color> {0}.\n\nSecond <te href=1>Line</te>.';
  assert.equal(sequenceSourceText(multiline,['10%']),'First Line 10%.\n\nSecond Line.');
});

test('missing or unresolved Sequence content fails closed to Pending without falling back to manifest wording',()=>{
  const assets=resolver.resolve('aalto');assert.ok(assets);
  const missing=structuredClone(sourceById.get('aalto'));
  missing.chains[0].descriptionTemplate='';
  missing.chains[1].name='';
  missing.chains[2].descriptionTemplate='Missing {1}';
  missing.chains[2].params=['only-zero'];
  missing.chains.splice(3,1);
  const out=projectSequenceCharacter(missing,assets);
  assert.equal(out.status,'PARTIAL');
  for(const index of [0,1,2,3])assert.equal(out.chains[index].contentStatus,'PENDING');
  assert.equal(out.chains[1].name,null);
  assert.equal(out.chains[3].description,null);
});

test('sourceChainId and S-number drift fail closed instead of remapping by title',()=>{
  const assets=resolver.resolve('augusta');assert.ok(assets);
  const wrong=structuredClone(sourceById.get('augusta'));
  wrong.chains[0].sequence=2;
  assert.throws(()=>projectSequenceCharacter(wrong,assets),/Sequence identity mismatch/);
  const duplicate=structuredClone(sourceById.get('augusta'));
  duplicate.chains[1].sourceChainId=duplicate.chains[0].sourceChainId;
  assert.throws(()=>projectSequenceCharacter(duplicate,assets),/Duplicate\/invalid sourceChainId/);
});

test('current text pin keeps explicit title drift separate from older asset-manifest metadata',()=>{
  const rover=projected.find(c=>c.characterId==='rover-electro');
  const suisui=projected.find(c=>c.characterId==='suisui');
  const xuanling=projected.find(c=>c.characterId==='yangyang-xuanling');
  assert.equal(rover.chains[5].name,"Mind's Depths in a Casket");
  assert.equal(resolver.resolve('rover-electro').chains[5].name,'Mind’s Depths in a Casket');
  assert.equal(suisui.chains[3].name,'Autumn Mountains in Choir Sing');
  assert.equal(xuanling.chains[5].name,'Let the Azure Keep Its Light');
  assert.match(xuanling.chains[5].description,/Still as Withered Wood has a Cooldown of 25s\.$/);
});
