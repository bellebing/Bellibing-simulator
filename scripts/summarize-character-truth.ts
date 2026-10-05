import { readFileSync, writeFileSync } from 'node:fs';

const read = (path: string) => JSON.parse(readFileSync(path,'utf8'));
const report=read('data/factory/character-truth/character-truth-reconciliation.json');
const kit=read('data/factory/character-truth/prydwen-character-truth.json');
const progression=read('data/factory/character-truth/prydwen-progression-truth.json');
const wgg=read('data/factory/character-truth/wuthering-gg-character-truth.json');

const countBy=(rows,fn)=>{
  const out={};
  for(const row of rows){const key=fn(row);out[key]=(out[key]??0)+1}
  return Object.fromEntries(Object.entries(out).sort(([a],[b])=>a.localeCompare(b)));
};
const expectedSkills=['basicAttack','resonanceSkill','resonanceLiberation','forteCircuit','inherentSkill1','inherentSkill2','introSkill','outroSkill'];
const kitGaps=kit.characters.filter(c=>c.captureStatus!=='CAPTURED').map(c=>({
  characterId:c.bellibingCharacterId,status:c.captureStatus,warnings:c.warnings,
  skillKeys:Object.entries(c.skills??{}).filter(([,v])=>v!==null).map(([k])=>k),
  missingExpectedSkills:expectedSkills.filter(k=>!c.skills?.[k]),
  level10SkillKeys:Object.entries(c.skills??{}).filter(([,v])=>v&&Object.keys(v.multiplierTextByLevel??{}).length===10).map(([k])=>k),
  sequenceCount:c.sequences?.length??0,
}));
const progressionGaps=progression.characters.filter(c=>c.captureStatus!=='CAPTURED').map(c=>({
  characterId:c.bellibingCharacterId,status:c.captureStatus,warnings:c.warnings,identity:c.identity,level90:c.level90,
}));
const wggGaps=wgg.characters.filter(c=>c.captureStatus!=='CAPTURED').map(c=>({
  characterId:c.bellibingCharacterId,status:c.captureStatus,warnings:c.warnings,
}));
const conflicts=report.evidence.conflictRows;
const canonicalRows=report.canonicalDelta.rows;
const output={
  schemaVersion:1,
  kind:'CHARACTER_TRUTH_AUDIT_SUMMARY',
  canonicalAuthority:false,
  roster:report.roster,
  providerCapture:{
    prydwenKit:report.sourceCoverage.prydwenKit,
    prydwenProgression:report.sourceCoverage.prydwenProgression,
    wutheringGg:report.sourceCoverage.wutheringGg,
  },
  skills:{
    completeSixSequenceCharacters:report.sourceCoverage.completeSixSequenceCharacters,
    completeLevel10SkillTables:report.sourceCoverage.completeLevel10SkillTables,
    kitGaps,
  },
  progression:{gaps:progressionGaps,wutheringGgGaps:wggGaps},
  evidence:{
    factCount:report.evidence.factCount,
    stateCounts:report.evidence.stateCounts,
    conflictByFamily:countBy(conflicts,r=>r.family),
    conflictByFact:countBy(conflicts,r=>r.family+':'+r.factId),
    conflictCharacters:[...new Set(conflicts.map(r=>r.characterId))].sort(),
    conflictRows:conflicts,
  },
  canonicalDelta:{
    stateCounts:report.canonicalDelta.stateCounts,
    byFamilyAndState:countBy(canonicalRows,r=>r.family+':'+r.state),
    conflictByFact:countBy(canonicalRows.filter(r=>r.state==='CONFLICT'),r=>r.family+':'+r.factId),
    providerOnlyByFact:countBy(canonicalRows.filter(r=>r.state==='PROVIDER_ONLY'),r=>r.family+':'+r.factId),
  },
};
writeFileSync('data/factory/character-truth/character-truth-audit-summary.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
