// Closing transient UI never discards its edited values or steals keyboard focus.
export function installTransientChoiceDismissal(root,{selector,isOpen=()=>true,onClose,delay=400}){
 const timers=new WeakMap();let keyboard=false;
 const cancel=node=>clearTimeout(timers.get(node));
 const close=node=>{cancel(node);if(node.isConnected&&isOpen(node))onClose(node);};
 const schedule=node=>{cancel(node);timers.set(node,setTimeout(()=>{if(!node.matches(':hover')&&!(keyboard&&node.contains(document.activeElement)))close(node);},delay));};
 root.addEventListener('keydown',event=>{if(['Tab','ArrowDown','ArrowUp','Enter',' '].includes(event.key))keyboard=true;});
 root.addEventListener('pointerdown',event=>{keyboard=false;root.querySelectorAll(selector).forEach(node=>{if(!node.contains(event.target))close(node);});},true);
 root.addEventListener('pointerover',event=>{const node=event.target.closest?.(selector);if(node)cancel(node);});
 root.addEventListener('pointerout',event=>{const node=event.target.closest?.(selector);if(node&&!node.contains(event.relatedTarget))schedule(node);});
 root.addEventListener('focusout',event=>{const node=event.target.closest?.(selector);if(node&&!node.contains(event.relatedTarget))schedule(node);});
}
export function installChoiceDismissal(root,{selector='details.bc-choice',delay=400}={}){
 installTransientChoiceDismissal(root,{selector,delay,isOpen:node=>node.open,onClose:node=>{node.open=false;}});
}
