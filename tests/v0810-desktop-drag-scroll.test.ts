import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {mouseDragScrollTop} from '../src/components/useVerticalDragScroll';

const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const hook=read('src/components/useVerticalDragScroll.ts');

describe('v0.8.10 desktop mouse drag continuity',()=>{
 it('scrolls proportionally both upward and downward without momentum or drift',()=>{
  expect(mouseDragScrollTop(300,75)).toBe(225);
  expect(mouseDragScrollTop(300,-75)).toBe(375);
  expect(mouseDragScrollTop(300,0)).toBe(300);
 });
 it('uses document capture for quick drags outside a pane, with full cleanup',()=>{
  expect(hook).toContain("document.addEventListener('pointermove',onMove,{capture:true,passive:false})");
  expect(hook).toContain("document.addEventListener('pointerup',onEnd,true)");
  expect(hook).toContain("document.addEventListener('pointercancel',onEnd,true)");
  expect(hook).toContain("document.removeEventListener('pointermove',onMove,true)");
  expect(hook).toContain("document.removeEventListener('pointerup',onEnd,true)");
  expect(hook).toContain("window.addEventListener('blur',onBlur)");
  expect(hook).not.toContain('setPointerCapture');
 });
 it('does not steal touch gestures, form fields or short click interactions',()=>{
  expect(hook).toContain("event.pointerType!=='mouse'||event.button!==0");
  expect(hook).toContain('el.scrollHeight<=el.clientHeight+1');
  expect(hook).toContain('input,textarea,select,[contenteditable="true"],[data-no-drag-scroll]');
  expect(hook).toContain('Math.abs(offset)>=7');
  expect(hook).toContain("el.style.userSelect='none'");
  expect(hook).toContain('restoreSelection()');
  expect(hook).toContain('event.preventDefault()');
  expect(hook).toContain('event.stopPropagation()');
  expect(hook).toContain('suppressClick.current=true');
  expect(hook).toContain('220');
 });
 it('reuses the same scroll behavior in every previous non-clinic consumer',()=>{
  for(const path of [
   'src/features/town/WorkshopDialog.tsx',
   'src/features/town/InnRestDialog.tsx',
   'src/features/town/TownPage.tsx',
   'src/features/town/TownFacilityDialog.tsx',
   'src/features/cards/CardsPage.tsx',
  ])expect(read(path)).toContain('useVerticalDragScroll');
  const market=read('src/features/market/BlackMarketPage.tsx');
  expect(market).toContain('const offersScroll=useVerticalDragScroll()');
  expect(market).toContain('onClickCapture={offersScroll.onClickCapture}');
  expect(market).not.toContain('setPointerCapture');
  const clinic=read('src/features/town/ClinicDialog.tsx');
  expect(clinic).toContain('useClinicDragScroll()'); // preserve prior clinic fix
 });
 it('does not modify combat, costs, treatment or save schema in this UI-only batch',()=>{
  const workshop=read('src/features/town/WorkshopDialog.tsx');
  const market=read('src/features/market/BlackMarketPage.tsx');
  expect(workshop).toContain("serviceId:'workshop_repair'");
  expect(workshop).toContain("'workshop_upgrade'");
  expect(market).toContain("type:'MARKET_BUY_ITEM'");
  expect(market).toContain("type:'MARKET_SELL_ITEM'");
  expect(JSON.parse(read('package.json')).version).toBe('0.8.10');
 });
});
