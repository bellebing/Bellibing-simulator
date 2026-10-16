// Read adapter over the existing application owner. No account clone or storage key.
(() => {
  const nameFor = id => releasedCharacters.find(person => person.id === id)?.name;
  const specs = () => [...BUILD_STAT_PRIMARY_ROWS, ...BUILD_STAT_EXTRA_ROWS];
  function snapshot(id) {
    const name = nameFor(id), build = name && owned(name) ? state.drafts[name]?.build : null;
    const tree = skillsPreviewByCharacterId.get(id);
    const projection = build ? statsUi.project(name) : null;
    return structuredClone({ id, onAccount: !!build, build: build ?? null,
      stats: specs().map(spec => statsUi.format(projection?.[spec.key], spec.percent)),
      weapon: weaponItemById(build?.weaponId)?.name ?? null,
      sequenceLevel: build ? sequenceUi.normalizeLevel(build.sequenceLevel) : null,
      forte: build && tree && window.bellibingForte ? window.bellibingForte.normalizeForteState(tree, build.forte) : null,
      slots: build ? improveEchoSlots(name) : Array(5).fill(null) });
  }
  window.bellibingWorkshopSource = Object.freeze({
    ready: () => releasedCharacters.length > 0 && echoDataLoaded && weaponDataLoaded && buildStatsRuntimeLoaded
      && characterMechanicsDataLoaded && sequenceRuntimeDataLoaded && !!window.bellibingForte
      && !!window.bellibingResourceInventory && !!window.bellibingImproveSettings?.ready(),
    characters: () => structuredClone(releasedCharacters.map(person => ({ id: person.id, name: person.name, onAccount: owned(person.name) }))),
    snapshot,
    echoes: () => structuredClone(echoCatalog),
    sonatas: () => structuredClone([...echoSonataById.values()]),
    inventory: () => window.bellibingResourceInventory.getState(),
    setInventory: (id, text) => window.bellibingResourceInventory.setQuantity(id, text),
    settings(id) { window.bellibingImproveSettings.setCharacter(id); return window.bellibingImproveSettings.workshopView(); },
    editSettings(id, action) { window.bellibingImproveSettings.setCharacter(id); return window.bellibingImproveSettings.workshopEdit(action); },
    formatStat: echoStatValueText,
    navigate(destination) {
      document.getElementById('echoWorkshopFrame')?.remove();
      for (const node of document.querySelectorAll('body > [data-workshop-inert]')) { node.inert = false; delete node.dataset.workshopInert; }
      document.body.style.overflow = '';
      history.replaceState(null, '', location.pathname);
      show(destination === 'build' ? 'build' : 'improve');
    },
  });
  window.openEchoWorkshop = () => {
    if (document.getElementById('echoWorkshopFrame')) return;
    if (improveUi.simulator) improveUi.closeSimulation();
    const frame = document.createElement('iframe');
    frame.id = 'echoWorkshopFrame'; frame.title = 'Bellibing Echo Workshop';
    frame.src = '../workshop/v1.1/index.html';
    frame.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;z-index:10000;background:#071013';
    for (const node of document.body.children) if (!node.inert) { node.inert = true; node.dataset.workshopInert = ''; }
    document.body.append(frame); document.body.style.overflow = 'hidden';
    history.replaceState(null, '', location.pathname + '?workshop=1');
    frame.focus();
  };
  document.getElementById('openEchoWorkshop').onclick = window.openEchoWorkshop;
  if (new URLSearchParams(location.search).get('workshop') === '1') window.openEchoWorkshop();
})();
