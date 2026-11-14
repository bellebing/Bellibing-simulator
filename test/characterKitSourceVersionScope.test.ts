import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { readReviewedCharacterKitSources } from '../scripts/lib/character-kit-source.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';

test('3.7 mechanics source and 3.8 Character UI are independently pinned, with 61 unique released identities', () => {
  const original37 = JSON.parse(readFileSync('data/source/character-release-3.7.json','utf8'));
  const presentation = JSON.parse(readFileSync('data/source/character-forte-ui.json','utf8'));
  const reviewed = readReviewedCharacterKitSources().characters;
  const releasedIds = CHARACTER_CATALOG.filter(row => row.releaseStatus === 'RELEASED').map(row => row.id).sort();
  const reviewedIds = reviewed.map(row => row.characterId).sort();

  assert.equal(releasedIds.length,61);
  assert.deepEqual(reviewedIds,releasedIds,'each current released Character has exactly one source kit in this audit');
  assert.equal(new Set(reviewedIds).size,61,'duplicate Hsin after promotion is forbidden');

  // The 3.7 native Mechanics facts must never be reinterpreted using an
  // unreviewed 3.8 move-ID mapping, even though the 3.8 Build UI is available.
  for(const id of ['hsin','jingran']){
    const old=original37.characters.find(row => row.characterId===id);
    const audit=reviewed.find(row => row.characterId===id);
    assert.ok(old && audit,id);
    assert.deepEqual(audit.moves,old.skills.map(skill=>({
      id:skill.source.Id,type:skill.source.SkillType,name:skill.name,
    })),id+' retains exact immutable 3.7 Mechanics identity');
  }

  // New source-backed UI kits are not synthetic DPS models: they must match
  // the pinned 3.8 presentation bytes and remain unapproved for native DPS.
  for(const id of ['lily','suoming']){
    const ui=presentation.characters.find(row=>row.characterId===id);
    const audit=reviewed.find(row=>row.characterId===id);
    assert.ok(ui && audit,id);
    assert.deepEqual(audit.moves,ui.moves,id+' preserves original imported source moves');
    assert.equal(CHARACTER_CATALOG.find(row=>row.id===id)?.releaseStatus,'RELEASED');
  }
  assert.equal(presentation.characters.filter(row=>row.characterId==='hsin').length,1);
  for(const row of reviewed){
    assert.ok(row.moves.length>0,row.characterId+' missing original move source');
    assert.equal(row.moves.filter(move=>move.type===4).length,2,row.characterId+' two Inherent Skills');
    assert.equal(row.moves.filter(move=>move.type===11).length,1,row.characterId+' single Outro');
  }
});
