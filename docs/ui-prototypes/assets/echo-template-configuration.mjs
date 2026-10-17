// Source-backed template validation, shared by Workshop and UI Lab. This is not
// a rolled Echo, recommendation, acquisition model or execution capability.
export function validateEchoTemplateConfiguration(catalog, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Choose an Echo template.');
  const allowed=['echoId','cost','rank','mainStatName','selectedSonataSetId'];
  if (Object.keys(input).some(key=>!allowed.includes(key))) throw Error('Template contains non-configuration fields.');
  const echo=catalog.echoes.find(row=>row.id===input.echoId&&row.releaseStatus==='RELEASED');
  if (!echo || input.cost!==echo.cost) throw Error('Echo identity and Cost must match canonical data.');
  if (input.rank!==catalog.statEditor.rank) throw Error('Only the source-backed Rank-5 editor is supported.');
  const main=catalog.statEditor.mainStatsByCostAndLevel[String(echo.cost)]?.['0']?.find(row=>row.name===input.mainStatName);
  if (!main) throw Error('Main Stat is not valid for this Echo Cost and Rank.');
  if (!echo.sonataSetIds.includes(input.selectedSonataSetId)||!catalog.sonataSets.some(row=>row.id===input.selectedSonataSetId)) throw Error('Sonata is not compatible with this Echo.');
  return {echoId:echo.id,cost:echo.cost,rank:catalog.statEditor.rank,mainStatName:main.name,selectedSonataSetId:input.selectedSonataSetId};
}
export function templateSelectionCard(catalog,input) {
  const template=validateEchoTemplateConfiguration(catalog,input);
  return {...template,mainStat:{...catalog.statEditor.mainStatsByCostAndLevel[String(template.cost)]['0'].find(row=>row.name===template.mainStatName)},
    secondaryMainStat:{...catalog.statEditor.secondaryMainStatsByCostAndLevel[String(template.cost)]['0']},level:0,substats:[]};
}
