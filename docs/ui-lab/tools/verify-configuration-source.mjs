import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CANONICAL_CONFIGURATION_SOURCE} from '../../../src/simulationConfigurationBridge.mjs';
const git=args=>execFileSync('git',args,{encoding:'utf8',maxBuffer:4*1024*1024}).trim();
const rows=git(['ls-tree','-r',CANONICAL_CONFIGURATION_SOURCE,'--','src']).split('\n');
for(const row of rows){const [info,path]=row.split('\t');const [mode,type,expected]=info.split(' ');if(type!=='blob'||!['100644','100755'].includes(mode))throw Error('Unsupported canonical source entry');const bytes=readFileSync(path);const actual=createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');if(actual!==expected)throw Error('Configuration canonical source drift: '+path);}
console.log(`Configuration source parity: ${rows.length} original canonical source files match ${CANONICAL_CONFIGURATION_SOURCE}. New bridge/UI files are separate, not a source-pin retarget.`);
