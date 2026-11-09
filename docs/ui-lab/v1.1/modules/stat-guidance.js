import contexts from './character-contexts.json' with {type:'json'};
import {SUBSTAT_VALUE_TABLE, SUBSTAT_VALUE_PROBABILITIES} from '../../../assets/echoCoreRules.js';
import {escapeHtml} from './util.js';

// Initial presentation profiles, checked against the existing reviewed guide
// priorities in docs/ui-lab/v1.1/modules/character-contexts.json.
// These marks describe preference, not calculated targets or DPS readiness.
const profiles = {
 augusta: {
  favorites: ['CRIT Rate', 'CRIT DMG', 'ATK%', 'Heavy Attack DMG'],
  conditional: ['Energy Regen']
 },
 iuno: {
  favorites: ['CRIT Rate', 'CRIT DMG', 'Liberation DMG'],
  conditional: ['Energy Regen']
 },
 mornye: {
  favorites: ['Energy Regen'],
  conditional: []
 },
 // Owner-supplied Hsin build reference in this local UI review.
 hsin: {
  favorites: ['CRIT Rate', 'CRIT DMG', 'ATK%', 'Skill DMG'],
  conditional: []
 }
};

// Reuse the reviewed guide's leading priority groups for presentation only.
// This never turns a preference into an acceptance requirement or a DPS weight.
function sourcePreference(characterId) {
 const rows = contexts.characters.find(row => row.characterId === characterId)?.recommendations?.substatPriorities ?? [];
 const aliases = {'ATK':'Flat ATK','HP':'Flat HP','DEF':'Flat DEF','Resonance Skill DMG%':'Skill DMG','Skill DMG%':'Skill DMG','Resonance Liberation DMG%':'Liberation DMG','Liberation DMG%':'Liberation DMG','Basic Attack DMG%':'Basic Attack DMG','Heavy Attack DMG%':'Heavy Attack DMG'};
 const favorites = rows.flatMap(row => row.sourceText.split('>').slice(0,3).flatMap(group => group.split('='))).map(name => name.replace(/\([^)]*\)/g,'').trim()).map(name => aliases[name] ?? name).filter(name => Object.hasOwn(SUBSTAT_VALUE_TABLE,name));
 return {favorites, conditional:[]};
}

export function statPreference(characterId, name) {
 const profile = profiles[characterId] ?? sourcePreference(characterId);
 if (profile?.favorites.includes(name)) {
  return `<span class="wb-stat-priority" role="img" aria-label="Priority stat"></span>`;
 }
 if (profile?.conditional.includes(name)) {
  return `<span class="wb-stat-priority" role="img" aria-label="Energy Regen as needed; depends on team and rotation"></span>`;
 }
 return '';
}

export function rollPresentation(name, value, label) {
 const values = SUBSTAT_VALUE_TABLE[name];
 const index = values?.findIndex(candidate => Math.abs(candidate - value) < 1e-12) ?? -1;
 if (index < 0) return escapeHtml(label);
 // Eight-step ladders use 3 / 3 / 2 bands. Four-step ladders use 2 / 1 / 1.
 // Bands describe magnitude; the canonical probability is kept separately.
 const lowerEnd = values.length === 8 ? 3 : 2;
 const upperStart = values.length === 8 ? 6 : 3;
 const tier = index < lowerEnd ? 'lower' : index < upperStart ? 'middle' : 'upper';
 const weights = SUBSTAT_VALUE_PROBABILITIES[name];
 const chance = weights[index] / weights.reduce((sum, weight) => sum + weight, 0) * 100;
 const exact = name.startsWith('Flat ') ? String(value) : Number((value * 100).toFixed(2)) + '%';
 const tooltip = `${exact} · ${tier} roll · ${chance.toFixed(2)}% chance when this stat rolls`;
 return `<span class="wb-roll-tier wb-roll-${tier}" title="${escapeHtml(tooltip)}">${label}</span>`;
}

export function rollSignalMarkup() {
 return "<span class=\"wb-roll-signal\" aria-hidden=\"true\"><svg viewBox=\"0 0 240 14\" preserveAspectRatio=\"none\"><path class=\"wb-signal-wave\" d=\"M0 7 C20 1 40 13 60 7 S100 1 120 7 S160 13 180 7 S220 1 240 7\"/><path class=\"wb-signal-trail\" d=\"M0 7 C20 1 40 13 60 7 S100 1 120 7 S160 13 180 7 S220 1 240 7\"/><path class=\"wb-signal-particles\" d=\"M0 7 C20 1 40 13 60 7 S100 1 120 7 S160 13 180 7 S220 1 240 7\"/></svg></span>";
}

