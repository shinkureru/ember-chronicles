import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {makeInitialState} from '../src/game/state/initial';
import {clinicTreatmentOutcomes} from '../src/game/engine/clinic';

const file=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

describe('v0.8.6 focused clinic layout fixes',()=>{
 const dialog=file('src/features/town/ClinicDialog.tsx');
 const css=file('src/styles/_v086-clinic-polish.scss');
 const drag=file('src/features/town/useClinicDragScroll.ts');

 it('shows only the abnormal triage flags without a duplicate full survivor status grid',()=>{
  const state=makeInitialState('journalist');
  state.player.health=6;
  state.conditions={wounds:6,infection:0,poisoning:0,illness:0};
  expect(clinicTreatmentOutcomes(state,'clinic_wounds').find(x=>x.key==='wounds')).toMatchObject({before:6,after:4});
  expect(dialog).toContain('className="clinic-dialog__triage"');
  expect(dialog).toContain('triageNeeds.length?triageNeeds.map');
  expect(dialog).toContain('<strong>待處理</strong>');
  expect(dialog).not.toContain('只列出有異常的項目');
  expect(dialog).not.toContain('TownVitalStatus');
  expect(css).toContain('min-height:42px');
  expect(css).toContain('flex-wrap:wrap');
 });
 it('uses the inn rest visual contract: before → after, current and pale change in full-width bar',()=>{
  expect(dialog).toContain('function ClinicTreatmentMeter');
  expect(dialog).toContain('clinic-dialog__outcome-numbers');
  expect(dialog).toContain('clinic-dialog__outcome-track');
  expect(dialog).toContain('clinic-dialog__outcome-current');
  expect(dialog).toContain('clinic-dialog__outcome-change');
  expect(dialog).toContain('percent(greater)-percent(lesser)');
  expect(dialog).toContain('clinicTreatmentOutcomes(s,service.id)');
  expect(css).toContain('grid-template-columns:minmax(0,1fr)!important');
  expect(css).toContain('.clinic-dialog__outcome--health .clinic-dialog__outcome-current');
  expect(css).toContain('.clinic-dialog__outcome--health .clinic-dialog__outcome-change');
  expect(css).toContain('transition:width .48s');
 });
 it('keeps one shared content scrolling container for treatment, daily and pharmacy',()=>{
  expect(dialog).toContain("useClinicDragScroll()");
  expect(dialog).toContain("onPointerDown={dragScroll.onPointerDown}");
  expect(dialog).toContain("onPointerMove={dragScroll.onPointerMove}");
  expect(dialog).toContain("onClickCapture={dragScroll.onClickCapture}");
  expect(dialog).toContain("onDragStart={event=>event.preventDefault()}");
  expect(dialog).toContain("selectTab('shop')");
  expect(dialog).toContain("selectTab('treatment')");
  expect(dialog).toContain("dragScroll.resetToTop()");
  expect(css).toContain('overflow-y:auto!important');
  expect(css).toContain('touch-action:pan-y');
  expect(css).toContain('scrollbar-width:none!important');
  expect(drag).toContain("document.addEventListener('pointermove',onMove,{capture:true,passive:false})");
  expect(drag).toContain("document.addEventListener('pointerup',onEnd,true)");
  expect(drag).toContain('Math.abs(delta)<6');
  expect(drag).toContain('event.stopPropagation()');
  expect(drag).toContain('scroller.scrollTop=d.initialTop-delta');
 });
 it('does not display stale rest messages on clinic open or create a tiny nested event scrollbar',()=>{
  expect(dialog).toContain('showNotice&&s.lastEvent');
  expect(dialog).toContain('setShowNotice(true)');
  expect(css).toContain('.clinic-dialog .clinic-dialog__last');
  expect(css).toContain('overflow:visible!important');
  expect(css).toContain('max-height:none!important');
  expect(dialog).toContain("clinicBuyBlock(s,item.id)");
  expect(dialog).toContain("clinicQuestBlock(s,true)");
  expect(dialog).toContain("getTownServiceLock(s,service.id)");
 });
});
