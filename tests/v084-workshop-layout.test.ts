import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {makeInitialState} from '../src/game/state/initial';
import {ARMOR_SLOTS,armorHits} from '../src/game/engine/armor';
const file=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
describe('v0.8.4 stable workshop viewport',()=>{
 it('keeps same outer fixed height whether a selected part is equipped or not',()=>{
  const css=file('src/styles/_v084-workshop-layout.scss');
  expect(css).toContain('height:min(92dvh,850px)!important');
  expect(css).toContain('max-height:calc(100dvh - 14px)!important');
  expect(css).toContain('.workshop-dialog > .workshop-dialog__scroll');
  expect(css).toContain('flex:1 1 0!important');
  expect(css).toContain('overflow-y:auto!important');
  expect(css).toContain('.workshop-dialog > footer');
  expect(css).toContain('flex:0 0 auto!important');
  expect(css).toContain('height:calc(100dvh - 14px)!important');
 });
 it('both armor inspection and empty state render inside the SAME scrollable pane',()=>{
  const jsx=file('src/features/town/WorkshopDialog.tsx');
  expect(jsx).toContain('className="workshop-dialog__scroll"');
  expect(jsx).toContain('ref={list.scrollRef}');
  expect(jsx).toContain('className="workshop-dialog__inspection"');
  expect(jsx).toContain('className="workshop-dialog__empty"');
  expect(jsx.indexOf('className="workshop-dialog__scroll"')).toBeLessThan(jsx.indexOf('className="workshop-dialog__inspection"'));
  expect(jsx.indexOf('className="workshop-dialog__empty"')).toBeLessThan(jsx.indexOf('<footer>'));
  expect(jsx).toContain('onPointerMove={list.onPointerMove}');
 });
 it('keeps four independent slots and the original upgrade/repair engine',()=>{
  const scene=file('src/features/town/WorkshopDialog.tsx');
  const bare=makeInitialState('journalist');
  expect(ARMOR_SLOTS).toHaveLength(4);
  expect(ARMOR_SLOTS.every(slot=>bare.equipment[slot]===null)).toBe(true);
  bare.equipment.arms='gloves';
  expect(armorHits(bare,'gloves')).toBe(0);
  for(const word of ['workshop_repair','workshop_upgrade','getTownServiceLock','getTownServiceFee'])
   expect(scene).toContain(word);
 });
 it('reserves text space and makes lower details reachable by drag and wheel on short phones',()=>{
  const css=file('src/styles/_v084-workshop-layout.scss');
  expect(css).toContain('overflow-wrap:anywhere');
  expect(css).toContain('grid-auto-rows:minmax(96px,auto)');
  expect(css).toContain('min-height:clamp(220px,34dvh,340px)');
  expect(css).toContain('touch-action:pan-y');
  expect(css).toContain('scrollbar-width:none!important');
 });
});