// Prototype-only adaptation of the existing forteMarkup. Source nodes and links retained; spacing accommodates names.
import {assetURL,escapeHtml} from '../ui-lab/v1.1/modules/util.js';
const image=(path,alt='')=>'<img src="'+escapeHtml(assetURL(path))+'" alt="'+escapeHtml(alt)+'" draggable="false">';
export function forteMarkup(person, investment) {
  if (!person.forte?.nodes.length) return '<p class="card-unavailable">Skills unavailable</p>';
  const position = node => node.kind === 'outro' ? { x: 50, y: 86 } : { x: 10 + node.column * 20, y: 50 - node.row * 18 - [0, 4, 9, 4, 0][node.column] };
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


