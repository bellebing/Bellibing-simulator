// Only explicit same-goal host scope can authorize a variance label.
export function costScopeMarkup(record){
 if(record?.version!=='BELLIBING_COST_COMPARISON_V1')return '';
 const labels={FINITE_BUDGET_EXPECTATION_PENDING:'Expected is an unlimited-budget reference. A matching finite-budget expectation is Pending.',SELECTED_ECHO_GOAL_NOT_COMPLETE:'Run incomplete · spent so far. Cost difference remains Pending.',MATCHING_EXPECTATION_PENDING:'A matching Expected Cost is Pending.'};
 const common='Expected is a statistical mean, not a promised outcome.';
 if(record.status!=='COMPARABLE')return `<p class="cost-scope" role="status">${labels[record.reason]??'Cost comparison Pending.'} ${common}</p>`;
 if(record.scope?.goal!=='ECHO_TARGETS_ONLY'||record.scope.start!=='EMPTY_SELECTED_SLOTS'||record.scope.costBasis!=='GROSS_RECEIPTS'||record.resourceScope!=='UNCONSTRAINED'||record.completion!=='ECHO_GOAL_MET')return '<p class="cost-scope">Cost comparison Pending · scope mismatch.</p>';
 const describe=(name,r)=>{
  if(!r||![r.expected,r.simulated,r.delta].every(Number.isFinite)||r.expected<0||r.simulated<0||Math.abs(r.simulated-r.expected-r.delta)>1e-6*Math.max(1,Math.abs(r.delta)))return `${name}: difference Pending`;
  const n=new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(Math.abs(r.delta));
  return `${name}: ${n} ${r.delta>0?'over':r.delta<0?'under':'from'} expected`;
 };
 return `<p class="cost-scope" role="status">${describe('Echoes',record.rows?.echoes)} · ${describe('Tuners',record.rows?.tuners)}. ${common}</p>`;
}
