import {productAsset} from '../assets.js';
import {escapeHtml as escape} from '../../ui-lab/v1.1/modules/util.js';

export function previewStage(path, kind, view) {
 const source = productAsset(path);
 const compact = view === 'icon';
 return `<div class="wc-art wb-art wb-art-${kind} ${compact ? 'wb-compact' : ''}"><img src="${escape(source)}" alt="" draggable="false"><button class="wb-view-switch" data-wb-view="${compact ? 'art' : 'icon'}" aria-label="${compact ? 'Show large artwork' : 'Show compact icon'}">${compact ? 'Artwork' : 'Icon'}</button></div>`;
}

export function compactReading(title, brief, fullText) {
 return `<details class="wc-reading wb-reading"><summary><span class="wb-reading-title">${escape(title)}</span><span class="wb-brief">${escape(brief)}</span></summary><div class="wb-full">${fullText}</div></details>`;
}

export function echoSkillOverview(skill) {
 if (!skill) return compactReading('Echo Skill', 'Pending', '<p>Pending source verification</p>');
 // Compact descriptions retain the reviewed source conditions and magnitudes.
 const briefs = {
  'echo-60001215': 'Transform into the Echo to deal Electro DMG.',
  'echo-60000975': 'Charge forward and sweep to deal Aero DMG.',
  'echo-60001615': 'Parry an attack, then counter with Electro DMG.',
  'echo-60000235': 'Fire a bouncing dart that deals Aero DMG.',
  'echo-60000285': 'Transform into the Echo to restore HP.'
 };
 const firstParagraph = skill.skillDescription.split('\n')[0];
 const description = skill.skillDescription.replace(/\s*CD:\s*[\d.]+s\.?\s*$/, '');
 const cooldown = Number.isFinite(skill.cooldownSeconds) ? `<small class="wb-cooldown">CD <b>${skill.cooldownSeconds}s</b></small>` : '';
 const sovereignBonuses = skill.skillDescription.match(/gains ([\d.]+%) Electro DMG Bonus and ([\d.]+%) Heavy Attack DMG Bonus/);
 const sovereignBrief = firstParagraph.replace(' and dash forward in a spinning strike, dealing', ', dealing') + (sovereignBonuses ? `\nMain slot\n${sovereignBonuses[1]} Electro DMG Bonus\n${sovereignBonuses[2]} Heavy Attack DMG Bonus` : '');
 const brief = skill.echoId === 'echo-60001215' ? sovereignBrief : briefs[skill.echoId] ?? firstParagraph;
 return `<details class="wc-reading wb-reading wb-echo-skill"><summary><span class="wb-reading-title">Echo Skill ${cooldown}</span><span class="wb-brief">${escape(brief)}</span></summary><div class="wb-full"><p>${escape(description)}</p></div></details>`;
}

function shortSetEffect(set, section) {
 if (section.reviewStatus === 'SOURCE_CONFLICT') return 'Pending source verification';
 if (set.id === 'sonata-20' && section.pieces === 3) {
  const values = section.description.match(/^ATK% (\+[\d.]+%) per stack;.*?CRIT DMG (\+[\d.]+%) per stack;/);
  if (values) return 'Gain a Shield → gain a stack\nATK ' + values[1] + ' per stack\nCRIT DMG ' + values[2] + ' per stack';
 }
 if (section.description.length <= 145) return section.description;
 return section.description.includes('Trigger:') ? 'Conditional set bonus' : 'Set bonus';
}

export function sonataOverview(set, equipped, slot, preview) {
 if (!set) return '';
 const proposed = equipped.map((echo, index) => index === slot ? preview : echo);
 const count = new Set(proposed.filter(echo => echo?.selectedSonataSetId === set.id).map(echo => echo.speciesId)).size;
 const content = set.sections.map(section => {
  const reached = count >= section.pieces;
  return `<div class="wb-set-threshold ${reached ? 'wb-reached' : ''}"><span>${Math.min(count, section.pieces)}/${section.pieces}<small>${section.pieces}-piece</small></span><span>${escape(shortSetEffect(set, section)).replaceAll('\n', '<br>')}</span></div>`;
 }).join('');
 const full = set.sections.map(section => `<div class="wc-effect"><strong>${section.pieces}-piece · ${count >= section.pieces ? 'Reached in preview' : 'Not reached'}</strong><p>${escape(section.description).replaceAll('; ', '<br>')}</p></div>`).join('');
 return `<details class="wc-reading wb-reading wb-set-reading"><summary><span class="wb-reading-title">Sonata effect</span><span class="wb-set-brief">${content}</span></summary><div class="wb-full">${full}</div></details>`;
}

export function weaponEffectsOverview(effects, rank) {
 if (!effects.length) return '<section class="wb-weapon-effects"><h4>Weapon effect</h4><p>Pending source verification</p></section>';
 return `<section class="wb-weapon-effects"><h4>Weapon effect</h4>${effects.map(effect => {
  const value = effect.rankValues[rank - 1];
  const formatted = effect.valueUnit === 'DECIMAL_MULTIPLIER' ? `${Number((value * 100).toFixed(2))}%` : String(value);
  return `<article class="wb-effect-block"><small>${escape(effect.trigger)}</small><div class="wb-effect-benefit"><span>${escape(effect.statOrEffect)}</span><b>${escape(formatted)}${effect.maxStacks > 1 ? '<small> per stack</small>' : ''}</b></div><p>${escape(effect.sourceEffectText ?? 'Pending source verification')}</p>${effect.conditions?.length ? `<p>${effect.conditions.map(escape).join('. ')}.</p>` : ''}</article>`;
 }).join('')}</section>`;
}

