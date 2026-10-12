/** Bounded research facts; no generic Echo attack/profile promotion. */
export const AUGUSTA_PILOT_ECHO_SOURCE_FACTS = [
 {name:'Echo - Lady of the Sea',echoId:'echo-60001605',element:'Aero',scalingStat:'ATK',components:[{coefficient:0.1368,hits:10},{coefficient:1.6416,hits:1}],
  sourceUrls:['https://wuthering.gg/echos/lady-of-the-sea','https://wutheringlab.com/echo/lady-of-the-sea/','https://github.com/riley31415/wuwa_calc/blob/195a22f1b7a1b55b953224e26742b896a719e1c3/src/echoes/septimont.ts'],
  reviewedAt:'2026-10-12',boundary:'Description verifies Rank5 decomposition; ATK is the pinned publisher declaration. Exact eleven impact times remain unavailable: source model groups the cast into one impact.'},
 {name:'Echo - Impermanence Heron',echoId:'echo-60000525',element:'Havoc',scalingStat:'ATK',components:[{coefficient:3.1056,hits:1}],
  sourceUrls:['https://wuthering.wiki/monster_330000030.html','https://wuthering.gg/echos/impermanence-heron'],reviewedAt:'2026-10-12',boundary:'Rank5 full initial slam; ATK scaling explicitly in mirror damage entry 2. Hold/flame route is not used.'}
] as const;
