// Public release record: only exact reviewed bytes may extend the artifact allowlist.
import {readFileSync,copyFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
export function sandboxRelease(){
 const record=JSON.parse(readFileSync(new URL('./sandbox-release-approval.json',import.meta.url)));
 if(record.status==='PENDING_REVIEW'){if(record.files.length)throw Error('Unapproved Sandbox files');return record;}
 if(record.status!=='APPROVED_FOR_PUBLICATION'||record.files.length!==1||record.files[0].path!=='sandbox-engine.worker.js'||!/^[a-f0-9]{64}$/.test(record.files[0].sha256)||!record.review)throw Error('Invalid reviewed Sandbox release');return record;
}
export function installSandboxRelease(out){const record=sandboxRelease();if(record.status==='APPROVED_FOR_PUBLICATION')for(const file of record.files){const bytes=readFileSync(resolve('web/sandbox-release',file.path));if(createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error('Sandbox release bytes mismatch');copyFileSync(resolve('web/sandbox-release',file.path),join(out,file.path));}writeFileSync(join(out,'engine-release.json'),JSON.stringify(record)+'\n');}
export function verifySandboxRelease(directory){const record=sandboxRelease();if(JSON.stringify(JSON.parse(readFileSync(resolve(directory,'sandbox/engine-release.json'))))!==JSON.stringify(record))throw Error('Public Sandbox release record mismatch');return record.files.map(file=>{const p='sandbox/'+file.path,bytes=readFileSync(resolve(directory,p));if(createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error('Sandbox artifact release mismatch');return p;});}
