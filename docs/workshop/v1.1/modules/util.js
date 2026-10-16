export const $ = selector => document.querySelector(selector);

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

// The portable review builder supplies this map. Repository previews use relative assets.
export function assetURL(path) {
  if (path.startsWith('../../ui-prototypes/')) return new URL(path.replace('../../ui-prototypes/', './'), parent.location.href).href;
  if (path.startsWith('assets/')) return new URL('./' + path, parent.location.href).href;
  return path;
}

export function baseAsset(name) {
  return assetURL(`../v1/assets/${name}`);
}

export function notify(message) {
  clearTimeout(notify.timer);
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  notify.timer = setTimeout(() => $('#toast').classList.remove('visible'), 3600);
}
