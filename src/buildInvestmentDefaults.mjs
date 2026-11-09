import {normalizeForteState} from './characterForteUi.mjs';

// Owner-selected display defaults. Original observations remain untouched.
export function resolveBuildInvestmentDefaults(build, tree) {
 const resolved=structuredClone(build), defaults=[...(build.assumedBuildFacts??[])];
 if(resolved.weaponId&&resolved.weaponRefinement==null){
  resolved.weaponRefinement=1;
  defaults.push('Weapon rank defaults to R1');
 }
 if(resolved.minorForteUnknown&&tree?.nodes?.length){
  const state=normalizeForteState(tree,resolved.forte);
  for(const node of tree.nodes)if(node.kind!=='skill'&&node.kind!=='outro')state.enabled[node.id]=true;
  resolved.forte=normalizeForteState(tree,state);
  resolved.minorForteUnknown=false;
  defaults.push('Minor Forte defaults to unlocked');
 }
 const sets=resolved.echoSets?.sets??{};
 const active=sets[resolved.echoSets?.activeSetId];
 if(active)active.slots=active.slots.map(echo=>echo&&typeof echo==='object'?resolveEchoInvestment(echo):echo);
 resolved.assumedBuildFacts=[...new Set(defaults)];
 return resolved;
}

export function resolveEchoInvestment(echo) {
 const resolved=structuredClone(echo);
 // Five observed rolls require +25. Projection still validates every value.
 if(resolved.level==null&&resolved.substats?.length===5&&(resolved.rank==null||resolved.rank===5))resolved.level=25;
 if(resolved.rank==null&&resolved.level===25)resolved.rank=5;
 return resolved;
}
