export const CIACCONA_BASIC_ROTATION_EXECUTION_REVIEW_20260830 = {
  reviewId: 'ROTATION-EXECUTION-CIACCONA-2026-08-30-01',
  rotationId: 'ciaccona-basic-cartethyia-rover-aero',
  checkedAt: '2026-08-30',
  disposition: 'ENGINE_MODEL_AUTHORIZED',
  rotationSeconds: 4.5,
  sourceLabels: ['Prydwen — Ciaccona calculations/gameplay'],
  sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/ciaccona'],
  notes: [
    'The current calculation rotation is the same fixed fast SubDPS sequence already transcribed by the canonical RotationProfile: Intro -> Basic P3 -> Basic P4 -> Jump cancel -> Mid-air P1 -> Mid-air P2 -> Basic P4 -> Skill cancel -> Forte Heavy -> Ultimate -> Outro.',
    'Prydwen publishes 4.5 seconds for this fast calculation rotation. The engine uses 4.5 only as total rotation duration; it does not fabricate timestamps for individual actions.',
    'The selected canonical sequence does not include optional/periodic Symphonic Poem: Tonic events after Liberation, so the fixed model must not invent a Tonic count.',
  ],
} as const;

export const CARTETHYIA_BASIC_ROTATION_EXECUTION_REVIEW_20260830 = {
  reviewId: 'ROTATION-EXECUTION-CARTETHYIA-2026-08-30-01',
  rotationId: 'cartethyia-basic-ciaccona-rover-aero',
  checkedAt: '2026-08-30',
  disposition: 'SOURCE_SEMANTICS_BLOCKED',
  rotationSeconds: null,
  sourceLabels: ['Prydwen — Cartethyia gameplay'],
  sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/cartethyia'],
  notes: [
    'Current source preserves the already-transcribed canonical Basic Rotation and says it is fully functional with 14-second Outro buffs.',
    'That statement is an upper compatibility bound, not an exact measured duration for this specific sequence. No exact source-backed rotationSeconds was found in the execution review.',
    'SOURCE_SEQUENCE_ONLY remains mandatory until exact timing is sourced or independently measured under an explicitly approved verification method.',
  ],
} as const;

export const ROVER_AERO_STANDARD_ROTATION_EXECUTION_REVIEW_20260830 = {
  reviewId: 'ROTATION-EXECUTION-ROVER-AERO-2026-08-30-01',
  rotationId: 'rover-aero-cartethyia-ciaccona-standard',
  checkedAt: '2026-08-30',
  disposition: 'SOURCE_SEMANTICS_BLOCKED',
  blockerId: 'BUG-012',
  rotationSeconds: null,
  reviewedPendingExecutionIds: [
    'weapon:bloodpacts-pledge:BPP-SKILL:healing-uptime-adapter',
    'weapon:bloodpacts-pledge:BPP-TEAM-AERO:unbound-flow-team-amplify-adapter',
    'echo:echo-60001065:active-skill-damage-adapter',
    'rotation:rover-aero-cartethyia-ciaccona-standard:engine-model',
  ],
  sourceLabels: [
    'Prydwen — Rover (Aero) kit/gameplay',
    'Wutheringlab — Bloodpact’s Pledge',
  ],
  sourceUrls: [
    'https://www.prydwen.gg/wuthering-waves/characters/rover-aero',
    'https://wutheringlab.com/weapon/bloodpacts-pledge/',
  ],
  sourceEstablished: [
    'Cloudburst Dance and Omega Storm provide healing to nearby/all nearby team Resonators, so the canonical Standard Rotation contains source-proven healing events that can trigger Bloodpact’s Pledge BPP-SKILL.',
    'Bloodpact’s Pledge BPP-SKILL is a 6-second SELF Resonance Skill DMG window after Providing Healing.',
    'The canonical Standard Rotation explicitly casts Unbound Flow P1 before switching out, proving the source event required by BPP-TEAM-AERO; the weapon grants nearby on-field Resonators Aero DMG Amplification for 30 seconds after Rover (Aero) casts Unbound Flow.',
    'Prydwen Echo Usage explicitly places Reminiscence: Fleurdelys right after Unbound Flow P1 and before switching out, so the source cast event required by echo-active-damage-v1 is proven for this profile sequence.',
    'Unbound Flow P2 occurs automatically off-field after switching out.',
  ],
  unresolvedSemantics: [
    'No exact source-backed total duration for this exact Standard Rotation was found. The source describes Rover (Aero) rotation time as lengthy but does not publish rotationSeconds for the fixed sequence.',
    'Without exact execution timing, Bellibing cannot prove which later Resonance Skill damage events overlap the 6-second BPP-SKILL healing window and must not invent per-action timestamps or blanket uptime.',
    'The source sequence retains Skyfall Severance as optional, so a fixed engine path must not silently execute or omit that branch without an explicit supported variant rule.',
    'Because the exact rotation duration remains unresolved, the profile cannot supply a verified DPS denominator and must remain SOURCE_SEQUENCE_ONLY even though the Unbound Flow and Fleurdelys cast events themselves are source-proven.',
  ],
  closesPendingExecutionIds: [],
} as const;

export const DEFIERS_THORN_DEF_EXECUTION_REVIEW_20260830 = {
  reviewId: 'WEAPON-EXECUTION-DEFIERS-THORN-DEF-2026-08-30-01',
  effectId: 'DT-DEF',
  checkedAt: '2026-08-30',
  disposition: 'SOURCE_SEMANTICS_BLOCKED',
  blockerId: 'BUG-011',
  sourceLabels: ['Wuthering Waves Wiki', 'Wutheringlab'],
  sourceUrls: [
    'https://wutheringwaves.fandom.com/wiki/Defier%27s_Thorn',
    'https://wutheringlab.com/weapon/defiers-thorn/',
  ],
  notes: [
    'Independent current sources preserve the same clause: "15s after casting Intro Skill or Basic Attacks" before the DEF-ignore effect.',
    'The wording does not cleanly distinguish a 15-second delay, a 15-second post-trigger window, or another timing grammar. No executable duration/uptime is inferred.',
    'Only DT-DEF is parked. The independently source-defined DT-AERO-AMP target-state branch can use the shared Aero Erosion target-state adapter.',
  ],
} as const;
