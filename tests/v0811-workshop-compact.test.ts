import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {ARMOR_SLOTS} from '../src/game/engine/armor';
import {makeInitialState} from '../src/game/state/initial';
import {getEquippedDefense} from '../src/game/data/equipmentEffects';
import {armorHits,armorDurability} from '../src/game/engine/armor';

const file=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const jsx=file('src/features/town/WorkshopDialog.tsx');
const css=file('src/styles/_v0811-workshop-compact.scss');

describe('v0.8.11 compact and stable workshop dialog',()=>{
 it('keeps the four-slot selector anchored before the independent inspection scroller',()=>{
  expect(ARMOR_SLOTS).toEqual(['head','body','arms','legs']);
  expect(jsx).toContain('className="workshop-dialog__selection"');
  expect(jsx).toContain('className="workshop-dialog__slots"');
  expect(jsx).toContain('id="workshop-inspection" className="workshop-dialog__scroll"');
  expect(jsx.indexOf('className="workshop-dialog__selection"')).toBeLessThan(jsx.indexOf('id="workshop-inspection"'));
  expect(jsx.indexOf('id="workshop-inspection"')).toBeLessThan(jsx.indexOf('className="workshop-dialog__inspection"'));
  expect(jsx.indexOf('id="workshop-inspection"')).toBeLessThan(jsx.indexOf('className="workshop-dialog__empty"'));
  expect(jsx.indexOf('className="workshop-dialog__empty"')).toBeLessThan(jsx.indexOf('<footer>'));
  expect(jsx).toContain('aria-controls="workshop-inspection"');
  expect(jsx).toContain('aria-pressed={selected===slot}');
 });
 it('resets inspection scroll on selection without remounting or changing game state',()=>{
  expect(jsx).toContain('const selectSlot=(slot:ArmorSlot)=>{');
  expect(jsx).toContain('setSelected(slot)');
  expect(jsx).toContain('list.scrollRef.current.scrollTop=0');
  expect(jsx).toContain('onClick={()=>selectSlot(slot)}');
  expect(jsx).toContain('ref={list.scrollRef}');
  expect(jsx).toContain('onClickCapture={list.onClickCapture}');
  expect(jsx).toContain('onPointerMove={list.onPointerMove}');
 });
 it('uses compact single-row four columns on desktop and two columns on narrow screens',()=>{
  expect(css).toContain('grid-template-columns:repeat(4,minmax(0,1fr))');
  expect(css).toContain('@media(max-width:639px)');
  expect(css).toContain('grid-template-columns:repeat(2,minmax(0,1fr))');
  expect(css).toContain('grid-template-rows:minmax(12px,auto) minmax(2.65em,auto) minmax(2.5em,auto)');
  expect(css).toContain('overflow-wrap:anywhere');
  expect(css).toContain('grid-auto-rows:minmax(88px,auto)');
  expect(css).toContain('grid-auto-rows:minmax(72px,auto)');
  expect(css).toContain('.workshop-dialog__selection');
 });
 it('preserves a stable, bounded modal and fixed, accessible footer for equipped or empty parts',()=>{
  expect(css).toContain('height:min(88dvh,770px)!important');
  expect(css).toContain('max-height:calc(100dvh - 18px)!important');
  expect(css).toContain('flex:0 0 auto');
  expect(css).toContain('flex:1 1 0!important');
  expect(css).toContain('overflow-y:auto!important');
  expect(css).toContain('touch-action:pan-y');
  expect(css).toContain('.workshop-dialog__empty');
  expect(css).toContain('min-height:160px');
  expect(css).toContain('.workshop-dialog > footer');
  expect(css).toContain('min-height:38px');
  expect(css).toContain('@media(max-height:700px)');
  expect(css).toContain('@media(max-height:520px)');
 });
 it('retains armor preview, repair and upgrade mechanics and time and cost labels',()=>{
  const s=makeInitialState('journalist');
  s.equipment.arms='gloves';
  expect(armorHits(s,'gloves')).toBe(0);
  expect(armorDurability(s,'gloves')).toBe(100);
  expect(getEquippedDefense(s)).toBeGreaterThanOrEqual(0);
  for(const token of ['armorRepairFee','getTownServiceLock','getTownServiceFee','getEquippedDefense',
   'perfectRepairActive','PERFECT_REPAIR_CHANCE',"serviceId:'workshop_repair'|'workshop_upgrade'",
   "type:'TOWN_SERVICE'",'50 分鐘','材料 1 份'])
   expect(jsx).toContain(token);
  expect(file('src/styles/main.scss')).toContain('@import "v0811-workshop-compact"');
  expect(JSON.parse(file('package.json')).version).toBe('0.8.11');
 });
});
