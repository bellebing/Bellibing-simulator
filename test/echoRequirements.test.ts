import test from 'node:test';
import assert from 'node:assert/strict';
import { assessEchoRequirements, acceptsFinalEcho } from '../src/echoRequirements.ts';
import type { EchoRequirements } from '../src/improvePolicyDomain.ts';
import { SUBSTAT_VALUE_TABLE } from '../src/echoCoreRules.ts';
const row = (stat:string, minimum=SUBSTAT_VALUE_TABLE[stat]![0]!) => ({stat,minimum});
const roll = (name:string, value=SUBSTAT_VALUE_TABLE[name]![0]!) => ({name,value});
const config = (hard:string[], flex:string[]=[], count=1):EchoRequirements => ({requiredOnEveryEcho:hard.map(stat=>row(stat)),
  groups:flex.length ? [{id:'selected-flex',minimumCount:count,members:flex.map(stat=>row(stat))}] : []});
const checkpoint = (names:string[]) => ({level:names.length*5 as 0|5|10|15|20|25,substats:names.map(name=>roll(name))});

test('final acceptance is all Hard AND N distinct Flex hits, each at its own exact minimum', () => {
  const req=config(['CRIT Rate','CRIT DMG'],['ATK%','Heavy Attack DMG','Energy Regen','Flat ATK']);
  assert.equal(acceptsFinalEcho(req,checkpoint(['CRIT Rate','CRIT DMG','ATK%','HP%','DEF%'])),true);
  assert.equal(acceptsFinalEcho(req,checkpoint(['CRIT Rate','CRIT DMG','Basic Attack DMG','HP%','DEF%'])),false);
  assert.equal(acceptsFinalEcho(req,checkpoint(['CRIT Rate','ATK%','Heavy Attack DMG','HP%','DEF%'])),false);
  const two={...req,groups:[{...req.groups[0]!,minimumCount:2}]};
  assert.equal(acceptsFinalEcho(two,checkpoint(['CRIT Rate','CRIT DMG','ATK%','HP%','DEF%'])),false);
  assert.equal(acceptsFinalEcho(two,checkpoint(['CRIT Rate','CRIT DMG','ATK%','Flat ATK','DEF%'])),true);
  const minima={...req,groups:[{...req.groups[0]!,members:[row('ATK%',.116),row('Flat ATK',60)]}]};
  assert.equal(acceptsFinalEcho(minima,checkpoint(['CRIT Rate','CRIT DMG','ATK%','Flat ATK','DEF%'])),false);
  assert.equal(acceptsFinalEcho(minima,{...checkpoint(['CRIT Rate','CRIT DMG','ATK%','Flat ATK','DEF%']),substats:[roll('CRIT Rate'),roll('CRIT DMG'),roll('ATK%',.116),roll('Flat ATK'),roll('DEF%')]}),true);
});
test('exact slot feasibility handles the four required checkpoint examples', () => {
  const a=assessEchoRequirements(config(['CRIT Rate','CRIT DMG','Energy Regen']),checkpoint(['HP%','DEF%','Flat HP']));
  assert.equal(a.status,'IMPOSSIBLE'); assert.equal(a.missingHard,3); assert.equal(a.remainingSlots,2); assert.equal(a.minimumFutureHits,3);
  const b=assessEchoRequirements(config(['CRIT Rate','CRIT DMG'],['ATK%','Energy Regen'],2),checkpoint(['HP%','DEF%']));
  assert.equal(b.status,'IMPOSSIBLE'); assert.equal(b.missingHard,2); assert.equal(b.missingFlexHits,2); assert.equal(b.remainingSlots,3);
  const c=assessEchoRequirements(config(['CRIT Rate','CRIT DMG'],['ATK%','Energy Regen']),checkpoint(['CRIT DMG','ATK%','HP%','DEF%']));
  assert.equal(c.status,'STILL_POSSIBLE'); assert.equal(c.minimumFutureHits,1); assert.equal(c.remainingSlots,1);
  const d=assessEchoRequirements({requiredOnEveryEcho:[row('CRIT Rate',.075)],groups:[]},checkpoint(['CRIT Rate']));
  assert.equal(d.status,'IMPOSSIBLE');
});
test('unique types, thresholds, overlapping groups, empty pools and legacy unresolved groups fail safely', () => {
  assert.equal(assessEchoRequirements(config(['CRIT Rate']),checkpoint(['CRIT Rate','CRIT Rate'])).status,'INVALID');
  assert.equal(assessEchoRequirements(config([],['CRIT Rate'],1),checkpoint(['CRIT Rate'])).status,'SATISFIED');
  const low={requiredOnEveryEcho:[],groups:[{id:'selected-flex',minimumCount:1,members:[row('CRIT Rate',.075),row('ATK%')]}]};
  assert.equal(assessEchoRequirements(low,checkpoint(['CRIT Rate','HP%','DEF%','Flat HP'])).status,'STILL_POSSIBLE');
  assert.equal(assessEchoRequirements({...low,groups:[{...low.groups[0],minimumCount:2}]},checkpoint(['CRIT Rate'])).status,'IMPOSSIBLE');
  assert.equal(assessEchoRequirements({requiredOnEveryEcho:[row('CRIT Rate',.2)],groups:[]},checkpoint([])).status,'IMPOSSIBLE');
  assert.equal(assessEchoRequirements({requiredOnEveryEcho:[],groups:[{id:'empty',members:[],minimumCount:1}]},checkpoint([])).status,'IMPOSSIBLE');
  assert.equal(assessEchoRequirements({requiredOnEveryEcho:[],groups:[{id:'legacy',members:[row('CRIT Rate')]}]},checkpoint([])).status,'PENDING');
  const overlapping={requiredOnEveryEcho:[row('CRIT Rate')],groups:[{id:'a',members:[row('CRIT Rate'),row('ATK%')],minimumCount:1},{id:'b',members:[row('ATK%'),row('CRIT Rate')],minimumCount:1}]};
  assert.equal(assessEchoRequirements(overlapping,checkpoint([])).minimumFutureHits,1);
  assert.equal(acceptsFinalEcho(config([]),checkpoint([])),false);
});
