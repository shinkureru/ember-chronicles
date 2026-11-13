import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {getEquippedDefense} from '../src/game/data/equipmentEffects';
import {ARMOR_SLOTS,armorHits} from '../src/game/engine/armor';
import {getTownServiceLock} from '../src/game/engine/townActions';

const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const jsx=read('src/features/town/WorkshopDialog.tsx');
const css=read('src/styles/_v0814-workshop-refinement.scss');

describe('v0.8.14 workshop compact selector redesign',()=>{
 it('keeps four compact selector cards separately anchored above one detail scroller',()=>{
  expect(ARMOR_SLOTS).toEqual(['head','body','arms','legs']);
  const select=jsx.indexOf('className="workshop-dialog__selection"');
  const slots=jsx.indexOf('className="workshop-dialog__slots"');
  const scroll=jsx.indexOf('id="workshop-inspection" className="workshop-dialog__scroll"');
  const detail=jsx.indexOf('className="workshop-dialog__inspection"');
  const empty=jsx.indexOf('className="workshop-dialog__empty"');
  const footer=jsx.indexOf('<footer>');
  expect(select).toBeGreaterThan(0);
  expect(select).toBeLessThan(slots);
  expect(slots).toBeLessThan(scroll);
  expect(scroll).toBeLessThan(detail);
  expect(detail).toBeLessThan(empty);
  expect(empty).toBeLessThan(footer);
  expect(jsx).toContain('aria-pressed={selected===slot}');
  expect(jsx).toContain('aria-controls="workshop-inspection"');
  expect(jsx).toContain('list.scrollRef.current.scrollTop=0');
 });
 it('resets the old notice on selection and shows only workshop-action event messages',()=>{
  expect(jsx).toContain('const [showNotice,setShowNotice]=useState(false)');
  expect(jsx).toContain('setShowNotice(false)');
  expect(jsx).toContain('setShowNotice(true)');
  expect(jsx).toContain('showNotice&&s.lastEvent&&');
  expect(jsx).not.toContain('{s.lastEvent&&<p');
  expect(jsx).toContain("type:'TOWN_SERVICE'");
 });
 it('uses four columns on larger widths, two short rows on phones without overlap',()=>{
  expect(css).toContain('grid-template-columns:repeat(4,minmax(0,1fr))');
  expect(css).toContain('grid-auto-rows:minmax(61px,auto)');
  expect(css).toContain('@media(max-width:639px)');
  expect(css).toContain('grid-template-columns:repeat(2,minmax(0,1fr))');
  expect(css).toContain('grid-auto-rows:minmax(60px,auto)');
  expect(css).toContain('display:flex');
  expect(css).toContain('flex-direction:column');
  expect(css).toContain('min-height:1.3em');
  expect(css).toContain('max-height:2.6em');
  expect(css).toContain('overflow-wrap:anywhere');
  expect(jsx).toContain("'空欄位'");
 });
 it('ensures inspection is the only scrollable region and footer stays anchored',()=>{
  expect(css).toContain('height:min(92dvh,670px)!important');
  expect(css).toContain('max-height:calc(100dvh - 12px)!important');
  expect(css).toContain('flex:1 1 0!important');
  expect(css).toContain('overflow-y:auto!important');
  expect(css).toContain('touch-action:pan-y');
  expect(css).toContain('height:100%');
  expect(css).toContain('min-height:0');
  expect(css).toContain('min-height:46px');
  expect(css).toContain('@media(max-height:700px)');
  expect(css).toContain('@media(max-height:520px)');
  expect(jsx).toContain('ref={list.scrollRef}');
  expect(jsx).toContain('onPointerMove={list.onPointerMove}');
  expect(jsx).toContain('onClickCapture={list.onClickCapture}');
 });
 it('preserves repair, upgrade, durability, and current versus restored defense',()=>{
  const s=makeInitialState('journalist');s.world.minute=16*60;
  s.equipment.body='vest';
  s.town!.armorHits!.vest=5;
  s.town!.wear.vest=65;
  const current=getEquippedDefense(s);
  const repaired=structuredClone(s);
  repaired.town!.armorHits!.vest=0;
  repaired.town!.wear.vest=100;
  expect(getEquippedDefense(repaired)).toBeGreaterThan(current);
  expect(armorHits(s,'vest')).toBe(5);
  const result=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'workshop_repair',itemId:'vest'});
  expect(result.town!.armorHits!.vest).toBe(0);
  expect(getTownServiceLock(s,'workshop_repair',undefined,'vest')).toBeNull();
  for(const x of ['armorRepairFee','armorDurability','getTownServiceLock','getTownServiceFee',
   'getEquippedDefense','PERFECT_REPAIR_CHANCE',"serviceId:'workshop_repair'|'workshop_upgrade'",
   '完全修復','精工改良','返回避難所'])expect(jsx).toContain(x);
 });
 it('imports newest specific override after legacy workshop styles and updates version',()=>{
  const imports=read('src/styles/main.scss');
  expect(imports.lastIndexOf('@import "v0814-workshop-refinement"')).toBeGreaterThan(imports.indexOf('@import "v0811-workshop-compact"'));
  expect(JSON.parse(read('package.json')).version).toMatch(/^0\.8\.\d+$/);
 });
});
