import type { CharacterActionFact } from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-29';
const SYSTEM_CONTEXT = 'Current Version 3.x shared Tune Break combat-system damage. The Character source entry defines access/variant semantics but exposes no Character Lv1-Lv10 motion-value table; the shared combat-system formula is intentionally not fabricated here.';

function tuneBreak(input: {
  characterId: string;
  factId: string;
  name: string;
  sourceLabels: readonly string[];
  sourceUrls: readonly string[];
  notes: readonly string[];
}): CharacterActionFact {
  return {
    factId: input.factId,
    characterId: input.characterId,
    kind: 'ACTION',
    name: input.name,
    section: 'TUNE_BREAK',
    actionKind: 'TUNE_BREAK',
    actionRole: 'SHARED_SYSTEM_DAMAGE',
    damageClass: 'OTHER',
    scalingStat: 'SHARED_SYSTEM',
    motionValue: null,
    motionValueContext: SYSTEM_CONTEXT,
    hitCount: null,
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: {
      sourceLabels: input.sourceLabels,
      sourceUrls: input.sourceUrls,
      checkedAt: CHECKED_AT,
      notes: [
        'The Character entry owns access/variant semantics only; the shared Tune Break damage formula remains outside Character motion-value fields.',
        'Generated/imported review artifacts were not used as automatic truth sources.',
      ],
    },
    notes: input.notes,
  };
}

export const ROVER_ELECTRO_TUNE_BREAK_FACT = tuneBreak({
  characterId: 'rover-electro',
  factId: 'rover-electro-tune-break-sword',
  name: 'Tune Break — Sword',
  sourceLabels: [
    'Wuthering.gg — current Rover (Electro) Tune Break entry',
    'BWIKI/Biligame — current Rover (Electro) Tune Break entry',
  ],
  sourceUrls: [
    'https://wuthering.gg/characters/rover-electro',
    'https://wiki.biligame.com/wutheringwaves/%E5%85%B1%E9%B8%A3%E8%80%85/%E6%BC%82%E6%B3%8A%E8%80%85%C2%B7%E5%AF%BC%E7%94%B5',
  ],
  notes: [
    'Current sources identify Rover (Electro) as a Sword Resonator and expose Tune Break: Sword. No Tune Break Character coefficient is fabricated.',
  ],
});

export const SUISUI_TUNE_BREAK_FACT = tuneBreak({
  characterId: 'suisui',
  factId: 'suisui-tune-break-rectifier',
  name: 'Tune Break — Rectifier',
  sourceLabels: [
    'Wuthering Waves official Version 3.5 announcement — Suisui Rectifier identity',
    'Wuthering.gg — current Suisui Tune Break: Rectifier entry',
    'BWIKI/Biligame — current Suisui Tune Break: Rectifier entry',
  ],
  sourceUrls: [
    'https://steamcommunity.com/app/3513350/announcements/',
    'https://wuthering.gg/characters/suisui',
    'https://wiki.biligame.com/wutheringwaves/%E5%85%B1%E9%B8%A3%E8%80%85/%E7%A9%97%E7%A9%97',
  ],
  notes: [
    'Current official/current sources agree Suisui is a Rectifier Resonator and expose Tune Break: Rectifier.',
    'The pinned normalized source record 1110 says weapon Rectifier but contains a contradictory Tune Break: Gauntlets row plus other stale pre-update data. That row is rejected as stale/misaligned evidence rather than treated as a legitimate gameplay variant.',
  ],
});

export const FINAL_BLOCKER_RESOLVED_TUNE_BREAK_FACTS: readonly CharacterActionFact[] = [
  ROVER_ELECTRO_TUNE_BREAK_FACT,
  SUISUI_TUNE_BREAK_FACT,
] as const;
