import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {createCharacterBuilderAssetResolver} from '../src/characterBuilderAssets.ts';
import {FORTE_COLUMNS,projectForteCharacter,normalizeForteState,updateForteNode,forteNodeActive,forteStats,forteValue,sourceText} from '../src/characterForteUi.mjs';
import {CHARACTER_CATALOG} from '../src/data/characters.ts';
const source=JSON.parse(readFileSync('data/source/character-forte-ui.json','utf8'));
const manifest=JSON.parse(readFileSync('docs/ui-prototypes/assets/builder-icons/manifest.json','utf8'));
const resolver=createCharacterBuilderAssetResolver(manifest);
const trees=source.characters.map(c=>projectForteCharacter(c,resolver.resolve(c.characterId),manifest));
const tree=trees.find(c=>c.characterId==='augusta');
test('all released trees preserve per-Character game node IDs, parents, coordinates, text, and ten original level values',()=>{
  assert.equal(trees.length,57);
  for(const t of trees){
    const s=source.characters.find(c=>c.characterId===t.characterId);
    assert.equal(t.nodes.length,16);assert.equal(t.nodes.filter(n=>n.kind==='stat').length,8);
    for(const n of t.nodes){
      const raw=s.tree.find(r=>r.Id===n.sourceNodeId);
      assert.deepEqual(n.parents,raw.ParentNodes.map(String));assert.equal(n.coordinate,raw.Coordinate);
      assert.ok(n.description&&!n.description.includes('{0}'),t.characterId+':'+n.role);
      if(n.kind==='skill'){assert.equal(n.column,FORTE_COLUMNS.indexOf(n.role));for(const v of n.values){assert.equal(v.levels?.length,10);assert.deepEqual(v.levels,s.moves.find(m=>m.id===n.sourceSkillId).values.find(r=>r.id===v.id).values.slice(0,10))}}
    }
    assert.equal(t.nodes.find(n=>n.role==='inherent-1').parents[0],'7');assert.equal(t.nodes.find(n=>n.role==='inherent-2').parents[0],'4');
    assert.equal(t.nodes.find(n=>n.role==='outro').column,-1);
  }
});
test('later nodes enable ancestors and disabling each root or middle cascades only to its descendants',()=>{
  for(const t of trees)for(const root of t.nodes.filter(n=>n.kind==='skill')){
    let state=normalizeForteState(t,null);state=updateForteNode(t,state,root.id,0);
    const middle=t.nodes.find(n=>n.parents.includes(root.id)),upper=t.nodes.find(n=>n.parents.includes(middle.id));
    assert.equal(forteNodeActive(t,state,middle.id),false);assert.equal(forteNodeActive(t,state,upper.id),false);
    state=updateForteNode(t,state,upper.id,true);
    assert.equal(state.levels[root.role],1);assert.equal(forteNodeActive(t,state,middle.id),true);assert.equal(forteNodeActive(t,state,upper.id),true);
    state=updateForteNode(t,state,middle.id,false);assert.equal(forteNodeActive(t,state,upper.id),false);assert.equal(state.levels[root.role],1);
    for(const other of t.nodes.filter(n=>n.kind==='skill'&&n.id!==root.id))assert.equal(state.levels[other.role],10);
  }
});
test('level zero has no source value; all five levels serialize independently without mutating input',()=>{
  let state=normalizeForteState(tree,null);const before=structuredClone(state);
  for(const [i,role] of FORTE_COLUMNS.entries())state=updateForteNode(tree,state,tree.nodes.find(n=>n.role===role).id,i);
  assert.deepEqual(before.levels,Object.fromEntries(FORTE_COLUMNS.map(r=>[r,10])));
  const restored=normalizeForteState(tree,JSON.parse(JSON.stringify(state)));assert.deepEqual(restored,state);
  assert.deepEqual(FORTE_COLUMNS.map(r=>restored.levels[r]),[0,1,2,3,4]);
  const row=tree.nodes.find(n=>n.role==='skill').values[0];assert.equal(forteValue(row,0),null);assert.equal(forteValue(row,1),'110%*3');assert.equal(forteValue(row,10),'218.7%*3');assert.equal(forteValue(row,11),null);
});
test('damaged persisted states do not restore disabled prerequisites or accept invalid levels',()=>{
  const saved={schemaVersion:1,levels:{skill:-1,circuit:NaN,intro:3.5},enabled:{'4':true,'5':true,'9':true,'13':true}};
  const state=normalizeForteState(tree,saved);assert.equal(state.levels.skill,0);assert.equal(state.levels.circuit,0);assert.equal(state.levels.intro,0);assert.equal(state.enabled['5'],false);assert.equal(state.enabled['13'],false);
});
test('missing descriptions remain pending; text formatting never fabricates missing parameters',()=>{
  assert.equal(sourceText(null),null);assert.equal(sourceText('Increase {1}.',['10%']),null);assert.equal(sourceText('<color=Title>Power</color>\nDeal {0}.',['10%']),'Power\nDeal 10%.');
  const c=structuredClone(source.characters[0]);c.moves.find(m=>m.type===1).description='';const out=projectForteCharacter(c,resolver.resolve(c.characterId),manifest);assert.equal(out.nodes.find(n=>n.role==='normal-attack').description,null);
  assert.equal(projectForteCharacter(null,resolver.resolve('aalto'),manifest).status,'PENDING');
});
test('topology and identity drift fail closed rather than guessing from stat totals',()=>{
  const asset=resolver.resolve('augusta'),original=source.characters.find(c=>c.characterId==='augusta');
  for(const mutate of [c=>c.tree[0].NodeGroup=0,c=>c.tree.find(n=>n.NodeIndex===4).ParentNodes=[999],c=>c.tree.find(n=>n.NodeIndex===4).ParentNodes=[5],c=>c.tree.find(n=>n.NodeIndex===9).ParentNodes=[2],c=>c.tree.find(n=>n.NodeIndex===7).SkillId=1,c=>c.tree.splice(0,1),c=>c.skillIcons.skill='bad']){
    const c=structuredClone(original);mutate(c);assert.throws(()=>projectForteCharacter(c,asset,manifest));
  }
});
test('different stat families are source-specific, including Mornye nonstandard DEF increments',()=>{
  const stats=id=>trees.find(t=>t.characterId===id).nodes.filter(n=>n.stat);
  assert.ok(stats('augusta').some(n=>n.stat.stat==='CRIT Rate'));
  assert.ok(stats('phoebe').some(n=>n.stat.stat==='CRIT DMG'));
  assert.ok(stats('baizhi').some(n=>n.stat.stat==='Healing Bonus'));
  assert.ok(stats('mornye').some(n=>n.stat.stat==='DEF%'&&n.valueText==='2.28%'));
  assert.ok(stats('aalto').some(n=>n.stat.stat==='Aero DMG'));
});

test('all-active Minor Forte stats reconcile to intrinsic totals except the explicit Mornye Healing Bonus conflict',()=>{
  const sum=rows=>{
    const out={};
    for(const row of rows)out[row.stat]=Number(((out[row.stat]??0)+row.value).toFixed(10));
    return out;
  };
  let exact=0;
  for(const t of trees){
    const character=CHARACTER_CATALOG.find(c=>c.id===t.characterId&&c.releaseStatus==='RELEASED');
    assert.ok(character,t.characterId);
    const active=forteStats(t,normalizeForteState(t,null));
    assert.equal(active.length,8,t.characterId);
    const forteTotal=sum(active),intrinsicTotal=sum(character.intrinsicStats);
    if(t.characterId==='mornye'){
      assert.deepEqual(forteTotal,{ 'Healing Bonus':0.12,'DEF%':0.152 });
      assert.deepEqual(intrinsicTotal,{ 'Healing Bonus':0.1,'DEF%':0.152 });
    }else{
      assert.deepEqual(forteTotal,intrinsicTotal,t.characterId);
      exact++;
    }
  }
  assert.equal(exact,56);
});
