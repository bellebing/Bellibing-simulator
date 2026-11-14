// Shared Character selector presentation for Build, Improve and Sandbox.
export const CHARACTER_GALLERY_MARKUP = `
<div class="gallery" id="characterGallery" inert>
<div class="gallery-mist">
</div>
<div class="gallery-topline">
<div class="gallery-filters">
<div class="element-filter segmented" role="group" aria-label="Element">
<button data-element="all" aria-label="All Elements" title="All Elements" aria-pressed="true" class="selected">All Elements</button>
<button data-element="Spectro" aria-pressed="false" aria-label="Spectro" title="Spectro">
<img src="../../ui-prototypes/assets/builder-icons/elements/spectro.webp" alt="">
</button>
<button data-element="Havoc" aria-pressed="false" aria-label="Havoc" title="Havoc">
<img src="../../ui-prototypes/assets/builder-icons/elements/havoc.webp" alt="">
</button>
<button data-element="Aero" aria-pressed="false" aria-label="Aero" title="Aero">
<img src="../../ui-prototypes/assets/builder-icons/elements/aero.webp" alt="">
</button>
<button data-element="Glacio" aria-pressed="false" aria-label="Glacio" title="Glacio">
<img src="../../ui-prototypes/assets/builder-icons/elements/glacio.webp" alt="">
</button>
<button data-element="Fusion" aria-pressed="false" aria-label="Fusion" title="Fusion">
<img src="../../ui-prototypes/assets/builder-icons/elements/fusion.webp" alt="">
</button>
<button data-element="Electro" aria-pressed="false" aria-label="Electro" title="Electro">
<img src="../../ui-prototypes/assets/builder-icons/elements/electro.webp" alt="">
</button>
</div>
</div>
<div class="filter segmented" role="group" aria-label="Character collection">
<button data-filter="account" aria-pressed="false">Account Characters</button>
<button class="active selected" data-filter="all" aria-pressed="true">All Characters</button>
</div>
<button id="closeGallery" class="collapse-gallery" aria-label="Collapse Character gallery" title="Collapse Character gallery">
<span class="chevron" aria-hidden="true">‹</span>
</button>
</div>
<div class="gallery-art" id="galleryArt" tabindex="0" role="group" aria-label="Character wheel; drag or use Left and Right, Home and End to browse; Enter selects the centered Character" aria-describedby="galleryKeys">
</div>
<p id="emptyCatalog" class="empty-catalog" hidden>No Characters match these filters</p>
<div class="gallery-floor">
</div>
<div class="focused-info" id="focusedInfo">
</div>
<span id="carouselAnnouncement" class="carousel-announcement" role="status" aria-live="polite" aria-atomic="true">
</span>
<span id="galleryKeys" hidden>Drag to spin. Left and Right or Home and End browse. Enter selects the centered Character. Escape collapses.</span>
</div>
`;
