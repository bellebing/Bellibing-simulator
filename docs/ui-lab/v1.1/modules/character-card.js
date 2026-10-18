import { WEAPON_CATALOG } from './catalog.js';
import { STAT_LABELS } from './lab-state.js';
import { assetURL, escapeHtml } from './util.js';

const weapons = new Map(WEAPON_CATALOG.map(weapon => [weapon.name, weapon]));
// Existing Augusta equipment context, moved from app.js; no other equipment or
// investment is inferred. Rarity always comes from the canonical export.
const equipmentContext = { augusta: { id: 'thunderflare-dominion', level: 90, rank: 1 } };
export function rarityClass(rarity) {
  return [1, 2, 3, 4, 5].includes(rarity) ? `rarity-${rarity}` : 'rarity-unknown';
}
export function characterCardModel(person, saved) {
  const weapon = weapons.get(saved.weapon) ?? null;
  const context = saved.sandboxBuild?{id:saved.sandboxBuild.weaponId,level:saved.sandboxBuild.baseline.weaponLevel,rank:saved.sandboxBuild.baseline.weaponRefinement}:equipmentContext[saved.id];
  return {
    person, rarity: [4, 5].includes(person.rarity) ? person.rarity : null,
    weapon, weaponContext: weapon && context && weapon.id === context.id ? context : null,
    sequence: Number.isInteger(saved.sequenceLevel) && saved.sequenceLevel >= 0 && saved.sequenceLevel <= 6 ? saved.sequenceLevel : null,
    forte: saved.forte?.schemaVersion === 1 ? saved.forte : null,
    stats: STAT_LABELS.map((label, index) => [index === 6 ? `${person.identityElement ?? 'Element'} DMG Bonus` : label === 'Skill DMG' ? 'Resonance Skill DMG' : label === 'Liberation DMG' ? 'Resonance Liberation DMG' : label, saved.stats[index]?.[0] ?? '—']),
  };
}
const image = (path, alt = '') => `<img src="${escapeHtml(assetURL(path))}" alt="${escapeHtml(alt)}" draggable="false">`;
export function sequenceMarkup(person, level, { labels = true } = {}) {
  const nodes = Array.from({ length: 6 }, (_, index) => {
    const sequence = 6 - index, chain = person.sequences.find(node => node.sequence === sequence);
    const known = level !== null && !!chain, active = known && sequence <= level;
    const status = known ? active ? 'active' : 'inactive' : 'unavailable';
    return `<span class="sequence-node node n${sequence} ${active ? 'is-active' : ''} ${!known ? 'is-unknown' : ''}" data-sequence="${sequence}" data-state="${status}" role="img" aria-label="S${sequence} ${status}" title="${escapeHtml(chain?.name ?? `S${sequence}`)} · ${status}">${chain?.art ? image(chain.art) : ''}${labels ? `<span class="seq-tag">S${sequence}${known ? '' : '?'}</span>` : ''}</span>`;
  }).join('');
  return `<div class="card-sequence seq-line" role="group" aria-label="${level === null ? 'Sequence unavailable' : `Sequence S${level}`}" data-level="${level ?? 'unknown'}">${nodes}${labels && level === null ? '<small>Unknown</small>' : ''}</div>`;
}
// Same five-column topology/coordinates as the existing read-only Skills/Forte
// renderer. No normalizer is called: its fresh-build defaults would invent MAX.
export function forteMarkup(person, investment) {
  if (!person.forte?.nodes.length) return '<p class="card-unavailable">Skills unavailable</p>';
  const position = node => node.kind === 'outro' ? { x: 50, y: 90 } : { x: 10 + node.column * 20, y: 62 - node.row * 22 - [0, 4, 9, 4, 0][node.column] };
  const nodes = person.forte.nodes;
  const lines = nodes.flatMap(node => node.parents.map(parentId => {
    const parent = nodes.find(item => item.id === parentId);
    if (!parent) return '';
    const a = position(parent), b = position(node);
    return `<path d="M${a.x} ${a.y} L${b.x} ${b.y}"/>`;
  })).join('');
  return `<div class="card-forte" role="group" aria-label="${escapeHtml(person.name)} read-only Forte"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>${nodes.map(node => {
    const p = position(node), raw = investment?.levels?.[node.role];
    const level = Number.isInteger(raw) && raw >= 0 && raw <= 10 ? raw : null;
    const active = node.kind === 'skill' ? level === null ? null : level > 0 : typeof investment?.enabled?.[node.id] === 'boolean' ? investment.enabled[node.id] : null;
    const status = node.kind === 'skill' ? level === null ? 'Level unavailable' : `Lv. ${level}` : active === null ? 'State unavailable' : active ? 'Unlocked' : 'Locked';
    return `<span class="card-forte-node ${node.kind} ${active ? 'is-active' : ''}" style="left:${p.x}%;top:${p.y}%" role="img" aria-label="${escapeHtml(node.name)} · ${status}" title="${escapeHtml(node.name)} · ${status}" data-skill-role="${node.role}">${node.art ? image(node.art) : '<span>?</span>'}${node.kind === 'skill' ? `<small data-skill-level="${node.role}">${level === null ? '—' : level}</small>` : ''}</span>`;
  }).join('')}</div>${!investment ? '<p class="card-unavailable">Levels unavailable</p>' : ''}`;
}

// Elegant is approved; earlier compositions remain explicitly reviewable.
export function heroVariation(search) {
  const variant = new URLSearchParams(search).get('hero');
  return ['baseline', 'elegant', 'cinematic'].includes(variant) ? variant : 'elegant';
}
function refinedHero(model, saved, variant) {
  const { person, rarity, sequence } = model, element = person.identityElement;
  const stars = `<div class="rarity-stars" role="img" aria-label="${rarity ? `${rarity}-star Character` : 'Character rarity unavailable'}">${rarity ? '★'.repeat(rarity) : 'Rarity —'}</div>`;
  const metadata = `<div class="hero-metadata">${saved.sandboxBuild || saved.id === 'augusta' ? '<span>Lv. 90</span><i aria-hidden="true">·</i>' : ''}<span class="character-element">${element ? image(`../../ui-prototypes/assets/builder-icons/elements/${element.toLowerCase()}.webp`, element) : '<span role="img" aria-label="Element unavailable">—</span>'}</span>${person.weaponType ? `<i aria-hidden="true">·</i><span>${escapeHtml(person.weaponType)}</span>` : ''}</div>`;
  return `<div class="character-hero ${rarityClass(rarity)}" data-hero="${variant}" data-rarity="${rarity ?? 'unknown'}"><div class="hero-visual"><div class="hero-lines"></div>${image(person.art, `${person.name} ${person.artStatus === 'HERO' ? 'Character artwork' : 'portrait; hero art unavailable'}`)}${sequenceMarkup(person, sequence, { labels:false })}</div><div class="hero-copy">${variant === 'cinematic' ? stars : ''}<h2>${escapeHtml(person.name)}</h2>${saved.id === 'augusta' ? '<div class="eyebrow">THE UNDEFEATED</div>' : ''}${variant === 'elegant' ? `<div class="hero-meta-row">${stars}${metadata}</div>` : metadata}</div></div>`;
}

export function mountCharacterCard(host, { hero = heroVariation(location.search) } = {}) {
  const expanded = new Map();
  let current;
  host.addEventListener('toggle', event => {
    if (event.target.id === 'characterSkills' && current) expanded.set(current, event.target.open);
  }, true);
  return {
    render(person, saved) {
      const previous = host.querySelector('#characterSkills');
      if (current && previous) expanded.set(current, previous.open);
      const model = characterCardModel(person, saved);
      current = person.id;
      const weapon = model.weapon, context = model.weaponContext, element = person.identityElement;
      const baselineHero = `<div class="character-hero ${rarityClass(model.rarity)}" data-rarity="${model.rarity ?? 'unknown'}"><div class="hero-lines"></div>${image(person.art, `${person.name} ${person.artStatus === 'HERO' ? 'Character artwork' : 'portrait; hero art unavailable'}`)}<span class="character-element">${element ? image(`../../ui-prototypes/assets/builder-icons/elements/${element.toLowerCase()}.webp`, element) : '<span role="img" aria-label="Element unavailable">—</span>'}</span>${sequenceMarkup(person, model.sequence)}<div class="hero-copy"><div class="eyebrow"${saved.id === 'augusta' ? '' : ' hidden'}>${saved.id === 'augusta' ? 'THE UNDEFEATED' : ''}</div><div class="rarity-stars" role="img" aria-label="${model.rarity ? `${model.rarity}-star Character` : 'Character rarity unavailable'}">${model.rarity ? '★'.repeat(model.rarity) : 'Rarity —'}</div><h2>${escapeHtml(person.name)}</h2><span>${saved.id === 'augusta' ? 'Lv. 90 · ' : ''}${escapeHtml(element ?? 'Element unavailable')}${person.weaponType ? ` · ${escapeHtml(person.weaponType)}` : ''}</span></div></div>`;
      host.innerHTML = `${hero === 'baseline' ? baselineHero : refinedHero(model, saved, hero)}
      <div class="weapon ${rarityClass(weapon?.rarity)}" data-weapon-id="${weapon?.id ?? ''}" data-rarity="${weapon?.rarity ?? 'unknown'}">${weapon?.art ? `<div class="weapon-art">${image(weapon.art, weapon.name)}</div>` : ''}<div class="weapon-copy"><small>WEAPON</small><strong>${escapeHtml(weapon?.name ?? 'Weapon unavailable')}</strong><span>${context ? `Lv. ${context.level} · R${context.rank}` : weapon ? 'Level / refinement unavailable' : '—'}</span></div></div>
      <details id="characterSkills" class="card-skills"${expanded.get(person.id) ? ' open' : ''}><summary>Skills <span class="chevron" aria-hidden="true">›</span></summary><div class="card-skills-body">${forteMarkup(person, model.forte)}</div></details>
      <div class="stats-heading"><h3>Character Stats</h3></div><table aria-label="${saved.sandboxBuild?'Sandbox stats Pending':'Current equipped Character stats'}"><tbody id="characterStats">${model.stats.map(([label, value]) => `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`).join('')}</tbody></table>`;
      host.querySelector('.character-hero > img, .hero-visual > img').classList.toggle('portrait-fallback', person.artStatus !== 'HERO');
    },
  };
}
