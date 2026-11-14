import test from 'node:test';
import assert from 'node:assert/strict';
import {accountCarouselPreview} from '../docs/ui-lab/v1.1/modules/account-carousel-preview.js';
import {CHARACTER_CATALOG} from '../docs/ui-lab/v1.1/modules/catalog.js';
const lupa=CHARACTER_CATALOG.find(p=>p.id==='lupa');
test('owned Characters remain selectable while their saved build is incomplete',()=>{
 const storage={getItem:()=>JSON.stringify({characters:['Lupa'],drafts:{Lupa:{character:'Lupa',build:{}}}})};
 const preview=accountCarouselPreview(lupa,storage);
 assert.equal(preview.onAccount,true);assert.equal(preview.hasBuild,false);
});
test('an unsaved Character draft is separate from account ownership',()=>{
 const storage={getItem:()=>JSON.stringify({characters:[],drafts:{Lupa:{character:'Lupa',build:{}}}})};
 assert.equal(accountCarouselPreview(lupa,storage).onAccount,false);
});
