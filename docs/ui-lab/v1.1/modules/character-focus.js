import {CHARACTER_CATALOG} from './catalog.js';
const known=id=>CHARACTER_CATALOG.some(person=>person.id===id);
const key=()=> 'bellibing.character-focus:'+(new URL(location.href).searchParams.get('profile')??'default');
export function readCharacterFocus(fallback='augusta') {
 const requested=new URL(location.href).searchParams.get('character');
 if(known(requested))return requested;
 try{const saved=sessionStorage.getItem(key());if(known(saved))return saved;}catch{}
 return fallback;
}
export function setCharacterFocus(id) {
 if(!known(id))return;
 try{sessionStorage.setItem(key(),id);}catch{}
 const url=new URL(location.href);url.searchParams.set('character',id);history.replaceState(null,'',url);
 document.dispatchEvent(new CustomEvent('bellibing-character-focus',{detail:{characterId:id}}));
}
