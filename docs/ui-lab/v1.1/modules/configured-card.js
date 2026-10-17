import catalog from '../../../ui-prototypes/assets/echoes/browser-data.json' with {type:'json'};
import manifest from '../../../ui-prototypes/assets/echoes/manifest.json' with {type:'json'};
import {validateEchoTemplateConfiguration} from '../../../ui-prototypes/assets/echo-template-configuration.mjs';

// Presentation only: a future input is never an actual rolled Echo/stat input.
export function configuredCard(template) {
  if(!template)return null;
  const choice=validateEchoTemplateConfiguration(catalog,template);
  const echo=catalog.echoes.find(row=>row.id===choice.echoId);
  const sonata=catalog.sonataSets.find(row=>row.id===choice.selectedSonataSetId);
  const icon=manifest.icons.find(row=>row.echoId===choice.echoId);
  if(!icon)throw Error('Canonical Echo artwork missing.');
  const path=value=>'../../'+value.replace(/^docs\//,'');
  return {configured:true,name:echo.name,cost:echo.cost,artURL:path(icon.targetPath),setName:sonata.name,setIconURL:path(sonata.artPath),
    main:choice.mainStatName,value:'—',secondary:'Secondary Stat',secondaryValue:'—',stats:[]};
}
