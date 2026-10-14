// Explicit fresh-install/recovery fixture: remove the authority as well as its mirror.
// Production mutations must use withExclusiveImprovePolicyStorage instead.
export function resetImproveStorageFixture(expression) {
  return `(async()=>{await new Promise((resolve,reject)=>{
    const request=indexedDB.deleteDatabase('bellibing.improve.storage.v1');
    request.onsuccess=resolve;request.onerror=()=>reject(request.error);
    request.onblocked=()=>reject(new Error('Improve fixture database reset blocked'));
  });return await (0,eval)(${JSON.stringify(expression)})})()`;
}
