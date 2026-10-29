// Presentation coordinates only. These are design guides, never canonical Character facts.
export const HERO_VISTAS = Object.freeze([
    { id: 'coast', letter: 'A', name: 'Coastal outlook', art: 'electro-coast', element: 'electro',
        anchor: { x: .51, y: .84, height: .53, width: .16, referenceHeightMeters: 1.75 },
        horizon: .402, cameraEyeHeightMeters: 1.45, lighting: 'soft upper-right key, cool sky fill',
        water: [.28, .46, .76, .57] },
    { id: 'terrace', letter: 'B', name: 'Meadow terrace', art: 'electro-terrace', element: 'electro',
        anchor: { x: .51, y: .84, height: .53, width: .16, referenceHeightMeters: 1.75 },
        horizon: .382, cameraEyeHeightMeters: 1.51, lighting: 'warm upper-right key, cool sky fill',
        water: [.30, .46, .75, .55] }
]);
export const vistaAsset = name => globalThis.BELLIBING_CONCEPT_ASSETS?.['vista-art/' + name + '.webp'] ?? './vista-art/' + name + '.webp';

function anchorGuide() {
    return `<div class="hero-figure vista-anchor" role="img" aria-label="Character placement guide, arbitrary 1.75 metre design reference; not Character artwork">
        <svg viewBox="0 0 240 700" preserveAspectRatio="none" aria-hidden="true">
            <rect class="anchor-envelope" x="49" y="1" width="142" height="697" rx="55"/>
            <path class="anchor-dimension" d="M20 1H5M13 1V699M5 699H20"/>
            <g class="anchor-proportions"><circle cx="120" cy="43" r="29"/>
                <path d="M105 74V105L78 126L86 292L101 345H139L154 292L162 126L135 105V74M78 126L61 283L67 338M162 126L179 283L173 338M101 345L94 522L89 688L72 699H108L120 406L132 699H168L151 688L146 522L139 345"/>
            </g>
        </svg><div class="vista-ground-mark"></div><span class="vista-anchor-label">1.75 m · placement guide</span></div>`;
}

export function renderVistaStage(vista, mode) {
    return `<section class="hero-stage elemental-stage vista-stage" data-vista="${vista.id}" data-environment="electro" data-hero-mode="${mode}" style="--element-rim:#9daecc" aria-label="Electro · ${vista.name} original environment">
        <img class="elemental-fallback" src="${vistaAsset(vista.art)}" alt="Original Electro ${vista.name}: natural standing terrain, water and distant coastal horizon" draggable="false">
        <canvas class="elemental-canvas" aria-hidden="true" hidden></canvas>${anchorGuide()}<div class="environment-legibility"></div></section>`;
}

export function renderVistaControls(id, { showCharacter, cards, ambient, iconURL }) {
    return `<div class="scene-study-controls vista-controls" aria-label="Electro vista comparison">
        <div class="vista-variants" role="group" aria-label="Electro composition"><span class="vista-element" role="img" aria-label="Electro"><img src="${iconURL}" alt=""></span>${HERO_VISTAS.map(v => `<button data-vista="${v.id}" aria-pressed="${id === v.id}">${v.letter} · ${v.name}</button>`).join('')}</div>
        <div role="group" aria-label="Comparison view"><button data-scene-view="background" aria-pressed="${!showCharacter}">Background</button><button data-scene-view="character" aria-pressed="${showCharacter && !cards}">Anchor</button><button data-scene-view="cards" aria-pressed="${showCharacter && cards}">Cards</button><button data-vista-ambient aria-pressed="${ambient}">Water light</button></div>
        <span class="environment-readiness">Placement guide · Character rendering to be reviewed</span></div>`;
}

export function renderVistaReuse(vista, open) {
    return `<details class="elemental-reuse vista-reuse" ${open ? 'open' : ''}><summary>Echo framing study <span>Same environment · smaller presentation</span></summary>
        <div class="vista-reuse-layout"><div class="vista-compact" data-vista="${vista.id}" aria-label="Compact ${vista.name} framing study">
            <img class="elemental-fallback" src="${vistaAsset(vista.art)}" alt="Compact crop of the selected original vista"><canvas class="elemental-canvas" aria-hidden="true" hidden></canvas>
            <div class="echo-placement" aria-hidden="true">◇</div><span class="vista-compact-label">Echo artwork placement</span></div>
        <div><strong>${vista.name}</strong><p>Framing guide only. No new Echo or set association.</p><span class="compact-readiness">Cinematic Still</span></div></div></details>`;
}
