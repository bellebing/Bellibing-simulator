import {productDraftFromAccount,productDraftBuildIdentity,restoreKnownDraftWeaponLevel} from './productBuildDraft.mjs';

const sameBuild=(a,b)=>!!a&&!!b&&productDraftBuildIdentity(a)===productDraftBuildIdentity(b);

// Account Equip and local workshop drafts are separate transactions. An untouched
// draft follows the new account build; real local edits never get overwritten.
export function reconcileProductDrafts({account,projected,saved,trees=[]}){
 const drafts={...projected},conflicts=new Set();
 for(const [id,original] of Object.entries(saved?.drafts??{})){
  const local=restoreKnownDraftWeaponLevel(original,account),current=projected[id];
  const oldBytes=saved.baseCharacters?.[id],nowBytes=account.characters[id]?JSON.stringify(account.characters[id].record):undefined;
  if(oldBytes===nowBytes){drafts[id]=local;continue;}
  if(sameBuild(local,current)){drafts[id]=current;continue;}
  let previous=saved.baseDrafts?.[id];
  if(!previous&&oldBytes){
   // Older files predate baseDrafts. Retained physical inventory allows their
   // saved record to be projected without mutating today's authoritative one.
   try{
    const record=JSON.parse(oldBytes),prior={...account,characters:{...account.characters,[id]:{...account.characters[id],id,record}}};
    previous=productDraftFromAccount(prior,id,trees.find(t=>t.characterId===id));
   }catch{ /* No reliable base: preserve the local draft and flag the conflict. */ }
  }
  if(current&&sameBuild(local,previous)){drafts[id]=current;continue;}
  drafts[id]=local;conflicts.add(id);
 }
 return {drafts,conflicts};
}

export function productDraftBases({account,savedDrafts,saved,conflicts}){
 const baseCharacters=Object.fromEntries(Object.entries(account.characters).map(([id,c])=>[id,JSON.stringify(c.record)]));
 const baseDrafts={...savedDrafts};
 for(const id of conflicts){
  if(saved?.baseCharacters?.[id]===undefined)delete baseCharacters[id];else baseCharacters[id]=saved.baseCharacters[id];
  if(saved?.baseDrafts?.[id]===undefined)delete baseDrafts[id];else baseDrafts[id]=saved.baseDrafts[id];
 }
 return {baseCharacters,baseDrafts};
}
