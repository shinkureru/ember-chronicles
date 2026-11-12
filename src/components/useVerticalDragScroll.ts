import {useRef,type PointerEvent as ReactPointerEvent, type MouseEvent as ReactMouseEvent} from 'react';

/**
 * Desktop mouse drag + native touch/wheel/keyboard scrolling for a vertical pane.
 * Keeps click actions usable; a drag cannot accidentally activate a child button.
 */
export const useVerticalDragScroll=()=>{
 const scrollRef=useRef<HTMLDivElement>(null);
 const drag=useRef({active:false,startY:0,scrollTop:0,moved:false,pointerId:-1});
 const suppressClick=useRef(false);
 const clearTimer=useRef<number|null>(null);
 const onPointerDown=(event:ReactPointerEvent<HTMLDivElement>)=>{
  if(event.pointerType!=='mouse'||event.button!==0)return;
  if(clearTimer.current!==null)window.clearTimeout(clearTimer.current);
  drag.current={active:true,startY:event.clientY,scrollTop:scrollRef.current?.scrollTop??0,moved:false,pointerId:event.pointerId};
  suppressClick.current=false;
 };
 const onPointerMove=(event:ReactPointerEvent<HTMLDivElement>)=>{
  const d=drag.current,el=scrollRef.current;
  if(!el||!d.active||d.pointerId!==event.pointerId)return;
  if((event.buttons&1)===0){drag.current.active=false;return;}
  const offset=event.clientY-d.startY;
  if(!d.moved&&Math.abs(offset)>=7){
   d.moved=true;suppressClick.current=true;
   el.setPointerCapture(event.pointerId);
  }
  if(d.moved){
   el.scrollTop=d.scrollTop-offset;
   event.preventDefault();
  }
 };
 const stop=(event:ReactPointerEvent<HTMLDivElement>)=>{
  const el=scrollRef.current;
  const d=drag.current;
  if(!d.active||d.pointerId!==event.pointerId)return;
  drag.current.active=false;
  if(el?.hasPointerCapture(event.pointerId))el.releasePointerCapture(event.pointerId);
  if(clearTimer.current!==null)window.clearTimeout(clearTimer.current);
  clearTimer.current=window.setTimeout(()=>{suppressClick.current=false;clearTimer.current=null;},100);
 };
 const onClickCapture=(event:ReactMouseEvent<HTMLDivElement>)=>{
  if(!suppressClick.current)return;
  event.preventDefault();
  event.stopPropagation();
  suppressClick.current=false;
 };
 return {scrollRef,onPointerDown,onPointerMove,onPointerUp:stop,onPointerCancel:stop,onClickCapture};
};
