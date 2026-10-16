// Deterministic, illustrative keyframes for interaction review ONLY. These are
// not probabilities, forecasts, accepted-build averages or functions of minima.
const CRIT_FRAMES = ['72.0%','72.4%','73.1%','73.5%','74.2%','74.6%','75.0%','75.3%'];
export function focusFixture(characterId, action) {
  if (characterId !== 'augusta' || action.kind !== 'minimum' || action.metric !== 'TOTAL_CRIT_RATE') return null;
  if (!Number.isInteger(action.tier) || action.tier < 0 || action.tier >= CRIT_FRAMES.length) return null;
  return { values:{TOTAL_CRIT_RATE:CRIT_FRAMES[action.tier]},
    affected:[{id:'TOTAL_CRIT_RATE',role:'expected'}], provenance:'ILLUSTRATIVE_FOCUS_FIXTURE' };
}

// Existing illustrative Augusta record values; never a verified projection.
export function erTotalFixture(characterId,scenario) {
  if(characterId!=='augusta'||!['below','above'].includes(scenario))return null;
  return {characterId,status:'ILLUSTRATIVE',valuePercent:scenario==='below'?118.4:126.8};
}
