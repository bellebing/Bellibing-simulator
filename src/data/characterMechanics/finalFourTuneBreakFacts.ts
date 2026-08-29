import type { CharacterActionFact } from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-29';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const TUNE_BREAK_PATCH_NOTES = 'https://wutheringwaves.gg/patch-notes-for-version-3-0-we-who-see-the-stars/';
const SYSTEM_CONTEXT = 'Current Version 3.x shared Tune Break combat-system damage. The Character source entry defines availability/variant semantics but exposes no Character Lv1-Lv10 motion-value table; the shared combat-system formula is intentionally not fabricated here.';

function tuneBreak(input: {
  characterId: string;
  factId: string;
  name: string;
  sourceLabel: string;
  sourceUrl: string;
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
      sourceLabels: [
        'wuwabuild normalized Character snapshot — exact pinned upstream commit',
        input.sourceLabel,
        'Version 3.0 patch-notes mirror — shared Tune Break combat mechanic',
      ],
      sourceUrls: [SOURCE_SNAPSHOT, input.sourceUrl, TUNE_BREAK_PATCH_NOTES],
      checkedAt: CHECKED_AT,
      notes: [
        'The pinned roster candidate exposes exactly one current Tune Break entry for this released Character.',
        'The Character entry owns access/variant/response semantics only; the shared Tune Break damage formula remains outside Character motion-value fields.',
        'This fact is source-verified independently from similarly named Character-owned Hack/Frazzle response damage facts and does not duplicate their coefficients.',
      ],
    },
    notes: input.notes,
  };
}

export const LUCY_TUNE_BREAK_FACT = tuneBreak({
  characterId: 'lucy',
  factId: 'lucy-tune-break-data-crash',
  name: 'Tune Break — Data Crash',
  sourceLabel: 'Wuthering.gg / Prydwen — current Lucy Data Crash Tune Break entry',
  sourceUrl: 'https://wuthering.gg/characters/lucy',
  notes: [
    'Current source exposes Data Crash as Lucy’s Tune Break access/response path alongside Hack - Interfered semantics. The separate Character-owned Hack Response - Data Crash damage fact retains its own HACK coefficient.',
  ],
});

export const REBECCA_TUNE_BREAK_FACT = tuneBreak({
  characterId: 'rebecca',
  factId: 'rebecca-tune-break-hack-meltdown',
  name: 'Tune Break — Hack - Meltdown',
  sourceLabel: 'Wuthering.gg / Prydwen — current Rebecca Hack - Meltdown Tune Break entry',
  sourceUrl: 'https://wuthering.gg/characters/rebecca',
  notes: [
    'Current source exposes Hack - Meltdown as Rebecca’s Tune Break access/response path. The separate Character-owned Hack Response - Meltdown damage fact retains its own HACK coefficient.',
  ],
});

export const ZANI_TUNE_BREAK_FACT = tuneBreak({
  characterId: 'zani',
  factId: 'zani-tune-break-gauntlets',
  name: 'Tune Break — Gauntlets',
  sourceLabel: 'Wuthering.gg — current Zani Tune Break entry',
  sourceUrl: 'https://wuthering.gg/characters/zani',
  notes: [
    "When the target's Off-Tune Level is full, Zani may cast Tune Break. Her Heavy Attack + Spectro Frazzle Character facts remain separate from shared Tune Break damage.",
  ],
});

export const LUUK_HERSSEN_TUNE_BREAK_FACT = tuneBreak({
  characterId: 'luuk-herssen',
  factId: 'luuk-herssen-tune-break-silent-debate-of-light',
  name: 'Tune Break — Silent Debate of Light',
  sourceLabel: 'Wuthering.gg / Prydwen — current Luuk Herssen Silent Debate of Light Tune Break entry',
  sourceUrl: 'https://wuthering.gg/characters/luuk-herssen',
  notes: [
    'Silent Debate of Light carries Luuk Herssen’s current Tune Strain/Tune Break response semantics. The Character-owned Tune Strain response passive remains separate; no shared-system damage coefficient is fabricated.',
  ],
});

export const FINAL_FOUR_TUNE_BREAK_FACTS: readonly CharacterActionFact[] = [
  LUCY_TUNE_BREAK_FACT,
  REBECCA_TUNE_BREAK_FACT,
  ZANI_TUNE_BREAK_FACT,
  LUUK_HERSSEN_TUNE_BREAK_FACT,
] as const;
