// Isolated design model. No production modules, persistence, account or evaluator APIs.
const [echoCatalog, weaponCatalog] = await Promise.all([
    fetch('../../ui-prototypes/assets/echoes/browser-data.json').then(r => { if (!r.ok)
        throw Error('Echo catalog unavailable'); return r.json(); }),
    fetch('../../ui-prototypes/assets/weapons/browser-data.json').then(r => { if (!r.ok)
        throw Error('Weapon catalog unavailable'); return r.json(); })
]);
const app = document.querySelector('#app'), catalogEcho = id => echoCatalog.echoes.find(e => e.id === id), catalogWeapon = id => weaponCatalog.weapons.find(e => e.id === id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icons = { bag: 'M5 7h14l1 14H4L5 7zm4 0V5a3 3 0 0 1 6 0v2', echo: 'M12 2l8 5v10l-8 5-8-5V7l8-5zm0 5l4 5-4 5-4-5 4-5z', sword: 'M5 3l12 12m-1-8l1 8-8-1M3 21l5-5m-2-3l5 5M7 3l14 14-4 4L3 7V3h4z', arrow: 'M4 12h15m-6-6l6 6-6 6', back: 'M20 12H5m6-6l-6 6 6 6', search: 'M20 20l-5-5m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z', plus: 'M12 5v14M5 12h14', close: 'M6 6l12 12M6 18L18 6', cube: 'M12 3l9 5v9l-9 5-9-5V8l9-5zm0 10v9m-9-14l9 5 9-5', scan: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M6 12h12', check: 'M5 12l4 4L20 5', team: 'M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 21v-6a6 6 0 0 1 12 0v6m1-9a5 5 0 0 1 7 5v4', spark: 'M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6L12 2z' };
const icon = n => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[n] ?? icons.echo}"/></svg>`;
document.querySelectorAll('[data-icon]').forEach(e => e.innerHTML = icon(e.dataset.icon));
const characters = { augusta: { name: 'Augusta', initial: 'A', element: 'Electro', weaponType: 'Broadblade' }, jiyan: { name: 'Jiyan', initial: 'J', element: 'Aero', weaponType: 'Broadblade' }, calcharo: { name: 'Calcharo', initial: 'C', element: 'Electro', weaponType: 'Broadblade' } };
const portrait = id => `<span class="portrait ${id}" aria-hidden="true">${characters[id].initial}</span>`;
let serial = 0;
// Original geometric concept illustrations, intentionally not reproductions of game artwork.
function art(item, large = false) {
    const seed = String(item.catalogId ?? item.id ?? '').split('').reduce((n, c) => n + c.charCodeAt(0), 0), id = `a${++serial}`, weapon = item.kind === 'weapon';
    const hue = weapon ? 155 : 195 + seed % 110, color = weapon ? '#9dbeb0' : `hsl(${hue} 24% 65%)`, accent = weapon ? '#cdb879' : '#c5ab72';
    const shapes = weapon ? `<g transform="rotate(31 120 105)"><path d="M114 24L126 13 136 26 130 135 120 146 110 135z" fill="url(#${id})" stroke="${color}"/><path d="M116 28l4 106 7-107" fill="none" stroke="#e9e5c7" stroke-width="2"/><path d="M98 137l22-8 24 8-7 9-17-7-16 7z" fill="${accent}"/><path d="M116 143h8l3 30-7 9-7-9z" fill="#9d9475"/><path d="M112 180l8-5 8 5-8 9z" fill="${accent}"/></g>` :
        seed % 3 === 0 ? `<path d="M120 45L90 27l7 38-42-19 22 55-27 32 49-12 21 53 21-53 49 12-27-32 22-55-42 19 7-38z" fill="url(#${id})" stroke="${color}"/><path d="M120 59l-15 47 15 39 15-39zM88 81l18 16m46-16l-18 16" stroke="${accent}" fill="none" stroke-width="2"/>` :
            seed % 3 === 1 ? `<path d="M120 36l-17 45-62-27 25 46 36 14 18 54 18-54 36-14 25-46-62 27z" fill="url(#${id})" stroke="${color}"/><path d="M51 65l48 31-21 5m111-36l-48 31 21 5M120 58v77" stroke="${accent}" fill="none" stroke-width="2"/><circle cx="120" cy="101" r="11" fill="#bdb896"/>` :
                `<path d="M120 39l27 24 35 9-13 39-17 40-32 20-32-20-17-40-13-39 35-9z" fill="url(#${id})" stroke="${color}"/><path d="M91 62L72 24l35 30m42 8l19-38-35 30M83 93l25 12-10 18m59-30l-25 12 10 18M120 82v58l-15 11h30z" stroke="${accent}" fill="none" stroke-width="2"/>`;
    return `<svg class="art" viewBox="0 0 240 200" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" x2="1" y2="1"><stop stop-color="${color}" stop-opacity=".75"/><stop offset=".5" stop-color="#283a40"/><stop offset="1" stop-color="#10191c"/></linearGradient></defs><ellipse cx="120" cy="176" rx="64" ry="9" fill="#000" opacity=".25"/><circle cx="120" cy="100" r="75" stroke="${accent}" fill="none" opacity=".12"/><path d="M120 12v12m0 152v12M32 100h12m152 0h12" stroke="${accent}" opacity=".35"/>${shapes}</svg>`;
}
const rollNames = ['CRIT Rate', 'CRIT DMG', 'ATK%', 'Heavy Attack DMG', 'Energy Regen'];
const canonicalRoll = (name, index = 2) => ({ name, value: echoCatalog.statEditor.substats.find(s => s.name === name).values[index] });
function echo(id, catalogId, level = 25, main = 'ATK%', setId = null, quantity) { const e = catalogEcho(catalogId); if (!e)
    throw Error('Missing canonical demo Echo'); return { id, kind: 'echo', catalogId, name: e.name, cost: e.cost, level, rank: 5, main, sonataId: setId ?? e.sonataSetIds[0], rolls: rollNames.slice(0, level / 5).map(n => canonicalRoll(n)), ...(quantity ? { quantity } : {}) }; }
function initial() { return { items: [echo('e1', 'echo-60000395', 25, 'CRIT Rate'), echo('e2', 'echo-60000195', 25, 'Electro DMG'), echo('e3', 'echo-60000125', 25, 'ATK%', 'sonata-3'), echo('e4', 'echo-60000045', 25, 'ATK%', 'sonata-3'), echo('e5', 'echo-60000015', 25, 'ATK%', 'sonata-3'), echo('e6', 'echo-60000525', 25, 'CRIT DMG'), echo('e7', 'echo-60000395', 10, 'CRIT DMG'), echo('e8', 'echo-60000125', 5, 'Electro DMG', 'sonata-3'), echo('e9', 'echo-60000395', 0, 'CRIT Rate', null, 12), echo('e10', 'echo-60000085', 0, 'ATK%', null, 4), ...['verdant-summit', 'verdant-summit', 'lustrous-razor', 'ages-of-harvest', 'autumntrace', 'helios-cleaver'].map((catalogId, i) => { const w = catalogWeapon(catalogId); return { id: `w${i + 1}`, kind: 'weapon', catalogId, name: w.name, level: 90, refinement: 1, rarity: w.rarity, weaponType: w.weaponType }; })], builds: { augusta: { slots: ['e1', 'e2', 'e3', 'e4', 'e5'], weapon: 'w1' }, jiyan: { slots: ['e6', null, null, null, null], weapon: 'w3' } }, resources: { tuners: 680, premium: 18, advanced: 24, medium: 36, basic: 12 } }; }
let model = initial(), route = '', category = 'echo', selected = { echo: 'e7', weapon: 'w2' }, filter = 'all', query = '', character = 'augusta', target = null, assign = null, editor = null, addCharacter = false, addSelected = 'calcharo', scanner = false, resourcesOpen = false, helpOpen = false, inventoryScroll = 0, noticeTimer;
const itemById = id => model.items.find(e => e.id === id), items = () => model.items.filter(e => e.kind === category), sonata = item => echoCatalog.sonataSets.find(s => s.id === item.sonataId)?.name ?? '';
function equipped(id) { for (const [cid, b] of Object.entries(model.builds)) {
    if (b.weapon === id)
        return { character: cid, kind: 'weapon' };
    const slot = b.slots.indexOf(id);
    if (slot >= 0)
        return { character: cid, slot, kind: 'echo' };
} return null; }
const quantity = e => e.quantity ?? 1;
const fmt = (name, value) => Number.isFinite(value) ? (name.startsWith('Flat') ? String(value) : `${Number((value * 100).toFixed(3))}%`) : '—';
const mainValue = e => echoCatalog.statEditor.mainStatsByCostAndLevel[e.cost][e.level].find(s => s.name === e.main)?.value;
function say(text) { const n = document.querySelector('#notice'); n.textContent = text; n.classList.add('show'); clearTimeout(noticeTimer); noticeTimer = setTimeout(() => n.classList.remove('show'), 4500); }
function nav(to) { if (to === 'inventory')
    location.hash = 'inventory';
else
    location.hash = to; if (route === to)
    render(); }
function card(e, { build = false, slot } = {}) { const own = equipped(e.id), w = e.kind === 'weapon'; return `<button class="item-card${!build && selected[category] === e.id ? ' selected' : ''}" ${build ? `data-choose-slot="${slot}"` : `data-item="${e.id}" aria-pressed="${selected[category] === e.id}"`} title="${esc(e.name)}${own ? ' · ' + characters[own.character].name : ''}" aria-label="${esc(build ? 'Choose Echo slot ' + (slot + 1) + ', ' + e.name : e.name + ', ' + (e.quantity ? 'stack of ' + e.quantity : 'level ' + e.level) + (own ? ', equipped by ' + characters[own.character].name : ''))}"><h3>${esc(e.name)}</h3><div class="meta"><span>${w ? `${e.rarity}★ · ${e.weaponType}` : 'COST ' + e.cost}</span><span>${w ? 'Lv. ' + e.level : '+' + e.level}</span></div>${art(e)}${own && !build ? `<span class="owner-tag"><span class="owner-dot">${characters[own.character].initial}</span>${characters[own.character].name}</span>` : ''}<div class="item-main"><span>${esc(w ? catalogWeapon(e.catalogId).secondary?.stat : e.main)}</span><span class="quantity">${e.quantity ? '×' + e.quantity : w ? 'R' + e.refinement : fmt(e.main, mainValue(e))}</span></div></button>`; }
function header(title, meta = '', actions = '') { return `<div class="page-head"><div><div class="eyebrow">${route === 'inventory' ? 'YOUR COLLECTION' : route === 'build' ? 'YOUR CHARACTERS' : 'BELLIBING'}</div><h1>${title}${meta ? `<span class="heading-meta">${meta}</span>` : ''}</h1></div><div class="head-actions">${actions}</div></div>`; }
function home() { return `<section class="view-entry"><div class="home-intro"><span class="eyebrow">EVERY BUILD STARTS SOMEWHERE</span><h1>Make your next move.</h1></div><div class="home-cards">${[['build', 'Build a Character', 'sword'], ['improve', 'Improve a Character', 'echo'], ['teams', 'Build a Team', 'team']].map(([id, title, type], i) => `<a class="home-card${i === 1 ? ' featured' : ''}" href="#${id}"><h2>${title}</h2>${art({ catalogId: 'home' + i, kind: type === 'sword' ? 'weapon' : 'echo' })}<span class="entry">${i === 0 ? 'Start building' : i === 1 ? 'Find your next upgrade' : 'Bring your roster together'} ${icon('arrow')}</span></a>`).join('')}</div><div class="continue-row">${portrait(character)}<div><strong>Continue with ${characters[character].name}</strong><p>Build & equipment</p></div><a href="#build">Pick up where you left off ${icon('arrow')}</a></div></section>`; }
function resources() { return resourcesOpen ? `<section class="resource-strip" aria-label="Demo resources"><span>${icon('cube')}<strong>${model.resources.tuners}</strong><small>Premium Tuners</small></span>${['premium', 'advanced', 'medium', 'basic'].map(id => `<span><strong>${model.resources[id]}</strong><small>${id[0].toUpperCase() + id.slice(1)} Tubes</small></span>`).join('')}</section>` : ''; }
function inventory() {
    const own = items(), list = own.filter(e => (filter === 'all' || filter === 'free' && !equipped(e.id) || filter === 'equipped' && equipped(e.id) || filter === 'zero' && e.level === 0) && (`${e.name} ${e.main ?? ''} ${sonata(e)}`).toLowerCase().includes(query.toLowerCase()));
    let e = itemById(selected[category]);
    if (e?.kind !== category)
        e = null;
    return `${target ? `<div class="context-return"><button data-return-build>${icon('back')} ${characters[target.character].name} / ${target.kind === 'weapon' ? 'Weapon' : 'Echo ' + (target.slot + 1)}</button><small>Choose an owned ${target.kind === 'weapon' ? 'Weapon' : 'Echo'} · Current changes only when you equip</small></div>` : ''}${header('Inventory', '', `<button class="resource-button" data-resources aria-expanded="${resourcesOpen}">${icon('cube')} Resources</button>${own.length ? `<button class="gold" data-new-item>${icon('plus')} Add ${category === 'echo' ? 'Echo' : 'Weapon'}</button>` : ''}`)}${resources()}<div class="workspace"><section class="collection" aria-label="Owned items"><div class="collection-bar"><div class="tabs" role="group" aria-label="Inventory categories">${[['echo', 'Echoes', 'echo'], ['weapon', 'Weapons', 'sword']].map(([id, label, glyph]) => `<button data-category="${id}" class="${category === id ? 'active' : ''}" aria-pressed="${category === id}">${icon(glyph)}${label} <small>${model.items.filter(e => e.kind === id).reduce((n, e) => n + quantity(e), 0)}</small></button>`).join('')}</div><label class="search">${icon('search')}<input id="search" aria-label="Search owned items" placeholder="Search ${category === 'echo' ? 'Echoes' : 'Weapons'}" value="${esc(query)}"></label></div><div class="filters" role="group" aria-label="Filter owned items">${[['all', 'All'], ['free', 'Unequipped'], ['equipped', 'Equipped'], ...(category === 'echo' ? [['zero', '+0 stacks']] : [])].map(([id, label]) => `<button data-filter="${id}" class="${filter === id ? 'active' : ''}" aria-pressed="${filter === id}">${label}</button>`).join('')}<span class="count">${list.length} ${list.length === 1 ? 'entry' : 'entries'}</span></div>${list.length ? `<div class="item-grid">${list.map(e => card(e)).join('')}</div>` : `<div class="empty">${icon(category === 'echo' ? 'echo' : 'sword')}<h2>${own.length ? 'No matching items' : category === 'echo' ? 'Your Echoes start here.' : 'Your Weapons start here.'}</h2><p>${own.length ? 'Try a different name or clear your filters.' : `Add the ${category === 'echo' ? 'Echoes' : 'Weapons'} you actually own. Equip them when you’re ready.`}</p><button class="gold" ${own.length ? 'data-clear-filters' : 'data-new-item'}>${icon(own.length ? 'search' : 'plus')} ${own.length ? 'Clear filters' : 'Add your first ' + (category === 'echo' ? 'Echo' : 'Weapon')}</button>${!own.length ? '<span class="minor muted">Scanner will join this same flow.</span>' : ''}</div>`}</section>${editor ? editorView() : e ? inspector(e) : `<aside class="inspector empty-inspector">${icon('echo')}<h3>Select an item</h3><p>Its details stay beside your collection.</p></aside>`}</div>`;
}
function inspector(e) {
    const own = equipped(e.id), w = e.kind === 'weapon', stats = w ? [{ name: 'ATK', value: catalogWeapon(e.catalogId).level90BaseAtk, raw: true }, { name: catalogWeapon(e.catalogId).secondary.stat, value: catalogWeapon(e.catalogId).secondary.value }] : [{ name: e.main, value: mainValue(e) }, echoCatalog.statEditor.secondaryMainStatsByCostAndLevel[e.cost][e.level], ...e.rolls];
    return `<aside class="inspector${assign ? ' assigning' : ''}" aria-label="Selected item details"><div class="eyebrow"><span>${w ? e.rarity + '★ · ' + e.weaponType : 'COST ' + e.cost + ' · RANK 5'}</span><span>${w ? 'Lv. ' + e.level + ' · R' + e.refinement : '+' + e.level}${e.quantity ? ' · ×' + e.quantity : ''}</span></div><h2>${esc(e.name)}</h2>${!w ? `<div class="sonata-label">◇ ${esc(sonata(e))}</div>` : ''}${art(e, true)}<div class="art-label">CONCEPT ILLUSTRATION</div><div class="stats">${stats.map((s, i) => `<div class="stat-line${i === 0 ? ' primary' : ''}"><span>${esc(s.name)}</span><strong>${s.raw ? s.value : fmt(s.name, s.value)}</strong></div>`).join('')}${!w && e.level === 0 ? '<div class="stat-line"><small>No observed substats yet</small></div>' : ''}</div><div class="equipped-line">${own ? `<span class="owner-dot">${characters[own.character].initial}</span><span>Equipped by <strong>${characters[own.character].name}</strong></span><button class="text-link" data-view-owner="${own.character}">View Build ${icon('arrow')}</button>` : `${icon('bag')}<span>${e.quantity ? e.quantity + ' unequipped copies' : 'Unequipped · in your Inventory'}</span>`}</div>${assign ? assignmentView(e) : `<button class="gold inspector-action" data-start-equip data-guide-anchor="equip">${icon(w ? 'sword' : 'echo')} ${target ? 'Equip to ' + characters[target.character].name : 'Equip to Character'}</button>${own ? '<button class="subtle-action" data-unequip>Unequip · keep in Inventory</button>' : ''}${!w && !e.quantity ? '<button class="subtle-action" data-edit-item>Edit observed rolls</button>' : ''}`}</aside>`;
}
function assignmentView(e) { const cid = assign.character, b = model.builds[cid], own = equipped(e.id), slot = assign.slot, other = e.kind === 'echo' ? b.slots.filter((_, i) => i !== slot && b.slots[i] !== e.id).map(itemById).filter(Boolean) : [], cost = other.reduce((n, e) => n + e.cost, 0) + (e.cost ?? 0), duplicate = other.some(x => x.catalogId === e.catalogId), compatible = e.kind !== 'weapon' || e.weaponType === characters[cid].weaponType, invalid = !compatible || e.kind === 'echo' && (cost > 12 || duplicate), transfer = own && own.character !== cid, replaced = itemById(e.kind === 'weapon' ? b.weapon : b.slots[slot]); return `<div class="assignment"><div class="button-row"><h3>Equip to</h3><button class="quiet" data-cancel-equip aria-label="Cancel equipping">${icon('close')}</button></div><div class="character-choices">${Object.keys(model.builds).map(id => `<button data-assign-character="${id}" class="${cid === id ? 'active' : ''}" aria-pressed="${cid === id}">${portrait(id)}${characters[id].name}</button>`).join('')}</div>${e.kind === 'echo' ? `<span class="input-label">Echo slot</span><div class="slot-options">${b.slots.map((id, i) => `<button data-assign-slot="${i}" class="${i === slot ? 'active' : ''}" title="${itemById(id)?.name ?? 'Empty slot'}" aria-label="Echo slot ${i + 1}" aria-pressed="${i === slot}">${i + 1}</button>`).join('')}</div>` : ''}${invalid ? `<p class="inline-note" role="alert">${!compatible ? 'This Character needs a ' + characters[cid].weaponType : duplicate ? 'This Echo type is already in this Build.' : 'Total Echo Cost would be ' + cost + ' / 12. Choose another slot.'}</p>` : transfer ? `<p class="inline-note">Move this item from ${characters[own.character].name} to ${characters[cid].name}? ${characters[own.character].name}’s slot will be empty.</p>` : replaced && replaced.id !== e.id ? `<p class="inline-note">${esc(replaced.name)} returns to Inventory.</p>` : e.quantity ? '<p class="inline-note">Uses one copy from this +0 stack.</p>' : ''}<button class="gold wide" data-confirm-equip ${invalid ? 'disabled' : ''}>${transfer ? 'Move & equip' : 'Equip to ' + characters[cid].name}</button><button class="subtle-action" data-cancel-equip>Cancel</button></div>`; }
function build() { const c = characters[character], b = model.builds[character], weapon = itemById(b.weapon); return `${header('Build a Character', '', `<a href="#inventory" class="inventory-link">${icon('bag')} Open Inventory</a>`)}<div class="build-layout"><aside class="roster"><div class="eyebrow">OWNED CHARACTERS</div>${Object.keys(model.builds).map(id => `<button class="roster-row${character === id ? ' active' : ''}" data-character="${id}" aria-pressed="${character === id}">${portrait(id)}<span>${characters[id].name}<small>${characters[id].element} · ${characters[id].weaponType}</small></span></button>`).join('')}<button class="add-character" data-add-character>${icon('plus')} Add Character</button></aside><section class="build-surface">${addCharacter ? newCharacterView() : `<div class="build-head"><div><span class="eyebrow">YOUR BUILD</span><h2>${c.name}</h2></div><span class="portrait ${character}" style="width:64px;height:64px;font-size:28px">${c.initial}</span></div><div class="build-context"><span>Level <strong>90</strong></span><span>Sequence <strong>S1</strong></span><span>Weapon type <strong>${c.weaponType}</strong></span><span>Demo build</span></div><div class="build-weapon">${weapon ? art(weapon) : icon('sword')}<div><span class="eyebrow">WEAPON</span><h3>${weapon ? esc(weapon.name) : 'Choose an owned Weapon'}</h3><p>${weapon ? 'Lv. ' + weapon.level + ' · Rank ' + weapon.refinement : 'No Weapon equipped'}</p></div><button data-choose-weapon>Choose from Inventory ${icon('arrow')}</button></div><div class="button-row"><h3>Equipped Echoes</h3><span class="heading-meta">${b.slots.map(itemById).filter(Boolean).reduce((n, e) => n + e.cost, 0)} / 12 Cost</span></div><div class="build-echo-grid">${b.slots.map((id, i) => `<div class="slot-item"><div class="slot-label">ECHO ${i + 1}</div>${id ? card(itemById(id), { build: true, slot: i }) : `<button class="item-card wide" data-choose-slot="${i}" aria-label="Choose Echo slot ${i + 1}">${icon('plus')}<span class="muted" style="font-size:11px">Choose Echo</span></button>`}</div>`).join('')}</div><div class="build-bottom"><p>Owned items stay in Inventory when replaced.</p><a class="gold-link" href="#improve">Improve this Character ${icon('arrow')}</a></div>`}</section></div>`; }
function newCharacterView() { const missing = Object.keys(characters).filter(id => !model.builds[id]); return `<section class="inline-surface"><div class="inline-head"><h2>Add a Character</h2><button class="quiet" data-close-add aria-label="Close Add Character">${icon('close')}</button></div><div class="button-row"><button data-manual class="${!scanner ? 'gold' : ''}">${icon('plus')} Manual entry</button><button data-scanner>${icon('scan')} Scanner <small>· planned</small></button></div>${scanner ? `<p class="inline-note">Scanner will open a review here. Nothing is read or imported in this concept.</p>` : `${missing.length ? `<div class="new-character-grid">${missing.map(id => `<button data-add-select="${id}" class="${addSelected === id ? 'active' : ''}" aria-pressed="${addSelected === id}">${portrait(id)}<span>${characters[id].name}</span></button>`).join('')}</div><button class="gold" data-confirm-character>Add ${characters[addSelected]?.name ?? 'Character'} to demo account</button>` : '<p>All three demonstration Characters have been added.</p>'}`}</section>`; }
function future() { const type = route === 'teams' ? 'team' : route === 'sandbox' ? 'spark' : 'echo', title = route === 'teams' ? 'Build a Team' : route === 'sandbox' ? 'Echo Sandbox' : 'Improve a Character'; return `${header(title)}<section class="future-card">${icon(type)}<span class="eyebrow">NAVIGATION PREVIEW</span><h2 style="margin-top:10px">${route === 'improve' ? 'Current stays yours.' : route === 'sandbox' ? 'A place to experiment.' : 'Your Characters, together.'}</h2>${route === 'teams' ? `<div class="team-trio">${Object.keys(model.builds).map(portrait).join('')}</div>` : ''}<p>${route === 'improve' ? `Improve will read ${characters[character].name}’s equipped items. Its Candidate remains separate until an explicit Build action.` : route === 'sandbox' ? 'Hypothetical Echoes live here. Simulating never adds items to your real Inventory.' : 'Future saved teams reference your owned Characters and their equipment. They do not create copies of your items.'}</p><a href="#build" class="gold-link">Back to ${characters[character].name} ${icon('arrow')}</a><p style="font-size:10px;margin-bottom:0">This concept does not run Improve, Teams or simulation.</p></section>`; }
function render() { const focus = document.activeElement?.id, buttonFocus = app.contains(document.activeElement) && document.activeElement?.tagName === 'BUTTON' ? JSON.stringify({ ...document.activeElement.dataset }) : null; app.innerHTML = `${helpOpen ? '<div class="help-note">Optional help is planned: a gold outline marks the next action while the page stays interactive. It will never start automatically.<button data-close-help>Close</button></div>' : ''}${route === 'inventory' ? inventory() : route === 'build' ? build() : ['improve', 'sandbox', 'teams'].includes(route) ? future() : home()}`; document.querySelectorAll('[data-nav]').forEach(a => { a.classList.toggle('active', a.dataset.nav === route); a.toggleAttribute('aria-current', a.dataset.nav === route); if (a.dataset.nav === route)
    a.setAttribute('aria-current', 'page'); }); if (focus === 'search') {
    const input = document.querySelector('#search');
    input?.focus();
    input?.setSelectionRange(input.value.length, input.value.length);
} if (buttonFocus) {
    const match = [...app.querySelectorAll('button')].find(b => JSON.stringify({ ...b.dataset }) === buttonFocus);
    (match ?? app.querySelector('[data-confirm-equip], [data-cancel-editor]'))?.focus({ preventScroll: true });
} document.querySelector('#emptyDemo').textContent = model.items.length ? 'Try empty inventory' : 'Restore demo inventory'; }
function release(id) { const o = equipped(id); if (!o)
    return; if (o.kind === 'weapon')
    model.builds[o.character].weapon = null;
else
    model.builds[o.character].slots[o.slot] = null; }
function confirmEquip() { const e = itemById(selected[category]); if (!e || !assign)
    return; const cid = assign.character, b = model.builds[cid]; let id = e.id; if (e.quantity) {
    e.quantity--;
    const copy = { ...structuredClone(e), id: `demo-split-${++serial}` };
    delete copy.quantity;
    model.items.push(copy);
    id = copy.id;
    if (!e.quantity)
        model.items = model.items.filter(i => i !== e);
}
else
    release(id); if (e.kind === 'weapon')
    b.weapon = id;
else
    b.slots[assign.slot] = id; selected[category] = id; character = cid; target = null; assign = null; say(`${e.name} equipped to ${characters[cid].name} · demo only`); render(); }
function unequip() { const e = itemById(selected[category]); release(e.id); if (e.kind === 'echo' && e.level === 0) {
    const stack = model.items.find(x => x.quantity && x.catalogId === e.catalogId && x.main === e.main && x.sonataId === e.sonataId && x.rank === e.rank && x.quantity < 999);
    if (stack) {
        stack.quantity++;
        model.items = model.items.filter(x => x !== e);
        selected[category] = stack.id;
    }
} say('Unequipped. The item is still in Inventory.'); render(); }
function editorView() { const e = editor.item, adding = editor.adding, available = category === 'echo' ? echoCatalog.echoes.filter(x => ['echo-60000395', 'echo-60000195', 'echo-60000125', 'echo-60000045'].includes(x.id)) : weaponCatalog.weapons.filter(x => ['verdant-summit', 'lustrous-razor', 'autumntrace'].includes(x.id)); return `<aside class="inspector editor-inline"><div class="button-row"><h2>${adding ? 'Add ' + (category === 'echo' ? 'Echo' : 'Weapon') : 'Observed rolls'}</h2><button class="quiet" data-cancel-editor aria-label="Cancel editor">${icon('close')}</button></div>${adding ? `<label class="input-label">${category === 'echo' ? 'Echo' : 'Weapon'}</label><div class="choice-grid">${available.map(x => `<button data-editor-catalog="${x.id}" class="${e.catalogId === x.id ? 'active' : ''}">${esc(x.name)}</button>`).join('')}</div>` : `<p style="font-size:12px">${esc(e.name)} · +${e.level}</p>`}${category === 'echo' ? `<span class="input-label">Main Stat</span><div class="choice-grid">${echoCatalog.statEditor.mainStatsByCostAndLevel[e.cost][e.level].map(x => `<button data-editor-main="${x.name}" class="${e.main === x.name ? 'active' : ''}">${esc(x.name)}</button>`).join('')}</div><div class="entry-editor">${[5, 10, 15, 20, 25].map((level, i) => `<details ${i === editor.stage ? 'open' : ''}><summary>+${level} <strong>${e.rolls[i] ? esc(e.rolls[i].name) + ' · ' + fmt(e.rolls[i].name, e.rolls[i].value) : 'Not recorded'}</strong></summary><div class="choice-grid">${echoCatalog.statEditor.substats.filter(s => !e.rolls.some((r, n) => n !== i && r.name === s.name)).map(s => `<button data-roll-name="${s.name}" data-stage="${i}" class="${editor.stat === s.name ? 'active' : ''}" ${i > e.rolls.length ? 'disabled' : ''}>${esc(s.name)}</button>`).join('')}</div>${editor.stage === i && editor.stat ? `<div class="choice-grid">${echoCatalog.statEditor.substats.find(s => s.name === editor.stat).values.map(v => `<button data-roll-value="${v}" data-stage="${i}">${fmt(editor.stat, v)}</button>`).join('')}</div>` : ''}</details>`).join('')}</div>` : `<p class="inline-note">Demonstration Weapon · Level 90 · Rank 1. Real registration will review actual level and rank.</p>`}<button class="gold wide" style="margin-top:20px" data-save-editor>${adding ? 'Add to demo Inventory' : 'Save demo Echo'}</button><button class="subtle-action" data-cancel-editor>Cancel</button></aside>`; }
function startEditor(adding) { const source = adding ? (category === 'echo' ? echo(`demo-item-${++serial}`, 'echo-60000395', 0, 'CRIT Rate') : { id: `demo-item-${++serial}`, kind: 'weapon', catalogId: 'verdant-summit', name: 'Verdant Summit', level: 90, refinement: 1, rarity: 5, weaponType: 'Broadblade' }) : itemById(selected[category]); editor = { adding, item: structuredClone(source), stage: Math.min(source.rolls?.length ?? 0, 4), stat: null }; assign = null; render(); }
app.addEventListener('input', event => { if (event.target.id === 'search') {
    query = event.target.value;
    render();
} });
app.addEventListener('click', event => {
    const b = event.target.closest('button');
    if (!b || b.disabled)
        return;
    const d = b.dataset;
    if (d.category) {
        category = d.category;
        filter = 'all';
        query = '';
        editor = null;
        assign = null;
        target = null;
        render();
    }
    else if (d.item) {
        selected[category] = d.item;
        assign = null;
        editor = null;
        render();
    }
    else if (d.filter) {
        filter = d.filter;
        render();
    }
    else if ('clearFilters' in d) {
        filter = 'all';
        query = '';
        render();
    }
    else if ('resources' in d) {
        resourcesOpen = !resourcesOpen;
        render();
    }
    else if ('startEquip' in d) {
        assign = { character: target?.character ?? character, slot: target?.slot ?? 0 };
        render();
    }
    else if (d.assignCharacter) {
        assign.character = d.assignCharacter;
        render();
    }
    else if ('assignSlot' in d) {
        assign.slot = Number(d.assignSlot);
        render();
    }
    else if ('confirmEquip' in d)
        confirmEquip();
    else if ('cancelEquip' in d) {
        assign = null;
        render();
    }
    else if ('unequip' in d)
        unequip();
    else if (d.viewOwner) {
        character = d.viewOwner;
        target = null;
        nav('build');
    }
    else if ('chooseSlot' in d || 'chooseWeapon' in d) {
        category = 'chooseWeapon' in d ? 'weapon' : 'echo';
        target = { character, kind: category, slot: 'chooseSlot' in d ? Number(d.chooseSlot) : null };
        filter = 'all';
        query = '';
        const id = category === 'weapon' ? model.builds[character].weapon : model.builds[character].slots[target.slot];
        if (id)
            selected[category] = id;
        assign = null;
        editor = null;
        nav('inventory');
    }
    else if ('returnBuild' in d) {
        character = target.character;
        target = null;
        assign = null;
        nav('build');
    }
    else if (d.character) {
        character = d.character;
        addCharacter = false;
        render();
    }
    else if ('addCharacter' in d) {
        addCharacter = true;
        scanner = false;
        addSelected = Object.keys(characters).find(id => !model.builds[id]) ?? 'calcharo';
        render();
    }
    else if ('closeAdd' in d) {
        addCharacter = false;
        render();
    }
    else if ('scanner' in d) {
        scanner = true;
        render();
    }
    else if ('manual' in d) {
        scanner = false;
        render();
    }
    else if (d.addSelect) {
        addSelected = d.addSelect;
        render();
    }
    else if ('confirmCharacter' in d) {
        if (!model.builds[addSelected]) {
            model.builds[addSelected] = { slots: Array(5).fill(null), weapon: null };
            character = addSelected;
            addCharacter = false;
            say('Character added to demonstration account');
            render();
        }
    }
    else if ('newItem' in d)
        startEditor(true);
    else if ('editItem' in d)
        startEditor(false);
    else if ('cancelEditor' in d) {
        editor = null;
        render();
    }
    else if (d.editorCatalog) {
        const x = category === 'echo' ? catalogEcho(d.editorCatalog) : catalogWeapon(d.editorCatalog);
        editor.item = category === 'echo' ? echo(editor.item.id, x.id, 0, echoCatalog.statEditor.mainStatsByCostAndLevel[x.cost][0][0].name) : { ...editor.item, catalogId: x.id, name: x.name, rarity: x.rarity, weaponType: x.weaponType };
        editor.stage = 0;
        editor.stat = null;
        render();
    }
    else if (d.editorMain) {
        editor.item.main = d.editorMain;
        render();
    }
    else if (d.rollName) {
        editor.stat = d.rollName;
        editor.stage = Number(d.stage);
        render();
    }
    else if ('rollValue' in d) {
        const i = Number(d.stage);
        editor.item.rolls[i] = { name: editor.stat, value: Number(d.rollValue) };
        editor.item.level = editor.item.rolls.length * 5;
        editor.stage = Math.min(i + 1, 4);
        editor.stat = null;
        render();
    }
    else if ('saveEditor' in d) {
        const e = editor.item;
        if (editor.adding)
            model.items.push(e);
        else
            model.items[model.items.findIndex(x => x.id === e.id)] = e;
        selected[category] = e.id;
        editor = null;
        query = '';
        filter = 'all';
        say('Saved in demonstration Inventory only');
        render();
    }
    else if ('closeHelp' in d) {
        helpOpen = false;
        render();
    }
});
document.querySelector('#help').onclick = () => { helpOpen = !helpOpen; render(); };
document.querySelector('#resetDemo').onclick = () => { model = initial(); selected = { echo: 'e7', weapon: 'w2' }; character = 'augusta'; target = null; assign = null; editor = null; filter = 'all'; query = ''; addCharacter = false; say('Demonstration reset. No account data was touched.'); render(); };
document.querySelector('#emptyDemo').onclick = () => { if (!model.items.length) {
    model = initial();
    selected = { echo: 'e7', weapon: 'w2' };
}
else {
    model.items = [];
    for (const b of Object.values(model.builds)) {
        b.slots = Array(5).fill(null);
        b.weapon = null;
    }
    selected = { echo: null, weapon: null };
} target = null; assign = null; editor = null; filter = 'all'; query = ''; nav('inventory'); };
document.addEventListener('keydown', e => { if (e.key === 'Escape') {
    assign = null;
    editor = null;
    helpOpen = false;
    addCharacter = false;
    render();
} });
window.addEventListener('hashchange', () => { if (route === 'inventory')
    inventoryScroll = window.scrollY; route = location.hash.slice(1) || 'home'; assign = null; editor = null; render(); window.scrollTo(0, route === 'inventory' ? inventoryScroll : 0); });
route = location.hash.slice(1) || 'home';
render();
