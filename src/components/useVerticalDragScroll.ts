import {useEffect,useRef,type MouseEvent as ReactMouseEvent,type PointerEvent as ReactPointerEvent} from 'react';

/** Pure drag arithmetic, independent of the rendering or scrolling environment. */
export const mouseDragScrollTop=(initialTop:number,offset:number)=>initialTop-offset;

/**
 * Desktop left-mouse drag scrolling; wheel, touch pan and keyboard stay native.
 * The document captures movement before descendants receive pointer events so
 * fast drags over buttons or beyond the pane edge continue uninterrupted.
 */
export const useVerticalDragScroll=()=>{
 const scrollRef=useRef<HTMLDivElement>(null);
 const drag=useRef({active:false,startY:0,initialTop:0,moved:false,pointerId:-1});
 const suppressClick=useRef(false);
 const resetTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const previousUserSelect=useRef<string|null>(null);

 const restoreSelection=()=>{
  const el=scrollRef.current;
  if(el&&previousUserSelect.current!==null)el.style.userSelect=previousUserSelect.current;
  previousUserSelect.current=null;
 };
 const stop=(pointerId?:number)=>{
  const d=drag.current;
  if(!d.active||(pointerId!==undefined&&d.pointerId!==pointerId))return;
  d.active=false;
  restoreSelection();
  if(resetTimer.current!==null)window.clearTimeout(resetTimer.current);
  // A click is fired after pointerup; keep the protection for that click.
  if(d.moved){
   resetTimer.current=window.setTimeout(()=>{suppressClick.current=false;resetTimer.current=null;},220);
  }else{
   suppressClick.current=false;
   resetTimer.current=null;
  }
 };
 const move=(pointerId:number,clientY:number,buttons:number,prevent:()=>void)=>{
  const d=drag.current,el=scrollRef.current;
  if(!el||!d.active||d.pointerId!==pointerId)return;
  if((buttons&1)===0){stop(pointerId);return;}
  const offset=clientY-d.startY;
  if(!d.moved&&Math.abs(offset)>=7){
   d.moved=true;
   suppressClick.current=true;
  }
  if(d.moved){
   el.scrollTop=mouseDragScrollTop(d.initialTop,offset);
   prevent();
  }
 };
 useEffect(()=>{
  const onMove=(event:PointerEvent)=>move(event.pointerId,event.clientY,event.buttons,()=>event.preventDefault());
  const onEnd=(event:PointerEvent)=>stop(event.pointerId);
  const onDragStart=(event:DragEvent)=>{
   // Prevent browser-native image/link dragging from hijacking a scroll gesture.
   if(drag.current.active&&event.target instanceof Node&&scrollRef.current?.contains(event.target)){
    event.preventDefault();
   }
  };
  const onBlur=()=>{stop();suppressClick.current=false;};
  document.addEventListener('pointermove',onMove,{capture:true,passive:false});
  document.addEventListener('pointerup',onEnd,true);
  document.addEventListener('pointercancel',onEnd,true);
  document.addEventListener('dragstart',onDragStart,true);
  window.addEventListener('blur',onBlur);
  return()=>{
   document.removeEventListener('pointermove',onMove,true);
   document.removeEventListener('pointerup',onEnd,true);
   document.removeEventListener('pointercancel',onEnd,true);
   document.removeEventListener('dragstart',onDragStart,true);
   window.removeEventListener('blur',onBlur);
   restoreSelection();
   if(resetTimer.current!==null)window.clearTimeout(resetTimer.current);
  };
 },[]);

 const onPointerDown=(event:ReactPointerEvent<HTMLDivElement>)=>{
  if(event.pointerType!=='mouse'||event.button!==0)return;
  if(event.target instanceof Element&&event.target.closest('input,textarea,select,[contenteditable="true"],[data-no-drag-scroll]'))return;
  const el=scrollRef.current;
  if(!el||el.scrollHeight<=el.clientHeight+1)return;
  if(resetTimer.current!==null){window.clearTimeout(resetTimer.current);resetTimer.current=null;}
  drag.current={active:true,startY:event.clientY,initialTop:el.scrollTop,moved:false,pointerId:event.pointerId};
  suppressClick.current=false;
  previousUserSelect.current=el.style.userSelect;
  el.style.userSelect='none';
 };
 const onPointerMove=(event:ReactPointerEvent<HTMLDivElement>)=>{
  // Document capture is primary; this is a harmless same-position fallback.
  if(event.pointerType==='mouse')move(event.pointerId,event.clientY,event.buttons,()=>event.preventDefault());
 };
 const onPointerUp=(event:ReactPointerEvent<HTMLDivElement>)=>stop(event.pointerId);
 const onPointerCancel=(event:ReactPointerEvent<HTMLDivElement>)=>stop(event.pointerId);
 const onClickCapture=(event:ReactMouseEvent<HTMLDivElement>)=>{
  if(!suppressClick.current)return;
  event.preventDefault();
  event.stopPropagation();
  suppressClick.current=false;
 };
 return {scrollRef,onPointerDown,onPointerMove,onPointerUp,onPointerCancel,onClickCapture};
};
