// Isolated preview labels. No rankings, calculation rules or inferred roles.
// Aalto/Augusta: descriptions in docs/ui-prototypes/assets/skills-runtime.json.
// Hsin: the owner-supplied in-game Select Resonator screenshots in this review.
export const CHARACTER_PREVIEW_INFO = {
 aalto: {summary: 'Uses mist and ranged attacks. His Outro amplifies the incoming Resonator\u2019s Aero DMG.', tags: ['Aero DMG', 'Aero DMG Amplification']},
 augusta: {summary: 'Electro attacks built around Heavy Attacks.', tags: ['Electro DMG', 'Heavy Attack DMG']},
 hsin: {
  summary: 'Resonance Modes provide different team DMG Amplification effects.',
  tags: ['Main Damage Dealer', 'Resonance Skill DMG', 'Unison', 'Electro Flare', 'Coordinated Attack'],
  skills: [{id: 'owner-resonance-mode', kind: 'skill', role: 'resonance-mode', name: 'Herself a Thousand Lanterns', assetPath: null,
   description: 'Deal Electro DMG.\n\nAfter Resonance Liberation Finisher is cast, casting this skill triggers various effects depending on the Resonance Mode:\n\nWhile in Resonance Mode - Unison, Resonators in the team other than Hsin gain All DMG Amplification when they gain Unison.\n\nWhile in Resonance Mode - Electro Flare, Resonators in the team other than Hsin gain Electro DMG Amplification.'}]
 }
};

