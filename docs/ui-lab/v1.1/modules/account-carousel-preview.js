import {accountProjection} from './account-projection.js';
import {CHARACTER_SIGNATURE_BY_ID} from '../../../../src/data/characterEquipmentAssociations.ts';

// Every account selector reads the same saved build, independently of draft UI.
export function accountCarouselPreview(person, storage) {
 const projection=accountProjection(person,storage),build=projection.build;
 const signature=CHARACTER_SIGNATURE_BY_ID.get(person.id);
 const rank=signature?.weaponId?(build?.weaponId===signature.weaponId?build.weaponRefinement:0):null;
 return {
  onAccount:projection.record.owned===true,
  hasBuild:projection.record.status==='OBSERVED_PRODUCTION_BUILD_RECORD',
  slots:projection.slots?.filter(Boolean).length??0,
  buildCode:build?'S'+(build.sequenceLevel??'?')+(rank===null?'':' R'+(rank??'?')):'',
  weapon:projection.weapon?.name??null,
  stats:['TOTAL_ATK','TOTAL_CRIT_RATE','TOTAL_CRIT_DAMAGE'].map(id=>projection.currentValues[id]??'Pending')
 };
}
