import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { FACTORY_PROVIDER_REGISTRY } from '../src/factory/evidence.ts';

const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const kit=read('data/factory/character-truth/prydwen-character-truth.json');
const progression=read('data/factory/character-truth/prydwen-progression-truth.json');
const wgg=read('data/factory/character-truth/wuthering-gg-character-truth.json');
const report=read('data/factory/character-truth/character-truth-reconciliation.json');

const catalogIds=CHARACTER_CATALOG.map(character=>character.id).sort();
const countStatus=(rows:any[])=>rows.reduce((out:any,row:any)=>{out[row.captureStatus]=(out[row.captureStatus]??0)+1;return out},{});
const forbidden=new Set(['recommendations','ratings','teams','rotations','builds','bestWeapons','echoRecommendations','weaponRecommendations','roleLeads']);

function assertProviderRows(payload:any){
  assert.equal(payload.canonicalAuthority,false);
  assert.equal(payload.promotionPolicy,'MANUAL_SOURCE_VALIDATION_REQUIRED');
  assert.equal(payload.characters.length,60);
  assert.deepEqual(payload.characters.map((row:any)=>row.bellibingCharacterId).sort(),catalogIds);
  assert.equal(new Set(payload.characters.map((row:any)=>row.bellibingCharacterId)).size,60);
  for(const row of payload.characters){
    assert.equal(typeof row.providerCharacterId,'string',row.bellibingCharacterId);
    assert.ok(row.providerCharacterId.length>0,row.bellibingCharacterId);
    assert.ok(row.sourceUrl?.startsWith('http'),row.bellibingCharacterId);
    for(const key of forbidden) assert.equal(Object.hasOwn(row,key),false,`${row.bellibingCharacterId} leaked ${key}`);
  }
}

test('all provider snapshots bind exactly to the 60-Character Bellibing roster without recommendation fields',()=>{
  assertProviderRows(kit);
  assertProviderRows(progression);
  assertProviderRows(wgg);
});

test('provider capture coverage is locked to observed snapshot results',()=>{
  assert.deepEqual(countStatus(kit.characters),{CAPTURED:59,PARTIAL:1});
  assert.deepEqual(countStatus(progression.characters),{CAPTURED:52,PARTIAL:8});
  assert.deepEqual(countStatus(wgg.characters),{CAPTURED:60});
  const partialKit=kit.characters.filter((row:any)=>row.captureStatus==='PARTIAL');
  assert.deepEqual(partialKit.map((row:any)=>row.bellibingCharacterId),['suoming']);
  assert.ok(partialKit[0].warnings.length>0);
  assert.deepEqual(
    progression.characters.filter((row:any)=>row.captureStatus==='PARTIAL').map((row:any)=>row.bellibingCharacterId).sort(),
    ['denia','hsin','jingran','qingxiao','rover-electro','suisui','suoming','yangyang-xuanling'].sort(),
  );
});

test('Wuthering.gg progression and S1-S6 structure is complete for all mapped identities',()=>{
  for(const row of wgg.characters){
    assert.equal(row.captureStatus,'CAPTURED',row.bellibingCharacterId);
    assert.ok([4,5].includes(row.identity.rarity),row.bellibingCharacterId);
    assert.ok(['Glacio','Fusion','Electro','Aero','Spectro','Havoc'].includes(row.identity.element),row.bellibingCharacterId);
    assert.ok(['Broadblade','Sword','Pistols','Gauntlets','Rectifier'].includes(row.identity.weaponType),row.bellibingCharacterId);
    for(const field of ['hp','atk','def','maxResonanceEnergy']) assert.equal(typeof row.level90[field],'number',`${row.bellibingCharacterId} ${field}`);
    assert.equal(row.sequenceNames.length,6,row.bellibingCharacterId);
    assert.equal(new Set(row.sequenceNames).size,6,row.bellibingCharacterId);
  }
});

test('Prydwen captured kit rows preserve complete S1-S6 and factual Lv1-Lv10 tables',()=>{
  let level10Tables=0;
  let completeSequenceCharacters=0;
  for(const row of kit.characters){
    if(row.sequences.length===6) completeSequenceCharacters++;
    if(row.captureStatus==='CAPTURED') assert.equal(row.sequences.length,6,row.bellibingCharacterId);
    for(const skill of Object.values(row.skills??{}) as any[]){
      if(skill && Object.keys(skill.multiplierTextByLevel??{}).length===10) level10Tables++;
    }
  }
  assert.equal(completeSequenceCharacters,59);
  assert.equal(level10Tables,295);
});

test('Prydwen progression keeps explicit source-unavailable stats as partial rather than guessing',()=>{
  for(const row of progression.characters.filter((candidate:any)=>candidate.captureStatus==='PARTIAL')){
    assert.ok(row.identity?.rarity,row.bellibingCharacterId);
    assert.equal(row.level90,null,row.bellibingCharacterId);
    assert.deepEqual(row.warnings,['source explicitly reports Stats unavailable'],row.bellibingCharacterId);
  }
});

test('reconciliation retains consensus and conflicts without canonical promotion',()=>{
  assert.equal(report.canonicalAuthority,false);
  assert.equal(report.promotionPolicy,'MANUAL_SOURCE_VALIDATION_REQUIRED');
  assert.deepEqual(report.providers,['prydwen-profile-source','wuthering-gg']);
  assert.deepEqual(report.roster.freshnessSensitive,['hsin','jingran','suoming']);
  assert.deepEqual(report.sourceCoverage.prydwenKit,{CAPTURED:59,PARTIAL:1});
  assert.deepEqual(report.sourceCoverage.prydwenProgression,{CAPTURED:52,PARTIAL:8});
  assert.deepEqual(report.sourceCoverage.wutheringGg,{CAPTURED:60});
  assert.equal(report.sourceCoverage.completeSixSequenceCharacters,59);
  assert.equal(report.sourceCoverage.completeLevel10SkillTables,295);
  assert.deepEqual(report.evidence.stateCounts,{
    CAPTURED_ONE_PROVIDER:1114,
    CONSENSUS_TWO_PROVIDERS:374,
    PROVIDER_CONFLICT:134,
  });
  assert.equal(report.evidence.conflictRows.length,134);
  for(const row of report.reconciliation){
    if(row.factoryEvidence) assert.equal(row.factoryEvidence.canonicalPromotion,'MANUAL_SOURCE_VALIDATION_REQUIRED');
    if(row.evidenceState==='PROVIDER_CONFLICT') assert.ok(new Set(row.providerFacts.map((fact:any)=>JSON.stringify(fact.value))).size>1);
  }
});

test('all Character truth report providers are admitted by the existing Factory provider registry',()=>{
  const registry=new Map(FACTORY_PROVIDER_REGISTRY.map(provider=>[provider.providerId,provider]));
  for(const providerId of report.providers){
    const provider=registry.get(providerId);
    assert.ok(provider,`unregistered Character truth provider: ${providerId}`);
    assert.equal(provider.enabledForFactoryEvidence,true,providerId);
    assert.equal(provider.canonicalAuthority,false,providerId);
    assert.notEqual(provider.dataUsePolicy,'REFERENCE_ONLY_NO_REUSE',providerId);
  }
  const wggProvider=registry.get('wuthering-gg');
  assert.ok(wggProvider);
  assert.equal(wggProvider.sourceType,'WEB_EXTRACTION');
  assert.equal(wggProvider.licenseStatus,'REVIEW_REQUIRED');
  assert.equal(wggProvider.licenseId,null);
  assert.equal(wggProvider.dataUsePolicy,'EVIDENCE_ONLY');
});

test('Character truth provenance keeps capture time separate from provider source version',()=>{
  for(const row of report.reconciliation){
    for(const fact of row.providerFacts){
      assert.equal(fact.sourceVersion,null,`${fact.providerId} ${fact.bellibingCharacterId} ${fact.family}:${fact.factId}`);
      assert.equal(typeof fact.capturedAt,'string');
      assert.ok(fact.capturedAt.length>0);
    }
    for(const candidate of row.factoryEvidence?.candidates??[]){
      assert.equal(candidate.sourceVersion,null,`${candidate.providerId} ${candidate.subjectId} ${candidate.fieldId}`);
      assert.equal(typeof candidate.capturedAt,'string');
      assert.ok(candidate.capturedAt.length>0);
    }
  }
});

test('canonical comparison remains report-only and raw Character readiness is unchanged',()=>{
  assert.deepEqual(report.canonicalDelta.stateCounts,{
    CONFLICT:149,
    EXACT_AGREEMENT:658,
    NOT_COMPARABLE:782,
    PROVIDER_ONLY:33,
  });
  assert.equal(CHARACTER_CATALOG.length,60);
  assert.ok(CHARACTER_CATALOG.every(character=>character.integrationStatus==='DATA_ONLY'));
  assert.deepEqual(
    CHARACTER_CATALOG.filter(character=>character.releaseStatus!=='RELEASED').map(character=>character.id),
    ['suoming'],
  );
});
