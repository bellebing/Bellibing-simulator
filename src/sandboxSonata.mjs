// Composition only, never combat effect execution. Canonical catalogs are injected
// so the exact same checker runs in Node and the source-preview browser.
export const SANDBOX_SONATA_REVIEW={version:1,checkedAt:'2026-10-17',
 sources:['https://www.prydwen.gg/wuthering-waves/guides/echoes-explained','https://wutheringwaves.fandom.com/wiki/Sonata'],
 rule:'Only distinct canonical Echo species contribute once per assigned Sonata. Duplicate equipment is not itself rejected; duplicate copies do not add set pieces. Phantom art is not a new species.',
 boundary:'Piece thresholds are canonical catalog data. Meeting a threshold does not prove its trigger, uptime or combat effect is executable.'};
export function inspectSandboxSonata(slots,{echoes,sonataSets}){
 const sets=new Map();
 for(const slot of slots){
  if(!slot)continue;
  const echo=echoes.find(e=>e.id===slot.echoId&&e.releaseStatus==='RELEASED');
  if(!echo||!echo.sonataSetIds.includes(slot.selectedSonataSetId))throw Error('INVALID_SONATA_MEMBERSHIP');
  const set=sonataSets.find(s=>s.id===slot.selectedSonataSetId&&s.releaseStatus==='RELEASED');
  if(!set||!Array.isArray(set.activationPieces))throw Error('CANONICAL_PIECE_THRESHOLDS_MISSING');
  if(!sets.has(set.id))sets.set(set.id,{setId:set.id,equippedCount:0,species:new Set(),thresholds:set.activationPieces});
  const row=sets.get(set.id);row.equippedCount++;row.species.add(echo.id);
 }
 return [...sets.values()].map(row=>({setId:row.setId,equippedCount:row.equippedCount,distinctSpecies:[...row.species],distinctCount:row.species.size,
  eligiblePieceBonuses:row.thresholds.filter(n=>row.species.size>=n),effectExecution:'PENDING_COMBAT_CONTEXT'}));
}
