// External typography is unchanged in the app. Tests bound that third-party
// dependency and reuse identical success/fallback bytes for source and baseline.
const fontResponses=new Map();
export async function reviewBrowserContext(browser,options){
 const context=await browser.newContext(options);
 await context.route('**://*.onlinewebfonts.com/**',async route=>{
  const url=route.request().url();
  if(!fontResponses.has(url))fontResponses.set(url,(async()=>{
   try{const response=await route.fetch({timeout:5000});if(!response.ok())throw Error('Font host unavailable');return {status:response.status(),headers:{'content-type':response.headers()['content-type']??'application/octet-stream','access-control-allow-origin':'*'},body:await response.body()};}
   catch{console.log('Review font host unavailable; shared CSS fallback for comparison pages:',url);return null;}
  })());
  const cached=await fontResponses.get(url);if(cached)await route.fulfill(cached);else await route.abort('failed');
 });
 return context;
}
