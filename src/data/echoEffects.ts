import type { EchoEffectModel } from '../echoEffectDomain.ts';
import { ECHO_MAIN_SLOT_EFFECT_MODELS } from './echoMainSlotEffects.ts';

const V915_URL = 'https://docs.google.com/spreadsheets/d/1E_6YNe3OED6kihXWK6IQ8D-DcwdkuuAXvlG3ZtgkbP0/edit';
const RAW_SNAPSHOT_URL = 'https://github.com/DommyMM/wuwabuild/tree/0a2e49c649c857c690be709577e6ce98832b2d43/public/Data';
const CHECKED_AT = '2026-08-23';

function p(sourceLabels: readonly string[], sourceUrls: readonly string[]) {
  return {
    sourceLabels: ['V9.15 DPS Buffs', 'Bellibing raw Echo snapshot', ...sourceLabels],
    sourceUrls: [V915_URL, RAW_SNAPSHOT_URL, ...sourceUrls],
    checkedAt: CHECKED_AT,
  } as const;
}

/**
 * Source-backed Echo non-damage effect catalog.
 *
 * Permanent main-slot effects come from the current roster-wide Echo skill
 * review. Conditional transfer/cast effects below retain their independently
 * audited trigger semantics. Missing source semantics remain in the separate
 * Echo skill source-review pending-adapter register; absence here never means
 * that an Echo has no effect.
 */
export const ECHO_EFFECT_MODELS: readonly EchoEffectModel[] = [
  {
    effectId: 'FALLACY_TEAM_ATK',
    echoId: 'echo-60000605',
    statOrEffect: 'ATK%',
    value: 0.10,
    activation: 'ON_ECHO_CAST',
    trigger: 'Cast Fallacy of No Return Echo Skill',
    durationSeconds: 20,
    appliesTo: 'TEAM',
    mechanicsStatus: 'VERIFIED_MODELED',
    notes: 'Reusable team buff; V9.15 consumes the same effect for Shorekeeper and Chisa packages rather than duplicating Echo mechanics.',
    provenance: p(
      ['Wuthering Waves Wiki', 'WutheringTools'],
      [
        'https://wutheringwaves.fandom.com/wiki/Fallacy_of_No_Return/Echo',
        'https://www.wutheringtools.com/',
      ],
    ),
  },
  {
    effectId: 'FALLACY_WIELDER_ER',
    echoId: 'echo-60000605',
    statOrEffect: 'Energy Regen',
    value: 0.10,
    activation: 'ON_ECHO_CAST',
    trigger: 'Cast Fallacy of No Return Echo Skill',
    durationSeconds: 20,
    appliesTo: 'WIELDER',
    mechanicsStatus: 'VERIFIED_MODELED',
    notes: 'Explicitly separate from the +10% team ATK. V9.15 notes that Shorekeeper receives this ER but Augusta does not.',
    provenance: p(
      ['Wuthering Waves Wiki', 'Wuthering.wiki raw skill data'],
      [
        'https://wutheringwaves.fandom.com/wiki/Fallacy_of_No_Return/Echo',
        'https://wuthering.wiki/monster_330000070.html',
      ],
    ),
  },
  {
    effectId: 'REMINISCENCE_DENIA_INCOMING_FUSION',
    echoId: 'echo-60002005',
    statOrEffect: 'Fusion DMG Bonus',
    value: 0.12,
    activation: 'TRANSFER_WINDOW',
    trigger: 'Within 15s after summoning Reminiscence: Denia, the wielder casts Outro Skill',
    activationWindowSeconds: 15,
    durationSeconds: 15,
    appliesTo: 'INCOMING_RESONATOR',
    mechanicsStatus: 'VERIFIED_CONDITIONAL',
    notes: 'The value and windows are verified; Aemeath rotation timing remains responsible for proving that the transfer occurs.',
    provenance: p(
      ['Wuthering Waves Wiki', 'Wuthering.gg'],
      [
        'https://wutheringwaves.fandom.com/wiki/Reminiscence%3A_Denia',
        'https://wuthering.gg/echos/reminiscence-denia',
      ],
    ),
  },
  {
    effectId: 'HYVATIA_INCOMING_ALL_ATTRIBUTE',
    echoId: 'echo-60001895',
    statOrEffect: 'All Attribute DMG Bonus',
    value: 0.10,
    activation: 'TRANSFER_WINDOW',
    trigger: 'Within 15s after summoning Hyvatia, the wielder casts Outro; the next Resonator uses Intro Skill',
    activationWindowSeconds: 15,
    durationSeconds: 15,
    appliesTo: 'INCOMING_RESONATOR',
    requiresIncomingIntro: true,
    mechanicsStatus: 'VERIFIED_CONDITIONAL',
    notes: 'The transfer is not automatic just because Hyvatia is equipped. Team/rotation state must prove Outro inside the window and the incoming Intro condition.',
    provenance: p(
      ['Prydwen', 'Wutheringlab', 'Wuwa Wiki'],
      [
        'https://www.prydwen.gg/wuthering-waves/echoes/',
        'https://wutheringlab.com/echo/hyvatia/',
        'https://wuwa.wiki/en/codex/echoes/60001895',
      ],
    ),
  },
  ...ECHO_MAIN_SLOT_EFFECT_MODELS,
];
