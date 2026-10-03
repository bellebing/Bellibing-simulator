import {readFileSync,writeFileSync} from 'node:fs';
import {extractDprLegacyStatReferences,captureDprLegacyNativeSource} from '../src/dprLegacyStatExtraction.ts';
import type {LegacyNativeSnapshot} from '../src/dprLegacyStatExtraction.ts';
import {DPR_CHARACTER_STAT_EXTRACTION} from '../src/data/dprCharacterStatReferences.ts';

const input=process.argv.includes('--input')?process.argv[process.argv.indexOf('--input')+1]!:
  'data/research/dpr-calc-legacy-native-source-snapshot-2026-10-03.json';
if(process.argv.includes('--native-input')&&!process.argv.includes('--inventory-input'))
  throw new Error('--native-input requires complete --inventory-input metadata.');
const snapshot: LegacyNativeSnapshot=process.argv.includes('--native-input')
  ? captureDprLegacyNativeSource(
    JSON.parse(readFileSync(process.argv[process.argv.indexOf('--native-input')+1]!,'utf8')),
    JSON.parse(readFileSync(process.argv[process.argv.indexOf('--inventory-input')+1]!,'utf8')),
    process.argv.includes('--date')?process.argv[process.argv.indexOf('--date')+1]!:'2026-10-03')
  : JSON.parse(readFileSync(input,'utf8'));
if(process.argv.includes('--capture-output'))writeFileSync(process.argv[process.argv.indexOf('--capture-output')+1]!,
  JSON.stringify(snapshot,null,2)+'\n');
const extraction=await extractDprLegacyStatReferences(snapshot,DPR_CHARACTER_STAT_EXTRACTION);
const json=JSON.stringify(extraction,null,2)+'\n';
const module="// Generated V2 semantic manifest and legacy references. V1 modern data remains independent.\n"
  +"import type { DprLegacyExtraction } from '../dprLegacyStatExtraction.ts';\n"
  +'export const DPR_LEGACY_STAT_EXTRACTION = '+JSON.stringify(extraction,null,2)+' as const satisfies DprLegacyExtraction;\n';
for(const [path,contents] of [
  ['data/research/dpr-calc-legacy-stat-references-2026-10-03.json',json],
  ['src/data/dprLegacyStatReferences.ts',module],
]) {
  if(process.argv.includes('--check')) {
    if(readFileSync(path!,'utf8')!==contents)throw new Error('DPR V2 extraction/module parity failed: '+path);
  } else writeFileSync(path!,contents!);
}
console.log(JSON.stringify({semanticSha256:extraction.semanticSha256,...extraction.counts,
  issues:extraction.issues.map(i=>({sheet:i.sheetTitle,range:i.sourceRange,reason:i.reason}))}));
