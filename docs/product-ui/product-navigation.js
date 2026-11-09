import {readCharacterFocus} from '../ui-lab/v1.1/modules/character-focus.js';
import './account-auth-entry.js';
const routes={build:'../build/',inventory:'../inventory/',improve:'../improve/',sandbox:'../sandbox/',teams:'../teams/'};
const profile=new URL(location.href).searchParams.get('profile');
export function productLink(route,params={}){const url=new URL(routes[route],location.href);if(profile)url.searchParams.set('profile',profile);if(['build','improve','sandbox','teams'].includes(route))url.searchParams.set('character',readCharacterFocus());for(const [k,v]of Object.entries(params))url.searchParams.set(k,v);return url.href;}
const current=document.body.dataset.prototypePage??location.pathname.split('/').filter(Boolean).at(-1);
const nav=document.querySelector('.bc-nav, .workspace-header');
const retainedCarousel=nav?.querySelector('.heading-carousel');
if(nav){nav.id='productNavigation';nav.classList.add('workspace-header','bc-nav');nav.innerHTML='<a class="bc-brand" href="'+productLink('build')+'">&#10023; <strong>BELLIBING</strong></a><nav aria-label="Application">'+[['build','Build a Character'],['improve','Improve a Character'],['teams','Teams'],['sandbox','Echo Sandbox'],['inventory','Inventory']].map(([id,label])=>'<a data-workspace="'+id+'" href="'+productLink(id)+'"'+(current===id?' class="active" aria-current="page"':'')+'>'+label+'</a>').join('')+'</nav><span class="study-label" hidden></span><div class="bc-header-actions"><a class="bc-import-action" data-product-import href="'+productLink('build',{import:'true'})+'">Import</a><button type="button" class="bc-import-action" data-prototype-auth>Logga in</button></div>';}

if(retainedCarousel)nav.append(retainedCarousel);
document.dispatchEvent(new CustomEvent('bellibing-header-ready'));

function placeSharedCarousel(){
 const header=document.querySelector('#productNavigation');
 const heading=document.querySelector('.heading-carousel');
 if(!header||!heading)return;
 const add=heading.querySelector('.wb-add-character');
 if(add){const anchor=document.createElement('div');anchor.className='bc-add-character-anchor';heading.before(anchor);anchor.append(add);}
 header.append(heading);
 document.body.classList.add('shared-character-header');
}
document.addEventListener('bellibing-carousel-ready',placeSharedCarousel);
document.addEventListener('bellibing-header-ready',placeSharedCarousel);
document.addEventListener('bellibing-character-focus',()=>{
 for(const link of document.querySelectorAll('#productNavigation a[data-workspace]')){
  if(['build','improve','sandbox','teams'].includes(link.dataset.workspace))link.href=productLink(link.dataset.workspace);
 }
});
placeSharedCarousel();
