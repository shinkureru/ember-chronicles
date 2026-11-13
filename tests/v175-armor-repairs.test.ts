import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {makeInitialState} from '../src/game/state/initial';
import {loadGame} from '../src/game/state/storage';
import {gameReducer} from '../src/game/engine/resolve';
import {EQUIPMENT_SLOTS} from '../src/game/data/equipment';
import {EQUIPMENT_EFFECTS,getEquippedDefense,mitigateCounterDamage} from '../src/game/data/equipmentEffects';
import {ITEMS,LOOT_POOLS} from '../src/game/data/items';
import {MARKET_VENDORS} from '../src/game/data/marketVendors';
import {TOWN_SERVICES} from '../src/game/data/town';
import {getTownServiceFee,getTownServiceLock} from '../src/game/engine/townActions';
import {ARMOR_SLOTS,ARMOR_HIT_WEIGHTS,ARMOR_DAMAGE_STAGES,applyArmorImpact,armorHits,armorStage,
 armorRepairFee,armorDurability,equippedArmorEntries,perfectRepairActive,PERFECT_REPAIR_CHANCE} from '../src/game/engine/armor';

const gear=()=>{
 const s=makeInitialState('journalist');
 s.equipment={head:'cap',body:'vest',arms:'arm_guard',legs:'leg_guard',mainHand:'wrench',utility:'flashlight',accessory:null};
 s.bag={cap:1,vest:1,arm_guard:1,leg_guard:1,wrench:1,flashlight:1};
 return s;
};
describe('v1.7.5: defensive equipment and 10HP damage balance',()=>{
 it('provides four durable defensive slots while preserving tool slots',()=>{
  expect([...ARMOR_SLOTS]).toEqual(['head','body','arms','legs']);
  for(const slot of ARMOR_SLOTS)expect(EQUIPMENT_SLOTS.find(v=>v.id===slot)?.allowed.length).toBeGreaterThan(0);
  for(const key of ['mainHand','utility','accessory'])expect(EQUIPMENT_SLOTS.some(s=>s.id===key)).toBe(true);
  for(const id of ['arm_guard','leg_guard'])expect(ITEMS[id]?.type).toBe('gear');
  expect(LOOT_POOLS.shelves).toContain('arm_guard');
  expect(LOOT_POOLS.alley_bag).toContain('leg_guard');
  const mechanic=MARKET_VENDORS.find(v=>v.id==='mechanic')!;
  expect(mechanic.sellItems.map(x=>x.id)).toContain('arm_guard');
  expect(mechanic.sellItems.map(x=>x.id)).toContain('leg_guard');
 });
 it('only defensive items count; weapons and special tools cannot increase defense',()=>{
  const s=gear();const equipped=equippedArmorEntries(s);
  expect(equipped.map(x=>x.slot)).toEqual(['head','body','arms','legs']);
  expect(equipped.map(x=>x.itemId)).not.toContain('wrench');
  expect(equipped.map(x=>x.itemId)).not.toContain('flashlight');
  expect(getEquippedDefense(s)).toBe(18);
  const noArmor=makeInitialState('journalist');
  noArmor.equipment.mainHand='wrench';
  expect(getEquippedDefense(noArmor)).toBe(0);
  expect(EQUIPMENT_EFFECTS.wrench.defense).toBe(0);
 });
 it('caps reduction at 35% and always allows real damage to get through',()=>{
  expect(mitigateCounterDamage(10,1000)).toBe(7);
  expect(mitigateCounterDamage(7,1000)).toBe(5);
  expect(mitigateCounterDamage(6,1000)).toBe(4);
  expect(mitigateCounterDamage(7,0)).toBe(7);
  expect(mitigateCounterDamage(1,1000)).toBe(1);
  expect(mitigateCounterDamage(0,1000)).toBe(0);
  expect(mitigateCounterDamage(7,18)).toBe(5);
  expect(mitigateCounterDamage(7,4)).toBe(6);
 });
 it('lowers effective defense by damage tiers, never the action chance',()=>{
  const s=gear(),original=getEquippedDefense(s);
  s.town!.armorHits!.vest=3;s.town!.wear.vest=79;
  const light=getEquippedDefense(s);
  s.town!.armorHits!.vest=5;s.town!.wear.vest=65;
  const medium=getEquippedDefense(s);
  s.town!.armorHits!.vest=10;s.town!.wear.vest=30;
  const severe=getEquippedDefense(s);
  expect(original).toBeGreaterThan(light);
  expect(light).toBeGreaterThan(medium);
  expect(medium).toBeGreaterThan(severe);
  expect(ARMOR_DAMAGE_STAGES.severe).toBe('嚴重損壞');
 });
});
describe('v1.7.5: isolated impact selection and persistent damage stages',()=>{
 it('uses actual weighted slot selection and damages only one item per hit',()=>{
  expect(ARMOR_HIT_WEIGHTS.body).toBe(40);
  const s=gear();
  expect(applyArmorImpact(s,()=>0)?.slot).toBe('head');
  expect(applyArmorImpact(s,()=>.2)?.slot).toBe('body');
  expect(applyArmorImpact(s,()=>.6)?.slot).toBe('arms');
  expect(applyArmorImpact(s,()=>.8)?.slot).toBe('legs');
  expect(armorHits(s,'cap')).toBe(1);
  expect(armorHits(s,'vest')).toBe(1);
  expect(armorHits(s,'arm_guard')).toBe(1);
  expect(armorHits(s,'leg_guard')).toBe(1);
  expect(s.town?.wear.wrench).toBeUndefined();
  expect(s.town?.wear.flashlight).toBeUndefined();
 });
 it('at three, five and ten real hits flags light, moderate, severe; never deletes the gear',()=>{
  const s=makeInitialState('journalist');s.equipment.body='vest';
  const stages:string[]=[];
  for(let i=0;i<14;i++){
   const result=applyArmorImpact(s,()=>.5)!;
   if(result.changedStage)stages.push(result.stage);
  }
  expect(stages).toEqual(['light','moderate','severe']);
  expect(armorHits(s,'vest')).toBe(10);
  expect(armorStage(armorHits(s,'vest'))).toBe('severe');
  expect(armorDurability(s,'vest')).toBe(30);
  expect(s.equipment.body).toBe('vest');
 });
 it('actual reducer damage commits once; misses, repeated impacts and lack of armor do not damage gear',()=>{
  const s=makeInitialState('journalist');
  s.mode='adventure';s.equipment.body='vest';
  s.enemyCounter={id:88,itemId:'radio',damage:5,hit:true,phase:'throwing'};
  const hit=gameReducer(s,{type:'ENEMY_COUNTER_HIT'});
  expect(hit.player.health).toBe(5);
  expect(hit.town?.armorHits?.vest).toBe(1);
  expect(hit.town?.wear.vest).toBe(93);
  expect(hit.lastEvent).toContain('身體');
  expect(gameReducer(hit,{type:'ENEMY_COUNTER_HIT'})).toBe(hit);
  const missed=structuredClone(s);missed.enemyCounter!.hit=false;missed.enemyCounter!.damage=0;
  const afterMiss=gameReducer(missed,{type:'ENEMY_COUNTER_HIT'});
  expect(afterMiss.town?.armorHits?.vest??0).toBe(0);
  const naked=structuredClone(s);naked.equipment.body=null;
  const afterBare=gameReducer(naked,{type:'ENEMY_COUNTER_HIT'});
  expect(afterBare.town?.armorHits?.vest??0).toBe(0);
 });
});
describe('v1.7.5: workshop quote, same-charge repair, perfect buff lifecycle',()=>{
 const workshopState=()=>{const s=makeInitialState('journalist');s.world.minute=16*60;return s};
 const costs:{slot:'head'|'body'|'arms'|'legs';id:string;light:number;medium:number;severe:number}[]=[
  {slot:'head',id:'cap',light:8,medium:18,severe:34},
  {slot:'body',id:'vest',light:10,medium:22,severe:40},
  {slot:'arms',id:'arm_guard',light:7,medium:16,severe:30},
  {slot:'legs',id:'leg_guard',light:7,medium:16,severe:30}
 ];
 for(const c of costs){
  it(`quotes monotonic ${c.slot} repairs from matching damaged part`,()=>{
   const s=workshopState();s.equipment[c.slot]=c.id;
   expect(armorRepairFee(s,c.id)).toBe(0);
   s.town!.armorHits![c.id]=1;s.town!.wear[c.id]=93;expect(armorRepairFee(s,c.id)).toBeGreaterThan(0);
   s.town!.armorHits![c.id]=3;s.town!.wear[c.id]=79;expect(armorRepairFee(s,c.id)).toBe(c.light);
   s.town!.armorHits![c.id]=4;s.town!.wear[c.id]=72;expect(armorRepairFee(s,c.id)).toBeGreaterThan(c.light);
   s.town!.armorHits![c.id]=5;s.town!.wear[c.id]=65;expect(armorRepairFee(s,c.id)).toBe(c.medium);
   s.town!.armorHits![c.id]=10;s.town!.wear[c.id]=30;expect(armorRepairFee(s,c.id)).toBe(c.severe);
   expect(getTownServiceFee(s,'workshop_repair',undefined,c.id)).toBe(c.severe);
   expect(getTownServiceLock(s,'workshop_repair',undefined,c.id)).toBeNull();
  });
 }
 it('charges the exact quoted dynamic cost and fully resets damage, not weapons',()=>{
  const s=workshopState();
  s.equipment.body='vest';s.equipment.mainHand='wrench';
  s.town!.armorHits!.vest=10;s.town!.wear.vest=30;
  s.rngSeed=0;
  expect(PERFECT_REPAIR_CHANCE).toBe(.25);
  const fee=getTownServiceFee(s,'workshop_repair',undefined,'vest');expect(fee).toBe(40);
  const result=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'workshop_repair',itemId:'vest'});
  expect(result.economy.coins).toBe(120-fee);
  expect(result.town?.wear.vest).toBe(100);
  expect(result.town?.armorHits?.vest).toBe(0);
  expect(result.town?.perfectRepairs?.vest?.bonus).toBe(1);
  expect(result.lastEvent).toContain('完美修理');
  expect(result.town?.wear.wrench).toBeUndefined();
  expect(gameReducer(result,{type:'TOWN_SERVICE',serviceId:'workshop_repair',itemId:'vest'})).toBe(result);
  expect(getTownServiceLock(s,'workshop_repair',undefined,'wrench')).toContain('只可修復');
 });
 it('perfect +1 defense applies to one mission only, not permanent stat or success rate',()=>{
  let s=workshopState();
  s.equipment.body='vest';s.town!.armorHits!.vest=3;s.town!.wear.vest=79;s.rngSeed=0;
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'workshop_repair',itemId:'vest'});
  expect(perfectRepairActive(s,'vest')).toBe(true);
  s=gameReducer(s,{type:'START_ATTEMPT'});
  expect(s.attempt).toBe(1);
  expect(getEquippedDefense(s)).toBe(11);
  s.mode='home';
  expect(perfectRepairActive(s,'vest')).toBe(false);
  s=gameReducer(s,{type:'START_ATTEMPT'});
  expect(s.attempt).toBe(2);
  expect(s.town?.perfectRepairs?.vest).toBeUndefined();
  expect(getEquippedDefense(s)).toBe(10);
 });
 it('existing permanent upgrade still requires material and increases base defense',()=>{
  let s=workshopState();s.bag.cap=1;s.bag.tape=1;
  s=gameReducer(s,{type:'EQUIP_ITEM',slot:'head',itemId:'cap'});
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'workshop_upgrade',itemId:'cap'});
  expect(s.town?.upgrades.cap).toBe(1);
  expect(getEquippedDefense(s)).toBe(4);
  expect(s.bag.tape??0).toBe(0);
 });
});
describe('v1.7.5: backward-compatible save migrations',()=>{
 beforeEach(()=>{vi.stubGlobal('localStorage',{
  getItem:(_key:string)=>null,
  setItem:vi.fn()
 });});
 afterEach(()=>vi.unstubAllGlobals());
 it('migrates old hand slot, retains coins, wear, wardrobe and NPC progress',()=>{
  const legacy=makeInitialState('journalist');
  legacy.equipment={head:'cap',body:'vest',hands:'gloves',mainHand:'wrench',utility:null,accessory:null};
  legacy.town!.wear.gloves=65;legacy.town!.wear.vest=79;
  delete legacy.town!.armorHits;delete legacy.town!.perfectRepairs;
  legacy.economy.coins=87;legacy.npc.met=8;legacy.clues=['舊資料'];
  vi.stubGlobal('localStorage',{getItem:()=>JSON.stringify(legacy),setItem:vi.fn()});
  const migrated=loadGame();
  expect(migrated.equipment.arms).toBe('gloves');
  expect(migrated.equipment.hands).toBeUndefined();
  expect(migrated.equipment.legs).toBeNull();
  expect(migrated.town?.armorHits?.gloves).toBe(5);
  expect(migrated.town?.armorHits?.vest).toBe(3);
  expect(migrated.town?.wear.gloves).toBe(65);
  expect(migrated.economy.coins).toBe(87);
  expect(migrated.npc.met).toBe(8);
  expect(migrated.clues).toEqual(['舊資料']);
 });
});
