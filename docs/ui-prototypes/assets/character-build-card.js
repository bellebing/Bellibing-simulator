// Presentation only. The source adapter reads the owning Character build on every
// render; this component never persists, clones or edits gameplay state.
(() => {
  let serial = 0;
  const echoStatLabels = Object.freeze({
    'CRIT Rate': 'CR', 'CRIT DMG': 'CD',
    'Flat ATK': 'ATK', 'ATK%': 'ATK %',
    'Flat HP': 'HP', 'HP%': 'HP %',
    'Flat DEF': 'DEF', 'DEF%': 'DEF %',
    'Energy Regen': 'ER', 'Basic Attack DMG': 'Basic DMG',
    'Heavy Attack DMG': 'Heavy DMG', 'Resonance Skill DMG': 'Skill DMG',
    'Resonance Liberation DMG': 'Lib DMG', 'Liberation DMG': 'Lib DMG',
    'Healing Bonus': 'Healing'
  });
  const node = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  const art = (src, className, alt = '') => {
    const el = node('img', className); el.src = src; el.alt = alt; el.draggable = false;
    el.addEventListener('error', () => el.replaceWith(node('span', 'cbc-pending', 'Art Pending')), { once: true });
    return el;
  };
  class CharacterBuildCard {
    constructor(host, { source, presentation = 'standard' }) {
      if (presentation !== 'standard') throw new Error('Unsupported CharacterBuildCard presentation');
      this.host = host; this.source = source; this.characterName = null;
      this.skillsId = 'characterBuildCardSkills' + (++serial);
      host.classList.add('character-build-card'); host.dataset.presentation = presentation;
      this.unsubscribe = source.subscribe(() => { if (this.characterName) this.refresh(); });
    }
    setCharacter(name) { this.characterName = name; this.refresh(); }
    refresh() {
      const { host, source: s, characterName: name } = this;
      host.replaceChildren();
      const character = s.character(name);
      host.dataset.characterId = character?.id || '';
      if (!character) { host.append(node('p', 'cbc-pending', 'Character Pending')); return; }
      host.setAttribute('aria-label', name + ' saved Character build');
      const top = node('div', 'cbc-top');
      const identity = node('section', 'cbc-identity');
      identity.append(node('h2', 'cbc-name', name));
      const context = node('div', 'cbc-character-context');
      const hero = node('div', 'cbc-hero'), heroData = s.hero(character.id);
      if (heroData?.status === 'READY') {
        const image = art(heroData.assetPath, 'cbc-hero-image', name), p = heroData.presentation;
        image.style.objectFit = p.safeFraming === 'CONTAIN' ? 'contain' : 'cover';
        image.style.transform = `translate(${p.offsetX}%,${p.offsetY}%) scale(${p.scale})`;
        image.style.transformOrigin = `${p.focalAnchor.x * 100}% ${p.focalAnchor.y * 100}%`;
        hero.append(image);
      } else hero.append(node('p', 'cbc-pending', 'Character art Pending'));
      const sequence = node('div', 'cbc-sequence seq-line'); s.sequence(sequence, name);
      context.append(sequence, hero); identity.append(context);
      const weaponHost = node('section', 'cbc-weapon'), weapon = s.weapon(name);
      weaponHost.append(node('h3', 'cbc-weapon-name', weapon?.name || 'Weapon Pending'));
      const weaponArt = node('div', 'cbc-weapon-art');
      if (weapon) weaponArt.append(art(weapon.artSrc));
      weaponHost.append(weaponArt);
      for (const [label, value] of [
        [weapon?.secondary?.stat || 'Secondary stat', weapon?.secondary?.stat && Number.isFinite(weapon.secondary.value) ? s.weaponSecondary(weapon.secondary.value) : 'Pending'],
        ['Base ATK', Number.isFinite(weapon?.level90BaseAtk) ? weapon.level90BaseAtk : 'Pending']
      ]) {
        const row = node('div', 'cbc-weapon-fact'); row.append(node('span', '', label), node('strong', '', value)); weaponHost.append(row);
      }
      const skills = node('section', 'cbc-skills'); skills.append(node('h3', '', 'Skills'));
      const tree = node('div', 'skills-mini-tree'); tree.id = this.skillsId; s.skills(tree, name); skills.append(tree);
      const stats = node('section', 'cbc-stats'); stats.append(node('h3', '', 'Character Stats'));
      const projection = s.project(name);
      stats.dataset.status = projection ? 'READY' : 'PENDING';
      for (const spec of s.statSpecs(projection)) {
        const row = node('div', 'cbc-stat-row'); row.dataset.statKey = spec.key;
        const icon = s.statIcon(spec, character.id); if (icon) row.append(art(icon, 'cbc-stat-icon'));
        const label = spec.labelFrom ? projection?.[spec.labelFrom] || 'Pending' : spec.label;
        const value = node('strong', '', projection ? s.statValue(projection[spec.key], spec.percent) : 'Pending');
        if (Number.isFinite(projection?.[spec.key])) value.dataset.raw = projection[spec.key];
        row.append(node('span', 'cbc-stat-label', label), value); stats.append(row);
      }
      top.append(identity, stats, weaponHost, skills);
      const echoes = node('div', 'cbc-echoes'); echoes.setAttribute('aria-label', 'Five equipped Echoes');
      s.slots(name).forEach((slot, index) => {
        const item = s.echo(slot), card = node('section', 'cbc-echo'); card.dataset.echoSlot = index;
        card.dataset.echoId = item?.id || ''; card.setAttribute('aria-label', 'Echo ' + (index + 1));
        card.append(node('h3', 'cbc-echo-name', item?.name || (slot ? 'Echo Pending' : 'Empty slot')));
        const image = node('div', 'cbc-echo-art'); if (item) image.append(art(item.artSrc)); card.append(image);
        const meta = node('div', 'cbc-echo-meta');
        meta.append(node('span', '', item ? 'COST ' + item.cost : '—'), node('span', '', Number.isFinite(slot?.level) ? '+' + slot.level : '—')); card.append(meta);
        const sonata = node('div', 'cbc-sonata'), set = s.sonata(slot);
        if (set) { s.sonataIcon(sonata, set.id); sonata.append(node('span', '', set.name)); }
        else sonata.append(node('span', '', slot ? 'Sonata Pending' : '—'));
        const echoStats = s.echoStats(slot);
        for (const label of echoStats.querySelectorAll('.cbc-echo-stat > span')) {
          const canonicalName = label.textContent;
          label.dataset.statName = canonicalName;
          label.textContent = echoStatLabels[canonicalName] || canonicalName;
          label.setAttribute('aria-label', canonicalName);
        }
        card.append(sonata, echoStats); echoes.append(card);
      });
      host.append(top, echoes);
    }
    destroy() { this.unsubscribe(); this.host.replaceChildren(); this.characterName = null; }
  }
  window.CharacterBuildCard = CharacterBuildCard;
})();
