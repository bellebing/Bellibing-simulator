import {exportAccount,parseBackup} from './inventoryAccount.mjs';
const bytes=text=>new TextEncoder().encode(text);
const hex=buffer=>Array.from(new Uint8Array(buffer),b=>b.toString(16).padStart(2,'0')).join('');
export async function packAccount(account,catalog){
 const text=JSON.stringify(exportAccount(account,catalog)),data=bytes(text),chunks=[];
 // Split by code points so UTF-8 byte limits hold for user names too.
 let part='',size=0;for(const char of text){const n=bytes(char).length;if(size+n>180000){chunks.push(part);part='';size=0;}part+=char;size+=n;}if(part)chunks.push(part);
 return {chunks,byteLength:data.length,sha256:hex(await crypto.subtle.digest('SHA-256',data))};
}
export async function unpackAccount(manifest,chunks,catalog){
 if(manifest?.version!==1||!Number.isInteger(manifest.count)||manifest.count<1||manifest.count>100||chunks.length!==manifest.count||chunks.some(p=>typeof p!=='string'||bytes(p).length>180000))throw Error('Incomplete cloud backup.');
 const text=chunks.join(''),data=bytes(text);if(data.length!==manifest.byteLength||hex(await crypto.subtle.digest('SHA-256',data))!==manifest.sha256)throw Error('Cloud backup integrity check failed.');
 return parseBackup(text,catalog);
}
// Transport and authentication are injected. No login, external project or timer
// is activated by importing this module. Conflicts preserve both versions.
export function createAccountSync({store,catalog,remote,readUid}){
 let running=null,generation=0;
 const assertIdentity=(uid,token)=>{if(token!==generation||readUid()!==uid)throw Error('ACCOUNT_CHANGED');};
 const once=async()=>{
  if(!store.status().writable)return {status:'RECOVERY_REQUIRED'};
  const token=generation,uid=readUid(),binding=await store.syncBinding();
  if(!uid||binding?.uid!==uid)return {status:'UNLINKED'};
  const pending=await store.pendingSync();assertIdentity(uid,token);
  if(!pending){
   const local=store.snapshot(),head=await remote.head(uid);assertIdentity(uid,token);
   if(!head||head.revision<=binding.remoteRevision)return {status:'IDLE',head};
   if(head.accountId!==binding.accountId)return {status:'CONFLICT',reason:'CLOUD_ACCOUNT_REPLACED',remote:head};
   const result=await remote.read(uid);assertIdentity(uid,token);
   if(!result||result.head.revision<head.revision)throw Error('STALE_CLOUD_SNAPSHOT');
   const account=await unpackAccount(result.manifest,result.chunks,catalog);assertIdentity(uid,token);
   if(account.id!==binding.accountId||result.head.accountId!==account.id)throw Error('CLOUD_ACCOUNT_ID_MISMATCH');
   await store.applyCloud({uid,account,remoteRevision:result.head.revision,expectedRevision:local?.revision??null,expectedAccountId:local?.id??null});
   return {status:'DOWNLOADED',revision:result.head.revision};
  }
  if(pending.accountId!==binding.accountId)return {status:'CONFLICT',reason:'LOCAL_ACCOUNT_REPLACED'};
  const packed=await packAccount(pending.account,catalog);assertIdentity(uid,token);
  const result=await remote.publish(uid,{operationId:pending.operationId,accountId:pending.accountId,expectedRevision:binding.remoteRevision,...packed});
  assertIdentity(uid,token);
  if(result.status==='CONFLICT')return {status:'CONFLICT',local:pending,remote:result.head};
  await store.acknowledgeSync({uid,accountId:binding.accountId,operationId:pending.operationId,remoteRevision:result.revision});
  return {status:'SYNCED',revision:result.revision};
 };
 return {run(){if(!running)running=once().finally(()=>{running=null;});return running;},stop(){generation++;},
  async resolveConflict({choice,remoteRevision,localOperationId,approved=false}){
   if(!approved||!['LOCAL','CLOUD'].includes(choice))throw Error('EXPLICIT_CONFLICT_REVIEW_REQUIRED');
   const uid=readUid(),token=generation,binding=await store.syncBinding(),pending=await store.pendingSync(),local=store.snapshot();
   if(!uid||binding?.uid!==uid||pending?.operationId!==localOperationId)throw Error('STALE_CONFLICT_REVIEW');
   const result=await remote.read(uid);assertIdentity(uid,token);
   if(!result||result.head.revision!==remoteRevision||result.head.accountId!==binding.accountId)throw Error('STALE_CONFLICT_REVIEW');
   const account=await unpackAccount(result.manifest,result.chunks,catalog);assertIdentity(uid,token);
   if(account.id!==binding.accountId||(await store.pendingSync())?.operationId!==localOperationId)throw Error('STALE_CONFLICT_REVIEW');
   if(choice==='CLOUD')return store.applyCloud({uid,account,remoteRevision,approved:true,expectedRevision:local.revision,expectedAccountId:local.id});
   // The cloud before-version is immutable. Keep the local outbox and advance
   // only its reviewed base; publish still rechecks the cloud revision by CAS.
   await store.acknowledgeSync({uid,accountId:binding.accountId,operationId:'conflict-reviewed:'+localOperationId,remoteRevision});
   return {status:'LOCAL_SELECTED'};
  },
  async download(){const uid=readUid(),token=generation;if(!uid)throw Error('SIGN_IN_REQUIRED');const result=await remote.read(uid);assertIdentity(uid,token);if(!result)return null;return {head:result.head,account:await unpackAccount(result.manifest,result.chunks,catalog)};}};
}
