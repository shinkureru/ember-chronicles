import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {EQUIPMENT_SLOTS} from '../src/game/data/equipment';
import {ITEMS} from '../src/game/data/items';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {bagWeight} from '../src/game/engine/rules';
import {getEquippedDefense} from '../src/game/data/equipmentEffects';
import {characterInventoryEntries,canEquipInSlot} from '../src/features/player/equipmentInventory';

const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const src=read('src/features/player/CharacterEquipmentPanel.tsx');
const page=read('src/features/player/CharacterPage.tsx');
const css=read('src/styles/_v0817-character-equipment-board.scss');

describe('v0.8.17 centered survivor equipment board',()=>{
 it('retains all seven original equipment slots and an equipment-driven survivor',()=>{
  expect(EQUIPMENT_SLOTS.map(e=>e.id)).toEqual(['head','body','arms','legs','mainHand','utility','accessory']);
  for(const e of EQUIPMENT_SLOTS)expect(css).toContain('.equipment-slot--'+e.id);
  expect(src).toContain('EQUIPMENT_SLOTS.map(e=>');
  expect(src).toContain('<SurvivorFigure equipment={s.equipment}/>');
  expect(src).toContain('aria-pressed={slot===e.id}');
  expect(src).toContain('aria-controls="equipment-v0817-inventory"');
  expect(page).toContain("tab==='equipment'&&<CharacterEquipmentPanel/>");
 });
 it('collects actual bag and warehouse counts and preserves zero-count equipped items',()=>{
  const s=makeInitialState('journalist');
  s.bag.vest=2;s.warehouse.vest=3;s.warehouse.gloves=1;s.bag.water=4;
  const e=characterInventoryEntries(s);
  expect(e.find(x=>x.id==='vest')).toMatchObject({quantity:5,inBag:2,inWarehouse:3,equippable:true});
  expect(e.find(x=>x.id==='gloves')).toMatchObject({quantity:1,inBag:0,inWarehouse:1,equippable:true});
  expect(e.find(x=>x.id==='water')).toMatchObject({quantity:4,equippable:false});
  s.equipment.head='cap';delete s.bag.cap;delete s.warehouse.cap;
  expect(characterInventoryEntries(s).find(x=>x.id==='cap')).toMatchObject({quantity:0,inUse:true});
  expect(ITEMS.vest.name).toBe('舊式防護背心');
 });
 it('blocks incompatible items, duplicate wear, overweight warehouse transfers and mission changes',()=>{
  const s=makeInitialState('journalist');
  s.bag.vest=1;s.warehouse.cap=1;
  expect(canEquipInSlot(s,'body','vest').allowed).toBe(true);
  expect(canEquipInSlot(s,'head','vest').allowed).toBe(false);
  expect(canEquipInSlot(s,'head','cap').allowed).toBe(true);
  s.equipment.body='cap'; // Cross-slot migrated save guard.
  expect(canEquipInSlot(s,'head','cap').reason).toContain('其他部位');
  s.equipment.body=null;
  s.bag.water=30; // >15kg
  expect(bagWeight(s.bag)).toBeGreaterThan(15);
  expect(canEquipInSlot(s,'head','cap').reason).toContain('負重');
  s.mode='adventure';
  expect(canEquipInSlot(s,'body','vest').allowed).toBe(false);
 });
 it('keeps the reducer responsible for equipping, unequipping and effective defense',()=>{
  let s=makeInitialState('journalist');
  s.bag.vest=1;
  const initial=getEquippedDefense(s);
  s=gameReducer(s,{type:'EQUIP_ITEM',slot:'body',itemId:'vest'});
  expect(s.equipment.body).toBe('vest');
  expect(getEquippedDefense(s)).toBeGreaterThan(initial);
  s=gameReducer(s,{type:'UNEQUIP_ITEM',slot:'body'});
  expect(s.equipment.body).toBeNull();
  expect(getEquippedDefense(s)).toBe(initial);
  expect(src).toContain("dispatch({type:'EQUIP_ITEM',slot,itemId:id})");
  expect(src).toContain("dispatch({type:'UNEQUIP_ITEM',slot})");
 });
 it('uses only real current stats rather than invented damage, critical or dodge stats',()=>{
  for(const t of ['s.player.health','s.player.maxHealth','s.player.stamina',
   's.player.maxStamina','getEquippedDefense(s)','s.player.attributes.mobility',
   's.player.attributes.observation','s.player.attributes.resilience'])
   expect(src).toContain(t);
  expect(src).not.toContain('CRIT');
  expect(src).toContain('ItemArt');
 });
 it('keeps art, real stats and inventory accessible in a single responsive page',()=>{
  expect(src.indexOf('className="equipment-stage equipment-v0817__stage"'))
   .toBeLessThan(src.indexOf('className="equipment-v0817__stats"'));
  expect(src.indexOf('className="equipment-v0817__stats"'))
   .toBeLessThan(src.indexOf('className="equipment-v0817__inventory"'));
  expect(src).toContain('role="dialog" aria-modal="true"');
  expect(src).toContain('onClick={()=>equip(currentItem.id)}');
  expect(src).toContain('disabled={!eligibility?.allowed}');
  expect(src).toContain('onClick={()=>inspect(entry.id)}');
  expect(src).toContain("filter==='gear'");
  expect(css).toContain('grid-template-columns:repeat(6,minmax(0,1fr))');
  expect(css).toContain('overflow-y:auto');
  expect(css).toContain('@media(max-width:380px)');
  expect(css).toContain('@media(max-height:690px)');
  expect(css).toContain('@media(max-height:510px)');
  expect(css).toContain('min-width:0');
  expect(read('src/styles/main.scss')).toContain('@import "v0817-character-equipment-board"');
  expect(JSON.parse(read('package.json')).version).toBe('0.8.17');
 });
});
