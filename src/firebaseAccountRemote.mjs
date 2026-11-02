import {doc,getDoc,getDocFromServer,setDoc,runTransaction,serverTimestamp,onSnapshot} from 'firebase/firestore';

// Firebase SDK handles authentication. This adapter owns only immutable account
// snapshots and a revision-checked pointer, never game policy or private data.
export function firebaseAccountRemote(db){
 const pointer=uid=>doc(db,'accounts',uid),snapshot=(uid,id)=>doc(db,'accounts',uid,'snapshots',id),chunk=(uid,id,i)=>doc(db,'accounts',uid,'snapshots',id,'chunks',String(i));
 const head=async uid=>{const r=await getDocFromServer(pointer(uid));return r.exists()?r.data():null;};
 return {head,subscribe:(uid,onChange,onError)=>onSnapshot(pointer(uid),onChange,onError),
  async publish(uid,{operationId,accountId,expectedRevision,chunks,byteLength,sha256}){
   const existing=await head(uid);
   if(existing?.snapshotId===operationId)return {status:'SYNCED',revision:existing.revision};
   if((existing?.revision??0)!==expectedRevision||existing&&existing.accountId!==accountId)return {status:'CONFLICT',head:existing};
   // Retrying an interrupted upload reuses immutable content, never overwrites it.
   for(let i=0;i<chunks.length;i++){const ref=chunk(uid,operationId,i),old=await getDocFromServer(ref);if(old.exists()){if(old.data().data!==chunks[i])throw Error('SNAPSHOT_ID_COLLISION');}else await setDoc(ref,{data:chunks[i]});}
   const ref=snapshot(uid,operationId),old=await getDocFromServer(ref);
   if(old.exists()){if(old.data().sha256!==sha256)throw Error('SNAPSHOT_ID_COLLISION');}
   else await setDoc(ref,{version:1,count:chunks.length,byteLength,sha256,accountId,createdAt:serverTimestamp()});
   return runTransaction(db,async tx=>{
    const value=await tx.get(pointer(uid)),current=value.exists()?value.data():null;
    if(current?.snapshotId===operationId)return {status:'SYNCED',revision:current.revision};
    if((current?.revision??0)!==expectedRevision||current&&current.accountId!==accountId)return {status:'CONFLICT',head:current};
    const revision=expectedRevision+1;tx.set(pointer(uid),{version:1,revision,snapshotId:operationId,accountId,updatedAt:serverTimestamp()});return {status:'SYNCED',revision};
   });
  },
  async read(uid){const current=await head(uid);if(!current)return null;const r=await getDoc(snapshot(uid,current.snapshotId));if(!r.exists())throw Error('CLOUD_SNAPSHOT_MISSING');const manifest=r.data(),chunks=[];
   if(!Number.isInteger(manifest.count)||manifest.count<1||manifest.count>100)throw Error('INVALID_CLOUD_MANIFEST');
   for(let i=0;i<manifest.count;i++){const part=await getDoc(chunk(uid,current.snapshotId,i));if(!part.exists())throw Error('CLOUD_CHUNK_MISSING');chunks.push(part.data().data);}return {head:current,manifest,chunks};
  }
 };
}
