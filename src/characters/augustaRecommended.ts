import type { CharacterRollProfile } from '../targetCheckpointPolicy.ts';

/**
 * Augusta's currently active V9.15 Recommended rolling profile.
 *
 * This is the migration/parity target for Roll Assistant. It is intentionally
 * separate from the verified Augusta Personal Rotation DPS evaluator: the
 * legacy profile supplies the first stable checkpoint policy, while later
 * DPS-aware decisions may improve on it without changing Echo Core.
 */
export const AUGUSTA_RECOMMENDED_V915: CharacterRollProfile = {
  id: 'AUGUSTA_RECOMMENDED_V915',
  characterId: 'Augusta',
  targetMode: 'RECOMMENDED',
  firstCheckLevel: 5,
  requiredUsefulHits: 1,
  targets: [
    { name: 'CRIT DMG', role: 'CORE', minimum: 0.21 },
    { name: 'CRIT Rate', role: 'CORE', minimum: 0.093 },
    { name: 'ATK%', role: 'USEFUL', minimum: 0.064 },
    { name: 'Energy Regen', role: 'USEFUL', minimum: 0.068 },
    { name: 'Heavy Attack DMG', role: 'USEFUL', minimum: 0.064 },
  ],
  nonTargetRoles: {
    'Flat ATK': 'FILLER',
    'Basic Attack DMG': 'FILLER',
    'Skill DMG': 'FILLER',
    'Liberation DMG': 'FILLER',
    'HP%': 'DEAD',
    'Flat HP': 'DEAD',
    'DEF%': 'DEAD',
    'Flat DEF': 'DEAD',
  },
  slots: [
    { cost: 4, primaryMain: 'CRIT Rate' },
    { cost: 3, primaryMain: 'Electro DMG' },
    { cost: 3, primaryMain: 'Electro DMG' },
    { cost: 1, primaryMain: 'ATK%' },
    { cost: 1, primaryMain: 'ATK%' },
  ],
  provenance: 'Current V9.15 Build Simulator Recommended profile + V1.2.13 Bellibing Budget checkpoint policy, verified 2026-08-22.',
};
