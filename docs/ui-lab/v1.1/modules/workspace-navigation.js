// One shared product header; the isolated historical Lab fixtures stay separate.
export function workspaceHeader(routes,active){
 const link=(id,label)=>`<a data-workspace="${id}" href="${routes[id]}"${active===id?' aria-current="page"':''}>${label}</a>`;
 return `<header class="site-header workspace-header"><a class="brand" href="${routes.build}"><span class="brand-mark">✧</span> BELLIBING<span class="brand-divider"></span><span class="brand-sub">SIMULATOR</span></a><nav aria-label="Workspace"><span class="workspace-primary">${link('build','Build a Character')}${link('improve','Improve a Character')}<button data-workspace="teams" type="button" disabled>Team Builder <small>SOON</small></button></span>${link('sandbox','Echo Sandbox')}</nav><span class="study-label" hidden></span></header>`;
}
export function mountWorkspaceHeader(header,routes,active){
 if(!header.classList.contains('workspace-header')){header.outerHTML=workspaceHeader(routes,active);return;}
 for(const id of ['build','improve','sandbox']){const link=header.querySelector(`[data-workspace="${id}"]`);link.href=routes[id];if(id===active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');}
}
