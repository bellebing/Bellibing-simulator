// Product routes wrap the frozen legacy entries without changing their source.
const entry = document.querySelector('script[data-workspace-entry]').dataset.workspaceEntry;
switch (entry) {
  case 'alpha': await import('./assets/web/alpha-entry.js'); break;
  case 'echo-lab': await import('./assets/web/main.js'); break;
  case 'roll-assistant': await import('./assets/web/roll-assistant.js'); break;
  default: throw new Error('Unknown workspace entry');
}
for (const link of document.querySelectorAll('a[href="./ui-preview/"]')) {
  link.setAttribute('href', './build/');
}
