import { FORTE_COLUMNS, normalizeForteState, forteValue } from './forte-ui.mjs';
// Visual concept only: fixed demonstration figures, no DPS/provider/optimizer implementation.
export function createHeroTeamConcept({ context, icon, art, esc, fmt, mainValue, itemById, render }) {
    const base = '../../ui-prototypes/assets/characters/';
    const names = { augusta: 'Augusta', iuno: 'Iuno', 'the-shorekeeper': 'Shorekeeper', jiyan: 'Jiyan', mortefi: 'Mortefi', verina: 'Verina', calcharo: 'Calcharo', sanhua: 'Sanhua', baizhi: 'Baizhi' };
    const asset = path => globalThis.BELLIBING_CONCEPT_ASSETS?.[path] ?? base + path;
    const photo = id => asset(`portraits/${id}.png`);
    const face = (id, small = false) => `<img class="team-face${small ? ' small' : ''}" src="${photo(id)}" alt="${names[id]}">`;
    const teams = [
        { id: 'augusta', name: 'Augusta Core', members: ['augusta', 'iuno', 'the-shorekeeper'], dps: 91400, shares: [62000, 19400, 10000], label: 'Balanced example' },
        { id: 'jiyan', name: 'Jiyan Vanguard', members: ['jiyan', 'mortefi', 'verina'], dps: 88200, shares: [69800, 12400, 6000], label: 'Saved example' },
        { id: 'double', name: 'Double Carry', members: ['augusta', 'jiyan', 'the-shorekeeper'], dps: 94600, shares: [44100, 42000, 8500], label: 'Highest single-team demo' },
        { id: 'calcharo', name: 'Calcharo Relay', members: ['calcharo', 'sanhua', 'baizhi'], dps: 72300, shares: [50000, 15300, 7000], label: 'Saved example' },
        { id: 'unmodeled', name: 'Unmodeled Variant', members: ['calcharo', 'sanhua', 'baizhi'], dps: null, shares: null, label: 'Model unavailable' }
    ];
    let motionCleanup = () => { };
    let circuitSlot = null, circuits = { 1: ['General Enhancement', 'General Enhancement', 'General Enhancement'], 2: ['General Enhancement', 'General Enhancement', 'General Enhancement'], 3: ['General Enhancement', 'General Enhancement', 'General Enhancement'] };
    let roundPlans = { 1: ['augusta', 'jiyan', null], 2: [null, null, null], 3: [null, null, null] };
    const allAssignments = () => Object.entries(roundPlans).flatMap(([r, p]) => Number(r) === round ? plan : p).filter(Boolean);
    let heroMode = 'still', skillsOpen = false, selectedSkill = 'circuit', selectedTeam = 'augusta', teamMode = 'saved', sort = 'saved', mode = 'matrix', round = 1, planLoaded = false, plan = roundPlans[1], activeAssignment = null, rotationOpen = false, modelDetails = false, rosterOpen = false;
    const number = n => new Intl.NumberFormat('en-US').format(n);
    const team = id => teams.find(t => t.id === id);
    function heroEcho(id, index) {
        const e = itemById(id);
        if (!e)
            return `<button class="hero-echo empty-hero-echo" data-choose-slot="${index}" aria-label="Choose Echo slot ${index + 1}">${icon('plus')}<span>Choose Echo ${index + 1}</span></button>`;
        const secondary = context().echoCatalog.statEditor.secondaryMainStatsByCostAndLevel[e.cost][e.level];
        return `<button class="hero-echo" data-workspace="${index}" aria-label="Edit ${esc(e.name)}, Echo ${index + 1}"><div class="hero-echo-head"><span>${index + 1} · ${esc(e.name)}</span><small>COST ${e.cost} · +${e.level}</small></div><div class="hero-echo-content"><span class="echo-mini">${art(e)}</span><div class="echo-stat-primary"><span>${esc(e.main)}</span><strong>${fmt(e.main, mainValue(e))}</strong></div><div class="echo-stat-secondary"><span>${esc(secondary.name)}</span><span>${fmt(secondary.name, secondary.value)}</span></div><div class="echo-rolls">${e.rolls.map(r => `<div><span>${esc(r.name)}</span><span>${fmt(r.name, r.value)}</span></div>`).join('')}</div></div></button>`;
    }
    const skillLabels = { 'normal-attack': 'Basic', skill: 'Skill', circuit: 'Forte', liberation: 'Liberation', intro: 'Intro' };
    const builderAsset = path => globalThis.BELLIBING_CONCEPT_ASSETS?.[path] ?? '/ui-prototypes/' + path;
    function skills(id) {
        const tree = globalThis.BELLIBING_HERO_PRESENTATION.characters.find(c => c.characterId === id);
        if (!tree || tree.status !== 'SOURCE_BACKED')
            return '<section class="hero-skills bellibing-card"><h3>Skills / Forte</h3><p>Source presentation pending</p></section>';
        const state = normalizeForteState(tree, null), active = tree.nodes.find(n => n.role === selectedSkill) ?? tree.nodes.find(n => n.role === 'circuit');
        return `<section class="hero-skills bellibing-card"><div class="section-heading"><h3>Skills / Forte</h3><span>Maxed demo investment</span></div><div class="forte-mini-tree" aria-label="Source-backed Forte branches">${FORTE_COLUMNS.map(role => `<div class="forte-strand">${tree.nodes.filter(n => n.column === FORTE_COLUMNS.indexOf(role) && n.row > 0).sort((a, b) => b.row - a.row).map(n => `<button data-hero-node="${n.role}" class="forte-minor ${n.kind}" aria-label="Inspect ${esc(n.name ?? 'Source node pending')}"><img src="${builderAsset(n.assetPath)}" alt="" draggable="false"></button>`).join('')}</div>`).join('')}</div><div class="forte-core" role="group" aria-label="Character Skills">${FORTE_COLUMNS.map(role => { const n = tree.nodes.find(n => n.role === role); return `<button data-hero-node="${role}" class="${active.role === role ? 'selected' : ''}" aria-pressed="${active.role === role}" title="${esc(n.name)}"><img src="${builderAsset(n.assetPath)}" alt="${esc(n.name)}" draggable="false"><span>${skillLabels[role]}</span><strong>Lv. ${state.levels[role]}</strong></button>`; }).join('')}</div><div class="skill-selected"><span>${active.kind === 'skill' ? skillLabels[active.role] : active.kind === 'stat' ? 'Minor Forte' : 'Inherent Skill'}</span><strong>${esc(active.name ?? 'Name pending')}</strong></div><button class="skill-detail-toggle" data-hero-skills aria-expanded="${skillsOpen}">Source details <span>${skillsOpen ? '−' : '+'}</span></button>${skillsOpen ? `<div class="skill-lines"><p>${esc(active.description ?? 'Description pending')}</p>${active.values.slice(0, 2).map(v => `<div><span>${esc(v.name ?? 'Source value')}</span><strong>${esc(forteValue(v, state.levels[active.role] ?? 1) ?? 'Pending')}</strong></div>`).join('')}<small>Source-backed identities · demonstration investment only</small></div>` : ''}</section>`;
    }
    function stage(id) { return `<section class="hero-stage ${id}" data-hero-mode="${heroMode}" aria-label="${names[id]} full-workspace composition study"><div class="stage-distance" data-depth="-0.35"><div class="distant-door"></div><div class="distant-ribs"></div></div><div class="stage-architecture" data-depth="-0.7"><div class="arch-ring one"></div><div class="arch-ring two"></div><div class="stage-column left"></div><div class="stage-column right"></div><div class="far-step"></div></div><div class="stage-floor" data-depth="-0.15"></div><div class="stage-volume" data-depth="0.2"></div><div class="hero-rim" data-depth="0.8"></div><div class="hero-figure" data-depth="1"><img src="${asset(`hero-art/${id}.webp`)}" alt="${names[id]} · reviewed upper-body artwork; full-body source pending" draggable="false"></div><div class="stage-foreground" data-depth="1.45"><div class="foreground-ledge"></div><div class="foreground-frame left"></div><div class="foreground-frame right"></div></div><div class="stage-vignette"></div></section>`; }
    function hero() {
        const c = context(), b = c.model.builds[c.character], weapon = itemById(b.weapon), heroId = ['augusta', 'jiyan', 'calcharo'].includes(c.character) ? c.character : 'augusta';
        return `<div class="hero-workspace">${stage(heroId)}<div class="hero-heading"><div><span class="eyebrow">YOUR CHARACTER · DESIGN STUDY</span><h1>Build a Character</h1></div><div class="hero-roster" role="group" aria-label="Owned Characters">${Object.keys(c.model.builds).filter(id => ['augusta', 'jiyan', 'calcharo'].includes(id)).map(id => `<button data-character="${id}" aria-label="Select ${names[id]}" aria-pressed="${c.character === id}" class="${c.character === id ? 'active' : ''}">${face(id)}</button>`).join('')}<button data-add-character aria-label="Add Character">${icon('plus')}</button></div><div class="hero-switch" role="group" aria-label="Hero composition variant"><button data-hero-variant="still" aria-pressed="${heroMode === 'still'}" class="${heroMode === 'still' ? 'active' : ''}">Cinematic Still</button><button data-hero-variant="parallax" aria-pressed="${heroMode === 'parallax'}" class="${heroMode === 'parallax' ? 'active' : ''}">Subtle Parallax</button></div></div><div class="hero-composition"><aside class="hero-info"><section class="hero-stats bellibing-card"><div class="section-heading"><h3>◇ Character Stats</h3><span>Demo values</span></div>${[['HP', '18,420'], ['ATK', '2,407'], ['DEF', '1,186'], ['CRIT Rate', '84.7%'], ['CRIT DMG', '225.0%'], ['Energy Regen', '120.0%']].map(([label, value], i) => `<div class="hero-stat ${i === 3 || i === 4 ? 'accent' : ''}"><span>${label}</span><strong>${value}</strong></div>`).join('')}</section><section class="hero-weapon bellibing-card"><div class="section-heading"><h3>◇ Weapon</h3><button data-choose-weapon aria-label="Choose owned Weapon">${icon('arrow')}</button></div>${weapon ? `<div class="hero-weapon-preview">${art(weapon)}<div><strong>${esc(weapon.name)}</strong><span>Lv. ${weapon.level} · Rank ${weapon.refinement}</span><small>Owned demo equipment</small></div></div>` : '<button class="wide" data-choose-weapon>Choose from Inventory</button>'}</section>${skills(heroId)}<a href="#inventory" class="hero-inventory">${icon('bag')} Your Inventory ${icon('arrow')}</a></aside><div class="hero-identity"><span class="eyebrow">${c.characters[c.character].element} · ${c.characters[c.character].weaponType}</span><h2 data-hero-name>${names[heroId]}</h2><div class="identity-tags"><span>Lv. 90</span><span>S1</span><span>Demo build</span></div></div><aside class="hero-echoes" aria-label="Five equipped Echoes"><div class="section-heading"><h3>◇ Equipped Echoes</h3><span>${b.slots.map(itemById).filter(Boolean).reduce((n, e) => n + e.cost, 0)} / 12 Cost</span></div>${b.slots.map(heroEcho).join('')}<span class="echo-workspace-note">Select a card to open Echo Workspace.</span></aside></div><div class="stage-caption"><span>${heroMode === 'still' ? 'Cinematic Still' : 'Subtle Parallax'} · full-workspace scene</span><span>Full-body artwork pending · composition review only</span></div></div>`;
    }
    function teamCard(t) { return `<button class="saved-team ${selectedTeam === t.id ? 'selected' : ''}" data-team="${t.id}" aria-pressed="${selectedTeam === t.id}"><div class="saved-team-top"><strong>${t.name}</strong><span>${t.dps ? number(t.dps) : 'Pending'}</span></div><div class="saved-portraits">${t.members.map(id => face(id, true)).join('')}</div><span class="saved-team-label">${t.dps ? 'Demo Team DPS' : t.label}</span></button>`; }
    function memberEquipment(id) {
        const b = context().model.builds[id];
        if (!b)
            return '<div class="member-equipment"><span>Owned equipment</span><strong>Not entered</strong></div>';
        const weapon = itemById(b.weapon), echoes = b.slots.map(itemById).filter(Boolean);
        return `<details class="member-gear"><summary><span>${weapon ? esc(weapon.name) : 'No Weapon entered'}</span><small>${echoes.length} / 5 Echoes</small></summary><div class="member-gear-body">${weapon ? `<div class="gear-weapon">${art(weapon)}<span>Lv. ${weapon.level} · Rank ${weapon.refinement}</span></div>` : ''}<div class="gear-echoes">${b.slots.map((eid, i) => { const e = itemById(eid); return `<span title="${e ? esc(e.name) + ' · ' + esc(e.main) + ' ' + fmt(e.main, mainValue(e)) : 'Empty Echo ' + (i + 1)}">${e ? art(e) : icon('plus')}<small>${e ? '+' + e.level : '—'}</small></span>`; }).join('')}</div></div></details>`;
    }
    function saved() { const t = team(selectedTeam); return `<section class="team-workspace"><div class="team-workspace-heading"><div><span class="eyebrow">SAVED TEAM · DEMO</span><h2>${t.name}</h2></div><div class="team-dps"><span>Team DPS · demo</span><strong>${t.dps ? number(t.dps) : 'PENDING'}</strong></div></div><div class="demo-context"><span class="status-dot"></span>${t.dps ? 'Presentation fixture · figures are not calculated from equipment' : 'No supported model in this example · no fabricated DPS'}</div><div class="team-members">${t.members.map((id, i) => `<article class="team-member"><div class="member-art">${face(id)}<div class="member-shade"></div><span>${i === 0 ? '01' : i === 1 ? '02' : '03'}</span></div><h3>${names[id]}</h3><div class="member-damage"><strong>${t.shares ? number(t.shares[i]) : '—'}</strong><span>${t.dps ? 'Demo DPS contribution' : 'Awaiting model'}</span></div>${t.shares ? `<div class="damage-bar"><span style="width:${t.shares[i] / t.dps * 100}%"></span></div>` : ''}${memberEquipment(id)}${context().model.builds[id] ? `<button data-open-build="${id}">Open Build ${icon('arrow')}</button>` : '<span class="member-unentered">Registration preview only</span>'}</article>`).join('')}</div><div class="team-bottom"><button data-rotation aria-expanded="${rotationOpen}" ${!t.dps ? 'disabled' : ''}>${icon('arrow')} ${rotationOpen ? 'Hide' : 'View'} rotation</button><button class="gold" data-open-endgame>Plan in Endgame ${icon('arrow')}</button></div>${rotationOpen && t.dps ? `<div class="rotation-preview"><span class="eyebrow">ROTATION STRUCTURE · ILLUSTRATIVE, NOT A PLAYABLE ROTATION</span><div>${[...t.members].reverse().map((id, i) => `<span>${face(id, true)}<strong>${names[id]}</strong><small>${['Opening', 'Handoff', 'Field window'][i]}</small></span>`).join('')}</div></div>` : ''}</section>`; }
    const availability = () => Object.fromEntries(Object.keys(names).map(id => [id, ['the-shorekeeper', 'verina', 'baizhi'].includes(id) ? 2 : 1]));
    function conflicts() {
        const used = {};
        for (const id of allAssignments())
            for (const member of team(id).members)
                used[member] = (used[member] ?? 0) + 1;
        return Object.entries(used).filter(([id, count]) => count > availability()[id]);
    }
    function encounterList() { return mode === 'matrix' ? ['Inferno Rider', 'Crownless', 'Forbidden Bastion'] : ['Tower encounter A', 'Tower encounter B', 'Tower encounter C']; }
    function endgame() { const bad = conflicts(); return `<section class="team-workspace endgame-workspace"><div class="team-workspace-heading"><div><span class="eyebrow">ENDGAME PLANNING · RESEARCH PREVIEW</span><h2>${mode === 'matrix' ? 'Endstate Matrix' : 'Tower of Adversity'}</h2></div><button class="gold" data-example-plan>Load example plan</button></div><div class="mode-choices" role="group" aria-label="Endgame mode"><button data-endgame-mode="matrix" class="${mode === 'matrix' ? 'active' : ''}" aria-pressed="${mode === 'matrix'}">Endstate Matrix</button><button data-endgame-mode="tower" class="${mode === 'tower' ? 'active' : ''}" aria-pressed="${mode === 'tower'}">Tower of Adversity</button><span>Current cycle not synced</span></div><div class="planning-summary"><div><span>Highest single team</span><strong>94,600 <small>demo DPS</small></strong></div><div><span>${mode === 'matrix' ? 'Allowed combination' : 'Planned assignments'}</span><strong>${mode === 'matrix' && bad.length ? 'Conflict' : plan.filter(Boolean).length + ' teams'} <small>${mode === 'matrix' ? 'demo use checks' : 'Vigor validation pending'}</small></strong></div><div><span>${mode === 'matrix' ? 'Round & order' : 'Stage & order'}</span><strong>${mode === 'matrix' ? 'R' : 'S'}${round} <small>${planLoaded ? 'Example order' : 'Manual plan'}</small></strong></div><div><span>Projected score</span><strong>${planLoaded && !bad.length && mode === 'matrix' ? '42,800' : '—'} <small>${planLoaded && !bad.length && mode === 'matrix' ? 'demo points' : 'Model required'}</small></strong></div></div><div class="round-tabs"><span>${mode === 'matrix' ? 'Planning round' : 'Planning stage'}</span>${[1, 2, 3].map(n => `<button data-round="${n}" class="${round === n ? 'active' : ''}" aria-pressed="${round === n}">${n}</button>`).join('')}<button class="quiet" data-research aria-expanded="${modelDetails}">Rules & source status</button></div>${modelDetails ? `<div class="source-note"><strong>Research is separate from live validation.</strong><p>Matrix uses teams of three, mode-specific Vigor and equipment occupation. Tower consumes stage-dependent Vigor. Current bosses, buffs, exact availability, HP persistence and scoring must bind to a reviewed cycle before real optimization. All numbers and allocations here are fixed demonstrations.</p><a href="https://wuthering.th.gl/db/endstate-matrix/matrix_8" target="_blank" rel="noreferrer">Matrix research snapshot ↗</a></div>` : ''}<div class="encounter-plan">${encounterList().map((boss, i) => `<article class="encounter-row"><div class="encounter-index">${i + 1}</div><div class="encounter-info"><span class="eyebrow">${mode === 'matrix' ? 'SAMPLE ENCOUNTER' : 'SYNTHETIC ENCOUNTER'}</span><h3>${boss}</h3><span>${mode === 'matrix' ? `<button class="circuit-chip" data-circuit-slot="${i}">${circuits[round][i]} · review</button>` : 'Area Effect · current cycle pending'}</span></div><div class="encounter-team">${plan[i] ? `<span>${team(plan[i]).members.map(id => face(id, true)).join('')}</span><strong>${team(plan[i]).name}</strong>` : '<span class="unassigned">Choose a team</span>'}</div><button data-plan-slot="${i}">${plan[i] ? 'Change' : 'Assign'} ${icon('arrow')}</button><button class="quiet" data-order-up="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Move assignment ${i + 1} earlier">↑</button></article>`).join('')}</div>${circuitSlot !== null && mode === 'matrix' ? `<div class="circuit-picker"><span class="eyebrow">POWER CIRCUIT · EFFECT VALIDATION PENDING</span><div>${['General Enhancement', 'Enhancement: Negative Status', 'Basic DMG Enhancement'].map(label => `<button data-select-circuit="${label}" class="${circuits[round][circuitSlot] === label ? 'active' : ''}">${label}</button>`).join('')}</div><button class="quiet" data-close-circuit>Close</button></div>` : ''}${activeAssignment !== null ? `<div class="assignment-picker"><div class="section-heading"><h3>Assign team to encounter ${activeAssignment + 1}</h3><button data-close-assignment aria-label="Close team assignment">${icon('close')}</button></div>${teams.map(t => `<button data-assign-team="${t.id}"><span>${t.members.map(id => face(id, true)).join('')}</span><strong>${t.name}</strong><small>${t.dps ? number(t.dps) + ' demo DPS' : 'Model pending'}</small></button>`).join('')}</div>` : ''}${bad.length && mode === 'matrix' ? `<p class="allocation-conflict" role="alert">${icon('close')} ${bad.map(([id]) => names[id]).join(', ')} exceeds the example’s available uses. Change an assignment.</p>` : ''}<div class="endgame-details"><details><summary>${mode === 'matrix' ? 'Available roster & uses' : 'Roster preview'} <span>${mode === 'matrix' ? 'Demo availability · across rounds' : 'Vigor costs not validated'}</span></summary><div class="availability-grid">${Object.entries(availability()).map(([id, count]) => { const used = allAssignments().reduce((n, t) => n + Number(team(t).members.includes(id)), 0); return `<div>${face(id, true)}<span>${names[id]}</span><strong class="${used > count ? 'overused' : ''}">${mode === 'matrix' ? Math.max(0, count - used) + ' / ' + count : 'Pending'}</strong></div>`; }).join('')}</div></details>${mode === 'matrix' ? `<details><summary>Remaining boss HP <span>Illustrative carry-over only</span></summary><div class="hp-preview"><span>Sample record after previous team</span><strong>62% HP remaining</strong><div><span></span></div><small>Not a prediction. Carry-over behavior still requires cycle-specific validation.</small></div></details>` : ''}<details><summary>Where could this roster improve? <span>Future Improve connection</span></summary><div class="roster-improve"><div>${face('augusta')}<span><strong>Augusta</strong><small>Compare real Echo opportunities and net resources</small></span><button data-open-build="augusta">Review Build ${icon('arrow')}</button></div><p>Cost-effective upgrade ranking requires actual private Improve results. No upgrade or scoring calculation runs here.</p></div></details></div><p class="plan-disclaimer">Example allocation, order and score · no optimizer attached.</p></section>`; }
    function teamView() {
        let list = [...teams];
        if (sort === 'dps')
            list.sort((a, b) => (b.dps ?? -1) - (a.dps ?? -1));
        return `<div class="team-page-heading"><div><span class="eyebrow">YOUR ROSTER, TOGETHER</span><h1>Build a Team</h1></div><div class="team-mode" role="group" aria-label="Team workspace mode"><button data-team-mode="saved" class="${teamMode === 'saved' ? 'active' : ''}" aria-pressed="${teamMode === 'saved'}">My Teams</button><button data-team-mode="endgame" class="${teamMode === 'endgame' ? 'active' : ''}" aria-pressed="${teamMode === 'endgame'}">Endgame</button></div></div><div class="team-layout"><aside class="saved-teams"><div class="saved-heading"><h3>My Teams</h3><button data-sort-teams title="Toggle Team DPS sorting" aria-label="Sort teams by ${sort === 'dps' ? 'saved order' : 'Team DPS descending'}">${sort === 'dps' ? 'DPS ↓' : 'Sort ↓'}</button></div>${list.map(teamCard).join('')}<div class="saved-team-footnote">Synthetic saved teams.<br>Shared equipment stays with its owner.</div></aside>${teamMode === 'saved' ? saved() : endgame()}</div>`;
    }
    function handle(button) {
        const d = button.dataset;
        if (d.heroVariant) {
            heroMode = d.heroVariant;
            render();
            return true;
        }
        if (d.heroNode) {
            selectedSkill = d.heroNode;
            render();
            return true;
        }
        if ('heroSkills' in d) {
            skillsOpen = !skillsOpen;
            render();
            return true;
        }
        if (d.team) {
            selectedTeam = d.team;
            rotationOpen = false;
            render();
            return true;
        }
        if ('sortTeams' in d) {
            sort = sort === 'saved' ? 'dps' : 'saved';
            render();
            return true;
        }
        if (d.teamMode) {
            teamMode = d.teamMode;
            render();
            return true;
        }
        if ('openEndgame' in d) {
            teamMode = 'endgame';
            render();
            return true;
        }
        if ('rotation' in d) {
            rotationOpen = !rotationOpen;
            render();
            return true;
        }
        if (d.endgameMode) {
            mode = d.endgameMode;
            circuitSlot = null;
            roundPlans = { 1: ['augusta', 'jiyan', null], 2: [null, null, null], 3: [null, null, null] };
            round = 1;
            planLoaded = false;
            plan = roundPlans[1];
            activeAssignment = null;
            render();
            return true;
        }
        if ('round' in d) {
            circuitSlot = null;
            roundPlans[round] = plan;
            round = Number(d.round);
            plan = roundPlans[round];
            planLoaded = false;
            render();
            return true;
        }
        if ('circuitSlot' in d) {
            circuitSlot = Number(d.circuitSlot);
            activeAssignment = null;
            render();
            return true;
        }
        if (d.selectCircuit) {
            circuits[round][circuitSlot] = d.selectCircuit;
            circuitSlot = null;
            planLoaded = false;
            render();
            return true;
        }
        if ('closeCircuit' in d) {
            circuitSlot = null;
            render();
            return true;
        }
        if ('research' in d) {
            modelDetails = !modelDetails;
            render();
            return true;
        }
        if ('examplePlan' in d) {
            plan = ['jiyan', 'augusta', 'calcharo'];
            roundPlans[round] = plan;
            circuits[round] = ['General Enhancement', 'General Enhancement', 'General Enhancement'];
            circuitSlot = null;
            planLoaded = true;
            activeAssignment = null;
            render();
            return true;
        }
        if ('planSlot' in d) {
            circuitSlot = null;
            activeAssignment = Number(d.planSlot);
            render();
            return true;
        }
        if (d.assignTeam) {
            plan[activeAssignment] = d.assignTeam;
            activeAssignment = null;
            planLoaded = false;
            render();
            return true;
        }
        if ('closeAssignment' in d) {
            activeAssignment = null;
            render();
            return true;
        }
        if ('orderUp' in d) {
            const i = Number(d.orderUp);
            if (i > 0)
                [plan[i - 1], plan[i]] = [plan[i], plan[i - 1]];
            planLoaded = false;
            render();
            return true;
        }
        return false;
    }
    function bind() {
        motionCleanup();
        const scene = document.querySelector('.hero-stage');
        if (!scene)
            return;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        let frame = 0;
        const reset = () => { scene.style.setProperty('--mx', '0'); scene.style.setProperty('--my', '0'); scene.dataset.motion = 'still'; };
        const move = e => {
            if (heroMode !== 'parallax' || reduced.matches) {
                reset();
                return;
            }
            const r = scene.getBoundingClientRect(), x = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1)), y = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1));
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => { scene.style.setProperty('--mx', x.toFixed(3)); scene.style.setProperty('--my', y.toFixed(3)); scene.dataset.motion = 'parallax'; });
        };
        const pointerHost = scene.closest('.hero-workspace');
        pointerHost.addEventListener('pointermove', move);
        pointerHost.addEventListener('pointerleave', reset);
        reduced.addEventListener('change', reset);
        motionCleanup = () => { cancelAnimationFrame(frame); pointerHost.removeEventListener('pointermove', move); pointerHost.removeEventListener('pointerleave', reset); reduced.removeEventListener('change', reset); };
        reset();
    }
    return { hero, teamView, handle, bind, reset() { motionCleanup(); heroMode = 'still'; skillsOpen = false; selectedSkill = 'circuit'; selectedTeam = 'augusta'; teamMode = 'saved'; sort = 'saved'; mode = 'matrix'; round = 1; planLoaded = false; roundPlans = { 1: ['augusta', 'jiyan', null], 2: [null, null, null], 3: [null, null, null] }; plan = roundPlans[1]; activeAssignment = null; circuitSlot = null; rotationOpen = false; modelDetails = false; circuits = { 1: ['General Enhancement', 'General Enhancement', 'General Enhancement'], 2: ['General Enhancement', 'General Enhancement', 'General Enhancement'], 3: ['General Enhancement', 'General Enhancement', 'General Enhancement'] }; }, openEndgame() { teamMode = 'endgame'; } };
}
