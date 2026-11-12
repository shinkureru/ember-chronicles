import {useEffect,useRef,type MouseEvent as ReactMouseEvent,type PointerEvent as ReactPointerEvent} from 'react';

/**
 * Clinic-only drag-scrolling. Track pointer moves on document while a mouse
 * button is held so a fast drag over cards/controls or outside the pane does
 * not lose the gesture. Touch remains native pan-y; wheel and keyboard are
 * handled by the browser's scroll container.
 */
export const useClinicDragScroll=()=>{
 const scrollRef=useRef<HTMLDivElement>(null);
 const drag=useRef({active:false,moved:false,pointerId:-1,startY:0,initialTop:0});
 const suppressClick=useRef(false);
 const resetTimer=useRef<number|null>(null);

 const move=(pointerId:number,clientY:number,buttons:number,prevent:()=>void)=>{
  const d=drag.current,scroller=scrollRef.current;
  if(!d.active||!scroller||d.pointerId!==pointerId)return;
  if(!(buttons&1)){drag.current.active=false;return;}
  const delta=clientY-d.startY;
  if(!d.moved&&Math.abs(delta)<6)return;
  if(!d.moved){d.moved=true;suppressClick.current=true;}
  scroller.scrollTop=d.initialTop-delta;
  prevent();
 };
 const end=(pointerId:number)=>{
  if(!drag.current.active||drag.current.pointerId!==pointerId)return;
  drag.current.active=false;
  if(resetTimer.current!==null)window.clearTimeout(resetTimer.current);
  // React click capture fires immediately after pointerup. Keep suppression
  // long enough to swallow the synthetic click after a completed drag.
  resetTimer.current=window.setTimeout(()=>{suppressClick.current=false;resetTimer.current=null;},220);
 };
 useEffect(()=>{
  const onMove=(event:PointerEvent)=>move(event.pointerId,event.clientY,event.buttons,()=>event.preventDefault());
  const onEnd=(event:PointerEvent)=>end(event.pointerId);
  document.addEventListener('pointermove',onMove,{capture:true,passive:false});
  document.addEventListener('pointerup',onEnd,true);
  document.addEventListener('pointercancel',onEnd,true);
  return()=>{
   document.removeEventListener('pointermove',onMove,true);
   document.removeEventListener('pointerup',onEnd,true);
   document.removeEventListener('pointercancel',onEnd,true);
   if(resetTimer.current!==null)window.clearTimeout(resetTimer.current);
  };
 },[]);

 const onPointerDown=(event:ReactPointerEvent<HTMLDivElement>)=>{
  if(event.pointerType!=='mouse'||event.button!==0)return;
  if(event.target instanceof Element&&event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
  if(resetTimer.current!==null)window.clearTimeout(resetTimer.current);
  drag.current={active:true,moved:false,pointerId:event.pointerId,startY:event.clientY,initialTop:scrollRef.current?.scrollTop??0};
  suppressClick.current=false;
 };
 const onPointerMove=(event:ReactPointerEvent<HTMLDivElement>)=>{
  // Same origin offset as document listener; safe if both are delivered.
  move(event.pointerId,event.clientY,event.buttons,()=>event.preventDefault());
 };
 const onPointerUp=(event:ReactPointerEvent<HTMLDivElement>)=>end(event.pointerId);
 const onPointerCancel=(event:ReactPointerEvent<HTMLDivElement>)=>end(event.pointerId);
 const onClickCapture=(event:ReactMouseEvent<HTMLDivElement>)=>{
  if(!suppressClick.current)return;
  event.preventDefault();
  event.stopPropagation();
  suppressClick.current=false;
 };
 const resetToTop=()=>{if(scrollRef.current)scrollRef.current.scrollTop=0;};
 return {scrollRef,onPointerDown,onPointerMove,onPointerUp,onPointerCancel,onClickCapture,resetToTop};
};
