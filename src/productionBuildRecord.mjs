// Read-only observation of the existing v34 account owner. No draft(), save,
// normalization defaults, new IDs, revisions, persistence keys or equipment writes.
export const PRODUCTION_BUILD_STORAGE_KEY='bellibing-ui-checkpoint-v34';
export function readProductionBuildRecord(storage,character){
 const missing=reason=>({status:'PENDING',reason,characterId:character?.id??null,buildId:null,modeId:null,revisions:null});
 if(!character?.id||!character?.name)return missing('CANONICAL_CHARACTER_IDENTITY_REQUIRED');
 let account;try{const bytes=storage.getItem(PRODUCTION_BUILD_STORAGE_KEY);if(bytes===null)return missing('ACCOUNT_BUILD_STORAGE_ABSENT');account=JSON.parse(bytes);}catch{return missing('ACCOUNT_BUILD_STORAGE_UNREADABLE');}
 if(!Array.isArray(account?.characters)||!account.characters.includes(character.name))return missing('CHARACTER_NOT_OWNED_IN_PRODUCTION_ACCOUNT');
 const record=account.drafts?.[character.name];if(record?.character!==character.name||!record.build)return missing('OWNED_BUILD_RECORD_MISSING');
 const build=record.build;
 if(!build.echoSets?.activeSetId||build.echoSets.sets?.[build.echoSets.activeSetId]?.slots?.length!==5)return missing('STRUCTURED_PRODUCTION_BUILD_UNAVAILABLE');
 return {status:'OBSERVED_PRODUCTION_BUILD_RECORD',characterId:character.id,ownerRecord:{storageKey:PRODUCTION_BUILD_STORAGE_KEY,characterName:character.name},
  buildState:structuredClone(build),buildId:null,modeId:null,revisions:null,
  bindingStatus:'PENDING_PRODUCTION_IDENTITY_MODE_AND_REVISION_OWNERS'};
}
