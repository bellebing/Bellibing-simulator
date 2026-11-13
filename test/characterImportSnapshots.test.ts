import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTER_CATALOG} from '../src/data/characters.ts';
import {CHARACTER_ORIGINAL_RELEASE} from '../src/characterOriginalRelease.mjs';
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const pins=read('data/research/character-import/source-pins/3.8.json');
test('61 canonical RELEASED Characters are unique, with source-backed new identities',()=>{
 const released=CHARACTER_CATALOG.filter(row=>row.releaseStatus==='RELEASED');
 assert.equal(released.length,61);
 assert.equal(new Set(CHARACTER_CATALOG.map(row=>row.id)).size,CHARACTER_CATALOG.length);
 assert.equal(CHARACTER_CATALOG.filter(row=>row.id==='lily').length,1);
 assert.equal(CHARACTER_CATALOG.find(row=>row.id==='suoming')?.releaseStatus,'RELEASED');
 assert.equal(CHARACTER_CATALOG.find(row=>row.id==='hsin')?.verificationStatus,'VERIFIED');
});
for(const [id,roleId,patch,date] of [['lily',1512,'3.8','2026-11-12'],['suoming',1312,'3.7','2026-10-22']]){
 test(id+' captured original kit provenance and source integrity remain noncanonical',()=>{
  const reviewed=read('data/research/character-import/'+id+'.json');
  const raw=read('data/research/character-import/'+id+'-captured.json');
  assert.equal(raw.characterId,id);
  assert.equal(raw.sourceRoleId,roleId);
  assert.equal(raw.canonicalAuthority,false);
  assert.equal(reviewed.sourceCapture.sourceRoleId,roleId);
  assert.equal(reviewed.kind,'EXTERNAL_RELEASE_IDENTITY_EVIDENCE_ONLY');
  assert.equal(raw.releasePatch,patch);
  assert.equal(raw.originalReleaseDate,date);
  assert.equal(CHARACTER_ORIGINAL_RELEASE[id]?.patch,patch);
  assert.equal(CHARACTER_ORIGINAL_RELEASE[id]?.date,date);
  assert.equal(raw.intrinsicSourceNodes.length,8);
  assert.equal(raw.forteTree.length,17);
  assert.equal(raw.skills.length,9);
  assert.equal(raw.sequences.length,6);
  assert.deepEqual(raw.sequences.map(row=>row.sequence),[1,2,3,4,5,6]);
  assert.ok(raw.skills.every(s=>s.values.every(v=>Array.isArray(v.levels)&&v.levels.length>=10)));
  assert.ok(raw.sourceArt.hero?.startsWith('/assets/'));
  assert.equal(Object.hasOwn(raw,'level90'),false);
  assert.equal(Object.hasOwn(raw,'dpsReady'),false);
  for(const group of Object.values(pins.sources)){
    for(const [name,pin] of Object.entries(group.blobs)){
      const row=raw.provenance[name];
      assert.equal(row.repository,group.repository);
      assert.equal(row.commit,group.commit);
      assert.equal(row.gitBlobSha,pin.sha);
      assert.equal(row.path,pin.path);
      assert.ok(Number.isInteger(row.sourceBytes)&&row.sourceBytes>0);
    }
  }
  assert.equal(raw.provenance.characters.sourceBytes,10627943,'true UTF-8 byte count');
 });
}
