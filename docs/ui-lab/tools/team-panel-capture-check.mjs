import assert from 'node:assert/strict';
import {screenshotTeamPanel} from './team-panel-screenshot.mjs';

// Deterministically place a real DOM replacement after screenshot target
// resolution, matching the locator.screenshot / async preflight race in CI.
export async function verifyTeamPanelCaptureRace(browser){
 const context=await browser.newContext(),page=await context.newPage();
 const checks=[];
 try{
  for(const route of ['sandbox','improve']){
   const id=route==='sandbox'?'sandboxTeamPanel':'compactAccountTeamPanel';
   await page.setContent(`<style>body{margin:0}#${id}{width:420px}.sandbox-dps{height:140px}</style><div id="${id}"><section class="sandbox-dps">Selected team</section></div>`);
   const stale=await page.locator('.sandbox-dps').elementHandle();
   const repaint=()=>page.evaluate(id=>{document.getElementById(id).innerHTML='<section class="sandbox-dps">Selected team after preflight</section>';},id);
   await repaint();
   await assert.rejects(stale.screenshot({timeout:1000}),/Element is not attached to the DOM/);
   let resolutions=0;
   const racingPage={locator(selector){const locator=page.locator(selector);return new Proxy(locator,{get(target,key){
    if(key==='screenshot')return async options=>{resolutions++;const handle=await target.elementHandle();await repaint();return handle.screenshot(options);};
    const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;
   }});}};
   const image=await screenshotTeamPanel(racingPage,route,{timeout:2000});
   assert.equal(resolutions,1,'capture must not hide the race with retries');
   assert.equal(image.readUInt32BE(16),420);assert.equal(image.readUInt32BE(20),140);
   assert.equal(await page.locator('.sandbox-dps').textContent(),'Selected team after preflight');
   const removedPage={locator(selector){const locator=page.locator(selector);return new Proxy(locator,{get(target,key){
    if(key==='screenshot')return async options=>{const handle=await target.elementHandle();await page.locator('#'+id).evaluate(n=>n.remove());return handle.screenshot(options);};
    const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;
   }});}};
   await assert.rejects(screenshotTeamPanel(removedPage,route,{timeout:1000}),/Element is not attached to the DOM/);
   checks.push({route,oldInnerTargetDetached:true,ownerCaptureSurvivesRepaint:true,realUnmountStillFails:true});
  }
  return checks;
 }finally{await context.close();}
}
