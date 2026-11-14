// Shared import surface. Image selection is local; OCR and account saves are
// connected only through the existing reviewed-import adapter during integration.
let panel;
let returnFocus;
let imageURL;
function close() {
  panel.hidden = true;
  document.querySelectorAll('[data-prototype-import]').forEach(button => button.setAttribute('aria-expanded', 'false'));
  returnFocus?.focus();
}
export function openCharacterImport(trigger) {
  returnFocus = trigger;
  if (!panel) {
    panel = document.createElement('section');
    panel.className = 'prototype-import';
    panel.id = 'prototype-character-import';
    panel.setAttribute('aria-label', 'Import Character');
    panel.hidden = true;
    panel.innerHTML = `<button type="button" class="prototype-import-close" data-import-close aria-label="Close import">&#10005;</button>
      <label class="prototype-image-drop"><input type="file" accept="image/png,image/jpeg" aria-label="Choose Character build image"><span class="prototype-image-drop-symbol" aria-hidden="true">&#43;</span><span>Drop a build image</span><small>or choose image</small><img hidden alt="Selected Character build image"></label>
      <p class="prototype-import-result" role="status" hidden></p>`;
    document.body.append(panel);
    panel.querySelector('[data-import-close]').onclick = close;
    const input = panel.querySelector('input');
    input.addEventListener('change', () => {selectImage(input.files?.[0]); input.value = '';});
    const drop = panel.querySelector('.prototype-image-drop');
    drop.addEventListener('dragover', event => {event.preventDefault(); drop.classList.add('dragging');});
    drop.addEventListener('dragleave', () => drop.classList.remove('dragging'));
    drop.addEventListener('drop', event => {event.preventDefault(); drop.classList.remove('dragging'); selectImage(event.dataTransfer.files?.[0]);});
    document.addEventListener('paste', event => {
      if(panel.hidden) return;
      const image = [...(event.clipboardData?.files || [])].find(file => file.type.startsWith('image/'));
      if(image) {event.preventDefault(); selectImage(image);}
    });
    document.addEventListener('keydown', event => {if(event.key === 'Escape' && !panel.hidden) close();});
    addEventListener('pagehide', () => {if(imageURL) URL.revokeObjectURL(imageURL);});
  }
  if (!panel.hidden) {close(); return;}
  panel.hidden = false;
  trigger?.setAttribute('aria-expanded', 'true');
  panel.querySelector('input').focus();
}
async function selectImage(file) {
  if(!file) return;
  const status = panel.querySelector('[role=status]');
  status.hidden = false;
  if(!['image/png','image/jpeg'].includes(file.type) || file.size > 5*1024*1024 || !file.size) {
    status.textContent = 'Choose a PNG or JPEG up to 5 MiB.';
    return;
  }
  let bitmap;
  try {bitmap = await createImageBitmap(file);} catch {
    status.textContent = 'The image could not be read.'; return;
  }
  const supported = bitmap.width === 1920 && bitmap.height === 1080;
  bitmap.close();
  if(imageURL) URL.revokeObjectURL(imageURL);
  imageURL = URL.createObjectURL(file);
  const image = panel.querySelector('img'); image.src = imageURL; image.hidden = false;
  panel.querySelector('.prototype-image-drop').classList.add('has-image');
  status.textContent = supported ? 'Image selected. OCR connection is pending; nothing has been imported.' : 'OCR requires an original English 1920 \u00d7 1080 wuwa-bot card. Nothing has been imported.';
}
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-prototype-import]');
  if(trigger) openCharacterImport(trigger);
});

