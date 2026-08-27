import type { CharacterActionFact } from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-27';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const TUNE_BREAK_PATCH_NOTES = 'https://wutheringwaves.gg/patch-notes-for-version-3-0-we-who-see-the-stars/';
const AALTO_SOURCE = 'https://wuthering.gg/characters/aalto';
const AEMEATH_SOURCE = 'https://www.prydwen.gg/wuthering-waves/characters/aemeath';
const AUGUSTA_SOURCE = 'https://wuwa.incin.net/resonators/1306';
const BAIZHI_SOURCE = 'https://wuthering.gg/characters/baizhi';
const BRANT_SOURCE = 'https://wuthering.gg/characters/brant';

const SYSTEM_CONTEXT = 'Current Version 3.x shared Tune Break combat-system damage. The Character source entry defines availability/variant semantics but exposes no Character Lv1-Lv10 motion-value table; the shared combat-system formula is intentionally not fabricated here.';

function tuneBreak(input: {
  characterId: string;
  factId: string;
  name: string;
  sourceLabel: string;
  sourceUrl: string;
  notes?: readonly string[];
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
      sourceLabels: [
        'wuwabuild normalized Character snapshot — exact pinned upstream commit',
        input.sourceLabel,
        'Version 3.0 patch-notes mirror — shared Tune Break combat mechanic',
      ],
      sourceUrls: [SOURCE_SNAPSHOT, input.sourceUrl, TUNE_BREAK_PATCH_NOTES],
      checkedAt: CHECKED_AT,
      notes: [
        'The pinned roster candidate exposes exactly one current Tune Break entry for this released Character.',
        'Version 3.0 introduced Tune Break as a shared combat mechanic: attacks build Off-Tune, a Mistune target can be hit by Tune Break for additional damage, and landing Tune Break resets Off-Tune. The character entry itself does not provide a Character skill-level damage curve.',
        'Bellibing therefore verifies the Character-owned access/variant semantics while keeping the unmodeled shared Tune Break damage formula outside Character motion-value fields.',
      ],
    },
    notes: input.notes,
  };
}

export const AALTO_TUNE_BREAK_FACT = tuneBreak({
  characterId: 'aalto',
  factId: 'aalto-tune-break-pistols',
  name: 'Tune Break — Pistols',
  sourceLabel: 'Wuthering.gg — current Aalto Tune Break entry',
  sourceUrl: AALTO_SOURCE,
  notes: ["When the target's Off-Tune Level is full, Aalto may cast Tune Break on the target. No Aalto-specific coefficient table is exposed."],
});

export const AEMEATH_TUNE_BREAK_FACT = tuneBreak({
  characterId: 'aemeath',
  factId: 'aemeath-tune-break-unlanded-melody',
  name: 'Tune Break — Unlanded Melody',
  sourceLabel: 'Prydwen — current Aemeath Tune Break entry',
  sourceUrl: AEMEATH_SOURCE,
  notes: [
    "When the target's Off-Tune Level is full, Aemeath can cast Tune Break. Pressing Normal Attack shortly afterward casts Basic Attack Stage 3.",
    'When a team Resonator triggers Tune Break and causes Tune Rupture - Interfered, Aemeath triggers Tune Rupture Response - Starburst; the same target can be damaged by Starburst once every 8 seconds.',
    'Starburst owns its existing source-verified Character damage fact separately. This Tune Break fact records the shared-system action and transition semantics without duplicating Starburst motion values.',
  ],
});

export const AUGUSTA_TUNE_BREAK_FACT = tuneBreak({
  characterId: 'augusta',
  factId: 'augusta-tune-break-broadblade',
  name: 'Tune Break — Broadblade',
  sourceLabel: 'Wuthering Waves DB — current Augusta Tune Break entry',
  sourceUrl: AUGUSTA_SOURCE,
  notes: ["When the target's Off-Tune Level is full, Augusta may cast Tune Break on the target. No Augusta-specific coefficient table is exposed."],
});

export const BAIZHI_TUNE_BREAK_FACT = tuneBreak({
  characterId: 'baizhi',
  factId: 'baizhi-tune-break-rectifier',
  name: 'Tune Break — Rectifier',
  sourceLabel: 'Wuthering.gg — current Baizhi Tune Break entry',
  sourceUrl: BAIZHI_SOURCE,
  notes: ["When the target's Off-Tune Level is full, Baizhi may cast Tune Break on the target. No Baizhi-specific coefficient table is exposed."],
});

export const BRANT_TUNE_BREAK_FACT = tuneBreak({
  characterId: 'brant',
  factId: 'brant-tune-break-sword',
  name: 'Tune Break — Sword',
  sourceLabel: 'Wuthering.gg — current Brant Tune Break entry',
  sourceUrl: BRANT_SOURCE,
  notes: ["When the target's Off-Tune Level is full, Brant may cast Tune Break on the target. No Brant-specific coefficient table is exposed."],
});

export const CHARACTER_TUNE_BREAK_FACTS: readonly CharacterActionFact[] = [
  AALTO_TUNE_BREAK_FACT,
  AEMEATH_TUNE_BREAK_FACT,
  AUGUSTA_TUNE_BREAK_FACT,
  BAIZHI_TUNE_BREAK_FACT,
  BRANT_TUNE_BREAK_FACT,
] as const;
