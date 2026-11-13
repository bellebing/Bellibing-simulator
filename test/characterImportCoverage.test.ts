import test from 'node:test';
import assert from 'node:assert/strict';
import {characterImportCoverage} from '../src/characterImportCoverage.mjs';
import {CHARACTER_CATALOG} from '../src/data/characters.ts';
import {CHARACTER_ORIGINAL_RELEASE} from '../src/characterOriginalRelease.mjs';

const publishedEvidence={lily:{name:'Lily',identity:{rarity:5,element:'Spectro',weaponType:'Pistols'},
  originalPatch:'3.8',originalDate:'2026-11-12',
  sourceUrls:['https://wutheringwaves.kurogames.com/m/en/main/news/detail/5705']}};
function fixture(id='lily'){
 return {rawCatalog:CHARACTER_CATALOG,originalRelease:CHARACTER_ORIGINAL_RELEASE,
  publishedEvidence, builderManifest:{characters:[]},forteSource:{characters:[]},
  sequenceSource:{characters:[]},buildStats:{characters:[]},skillsRuntime:{characters:[]},
  sequenceRuntime:{characters:[]},portraitManifest:{portraits:[]},heroRuntime:{characters:[]},
  uiCatalog:[],recommendations:null,improveConfiguration:null};
}
test('Lily source projection never impersonates a canonical Character or fills missing gameplay facts',()=>{
 const row=characterImportCoverage('lily',fixture(),{asOf:'2026-11-13'});
 assert.equal(row.catalogPresence,'MISSING');
 assert.equal(row.characterUsable,'PENDING');
 assert.equal(row.dpsReady,'PENDING');
 assert.equal(row.release.originalPatch,'3.8');
 assert.equal(row.publishedEvidence.identity.weaponType,'Pistols');
 assert.equal(row.checks.canonicalIdentity.status,'PENDING');
 assert.equal(row.checks.level90.status,'PENDING');
 assert.equal(row.checks.heroArt.status,'PENDING');
});
test('Hsin has canonical source raw and date, but missing Build source assets is not a usable import',()=>{
 const row=characterImportCoverage('hsin',fixture('hsin'),{asOf:'2026-11-13'});
 assert.equal(row.catalogPresence,'EXISTS');
 assert.equal(row.checks.releasedAndVerified.status,'PASS');
 assert.equal(row.checks.level90.status,'PASS');
 assert.equal(row.checks.sourceAssets.status,'PENDING');
 assert.equal(row.characterUsable,'PENDING');
 assert.equal(row.dpsReady,'PENDING');
});
test('Suoming is not silently promoted just because the pinned original release day passed',()=>{
 const row=characterImportCoverage('suoming',fixture('suoming'),{asOf:'2026-11-13'});
 assert.equal(row.catalogPresence,'EXISTS');
 assert.equal(row.release.releaseNeedsReview,true);
 assert.equal(row.checks.releasedAndVerified.status,'PENDING');
 assert.equal(row.checks.level90.status,'PENDING');
 assert.equal(row.characterUsable,'PENDING');
});
test('duplicate IDs fail closed even if otherwise source-supported',()=>{
 const raw=CHARACTER_CATALOG.find(row=>row.id==='hsin');
 const data={...fixture(),rawCatalog:[...CHARACTER_CATALOG,raw]};
 const row=characterImportCoverage('hsin',data,{asOf:'2026-11-13'});
 assert.equal(row.catalogPresence,'DUPLICATE');
 assert.ok(row.duplicateIds.includes('hsin'));
 assert.equal(row.characterUsable,'PENDING');
});
test('complete source/projected fixtures still require actual browser and private execution proof',()=>{
 const raw=CHARACTER_CATALOG.find(row=>row.id==='hsin');
 const evidence=fixture();
 evidence.rawCatalog=[raw];
 evidence.builderManifest={characters:[{characterId:'hsin',chains:[{},{}],skills:{normal:{assetId:'x'}}}]};
 evidence.forteSource={characters:[{characterId:'hsin',tree:Array(16).fill({})}]};
 evidence.sequenceSource={characters:[{characterId:'hsin',chains:Array(6).fill({})}]};
 evidence.buildStats={characters:[{characterId:'hsin'}]};
 evidence.skillsRuntime={characters:[{characterId:'hsin',status:'SOURCE_BACKED',nodes:[{}]}]};
 evidence.sequenceRuntime={characters:[{characterId:'hsin',chains:Array(6).fill({contentStatus:'SOURCE_BACKED'})}]};
 evidence.portraitManifest={portraits:[{characterId:'hsin',uiEligible:true}]};
 evidence.heroRuntime={characters:[{characterId:'hsin',status:'READY',assetPath:'assets/characters/hero-art/hsin.webp',presentation:{scale:1}}]};
 evidence.uiCatalog=[{id:'hsin',element:raw.element,weaponType:raw.weaponType,art:'portrait.png'}];
 evidence.recommendations={sourceUrl:'https://example.org/review'};
 evidence.improveConfiguration={sourceUrl:'https://example.org/review'};
 const candidate=characterImportCoverage('hsin',evidence,{asOf:'2026-11-13'});
 assert.deepEqual(candidate.gaps,[]);
 assert.equal(candidate.characterUsable,'PENDING');
 assert.equal(candidate.characterUsableReason,'LIVE_CHROMIUM_AND_ACCOUNT_VERIFICATION_PENDING');
 assert.equal(candidate.dpsReady,'PENDING');
 const tested=characterImportCoverage('hsin',evidence,{asOf:'2026-11-13',browserVerified:true});
 assert.equal(tested.characterUsable,'CHARACTER_USABLE');
 assert.equal(tested.dpsReady,'PENDING');
});
