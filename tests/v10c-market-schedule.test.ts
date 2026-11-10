import {describe,expect,it} from 'vitest';
import {getScheduledVendor,getScheduledVendorId,MARKET_SHIFT_IDS} from '../src/game/data/marketSchedule';
import {MARKET_VENDORS} from '../src/game/data/marketVendors';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
describe('v1.0-c: one fixed trader for each world-time phase',()=>{
 it('assigns a unique, stable merchant to every phase',()=>{
  const slots=[6,12,16,20,2];
  const assigned=slots.map(hour=>getScheduledVendor(hour*60));
  expect(assigned.map(v=>v.id)).toEqual(['mechanic','medic','broker','runner','scavenger']);
  expect(new Set(assigned.map(v=>v.id)).size).toBe(5);
  expect(Object.values(MARKET_SHIFT_IDS).sort()).toEqual(MARKET_VENDORS.map(v=>v.id).sort());
  expect(getScheduledVendorId(16*60+20)).toBe(getScheduledVendorId(15*60));
 });
 it('rejects buying from off-shift sellers even with a valid item',()=>{
  const s=makeInitialState('journalist');
  s.economy.coins=9999;
  s.world.minute=20*60;
  expect(gameReducer(s,{type:'MARKET_BUY_ITEM',vendorId:'broker',itemId:'pen'})).toBe(s);
  const next=gameReducer(s,{type:'MARKET_BUY_ITEM',vendorId:'runner',itemId:'water'});
  expect(next).not.toBe(s);
  expect(next.bag.water).toBeGreaterThan(s.bag.water??0);
  expect(next.economy.coins).toBeLessThan(s.economy.coins);
 });
 it('refuses off-shift item sales and card trades',()=>{
  const s=makeInitialState('journalist');s.world.minute=12*60;s.bag.notes=2;
  s.ownedCards.question={copies:2,level:1};
  s.economy.coins=9999;
  expect(gameReducer(s,{type:'MARKET_SELL_ITEM',vendorId:'broker',itemId:'notes'})).toBe(s);
  expect(gameReducer(s,{type:'MARKET_SELL',vendorId:'broker',cardId:'question'})).toBe(s);
  expect(gameReducer(s,{type:'MARKET_BUY',vendorId:'broker',cardId:'question'})).toBe(s);
 });
 it('permits valid card sales to the active medic during noon',()=>{
  let s=makeInitialState('journalist');s.world.minute=12*60;
  s.ownedCards.breathe={copies:2,level:1};
  const before=s.economy.coins;
  s=gameReducer(s,{type:'MARKET_SELL',vendorId:'medic',cardId:'breathe'});
  expect(s.economy.coins).toBeGreaterThan(before);
  expect(s.ownedCards.breathe?.copies).toBe(1);
 });
});