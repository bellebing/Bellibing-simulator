import type { EchoEffectMechanicsStatus, EchoEffectModel } from '../echoEffectDomain.ts';

const SOURCE_COMMIT = '5fa70b11f1d84fb644e4dbed47873708da0fe66f';
const SOURCE_URL = `https://github.com/DommyMM/wuwabuild/blob/${SOURCE_COMMIT}/public/Data/Echoes.json`;
const CHECKED_AT = '2026-08-29';

type MainSlotSourceKind = 'STRUCTURED_BONUS' | 'RENDERED_TEXT';
type MainSlotSourceRow = readonly [
  effectId: string,
  echoId: string,
  echoName: string,
  statOrEffect: string,
  value: number,
  mechanicsStatus: EchoEffectMechanicsStatus,
  sourceKind: MainSlotSourceKind,
];

const MAIN_SLOT_SOURCE_ROWS: readonly MainSlotSourceRow[] = [
  ['ECHO_60002215_AERO_DMG', 'echo-60002215', 'Calamity Effigy', 'Aero DMG Bonus', 0.10, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60000845_FUSION_DMG', 'echo-60000845', 'Dragon of Dirge', 'Fusion DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60000845_BASIC_ATTACK_DMG', 'echo-60000845', 'Dragon of Dirge', 'Basic Attack DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60000855_COORDINATED_ATTACK_DMG', 'echo-60000855', 'Hecate', 'Coordinated Attack DMG Bonus', 0.40, 'VERIFIED_MODELED', 'RENDERED_TEXT'],
  ['ECHO_60001605_AERO_DMG', 'echo-60001605', 'Lady of the Sea', 'Aero DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001605_RESONANCE_LIBERATION_DMG', 'echo-60001605', 'Lady of the Sea', 'Resonance Liberation DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001145_FUSION_DMG', 'echo-60001145', 'Lioness of Glory', 'Fusion DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001145_RESONANCE_LIBERATION_DMG', 'echo-60001145', 'Lioness of Glory', 'Resonance Liberation DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60000825_HAVOC_DMG', 'echo-60000825', 'Lorelei', 'Havoc DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60000825_BASIC_ATTACK_DMG', 'echo-60000825', 'Lorelei', 'Basic Attack DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60002175_FUSION_DMG', 'echo-60002175', 'Myriad Snare: Rustfire Chassis', 'Fusion DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60002175_HEAVY_ATTACK_DMG', 'echo-60002175', 'Myriad Snare: Rustfire Chassis', 'Heavy Attack DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001925_AERO_DMG', 'echo-60001925', 'Nameless Explorer', 'Aero DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001925_ECHO_SKILL_DMG', 'echo-60001925', 'Nameless Explorer', 'Echo Skill DMG Bonus', 0.20, 'VERIFIED_MODELED', 'RENDERED_TEXT'],
  ['ECHO_60000905_HAVOC_DMG', 'echo-60000905', 'Nightmare: Crownless', 'Havoc DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60000905_BASIC_ATTACK_DMG', 'echo-60000905', 'Nightmare: Crownless', 'Basic Attack DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60000865_AERO_DMG', 'echo-60000865', 'Nightmare: Feilian Beringal', 'Aero DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60000865_HEAVY_ATTACK_DMG', 'echo-60000865', 'Nightmare: Feilian Beringal', 'Heavy Attack DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001155_HAVOC_DMG', 'echo-60001155', 'Nightmare: Hecate', 'Havoc DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001155_ECHO_SKILL_DMG', 'echo-60001155', 'Nightmare: Hecate', 'Echo Skill DMG Bonus', 0.20, 'VERIFIED_MODELED', 'RENDERED_TEXT'],
  ['ECHO_60000875_HAVOC_DMG', 'echo-60000875', 'Nightmare: Impermanence Heron', 'Havoc DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60000875_HEAVY_ATTACK_DMG', 'echo-60000875', 'Nightmare: Impermanence Heron', 'Heavy Attack DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60000915_FUSION_DMG', 'echo-60000915', 'Nightmare: Inferno Rider', 'Fusion DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60000915_RESONANCE_SKILL_DMG', 'echo-60000915', 'Nightmare: Inferno Rider', 'Resonance Skill DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001135_GLACIO_DMG', 'echo-60001135', 'Nightmare: Kelpie', 'Glacio DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001135_AERO_DMG', 'echo-60001135', 'Nightmare: Kelpie', 'Aero DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001055_GLACIO_DMG', 'echo-60001055', 'Nightmare: Lampylumen Myriad', 'Glacio DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001055_COORDINATED_ATTACK_DMG', 'echo-60001055', 'Nightmare: Lampylumen Myriad', 'Coordinated Attack DMG Bonus', 0.30, 'VERIFIED_MODELED', 'RENDERED_TEXT'],
  ['ECHO_60000925_SPECTRO_DMG', 'echo-60000925', 'Nightmare: Mourning Aix', 'Spectro DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60000895_ELECTRO_DMG', 'echo-60000895', 'Nightmare: Tempest Mephis', 'Electro DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60000895_RESONANCE_SKILL_DMG', 'echo-60000895', 'Nightmare: Tempest Mephis', 'Resonance Skill DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60000885_ELECTRO_DMG', 'echo-60000885', 'Nightmare: Thundering Mephis', 'Electro DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60000885_RESONANCE_LIBERATION_DMG', 'echo-60000885', 'Nightmare: Thundering Mephis', 'Resonance Liberation DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001905_ENERGY_REGEN', 'echo-60001905', 'Reactor Husk', 'Energy Regen', 0.10, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001165_AERO_DMG', 'echo-60001165', 'Reminiscence: Fenrico', 'Aero DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001165_HEAVY_ATTACK_DMG', 'echo-60001165', 'Reminiscence: Fenrico', 'Heavy Attack DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001065_AERO_DMG', 'echo-60001065', 'Reminiscence: Fleurdelys', 'Aero DMG Bonus', 0.10, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001675_HAVOC_DMG', 'echo-60001675', 'Reminiscence: Threnodian - Leviathan', 'Havoc DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001675_RESONANCE_LIBERATION_DMG', 'echo-60001675', 'Reminiscence: Threnodian - Leviathan', 'Resonance Liberation DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001995_GLACIO_DMG', 'echo-60001995', 'Reminiscence: Threnodian - Voidborne Construct', 'Glacio DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001995_RESONANCE_LIBERATION_DMG', 'echo-60001995', 'Reminiscence: Threnodian - Voidborne Construct', 'Resonance Liberation DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60000835_GLACIO_DMG', 'echo-60000835', 'Sentry Construct', 'Glacio DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60000835_RESONANCE_SKILL_DMG', 'echo-60000835', 'Sentry Construct', 'Resonance Skill DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['FALSE_SOV_ELECTRO', 'echo-60001215', 'The False Sovereign', 'Electro DMG Bonus', 0.12, 'ALREADY_MODELED_UPSTREAM', 'STRUCTURED_BONUS'],
  ['FALSE_SOV_HEAVY', 'echo-60001215', 'The False Sovereign', 'Heavy Attack DMG Bonus', 0.12, 'ALREADY_MODELED_UPSTREAM', 'STRUCTURED_BONUS'],
  ['TPP_HAVOC', 'echo-60002185', 'Thousand-Puppet Pavilion', 'Havoc DMG Bonus', 0.12, 'ALREADY_MODELED_UPSTREAM', 'STRUCTURED_BONUS'],
  ['TPP_HEAVY', 'echo-60002185', 'Thousand-Puppet Pavilion', 'Heavy Attack DMG Bonus', 0.12, 'ALREADY_MODELED_UPSTREAM', 'STRUCTURED_BONUS'],
  ['ECHO_60000765_GLACIO_DMG', 'echo-60000765', 'Abyssal Patricius', 'Glacio DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001045_SPECTRO_DMG', 'echo-60001045', 'Capitaneus', 'Spectro DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001045_HEAVY_ATTACK_DMG', 'echo-60001045', 'Capitaneus', 'Heavy Attack DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001205_FUSION_DMG', 'echo-60001205', 'Corrosaurus', 'Fusion DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60002165_HEALING', 'echo-60002165', 'Forbidden Bastion', 'Healing Bonus', 0.10, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001125_AERO_DMG', 'echo-60001125', 'Kerasaur', 'Aero DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001125_RESONANCE_LIBERATION_DMG', 'echo-60001125', 'Kerasaur', 'Resonance Liberation DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001809_BASIC_ATTACK_DMG', 'echo-60001809', 'Twin Nova: Collapsar Blade', 'Basic Attack DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001795_SPECTRO_DMG', 'echo-60001795', 'Twin Nova: Nebulous Cannon', 'Spectro DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60001795_BASIC_ATTACK_DMG', 'echo-60001795', 'Twin Nova: Nebulous Cannon', 'Basic Attack DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
  ['ECHO_60000805_ELECTRO_DMG', 'echo-60000805', 'Vitreum Dancer', 'Electro DMG Bonus', 0.12, 'VERIFIED_MODELED', 'STRUCTURED_BONUS'],
];

function toEffect(row: MainSlotSourceRow): EchoEffectModel {
  const [effectId, echoId, echoName, statOrEffect, value, mechanicsStatus, sourceKind] = row;
  return {
    effectId,
    echoId,
    statOrEffect,
    value,
    activation: 'MAIN_SLOT_PASSIVE',
    trigger: `${echoName} equipped in the main Echo slot`,
    durationSeconds: null,
    appliesTo: 'WIELDER',
    mechanicsStatus,
    notes: mechanicsStatus === 'ALREADY_MODELED_UPSTREAM'
      ? 'Source-explicit main-slot bonus. Existing parity code already carries this value; consumers must not double count it.'
      : sourceKind === 'STRUCTURED_BONUS'
        ? 'Source-explicit permanent main-slot bonus from the upstream structured bonuses field.'
        : 'Source-explicit permanent main-slot bonus from the rendered English skill text; no trigger uptime is assumed.',
    provenance: {
      sourceLabels: [
        sourceKind === 'STRUCTURED_BONUS'
          ? 'wuwabuild Echo skill structured bonus'
          : 'wuwabuild Echo skill rendered English text',
      ],
      sourceUrls: [SOURCE_URL],
      checkedAt: CHECKED_AT,
      notes: [`Pinned upstream source commit ${SOURCE_COMMIT}.`],
    },
  };
}

export const ECHO_MAIN_SLOT_EFFECT_MODELS: readonly EchoEffectModel[] = MAIN_SLOT_SOURCE_ROWS.map(toEffect);
