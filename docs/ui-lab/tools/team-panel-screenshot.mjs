// renderTeamPanel replaces the inner section, not its route-owned container.
// Screenshot that stable owner so a normal preflight render cannot detach it.
export async function screenshotTeamPanel(page,route,options){
 if(!['sandbox','improve'].includes(route))throw Error('UNKNOWN_TEAM_PANEL_ROUTE');
 const owner=page.locator(route==='sandbox'?'#sandboxTeamPanel':'#compactAccountTeamPanel');
 await owner.locator('.sandbox-dps').waitFor({state:'visible'});
 return owner.screenshot(options);
}
