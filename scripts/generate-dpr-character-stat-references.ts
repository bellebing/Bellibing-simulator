import { readFileSync, writeFileSync } from 'node:fs';
import { extractDprCharacterStatReferences } from '../src/dprCharacterStatExtraction.ts';
import type { NativeDprSnapshot } from '../src/dprCharacterStatExtraction.ts';
import { captureDprNativeSource } from '../src/dprNativeSourceCapture.ts';

const input = process.argv.includes('--input') ? process.argv[process.argv.indexOf('--input') + 1]! :
  'data/research/dpr-calc-native-source-snapshot-2026-10-03.json';
const snapshot: NativeDprSnapshot = process.argv.includes('--native-input')
  ? captureDprNativeSource(JSON.parse(readFileSync(process.argv[process.argv.indexOf('--native-input')+1]!,'utf8')),
    process.argv.includes('--date') ? process.argv[process.argv.indexOf('--date')+1]! : '2026-10-03')
  : JSON.parse(readFileSync(input, 'utf8'));
if (process.argv.includes('--capture-output')) writeFileSync(process.argv[process.argv.indexOf('--capture-output')+1]!,
  JSON.stringify(snapshot,null,2)+'\n');
const extraction = await extractDprCharacterStatReferences(snapshot);
const json = JSON.stringify(extraction,null,2)+'\n';
const module = "// Generated semantic extraction; regenerate with scripts/generate-dpr-character-stat-references.ts.\n"
  + "import type { DprExtraction } from '../dprCharacterStatExtraction.ts';\n"
  + 'export const DPR_CHARACTER_STAT_EXTRACTION = '+JSON.stringify(extraction,null,2)+' as const satisfies DprExtraction;\n';
for (const [path,contents] of [
  ['data/research/dpr-calc-character-stat-references-2026-10-03.json',json],
  ['src/data/dprCharacterStatReferences.ts',module],
]) {
  if (process.argv.includes('--check')) {
    if (readFileSync(path!,'utf8') !== contents) throw new Error('DPR semantic extraction parity failed: '+path);
  } else writeFileSync(path!,contents!);
}
console.log(JSON.stringify({semanticSha256:extraction.semanticSha256,...extraction.counts,issues:extraction.issues}));
