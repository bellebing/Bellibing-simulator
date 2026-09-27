const EPSILON = 1e-12;
const WEAPON_SECONDARY_STATS = new Set(['HP%','ATK%','DEF%','CRIT Rate','CRIT DMG','Energy Regen']);

const finite = value => typeof value === 'number' && Number.isFinite(value);
const exact = (a,b) => finite(a) && finite(b) && Math.abs(a-b) <= EPSILON;

function add(total,name,value){
  if(!finite(value)) throw new Error('Build stat projection received a non-finite '+name+' value');
  total[name]=(total[name]??0)+value;
}

function rowsToTotals(rows,label){
  const totals={};
  for(const row of rows??[]){
    if(!row||typeof row.stat!=='string'||!row.stat||!finite(row.value)) throw new Error('Invalid '+label+' stat row');
    add(totals,row.stat,row.value);
  }
  return totals;
}

function projectEchoTotals(echoSlots,contract){
  if(!contract||contract.rank!==5||!Array.isArray(contract.levels)||contract.maxSubstats!==5) {
    throw new Error('Unsupported Echo stat projection contract');
  }
  const totals={};
  let cardCount=0;
  for(const card of echoSlots??[]){
    if(card==null) continue;
    cardCount++;
    if(!card||card.rank!==contract.rank||!contract.levels.includes(card.level)||![1,3,4].includes(card.cost)) {
      throw new Error('Unsupported committed Echo card');
    }
    if(!Array.isArray(card.substats)||card.substats.length!==card.level/5||card.substats.length>contract.maxSubstats) {
      throw new Error('Committed Echo level/substat count mismatch');
    }
    const cost=String(card.cost),level=String(card.level);
    const mainOptions=contract.mainStatsByCostAndLevel?.[cost]?.[level];
    const expectedMain=Array.isArray(mainOptions)?mainOptions.find(option=>option.name===card.mainStat?.name):null;
    if(!expectedMain||!exact(expectedMain.value,card.mainStat?.value)) throw new Error('Committed Echo primary Main Stat is not canonical');
    const expectedSecondary=contract.secondaryMainStatsByCostAndLevel?.[cost]?.[level];
    if(!expectedSecondary||expectedSecondary.name!==card.secondaryMainStat?.name||!exact(expectedSecondary.value,card.secondaryMainStat?.value)) {
      throw new Error('Committed Echo secondary Main Stat is not canonical');
    }
    const names=new Set();
    for(const roll of card.substats){
      if(!roll||names.has(roll.name)) throw new Error('Committed Echo substats must be unique');
      const option=contract.substats?.find(candidate=>candidate.name===roll.name);
      if(!option||!Array.isArray(option.values)||!option.values.some(value=>exact(value,roll.value))) {
        throw new Error('Committed Echo substat is not canonical');
      }
      names.add(roll.name);
    }
    for(const roll of [card.mainStat,card.secondaryMainStat,...card.substats]) add(totals,roll.name,roll.value);
  }
  return {totals,cardCount};
}

function total(name,...sources){
  return sources.reduce((sum,source)=>sum+(source?.[name]??0),0);
}

export function projectStaticBuildStats({character,weapon=null,echoSlots=[],echoStatContract}={}){
  if(!character||typeof character.element!=='string') throw new Error('Build stat projection requires a canonical Character');
  const level90=character.level90??{},baseCombat=character.baseCombat??{};
  for(const key of ['hp','atk','def']) if(!finite(level90[key])) throw new Error('Character '+key+' is unresolved');
  for(const key of ['critRate','critDamage','energyRegen']) if(!finite(baseCombat[key])) throw new Error('Character '+key+' is unresolved');

  const intrinsic=rowsToTotals(character.intrinsicStats,'Character intrinsic');
  const weaponTotals={};
  let weaponBaseAtk=0;
  if(weapon){
    if(!finite(weapon.level90BaseAtk)) throw new Error('Equipped Weapon base ATK is unresolved');
    weaponBaseAtk=weapon.level90BaseAtk;
    if(weapon.secondary){
      if(!WEAPON_SECONDARY_STATS.has(weapon.secondary.stat)||!finite(weapon.secondary.value)) throw new Error('Unsupported equipped Weapon secondary stat');
      add(weaponTotals,weapon.secondary.stat,weapon.secondary.value);
    }
  }

  const echoProjection=projectEchoTotals(echoSlots,echoStatContract);
  const echo=echoProjection.totals;
  const hpPct=total('HP%',intrinsic,weaponTotals,echo);
  const atkPct=total('ATK%',intrinsic,weaponTotals,echo);
  const defPct=total('DEF%',intrinsic,weaponTotals,echo);
  const elementStat=character.element+' DMG';

  return Object.freeze({
    scope:'STATIC_BUILD_STATS_ONLY',
    hp:level90.hp*(1+hpPct)+total('Flat HP',echo),
    atk:(level90.atk+weaponBaseAtk)*(1+atkPct)+total('Flat ATK',echo),
    def:level90.def*(1+defPct)+total('Flat DEF',echo),
    energyRegen:baseCombat.energyRegen+total('Energy Regen',weaponTotals,echo),
    critRate:baseCombat.critRate+total('CRIT Rate',intrinsic,weaponTotals,echo),
    critDamage:baseCombat.critDamage+total('CRIT DMG',intrinsic,weaponTotals,echo),
    elementDamageBonus:total(elementStat,intrinsic,echo),
    elementDamageLabel:character.element+' DMG Bonus',
    basicAttackDamageBonus:total('Basic Attack DMG',echo),
    heavyAttackDamageBonus:total('Heavy Attack DMG',echo),
    resonanceSkillDamageBonus:total('Skill DMG',echo),
    resonanceLiberationDamageBonus:total('Liberation DMG',echo),
    healingBonus:total('Healing Bonus',intrinsic,echo),
    echoCardCount:echoProjection.cardCount,
    includesWeaponEffects:false,
    includesSonataEffects:false,
    includesEchoSkillEffects:false,
    includesSequenceEffects:false,
    includesTeamBuffs:false,
    includesCombatUptime:false
  });
}
