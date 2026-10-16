import assert from 'node:assert/strict';
import test from 'node:test';
import { augustaExpected } from '../docs/ui-lab/v1.1/modules/expected-projection.js';
import { initialSettings } from '../docs/ui-lab/v1.1/modules/settings-state.js';

const setup=()=>({id:'augusta',gate:'+5',...initialSettings('augusta')});
const points=text=>Number(text.replaceAll(',',''));
const percentage=text=>Number(text.replace('%',''));

test('Augusta static Expected produces 12 sane Character totals, never scales flat values as percentages',()=>{
  const result=augustaExpected(setup());
  assert.equal(result?.scope,'VERIFIED_STATIC_FIVE_ACCEPTED_ECHO_MEAN');
  assert.equal(Object.keys(result.values).length,12);
  assert.ok(points(result.values.TOTAL_HP)>10300&&points(result.values.TOTAL_HP)<35000);
  assert.ok(points(result.values.TOTAL_DEF)>=1112&&points(result.values.TOTAL_DEF)<5000);
  assert.ok(points(result.values.TOTAL_ATK)>1138&&points(result.values.TOTAL_ATK)<6000);
  assert.ok(percentage(result.values.TOTAL_CRIT_RATE)>70&&percentage(result.values.TOTAL_CRIT_RATE)<100);
  assert.ok(percentage(result.values.TOTAL_CRIT_DAMAGE)>=200);
  assert.equal(result.values.ELECTRO_DMG_BONUS,'60.0%','Exact dual canonical 3C Electro main stats without invented Sonata effects');
  assert.equal(result.values.HEALING_BONUS,'0.0%','Verified static absence is distinct from missing recommendations');
  assert.equal(augustaExpected(setup()).values.TOTAL_HP,result.values.TOTAL_HP,'Expected is deterministic, not one random SIMULATE');
});

test('live minimum/Flex changes alter the accepted population, while Gate alone changes cost not conditional mean',()=>{
  const state=setup(),baseline=augustaExpected(state);
  state.gate='+10';assert.deepEqual(augustaExpected(state).values,baseline.values);
  state.minima['CRIT Rate']=6;
  const strict=augustaExpected(state);
  assert.ok(percentage(strict.values.TOTAL_CRIT_RATE)>percentage(baseline.values.TOTAL_CRIT_RATE));
  state.minima['CRIT Rate']=0;state.flexCount=2;
  const both=augustaExpected(state);
  assert.notEqual(both.values.HEAVY_ATTACK_DMG_BONUS,baseline.values.HEAVY_ATTACK_DMG_BONUS);
  state.flexCount=1;assert.deepEqual(augustaExpected(state).values,baseline.values);
});

test('optional ER Target conditions total five-Echo ER and refuses unsupported values/Characters',()=>{
  const state=setup(),baseline=augustaExpected(state);
  state.erTarget.enabled=true;state.erTarget.valuePercent=120;
  const conditional=augustaExpected(state);
  assert.ok(percentage(conditional.values.TOTAL_ENERGY_REGEN)>=120);
  assert.ok(percentage(conditional.values.TOTAL_ENERGY_REGEN)>percentage(baseline.values.TOTAL_ENERGY_REGEN));
  state.erTarget.enabled=false;assert.deepEqual(augustaExpected(state).values,baseline.values);
  state.erTarget.enabled=true;state.erTarget.valuePercent=null;assert.equal(augustaExpected(state),null);
  state.erTarget.valuePercent=900;assert.equal(augustaExpected(state),null);
  state.id='iuno';assert.equal(augustaExpected(state),null);
});
