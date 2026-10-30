// Owner-selected art direction only. No Character, Sonata or gameplay policy.
export const SELECTED_STILLS = Object.freeze([
    { id: 'fusion', name: 'Fusion', rim: '#eaa369' },
    { id: 'glacio', name: 'Glacio', rim: '#b6daf2' },
    { id: 'electro', name: 'Electro', rim: '#b39af1' },
    { id: 'aero', name: 'Aero', rim: '#82d9c5' },
    { id: 'spectro', name: 'Spectro', rim: '#e8d28e' },
    { id: 'havoc', name: 'Havoc', rim: '#cf89ab' }
]);

export const selectedStillPath = id => `selected-stills/bellibing-bg-${id}-v01.webp`;
export const selectedStillAsset = id => globalThis.BELLIBING_CONCEPT_ASSETS?.[selectedStillPath(id)] ?? './' + selectedStillPath(id);

export function renderSelectedStillStage(still, characterURL, characterName) {
    return `<section class="hero-stage selected-still-stage" data-selected-still="${still.id}" data-hero-mode="still" style="--element-rim:${still.rim}" aria-label="Selected ${still.name} still background">
        <img class="elemental-fallback selected-still-image" src="${selectedStillAsset(still.id)}" alt="Selected ${still.name} background · low foreground platform · v01" draggable="false">
        <div class="hero-figure"><img src="${characterURL}" alt="${characterName} · existing partial Character art; full-body placement pending" draggable="false"></div>
        <div class="environment-legibility"></div></section>`;
}

export function renderSelectedStillControls(id, { showCharacter, cards, iconURL }) {
    return `<div class="scene-study-controls elemental-controls selected-still-controls" aria-label="Selected still backgrounds">
        <div role="group" aria-label="Selected element">${SELECTED_STILLS.map(e => `<button data-selected-still="${e.id}" aria-label="Selected ${e.name} background" aria-pressed="${id === e.id}"><img src="${iconURL(e.id)}" alt=""><span>${e.name}</span></button>`).join('')}</div>
        <div role="group" aria-label="Comparison view"><button data-scene-view="background" aria-pressed="${!showCharacter}">Background</button><button data-scene-view="character" aria-pressed="${showCharacter && !cards}">Character</button><button data-scene-view="cards" aria-pressed="${showCharacter && cards}">Cards</button></div>
        <span>Selected v01 · still images</span></div>`;
}

export function renderSelectedStillGallery(id) {
    return `<details class="elemental-reuse selected-still-gallery"><summary>Selected still backgrounds <span>Six elements · low platform · v01</span></summary>
        <div class="elemental-swatches">${SELECTED_STILLS.map(e => `<button data-selected-still="${e.id}" aria-label="Open selected ${e.name} background" aria-pressed="${id === e.id}"><img src="${selectedStillAsset(e.id)}" alt="${e.name} · selected still"><span>${e.name} · selected v01</span></button>`).join('')}</div></details>`;
}

export function renderSelectedStillReferences(vistas, environments, legacyAsset, vistaAsset) {
    return `<details class="elemental-reuse selected-still-references"><summary>Earlier references <span>Previous compositions and element studies</span></summary>
        <div class="elemental-swatches">${vistas.map(v => `<button data-vista="${v.id}" aria-label="Open earlier ${v.name} reference"><img src="${vistaAsset(v.art)}" alt=""><span>${v.name}${v.rejected ? ' · rejected' : ' · earlier reference'}</span></button>`).join('')}</div>
        <div class="elemental-swatches">${environments.map(e => `<button data-environment="${e.id}" aria-label="Open earlier ${e.name} study"><img src="${legacyAsset(e.id)}" alt=""><span>${e.name} · earlier study</span></button>`).join('')}</div></details>`;
}
