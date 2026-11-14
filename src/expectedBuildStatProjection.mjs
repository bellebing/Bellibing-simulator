// An isolated Expected-only stat aggregate. Canonical src/buildStatProjection.mjs
// stays byte-identical to the reviewed source pin. Fractional expected Echo
// contributions are NOT legal equipped Echo cards and do not authorize DPS.
// Keep arithmetic parity covered by test/sandboxStaticStats.test.mjs.
const EPSILON = 1e-12;
const WEAPON_SECONDARY_STATS = new Set(['HP%','ATK%','DEF%','CRIT Rate','CRIT DMG','Energy Regen']);
const STATIC_BUILD_STATS = new Set([
  'HP%','ATK%','DEF%','CRIT Rate','CRIT DMG','Energy Regen','Healing Bonus',
  'All Attribute DMG','Aero DMG','Fusion DMG','Glacio DMG','Electro DMG','Spectro DMG','Havoc DMG',
  'Basic Attack DMG','Heavy Attack DMG','Skill DMG','Liberation DMG'
]);
const finite=value=>typeof value==='number'&&Number.isFinite(value);
const exact=(a,b)=>finite(a)&&finite(b)&&Math.abs(a-b)<=EPSILON;
function add(total,name,value){if(!finite(value))throw new Error('Build stat projection received a non-finite '+name+' value');total[name]=(total[name]??0)+value}
function rowsToTotals(rows,label,supported=null){const totals={};for(const row of rows??[]){if(!row||typeof row.stat!=='string'||!row.stat||!finite(row.value)||supported&&!supported.has(row.stat))throw new Error('Invalid '+label+' stat row');add(totals,row.stat,row.value)}return totals}
function total(name,...sources){return sources.reduce((sum,source)=>sum+(source?.[name]??0),0)}
// Expected contributions are fractional statistical aggregates, never legal
// equipment cards. Keep this entry separate from committed-card validation.
export function projectExpectedStaticBuildStats(input,rows){
  const names=new Set(['Flat HP','Flat ATK','Flat DEF',...STATIC_BUILD_STATS]);
  if(!Array.isArray(rows)||rows.some(r=>!r||r.value<0))throw Error('Invalid expected Echo contributions');
  return projectFromEchoTotals(input,{totals:rowsToTotals(rows,'Expected Echo',names),cardCount:5},'EXPECTED_STATIC_BUILD_STATS_ONLY');
}
function projectFromEchoTotals({character,weapon=null,activeForteStats=[],activeSequenceStats=[],activeWeaponStats=[]}={},echoProjection,scope='STATIC_BUILD_STATS_ONLY'){
  if(!character||typeof character.element!=='string')throw new Error('Build stat projection requires a canonical Character');
  const level90=character.level90??{},baseCombat=character.baseCombat??{};
  for(const key of ['hp','atk','def'])if(!finite(level90[key]))throw new Error('Character '+key+' is unresolved');
  for(const key of ['critRate','critDamage','energyRegen'])if(!finite(baseCombat[key]))throw new Error('Character '+key+' is unresolved');
  const forte=rowsToTotals(activeForteStats,'Active Minor Forte');
  const sequence=rowsToTotals(activeSequenceStats,'Reviewed static Sequence',STATIC_BUILD_STATS);
  const weaponEffects=rowsToTotals(activeWeaponStats,'Reviewed static Weapon',STATIC_BUILD_STATS);
  const weaponTotals={};let weaponBaseAtk=0;
  if(weapon){if(!finite(weapon.level90BaseAtk))throw new Error('Equipped Weapon base ATK is unresolved');weaponBaseAtk=weapon.level90BaseAtk;if(weapon.secondary){if(!WEAPON_SECONDARY_STATS.has(weapon.secondary.stat)||!finite(weapon.secondary.value))throw new Error('Unsupported equipped Weapon secondary stat');add(weaponTotals,weapon.secondary.stat,weapon.secondary.value)}}
  const echo=echoProjection.totals;
  const hpPct=total('HP%',forte,sequence,weaponEffects,weaponTotals,echo),atkPct=total('ATK%',forte,sequence,weaponEffects,weaponTotals,echo),defPct=total('DEF%',forte,sequence,weaponEffects,weaponTotals,echo),elementStat=character.element+' DMG';
  return Object.freeze({
    scope,hp:level90.hp*(1+hpPct)+total('Flat HP',echo),atk:(level90.atk+weaponBaseAtk)*(1+atkPct)+total('Flat ATK',echo),def:level90.def*(1+defPct)+total('Flat DEF',echo),
    energyRegen:baseCombat.energyRegen+total('Energy Regen',sequence,weaponEffects,weaponTotals,echo),critRate:baseCombat.critRate+total('CRIT Rate',forte,sequence,weaponEffects,weaponTotals,echo),critDamage:baseCombat.critDamage+total('CRIT DMG',forte,sequence,weaponEffects,weaponTotals,echo),
    elementDamageBonus:total(elementStat,forte,sequence,weaponEffects,echo)+total('All Attribute DMG',weaponEffects),elementDamageLabel:character.element+' DMG Bonus',
    basicAttackDamageBonus:total('Basic Attack DMG',sequence,weaponEffects,echo),heavyAttackDamageBonus:total('Heavy Attack DMG',sequence,weaponEffects,echo),resonanceSkillDamageBonus:total('Skill DMG',sequence,weaponEffects,echo),resonanceLiberationDamageBonus:total('Liberation DMG',sequence,weaponEffects,echo),healingBonus:total('Healing Bonus',forte,sequence,weaponEffects,echo),
    echoCardCount:echoProjection.cardCount,sequenceStaticStatCount:Array.isArray(activeSequenceStats)?activeSequenceStats.length:0,weaponStaticStatCount:Array.isArray(activeWeaponStats)?activeWeaponStats.length:0,
    includesActiveMinorForteStats:true,includesLegacyIntrinsicTotals:false,includesWeaponEffects:true,includesReviewedStaticWeaponStats:true,includesConditionalWeaponEffects:false,includesSonataEffects:false,includesEchoSkillEffects:false,includesSequenceEffects:true,includesReviewedStaticSequenceStats:true,includesConditionalSequenceEffects:false,includesTeamBuffs:false,includesCombatUptime:false
  });
}
