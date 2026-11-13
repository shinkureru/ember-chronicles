import { describe,expect,it } from 'vitest';
import { makeInitialState } from '../src/game/state/initial';
import { gameReducer } from '../src/game/engine/resolve';
import { worldPhaseToken } from '../src/game/engine/rules';
import { getEquippedDefense,mitigateCounterDamage } from '../src/game/data/equipmentEffects';
import { MARKET_VENDORS, getVendorStockKey } from '../src/game/data/marketVendors';
import { getActionSoundCue } from '../src/audio/actionCues';
import { SCENES } from '../src/game/data/scenes';

describe('v0.9 world-time UI identity',()=>{
 it('has five clock phases and the same boundaries as the rule engine',()=>{
  expect([6,12,16,21,2].map(h=>worldPhaseToken(h*60)))
   .toEqual(['morning','noon','afternoon','evening','late-night']);
  expect(worldPhaseToken(5*60)).toBe('morning');
  expect(worldPhaseToken(11*60)).toBe('noon');
  expect(worldPhaseToken(14*60)).toBe('afternoon');
  expect(worldPhaseToken(18*60)).toBe('evening');
  expect(worldPhaseToken(23*60)).toBe('late-night');
 });
});
describe('v0.9 distinct traders and inventory limits',()=>{
 it('offers five distinct NPC portraits and individual catalogs',()=>{
  expect(MARKET_VENDORS.length).toBeGreaterThanOrEqual(5);
  expect(new Set(MARKET_VENDORS.map(v=>v.face)).size).toBe(MARKET_VENDORS.length);
  expect(new Set(MARKET_VENDORS.map(v=>v.id)).size).toBe(MARKET_VENDORS.length);
  expect(MARKET_VENDORS.every(v=>v.buyItems.length>=2&&v.sellItems.length>=2)).toBe(true);
  expect(new Set(MARKET_VENDORS.map(v=>v.sellItems.map(i=>i.id).join(','))).size).toBe(MARKET_VENDORS.length);
 });
 it('charges coins, gives the real item and respects limited stock',()=>{
  let s=makeInitialState('journalist');s.world.minute=16*60;
  s.economy.coins=500;
  s=gameReducer(s,{type:'MARKET_BUY_ITEM',vendorId:'broker',itemId:'pen'});
  expect(s.economy.coins).toBe(410);
  expect(s.bag.pen).toBe(1);
  expect(s.economy.marketStock[getVendorStockKey('broker','pen')]).toBe(1);
  s=gameReducer(s,{type:'MARKET_BUY_ITEM',vendorId:'broker',itemId:'pen'});
  s=gameReducer(s,{type:'MARKET_BUY_ITEM',vendorId:'broker',itemId:'pen'});
  expect(s.economy.marketStock[getVendorStockKey('broker','pen')]).toBe(3);
  expect(gameReducer(s,{type:'MARKET_BUY_ITEM',vendorId:'broker',itemId:'pen'})).toBe(s);
 });
 it('only purchases items that belong to this vendor catalog',()=>{
  const s=makeInitialState('journalist');
  expect(gameReducer(s,{type:'MARKET_BUY_ITEM',vendorId:'medic',itemId:'wrench'})).toBe(s);
  expect(gameReducer(s,{type:'MARKET_SELL_ITEM',vendorId:'broker',itemId:'wrench'})).toBe(s);
 });
 it('lets players sell a permitted item and prevents selling equipped or protected gear',()=>{
  const s=makeInitialState('journalist');s.world.minute=16*60;s.bag.notes=1;
  const after=gameReducer(s,{type:'MARKET_SELL_ITEM',vendorId:'broker',itemId:'notes'});
  expect(after.bag.notes).toBeUndefined();
  expect(after.economy.coins).toBeGreaterThan(s.economy.coins);
  expect(after.economy.blackMarketFavor).toBe(1);
  s.bag.notes=1;s.protectedItems=['notes'];
  expect(gameReducer(s,{type:'MARKET_SELL_ITEM',vendorId:'broker',itemId:'notes'})).toBe(s);
 });
});
describe('v0.9 equipment display matches combat consequences',()=>{
 it('applies a real defense score and counterattack mitigation',()=>{
  const s=makeInitialState('journalist');
  expect(getEquippedDefense(s)).toBe(0);
  s.equipment.head='cap';s.equipment.body='vest';
  expect(getEquippedDefense(s)).toBe(12);
  expect(mitigateCounterDamage(9,getEquippedDefense(s))).toBe(6); // 35% damage-reduction cap
  expect(mitigateCounterDamage(1,99)).toBe(1);
 });
});
describe('v0.9 context-specific sound cues',()=>{
 it('uses distinct sounds for clothes, papers, sprinting, sneaking and dialogue',()=>{
  expect(getActionSoundCue(SCENES.loot.actions[0]!)).toBe('searchCloth');
  expect(getActionSoundCue(SCENES.loot.actions[2]!)).toBe('searchPaper');
  expect(getActionSoundCue(SCENES.confrontation.actions[2]!)).toBe('runFast');
  expect(getActionSoundCue(SCENES.gate.actions[2]!)).toBe('sneakStep');
  expect(getActionSoundCue(SCENES.gate.actions[0]!)).toBe('dialogue');
 });
});
