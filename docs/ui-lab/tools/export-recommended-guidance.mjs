import {readFileSync,writeFileSync} from 'node:fs';
import {CHARACTER_GUIDE_RECOMMENDATIONS} from '../../../src/data/characterEquipmentAssociations.ts';
import {sourcePriorityGuidance} from '../../../src/characterPriorityGuidance.mjs';
const characters=CHARACTER_GUIDE_RECOMMENDATIONS.map(sourcePriorityGuidance);
const output=JSON.stringify({schemaVersion:1,owner:'REVIEWED_GUIDE_PRIORITY_PRESENTATION',characters},null,2)+'\n';
const path=new URL('../v1.1/modules/source-priorities.json',import.meta.url);
if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==output)throw Error('Source priority projection stale');}else writeFileSync(path,output);
console.log('Source priority guidance: '+characters.length+' Characters; no thresholds or required Flex count inferred.');
