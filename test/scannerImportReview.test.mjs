import test from 'node:test';
import assert from 'node:assert/strict';
import {formatScannerIssues,scannerIssueLabel} from '../src/scannerImportReview.mjs';

test('scanner review names all five Echo positions with human numbering',()=>{
 const issues=Array.from({length:5},(_,i)=>({path:'echoes.'+i+'.secondaryMainStat',message:'Exact tier required'}));
 const result=formatScannerIssues(issues);
 for(let i=1;i<=5;i++)assert.ok(result.includes('Echo '+i+' · Secondary Main Stat: Exact tier required'));
 assert.equal(result.split('; ').length,5);
});
test('review errors include main, substat position, global fields and never silently drop errors',()=>{
 const issues=[{path:'echoes.3.mainStat',message:'Name missing'},{path:'echoes.4.substats.2',message:'Tier unknown'},{path:'weapon.id',message:'Unknown weapon'}];
 assert.equal(formatScannerIssues(issues),'Echo 4 · Main Stat: Name missing; Echo 5 · Substat 3: Tier unknown; weapon.id: Unknown weapon');
 assert.equal(scannerIssueLabel('echoes.0.sonataId'),'Echo 1 · Sonata');
 assert.match(formatScannerIssues(null),/did not return issues/);
});
