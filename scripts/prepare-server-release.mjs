// Source preparation only. Never deploys, contacts a backend or grants approval.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {sandboxRelease,validateSandboxRelease} from './sandbox-release.mjs';
export function prepareServerRelease(plan,approval){
 if(plan?.version!==1||plan.status!=='PENDING_RELEASE_GO'||plan.candidate?.review!==null)throw Error('INVALID_RELEASE_PLAN');
 if(typeof approval!=='string'||!/^owner-go:[a-zA-Z0-9_-]{1,80}$/.test(approval))throw Error('OWNER_RELEASE_GO_REQUIRED');
 return validateSandboxRelease({...plan.candidate,review:approval});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const plan=JSON.parse(readFileSync(new URL('./sandbox-server-release-plan.json',import.meta.url)));
 const args=process.argv.slice(2);
 if(args.length===1&&args[0]==='--check'){
  prepareServerRelease(plan,'owner-go:validation-only');
  console.log(JSON.stringify({plan:plan.status,active:sandboxRelease().status,endpoint:plan.candidate.endpoint}));
 }else if(args.length===3&&args[0]==='--write'&&args[1]==='--approval'){
  if(sandboxRelease().status!=='PENDING_REVIEW')throw Error('RELEASE_ALREADY_CONFIGURED');
  writeFileSync(new URL('./sandbox-release-approval.json',import.meta.url),JSON.stringify(prepareServerRelease(plan,args[2]),null,2)+'\n');
 }else throw Error('Use --check or --write --approval owner-go:<approval-reference> after owner GO');
}
